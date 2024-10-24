---
title: 共享内存
description: 详细文档，介绍 atom::connection 命名空间中的 SharedMemory 类，包括构造函数、公共方法和用于在 C++ 中高效管理共享内存的使用示例。
---

## 目录

1. [介绍](#介绍)
2. [类概述](#类概述)
3. [构造函数和析构函数](#构造函数和析构函数)
4. [公共方法](#公共方法)
5. [使用示例](#使用示例)

## 介绍

`SharedMemory` 类是一个 C++ 模板类，提供跨平台的共享内存实现，用于进程间通信。它允许进程通过命名共享内存段共享指定类型 `T` 的数据。该类确保对共享内存的线程安全访问，并提供多种读取和写入数据的方法。

## 类概述

```cpp
namespace atom::connection {

template <TriviallyCopyable T>
class SharedMemory : public NonCopyable {
public:
    explicit SharedMemory(std::string_view name, bool create = true);
    ~SharedMemory() override;

    // 公共方法...

private:
    // 私有成员和方法...
};

} // namespace atom::connection
```

`SharedMemory` 类以类型 `T` 为模板参数，`T` 必须满足 `TriviallyCopyable` 概念。这确保了数据可以在进程之间安全地复制。

## 构造函数和析构函数

### 构造函数

```cpp
explicit SharedMemory(std::string_view name, bool create = true);
```

创建或打开一个共享内存段。

- **参数：**
  - `name`：共享内存段的名称。
  - `create`：如果为 `true`，则创建新的段；如果为 `false`，则打开现有段。

### 析构函数

```cpp
~SharedMemory() override;
```

清理与共享内存段相关的资源。

## 公共方法

### write

```cpp
void write(const T& data, std::chrono::milliseconds timeout = std::chrono::milliseconds(0));
```

将数据写入共享内存段。

- **参数：**
  - `data`：要写入的数据。
  - `timeout`：等待锁的最大时间，默认为不超时。

### read

```cpp
ATOM_NODISCARD auto read(std::chrono::milliseconds timeout = std::chrono::milliseconds(0)) const -> T;
```

从共享内存段读取数据。

- **参数：**
  - `timeout`：等待锁的最大时间，默认为不超时。
- **返回：** 从共享内存读取的数据。

### clear

```cpp
void clear();
```

清除共享内存段的内容。

### isOccupied

```cpp
ATOM_NODISCARD auto isOccupied() const -> bool;
```

检查共享内存是否被锁定。

### getName

```cpp
ATOM_NODISCARD auto getName() const ATOM_NOEXCEPT -> std::string_view;
```

返回共享内存段的名称。

### getSize

```cpp
ATOM_NODISCARD auto getSize() const ATOM_NOEXCEPT -> std::size_t;
```

返回共享内存段的大小。

### isCreator

```cpp
ATOM_NODISCARD auto isCreator() const ATOM_NOEXCEPT -> bool;
```

返回此实例是否创建了共享内存段。

### writePartial

```cpp
template <typename U>
void writePartial(const U& data, std::size_t offset, std::chrono::milliseconds timeout = std::chrono::milliseconds(0));
```

将部分数据写入共享内存段。

- **参数：**
  - `data`：要写入的数据。
  - `offset`：要写入的共享内存中的偏移量。
  - `timeout`：等待锁的最大时间，默认为不超时。

### readPartial

```cpp
template <typename U>
ATOM_NODISCARD auto readPartial(std::size_t offset, std::chrono::milliseconds timeout = std::chrono::milliseconds(0)) const -> U;
```

从共享内存段读取部分数据。

- **参数：**
  - `offset`：要读取的共享内存中的偏移量。
  - `timeout`：等待锁的最大时间，默认为不超时。
- **返回：** 从共享内存读取的数据。

### tryRead

```cpp
ATOM_NODISCARD auto tryRead(std::chrono::milliseconds timeout = std::chrono::milliseconds(0)) const -> std::optional<T>;
```

尝试从共享内存段读取数据。

- **参数：**
  - `timeout`：等待锁的最大时间，默认为不超时。
- **返回：** 如果成功，包含数据的可选值；否则返回 `std::nullopt`。

### writeSpan

```cpp
void writeSpan(std::span<const std::byte> data, std::chrono::milliseconds timeout = std::chrono::milliseconds(0));
```

将一段字节写入共享内存段。

- **参数：**
  - `data`：要写入的字节范围。
  - `timeout`：等待锁的最大时间，默认为不超时。

### readSpan

```cpp
ATOM_NODISCARD auto readSpan(std::span<std::byte> data, std::chrono::milliseconds timeout = std::chrono::milliseconds(0)) const -> std::size_t;
```

从共享内存段读取一段字节。

- **参数：**
  - `data`：要读取到的字节范围。
  - `timeout`：等待锁的最大时间，默认为不超时。
- **返回：** 读取的字节数。

## 使用示例

### 基本用法

```cpp
#include "shared_memory.hpp"
#include <iostream>

struct MyData {
    int value;
    char message[20];
};

int main() {
    try {
        // 创建共享内存
        atom::connection::SharedMemory<MyData> shm("my_shared_memory");

        // 写入数据
        MyData writeData = {42, "Hello, World!"};
        shm.write(writeData);

        // 读取数据
        MyData readData = shm.read();

        std::cout << "读取值: " << readData.value << std::endl;
        std::cout << "读取消息: " << readData.message << std::endl;

    } catch (const std::exception& e) {
        std::cerr << "错误: " << e.what() << std::endl;
    }

    return 0;
}
```

### 使用超时

```cpp
#include "shared_memory.hpp"
#include <iostream>
#include <chrono>

int main() {
    try {
        atom::connection::SharedMemory<int> shm("int_shared_memory");

        // 写入数据时设置超时
        shm.write(123, std::chrono::milliseconds(100));

        // 读取数据时设置超时
        auto result = shm.tryRead(std::chrono::milliseconds(100));
        if (result) {
            std::cout << "读取值: " << *result << std::endl;
        } else {
            std::cout << "超时未能读取" << std::endl;
        }

    } catch (const std::exception& e) {
        std::cerr << "错误: " << e.what() << std::endl;
    }

    return 0;
}
```

### 部分读取和写入

```cpp
#include "shared_memory.hpp"
#include <iostream>
#include <array>

struct ComplexData {
    int id;
    double values[5];
    char name[20];
};

int main() {
    try {
        atom::connection::SharedMemory<ComplexData> shm("complex_data");

        // 写入部分数据
        int newId = 42;
        shm.writePartial(newId, offsetof(ComplexData, id));

        std::array<double, 2> newValues = {3.14, 2.71};
        shm.writePartial(newValues, offsetof(ComplexData, values));

        // 读取部分数据
        auto readId = shm.readPartial<int>(offsetof(ComplexData, id));
        auto readName = shm.readPartial<char[20]>(offsetof(ComplexData, name));

        std::cout << "读取 ID: " << readId << std::endl;
        std::cout << "读取名称: " << readName << std::endl;

    } catch (const std::exception& e) {
        std::cerr << "错误: " << e.what() << std::endl;
    }

    return 0;
}
```

### 使用字节范围

```cpp
#include "shared_memory.hpp"
#include <iostream>
#include <vector>
#include <span>

int main() {
    try {
        atom::connection::SharedMemory<std::array<std::byte, 1024>> shm("large_data");

        // 使用范围写入数据
        std::vector<std::byte> writeData(500);
        // 填充 writeData 以某些值...
        std::span<const std::byte> writeSpan(writeData);
        shm.writeSpan(writeSpan);

        // 使用范围读取数据
        std::vector<std::byte> readData(1024);
        std::span<std::byte> readSpan(readData);
        size_t bytesRead = shm.readSpan(readSpan);

        std::cout << "读取字节数: " << bytesRead << std::endl;

    } catch (const std::exception& e) {
        std::cerr << "错误: " << e.what() << std::endl;
    }

    return 0;
}
```

### 进程间通信示例

此示例演示如何使用 `SharedMemory` 进行进程间通信。您需要运行两个单独的程序：一个写入者和一个读取者。

写入者进程：

```cpp
#include "shared_memory.hpp"
#include <iostream>
#include <thread>
#include <chrono>

struct Message {
    int id;
    char content[256];
};

int main() {
    try {
        atom::connection::SharedMemory<Message> shm("ipc_example");

        for (int i = 0; i < 5; ++i) {
            Message msg;
            msg.id = i;
            snprintf(msg.content, sizeof(msg.content), "Message %d", i);

            shm.write(msg);
            std::cout << "写入消息: " << msg.content << std::endl;

            std::this_thread::sleep_for(std::chrono::seconds(1));
        }

    } catch (const std::exception& e) {
        std::cerr << "错误: " << e.what() << std::endl;
    }

    return 0;
}
```

读取者进程：

```cpp
#include "shared_memory.hpp"
#include <iostream>
#include <chrono>

struct Message {
    int id;
    char content[256];
};

int main() {
    try {
        atom::connection::SharedMemory<Message> shm("ipc_example", false); // 打开现有的

        for (int i = 0; i < 5; ++i) {
            auto result = shm.tryRead(std::chrono::seconds(2));
            if (result) {
                std::cout << "读取消息: " << result->content << std::endl;
            } else {
                std::cout << "等待消息超时" << std::endl;
            }
        }

    } catch (const std::exception& e) {
        std::cerr << "错误: " << e.what() << std::endl;
    }

    return 0;
}
```

### 错误处理

`SharedMemory` 类使用异常来处理错误。以下示例展示了如何处理可能抛出的各种异常：

```cpp
#include "shared_memory.hpp"
#include <iostream>

int main() {
    try {
        atom::connection::SharedMemory<int> shm("error_example");

        // 尝试以非常短的超时写入
        try {
            shm.write(42, std::chrono::microseconds(1));
        } catch (const std::exception& e) {
            std::cerr << "写入失败: " << e.what() << std::endl;
        }

        // 尝试从无效偏移读取
        try {
            shm.readPartial<double>(sizeof(int));
        } catch (const std::invalid_argument& e) {
            std::cerr << "无效读取: " << e.what() << std::endl;
        }

        // 尝试创建具有现有名称的共享内存（平台特定行为）
        try {
            atom::connection::SharedMemory<int> shm2("error_example");
        } catch (const std::exception& e) {
            std::cerr << "创建共享内存失败: " << e.what() << std::endl;
        }

    } catch (const std::exception& e) {
        std::cerr << "意外错误: " << e.what() << std::endl;
    }

    return 0;
}
```

### 高级用法：共享内存中的循环缓冲区

此示例演示如何使用 `SharedMemory` 实现简单的循环缓冲区，这在跨进程的生产者-消费者场景中非常有用。

```cpp
#include "shared_memory.hpp"
#include <iostream>
#include <array>

template<typename T, size_t N>
struct CircularBuffer {
    std::array<T, N> buffer;
    size_t head = 0;
    size_t tail = 0;
    bool full = false;
};

template<typename T, size_t N>
class SharedCircularBuffer {
public:
    SharedCircularBuffer(const std::string& name) : shm_(name) {}

    void push(const T& item) {
        auto buf = shm_.read();
        if (buf.full && buf.head == buf.tail) {
            buf.tail = (buf.tail + 1) % N;
        }
        buf.buffer[buf.head] = item;
        buf.head = (buf.head + 1) % N;
        buf.full = buf.head == buf.tail;
        shm_.write(buf);
    }

    std::optional<T> pop() {
        auto buf = shm_.read();
        if (buf.head == buf.tail && !buf.full) {
            return std::nullopt;
        }
        T item = buf.buffer[buf.tail];
        buf.tail = (buf.tail + 1) % N;
        buf.full = false;
        shm_.write(buf);
        return item;
    }

private:
    atom::connection::SharedMemory<CircularBuffer<T, N>> shm_;
};

int main() {
    try {
        SharedCircularBuffer<int, 5> buffer("circular_buffer_example");

        // 生产者
        for (int i = 0; i < 7; ++i) {
            buffer.push(i);
            std::cout << "推送: " << i << std::endl;
        }

        // 消费者
        for (int i = 0; i < 7; ++i) {
            auto item = buffer.pop();
            if (item) {
                std::cout << "弹出: " << *item << std::endl;
            } else {
                std::cout << "缓冲区为空" << std::endl;
            }
        }

    } catch (const std::exception& e) {
        std::cerr << "错误: " << e.what() << std::endl;
    }

    return 0;
}
```
