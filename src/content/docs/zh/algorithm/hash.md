---
title: 哈希算法
description: FNV-1a 哈希单个值、向量、元组、数组和字符串的函数
---

## 概述

`hash.hpp` 文件提供了一系列哈希算法和实用函数，用于计算各种数据类型的哈希值。它包括对单个值、向量、元组和数组的哈希实现，以及对字符串的 FNV-1a 哈希实现。

## 命名空间

所有主要函数和概念都定义在 `atom::algorithm` 命名空间中。

```cpp
namespace atom::algorithm {
    // ...
}
```

## 概念

### Hashable

```cpp
template <typename T>
concept Hashable = requires(T a) {
    { std::hash<T>{}(a) } -> std::convertible_to<std::size_t>;
};
```

`Hashable` 概念定义了可以被哈希的类型。如果一个类型支持通过 `std::hash` 进行哈希，并且结果可以转换为 `std::size_t`，则该类型被视为 `Hashable`。

## 函数

### computeHash（单个值）

```cpp
template <Hashable T>
auto computeHash(const T& value) -> std::size_t;
```

计算单个 `Hashable` 值的哈希值。

- **参数：**
  - `value`：要哈希的值。
- **返回值：** 输入值的哈希值，类型为 `std::size_t`。
- **使用示例：**

  ```cpp
  int num = 42;
  std::size_t hash_value = atom::algorithm::computeHash(num);
  ```

### computeHash（向量）

```cpp
template <Hashable T>
auto computeHash(const std::vector<T>& values) -> std::size_t;
```

计算 `Hashable` 值的向量的哈希值。

- **参数：**
  - `values`：要哈希的值的向量。
- **返回值：** 值的向量的哈希值，类型为 `std::size_t`。
- **使用示例：**

  ```cpp
  std::vector<int> numbers = {1, 2, 3, 4, 5};
  std::size_t hash_value = atom::algorithm::computeHash(numbers);
  ```

### computeHash（元组）

```cpp
template <Hashable... Ts>
auto computeHash(const std::tuple<Ts...>& tuple) -> std::size_t;
```

计算 `Hashable` 值的元组的哈希值。

- **参数：**
  - `tuple`：要哈希的值的元组。
- **返回值：** 元组的哈希值，类型为 `std::size_t`。
- **使用示例：**

  ```cpp
  auto my_tuple = std::make_tuple(1, "hello", 3.14);
  std::size_t hash_value = atom::algorithm::computeHash(my_tuple);
  ```

### computeHash（数组）

```cpp
template <Hashable T, std::size_t N>
auto computeHash(const std::array<T, N>& array) -> std::size_t;
```

计算 `Hashable` 值的数组的哈希值。

- **参数：**
  - `array`：要哈希的值的数组。
- **返回值：** 数组的哈希值，类型为 `std::size_t`。
- **使用示例：**

  ```cpp
  std::array<int, 5> numbers = {1, 2, 3, 4, 5};
  std::size_t hash_value = atom::algorithm::computeHash(numbers);
  ```

## 全局函数

### hash（字符串的 FNV-1a）

```cpp
constexpr auto hash(const char* str, unsigned int basis = 2166136261U) -> unsigned int;
```

使用 FNV-1a 算法计算 null 终止字符串的哈希值。

- **参数：**
  - `str`：指向要哈希的 null 终止字符串的指针。
  - `basis`：哈希的初始基值（默认值：2166136261U）。
- **返回值：** 字符串的哈希值，类型为 `unsigned int`。
- **使用示例：**

  ```cpp
  const char* my_string = "Hello, World!";
  unsigned int hash_value = hash(my_string);
  ```

### operator""\_hash（用户定义字面量）

```cpp
constexpr auto operator""_hash(const char* str, std::size_t size) -> unsigned int;
```

用于计算字符串字面量哈希值的用户定义字面量。

- **参数：**
  - `str`：指向要哈希的字符串字面量的指针。
  - `size`：字符串字面量的大小（在实现中未使用）。
- **返回值：** 字符串字面量的哈希值，类型为 `unsigned int`。
- **使用示例：**

  ```cpp
  auto hash_value = "example"_hash;
  ```

## 最佳实践

1. 使用 `Hashable` 概念确保你正在处理的类型可以被正确哈希。
2. 在哈希多个值时，优先使用适当的 `computeHash` 重载（向量、元组或数组），而不是手动组合哈希。
3. 对于字符串哈希，使用全局 `hash` 函数或 `_hash` 用户定义字面量进行字符串字面量的编译时哈希。
4. 在安全敏感的应用程序中使用哈希值时要谨慎，因为这些实现并不具备密码学安全性。

## 注意事项

- `atom::algorithm` 命名空间中的哈希函数使用 XOR 和位移组合哈希值，这对于通用哈希是有效的。
- FNV-1a 算法用于字符串哈希，为字符串提供了良好的速度和哈希分布平衡。
- `_hash` 用户定义字面量允许对字符串字面量进行编译时哈希，这在开关语句或其他编译时应用中非常有用。

## 示例：组合不同的哈希类型

以下示例演示了如何一起使用各种哈希函数：

```cpp
#include "hash.hpp"
#include <iostream>
#include <vector>
#include <array>
#include <tuple>

int main() {
    // 单个值
    int single_value = 42;
    std::cout << "单个值哈希: " << atom::algorithm::computeHash(single_value) << std::endl;

    // 向量
    std::vector<int> vec = {1, 2, 3, 4, 5};
    std::cout << "向量哈希: " << atom::algorithm::computeHash(vec) << std::endl;

    // 数组
    std::array<double, 3> arr = {1.1, 2.2, 3.3};
    std::cout << "数组哈希: " << atom::algorithm::computeHash(arr) << std::endl;

    // 元组
    auto tup = std::make_tuple(10, "hello", 3.14);
    std::cout << "元组哈希: " << atom::algorithm::computeHash(tup) << std::endl;

    // 字符串（使用全局哈希函数）
    const char* str = "Hello, World!";
    std::cout << "字符串哈希: " << hash(str) << std::endl;

    // 字符串字面量（使用用户定义字面量）
    auto literal_hash = "example"_hash;
    std::cout << "字符串字面量哈希: " << literal_hash << std::endl;

    return 0;
}
```
