---
title: Extra Math Library
description: Comprehensive for the Extra Math Library in the atom::algorithm namespace, including functions for safe arithmetic operations, bit manipulation, and mathematical calculations for 64-bit unsigned integers.
---

## Overview

The Atom Algorithm Math Library is a robust C++ mathematical toolkit that provides optimized implementations of various mathematical operations, primarily focusing on 64-bit integer arithmetic, with SIMD acceleration for vector operations. This library is part of the Atom framework, designed to offer safe mathematical operations with proper overflow/underflow handling, bit manipulation utilities, and high-performance number theory functions.

## Features

- Safe arithmetic operations with overflow/underflow protection
- Bit manipulation utilities
- Number theory functions (GCD, LCM, prime numbers)
- SIMD-accelerated vector operations
- Fast exponentiation and modular arithmetic
- Optimized algorithms for common mathematical operations

## Table of Contents

1. [Requirements](#requirements)
2. [Safe Arithmetic Operations](#safe-arithmetic-operations)
3. [Bit Manipulation](#bit-manipulation)
4. [Number Theory Functions](#number-theory-functions)
5. [Vector Operations](#vector-operations)
6. [Other Utility Functions](#other-utility-functions)
7. [Usage Example](#usage-example)

## Requirements

- C++20 compatible compiler
- Optional: SIMD support (x86_64 or ARM NEON)
- Optional: Boost library for extended precision

## Safe Arithmetic Operations

### mulDiv64

```cpp
[[nodiscard]] auto mulDiv64(uint64_t operant, uint64_t multiplier, uint64_t divider) -> uint64_t;
```

Description: Performs a 64-bit multiplication followed by division: `(operant * multiplier) / divider`

Parameters:

- `operant`: First operand for multiplication
- `multiplier`: Second operand for multiplication
- `divider`: Divisor for the division operation

Returns: Result of `(operant * multiplier) / divider`

Exceptions:

- `atom::error::InvalidArgumentException`: If divider is zero
- `atom::error::OverflowException`: If multiplication overflows

Example:

```cpp
uint64_t result = atom::algorithm::mulDiv64(1000000, 2000000, 5);
// result = 400000000000
```

### safeAdd

```cpp
[[nodiscard]] auto safeAdd(uint64_t a, uint64_t b) -> uint64_t;
```

Description: Performs addition with overflow checking

Parameters:

- `a`: First operand
- `b`: Second operand

Returns: Result of `a + b`

Exceptions:

- `atom::error::OverflowException`: If addition would overflow

Example:

```cpp
uint64_t result = atom::algorithm::safeAdd(UINT64_MAX - 10, 5);
// result = UINT64_MAX - 5
```

### safeMul

```cpp
[[nodiscard]] auto safeMul(uint64_t a, uint64_t b) -> uint64_t;
```

Description: Performs multiplication with overflow checking

Parameters:

- `a`: First operand
- `b`: Second operand

Returns: Result of `a * b`

Exceptions:

- `atom::error::OverflowException`: If multiplication would overflow

Example:

```cpp
uint64_t result = atom::algorithm::safeMul(UINT64_MAX / 3, 2);
// result = (UINT64_MAX / 3) * 2
```

### safeSub

```cpp
[[nodiscard]] auto safeSub(uint64_t a, uint64_t b) -> uint64_t;
```

Description: Performs subtraction with underflow checking

Parameters:

- `a`: First operand (minuend)
- `b`: Second operand (subtrahend)

Returns: Result of `a - b`

Exceptions:

- `atom::error::UnderflowException`: If subtraction would underflow

Example:

```cpp
uint64_t result = atom::algorithm::safeSub(100, 50);
// result = 50
```

### safeDiv

```cpp
[[nodiscard]] auto safeDiv(uint64_t a, uint64_t b) -> uint64_t;
```

Description: Performs division with zero divisor checking

Parameters:

- `a`: Numerator
- `b`: Denominator

Returns: Result of `a / b`

Exceptions:

- `atom::error::InvalidArgumentException`: If divisor is zero

Example:

```cpp
uint64_t result = atom::algorithm::safeDiv(100, 5);
// result = 20
```

## Bit Manipulation

### rotl64

```cpp
[[nodiscard]] auto rotl64(uint64_t n, unsigned int c) noexcept -> uint64_t;
```

Description: Rotates a 64-bit integer to the left by a specified number of bits

Parameters:

- `n`: The 64-bit integer to rotate
- `c`: The number of bits to rotate

Returns: Rotated 64-bit integer

Example:

```cpp
uint64_t result = atom::algorithm::rotl64(0x1, 1);
// result = 0x2
```

### rotr64

```cpp
[[nodiscard]] auto rotr64(uint64_t n, unsigned int c) noexcept -> uint64_t;
```

Description: Rotates a 64-bit integer to the right by a specified number of bits

Parameters:

- `n`: The 64-bit integer to rotate
- `c`: The number of bits to rotate

Returns: Rotated 64-bit integer

Example:

```cpp
uint64_t result = atom::algorithm::rotr64(0x2, 1);
// result = 0x1
```

### clz64

```cpp
[[nodiscard]] auto clz64(uint64_t x) noexcept -> int;
```

Description: Counts the leading zeros in a 64-bit integer

Parameters:

- `x`: The 64-bit integer to count leading zeros in

Returns: Number of leading zeros

Example:

```cpp
int zeros = atom::algorithm::clz64(0x1);
// zeros = 63
```

### normalize

```cpp
[[nodiscard]] auto normalize(uint64_t x) noexcept -> uint64_t;
```

Description: Normalizes a 64-bit integer by shifting it left until the MSB is set

Parameters:

- `x`: The 64-bit integer to normalize

Returns: Normalized 64-bit integer

Example:

```cpp
uint64_t result = atom::algorithm::normalize(0x0000000000000001);
// result = 0x8000000000000000
```

### bitReverse64

```cpp
[[nodiscard]] auto bitReverse64(uint64_t n) noexcept -> uint64_t;
```

Description: Calculates the bitwise reverse of a 64-bit integer

Parameters:

- `n`: The 64-bit integer to reverse

Returns: Bitwise reversed 64-bit integer

Example:

```cpp
uint64_t result = atom::algorithm::bitReverse64(0x1);
// result = 0x8000000000000000
```

### isPowerOfTwo

```cpp
[[nodiscard]] auto isPowerOfTwo(uint64_t n) noexcept -> bool;
```

Description: Checks if a 64-bit integer is a power of two

Parameters:

- `n`: The 64-bit integer to check

Returns: `true` if the integer is a power of two, `false` otherwise

Example:

```cpp
bool result = atom::algorithm::isPowerOfTwo(64);
// result = true
```

### nextPowerOfTwo

```cpp
[[nodiscard]] auto nextPowerOfTwo(uint64_t n) noexcept -> uint64_t;
```

Description: Calculates the next power of two for a 64-bit integer

Parameters:

- `n`: The 64-bit integer for which to calculate the next power of two

Returns: Next power of two

Example:

```cpp
uint64_t result = atom::algorithm::nextPowerOfTwo(63);
// result = 64
```

## Number Theory Functions

### gcd64

```cpp
[[nodiscard]] auto gcd64(uint64_t a, uint64_t b) noexcept -> uint64_t;
```

Description: Calculates the greatest common divisor (GCD) of two 64-bit integers

Parameters:

- `a`: First integer
- `b`: Second integer

Returns: Greatest common divisor

Example:

```cpp
uint64_t result = atom::algorithm::gcd64(48, 18);
// result = 6
```

### lcm64

```cpp
[[nodiscard]] auto lcm64(uint64_t a, uint64_t b) -> uint64_t;
```

Description: Calculates the least common multiple (LCM) of two 64-bit integers

Parameters:

- `a`: First integer
- `b`: Second integer

Returns: Least common multiple

Exceptions:

- `atom::error::OverflowException`: If calculation would overflow

Example:

```cpp
uint64_t result = atom::algorithm::lcm64(12, 18);
// result = 36
```

### isPrime

```cpp
[[nodiscard]] auto isPrime(uint64_t n) noexcept -> bool;
```

Description: Checks if a number is prime using optimized trial division

Parameters:

- `n`: Number to check

Returns: `true` if the number is prime, `false` otherwise

Example:

```cpp
bool result = atom::algorithm::isPrime(17);
// result = true
```

### generatePrimes

```cpp
[[nodiscard]] auto generatePrimes(uint64_t limit) -> std::vector<uint64_t>;
```

Description: Generates prime numbers up to a limit using the Sieve of Eratosthenes

Parameters:

- `limit`: Upper limit for prime generation

Returns: Vector of primes up to the specified limit

Exceptions:

- `atom::error::InvalidArgumentException`: If limit is too large

Example:

```cpp
auto primes = atom::algorithm::generatePrimes(20);
// primes = {2, 3, 5, 7, 11, 13, 17, 19}
```

### montgomeryMultiply

```cpp
[[nodiscard]] auto montgomeryMultiply(uint64_t a, uint64_t b, uint64_t n) -> uint64_t;
```

Description: Performs Montgomery modular multiplication: `(a * b) mod n`

Parameters:

- `a`: First operand
- `b`: Second operand
- `n`: Modulus

Returns: Result of `(a * b) mod n`

Exceptions:

- `atom::error::InvalidArgumentException`: If modulus is zero

Example:

```cpp
uint64_t result = atom::algorithm::montgomeryMultiply(123, 456, 789);
// result = (123 * 456) % 789 = 57
```

### modPow

```cpp
[[nodiscard]] auto modPow(uint64_t base, uint64_t exponent, uint64_t modulus) -> uint64_t;
```

Description: Calculates modular exponentiation using Montgomery reduction: `(base^exponent) mod modulus`

Parameters:

- `base`: Base value
- `exponent`: Exponent value
- `modulus`: Modulus

Returns: Result of `(base^exponent) mod modulus`

Exceptions:

- `atom::error::InvalidArgumentException`: If modulus is zero

Example:

```cpp
uint64_t result = atom::algorithm::modPow(4, 13, 497);
// result = (4^13) % 497 = 445
```

## Vector Operations

### parallelVectorAdd

```cpp
template <Arithmetic T>
[[nodiscard]] auto parallelVectorAdd(std::span<const T> a, std::span<const T> b) -> std::vector<T>;
```

Description: Performs parallel addition of two vectors using SIMD when available

Parameters:

- `a`: First vector
- `b`: Second vector

Returns: Vector containing element-wise sums

Exceptions:

- `atom::error::InvalidArgumentException`: If vectors have different sizes

Example:

```cpp
std::vector<int> a = {1, 2, 3, 4};
std::vector<int> b = {5, 6, 7, 8};
auto result = atom::algorithm::parallelVectorAdd(std::span(a), std::span(b));
// result = {6, 8, 10, 12}
```

### parallelVectorMul

```cpp
template <Arithmetic T>
[[nodiscard]] auto parallelVectorMul(std::span<const T> a, std::span<const T> b) -> std::vector<T>;
```

Description: Performs parallel multiplication of two vectors using SIMD when available

Parameters:

- `a`: First vector
- `b`: Second vector

Returns: Vector containing element-wise products

Exceptions:

- `atom::error::InvalidArgumentException`: If vectors have different sizes

Example:

```cpp
std::vector<int> a = {1, 2, 3, 4};
std::vector<int> b = {5, 6, 7, 8};
auto result = atom::algorithm::parallelVectorMul(std::span(a), std::span(b));
// result = {5, 12, 21, 32}
```

## Other Utility Functions

### approximateSqrt

```cpp
[[nodiscard]] auto approximateSqrt(uint64_t n) noexcept -> uint64_t;
```

Description: Approximates the square root of a 64-bit integer using fast algorithm

Parameters:

- `n`: The 64-bit integer for which to approximate the square root

Returns: Approximate square root

Example:

```cpp
uint64_t result = atom::algorithm::approximateSqrt(100);
// result = 10
```

### fastPow

```cpp
template <std::integral T>
[[nodiscard]] auto fastPow(T base, T exponent) noexcept -> T;
```

Description: Fast exponentiation for integral types using binary exponentiation

Parameters:

- `base`: The base value
- `exponent`: The exponent value

Returns: Result of `base^exponent`

Example:

```cpp
int result = atom::algorithm::fastPow(2, 10);
// result = 1024
```

## Usage Example

Here's a comprehensive example demonstrating the usage of various functions from the Atom Algorithm Math Library:

```cpp
#include "atom/algorithm/math.hpp"
#include <iostream>
#include <vector>
#include <span>

int main() {
    try {
        // Safe arithmetic operations
        std::cout << "===== Safe Arithmetic Operations =====" << std::endl;
        
        uint64_t sum = atom::algorithm::safeAdd(1000, 2000);
        std::cout << "safeAdd(1000, 2000) = " << sum << std::endl;
        
        uint64_t product = atom::algorithm::safeMul(123, 456);
        std::cout << "safeMul(123, 456) = " << product << std::endl;
        
        uint64_t difference = atom::algorithm::safeSub(1000, 400);
        std::cout << "safeSub(1000, 400) = " << difference << std::endl;
        
        uint64_t quotient = atom::algorithm::safeDiv(1000, 50);
        std::cout << "safeDiv(1000, 50) = " << quotient << std::endl;
        
        uint64_t muldiv = atom::algorithm::mulDiv64(1000, 3000, 50);
        std::cout << "mulDiv64(1000, 3000, 50) = " << muldiv << std::endl;
        
        // Bit manipulation
        std::cout << "\n===== Bit Manipulation =====" << std::endl;
        
        uint64_t rotated_left = atom::algorithm::rotl64(0x8000000000000000, 1);
        std::cout << "rotl64(0x8000000000000000, 1) = 0x" << std::hex << rotated_left << std::dec << std::endl;
        
        uint64_t rotated_right = atom::algorithm::rotr64(0x1, 1);
        std::cout << "rotr64(0x1, 1) = 0x" << std::hex << rotated_right << std::dec << std::endl;
        
        int leading_zeros = atom::algorithm::clz64(0x10);
        std::cout << "clz64(0x10) = " << leading_zeros << std::endl;
        
        uint64_t normalized = atom::algorithm::normalize(0x10);
        std::cout << "normalize(0x10) = 0x" << std::hex << normalized << std::dec << std::endl;
        
        uint64_t reversed = atom::algorithm::bitReverse64(0x1);
        std::cout << "bitReverse64(0x1) = 0x" << std::hex << reversed << std::dec << std::endl;
        
        bool is_power_of_two = atom::algorithm::isPowerOfTwo(64);
        std::cout << "isPowerOfTwo(64) = " << std::boolalpha << is_power_of_two << std::endl;
        
        uint64_t next_power = atom::algorithm::nextPowerOfTwo(63);
        std::cout << "nextPowerOfTwo(63) = " << next_power << std::endl;
        
        // Number theory
        std::cout << "\n===== Number Theory =====" << std::endl;
        
        uint64_t gcd = atom::algorithm::gcd64(48, 18);
        std::cout << "gcd64(48, 18) = " << gcd << std::endl;
        
        uint64_t lcm = atom::algorithm::lcm64(12, 18);
        std::cout << "lcm64(12, 18) = " << lcm << std::endl;
        
        bool is_prime = atom::algorithm::isPrime(17);
        std::cout << "isPrime(17) = " << std::boolalpha << is_prime << std::endl;
        
        std::vector<uint64_t> primes = atom::algorithm::generatePrimes(30);
        std::cout << "generatePrimes(30) = { ";
        for (auto prime : primes) {
            std::cout << prime << " ";
        }
        std::cout << "}" << std::endl;
        
        uint64_t modular_product = atom::algorithm::montgomeryMultiply(123, 456, 789);
        std::cout << "montgomeryMultiply(123, 456, 789) = " << modular_product << std::endl;
        
        uint64_t mod_power = atom::algorithm::modPow(4, 13, 497);
        std::cout << "modPow(4, 13, 497) = " << mod_power << std::endl;
        
        // Vector operations
        std::cout << "\n===== Vector Operations =====" << std::endl;
        
        std::vector<int> a = {1, 2, 3, 4, 5};
        std::vector<int> b = {6, 7, 8, 9, 10};
        
        std::vector<int> sum_vector = atom::algorithm::parallelVectorAdd(std::span(a), std::span(b));
        std::cout << "parallelVectorAdd result = { ";
        for (auto val : sum_vector) {
            std::cout << val << " ";
        }
        std::cout << "}" << std::endl;
        
        std::vector<int> product_vector = atom::algorithm::parallelVectorMul(std::span(a), std::span(b));
        std::cout << "parallelVectorMul result = { ";
        for (auto val : product_vector) {
            std::cout << val << " ";
        }
        std::cout << "}" << std::endl;
        
        // Other utilities
        std::cout << "\n===== Other Utilities =====" << std::endl;
        
        uint64_t sqrt_approx = atom::algorithm::approximateSqrt(100);
        std::cout << "approximateSqrt(100) = " << sqrt_approx << std::endl;
        
        int pow_result = atom::algorithm::fastPow(2, 10);
        std::cout << "fastPow(2, 10) = " << pow_result << std::endl;
        
    } catch (const atom::error::Exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    } catch (const std::exception& e) {
        std::cerr << "Standard exception: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
```

### Expected Output

```text
===== Safe Arithmetic Operations =====
safeAdd(1000, 2000) = 3000
safeMul(123, 456) = 56088
safeSub(1000, 400) = 600
safeDiv(1000, 50) = 20
mulDiv64(1000, 3000, 50) = 60000

===== Bit Manipulation =====
rotl64(0x8000000000000000, 1) = 0x1
rotr64(0x1, 1) = 0x8000000000000000
clz64(0x10) = 59
normalize(0x10) = 0x8000000000000000
bitReverse64(0x1) = 0x8000000000000000
isPowerOfTwo(64) = true
nextPowerOfTwo(63) = 64

===== Number Theory =====
gcd64(48, 18) = 6
lcm64(12, 18) = 36
isPrime(17) = true
generatePrimes(30) = { 2 3 5 7 11 13 17 19 23 29 }
montgomeryMultiply(123, 456, 789) = 57
modPow(4, 13, 497) = 445

===== Vector Operations =====
parallelVectorAdd result = { 7 9 11 13 15 }
parallelVectorMul result = { 6 14 24 36 50 }

===== Other Utilities =====
approximateSqrt(100) = 10
fastPow(2, 10) = 1024
```

This example demonstrates the full range of functionality provided by the Atom Algorithm Math Library, showcasing safe arithmetic operations, bit manipulation, number theory functions, vector operations, and various mathematical utilities.
