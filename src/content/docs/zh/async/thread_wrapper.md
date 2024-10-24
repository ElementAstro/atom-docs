---
title: 线程包装
description: thread_wrapper.hpp 头文件中 Thread 类的详细文档，包括构造函数、成员函数和使用示例，用于管理 C++20 std::jthread 对象。
---

## 目录

1. [Thread 类](#thread-类)
2. [构造函数](#构造函数)
3. [公共方法](#公共方法)
4. [使用示例](#使用示例)

## Thread 类

`Thread` 类是一个封装类，用于管理 `std::jthread` 对象，提供启动、停止和连接线程的便捷接口。

### 关键特性

- 支持异步任务的执行
- 提供线程停止的机制
- 支持线程 ID 和停止源的获取

## 构造函数

```cpp
explicit Thread() = default;
```

使用默认构造函数创建一个 `Thread` 对象。

## 公共方法

### start

```cpp
template <typename Callable, typename... Args>
void start(Callable&& func, Args&&... args);
```

使用指定的可调用对象和参数启动新线程。

- **参数：**
  - `func`：要在新线程中执行的可调用对象。
  - `args`：传递给可调用对象的参数。

- **行为：**
  - 如果 `func` 可以使用 `std::stop_token` 和提供的参数调用，则将使用 `std::stop_token` 作为第一个参数调用它。
  - 否则，将仅使用提供的参数调用它。

### requestStop

```cpp
void requestStop();
```

请求线程停止执行。

### join

```cpp
void join();
```

等待线程完成执行。

### running

```cpp
[[nodiscard]] auto running() const noexcept -> bool;
```

检查线程是否当前正在运行。

- **返回值：** 如果线程正在运行，则返回 `true`，否则返回 `false`。

### swap

```cpp
void swap(Thread& other) noexcept;
```

交换此 `Thread` 对象的内容与另一个 `Thread` 对象。

- **参数：**
  - `other`：要交换的 `Thread` 对象。

### getThread

```cpp
[[nodiscard]] auto getThread() noexcept -> std::jthread&;
[[nodiscard]] auto getThread() const noexcept -> const std::jthread&;
```

获取底层的 `std::jthread` 对象。

- **返回值：** 对底层 `std::jthread` 对象的引用。

### getId

```cpp
[[nodiscard]] auto getId() const noexcept -> std::thread::id;
```

获取线程的 ID。

- **返回值：** 线程的 ID。

### getStopSource

```cpp
[[nodiscard]] auto getStopSource() noexcept -> std::stop_source;
```

获取底层的 `std::stop_source` 对象。

- **返回值：** 底层的 `std::stop_source` 对象。

### getStopToken

```cpp
[[nodiscard]] auto getStopToken() const noexcept -> std::stop_token;
```

获取底层的 `std::stop_token` 对象。

- **返回值：** 底层的 `std::stop_token` 对象。

## 使用示例

以下是一个演示如何使用 `Thread` 类的简单示例：

```cpp
#include "thread_wrapper.hpp"
#include <iostream>
#include <chrono>

void exampleFunction(std::stop_token stoken, int duration) {
    while (!stoken.stop_requested()) {
        std::cout << "线程正在运行..." << std::endl;
        std::this_thread::sleep_for(std::chrono::seconds(1));
        duration--;
        if (duration <= 0) break;
    }
    std::cout << "线程完成。" << std::endl;
}

int main() {
    atom::async::Thread myThread;
    myThread.start(exampleFunction, 5);

    std::this_thread::sleep_for(std::chrono::seconds(3));
    myThread.requestStop();
    myThread.join();

    return 0;
}
```

在此示例中：

1. 我们创建一个 `Thread` 对象。
2. 我们定义一个名为 `exampleFunction` 的函数，该函数在指定的持续时间内运行。
3. 我们调用 `start` 方法来启动线程。
4. 主线程等待 3 秒后请求停止，然后等待线程完成。

## 注意事项

- `Thread` 类旨在与 C++20 特性（特别是 `std::jthread`）一起使用。
- 提供了比直接使用 `std::jthread` 更高级的线程管理接口。
- 该类不可复制，但可以移动（提供了交换操作）。
- 在销毁 `Thread` 对象之前，重要的是调用 `join()` 或确保线程已经完成，以避免潜在问题。
