---
title: 对象池
description: 详细文档，介绍 ObjectPool 类，包括构造函数、公共方法和用于在 C++ 中以线程安全的方式管理可重用对象的使用示例。
---

## 目录

1. [介绍](#介绍)
2. [类概述](#类概述)
3. [构造函数](#构造函数)
4. [公共方法](#公共方法)
5. [使用示例](#使用示例)

## 介绍

`ObjectPool` 类是一个线程安全的对象池实现，旨在管理可重用对象。它提供高效的对象分配和释放，减少对象创建和销毁的开销。此类在频繁创建和销毁对象的场景中尤为有用，例如在多线程应用程序或高性能系统中。

## 类概述

```cpp
template <Resettable T>
class ObjectPool {
public:
    using CreateFunc = std::function<std::shared_ptr<T>()>;

    explicit ObjectPool(size_t max_size, CreateFunc creator = []() { return std::make_shared<T>(); });

    [[nodiscard]] auto acquire() -> std::shared_ptr<T>;
    template <typename Rep, typename Period>
    [[nodiscard]] auto acquireFor(const std::chrono::duration<Rep, Period>& timeout_duration) -> std::optional<std::shared_ptr<T>>;
    void release(std::shared_ptr<T> obj);
    [[nodiscard]] auto available() const -> size_t;
    [[nodiscard]] auto size() const -> size_t;
    void prefill(size_t count);
    void clear();
    void resize(size_t new_max_size);
    void applyToAll(const std::function<void(T&)>& func);

    // ... (私有成员)
};
```

`ObjectPool` 类模板以类型 `T` 为模板参数，`T` 必须满足 `Resettable` 概念，即必须具有 `reset()` 方法。

## 构造函数

```cpp
explicit ObjectPool(size_t max_size, CreateFunc creator = []() { return std::make_shared<T>(); })
```

- **`max_size`**：池中可以容纳的最大对象数量。
- **`creator`**：可选的创建新对象的函数，默认为使用 `std::make_shared<T>()`。

## 公共方法

### acquire

```cpp
[[nodiscard]] auto acquire() -> std::shared_ptr<T>
```

从池中获取一个对象。如果没有可用对象，它将阻塞直到有对象可用。

- **返回**：指向获取对象的共享指针。
- **抛出**：`std::runtime_error` 如果池已满且没有对象可用。

### acquireFor

```cpp
template <typename Rep, typename Period>
[[nodiscard]] auto acquireFor(const std::chrono::duration<Rep, Period>& timeout_duration) -> std::optional<std::shared_ptr<T>>
```

在指定的超时内从池中获取一个对象。

- **参数**：
  - `timeout_duration`：等待可用对象的最大持续时间。

- **返回**：包含获取对象的共享指针的可选值，如果超时过期则返回 `std::nullopt`。

### release

```cpp
void release(std::shared_ptr<T> obj)
```

将对象释放回池中。

- **参数**：
  - `obj`：要释放的共享指针对象。

### available

```cpp
[[nodiscard]] auto available() const -> size_t
```

返回池中可用对象的数量。

### size

```cpp
[[nodiscard]] auto size() const -> size_t
```

返回池的当前大小（对象总数）。

### prefill

```cpp
void prefill(size_t count)
```

用指定数量的对象预填充池。

- **参数**：
  - `count`：要预填充池的对象数量。

### clear

```cpp
void clear()
```

清除池中的所有对象。

### resize

```cpp
void resize(size_t new_max_size)
```

将池调整为新的最大大小。

- **参数**：
  - `new_max_size`：池的新最大大小。

### applyToAll

```cpp
void applyToAll(const std::function<void(T&)>& func)
```

对池中的所有对象应用一个函数。

- **参数**：
  - `func`：要应用于每个对象的函数。

## 使用示例

### 基本用法

```cpp
#include "object_pool.hpp"
#include <iostream>

class MyObject {
public:
    void reset() { data = 0; }
    int data = 0;
};

int main() {
    ObjectPool<MyObject> pool;

    // 从池中获取并使用一个对象
    auto obj1 = pool.acquire();
    obj1->data = 42;
    std::cout << "对象 1 数据: " << obj1->data << std::endl;

    // 将对象释放回池中
    pool.release(obj1);

    // 获取另一个对象（可能是同一个对象）
    auto obj2 = pool.acquire();
    std::cout << "对象 2 数据: " << obj2->data << std::endl;

    return 0;
}
```

### 使用自定义创建函数

```cpp
#include "object_pool.hpp"
#include <iostream>
#include <random>

class ComplexObject {
public:
    ComplexObject(int id) : id_(id) {}
    void reset() { data_.clear(); }
    void addData(int value) { data_.push_back(value); }
    void printData() const {
        std::cout << "对象 " << id_ << " 数据: ";
        for (int val : data_) {
            std::cout << val << " ";
        }
        std::cout << std::endl;
    }

private:
    int id_;
    std::vector<int> data_;
};

int main() {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(1, 100);

    auto creator = [&gen, &dis]() {
        return std::make_shared<ComplexObject>(dis(gen));
    };

    ObjectPool<ComplexObject> pool(3, creator);

    // 预填充池
    pool.prefill(3);

    // 使用池中的对象
    for (int i = 0; i < 5; ++i) {
        auto obj = pool.acquire();
        obj->addData(dis(gen));
        obj->addData(dis(gen));
        obj->printData();
        pool.release(obj);
    }

    return 0;
}
```

### 线程安全使用

```cpp
#include "object_pool.hpp"
#include <iostream>
#include <thread>
#include <vector>

class ThreadSafeObject {
public:
    void reset() { counter_ = 0; }
    void increment() { ++counter_; }
    int getCounter() const { return counter_; }

private:
    int counter_ = 0;
};

int main() {
    ObjectPool<ThreadSafeObject> pool(10);
    pool.prefill(5);

    std::vector<std::thread> threads;
    for (int i = 0; i < 20; ++i) {
        threads.emplace_back([&pool]() {
            for (int j = 0; j < 100; ++j) {
                auto obj = pool.acquire();
                obj->increment();
                pool.release(obj);
            }
        });
    }

    for (auto& t : threads) {
        t.join();
    }

    pool.applyToAll([](ThreadSafeObject& obj) {
        std::cout << "对象计数器: " << obj.getCounter() << std::endl;
    });

    return 0;
}
```
