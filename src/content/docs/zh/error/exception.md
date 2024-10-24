---
title: 自定义异常
description: Exception 类在 atom::error 命名空间中的详细文档，包括构造函数、公共方法、静态方法和在 C++ 中增强异常处理的使用示例。
---

## 类定义

```cpp
namespace atom::error {
class Exception : public std::exception {
public:
    template <typename... Args>
    Exception(const char *file, int line, const char *func, Args &&...args);

    template <typename... Args>
    static void rethrowNested(Args &&...args);

    auto what() const ATOM_NOEXCEPT -> const char * override;
    auto getFile() const -> std::string;
    auto getLine() const -> int;
    auto getFunction() const -> std::string;
    auto getMessage() const -> std::string;
    auto getThreadId() const -> std::thread::id;

private:
    std::string file_;
    int line_;
    std::string func_;
    std::string message_;
    mutable std::string full_message_;
    std::thread::id thread_id_;
    StackTrace stack_trace_;
};
}
```

## 构造函数

### `Exception(const char *file, int line, const char *func, Args &&...args)`

构造一个 `Exception` 对象，并提供有关异常发生位置和原因的详细信息。

#### 参数

- `file`：异常发生的文件。
- `line`：异常发生的行号。
- `func`：异常发生的函数。
- `args`：提供异常上下文的附加参数（可变模板）。

## 静态方法

### `static void rethrowNested(Args &&...args)`

将当前异常重新抛出为一个新的 `Exception` 对象中的嵌套异常。

#### 用法

此方法通常在捕获块中使用，以在重新抛出现有异常之前添加更多上下文。

## 公共方法

### `auto what() const ATOM_NOEXCEPT -> const char *`

返回描述异常的 C 风格字符串。此方法重写了 `std::exception::what()` 方法。

### `auto getFile() const -> std::string`

返回异常发生的文件。

### `auto getLine() const -> int`

返回异常发生的行号。

### `auto getFunction() const -> std::string`

返回异常发生的函数。

### `auto getMessage() const -> std::string`

返回与异常关联的消息。

### `auto getThreadId() const -> std::thread::id`

返回异常发生的线程 ID。

## 使用示例

### 基本用法

```cpp
#include "exception.hpp"
#include <iostream>

void riskyFunction() {
    throw atom::error::Exception(__FILE__, __LINE__, __FUNCTION__, "发生错误");
}

int main() {
    try {
        riskyFunction();
    } catch (const atom::error::Exception& e) {
        std::cerr << "捕获到异常: " << e.what() << std::endl;
        std::cerr << "文件: " << e.getFile() << std::endl;
        std::cerr << "行: " << e.getLine() << std::endl;
        std::cerr << "函数: " << e.getFunction() << std::endl;
        std::cerr << "线程 ID: " << e.getThreadId() << std::endl;
    }
    return 0;
}
```

### 使用 rethrowNested

```cpp
#include "exception.hpp"
#include <iostream>

void innerFunction() {
    throw std::runtime_error("内部错误");
}

void outerFunction() {
    try {
        innerFunction();
    } catch (...) {
        atom::error::Exception::rethrowNested(__FILE__, __LINE__, __FUNCTION__, "外部错误");
    }
}

int main() {
    try {
        outerFunction();
    } catch (const atom::error::Exception& e) {
        std::cerr << "捕获到异常: " << e.what() << std::endl;
        try {
            std::rethrow_if_nested(e);
        } catch (const std::runtime_error& nested) {
            std::cerr << "嵌套异常: " << nested.what() << std::endl;
        }
    }
    return 0;
}
```

## 最佳实践

1. **使用宏**：考虑为常见异常抛出模式定义宏，以减少样板代码：

   ```cpp
   #define THROW_EXCEPTION(...) \
       throw atom::error::Exception(__FILE__, __LINE__, __FUNCTION__, __VA_ARGS__)
   ```

2. **按引用捕获**：始终通过常量引用捕获异常，以避免切片：

   ```cpp
   try {
       // 风险代码
   } catch (const atom::error::Exception& e) {
       // 处理异常
   }
   ```

3. **利用堆栈跟踪**：`Exception` 类包含一个 `StackTrace` 对象。利用此对象进行详细调试：

   ```cpp
   catch (const atom::error::Exception& e) {
       std::cerr << "异常堆栈跟踪:\n" << e.getStackTrace() << std::endl;
   }
   ```

4. **线程安全**：注意 `Exception` 类捕获线程 ID。这在调试多线程应用程序时非常有用。

5. **嵌套异常**：在希望在重新抛出异常时添加上下文时，使用 `rethrowNested`。
