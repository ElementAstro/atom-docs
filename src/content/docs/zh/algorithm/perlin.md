---
title: Perlin 噪声
description: Perlin 噪声实现的详细文档，包括类方法、OpenCL 和 SIMD 支持，以及生成过程纹理和地形的示例用法
---

## 概述

`perlin.hpp` 文件提供了 Perlin 噪声的实现，这是一种用于生成过程纹理、地形和其他自然外观图案的梯度噪声算法。该实现支持 CPU 和基于 OpenCL 的 GPU 计算。

## 命名空间

`PerlinNoise` 类定义在 `atom::algorithm` 命名空间中。

```cpp
namespace atom::algorithm {
    // ...
}
```

## PerlinNoise 类

### 类定义

```cpp
class PerlinNoise {
public:
    explicit PerlinNoise(unsigned int seed = std::default_random_engine::default_seed);
    ~PerlinNoise();

    template <std::floating_point T>
    [[nodiscard]] auto noise(T x, T y, T z) const -> T;

    template <std::floating_point T>
    [[nodiscard]] auto octaveNoise(T x, T y, T z, int octaves, T persistence) const -> T;

    [[nodiscard]] auto generateNoiseMap(int width, int height, double scale, int octaves,
                                        double persistence, double lacunarity,
                                        int seed = std::default_random_engine::default_seed) const
        -> std::vector<std::vector<double>>;

private:
    // ... (私有成员和方法)
};
```

### 构造函数

```cpp
explicit PerlinNoise(unsigned int seed = std::default_random_engine::default_seed);
```

使用指定的种子构造一个 PerlinNoise 对象。

- **参数：**
  - `seed`：随机数生成器的种子值（默认是 `std::default_random_engine` 的默认种子）。
- **使用示例：**

  ```cpp
  atom::algorithm::PerlinNoise perlin(12345); // 创建一个种子为 12345 的 PerlinNoise 对象
  ```

### 析构函数

```cpp
~PerlinNoise();
```

清理资源，包括如果启用了 OpenCL 则清理 OpenCL 资源。

### noise

```cpp
template <std::floating_point T>
[[nodiscard]] auto noise(T x, T y, T z) const -> T;
```

为给定坐标生成 3D Perlin 噪声。

- **模板参数：**
  - `T`：浮点类型。
- **参数：**
  - `x`、`y`、`z`：生成噪声的坐标。
- **返回值：** 噪声值，范围在 [0, 1] 之间。
- **使用示例：**

  ```cpp
  atom::algorithm::PerlinNoise perlin;
  double value = perlin.noise(0.5, 1.0, 2.0);
  ```

### octaveNoise

```cpp
template <std::floating_point T>
[[nodiscard]] auto octaveNoise(T x, T y, T z, int octaves, T persistence) const -> T;
```

生成具有多个八度的 3D Perlin 噪声，以增加细节。

- **模板参数：**
  - `T`：浮点类型。
- **参数：**
  - `x`、`y`、`z`：生成噪声的坐标。
  - `octaves`：要组合的噪声层数。
  - `persistence`：每个八度的振幅乘数（通常 < 1）。
- **返回值：** 组合的噪声值，范围在 [0, 1] 之间。
- **使用示例：**

  ```cpp
  atom::algorithm::PerlinNoise perlin;
  double value = perlin.octaveNoise(0.5, 1.0, 2.0, 4, 0.5);
  ```

### generateNoiseMap

```cpp
[[nodiscard]] auto generateNoiseMap(int width, int height, double scale, int octaves,
                                    double persistence, double lacunarity,
                                    int seed = std::default_random_engine::default_seed) const
    -> std::vector<std::vector<double>>;
```

使用八度噪声生成 2D 噪声图。

- **参数：**
  - `width`、`height`：噪声图的尺寸。
  - `scale`：噪声的缩放（较低的值会创建缩放较大的噪声）。
  - `octaves`：要组合的噪声层数。
  - `persistence`：每个八度的振幅乘数。
  - `lacunarity`：每个八度的频率乘数（在当前实现中未使用）。
  - `seed`：随机数生成的种子（默认是 `std::default_random_engine` 的默认种子）。
- **返回值：** 表示噪声图的 2D 向量。
- **使用示例：**

  ```cpp
  atom::algorithm::PerlinNoise perlin;
  auto noiseMap = perlin.generateNoiseMap(256, 256, 50.0, 4, 0.5, 2.0, 12345);
  ```

## OpenCL 支持

Perlin 噪声实现包括对基于 OpenCL 的 GPU 计算的支持，当定义了 `USE_OPENCL` 宏时，`noise` 方法将自动使用 GPU 加速以提高性能。

### OpenCL 特定方法

这些方法仅在定义了 `USE_OPENCL` 时可用：

- `initializeOpenCL()`: 初始化 OpenCL 上下文和资源。
- `cleanupOpenCL()`: 清理 OpenCL 资源。
- `noiseOpenCL()`: 使用 OpenCL 计算 Perlin 噪声。

## SIMD 支持

该实现包括对淡化函数计算的 SIMD（单指令多数据）优化，当定义了 `USE_SIMD` 宏时。这可以显著提高支持 SIMD 指令的 CPU 上的性能。

## 示例用法

以下示例演示如何使用 PerlinNoise 类生成噪声图并使用它创建简单的地形高度图：

```cpp
#include "perlin.hpp"
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    // 创建一个具有随机种子的 PerlinNoise 对象
    atom::algorithm::PerlinNoise perlin(12345);

    // 生成噪声图
    int width = 100;
    int height = 100;
    double scale = 25.0;
    int octaves = 4;
    double persistence = 0.5;
    double lacunarity = 2.0;

    auto noiseMap = perlin.generateNoiseMap(width, height, scale, octaves, persistence, lacunarity);

    // 使用噪声图创建简单的地形高度图
    std::vector<std::vector<char>> terrain(height, std::vector<char>(width));
    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            double value = noiseMap[y][x];
            if (value < 0.3) terrain[y][x] = '~';  // 水
            else if (value < 0.5) terrain[y][x] = '.';  // 沙
            else if (value < 0.7) terrain[y][x] = '*';  // 草地
            else if (value < 0.9) terrain[y][x] = '^';  // 山丘
            else terrain[y][x] = 'M';  // 山
        }
    }

    // 打印地形
    for (const auto& row : terrain) {
        for (char cell : row) {
            std::cout << cell;
        }
        std::cout << '\n';
    }

    return 0;
}
```

## 最佳实践

1. 确保输入参数有效，特别是生成噪声图时的尺寸和缩放因子。
2. 在处理大型噪声图时，考虑使用文件 I/O，而不是将整个图像存储在内存中。
3. 对于性能要求较高的应用，考虑使用 OpenCL 加速 Perlin 噪声计算。
4. 使用 `octaveNoise` 方法生成更复杂的噪声模式时，合理选择八度数和持久性。

## 注意事项

- 此实现使用 `std::shared_ptr` 进行 Perlin 噪声节点的内存管理。
- Perlin 噪声的效果取决于输入参数，特别是缩放和八度数。适当的参数选择可以产生更自然的纹理和地形。
- 尽管此实现提供了对 Perlin 噪声的良好理解，但在生产使用中，考虑使用经过优化和彻底测试的成熟库。
