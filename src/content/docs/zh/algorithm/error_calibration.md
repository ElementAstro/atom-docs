---
title: 误差校准
description: 误差校准库的全面文档，包括线性和多项式校准、残差分析、异常值检测和交叉验证的方法。
---

## 目录

1. [类定义](#类定义)
2. [构造函数](#构造函数)
3. [公共方法](#公共方法)
4. [私有方法](#私有方法)
5. [使用示例](#使用示例)

## 类定义

```cpp
template <std::floating_point T>
class AdvancedErrorCalibration {
    // ... (类成员和方法)
};
```

`AdvancedErrorCalibration` 类是模板化的，可以与任何浮点类型一起使用。

## 构造函数

该类没有显式构造函数。成员使用默认值进行初始化。

## 公共方法

### 线性校准

```cpp
void linearCalibrate(const std::vector<T>& measured, const std::vector<T>& actual);
```

使用最小二乘法执行线性校准。

- **参数：**
  - `measured`：测量值的向量
  - `actual`：实际值的向量

### 多项式校准

```cpp
void polynomialCalibrate(const std::vector<T>& measured, const std::vector<T>& actual, int degree);
```

使用最小二乘法执行多项式校准。

- **参数：**
  - `measured`：测量值的向量
  - `actual`：实际值的向量
  - `degree`：多项式的度数

### 应用校准

```cpp
[[nodiscard]] auto apply(T value) const -> T;
```

对单个值应用校准。

- **参数：**
  - `value`：要校准的值
- **返回：** 校准后的值

### 打印参数

```cpp
void printParameters() const;
```

打印校准参数（斜率、截距、R 平方、均方误差、平均绝对误差）。

### 获取残差

```cpp
[[nodiscard]] auto getResiduals() const -> std::vector<T>;
```

返回上次校准的残差向量。

### 绘制残差

```cpp
void plotResiduals(const std::string& filename) const;
```

将残差数据写入 CSV 文件以进行绘图。

- **参数：**
  - `filename`：要写入数据的文件名

### 自助法置信区间

```cpp
auto bootstrapConfidenceInterval(const std::vector<T>& measured, const std::vector<T>& actual,
                                 int n_iterations = 1000, double confidence_level = 0.95) -> std::pair<T, T>;
```

计算斜率的自助法置信区间。

- **参数：**
  - `measured`：测量值的向量
  - `actual`：实际值的向量
  - `n_iterations`：自助法迭代次数
  - `confidence_level`：置信区间的置信水平
- **返回：** 置信区间的下限和上限的配对

### 异常值检测

```cpp
auto outlierDetection(const std::vector<T>& measured, const std::vector<T>& actual,
                      T threshold = 2.0) -> std::tuple<T, T, T>;
```

使用校准的残差检测异常值。

- **参数：**
  - `measured`：测量值的向量
  - `actual`：实际值的向量
  - `threshold`：异常值检测的阈值
- **返回：** 均值残差、标准差和阈值的元组

### 交叉验证

```cpp
void crossValidation(const std::vector<T>& measured, const std::vector<T>& actual, int k = 5);
```

执行 k 折交叉验证。

- **参数：**
  - `measured`：测量值的向量
  - `actual`：实际值的向量
  - `k`：折数

### 获取方法

```cpp
[[nodiscard]] auto getSlope() const -> T;
[[nodiscard]] auto getIntercept() const -> T;
[[nodiscard]] auto getRSquared() const -> std::optional<T>;
[[nodiscard]] auto getMse() const -> T;
[[nodiscard]] auto getMae() const -> T;
```

这些方法返回校准参数和指标。

## 私有方法

### 计算指标

```cpp
void calculateMetrics(const std::vector<T>& measured, const std::vector<T>& actual);
```

在校准后计算各种指标（R 平方、均方误差、平均绝对误差、残差）。

### 莱文伯格-马夸特算法

```cpp
auto levenbergMarquardt(const std::vector<T>& x, const std::vector<T>& y,
                        NonlinearFunction func, std::vector<T> initial_params,
                        int max_iterations = 100, T lambda = 0.01, T epsilon = 1e-8) -> std::vector<T>;
```

实现非线性最小二乘拟合的莱文伯格-马夸特算法。

### 解线性系统

```cpp
auto solveLinearSystem(const std::vector<std::vector<T>>& A, const std::vector<T>& b) -> std::vector<T>;
```

使用高斯消元法解线性方程组。

## 使用示例

### 线性校准

```cpp
#include "atom/algorithm/error_calibration.hpp"
#include <iostream>
#include <vector>

int main() {
    std::vector<double> measured = {1.0, 2.0, 3.0, 4.0, 5.0};
    std::vector<double> actual = {1.1, 2.2, 2.9, 4.1, 5.0};

    atom::algorithm::AdvancedErrorCalibration<double> calibrator;
    calibrator.linearCalibrate(measured, actual);

    calibrator.printParameters();

    double test_value = 3.5;
    std::cout << "校准后的值为 " << test_value << " 是 "
              << calibrator.apply(test_value) << std::endl;

    return 0;
}
```

### 多项式校准与异常值检测

```cpp
#include "atom/algorithm/error_calibration.hpp"
#include <iostream>
#include <vector>

int main() {
    std::vector<double> measured = {1.0, 2.0, 3.0, 4.0, 5.0, 6.0};
    std::vector<double> actual = {1.1, 2.2, 2.9, 4.1, 5.0, 7.5};

    atom::algorithm::AdvancedErrorCalibration<double> calibrator;
    calibrator.polynomialCalibrate(measured, actual, 2);  // 二次多项式

    calibrator.printParameters();

    auto [mean_residual, std_dev, threshold] = calibrator.outlierDetection(measured, actual);
    std::cout << "异常值检测结果:" << std::endl;
    std::cout << "均值残差: " << mean_residual << std::endl;
    std::cout << "标准差: " << std_dev << std::endl;
    std::cout << "阈值: " << threshold << std::endl;

    return 0;
}
```
