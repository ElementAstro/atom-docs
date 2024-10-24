---
title: Args 类文档
description: Args 类的全面文档，包括关键特性、成员函数、运算符重载、宏定义和用于管理 C++ 中键值对的使用示例。
---

## 介绍

`Args` 是一个通用容器类，用于存储任意类型的键值对。它是 `ArgumentContainer` 的简化版本，提供更好的性能和更少的功能。

## 头文件

```cpp
#include "args.hpp"
```

## 类定义

```cpp
class Args {
    // ... (成员函数定义)
};
```

## 关键特性

1. 设置键值对
2. 检索键值对
3. 检查键是否存在
4. 移除键值对
5. 清空容器
6. 获取容器大小并检查是否为空

## 成员函数

### 设置键值对

#### `set`

```cpp
template <typename T>
void set(std::string_view key, T &&value);
```

设置单个键值对。

```cpp
template <typename T>
void set(std::span<const std::pair<std::string_view, T>> pairs);
```

批量设置多个键值对。

### 检索键值对

#### `get`

```cpp
template <typename T>
auto get(std::string_view key) const -> T;
```

获取指定键的值。如果键不存在，则抛出异常。

#### `getOr`

```cpp
template <typename T>
auto getOr(std::string_view key, T &&default_value) const -> T;
```

获取指定键的值，如果键不存在则返回默认值。

#### `getOptional`

```cpp
template <typename T>
auto getOptional(std::string_view key) const -> std::optional<T>;
```

获取指定键的值，如果键不存在则返回 `std::nullopt`。

#### 批量检索

```cpp
template <typename T>
auto get(std::span<const std::string_view> keys) const -> std::vector<std::optional<T>>;
```

批量检索多个键的值。

### 其他操作

#### `contains`

```cpp
auto contains(std::string_view key) const noexcept -> bool;
```

检查指定键是否存在。

#### `remove`

```cpp
void remove(std::string_view key);
```

移除指定的键值对。

#### `clear`

```cpp
void clear() noexcept;
```

清空整个容器。

#### `size`

```cpp
auto size() const noexcept -> size_t;
```

返回容器中键值对的数量。

#### `empty`

```cpp
auto empty() const noexcept -> bool;
```

检查容器是否为空。

### 运算符重载

```cpp
template <typename T>
auto operator[](std::string_view key) -> T &;

template <typename T>
auto operator[](std::string_view key) const -> const T &;

auto operator[](std::string_view key) -> std::any &;

auto operator[](std::string_view key) const -> const std::any &;
```

使用 `[]` 运算符访问键值对。

## 宏定义

为了方便，`Args` 类提供了以下宏定义：

```cpp
#define SET_ARGUMENT(container, name, value) container.set(#name, value)
#define GET_ARGUMENT(container, name, type) container.get<type>(#name).value_or(type{})
#define HAS_ARGUMENT(container, name) container.contains(#name)
#define REMOVE_ARGUMENT(container, name) container.remove(#name)
```

## 使用示例

### 基本用法

```cpp
#include "args.hpp"
#include <iostream>

int main() {
    Args args;

    // 设置键值对
    args.set("name", "Alice");
    args.set("age", 30);

    // 获取值
    std::string name = args.get<std::string>("name");
    int age = args.get<int>("age");

    std::cout << "Name: " << name << ", Age: " << age << std::endl;

    // 使用默认值
    int height = args.getOr("height", 170);
    std::cout << "Height: " << height << std::endl;

    // 检查键是否存在
    if (args.contains("name")) {
        std::cout << "Name exists in the container." << std::endl;
    }

    // 移除键值对
    args.remove("age");

    // 使用宏
    SET_ARGUMENT(args, score, 95.5);
    double score = GET_ARGUMENT(args, score, double);
    std::cout << "Score: " << score << std::endl;

    return 0;
}
```

### 批量操作

```cpp
#include "args.hpp"
#include <iostream>
#include <vector>

int main() {
    Args args;

    // 批量设置键值对
    std::vector<std::pair<std::string_view, int>> pairs = {
        {"a", 1}, {"b", 2}, {"c", 3}
    };
    args.set(pairs);

    // 批量获取值
    std::vector<std::string_view> keys = {"a", "b", "c", "d"};
    auto values = args.get<int>(keys);

    for (size_t i = 0; i < keys.size(); ++i) {
        if (values[i].has_value()) {
            std::cout << keys[i] << ": " << values[i].value() << std::endl;
        } else {
            std::cout << keys[i] << ": Not found" << std::endl;
        }
    }

    return 0;
}
```

### 使用运算符

```cpp
#include "args.hpp"
#include <iostream>

int main() {
    Args args;

    args["x"] = 10;
    args["y"] = "Hello";

    int x = args["x"].get<int>();
    std::string y = args["y"].get<std::string>();

    std::cout << "x: " << x << ", y: " << y << std::endl;

    return 0;
}
```

## 重要注意事项

1. 使用 `get` 方法时，如果键不存在，将抛出异常。考虑使用 `getOr` 或 `getOptional` 以避免异常。
2. 使用 `[]` 运算符时，如果键不存在，将创建一个新的键值对。
3. 使用模板方法时，请确保指定正确的类型，以避免运行时错误。
4. 批量操作可以提高效率，特别是在处理大量数据时。
