---
title: 函数萃取
description: atom::meta 命名空间中 func_traits.hpp 文件的全面文档，包括用于对函数类型、成员函数、lambda 表达式和函数对象进行编译时反射的工具。  
---

## 目录

1. [关键组件](#关键组件)
2. [FunctionTraits](#functiontraits)
3. [实用变量模板](#实用变量模板)
4. [调试工具](#调试工具)
5. [函数管道](#函数管道)
6. [方法检测](#方法检测)
7. [使用示例](#使用示例)
8. [注意事项和考虑因素](#注意事项和考虑因素)

## 关键组件

### FunctionTraits

该库的核心是 `FunctionTraits` 结构模板，它提供有关函数类型的详细信息。

```cpp
template <typename Func>
struct FunctionTraits;
```

### FunctionTraitsBase

一个基类，提供所有函数特性特化的公共功能。

```cpp
template <typename Return, typename... Args>
struct FunctionTraitsBase;
```

## FunctionTraits

`FunctionTraits` 为各种函数类型特化，包括：

- 普通函数
- 成员函数（const、volatile、lvalue 引用、rvalue 引用）
- noexcept 函数
- 可变参数函数
- Lambda 表达式和函数对象

它提供以下信息：

- `return_type`: 函数的返回类型
- `argument_types`: 包含参数类型的元组类型
- `arity`: 参数的数量
- `argument_t<N>`: 第 N 个参数的类型
- 各种函数属性的布尔标志（例如，`is_member_function`、`is_const_member_function` 等）
- `full_name`: 包含函数类型的去修饰完整名称的字符串

## 实用变量模板

该库提供了方便的变量模板，以便轻松访问函数属性：

```cpp
template <typename Func>
inline constexpr bool is_member_function_v;

template <typename Func>
inline constexpr bool is_const_member_function_v;

template <typename Func>
inline constexpr bool is_volatile_member_function_v;

template <typename Func>
inline constexpr bool is_lvalue_reference_member_function_v;

template <typename Func>
inline constexpr bool is_rvalue_reference_member_function_v;

template <typename Func>
inline constexpr bool is_noexcept_v;

template <typename Func>
inline constexpr bool is_variadic_v;
```

## 调试工具

当定义了 `ENABLE_DEBUG` 时，该库提供调试工具：

```cpp
template <typename Tuple>
void print_tuple_types();

template <typename F>
void print_function_info(const std::string &name, F &&);
```

这些函数可以在开发过程中用于打印函数类型的详细信息。

## 函数管道

该库包括一个 `function_pipe` 类，允许使用管道操作符（`|`）进行函数组合：

```cpp
template <typename Func>
class function_pipe;
```

## 方法检测

该库提供模板和宏，用于检测类中方法的存在：

```cpp
template <typename, typename T, typename = void>
struct has_method;

#define DEFINE_HAS_METHOD(MethodName)

template <typename, typename T, typename = void>
struct has_static_method;

#define DEFINE_HAS_STATIC_METHOD(MethodName)

template <typename, typename T, typename = void>
struct has_const_method;

#define DEFINE_HAS_CONST_METHOD(MethodName)
```

## 使用示例

### 基本函数特性

```cpp
#include "func_traits.hpp"
#include <iostream>

int add(int a, int b) { return a + b; }

int main() {
    using traits = atom::meta::FunctionTraits<decltype(add)>;

    std::cout << "Return type: " << typeid(traits::return_type).name() << std::endl;
    std::cout << "Number of arguments: " << traits::arity << std::endl;
    std::cout << "First argument type: " << typeid(traits::argument_t<0>).name() << std::endl;

    return 0;
}
```

### 成员函数检测

```cpp
#include "func_traits.hpp"
#include <iostream>

class MyClass {
public:
    void myMethod(int) {}
    static void myStaticMethod(double) {}
    void myConstMethod() const {}
};

DEFINE_HAS_METHOD(myMethod);
DEFINE_HAS_STATIC_METHOD(myStaticMethod);
DEFINE_HAS_CONST_METHOD(myConstMethod);

int main() {
    std::cout << "Has myMethod: " << has_myMethod<MyClass, void, int>::value << std::endl;
    std::cout << "Has myStaticMethod: " << has_static_myStaticMethod<MyClass, void, double>::value << std::endl;
    std::cout << "Has myConstMethod: " << has_const_myConstMethod<MyClass, void>::value << std::endl;

    return 0;
}
```

### 函数管道

```cpp
#include "func_traits.hpp"
#include <iostream>

int main() {
    auto add = [](int a, int b) { return a + b; };
    auto multiply = [](int a, int b) { return a * b; };

    atom::meta::function_pipe add_pipe(add);
    atom::meta::function_pipe multiply_pipe(multiply);

    int result = 5 | add_pipe(3) | multiply_pipe(2);
    std::cout << "Result: " << result << std::endl;  // 输出: 16

    return 0;
}
```

## 注意事项和考虑因素

1. 本库要求使用 C++20 或更高版本，因为使用了概念和其他现代 C++ 特性。
2. `FunctionTraits` 结构提供关于函数类型的全面信息，包括具有各种限定符（const、volatile、&、&&、noexcept）的成员函数。
3. 调试工具（`print_tuple_types` 和 `print_function_info`）仅在定义了 `ENABLE_DEBUG` 时可用。
4. `function_pipe` 类允许使用管道操作符进行函数组合，这在创建可读的函数链时非常有用。
5. 方法检测宏（`DEFINE_HAS_METHOD`、`DEFINE_HAS_STATIC_METHOD` 和 `DEFINE_HAS_CONST_METHOD`）提供了一种方便的方式来检查类中方法的存在。
6. 使用本库时，应注意复杂函数类型可能导致的编译时开销。
7. 本库使用模板元编程技术，可能会影响大型项目的编译时间。
