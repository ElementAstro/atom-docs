---
title: CPU信息
description: CPU 信息模块的详细文档，包括结构、函数、使用示例和最佳实践，以获取 CPU 的使用情况、温度、型号、频率和缓存大小等详细信息。
---

## 目录

1. [介绍](#introduction)
2. [结构](#structures)
3. [函数](#functions)
4. [使用示例](#usage-examples)
5. [最佳实践和注意事项](#best-practices-and-considerations)

## 介绍

CPU信息模块是 `atom::system` 命名空间的一部分，提供了一组函数来检索系统 CPU 的各种详细信息。此模块对于系统监控、性能调整和应用优化非常有用。

## 结构

### CacheSizes

```cpp
struct CacheSizes {
    size_t l1d;  // L1 数据缓存大小（字节）
    size_t l1i;  // L1 指令缓存大小（字节）
    size_t l2;   // L2 缓存大小（字节）
    size_t l3;   // L3 缓存大小（字节）
} ATOM_ALIGNAS(32);
```

该结构体保存了不同 CPU 缓存的大小。为了优化内存访问，它对齐到 32 字节边界。

## 函数

### 1. getCurrentCpuUsage

```cpp
[[nodiscard]] auto getCurrentCpuUsage() -> float;
```

检索当前 CPU 使用率百分比。

- **返回值**: 一个浮点数，表示 CPU 使用率（0.0 到 100.0）。

### 2. getCurrentCpuTemperature

```cpp
[[nodiscard]] auto getCurrentCpuTemperature() -> float;
```

检索当前 CPU 温度。

- **返回值**: 一个浮点数，表示 CPU 温度（以摄氏度为单位）。

### 3. getCPUModel

```cpp
[[nodiscard]] auto getCPUModel() -> std::string;
```

检索 CPU 型号名称。

- **返回值**: 一个字符串，包含 CPU 型号名称。

### 4. getProcessorIdentifier

```cpp
[[nodiscard]] auto getProcessorIdentifier() -> std::string;
```

检索 CPU 标识符。

- **返回值**: 一个字符串，表示唯一的 CPU 标识符。

### 5. getProcessorFrequency

```cpp
[[nodiscard]] auto getProcessorFrequency() -> double;
```

检索当前 CPU 频率。

- **返回值**: 一个双精度浮点数，表示 CPU 频率（以 GHz 为单位）。

### 6. getNumberOfPhysicalPackages

```cpp
[[nodiscard]] auto getNumberOfPhysicalPackages() -> int;
```

检索系统中的物理 CPU 包（插槽）数量。

- **返回值**: 一个整数，表示物理 CPU 包的数量。

### 7. getNumberOfPhysicalCPUs

```cpp
[[nodiscard]] auto getNumberOfPhysicalCPUs() -> int;
```

检索系统中的逻辑 CPU（核心）数量。

- **返回值**: 一个整数，表示逻辑 CPU 的总数量。

### 8. getCacheSizes

```cpp
[[nodiscard]] auto getCacheSizes() -> CacheSizes;
```

检索 CPU 缓存的大小。

- **返回值**: 一个 `CacheSizes` 结构，包含 L1、L2 和 L3 缓存的大小（以字节为单位）。

## 使用示例

以下是一个综合示例，演示如何使用 CPU 信息模块：

```cpp
#include "cpu.hpp"
#include <iostream>
#include <iomanip>

void printCPUInfo() {
    using namespace atom::system;

    // 获取并打印 CPU 型号
    std::cout << "CPU 型号: " << getCPUModel() << std::endl;

    // 获取并打印 CPU 标识符
    std::cout << "CPU 标识符: " << getProcessorIdentifier() << std::endl;

    // 获取并打印当前 CPU 使用率
    std::cout << "当前 CPU 使用率: " << std::fixed << std::setprecision(2)
              << getCurrentCpuUsage() << "%" << std::endl;

    // 获取并打印当前 CPU 温度
    std::cout << "当前 CPU 温度: " << std::fixed << std::setprecision(2)
              << getCurrentCpuTemperature() << "°C" << std::endl;

    // 获取并打印 CPU 频率
    std::cout << "CPU 频率: " << std::fixed << std::setprecision(2)
              << getProcessorFrequency() << " GHz" << std::endl;

    // 获取并打印物理包和 CPU 的数量
    std::cout << "物理包数量: " << getNumberOfPhysicalPackages() << std::endl;
    std::cout << "逻辑 CPU 数量: " << getNumberOfPhysicalCPUs() << std::endl;

    // 获取并打印缓存大小
    CacheSizes cacheSizes = getCacheSizes();
    std::cout << "缓存大小:" << std::endl;
    std::cout << "  L1 数据缓存: " << cacheSizes.l1d / 1024 << " KB" << std::endl;
    std::cout << "  L1 指令缓存: " << cacheSizes.l1i / 1024 << " KB" << std::endl;
    std::cout << "  L2 缓存: " << cacheSizes.l2 / 1024 << " KB" << std::endl;
    std::cout << "  L3 缓存: " << cacheSizes.l3 / (1024 * 1024) << " MB" << std::endl;
}

int main() {
    printCPUInfo();
    return 0;
}
```

此示例演示了如何使用 CPU 信息模块提供的所有函数来打印系统 CPU 信息的全面概述。

## 最佳实践和注意事项

1. **错误处理**: 此模块中的函数没有明确的错误处理机制。在生产环境中，您可能需要为信息可能不可用的情况添加错误检查和处理。

2. **性能影响**: 某些函数（尤其是 `getCurrentCpuUsage()` 和 `getCurrentCpuTemperature()`）如果频繁调用，可能会有小的性能影响。如果需要经常访问这些值，请考虑缓存结果。

3. **权限**: 根据操作系统的不同，某些函数可能需要提升的权限才能访问特定的系统信息。确保您的应用程序具有必要的权限。

4. **跨平台考虑**: 这些函数的实现可能在不同操作系统之间有所不同。确保在所有目标平台上进行测试。

5. **更新频率**: CPU 使用率和温度可能会迅速变化。如果您正在监控这些值，请考虑根据应用程序的需求决定更新频率。

6. **线程安全**: 文档没有指定这些函数的线程安全性。如果您在多线程环境中使用它们，请考虑添加同步机制。

7. **缓存大小解释**: 在解释缓存大小时，请记住它们以字节为单位返回。您可能希望将它们转换为更可读的单位（KB 或 MB），如示例中所示。

8. **CPU频率变化**: 现代 CPU 通常具有可变频率（例如，由于节能特性或涡轮增压）。`getProcessorFrequency()` 函数可能返回瞬时值或平均值，随着时间的推移可能会有所不同。
