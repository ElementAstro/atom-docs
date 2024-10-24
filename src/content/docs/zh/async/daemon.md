---
title: 守护进程
description: C++ 中管理守护进程的类和函数，具有平台特定的考虑和使用示例
---

## 目录

1. [DaemonGuard 类](#daemonguard-类)
2. [实用函数](#实用函数)
3. [平台特定的考虑](#平台特定的考虑)

## DaemonGuard 类

`DaemonGuard` 类负责管理进程信息和控制守护进程的执行。

### 方法

#### toString

```cpp
[[nodiscard]] auto toString() const -> std::string;
```

将进程信息转换为字符串。

- **返回值**：进程信息的字符串表示。

#### realStart

```cpp
auto realStart(int argc, char **argv, const std::function<int(int argc, char **argv)> &mainCb) -> int;
```

启动一个子进程以执行实际任务。

- **参数**：
  - `argc`：命令行参数的数量。
  - `argv`：命令行参数的数组。
  - `mainCb`：在子进程中执行的主回调函数。
- **返回值**：主回调函数的返回值。

#### realDaemon

```cpp
auto realDaemon(int argc, char **argv, const std::function<int(int argc, char **argv)> &mainCb) -> int;
```

作为守护进程启动子进程以执行实际任务。

- **参数**：
  - `argc`：命令行参数的数量。
  - `argv`：命令行参数的数组。
  - `mainCb`：在子进程中执行的主回调函数。
- **返回值**：主回调函数的返回值。

#### startDaemon

```cpp
auto startDaemon(int argc, char **argv, const std::function<int(int argc, char **argv)> &mainCb, bool isDaemon) -> int;
```

启动进程。如果需要创建守护进程，将首先创建守护进程。

- **参数**：
  - `argc`：命令行参数的数量。
  - `argv`：命令行参数的数组。
  - `mainCb`：要执行的主回调函数。
  - `isDaemon`：确定是否应创建守护进程。
- **返回值**：主回调函数的返回值。

### 私有成员

- `m_parentId`：父进程 ID。
- `m_mainId`：子进程 ID。
- `m_parentStartTime`：父进程的开始时间。
- `m_mainStartTime`：子进程的开始时间。
- `m_restartCount`：重启次数。

## 实用函数

### signalHandler

```cpp
void signalHandler(int signum);
```

信号处理函数。

- **参数**：
  - `signum`：信号编号。

### writePidFile

```cpp
void writePidFile();
```

将进程 ID 写入文件。

### checkPidFile

```cpp
auto checkPidFile() -> bool;
```

检查进程 ID 文件是否存在。

- **返回值**：如果进程 ID 文件存在，则返回 true，否则返回 false。

## 平台特定的考虑

`daemon.hpp` 文件包含平台特定的头文件和实现：

- 对于 Windows (`_WIN32`)：
  - 包含 `<windows.h>`
  - 使用 `HANDLE` 作为进程 ID
- 对于类 Unix 系统：
  - 包含 `<sys/stat.h>`、`<sys/wait.h>` 和 `<unistd.h>`
  - 使用 `pid_t` 作为进程 ID

## 使用示例

以下示例演示如何使用 `DaemonGuard` 类创建守护进程：

```cpp
#include "daemon.hpp"
#include <iostream>

int main(int argc, char** argv) {
    atom::algorithm::DaemonGuard daemon;

    auto mainFunction = [](int argc, char** argv) -> int {
        // 守护进程逻辑
        std::cout << "守护进程正在运行..." << std::endl;
        while (true) {
            // 执行守护进程任务
        }
        return 0;
    };

    bool runAsDaemon = true; // 设置为 false 如果不想以守护进程运行
    return daemon.startDaemon(argc, argv, mainFunction, runAsDaemon);
}
```

在此示例中：

1. 我们创建一个 `DaemonGuard` 对象。
2. 我们定义一个包含守护进程逻辑的 lambda 函数 `mainFunction`。
3. 我们使用命令行参数、主函数和一个布尔值指示是否作为守护进程运行来调用 `startDaemon`。

请记住在实际实现中适当地处理信号，并根据需要管理 PID 文件。

## 注意事项

- `DaemonGuard` 类提供了一种管理常规进程和守护进程的方法。
- 该类处理子进程的分叉和执行，以及跟踪进程信息。
- 信号处理和 PID 文件管理是守护进程的重要方面，提供的实用函数支持这些功能。
- 平台特定的代码确保与 Windows 和类 Unix 系统的兼容性。
