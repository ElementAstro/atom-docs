---
title: Template Traits and Utilities
description: Comprehensive for the template_traits.hpp file, including utilities for analyzing and manipulating template types, checking specializations, extracting template parameters, and function traits in C++20.
---

## 目录

1. [介绍](#介绍)
2. [基本模板特性](#基本模板特性)
3. [模板特化检查](#模板特化检查)
4. [模板参数提取](#模板参数提取)
5. [函数特性](#函数特性)
6. [约束级别检查](#约束级别检查)
7. [基模板检查](#基模板检查)
8. [使用示例](#使用示例)

## 介绍

`template_traits.hpp` 文件提供了一套全面的模板元编程工具，适用于 C++20。这些工具帮助分析和操作模板类型，检查特化，提取模板参数等。

## 基本模板特性

### `is_template`

检查一个类型是否是模板实例化。

```cpp
template <typename T>
inline constexpr bool is_template_v = is_template<T>::value;
```

### `template_traits`

提取模板参数和模板实例化的完整名称。

```cpp
template <typename T>
struct template_traits;
```

### `args_type_of`

用于提取模板参数元组的别名。

```cpp
template <typename T>
using args_type_of = typename template_traits<T>::args_type;
```

### `template_arity_v`

表示模板参数数量的常量。

```cpp
template <typename T>
inline constexpr std::size_t template_arity_v = std::tuple_size_v<args_type_of<T>>;
```

## 模板特化检查

### `is_specialization_of`

检查一个类型是否是给定模板的特化。

```cpp
template <template <typename...> typename Template, typename T>
inline constexpr bool is_specialization_of_v = is_specialization_of<Template, T>::value;
```

### `is_partial_specialization_of`

检查一个类型是否是给定模板的部分特化。

```cpp
template <typename T, template <typename, typename...> typename Template>
inline constexpr bool is_partial_specialization_of_v = is_partial_specialization_of<T, Template>::value;
```

## 模板参数提取

### `template_arg_t`

提取第 N 个模板参数类型。

```cpp
template <std::size_t N, typename T>
using template_arg_t = std::tuple_element_t<N, args_type_of<T>>;
```

### `count_occurrences_v`

计算类型在参数包中出现的次数。

```cpp
template <typename T, typename... Args>
constexpr std::size_t count_occurrences_v = (0 + ... + std::is_same_v<T, Args>);
```

### `find_first_index_v`

找到类型在参数包中第一次出现的索引。

```cpp
template <typename T, typename... Args>
constexpr std::size_t find_first_index_v = /* implementation */;
```

## 函数特性

### `extract_function_traits`

提取函数的返回类型和参数类型。

```cpp
template <typename T>
struct extract_function_traits;
```

### `extract_function_return_type_t`

提取函数返回类型的别名。

```cpp
template <typename T>
using extract_function_return_type_t = typename extract_function_traits<T>::return_type;
```

### `extract_function_parameters_t`

提取函数参数类型的别名。

```cpp
template <typename T>
using extract_function_parameters_t = typename extract_function_traits<T>::parameter_types;
```

## 约束级别检查

### `constraint_level`

不同约束级别的枚举类。

```cpp
enum class constraint_level { none, nontrivial, nothrow, trivial };
```

### 约束检查函数

```cpp
template <typename T>
consteval bool has_copyability(constraint_level level);

template <typename T>
consteval bool has_relocatability(constraint_level level);

template <typename T>
consteval bool has_destructibility(constraint_level level);
```

## 基模板检查

### `is_base_of_template_v`

检查一个类型是否派生自模板基类。

```cpp
template <template <typename...> class Base, typename Derived>
inline constexpr bool is_base_of_template_v = is_base_of_template_impl<Base, Derived>::value;
```

### `is_base_of_any_template_v`

检查一个类型是否派生自给定的任意模板基类。

```cpp
template <typename Derived, template <typename...> class... Bases>
inline constexpr bool is_base_of_any_template_v = is_base_of_any_template<Derived, Bases...>::value;
```

## 使用示例

以下是一些示例，演示如何使用这些模板特性和工具：

```cpp
#include "template_traits.hpp"
#include <iostream>
#include <vector>
#include <list>

template <typename T>
struct MyTemplate {};

class MyClass : public MyTemplate<int> {};

int main() {
    // 基本模板检查
    std::cout << "vector<int> 是模板吗? " << atom::meta::is_template_v<std::vector<int>> << std::endl;
    std::cout << "int 是模板吗? " << atom::meta::is_template_v<int> << std::endl;

    // 模板特化检查
    std::cout << "vector<int> 是 vector 的特化吗? "
              << atom::meta::is_specialization_of_v<std::vector, std::vector<int>> << std::endl;

    // 模板参数提取
    using VectorInt = std::vector<int>;
    std::cout << "vector<int> 的第一个模板参数: "
              << typeid(atom::meta::template_arg_t<0, VectorInt>).name() << std::endl;

    // 函数特性
    using FuncType = int(double, char);
    std::cout << "FuncType 的返回类型: "
              << typeid(atom::meta::extract_function_return_type_t<FuncType>).name() << std::endl;

    // 约束级别检查
    std::cout << "int 是平凡可复制的吗? "
              << atom::meta::has_copyability<int>(atom::meta::constraint_level::trivial) << std::endl;

    // 基模板检查
    std::cout << "MyClass 是否派生自 MyTemplate? "
              << atom::meta::is_base_of_template_v<MyTemplate, MyClass> << std::endl;

    return 0;
}
```
