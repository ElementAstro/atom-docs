---
title: 串口基础组件
description: TTYBase 类的详细文档，包括处理 TTY 连接、读取和写入数据、管理连接和错误处理的方法。
---

## 目录

1. [类概述](#类概述)
2. [枚举](#枚举)
3. [构造函数和析构函数](#构造函数和析构函数)
4. [公共方法](#公共方法)
   - [read](#read)
   - [readSection](#readsection)
   - [write](#write)
   - [writeString](#writestring)
   - [connect](#connect)
   - [disconnect](#disconnect)
   - [setDebug](#setdebug)
   - [getErrorMessage](#geterrormessage)
   - [getPortFD](#getportfd)
5. [使用示例](#使用示例)

## 类概述

```cpp
class TTYBase {
public:
    enum class TTYResponse { ... };

    explicit TTYBase(std::string_view driverName);
    virtual ~TTYBase();

    // 公共方法
    // ...

private:
    TTYResponse checkTimeout(uint8_t timeout);

    int m_PortFD{-1};
    bool m_Debug{false};
    std::string_view m_DriverName;
};
```

## 枚举

### TTYResponse

```cpp
enum class TTYResponse {
    OK = 0,
    ReadError = -1,
    WriteError = -2,
    SelectError = -3,
    Timeout = -4,
    PortFailure = -5,
    ParamError = -6,
    Errno = -7,
    Overflow = -8
};
```

此枚举表示 TTY 操作可能的响应。

## 构造函数和析构函数

### 构造函数

```cpp
explicit TTYBase(std::string_view driverName);
```

使用指定的驱动程序名称构造一个 TTYBase 实例。

- **参数：**
  - `driverName`：要使用的 TTY 驱动程序的名称。

### 析构函数

```cpp
virtual ~TTYBase();
```

清理与 TTY 连接相关的资源。

## 公共方法

### read

```cpp
TTYResponse read(uint8_t* buffer, uint32_t nbytes, uint8_t timeout, uint32_t& nbytesRead);
```

从 TTY 设备读取数据。

- **参数：**
  - `buffer`：指向存储读取数据的缓冲区的指针。
  - `nbytes`：要从 TTY 读取的字节数。
  - `timeout`：读取操作的超时持续时间（以秒为单位）。
  - `nbytesRead`：引用，存储实际读取的字节数。
- **返回：** 表示读取操作结果的 `TTYResponse`。

### readSection

```cpp
TTYResponse readSection(uint8_t* buffer, uint32_t nsize, uint8_t stopByte, uint8_t timeout, uint32_t& nbytesRead);
```

从 TTY 读取一段数据，直到遇到停止字节。

- **参数：**
  - `buffer`：指向存储读取数据的缓冲区的指针。
  - `nsize`：最大读取的字节数。
  - `stopByte`：将停止读取的字节值。
  - `timeout`：读取操作的超时持续时间（以秒为单位）。
  - `nbytesRead`：引用，存储实际读取的字节数。
- **返回：** 表示读取操作结果的 `TTYResponse`。

### write

```cpp
TTYResponse write(const uint8_t* buffer, uint32_t nbytes, uint32_t& nbytesWritten);
```

向 TTY 设备写入数据。

- **参数：**
  - `buffer`：指向要写入的数据的指针。
  - `nbytes`：要写入 TTY 的字节数。
  - `nbytesWritten`：引用，存储实际写入的字节数。
- **返回：** 表示写入操作结果的 `TTYResponse`。

### writeString

```cpp
TTYResponse writeString(std::string_view string, uint32_t& nbytesWritten);
```

向 TTY 设备写入字符串。

- **参数：**
  - `string`：要写入 TTY 的字符串。
  - `nbytesWritten`：引用，存储实际写入的字节数。
- **返回：** 表示写入操作结果的 `TTYResponse`。

### connect

```cpp
TTYResponse connect(std::string_view device, uint32_t bitRate, uint8_t wordSize, uint8_t parity, uint8_t stopBits);
```

连接到指定的 TTY 设备。

- **参数：**
  - `device`：要连接的设备名称或路径。
  - `bitRate`：连接的波特率。
  - `wordSize`：每个字符的数据大小（以位为单位）。
  - `parity`：奇偶校验模式（例如，无、奇、偶）。
  - `stopBits`：通信中使用的停止位数。
- **返回：** 表示连接尝试结果的 `TTYResponse`。

### disconnect

```cpp
TTYResponse disconnect();
```

与 TTY 设备断开连接。

- **返回：** 表示断开连接结果的 `TTYResponse`。

### setDebug

```cpp
void setDebug(bool enabled);
```

启用或禁用调试信息。

- **参数：**
  - `enabled`：`true` 启用调试，`false` 禁用。

### getErrorMessage

```cpp
std::string getErrorMessage(TTYResponse code) const;
```

检索给定 TTYResponse 代码对应的错误信息。

- **参数：**
  - `code`：要获取错误信息的 TTYResponse 代码。
- **返回：** 包含错误信息的字符串。

### getPortFD

```cpp
int getPortFD() const;
```

获取 TTY 端口的文件描述符。

- **返回：** TTY 端口的整数文件描述符。

## 使用示例

以下是一些演示如何使用 `TTYBase` 类的示例：

### 连接到 TTY 设备

```cpp
#include "ttybase.hpp"
#include <iostream>

int main() {
    TTYBase tty("MyDriver");

    TTYBase::TTYResponse response = tty.connect("/dev/ttyUSB0", 9600, 8, 0, 1);
    if (response == TTYBase::TTYResponse::OK) {
        std::cout << "成功连接到 TTY 设备。" << std::endl;
    } else {
        std::cerr << "连接失败: " << tty.getErrorMessage(response) << std::endl;
        return 1;
    }

    // 使用 TTY 连接...

    tty.disconnect();
    return 0;
}
```

### 从 TTY 设备读取数据

```cpp
TTYBase tty("MyDriver");
// 假设我们已经连接到设备

uint8_t buffer[256];
uint32_t bytesRead;
TTYBase::TTYResponse response = tty.read(buffer, sizeof(buffer), 5, bytesRead);

if (response == TTYBase::TTYResponse::OK) {
    std::cout << "读取 " << bytesRead << " 字节: ";
    for (uint32_t i = 0; i < bytesRead; ++i) {
        std::cout << std::hex << static_cast<int>(buffer[i]) << " ";
    }
    std::cout << std::endl;
} else {
    std::cerr << "读取失败: " << tty.getErrorMessage(response) << std::endl;
}
```

### 向 TTY 设备写入数据

```cpp
#include "ttybase.hpp"
#include <iostream>
#include <thread>
#include <atomic>

class SimpleTerminal {
public:
    SimpleTerminal(const std::string& device) : m_tty("SimpleTerminal") {
        if (m_tty.connect(device, 9600, 8, 0, 1) != TTYBase::TTYResponse::OK) {
            throw std::runtime_error("连接到 TTY 设备失败");
        }
    }

    ~SimpleTerminal() {
        m_running = false;
        if (m_readThread.joinable()) {
            m_readThread.join();
        }
        m_tty.disconnect();
    }

    void run() {
        m_readThread = std::thread(&SimpleTerminal::readLoop, this);
        writeLoop();
    }

private:
    void readLoop() {
        uint8_t buffer[256];
        uint32_t bytesRead;

        while (m_running) {
            TTYBase::TTYResponse response = m_tty.read(buffer, sizeof(buffer), 1, bytesRead);
            if (response == TTYBase::TTYResponse::OK && bytesRead > 0) {
                std::cout.write(reinterpret_cast<char*>(buffer), bytesRead);
                std::cout.flush();
            }
        }
    }

    void writeLoop() {
        std::string input;
        while (m_running && std::getline(std::cin, input)) {
            input += '\n';  // 添加换行符
            uint32_t bytesWritten;
            TTYBase::TTYResponse response = m_tty.writeString(input, bytesWritten);
            if (response != TTYBase::TTYResponse::OK) {
                std::cerr << "写入失败: " << m_tty.getErrorMessage(response) << std::endl;
            }
        }
    }

    TTYBase m_tty;
    std::thread m_readThread;
    std::atomic<bool> m_running{true};
};

int main(int argc, char* argv[]) {
    if (argc != 2) {
        std::cerr << "用法: " << argv[0] << " <tty_device>" << std::endl;
        return 1;
    }

    try {
        SimpleTerminal terminal(argv[1]);
        terminal.run();
    } catch (const std::exception& e) {
        std::cerr << "错误: " << e.what() << std::endl;
        return 1;
    }

    return 0;
}
```

此示例创建了一个简单的终端仿真器，持续从 TTY 设备读取并将用户输入写入设备。

### 实现协议解析器

如果您正在通过 TTY 使用特定协议，您可能希望实现一个解析器。以下是一个假设协议的基本示例：

```cpp
#include "ttybase.hpp"
#include <vector>
#include <iostream>

class ProtocolParser {
public:
    ProtocolParser(TTYBase& tty) : m_tty(tty) {}

    bool readMessage(std::vector<uint8_t>& message) {
        uint8_t header[2];
        uint32_t bytesRead;

        // 读取头部
        if (m_tty.read(header, 2, 5, bytesRead) != TTYBase::TTYResponse::OK || bytesRead != 2) {
            return false;
        }

        // 检查开始字节
        if (header[0] != 0xAA) {
            return false;
        }

        uint8_t length = header[1];
        message.resize(length);

        // 读取消息主体
        if (m_tty.read(message.data(), length, 5, bytesRead) != TTYBase::TTYResponse::OK || bytesRead != length) {
            return false;
        }

        return true;
    }

    bool sendMessage(const std::vector<uint8_t>& message) {
        if (message.size() > 255) {
            return false;
        }

        std::vector<uint8_t> fullMessage;
        fullMessage.push_back(0xAA);  // 开始字节
        fullMessage.push_back(static_cast<uint8_t>(message.size()));
        fullMessage.insert(fullMessage.end(), message.begin(), message.end());

        uint32_t bytesWritten;
        return m_tty.write(fullMessage.data(), fullMessage.size(), bytesWritten) == TTYBase::TTYResponse::OK
            && bytesWritten == fullMessage.size();
    }

private:
    TTYBase& m_tty;
};

// 使用示例
int main() {
    TTYBase tty("ProtocolDevice");
    if (tty.connect("/dev/ttyUSB0", 115200, 8, 0, 1) != TTYBase::TTYResponse::OK) {
        std::cerr << "连接到 TTY 设备失败" << std::endl;
        return 1;
    }

    ProtocolParser parser(tty);

    // 发送消息
    std::vector<uint8_t> messageToSend = {0x01, 0x02, 0x03, 0x04};
    if (parser.sendMessage(messageToSend)) {
        std::cout << "消息发送成功" << std::endl;
    } else {
        std::cerr << "发送消息失败" << std::endl;
    }

    // 读取消息
    std::vector<uint8_t> receivedMessage;
    if (parser.readMessage(receivedMessage)) {
        std::cout << "接收到消息: ";
        for (uint8_t byte : receivedMessage) {
            std::cout << std::hex << static_cast<int>(byte) << " ";
        }
        std::cout << std::endl;
    } else {
        std::cerr << "读取消息失败" << std::endl;
    }

    tty.disconnect();
    return 0;
}
```

## 性能考虑

在处理 TTY 设备时，尤其是在高吞吐量场景中，请考虑以下性能提示：

1. **缓冲区大小**：为读取和写入操作选择适当的缓冲区大小。更大的缓冲区可以提高吞吐量，但可能会增加延迟。

2. **超时值**：根据应用程序的需求调整超时值。较短的超时可以使应用程序更具响应性，但可能导致更多的部分读取。

3. **轮询与事件驱动**：对于高性能应用程序，考虑使用事件驱动的方法，而不是持续轮询。

4. **波特率**：使用设备和应用程序可以可靠处理的最高波特率。

5. **批处理**：在可能的情况下，将多个小写操作批量处理为更大的操作，以减少系统调用开销。
