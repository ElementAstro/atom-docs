---
title: BigNumber
description: Comprehensive for the BigNumber class in the atom::algorithm namespace, detailing constructors, arithmetic operations, comparisons, utility functions, operator overloads, and usage examples.
---

## Overview

The `BigNumber` class is designed to overcome the limitations of built-in numeric types by allowing integer operations on numbers of practically unlimited size. It uses a vector of digits to represent numbers, with the least significant digit first and the most significant digit last.

## Key Features

- **Arbitrarily large integers**: Handle integers of any size, limited only by available memory
- **Comprehensive arithmetic operations**: Addition, subtraction, multiplication, division, and exponentiation
- **Multiple construction methods**: Create from strings, integers, or other BigNumbers
- **Optimized algorithms**: Includes Karatsuba algorithm for faster multiplication of large numbers
- **Modern C++ design**: Utilizes C++20 features like concepts and ranges
- **Optional Boost integration**: Can leverage Boost's multiprecision library when available

## Class Declaration

```cpp
namespace atom::algorithm {
    class BigNumber {
        // Class implementation
    };
}
```

## Constructors

### Default Constructor

```cpp
constexpr BigNumber() noexcept : isNegative_(false), digits_{0} {}
```

Creates a `BigNumber` instance representing zero.

### String Constructor

```cpp
explicit BigNumber(std::string_view number);
```

Constructs a `BigNumber` from a string representation.

**Parameters**:

- `number`: String view containing the number representation

**Throws**:

- `std::invalid_argument`: If the string is not a valid number

### Integer Constructor

```cpp
template <std::integral T>
constexpr explicit BigNumber(T number) noexcept;
```

Constructs a `BigNumber` from any integral type.

**Parameters**:

- `number`: The integer value to convert

## Basic Operations

### Addition

```cpp
[[nodiscard]] auto add(const BigNumber& other) const -> BigNumber;
```

Adds another `BigNumber` to this one.

**Parameters**:

- `other`: The `BigNumber` to add

**Returns**:

- A new `BigNumber` representing the sum

### Subtraction

```cpp
[[nodiscard]] auto subtract(const BigNumber& other) const -> BigNumber;
```

Subtracts another `BigNumber` from this one.

**Parameters**:

- `other`: The `BigNumber` to subtract

**Returns**:

- A new `BigNumber` representing the difference

### Multiplication

```cpp
[[nodiscard]] auto multiply(const BigNumber& other) const -> BigNumber;
```

Multiplies this `BigNumber` by another.

**Parameters**:

- `other`: The `BigNumber` to multiply by

**Returns**:

- A new `BigNumber` representing the product

### Karatsuba Multiplication

```cpp
[[nodiscard]] auto multiplyKaratsuba(const BigNumber& other) const -> BigNumber;
```

Uses the Karatsuba algorithm for faster multiplication of large numbers.

**Parameters**:

- `other`: The `BigNumber` to multiply by

**Returns**:

- A new `BigNumber` representing the product

### Division

```cpp
[[nodiscard]] auto divide(const BigNumber& other) const -> BigNumber;
```

Divides this `BigNumber` by another.

**Parameters**:

- `other`: The divisor

**Returns**:

- A new `BigNumber` representing the quotient

**Throws**:

- `std::invalid_argument`: If the divisor is zero

### Exponentiation

```cpp
[[nodiscard]] auto pow(int exponent) const -> BigNumber;
```

Raises this `BigNumber` to the specified power.

**Parameters**:

- `exponent`: The power to raise the number to

**Returns**:

- A new `BigNumber` representing the result of the exponentiation

**Throws**:

- `std::invalid_argument`: If the exponent is negative

## String Operations

### ToString

```cpp
[[nodiscard]] auto toString() const -> std::string;
```

Converts the `BigNumber` to its string representation.

**Returns**:

- A string representing the number

### SetString

```cpp
auto setString(std::string_view newStr) -> BigNumber&;
```

Sets the value of this `BigNumber` from a string.

**Parameters**:

- `newStr`: The new string representation

**Returns**:

- A reference to this `BigNumber` after updating

**Throws**:

- `std::invalid_argument`: If the string is not a valid number

## Utility Methods

### Negation

```cpp
[[nodiscard]] auto negate() const -> BigNumber;
```

Returns the negation of this number.

**Returns**:

- A new `BigNumber` with the opposite sign

### Absolute Value

```cpp
[[nodiscard]] auto abs() const -> BigNumber;
```

Returns the absolute value of this number.

**Returns**:

- A new `BigNumber` without a negative sign

### Trim Leading Zeros

```cpp
[[nodiscard]] auto trimLeadingZeros() const noexcept -> BigNumber;
```

Removes leading zeros from the number representation.

**Returns**:

- A new `BigNumber` with leading zeros removed

## Comparison Methods

### Equals

```cpp
[[nodiscard]] constexpr auto equals(const BigNumber& other) const noexcept -> bool;
```

Checks if this `BigNumber` is equal to another.

**Parameters**:

- `other`: The `BigNumber` to compare with

**Returns**:

- `true` if the numbers are equal, `false` otherwise

### Integer Equals

```cpp
template <std::integral T>
[[nodiscard]] constexpr auto equals(T other) const noexcept -> bool;
```

Checks if this `BigNumber` is equal to an integer.

**Parameters**:

- `other`: The integer to compare with

**Returns**:

- `true` if the `BigNumber` equals the integer, `false` otherwise

### String Equals

```cpp
[[nodiscard]] auto equals(std::string_view other) const -> bool;
```

Checks if this `BigNumber` is equal to a number represented as a string.

**Parameters**:

- `other`: The string representation to compare with

**Returns**:

- `true` if the `BigNumber` equals the represented number, `false` otherwise

## Property Checks

### Digits Count

```cpp
[[nodiscard]] constexpr auto digits() const noexcept -> size_t;
```

Gets the number of digits in this `BigNumber`.

**Returns**:

- The number of digits

### Sign Checks

```cpp
[[nodiscard]] constexpr auto isNegative() const noexcept -> bool;
[[nodiscard]] constexpr auto isPositive() const noexcept -> bool;
```

Check if the number is negative or positive/zero.

**Returns**:

- `true` if the condition is met, `false` otherwise

### Parity Checks

```cpp
[[nodiscard]] constexpr auto isEven() const noexcept -> bool;
[[nodiscard]] constexpr auto isOdd() const noexcept -> bool;
```

Check if the number is even or odd.

**Returns**:

- `true` if the condition is met, `false` otherwise

## Operators

The `BigNumber` class overloads numerous operators for more intuitive use:

- **Arithmetic Operators**: `+`, `-`, `*`, `/`, `^` (power)
- **Comparison Operators**: `==`, `>`, `<`, `>=`, `<=`
- **Compound Assignment**: `+=`, `-=`, `*=`, `/=`
- **Increment/Decrement**: `++`, `--` (both prefix and postfix)
- **Subscript**: `[]` for accessing individual digits
- **Stream Output**: `<<` for printing to output streams

## Element Access

### At

```cpp
[[nodiscard]] constexpr auto at(size_t index) const -> uint8_t;
```

Accesses the digit at the specified position with bounds checking.

**Parameters**:

- `index`: The position to access

**Returns**:

- The digit at the specified position

**Throws**:

- `std::out_of_range`: If the index is out of range

### Subscript Operator

```cpp
auto operator[](size_t index) const -> uint8_t;
```

Accesses the digit at the specified position.

**Parameters**:

- `index`: The position to access

**Returns**:

- The digit at the specified position

**Throws**:

- `std::out_of_range`: If the index is out of range

## Advanced Operations

### Parallel Multiply

```cpp
[[nodiscard]] auto parallelMultiply(const BigNumber& other) const -> BigNumber;
```

Performs multiplication using parallel computation when available.

**Parameters**:

- `other`: The `BigNumber` to multiply by

**Returns**:

- A new `BigNumber` representing the product

## Complete Example

Below is a comprehensive example demonstrating various operations of the `BigNumber` class:

```cpp
#include "atom/algorithm/bignumber.hpp"
#include <iostream>

using namespace atom::algorithm;

int main() {
    // Creating BigNumber instances
    BigNumber a("123456789012345678901234567890");
    BigNumber b(98765432109876543210LL);
    BigNumber c;  // Default constructor (zero)
    
    // Basic arithmetic
    std::cout << "a = " << a.toString() << std::endl;
    std::cout << "b = " << b.toString() << std::endl;
    
    BigNumber sum = a + b;
    std::cout << "a + b = " << sum.toString() << std::endl;
    
    BigNumber diff = a - b;
    std::cout << "a - b = " << diff.toString() << std::endl;
    
    BigNumber product = a * b;
    std::cout << "a * b = " << product.toString() << std::endl;
    
    BigNumber quotient = a / b;
    std::cout << "a / b = " << quotient.toString() << std::endl;
    
    // Exponentiation
    BigNumber squared = a.pow(2);
    std::cout << "a^2 = " << squared.toString() << std::endl;
    
    // Negation and absolute value
    BigNumber negative_a = a.negate();
    std::cout << "-a = " << negative_a.toString() << std::endl;
    std::cout << "|-a| = " << negative_a.abs().toString() << std::endl;
    
    // Comparisons
    if (a > b) {
        std::cout << "a is greater than b" << std::endl;
    } else {
        std::cout << "a is not greater than b" << std::endl;
    }
    
    // Check properties
    std::cout << "Is a even? " << (a.isEven() ? "Yes" : "No") << std::endl;
    std::cout << "Is b odd? " << (b.isOdd() ? "Yes" : "No") << std::endl;
    std::cout << "Number of digits in a: " << a.digits() << std::endl;
    
    // Compound assignments
    BigNumber d("1000");
    d += BigNumber("234");
    std::cout << "1000 + 234 = " << d.toString() << std::endl;
    
    d *= BigNumber("2");
    std::cout << "1234 * 2 = " << d.toString() << std::endl;
    
    // Increment/decrement
    BigNumber e("999");
    ++e;
    std::cout << "999++ = " << e.toString() << std::endl;
    
    BigNumber f("1000");
    --f;
    std::cout << "1000-- = " << f.toString() << std::endl;
    
    // Element access
    BigNumber g("12345");
    std::cout << "First digit of 12345: " << static_cast<int>(g[0]) << std::endl;
    std::cout << "Last digit of 12345: " << static_cast<int>(g[4]) << std::endl;
    
    // Advanced operations
    BigNumber veryLarge1("9999999999999999999999999999999999999999");
    BigNumber veryLarge2("8888888888888888888888888888888888888888");
    BigNumber hugeProduct = veryLarge1.multiplyKaratsuba(veryLarge2);
    std::cout << "Karatsuba multiplication result: " << hugeProduct.toString() << std::endl;
    
    return 0;
}
```

This example demonstrates:

1. **Creating BigNumbers** from various sources
2. **Basic arithmetic operations** including addition, subtraction, multiplication, and division
3. **Advanced operations** like exponentiation and Karatsuba multiplication
4. **Utility methods** such as negation and absolute value
5. **Comparison operations** to determine relative order
6. **Property checks** for evenness, oddness, and digit count
7. **Compound assignments** that modify numbers in place
8. **Increment and decrement** operations
9. **Element access** for examining individual digits

The `BigNumber` class provides a powerful tool for handling arithmetic with integers of virtually unlimited size, making it suitable for cryptography, mathematical research, and other applications requiring precise large-integer calculations.
