---
title: 增强版Promise
description: atom::algorithm 命名空间中 EnhancedPromise 类模板的详细文档，包括构造函数、公共方法、void 类型的特化和使用示例。
---

## 目录

1. [EnhancedPromise 类模板](#enhancedpromise-类模板)
2. [PromiseCancelledException](#promisecancelledexception)
3. [公共方法](#公共方法)
4. [void 类型的特化](#void-类型的特化)
5. [使用示例](#使用示例)

## EnhancedPromise 类模板

`EnhancedPromise` 类模板提供了 `std::promise` 的增强版本，具有取消和完成回调等附加功能。

### 模板参数

- `T`：承诺将持有的值的类型。

### 关键特性

- 可取消的承诺
- 完成回调
- 与 `EnhancedFuture` 的集成

## PromiseCancelledException

自定义异常类，当尝试对已取消的承诺执行操作时抛出。

```cpp
class PromiseCancelledException : public atom::error::RuntimeError {
public:
    using atom::error::RuntimeError::RuntimeError;
};
```

提供了两个宏用于抛出此异常：

- `THROW_PROMISE_CANCELLED_EXCEPTION(...)`
- `THROW_NESTED_PROMISE_CANCELLED_EXCEPTION(...)`

## 公共方法

### 构造函数

```cpp
EnhancedPromise();
```

构造一个 `EnhancedPromise` 对象。

### getEnhancedFuture

```cpp
auto getEnhancedFuture() -> EnhancedFuture<T>;
```

返回与此承诺关联的 `EnhancedFuture`。

### setValue

```cpp
void setValue(T value);
```

设置承诺的值。如果承诺已被取消，则抛出 `PromiseCancelledException`。

### setException

```cpp
void setException(std::exception_ptr exception);
```

为承诺设置异常。如果承诺已被取消，则抛出 `PromiseCancelledException`。

### onComplete

```cpp
template <typename F>
void onComplete(F&& func);
```

添加一个回调函数，在承诺完成时调用。

### cancel

```cpp
void cancel();
```

取消承诺。

### isCancelled

```cpp
[[nodiscard]] auto isCancelled() const -> bool;
```

检查承诺是否已被取消。

### getFuture

```cpp
auto getFuture() -> std::shared_future<T>;
```

返回基础 `std::shared_future` 对象。

## void 类型的特化

为返回 `void` 的任务提供 `EnhancedPromise` 的特化。此特化具有与主模板类似的方法，并适当地修改以处理没有返回值的承诺。

## 异常处理

该头文件定义了自定义异常类型和用于错误处理的宏：

- `InvalidPackagedTaskException`：用于无效打包任务操作的自定义异常。
- `THROW_INVALID_PACKAGED_TASK_EXCEPTION`：抛出 `InvalidPackagedTaskException` 的宏。
- `THROW_NESTED_INVALID_PACKAGED_TASK_EXCEPTION`：抛出嵌套的 `InvalidPackagedTaskException` 的宏。

## 使用示例

以下示例演示如何使用 `EnhancedPromise` 类：

### 基本用法

```cpp
#include "promise.hpp"
#include <iostream>

int main() {
    // 创建一个 EnhancedPromise，返回整数
    atom::async::EnhancedPromise<int> promise;
    auto future = promise.getEnhancedFuture();

    // 设置一个值
    promise.setValue(42);

    // 获取结果
    std::cout << "结果: " << future.wait() << std::endl;

    return 0;
}
```

### 使用完成回调

```cpp
atom::async::EnhancedPromise<std::string> promise;

promise.onComplete([](const std::string& result) {
    std::cout << "承诺完成，结果为: " << result << std::endl;
});

auto future = promise.getEnhancedFuture();

// 完成承诺
promise.setValue("Hello, World!");

// 当承诺完成时将调用回调
future.wait();
```

### 处理异常

```cpp
atom::async::EnhancedPromise<int> promise;
auto future = promise.getEnhancedFuture();

try {
    promise.setException(std::make_exception_ptr(std::runtime_error("发生了错误")));
} catch (const atom::async::PromiseCancelledException& e) {
    std::cout << "承诺已取消: " << e.what() << std::endl;
}

try {
    int result = future.wait();
} catch (const std::exception& e) {
    std::cout << "捕获异常: " << e.what() << std::endl;
}
```

### 取消承诺

```cpp
atom::async::EnhancedPromise<void> promise;
auto future = promise.getEnhancedFuture();

promise.cancel();

try {
    promise.setValue();
} catch (const atom::async::PromiseCancelledException& e) {
    std::cout << "无法设置值: " << e.what() << std::endl;
}

if (promise.isCancelled()) {
    std::cout << "承诺已被取消" << std::endl;
}
```
