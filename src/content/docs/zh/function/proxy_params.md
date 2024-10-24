---
title: 加强版函数参数
description: 详细文档，介绍 proxy_params.hpp 文件中的 FunctionParams 类，包括构造函数、成员函数和使用示例，用于在 C++ 中使用 std::any 封装函数参数。  
---

## 目录

1. [类概述](#类概述)
2. [构造函数](#构造函数)
3. [成员函数](#成员函数)
4. [使用示例](#使用示例)

## 类概述

`FunctionParams` 类在 `proxy_params.hpp` 头文件中定义。它使用 C++20 特性和标准模板库（STL）。

```cpp
class FunctionParams {
    // ... (类实现)
};
```

## 构造函数

### 单值构造函数

```cpp
explicit FunctionParams(const std::any& value);
```

使用单个 `std::any` 值构造 `FunctionParams`。

### 范围构造函数

```cpp
template <std::ranges::input_range Range>
    requires std::same_as<std::ranges::range_value_t<Range>, std::any>
explicit constexpr FunctionParams(const Range& range);
```

从任何 `std::any` 值的范围构造 `FunctionParams`。

### 初始化列表构造函数

```cpp
constexpr FunctionParams(std::initializer_list<std::any> ilist);
```

从 `std::any` 值的初始化列表构造 `FunctionParams`。

## 成员函数

### operator[]

```cpp
[[nodiscard]] auto operator[](std::size_t t_i) const -> const std::any&;
```

访问给定索引的参数。如果索引超出范围，则抛出 `std::out_of_range`。

### begin 和 end

```cpp
[[nodiscard]] auto begin() const noexcept;
[[nodiscard]] auto end() const noexcept;
```

分别返回参数的开始和结束迭代器。

### front

```cpp
[[nodiscard]] auto front() const noexcept -> const std::any&;
```

返回第一个参数。

### size

```cpp
[[nodiscard]] auto size() const noexcept -> std::size_t;
```

返回参数的数量。

### empty

```cpp
[[nodiscard]] auto empty() const noexcept -> bool;
```

检查是否没有参数。

### toVector

```cpp
[[nodiscard]] auto toVector() const -> std::vector<std::any>;
```

将参数转换为 `std::any` 的向量。

### get

```cpp
template <typename T>
[[nodiscard]] auto get(std::size_t index) const -> std::optional<T>;
```

以特定类型获取给定索引的参数。如果转换失败，则返回 `std::nullopt`。

### slice

```cpp
[[nodiscard]] auto slice(std::size_t start, std::size_t end) const -> FunctionParams;
```

从给定的起始索引到结束索引切片参数。如果切片范围无效，则抛出 `std::out_of_range`。

### filter

```cpp
template <typename Predicate>
[[nodiscard]] auto filter(Predicate pred) const -> FunctionParams;
```

使用谓词过滤参数。

### set

```cpp
void set(std::size_t index, const std::any& value);
```

将给定索引的参数设置为新值。如果索引超出范围，则抛出 `std::out_of_range`。

## 使用示例

以下是一些演示如何使用 `FunctionParams` 类的示例：

```cpp
#include "proxy_params.hpp"
#include <iostream>
#include <string>

int main() {
    // 使用单个值创建 FunctionParams
    FunctionParams single_param(std::any(42));
    std::cout << std::any_cast<int>(single_param[0]) << std::endl; // 输出：42

    // 使用多个值创建 FunctionParams
    FunctionParams multi_params({std::any(10), std::any("Hello"), std::any(3.14)});

    // 访问参数
    std::cout << std::any_cast<int>(multi_params[0]) << std::endl; // 输出：10
    std::cout << std::any_cast<const char*>(multi_params[1]) << std::endl; // 输出：Hello
    std::cout << std::any_cast<double>(multi_params[2]) << std::endl; // 输出：3.14

    // 使用 get() 方法
    auto int_value = multi_params.get<int>(0);
    if (int_value) {
        std::cout << "第一个参数作为 int: " << *int_value << std::endl; // 输出：第一个参数作为 int: 10
    }

    // 使用 slice() 方法
    auto sliced_params = multi_params.slice(1, 3);
    std::cout << "切片参数大小: " << sliced_params.size() << std::endl; // 输出：切片参数大小: 2

    // 使用 filter() 方法
    auto filtered_params = multi_params.filter([](const std::any& param) {
        return param.type() == typeid(int);
    });
    std::cout << "过滤后的参数大小: " << filtered_params.size() << std::endl; // 输出：过滤后的参数大小: 1

    // 使用 set() 方法
    multi_params.set(1, std::any(std::string("World")));
    std::cout << std::any_cast<std::string>(multi_params[1]) << std::endl; // 输出：World

    return 0;
}
```
