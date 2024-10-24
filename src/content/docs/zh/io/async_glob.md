---
title: AsyncGlob
description: 详细文档，介绍 atom::io 命名空间中的 AsyncGlob 类，包括构造函数、公共方法、使用示例、最佳实践和高级主题，用于异步文件和目录模式匹配。  
---

## 目录

1. [介绍](#介绍)
2. [类概述](#类概述)
3. [构造函数](#构造函数)
4. [公共方法](#公共方法)
5. [使用示例](#使用示例)
6. [最佳实践](#最佳实践)
7. [高级主题](#高级主题)

## 介绍

`AsyncGlob` 类是 `atom::io` 命名空间的一部分，提供异步文件和目录模式匹配功能，类似于 Python 的 glob 模块。它允许高效地遍历文件系统并使用 ASIO 库进行异步操作。

## 类概述

`AsyncGlob` 类旨在异步执行 glob 操作，这在搜索大型目录结构或处理慢速文件系统时特别有用。

## 构造函数

```cpp
AsyncGlob(asio::io_context& io_context);
```

使用提供的 ASIO I/O 上下文创建一个 `AsyncGlob` 对象。

- `io_context`：引用 `asio::io_context` 对象，用于管理异步操作。

## 公共方法

### glob

```cpp
void glob(const std::string& pathname,
          const std::function<void(std::vector<fs::path>)>& callback,
          bool recursive = false,
          bool dironly = false);
```

执行异步 glob 操作。

- **参数：**
  - `pathname`：要匹配的文件和目录名称模式。
  - `callback`：一个函数，在 glob 操作结果可用时调用。
  - `recursive`：如果为 true，glob 操作将递归搜索子目录。
  - `dironly`：如果为 true，仅匹配目录。

## 使用示例

### 基本用法

```cpp
#include "async_glob.hpp"
#include <asio.hpp>
#include <iostream>

int main() {
    asio::io_context io_context;
    atom::io::AsyncGlob glob(io_context);

    glob.glob("*.txt", [](const std::vector<fs::path>& results) {
        for (const auto& path : results) {
            std::cout << "找到: " << path << std::endl;
        }
    });

    io_context.run();
    return 0;
}
```

此示例搜索当前目录中的所有 `.txt` 文件并打印其路径。

### 递归搜索

```cpp
glob.glob("**/*.cpp", [](const std::vector<fs::path>& results) {
    std::cout << "找到 " << results.size() << " 个 C++ 文件:" << std::endl;
    for (const auto& path : results) {
        std::cout << path << std::endl;
    }
}, true);  // 将 recursive 设置为 true
```

此示例递归搜索当前目录及其子目录中的所有 `.cpp` 文件。

### 仅目录搜索

```cpp
glob.glob("*", [](const std::vector<fs::path>& results) {
    std::cout << "找到目录:" << std::endl;
    for (const auto& path : results) {
        std::cout << path << std::endl;
    }
}, false, true);  // 将 dironly 设置为 true
```

此示例搜索当前目录中的所有目录。

### 复杂模式匹配

```cpp
glob.glob("src/{lib,bin}/*.{h,cpp}", [](const std::vector<fs::path>& results) {
    std::cout << "找到源文件:" << std::endl;
    for (const auto& path : results) {
        std::cout << path << std::endl;
    }
});
```

此示例演示了一个更复杂的模式，匹配 `src/lib` 和 `src/bin` 目录中的 `.h` 和 `.cpp` 文件。

## 最佳实践

1. **错误处理**：始终在回调函数中实现适当的错误处理，以处理在 glob 操作期间可能出现的问题。

2. **性能考虑**：对于大型目录结构，谨慎使用递归选项，因为这可能会影响性能。

3. **模式设计**：仔细设计您的 glob 模式，以最小化不必要的文件系统遍历。

4. **回调执行**：请记住，回调函数将异步执行。确保在回调中访问的任何共享资源都经过适当的同步。

5. **I/O 上下文管理**：确保 `asio::io_context` 在 glob 操作期间运行。您可能需要使用 `io_context.run()` 或 `asio::io_context::work` 使其保持活动状态。

## 高级主题

### 自定义过滤

尽管 `AsyncGlob` 类提供了强大的模式匹配能力，您可能需要在回调函数中实现额外的过滤逻辑以满足更复杂的需求。

```cpp
glob.glob("*.log", [](const std::vector<fs::path>& results) {
    for (const auto& path : results) {
        if (fs::file_size(path) > 1024 * 1024) {  // 检查文件是否大于 1MB
            std::cout << "大日志文件: " << path << std::endl;
        }
    }
});
```

### 与其他异步操作的集成

`AsyncGlob` 类可以轻松与应用程序中的其他异步操作集成：

```cpp
asio::io_context io_context;
atom::io::AsyncGlob glob(io_context);

// 启动一个定时器
asio::steady_timer timer(io_context, asio::chrono::seconds(5));
timer.async_wait([&glob](const asio::error_code& ec) {
    if (!ec) {
        glob.glob("*.dat", [](const std::vector<fs::path>& results) {
            // 处理结果
        });
    }
});

io_context.run();
```
