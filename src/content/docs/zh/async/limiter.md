---
title: 防抖
description: 速率限制、去抖动和节流
---

## 目录

1. [RateLimiter 类](#ratelimiter-类)
2. [Debounce 类](#debounce-类)
3. [Throttle 类](#throttle-类)
4. [使用示例](#使用示例)

## RateLimiter 类

`RateLimiter` 类旨在控制函数执行的速率。

### 嵌套类和结构

#### Settings 结构

```cpp
struct Settings {
    size_t maxRequests;
    std::chrono::seconds timeWindow;

    explicit Settings(size_t max_requests = 5, std::chrono::seconds time_window = std::chrono::seconds(1));
};
```

定义速率限制器的设置，包括在给定时间窗口内允许的最大请求数量。

#### Awaiter 类

```cpp
class Awaiter {
public:
    Awaiter(RateLimiter& limiter, const std::string& function_name);
    auto await_ready() -> bool;
    void await_suspend(std::coroutine_handle<> handle);
    void await_resume();
};
```

用于在速率限制器中处理协程的 awaiter 类。

### 公共方法

```cpp
RateLimiter();
Awaiter acquire(const std::string& function_name);
void setFunctionLimit(const std::string& function_name, size_t max_requests, std::chrono::seconds time_window);
void pause();
void resume();
void printLog();
auto getRejectedRequests(const std::string& function_name) -> size_t;
```

- `acquire`：获取特定函数的速率限制器。
- `setFunctionLimit`：设置特定函数的速率限制。
- `pause`：暂停速率限制器。
- `resume`：恢复速率限制器。
- `printLog`：打印请求日志。
- `getRejectedRequests`：获取特定函数的被拒绝请求数量。

### 私有方法

```cpp
void cleanup(const std::string& function_name, const std::chrono::seconds& time_window);
void processWaiters();
```

- `cleanup`：清理超出时间窗口的旧请求。
- `processWaiters`：处理等待的协程。

## Debounce 类

`Debounce` 类实现了函数调用的去抖动机制。

### 构造函数

```cpp
Debounce(std::function<void()> func, std::chrono::milliseconds delay, bool leading = false, std::optional<std::chrono::milliseconds> maxWait = std::nullopt);
```

使用指定的函数、延迟、前导标志和可选最大等待时间创建 `Debounce` 对象。

### 公共方法

```cpp
void operator()();
void cancel();
void flush();
void reset();
size_t callCount() const;
```

- `operator()`：如果自上次调用以来延迟已过，则调用去抖动函数。
- `cancel`：取消任何待处理的函数调用。
- `flush`：如果计划调用函数，则立即调用它。
- `reset`：重置去抖动器，清除任何待处理的函数调用和计时器。
- `callCount`：返回函数被调用的次数。

### 私有方法

```cpp
void run();
```

在延迟后在单独的线程中运行该函数。

## Throttle 类

`Throttle` 类为函数调用提供节流，确保它们不会以指定的间隔频繁调用。

### 构造函数

```cpp
Throttle(std::function<void()> func, std::chrono::milliseconds interval, bool leading = false, std::optional<std::chrono::milliseconds> maxWait = std::nullopt);
```

使用指定的函数、间隔、前导标志和可选最大等待时间创建 `Throttle` 对象。

### 公共方法

```cpp
void operator()();
void cancel();
void reset();
auto callCount() const -> size_t;
```

- `operator()`：如果间隔已过，则调用节流函数。
- `cancel`：取消任何待处理的函数调用。
- `reset`：重置节流器，允许函数立即调用（如果需要）。
- `callCount`：返回函数被调用的次数。

## 使用示例

以下示例演示如何使用 `RateLimiter`、`Debounce` 和 `Throttle` 类：

### RateLimiter 示例

```cpp
#include "limiter.hpp"
#include <iostream>
#include <thread>

int main() {
    atom::async::RateLimiter limiter;

    // 为特定函数设置限制
    limiter.setFunctionLimit("myFunction", 5, std::chrono::seconds(10));

    // 在协程中使用速率限制器
    auto myCoroutine = [&]() -> std::future<void> {
        co_await limiter.acquire("myFunction");
        std::cout << "函数执行" << std::endl;
    };

    // 多次调用协程
    for (int i = 0; i < 10; ++i) {
        myCoroutine();
        std::this_thread::sleep_for(std::chrono::seconds(1));
    }

    // 打印日志和被拒绝的请求
    limiter.printLog();
    std::cout << "被拒绝的请求: " << limiter.getRejectedRequests("myFunction") << std::endl;

    return 0;
}
```

### Debounce 示例

```cpp
#include "limiter.hpp"
#include <iostream>
#include <thread>

int main() {
    atom::async::Debounce debouncer(
        []() { std::cout << "去抖动函数被调用" << std::endl; },
        std::chrono::milliseconds(500)
    );

    // 多次调用去抖动的函数
    for (int i = 0; i < 5; ++i) {
        debouncer();
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }

    // 等待以查看去抖动的调用
    std::this_thread::sleep_for(std::chrono::seconds(1));

    std::cout << "函数调用次数: " << debouncer.callCount() << " 次" << std::endl;

    return 0;
}
```

### Throttle 示例

```cpp
#include "limiter.hpp"
#include <iostream>
#include <thread>

int main() {
    atom::async::Throttle throttle(
        []() { std::cout << "节流函数被调用" << std::endl; },
        std::chrono::milliseconds(1000)
    );

    // 多次调用节流的函数
    for (int i = 0; i < 5; ++i) {
        throttle();
        std::this_thread::sleep_for(std::chrono::milliseconds(500));
    }

    // 等待以查看所有节流调用
    std::this_thread::sleep_for(std::chrono::seconds(5));

    std::cout << "函数调用次数: " << throttle.callCount() << " 次" << std::endl;

    return 0;
}
```
