---
title: 信号处理
description: 信号处理库的全面文档，包括SignalHandlerRegistry和SafeSignalManager类、关键方法、使用示例和管理C++应用程序中信号的最佳实践。
---

## 目录

1. [介绍](#介绍)
2. [SignalHandlerRegistry](#signalhandlerregistry)
   - [概述](#概述)
   - [关键方法](#关键方法)
   - [使用示例](#使用示例)
3. [SafeSignalManager](#safesignalmanager)
   - [概述](#概述-1)
   - [关键方法](#关键方法-1)
   - [使用示例](#使用示例-1)
4. [最佳实践](#最佳实践)

## 介绍

该库提供了两个主要类，用于在C++应用程序中处理信号：`SignalHandlerRegistry`和`SafeSignalManager`。这两个类提供了不同的信号处理方法，其中`SafeSignalManager`提供了额外的线程安全功能。

## SignalHandlerRegistry

### 概述

`SignalHandlerRegistry`是一个单例类，管理具有优先级的信号处理程序。它允许您为每个信号注册多个处理程序，并按优先级顺序执行它们。

### 关键方法

1. `static SignalHandlerRegistry& getInstance()`

   - 返回`SignalHandlerRegistry`的单例实例。

2. `void setSignalHandler(SignalID signal, const SignalHandler& handler, int priority = 0)`

   - 为特定信号注册一个信号处理程序，并可选地指定优先级。

3. `void removeSignalHandler(SignalID signal, const SignalHandler& handler)`

   - 移除特定信号的信号处理程序。

4. `void setStandardCrashHandlerSignals(const SignalHandler& handler, int priority = 0)`
   - 设置标准崩溃信号的处理程序。

### 使用示例

#### 基本用法

```cpp
#include "signal_handler.h"
#include <iostream>

void customSigIntHandler(SignalID signal) {
    std::cout << "收到SIGINT。执行自定义操作。" << std::endl;
    // 执行清理或自定义操作
    exit(signal);
}

int main() {
    auto& registry = SignalHandlerRegistry::getInstance();

    // 注册自定义SIGINT处理程序
    registry.setSignalHandler(SIGINT, customSigIntHandler);

    // 你的主程序逻辑
    while (true) {
        // 执行一些工作
    }

    return 0;
}
```

#### 使用优先级

```cpp
#include "signal_handler.h"
#include <iostream>

void highPriorityHandler(SignalID signal) {
    std::cout << "信号 " << signal << " 的高优先级处理程序" << std::endl;
}

void lowPriorityHandler(SignalID signal) {
    std::cout << "信号 " << signal << " 的低优先级处理程序" << std::endl;
}

int main() {
    auto& registry = SignalHandlerRegistry::getInstance();

    // 注册具有不同优先级的处理程序
    registry.setSignalHandler(SIGTERM, highPriorityHandler, 10);
    registry.setSignalHandler(SIGTERM, lowPriorityHandler, 1);

    // 当接收到SIGTERM时，将首先调用高优先级处理程序

    // 你的主程序逻辑

    return 0;
}
```

#### 设置标准崩溃处理程序

```cpp
#include "signal_handler.h"
#include <iostream>

void crashHandler(SignalID signal) {
    std::cerr << "检测到崩溃！信号: " << signal << std::endl;
    // 执行崩溃日志记录或清理
    exit(signal);
}

int main() {
    auto& registry = SignalHandlerRegistry::getInstance();

    // 设置标准崩溃信号的处理程序
    registry.setStandardCrashHandlerSignals(crashHandler);

    // 你的主程序逻辑

    return 0;
}
```

## SafeSignalManager

### 概述

`SafeSignalManager`提供了一种线程安全的信号处理方法。它在单独的线程中处理信号，以避免阻塞主执行并确保安全处理信号。

### 关键方法

1. `static SafeSignalManager& getInstance()`

   - 返回`SafeSignalManager`的单例实例。

2. `void addSafeSignalHandler(SignalID signal, const SignalHandler& handler, int priority = 0)`

   - 为特定信号添加信号处理程序，并可选地指定优先级。

3. `void removeSafeSignalHandler(SignalID signal, const SignalHandler& handler)`

   - 移除特定信号的信号处理程序。

4. `void clearSignalQueue()`

   - 清除待处理信号的队列。

5. `static void safeSignalDispatcher(int signal)`
   - 静态方法，用于安全地将信号分发给管理器。

### 使用示例

#### 基本用法

```cpp
#include "safe_signal_manager.h"
#include <iostream>

void safeSignalHandler(SignalID signal) {
    std::cout << "安全处理信号: " << signal << std::endl;
}

int main() {
    auto& manager = SafeSignalManager::getInstance();

    // 为SIGINT添加安全信号处理程序
    manager.addSafeSignalHandler(SIGINT, safeSignalHandler);

    // 设置系统信号处理程序以使用SafeSignalManager
    std::signal(SIGINT, SafeSignalManager::safeSignalDispatcher);

    // 你的主程序逻辑
    while (true) {
        // 执行一些工作
        std::this_thread::sleep_for(std::chrono::seconds(1));
    }

    return 0;
}
```

#### 使用多个处理程序和优先级

```cpp
#include "safe_signal_manager.h"
#include <iostream>

void highPriorityHandler(SignalID signal) {
    std::cout << "信号 " << signal << " 的高优先级处理程序" << std::endl;
}

void lowPriorityHandler(SignalID signal) {
    std::cout << "信号 " << signal << " 的低优先级处理程序" << std::endl;
}

int main() {
    auto& manager = SafeSignalManager::getInstance();

    // 添加具有不同优先级的处理程序
    manager.addSafeSignalHandler(SIGTERM, highPriorityHandler, 10);
    manager.addSafeSignalHandler(SIGTERM, lowPriorityHandler, 1);

    // 设置系统信号处理程序
    std::signal(SIGTERM, SafeSignalManager::safeSignalDispatcher);

    // 你的主程序逻辑

    return 0;
}
```

#### 清除信号队列

```cpp
#include "safe_signal_manager.h"
#include <iostream>

void signalHandler(SignalID signal) {
    std::cout << "处理信号: " << signal << std::endl;
}

int main() {
    auto& manager = SafeSignalManager::getInstance();

    manager.addSafeSignalHandler(SIGUSR1, signalHandler);

    // 设置系统信号处理程序
    std::signal(SIGUSR1, SafeSignalManager::safeSignalDispatcher);

    // 你的主程序逻辑

    // 如果需要清除待处理信号：
    manager.clearSignalQueue();

    return 0;
}
```

## 最佳实践

1. **对线程安全的应用使用SafeSignalManager**：如果你的应用是多线程的，优先使用`SafeSignalManager`而不是`SignalHandlerRegistry`，以确保线程安全的信号处理。

2. **优先处理程序**：在设置处理程序时使用优先级参数，以确保优先执行关键操作。

3. **保持信号处理程序简短**：信号处理程序应快速且非阻塞。对于复杂操作，设置一个标志或使用队列在主程序流程中处理该操作。

4. **小心资源分配**：避免在信号处理程序中分配内存或使用非重入函数。
