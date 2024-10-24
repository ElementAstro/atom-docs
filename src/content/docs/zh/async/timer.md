---
title: 计时器
description: atom::async 命名空间中 Timer 类的详细文档，包括构造函数、成员函数、任务调度和使用示例，用于管理 C++ 中的定时任务。
---

## 目录

1. [TimerTask 结构](#timertask-结构)
2. [Timer 类](#timer-类)
3. [公共方法](#公共方法)
4. [使用示例](#使用示例)

## TimerTask 结构

### 概述

`TimerTask` 结构表示定时任务的基本信息，包括要执行的函数、延迟、重复次数和优先级。

### 结构定义

```cpp
class TimerTask {
public:
    explicit TimerTask(std::function<void()> func, unsigned int delay,
                       int repeatCount, int priority);
    auto operator<(const TimerTask &other) const -> bool;
    void run();
    auto getNextExecutionTime() const -> std::chrono::steady_clock::time_point;

    // 成员变量
    std::function<void()> m_func;
    unsigned int m_delay;
    int m_repeatCount;
    int m_priority;
    std::chrono::steady_clock::time_point m_nextExecutionTime;
};
```

### 公共方法

- **构造函数**：初始化定时任务。
- **operator<**：定义比较运算符，以便在优先级队列中排序。
- **run**：执行任务。
- **getNextExecutionTime**：获取下次执行时间。

## Timer 类

`Timer` 类用于调度和管理定时任务。

### 类定义

```cpp
class Timer {
public:
    Timer();
    ~Timer();

    // 公共成员函数
    // ... (详细见下文)

private:
    // 私有成员函数和变量
    // ... (详细见下文)
};
```

### 公共方法

#### setTimeout

```cpp
template <typename Function, typename... Args>
[[nodiscard]] auto setTimeout(Function &&func, unsigned int delay,
                              Args &&...args)
    -> std::future<typename std::invoke_result_t<Function, Args...>>;
```

调度任务在指定延迟后执行一次。

- **参数：**
  - `func`：要执行的函数。
  - `delay`：延迟的毫秒数。
  - `args`：传递给函数的参数。
- **返回值：** 代表函数执行结果的 future。

#### setInterval

```cpp
template <typename Function, typename... Args>
void setInterval(Function &&func, unsigned int interval, int repeatCount,
                 int priority, Args &&...args);
```

调度任务以指定间隔重复执行。

- **参数：**
  - `func`：要执行的函数。
  - `interval`：执行之间的间隔，单位为毫秒。
  - `repeatCount`：函数应重复的次数，-1 表示无限重复。
  - `priority`：任务的优先级。
  - `args`：传递给函数的参数。

#### now

```cpp
[[nodiscard]] auto now() const -> std::chrono::steady_clock::time_point;
```

获取当前时间点。

- **返回值：** 当前的稳态时钟时间点。

#### cancelAllTasks

```cpp
void cancelAllTasks();
```

取消所有已调度的任务。

#### pause

```cpp
void pause();
```

暂停已调度任务的执行。

#### resume

```cpp
void resume();
```

恢复暂停的任务执行。

#### stop

```cpp
void stop();
```

停止计时器并取消所有任务。

#### setCallback

```cpp
template <typename Function>
void setCallback(Function &&func);
```

设置在任务执行时调用的回调函数。

- **参数：**
  - `func`：要设置的回调函数。

#### getTaskCount

```cpp
[[nodiscard]] auto getTaskCount() const -> size_t;
```

获取当前队列中的任务数量。

- **返回值：** 队列中的任务数量。

### 私有成员函数

#### addTask

```cpp
template <typename Function, typename... Args>
auto addTask(Function &&func, unsigned int delay, int repeatCount,
             int priority, Args &&...args)
    -> std::future<typename std::invoke_result_t<Function, Args...>>;
```

将任务添加到任务队列。

- **参数：**
  - `func`：要执行的函数。
  - `delay`：延迟的毫秒数。
  - `repeatCount`：剩余的重复次数。
  - `priority`：任务的优先级。
  - `args`：传递给函数的参数。
- **返回值：** 代表函数执行结果的 future。

#### run

```cpp
void run();
```

处理和运行任务的主执行循环。

## 使用示例

以下示例演示如何使用 `Timer` 类：

### 基本用法

```cpp
#include "timer.hpp"
#include <iostream>
#include <chrono>

int main() {
    atom::async::Timer timer;

    // 设置超时
    timer.setTimeout([]() {
        std::cout << "将在 2 秒后执行。" << std::endl;
    }, 2000);

    // 设置间隔
    timer.setInterval([]() {
        std::cout << "每 1 秒执行一次，执行 5 次。" << std::endl;
    }, 1000, 5, 0);

    // 设置回调
    timer.setCallback([]() {
        std::cout << "任务已执行。" << std::endl;
    });

    // 等待 10 秒
    std::this_thread::sleep_for(std::chrono::seconds(10));

    // 停止计时器
    timer.stop();

    return 0;
}
```

此示例创建一个 `Timer` 对象，设置一个一次性任务的超时，设置一个重复任务的间隔，并设置一个在每次任务执行后调用的回调。然后等待 10 秒后停止计时器。

## 注意事项

- `Timer` 类使用优先队列来管理任务，允许根据执行时间和优先级高效调度。
- 任务可以调度为一次性执行（`setTimeout`）或重复执行（`setInterval`）。
- 该类是线程安全的，使用互斥量和条件变量进行同步。
- 定时器可以暂停、恢复和停止，提供对任务执行的灵活控制。
- 可以设置回调函数，在每次任务执行后调用，便于记录或监控。
- 该类使用 C++11 特性，并可以利用 `std::jthread`（如果可用）进行更高效的线程管理。
