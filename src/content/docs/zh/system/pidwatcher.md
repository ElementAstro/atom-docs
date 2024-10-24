---
title: PidWatcher 类文档
description: PidWatcher 类的详细文档，包括构造函数、公共方法、使用示例、最佳实践和实现细节，用于通过 PID 监控进程。
---

## 目录

1. [PidWatcher 类](#pidwatcher-class)
   - [构造函数和析构函数](#constructor-and-destructor)
   - [公共方法](#public-methods)
2. [使用示例](#usage-examples)
3. [最佳实践和提示](#best-practices-and-tips)
4. [实现细节](#implementation-details)

## PidWatcher 类

`PidWatcher` 类提供了通过 PID 监控进程的功能，包括设置进程退出的回调、以指定间隔运行监视函数以及管理监视过程。

### 构造函数和析构函数

```cpp
PidWatcher();
~PidWatcher();
```

- 构造函数初始化一个新的 `PidWatcher` 对象。
- 析构函数确保在对象销毁时正确清理资源。

### 公共方法

#### setExitCallback

```cpp
void setExitCallback(Callback callback);
```

设置在监控进程退出时执行的回调函数。

- `callback`: 在进程退出时调用的函数对象（例如，lambda 表达式、函数指针）。

#### setMonitorFunction

```cpp
void setMonitorFunction(Callback callback, std::chrono::milliseconds interval);
```

设置在监控进程时以指定间隔执行的监视函数。

- `callback`: 定期调用的函数对象。
- `interval`: 调用监视函数之间的时间间隔。

#### getPidByName

```cpp
[[nodiscard]] auto getPidByName(const std::string &name) const -> pid_t;
```

通过进程名称检索 PID。

- `name`: 要查找的进程名称。
- 返回值: 找到的进程的 PID，或适当的错误值（如未找到）。

#### start

```cpp
auto start(const std::string &name) -> bool;
```

开始监控指定名称的进程。

- `name`: 要监控的进程名称。
- 返回值: 如果成功开始监控，则返回 `true`，否则返回 `false`。

#### stop

```cpp
void stop();
```

停止监控当前监控的进程。

#### Switch

```cpp
auto Switch(const std::string &name) -> bool;
```

切换要监控的目标进程。

- `name`: 要监控的新进程名称。
- 返回值: 如果成功切换进程，则返回 `true`，否则返回 `false`。

## 使用示例

### 基本用法

```cpp
#include "atom/system/pidwatcher.hpp"
#include <iostream>
#include <chrono>

int main() {
    atom::system::PidWatcher watcher;

    // 设置退出回调
    watcher.setExitCallback([]() {
        std::cout << "监控的进程已退出。" << std::endl;
    });

    // 设置监视函数
    watcher.setMonitorFunction([]() {
        std::cout << "进程仍在运行..." << std::endl;
    }, std::chrono::seconds(5));

    // 开始监控一个进程
    if (watcher.start("example_process")) {
        std::cout << "开始监控 example_process" << std::endl;

        // 等待一段时间
        std::this_thread::sleep_for(std::chrono::minutes(1));

        // 停止监控
        watcher.stop();
        std::cout << "停止监控" << std::endl;
    } else {
        std::cout << "无法开始监控 example_process" << std::endl;
    }

    return 0;
}
```

### 切换监控的进程

```cpp
atom::system::PidWatcher watcher;

// 开始监控初始进程
watcher.start("process1");

// ... 一段时间后 ...

// 切换到监控另一个进程
if (watcher.Switch("process2")) {
    std::cout << "切换到监控 process2" << std::endl;
} else {
    std::cout << "无法切换到 process2" << std::endl;
}
```

### 使用 getPidByName

```cpp
atom::system::PidWatcher watcher;

pid_t pid = watcher.getPidByName("example_process");
if (pid != -1) {
    std::cout << "example_process 的 PID: " << pid << std::endl;
} else {
    std::cout << "未能找到 example_process" << std::endl;
}
```

## 最佳实践和提示

1. **错误处理**: 始终检查 `start()` 和 `Switch()` 等方法的返回值，以确保操作成功。

2. **资源管理**: `PidWatcher` 类管理其自身资源，但在销毁对象或切换进程之前，确保停止监控。

3. **线程安全**: 类内部使用互斥量和条件变量，但在多个线程访问对象时要小心。

4. **回调设计**: 保持退出和监视回调轻量。如果有重操作，考虑将工作卸载到单独的线程中。

5. **间隔调优**: 选择适当的监视函数间隔，以平衡响应性和系统负载。

6. **进程名称准确性**: 在调用 `start()` 和 `Switch()` 方法时，确保使用确切的进程名称。

7. **权限**: 注意，监控某些进程可能需要在某些系统上具有提升的权限。

## 实现细节

- 该类使用单独的线程来监控和处理进程退出。
- 当可用时，使用 C++20 特性，如 `std::jthread`，对于早期 C++ 版本则回退到标准的 `std::thread`。
- 实现可能使用特定于系统的 API 来检索进程信息和监控进程状态。
- 使用条件变量有效地等待进程退出或监控间隔。

### 关于 C++ 版本的说明

实现根据 C++ 标准版本进行调整：

```cpp
#if __cplusplus >= 202002L
    std::jthread monitor_thread_;
    std::jthread exit_thread_;
#else
    std::thread monitor_thread_;
    std::thread exit_thread_;
#endif
```

这确保了与 C++20（使用 `std::jthread`）和早期版本（使用 `std::thread`）的兼容性。
