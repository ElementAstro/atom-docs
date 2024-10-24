---
title: Udp客户端
description: UdpClient 类在 atom::connection 命名空间中的详细文档，包括构造函数、公共方法、回调设置和在 C++ 中进行 UDP 通信的使用示例。
---

## 类声明

```cpp
namespace atom::connection {
    class UdpClient {
        // ... (类成员和方法)
    };
}
```

## 构造函数和析构函数

### 构造函数

```cpp
UdpClient();
```

创建一个新的 `UdpClient` 实例。

### 析构函数

```cpp
~UdpClient();
```

销毁 `UdpClient` 实例并释放任何资源。

## 公共方法

### bind

```cpp
bool bind(int port);
```

将客户端绑定到特定端口以接收数据。

- **参数：**
  - `port`：要绑定的端口号。
- **返回：** 如果绑定成功，则返回 `true`，否则返回 `false`。

#### 示例

```cpp
UdpClient client;
if (client.bind(8080)) {
    std::cout << "客户端已绑定到端口 8080" << std::endl;
} else {
    std::cerr << "绑定客户端失败" << std::endl;
}
```

### send

```cpp
bool send(const std::string& host, int port, const std::vector<uint8_t>& data);
```

向指定的主机和端口发送数据。

- **参数：**
  - `host`：目标主机地址。
  - `port`：目标端口号。
  - `data`：要发送的数据。
- **返回：** 如果数据成功发送，则返回 `true`，否则返回 `false`。

#### 示例

```cpp
std::vector<uint8_t> data = {0x48, 0x65, 0x6C, 0x6C, 0x6F}; // "Hello" 的 ASCII 码
if (client.send("192.168.1.100", 8888, data)) {
    std::cout << "数据发送成功" << std::endl;
} else {
    std::cerr << "发送数据失败" << std::endl;
}
```

### receive

```cpp
std::vector<uint8_t> receive(
    size_t size,
    std::string& remoteHost,
    int& remotePort,
    std::chrono::milliseconds timeout = std::chrono::milliseconds::zero()
);
```

从远程主机接收数据。

- **参数：**
  - `size`：要接收的字节数。
  - `remoteHost`：引用，用于存储远程主机的主机名或 IP 地址。
  - `remotePort`：引用，用于存储远程主机的端口号。
  - `timeout`：接收超时持续时间（默认为零，表示没有超时）。
- **返回：** 接收到的数据，作为字节向量。

#### 示例

```cpp
std::string remoteHost;
int remotePort;
std::vector<uint8_t> receivedData = client.receive(1024, remoteHost, remotePort, std::chrono::milliseconds(5000));
if (!receivedData.empty()) {
    std::cout << "从 " << remoteHost << ":" << remotePort << " 接收到 " << receivedData.size() << " 字节" << std::endl;
} else {
    std::cout << "在超时内未接收到数据" << std::endl;
}
```

### setOnDataReceivedCallback

```cpp
void setOnDataReceivedCallback(const OnDataReceivedCallback& callback);
```

设置在接收到数据时调用的回调函数。

- **参数：**
  - `callback`：回调函数，签名为 `void(const std::vector<uint8_t>&, const std::string&, int)`。

#### 示例

```cpp
client.setOnDataReceivedCallback([](const std::vector<uint8_t>& data, const std::string& host, int port) {
    std::cout << "接收到 " << data.size() << " 字节来自 " << host << ":" << port << std::endl;
});
```

### setOnErrorCallback

```cpp
void setOnErrorCallback(const OnErrorCallback& callback);
```

设置在发生错误时调用的回调函数。

- **参数：**
  - `callback`：回调函数，签名为 `void(const std::string&)`。

#### 示例

```cpp
client.setOnErrorCallback([](const std::string& errorMessage) {
    std::cerr << "错误: " << errorMessage << std::endl;
});
```

### startReceiving

```cpp
void startReceiving(size_t bufferSize);
```

开始异步接收数据。

- **参数：**
  - `bufferSize`：接收缓冲区的大小。

#### 示例

```cpp
client.startReceiving(1024);
```

### stopReceiving

```cpp
void stopReceiving();
```

停止接收数据。

#### 示例

```cpp
client.stopReceiving();
```

## 使用示例

以下是一个完整示例，演示如何使用 `UdpClient` 类：

```cpp
#include "udpclient.hpp"
#include <iostream>
#include <thread>

int main() {
    atom::connection::UdpClient client;

    // 绑定到本地端口
    if (!client.bind(8080)) {
        std::cerr << "绑定到端口 8080 失败" << std::endl;
        return 1;
    }

    // 设置回调
    client.setOnDataReceivedCallback([](const std::vector<uint8_t>& data, const std::string& host, int port) {
        std::cout << "接收到 " << data.size() << " 字节来自 " << host << ":" << port << std::endl;
    });

    client.setOnErrorCallback([](const std::string& errorMessage) {
        std::cerr << "错误: " << errorMessage << std::endl;
    });

    // 开始接收数据
    client.startReceiving(1024);

    // 发送一些数据
    std::vector<uint8_t> dataToSend = {0x48, 0x65, 0x6C, 0x6C, 0x6F}; // "Hello" 的 ASCII 码
    if (client.send("127.0.0.1", 8888, dataToSend)) {
        std::cout << "数据发送成功" << std::endl;
    } else {
        std::cerr << "发送数据失败" << std::endl;
    }

    // 让程序运行一段时间
    std::this_thread::sleep_for(std::chrono::seconds(10));

    // 停止接收
    client.stopReceiving();

    return 0;
}
```

## 最佳实践

1. **错误处理**：始终检查方法的返回值，确保正确处理连接和数据传输中的任何错误。

2. **资源管理**：确保在不再需要时调用 `stopReceiving()` 和 `disconnect()`，以释放资源。

3. **回调设置**：在调用 `startReceiving()` 之前设置回调，以确保不会错过任何事件。

4. **缓冲区大小**：根据您的应用程序需求选择适当的缓冲区大小。

5. **异步接收**：利用异步接收功能，避免在等待数据时阻塞主线程。

6. **超时管理**：使用超时参数来防止在网络问题时挂起。

7. **测试与调试**：在开发阶段启用调试信息，以帮助识别和解决问题。
