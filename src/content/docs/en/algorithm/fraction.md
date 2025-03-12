---
title: Fraction
description: Comprehensive for the Fraction class in the atom::algorithm namespace, including constructors, arithmetic operations, comparisons, conversions, and usage examples.
---

## Overview

The Fraction class provides a comprehensive implementation for working with mathematical fractions. It supports arithmetic operations, comparison, conversion to different numeric types, and various utility functions for fraction manipulation.

Located in the `atom::algorithm` namespace, this class offers a robust alternative to floating-point arithmetic when exact rational number calculations are required.

## Features

- Precise rational number representation with numerator and denominator
- Arithmetic operations (addition, subtraction, multiplication, division)
- Automatic reduction to simplest form
- Comparison operators for equality and ordering
- Type conversions to and from various numeric types
- Error handling for common fraction-related issues
- Stream support for easy input/output

## Installation

Include the header file in your project:

```cpp
#include "fraction.hpp"
```

## Class Definition

```cpp
namespace atom::algorithm {
    class Fraction {
        // Methods and members...
    };
}
```

## Constructors

### Default Constructor

Creates a fraction with value 0/1.

```cpp
Fraction f; // Creates 0/1
```

### Integer Constructor

Creates a fraction from an integer value.

```cpp
Fraction f(5); // Creates 5/1
```

### Fraction Constructor

Creates a fraction with specified numerator and denominator.

```cpp
Fraction f(3, 4); // Creates 3/4
```

## Arithmetic Operations

### Addition

```cpp
Fraction a(1, 2);
Fraction b(1, 3);
Fraction c = a + b;    // Result: 5/6
a += b;                // a becomes 5/6
```

### Subtraction

```cpp
Fraction a(3, 4);
Fraction b(1, 4);
Fraction c = a - b;    // Result: 1/2
a -= b;                // a becomes 1/2
```

### Multiplication

```cpp
Fraction a(2, 3);
Fraction b(3, 5);
Fraction c = a * b;    // Result: 2/5
a *= b;                // a becomes 2/5
```

### Division

```cpp
Fraction a(2, 3);
Fraction b(4, 5);
Fraction c = a / b;    // Result: 5/6
a /= b;                // a becomes 5/6
```

## Comparison Operations

### Equality

```cpp
Fraction a(1, 2);
Fraction b(2, 4);
bool equal = (a == b); // true, as both represent 1/2
```

### Ordering (C++20 and later)

```cpp
Fraction a(1, 2);
Fraction b(3, 4);
bool less = (a < b);   // true
```

## Conversion Methods

### To Double

```cpp
Fraction f(3, 4);
double d = f.toDouble();       // 0.75
double d2 = static_cast<double>(f); // 0.75
```

### To String

```cpp
Fraction f(3, 4);
std::string s = f.toString();  // "3/4"
```

### To Float

```cpp
Fraction f(3, 4);
float fl = static_cast<float>(f); // 0.75f
```

### To Integer

```cpp
Fraction f(7, 2);
int i = static_cast<int>(f);   // 3 (truncated toward zero)
```

## Utility Methods

### Invert

Inverts the fraction (reciprocal).

```cpp
Fraction f(3, 4);
f.invert();  // f becomes 4/3
```

### Absolute Value

Returns the absolute value of the fraction.

```cpp
Fraction f(-3, 4);
Fraction abs = f.abs();  // 3/4
```

### Status Checks

```cpp
Fraction f(-3, 4);
bool isZero = f.isZero();      // false
bool isNegative = f.isNegative(); // true
bool isPositive = f.isPositive(); // false
```

## Stream Operations

### Output

```cpp
Fraction f(3, 4);
std::cout << f;  // Outputs: 3/4
```

### Input

```cpp
Fraction f;
std::cin >> f;   // Expects input in format "3/4"
```

## Factory Functions

### From Integer

```cpp
Fraction f = makeFraction(5);  // Creates 5/1
```

### From Double

```cpp
Fraction f = makeFraction(0.75, 1000);  // Creates 3/4
// Second parameter is maximum denominator (default: 1000000)
```

## Error Handling

The Fraction class throws `FractionException` in these cases:

- Division by zero
- Denominator is zero in construction
- Integer overflow during arithmetic operations
- Invalid input format when parsing from stream
- Cannot invert a fraction with numerator zero

Example of error handling:

```cpp
try {
    Fraction f(1, 0);  // Will throw FractionException
} catch (const FractionException& e) {
    std::cerr << "Error: " << e.what() << std::endl;
}
```

## Complete Example

Below is a comprehensive example demonstrating various features of the Fraction class:

```cpp
#include <iostream>
#include "fraction.hpp"

using namespace atom::algorithm;

int main() {
    // Creating fractions
    Fraction a(1, 2);
    Fraction b(3, 4);
    Fraction c = makeFraction(0.25);
    
    std::cout << "a = " << a << std::endl;
    std::cout << "b = " << b << std::endl;
    std::cout << "c = " << c << std::endl;
    
    // Arithmetic operations
    std::cout << "a + b = " << (a + b) << std::endl;
    std::cout << "a - c = " << (a - c) << std::endl;
    std::cout << "a * b = " << (a * b) << std::endl;
    std::cout << "a / c = " << (a / c) << std::endl;
    
    // Conversion to double
    std::cout << "a as double: " << a.toDouble() << std::endl;
    
    // Comparison
    std::cout << "a == b: " << (a == b) << std::endl;
    std::cout << "a + c == b: " << (a + c == b) << std::endl;
    
    // Utility methods
    Fraction d = a;
    d.invert();
    std::cout << "Inverted a: " << d << std::endl;
    
    Fraction e(-3, 4);
    std::cout << "e = " << e << std::endl;
    std::cout << "|e| = " << e.abs() << std::endl;
    std::cout << "e is negative: " << e.isNegative() << std::endl;
    
    // Error handling
    try {
        Fraction invalid(1, 0);
    } catch (const FractionException& ex) {
        std::cout << "Caught exception: " << ex.what() << std::endl;
    }
    
    // User input
    std::cout << "Enter a fraction (e.g. 3/4): ";
    Fraction input;
    try {
        std::cin >> input;
        std::cout << "You entered: " << input << std::endl;
        std::cout << "As decimal: " << input.toDouble() << std::endl;
    } catch (const FractionException& ex) {
        std::cout << "Invalid input: " << ex.what() << std::endl;
    }
    
    return 0;
}
```

Expected output (assuming user enters "5/6"):

``` text
a = 1/2
b = 3/4
c = 1/4
a + b = 5/4
a - c = 1/4
a * b = 3/8
a / c = 2
a as double: 0.5
a == b: 0
a + c == b: 1
Inverted a: 2
e = -3/4
|e| = 3/4
e is negative: 1
Caught exception: Denominator cannot be zero.
Enter a fraction (e.g. 3/4): 5/6
You entered: 5/6
As decimal: 0.833333
```

## Performance Considerations

- The Fraction class automatically reduces fractions to their simplest form using the GCD algorithm
- Overflow detection is implemented to prevent integer overflow during arithmetic operations
- For very large numerators/denominators, consider using a specialized arbitrary precision library

## Limitations

- The implementation uses int for numerator and denominator, limiting the range of representable fractions
- Complex mathematical functions like logarithms and trigonometric functions are not directly supported
