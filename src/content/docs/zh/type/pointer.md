---
title: PointerSentinel 类文档
description: PointerSentinel 类的全面文档，包括类定义、模板参数、构造函数、成员函数、辅助方法和使用示例，用于管理 C++ 中的各种指针类型。
---

## 目录

1. [介绍](#介绍)
2. [类定义](#类定义)
3. [模板参数](#模板参数)
4. [构造函数](#构造函数)
5. [成员函数](#成员函数)
6. [辅助方法](#辅助方法)
7. [使用示例](#使用示例)

## 介绍

`PointerSentinel` 类是一个多用途的封装类，用于处理不同类型的指针，包括原始指针、`std::shared_ptr`、`std::unique_ptr` 和 `std::weak_ptr`。它提供了一个统一的接口来处理这些指针类型，使得在 C++ 代码中更容易管理和操作指针。

## 类定义

```cpp
template <typename T>
class PointerSentinel {
    // ... (实现细节)
};
```

## 模板参数

- `T`: 被指向对象的类型。

## 构造函数

1. 默认构造函数：

   ```cpp
   PointerSentinel() = default;
   ```

2. 共享指针构造函数：

   ```cpp
   explicit PointerSentinel(std::shared_ptr<T> p);
   ```

3. 唯一指针构造函数：

   ```cpp
   explicit PointerSentinel(std::unique_ptr<T>&& p);
   ```

4. 弱指针构造函数：

   ```cpp
   explicit PointerSentinel(std::weak_ptr<T> p);
   ```

5. 原始指针构造函数：

   ```cpp
   explicit PointerSentinel(T* p);
   ```

6. 拷贝构造函数：

   ```cpp
   PointerSentinel(const PointerSentinel& other);
   ```

7. 移动构造函数：

   ```cpp
   PointerSentinel(PointerSentinel&& other) noexcept = default;
   ```

## 成员函数

1. 拷贝赋值运算符：

   ```cpp
   auto operator=(const PointerSentinel& other) -> PointerSentinel&;
   ```

2. 移动赋值运算符：

   ```cpp
   auto operator=(PointerSentinel&& other) noexcept -> PointerSentinel& = default;
   ```

3. 获取原始指针：

   ```cpp
   [[nodiscard]] auto get() const -> T*;
   ```

## 辅助方法

1. 调用成员函数：

   ```cpp
   template <typename Func, typename... Args>
   [[nodiscard]] auto invoke(Func func, Args&&... args);
   ```

2. 应用可调用对象：

   ```cpp
   template <typename Callable>
   [[nodiscard]] auto apply(Callable&& callable);
   ```

3. 应用无返回值的函数：

   ```cpp
   template <typename Func, typename... Args>
   void applyVoid(Func func, Args&&... args);
   ```

## 使用示例

以下是一些示例，演示如何使用 `PointerSentinel` 类：

```cpp
#include "pointer.hpp"
#include <iostream>
#include <memory>

// 示例类
class ExampleClass {
public:
    void printMessage() const {
        std::cout << "Hello from ExampleClass!" << std::endl;
    }

    int add(int a, int b) const {
        return a + b;
    }
};

int main() {
    // 使用 PointerSentinel 处理不同的指针类型

    // 1. 使用 std::shared_ptr
    auto sharedPtr = std::make_shared<ExampleClass>();
    PointerSentinel<ExampleClass> sharedSentinel(sharedPtr);

    // 2. 使用 std::unique_ptr
    auto uniquePtr = std::make_unique<ExampleClass>();
    PointerSentinel<ExampleClass> uniqueSentinel(std::move(uniquePtr));

    // 3. 使用 std::weak_ptr
    std::weak_ptr<ExampleClass> weakPtr = sharedPtr;
    PointerSentinel<ExampleClass> weakSentinel(weakPtr);

    // 4. 使用原始指针
    ExampleClass* rawPtr = new ExampleClass();
    PointerSentinel<ExampleClass> rawSentinel(rawPtr);

    // 使用 get() 方法
    std::cout << "Raw pointer from sharedSentinel: " << sharedSentinel.get() << std::endl;

    // 使用 invoke() 方法调用成员函数
    sharedSentinel.invoke(&ExampleClass::printMessage);

    // 使用 invoke() 方法带参数
    int result = sharedSentinel.invoke(&ExampleClass::add, 5, 3);
    std::cout << "Result of add: " << result << std::endl;

    // 使用 apply() 方法与 lambda
    auto lambdaResult = sharedSentinel.apply([](ExampleClass* ptr) {
        return ptr->add(10, 20);
    });
    std::cout << "Result of lambda: " << lambdaResult << std::endl;

    // 使用 applyVoid() 方法
    sharedSentinel.applyVoid([](ExampleClass* ptr) {
        ptr->printMessage();
    });

    // 清理原始指针
    delete rawPtr;

    return 0;
}
```

## 最佳实践和注意事项

1. **选择合适的指针类型**：根据需要选择 `std::shared_ptr`、`std::unique_ptr` 或原始指针。`PointerSentinel` 提供了一种统一的方式来处理它们。

2. **避免内存泄漏**：在使用原始指针时，确保在不再需要时正确释放内存。

3. **使用智能指针**：尽可能使用智能指针，以简化内存管理并减少内存泄漏的风险。

4. **处理空指针**：在使用 `PointerSentinel` 时，确保检查指针是否有效，特别是在使用 `invoke` 或 `apply` 方法时。

5. **性能考虑**：使用 `PointerSentinel` 时要注意性能，尤其是在需要频繁访问指针的情况下。尽量减少不必要的拷贝和移动。

6. **线程安全**：如果在多线程环境中使用 `PointerSentinel`，请确保适当的同步，以避免竞争条件。

7. **使用 RAII**：利用 RAII（资源获取即初始化）原则来管理指针的生命周期，确保资源在适当的时间被释放。

8. **调试支持**：考虑在调试模式下增加额外的检查，以确保指针的有效性和状态。

9. **文档记录**：清晰记录 `PointerSentinel` 的使用和功能，以便团队成员理解其工作原理和用途。
