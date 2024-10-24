---
title: 线程安全队列
description: atom::algorithm 命名空间中 ThreadSafeQueue 类模板的详细文档，包括构造函数、公共方法、私有方法和使用示例，用于实现 C++ 中的线程安全队列。
---

## 目录

1. [ThreadSafeQueue 类模板](#threadsafequeue-类模板)
2. [公共方法](#公共方法)
3. [使用示例](#使用示例)

## ThreadSafeQueue 类模板

`ThreadSafeQueue` 类模板提供了线程安全的队列数据结构实现。

### 模板参数

- `T`：存储在队列中的元素类型。

### 关键特性

- 线程安全的操作
- 阻塞和非阻塞元素检索
- 支持谓词和转换
- 并行处理能力

## 公共方法

### 基本队列操作

#### put

```cpp
void put(T element);
```

将元素添加到队列的末尾。

#### take

```cpp
auto take() -> std::optional<T>;
```

从队列中移除并返回前端元素。如果队列为空，则阻塞。

#### tryTake

```cpp
auto tryTake() -> std::optional<T>;
```

尝试在不阻塞的情况下移除并返回队列的前端元素。

#### destroy

```cpp
auto destroy() -> std::queue<T>;
```

销毁队列并返回其内容。

#### size

```cpp
[[nodiscard]] auto size() const -> size_t;
```

返回队列中的元素数量。

#### empty

```cpp
[[nodiscard]] auto empty() const -> bool;
```

检查队列是否为空。

#### clear

```cpp
void clear();
```

移除队列中的所有元素。

#### front

```cpp
auto front() -> std::optional<T>;
```

返回前端元素而不将其移除。

#### back

```cpp
auto back() -> std::optional<T>;
```

返回末尾元素而不将其移除。

#### emplace

```cpp
template <typename... Args>
void emplace(Args&&... args);
```

在队列的末尾原地构造元素。

### 高级操作

#### waitFor

```cpp
template <std::predicate<const T&> Predicate>
auto waitFor(Predicate predicate) -> std::optional<T>;
```

等待满足给定谓词的元素并返回它。

#### waitUntilEmpty

```cpp
void waitUntilEmpty();
```

等待队列变为空。

#### extractIf

```cpp
template <std::predicate<const T&> UnaryPredicate>
auto extractIf(UnaryPredicate pred) -> std::vector<T>;
```

提取所有满足给定谓词的元素。

#### sort

```cpp
template <typename Compare>
void sort(Compare comp);
```

使用提供的比较函数对队列中的元素进行排序。

#### transform

```cpp
template <typename ResultType>
auto transform(std::function<ResultType(T)> func)
    -> std::shared_ptr<ThreadSafeQueue<ResultType>>;
```

对所有元素应用转换函数并返回新队列。

#### groupBy

```cpp
template <typename GroupKey>
auto groupBy(std::function<GroupKey(const T&)> func)
    -> std::vector<std::shared_ptr<ThreadSafeQueue<T>>>;
```

按键函数对元素进行分组并返回一个队列的向量。

#### toVector

```cpp
auto toVector() const -> std::vector<T>;
```

返回包含队列中所有元素的向量。

#### forEach

```cpp
template <typename Func>
void forEach(Func func, bool parallel = false);
```

将函数应用于队列中的每个元素，选择性地并行处理。

#### takeFor

```cpp
template <typename Rep, typename Period>
auto takeFor(const std::chrono::duration<Rep, Period>& timeout)
    -> std::optional<T>;
```

尝试移除并返回前端元素，等待指定的持续时间。

#### takeUntil

```cpp
template <typename Clock, typename Duration>
auto takeUntil(const std::chrono::time_point<Clock, Duration>& timeout_time)
    -> std::optional<T>;
```

尝试移除并返回前端元素，等待直到指定的时间点。

## 使用示例

以下示例演示如何使用 `ThreadSafeQueue` 类：

### 基本用法

```cpp
#include "queue.hpp"
#include <iostream>

int main() {
    atom::async::ThreadSafeQueue<int> queue;

    // 添加元素
    queue.put(1);
    queue.put(2);
    queue.put(3);

    // 移除并打印元素
    while (auto item = queue.take()) {
        std::cout << *item << " ";
    }
    std::cout << std::endl;

    return 0;
}
```

### 使用谓词和转换

```cpp
atom::async::ThreadSafeQueue<int> queue;
for (int i = 1; i <= 10; ++i) {
    queue.put(i);
}

// 等待并提取偶数
auto even = queue.waitFor([](const int& x) { return x % 2 == 0; });
if (even) {
    std::cout << "第一个偶数: " << *even << std::endl;
}

// 提取所有奇数
auto odds = queue.extractIf([](const int& x) { return x % 2 != 0; });
std::cout << "奇数: ";
for (const auto& odd : odds) {
    std::cout << odd << " ";
}
std::cout << std::endl;

// 转换剩余的数字（平方它们）
auto squared = queue.transform<int>([](int x) { return x * x; });
```

### 并行处理

```cpp
atom::async::ThreadSafeQueue<int> queue;
for (int i = 1; i <= 1000; ++i) {
    queue.put(i);
}

// 并行处理元素
queue.forEach([](int& x) {
    x = x * x;  // 平方每个数字
}, true);  // 将并行设置为 true

// 打印结果
queue.forEach([](const int& x) {
    std::cout << x << " ";
});
std::cout << std::endl;
```

### 定时操作

```cpp
atom::async::ThreadSafeQueue<std::string> queue;

// 尝试获取元素，最多等待 2 秒
auto item = queue.takeFor(std::chrono::seconds(2));
if (item) {
    std::cout << "获得项目: " << *item << std::endl;
} else {
    std::cout << "等待项目超时" << std::endl;
}

// 尝试获取元素，直到特定时间点
auto deadline = std::chrono::steady_clock::now() + std::chrono::minutes(1);
auto future_item = queue.takeUntil(deadline);
if (future_item) {
    std::cout << "在截止日期之前获得项目: " << *future_item << std::endl;
} else {
    std::cout << "截止日期已过，未获得项目" << std::endl;
}
```
