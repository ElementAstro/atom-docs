---
title: 事件堆栈
description: C++ 中以线程安全的方式管理事件的类和函数，如 EventStack 类模板、构造函数、公共方法和使用示例
---

本文档提供了 `eventstack.hpp` 头文件的详细概述，该文件包含用于以线程安全的方式管理事件的 `EventStack` 类模板。

## 目录

1. [EventStack 类模板](#eventstack-类模板)
2. [构造函数和五大法则](#构造函数和五大法则)
3. [公共方法](#公共方法)
4. [私有成员](#私有成员)
5. [使用示例](#使用示例)

## EventStack 类模板

`EventStack` 类是一个线程安全的堆栈数据结构，用于管理事件。它实现为一个模板类，允许与任何事件类型一起使用。

### 类定义

```cpp
template <typename T>
class EventStack {
    // ... (成员函数和嵌套类)
};
```

## 构造函数和五大法则

`EventStack` 类遵循五大法则，显式定义以下特殊成员函数：

1. 默认构造函数
2. 析构函数
3. 复制构造函数
4. 复制赋值运算符
5. 移动构造函数
6. 移动赋值运算符

### 复制构造函数

```cpp
EventStack(const EventStack& other);
```

通过复制另一个 `EventStack` 的内容创建一个新的 `EventStack`。

### 复制赋值运算符

```cpp
EventStack& operator=(const EventStack& other);
```

将另一个 `EventStack` 的内容赋值给此 `EventStack`。

### 移动构造函数

```cpp
EventStack(EventStack&& other) noexcept;
```

通过移动另一个 `EventStack` 的内容创建一个新的 `EventStack`。

### 移动赋值运算符

```cpp
EventStack& operator=(EventStack&& other) noexcept;
```

将另一个 `EventStack` 的内容移动到此 `EventStack`。

## 公共方法

### pushEvent

```cpp
void pushEvent(T event);
```

将事件推入堆栈。

### popEvent

```cpp
auto popEvent() -> std::optional<T>;
```

从堆栈中弹出事件。如果堆栈为空，则返回 `std::nullopt`。

### printEvents

```cpp
void printEvents() const;
```

打印堆栈中的所有事件。仅在定义了 `ENABLE_DEBUG` 时可用。

### isEmpty

```cpp
auto isEmpty() const -> bool;
```

检查堆栈是否为空。

### size

```cpp
auto size() const -> size_t;
```

返回堆栈中的事件数量。

### clearEvents

```cpp
void clearEvents();
```

清除堆栈中的所有事件。

### peekTopEvent

```cpp
auto peekTopEvent() const -> std::optional<T>;
```

返回堆栈顶部的事件而不将其移除。如果堆栈为空，则返回 `std::nullopt`。

### copyStack

```cpp
auto copyStack() const -> EventStack<T>;
```

创建并返回当前堆栈的副本。

### filterEvents

```cpp
void filterEvents(std::function<bool(const T&)> filterFunc);
```

根据自定义过滤函数过滤事件。

### serializeStack

```cpp
auto serializeStack() const -> std::string;
```

将堆栈序列化为字符串。

### deserializeStack

```cpp
void deserializeStack(std::string_view serializedData);
```

将字符串反序列化为堆栈。

### removeDuplicates

```cpp
void removeDuplicates();
```

从堆栈中删除重复事件。

### sortEvents

```cpp
void sortEvents(std::function<bool(const T&, const T&)> compareFunc);
```

根据自定义比较函数对堆栈中的事件进行排序。

### reverseEvents

```cpp
void reverseEvents();
```

反转堆栈中事件的顺序。

### countEvents

```cpp
auto countEvents(std::function<bool(const T&)> predicate) const -> size_t;
```

计算满足谓词的事件数量。

### findEvent

```cpp
auto findEvent(std::function<bool(const T&)> predicate) const -> std::optional<T>;
```

查找满足谓词的第一个事件。如果未找到，则返回 `std::nullopt`。

### anyEvent

```cpp
auto anyEvent(std::function<bool(const T&)> predicate) const -> bool;
```

检查堆栈中的任何事件是否满足谓词。

### allEvents

```cpp
auto allEvents(std::function<bool(const T&)> predicate) const -> bool;
```

检查堆栈中的所有事件是否满足谓词。

## 私有成员

- `std::vector<T> events_`：用于存储事件的向量。
- `mutable std::shared_mutex mtx_`：用于线程安全的互斥量。
- `std::atomic<size_t> eventCount_`：用于事件计数的原子计数器。

## 使用示例

以下是如何使用 `EventStack` 类的一些示例：

```cpp
#include "eventstack.hpp"
#include <iostream>
#include <string>

int main() {
    atom::algorithm::EventStack<std::string> eventStack;

    // 推送事件
    eventStack.pushEvent("Event 1");
    eventStack.pushEvent("Event 2");
    eventStack.pushEvent("Event 3");

    // 弹出事件
    auto event = eventStack.popEvent();
    if (event) {
        std::cout << "弹出事件: " << *event << std::endl;
    }

    // 检查大小和是否为空
    std::cout << "堆栈大小: " << eventStack.size() << std::endl;
    std::cout << "堆栈为空吗? " << (eventStack.isEmpty() ? "是" : "否") << std::endl;

    // 查看顶部事件
    auto topEvent = eventStack.peekTopEvent();
    if (topEvent) {
        std::cout << "顶部事件: " << *topEvent << std::endl;
    }

    // 过滤事件
    eventStack.filterEvents([](const std::string& event) {
        return event.length() > 5;
    });

    // 序列化和反序列化
    std::string serialized = eventStack.serializeStack();
    atom::algorithm::EventStack<std::string> newStack;
    newStack.deserializeStack(serialized);

    // 排序事件
    newStack.sortEvents([](const std::string& a, const std::string& b) {
        return a < b;
    });

    // 计数事件
    size_t count = newStack.countEvents([](const std::string& event) {
        return event.starts_with("Event");
    });
    std::cout << "以 'Event' 开头的事件数量: " << count << std::endl;

    return 0;
}
```

该示例演示了对 `EventStack` 的各种操作，包括推送和弹出事件、检查堆栈的属性、过滤、序列化、反序列化、排序和计数事件。

请记住，`EventStack` 是线程安全的，因此您可以在多线程应用程序中使用它，而无需额外的同步。
