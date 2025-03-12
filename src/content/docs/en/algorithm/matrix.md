---
title: Matrix Template
description: Comprehensive documentation for the atom::algorithm::Matrix template class, including constructors, operations, properties, transformations, and examples.
---

## Overview

The `Matrix` class provides a robust framework for matrix operations, including:

- Basic arithmetic operations (addition, subtraction, multiplication)
- Matrix properties (trace, norm, determinant, rank)
- Matrix transformations (transpose, inverse, power)
- Matrix decompositions (LU, SVD)
- Helper functions for creating special matrices

## Template Parameters

Template signature:

```cpp
template <typename T, std::size_t Rows, std::size_t Cols>
class Matrix;
```

- `T`: The type of matrix elements (e.g., `float`, `double`, `std::complex<double>`)
- `Rows`: The number of rows in the matrix (compile-time constant)
- `Cols`: The number of columns in the matrix (compile-time constant)

## Constructors

### Default Constructor

```cpp
constexpr Matrix();
```

Creates an empty matrix with all elements initialized to zero.

### Array Constructor

```cpp
constexpr explicit Matrix(const std::array<T, Rows * Cols>& arr);
```

Creates a matrix from a given array of elements.

### Copy Constructor

```cpp
Matrix(const Matrix& other);
```

Creates a deep copy of another matrix.

### Move Constructor

```cpp
Matrix(Matrix&& other) noexcept;
```

Efficiently transfers ownership of resources from another matrix.

## Basic Operations

### Element Access

```cpp
constexpr auto operator()(std::size_t row, std::size_t col) -> T&;
constexpr auto operator()(std::size_t row, std::size_t col) const -> const T&;
```

Access matrix elements using `matrix(row, col)` syntax.

### Data Access

```cpp
auto getData() const -> const std::array<T, Rows * Cols>&;
auto getData() -> std::array<T, Rows * Cols>&;
```

Get references to the underlying data array.

### Matrix Display

```cpp
void print(int width = 8, int precision = 2) const;
```

Print the matrix to standard output with formatted columns.

### Matrix Addition

```cpp
template <typename T, std::size_t Rows, std::size_t Cols>
constexpr auto operator+(const Matrix<T, Rows, Cols>& a, const Matrix<T, Rows, Cols>& b)
    -> Matrix<T, Rows, Cols>;
```

Element-wise addition of two matrices of the same dimensions.

### Matrix Subtraction

```cpp
template <typename T, std::size_t Rows, std::size_t Cols>
constexpr auto operator-(const Matrix<T, Rows, Cols>& a, const Matrix<T, Rows, Cols>& b)
    -> Matrix<T, Rows, Cols>;
```

Element-wise subtraction of two matrices of the same dimensions.

### Matrix Multiplication

```cpp
template <typename T, std::size_t RowsA, std::size_t ColsA_RowsB, std::size_t ColsB>
auto operator*(const Matrix<T, RowsA, ColsA_RowsB>& a, const Matrix<T, ColsA_RowsB, ColsB>& b)
    -> Matrix<T, RowsA, ColsB>;
```

Multiplies two matrices where the column count of the first matrix equals the row count of the second.

### Scalar Multiplication

```cpp
template <typename T, typename U, std::size_t Rows, std::size_t Cols>
constexpr auto operator*(const Matrix<T, Rows, Cols>& m, U scalar);

template <typename T, typename U, std::size_t Rows, std::size_t Cols>
constexpr auto operator*(U scalar, const Matrix<T, Rows, Cols>& m);
```

Multiplies a matrix by a scalar (from either side).

### Element-wise Multiplication

```cpp
template <typename T, std::size_t Rows, std::size_t Cols>
constexpr auto elementWiseProduct(const Matrix<T, Rows, Cols>& a, const Matrix<T, Rows, Cols>& b)
    -> Matrix<T, Rows, Cols>;
```

Performs Hadamard (element-wise) multiplication of two matrices.

## Matrix Properties

### Trace

```cpp
constexpr auto trace() const -> T;
```

Computes the sum of diagonal elements of a square matrix.

### Frobenius Norm

```cpp
auto frobeniusNorm() const -> T;
```

Computes the Frobenius norm (square root of the sum of squares of all elements).

### Maximum Element

```cpp
auto maxElement() const -> T;
```

Returns the maximum element in the matrix (based on absolute value).

### Minimum Element

```cpp
auto minElement() const -> T;
```

Returns the minimum element in the matrix (based on absolute value).

### Symmetry Check

```cpp
[[nodiscard]] auto isSymmetric() const -> bool;
```

Checks if the matrix is symmetric (equal to its transpose).

### Rank

```cpp
[[nodiscard]] auto rank() const -> std::size_t;
```

Computes the rank of the matrix using Gaussian elimination.

### Condition Number

```cpp
auto conditionNumber() const -> T;
```

Computes the condition number using the ratio of largest to smallest singular values.

### Determinant

```cpp
auto determinant() const -> T;
```

Calculates the determinant of a square matrix using LU decomposition.

## Matrix Transformations

### Transpose

```cpp
template <typename T, std::size_t Rows, std::size_t Cols>
constexpr auto transpose(const Matrix<T, Rows, Cols>& m) -> Matrix<T, Cols, Rows>;
```

Returns the transpose of the matrix (rows become columns and vice versa).

### Matrix Power

```cpp
auto pow(unsigned int n) const -> Matrix;
```

Raises a square matrix to the power of n through repeated multiplication.

### Matrix Inverse

```cpp
auto inverse() const -> Matrix;
```

Calculates the inverse of a square, non-singular matrix.

## Matrix Decompositions

### LU Decomposition

```cpp
template <typename T, std::size_t Size>
auto luDecomposition(const Matrix<T, Size, Size>& m)
    -> std::pair<Matrix<T, Size, Size>, Matrix<T, Size, Size>>;
```

Decomposes a matrix into a product of lower and upper triangular matrices.

### Singular Value Decomposition

```cpp
template <typename T, std::size_t Rows, std::size_t Cols>
auto singularValueDecomposition(const Matrix<T, Rows, Cols>& m) -> std::vector<T>;
```

Computes the singular values of a matrix.

## Utility Functions

### Identity Matrix

```cpp
template <typename T, std::size_t Size>
constexpr auto identity() -> Matrix<T, Size, Size>;
```

Creates an identity matrix of the specified size.

### Random Matrix

```cpp
template <typename T, std::size_t Rows, std::size_t Cols>
auto randomMatrix(T min = 0, T max = 1) -> Matrix<T, Rows, Cols>;
```

Generates a matrix with random elements in the specified range.

## Complete Example

Below is a comprehensive example demonstrating various capabilities of the Matrix class:

```cpp
#include <iostream>
#include "atom/algorithm/matrix.hpp"

int main() {
    // Create matrices using different constructors
    atom::algorithm::Matrix<double, 2, 2> A = {{1.0, 2.0, 3.0, 4.0}};
    auto B = atom::algorithm::identity<double, 2>();
    auto C = atom::algorithm::randomMatrix<double, 2, 3>(0.0, 10.0);
    
    std::cout << "Matrix A:" << std::endl;
    A.print();
    
    std::cout << "\nIdentity Matrix B:" << std::endl;
    B.print();
    
    std::cout << "\nRandom Matrix C:" << std::endl;
    C.print();
    
    // Basic operations
    auto D = A + B;
    std::cout << "\nA + B:" << std::endl;
    D.print();
    
    auto E = A * B;
    std::cout << "\nA * B:" << std::endl;
    E.print();
    
    auto F = A * 2.5;
    std::cout << "\nA * 2.5:" << std::endl;
    F.print();
    
    // Matrix properties
    std::cout << "\nProperties of A:" << std::endl;
    std::cout << "Trace: " << A.trace() << std::endl;
    std::cout << "Determinant: " << A.determinant() << std::endl;
    std::cout << "Frobenius norm: " << A.frobeniusNorm() << std::endl;
    std::cout << "Is symmetric: " << (A.isSymmetric() ? "Yes" : "No") << std::endl;
    std::cout << "Rank: " << A.rank() << std::endl;
    
    // Transformations
    std::cout << "\nTranspose of A:" << std::endl;
    atom::algorithm::transpose(A).print();
    
    std::cout << "\nA^2:" << std::endl;
    A.pow(2).print();
    
    // Matrix inverse (if determinant is non-zero)
    if (std::abs(A.determinant()) > 1e-10) {
        std::cout << "\nInverse of A:" << std::endl;
        A.inverse().print();
        
        // Verify: A * A^-1 = I
        std::cout << "\nA * A^-1 (should be identity):" << std::endl;
        (A * A.inverse()).print();
    }
    
    // LU Decomposition
    std::cout << "\nLU Decomposition of A:" << std::endl;
    auto [L, U] = atom::algorithm::luDecomposition(A);
    std::cout << "L matrix:" << std::endl;
    L.print();
    std::cout << "U matrix:" << std::endl;
    U.print();
    
    // Verify: L * U = A
    std::cout << "\nL * U (should equal A):" << std::endl;
    (L * U).print();
    
    // Singular values
    std::cout << "\nSingular values of A:" << std::endl;
    auto singularValues = atom::algorithm::singularValueDecomposition(A);
    for (const auto& sv : singularValues) {
        std::cout << sv << " ";
    }
    std::cout << std::endl;
    
    return 0;
}
```

This example demonstrates:

- Creating matrices with different constructors
- Performing basic arithmetic operations
- Computing various matrix properties
- Applying matrix transformations
- Performing matrix decompositions
- Verifying mathematical relationships

The Matrix class provides a comprehensive toolset for numerical linear algebra with compile-time dimensions for type safety and performance optimization.
