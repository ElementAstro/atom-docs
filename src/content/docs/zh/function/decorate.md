---
title: 装饰器
description: atom::meta 命名空间中装饰器系统的详细文档，包括关键组件，如 Switchable、decorator、LoopDecorator、ConditionCheckDecorator、BaseDecorator 和 DecorateStepper，以及使用示例和性能考虑。
---

## 关键组件

### Switchable

一个允许在不同实现之间切换的类。

```cpp
template <typename Func>
class Switchable {
    // ... 实现 ...
};
```

#### 用法：

```cpp
auto switchable = Switchable([](int a, int b) { return a + b; });
switchable.switchTo([](int a, int b) { return a * b; });
int result = switchable(3, 4);  // result is 12
```

### decorator

一个允许为函数添加前置执行、后置执行和回调钩子的类模板。

```cpp
template <typename R, typename... Args>
struct decorator<R(Args...)> {
    // ... 实现 ...
};
```

#### 用法：

```cpp
auto decoratedFunc = makeDecorator([](int a, int b) { return a + b; })
    .withHooks(
        []() { std::cout << "Before execution"; },
        [](int result) { std::cout << "Result: " << result; },
        [](auto duration) { std::cout << "Execution time: " << duration.count() << "µs"; }
    );
int result = decoratedFunc(3, 4);
```

### LoopDecorator

一个执行函数多次的装饰器。

```cpp
template <typename FuncType>
struct LoopDecorator : public decorator<FuncType> {
    // ... 实现 ...
};
```

#### 用法：

```cpp
auto loopDecorator = makeLoopDecorator([](int a) { std::cout << a << " "; });
loopDecorator(3, 5);  // 打印 "5 5 5 "
```

### ConditionCheckDecorator

一个仅在满足条件时执行函数的装饰器。

```cpp
template <typename FuncType>
struct ConditionCheckDecorator : public decorator<FuncType> {
    // ... 实现 ...
};
```

#### 用法：

```cpp
auto conditionDecorator = makeConditionCheckDecorator([](int a) { std::cout << a; });
conditionDecorator([]() { return true; }, 5);  // 打印 "5"
conditionDecorator([]() { return false; }, 5);  // 不打印任何内容
```

### BaseDecorator

一个用于创建自定义装饰器的抽象基类。

```cpp
template <typename R, typename... Args>
class BaseDecorator {
    // ... 实现 ...
};
```

### DecorateStepper

一个允许链接多个装饰器的类。

```cpp
template <typename R, typename... Args>
class DecorateStepper {
    // ... 实现 ...
};
```

#### 用法：

```cpp
auto stepper = makeDecorateStepper([](int a, int b) { return a + b; });
stepper.addDecorator<MyCustomDecorator>();
stepper.addDecorator<AnotherDecorator>();
int result = stepper.execute(3, 4);
```

## 详细描述

### Switchable

`Switchable` 类允许在不同函数实现之间动态切换。它使用 `std::function` 存储当前实现，并提供 `switchTo` 方法以在运行时更改实现。

### decorator

`decorator` 类模板是装饰系统的核心。它允许为函数添加三种类型的钩子：

1. 前置执行 (`before_`)
2. 后置执行 (`callback_`)
3. 带有时间信息的后置执行 (`after_`)

使用 `withHooks` 方法设置这些钩子。然后，可以像普通函数一样调用装饰后的函数，钩子将在适当的时间执行。

### LoopDecorator

`LoopDecorator` 扩展了基本的 `decorator` 类，添加了循环功能。调用时，它接受一个额外的 `loopCount` 参数，决定装饰函数将执行多少次。

### ConditionCheckDecorator

`ConditionCheckDecorator` 扩展了基本的 `decorator` 类，添加了条件执行功能。调用时，它接受一个额外的条件函数，决定是否执行装饰函数。

### BaseDecorator

`BaseDecorator` 类为创建自定义装饰器提供了接口。自定义装饰器应从此类继承并实现 `operator()` 方法。

### DecorateStepper

`DecorateStepper` 类允许链接多个装饰器。装饰器按照添加的相反顺序应用（最后添加的首先执行）。`execute` 方法应用所有装饰器，然后调用基础函数。

## 错误处理

该系统包括一个自定义 `DecoratorError` 类，用于处理装饰器特定的错误。`DecorateStepper::execute` 方法捕获并重新抛出这些错误。

## 性能考虑

- 该系统使用 `std::function` 进行类型擦除，可能会有一些性能开销。
- `LoopDecorator` 使用 `#pragma unroll` 进行潜在的循环展开优化。
- `DecorateStepper` 以反向顺序应用装饰器，这可能会影响大量装饰器的性能。

## 线程安全

装饰器系统不提供内置线程安全性。如果在多线程环境中使用，则应应用外部同步。

## 可扩展性

该系统设计为可扩展：

- 可以通过从 `BaseDecorator` 继承来创建新的装饰器类型。
- 可以使用 `addDecorator` 方法将自定义装饰器添加到 `DecorateStepper`。

## 注意事项

- 该系统严重依赖 C++17 特性，如 `if constexpr` 和 `std::invoke`。
- 它支持函数参数的值语义和引用语义。
- `Callable` 概念用于确保在切换函数实现时的类型安全。
- `FunctionTraits` 模板（在本文件中未显示）用于推导函数签名信息。

## 辅助函数

- `makeDecorator`: 从函数创建一个 `decorator` 实例。
- `makeLoopDecorator`: 从函数创建一个 `LoopDecorator` 实例。
- `makeConditionCheckDecorator`: 从函数创建一个 `ConditionCheckDecorator` 实例。
- `makeDecorateStepper`: 从函数创建一个 `DecorateStepper` 实例。
