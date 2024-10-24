---
title: 函数带对象闭包
description: atom::meta 命名空间中 bindFirst 函数的详细文档，包括辅助函数、概念、函数重载和绑定各种类型函数的第一个参数的使用示例。
---

## 关键组件

### 辅助函数

```cpp
template <typename T>
constexpr auto getPointer(T *ptr) noexcept -> T *;

template <typename T>
auto getPointer(const std::reference_wrapper<T> &ref) noexcept -> T *;

template <typename T>
constexpr auto getPointer(const T &ref) noexcept -> const T *;

template <typename T>
constexpr auto removeConstPointer(const T *ptr) noexcept -> T *;
```

这些辅助函数用于内部处理不同类型的对象（指针、引用和常量指针）以实现统一处理。

### 概念

```cpp
template <typename F, typename... Args>
concept invocable = std::is_invocable_v<F, Args...>;

template <typename F, typename... Args>
concept nothrow_invocable = std::is_nothrow_invocable_v<F, Args...>;
```

这些概念用于限制 `bindFirst` 函数模板，确保生成的函数对象可以使用给定参数调用。

## bindFirst 函数重载

### 对于自由函数

```cpp
template <typename O, typename Ret, typename P1, typename... Param>
constexpr auto bindFirst(Ret (*func)(P1, Param...), O &&object)
    requires invocable<Ret (*)(P1, Param...), O, Param...>;
```

将自由函数的第一个参数绑定到对象。

### 对于成员函数

```cpp
template <typename O, typename Ret, typename Class, typename... Param>
constexpr auto bindFirst(Ret (Class::*func)(Param...), O &&object)
    requires invocable<Ret (Class::*)(Param...), O, Param...>;

template <typename O, typename Ret, typename Class, typename... Param>
constexpr auto bindFirst(Ret (Class::*func)(Param...) const, O &&object)
    requires invocable<Ret (Class::*)(Param...) const, O, Param...>;
```

将成员函数的第一个参数（对象）绑定到特定实例。

### 对于 std::function

```cpp
template <typename O, typename Ret, typename P1, typename... Param>
auto bindFirst(const std::function<Ret(P1, Param...)> &func, O &&object)
    requires invocable<std::function<Ret(P1, Param...)>, O, Param...>;
```

将 `std::function` 对象的第一个参数绑定到特定值。

### 对于函数对象

```cpp
template <typename F, typename O, typename Ret, typename Class, typename P1,
          typename... Param>
constexpr auto bindFirst(const F &funcObj, O &&object,
                         Ret (Class::*func)(P1, Param...) const)
    requires invocable<F, O, P1, Param...>;

template <typename F, typename O>
constexpr auto bindFirst(const F &func, O &&object)
    requires invocable<F, O>;

template <typename F, typename O>
constexpr auto bindFirst(F &&func, O &&object)
    requires std::invocable<F, O>;
```

这些重载处理各种形式的函数对象，包括 lambda 表达式。

## 使用示例

### 绑定自由函数

```cpp
int add(int a, int b) { return a + b; }

auto boundAdd = atom::meta::bindFirst(add, 5);
int result = boundAdd(3);  // result is 8
```

### 绑定成员函数

```cpp
class Calculator {
public:
    int multiply(int a, int b) const { return a * b; }
};

Calculator calc;
auto boundMultiply = atom::meta::bindFirst(&Calculator::multiply, calc);
int result = boundMultiply(4, 5);  // result is 20
```

### 绑定 Lambda

```cpp
auto lambda = [](int x, int y) { return x - y; };
auto boundLambda = atom::meta::bindFirst(lambda, 10);
int result = boundLambda(3);  // result is 7
```

### 绑定 std::function

```cpp
std::function<int(int, int)> divide = [](int a, int b) { return a / b; };
auto boundDivide = atom::meta::bindFirst(divide, 20);
int result = boundDivide(4);  // result is 5
```

## 注意事项

- `bindFirst` 函数使用完美转发来高效处理左值和右值引用。
- 概念的使用确保只有在绑定操作有效时，函数才会编译。
- 实现处理常量正确性，允许绑定到常量和非常量成员函数。
- 生成的函数对象通过值捕获绑定对象，这可能对生命周期和性能产生影响。
- 绑定成员函数时，实现使用 `removeConstPointer` 正确处理常量对象。
