---
title: 线程池
description: 线程安全队列与线程池的实现
---

## 目录

1. [ThreadSafeQueue 类](#threadsafequeue-类)
2. [ThreadPool 类](#threadpool-类)
3. [使用示例](#使用示例)

## ThreadSafeQueue 类

`ThreadSafeQueue` 类是一个线程安全的双端队列（deque）实现。

### 模板参数

- `T`：存储在队列中的元素类型。
- `Lock`：要使用的锁类型（默认是 `std::mutex`）。

### 公共方法

#### 构造函数和赋值运算符

```cpp
ThreadSafeQueue();
ThreadSafeQueue(const ThreadSafeQueue& other);
ThreadSafeQueue& operator=(const ThreadSafeQueue& other);
ThreadSafeQueue(ThreadSafeQueue&& other) noexcept;
ThreadSafeQueue& operator=(ThreadSafeQueue&& other) noexcept;
```

#### 元素访问和修改

```cpp
void pushBack(T&& value);
void pushFront(T&& value);
std::optional<T> popFront();
std::optional<T> popBack();
std::optional<T> steal();
void rotateToFront(const T& item);
std::optional<T> copyFrontAndRotateToBack();
void clear();
```

#### 容量

```cpp
bool empty() const;
size_type size() const;
```

## ThreadPool 类

`ThreadPool` 类提供了一个简单的线程池实现，用于异步执行任务。

### 模板参数

- `FunctionType`：要执行的函数类型（如果可用，默认为 `std::move_only_function<void()>`，否则为 `std::function<void()>`）。
- `ThreadType`：要使用的线程类型（默认为 `std::jthread`）。

### 公共方法

#### 构造函数

```cpp
explicit ThreadPool(
    const unsigned int& number_of_threads = std::thread::hardware_concurrency(),
    InitializationFunction init = [](std::size_t) {});
```

使用指定数量的线程和可选的初始化函数为每个线程创建线程池。

#### 任务入队

```cpp
template <typename Function, typename... Args,
          typename ReturnType = std::invoke_result_t<Function&&, Args&&...>>
std::future<ReturnType> enqueue(Function func, Args... args);

template <typename Function, typename... Args>
void enqueueDetach(Function&& func, Args&&... args);
```

将任务入队以由线程池执行。`enqueue` 返回任务结果的 `std::future`，而 `enqueueDetach` 不返回任何内容。

#### 实用方法

```cpp
std::size_t size() const;
void waitForTasks();
```

`size()` 返回池中的线程数量，`waitForTasks()` 阻塞直到所有任务完成。

## 使用示例

以下示例演示如何使用 `ThreadSafeQueue` 和 `ThreadPool` 类：

### ThreadSafeQueue 示例

```cpp
#include "pool.hpp"
#include <iostream>

int main() {
    atom::async::ThreadSafeQueue<int> queue;

    // 推送元素
    queue.pushBack(1);
    queue.pushBack(2);
    queue.pushFront(0);

    // 弹出元素
    auto front = queue.popFront();
    if (front) {
        std::cout << "前端元素: " << *front << std::endl;
    }

    // 检查大小
    std::cout << "队列大小: " << queue.size() << std::endl;

    // 清空队列
    queue.clear();

    std::cout << "队列为空吗? " << (queue.empty() ? "是" : "否") << std::endl;

    return 0;
}
```

### ThreadPool 示例

```cpp
#include "pool.hpp"
#include <iostream>
#include <vector>

int main() {
    atom::async::ThreadPool pool(4); // 创建一个具有 4 个线程的线程池

    std::vector<std::future<int>> results;

    // 入队任务
    for (int i = 0; i < 10; ++i) {
        results.push_back(pool.enqueue([i] {
            std::this_thread::sleep_for(std::chrono::milliseconds(100));
            return i * i;
        }));
    }

    // 获取结果
    for (auto& result : results) {
        std::cout << "结果: " << result.get() << std::endl;
    }

    // 入队没有返回结果的任务
    pool.enqueueDetach([] {
        std::cout << "分离的任务已执行" << std::endl;
    });

    // 等待所有任务完成
    pool.waitForTasks();

    return 0;
}
```
