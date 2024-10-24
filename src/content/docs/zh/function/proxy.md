---
title: 代理函数
description: 详细文档，介绍 atom::meta 命名空间中的 ProxyFunction 和 TimerProxyFunction 类，包括构造函数、成员函数、辅助函数和使用示例，用于动态函数包装和执行计时。
---

## 目录

1. [介绍](#介绍)
2. [ProxyFunction 类](#proxyfunction-类)
3. [TimerProxyFunction 类](#timerproxyfunction-类)
4. [使用示例](#使用示例)
5. [辅助函数](#辅助函数)

## 介绍

代理函数实现允许您动态包装和调用函数，提供额外的功能，例如类型安全的参数传递和执行计时。

## ProxyFunction 类

`ProxyFunction` 类是一个模板类，包装一个函数或成员函数，允许使用 `std::any` 参数的向量或 `FunctionParams` 来调用它。

### 模板参数

- `Func`：要包装的函数类型。

### 构造函数

```cpp
explicit ProxyFunction(Func&& func);
```

创建一个 `ProxyFunction` 实例，包装给定的函数。

### 成员函数

```cpp
auto operator()(const std::vector<std::any>& args) -> std::any;
auto operator()(const FunctionParams& params) -> std::any;
```

这些重载的调用运算符允许您使用 `std::any` 参数的向量或 `FunctionParams` 调用包装的函数。

## TimerProxyFunction 类

`TimerProxyFunction` 类通过为函数执行添加超时机制，扩展了 `ProxyFunction` 的功能。

### 模板参数

- `Func`：要包装的函数类型。

### 构造函数

```cpp
explicit TimerProxyFunction(Func&& func);
```

创建一个 `TimerProxyFunction` 实例，包装给定的函数。

### 成员函数

```cpp
auto operator()(const std::vector<std::any>& args, std::chrono::milliseconds timeout) -> std::any;
```

该调用运算符允许您使用 `std::any` 参数的向量和指定的超时调用包装的函数。

## 使用示例

以下是一些演示如何使用 `ProxyFunction` 和 `TimerProxyFunction` 类的示例：

### 示例 1：ProxyFunction 的基本用法

```cpp
#include "proxy.hpp"
#include <iostream>
#include <vector>

int add(int a, int b) {
    return a + b;
}

int main() {
    atom::meta::ProxyFunction proxy_add(add);

    std::vector<std::any> args = {std::any(5), std::any(3)};
    std::any result = proxy_add(args);

    std::cout << "结果: " << std::any_cast<int>(result) << std::endl;

    return 0;
}
```

### 示例 2：使用 ProxyFunction 处理成员函数

```cpp
#include "proxy.hpp"
#include <iostream>
#include <vector>

class Calculator {
public:
    int multiply(int a, int b) const {
        return a * b;
    }
};

int main() {
    Calculator calc;
    atom::meta::ProxyFunction proxy_multiply(&Calculator::multiply);

    std::vector<std::any> args = {std::any(std::ref(calc)), std::any(4), std::any(7)};
    std::any result = proxy_multiply(args);

    std::cout << "结果: " << std::any_cast<int>(result) << std::endl;

    return 0;
}
```

### 示例 3：使用 TimerProxyFunction

```cpp
#include "proxy.hpp"
#include <iostream>
#include <vector>
#include <thread>
#include <chrono>

void long_running_function() {
    std::this_thread::sleep_for(std::chrono::seconds(5));
}

int main() {
    atom::meta::TimerProxyFunction proxy_long_running(long_running_function);

    std::vector<std::any> args;
    try {
        proxy_long_running(args, std::chrono::seconds(3));
        std::cout << "函数在超时内完成。" << std::endl;
    } catch (const atom::error::TimeoutException& e) {
        std::cout << "函数超时: " << e.what() << std::endl;
    }

    return 0;
}
```

## 辅助函数

`proxy.hpp` 文件还包括几种用于类型转换的辅助函数：

```cpp
template <typename T>
auto anyCastRef(std::any& operand) -> T&&;

template <typename T>
auto anyCastRef(const std::any& operand) -> T&;

template <typename T>
auto anyCastVal(std::any& operand) -> T;

template <typename T>
auto anyCastVal(const std::any& operand) -> T;

template <typename T>
auto anyCastConstRef(const std::any& operand) -> const T&;

template <typename T>
auto anyCastHelper(std::any& operand) -> decltype(auto);

template <typename T>
auto anyCastHelper(const std::any& operand) -> decltype(auto);
```
