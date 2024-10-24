---
title: 额外数学扩展
description: 安全算术操作、位操作和 64 位无符号整数的数学计算函数
---

## 命名空间

所有函数都定义在 `atom::algorithm` 命名空间中。

```cpp
namespace atom::algorithm {
    // ...
}
```

## 函数

### mulDiv64

```cpp
auto mulDiv64(uint64_t operant, uint64_t multiplier, uint64_t divider) -> uint64_t;
```

执行 64 位乘法后再进行除法。

- **参数：**
  - `operant`：乘法的第一个操作数。
  - `multiplier`：乘法的第二个操作数。
  - `divider`：除法操作的除数。
- **返回值：** `(operant * multiplier) / divider` 的结果。
- **使用示例：**

  ```cpp
  uint64_t result = atom::algorithm::mulDiv64(1000, 3, 4);  // result = 750
  ```

### safeAdd

```cpp
auto safeAdd(uint64_t a, uint64_t b) -> uint64_t;
```

执行安全的加法操作，处理潜在的溢出。

- **参数：**
  - `a`：加法的第一个操作数。
  - `b`：加法的第二个操作数。
- **返回值：** `a + b` 的结果，或在溢出时返回 0。
- **使用示例：**

  ```cpp
  uint64_t sum = atom::algorithm::safeAdd(UINT64_MAX, 1);  // sum = 0 (溢出)
  ```

### safeMul

```cpp
auto safeMul(uint64_t a, uint64_t b) -> uint64_t;
```

执行安全的乘法操作，处理潜在的溢出。

- **参数：**
  - `a`：乘法的第一个操作数。
  - `b`：乘法的第二个操作数。
- **返回值：** `a * b` 的结果，或在溢出时返回 0。
- **使用示例：**

  ```cpp
  uint64_t product = atom::algorithm::safeMul(UINT64_MAX, 2);  // product = 0 (溢出)
  ```

### rotl64

```cpp
auto rotl64(uint64_t n, unsigned int c) -> uint64_t;
```

将 64 位整数向左旋转指定的位数。

- **参数：**
  - `n`：要旋转的 64 位整数。
  - `c`：要旋转的位数。
- **返回值：** 旋转后的 64 位整数。
- **使用示例：**

  ```cpp
  uint64_t rotated = atom::algorithm::rotl64(0x1234567890ABCDEF, 4);
  ```

### rotr64

```cpp
auto rotr64(uint64_t n, unsigned int c) -> uint64_t;
```

将 64 位整数向右旋转指定的位数。

- **参数：**
  - `n`：要旋转的 64 位整数。
  - `c`：要旋转的位数。
- **返回值：** 旋转后的 64 位整数。
- **使用示例：**

  ```cpp
  uint64_t rotated = atom::algorithm::rotr64(0x1234567890ABCDEF, 4);
  ```

### clz64

```cpp
auto clz64(uint64_t x) -> int;
```

计算 64 位整数的前导零数量。

- **参数：**
  - `x`：要计算前导零的 64 位整数。
- **返回值：** 64 位整数的前导零数量。
- **使用示例：**

  ```cpp
  int leadingZeros = atom::algorithm::clz64(0x0000FFFFFFFFFFFF);  // leadingZeros = 16
  ```

### normalize

```cpp
auto normalize(uint64_t x) -> uint64_t;
```

通过右移直到最重要的位被设置来规范化 64 位整数。

- **参数：**
  - `x`：要规范化的 64 位整数。
- **返回值：** 规范化后的 64 位整数。
- **使用示例：**

  ```cpp
  uint64_t normalized = atom::algorithm::normalize(0x0000FFFFFFFFFFFF);
  ```

### safeSub

```cpp
auto safeSub(uint64_t a, uint64_t b) -> uint64_t;
```

执行安全的减法操作，处理潜在的下溢。

- **参数：**
  - `a`：减法的第一个操作数。
  - `b`：减法的第二个操作数。
- **返回值：** `a - b` 的结果，或在下溢时返回 0。
- **使用示例：**

  ```cpp
  uint64_t diff = atom::algorithm::safeSub(10, 20);  // diff = 0 (下溢)
  ```

### safeDiv

```cpp
auto safeDiv(uint64_t a, uint64_t b) -> uint64_t;
```

执行安全的除法操作，处理潜在的除以零。

- **参数：**
  - `a`：除数。
  - `b`：被除数。
- **返回值：** `a / b` 的结果，或在除以零时返回 0。
- **使用示例：**

  ```cpp
  uint64_t quotient = atom::algorithm::safeDiv(10, 0);  // quotient = 0 (除以零)
  ```

### bitReverse64

```cpp
auto bitReverse64(uint64_t n) -> uint64_t;
```

计算 64 位整数的位反转。

- **参数：**
  - `n`：要反转的 64 位整数。
- **返回值：** 64 位整数的位反转。
- **使用示例：**

  ```cpp
  uint64_t reversed = atom::algorithm::bitReverse64(0x1234567890ABCDEF);
  ```

### approximateSqrt

```cpp
auto approximateSqrt(uint64_t n) -> uint64_t;
```

使用快速算法近似计算 64 位整数的平方根。

- **参数：**
  - `n`：要计算平方根的 64 位整数。
- **返回值：** 64 位整数的近似平方根。
- **使用示例：**

  ```cpp
  uint64_t sqrt = atom::algorithm::approximateSqrt(1000000);  // sqrt ≈ 1000
  ```

### gcd64

```cpp
auto gcd64(uint64_t a, uint64_t b) -> uint64_t;
```

计算两个 64 位整数的最大公约数（GCD）。

- **参数：**
  - `a`：第一个 64 位整数。
  - `b`：第二个 64 位整数。
- **返回值：** 两个 64 位整数的最大公约数。
- **使用示例：**

  ```cpp
  uint64_t gcd = atom::algorithm::gcd64(48, 18);  // gcd = 6
  ```

### lcm64

```cpp
auto lcm64(uint64_t a, uint64_t b) -> uint64_t;
```

计算两个 64 位整数的最小公倍数（LCM）。

- **参数：**
  - `a`：第一个 64 位整数。
  - `b`：第二个 64 位整数。
- **返回值：** 两个 64 位整数的最小公倍数。
- **使用示例：**

  ```cpp
  uint64_t lcm = atom::algorithm::lcm64(12, 18);  // lcm = 36
  ```

### isPowerOfTwo

```cpp
auto isPowerOfTwo(uint64_t n) -> bool;
```

检查 64 位整数是否为 2 的幂。

- **参数：**
  - `n`：要检查的 64 位整数。
- **返回值：** 如果 64 位整数是 2 的幂，则返回 `true`，否则返回 `false`。
- **使用示例：**

  ```cpp
  bool isPower = atom::algorithm::isPowerOfTwo(64);  // isPower = true
  bool notPower = atom::algorithm::isPowerOfTwo(63); // notPower = false
  ```

### nextPowerOfTwo

```cpp
auto nextPowerOfTwo(uint64_t n) -> uint64_t;
```

计算 64 位整数的下一个 2 的幂。

- **参数：**
  - `n`：要计算下一个 2 的幂的 64 位整数。
- **返回值：** 64 位整数的下一个 2 的幂。
- **使用示例：**

  ```cpp
  uint64_t nextPower = atom::algorithm::nextPowerOfTwo(63);  // nextPower = 64
  uint64_t sameValue = atom::algorithm::nextPowerOfTwo(64);  // sameValue = 64
  ```

## 最佳实践

1. **溢出和下溢处理**：在处理可能导致溢出或下溢的操作时，始终使用安全算术函数（`safeAdd`、`safeSub`、`safeMul`、`safeDiv`）。

2. **位操作**：对于位操作，使用 `rotl64`、`rotr64` 和 `bitReverse64`，而不是手动实现这些操作，以确保正确性和效率。

3. **整数平方根**：当近似平方根足够时，使用 `approximateSqrt`，比浮点运算更高效。

4. **GCD 和 LCM**：使用 `gcd64` 和 `lcm64` 来高效计算最大公约数和最小公倍数。

5. **2 的幂操作**：在处理 2 的幂值时，利用 `isPowerOfTwo` 和 `nextPowerOfTwo`，因为这些操作经过优化。

## 示例用法

以下示例演示了如何使用该库中的多个函数：

```cpp
#include "math.hpp"
#include <iostream>

int main() {
    uint64_t a = 1234567890;
    uint64_t b = 987654321;

    // 安全算术操作
    uint64_t sum = atom::algorithm::safeAdd(a, b);
    uint64_t product = atom::algorithm::safeMul(a, b);

    std::cout << "和: " << sum << std::endl;
    std::cout << "积: " << product << std::endl;

    // 位操作
    uint64_t rotated = atom::algorithm::rotl64(a, 8);
    uint64_t reversed = atom::algorithm::bitReverse64(a);

    std::cout << "左旋 8 位: " << rotated << std::endl;
    std::cout << "位反转: " << reversed << std::endl;

    // 数学操作
    uint64_t sqrt = atom::algorithm::approximateSqrt(a);
    uint64_t gcd = atom::algorithm::gcd64(a, b);
    uint64_t lcm = atom::algorithm::lcm64(a, b);

    std::cout << "近似平方根: " << sqrt << std::endl;
    std::cout << "最大公约数: " << gcd << std::endl;
    std::cout << "最小公倍数: " << lcm << std::endl;

    // 2 的幂操作
    uint64_t n = 63;
    bool isPower = atom::algorithm::isPowerOfTwo(n);
    uint64_t nextPower = atom::algorithm::nextPowerOfTwo(n);

    std::cout << n << " 是 2 的幂吗? " << (isPower ? "是" : "否") << std::endl;
    std::cout << n << " 的下一个 2 的幂: " << nextPower << std::endl;

    return 0;
}
```

此示例展示了如何使用 `math.hpp` 库中的各种函数，包括安全算术操作、位操作、数学计算和 2 的幂操作。

## 注意事项

- 本库中的所有函数均设计为处理 64 位无符号整数（`uint64_t`）。
- 安全算术函数在溢出、下溢或除以零的情况下返回 0。在进行关键计算时，始终检查返回值。
- `approximateSqrt` 函数提供快速近似，可能不适用于需要高精度的应用。
- 在处理非常大的数字时，请注意 64 位整数的限制，并考虑使用任意精度算术库进行更复杂的计算。
