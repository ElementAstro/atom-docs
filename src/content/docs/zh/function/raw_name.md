---
title: 原始名称提取
description: 详细文档，介绍 atom::meta 命名空间中的 raw_name.hpp 文件，包括在编译时提取类型、值和枚举成员的原始名称的函数，以及使用示例和编译器支持细节。 
---

## 目录

1. [介绍](#介绍)
2. [函数概述](#函数概述)
3. [使用示例](#使用示例)
4. [编译器支持](#编译器支持)
5. [高级特性](#高级特性)

## 介绍

`raw_name.hpp` 文件提供了一组模板函数，允许您在编译时提取类型、值和枚举成员的原始名称。这些函数对于反射类功能和调试目的特别有用。

## 函数概述

### `raw_name_of<T>()`

```cpp
template <typename T>
constexpr auto raw_name_of();
```

提取类型 `T` 的原始名称。

### `raw_name_of_template<T>()`

```cpp
template <typename T>
constexpr auto raw_name_of_template();
```

提取模板类型 `T` 的原始名称。

### `raw_name_of<Value>()`

```cpp
template <auto Value>
constexpr auto raw_name_of();
```

提取编译时值 `Value` 的原始名称。

### `raw_name_of_enum<Value>()`

```cpp
template <auto Value>
constexpr auto raw_name_of_enum();
```

提取枚举值 `Value` 的原始名称。

### `raw_name_of_member<T>()`（C++20 及以上）

```cpp
template <Wrapper T>
constexpr auto raw_name_of_member();
```

提取包装在 `Wrapper` 结构中的成员的原始名称。

## 使用示例

以下是一些演示如何使用 `raw_name_of` 函数的示例：

### 示例 1：基本用法

```cpp
#include "raw_name.hpp"
#include <iostream>

struct MyStruct {};
enum class MyEnum { Value1, Value2 };

int main() {
    std::cout << "类型名称: " << atom::meta::raw_name_of<int>() << std::endl;
    std::cout << "结构名称: " << atom::meta::raw_name_of<MyStruct>() << std::endl;
    std::cout << "枚举名称: " << atom::meta::raw_name_of<MyEnum>() << std::endl;
    std::cout << "枚举值名称: " << atom::meta::raw_name_of_enum<MyEnum::Value1>() << std::endl;

    return 0;
}
```

预期输出：

```
类型名称: int
结构名称: MyStruct
枚举名称: MyEnum
枚举值名称: Value1
```

### 示例 2：模板类型

```cpp
#include "raw_name.hpp"
#include <iostream>
#include <vector>

template<typename T>
struct TemplateStruct {};

int main() {
    std::cout << "向量名称: " << atom::meta::raw_name_of_template<std::vector<int>>() << std::endl;
    std::cout << "模板结构名称: " << atom::meta::raw_name_of_template<TemplateStruct<double>>() << std::endl;

    return 0;
}
```

预期输出（可能会根据编译器略有不同）：

```
向量名称: vector<int>
模板结构名称: TemplateStruct<double>
```

### 示例 3：编译时值

```cpp
#include "raw_name.hpp"
#include <iostream>

constexpr int CompileTimeValue = 42;

int main() {
    std::cout << "编译时值名称: " << atom::meta::raw_name_of<CompileTimeValue>() << std::endl;

    return 0;
}
```

预期输出：

```
编译时值名称: CompileTimeValue
```

### 示例 4：成员名称（C++20 及以上）

```cpp
#include "raw_name.hpp"
#include <iostream>

struct MyStruct {
    int member;
};

int main() {
    constexpr auto wrapper = atom::meta::Wrapper{&MyStruct::member};
    std::cout << "成员名称: " << atom::meta::raw_name_of_member<wrapper>() << std::endl;

    return 0;
}
```

预期输出：

```
成员名称: member
```

## 编译器支持

`raw_name.hpp` 文件包含条件编译指令，以支持不同的编译器：

- GCC 和 Clang 使用 `__GNUC__` 和 `__clang__` 宏进行支持。
- MSVC 使用 `_MSC_VER` 宏进行支持。

如果检测到不支持的编译器，将会失败静态断言，并显示消息“Unsupported compiler”。

## 高级特性

### `args_type_of`

```cpp
template <typename T>
using args_type_of = args_type_of<T>;
```
