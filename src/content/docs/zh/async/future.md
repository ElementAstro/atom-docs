---
title: 更好的Future
description: 增强型 future 类、实用函数、异常处理和使用示例
---

## 目录

1. [EnhancedFuture 类](#enhancedfuture-类)
2. [EnhancedFuture<void> 特化](#enhancedfuturevoid-特化)
3. [实用函数](#实用函数)
4. [异常处理](#异常处理)
5. [使用示例](#使用示例)

## EnhancedFuture 类

`EnhancedFuture` 类是一个模板类，封装了 `std::shared_future` 并提供附加功能。

### 模板参数

- `T`：未来将持有的值的类型。

### 构造函数

```cpp
explicit EnhancedFuture(std::shared_future<T>&& fut);
```

从 `std::shared_future` 构造 `EnhancedFuture`。

### 方法

#### then

```cpp
template <typename F>
auto then(F&& func);
```

将另一个操作链接到在 future 完成后执行。

- **参数：**
  - `func`：接受 future 结果作为参数的可调用对象。
- **返回值：** 具有 `func` 结果的新 `EnhancedFuture`。

#### waitFor

```cpp
auto waitFor(std::chrono::milliseconds timeout) -> std::optional<T>;
```

在超时的情况下等待 future 完成。

- **参数：**
  - `timeout`：最大等待时间。
- **返回值：** 如果在超时内完成，则返回结果，否则返回 `std::nullopt`。

#### isDone

```cpp
[[nodiscard]] auto isDone() const -> bool;
```

检查 future 是否完成。

#### onComplete

```cpp
template <typename F>
void onComplete(F&& func);
```

设置一个回调，在 future 完成时调用。

- **参数：**
  - `func`：接受 future 结果作为参数的可调用对象。

#### wait

```cpp
auto wait() -> T;
```

同步等待 future 完成并返回结果。

#### cancel

```cpp
void cancel();
```

取消 future 操作。

#### isCancelled

```cpp
[[nodiscard]] auto isCancelled() const -> bool;
```

检查 future 是否已被取消。

#### getException

```cpp
auto getException() -> std::exception_ptr;
```

返回在 future 执行期间发生的任何异常。

#### retry

```cpp
template <typename F>
auto retry(F&& func, int max_retries);
```

如果失败，则重试 future 操作指定的次数。

- **参数：**
  - `func`：接受 future 结果作为参数的可调用对象。
  - `max_retries`：最大重试次数。
- **返回值：** 具有成功重试结果的新 `EnhancedFuture`。

## EnhancedFuture<void> 特化

`EnhancedFuture` 的 `void` 返回类型的特化。它具有与主模板类似的方法，适当地修改了 `void` 操作。

## 实用函数

### makeEnhancedFuture

```cpp
template <typename F, typename... Args>
auto makeEnhancedFuture(F&& f, Args&&... args);
```

从函数及其参数创建 `EnhancedFuture`。

### whenAll（迭代器版本）

```cpp
template <typename InputIt>
auto whenAll(InputIt first, InputIt last,
             std::optional<std::chrono::milliseconds> timeout = std::nullopt)
    -> std::future<std::vector<typename std::iterator_traits<InputIt>::value_type>>;
```

等待范围内的所有 futures 完成。

- **参数：**
  - `first`，`last`：定义 futures 范围的迭代器。
  - `timeout`：等待的可选超时。
- **返回值：** 一个 future，解析为所有输入 futures 的结果向量。

### whenAll（变参模板版本）

```cpp
template <typename... Futures>
auto whenAll(Futures&&... futures)
    -> std::future<std::tuple<future_value_t<Futures>...>>;
```

等待所有给定 futures 完成。

- **参数：**
  - `futures`：变参包的 futures。
- **返回值：** 一个 future，解析为所有输入 futures 的结果元组。

## 异常处理

该头文件定义了自定义异常类型和用于错误处理的宏：

- `InvalidFutureException`：用于无效 future 操作的自定义异常。
- `THROW_INVALID_FUTURE_EXCEPTION`：用于抛出 `InvalidFutureException` 的宏。
- `THROW_NESTED_INVALID_FUTURE_EXCEPTION`：用于抛出嵌套的 `InvalidFutureException` 的宏。

## 使用示例

以下是一些演示如何使用 `EnhancedFuture` 类和实用函数的示例：

```cpp
#include "future.hpp"
#include <iostream>

int main() {
    // 创建 EnhancedFuture
    auto future = atom::async::makeEnhancedFuture([]() {
        std::this_thread::sleep_for(std::chrono::seconds(2));
        return 42;
    });

    // 使用 then() 链接操作
    auto chainedFuture = future.then([](int value) {
        return value * 2;
    });

    // 带超时的等待
    auto result = chainedFuture.waitFor(std::chrono::seconds(3));
    if (result) {
        std::cout << "结果: " << *result << std::endl;
    } else {
        std::cout << "操作超时" << std::endl;
    }

    // 使用 whenAll 处理多个 futures
    auto future1 = atom::async::makeEnhancedFuture([]() { return 1; });
    auto future2 = atom::async::makeEnhancedFuture([]() { return 2; });
    auto future3 = atom::async::makeEnhancedFuture([]() { return 3; });

    auto allFutures = atom::async::whenAll(future1, future2, future3);
    auto [result1, result2, result3] = allFutures.get();

    std::cout << "结果: " << result1 << ", " << result2 << ", " << result3 << std::endl;

    return 0;
}
```
