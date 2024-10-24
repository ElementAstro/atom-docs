---
title: 信号与槽
description: atom::async 命名空间中信号类的详细文档，包括 Signal、AsyncSignal、AutoDisconnectSignal、ChainedSignal、TemplateSignal、ThreadSafeSignal、BroadcastSignal、LimitedSignal、DynamicSignal 和 ScopedSignal。
---

## 目录

1. [Signal](#signal)
2. [AsyncSignal](#asyncsignal)
3. [AutoDisconnectSignal](#autodisconnectsignal)
4. [ChainedSignal](#chainedsignal)
5. [TemplateSignal](#templatesignal)
6. [ThreadSafeSignal](#threadsafesignal)
7. [BroadcastSignal](#broadcastsignal)
8. [LimitedSignal](#limitedsignal)
9. [DynamicSignal](#dynamicsignal)
10. [ScopedSignal](#scopedsignal)

## Signal

### 概述

`Signal` 是一个基本的信号类，允许连接、断开和发射槽。

### 模板参数

- `Args`: 槽的参数类型。

### 公共方法

#### connect

```cpp
void connect(SlotType slot)
```

将槽连接到信号。

- **参数：**
  - `slot`：要连接的槽。

#### disconnect

```cpp
void disconnect(const SlotType& slot)
```

将槽从信号中断开。

- **参数：**
  - `slot`：要断开的槽。

#### emit

```cpp
void emit(Args... args)
```

发射信号，调用所有连接的槽。

- **参数：**
  - `args`：传递给槽的参数。

### 使用示例

```cpp
atom::async::Signal<int, std::string> mySignal;

auto slot1 = [](int x, const std::string& s) {
    std::cout << "槽 1: " << x << ", " << s << std::endl;
};

auto slot2 = [](int x, const std::string& s) {
    std::cout << "槽 2: " << x << ", " << s << std::endl;
};

mySignal.connect(slot1);
mySignal.connect(slot2);

mySignal.emit(42, "Hello, World!");

mySignal.disconnect(slot1);

mySignal.emit(10, "Goodbye!");
```

## AsyncSignal

### 概述

`AsyncSignal` 是一个信号类，允许异步槽执行。

### 模板参数

- `Args`: 槽的参数类型。

### 公共方法

#### connect

```cpp
void connect(SlotType slot)
```

将槽连接到信号。

- **参数：**
  - `slot`：要连接的槽。

#### disconnect

```cpp
void disconnect(const SlotType& slot)
```

将槽从信号中断开。

- **参数：**
  - `slot`：要断开的槽。

#### emit

```cpp
void emit(Args... args)
```

异步发射信号，调用所有连接的槽。

- **参数：**
  - `args`：传递给槽的参数。

### 使用示例

```cpp
atom::async::AsyncSignal<int, std::string> myAsyncSignal;

auto slot1 = [](int x, const std::string& s) {
    std::this_thread::sleep_for(std::chrono::seconds(1));
    std::cout << "异步槽 1: " << x << ", " << s << std::endl;
};

auto slot2 = [](int x, const std::string& s) {
    std::this_thread::sleep_for(std::chrono::seconds(2));
    std::cout << "异步槽 2: " << x << ", " << s << std::endl;
};

myAsyncSignal.connect(slot1);
myAsyncSignal.connect(slot2);

myAsyncSignal.emit(42, "Hello, Async World!");
```

## AutoDisconnectSignal

### 概述

`AutoDisconnectSignal` 是一个信号类，允许使用唯一 ID 自动断开槽。

### 模板参数

- `Args`: 槽的参数类型。

### 公共方法

#### connect

```cpp
auto connect(SlotType slot) -> int
```

将槽连接到信号并返回其唯一 ID。

- **参数：**
  - `slot`：要连接的槽。
- **返回值**：连接槽的唯一 ID。

#### disconnect

```cpp
void disconnect(int id);
```

使用唯一 ID 断开槽。

- **参数：**
  - `id`：要断开的槽的唯一 ID。

#### emit

```cpp
void emit(Args... args);
```

发射信号，调用所有连接的槽。

- **参数：**
  - `args`：传递给槽的参数。

### 使用示例

```cpp
atom::async::AutoDisconnectSignal<int, std::string> myAutoDisconnectSignal;

auto slot1 = [](int x, const std::string& s) {
    std::cout << "自动槽 1: " << x << ", " << s << std::endl;
};

auto slot2 = [](int x, const std::string& s) {
    std::cout << "自动槽 2: " << x << ", " << s << std::endl;
};

int id1 = myAutoDisconnectSignal.connect(slot1);
int id2 = myAutoDisconnectSignal.connect(slot2);

myAutoDisconnectSignal.emit(42, "Hello, Auto World!");

myAutoDisconnectSignal.disconnect(id1);

myAutoDisconnectSignal.emit(10, "Goodbye, Auto World!");
```

## ChainedSignal

### 概述

`ChainedSignal` 是一个信号类，允许信号链式连接。

### 模板参数

- `Args`: 槽的参数类型。

### 公共方法

#### connect

```cpp
void connect(SlotType slot);
```

将槽连接到信号。

- **参数：**
  - `slot`：要连接的槽。

#### addChain

```cpp
void addChain(ChainedSignal<Args...>& nextSignal);
```

将下一个信号添加到链中。

- **参数：**
  - `nextSignal`：要链式连接的下一个信号。

#### emit

```cpp
void emit(Args... args);
```

发射信号，调用所有连接的槽和链式信号。

- **参数：**
  - `args`：传递给槽的参数。

### 使用示例

```cpp
atom::async::ChainedSignal<int, std::string> signal1;
atom::async::ChainedSignal<int, std::string> signal2;

auto slot1 = [](int x, const std::string& s) {
    std::cout << "链式槽 1: " << x << ", " << s << std::endl;
};

auto slot2 = [](int x, const std::string& s) {
    std::cout << "链式槽 2: " << x << ", " << s << std::endl;
};

signal1.connect(slot1);
signal2.connect(slot2);

signal1.addChain(signal2);

signal1.emit(42, "Hello, Chained World!");
```

## TemplateSignal

### 概述

`TemplateSignal` 是一个信号类，允许连接、断开和发射槽。

### 模板参数

- `Args`: 槽的参数类型。

### 公共方法

#### connect

```cpp
void connect(SlotType slot);
```

将槽连接到信号。

- **参数：**
  - `slot`：要连接的槽。

#### disconnect

```cpp
void disconnect(const SlotType& slot);
```

将槽从信号中断开。

- **参数：**
  - `slot`：要断开的槽。

#### emit

```cpp
void emit(Args... args);
```

发射信号，调用所有连接的槽。

- **参数：**
  - `args`：传递给槽的参数。

### 使用示例

```cpp
atom::async::TemplateSignal<int, std::string> myTemplateSignal;

auto slot1 = [](int x, const std::string& s) {
    std::cout << "模板槽 1: " << x << ", " << s << std::endl;
};

auto slot2 = [](int x, const std::string& s) {
    std::cout << "模板槽 2: " << x << ", " << s << std::endl;
};

myTemplateSignal.connect(slot1);
myTemplateSignal.connect(slot2);

myTemplateSignal.emit(42, "Hello, Template World!");

myTemplateSignal.disconnect(slot1);

myTemplateSignal.emit(10, "Goodbye, Template World!");
```

## ThreadSafeSignal

### 概述

`ThreadSafeSignal` 是一个信号类，确保槽的线程安全执行。

### 模板参数

- `Args`: 槽的参数类型。

### 公共方法

#### connect

```cpp
void connect(SlotType slot);
```

将槽连接到信号。

- **参数：**
  - `slot`：要连接的槽。

#### disconnect

```cpp
void disconnect(const SlotType& slot);
```

将槽从信号中断开。

- **参数：**
  - `slot`：要断开的槽。

#### emit

```cpp
void emit(Args... args);
```

以线程安全的方式发射信号，调用所有连接的槽。

- **参数：**
  - `args`：传递给槽的参数。

### 使用示例

```cpp
atom::async::ThreadSafeSignal<int, std::string> myThreadSafeSignal;

auto slot1 = [](int x, const std::string& s) {
    std::cout << "线程安全槽 1: " << x << ", " << s << std::endl;
};

auto slot2 = [](int x, const std::string& s) {
    std::cout << "线程安全槽 2: " << x << ", " << s << std::endl;
};

myThreadSafeSignal.connect(slot1);
myThreadSafeSignal.connect(slot2);

std::thread t1([&]() { myThreadSafeSignal.emit(42, "Hello from Thread 1"); });
std::thread t2([&]() { myThreadSafeSignal.emit(10, "Hello from Thread 2"); });

t1.join();
t2.join();
```

## BroadcastSignal

### 概述

`BroadcastSignal` 是一个信号类，允许向链式信号广播。

### 模板参数

- `Args`: 槽的参数类型。

### 公共方法

#### connect

```cpp
void connect(SlotType slot);
```

将槽连接到信号。

- **参数：**
  - `slot`：要连接的槽。

#### disconnect

```cpp
void disconnect(const SlotType& slot);
```

将槽从信号中断开。

- **参数：**
  - `slot`：要断开的槽。

#### emit

```cpp
void emit(Args... args);
```

发射信号，调用所有连接的槽和链式信号。

- **参数：**
  - `args`：传递给槽的参数。

#### addChain

```cpp
void addChain(BroadcastSignal<Args...>& signal);
```

将下一个信号添加到链中。

- **参数：**
  - `signal`：要链式连接的下一个信号。

### 使用示例

```cpp
atom::async::BroadcastSignal<int, std::string> broadcastSignal1;
atom::async::BroadcastSignal<int, std::string> broadcastSignal2;

auto slot1 = [](int x, const std::string& s) {
    std::cout << "广播槽 1: " << x << ", " << s << std::endl;
};

auto slot2 = [](int x, const std::string& s) {
    std::cout << "广播槽 2: " << x << ", " << s << std::endl;
};

broadcastSignal1.connect(slot1);
broadcastSignal2.connect(slot2);

broadcastSignal1.addChain(broadcastSignal2);

broadcastSignal1.emit(42, "Hello, Broadcast World!");
```

## LimitedSignal

### 概述

`LimitedSignal` 是一个信号类，限制其发射次数。

### 模板参数

- `Args`: 槽的参数类型。

### 构造函数

```cpp
explicit LimitedSignal(size_t maxCalls);
```

创建一个新的限制信号对象。

- **参数：**
  - `maxCalls`：信号可以发射的最大次数。

### 公共方法

#### connect

```cpp
void connect(SlotType slot);
```

将槽连接到信号。

- **参数：**
  - `slot`：要连接的槽。

#### disconnect

```cpp
void disconnect(const SlotType& slot);
```

将槽从信号中断开。

- **参数：**
  - `slot`：要断开的槽。

#### emit

```cpp
void emit(Args... args);
```

发射信号，调用所有连接的槽，直到达到最大调用次数。

- **参数：**
  - `args`：传递给槽的参数。

### 使用示例

```cpp
atom::async::LimitedSignal<int, std::string> limitedSignal(2);

auto slot = [](int x, const std::string& s) {
    std::cout << "限制槽: " << x << ", " << s << std::endl;
};

limitedSignal.connect(slot);

limitedSignal.emit(1, "第一次发射");
limitedSignal.emit(2, "第二次发射");
limitedSignal.emit(3, "这将不会被发射");
```

## DynamicSignal

### 概述

`DynamicSignal` 是一个允许动态槽管理的信号类。

### 模板参数

- `Args`: 槽的参数类型。

### 公共方法

#### connect

```cpp
void connect(SlotType slot);
```

将槽连接到信号。

- **参数：**
  - `slot`：要连接的槽。

#### disconnect

```cpp
void disconnect(const SlotType& slot);
```

将槽从信号中断开。

- **参数：**
  - `slot`：要断开的槽。

#### emit

```cpp
void emit(Args... args);
```

发射信号，调用所有连接的槽。

- **参数：**
  - `args`：传递给槽的参数。

### 使用示例

```cpp
atom::async::DynamicSignal<int, std::string> dynamicSignal;

auto slot1 = [](int x, const std::string& s) {
    std::cout << "动态槽 1: " << x << ", " << s << std::endl;
};

auto slot2 = [](int x, const std::string& s) {
    std::cout << "动态槽 2: " << x << ", " << s << std::endl;
};

dynamicSignal.connect(slot1);
dynamicSignal.connect(slot2);

dynamicSignal.emit(42, "Hello, Dynamic World!");

dynamicSignal.disconnect(slot1);

dynamicSignal.emit(10, "Goodbye, Dynamic World!");
```

## ScopedSignal

### 概述

`ScopedSignal` 是一个允许使用共享指针进行槽管理的信号类。

### 模板参数

- `Args`: 槽的参数类型。

### 公共方法

#### connect

```cpp
void connect(std::shared_ptr<SlotType> slotPtr);
```

使用共享指针将槽连接到信号。

- **参数：**
  - `slotPtr`：指向要连接的槽的共享指针。

#### emit

```cpp
void emit(Args... args);
```

发射信号，调用所有连接的槽。

- **参数：**
  - `args`：传递给槽的参数。

### 使用示例

```cpp
atom::async::ScopedSignal<int, std::string> scopedSignal;

auto slot1 = std::make_shared<std::function<void(int, const std::string&)>>(
    [](int x, const std::string& s) {
        std::cout << "作用域槽 1: " << x << ", " << s << std::endl;
    }
);

auto slot2 = std::make_shared<std::function<void(int, const std::string&)>>(
    [](int x, const std::string& s) {
        std::cout << "作用域槽 2: " << x << ", " << s << std::endl;
    }
);

scopedSignal.connect(slot1);
scopedSignal.connect(slot2);

scopedSignal.emit(42, "Hello, Scoped World!");

// 当共享指针被重置时，槽将自动断开
slot1.reset();

scopedSignal.emit(10, "Goodbye, Scoped World!");
```

## 一般使用说明

1. **线程安全**：这些信号类设计为线程安全。它们可以安全地从多个线程访问和修改，而无需外部同步。

2. **性能考虑**：虽然这些信号类提供灵活性和安全性，但由于同步机制的引入，可能会导致一些开销。对于性能关键的应用，考虑进行性能分析和基准测试，以确保满足您的要求。

3. **内存管理**：`ScopedSignal` 类使用 `std::shared_ptr` 进行槽的自动内存管理。这在处理可能在发射信号之前被销毁的对象时特别有用。

4. **槽断开**：大多数信号类提供 `disconnect` 方法以移除槽。在不再需要槽时，请务必断开，以防止内存泄漏和不必要的计算。

5. **链式和广播**：`ChainedSignal` 和 `BroadcastSignal` 类允许创建复杂的信号传播模式。在需要创建层次或网络化信号结构时使用这些类。

6. **限制发射次数**：`LimitedSignal` 类适用于您希望限制信号发射次数的场景。这对于实现一次性通知或有限使用的事件非常有帮助。

7. **异步执行**：`AsyncSignal` 类提供异步槽执行，这对于长时间运行或 I/O 密集型操作非常有用。然而，请注意潜在的竞争条件，并确保在异步槽中访问共享资源时进行适当的同步。

8. **模板使用**：所有这些信号类都是模板化的，允许类型安全的槽连接和发射。确保槽签名与信号的模板参数匹配，以避免编译错误。

9. **错误处理**：这些信号实现并不内置对槽执行的错误处理。在您的应用程序代码中考虑将槽调用包装在 try-catch 块中，如果需要异常处理。

10. **可扩展性**：`WeightSelector` 类设计为可扩展：

- 您可以通过从 `SelectionStrategy` 基类继承来创建自定义选择策略。
- `applyFunctionToWeights` 方法允许自定义权重转换。
- 您可以扩展 `WeightSelector` 类本身以添加特定领域的功能。
