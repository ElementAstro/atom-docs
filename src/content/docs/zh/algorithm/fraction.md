---
title: Fraction 类文档
description: Fraction 类的全面文档，包括构造函数、算术运算、比较、转换和使用示例。
---

## 概述

`Fraction` 类定义在 `fraction.hpp` 中，是 `atom::algorithm` 命名空间的一部分。它提供了一个强大的分数实现，支持各种算术运算、比较和转换。

## 类定义

```cpp
namespace atom::algorithm {
class Fraction {
    // ...
};
}
```

## 成员变量

- `int numerator`：分数的分子。
- `int denominator`：分数的分母。

## 构造函数

```cpp
explicit Fraction(int n = 0, int d = 1);
```

构造一个新的 `Fraction` 对象。

- 参数：

  - `n`：分子（默认值为 0）
  - `d`：分母（默认值为 1）

- 使用示例：

  ```cpp
  Fraction f1;           // 创建分数 0/1
  Fraction f2(3);        // 创建分数 3/1
  Fraction f3(3, 4);     // 创建分数 3/4
  ```

## 算术运算

### 加法

```cpp
auto operator+=(const Fraction& other) -> Fraction&;
auto operator+(const Fraction& other) const -> Fraction;
```

- 使用示例：

  ```cpp
  Fraction f1(1, 2);
  Fraction f2(1, 3);
  Fraction result = f1 + f2;  // result 为 5/6
  f1 += f2;                   // f1 现在为 5/6
  ```

### 减法

```cpp
auto operator-=(const Fraction& other) -> Fraction&;
auto operator-(const Fraction& other) const -> Fraction;
```

- 使用示例：

  ```cpp
  Fraction f1(3, 4);
  Fraction f2(1, 4);
  Fraction result = f1 - f2;  // result 为 1/2
  f1 -= f2;                   // f1 现在为 1/2
  ```

### 乘法

```cpp
auto operator*=(const Fraction& other) -> Fraction&;
auto operator*(const Fraction& other) const -> Fraction;
```

- 使用示例：

  ```cpp
  Fraction f1(2, 3);
  Fraction f2(3, 4);
  Fraction result = f1 * f2;  // result 为 1/2
  f1 *= f2;                   // f1 现在为 1/2
  ```

### 除法

```cpp
auto operator/=(const Fraction& other) -> Fraction&;
auto operator/(const Fraction& other) const -> Fraction;
```

- 使用示例：

  ```cpp
  Fraction f1(2, 3);
  Fraction f2(3, 4);
  Fraction result = f1 / f2;  // result 为 8/9
  f1 /= f2;                   // f1 现在为 8/9
  ```

## 比较操作

### 等于

```cpp
auto operator==(const Fraction& other) const -> bool;
```

- 使用示例：

  ```cpp
  Fraction f1(1, 2);
  Fraction f2(2, 4);
  bool areEqual = (f1 == f2);  // areEqual 为 true
  ```

### 排序（C++20 及更高版本）

```cpp
auto operator<=>(const Fraction& other) const;
```

实现三路比较运算符，允许所有比较操作（`<`、`<=`、`>`、`>=`）。

- 使用示例：

  ```cpp
  Fraction f1(1, 2);
  Fraction f2(3, 4);
  bool isLess = (f1 < f2);     // isLess 为 true
  bool isGreater = (f1 > f2);  // isGreater 为 false
  ```

## 转换方法

### 转换为双精度浮点数

```cpp
explicit operator double() const;
[[nodiscard]] auto toDouble() const -> double;
```

- 使用示例：

  ```cpp
  Fraction f(3, 4);
  double d1 = static_cast<double>(f);  // d1 为 0.75
  double d2 = f.toDouble();            // d2 为 0.75
  ```

### 转换为浮点数

```cpp
explicit operator float() const;
```

- 使用示例：

  ```cpp
  Fraction f(1, 2);
  float fl = static_cast<float>(f);  // fl 为 0.5f
  ```

### 转换为整数

```cpp
explicit operator int() const;
```

- 使用示例：

  ```cpp
  Fraction f(7, 3);
  int i = static_cast<int>(f);  // i 为 2（向下取整）
  ```

### 转换为字符串

```cpp
[[nodiscard]] auto toString() const -> std::string;
```

- 使用示例：

  ```cpp
  Fraction f(3, 4);
  std::string s = f.toString();  // s 为 "3/4"
  ```

## 流操作

### 输出流

```cpp
friend auto operator<<(std::ostream& os, const Fraction& f) -> std::ostream&;
```

- 使用示例：

  ```cpp
  Fraction f(3, 4);
  std::cout << f;  // 输出: 3/4
  ```

### 输入流

```cpp
friend auto operator>>(std::istream& is, Fraction& f) -> std::istream&;
```

- 使用示例：

  ```cpp
  Fraction f;
  std::cin >> f;  // 输入格式: 分子/分母（例如，3/4）
  ```

## 私有辅助方法

### 最大公约数（GCD）

```cpp
static int gcd(int a, int b);
```

计算两个数的最大公约数。

### 简化

```cpp
void reduce();
```

将分数简化为最简形式。

## 最佳实践

1. 创建分数或执行除法操作时，始终检查是否存在除以零的情况。
2. 在需要使用分数进行浮点运算时，使用 `toDouble()` 方法或显式转换。
3. 记住，将分数转换为整数时会发生整数除法，这可能导致精度损失。
4. 使用比较运算符进行准确的分数比较，而不是转换为浮点数。
5. 从流中输入分数时，确保输入格式正确（分子/分母）以避免解析错误。

## 注意事项

- 该类使用 C++20 特性，如航天飞船运算符（`<=>`）进行比较（如果可用）。
- 实现会在操作后自动将分数简化为最简形式。
- 对于除以零的错误处理未在头文件中明确显示，应该在类方法中实现。
