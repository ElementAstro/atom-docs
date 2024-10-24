---
title: FIFO客户端
description: FifoClient 类在 atom::connection 命名空间中的详细文档，包括构造函数、公共方法和与 C++ 中的 FIFO 管道交互的使用示例。
---

## 目录

1. [类概述](#类概述)
2. [构造函数](#构造函数)
3. [析构函数](#析构函数)
4. [公共方法](#公共方法)
   - [write](#write)
   - [read](#read)
   - [isOpen](#isopen)
   - [close](#close)
5. [使用示例](#使用示例)

## 类概述

```cpp
namespace atom::connection {

class FifoClient {
public:
    explicit FifoClient(std::string fifoPath);
    ~FifoClient();

    auto write(std::string_view data, std::optional<std::chrono::milliseconds> timeout = std::nullopt) -> bool;
    auto read(std::optional<std::chrono::milliseconds> timeout = std::nullopt) -> std::optional<std::string>;
    [[nodiscard]] auto isOpen() const -> bool;
    void close();

private:
    struct Impl;
    std::unique_ptr<Impl> m_impl;
};

}  // namespace atom::connection
```

## 构造函数

```cpp
explicit FifoClient(std::string fifoPath);
```

创建一个新的 `FifoClient` 实例。

- **参数：**

  - `fifoPath`：一个字符串，表示 FIFO 文件的路径。

- **描述：** 此构造函数在指定路径打开 FIFO，并准备客户端进行读写操作。

## 析构函数

```cpp
~FifoClient();
```

销毁 `FifoClient` 实例。

- **描述：** 确保所有资源被正确释放，并关闭 FIFO 以防止资源泄漏。

## 公共方法

### write

```cpp
auto write(std::string_view data, std::optional<std::chrono::milliseconds> timeout = std::nullopt) -> bool;
```

向 FIFO 写入数据。

- **参数：**

  - `data`：要写入 FIFO 的数据（作为字符串视图）。
  - `timeout`：写操作的可选超时，单位为毫秒。

- **返回：** 如果数据成功写入，则返回 `true`，否则返回 `false`。

- **描述：** 尝试将指定的数据写入 FIFO。如果提供了超时，则如果操作无法在给定时间内完成，将会失败。

### read

```cpp
auto read(std::optional<std::chrono::milliseconds> timeout = std::nullopt) -> std::optional<std::string>;
```

从 FIFO 读取数据。

- **参数：**

  - `timeout`：读取操作的可选超时，单位为毫秒。

- **返回：** 一个 `optional<string>`，包含从 FIFO 读取的数据。如果发生错误或没有可用数据，则返回 `std::nullopt`。

- **描述：** 从 FIFO 中读取数据。如果指定了超时，则如果操作无法在指定时间内完成，将返回 `std::nullopt`。

### isOpen

```cpp
[[nodiscard]] auto isOpen() const -> bool;
```

检查 FIFO 是否当前处于打开状态。

- **返回：** 如果 FIFO 打开，则返回 `true`，否则返回 `false`。

- **描述：** 用于确定 FIFO 客户端是否准备好进行操作。

### close

```cpp
void close();
```

关闭 FIFO。

- **描述：** 关闭 FIFO 并释放任何相关资源。建议在完成 FIFO 使用后调用此方法，以确保正确清理。

## 使用示例

以下是一些演示如何使用 `FifoClient` 类的示例：

### 创建 FifoClient 并写入数据

```cpp
#include "fifoclient.hpp"
#include <iostream>

int main() {
    atom::connection::FifoClient client("/tmp/myfifo");

    if (client.isOpen()) {
        std::string message = "Hello, FIFO!";
        bool success = client.write(message);

        if (success) {
            std::cout << "消息写入成功。" << std::endl;
        } else {
            std::cerr << "写入消息失败。" << std::endl;
        }
    } else {
        std::cerr << "打开 FIFO 失败。" << std::endl;
    }

    return 0;
}
```

### 带超时的读取数据

```cpp
#include "fifoclient.hpp"
#include <iostream>
#include <chrono>

int main() {
    atom::connection::FifoClient client("/tmp/myfifo");

    if (client.isOpen()) {
        auto timeout = std::chrono::milliseconds(5000); // 5 秒超时
        auto result = client.read(timeout);

        if (result) {
            std::cout << "接收到： " << *result << std::endl;
        } else {
            std::cout << "在超时内没有接收到数据。" << std::endl;
        }
    } else {
        std::cerr << "打开 FIFO 失败。" << std::endl;
    }

    return 0;
}
```

### 在循环中使用 FifoClient

```cpp
#include "fifoclient.hpp"
#include <iostream>
#include <chrono>
#include <thread>

int main() {
    atom::connection::FifoClient client("/tmp/myfifo");

    if (client.isOpen()) {
        while (true) {
            auto result = client.read(std::chrono::milliseconds(1000));

            if (result) {
                std::cout << "接收到： " << *result << std::endl;

                // 回显接收到的消息
                client.write(*result);
            } else {
                std::cout << "没有接收到数据，正在等待..." << std::endl;
            }

            std::this_thread::sleep_for(std::chrono::seconds(1));
        }
    } else {
        std::cerr << "打开 FIFO 失败。" << std::endl;
    }

    return 0;
}
```
