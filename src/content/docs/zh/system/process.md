---
title: Atom系统进程管理库文档
description: Atom系统进程管理库的全面文档，包括ProcessManager类、全局函数、结构、使用示例、最佳实践和平台特定注意事项。
---

## 目录

1. [介绍](#介绍)
2. [结构](#结构)
3. [ProcessManager类](#processmanager类)
4. [全局函数](#全局函数)
5. [使用示例](#使用示例)
6. [最佳实践](#最佳实践)
7. [平台特定注意事项](#平台特定注意事项)

## 介绍

Atom系统进程管理库提供了一整套管理和监控系统进程的工具。它包括用于处理多个进程的`ProcessManager`类和一些用于进程相关操作的独立函数。

## 结构

### Process

```cpp
struct Process {
    int pid;
    std::string name;
    std::string output;
    fs::path path;
    std::string status;
#if _WIN32
    void *handle;
#endif
};
```

表示一个系统进程，包括其ID、名称、输出、路径、状态和句柄（在Windows上）。

### NetworkConnection

```cpp
struct NetworkConnection {
    std::string protocol;
    std::string line;
} ATOM_ALIGNAS(64);
```

表示一个网络连接，包括其协议和连接细节。

## ProcessManager类

### 构造函数

```cpp
explicit ProcessManager(int maxProcess = 10);
```

创建一个`ProcessManager`实例，指定最大管理进程数。

### 静态方法

```cpp
static auto createShared(int maxProcess = 10) -> std::shared_ptr<ProcessManager>;
```

创建一个指向`ProcessManager`实例的共享指针。

### 成员方法

```cpp
auto createProcess(const std::string &command, const std::string &identifier) -> bool;
auto terminateProcess(int pid, int signal = 15) -> bool;
auto terminateProcessByName(const std::string &name, int signal = 15) -> bool;
auto hasProcess(const std::string &identifier) -> bool;
[[nodiscard]] auto getRunningProcesses() const -> std::vector<Process>;
[[nodiscard]] auto getProcessOutput(const std::string &identifier) -> std::vector<std::string>;
void waitForCompletion();
auto runScript(const std::string &script, const std::string &identifier) -> bool;
auto monitorProcesses() -> bool;
```

这些方法允许创建、终止、检查和监控进程，以及运行脚本和检索进程输出。

## 全局函数

```cpp
auto getAllProcesses() -> std::vector<std::pair<int, std::string>>;
[[nodiscard]] auto getSelfProcessInfo() -> Process;
[[nodiscard]] auto ctermid() -> std::string;
auto getProcessPriorityByPid(int pid) -> std::optional<int>;
auto getProcessPriorityByName(const std::string &name) -> std::optional<int>;
auto isProcessRunning(const std::string &processName) -> bool;
auto getParentProcessId(int processId) -> int;
auto _CreateProcessAsUser(const std::string &command, const std::string &username,
                          const std::string &domain, const std::string &password) -> bool;
auto getNetworkConnections(int pid) -> std::vector<NetworkConnection>;
auto getProcessIdByName(const std::string &processName) -> std::vector<int>;
```

这些函数提供了各种用于进程管理和信息检索的工具。

## 使用示例

### 创建和管理进程

```cpp
#include "atom/system/process.hpp"
#include <iostream>

int main() {
    auto processManager = atom::system::ProcessManager::createShared(5);

    // 创建一个新进程
    if (processManager->createProcess("ls -l", "list_files")) {
        std::cout << "进程创建成功。" << std::endl;
    }

    // 检查进程是否存在
    if (processManager->hasProcess("list_files")) {
        std::cout << "进程 'list_files' 正在运行。" << std::endl;
    }

    // 获取进程输出
    auto output = processManager->getProcessOutput("list_files");
    for (const auto& line : output) {
        std::cout << line << std::endl;
    }

    // 等待所有进程完成
    processManager->waitForCompletion();

    return 0;
}
```

### 监控进程

```cpp
#include "atom/system/process.hpp"
#include <iostream>

int main() {
    auto processManager = atom::system::ProcessManager::createShared();

    processManager->createProcess("long_running_task", "background_task");

    if (processManager->monitorProcesses()) {
        std::cout << "正在监控进程..." << std::endl;

        auto runningProcesses = processManager->getRunningProcesses();
        for (const auto& process : runningProcesses) {
            std::cout << "PID: " << process.pid << ", 名称: " << process.name << std::endl;
        }
    }

    return 0;
}
```

### 使用全局函数

```cpp
#include "atom/system/process.hpp"
#include <iostream>

int main() {
    // 获取所有进程
    auto allProcesses = atom::system::getAllProcesses();
    for (const auto& [pid, name] : allProcesses) {
        std::cout << "PID: " << pid << ", 名称: " << name << std::endl;
    }

    // 检查特定进程是否正在运行
    if (atom::system::isProcessRunning("firefox")) {
        std::cout << "Firefox正在运行。" << std::endl;
    }

    // 获取进程优先级
    auto priority = atom::system::getProcessPriorityByName("chrome");
    if (priority) {
        std::cout << "Chrome优先级: " << *priority << std::endl;
    }

    // 获取进程的网络连接
    auto connections = atom::system::getNetworkConnections(1234);  // 替换为实际的PID
    for (const auto& conn : connections) {
        std::cout << "协议: " << conn.protocol << ", 细节: " << conn.line << std::endl;
    }

    return 0;
}
```

## 最佳实践

1. **错误处理**：始终检查返回布尔值或可选值的函数的返回值，以确保操作成功。

2. **资源管理**：使用`waitForCompletion()`方法确保所有管理的进程在程序退出前完成。

3. **安全性**：在使用涉及用户凭据的函数如`_CreateProcessAsUser()`时要谨慎，确保采取适当的安全措施。

4. **性能**：处理大量进程时，考虑使用`monitorProcesses()`方法，而不是反复调用单个函数。

5. **跨平台兼容性**：注意平台特定函数，并在必要时使用适当的条件编译。

## 平台特定注意事项

- `Process`结构在Windows系统上仅包含一个`handle`成员。
- `_CreateProcessAsUser()`函数仅在Windows上可用。
- 在非Windows系统上，使用`getProcFilePath()`方法获取进程文件路径。
