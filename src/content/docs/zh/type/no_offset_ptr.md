---
title: 不偏移的指针
description: UnshiftedPtr 类的全面文档，包括类定义、成员函数、使用示例和管理对象而不使用动态内存分配的最佳实践。
---

## 目录

1. [介绍](#介绍)
2. [类定义](#类定义)
3. [成员函数](#成员函数)
4. [使用示例](#使用示例)
5. [最佳实践和注意事项](#最佳实践和注意事项)

## 介绍

`UnshiftedPtr` 类是一个轻量级的指针类，管理类型 `T` 的对象，而不使用动态内存分配。它提供了一种内联存储和管理对象的方式，类似于 `std::optional`，但对对象的生命周期和构造提供了更多控制。

## 类定义

```cpp
template <typename T>
    requires std::is_object_v<T>
class UnshiftedPtr {
    // ... (实现细节)
};
```

该类以被管理对象的类型 `T` 为模板参数，要求 `T` 必须是一个对象类型。

## 成员函数

### 构造函数

1. 默认构造函数：

   ```cpp
   constexpr UnshiftedPtr() noexcept(std::is_nothrow_default_constructible_v<T>);
   ```

   使用 `T` 的默认构造函数构造被管理的对象。

2. 参数化构造函数：
   ```cpp
   template <typename... Args>
       requires std::constructible_from<T, Args...>
   constexpr explicit UnshiftedPtr(Args&&... args) noexcept(std::is_nothrow_constructible_v<T, Args...>);
   ```
   使用给定的参数构造被管理的对象。

### 析构函数

```cpp
constexpr ~UnshiftedPtr() noexcept;
```

销毁被管理的对象。

### 运算符

1. 箭头运算符：

   ```cpp
   constexpr auto operator->() noexcept -> T*;
   constexpr auto operator->() const noexcept -> const T*;
   ```

   提供对被管理对象的指针访问。

2. 解引用运算符：
   ```cpp
   constexpr auto operator*() noexcept -> T&;
   constexpr auto operator*() const noexcept -> const T&;
   ```
   解引用被管理的对象。

### 成员函数

1. 重置：

   ```cpp
   template <typename... Args>
       requires std::constructible_from<T, Args...>
   constexpr void reset(Args&&... args) noexcept(std::is_nothrow_constructible_v<T, Args...> && std::is_nothrow_destructible_v<T>);
   ```

   通过调用析构函数并在原地重建来重置被管理的对象。

2. Emplace：

   ```cpp
   template <typename... Args>
       requires std::constructible_from<T, Args...>
   constexpr void emplace(Args&&... args) noexcept(std::is_nothrow_constructible_v<T, Args...>);
   ```

   使用提供的参数在原地构造一个新对象。

3. Release：

   ```cpp
   [[nodiscard]] constexpr auto release() noexcept -> T*;
   ```

   在不销毁的情况下释放对被管理对象的所有权。

4. 是否有值：
   ```cpp
   [[nodiscard]] constexpr auto hasValue() const noexcept -> bool;
   ```
   检查被管理对象是否有值。

## 使用示例

以下是一些示例，演示如何使用 `UnshiftedPtr` 类：

```cpp
#include "no_offset_ptr.hpp"
#include <iostream>
#include <string>

class MyClass {
public:
    MyClass(int value) : value_(value) {}
    int getValue() const { return value_; }
    void setValue(int value) { value_ = value; }
private:
    int value_;
};

int main() {
    // 默认构造
    UnshiftedPtr<int> intPtr;
    *intPtr = 42;
    std::cout << "Int value: " << *intPtr << std::endl;

    // 参数化构造
    UnshiftedPtr<MyClass> myClassPtr(10);
    std::cout << "MyClass value: " << myClassPtr->getValue() << std::endl;

    // 使用重置
    myClassPtr.reset(20);
    std::cout << "MyClass value after reset: " << myClassPtr->getValue() << std::endl;

    // 使用 emplace
    UnshiftedPtr<std::string> stringPtr;
    stringPtr.emplace("Hello, UnshiftedPtr!");
    std::cout << "String value: " << *stringPtr << std::endl;

    // 使用箭头运算符
    stringPtr->append(" More text.");
    std::cout << "Updated string value: " << *stringPtr << std::endl;

    // 使用 release
    MyClass* releasedPtr = myClassPtr.release();
    std::cout << "Released MyClass value: " << releasedPtr->getValue() << std::endl;
    delete releasedPtr;  // 别忘了删除释放的指针

    // 检查是否有值
    std::cout << "stringPtr has value: " << std::boolalpha << stringPtr.hasValue() << std::endl;

    return 0;
}
```

此示例演示了：

1. `UnshiftedPtr<int>` 的默认构造。
2. `UnshiftedPtr<MyClass>` 的参数化构造。
3. 使用 `reset` 函数重置被管理对象。
4. 使用 `emplace` 函数在原地构造新对象。
5. 使用箭头运算符访问被管理对象的成员。
6. 使用 `release` 函数转移对被管理对象的所有权。
7. 使用 `hasValue` 函数检查被管理对象是否有值。

## 最佳实践和注意事项

1. **使用 `UnshiftedPtr` 进行内联存储**：当您希望避免动态内存分配但仍需要指针语义时，`UnshiftedPtr` 是有用的。

2. **小心使用 `release`**：调用 `release` 后，`UnshiftedPtr` 不再管理该对象。确保正确管理返回的指针，以避免内存泄漏。

3. **优先使用 `emplace` 而不是 `reset`**：`emplace` 更明确地用于构造新对象，而 `reset` 可用于构造和赋值。

4. **记住 `UnshiftedPtr` 始终包含一个值**：与 `std::optional` 不同，`UnshiftedPtr` 始终包含一个构造的对象。`hasValue` 函数将始终返回 true。

5. **与移动类型一起使用**：`UnshiftedPtr` 特别适合管理您希望内联存储的移动类型。

6. **注意对象的生命周期**：被管理的对象在 `UnshiftedPtr` 构造时构造，在 `UnshiftedPtr` 析构时销毁。确保这与您的预期用法一致。

7. **考虑异常安全性**：成员函数上的 `noexcept` 指定依赖于 `T` 的构造函数和析构函数是否为 `noexcept`。在使用可能抛出异常的类型时要注意这一点。
