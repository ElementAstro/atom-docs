---
title: Indestructible
description: Indestructible 类模板的全面文档，包括类概述、构造函数、析构函数、复制和移动操作、访问方法、转换运算符、实用方法、使用示例和最佳实践。
---

## 目录

1. [介绍](#介绍)
2. [类概述](#类概述)
3. [构造函数](#构造函数)
4. [析构函数](#析构函数)
5. [复制和移动操作](#复制和移动操作)
6. [访问方法](#访问方法)
7. [转换运算符](#转换运算符)
8. [实用方法](#实用方法)
9. [使用示例](#使用示例)
10. [最佳实践和注意事项](#最佳实践和注意事项)

## 介绍

`Indestructible` 类模板旨在创建无法正常析构的对象。这在需要确保对象在程序整个生命周期内保持存在，或当您希望手动管理对象的销毁时非常有用。

## 类概述

```cpp
template <typename T>
struct Indestructible {
    // ... (类实现)
};
```

`Indestructible` 类模板封装了类型 `T` 的对象，并提供对其的受控访问，同时防止其自动销毁。

## 构造函数

```cpp
template <typename... Args>
    requires std::is_constructible_v<T, Args...>
constexpr explicit Indestructible(std::in_place_t /*unused*/, Args&&... args)
    : object(std::forward<Args>(args)...) {}
```

构造函数接受一个 `std::in_place_t` 作为第一个参数（未使用）以及任意数量的参数，这些参数会被转发以构造被封装的对象。

用法：

```cpp
Indestructible<MyClass> obj(std::in_place, arg1, arg2, arg3);
```

## 析构函数

```cpp
~Indestructible() {
    if constexpr (!std::is_trivially_destructible_v<T>) {
        object.~T();
    }
}
```

析构函数在对象销毁之前显式调用被封装对象的析构函数（如果它不是平凡可析构的）。

## 复制和移动操作

该类提供了复制和移动构造函数及赋值运算符。如果 `T` 是平凡可复制或可移动的，则这些操作将被默认；否则，它们将实现对被封装对象执行适当的复制或移动操作。

示例用法：

```cpp
Indestructible<MyClass> obj1(std::in_place, args...);
Indestructible<MyClass> obj2 = obj1;  // 复制构造
Indestructible<MyClass> obj3 = std::move(obj1);  // 移动构造
```

## 访问方法

```cpp
constexpr auto get() & -> T&
constexpr auto get() const& -> const T&
constexpr auto get() && -> T&&
constexpr const T&& get() const&&
```

这些方法提供对被封装对象的访问，支持左值和右值上下文。

用法：

```cpp
Indestructible<MyClass> obj(std::in_place, args...);
MyClass& ref = obj.get();
const MyClass& constRef = std::as_const(obj).get();
```

## 转换运算符

```cpp
constexpr explicit operator T&() &
constexpr explicit operator const T&() const&
constexpr explicit operator T&&() &&
constexpr explicit operator const T&&() const&&
```

这些运算符允许显式转换为被封装类型的引用。

用法：

```cpp
Indestructible<MyClass> obj(std::in_place, args...);
MyClass& ref = static_cast<MyClass&>(obj);
```

## 实用方法

### reset

```cpp
template <typename... Args>
    requires std::is_constructible_v<T, Args...>
constexpr void reset(Args&&... args)
```

此方法销毁当前对象并在其位置构造一个新对象。

用法：

```cpp
obj.reset(newArg1, newArg2);
```

### emplace

```cpp
template <typename... Args>
    requires std::is_constructible_v<T, Args...>
constexpr void emplace(Args&&... args)
```

此方法是 `reset` 的别名，提供在位置构造新对象的方式。

用法：

```cpp
obj.emplace(newArg1, newArg2);
```

## 使用示例

### 示例 1：基本用法

```cpp
#include "indestructible.hpp"
#include <iostream>

class MyClass {
public:
    MyClass(int value) : value_(value) {
        std::cout << "MyClass constructed with value " << value_ << std::endl;
    }
    ~MyClass() {
        std::cout << "MyClass destructed with value " << value_ << std::endl;
    }
    int getValue() const { return value_; }
private:
    int value_;
};

int main() {
    {
        Indestructible<MyClass> obj(std::in_place, 42);
        std::cout << "Value: " << obj->getValue() << std::endl;
    }
    std::cout << "End of scope" << std::endl;
    return 0;
}
```

输出：

```
MyClass constructed with value 42
Value: 42
End of scope
```

注意，`MyClass` 的析构函数在 `Indestructible` 对象超出作用域时不会被调用。

### 示例 2：使用 reset 和 emplace

```cpp
Indestructible<std::string> strObj(std::in_place, "Hello");
std::cout << strObj->c_str() << std::endl;  // 输出: Hello

strObj.reset("World");
std::cout << strObj->c_str() << std::endl;  // 输出: World

strObj.emplace("Indestructible");
std::cout << strObj->c_str() << std::endl;  // 输出: Indestructible
```

### 示例 3：复制和移动操作

```cpp
Indestructible<std::vector<int>> vecObj1(std::in_place, {1, 2, 3});
Indestructible<std::vector<int>> vecObj2 = vecObj1;  // 复制
Indestructible<std::vector<int>> vecObj3 = std::move(vecObj1);  // 移动

std::cout << vecObj2->size() << std::endl;  // 输出: 3
std::cout << vecObj3->size() << std::endl;  // 输出: 3
std::cout << vecObj1->size() << std::endl;  // 输出: 0 (移动后的状态)
```

## 最佳实践和注意事项

1. **谨慎使用 `Indestructible`**：仅在确实需要对象在正常作用域规则之外保持存在时使用。
2. **资源管理**：使用 `Indestructible` 可能导致资源泄漏，如果不正确管理，封装对象的析构函数不会自动调用。
3. **与管理资源的类型一起使用**：在与管理资源（例如文件句柄、内存分配）的类型一起使用时，考虑实现手动清理方法或与智能指针结合使用。
4. **单例模式**：`Indestructible` 类最适合单例模式或需要在程序整个生命周期内存在的对象。
5. **修改的可行性**：虽然对象无法析构，但仍然可以修改。使用常量正确性和访问控制来防止不必要的修改。
6. **多线程环境**：在多线程环境中使用 `Indestructible` 时，请确保适当的同步以避免竞争条件。
