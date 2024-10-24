---
title: 详细队列
description: atom::algorithm 命名空间中 message_queue.hpp 头文件的详细文档，包括实现消息队列系统的 MessageQueue 类模板、构造函数、公共方法和使用示例。
---

## 目录

1. [MessageQueue 类模板](#messagequeue-类模板)
2. [构造函数](#构造函数)
3. [公共方法](#公共方法)
4. [私有方法](#私有方法)
5. [使用示例](#使用示例)

## MessageQueue 类模板

`MessageQueue` 类模板提供了一个灵活的消息队列系统，支持使用 Asio 进行异步操作。它允许订阅者接收指定类型 `T` 的消息。

### 关键特性

- 类型安全的消息发布和订阅
- 基于优先级的消息处理
- 订阅者过滤
- 消息处理的超时处理
- 使用 Asio 进行异步消息处理

## 构造函数

```cpp
explicit MessageQueue(asio::io_context& ioContext);
```

使用给定的 Asio `io_context` 构造一个 `MessageQueue` 实例。

## 公共方法

### subscribe

```cpp
void subscribe(CallbackType callback, const std::string& subscriberName,
               int priority = 0, FilterType filter = nullptr,
               std::chrono::milliseconds timeout = std::chrono::milliseconds::zero());
```

订阅消息，提供回调和可选的过滤器和超时。

- **参数：**
  - `callback`：接收到新消息时调用的函数。
  - `subscriberName`：订阅者的名称。
  - `priority`：订阅者的优先级（更高的优先级先接收消息）。
  - `filter`：可选的过滤器，仅接收匹配条件的消息。
  - `timeout`：允许订阅者处理消息的最大时间。

### unsubscribe

```cpp
void unsubscribe(CallbackType callback);
```

使用给定的回调取消订阅消息。

### publish

```cpp
void publish(const T& message, int priority = 0);
```

以可选优先级向队列发布消息。

### startProcessing

```cpp
void startProcessing();
```

开始处理队列中的消息。

### stopProcessing

```cpp
void stopProcessing();
```

停止处理队列中的消息。

### getMessageCount

```cpp
auto getMessageCount() const -> size_t;
```

获取当前队列中的消息数量。

### getSubscriberCount

```cpp
auto getSubscriberCount() const -> size_t;
```

获取当前订阅队列的订阅者数量。

### cancelMessages

```cpp
void cancelMessages(std::function<bool(const T&)> cancelCondition);
```

取消满足给定条件的特定消息。

## 私有方法

### processMessages

```cpp
void processMessages();
```

处理队列中的消息。

### applyFilter

```cpp
bool applyFilter(const Subscriber& subscriber, const T& message);
```

将过滤器应用于给定订阅者的消息。

### handleTimeout

```cpp
bool handleTimeout(const Subscriber& subscriber, const T& message);
```

处理给定订阅者和消息的超时。

## 使用示例

以下示例演示如何使用 `MessageQueue` 类：

### 基本用法

```cpp
#include "message_queue.hpp"
#include <iostream>
#include <string>

int main() {
    asio::io_context io_context;
    atom::async::MessageQueue<std::string> messageQueue(io_context);

    // 订阅消息
    messageQueue.subscribe([](const std::string& msg) {
        std::cout << "收到: " << msg << std::endl;
    }, "Subscriber1");

    // 发布消息
    messageQueue.publish("Hello, World!");

    // 运行 io_context
    io_context.run();

    // 取消订阅
    messageQueue.unsubscribe([](const std::string& msg) {
        std::cout << "收到: " << msg << std::endl;
    });

    return 0;
}
```

### 使用优先级和过滤器

```cpp
auto highPriorityFilter = [](const std::string& msg) {
    return msg.find("URGENT") != std::string::npos;
};

messageQueue.subscribe([](const std::string& msg) {
    std::cout << "高优先级消息: " << msg << std::endl;
}, "HighPrioritySubscriber", 10, highPriorityFilter);

messageQueue.subscribe([](const std::string& msg) {
    std::cout << "普通消息: " << msg << std::endl;
}, "NormalSubscriber", 0);

messageQueue.publish("URGENT: 系统故障", 10);
messageQueue.publish("常规更新", 0);
```

### 使用超时

```cpp
auto slowSubscriber = [](const std::string& msg) {
    std::this_thread::sleep_for(std::chrono::seconds(2));
    std::cout << "慢订阅者处理: " << msg << std::endl;
};

messageQueue.subscribe(slowSubscriber, "SlowSubscriber", 0, nullptr, std::chrono::seconds(1));

messageQueue.publish("此消息可能会超时");
```

### 取消消息

```cpp
messageQueue.publish("消息 1");
messageQueue.publish("消息 2");
messageQueue.publish("消息 3");

messageQueue.cancelMessages([](const std::string& msg) {
    return msg == "消息 2";
});

std::cout << "队列中的消息: " << messageQueue.getMessageCount() << std::endl;
```

### 取消订阅

```cpp
auto callback = [](const std::string& msg) {
    std::cout << "临时订阅者: " << msg << std::endl;
};

messageQueue.subscribe(callback, "TemporarySubscriber");
messageQueue.publish("这将被接收");

messageQueue.unsubscribe(callback);
messageQueue.publish("这不会被临时订阅者接收");
```
