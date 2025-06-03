---
title: BigNumber
description: atom::algorithm命名空间中BigNumber类的全面介绍，详细说明构造函数、算术运算、比较运算、实用函数、运算符重载和使用示例
---

## 目的和高级概述

BigNumber类是一个C++20实现，用于处理任意精度整数。它允许处理任意大小的整数，没有内置整数类型的限制。这使其适用于需要对非常大的数字进行精确计算的应用程序，例如：

- 密码学算法
- 科学计算
- 金融应用
- 数论研究
- 需要无限精度的数学应用

该实现采用基于数字的方法，将每个数字存储在向量中，最低有效位位于索引0处。它提供了全面的算术运算和实用方法，同时利用现代C++特性。

## 类详情

### `atom::algorithm::BigNumber`

一个使用C++20特性表示和操作大数的类。

#### 私有成员变量

```cpp
bool isNegative_;              // 跟踪数字是否为负数
std::vector<uint8_t> digits_;  // 数字存储，最低有效位在前
```

## 构造函数

### 默认构造函数

```cpp
constexpr BigNumber() noexcept : isNegative_(false), digits_{0} {}
```

创建值为0的`BigNumber`。

### 字符串构造函数

```cpp
explicit BigNumber(std::string_view number);
```

参数：

- `number`：数字的字符串表示（可以包含前导负号）

抛出：

- `std::invalid_argument`：如果字符串不是有效数字

示例：

```cpp
BigNumber large("123456789012345678901234567890");
BigNumber negative("-987654321");
```

### 整数构造函数

```cpp
template <std::integral T>
constexpr explicit BigNumber(T number) noexcept;
```

参数：

- `number`：任何整数类型的值

示例：

```cpp
BigNumber a(42);
BigNumber b(-1234567890LL);
```

### 移动和复制语义

该类完全支持移动和复制语义，具有默认实现：

```cpp
BigNumber(BigNumber&& other) noexcept = default;
BigNumber& operator=(BigNumber&& other) noexcept = default;
BigNumber(const BigNumber&) = default;
BigNumber& operator=(const BigNumber&) = default;
```

## 算术运算

### 加法

```cpp
[[nodiscard]] auto add(const BigNumber& other) const -> BigNumber;
```

将两个`BigNumber`对象相加并返回结果。

示例：

```cpp
BigNumber a("123456789012345678901234567890");
BigNumber b("987654321098765432109876543210");
BigNumber sum = a.add(b);  // 或 a + b
std::cout << sum.toString(); // 1111111110111111111011111111100
```

### 减法

```cpp
[[nodiscard]] auto subtract(const BigNumber& other) const -> BigNumber;
```

从此数中减去另一个`BigNumber`。

示例：

```cpp
BigNumber a("987654321");
BigNumber b("123456789");
BigNumber diff = a.subtract(b);  // 或 a - b
std::cout << diff.toString(); // 864197532
```

### 乘法

```cpp
[[nodiscard]] auto multiply(const BigNumber& other) const -> BigNumber;
```

标准乘法算法。

```cpp
[[nodiscard]] auto multiplyKaratsuba(const BigNumber& other) const -> BigNumber;
```

使用Karatsuba算法的优化乘法，对大数字更高效。

```cpp
[[nodiscard]] auto parallelMultiply(const BigNumber& other) const -> BigNumber;
```

利用并行计算在多核系统上获得更好的性能。

示例：

```cpp
BigNumber a("12345");
BigNumber b("67890");
BigNumber product1 = a.multiply(b);  // 标准方法
BigNumber product2 = a.multiplyKaratsuba(b);  // Karatsuba算法
BigNumber product3 = a.parallelMultiply(b);  // 并行计算
// 所有结果应等于838102050
```

### 除法

```cpp
[[nodiscard]] auto divide(const BigNumber& other) const -> BigNumber;
```

抛出：

- `std::invalid_argument`：如果除数为零

示例：

```cpp
BigNumber a("1000000000");
BigNumber b("1000");
BigNumber quotient = a.divide(b);  // 或 a / b
std::cout << quotient.toString(); // 1000000
```

### 幂运算

```cpp
[[nodiscard]] auto pow(int exponent) const -> BigNumber;
```

抛出：

- `std::invalid_argument`：如果指数为负

示例：

```cpp
BigNumber a("2");
BigNumber result = a.pow(100);  // 或 a ^ 100
// 结果是2^100 = 1267650600228229401496703205376
```

## 实用方法

### 字符串表示

```cpp
[[nodiscard]] auto toString() const -> std::string;
```

返回数字的字符串表示。

```cpp
auto setString(std::string_view newStr) -> BigNumber&;
```

从字符串设置值。

抛出：

- `std::invalid_argument`：如果字符串不是有效数字

### 符号操作

```cpp
[[nodiscard]] auto negate() const -> BigNumber;
```

返回此数的否定。

```cpp
[[nodiscard]] auto abs() const -> BigNumber;
```

返回绝对值。

### 格式化和标准化

```cpp
[[nodiscard]] auto trimLeadingZeros() const noexcept -> BigNumber;
```

移除前导零以进行标准化表示。

### 属性查询方法

```cpp
[[nodiscard]] constexpr auto digits() const noexcept -> size_t;
[[nodiscard]] constexpr auto isNegative() const noexcept -> bool;
[[nodiscard]] constexpr auto isPositive() const noexcept -> bool;
[[nodiscard]] constexpr auto isEven() const noexcept -> bool;
[[nodiscard]] constexpr auto isOdd() const noexcept -> bool;
```

查询数字属性的方法。

### 比较方法

```cpp
[[nodiscard]] constexpr auto equals(const BigNumber& other) const noexcept -> bool;

template <std::integral T>
[[nodiscard]] constexpr auto equals(T other) const noexcept -> bool;

[[nodiscard]] auto equals(std::string_view other) const -> bool;
```

检查与其他`BigNumber`对象、整数或字符串是否相等的方法。

### 元素访问

```cpp
[[nodiscard]] constexpr auto at(size_t index) const -> uint8_t;
auto operator[](size_t index) const -> uint8_t;
```

访问具有边界检查（`at`）或不检查（`operator[]`）的单个数字。

抛出：

- `std::out_of_range`：如果索引超出范围（仅适用于`at`）

## 运算符重载

### 算术运算符

```cpp
friend auto operator+(const BigNumber& b1, const BigNumber& b2) -> BigNumber;
friend auto operator-(const BigNumber& b1, const BigNumber& b2) -> BigNumber;
friend auto operator*(const BigNumber& b1, const BigNumber& b2) -> BigNumber;
friend auto operator/(const BigNumber& b1, const BigNumber& b2) -> BigNumber;
friend auto operator^(const BigNumber& b1, int b2) -> BigNumber;
```

### 比较运算符

```cpp
friend auto operator==(const BigNumber& b1, const BigNumber& b2) noexcept -> bool;
friend auto operator>(const BigNumber& b1, const BigNumber& b2) -> bool;
friend auto operator<(const BigNumber& b1, const BigNumber& b2) -> bool;
friend auto operator>=(const BigNumber& b1, const BigNumber& b2) -> bool;
friend auto operator<=(const BigNumber& b1, const BigNumber& b2) -> bool;
```

### 复合赋值运算符

```cpp
auto operator+=(const BigNumber& other) -> BigNumber&;
auto operator-=(const BigNumber& other) -> BigNumber&;
auto operator*=(const BigNumber& other) -> BigNumber&;
auto operator/=(const BigNumber& other) -> BigNumber&;
```

### 自增/自减运算符

```cpp
auto operator++() -> BigNumber&;     // 前缀自增
auto operator--() -> BigNumber&;     // 前缀自减
auto operator++(int) -> BigNumber;   // 后缀自增
auto operator--(int) -> BigNumber;   // 后缀自减
```

### 流插入

```cpp
friend auto operator<<(std::ostream& os, const BigNumber& num) -> std::ostream&;
```

## 实现细节

### 内部表示

`BigNumber`类使用逆序数字存储方法，其中：

- 最低有效位在索引0处
- 最高有效位在最高索引处
- 每个数字存储为`uint8_t`（值0-9）
- 布尔标志跟踪数字是否为负数

这种安排简化了许多算术运算，特别是加法和乘法，因为它们可以从最低有效位开始。

### 边缘情况

- 零：用单个数字`0`表示，`isNegative_`设为`false`
- 前导零：`trimLeadingZeros`方法将表示标准化
- 除以零：如果除数为零，`divide`方法会抛出异常
- 负指数：不支持，`pow`会抛出异常

### 符号处理

- 加法/减法：实际执行的操作取决于符号
- 乘法/除法：符号遵循标准规则（相同符号→正，不同符号→负）

## 性能考虑

### 时间复杂度

- 加法/减法：O(n)，其中n是较大操作数的位数
- 标准乘法：O(n²)，由于逐位乘法
- Karatsuba乘法：O(n^log₂(3)) ≈ O(n^1.585)，对大数更高效
- 除法：在当前实现中为O(n²)
- 幂运算：O(n² * log(e))，其中e是指数，n是位数

### 优化策略

1. Karatsuba算法：对大数比标准乘法更高效
2. 并行计算：利用多核处理器进行乘法
3. 移动语义：避免不必要地复制大数表示

## 最佳实践

1. 使用适当的构造函数：选择与数据源匹配的构造函数

```cpp
// 从整数
BigNumber a(123456789);

// 对于超出整数限制的值，使用字符串
BigNumber b("123456789012345678901234567890");
```

2. 选择合适的乘法方法：

```cpp
// 对于小数字
BigNumber product = a * b;

// 对于非常大的数字
BigNumber product = a.multiplyKaratsuba(b);

// 对于多核系统上的大数字
BigNumber product = a.parallelMultiply(b);
```

3. 使用复合运算符进行链式操作：

```cpp
// 更高效
bigNum += value1;
bigNum *= value2;

// 较低效
bigNum = bigNum + value1;
bigNum = bigNum * value2;
```

4. 处理异常：

```cpp
try {
    BigNumber result = a.divide(b);
} catch (const std::invalid_argument& e) {
    // 处理除以零
    std::cerr << "Error: " << e.what() << std::endl;
}
```

## 常见陷阱

1. 忽略返回值：大多数方法返回新的`BigNumber`，而不是修改当前对象
2. 忽视边缘情况：零、非常大的数字、负数
3. 缺少异常处理：对于`divide`或`pow`等方法
4. 性能问题：对非常大的数字使用标准乘法
5. 无效的字符串格式：从字符串创建`BigNumber`时

## 所需头文件和依赖

### 标准库头文件

```cpp
#include <cctype>       // 用于字符处理函数
#include <concepts>     // 用于C++20概念
#include <cstdint>      // 用于固定宽度整数类型
#include <ostream>      // 用于流输出
#include <span>         // 用于Karatsuba算法实现
#include <string>       // 用于字符串处理
#include <string_view>  // 用于字符串视图参数
#include <vector>       // 用于数字存储
```

### 编译器和语言要求

- 需要C++20或更高版本（用于概念和span）
- 兼容C++20的编译器，如：
  - GCC 10+
  - Clang 10+
  - MSVC 19.29+（Visual Studio 2019 16.10+）

## 平台/编译器特定说明

- 并行计算：`parallelMultiply`的效果取决于硬件和线程实现
- 优化标志：启用优化以获得更好的性能（GCC/Clang使用`-O2`或`-O3`，MSVC使用`/O2`）

## 综合示例

以下是演示`BigNumber`类主要功能的完整示例：

```cpp
#include <iostream>
#include <chrono>
#include "atom/algorithm/bignumber.hpp"

using namespace atom::algorithm;

// 使用BigNumber计算阶乘
BigNumber factorial(int n) {
    if (n < 0) {
        throw std::invalid_argument("Factorial not defined for negative numbers");
    }
    
    BigNumber result(1);
    for (int i = 2; i <= n; ++i) {
        result *= i;
    }
    return result;
}

// 使用BigNumber计算斐波那契数
BigNumber fibonacci(int n) {
    if (n <= 0) return BigNumber(0);
    if (n == 1) return BigNumber(1);
    
    BigNumber a(0);
    BigNumber b(1);
    BigNumber c;
    
    for (int i = 2; i <= n; ++i) {
        c = a + b;
        a = b;
        b = c;
    }
    return b;
}

int main() {
    // 基本操作
    std::cout << "=== Basic Operations ===\n";
    
    BigNumber a("123456789012345678901234567890");
    BigNumber b(42);
    BigNumber c("-9876543210");
    
    std::cout << "a = " << a << "\n";          // 123456789012345678901234567890
    std::cout << "b = " << b << "\n";          // 42
    std::cout << "c = " << c << "\n\n";        // -9876543210
    
    // 算术
    std::cout << "=== Arithmetic ===\n";
    std::cout << "a + b = " << (a + b) << "\n";  // 123456789012345678901234567932
    std::cout << "a - c = " << (a - c) << "\n";  // 123456789012345678911111111100
    std::cout << "b * c = " << (b * c) << "\n";  // -414814814820
    std::cout << "a / b = " << (a / b) << "\n";  // 2939447357913468069076537331
    std::cout << "b ^ 5 = " << (b ^ 5) << "\n\n"; // 130691232
    
    // 属性和比较
    std::cout << "=== Properties ===\n";
    std::cout << "c.isNegative() = " << c.isNegative() << "\n";  // 1 (true)
    std::cout << "c.abs() = " << c.abs() << "\n";                // 9876543210
    std::cout << "b.isEven() = " << b.isEven() << "\n";          // 1 (true)
    std::cout << "a > c = " << (a > c) << "\n";                  // 1 (true)
    std::cout << "Number of digits in a: " << a.digits() << "\n\n"; // 30
    
    // 修改操作
    std::cout << "=== Modification Operations ===\n";
    BigNumber d(100);
    std::cout << "d = " << d << "\n";           // 100
    
    d += 50;
    std::cout << "d += 50: " << d << "\n";      // 150
    
    ++d;
    std::cout << "++d: " << d << "\n";          // 151
    
    d--;
    std::cout << "d--: " << d << "\n\n";        // 150
    
    // 应用
    std::cout << "=== Applications ===\n";
    
    // 阶乘计算
    std::cout << "20! = " << factorial(20) << "\n"; // 2432902008176640000
    
    // 斐波那契计算
    std::cout << "Fibonacci(100) = " << fibonacci(100) << "\n\n"; // 354224848179261915075
    
    // 性能比较
    std::cout << "=== Performance Comparison ===\n";
    BigNumber large1("9999999999999999999999999999");
    BigNumber large2("8888888888888888888888888888");
    
    // 标准乘法
    auto start1 = std::chrono::high_resolution_clock::now();
    BigNumber result1 = large1 * large2;
    auto end1 = std::chrono::high_resolution_clock::now();
    auto duration1 = std::chrono::duration_cast<std::chrono::microseconds>(end1 - start1);
    
    // Karatsuba乘法
    auto start2 = std::chrono::high_resolution_clock::now();
    BigNumber result2 = large1.multiplyKaratsuba(large2);
    auto end2 = std::chrono::high_resolution_clock::now();
    auto duration2 = std::chrono::duration_cast<std::chrono::microseconds>(end2 - start2);
    
    std::cout << "Results match: " << (result1 == result2) << "\n";
    std::cout << "Standard multiplication: " << duration1.count() << " microseconds\n";
    std::cout << "Karatsuba multiplication: " << duration2.count() << " microseconds\n";
    
    return 0;
}
```

### 预期输出

```
=== Basic Operations ===
a = 123456789012345678901234567890
b = 42
c = -9876543210

=== Arithmetic ===
a + b = 123456789012345678901234567932
a - c = 123456789012345678911111111100
b * c = -414814814820
a / b = 2939447357913468069076537331
b ^ 5 = 130691232

=== Properties ===
c.isNegative() = 1
c.abs() = 9876543210
b.isEven() = 1
a > c = 1
Number of digits in a: 30

=== Modification Operations ===
d = 100
d += 50: 150
++d: 151
d--: 150

=== Applications ===
20! = 2432902008176640000
Fibonacci(100) = 354224848179261915075

=== Performance Comparison ===
Results match: 1
Standard multiplication: 842 microseconds
Karatsuba multiplication: 381 microseconds
```

这份全面的文档应该为新手和有经验的C++开发者提供了理解和有效使用`BigNumber`类进行任意精度整数算术所需的所有信息。
