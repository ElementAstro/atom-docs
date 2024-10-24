---
title: 函数调用辅助
description: atom::meta 命名空间中 invoke.hpp 文件的详细文档，包括用于延迟调用、安全函数调用、成员函数调用和异常处理的实用函数。
---

## 目录

1. [概念](#概念)
2. [函数延迟调用](#函数延迟调用)
3. [成员函数延迟调用](#成员函数延迟调用)
4. [安全函数调用](#安全函数调用)
5. [使用示例](#使用示例)
6. [注意事项和考虑因素](#注意事项和考虑因素)

## 概念

### Invocable

```cpp
template <typename F, typename... Args>
concept Invocable = std::is_invocable_v<std::decay_t<F>, std::decay_t<Args>...>;
```

此概念检查函数类型 `F` 是否可以使用给定的参数类型 `Args` 进行调用。

## 函数延迟调用

### delayInvoke

```cpp
template <typename F, typename... Args>
    requires Invocable<F, Args...>
auto delayInvoke(F &&func, Args &&...args);
```

延迟调用给定参数的函数。返回一个 lambda，当调用时，使用给定参数调用该函数。

## 成员函数延迟调用

### delayMemInvoke

```cpp
template <typename R, typename T, typename... Args>
auto delayMemInvoke(R (T::*func)(Args...), T *obj);

template <typename R, typename T, typename... Args>
auto delayMemInvoke(R (T::*func)(Args...) const, const T *obj);
```

延迟调用具有给定参数的成员函数（包括非 const 和 const 版本）。

### delayStaticMemInvoke

```cpp
template <typename R, typename T, typename... Args>
auto delayStaticMemInvoke(R (*func)(Args...), T *obj);
```

延迟调用静态成员函数。

### delayMemberVarInvoke

```cpp
template <typename T, typename M>
auto delayMemberVarInvoke(M T::*memberVar, T *obj);
```

延迟访问成员变量。

## 安全函数调用

### safeCall

```cpp
template <typename Func, typename... Args>
    requires Invocable<Func, Args...>
auto safeCall(Func &&func, Args &&...args);
```

安全地调用具有给定参数的函数，捕获任何异常。返回函数调用的结果，或者在发生异常时返回默认构造的值。

### safeTryCatch

```cpp
template <typename F, typename... Args>
    requires std::is_invocable_v<std::decay_t<F>, std::decay_t<Args>...>
auto safeTryCatch(F &&func, Args &&...args);
```

安全地尝试调用具有给定参数的函数，捕获任何异常。返回一个变体，包含函数调用的结果或异常指针。

### safeTryCatchOrDefault

```cpp
template <typename Func, typename... Args>
    requires Invocable<Func, Args...>
auto safeTryCatchOrDefault(
    Func &&func,
    std::invoke_result_t<std::decay_t<Func>, std::decay_t<Args>...> default_value,
    Args &&...args);
```

安全地尝试调用具有给定参数的函数，如果发生异常则返回默认值。

### safeTryCatchWithCustomHandler

```cpp
template <typename Func, typename... Args>
    requires Invocable<Func, Args...>
auto safeTryCatchWithCustomHandler(
    Func &&func, const std::function<void(std::exception_ptr)> &handler,
    Args &&...args);
```

安全地尝试调用具有给定参数的函数，如果发生异常，则使用自定义处理程序。

## 使用示例

### 延迟调用

```cpp
#include "invoke.hpp"
#include <iostream>

void printSum(int a, int b) {
    std::cout << "Sum: " << (a + b) << std::endl;
}

int main() {
    auto delayedPrintSum = delayInvoke(printSum, 5, 7);
    // ... 其他操作 ...
    delayedPrintSum(); // 打印: Sum: 12
    return 0;
}
```

### 成员函数延迟调用

```cpp
#include "invoke.hpp"
#include <iostream>

class Calculator {
public:
    int add(int a, int b) const { return a + b; }
};

int main() {
    Calculator calc;
    auto delayedAdd = delayMemInvoke(&Calculator::add, &calc);
    std::cout << "Result: " << delayedAdd(10, 20) << std::endl; // 打印: Result: 30
    return 0;
}
```

### 安全函数调用

```cpp
#include "invoke.hpp"
#include <iostream>
#include <stdexcept>

int divideNumbers(int a, int b) {
    if (b == 0) throw std::runtime_error("Division by zero");
    return a / b;
}

int main() {
    auto result1 = safeCall(divideNumbers, 10, 2);
    std::cout << "Result 1: " << result1 << std::endl; // 打印: Result 1: 5

    auto result2 = safeCall(divideNumbers, 10, 0);
    std::cout << "Result 2: " << result2 << std::endl; // 打印: Result 2: 0（默认 int 值）

    auto result3 = safeTryCatchOrDefault(divideNumbers, -1, 10, 0);
    std::cout << "Result 3: " << result3 << std::endl; // 打印: Result 3: -1

    return 0;
}
```

## 注意事项和考虑因素

1. `Invocable` 概念和某些函数使用 C++20 特性。在使用这些特性时，请确保您的编译器支持 C++20。
2. `safeCall` 函数在发生异常时返回默认构造的返回类型值。这对于某些类型可能不合适，尤其是没有默认构造函数的类型。
3. `safeTryCatch` 函数返回一个 `std::variant`，允许您检查调用是否成功或导致异常。
4. 使用 `safeTryCatchWithCustomHandler` 时，请记住，如果处理程序不重新抛出异常，并且返回类型不可默认构造，则该函数将抛出异常。
5. 这些工具提供了一种处理异常和延迟函数调用的方法，在许多场景中都非常有用，包括异步编程和错误处理。
6. 使用这些工具时，请考虑性能影响，尤其是在性能关键的代码路径中。
