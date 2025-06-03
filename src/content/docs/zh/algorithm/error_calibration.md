---

title: 误差校准
description: atom::algorithm命名空间中高级误差校准库的全面介绍，包括线性和多项式校准方法、残差分析、异常值检测和交叉验证
---

## 目的和高级概述

误差校准库是一个全面的C++模板库，用于测量误差的统计校准。它提供了建立测量值和实际值之间数学关系的工具，允许对系统测量误差进行精确校正。

主要功能包括：

- 多种校准模型：线性、多项式、指数、对数和幂律
- 统计分析工具：残差分析、异常值检测和交叉验证
- 统计指标：R平方、均方误差(MSE)、平均绝对误差(MAE)
- 通过bootstrap重采样进行置信区间估计
- 通过并行化、SIMD操作和内存优化实现高性能处理
- 通过C++20协程支持异步校准

该库设计用于精确测量校准至关重要的科学和工程应用，如传感器校准、分析仪器验证和质量控制。

## 依赖和要求

### 必需的头文件

```cpp
#include <algorithm>
#include <cmath>
#include <concepts>
#include <coroutine>
#include <execution>
#include <fstream>
#include <functional>
#include <memory_resource>
#include <mutex>
#include <numeric>
#include <optional>
#include <random>
#include <string>
#include <thread>
#include <vector>
```

### 可选依赖

```cpp
// SIMD支持加速
#ifdef USE_SIMD
#ifdef __AVX__
#include <immintrin.h>
#elif defined(__ARM_NEON)
#include <arm_neon.h>
#endif
#endif

// 内部库依赖
#include "atom/async/pool.hpp"  // 线程池实现
#include "atom/error/exception.hpp" // 异常处理
#include "atom/log/loguru.hpp"  // 日志功能

// 可选的Boost支持，用于高级线性代数
#ifdef ATOM_USE_BOOST
#include <boost/numeric/ublas/io.hpp>
#include <boost/numeric/ublas/lu.hpp>
#include <boost/numeric/ublas/matrix.hpp>
#include <boost/random.hpp>
#endif
```

### 编译器要求

- 兼容C++20的编译器（用于concepts和协程）
- 可选：支持AVX或ARM NEON的SIMD加速
- 可选：用于增强数值计算的Boost库

## 类文档

### `ErrorCalibration<T>` 类

#### 概述

执行误差校准的主要类模板，可处理任何浮点类型。

#### 模板参数

- `T`：浮点类型（由`std::floating_point` concept约束）

#### 成员变量

```cpp
private:
    T slope_ = 1.0;                 // 校准斜率
    T intercept_ = 0.0;             // 校准截距
    std::optional<T> r_squared_;    // 决定系数
    std::vector<T> residuals_;      // 校准残差
    T mse_ = 0.0;                   // 均方误差
    T mae_ = 0.0;                   // 平均绝对误差

    std::mutex metrics_mutex_;      // 度量计算的线程安全锁
    std::unique_ptr<atom::async::ThreadPool<>> thread_pool_; // 用于并行处理的线程池
    
    // 内存管理
    static constexpr size_t MAX_CACHE_SIZE = 10000;
    std::shared_ptr<std::pmr::monotonic_buffer_resource> memory_resource_;
    std::pmr::vector<T> cached_residuals_{memory_resource_.get()};
    
    // 线程局部存储优化
    thread_local static std::vector<T> tls_buffer;
```

#### 构造函数和析构函数

```cpp
public:
    // 构造函数 - 设置内存资源
    ErrorCalibration();
    
    // 析构函数 - 确保线程池安全关闭
    ~ErrorCalibration();
```

#### 公共方法

##### 校准方法

```cpp
// 线性校准 (y = mx + b)
void linearCalibrate(const std::vector<T>& measured, const std::vector<T>& actual);

// 指定度数的多项式校准
void polynomialCalibrate(const std::vector<T>& measured, 
                        const std::vector<T>& actual, 
                        int degree);

// 指数校准 (y = a * e^(bx))
void exponentialCalibrate(const std::vector<T>& measured, 
                         const std::vector<T>& actual);

// 对数校准 (y = a + b * ln(x))
void logarithmicCalibrate(const std::vector<T>& measured, 
                         const std::vector<T>& actual);

// 幂律校准 (y = a * x^b)
void powerLawCalibrate(const std::vector<T>& measured, 
                      const std::vector<T>& actual);
```

##### 应用和获取

```cpp
// 对单个值应用校准
[[nodiscard]] auto apply(T value) const -> T;

// 将校准参数显示到日志中
void printParameters() const;

// 获取校准残差
[[nodiscard]] auto getResiduals() const -> std::vector<T>;

// 将残差写入CSV文件
void plotResiduals(const std::string& filename) const;

// 获取校准参数的getter方法
[[nodiscard]] auto getSlope() const -> T;
[[nodiscard]] auto getIntercept() const -> T;
[[nodiscard]] auto getRSquared() const -> std::optional<T>;
[[nodiscard]] auto getMse() const -> T;
[[nodiscard]] auto getMae() const -> T;
```

##### 统计分析

```cpp
// 斜率参数的Bootstrap置信区间
auto bootstrapConfidenceInterval(const std::vector<T>& measured,
                               const std::vector<T>& actual,
                               int n_iterations = 1000,
                               double confidence_level = 0.95)
    -> std::pair<T, T>;

// 基于残差分析检测异常值
auto outlierDetection(const std::vector<T>& measured,
                    const std::vector<T>& actual, 
                    T threshold = 2.0)
    -> std::tuple<T, T, T>;

// K折交叉验证
void crossValidation(const std::vector<T>& measured,
                   const std::vector<T>& actual, 
                   int k = 5);
```

#### 私有方法

```cpp
// 初始化线程池用于并行处理
void initThreadPool();

// 校准后计算统计指标
void calculateMetrics(const std::vector<T>& measured, const std::vector<T>& actual);

// 使用Levenberg-Marquardt算法进行非线性曲线拟合
auto levenbergMarquardt(const std::vector<T>& x, 
                      const std::vector<T>& y,
                      NonlinearFunction func,
                      std::vector<T> initial_params,
                      int max_iterations = 100, 
                      T lambda = 0.01,
                      T epsilon = 1e-8) -> std::vector<T>;

// 解线性方程组(不使用Boost时)
auto solveLinearSystem(const std::vector<std::vector<T>>& A,
                     const std::vector<T>& b) -> std::vector<T>;
```

### `AsyncCalibrationTask<T>` 类

#### 概述

提供基于协程的异步校准功能。

#### 模板参数

- `T`：浮点类型（由`std::floating_point` concept约束）

#### 方法

```cpp
// 获取校准结果
ErrorCalibration<T>* getResult();
```

#### 相关自由函数

```cpp
// 创建异步校准任务
template <std::floating_point T>
AsyncCalibrationTask<T> calibrateAsync(const std::vector<T>& measured,
                                     const std::vector<T>& actual);
```

## 详细方法说明

### 校准方法

#### `void linearCalibrate(const std::vector<T>& measured, const std::vector<T>& actual)`

目的：对测量值和实际值执行线性校准(y = mx + b)。

参数：

- `measured`：测量值向量
- `actual`：实际/参考值向量

抛出：

- `INVALID_ARGUMENT`：如果输入向量为空或大小不同
- `RUNTIME_ERROR`：如果在斜率计算中发生除零错误

实现细节：

- 使用最小二乘法找到最佳斜率和截距
- 计算统计指标(R平方、MSE、MAE)
- 使用度量互斥锁实现线程安全

示例：

```cpp
std::vector<double> measured = {1.0, 2.0, 3.0, 4.0, 5.0};
std::vector<double> actual = {1.1, 2.3, 2.9, 4.2, 5.1};

atom::algorithm::ErrorCalibration<double> calibrator;
calibrator.linearCalibrate(measured, actual);

// 对新测量应用校准
double raw_measurement = 3.5;
double calibrated = calibrator.apply(raw_measurement);
std::cout << "Raw: " << raw_measurement << ", Calibrated: " << calibrated << std::endl;
```

#### `void polynomialCalibrate(const std::vector<T>& measured, const std::vector<T>& actual, int degree)`

目的：在测量值和实际值之间执行指定度数的多项式校准。

参数：

- `measured`：测量值向量
- `actual`：实际/参考值向量
- `degree`：多项式的度数(1 = 线性, 2 = 二次, 等)

抛出：

- `INVALID_ARGUMENT`：如果输入向量为空、大小不同、包含NaN/无穷值，或度数无效
- `RUNTIME_ERROR`：如果校准算法失败

实现细节：

- 使用Levenberg-Marquardt算法进行非线性曲线拟合
- 为提高性能，尽可能使用并行执行
- 从多项式系数中提取斜率和截距，用于简单的线性应用

示例：

```cpp
std::vector<double> measured = {1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0};
std::vector<double> actual = {1.1, 2.4, 3.9, 5.2, 7.1, 9.6, 12.5};

atom::algorithm::ErrorCalibration<double> calibrator;
// 拟合二次多项式 (y = ax² + bx + c)
calibrator.polynomialCalibrate(measured, actual, 2);
calibrator.printParameters();

// 对新测量应用校准
for (double x = 1.0; x <= 7.0; x += 0.5) {
    std::cout << "Raw: " << x << ", Calibrated: " << calibrator.apply(x) << std::endl;
}
```

#### `void exponentialCalibrate(const std::vector<T>& measured, const std::vector<T>& actual)`

目的：在测量值和实际值之间执行指数校准(y = a * e^(bx))。

参数：

- `measured`：测量值向量
- `actual`：实际/参考值向量

抛出：

- `INVALID_ARGUMENT`：如果输入向量为空、大小不同，或者实际值不为正
- `RUNTIME_ERROR`：如果校准算法失败

实现细节：

- 使用带有指数函数模型的Levenberg-Marquardt算法
- 需要正实际值（因为指数函数严格为正）

示例：

```cpp
std::vector<double> measured = {0.0, 1.0, 2.0, 3.0, 4.0};
std::vector<double> actual = {1.0, 2.7, 7.4, 20.1, 54.6};

atom::algorithm::ErrorCalibration<double> calibrator;
calibrator.exponentialCalibrate(measured, actual);

// 检查校准质量
if (calibrator.getRSquared().has_value()) {
    std::cout << "R-squared: " << calibrator.getRSquared().value() << std::endl;
}
```

#### `void logarithmicCalibrate(const std::vector<T>& measured, const std::vector<T>& actual)`

目的：在测量值和实际值之间执行对数校准(y = a + b * ln(x))。

参数：

- `measured`：测量值向量
- `actual`：实际/参考值向量

抛出：

- `INVALID_ARGUMENT`：如果输入向量为空、大小不同，或者测量值不为正
- `RUNTIME_ERROR`：如果校准算法失败

实现细节：

- 使用带有对数函数模型的Levenberg-Marquardt算法
- 需要正测量值（因为对数只对正数有定义）

示例：

```cpp
std::vector<double> measured = {1.0, 2.0, 5.0, 10.0, 20.0, 50.0, 100.0};
std::vector<double> actual = {0.0, 0.7, 1.6, 2.3, 3.0, 3.9, 4.6};

atom::algorithm::ErrorCalibration<double> calibrator;
calibrator.logarithmicCalibrate(measured, actual);

// 检查校准误差
std::cout << "MSE: " << calibrator.getMse() << ", MAE: " << calibrator.getMae() << std::endl;
```

#### `void powerLawCalibrate(const std::vector<T>& measured, const std::vector<T>& actual)`

目的：在测量值和实际值之间执行幂律校准(y = a * x^b)。

参数：

- `measured`：测量值向量
- `actual`：实际/参考值向量

抛出：

- `INVALID_ARGUMENT`：如果输入向量为空、大小不同，或值不为正
- `RUNTIME_ERROR`：如果校准算法失败

实现细节：

- 使用带有幂函数模型的Levenberg-Marquardt算法
- 需要正值（幂律通常只对正值有定义）

示例：

```cpp
std::vector<double> measured = {1.0, 2.0, 3.0, 4.0, 5.0};
std::vector<double> actual = {2.0, 8.0, 18.0, 32.0, 50.0};

atom::algorithm::ErrorCalibration<double> calibrator;
calibrator.powerLawCalibrate(measured, actual);
calibrator.printParameters();
```

### 统计分析方法

#### `auto bootstrapConfidenceInterval(...) -> std::pair<T, T>`

目的：使用bootstrap重采样估计斜率参数的置信区间。

参数：

- `measured`：测量值向量
- `actual`：实际/参考值向量
- `n_iterations`：bootstrap迭代次数（默认：1000）
- `confidence_level`：置信水平（默认：0.95，表示95%置信度）

返回：包含置信区间下限和上限的对

抛出：

- `INVALID_ARGUMENT`：如果参数无效
- `RUNTIME_ERROR`：如果所有bootstrap迭代都失败

示例：

```cpp
std::vector<double> measured = {1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0};
std::vector<double> actual = {1.2, 2.1, 3.3, 4.0, 4.8, 6.2, 7.1, 8.3, 9.2, 10.1};

atom::algorithm::ErrorCalibration<double> calibrator;
calibrator.linearCalibrate(measured, actual);

// 获取斜率95%置信区间
auto [lower, upper] = calibrator.bootstrapConfidenceInterval(measured, actual);
std::cout << "Slope: " << calibrator.getSlope() 
          << " (95% CI: " << lower << " - " << upper << ")" << std::endl;
```

#### `auto outlierDetection(...) -> std::tuple<T, T, T>`

目的：基于残差分析检测校准数据中的异常值。

参数：

- `measured`：测量值向量
- `actual`：实际/参考值向量
- `threshold`：异常值检测的标准差阈值（默认：2.0）

返回：包含平均残差、标准差和所用阈值的元组

示例：

```cpp
std::vector<double> measured = {1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0};
std::vector<double> actual = {1.1, 2.2, 3.1, 8.5, 5.2, 6.1, 7.3}; // 4.0映射到8.5（异常值）

atom::algorithm::ErrorCalibration<double> calibrator;
calibrator.linearCalibrate(measured, actual);

// 用2.5标准差阈值检测异常值
auto [mean, stddev, thresh] = calibrator.outlierDetection(measured, actual, 2.5);
std::cout << "Mean residual: " << mean << ", StdDev: " << stddev << std::endl;

// 检查所有残差以识别异常值
auto residuals = calibrator.getResiduals();
for (size_t i = 0; i < residuals.size(); i++) {
    if (std::abs(residuals[i] - mean) > thresh * stddev) {
        std::cout << "Outlier at index " << i << ": measured=" << measured[i] 
                  << ", actual=" << actual[i] << ", residual=" << residuals[i] << std::endl;
    }
}
```

#### `void crossValidation(const std::vector<T>& measured, const std::vector<T>& actual, int k = 5)`

目的：执行k折交叉验证来评估校准模型稳定性。

参数：

- `measured`：测量值向量
- `actual`：实际/参考值向量
- `k`：交叉验证的折数（默认：5）

抛出：

- `INVALID_ARGUMENT`：如果输入向量为空、大小不同，或大小 < k
- `RUNTIME_ERROR`：如果所有交叉验证折数失败

示例：

```cpp
std::vector<double> measured(100), actual(100);
// 填充一些测试数据...
for (int i = 0; i < 100; i++) {
    measured[i] = i * 0.1;
    actual[i] = 0.5 + 1.05 * measured[i] + ((i % 10 == 0) ? 0.2 : 0.0); // 一些噪声
}

atom::algorithm::ErrorCalibration<double> calibrator;
// 执行10折交叉验证
calibrator.crossValidation(measured, actual, 10);
```

### 异步校准

#### `AsyncCalibrationTask<T> calibrateAsync(const std::vector<T>& measured, const std::vector<T>& actual)`

目的：使用C++20协程创建异步校准任务。

参数：

- `measured`：测量值向量
- `actual`：实际/参考值向量

返回：表示异步操作的`AsyncCalibrationTask<T>`对象

示例：

```cpp
std::vector<double> measured = {1.0, 2.0, 3.0, 4.0, 5.0};
std::vector<double> actual = {1.1, 2.3, 2.9, 4.2, 5.1};

// 启动异步校准
auto task = atom::algorithm::calibrateAsync(measured, actual);

// 校准运行时做其他工作...
std::cout << "Calibration is running asynchronously..." << std::endl;

// 在需要时获取结果
auto* calibrator = task.getResult();
std::cout << "Calibration complete. Slope: " << calibrator->getSlope() 
          << ", Intercept: " << calibrator->getIntercept() << std::endl;

// 清理（因为calibrateAsync使用new创建校准器）
delete calibrator;
```

## 性能考虑

### 线程池和并行化

该库在有益的情况下利用并行执行：

- 线程池初始化：线程池延迟初始化，以避免不需要时的开销。
- 并行算法：在关键计算步骤中使用`std::execution::par_unseq`。
- 线程数限制：线程池数量有限制，以防止过度订阅。

```cpp
// 显示显式线程池初始化的示例
ErrorCalibration<float> calibrator;
// 线程池将在第一次校准期间自动初始化
```

### 内存优化

该库实现了几种内存优化技术：

- 内存资源：使用`std::pmr`进行高效内存分配。
- 预分配缓冲区：预分配缓冲区以避免频繁的重新分配。
- 线程局部存储：使用线程局部存储减少争用。

### SIMD加速

当定义了`USE_SIMD`编译时，库可以使用SIMD指令：

```cpp
// 启用SIMD加速：
#define USE_SIMD
#include "atom/algorithm/error_calibration.hpp"

// 库将自动检测并使用AVX或NEON指令
```

### Boost集成

可以使用Boost数值库来增强性能：

```cpp
// 启用Boost集成：
#define ATOM_USE_BOOST
#include "atom/algorithm/error_calibration.hpp"

// 库将使用Boost的ublas进行数值操作
```

## 最佳实践和常见陷阱

### 最佳实践

1. 选择适当的校准模型：
   - 对简单线性关系使用线性校准
   - 对非线性但多项式关系使用多项式校准
   - 对指数增长模式使用指数校准
   - 对对数关系使用对数校准
   - 对幂律关系使用幂律校准

2. 验证校准结果：
   - 检查R平方值以评估拟合质量
   - 分析残差中的模式，可能表明模型拟合不佳
   - 使用交叉验证进行更稳健的验证

3. 适当处理异常值：
   - 使用`outlierDetection`识别异常值
   - 考虑在最终校准前移除明显的异常值

4. 优化性能：
   - 对大数据集，启用SIMD和Boost支持
   - 对实时应用，考虑使用异步校准

### 常见陷阱

1. 不适当的模型选择：
   - 对明显非线性关系使用线性校准
   - 使用过高程度的多项式导致过拟合

2. 数据验证不足：
   - 不检查NaN或无限值
   - 不确保数据向量大小相等

3. 忽略数值稳定性问题：
   - 特殊情况下的除零
   - 极端值导致的溢出或下溢

4. 误解统计指标：
   - 只关注R平方而不检查残差
   - 不考虑置信区间

5. 内存管理问题：
   - 不删除用`calibrateAsync`创建的校准器对象

## 综合示例

此示例演示使用误差校准库的完整工作流程：

```cpp
#include <iostream>
#include <iomanip>
#include <vector>
#include "atom/algorithm/error_calibration.hpp"

int main() {
    // 1. 准备带有已知关系的测试数据 (y = 2x + 1) 加一些噪声
    std::vector<double> measured(20);
    std::vector<double> actual(20);
    
    std::random_device rd;
    std::mt19937 gen(rd());
    std::normal_distribution<double> noise(0.0, 0.2); // 均值0，标准差0.2
    
    for (int i = 0; i < 20; i++) {
        measured[i] = i * 0.5;  // 0.0, 0.5, 1.0, 1.5, ...
        actual[i] = 1.0 + 2.0 * measured[i] + noise(gen);  // 2x + 1 + 噪声
    }
    
    // 添加一个异常值
    actual[10] = actual[10] + 2.0;
    
    // 2. 创建校准器
    atom::algorithm::ErrorCalibration<double> calibrator;
    
    // 3. 执行线性校准
    try {
        calibrator.linearCalibrate(measured, actual);
    }
    catch (const std::exception& e) {
        std::cerr << "Calibration error: " << e.what() << std::endl;
        return 1;
    }
    
    // 4. 打印校准参数
    std::cout << "======= Linear Calibration Results =======" << std::endl;
    std::cout << "Slope: " << calibrator.getSlope() << std::endl;
    std::cout << "Intercept: " << calibrator.getIntercept() << std::endl;
    
    if (calibrator.getRSquared().has_value()) {
        std::cout << "R-squared: " << calibrator.getRSquared().value() << std::endl;
    }
    
    std::cout << "MSE: " << calibrator.getMse() << std::endl;
    std::cout << "MAE: " << calibrator.getMae() << std::endl;
    
    // 5. 检测异常值
    std::cout << "\n======= Outlier Detection =======" << std::endl;
    auto [meanResidual, stdDev, threshold] = calibrator.outlierDetection(measured, actual, 2.0);
    
    std::cout << "Mean residual: " << meanResidual << std::endl;
    std::cout << "Standard deviation: " << stdDev << std::endl;
    
    auto residuals = calibrator.getResiduals();
    std::cout << "Detected outliers:" << std::endl;
    for (size_t i = 0; i < residuals.size(); i++) {
        if (std::abs(residuals[i] - meanResidual) > threshold * stdDev) {
            std::cout << "  Index " << i 
                      << ": measured=" << measured[i] 
                      << ", actual=" << actual[i]
                      << ", residual=" << residuals[i] << std::endl;
        }
    }
    
    // 6. Bootstrap置信区间
    std::cout << "\n======= Bootstrap Confidence Intervals =======" << std::endl;
    auto [lowerBound, upperBound] = calibrator.bootstrapConfidenceInterval(
        measured, actual, 1000, 0.95);
    
    std::cout << "Slope: " << calibrator.getSlope() << std::endl;
    std::cout << "95% Confidence Interval: [" << lowerBound << ", " << upperBound << "]" << std::endl;
    
    // 7. 交叉验证
    std::cout << "\n======= Cross-Validation =======" << std::endl;
    calibrator.crossValidation(measured, actual, 5);
    
    // 8. 将校准应用于新值
    std::cout << "\n======= Applying Calibration =======" << std::endl;
    std::cout << std::fixed << std::setprecision(3);
    std::cout << "Raw Value | Calibrated Value" << std::endl;
    std::cout << "-------------------------" << std::endl;
    
    for (double raw = 0.0; raw <= 10.0; raw += 1.0) {
        double calibrated = calibrator.apply(raw);
        std::cout << std::setw(9) << raw << " | " << std::setw(16) << calibrated << std::endl;
    }
    
    // 9. 尝试不同的校准模型（多项式）
    std::cout << "\n======= Polynomial Calibration =======" << std::endl;
    atom::algorithm::ErrorCalibration<double> polyCalibrator;
    
    try {
        // 尝试二次模型
        polyCalibrator.polynomialCalibrate(measured, actual, 2);
        
        std::cout << "MSE (linear): " << calibrator.getMse() << std::endl;
        std::cout << "MSE (polynomial): " << polyCalibrator.getMse() << std::endl;
        
        // 基于MSE比较哪个模型更好
        if (polyCalibrator.getMse() < calibrator.getMse()) {
            std::cout << "Polynomial model provides better fit!" << std::endl;
        } else {
            std::cout << "Linear model provides better fit!" << std::endl;
        }
    }
    catch (const std::exception& e) {
        std::cerr << "Polynomial calibration error: " << e.what() << std::endl;
    }
    
    // 10. 将残差保存到文件以供外部绘图
    try {
        calibrator.plotResiduals("residuals.csv");
        std::cout << "\nResiduals saved to 'residuals.csv'" << std::endl;
    }
    catch (const std::exception& e) {
        std::cerr << "Failed to save residuals: " << e.what() << std::endl;
    }
    
    return 0;
}
```

### 预期输出

输出会根据随机噪声而变化，但应类似于：

```
======= Linear Calibration Results =======
Slope: 2.035
Intercept: 0.968
R-squared: 0.984
MSE: 0.087
MAE: 0.193

======= Outlier Detection =======
Mean residual: 0.011
Standard deviation: 0.293
Detected outliers:
  Index 10: measured=5.000, actual=11.982, residual=2.180

======= Bootstrap Confidence Intervals =======
Slope: 2.035
95% Confidence Interval: [1.891, 2.176]

======= Cross-Validation =======

======= Applying Calibration =======
Raw Value | Calibrated Value
-------------------------
    0.000 |            0.968
    1.000 |            3.003
    2.000 |            5.038
    3.000 |            7.073
    4.000 |            9.108
    5.000 |           11.143
    6.000 |           13.178
    7.000 |           15.213
    8.000 |           17.248
    9.000 |           19.283
   10.000 |           21.318

======= Polynomial Calibration =======
MSE (linear): 0.087
MSE (polynomial): 0.082
Polynomial model provides better fit!

Residuals saved to 'residuals.csv'
```

## 平台和编译器说明

- MSVC：确保使用`/std:c++latest`编译器标志支持C++20
- GCC/Clang：使用`-std=c++20`编译器标志
- SIMD支持：
  - 在x86平台上为AVX支持使用`-mavx`
  - 在ARM平台上为NEON支持使用`-mfpu=neon`
- 线程池限制：
  - 在Windows上，不调整线程优先级
  - 在类Unix系统上，可以通过`pthread`调整线程优先级

## 结论

误差校准库提供了一套全面的工具，用于测量数据的统计校准。具有多种校准模型、统计分析功能和高性能计算能力，它适用于需要精确测量校准的各种科学和工程应用。

模板设计允许与任何浮点类型一起使用，使其适用于不同的精度要求。异步处理和SIMD加速等高级功能使其甚至适用于实时应用和大型数据集。

通过遵循本文档中概述的最佳实践并理解可用的各种校准模型，开发人员可以为其特定用例有效地实现稳健的校准解决方案。
