---
title: 文件夹堆栈（仿Pushd）
description: 详细文档，介绍 DirectoryStack 类，包括异步和同步目录管理操作、构造函数、方法和全面的使用示例。  
---

## 目录

1. [介绍](#介绍)
2. [类概述](#类概述)
3. [构造函数](#构造函数)
4. [公共方法](#公共方法)
5. [完整使用示例](#完整使用示例)
6. [最佳实践](#最佳实践)
7. [故障排除](#故障排除)
8. [结论](#结论)

## 介绍

`DirectoryStack` 类是一个强大的工具，用于管理目录路径的栈，并支持使用 Asio 的异步操作。它提供了推送、弹出和对目录栈执行各种操作的功能。

## 类概述

```cpp
class DirectoryStack {
public:
    explicit DirectoryStack(asio::io_context& io_context);
    ~DirectoryStack();

    // ... (其他方法声明)
};
```

`DirectoryStack` 类设计具有以下特性：

- 使用 Asio 的异步操作
- 支持移动语义
- 禁止复制操作以防止意外复制

## 构造函数

```cpp
explicit DirectoryStack(asio::io_context& io_context);
```

创建一个新的 `DirectoryStack` 实例。

**参数：**

- `io_context`：用于异步操作的 Asio `io_context`

**示例：**

```cpp
asio::io_context io_context;
DirectoryStack dirStack(io_context);
```

## 公共方法

### asyncPushd

```cpp
void asyncPushd(const std::filesystem::path& new_dir,
                const std::function<void(const std::error_code&)>& handler);
```

将当前目录推送到栈中，并异步切换到指定目录。

**参数：**

- `new_dir`：要切换到的目录
- `handler`：操作完成时调用的完成处理程序

**示例：**

```cpp
dirStack.asyncPushd("/path/to/new/dir", [](const std::error_code& ec) {
    if (!ec) {
        std::cout << "成功切换目录" << std::endl;
    } else {
        std::cerr << "错误: " << ec.message() << std::endl;
    }
});
```

### asyncPopd

```cpp
void asyncPopd(const std::function<void(const std::error_code&)>& handler);
```

从栈中弹出顶部目录并异步返回。

**参数：**

- `handler`：操作完成时调用的完成处理程序

**示例：**

```cpp
dirStack.asyncPopd([](const std::error_code& ec) {
    if (!ec) {
        std::cout << "成功返回到上一个目录" << std::endl;
    } else {
        std::cerr << "错误: " << ec.message() << std::endl;
    }
});
```

### peek

```cpp
[[nodiscard]] auto peek() const -> std::filesystem::path;
```

查看栈顶目录而不进行切换。

**返回：** 栈顶目录

**示例：**

```cpp
std::filesystem::path topDir = dirStack.peek();
std::cout << "栈顶目录: " << topDir << std::endl;
```

### dirs

```cpp
[[nodiscard]] auto dirs() const -> std::vector<std::filesystem::path>;
```

显示当前的目录栈。

**返回：** 栈中的目录路径向量

**示例：**

```cpp
std::vector<std::filesystem::path> allDirs = dirStack.dirs();
for (const auto& dir : allDirs) {
    std::cout << dir << std::endl;
}
```

### clear

```cpp
void clear();
```

清空目录栈。

**示例：**

```cpp
dirStack.clear();
std::cout << "目录栈已清空" << std::endl;
```

### swap

```cpp
void swap(size_t index1, size_t index2);
```

交换栈中两个目录的顺序，给定它们的索引。

**参数：**

- `index1`：第一个索引
- `index2`：第二个索引

**示例：**

```cpp
dirStack.swap(1, 2);
std::cout << "交换了索引 1 和 2 的目录" << std::endl;
```

### remove

```cpp
void remove(size_t index);
```

从栈中移除指定索引的目录。

**参数：**

- `index`：要移除的目录的索引

**示例：**

```cpp
dirStack.remove(1);
std::cout << "移除了索引 1 的目录" << std::endl;
```

### asyncGotoIndex

```cpp
void asyncGotoIndex(size_t index,
                    const std::function<void(const std::error_code&)>& handler);
```

异步切换到栈中指定索引的目录。

**参数：**

- `index`：要切换到的目录的索引
- `handler`：操作完成时调用的完成处理程序

**示例：**

```cpp
dirStack.asyncGotoIndex(2, [](const std::error_code& ec) {
    if (!ec) {
        std::cout << "切换到索引 2 的目录" << std::endl;
    } else {
        std::cerr << "错误: " << ec.message() << std::endl;
    }
});
```

### asyncSaveStackToFile

```cpp
void asyncSaveStackToFile(const std::string& filename,
                          const std::function<void(const std::error_code&)>& handler);
```

异步将目录栈保存到文件中。

**参数：**

- `filename`：要保存栈的文件名
- `handler`：操作完成时调用的完成处理程序

**示例：**

```cpp
dirStack.asyncSaveStackToFile("dir_stack.txt", [](const std::error_code& ec) {
    if (!ec) {
        std::cout << "栈成功保存到文件" << std::endl;
    } else {
        std::cerr << "保存栈时出错: " << ec.message() << std::endl;
    }
});
```

### asyncLoadStackFromFile

```cpp
void asyncLoadStackFromFile(const std::string& filename,
                            const std::function<void(const std::error_code&)>& handler);
```

异步从文件加载目录栈。

**参数：**

- `filename`：要加载栈的文件名
- `handler`：操作完成时调用的完成处理程序

**示例：**

```cpp
dirStack.asyncLoadStackFromFile("dir_stack.txt", [](const std::error_code& ec) {
    if (!ec) {
        std::cout << "栈成功从文件加载" << std::endl;
    } else {
        std::cerr << "加载栈时出错: " << ec.message() << std::endl;
    }
});
```

## 完整使用示例

以下是一个更全面的示例，演示了各种 `DirectoryStack` 方法的用法：

```cpp
#include <iostream>
#include <asio.hpp>
#include "DirectoryStack.h"

int main() {
    asio::io_context io_context;
    DirectoryStack dirStack(io_context);

    // 推送新目录
    dirStack.asyncPushd("/path/to/project", [&](const std::error_code& ec) {
        if (!ec) {
            std::cout << "成功切换到项目目录" << std::endl;

            // 推送另一个目录
            dirStack.asyncPushd("src", [&](const std::error_code& ec) {
                if (!ec) {
                    std::cout << "成功切换到 src 目录" << std::endl;

                    // 显示当前栈
                    auto dirs = dirStack.dirs();
                    std::cout << "当前栈:" << std::endl;
                    for (const auto& dir : dirs) {
                        std::cout << "  " << dir << std::endl;
                    }

                    // 弹出返回上一个目录
                    dirStack.asyncPopd([&](const std::error_code& ec) {
                        if (!ec) {
                            std::cout << "返回到项目目录" << std::endl;

                            // 将栈保存到文件
                            dirStack.asyncSaveStackToFile("dir_stack.txt", [](const std::error_code& ec) {
                                if (!ec) {
                                    std::cout << "栈成功保存到文件" << std::endl;
                                }
                            });
                        }
                    });
                }
            });
        }
    });

    io_context.run();
    return 0;
}
```

## 最佳实践

1. **错误处理**：始终检查完成处理程序中的错误代码，以确保操作成功。

2. **异步操作**：使用异步方法（`asyncPushd`、`asyncPopd` 等）以获得更好的性能，特别是在处理慢速文件系统或网络驱动器时。

3. **栈管理**：定期清理栈或移除不必要的目录，以防止过度使用内存。

4. **文件操作**：在从文件保存或加载栈时，确保文件权限正确，并处理潜在的 I/O 错误。

5. **线程安全**：`DirectoryStack` 类默认不是线程安全的。如果需要从多个线程使用它，请实现适当的同步机制。

## 故障排除

1. **操作超时**：如果异步操作花费过长时间，请确保文件系统响应正常，并考虑实现超时机制。

2. **权限错误**：在切换目录或保存/加载栈文件时，确保进程具有必要的权限。

3. **栈溢出**：如果推送的目录过多，请考虑实现最大栈大小，或定期清理不必要的条目。

4. **文件格式问题**：在从文件加载栈时，确保文件格式与 `asyncLoadStackFromFile` 方法所期望的格式匹配。
