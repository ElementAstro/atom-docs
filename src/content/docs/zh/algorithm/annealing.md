---

title: 模拟退火算法
description: C++中模拟退火算法实现的详细说明，包括SimulatedAnnealing类和一个示例问题（旅行商问题）
---

## 概述

该库提供了一个稳健且灵活的模拟退火算法C++实现，用于解决优化问题。模拟退火是一种概率技术，用于近似给定函数的全局最优解，尤其适用于寻找精确解决方案不切实际的问题。

该实现提供了几个关键特性：

- 使用C++20概念的泛型编程方法
- 多种冷却策略来控制退火过程
- 支持多线程并行执行
- 性能关键计算的SIMD加速（可选）
- 自适应温度调整能力
- 全面的日志记录和错误跟踪
- 使用构建器模式便于配置

该库设计既适合有经验的C++开发人员使用，也方便优化算法的新手访问。

## 库依赖

### 必需的头文件

```cpp
#include <algorithm>
#include <atomic>
#include <cmath>
#include <functional>
#include <limits>
#include <memory>
#include <mutex>
#include <numeric>
#include <random>
#include <sstream>
#include <thread>
#include <vector>
```

### 可选依赖

该库可以利用以下可选组件：

- SIMD指令：通过定义`ATOM_USE_SIMD`启用
  - x86_64：使用`<immintrin.h>`实现AVX2指令
  - ARM64：使用`<arm_neon.h>`实现NEON指令

- Boost库：通过定义`ATOM_USE_BOOST`启用
  - `<boost/random.hpp>`：用于改进的随机数生成
  - `<boost/thread.hpp>`：用于增强的线程功能

- Atom库组件：
  - `atom/error/exception.hpp`：用于异常处理
  - `atom/log/loguru.hpp`：用于日志功能

## 核心组件

### AnnealingProblem概念

`AnnealingProblem`概念定义了任何问题类必须满足的要求，以便与`SimulatedAnnealing`算法一起使用。

```cpp
template <typename ProblemType, typename SolutionType>
concept AnnealingProblem =
    requires(ProblemType problemInstance, SolutionType solutionInstance) {
        {
            problemInstance.energy(solutionInstance)
        } -> std::floating_point;  // 必须返回浮点型能量值
        {
            problemInstance.neighbor(solutionInstance)
        } -> std::same_as<SolutionType>;  // 必须生成邻居解
        { problemInstance.randomSolution() } -> std::same_as<SolutionType>;  // 必须创建随机解
    };
```

该概念要求三个关键函数：

1. `energy(solution)`：计算解的能量（目标函数）
   - 参数：一个解实例
   - 返回：表示能量的浮点值（越低越好）

2. `neighbor(solution)`：通过小修改生成邻居解
   - 参数：当前解
   - 返回：在解空间中"附近"的新解

3. `randomSolution()`：创建完全随机的解
   - 返回：解空间中的有效随机解

### SimulatedAnnealing类

`SimulatedAnnealing`类实现了退火算法并管理优化过程。

```cpp
template <typename ProblemType, typename SolutionType>
    requires AnnealingProblem<ProblemType, SolutionType>
class SimulatedAnnealing {
    // 实现细节...
public:
    class Builder {...}  // 用于实例化的构建器模式
    
    // 主构造函数（请改用Builder）
    explicit SimulatedAnnealing(const Builder& builder);
    
    // 配置方法
    void setCoolingSchedule(AnnealingStrategy strategy);
    void setProgressCallback(std::function<void(int, double, const SolutionType&)> callback);
    void setStopCondition(std::function<bool(int, double, const SolutionType&)> condition);
    void setInitialTemperature(double temperature);
    void setCoolingRate(double rate);
    
    // 优化执行
    auto optimize(int numThreads = 1) -> SolutionType;
    
    // 结果获取
    [[nodiscard]] auto getBestEnergy() -> double;
};
```

#### 构建器模式

`SimulatedAnnealing`类使用构建器模式以获得更好的构造和配置：

```cpp
class Builder {
public:
    Builder(ProblemType& problemInstance);
    
    Builder& setCoolingStrategy(AnnealingStrategy strategy);
    Builder& setMaxIterations(int iterations);
    Builder& setInitialTemperature(double temperature);
    Builder& setCoolingRate(double rate);
    Builder& setRestartInterval(int interval);
    
    SimulatedAnnealing build();
};
```

#### 关键方法

1. `setCoolingSchedule(strategy)`
   - 目的：设置温度降低策略
   - 参数：`strategy` - 定义的`AnnealingStrategy`值之一
   - 效果：改变温度在迭代过程中的降低方式

2. `setProgressCallback(callback)`
   - 目的：注册接收进度更新的函数
   - 参数：`callback` - 接受迭代计数、当前能量和当前解的函数
   - 效果：每次迭代都会调用回调函数

3. `setStopCondition(condition)`
   - 目的：定义自定义终止条件
   - 参数：`condition` - 当优化应该停止时返回true的函数
   - 效果：当条件返回true时，优化停止

4. `optimize(numThreads)`
   - 目的：运行模拟退火算法
   - 参数：`numThreads` - 要使用的并行线程数（默认：1）
   - 返回：找到的最佳解
   - 效果：使用配置的参数执行优化过程
   - 异常：传播来自底层问题实现的任何异常

## 冷却策略

该库实现了几种温度冷却策略，每种都有不同的特点：

```cpp
enum class AnnealingStrategy {
    LINEAR,      // 线性下降：T = T0 * (1 - t/tmax)
    EXPONENTIAL, // 指数下降：T = T0 * (cooling_rate^t)
    LOGARITHMIC, // 对数下降：T = T0 / log(t+2)
    GEOMETRIC,   // 几何下降：T = T0 / (1 + cooling_rate*t)
    QUADRATIC,   // 二次下降：T = T0 / (1 + cooling_rate*t²)
    HYPERBOLIC,  // 双曲线下降：T = T0 / (1 + cooling_rate*sqrt(t))
    ADAPTIVE     // 基于接受率的自适应冷却
};
```

策略选择指南：

- LINEAR：简单且可预测。适合初步测试。
- EXPONENTIAL：快速冷却，当快速收敛很重要时适用。
- LOGARITHMIC：非常慢的冷却，最适合需要彻底探索的困难问题。
- GEOMETRIC：适中的冷却，平衡探索和利用。
- QUADRATIC：开始慢然后加速冷却。适合早期探索至关重要的问题。
- HYPERBOLIC：类似几何但具有不同的曲线。
- ADAPTIVE：根据接受率自动调整冷却。最适合未知问题景观。

## TSP实现

该库包含旅行商问题（TSP）实现作为示例问题：

```cpp
class TSP {
private:
    std::vector<std::pair<double, double>> cities_;

public:
    explicit TSP(const std::vector<std::pair<double, double>>& cities);
    
    [[nodiscard]] auto energy(const std::vector<int>& solution) const -> double;
    [[nodiscard]] static auto neighbor(const std::vector<int>& solution) -> std::vector<int>;
    [[nodiscard]] auto randomSolution() const -> std::vector<int>;
};
```

### TSP方法

1. `TSP(cities)`
   - 目的：初始化TSP问题的构造函数
   - 参数：`cities` - 表示城市位置的坐标对向量

2. `energy(solution)`
   - 目的：计算给定旅程的总路径长度
   - 参数：`solution` - 表示城市访问顺序的索引向量
   - 返回：总旅程长度（距离）
   - 实现：如果可用，可能使用SIMD优化

3. `neighbor(solution)`
   - 目的：通过交换两个随机城市生成邻居解
   - 参数：`solution` - 当前旅程顺序
   - 返回：交换了两个位置的修改旅程

4. `randomSolution()`
   - 目的：创建访问所有城市的随机旅程
   - 返回：城市索引的随机排列

## 性能优化

### SIMD加速

当定义了`ATOM_USE_SIMD`时，库使用SIMD指令：

- 在支持AVX2的x86_64平台上：

  ```cpp
  __m256d v1 = _mm256_set_pd(0.0, 0.0, y1, x1);
  __m256d v2 = _mm256_set_pd(0.0, 0.0, y2, x2);
  __m256d diff = _mm256_sub_pd(v1, v2);
  __m256d squared = _mm256_mul_pd(diff, diff);
  ```

- 在支持NEON的ARM64平台上：

  ```cpp
  float32x2_t p1 = vset_f32(static_cast<float>(x1), static_cast<float>(y1));
  float32x2_t p2 = vset_f32(static_cast<float>(x2), static_cast<float>(y2));
  float32x2_t diff = vsub_f32(p1, p2);
  float32x2_t squared = vmul_f32(diff, diff);
  ```

### 并行执行

`optimize`方法支持多线程执行：

```cpp
auto SimulatedAnnealing<ProblemType, SolutionType>::optimize(int numThreads) -> SolutionType {
    // 创建多个独立运行优化的线程
    std::vector<std::jthread> threads;
    threads.reserve(numThreads);
    for (int threadIndex = 0; threadIndex < numThreads; ++threadIndex) {
        threads.emplace_back([this]() { optimizeThread(); });
    }
    // 返回所有线程中找到的最佳解
    return best_solution_;
}
```

每个线程处理独立的解路径，对最佳解的更新是线程安全的。

### 重启机制

该算法包含一个重启机制，用于逃离局部最小值：

```cpp
void restartOptimization() {
    std::lock_guard lock(best_mutex_);
    if (current_restart_ < restart_interval_) {
        current_restart_++;
        return;
    }

    LOG_F(INFO, "Performing restart optimization");
    auto newSolution = problem_instance_.randomSolution();
    double newEnergy = problem_instance_.energy(newSolution);

    if (newEnergy < best_energy_) {
        best_solution_ = newSolution;
        best_energy_ = newEnergy;
        total_restarts_++;
        current_restart_ = 0;
        LOG_F(INFO, "Restart found better solution with energy: {}", best_energy_);
    }
}
```

## 最佳实践

### 配置指南

1. 初始温度选择
   - 设置足够高，使算法在开始时接受许多转换（约80-90%接受率）
   - 通常是邻近解之间平均能量差的10-100倍

2. 冷却策略选择
   - 对于未知问题，从`EXPONENTIAL`或`ADAPTIVE`开始
   - 对于需要大量探索的复杂问题，使用`LOGARITHMIC`
   - 对于较简单的问题，使用`LINEAR`或`EXPONENTIAL`

3. 冷却率
   - 典型值：0.90-0.99
   - 较高的值（较慢冷却）：更好的质量，更长的运行时间
   - 较低的值（较快冷却）：更快的结果，可能质量次优

4. 迭代次数
   - 开始至少使用1000次迭代
   - 对于复杂问题，考虑10,000+次迭代
   - 监控能量历史以确保收敛

### 常见陷阱

1. 温度冷却过快
   - 症状：快速收敛到质量差的解，低接受率
   - 解决方案：增加初始温度或冷却率（接近1.0）

2. 温度冷却过慢
   - 症状：过长的运行时间，算法徘徊而不收敛
   - 解决方案：降低初始温度或冷却率

3. 邻居函数设计不佳
   - 症状：无法逃离局部最小值，解质量达到平台期
   - 解决方案：重新设计邻居函数以做出更有影响力的变化

4. 线程争用
   - 症状：使用更多线程时扩展性差，CPU使用率高但进展有限
   - 解决方案：减少线程数或调整锁定策略

## 完整示例

以下示例演示如何使用该库解决旅行商问题：

```cpp
#include <iostream>
#include <vector>
#include "atom/algorithm/annealing.hpp"

// 定义一个简单的问题实例
int main() {
    try {
        // 创建一个包含10个城市的TSP实例，城市排列成一个圆
        std::vector<std::pair<double, double>> cities;
        for (int i = 0; i < 10; ++i) {
            double angle = 2.0 * M_PI * i / 10.0;
            cities.emplace_back(std::cos(angle), std::sin(angle));
        }
        
        TSP tspProblem(cities);
        
        // 使用构建器模式配置模拟退火求解器
        auto annealingBuilder = SimulatedAnnealing<TSP, std::vector<int>>::Builder(tspProblem)
            .setCoolingStrategy(AnnealingStrategy::EXPONENTIAL)
            .setMaxIterations(10000)
            .setInitialTemperature(100.0)
            .setCoolingRate(0.95)
            .setRestartInterval(1000);
            
        auto annealing = annealingBuilder.build();
        
        // 设置进度回调以显示中间结果
        annealing.setProgressCallback([](int iteration, double energy, const std::vector<int>& solution) {
            if (iteration % 1000 == 0) {
                std::cout << "Iteration " << iteration << ", Energy: " << energy << std::endl;
            }
        });
        
        // 设置停止条件（可选）
        annealing.setStopCondition([](int iteration, double energy, const std::vector<int>& solution) {
            // 如果我们达到接近最优解（圆周长 ≈ 2π）则停止
            return energy <= 6.3; // 略高于2π
        });
        
        // 使用4个线程运行优化
        std::cout << "Starting optimization..." << std::endl;
        auto bestSolution = annealing.optimize(4);
        
        // 显示结果
        std::cout << "Optimization complete!" << std::endl;
        std::cout << "Best tour length: " << annealing.getBestEnergy() << std::endl;
        std::cout << "Tour: ";
        for (int city : bestSolution) {
            std::cout << city << " ";
        }
        std::cout << std::endl;
        
        return 0;
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
}
```

### 预期输出

```
Starting optimization...
Iteration 0, Energy: 12.4721
Iteration 1000, Energy: 7.8432
Iteration 2000, Energy: 6.8914
Iteration 3000, Energy: 6.4289
Iteration 4000, Energy: 6.3051
Optimization complete!
Best tour length: 6.2832
Tour: 0 1 2 3 4 5 6 7 8 9
```

## 高级用法示例

### 自定义问题实现

要实现您自己的优化问题，创建一个满足`AnnealingProblem`概念的类：

```cpp
class CustomProblem {
private:
    // 问题特定数据
    std::vector<double> weights_;
    
public:
    explicit CustomProblem(const std::vector<double>& weights) : weights_(weights) {}
    
    // 能量函数 - 评估解（越低越好）
    [[nodiscard]] double energy(const std::vector<bool>& solution) const {
        double total = 0.0;
        for (size_t i = 0; i < solution.size(); ++i) {
            if (solution[i]) {
                total += weights_[i];
            }
        }
        return total;
    }
    
    // 通过翻转一位生成邻居
    [[nodiscard]] static std::vector<bool> neighbor(const std::vector<bool>& solution) {
        std::vector<bool> result = solution;
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_int_distribution<size_t> dist(0, solution.size() - 1);
        size_t pos = dist(gen);
        result[pos] = !result[pos];
        return result;
    }
    
    // 生成随机解
    [[nodiscard]] std::vector<bool> randomSolution() const {
        std::vector<bool> solution(weights_.size());
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_int_distribution<int> dist(0, 1);
        for (size_t i = 0; i < solution.size(); ++i) {
            solution[i] = dist(gen) == 1;
        }
        return solution;
    }
};
```

### 使用自适应温度控制

对于最佳冷却计划未知的问题：

```cpp
// 使用自适应冷却设置
auto annealing = SimulatedAnnealing<MyProblem, MySolution>::Builder(problem)
    .setCoolingStrategy(AnnealingStrategy::ADAPTIVE)
    .setMaxIterations(10000)
    .setInitialTemperature(100.0)
    .setCoolingRate(0.98)  // 初始率，将自动调整
    .build();

// 冷却率将根据接受率进行调整
auto solution = annealing.optimize();
```

### 处理大规模问题

对于非常大的问题，考虑以下方法：

```cpp
// 1. 从高温和快速冷却开始，获得合理的起点
auto initialAnnealing = SimulatedAnnealing<LargeProblem, LargeSolution>::Builder(problem)
    .setCoolingStrategy(AnnealingStrategy::EXPONENTIAL)
    .setMaxIterations(1000)
    .setInitialTemperature(1000.0)
    .setCoolingRate(0.9)  // 快速冷却
    .build();

auto initialSolution = initialAnnealing.optimize();
double initialEnergy = problem.energy(initialSolution);
std::cout << "Initial optimization: " << initialEnergy << std::endl;

// 2. 使用更慢的冷却计划从之前的解开始精炼
problem.setInitialSolution(initialSolution);  // 自定义方法设置起点

auto refinementAnnealing = SimulatedAnnealing<LargeProblem, LargeSolution>::Builder(problem)
    .setCoolingStrategy(AnnealingStrategy::LOGARITHMIC)  // 较慢冷却
    .setMaxIterations(10000)
    .setInitialTemperature(10.0)  // 较低温度
    .build();

auto finalSolution = refinementAnnealing.optimize(8);  // 使用更多线程
double finalEnergy = problem.energy(finalSolution);
std::cout << "Final optimization: " << finalEnergy << std::endl;
```

## 平台特定考虑因素

### 编译器支持

- 必需：兼容C++20的编译器以支持概念
- 推荐：
  - Linux/macOS上的GCC 10+或Clang 13+
  - Windows上的MSVC 19.29+（Visual Studio 2022）

### SIMD优化

- Intel/AMD x86_64：
  - 定义`ATOM_USE_SIMD`以启用AVX2优化
  - 在Haswell架构或更新版本上性能最佳
  
- ARM64：
  - 定义`ATOM_USE_SIMD`以启用NEON优化
  - 在Apple M系列，Cortex-A76或更新版本上有效

### 线程安全

该实现是线程安全的，并提供以下保证：

- 多个线程可以同时运行优化
- 进度回调可能会被并发调用
- 最佳解跟踪由互斥锁保护

注意：如果使用多线程，用户提供的回调函数必须是线程安全的。
