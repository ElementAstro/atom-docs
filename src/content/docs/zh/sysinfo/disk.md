---
title: 磁盘
description: 磁盘信息模块的详细文档，包括用于检索磁盘使用情况、驱动器型号、可用驱动器和文件系统类型的函数，以及使用示例和最佳实践。
---

## 目录

1. [介绍](#introduction)
2. [函数](#functions)
3. [使用示例](#usage-examples)
4. [最佳实践和注意事项](#best-practices-and-considerations)

## 介绍

磁盘信息模块是 `atom::system` 命名空间的一部分，提供了一组函数来检索系统存储设备及其使用情况的各种详细信息。此模块对于系统监控、存储管理和与磁盘相关的操作非常有用。

## 函数

### 1. getDiskUsage

```cpp
[[nodiscard]] auto getDiskUsage() -> std::vector<std::pair<std::string, float>>;
```

检索所有可用磁盘的磁盘使用信息。

- **返回值**: 一个包含对的向量，每对包含：
  - 一个字符串，表示磁盘名称（例如，"/dev/sda1"）。
  - 一个浮点数，表示磁盘的使用百分比。

### 2. getDriveModel

```cpp
[[nodiscard]] auto getDriveModel(const std::string& drivePath) -> std::string;
```

检索指定驱动器的型号。

- **参数**:
  - `drivePath`: 一个字符串，表示驱动器的路径（例如，"/dev/sda" 或 "C:\\" 在 Windows 上）。
- **返回值**: 一个字符串，包含驱动器的型号名称。

### 3. getStorageDeviceModels

```cpp
[[nodiscard]] auto getStorageDeviceModels() -> std::vector<std::pair<std::string, std::string>>;
```

检索所有连接的存储设备的型号。

- **返回值**: 一个包含对的向量，每对包含：
  - 一个字符串，表示存储设备名称（例如，"/dev/sda" 或 "C:\\" 在 Windows 上）。
  - 一个字符串，表示存储设备的型号名称。

### 4. getAvailableDrives

```cpp
[[nodiscard]] auto getAvailableDrives() -> std::vector<std::string>;
```

检索系统上所有可用驱动器的列表。

- **返回值**: 一个字符串的向量，每个字符串表示一个可用驱动器。

### 5. calculateDiskUsagePercentage

```cpp
[[nodiscard]] auto calculateDiskUsagePercentage(unsigned long totalSpace, unsigned long freeSpace) -> double;
```

计算磁盘使用百分比。

- **参数**:
  - `totalSpace`: 磁盘的总空间（以字节为单位）。
  - `freeSpace`: 磁盘的空闲（可用）空间（以字节为单位）。
- **返回值**: 一个双精度浮点数，表示磁盘使用百分比（介于 0.0 和 100.0 之间）。

### 6. getFileSystemType

```cpp
[[nodiscard]] auto getFileSystemType(const std::string& path) -> std::string;
```

检索指定路径的文件系统类型。

- **参数**:
  - `path`: 一个字符串，表示磁盘或挂载点的路径（例如，"/dev/sda1" 或 "C:\\"）。
- **返回值**: 一个字符串，包含文件系统类型（例如，"ext4"、"NTFS"、"APFS"）。

## 使用示例

以下是一个综合示例，演示如何使用磁盘信息模块：

```cpp
#include "disk.hpp"
#include <iostream>
#include <iomanip>

void printDiskInfo() {
    using namespace atom::system;

    // 获取并打印所有可用磁盘的使用情况
    std::cout << "磁盘使用情况:\n";
    for (const auto& [disk, usage] : getDiskUsage()) {
        std::cout << "  " << disk << ": " << std::fixed << std::setprecision(2) << usage << "%\n";
    }
    std::cout << "\n";

    // 获取并打印所有存储设备的型号
    std::cout << "存储设备型号:\n";
    for (const auto& [device, model] : getStorageDeviceModels()) {
        std::cout << "  " << device << ": " << model << "\n";
    }
    std::cout << "\n";

    // 获取并打印可用驱动器
    std::cout << "可用驱动器:\n";
    for (const auto& drive : getAvailableDrives()) {
        std::cout << "  " << drive << "\n";
    }
    std::cout << "\n";

    // 计算并打印特定驱动器的磁盘使用百分比
    const std::string exampleDrive = "/dev/sda1";  // 将此更改为您系统上的实际驱动器
    unsigned long totalSpace = 1000000000;  // 示例总空间（1 GB）
    unsigned long freeSpace = 250000000;    // 示例空闲空间（250 MB）
    double usagePercentage = calculateDiskUsagePercentage(totalSpace, freeSpace);
    std::cout << "磁盘使用百分比 (" << exampleDrive << "): "
              << std::fixed << std::setprecision(2) << usagePercentage << "%\n";

    // 获取并打印特定路径的文件系统类型
    const std::string examplePath = "/";  // 将此更改为您系统上的相关路径
    std::cout << "文件系统类型 (" << examplePath << "): "
              << getFileSystemType(examplePath) << "\n";
}

int main() {
    printDiskInfo();
    return 0;
}
```

此示例演示了如何使用磁盘信息模块提供的所有函数来打印系统磁盘信息的全面概述。

## 最佳实践和注意事项

1. **错误处理**: 此模块中的函数没有明确的错误处理机制。在生产环境中，您可能需要为信息可能不可用或无法访问的情况添加错误检查和处理。

2. **性能影响**: 某些函数（尤其是 `getDiskUsage()` 和 `getStorageDeviceModels()`）如果频繁调用，可能会对性能产生影响，因为它们可能涉及 I/O 操作。如果需要经常访问这些结果，请考虑缓存。

3. **权限**: 根据操作系统的不同，某些函数可能需要提升的权限才能访问特定的系统信息。确保您的应用程序具有必要的权限。

4. **跨平台考虑**: 这些函数的实现可能在不同操作系统之间有所不同。确保在所有目标平台上进行测试，并处理平台特定的变体（例如，驱动器命名约定）。

5. **大磁盘大小**: 在使用 `calculateDiskUsagePercentage()` 时，要注意非常大磁盘大小可能导致的溢出。如果有必要，请考虑使用更大的整数类型。

6. **文件系统变化**: 文件系统信息可能会动态变化。如果您的应用程序依赖于此信息，请考虑多长时间需要刷新一次。

7. **线程安全**: 文档没有指定这些函数的线程安全性。如果您在多线程环境中使用它们，请考虑添加同步机制。

8. **路径处理**: 在处理文件路径时，请注意不同操作系统之间的路径格式差异。使用适当的路径操作库或函数以确保兼容性。

9. **可移动驱动器**: 请注意，可用驱动器的列表可能会因可移动驱动器的连接或断开而变化。您的应用程序应能够处理此类动态变化。

10. **性能指标**: 磁盘使用百分比本身可能无法完全反映磁盘性能。考虑结合其他指标，如每秒 I/O 操作（IOPS）或读写速度，以进行更全面的分析。
