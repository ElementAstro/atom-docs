---
title: Trackable 类模板文档
description: Trackable 类模板的全面文档，包括构造函数、公有方法、运算符、使用示例和创建可观察对象的最佳实践。
---

## 目录

1. [介绍](#介绍)
2. [类概述](#类概述)
3. [构造函数](#构造函数)
4. [公有方法](#公有方法)
5. [运算符](#运算符)
6. [使用示例](#使用示例)
7. [最佳实践和注意事项](#最佳实践和注意事项)

## 介绍

`Trackable` 类模板旨在创建可以观察值变化的对象。它提供了一种机制，在对象的值发生变化时通知观察者，这在实现反应式编程模式或数据绑定场景时非常有用。

## 类概述

```cpp
template <typename T>
class Trackable {
public:
    using value_type = T;

    explicit Trackable(T initialValue);

    void subscribe(std::function<void(const T&, const T&)> onChange);
    void setOnChangeCallback(std::function<void(const T&)> onChange);
    void unsubscribeAll();
    [[nodiscard]] auto hasSubscribers() const -> bool;
    [[nodiscard]] auto get() const -> const T&;
    [[nodiscard]] auto getTypeName() const -> std::string;

    auto operator=(T newValue) -> Trackable&;
    auto operator+=(const T& rhs) -> Trackable&;
    auto operator-=(const T& rhs) -> Trackable&;
    auto operator*=(const T& rhs) -> Trackable&;
    auto operator/=(const T& rhs) -> Trackable&;
    explicit operator T() const;

    void deferNotifications(bool defer);
    [[nodiscard]] auto deferScoped();

    // ... (私有成员)
};
```

## 构造函数

```cpp
explicit Trackable(T initialValue);
```

使用给定的初始值创建一个新的 `Trackable` 对象。

用法：

```cpp
Trackable<int> trackableInt(42);
Trackable<std::string> trackableString("Hello, World!");
```

## 公有方法

### subscribe

```cpp
void subscribe(std::function<void(const T&, const T&)> onChange);
```

订阅一个回调函数，当值发生变化时调用。回调接收旧值和新值。

用法：

```cpp
trackableInt.subscribe([](const int& oldValue, const int& newValue) {
    std::cout << "Value changed from " << oldValue << " to " << newValue << std::endl;
});
```

### setOnChangeCallback

```cpp
void setOnChangeCallback(std::function<void(const T&)> onChange);
```

设置一个回调函数，当值发生变化时调用。回调只接收新值。

用法：

```cpp
trackableString.setOnChangeCallback([](const std::string& newValue) {
    std::cout << "New value is: " << newValue << std::endl;
});
```

### unsubscribeAll

```cpp
void unsubscribeAll();
```

移除所有已订阅的观察者。

用法：

```cpp
trackableInt.unsubscribeAll();
```

### hasSubscribers

```cpp
[[nodiscard]] auto hasSubscribers() const -> bool;
```

检查是否有任何已订阅的观察者。

用法：

```cpp
if (trackableInt.hasSubscribers()) {
    std::cout << "trackableInt has subscribers" << std::endl;
}
```

### get

```cpp
[[nodiscard]] auto get() const -> const T&;
```

返回 `Trackable` 对象的当前值。

用法：

```cpp
int currentValue = trackableInt.get();
```

### getTypeName

```cpp
[[nodiscard]] auto getTypeName() const -> std::string;
```

返回存储值的去修饰类型名称。

用法：

```cpp
std::cout << "Type of trackableInt: " << trackableInt.getTypeName() << std::endl;
```

### deferNotifications

```cpp
void deferNotifications(bool defer);
```

控制通知是否被延迟。

用法：

```cpp
trackableInt.deferNotifications(true);
// 执行多个操作...
trackableInt.deferNotifications(false);
```

### deferScoped

```cpp
[[nodiscard]] auto deferScoped();
```

返回一个作用域通知延迟器。通知将在返回的对象被销毁时自动重新启用。

用法：

```cpp
{
    auto defer = trackableInt.deferScoped();
    // 执行多个操作...
} // 此处触发通知
```

## 运算符

`Trackable` 类重载了多个运算符以方便使用：

- 赋值运算符 (`=`)
- 复合赋值运算符 (`+=`, `-=`, `*=`, `/=`)
- 转换运算符到 `T`

用法：

```cpp
trackableInt = 100;
trackableInt += 5;
int value = static_cast<int>(trackableInt);
```

## 使用示例

### 示例 1：基本用法

```cpp
#include "trackable.hpp"
#include <iostream>

int main() {
    Trackable<int> counter(0);

    counter.subscribe([](const int& oldValue, const int& newValue) {
        std::cout << "Counter changed from " << oldValue << " to " << newValue << std::endl;
    });

    counter = 1;  // 触发通知
    counter += 2; // 触发通知
    counter *= 3; // 触发通知

    std::cout << "Final value: " << counter.get() << std::endl;

    return 0;
}
```

输出：

```
Counter changed from 0 to 1
Counter changed from 1 to 3
Counter changed from 3 to 9
Final value: 9
```

### 示例 2：延迟通知

```cpp
#include "trackable.hpp"
#include <iostream>

int main() {
    Trackable<double> price(10.0);

    price.subscribe([](const double& oldPrice, const double& newPrice) {
        std::cout << "Price updated from $" << oldPrice << " to $" << newPrice << std::endl;
    });

    {
        auto defer = price.deferScoped();
        price = 11.0;  // 尚未触发通知
        price *= 1.1;  // 尚未触发通知
    } // 此处触发通知

    return 0;
}
```

输出：

```
Price updated from $10 to $12.1
```

### 示例 3：自定义类型与 Trackable

```cpp
#include "trackable.hpp"
#include <iostream>
#include <string>

struct Person {
    std::string name;
    int age;

    bool operator!=(const Person& other) const {
        return name != other.name || age != other.age;
    }
};

std::ostream& operator<<(std::ostream& os, const Person& p) {
    return os << p.name << " (" << p.age << ")";
}

int main() {
    Trackable<Person> person({"Alice", 30});

    person.subscribe([](const Person& oldPerson, const Person& newPerson) {
        std::cout << "Person changed from " << oldPerson << " to " << newPerson << std::endl;
    });

    person = {"Alice", 31};  // 触发通知
    person = {"Bob", 25};    // 触发通知

    std::cout << "Current person: " << person.get() << std::endl;
    std::cout << "Person type: " << person.getTypeName() << std::endl;

    return 0;
}
```

```
Person changed from Alice (30) to Alice (31)
Person changed from Alice (31) to Bob (25)
Current person: Bob (25)
Person type: Person
```

### 示例 4：线程安全用法

`Trackable` 类设计为线程安全。以下示例演示了其在多线程环境中的使用：

```cpp
#include "trackable.hpp"
#include <iostream>
#include <thread>
#include <vector>

int main() {
    Trackable<int> sharedCounter(0);

    sharedCounter.subscribe([](const int& oldValue, const int& newValue) {
        std::cout << "Counter changed from " << oldValue << " to " << newValue << std::endl;
    });

    std::vector<std::thread> threads;
    for (int i = 0; i < 5; ++i) {
        threads.emplace_back([&sharedCounter, i]() {
            for (int j = 0; j < 100; ++j) {
                sharedCounter += 1;
                std::this_thread::sleep_for(std::chrono::milliseconds(1));
            }
        });
    }

    for (auto& thread : threads) {
        thread.join();
    }

    std::cout << "Final counter value: " << sharedCounter.get() << std::endl;

    return 0;
}
```

此示例创建多个线程以递增共享计数器。`Trackable` 类确保所有操作都是线程安全的。

### 示例 5：使用 setOnChangeCallback

```cpp
#include "trackable.hpp"
#include <iostream>

int main() {
    Trackable<std::string> status("Idle");

    status.setOnChangeCallback([](const std::string& newStatus) {
        std::cout << "Status changed to: " << newStatus << std::endl;
    });

    status = "Running";
    status = "Paused";
    status = "Completed";

    return 0;
}
```

输出：

```
Status changed to: Running
Status changed to: Paused
Status changed to: Completed
```

### 示例 6：复杂数据结构与 Trackable

```cpp
#include "trackable.hpp"
#include <iostream>
#include <vector>
#include <algorithm>

struct DataPoint {
    double x, y;

    bool operator!=(const DataPoint& other) const {
        return x != other.x || y != other.y;
    }
};

class DataSet {
public:
    void addPoint(double x, double y) {
        points_.push_back({x, y});
    }

    const std::vector<DataPoint>& getPoints() const {
        return points_;
    }

    bool operator!=(const DataSet& other) const {
        return points_ != other.points_;
    }

private:
    std::vector<DataPoint> points_;
};

int main() {
    Trackable<DataSet> dataSet(DataSet{});

    dataSet.subscribe([](const DataSet& oldSet, const DataSet& newSet) {
        std::cout << "DataSet changed. Old size: " << oldSet.getPoints().size()
                  << ", New size: " << newSet.getPoints().size() << std::endl;
    });

    auto modifyDataSet = [](DataSet& ds) {
        ds.addPoint(1.0, 2.0);
        ds.addPoint(3.0, 4.0);
        return ds;
    };

    dataSet = modifyDataSet(dataSet.get());

    std::cout << "Final DataSet size: " << dataSet.get().getPoints().size() << std::endl;

    return 0;
}
```

输出：

```
DataSet changed. Old size: 0, New size: 2
Final DataSet size: 2
```

## 最佳实践和注意事项

1. **线程安全**：`Trackable` 类设计为线程安全。然而，在执行涉及多个 `Trackable` 方法调用的操作时要小心，因为整体操作可能不是原子的。

2. **性能**：虽然 `Trackable` 类对于大多数用例是高效的，但在处理大量观察者或频繁的值变化时要注意性能影响。

3. **内存管理**：确保在回调中使用的任何对象（例如，捕获的引用的 lambda）具有超出 `Trackable` 对象生命周期的生命周期。

4. **异常处理**：`Trackable` 类在错误情况下可能会抛出异常。确保在使用时适当地处理这些异常。

5. **延迟通知**：在需要对 `Trackable` 对象执行多个操作而不触发每次更改通知时，使用 `deferNotifications` 或 `deferScoped` 方法。

6. **自定义类型**：在与 `Trackable` 一起使用自定义类型时，确保类型实现所需的运算符（例如 `!=`）以确保正确功能。

7. **避免循环依赖**：在创建多个相互观察的 `Trackable` 对象时要小心，以避免导致无限更新循环的循环依赖。

8. **回调性能**：请记住，回调是同步执行的。确保回调函数高效，以避免长时间阻塞线程。

9. **类型安全**：利用 `getTypeName` 方法进行调试并确保类型一致性，尤其是在处理模板代码时。

10. **RAII 的使用**：尽可能使用 RAII（资源获取即初始化）原则管理对象的生命周期，这有助于防止悬空指针问题。

11. **理解内存模型**：了解 C++ 内存模型及其对 `Trackable` 行为的影响，尤其是在多线程环境中。
