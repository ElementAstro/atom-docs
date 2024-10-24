---
title: 消息总线
description: atom::algorithm 命名空间中 message_bus.hpp 头文件的详细文档，包括用于管理异步消息传递的 MessageBus 类及其方法、异常处理和使用示例。
---

## 目录

1. [MessageBus 类](#messagebus-类)
2. [构造函数和静态方法](#构造函数和静态方法)
3. [发布方法](#发布方法)
4. [订阅方法](#订阅方法)
5. [取消订阅方法](#取消订阅方法)
6. [查询方法](#查询方法)
7. [实用方法](#实用方法)
8. [使用示例](#使用示例)

## MessageBus 类

`MessageBus` 类提供了一个灵活的消息总线系统，支持使用 Asio 进行异步操作。

### 关键特性

- 类型安全的消息发布和订阅
- 支持延迟消息发布
- 基于命名空间的消息路由
- 异步和同步消息处理
- 消息过滤
- 消息历史跟踪

## 构造函数和静态方法

### 构造函数

```cpp
explicit MessageBus(asio::io_context& io_context);
```

使用给定的 Asio `io_context` 构造一个 `MessageBus` 实例。

### 静态工厂方法

```cpp
static auto createShared(asio::io_context& io_context) -> std::shared_ptr<MessageBus>;
```

创建并返回指向新 `MessageBus` 实例的共享指针。

## 发布方法

### publish

```cpp
template <typename MessageType>
void publish(const std::string& name, const MessageType& message,
             std::optional<std::chrono::milliseconds> delay = std::nullopt);
```

发布消息到总线，选项上可以设置延迟。

### publishGlobal

```cpp
template <typename MessageType>
void publishGlobal(const MessageType& message);
```

全局发布消息给所有订阅者。

## 订阅方法

### subscribe

```cpp
template <typename MessageType>
auto subscribe(const std::string& name,
               std::function<void(const MessageType&)> handler,
               bool async = true,
               bool once = false,
               std::function<bool(const MessageType&)> filter = [](const MessageType&) { return true; }) -> Token;
```

订阅具有给定名称和处理程序函数的消息。

- **参数：**
  - `name`：要订阅的消息名称。
  - `handler`：收到消息时调用的函数。
  - `async`：是否异步调用处理程序（默认值：true）。
  - `once`：接收到第一次消息后是否取消订阅（默认值：false）。
  - `filter`：可选的消息过滤函数（默认：接受所有消息）。

返回一个令牌，可用于稍后取消订阅。

## 取消订阅方法

### unsubscribe

```cpp
template <typename MessageType>
void unsubscribe(Token token);
```

使用给定的令牌取消订阅消息。

### unsubscribeAll

```cpp
template <typename MessageType>
void unsubscribeAll(const std::string& name);
```

取消所有给定消息名称的处理程序。

### clearAllSubscribers

```cpp
void clearAllSubscribers();
```

清除消息总线中的所有订阅者。

## 查询方法

### getSubscriberCount

```cpp
template <typename MessageType>
auto getSubscriberCount(const std::string& name) -> std::size_t;
```

获取给定消息名称的订阅者数量。

### getNamespaceSubscriberCount

```cpp
template <typename MessageType>
auto getNamespaceSubscriberCount(const std::string& namespaceName) -> std::size_t;
```

获取给定命名空间的订阅者数量。

### hasSubscriber

```cpp
template <typename MessageType>
auto hasSubscriber(const std::string& name) -> bool;
```

检查是否有任何订阅者订阅给定的消息名称。

### getActiveNamespaces

```cpp
auto getActiveNamespaces() const -> std::vector<std::string>;
```

获取活动命名空间的列表。

## 实用方法

### getMessageHistory

```cpp
template <typename MessageType>
auto getMessageHistory(const std::string& name) const -> std::vector<MessageType>;
```

获取给定消息名称的消息历史。

## 使用示例

以下示例演示如何使用 `MessageBus` 类：

### 基本用法

```cpp
#include "message_bus.hpp"
#include <iostream>
#include <string>

int main() {
    asio::io_context io_context;
    auto messageBus = atom::async::MessageBus::createShared(io_context);

    // 订阅消息
    auto token = messageBus->subscribe<std::string>("greeting", [](const std::string& msg) {
        std::cout << "收到: " << msg << std::endl;
    });

    // 发布消息
    messageBus->publish("greeting", std::string("Hello, World!"));

    // 运行 io_context
    io_context.run();

    // 取消订阅
    messageBus->unsubscribe<std::string>(token);

    return 0;
}
```

### 延迟发布

```cpp
messageBus->publish("delayed_message", std::string("此消息被延迟"),
                    std::chrono::milliseconds(1000));
```

### 使用过滤器

```cpp
messageBus->subscribe<int>("number", [](int num) {
    std::cout << "收到偶数: " << num << std::endl;
}, true, false, [](int num) { return num % 2 == 0; });

messageBus->publish("number", 1);  // 不会被接收
messageBus->publish("number", 2);  // 会被接收
```

### 基于命名空间的路由

```cpp
messageBus->subscribe<std::string>("system.log", [](const std::string& log) {
    std::cout << "系统日志: " << log << std::endl;
});

messageBus->subscribe<std::string>("system.error", [](const std::string& error) {
    std::cerr << "系统错误: " << error << std::endl;
});

messageBus->publish("system.log", std::string("应用程序启动"));
messageBus->publish("system.error", std::string("连接失败"));
```

### 查询消息总线状态

```cpp
auto subscriberCount = messageBus->getSubscriberCount<std::string>("greeting");
auto namespaceCount = messageBus->getNamespaceSubscriberCount<std::string>("system");
auto activeNamespaces = messageBus->getActiveNamespaces();

std::cout << "'greeting' 的订阅者数量: " << subscriberCount << std::endl;
std::cout << "'system' 命名空间的订阅者数量: " << namespaceCount << std::endl;
std::cout << "活动命名空间: ";
for (const auto& ns : activeNamespaces) {
    std::cout << ns << " ";
}
std::cout << std::endl;
```
