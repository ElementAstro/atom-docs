---
title: 增强弱指针
description: atom::type 命名空间中 EnhancedWeakPtr 类模板的全面文档，包括构造函数、析构函数、复制和移动操作、基本和高级特性、静态方法、辅助函数和使用示例。
---

## 目录

1. [介绍](#介绍)
2. [类概述](#类概述)
3. [构造函数和析构函数](#构造函数和析构函数)
4. [复制和移动操作](#复制和移动操作)
5. [基本操作](#基本操作)
6. [高级特性](#高级特性)
7. [静态方法](#静态方法)
8. [辅助函数](#辅助函数)
9. [使用示例](#使用示例)
10. [最佳实践和注意事项](#最佳实践和注意事项)

## 介绍

`EnhancedWeakPtr` 类模板是对 `std::weak_ptr` 的扩展，提供了额外的功能，如周期性锁定尝试、异步锁定和对一组弱指针的批量操作。它允许在不拥有对象的情况下安全地访问共享资源。

## 类概述

```cpp
namespace atom::type {

template <typename T>
class EnhancedWeakPtr {
    // ... (类实现)
};

// ... (辅助函数)

}  // namespace atom::type
```

## 构造函数和析构函数

### 构造函数

```cpp
EnhancedWeakPtr();
explicit EnhancedWeakPtr(const std::shared_ptr<T>& shared);
```

### 析构函数

```cpp
~EnhancedWeakPtr();
```

用法：

```cpp
std::shared_ptr<int> sharedPtr = std::make_shared<int>(42);
atom::type::EnhancedWeakPtr<int> weakPtr(sharedPtr);
```

## 复制和移动操作

```cpp
EnhancedWeakPtr(const EnhancedWeakPtr& other);
EnhancedWeakPtr(EnhancedWeakPtr&& other) noexcept;
auto operator=(const EnhancedWeakPtr& other) -> EnhancedWeakPtr&;
auto operator=(EnhancedWeakPtr&& other) noexcept -> EnhancedWeakPtr&;
```

用法：

```cpp
atom::type::EnhancedWeakPtr<int> weakPtr1(sharedPtr);
atom::type::EnhancedWeakPtr<int> weakPtr2 = weakPtr1;  // 复制
atom::type::EnhancedWeakPtr<int> weakPtr3 = std::move(weakPtr1);  // 移动
```

## 基本操作

### lock

```cpp
auto lock() const -> std::shared_ptr<T>;
```

用法：

```cpp
if (auto sharedPtr = weakPtr.lock()) {
    // 使用 sharedPtr
}
```

### expired

```cpp
auto expired() const -> bool;
```

用法：

```cpp
if (!weakPtr.expired()) {
    // 弱指针仍然有效
}
```

### reset

```cpp
void reset();
```

用法：

```cpp
weakPtr.reset();
```

### useCount

```cpp
auto useCount() const -> long;
```

用法：

```cpp
long count = weakPtr.useCount();
```

## 高级特性

### withLock

```cpp
template <typename Func, typename R = std::invoke_result_t<Func, T&>>
auto withLock(Func&& func) const
    -> std::conditional_t<std::is_void_v<R>, bool, std::optional<R>>;
```

用法：

```cpp
weakPtr.withLock([](int& value) {
    std::cout << "Value: " << value << std::endl;
});
```

### waitFor

```cpp
template <typename Rep, typename Period>
auto waitFor(const std::chrono::duration<Rep, Period>& timeout) const -> bool;
```

用法：

```cpp
if (weakPtr.waitFor(std::chrono::seconds(5))) {
    // 对象在 5 秒内变得可用
}
```

### tryLockOrElse

```cpp
template <typename SuccessFunc, typename FailureFunc>
auto tryLockOrElse(SuccessFunc&& success, FailureFunc&& failure) const;
```

用法：

```cpp
int result = weakPtr.tryLockOrElse(
    [](int& value) { return value * 2; },
    [] { return -1; }
);
```

### tryLockPeriodic

```cpp
template <typename Rep, typename Period>
auto tryLockPeriodic(
    const std::chrono::duration<Rep, Period>& interval,
    size_t maxAttempts = std::numeric_limits<size_t>::max()) -> std::shared_ptr<T>;
```

用法：

```cpp
auto sharedPtr = weakPtr.tryLockPeriodic(std::chrono::milliseconds(100), 10);
```

### asyncLock

```cpp
auto asyncLock() const -> std::future<std::shared_ptr<T>>;
```

用法：

```cpp
auto future = weakPtr.asyncLock();
// ... 执行其他工作 ...
auto sharedPtr = future.get();
```

### waitUntil

```cpp
template <typename Predicate>
auto waitUntil(Predicate pred) const -> bool;
```

用法：

```cpp
bool result = weakPtr.waitUntil([] { return someCondition; });
```

### cast

```cpp
template <typename U>
auto cast() const -> EnhancedWeakPtr<U>;
```

用法：

```cpp
auto derivedWeakPtr = baseWeakPtr.cast<Derived>();
```

## 静态方法

### getTotalInstances

```cpp
static auto getTotalInstances() -> size_t;
```

用法：

```cpp
size_t totalInstances = atom::type::EnhancedWeakPtr<int>::getTotalInstances();
```

## 辅助函数

### createWeakPtrGroup

```cpp
template <typename T>
auto createWeakPtrGroup(const std::vector<std::shared_ptr<T>>& sharedPtrs)
    -> std::vector<EnhancedWeakPtr<T>>;
```

用法：

```cpp
std::vector<std::shared_ptr<int>> sharedPtrs = { /* ... */ };
auto weakPtrGroup = atom::type::createWeakPtrGroup(sharedPtrs);
```

### batchOperation

```cpp
template <typename T, typename Func>
void batchOperation(const std::vector<EnhancedWeakPtr<T>>& weakPtrs, Func&& func);
```

用法：

```cpp
atom::type::batchOperation(weakPtrGroup, [](int& value) {
    value *= 2;
});
```

## 使用示例

### 示例 1：基本用法

```cpp
#include "weak_ptr.hpp"
#include <iostream>

int main() {
    auto sharedPtr = std::make_shared<int>(42);
    atom::type::EnhancedWeakPtr<int> weakPtr(sharedPtr);

    weakPtr.withLock([](int& value) {
        std::cout << "Value: " << value << std::endl;
    });

    sharedPtr.reset();  // 释放共享指针

    if (weakPtr.expired()) {
        std::cout << "Weak pointer has expired." << std::endl;
    }

    return 0;
}
```

### 示例 2：异步操作

```cpp
#include "weak_ptr.hpp"
#include <iostream>
#include <thread>

int main() {
    auto sharedPtr = std::make_shared<int>(0);
    atom::type::EnhancedWeakPtr<int> weakPtr(sharedPtr);

    std::thread t([&weakPtr]() {
        std::this_thread::sleep_for(std::chrono::seconds(2));
        weakPtr.withLock([](int& value) {
            value = 42;
        });
        weakPtr.notifyAll();
    });

    bool result = weakPtr.waitUntil([]() {
        return true;  // 等待直到被通知
    });

    if (result) {
        weakPtr.withLock([](int& value) {
            std::cout << "Value updated to: " << value << std::endl;
        });
    }

    t.join();
    return 0;
}
```

此示例演示了如何使用 `waitUntil` 和 `notifyAll` 进行线程间同步。

### 示例 3：周期性锁定和转换

```cpp
#include "weak_ptr.hpp"
#include <iostream>
#include <chrono>

class Base {
public:
    virtual ~Base() = default;
    virtual void print() const { std::cout << "Base" << std::endl; }
};

class Derived : public Base {
public:
    void print() const override { std::cout << "Derived" << std::endl; }
};

int main() {
    auto sharedPtr = std::make_shared<Derived>();
    atom::type::EnhancedWeakPtr<Base> baseWeakPtr(sharedPtr);

    // 模拟共享指针暂时不可用
    std::thread([&sharedPtr]() {
        std::this_thread::sleep_for(std::chrono::seconds(3));
        sharedPtr.reset();
    }).detach();

    // 尝试周期性锁定
    auto lockedPtr = baseWeakPtr.tryLockPeriodic(std::chrono::milliseconds(500), 10);
    if (lockedPtr) {
        lockedPtr->print();  // 输出: Derived

        // 转换为 Derived
        auto derivedWeakPtr = baseWeakPtr.cast<Derived>();
        derivedWeakPtr.withLock([](Derived& obj) {
            obj.print();  // 输出: Derived
        });
    } else {
        std::cout << "Failed to lock after multiple attempts" << std::endl;
    }

    return 0;
}
```

此示例演示了如何使用 `tryLockPeriodic` 进行周期性锁定尝试和 `cast` 进行向下转换。

### 示例 4：批量操作

```cpp
#include "weak_ptr.hpp"
#include <iostream>
#include <vector>

class Resource {
public:
    Resource(int id) : id_(id) {}
    void update() { std::cout << "Updating resource " << id_ << std::endl; }
private:
    int id_;
};

int main() {
    std::vector<std::shared_ptr<Resource>> resources;
    for (int i = 0; i < 5; ++i) {
        resources.push_back(std::make_shared<Resource>(i));
    }

    auto weakPtrGroup = atom::type::createWeakPtrGroup(resources);

    // 执行批量操作
    atom::type::batchOperation(weakPtrGroup, [](Resource& res) {
        res.update();
    });

    // 模拟一些资源被释放
    resources[1].reset();
    resources[3].reset();

    // 执行另一次批量操作
    atom::type::batchOperation(weakPtrGroup, [](Resource& res) {
        res.update();
    });

    return 0;
}
```

此示例演示了如何使用 `createWeakPtrGroup` 和 `batchOperation` 对一组对象执行操作。

## 最佳实践和注意事项

1. **适当使用 `EnhancedWeakPtr`**：在需要其提供的附加功能时使用 `EnhancedWeakPtr`。对于简单情况，`std::weak_ptr` 可能就足够了。

2. **避免循环引用**：即使使用 `EnhancedWeakPtr`，也要小心避免循环引用，这可能导致内存泄漏。

3. **优雅处理过期**：在使用弱指针之前，始终检查它是否已经过期。使用 `withLock` 方法安全地访问对象并处理不再可用的情况。

4. **注意性能**：某些操作（如 `tryLockPeriodic`）如果不谨慎使用可能会比较昂贵。在特定用例中考虑性能影响。

5. **使用 `asyncLock` 进行非阻塞操作**：当您不想阻塞当前线程等待锁定时，使用 `asyncLock` 进行异步锁定操作。

6. **利用批量操作**：在处理多个对象时，使用 `createWeakPtrGroup` 和 `batchOperation` 高效地执行操作。

7. **小心使用 `cast`**：在使用 `cast` 时，确保转换是有效的。错误的转换可能导致未定义行为。

8. **使用 `waitFor` 和 `waitUntil` 时要谨慎**：这些方法可以用于同步，但要小心不要造成死锁或长时间等待，从而影响性能。

9. **监控锁定尝试**：使用 `getLockAttempts` 跟踪锁定尝试的频率，这对于调试或优化代码非常有用。

10. **考虑线程安全**：虽然 `EnhancedWeakPtr` 提供了一些线程安全操作，但在多个线程使用共享资源时要注意潜在的竞争条件。

11. **使用 RAII**：尽可能使用 RAII（资源获取即初始化）原则管理对象的生命周期，这有助于防止悬空指针问题。

12. **理解内存模型**：了解 C++ 内存模型及其对弱指针行为的影响，特别是在多线程环境中。
