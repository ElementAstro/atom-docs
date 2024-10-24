---
title: StorageMonitor 类文档
description: 详细文档，介绍 atom::system 命名空间中的 StorageMonitor 类，包括构造函数、成员函数和监控已挂载设备存储空间变化的使用示例。
---

## 概述

`StorageMonitor` 类是 `atom::system` 命名空间的一部分，旨在监控所有已挂载设备的存储空间变化。它提供了注册回调函数的功能，当存储空间变化发生时，这些回调函数会被触发。此外，它还可以列出所有已挂载的存储设备，并检查是否有新插入的媒体。

## 类定义

```cpp
namespace atom::system {
class StorageMonitor {
public:
    StorageMonitor() = default;
    ~StorageMonitor();

    void registerCallback(std::function<void(const std::string &)> callback);
    ATOM_NODISCARD auto startMonitoring() -> bool;
    void stopMonitoring();
    ATOM_NODISCARD auto isRunning() const -> bool;
    void triggerCallbacks(const std::string &path);
    ATOM_NODISCARD auto isNewMediaInserted(const std::string &path) -> bool;
    void listAllStorage();
    void listFiles(const std::string &path);

private:
    // 私有成员变量
};
}
```

## 构造函数和析构函数

### `StorageMonitor()`

默认构造函数。

### `~StorageMonitor()`

析构函数。

## 成员函数

### `void registerCallback(std::function<void(const std::string &)> callback)`

注册一个回调函数，当存储空间变化发生时触发。

- **参数:**
  - `callback`: 一个函数，接受一个 `const std::string&` 参数，表示发生变化的存储路径。

### `ATOM_NODISCARD auto startMonitoring() -> bool`

启动存储空间监控过程。

- **返回:** 如果监控成功启动，则返回 `true`，否则返回 `false`。

### `void stopMonitoring()`

停止存储空间监控过程。

### `ATOM_NODISCARD auto isRunning() const -> bool`

检查监控过程是否正在运行。

- **返回:** 如果监控处于活动状态，则返回 `true`，否则返回 `false`。

### `void triggerCallbacks(const std::string &path)`

触发特定存储路径的所有注册回调函数。

- **参数:**
  - `path`: 发生变化的存储设备的路径。

### `ATOM_NODISCARD auto isNewMediaInserted(const std::string &path) -> bool`

检查指定路径是否插入了新存储媒体。

- **参数:**
  - `path`: 要检查新媒体的路径。
- **返回:** 如果检测到新媒体，则返回 `true`，否则返回 `false`。

### `void listAllStorage()`

列出所有已挂载的存储设备。

### `void listFiles(const std::string &path)`

列出指定存储路径中的所有文件。

- **参数:**
  - `path`: 要列出文件的存储设备路径。

## 使用示例

### 示例 1：基本监控设置

```cpp
#include "storage.hpp"
#include <iostream>

void storageChangeCallback(const std::string& path) {
    std::cout << "检测到存储变化，路径: " << path << std::endl;
}

int main() {
    atom::system::StorageMonitor monitor;

    // 注册回调
    monitor.registerCallback(storageChangeCallback);

    // 开始监控
    if (monitor.startMonitoring()) {
        std::cout << "存储监控成功启动。" << std::endl;
    } else {
        std::cerr << "启动存储监控失败。" << std::endl;
        return 1;
    }

    // 保持程序运行
    while (true) {
        // 你的主程序逻辑
        std::this_thread::sleep_for(std::chrono::seconds(1));
    }

    return 0;
}
```

### 示例 2：检查新媒体

```cpp
#include "storage.hpp"
#include <iostream>

int main() {
    atom::system::StorageMonitor monitor;

    // 检查特定路径中的新媒体
    const std::string path = "/media/usb";
    if (monitor.isNewMediaInserted(path)) {
        std::cout << "在路径检测到新媒体: " << path << std::endl;
        monitor.listFiles(path);
    } else {
        std::cout << "在路径未检测到新媒体: " << path << std::endl;
    }

    return 0;
}
```

### 示例 3：列出所有存储和文件

```cpp
#include "storage.hpp"
#include <iostream>

int main() {
    atom::system::StorageMonitor monitor;

    std::cout << "列出所有已挂载的存储设备:" << std::endl;
    monitor.listAllStorage();

    std::cout << "\n列出根目录中的文件:" << std::endl;
    monitor.listFiles("/");

    return 0;
}
```

## 注意事项

- `StorageMonitor` 类使用平台特定的实现来监控存储变化。`monitorUdisk` 函数在 Windows 和非 Windows 系统中的定义不同。
- `ATOM_NODISCARD` 宏用于指示某些函数的返回值不应被丢弃。
- 该类设计为线程安全，使用互斥量保护共享数据结构。
- 监控过程异步运行，允许主程序在监控存储变化的同时继续执行。

## 参见

- [std::function 文档](https://en.cppreference.com/w/cpp/utility/functional/function)
- [std::mutex 文档](https://en.cppreference.com/w/cpp/thread/mutex)
- 存储监控的特定平台文档（例如，Windows API、Linux udev）
