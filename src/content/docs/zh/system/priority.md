---
title: 优先级管理器
description: 优先级管理器类的全面文档，包括管理进程和线程优先级、调度策略、CPU 亲和性的方法，以及使用示例。
---

## 目录

1. [简介](#introduction)
2. [类概述](#class-overview)
3. [枚举](#enumerations)
4. [公共方法](#public-methods)
5. [使用示例](#usage-examples)

## 简介

`PriorityManager` 类是一个实用工具，用于管理不同平台（Windows 和 POSIX 兼容系统）上的进程和线程优先级以及亲和性。它提供了一个统一的接口，用于调整和监控优先级、调度策略和 CPU 亲和性。

## 类概述

```cpp
class PriorityManager {
public:
    enum class PriorityLevel { /* ... */ };
    enum class SchedulingPolicy { /* ... */ };

    static void setProcessPriority(PriorityLevel level, int pid = 0);
    static auto getProcessPriority(int pid = 0) -> PriorityLevel;
    static void setThreadPriority(PriorityLevel level, std::thread::native_handle_type thread = 0);
    static auto getThreadPriority(std::thread::native_handle_type thread = 0) -> PriorityLevel;
    static void setThreadSchedulingPolicy(SchedulingPolicy policy, std::thread::native_handle_type thread = 0);
    static void setProcessAffinity(const std::vector<int>& cpus, int pid = 0);
    static auto getProcessAffinity(int pid = 0) -> std::vector<int>;
    static void startPriorityMonitor(int pid, const std::function<void(PriorityLevel)>& callback,
                                     std::chrono::milliseconds interval = std::chrono::seconds(1));

private:
    // 私有辅助方法
};
```

## 枚举

### PriorityLevel

定义进程和线程的各种优先级级别：

```cpp
enum class PriorityLevel {
    LOWEST,
    BELOW_NORMAL,
    NORMAL,
    ABOVE_NORMAL,
    HIGHEST,
    REALTIME
};
```

### SchedulingPolicy

定义线程的各种调度策略：

```cpp
enum class SchedulingPolicy {
    NORMAL,
    FIFO,
    ROUND_ROBIN
};
```

## 公共方法

### setProcessPriority

```cpp
static void setProcessPriority(PriorityLevel level, int pid = 0);
```

设置进程的优先级。如果 `pid` 为 0，则设置当前进程的优先级。

### getProcessPriority

```cpp
static auto getProcessPriority(int pid = 0) -> PriorityLevel;
```

获取进程的优先级。如果 `pid` 为 0，则获取当前进程的优先级。

### setThreadPriority

```cpp
static void setThreadPriority(PriorityLevel level, std::thread::native_handle_type thread = 0);
```

设置线程的优先级。如果 `thread` 为 0，则设置当前线程的优先级。

### getThreadPriority

```cpp
static auto getThreadPriority(std::thread::native_handle_type thread = 0) -> PriorityLevel;
```

获取线程的优先级。如果 `thread` 为 0，则获取当前线程的优先级。

### setThreadSchedulingPolicy

```cpp
static void setThreadSchedulingPolicy(SchedulingPolicy policy, std::thread::native_handle_type thread = 0);
```

设置线程的调度策略。如果 `thread` 为 0，则设置当前线程的策略。

### setProcessAffinity

```cpp
static void setProcessAffinity(const std::vector<int>& cpus, int pid = 0);
```

设置进程的 CPU 亲和性。如果 `pid` 为 0，则设置当前进程的亲和性。

### getProcessAffinity

```cpp
static auto getProcessAffinity(int pid = 0) -> std::vector<int>;
```

获取进程的 CPU 亲和性。如果 `pid` 为 0，则获取当前进程的亲和性。

### startPriorityMonitor

```cpp
static void startPriorityMonitor(int pid, const std::function<void(PriorityLevel)>& callback,
                                 std::chrono::milliseconds interval = std::chrono::seconds(1));
```

开始监控进程的优先级，并在优先级变化时调用提供的回调函数。

## 使用示例

### 设置和获取进程优先级

```cpp
#include "PriorityManager.h"
#include <iostream>

int main() {
    // 将当前进程的优先级设置为 ABOVE_NORMAL
    PriorityManager::setProcessPriority(PriorityManager::PriorityLevel::ABOVE_NORMAL);

    // 获取并打印当前进程优先级
    PriorityManager::PriorityLevel currentPriority = PriorityManager::getProcessPriority();
    std::cout << "当前进程优先级: " << static_cast<int>(currentPriority) << std::endl;

    return 0;
}
```

### 设置线程优先级和调度策略

```cpp
#include "PriorityManager.h"
#include <thread>
#include <iostream>

void worker() {
    // 将当前线程的优先级设置为 HIGHEST
    PriorityManager::setThreadPriority(PriorityManager::PriorityLevel::HIGHEST);

    // 将当前线程的调度策略设置为 FIFO
    PriorityManager::setThreadSchedulingPolicy(PriorityManager::SchedulingPolicy::FIFO);

    // 在这里执行高优先级工作
    std::cout << "正在执行高优先级工作..." << std::endl;
}

int main() {
    std::thread t(worker);
    t.join();
    return 0;
}
```

### 设置和获取进程亲和性

```cpp
#include "PriorityManager.h"
#include <iostream>

int main() {
    // 将进程亲和性设置为 CPU 0 和 2
    std::vector<int> cpus = {0, 2};
    PriorityManager::setProcessAffinity(cpus);

    // 获取并打印当前进程亲和性
    std::vector<int> currentAffinity = PriorityManager::getProcessAffinity();
    std::cout << "当前进程亲和性: ";
    for (int cpu : currentAffinity) {
        std::cout << cpu << " ";
    }
    std::cout << std::endl;

    return 0;
}
```

### 监控进程优先级

```cpp
#include "PriorityManager.h"
#include <iostream>
#include <chrono>
#include <thread>

void priorityChangedCallback(PriorityManager::PriorityLevel newPriority) {
    std::cout << "进程优先级已更改为: " << static_cast<int>(newPriority) << std::endl;
}

int main() {
    int pid = 1234; // 替换为您要监控的实际进程 ID
    PriorityManager::startPriorityMonitor(pid, priorityChangedCallback);

    // 保持程序运行一段时间以监控优先级变化
    std::this_thread::sleep_for(std::chrono::minutes(5));

    return 0;
}
```

## 最佳实践和提示

1. **错误处理**: 始终检查 `start()` 和 `Switch()` 等方法的返回值，以确保操作成功。

2. **资源管理**: `PriorityManager` 类管理其自身资源，但在销毁对象或切换进程之前，确保停止监控。

3. **线程安全**: 类内部使用互斥量和条件变量，但在多个线程访问对象时要小心。

4. **回调设计**: 保持退出和监视回调轻量。如果有重操作，考虑将工作卸载到单独的线程中。

5. **间隔调优**: 选择适当的监视函数间隔，以平衡响应性和系统负载。

6. **进程名称准确性**: 在调用 `start()` 和 `Switch()` 方法时，确保使用确切的进程名称。

7. **权限**: 注意，监控某些进程可能需要在某些系统上具有提升的权限。
