---
title: 增强后的PackagedTask
description: atom::algorithm 命名空间中 EnhancedPackagedTask 类模板的详细文档，包括构造函数、公共方法、保护成员、void 返回类型的特化、异常处理和使用示例
---

## 目录

1. [EnhancedPackagedTask 类模板](#enhancedpackagedtask-类模板)
2. [构造函数和五大法则](#构造函数和五大法则)
3. [公共方法](#公共方法)
4. [保护成员](#保护成员)
5. [void 返回类型的特化](#void-返回类型的特化)
6. [异常处理](#异常处理)
7. [使用示例](#使用示例)

## EnhancedPackagedTask 类模板

`EnhancedPackagedTask` 类模板提供了 `std::packaged_task` 的增强版本，具有取消和完成回调等附加功能。

### 模板参数

- `ResultType`：任务返回的结果类型。
- `Args...`：任务接受的参数类型。

### 关键特性

- 可取消的任务
- 完成回调
- 与 `EnhancedFuture` 的集成

## 构造函数和五大法则

### 构造函数

```cpp
explicit EnhancedPackagedTask(TaskType task);
```

使用给定的任务函数构造 `EnhancedPackagedTask` 对象。

- **参数：**
  - `task`：表示要执行的任务的可调用对象（函数、lambda 等）。

### 复制构造函数、复制赋值运算符、移动构造函数、移动赋值运算符

`EnhancedPackagedTask` 类遵循五大法则，显式定义了复制和移动构造函数及赋值运算符。

## 公共方法

### getEnhancedFuture

```cpp
EnhancedFuture<ResultType> getEnhancedFuture();
```

返回与任务结果相关联的 `EnhancedFuture`。

### operator()

```cpp
void operator()(Args... args);
```

使用提供的参数执行任务。

### onComplete

```cpp
template <typename F>
void onComplete(F&& func);
```

设置一个回调函数，在任务完成时调用。

### cancel

```cpp
void cancel();
```

取消任务。

### isCancelled

```cpp
[[nodiscard]] bool isCancelled() const;
```

检查任务是否已被取消。

### getException

```cpp
auto getException() -> std::exception_ptr;
```

返回在任务执行期间发生的任何异常。

### retry

```cpp
template <typename F>
auto retry(F&& func, int max_retries);
```

如果失败，则重试任务操作指定的次数。

- **参数：**
  - `func`：接受任务结果的可调用对象。
  - `max_retries`：最大重试次数。
- **返回值：** 具有成功重试结果的新 `EnhancedPackagedTask`。

## 保护成员

- `task_`：表示任务的可调用对象。
- `promise_`：与任务结果关联的承诺。
- `future_`：与承诺关联的共享未来。
- `callbacks_`：在任务完成时调用的回调函数的向量。
- `cancelled_`：指示任务是否已被取消的原子标志。

## void 返回类型的特化

为返回 `void` 的任务提供 `EnhancedPackagedTask` 的特化。此特化具有与主模板类似的方法，并适当地修改以处理没有返回值的任务。

## 异常处理

该头文件定义了自定义异常类型和用于错误处理的宏：

- `InvalidPackagedTaskException`：用于无效打包任务操作的自定义异常。
- `THROW_INVALID_PACKAGED_TASK_EXCEPTION`：抛出 `InvalidPackagedTaskException` 的宏。
- `THROW_NESTED_INVALID_PACKAGED_TASK_EXCEPTION`：抛出嵌套的 `InvalidPackagedTaskException` 的宏。

## 使用示例

以下示例演示如何使用 `EnhancedPackagedTask` 类：

### 基本用法

```cpp
#include "packaged_task.hpp"
#include <iostream>

int main() {
    // 创建一个将两个整数相加的 EnhancedPackagedTask
    atom::async::EnhancedPackagedTask<int, int, int> task([](int a, int b) {
        return a + b;
    });

    // 获取关联的 EnhancedFuture
    auto future = task.getEnhancedFuture();

    // 执行任务
    task(5, 3);

    // 获取结果
    int result = future.wait();
    std::cout << "结果: " << result << std::endl;

    return 0;
}
```

### 使用完成回调

```cpp
atom::async::EnhancedPackagedTask<std::string, int> task([](int value) {
    return "结果: " + std::to_string(value);
});

task.onComplete([](const std::string& result) {
    std::cout << "任务完成。" << result << std::endl;
});

auto future = task.getEnhancedFuture();
task(42);

// 当任务完成时将调用回调
future.wait();
```

### 取消任务

```cpp
atom::async::EnhancedPackagedTask<void> task([]() {
    std::this_thread::sleep_for(std::chrono::seconds(5));
    std::cout << "任务完成" << std::endl;
});

auto future = task.getEnhancedFuture();

// 在执行之前取消任务
task.cancel();

try {
    task();
} catch (const std::runtime_error& e) {
    std::cout << "任务已取消: " << e.what() << std::endl;
}
```

### 错误处理

```cpp
atom::async::EnhancedPackagedTask<int> task([]() {
    THROW_INVALID_PACKAGED_TASK_EXCEPTION("发生了错误");
    return 0;
});

auto future = task.getEnhancedFuture();

try {
    task();
} catch (const atom::async::InvalidPackagedTaskException& e) {
    std::cout << "捕获异常: " << e.what() << std::endl;
}
```
