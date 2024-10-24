---
title: 额外的锁
description: 自旋锁、作用域锁类
---

## 目录

1. [CPU Relax 宏](#cpu-relax-宏)
2. [Spinlock 类](#spinlock-类)
3. [TicketSpinlock 类](#ticketspinlock-类)
4. [UnfairSpinlock 类](#unfairspinlock-类)
5. [ScopedLock 类模板](#scopedlock-类模板)
6. [ScopedTicketLock 类模板](#scopedticketlock-类模板)
7. [ScopedUnfairLock 类模板](#scopedunfairlock-类模板)
8. [使用示例](#使用示例)

## CPU Relax 宏

该头文件定义了一个 `cpu_relax()` 宏，以防止过多的处理器总线使用：

```cpp
#if defined(_MSC_VER)
#define cpu_relax() std::this_thread::yield()
#elif defined(__i386__) || defined(__x86_64__)
#define cpu_relax() asm volatile("pause\n" : : : "memory")
#elif defined(__aarch64__)
#define cpu_relax() asm volatile("yield\n" : : : "memory")
#elif defined(__arm__)
#define cpu_relax() asm volatile("nop\n" : : : "memory")
#else
#error "未知架构，需要 CPU 放松代码"
#endif
```

## Spinlock 类

一个简单的自旋锁实现，使用 `std::atomic_flag`。

### 方法

```cpp
void lock();
void unlock();
bool tryLock();
```

- `lock()`：获取锁。
- `unlock()`：释放锁。
- `tryLock()`：尝试获取锁，成功返回 true。

## TicketSpinlock 类

基于票据的自旋锁实现，使用原子操作。

### 方法

```cpp
uint64_t lock();
void unlock(uint64_t ticket);
```

- `lock()`：获取锁并返回票据编号。
- `unlock(uint64_t ticket)`：释放给定票据编号的锁。

### 嵌套 LockGuard 类

```cpp
class LockGuard {
public:
    explicit LockGuard(TicketSpinlock& spinlock);
    ~LockGuard();
};
```

用于 `TicketSpinlock` 的 RAII 风格锁守卫。

## UnfairSpinlock 类

不公平的自旋锁实现，使用 `std::atomic_flag`。

### 方法

```cpp
void lock();
void unlock();
```

- `lock()`：获取锁。
- `unlock()`：释放锁。

## ScopedLock 类模板

用于任何类型自旋锁的通用作用域锁。

### 方法

```cpp
template <typename Mutex>
class ScopedLock {
public:
    explicit ScopedLock(Mutex& mutex);
    ~ScopedLock();
};
```

- 构造函数：在提供的互斥量上获取锁。
- 析构函数：释放锁。

## ScopedTicketLock 类模板

专门为 `TicketSpinlock` 提供的作用域锁。

### 方法

```cpp
template <typename Mutex>
class ScopedTicketLock : public NonCopyable {
public:
    explicit ScopedTicketLock(Mutex& mutex);
    ~ScopedTicketLock();
};
```

- 构造函数：在提供的 `TicketSpinlock` 上获取锁。
- 析构函数：使用存储的票据释放锁。

## ScopedUnfairLock 类模板

专门为 `UnfairSpinlock` 提供的作用域锁。

### 方法

```cpp
template <typename Mutex>
class ScopedUnfairLock : public NonCopyable {
public:
    explicit ScopedUnfairLock(Mutex& mutex);
    ~ScopedUnfairLock();
};
```

- 构造函数：在提供的 `UnfairSpinlock` 上获取锁。
- 析构函数：释放锁。

## 使用示例

以下示例演示了如何使用不同的锁类型：

### 使用 Spinlock

```cpp
#include "lock.hpp"
#include <iostream>
#include <thread>

atom::async::Spinlock spinlock;
int shared_resource = 0;

void increment() {
    for (int i = 0; i < 1000000; ++i) {
        spinlock.lock();
        ++shared_resource;
        spinlock.unlock();
    }
}

int main() {
    std::thread t1(increment);
    std::thread t2(increment);

    t1.join();
    t2.join();

    std::cout << "最终值: " << shared_resource << std::endl;
    return 0;
}
```

### 使用 TicketSpinlock

```cpp
#include "lock.hpp"
#include <iostream>
#include <thread>

atom::async::TicketSpinlock ticketlock;
int shared_resource = 0;

void increment() {
    for (int i = 0; i < 1000000; ++i) {
        atom::async::TicketSpinlock::LockGuard guard(ticketlock);
        ++shared_resource;
    }
}

int main() {
    std::thread t1(increment);
    std::thread t2(increment);

    t1.join();
    t2.join();

    std::cout << "最终值: " << shared_resource << std::endl;
    return 0;
}
```

### 使用 UnfairSpinlock 和 ScopedUnfairLock

```cpp
#include "lock.hpp"
#include <iostream>
#include <thread>

atom::async::UnfairSpinlock unfairlock;
int shared_resource = 0;

void increment() {
    for (int i = 0; i < 1000000; ++i) {
        atom::async::ScopedUnfairLock<atom::async::UnfairSpinlock> guard(unfairlock);
        ++shared_resource;
    }
}

int main() {
    std::thread t1(increment);
    std::thread t2(increment);

    t1.join();
    t2.join();

    std::cout << "最终值: " << shared_resource << std::endl;
    return 0;
}
```

这些示例展示了不同自旋锁类型及其相关的作用域锁的基本用法。请记住，在实际实现中适当地处理错误和性能问题。
