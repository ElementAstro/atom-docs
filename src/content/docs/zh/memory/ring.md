---
title: 循环缓冲区
description: 详细文档，介绍 RingBuffer 类，包括构造函数、公共方法、迭代器和用于实现 C++ 中循环缓冲区的使用示例。  
---

## 目录

1. [介绍](#介绍)
2. [类概述](#类概述)
3. [构造函数](#构造函数)
4. [公共方法](#公共方法)
5. [迭代器](#迭代器)
6. [使用示例](#使用示例)

## 介绍

`RingBuffer` 类是 C++ 中的一个循环缓冲区实现。它提供了一种高效的方式来存储和管理固定大小的元素序列，当缓冲区满时会自动覆盖旧数据。该数据结构在需要维护最近数据的滚动窗口时特别有用，例如在信号处理、数据流或实现缓存时。

## 类概述

```cpp
template <typename T>
class RingBuffer {
public:
    explicit RingBuffer(size_t size);
    // ... (公共方法)
private:
    std::vector<T> buffer_;
    size_t max_size_;
    size_t head_ = 0;
    size_t tail_ = 0;
    size_t count_ = 0;
};
```

`RingBuffer` 类模板以类型 `T` 为模板参数，表示要存储的元素类型。

## 构造函数

```cpp
explicit RingBuffer(size_t size)
```

创建一个具有指定最大大小的 `RingBuffer`。

- **参数：**
  - `size`：缓冲区可以容纳的最大元素数量。

## 公共方法

### push

```cpp
auto push(const T& item) -> bool
```

将一个项目推入缓冲区。如果缓冲区已满，则返回 `false`。

- **参数：**
  - `item`：要推入的元素。
- **返回：** 如果成功，返回 `true`；如果缓冲区满，返回 `false`。

### pushOverwrite

```cpp
void pushOverwrite(const T& item)
```

将一个项目推入缓冲区，如果缓冲区满，则覆盖最旧的项目。

### pop

```cpp
[[nodiscard]] auto pop() -> std::optional<T>
```

移除并返回缓冲区中最旧的项目。如果缓冲区为空，则返回 `std::nullopt`。

### full

```cpp
[[nodiscard]] auto full() const -> bool
```

返回 `true` 如果缓冲区已满，否则返回 `false`。

### empty

```cpp
[[nodiscard]] auto empty() const -> bool
```

返回 `true` 如果缓冲区为空，否则返回 `false`。

### size

```cpp
[[nodiscard]] auto size() const -> size_t
```

返回缓冲区中当前的项目数量。

### capacity

```cpp
[[nodiscard]] auto capacity() const -> size_t
```

返回缓冲区的最大大小。

### clear

```cpp
void clear()
```

移除缓冲区中的所有项目。

### front

```cpp
[[nodiscard]] auto front() const -> std::optional<T>
```

返回缓冲区中最旧的项目而不移除它。如果缓冲区为空，则返回 `std::nullopt`。

### back

```cpp
[[nodiscard]] auto back() const -> std::optional<T>
```

返回缓冲区中最新的项目而不移除它。如果缓冲区为空，则返回 `std::nullopt`。

### contains

```cpp
[[nodiscard]] auto contains(const T& item) const -> bool
```

如果项目在缓冲区中，则返回 `true`，否则返回 `false`。

### view

```cpp
[[nodiscard]] auto view() const -> std::vector<T>
```

返回一个包含缓冲区中所有项目的向量，按顺序排列。

### resize

```cpp
void resize(size_t new_size)
```

将缓冲区调整为新大小，尽可能保留元素。

### at

```cpp
[[nodiscard]] auto at(size_t index) const -> std::optional<T>
```

返回指定索引的元素。如果索引超出范围，则返回 `std::nullopt`。

### forEach

```cpp
template <std::invocable<T&> F>
void forEach(F&& func)
```

对缓冲区中的每个元素应用给定的函数。

### removeIf

```cpp
template <std::predicate<T> P>
void removeIf(P&& pred)
```

移除缓冲区中满足给定谓词的所有元素。

### rotate

```cpp
void rotate(int n)
```

将缓冲区旋转 `n` 个位置。正值向左旋转，负值向右旋转。

## 迭代器

`RingBuffer` 类提供一个前向迭代器，用于遍历缓冲区中的元素。

```cpp
auto begin() const -> Iterator
auto end() const -> Iterator
```

这些方法分别返回指向缓冲区开始和结束的迭代器。

## 使用示例

### 基本用法

```cpp
#include "ring_buffer.hpp"
#include <iostream>

int main() {
    RingBuffer<int> buffer(5);

    // 推入元素
    for (int i = 1; i <= 7; ++i) {
        buffer.pushOverwrite(i);
    }

    // 打印缓冲区内容
    std::cout << "缓冲区内容: ";
    for (const auto& item : buffer) {
        std::cout << item << " ";
    }
    std::cout << std::endl;

    // 弹出元素
    while (!buffer.empty()) {
        std::cout << "弹出: " << buffer.pop().value() << std::endl;
    }

    return 0;
}
```

### 使用 forEach 和 removeIf

```cpp
#include "ring_buffer.hpp"
#include <iostream>

int main() {
    RingBuffer<int> buffer(10);

    // 填充缓冲区
    for (int i = 1; i <= 10; ++i) {
        buffer.push(i);
    }

    // 将所有偶数翻倍
    buffer.forEach([](int& x) {
        if (x % 2 == 0) x *= 2;
    });

    // 移除奇数
    buffer.removeIf([](int x) { return x % 2 != 0; });

    // 打印剩余元素
    std::cout << "偶数翻倍后: ";
    for (const auto& item : buffer) {
        std::cout << item << " ";
    }
    std::cout << std::endl;

    return 0;
}
```

### 使用旋转

```cpp
#include "ring_buffer.hpp"
#include <iostream>

int main() {
    RingBuffer<char> buffer(5);

    // 填充缓冲区
    for (char c = 'A'; c <= 'E'; ++c) {
        buffer.push(c);
    }

    std::cout << "原始: ";
    for (const auto& item : buffer) {
        std::cout << item << " ";
    }
    std::cout << std::endl;

    // 向左旋转 2
    buffer.rotate(2);

    std::cout << "向左旋转 2: ";
    for (const auto& item : buffer) {
        std::cout << item << " ";
    }
    std::cout << std::endl;

    // 向右旋转 3
    buffer.rotate(-3);

    std::cout << "向右旋转 3: ";
    for (const auto& item : buffer) {
        std::cout << item << " ";
    }
    std::cout << std::endl;

    return 0;
}
```
