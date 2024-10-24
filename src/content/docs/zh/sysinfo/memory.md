---
title: 内存信息模块文档
description: 命名空间中内存信息模块的详细文档，包括用于检索和管理系统内存详细信息的结构、函数、使用示例和最佳实践。
---

## 目录

1. [介绍](#introduction)
2. [结构](#structures)
3. [函数](#functions)
4. [使用示例](#usage-examples)
5. [最佳实践和注意事项](#best-practices-and-considerations)

## 介绍

内存信息模块是 `atom::system` 命名空间的一部分，提供了一组函数和结构来检索系统内存的各种详细信息，包括物理内存、虚拟内存和交换内存。此模块对于系统监控、性能分析和内存管理任务非常有用。

## 结构

### MemoryInfo

```cpp
struct MemoryInfo {
    struct MemorySlot {
        std::string capacity;
        std::string clockSpeed;
        std::string type;

        MemorySlot() = default;
        MemorySlot(std::string capacity, std::string clockSpeed, std::string type);
    } ATOM_ALIGNAS(128);

    std::vector<MemorySlot> slots;
    unsigned long long virtualMemoryMax;
    unsigned long long virtualMemoryUsed;
    unsigned long long swapMemoryTotal;
    unsigned long long swapMemoryUsed;
} ATOM_ALIGNAS(64);
```

该结构体保存有关系统内存的全面信息，包括物理内存插槽、虚拟内存和交换内存的详细信息。

## 函数

### 1. getMemoryUsage

```cpp
auto getMemoryUsage() -> float;
```

检索当前内存使用百分比。

- **返回值**: 一个浮点数，表示内存使用百分比。

### 2. getTotalMemorySize

```cpp
auto getTotalMemorySize() -> unsigned long long;
```

检索总物理内存大小。

- **返回值**: 一个无符号长整型，表示总内存大小（以字节为单位）。

### 3. getAvailableMemorySize

```cpp
auto getAvailableMemorySize() -> unsigned long long;
```

检索可用物理内存大小。

- **返回值**: 一个无符号长整型，表示可用内存大小（以字节为单位）。

### 4. getPhysicalMemoryInfo

```cpp
auto getPhysicalMemoryInfo() -> MemoryInfo::MemorySlot;
```

检索物理内存插槽的信息。

- **返回值**: 一个 `MemoryInfo::MemorySlot` 结构，包含有关内存插槽的信息。

### 5. getVirtualMemoryMax

```cpp
auto getVirtualMemoryMax() -> unsigned long long;
```

检索最大虚拟内存大小。

- **返回值**: 一个无符号长整型，表示最大虚拟内存大小（以字节为单位）。

### 6. getVirtualMemoryUsed

```cpp
auto getVirtualMemoryUsed() -> unsigned long long;
```

检索当前使用的虚拟内存量。

- **返回值**: 一个无符号长整型，表示已使用的虚拟内存大小（以字节为单位）。

### 7. getSwapMemoryTotal

```cpp
auto getSwapMemoryTotal() -> unsigned long long;
```

检索总交换内存大小。

- **返回值**: 一个无符号长整型，表示总交换内存大小（以字节为单位）。

### 8. getSwapMemoryUsed

```cpp
auto getSwapMemoryUsed() -> unsigned long long;
```

检索当前使用的交换内存量。

- **返回值**: 一个无符号长整型，表示已使用的交换内存大小（以字节为单位）。

### 9. getCommittedMemory

```cpp
auto getCommittedMemory() -> size_t;
```

检索已提交的内存量。

- **返回值**: 一个 `size_t`，表示已提交的内存大小（以字节为单位）。

### 10. getUncommittedMemory

```cpp
auto getUncommittedMemory() -> size_t;
```

检索未提交的内存量。

- **返回值**: 一个 `size_t`，表示未提交的内存大小（以字节为单位）。

## 使用示例

以下是一个综合示例，演示如何使用内存信息模块：

```cpp
#include "memory.hpp"
#include <iostream>
#include <iomanip>

void printMemoryInfo() {
    using namespace atom::system;

    // 获取并打印内存使用百分比
    std::cout << "内存使用情况: " << std::fixed << std::setprecision(2)
              << getMemoryUsage() << "%\n";

    // 获取并打印总内存和可用内存
    auto totalMemory = getTotalMemorySize();
    auto availableMemory = getAvailableMemorySize();
    std::cout << "总内存: " << totalMemory / (1024 * 1024) << " MB\n";
    std::cout << "可用内存: " << availableMemory / (1024 * 1024) << " MB\n";

    // 获取并打印物理内存插槽信息
    auto memorySlot = getPhysicalMemoryInfo();
    std::cout << "物理内存插槽:\n";
    std::cout << "  容量: " << memorySlot.capacity << "\n";
    std::cout << "  时钟速度: " << memorySlot.clockSpeed << "\n";
    std::cout << "  类型: " << memorySlot.type << "\n";

    // 获取并打印虚拟内存信息
    auto virtualMemMax = getVirtualMemoryMax();
    auto virtualMemUsed = getVirtualMemoryUsed();
    std::cout << "虚拟内存:\n";
    std::cout << "  最大: " << virtualMemMax / (1024 * 1024) << " MB\n";
    std::cout << "  已使用: " << virtualMemUsed / (1024 * 1024) << " MB\n";

    // 获取并打印交换内存信息
    auto swapMemTotal = getSwapMemoryTotal();
    auto swapMemUsed = getSwapMemoryUsed();
    std::cout << "交换内存:\n";
    std::cout << "  总计: " << swapMemTotal / (1024 * 1024) << " MB\n";
    std::cout << "  已使用: " << swapMemUsed / (1024 * 1024) << " MB\n";

    // 获取并打印已提交和未提交的内存
    auto committedMem = getCommittedMemory();
    auto uncommittedMem = getUncommittedMemory();
    std::cout << "已提交内存: " << committedMem / (1024 * 1024) << " MB\n";
    std::cout << "未提交内存: " << uncommittedMem / (1024 * 1024) << " MB\n";
}

int main() {
    printMemoryInfo();
    return 0;
}
```

此示例演示了如何使用内存信息模块提供的所有函数来打印系统内存信息的全面概述。

## 最佳实践和注意事项

1. **错误处理**: 此模块中的函数没有明确的错误处理机制。在生产环境中，您可能需要为信息可能不可用或无法访问的情况添加错误检查和处理。

2. **性能影响**: 某些函数如果频繁调用，可能会对性能产生影响。考虑缓存结果，特别是对于不经常变化的值。

3. **权限**: 根据操作系统的不同，某些函数可能需要提升的权限才能访问特定的系统信息。确保您的应用程序具有必要的权限。

4. **跨平台考虑**: 这些函数的实现可能在不同操作系统之间有所不同。确保在所有目标平台上进行测试，并处理平台特定的变体。

5. **单位转换**: 内存大小通常以字节为单位返回。考虑在向用户显示时转换为更易读的单位（MB、GB），如示例所示。

6. **内存压力**: 要注意高内存使用或可用内存低可能会影响系统性能。考虑在应用程序中根据这些值实现警告或操作。

7. **线程安全**: 文档没有指定这些函数的线程安全性。如果您在多线程环境中使用它们，请考虑添加同步机制。

8. **虚拟内存与物理内存**: 理解虚拟内存和物理内存之间的区别，以便正确解释这些值。高虚拟内存使用并不一定表示存在问题，如果物理内存使用合理。

9. **交换内存使用**: 高交换内存使用可能表明系统处于内存压力下。监控此值以检测潜在问题。
