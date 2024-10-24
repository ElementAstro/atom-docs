---
title: UdpSocketHub 类文档
description: UdpSocketHub 类在 atom::connection 命名空间中的详细文档，包括构造函数、公共方法、消息处理和在 C++ 中管理 UDP 套接字通信的使用示例。
---

## 类声明

```cpp
namespace atom::connection {
    class UdpSocketHub {
        // ... (类成员和方法)
    };
}
```

## 构造函数和析构函数

### 构造函数

```cpp
UdpSocketHub();
```

创建一个新的 `UdpSocketHub` 实例。

### 析构函数

```cpp
~UdpSocketHub();
```

销毁 `UdpSocketHub` 实例并释放任何资源。

## 公共方法

### start

```cpp
void start(int port);
```

启动 UDP 套接字中心并将其绑定到指定端口。

- **参数：**
  - `port`：UDP 套接字中心将监听传入消息的端口。

#### 示例：

```cpp
UdpSocketHub hub;
hub.start(8080);
std::cout << "UDP 套接字中心已在端口 8080 启动" << std::endl;
```

### stop

```cpp
void stop();
```

停止 UDP 套接字中心。

#### 示例：

```cpp
hub.stop();
std::cout << "UDP 套接字中心已停止" << std::endl;
```

### isRunning

```cpp
bool isRunning() const;
```

检查 UDP 套接字中心是否当前正在运行。

- **返回：** 如果 UDP 套接字中心正在运行，则返回 `true`，否则返回 `false`。

#### 示例：

```cpp
if (hub.isRunning()) {
    std::cout << "UDP 套接字中心正在运行" << std::endl;
} else {
    std::cout << "UDP 套接字中心未运行" << std::endl;
}
```

### addMessageHandler

```cpp
void addMessageHandler(MessageHandler handler);
```

向 UDP 套接字中心添加消息处理函数。

- **参数：**
  - `handler`：要添加的消息处理函数。应具有签名 `void(const std::string&, const std::string&, int)`。

#### 示例：

```cpp
hub.addMessageHandler([](const std::string& message, const std::string& ip, int port) {
    std::cout << "从 " << ip << ":" << port << " 接收到消息: " << message << std::endl;
});
```

### removeMessageHandler

```cpp
void removeMessageHandler(MessageHandler handler);
```

从 UDP 套接字中心移除消息处理函数。

- **参数：**
  - `handler`：要移除的消息处理函数。

#### 示例：

```cpp
auto handler = [](const std::string& message, const std::string& ip, int port) {
    std::cout << "从 " << ip << ":" << port << " 接收到消息: " << message << std::endl;
};

hub.addMessageHandler(handler);
// ... 稍后 ...
hub.removeMessageHandler(handler);
```

### sendTo

```cpp
void sendTo(const std::string& message, const std::string& ip, int port);
```

向指定的 IP 地址和端口发送消息。

- **参数：**
  - `message`：要发送的消息。
  - `ip`：接收者的 IP 地址。
  - `port`：接收者的端口。

#### 示例：

```cpp
hub.sendTo("Hello, UDP!", "192.168.1.100", 8888);
std::cout << "消息已发送到 192.168.1.100:8888" << std::endl;
```

## 使用示例

以下是一个完整示例，演示如何使用 `UdpSocketHub` 类：

```cpp
#include "udp_server.hpp"
#include <iostream>
#include <thread>
#include <chrono>

int main() {
    atom::connection::UdpSocketHub hub;

    // 添加消息处理程序
    hub.addMessageHandler([](const std::string& message, const std::string& ip, int port) {
        std::cout << "从 " << ip << ":" << port << " 接收到消息: " << message << std::endl;

        // 将消息回显
        hub.sendTo("Echo: " + message, ip, port);
    });

    // 启动 UDP 套接字中心
    hub.start(8080);
    std::cout << "UDP 套接字中心已在端口 8080 启动" << std::endl;

    // 让服务器运行一段时间
    std::this_thread::sleep_for(std::chrono::seconds(60));

    // 停止 UDP 套接字中心
    hub.stop();
    std::cout << "UDP 套接字中心已停止" << std::endl;

    return 0;
}
```

## 最佳实践

1. **错误处理**：尽管类接口中未显示，但在使用 `UdpSocketHub` 时实现适当的错误处理。当启动服务器或发送消息时，检查可能抛出的任何异常。

2. **线程安全**：如果在多线程环境中使用 `UdpSocketHub`，确保对共享资源的访问得到适当同步。

3. **资源管理**：`UdpSocketHub` 类通过使用 `std::unique_ptr` 来实现 RAII（资源获取即初始化）。这确保了在 `UdpSocketHub` 实例被销毁时，资源被正确清理。

4. **消息处理程序管理**：在添加和移除消息处理程序时要小心。如果需要移除特定的处理程序，请确保在添加时保留对其的引用。

5. **优雅关闭**：在销毁 `UdpSocketHub` 实例之前，始终调用 `stop()` 方法，以确保所有资源被正确释放，任何正在进行的操作被干净地终止。
