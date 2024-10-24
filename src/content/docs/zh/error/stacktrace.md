---
title: 堆栈追踪
description: StackTrace 类在 atom::error 命名空间中的详细文档，包括构造函数、公共方法、平台特定成员和在 C++ 中捕获和表示堆栈跟踪的使用示例。
---

## 类定义

```cpp
namespace atom::error {
class StackTrace {
public:
    StackTrace();
    [[nodiscard]] auto toString() const -> std::string;

private:
    void capture();

    // 平台特定成员
    #ifdef _WIN32
        std::vector<void*> frames_;
    #elif defined(__APPLE__) || defined(__linux__)
        std::unique_ptr<char*, decltype(&free)> symbols_;
        std::vector<void*> frames_;
        int num_frames_ = 0;
    #endif
};
}
```

## 构造函数

### `StackTrace()`

`StackTrace` 类的默认构造函数。当创建 `StackTrace` 对象时，它会自动捕获当前的堆栈跟踪。

## 公共方法

### `[[nodiscard]] auto toString() const -> std::string`

返回捕获的堆栈跟踪的字符串表示。此方法标记为 `[[nodiscard]]`，表示返回值不应被忽略。

#### 返回值

- 一个包含格式化堆栈跟踪信息的 `std::string`。

## 私有方法

### `void capture()`

此私有方法负责捕获当前的堆栈跟踪。实现因操作系统而异：

- 在 Windows 上，它填充 `frames_` 向量以包含堆栈帧指针。
- 在 macOS 和 Linux 上，它捕获原始帧指针及其对应的符号。

## 平台特定成员

### Windows

- `std::vector<void*> frames_`：存储堆栈帧指针。

### macOS 和 Linux

- `std::unique_ptr<char*, decltype(&free)> symbols_`：存储堆栈符号。
- `std::vector<void*> frames_`：存储原始堆栈帧指针。
- `int num_frames_`：跟踪捕获的堆栈帧数量。

## 使用示例

以下是如何使用 `StackTrace` 类的示例：

```cpp
#include "stacktrace.hpp"
#include <iostream>

void function_c() {
    atom::error::StackTrace stackTrace;
    std::cout << "堆栈跟踪:\n" << stackTrace.toString() << std::endl;
}

void function_b() {
    function_c();
}

void function_a() {
    function_b();
}

int main() {
    try {
        function_a();
    } catch (const std::exception& e) {
        std::cerr << "捕获到异常: " << e.what() << std::endl;
    }
    return 0;
}
```

在此示例中：

1. 我们创建了一系列函数调用：`main()` -> `function_a()` -> `function_b()` -> `function_c()`。
2. 在 `function_c()` 中，我们创建一个 `StackTrace` 对象并打印其字符串表示。
3. 输出将显示调用堆栈，包括文件名、行号和函数名（如果可用）。

## 注意事项

- `StackTrace` 类使用条件编译（`#ifdef`，`#elif`）为 Windows、macOS 和 Linux 提供不同的实现。
- 在 macOS 和 Linux 上，它使用一个智能指针（`std::unique_ptr`）与自定义删除器来管理符号的内存。
- 该类设计为易于使用，堆栈跟踪的捕获在对象创建时自动发生。

## 最佳实践

- 在异常处理程序或错误日志记录场景中使用 `StackTrace` 对象，以提供详细的调试上下文。
- 请记住，捕获堆栈跟踪可能会影响性能，因此在性能关键的代码部分谨慎使用。
- `toString()` 方法标记为 `[[nodiscard]]`，以鼓励检查其返回值，这在错误处理和日志记录场景中特别重要。
