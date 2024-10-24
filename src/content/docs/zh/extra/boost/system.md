---
title: Boost-System模块封装
description: atom::extra::boost 命名空间中 Boost 系统包装器的详细文档，包括用于简化 C++ 中错误处理的自定义 Error、Exception 和 Result 类。  
---

## 目录

1. [Error 类](#error-类)
2. [Exception 类](#exception-类)
3. [Result 类](#result-类)
4. [makeResult 函数](#makeresult-函数)

## Error 类

`Error` 类封装了一个 Boost 系统错误代码。

### 方法

- `Error()`: 默认构造函数。
- `Error(const ::boost::system::error_code& error_code)`: 从 Boost 错误代码构造 Error。
- `Error(int error_value, const ::boost::system::error_category& error_category)`: 从错误值和类别构造 Error。
- `value()`: 返回错误值。
- `category()`: 返回错误类别。
- `message()`: 返回错误消息。
- `operator bool()`: 如果有错误则返回 true。
- `toBoostErrorCode()`: 转换回 Boost 错误代码。
- `operator==` 和 `operator!=`: 比较运算符。

### 使用示例

```cpp
atom::extra::boost::Error error(boost::system::errc::not_supported, boost::system::generic_category());
if (error) {
    std::cout << "Error: " << error.message() << std::endl;
}
```

## Exception 类

`Exception` 类从 `std::system_error` 派生，并封装了一个 `Error` 对象。

### 方法

- `Exception(const Error& error)`: 从 Error 构造 Exception。
- `error()`: 返回封装的 Error 对象。

### 使用示例

```cpp
try {
    throw atom::extra::boost::Exception(atom::extra::boost::Error(boost::system::errc::not_supported, boost::system::generic_category()));
} catch (const atom::extra::boost::Exception& e) {
    std::cout << "Caught exception: " << e.what() << std::endl;
}
```

## Result 类

`Result` 类是一个模板类，表示成功的值或错误。它有两种特化：一种用于非空类型，另一种用于 void。

### 方法（非空特化）

- `Result(T value)`: 使用成功值构造 Result。
- `Result(Error error)`: 使用错误构造 Result。
- `hasValue()`: 如果 Result 包含值则返回 true。
- `value()`: 返回包含的值，如果有错误则抛出 Exception。
- `error()`: 如果有错误则返回 Error 对象。
- `operator bool()`: 如果 Result 包含值则返回 true。
- `valueOr(U&& default_value)`: 返回值或在有错误时返回默认值。
- `map(F&& func)`: 如果存在，应用函数到包含的值。
- `andThen(F&& func)`: 链接返回 Result 的函数。

### 方法（void 特化）

- `Result()`: 成功的 void Result 的默认构造函数。
- `Result(Error error)`: 使用错误构造 void Result。
- `hasValue()`: 如果 Result 表示成功则返回 true。
- `error()`: 如果有错误则返回 Error 对象。
- `operator bool()`: 如果 Result 表示成功则返回 true。

### 使用示例

```cpp
atom::extra::boost::Result<int> divide(int a, int b) {
    if (b == 0) {
        return atom::extra::boost::Result<int>(atom::extra::boost::Error(boost::system::errc::invalid_argument, boost::system::generic_category()));
    }
    return atom::extra::boost::Result<int>(a / b);
}

auto result = divide(10, 2);
if (result) {
    std::cout << "Result: " << result.value() << std::endl;
} else {
    std::cout << "Error: " << result.error().message() << std::endl;
}

// 使用 map 和 andThen
auto result2 = divide(10, 2)
    .map([](int value) { return value * 2; })
    .andThen([](int value) { return divide(value, 0); });

if (!result2) {
    std::cout << "Error in chain: " << result2.error().message() << std::endl;
}
```

## makeResult 函数

`makeResult` 函数是一个实用工具，用于将函数调用封装在 Result 对象中，捕获任何异常并将其转换为错误。

### 使用示例

```cpp
auto result = atom::extra::boost::makeResult([]() {
    // 可能抛出异常的操作
    if (/* some condition */) {
        throw atom::extra::boost::Exception(atom::extra::boost::Error(boost::system::errc::not_supported, boost::system::generic_category()));
    }
    return 42;
});

if (result) {
    std::cout << "Result: " << result.value() << std::endl;
} else {
    std::cout << "Error: " << result.error().message() << std::endl;
}
```
