---
title: 额外异步操作
description: 管理 C++ 中异步任务的类和函数，如 AsyncWorker、AsyncWorkerManager、实用函数和使用示例
---

## 目录

1. [AsyncWorker 类](#asyncworker-类)
2. [AsyncWorkerManager 类](#asyncworkermanager-类)
3. [实用函数](#实用函数)
4. [枚举和类型](#枚举和类型)

## AsyncWorker 类

`AsyncWorker` 类是一个模板类，用于执行异步任务。它允许您异步启动任务，并在完成时检索结果。

### 模板参数

- `ResultType`：任务返回的结果类型。

### 方法

#### `static std::string encrypt(const std::string &input)`

使用 MD5 算法加密输入字符串，并返回输入字符串的 MD5 哈希。

### 公共方法

#### `void startAsync(Func&& func, Args&&... args)`

异步启动任务。

- **参数：**
  - `func`：要异步执行的函数。
  - `args`：传递给函数的参数。

#### `auto getResult() -> ResultType`

获取任务的结果。如果任务无效，则抛出 `std::runtime_error`。

#### `void cancel()`

取消任务。如果任务有效，则此函数会等待任务完成。

#### `auto isDone() const -> bool`

检查任务是否完成。

#### `auto isActive() const -> bool`

检查任务是否处于活动状态。

#### `auto validate(std::function<bool(ResultType)> validator) -> bool`

使用验证器函数验证任务的结果。

#### `void setCallback(std::function<void(ResultType)> callback)`

设置任务完成时调用的回调函数。

#### `void setTimeout(std::chrono::seconds timeout)`

设置任务的超时。

#### `void waitForCompletion()`

等待任务完成。如果设置了超时，则在任务完成或超时到达时等待。

## AsyncWorkerManager 类

`AsyncWorkerManager` 类管理多个 `AsyncWorker` 实例。

### 模板参数

- `ResultType`：由此类管理的任务返回的结果类型。

### 方法

#### `auto createWorker(Func&& func, Args&&... args) -> std::shared_ptr<AsyncWorker<ResultType>>`

创建一个新的 `AsyncWorker` 实例并异步启动任务。

#### `void cancelAll()`

取消所有管理的任务。

#### `auto allDone() const -> bool`

检查所有管理的任务是否完成。

#### `void waitForAll()`

等待所有管理的任务完成。

#### `bool isDone(std::shared_ptr<AsyncWorker<ResultType>> worker) const`

检查特定任务是否完成。

#### `void cancel(std::shared_ptr<AsyncWorker<ResultType>> worker)`

取消特定任务。

## 实用函数

### getWithTimeout

```cpp
template <typename ReturnType>
auto getWithTimeout(std::future<ReturnType>& future, std::chrono::milliseconds timeout) -> ReturnType;
```

在超时情况下获取任务的结果。

### asyncRetry

```cpp
template <typename Func, typename Callback, typename ExceptionHandler, typename CompleteHandler, typename... Args>
auto asyncRetry(Func&& func, int attemptsLeft, std::chrono::milliseconds initialDelay,
                BackoffStrategy strategy, std::chrono::milliseconds maxTotalDelay,
                Callback&& callback, ExceptionHandler&& exceptionHandler,
                CompleteHandler&& completeHandler, Args&&... args)
    -> std::future<typename std::invoke_result_t<Func, Args...>>;
```

执行具有重试能力的异步函数。

## 枚举和类型

### BackoffStrategy

用于不同回退策略的枚举类：

```cpp
enum class BackoffStrategy { FIXED, LINEAR, EXPONENTIAL };
```

### EnableIfNotVoid

用于仅在模板参数不是 void 时启用函数的类型别名：

```cpp
template <typename T>
using EnableIfNotVoid = typename std::enable_if_t<!std::is_void_v<T>, T>;
```

## 示例用法

以下是一些基本用法示例，演示主要组件：

### 使用 AsyncWorker

```cpp
AsyncWorker<int> worker;
worker.startAsync([]() {
    // 一些长时间运行的任务
    return 42;
});
worker.setCallback([](int result) {
    std::cout << "任务完成，结果为: " << result << std::endl;
});
worker.waitForCompletion();
```

### 使用 AsyncWorkerManager

```cpp
AsyncWorkerManager<int> manager;
auto worker1 = manager.createWorker([]() { return 1; });
auto worker2 = manager.createWorker([]() { return 2; });
manager.waitForAll();
```

### 使用 asyncRetry

```cpp
auto result = asyncRetry(
    []() { /* 你的异步函数 */ },
    5, // 尝试次数
    std::chrono::milliseconds(100), // 初始延迟
    BackoffStrategy::EXPONENTIAL,
    std::chrono::milliseconds(5000), // 最大总延迟
    []() { std::cout << "尝试成功" << std::endl; },
    [](const std::exception& e) { std::cout << "异常: " << e.what() << std::endl; },
    []() { std::cout << "所有尝试完成" << std::endl; }
);
```

## 注意事项

- 确保在多线程环境中使用时，适当地处理线程安全问题。
- 适当选择重试策略以提高效率和成功率。
- 处理异常和超时以确保程序的健壮性。
