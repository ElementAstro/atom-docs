---
title: SocketHub
description: SocketHub 类在 atom::connection 命名空间中的详细文档，包括构造函数、公共方法和管理 C++ 中的套接字连接的使用示例。
---

## 目录

1. [类概述](#类概述)
2. [构造函数和析构函数](#构造函数和析构函数)
3. [公共方法](#公共方法)
   - [start](#start)
   - [stop](#stop)
   - [addHandler](#addhandler)
   - [isRunning](#isrunning)
4. [使用示例](#使用示例)

## 类概述

```cpp
namespace atom::connection {

class SocketHub {
public:
    SocketHub();
    ~SocketHub();

    void start(int port);
    void stop();
    void addHandler(std::function<void(std::string)> handler);
    [[nodiscard]] auto isRunning() const -> bool;

private:
    std::unique_ptr<SocketHubImpl> impl_;
};

}  // namespace atom::connection
```

## 构造函数和析构函数

### 构造函数

```cpp
SocketHub();
```

创建一个新的 `SocketHub` 实例。

### 析构函数

```cpp
~SocketHub();
```

销毁 `SocketHub` 实例，清理资源并停止任何正在进行的套接字操作。

## 公共方法

### start

```cpp
void start(int port);
```

启动套接字服务。

- **参数：**

  - `port`：套接字服务将监听的端口号。

- **描述：** 初始化套接字服务并开始在指定端口监听传入连接。它会为每个连接的客户端生成线程进行处理。

### stop

```cpp
void stop();
```

停止套接字服务。

- **描述：** 关闭套接字服务，关闭所有客户端连接，并停止与处理客户端消息相关的任何运行线程。

### addHandler

```cpp
void addHandler(std::function<void(std::string)> handler);
```

添加消息处理程序。

- **参数：**

  - `handler`：用于处理来自客户端的传入消息的函数。

- **描述：** 提供的处理程序函数将在接收到消息时被调用，消息作为字符串参数传递。可以添加多个处理程序，它们将按添加顺序被调用。

### isRunning

```cpp
[[nodiscard]] auto isRunning() const -> bool;
```

检查套接字服务是否当前正在运行。

- **返回：** 如果套接字服务正在运行，则返回 `true`，否则返回 `false`。

- **描述：** 此方法返回套接字服务的状态，指示其当前是否活动并监听连接。

## 使用示例

以下是一些演示如何使用 `SocketHub` 类的示例：

### 基本用法：启动和停止 SocketHub

```cpp
#include "sockethub.hpp"
#include <iostream>
#include <thread>
#include <chrono>

int main() {
    atom::connection::SocketHub hub;

    // 在端口 8080 上启动套接字服务
    hub.start(8080);

    if (hub.isRunning()) {
        std::cout << "SocketHub 正在端口 8080 上运行" << std::endl;

        // 让服务运行 1 分钟
        std::this_thread::sleep_for(std::chrono::minutes(1));

        // 停止服务
        hub.stop();
        std::cout << "SocketHub 已停止" << std::endl;
    } else {
        std::cerr << "启动 SocketHub 失败" << std::endl;
    }

    return 0;
}
```

### 添加消息处理程序

```cpp
#include "sockethub.hpp"
#include <iostream>
#include <thread>
#include <chrono>

void messageHandler(const std::string& message) {
    std::cout << "接收到消息: " << message << std::endl;
}

int main() {
    atom::connection::SocketHub hub;

    // 添加消息处理程序
    hub.addHandler(messageHandler);

    // 在端口 8080 上启动套接字服务
    hub.start(8080);

    if (hub.isRunning()) {
        std::cout << "SocketHub 正在端口 8080 上运行" << std::endl;

        // 让服务运行 5 分钟
        std::this_thread::sleep_for(std::chrono::minutes(5));

        // 停止服务
        hub.stop();
        std::cout << "SocketHub 已停止" << std::endl;
    } else {
        std::cerr << "启动 SocketHub 失败" << std::endl;
    }

    return 0;
}
```

### 使用多个处理程序和 Lambda 函数

```cpp
#include "sockethub.hpp"
#include <iostream>
#include <thread>
#include <chrono>

int main() {
    atom::connection::SocketHub hub;

    // 添加多个处理程序
    hub.addHandler([](const std::string& message) {
        std::cout << "处理程序 1: " << message << std::endl;
    });

    hub.addHandler([](const std::string& message) {
        std::cout << "处理程序 2: " << message.length() << " 个字符" << std::endl;
    });

    // 在端口 8080 上启动套接字服务
    hub.start(8080);

    if (hub.isRunning()) {
        std::cout << "SocketHub 正在端口 8080 上运行" << std::endl;

        // 让服务运行 10 分钟
        std::this_thread::sleep_for(std::chrono::minutes(10));

        // 停止服务
        hub.stop();
        std::cout << "SocketHub 已停止" << std::endl;
    } else {
        std::cerr << "启动 SocketHub 失败" << std::endl;
    }

    return 0;
}
```
