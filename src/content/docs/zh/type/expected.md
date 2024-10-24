---
title: Expected
description: atom::type::expected 类的全面文档，包括类定义、主要特性、使用示例和处理可能失败的操作而不使用异常的最佳实践。
---

## 目录

1. [概述](#概述)
2. [类定义](#类定义)
3. [主要特性](#主要特性)
4. [使用示例](#使用示例)
5. [最佳实践](#最佳实践)

## 概述

`expected` 类模板允许您表示类型 `T` 的有效值或类型 `E` 的错误。这在使用异常可能不合适或成本过高的情况下进行错误处理时特别有用。

## 类定义

### Error<E>

```cpp
template <typename E>
class Error {
public:
    explicit Error(E error);
    template <typename T> requires std::is_same_v<E, std::string>
    explicit Error(const T* error);
    [[nodiscard]] auto error() const -> const E&;
    auto operator==(const Error& other) const -> bool;
};
```

### unexpected<E>

```cpp
template <typename E>
class unexpected {
public:
    explicit unexpected(const E& error);
    explicit unexpected(E&& error);
    [[nodiscard]] auto error() const -> const E&;
};
```

### expected<T, E>

```cpp
template <typename T, typename E = std::string>
class expected {
public:
    expected(const T& value);
    expected(T&& value);
    expected(const Error<E>& error);
    expected(Error<E>&& error);
    expected(const unexpected<E>& unex);

    [[nodiscard]] auto has_value() const -> bool;
    auto value() -> T&;
    [[nodiscard]] auto value() const -> const T&;
    auto error() -> Error<E>&;
    [[nodiscard]] auto error() const -> const Error<E>&;
    template <typename U>
    auto value_or(U&& default_value) const -> T;

    template <typename Func>
    auto map(Func&& func) const -> expected<decltype(func(std::declval<T>())), E>;
    template <typename Func>
    auto and_then(Func&& func) const -> decltype(func(std::declval<T>()));
    template <typename Func>
    auto transform_error(Func&& func) const -> expected<T, decltype(func(std::declval<E>()))>;
    template <typename Func>
    auto or_else(Func&& func) const -> expected<T, E>;

    friend auto operator==(const expected& lhs, const expected& rhs) -> bool;
    friend auto operator!=(const expected& lhs, const expected& rhs) -> bool;
};
```

### expected<void, E>

`expected` 的 `void` 类型特化，表示可能失败但不返回值的操作。

## 主要特性

1. **值和错误处理**：存储类型 `T` 的值或类型 `E` 的错误。
2. **类型安全**：提供对包含的值或错误的类型安全访问。
3. **单子操作**：支持如 `map`、`and_then`、`transform_error` 和 `or_else` 等操作，用于组合操作。
4. **默认值处理**：`value_or` 方法提供在出现错误时的默认值。
5. **相等比较**：支持相等和不相等比较。

## 使用示例

以下示例演示了如何使用 `expected` 类：

```cpp
#include "expected.hpp"
#include <iostream>
#include <string>

// 可能失败的函数
atom::type::expected<int, std::string> divide(int a, int b) {
    if (b == 0) {
        return atom::type::make_unexpected("除以零");
    }
    return atom::type::make_expected(a / b);
}

// 示例用法
int main() {
    // 基本用法
    auto result = divide(10, 2);
    if (result.has_value()) {
        std::cout << "结果: " << result.value() << std::endl;
    } else {
        std::cout << "错误: " << result.error().error() << std::endl;
    }

    // 使用默认值
    auto result_with_zero = divide(5, 0);
    int safe_result = result_with_zero.value_or(-1);
    std::cout << "安全结果: " << safe_result << std::endl;

    // 使用 map
    auto squared_result = divide(8, 2).map([](int x) { return x * x; });
    if (squared_result.has_value()) {
        std::cout << "平方结果: " << squared_result.value() << std::endl;
    }

    // 使用 and_then
    auto complex_operation = divide(10, 2).and_then([](int x) {
        return divide(x, 2);
    });
    if (complex_operation.has_value()) {
        std::cout << "复杂操作结果: " << complex_operation.value() << std::endl;
    }

    // 使用 transform_error
    auto transformed_error = divide(5, 0).transform_error([](const std::string& error) {
        return "转换后: " + error;
    });
    if (!transformed_error.has_value()) {
        std::cout << "转换后的错误: " << transformed_error.error().error() << std::endl;
    }

    // 使用 or_else
    auto handled_error = divide(5, 0).or_else([](const std::string& error) {
        std::cout << "处理错误: " << error << std::endl;
        return atom::type::make_expected(0);
    });
    std::cout << "处理结果: " << handled_error.value() << std::endl;

    return 0;
}
```

此示例演示了：

1. 使用 `expected` 处理可能失败的操作。
2. 使用 `value_or` 提供默认值。
3. 使用 `map` 转换包含的值。
4. 使用 `and_then` 链接可能失败的操作。
5. 使用 `transform_error` 修改错误消息。
6. 使用 `or_else` 处理错误并提供替代结果。

## 最佳实践

1. **使用 `make_expected` 和 `make_unexpected`**：这些工厂函数帮助创建具有正确类型推断的 `expected` 和 `unexpected` 对象。

2. **优先使用 `and_then` 进行链式调用**：在链式调用可能失败的操作时，优先使用 `and_then` 而不是直接访问值，以保持适当的错误处理。

3. **使用 `transform_error` 添加上下文**：使用 `transform_error` 在错误传播时添加上下文或转换错误消息。

4. **利用 `value_or` 提供安全默认值**：当默认值可以接受时，使用 `value_or` 优雅地处理错误，而无需显式检查。

5. **考虑使用 `expected<void, E>` 进行无返回值的操作**：对于可能失败但不返回值的函数，使用 `expected` 的 `void` 特化。

6. **保持错误类型一致性**：尽量在整个代码库中使用一致的错误类型，以使错误处理更加统一。
