---
title: BigNumber 类文档
description: BigNumber 类的全面文档，详细介绍构造函数、算术运算、比较、工具函数、运算符重载和使用示例。
---

## 目录

1. [构造函数](#构造函数)
2. [算术运算](#算术运算)
3. [比较运算](#比较运算)
4. [工具函数](#工具函数)
5. [运算符重载](#运算符重载)
6. [使用示例](#使用示例)

## 构造函数

### 字符串构造函数

```cpp
BigNumber(std::string number)
```

从数字的字符串表示构造一个 `BigNumber` 对象。

### 长整型构造函数

```cpp
BigNumber(long long number)
```

从 `long long` 整数构造一个 `BigNumber` 对象。

## 算术运算

### 加法

```cpp
auto add(const BigNumber& other) const -> BigNumber
```

将两个 `BigNumber` 对象相加并返回结果。

### 减法

```cpp
auto subtract(const BigNumber& other) const -> BigNumber
```

从一个 `BigNumber` 中减去另一个并返回结果。

### 乘法

```cpp
auto multiply(const BigNumber& other) const -> BigNumber
```

将两个 `BigNumber` 对象相乘并返回结果。

### 除法

```cpp
auto divide(const BigNumber& other) const -> BigNumber
```

将一个 `BigNumber` 除以另一个并返回结果。

### 指数运算

```cpp
auto pow(int exponent) const -> BigNumber
```

将 `BigNumber` 提升到给定指数的幂。

## 比较运算

### 等于

```cpp
auto equals(const BigNumber& other) const -> bool
auto equals(const long long& other) const -> bool
auto equals(const std::string& other) const -> bool
```

检查 `BigNumber` 是否等于另一个 `BigNumber`、`long long` 或字符串表示。

## 工具函数

### 获取字符串表示

```cpp
auto getString() const -> std::string
```

返回 `BigNumber` 的字符串表示。

### 设置字符串表示

```cpp
auto setString(const std::string& newStr) -> BigNumber&
```

为 `BigNumber` 设置新的字符串表示。

### 取反

```cpp
auto negate() const -> BigNumber
```

返回 `BigNumber` 的取反值。

### 修剪前导零

```cpp
auto trimLeadingZeros() const -> BigNumber
```

从 `BigNumber` 中移除前导零。

### 数字位数

```cpp
auto digits() const -> unsigned int
```

返回 `BigNumber` 中的位数。

### 符号检查

```cpp
auto isNegative() const -> bool
auto isPositive() const -> bool
```

检查 `BigNumber` 是负数还是正数。

### 奇偶性检查

```cpp
auto isEven() const -> bool
auto isOdd() const -> bool
```

检查 `BigNumber` 是偶数还是奇数。

### 绝对值

```cpp
auto abs() const -> BigNumber
```

返回 `BigNumber` 的绝对值。

## 运算符重载

`BigNumber` 类重载了各种运算符以便于使用：

- 算术运算符：`+`、`-`、`*`、`/`、`^`
- 比较运算符：`==`、`>`、`<`、`>=`、`<=`
- 复合赋值运算符：`+=`、`-=`、`*=`、`/=`
- 自增/自减运算符：`++`、`--`（前缀和后缀均可）
- 下标运算符：`[]`
- 流插入运算符：`<<`

## 使用示例

```cpp
#include "atom/algorithm/bignumber.hpp"
#include <iostream>

int main() {
    atom::algorithm::BigNumber a("123456789012345678901234567890");
    atom::algorithm::BigNumber b("987654321098765432109876543210");

    // 加法
    std::cout << "a + b = " << a + b << std::endl;

    // 乘法
    std::cout << "a * b = " << a * b << std::endl;

    // 比较
    if (a < b) {
        std::cout << "a 小于 b" << std::endl;
    }

    // 指数运算
    std::cout << "a^3 = " << (a ^ 3) << std::endl;

    // 自增
    a++;
    std::cout << "自增后的 a: " << a << std::endl;

    return 0;
}
```
