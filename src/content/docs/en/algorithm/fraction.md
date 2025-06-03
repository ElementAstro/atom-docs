---
title: Fraction
description: Comprehensive for the Fraction class in the atom::algorithm namespace, including constructors, arithmetic operations, comparisons, conversions, and usage examples.
---

## Purpose and High-Level Overview

The Fraction class library provides a comprehensive implementation for working with rational numbers (fractions) in C++. This library allows precise arithmetic operations without the loss of precision that occurs with floating-point calculations, making it ideal for financial calculations, scientific computations requiring exact rational arithmetic, and mathematical applications.

The library implements a Fraction class that represents a mathematical fraction with numerator and denominator, along with a complete set of arithmetic operations, comparison operators, and utility functions. The implementation automatically reduces fractions to their simplest form and handles proper sign representation.

## Detailed Class and Method Documentation

### FractionException Class

```cpp
class FractionException : public std::runtime_error {
public:
    explicit FractionException(const std::string& message);
};
```

Purpose: Custom exception class for Fraction-specific errors.

Methods:

- Constructor: Creates a new exception with the given error message.
  - Parameters: `message` - A string describing the error.

### Fraction Class

```cpp
class Fraction {
    // ... (see detailed methods below)
};
```

Purpose: Represents a mathematical fraction with a numerator and denominator.

#### Constructors and Destructors

```cpp
constexpr Fraction(int n, int d);
constexpr explicit Fraction(int value) noexcept;
constexpr Fraction() noexcept;
constexpr Fraction(const Fraction&) noexcept = default;
constexpr Fraction(Fraction&&) noexcept = default;
~Fraction() = default;
```

- `Fraction(int n, int d)`: Creates a fraction with the given numerator and denominator.
  - Parameters:
    - `n` - Numerator value
    - `d` - Denominator value (cannot be zero)
  - Throws: `FractionException` if denominator is zero
  - Notes: Automatically reduces the fraction to its simplest form

- `explicit Fraction(int value)`: Creates a fraction from an integer (denominator = 1).
  - Parameters: `value` - Integer value to convert to a fraction

- `Fraction()`: Default constructor that creates a fraction with value 0/1.

- Copy and Move constructors: Standard constructors that copy or move fraction values.

#### Assignment Operators

```cpp
constexpr Fraction& operator=(const Fraction&) noexcept = default;
constexpr Fraction& operator=(Fraction&&) noexcept = default;
```

- Standard copy and move assignment operators.

#### Accessors

```cpp
[[nodiscard]] constexpr int getNumerator() const noexcept;
[[nodiscard]] constexpr int getDenominator() const noexcept;
```

- `getNumerator()`: Returns the numerator of the fraction.
  - Return Value: The numerator as an integer.

- `getDenominator()`: Returns the denominator of the fraction.
  - Return Value: The denominator as an integer.

#### Arithmetic Operators

```cpp
Fraction& operator+=(const Fraction& other);
Fraction& operator-=(const Fraction& other);
Fraction& operator*=(const Fraction& other);
Fraction& operator/=(const Fraction& other);

[[nodiscard]] Fraction operator+(const Fraction& other) const;
[[nodiscard]] Fraction operator-(const Fraction& other) const;
[[nodiscard]] Fraction operator*(const Fraction& other) const;
[[nodiscard]] Fraction operator/(const Fraction& other) const;

[[nodiscard]] constexpr Fraction operator+() const noexcept;
[[nodiscard]] constexpr Fraction operator-() const noexcept;
```

- `operator+=`: Adds another fraction to this one.
  - Parameters: `other` - The fraction to add
  - Return Value: Reference to the modified fraction
  - Throws: `FractionException` on arithmetic overflow

- `operator-=`: Subtracts another fraction from this one.
  - Parameters: `other` - The fraction to subtract
  - Return Value: Reference to the modified fraction
  - Throws: `FractionException` on arithmetic overflow

- `operator*=`: Multiplies this fraction by another.
  - Parameters: `other` - The fraction to multiply by
  - Return Value: Reference to the modified fraction
  - Throws: `FractionException` if multiplication leads to zero denominator

- `operator/=`: Divides this fraction by another.
  - Parameters: `other` - The fraction to divide by
  - Return Value: Reference to the modified fraction
  - Throws: `FractionException` if division by zero occurs

- Binary arithmetic operators (`+`, `-`, `*`, `/`): These create and return new fractions.
  - Parameters: `other` - The fraction to perform the operation with
  - Return Value: A new fraction representing the result

- Unary operators (`+`, `-`): These return copies or negations of the current fraction.
  - Return Value: A new fraction with the appropriate sign

#### Comparison Operators

```cpp
#if __cplusplus >= 202002L
[[nodiscard]] auto operator<=>(const Fraction& other) const -> std::strong_ordering;
#else
[[nodiscard]] bool operator<(const Fraction& other) const noexcept;
[[nodiscard]] bool operator<=(const Fraction& other) const noexcept;
[[nodiscard]] bool operator>(const Fraction& other) const noexcept;
[[nodiscard]] bool operator>=(const Fraction& other) const noexcept;
#endif

[[nodiscard]] bool operator==(const Fraction& other) const noexcept;
[[nodiscard]] bool operator!=(const Fraction& other) const noexcept;
```

- `operator<=>`: Spaceship operator for C++20 and later for three-way comparison.
  - Parameters: `other` - The fraction to compare with
  - Return Value: A `std::strong_ordering` indicating less, equal, or greater
  
- Traditional comparison operators (`<`, `<=`, `>`, `>=`): For C++ before C++20.
  - Parameters: `other` - The fraction to compare with
  - Return Value: Boolean result of the comparison

- `operator==` and `operator!=`: Equality testing operators.
  - Parameters: `other` - The fraction to compare with
  - Return Value: Boolean indicating equality or inequality

#### Type Conversion

```cpp
[[nodiscard]] constexpr explicit operator double() const noexcept;
[[nodiscard]] constexpr explicit operator float() const noexcept;
[[nodiscard]] constexpr explicit operator int() const noexcept;
[[nodiscard]] std::string toString() const;
[[nodiscard]] constexpr double toDouble() const noexcept;
```

- `operator double()`: Converts the fraction to a double.
  - Return Value: Fraction value as a double

- `operator float()`: Converts the fraction to a float.
  - Return Value: Fraction value as a float

- `operator int()`: Converts the fraction to an integer by truncating toward zero.
  - Return Value: Fraction value as an integer

- `toString()`: Converts the fraction to a string representation.
  - Return Value: String in the format "numerator/denominator" or just "numerator" if denominator is 1

- `toDouble()`: Converts the fraction to a double value.
  - Return Value: Fraction value as a double

#### Utility Methods

```cpp
Fraction& invert();
[[nodiscard]] constexpr Fraction abs() const noexcept;
[[nodiscard]] constexpr bool isZero() const noexcept;
[[nodiscard]] constexpr bool isPositive() const noexcept;
[[nodiscard]] constexpr bool isNegative() const noexcept;
[[nodiscard]] std::optional<Fraction> pow(int exponent) const noexcept;
```

- `invert()`: Inverts the fraction (swaps numerator and denominator).
  - Return Value: Reference to the modified fraction
  - Throws: `FractionException` if numerator is zero

- `abs()`: Returns the absolute value of the fraction.
  - Return Value: A new fraction with positive sign

- `isZero()`: Checks if the fraction equals zero.
  - Return Value: `true` if numerator is 0, `false` otherwise

- `isPositive()`: Checks if the fraction is greater than zero.
  - Return Value: `true` if numerator is positive, `false` otherwise

- `isNegative()`: Checks if the fraction is less than zero.
  - Return Value: `true` if numerator is negative, `false` otherwise

- `pow(int exponent)`: Raises the fraction to the given power.
  - Parameters: `exponent` - Integer power to raise the fraction to
  - Return Value: `std::optional<Fraction>` containing the result, or `std::nullopt` if the operation cannot be performed
  - Notes: Handles negative exponents by inverting the fraction

#### Static Methods

```cpp
[[nodiscard]] static std::optional<Fraction> fromString(std::string_view str) noexcept;
```

- `fromString()`: Creates a fraction from a string representation.
  - Parameters: `str` - String in format "numerator/denominator" or just "numerator"
  - Return Value: `std::optional<Fraction>` containing the parsed fraction, or `std::nullopt` if parsing fails

#### Boost Integration (Optional)

```cpp
#ifdef ATOM_USE_BOOST_RATIONAL
[[nodiscard]] boost::rational<int> toBoostRational() const;
explicit Fraction(const boost::rational<int>& r);
#endif
```

- `toBoostRational()`: Converts to a `boost::rational`.
  - Return Value: Equivalent `boost::rational<int>`

- Constructor from `boost::rational`: Creates a fraction from a `boost::rational`.
  - Parameters: `r` - The `boost::rational` to convert from

#### Stream Operators

```cpp
friend auto operator<<(std::ostream& os, const Fraction& f) -> std::ostream&;
friend auto operator>>(std::istream& is, Fraction& f) -> std::istream&;
```

- `operator<<`: Outputs the fraction to an output stream.
  - Parameters:
    - `os` - Output stream
    - `f` - Fraction to output
  - Return Value: Reference to the output stream

- `operator>>`: Inputs a fraction from an input stream.
  - Parameters:
    - `is` - Input stream
    - `f` - Fraction to store the input into
  - Return Value: Reference to the input stream
  - Throws: `FractionException` if the input format is invalid or denominator is zero

### Free Functions

```cpp
[[nodiscard]] inline constexpr Fraction makeFraction(int value) noexcept;
[[nodiscard]] Fraction makeFraction(double value, int max_denominator = 1000000);
[[nodiscard]] inline constexpr Fraction operator""_fr(unsigned long long value) noexcept;
```

- `makeFraction(int value)`: Creates a fraction from an integer.
  - Parameters: `value` - Integer value
  - Return Value: A fraction with the given value as numerator and 1 as denominator

- `makeFraction(double value, int max_denominator)`: Creates a fraction from a double by approximating it.
  - Parameters:
    - `value` - Double value to approximate
    - `max_denominator` - Maximum allowed denominator to limit approximation precision
  - Return Value: A fraction approximating the double value

- `operator""_fr`: User-defined literal for creating fractions.
  - Parameters: `value` - Integer value
  - Return Value: A fraction with the given value as numerator and 1 as denominator
  - Usage: `3_fr` creates a fraction equivalent to 3/1

## Key Features with Code Examples

### Basic Fraction Creation and Arithmetic

```cpp
#include <iostream>
#include "fraction.hpp"

using atom::algorithm::Fraction;

int main() {
    // Create fractions
    Fraction a(1, 2);     // 1/2
    Fraction b(3, 4);     // 3/4
    
    // Basic arithmetic
    Fraction sum = a + b;              // 1/2 + 3/4 = 5/4
    Fraction difference = b - a;       // 3/4 - 1/2 = 1/4
    Fraction product = a * b;          // 1/2 * 3/4 = 3/8
    Fraction quotient = a / b;         // 1/2 / 3/4 = 2/3
    
    // Print results
    std::cout << "a = " << a << std::endl;                 // a = 1/2
    std::cout << "b = " << b << std::endl;                 // b = 3/4
    std::cout << "a + b = " << sum << std::endl;           // a + b = 5/4
    std::cout << "b - a = " << difference << std::endl;    // b - a = 1/4
    std::cout << "a * b = " << product << std::endl;       // a * b = 3/8
    std::cout << "a / b = " << quotient << std::endl;      // a / b = 2/3
    
    return 0;
}
```

### Fraction Comparison and Type Conversion

```cpp
#include <iostream>
#include "fraction.hpp"

using atom::algorithm::Fraction;

int main() {
    Fraction a(3, 4);
    Fraction b(6, 8);  // Same as 3/4 when reduced
    Fraction c(2, 3);
    
    // Comparison operations
    std::cout << "a == b: " << (a == b) << std::endl;            // true
    std::cout << "a != c: " << (a != c) << std::endl;            // true
    std::cout << "a > c: " << (a > c) << std::endl;              // true
    std::cout << "c < a: " << (c < a) << std::endl;              // true
    
    // Type conversion
    double aDouble = static_cast<double>(a);
    float aFloat = static_cast<float>(a);
    int aInt = static_cast<int>(a);
    std::string aString = a.toString();
    
    std::cout << "a as double: " << aDouble << std::endl;        // 0.75
    std::cout << "a as float: " << aFloat << std::endl;          // 0.75
    std::cout << "a as int: " << aInt << std::endl;              // 0 (truncates)
    std::cout << "a as string: " << aString << std::endl;        // "3/4"
    
    return 0;
}
```

### Utility Functions and Special Operations

```cpp
#include <iostream>
#include "fraction.hpp"

using atom::algorithm::Fraction;
using atom::algorithm::makeFraction;
using atom::algorithm::operator""_fr;

int main() {
    // Using makeFraction and user-defined literal
    auto a = makeFraction(2);           // 2/1
    auto b = 5_fr;                       // 5/1
    
    // Creating from floating-point (approximation)
    auto c = makeFraction(0.333, 100);   // Approximates to 1/3
    
    // Utility methods
    Fraction d(-5, 8);
    Fraction e(3, 4);
    
    std::cout << "d = " << d << std::endl;                      // -5/8
    std::cout << "d.abs() = " << d.abs() << std::endl;          // 5/8
    std::cout << "d.isNegative() = " << d.isNegative() << std::endl;  // true
    
    // Power operation
    auto e_squared = e.pow(2);
    if (e_squared) {
        std::cout << "e^2 = " << *e_squared << std::endl;       // 9/16
    }
    
    // Parsing from string
    auto f = Fraction::fromString("7/9");
    if (f) {
        std::cout << "Parsed fraction: " << *f << std::endl;    // 7/9
    }
    
    return 0;
}
```

## Implementation Details and Edge Cases

### Fraction Reduction

The class automatically reduces fractions to their simplest form using the Greatest Common Divisor (GCD) algorithm. This happens in the constructor and after any arithmetic operation.

```cpp
void Fraction::reduce() noexcept {
    // Implementation uses gcd to find the greatest common divisor
    // and divides both numerator and denominator by it
    
    // Also handles sign normalization - negative sign is always in numerator
    if (denominator < 0) {
        numerator = -numerator;
        denominator = -denominator;
    }
    
    int g = gcd(std::abs(numerator), denominator);
    if (g > 1) {
        numerator /= g;
        denominator /= g;
    }
}
```

### Handling of Special Cases

The implementation handles several edge cases carefully:

1. Zero Denominator: The class explicitly checks for and rejects zero denominators in the constructor and division operations.

2. Integer Overflow: The arithmetic operations include checks to prevent integer overflow.

3. Negative Fractions: The sign is normalized with the numerator always carrying the sign, and the denominator always being positive.

4. Division by Zero: Division by a fraction with a zero numerator throws a `FractionException`.

5. Zero Fraction: A zero fraction is always represented as 0/1.

## Performance Considerations

1. Memory Usage: The `Fraction` class uses two `int` values, so its size is typically 8 bytes. This is more memory-efficient than using `double` for representing exact rational values.

2. Computation Overhead: Each arithmetic operation requires finding the GCD to reduce the fraction, which adds some computational overhead compared to floating-point operations.

3. Integer Overflow: For fractions with large numerators or denominators, integer overflow is a concern. The implementation includes checks to detect overflow, but this limits the range of representable fractions to what can fit in a 32-bit integer.

4. Constexpr Support: Many functions are marked as `constexpr` to enable compile-time computation when possible, which can improve runtime performance.

## Best Practices and Common Pitfalls

### Best Practices

1. Use Factory Functions for Safety:

   ```cpp
   // Prefer this:
   auto f = makeFraction(3, 4);
   
   // Over direct construction for better exception safety:
   Fraction f(3, 4);
   ```

2. Check Optional Return Values:

   ```cpp
   auto f = Fraction::fromString("invalid");
   if (f) {
       // Use *f safely
   } else {
       // Handle parsing failure
   }
   ```

3. Use Exception Handling for Error Cases:

   ```cpp
   try {
       Fraction f(1, 0);  // Will throw
   } catch (const atom::algorithm::FractionException& e) {
       std::cerr << "Error: " << e.what() << std::endl;
   }
   ```

### Common Pitfalls

1. Integer Overflow: When multiplying fractions with large numerators or denominators, overflow may occur.

   ```cpp
   // This might overflow:
   Fraction a(std::numeric_limits<int>::max(), 2);
   Fraction b(2, 1);
   Fraction c = a * b;  // Potential overflow
   ```

2. Precision Loss in Conversion: Converting a floating-point value to a fraction using `makeFraction` may result in an approximation.

   ```cpp
   // This is an approximation:
   auto f = makeFraction(0.1);  // Not exactly 1/10 due to binary representation issues
   ```

3. Division by Zero: Attempting to divide by a zero fraction will throw an exception.

   ```cpp
   Fraction a(3, 4);
   Fraction b(0, 1);
   Fraction c = a / b;  // Throws FractionException
   ```

## Required Headers and Dependencies

### Standard Library Dependencies

The `Fraction` class relies on the following standard C++ headers:

```cpp
#include <cmath>       // For std::abs
#include <compare>     // For std::strong_ordering (C++20)
#include <iostream>    // For stream operators
#include <optional>    // For std::optional
#include <stdexcept>   // For std::runtime_error
#include <string>      // For std::string
#include <string_view> // For std::string_view
```

### Optional External Dependencies

```cpp
// Optional Boost dependency
#ifdef ATOM_USE_BOOST_RATIONAL
#include <boost/rational.hpp>
#endif
```

- The library optionally integrates with Boost's `rational` template for interoperability with Boost code.
- To enable this integration, define the macro `ATOM_USE_BOOST_RATIONAL` before including the header.

## Platform and Compiler Considerations

1. C++ Standard Version:
   - The library provides specialized implementations for different C++ standards.
   - C++20 features like the spaceship operator (`<=>`) are conditionally used when available.
   - The fallback implementation for older compilers uses traditional comparison operators.

2. Compiler Support:
   - The code uses `constexpr` extensively, requiring a C++11 or later compiler.
   - Full features require at least C++17 for `std::optional` and `std::string_view`.
   - The spaceship operator requires C++20.

3. Portability:
   - The implementation avoids platform-specific features, making it portable across different operating systems.
   - Integer overflow handling may vary across platforms, but the implementation includes checks to minimize differences.

## Comprehensive Example

The following example demonstrates the major features of the `Fraction` class in a complete application:

```cpp
#include <iostream>
#include <vector>
#include "fraction.hpp"

using namespace atom::algorithm;

// Function to demonstrate arithmetic operations
void demonstrateArithmetic() {
    std::cout << "\n=== Arithmetic Operations ===\n";
    
    Fraction a(3, 4);
    Fraction b(2, 5);
    
    std::cout << a << " + " << b << " = " << (a + b) << std::endl;
    std::cout << a << " - " << b << " = " << (a - b) << std::endl;
    std::cout << a << " * " << b << " = " << (a * b) << std::endl;
    std::cout << a << " / " << b << " = " << (a / b) << std::endl;
    
    // Compound assignment
    Fraction c = a;
    std::cout << "c = " << c << std::endl;
    c += b;
    std::cout << "c += " << b << " --> c = " << c << std::endl;
    c -= b;
    std::cout << "c -= " << b << " --> c = " << c << std::endl;
    c *= b;
    std::cout << "c *= " << b << " --> c = " << c << std::endl;
    c /= b;
    std::cout << "c /= " << b << " --> c = " << c << std::endl;
}

// Function to demonstrate comparison operations
void demonstrateComparisons() {
    std::cout << "\n=== Comparison Operations ===\n";
    
    Fraction a(3, 4);
    Fraction b(2, 3);
    Fraction c(6, 8);  // Equal to 3/4 when reduced
    
    std::cout << a << " == " << c << " ? " << (a == c) << std::endl;
    std::cout << a << " != " << b << " ? " << (a != b) << std::endl;
    std::cout << a << " < " << b << " ? " << (a < b) << std::endl;
    std::cout << a << " <= " << c << " ? " << (a <= c) << std::endl;
    std::cout << a << " > " << b << " ? " << (a > b) << std::endl;
    std::cout << a << " >= " << c << " ? " << (a >= c) << std::endl;
}

// Function to demonstrate utility methods
void demonstrateUtilities() {
    std::cout << "\n=== Utility Methods ===\n";
    
    Fraction a(-3, 8);
    
    std::cout << "Fraction: " << a << std::endl;
    std::cout << "Numerator: " << a.getNumerator() << std::endl;
    std::cout << "Denominator: " << a.getDenominator() << std::endl;
    std::cout << "As double: " << a.toDouble() << std::endl;
    std::cout << "As string: " << a.toString() << std::endl;
    std::cout << "Absolute value: " << a.abs() << std::endl;
    std::cout << "Is zero? " << a.isZero() << std::endl;
    std::cout << "Is positive? " << a.isPositive() << std::endl;
    std::cout << "Is negative? " << a.isNegative() << std::endl;
    
    // Power operation
    auto squared = a.pow(2);
    if (squared) {
        std::cout << a << " squared = " << *squared << std::endl;
    }
    
    // Inversion
    Fraction b = a;
    try {
        b.invert();
        std::cout << "Invert " << a << " = " << b << std::endl;
    } catch (const FractionException& e) {
        std::cout << "Exception: " << e.what() << std::endl;
    }
}

// Function to demonstrate creation methods
void demonstrateCreation() {
    std::cout << "\n=== Creation Methods ===\n";
    
    // Standard constructor
    Fraction a(3, 4);
    std::cout << "Fraction(3, 4) = " << a << std::endl;
    
    // Integer constructor
    Fraction b(5);
    std::cout << "Fraction(5) = " << b << std::endl;
    
    // Default constructor
    Fraction c;
    std::cout << "Fraction() = " << c << std::endl;
    
    // Factory function
    auto d = makeFraction(7);
    std::cout << "makeFraction(7) = " << d << std::endl;
    
    // Factory function from double
    auto e = makeFraction(0.333, 100);
    std::cout << "makeFraction(0.333, 100) = " << e << std::endl;
    
    // User-defined literal
    auto f = 5_fr;
    std::cout << "5_fr = " << f << std::endl;
    
    // From string
    auto g = Fraction::fromString("5/9");
    if (g) {
        std::cout << "fromString(\"5/9\") = " << *g << std::endl;
    }
}

// Function to demonstrate error handling
void demonstrateErrorHandling() {
    std::cout << "\n=== Error Handling ===\n";
    
    // Zero denominator
    try {
        Fraction a(1, 0);
    } catch (const FractionException& e) {
        std::cout << "Exception creating fraction with zero denominator: " << e.what() << std::endl;
    }
    
    // Division by zero
    try {
        Fraction a(3, 4);
        Fraction b(0, 1);
        Fraction c = a / b;
    } catch (const FractionException& e) {
        std::cout << "Exception dividing by zero fraction: " << e.what() << std::endl;
    }
    
    // Parsing invalid string
    auto f = Fraction::fromString("invalid");
    if (!f) {
        std::cout << "Parsing 'invalid' returned std::nullopt as expected" << std::endl;
    }
}

int main() {
    std::cout << "=== Fraction Class Demonstration ===\n";
    
    demonstrateCreation();
    demonstrateArithmetic();
    demonstrateComparisons();
    demonstrateUtilities();
    demonstrateErrorHandling();
    
    // Practical example: Finding the sum of a sequence of fractions
    std::cout << "\n=== Practical Example: Sum of Fractions ===\n";
    
    std::vector<Fraction> fractions = {
        Fraction(1, 2),
        Fraction(1, 3),
        Fraction(1, 4),
        Fraction(1, 5)
    };
    
    Fraction sum;
    for (const auto& f : fractions) {
        sum += f;
    }
    
    std::cout << "Sum of ";
    for (size_t i = 0; i < fractions.size(); ++i) {
        std::cout << fractions[i];
        if (i < fractions.size() - 1) {
            std::cout << " + ";
        }
    }
    std::cout << " = " << sum << std::endl;
    std::cout << "As decimal: " << sum.toDouble() << std::endl;
    
    return 0;
}
```

Expected Output:

```txt
=== Fraction Class Demonstration ===

=== Creation Methods ===
Fraction(3, 4) = 3/4
Fraction(5) = 5
Fraction() = 0
makeFraction(7) = 7
makeFraction(0.333, 100) = 1/3
5_fr = 5
fromString("5/9") = 5/9

=== Arithmetic Operations ===
3/4 + 2/5 = 23/20
3/4 - 2/5 = 7/20
3/4 * 2/5 = 3/10
3/4 / 2/5 = 15/8
c = 3/4
c += 2/5 --> c = 23/20
c -= 2/5 --> c = 3/4
c *= 2/5 --> c = 3/10
c /= 2/5 --> c = 3/4

=== Comparison Operations ===
3/4 == 3/4 ? 1
3/4 != 2/3 ? 1
3/4 < 2/3 ? 0
3/4 <= 3/4 ? 1
3/4 > 2/3 ? 1
3/4 >= 3/4 ? 1

=== Utility Methods ===
Fraction: -3/8
Numerator: -3
Denominator: 8
As double: -0.375
As string: -3/8
Absolute value: 3/8
Is zero? 0
Is positive? 0
Is negative? 1
-3/8 squared = 9/64
Invert -3/8 = -8/3

=== Error Handling ===
Exception creating fraction with zero denominator: Denominator cannot be zero.
Exception dividing by zero fraction: Division by zero.
Parsing 'invalid' returned std::nullopt as expected

=== Practical Example: Sum of Fractions ===
Sum of 1/2 + 1/3 + 1/4 + 1/5 = 77/60
As decimal: 1.28333
```

This comprehensive example demonstrates all major features of the Fraction class, from basic operations to error handling and practical applications. The library provides a robust, efficient, and easy-to-use implementation for working with rational numbers in C++.
