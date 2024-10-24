---
title: 卷积与反卷积
description: Atom 算法库中卷积和反卷积函数的详细文档，包括一维和二维操作、傅里叶变换、高斯滤波器及使用示例
---

## 目录

1. [概述](#概述)
2. [一维卷积与反卷积](#一维卷积与反卷积)
3. [二维卷积与反卷积](#二维卷积与反卷积)
4. [傅里叶变换函数](#傅里叶变换函数)
5. [高斯滤波器函数](#高斯滤波器函数)
6. [使用示例](#使用示例)

## 概述

该库提供了一维和二维卷积及反卷积操作的函数。它还包括离散傅里叶变换（DFT）和逆离散傅里叶变换（IDFT）函数，以及生成和应用高斯滤波器的工具。

## 一维卷积与反卷积

### 一维卷积

```cpp
[[nodiscard]] auto convolve(const std::vector<double>& input,
                            const std::vector<double>& kernel) -> std::vector<double>;
```

对输入信号与给定卷积核进行一维卷积。

- **参数：**
  - `input`：作为双精度浮点数向量的输入信号。
  - `kernel`：作为双精度浮点数向量的卷积核。
- **返回：** 表示卷积信号的双精度浮点数向量。

### 一维反卷积

```cpp
[[nodiscard]] auto deconvolve(const std::vector<double>& input,
                              const std::vector<double>& kernel) -> std::vector<double>;
```

对输入信号与给定卷积核进行一维反卷积。

- **参数：**
  - `input`：作为双精度浮点数向量的输入信号。
  - `kernel`：作为双精度浮点数向量的反卷积核。
- **返回：** 表示反卷积信号的双精度浮点数向量。

## 二维卷积与反卷积

### 二维卷积

```cpp
[[nodiscard]] auto convolve2D(const std::vector<std::vector<double>>& input,
                              const std::vector<std::vector<double>>& kernel,
                              int numThreads = 1) -> std::vector<std::vector<double>>;
```

对输入图像与给定卷积核进行二维卷积。

- **参数：**
  - `input`：作为双精度浮点数的二维向量的输入图像。
  - `kernel`：作为双精度浮点数的二维向量的卷积核。
  - `numThreads`：用于并行执行的线程数（默认：1）。
- **返回：** 表示卷积图像的双精度浮点数二维向量。

### 二维反卷积

```cpp
[[nodiscard]] auto deconvolve2D(const std::vector<std::vector<double>>& signal,
                                const std::vector<std::vector<double>>& kernel,
                                int numThreads = 1) -> std::vector<std::vector<double>>;
```

对输入图像与给定卷积核进行二维反卷积。

- **参数：**
  - `signal`：作为双精度浮点数的二维向量的输入图像。
  - `kernel`：作为双精度浮点数的二维向量的反卷积核。
  - `numThreads`：用于并行执行的线程数（默认：1）。
- **返回：** 表示反卷积图像的双精度浮点数二维向量。

## 傅里叶变换函数

### 二维离散傅里叶变换（DFT）

```cpp
[[nodiscard]] auto dfT2D(const std::vector<std::vector<double>>& signal,
                         int numThreads = 1) -> std::vector<std::vector<std::complex<double>>>;
```

计算输入图像的二维离散傅里叶变换。

- **参数：**
  - `signal`：作为双精度浮点数的二维向量的输入图像。
  - `numThreads`：用于并行执行的线程数（默认：1）。
- **返回：** 表示 DFT 频谱的复数双精度浮点数二维向量。

### 二维逆离散傅里叶变换（IDFT）

```cpp
[[nodiscard]] auto idfT2D(const std::vector<std::vector<std::complex<double>>>& spectrum,
                          int numThreads = 1) -> std::vector<std::vector<double>>;
```

计算输入频谱的二维逆离散傅里叶变换。

- **参数：**
  - `spectrum`：作为复数双精度浮点数的二维向量的输入频谱。
  - `numThreads`：用于并行执行的线程数（默认：1）。
- **返回：** 表示 IDFT 图像的双精度浮点数二维向量。

## 高斯滤波器函数

### 生成高斯核

```cpp
[[nodiscard]] auto generateGaussianKernel(int size, double sigma) -> std::vector<std::vector<double>>;
```

生成用于二维卷积的高斯核。

- **参数：**
  - `size`：核的大小（宽度和高度）。
  - `sigma`：高斯分布的标准差。
- **返回：** 表示高斯核的双精度浮点数二维向量。

### 应用高斯滤波器

```cpp
[[nodiscard]] auto applyGaussianFilter(const std::vector<std::vector<double>>& image,
                                       const std::vector<std::vector<double>>& kernel) -> std::vector<std::vector<double>>;
```

将高斯滤波器应用于图像。

- **参数：**
  - `image`：作为双精度浮点数的二维向量的输入图像。
  - `kernel`：作为双精度浮点数的二维向量的高斯核。
- **返回：** 表示滤波后图像的双精度浮点数二维向量。

## 使用示例

以下是一些演示如何使用该库中函数的示例：

### 一维卷积示例

```cpp
#include "atom/algorithm/convolve.hpp"
#include <iostream>
#include <vector>

int main() {
    std::vector<double> input = {1, 2, 3, 4, 5};
    std::vector<double> kernel = {0.5, 0.5};

    auto result = atom::algorithm::convolve(input, kernel);

    std::cout << "卷积结果:" << std::endl;
    for (const auto& val : result) {
        std::cout << val << " ";
    }
    std::cout << std::endl;

    return 0;
}
```

### 使用高斯滤波器的二维卷积示例

```cpp
#include "atom/algorithm/convolve.hpp"
#include <iostream>
#include <vector>

int main() {
    // 创建一个示例 5x5 图像
    std::vector<std::vector<double>> image = {
        {1, 2, 3, 4, 5},
        {2, 3, 4, 5, 6},
        {3, 4, 5, 6, 7},
        {4, 5, 6, 7, 8},
        {5, 6, 7, 8, 9}
    };

    // 生成一个 3x3 的高斯核
    auto kernel = atom::algorithm::generateGaussianKernel(3, 1.0);

    // 应用高斯滤波器
    auto filtered_image = atom::algorithm::applyGaussianFilter(image, kernel);

    std::cout << "滤波后图像:" << std::endl;
    for (const auto& row : filtered_image) {
        for (const auto& val : row) {
            std::cout << val << " ";
        }
        std::cout << std::endl;
    }

    return 0;
}
```
