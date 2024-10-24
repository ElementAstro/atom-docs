---
title: FIFO服务器
description: FIFOServer 类在 atom::connection 命名空间中的详细文档，包括构造函数、公共方法和管理处理 FIFO 消息的服务器的使用示例。
---

## 目录

1. [类概述](#类概述)
2. [构造函数](#构造函数)
3. [析构函数](#析构函数)
4. [公共方法](#公共方法)
   - [sendMessage](#sendmessage)
   - [start](#start)
   - [stop](#stop)
   - [isRunning](#isrunning)
5. [使用示例](#使用示例)

## 类概述

```cpp
namespace atom::connection {

class FIFOServer {
public:
    explicit FIFOServer(std::string_view fifo_path);
    ~FIFOServer();

    void sendMessage(std::string message);
    void start();
    void stop();
    [[nodiscard]] bool isRunning() const;

private:
    class Impl;
    std::unique_ptr<Impl> impl_;
};

}  // namespace atom::connection
```

## 构造函数

```cpp
explicit FIFOServer(std::string_view fifo_path);
```

创建一个新的 `FIFOServer` 实例。

- **参数：**

  - `fifo_path`：一个字符串视图，表示 FIFO 管道的路径。

- **描述：** 此构造函数使用指定的 FIFO 管道路径初始化 FIFO 服务器。

## 析构函数

```cpp
~FIFOServer();
```

销毁 `FIFOServer` 实例。

- **描述：** 确保所有资源被正确释放，并停止 FIFO 服务器。

## 公共方法

### sendMessage

```cpp
void sendMessage(std::string message);
```

通过 FIFO 管道发送消息。

- **参数：**

  - `message`：要发送的消息（作为字符串）。

- **描述：** 此方法通过 FIFO 管道发送指定的消息。

### start

```cpp
void start();
```

启动 FIFO 服务器。

- **描述：** 启动服务器，允许其处理传入的消息。

### stop

```cpp
void stop();
```

停止 FIFO 服务器。

- **描述：** 停止服务器，防止其处理进一步的消息。

### isRunning

```cpp
[[nodiscard]] bool isRunning() const;
```

检查服务器是否当前正在运行。

- **返回：** 如果服务器正在运行，则返回 `true`，否则返回 `false`。

- **描述：** 用于确定 FIFO 服务器的当前状态。

## 使用示例

以下是一些演示如何使用 `FIFOServer` 类的示例：

### 创建并启动 FIFOServer

```cpp
#include "fifoserver.hpp"
#include <iostream>

int main() {
    atom::connection::FIFOServer server("/tmp/myfifo");

    std::cout << "启动 FIFO 服务器..." << std::endl;
    server.start();

    if (server.isRunning()) {
        std::cout << "FIFO 服务器正在运行。" << std::endl;
    } else {
        std::cerr << "启动 FIFO 服务器失败。" << std::endl;
        return 1;
    }

    // 保持服务器运行
    std::cout << "按 Enter 键停止服务器..." << std::endl;
    std::cin.get();

    server.stop();
    std::cout << "FIFO 服务器已停止。" << std::endl;

    return 0;
}
```

### 使用 FIFOServer 发送消息

```cpp
#include "fifoserver.hpp"
#include <iostream>
#include <thread>
#include <chrono>

int main() {
    atom::connection::FIFOServer server("/tmp/myfifo");

    server.start();

    if (server.isRunning()) {
        std::cout << "FIFO 服务器正在运行。正在发送消息..." << std::endl;

        for (int i = 1; i <= 5; ++i) {
            std::string message = "消息 " + std::to_string(i);
            server.sendMessage(message);
            std::cout << "发送: " << message << std::endl;

            std::this_thread::sleep_for(std::chrono::seconds(1));
        }

        server.stop();
        std::cout << "FIFO 服务器已停止。" << std::endl;
    } else {
        std::cerr << "启动 FIFO 服务器失败。" << std::endl;
        return 1;
    }

    return 0;
}
```

### 在多线程环境中使用 FIFOServer

```cpp
#include "fifoserver.hpp"
#include <iostream>
#include <thread>
#include <atomic>
#include <chrono>

std::atomic<bool> running(true);

void serverThread(atom::connection::FIFOServer& server) {
    server.start();

    while (running && server.isRunning()) {
        // 模拟服务器工作
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }

    server.stop();
}

int main() {
    atom::connection::FIFOServer server("/tmp/myfifo");

    std::thread t(serverThread, std::ref(server));

    // 主线程发送消息
    for (int i = 1; i <= 10; ++i) {
        std::string message = "消息 " + std::to_string(i);
        server.sendMessage(message);
        std::cout << "发送: " << message << std::endl;

        std::this_thread::sleep_for(std::chrono::seconds(1));
    }

    running = false;
    t.join();

    std::cout << "FIFO 服务器已停止。" << std::endl;

    return 0;
}
```
