---
title: Tcp客户端
description: TcpClient 类在 atom::connection 命名空间中的详细文档，包括构造函数、公共方法、回调类型和在 C++ 中管理 TCP 客户端连接的使用示例。
---

## 目录

1. [类概述](#类概述)
2. [构造函数和析构函数](#构造函数和析构函数)
3. [公共方法](#公共方法)
   - [connect](#connect)
   - [disconnect](#disconnect)
   - [send](#send)
   - [receive](#receive)
   - [isConnected](#isconnected)
   - [getErrorMessage](#geterrormessage)
   - [setOnConnectedCallback](#setonconnectedcallback)
   - [setOnDisconnectedCallback](#setondisconnectedcallback)
   - [setOnDataReceivedCallback](#setondatareceivedcallback)
   - [setOnErrorCallback](#setonerrorcallback)
   - [startReceiving](#startreceiving)
   - [stopReceiving](#stopreceiving)
4. [回调类型](#回调类型)
5. [使用示例](#使用示例)

## 类概述

```cpp
namespace atom::connection {

class TcpClient : public NonCopyable {
public:
    TcpClient();
    ~TcpClient() override;

    // ... (公共方法)

private:
    class Impl;
    std::unique_ptr<Impl> impl_;
};

}  // namespace atom::connection
```

## 构造函数和析构函数

### 构造函数

```cpp
TcpClient();
```

创建一个新的 `TcpClient` 实例。

### 析构函数

```cpp
~TcpClient() override;
```

销毁 `TcpClient` 实例并清理资源。

## 公共方法

### connect

```cpp
auto connect(const std::string& host, int port,
             std::chrono::milliseconds timeout = std::chrono::milliseconds::zero()) -> bool;
```

连接到 TCP 服务器。

- **参数：**
  - `host`：服务器的主机名或 IP 地址。
  - `port`：服务器的端口号。
  - `timeout`：连接超时持续时间（可选）。
- **返回：** 如果连接成功，则返回 `true`，否则返回 `false`。

### disconnect

```cpp
void disconnect();
```

与服务器断开连接。

### send

```cpp
auto send(const std::vector<char>& data) -> bool;
```

向服务器发送数据。

- **参数：**
  - `data`：要发送的数据。
- **返回：** 如果数据成功发送，则返回 `true`，否则返回 `false`。

### receive

```cpp
auto receive(size_t size, std::chrono::milliseconds timeout = std::chrono::milliseconds::zero())
    -> std::future<std::vector<char>>;
```

从服务器接收数据。

- **参数：**
  - `size`：要接收的字节数。
  - `timeout`：接收超时持续时间（可选）。
- **返回：** 一个 `std::future`，包含接收到的数据。

### isConnected

```cpp
[[nodiscard]] auto isConnected() const -> bool;
```

检查客户端是否已连接到服务器。

- **返回：** 如果连接，则返回 `true`，否则返回 `false`。

### getErrorMessage

```cpp
[[nodiscard]] auto getErrorMessage() const -> std::string;
```

获取任何错误情况下的错误信息。

- **返回：** 错误信息。

### setOnConnectedCallback

```cpp
void setOnConnectedCallback(const OnConnectedCallback& callback);
```

设置连接到服务器时调用的回调函数。

- **参数：**
  - `callback`：回调函数。

### setOnDisconnectedCallback

```cpp
void setOnDisconnectedCallback(const OnDisconnectedCallback& callback);
```

设置与服务器断开连接时调用的回调函数。

- **参数：**
  - `callback`：回调函数。

### setOnDataReceivedCallback

```cpp
void setOnDataReceivedCallback(const OnDataReceivedCallback& callback);
```

设置从服务器接收数据时调用的回调函数。

- **参数：**
  - `callback`：回调函数。

### setOnErrorCallback

```cpp
void setOnErrorCallback(const OnErrorCallback& callback);
```

设置发生错误时调用的回调函数。

- **参数：**
  - `callback`：回调函数。

### startReceiving

```cpp
void startReceiving(size_t bufferSize);
```

开始从服务器接收数据。

- **参数：**
  - `bufferSize`：接收缓冲区的大小。

### stopReceiving

```cpp
void stopReceiving();
```

停止从服务器接收数据。

## 回调类型

`TcpClient` 类定义了几种回调函数类型：

```cpp
using OnConnectedCallback = std::function<void()>;
using OnDisconnectedCallback = std::function<void()>;
using OnDataReceivedCallback = std::function<void(const std::vector<char>&)>;
using OnErrorCallback = std::function<void(const std::string&)>;
```

这些回调类型用于处理 TCP 客户端中的各种事件。

## 使用示例

以下是一些演示如何使用 `TcpClient` 类的示例：

### 基本连接和数据发送

```cpp
#include "tcpclient.hpp"
#include <iostream>
#include <vector>

int main() {
    atom::connection::TcpClient client;

    if (client.connect("example.com", 80)) {
        std::cout << "已连接到服务器" << std::endl;

        std::vector<char> data = {'H', 'e', 'l', 'l', 'o'};
        if (client.send(data)) {
            std::cout << "数据发送成功" << std::endl;
        } else {
            std::cerr << "发送数据失败: " << client.getErrorMessage() << std::endl;
        }

        client.disconnect();
    } else {
        std::cerr << "连接失败: " << client.getErrorMessage() << std::endl;
    }

    return 0;
}
```

### 使用回调

```cpp
#include "tcpclient.hpp"
#include <iostream>
#include <vector>

void onConnected() {
    std::cout << "已连接到服务器" << std::endl;
}

void onDisconnected() {
    std::cout << "与服务器断开连接" << std::endl;
}

void onDataReceived(const std::vector<char>& data) {
    std::cout << "接收到数据: " << std::string(data.begin(), data.end()) << std::endl;
}

void onError(const std::string& errorMessage) {
    std::cerr << "错误: " << errorMessage << std::endl;
}

int main() {
    atom::connection::TcpClient client;

    client.setOnConnectedCallback(onConnected);
    client.setOnDisconnectedCallback(onDisconnected);
    client.setOnDataReceivedCallback(onDataReceived);
    client.setOnErrorCallback(onError);

    if (client.connect("example.com", 80)) {
        client.startReceiving(1024);  // 使用 1KB 缓冲区开始接收

        // 保持连接一段时间
        std::this_thread::sleep_for(std::chrono::seconds(10));

        client.stopReceiving();
        client.disconnect();
    }

    return 0;
}
```

### 异步数据接收

```cpp
#include "tcpclient.hpp"
#include <iostream>
#include <vector>
#include <future>

int main() {
    atom::connection::TcpClient client;

    if (client.connect("example.com", 80)) {
        std::cout << "已连接到服务器" << std::endl;

        // 发送请求
        std::vector<char> request = {'G', 'E', 'T', ' ', '/', '\r', '\n', '\r', '\n'};
        client.send(request);

        // 等待响应
        std::cout << "等待响应..." << std::endl;

        auto futureResponse = client.receive(4096);  // 接收最多 4KB

        try {
            auto response = futureResponse.get();
            std::cout << "接收到响应: " << std::string(response.begin(), response.end()) << std::endl;
        } catch (const std::exception& e) {
            std::cerr << "接收数据时出错: " << e.what() << std::endl;
        }

        client.disconnect();
    } else {
        std::cerr << "连接失败: " << client.getErrorMessage() << std::endl;
    }

    return 0;
}
```

### 实现简单的回声客户端

```cpp
#include "tcpclient.hpp"
#include <iostream>
#include <string>
#include <vector>
#include <thread>

class EchoClient {
public:
    EchoClient() {
        client_.setOnConnectedCallback([this]() { onConnected(); });
        client_.setOnDisconnectedCallback([this]() { onDisconnected(); });
        client_.setOnDataReceivedCallback([this](const std::vector<char>& data) { onDataReceived(data); });
        client_.setOnErrorCallback([this](const std::string& error) { onError(error); });
    }

    void start(const std::string& host, int port) {
        if (client_.connect(host, port)) {
            client_.startReceiving(1024);
            runInputLoop();
        } else {
            std::cerr << "连接失败: " << client_.getErrorMessage() << std::endl;
        }
    }

private:
    void onConnected() {
        std::cout << "已连接到服务器。输入消息（或输入 'quit' 退出）:" << std::endl;
    }

    void onDisconnected() {
        std::cout << "与服务器断开连接。" << std::endl;
    }

    void onDataReceived(const std::vector<char>& data) {
        std::cout << "服务器回声: " << std::string(data.begin(), data.end()) << std::endl;
    }

    void onError(const std::string& error) {
        std::cerr << "错误: " << error << std::endl;
    }

    void runInputLoop() {
        std::string input;
        while (client_.isConnected()) {
            std::getline(std::cin, input);
            if (input == "quit") {
                break;
            }
            std::vector<char> data(input.begin(), input.end());
            if (!client_.send(data)) {
                std::cerr << "发送数据失败: " << client_.getErrorMessage() << std::endl;
            }
        }
        client_.stopReceiving();
        client_.disconnect();
    }

    atom::connection::TcpClient client_;
};

int main() {
    EchoClient echoClient;
    echoClient.start("localhost", 12345);
    return 0;
}
```

### 实现简单的 HTTP 客户端

```cpp
#include "tcpclient.hpp"
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

class SimpleHttpClient {
public:
    SimpleHttpClient(const std::string& host, int port = 80)
        : host_(host), port_(port) {}

    std::string get(const std::string& path) {
        atom::connection::TcpClient client;

        if (!client.connect(host_, port_)) {
            throw std::runtime_error("连接失败: " + client.getErrorMessage());
        }

        std::ostringstream requestStream;
        requestStream << "GET " << path << " HTTP/1.1\r\n"
                      << "Host: " << host_ << "\r\n"
                      << "Connection: close\r\n\r\n";

        std::string request = requestStream.str();
        std::vector<char> requestData(request.begin(), request.end());

        if (!client.send(requestData)) {
            throw std::runtime_error("发送请求失败: " + client.getErrorMessage());
        }

        std::vector<char> responseData;
        auto futureResponse = client.receive(4096);  // 接收最多 4KB

        try {
            responseData = futureResponse.get();
        } catch (const std::exception& e) {
            throw std::runtime_error("接收数据时出错: " + std::string(e.what()));
        }

        client.disconnect();

        return std::string(responseData.begin(), responseData.end());
    }

private:
    std::string host_;
    int port_;
};

int main() {
    try {
        SimpleHttpClient httpClient("example.com");
        std::string response = httpClient.get("/");
        std::cout << "响应:\n" << response << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "错误: " << e.what() << std::endl;
    }

    return 0;
}
```

### 最佳实践和提示

1. **错误处理**：始终检查 `connect()` 和 `send()` 等方法的返回值，并使用 `getErrorMessage()` 获取详细的错误信息。

2. **资源管理**：使用 RAII 原则确保正确清理。`TcpClient` 的析构函数会处理清理，但如果您重用客户端，请确保显式调用 `disconnect()`。

3. **超时处理**：在 `connect()` 和 `receive()` 中使用超时参数，以防在网络问题时挂起。

4. **异步操作**：利用 `receive()` 的异步特性，通过使用 `std::future` 在等待数据时执行其他任务。

5. **缓冲区管理**：根据应用程序的需求和内存限制，为 `startReceiving()` 和 `receive()` 选择合适的缓冲区大小。

6. **线程安全**：`TcpClient` 类不保证线程安全。如果需要从多个线程访问它，请实现适当的同步。

7. **回调处理**：在调用 `connect()` 之前设置回调，以确保不会错过任何事件。

8. **连接状态**：在尝试发送数据或开始接收之前，始终检查 `isConnected()`。

9. **错误回调**：实现错误回调以处理和记录在操作过程中发生的任何错误。

10. **优雅关闭**：在调用 `disconnect()` 之前调用 `stopReceiving()`，以确保接收线程的干净关闭。
