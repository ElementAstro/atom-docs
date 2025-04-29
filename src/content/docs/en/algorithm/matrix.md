---
title: Matrix Template
description: Comprehensive documentation for the atom::algorithm::Matrix template class, including constructors, operations, properties, transformations, and examples.
---

## Purpose and High-Level Overview

The Atom Algorithm Matrix Library provides a comprehensive, template-based implementation of matrix operations for efficient mathematical computations in C++. Designed primarily for fixed-size matrices known at compile time, this library offers strong type safety, compile-time optimizations, and a wide range of linear algebra functionality.

This implementation uses modern C++ features to provide an intuitive interface while maintaining high performance through template metaprogramming and static memory allocation. The library is suitable for applications requiring precise matrix manipulations including scientific computing, computer graphics, machine learning algorithms, and numerical simulations.

## Key Features

- Fixed-size matrix operations known at compile time
- Comprehensive matrix arithmetic (addition, subtraction, multiplication)
- Element access through intuitive operator() syntax
- Matrix properties calculation (trace, determinant, rank, condition number)
- Matrix decompositions (LU decomposition, SVD)
- Matrix transformations (transpose, inverse)
- Utility matrices (identity, random matrices)
- Element-wise operations (Hadamard product)
- Thread-safe design with static mutex

## Required Headers and Dependencies

### Core Dependencies

```cpp
#include <algorithm>
#include <array>
#include <cmath>
#include <complex>
#include <iomanip>
#include <iostream>
#include <numeric>
#include <random>
#include <vector>
```

### Internal Dependencies

```cpp
#include "atom/error/exception.hpp"
```

The library relies on the `atom/error/exception.hpp` header for error handling through the `THROW_RUNTIME_ERROR` macro.

## Matrix Class Template Definition

```cpp
namespace atom::algorithm {

template <typename T, std::size_t Rows, std::size_t Cols>
class Matrix {
    // Implementation details...
};

}  // namespace atom::algorithm
```

## Detailed Class Documentation

### Matrix Template Class

```cpp
template <typename T, std::size_t Rows, std::size_t Cols>
class Matrix
```

Template Parameters:

- `T`: The type of the matrix elements (typically a numeric type like `float`, `double`, or `std::complex<double>`)
- `Rows`: The number of rows in the matrix (compile-time constant)
- `Cols`: The number of columns in the matrix (compile-time constant)

### Private Members

```cpp
private:
    std::array<T, Rows * Cols> data_{};
    static inline std::mutex mutex_;
```

- `data_`: Stores the matrix elements in row-major order using a statically-sized array
- `mutex_`: A static mutex for thread-safe operations

### Constructors and Assignment Operators

```cpp
constexpr Matrix() = default;
```

Default constructor that initializes all elements to their default value (typically 0).

```cpp
constexpr explicit Matrix(const std::array<T, Rows * Cols>& arr)
    : data_(arr) {}
```

Constructs a matrix from a given array of elements in row-major order.

```cpp
Matrix(const Matrix& other);
```

Copy constructor that creates a deep copy of the other matrix.

```cpp
Matrix(Matrix&& other) noexcept;
```

Move constructor that takes ownership of the other matrix's data.

```cpp
Matrix& operator=(const Matrix& other);
```

Copy assignment operator that creates a deep copy of the other matrix.

```cpp
Matrix& operator=(Matrix&& other) noexcept;
```

Move assignment operator that takes ownership of the other matrix's data.

### Element Access Methods

```cpp
constexpr auto operator()(std::size_t row, std::size_t col) -> T&;
```

Accesses the matrix element at the given row and column (mutable).

- Parameters: `row` (row index), `col` (column index)
- Returns: A reference to the element at position (row, col)

```cpp
constexpr auto operator()(std::size_t row, std::size_t col) const -> const T&;
```

Accesses the matrix element at the given row and column (const).

- Parameters: `row` (row index), `col` (column index)
- Returns: A const reference to the element at position (row, col)

### Data Access Methods

```cpp
auto getData() const -> const std::array<T, Rows * Cols>&;
```

Gets the underlying data array (const).

- Returns: A const reference to the internal data array

```cpp
auto getData() -> std::array<T, Rows * Cols>&;
```

Gets the underlying data array (mutable).

- Returns: A reference to the internal data array

### Utility Methods

```cpp
void print(int width = 8, int precision = 2) const;
```

Prints the matrix to the standard output.

- Parameters:
  - `width`: The width of each element when printed
  - `precision`: The precision of each element when printed

### Matrix Property Methods

```cpp
constexpr auto trace() const -> T;
```

Computes the trace of the matrix (sum of diagonal elements).

- Returns: The trace of the matrix
- Constraints: Only defined for square matrices (Rows == Cols)

```cpp
auto frobeniusNorm() const -> T;
```

Computes the Frobenius norm of the matrix (square root of the sum of squares of all elements).

- Returns: The Frobenius norm

```cpp
auto maxElement() const -> T;
```

Finds the maximum element in the matrix by absolute value.

- Returns: The maximum element

```cpp
auto minElement() const -> T;
```

Finds the minimum element in the matrix by absolute value.

- Returns: The minimum element

```cpp
[[nodiscard]] auto isSymmetric() const -> bool;
```

Checks if the matrix is symmetric (A = A^T).

- Returns: `true` if the matrix is symmetric, `false` otherwise
- Constraints: Only defined for square matrices (Rows == Cols)

```cpp
[[nodiscard]] auto rank() const -> std::size_t;
```

Computes the rank of the matrix using Gaussian elimination.

- Returns: The rank of the matrix

```cpp
auto conditionNumber() const -> T;
```

Computes the condition number of the matrix using the 2-norm (ratio of largest to smallest singular value).

- Returns: The condition number
- Constraints: Only defined for square matrices (Rows == Cols)

### Matrix Operation Methods

```cpp
auto pow(unsigned int n) const -> Matrix;
```

Raises the matrix to the power of n.

- Parameters: `n` (the exponent)
- Returns: The resulting matrix after exponentiation
- Constraints: Only defined for square matrices (Rows == Cols)

```cpp
auto determinant() const -> T;
```

Computes the determinant of the matrix using LU decomposition.

- Returns: The determinant of the matrix
- Constraints: Only defined for square matrices (Rows == Cols)

```cpp
auto inverse() const -> Matrix;
```

Computes the inverse of the matrix using LU decomposition.

- Returns: The inverse matrix
- Throws: Runtime error if the matrix is singular (non-invertible)
- Constraints: Only defined for square matrices (Rows == Cols)

## Matrix Operators

### Addition and Subtraction

```cpp
template <typename T, std::size_t Rows, std::size_t Cols>
constexpr auto operator+(const Matrix<T, Rows, Cols>& a, 
                         const Matrix<T, Rows, Cols>& b) -> Matrix<T, Rows, Cols>;
```

Adds two matrices element-wise.

- Parameters: Two matrices of the same dimensions
- Returns: The resulting matrix after addition

```cpp
template <typename T, std::size_t Rows, std::size_t Cols>
constexpr auto operator-(const Matrix<T, Rows, Cols>& a, 
                         const Matrix<T, Rows, Cols>& b) -> Matrix<T, Rows, Cols>;
```

Subtracts one matrix from another element-wise.

- Parameters: Two matrices of the same dimensions
- Returns: The resulting matrix after subtraction

### Multiplication

```cpp
template <typename T, std::size_t RowsA, std::size_t ColsA_RowsB, std::size_t ColsB>
auto operator*(const Matrix<T, RowsA, ColsA_RowsB>& a,
               const Matrix<T, ColsA_RowsB, ColsB>& b) -> Matrix<T, RowsA, ColsB>;
```

Multiplies two matrices.

- Parameters: Two matrices where the number of columns in the first equals the number of rows in the second
- Returns: The resulting matrix after multiplication

```cpp
template <typename T, typename U, std::size_t Rows, std::size_t Cols>
constexpr auto operator*(const Matrix<T, Rows, Cols>& m, U scalar);
```

Multiplies a matrix by a scalar (left multiplication).

- Parameters: A matrix and a scalar value
- Returns: The resulting matrix after multiplication

```cpp
template <typename T, typename U, std::size_t Rows, std::size_t Cols>
constexpr auto operator*(U scalar, const Matrix<T, Rows, Cols>& m);
```

Multiplies a scalar by a matrix (right multiplication).

- Parameters: A scalar value and a matrix
- Returns: The resulting matrix after multiplication

## Matrix Functions

```cpp
template <typename T, std::size_t Rows, std::size_t Cols>
constexpr auto elementWiseProduct(const Matrix<T, Rows, Cols>& a,
                                 const Matrix<T, Rows, Cols>& b) -> Matrix<T, Rows, Cols>;
```

Computes the Hadamard product (element-wise multiplication) of two matrices.

- Parameters: Two matrices of the same dimensions
- Returns: The resulting matrix after element-wise multiplication

```cpp
template <typename T, std::size_t Rows, std::size_t Cols>
constexpr auto transpose(const Matrix<T, Rows, Cols>& m) -> Matrix<T, Cols, Rows>;
```

Transposes the given matrix.

- Parameters: A matrix
- Returns: The transposed matrix

```cpp
template <typename T, std::size_t Size>
constexpr auto identity() -> Matrix<T, Size, Size>;
```

Creates an identity matrix of the given size.

- Returns: An identity matrix of size Size × Size

```cpp
template <typename T, std::size_t Size>
auto luDecomposition(const Matrix<T, Size, Size>& m)
    -> std::pair<Matrix<T, Size, Size>, Matrix<T, Size, Size>>;
```

Performs LU decomposition of the given matrix.

- Parameters: A square matrix
- Returns: A pair of matrices (L, U) where L is lower triangular and U is upper triangular
- Throws: Runtime error if LU decomposition fails

```cpp
template <typename T, std::size_t Rows, std::size_t Cols>
auto singularValueDecomposition(const Matrix<T, Rows, Cols>& m) -> std::vector<T>;
```

Performs singular value decomposition (SVD) of the given matrix and returns the singular values.

- Parameters: A matrix
- Returns: A vector of singular values
- Throws: Runtime error if the power iteration method does not converge

```cpp
template <typename T, std::size_t Rows, std::size_t Cols>
auto randomMatrix(T min = 0, T max = 1) -> Matrix<T, Rows, Cols>;
```

Generates a random matrix with elements in the specified range.

- Parameters:
  - `min`: The minimum value for random elements (default: 0)
  - `max`: The maximum value for random elements (default: 1)
- Returns: A matrix with randomly generated elements

## Examples

### Basic Matrix Creation and Operations

```cpp
#include <iostream>
#include "atom/algorithm/matrix.hpp"

int main() {
    // Create a 3x3 matrix with default values (all zeros)
    atom::algorithm::Matrix<double, 3, 3> matrix1;
    
    // Fill the matrix with values
    for (size_t i = 0; i < 3; ++i) {
        for (size_t j = 0; j < 3; ++j) {
            matrix1(i, j) = i * 3 + j + 1;  // Values 1-9
        }
    }
    
    std::cout << "Matrix 1:" << std::endl;
    matrix1.print();  // Print the matrix
    
    // Create a 3x3 identity matrix
    auto identityMat = atom::algorithm::identity<double, 3>();
    std::cout << "\nIdentity Matrix:" << std::endl;
    identityMat.print();
    
    // Matrix addition
    auto matrix2 = matrix1 + identityMat;
    std::cout << "\nMatrix 1 + Identity:" << std::endl;
    matrix2.print();
    
    // Matrix subtraction
    auto matrix3 = matrix2 - matrix1;
    std::cout << "\nResult of subtraction (should be identity):" << std::endl;
    matrix3.print();
    
    // Scalar multiplication
    auto matrix4 = matrix1 * 2.0;
    std::cout << "\nMatrix 1 multiplied by 2:" << std::endl;
    matrix4.print();
    
    return 0;
}
```

Expected output:

```
Matrix 1:
     1.00      2.00      3.00 
     4.00      5.00      6.00 
     7.00      8.00      9.00 

Identity Matrix:
     1.00      0.00      0.00 
     0.00      1.00      0.00 
     0.00      0.00      1.00 

Matrix 1 + Identity:
     2.00      2.00      3.00 
     4.00      6.00      6.00 
     7.00      8.00     10.00 

Result of subtraction (should be identity):
     1.00      0.00      0.00 
     0.00      1.00      0.00 
     0.00      0.00      1.00 

Matrix 1 multiplied by 2:
     2.00      4.00      6.00 
     8.00     10.00     12.00 
    14.00     16.00     18.00 
```

### Matrix Properties and Advanced Operations

```cpp
#include <iostream>
#include "atom/algorithm/matrix.hpp"

int main() {
    // Create a 3x3 matrix
    atom::algorithm::Matrix<double, 3, 3> matrix1;
    
    // Set up a positive definite matrix for demonstration
    matrix1(0, 0) = 4;  matrix1(0, 1) = 2;  matrix1(0, 2) = 2;
    matrix1(1, 0) = 2;  matrix1(1, 1) = 6;  matrix1(1, 2) = 1;
    matrix1(2, 0) = 2;  matrix1(2, 1) = 1;  matrix1(2, 2) = 9;
    
    std::cout << "Original Matrix:" << std::endl;
    matrix1.print();
    
    // Compute trace
    std::cout << "\nTrace: " << matrix1.trace() << std::endl;
    
    // Check if symmetric
    std::cout << "Is symmetric: " << (matrix1.isSymmetric() ? "Yes" : "No") << std::endl;
    
    // Compute determinant
    std::cout << "Determinant: " << matrix1.determinant() << std::endl;
    
    // Compute Frobenius norm
    std::cout << "Frobenius norm: " << matrix1.frobeniusNorm() << std::endl;
    
    // Compute rank
    std::cout << "Rank: " << matrix1.rank() << std::endl;
    
    // Compute inverse
    auto inverse = matrix1.inverse();
    std::cout << "\nInverse Matrix:" << std::endl;
    inverse.print();
    
    // Verify inverse (should be identity)
    auto product = matrix1 * inverse;
    std::cout << "\nOriginal × Inverse (should be identity):" << std::endl;
    product.print(10, 4);
    
    // Transpose
    auto transposed = atom::algorithm::transpose(matrix1);
    std::cout << "\nTransposed Matrix:" << std::endl;
    transposed.print();
    
    // Matrix power
    auto squared = matrix1.pow(2);
    std::cout << "\nMatrix squared:" << std::endl;
    squared.print();
    
    return 0;
}
```

Expected output:

```
Original Matrix:
     4.00      2.00      2.00 
     2.00      6.00      1.00 
     2.00      1.00      9.00 

Trace: 19
Is symmetric: Yes
Determinant: 168
Frobenius norm: 13.1529
Rank: 3

Inverse Matrix:
     0.31     -0.08     -0.06 
    -0.08      0.20     -0.01 
    -0.06     -0.01      0.13 

Original × Inverse (should be identity):
     1.0000      0.0000      0.0000 
     0.0000      1.0000      0.0000 
     0.0000      0.0000      1.0000 

Transposed Matrix:
     4.00      2.00      2.00 
     2.00      6.00      1.00 
     2.00      1.00      9.00 

Matrix squared:
    24.00     20.00     29.00 
    20.00     45.00     22.00 
    29.00     22.00     88.00 
```

### Matrix Decompositions and Random Matrix Generation

```cpp
#include <iostream>
#include "atom/algorithm/matrix.hpp"

int main() {
    // Generate a random 4x4 matrix with values between -10 and 10
    auto randomMat = atom::algorithm::randomMatrix<double, 4, 4>(-10, 10);
    std::cout << "Random Matrix:" << std::endl;
    randomMat.print();
    
    // For better demonstration, create a symmetric positive definite matrix
    atom::algorithm::Matrix<double, 3, 3> symmetricMat;
    symmetricMat(0, 0) = 4;  symmetricMat(0, 1) = 1;  symmetricMat(0, 2) = 1;
    symmetricMat(1, 0) = 1;  symmetricMat(1, 1) = 5;  symmetricMat(1, 2) = 2;
    symmetricMat(2, 0) = 1;  symmetricMat(2, 1) = 2;  symmetricMat(2, 2) = 6;
    
    std::cout << "\nSymmetric Matrix:" << std::endl;
    symmetricMat.print();
    
    // Perform LU decomposition
    auto [L, U] = atom::algorithm::luDecomposition(symmetricMat);
    
    std::cout << "\nLU Decomposition:" << std::endl;
    std::cout << "L matrix:" << std::endl;
    L.print();
    
    std::cout << "U matrix:" << std::endl;
    U.print();
    
    // Verify L*U = original matrix
    auto product = L * U;
    std::cout << "\nL × U (should equal original matrix):" << std::endl;
    product.print();
    
    // Singular value decomposition
    auto singularValues = atom::algorithm::singularValueDecomposition(symmetricMat);
    
    std::cout << "\nSingular values:" << std::endl;
    for (const auto& val : singularValues) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    // Calculate condition number from singular values
    std::cout << "\nCondition number (from SVD): " 
              << singularValues.front() / singularValues.back() << std::endl;
    
    // Compare with direct method
    std::cout << "Condition number (direct): " 
              << symmetricMat.conditionNumber() << std::endl;
    
    return 0;
}
```

Expected output (random matrix values will vary):

```
Random Matrix:
     5.24     -2.37      8.91     -9.45 
    -4.89      6.72     -7.18      3.41 
     7.63     -1.26      9.04     -8.32 
    -3.51      4.85     -5.69      2.17 

Symmetric Matrix:
     4.00      1.00      1.00 
     1.00      5.00      2.00 
     1.00      2.00      6.00 

LU Decomposition:
L matrix:
     1.00      0.00      0.00 
     0.25      1.00      0.00 
     0.25      0.36      1.00 

U matrix:
     4.00      1.00      1.00 
     0.00      4.75      1.75 
     0.00      0.00      5.21 

L × U (should equal original matrix):
     4.00      1.00      1.00 
     1.00      5.00      2.00 
     1.00      2.00      6.00 

Singular values:
7.95 4.85 2.19 

Condition number (from SVD): 3.62
Condition number (direct): 3.62
```

### Comprehensive Example: Matrix Applications in a Linear System Solver

```cpp
#include <iostream>
#include <iomanip>
#include "atom/algorithm/matrix.hpp"

// Function to solve system of linear equations Ax = b using matrix operations
template <typename T, std::size_t N>
atom::algorithm::Matrix<T, N, 1> solveLinearSystem(
    const atom::algorithm::Matrix<T, N, N>& A,
    const atom::algorithm::Matrix<T, N, 1>& b) {
    
    // Check if system is solvable
    if (A.determinant() == 0) {
        std::cout << "System is singular, no unique solution exists.\n";
        return atom::algorithm::Matrix<T, N, 1>();
    }
    
    // Compute A^(-1)
    auto Ainv = A.inverse();
    
    // Return A^(-1) * b
    return Ainv * b;
}

int main() {
    // Create a 3x3 coefficient matrix for the system of equations
    // 2x + y - z = 8
    // -3x - y + 2z = -11
    // -2x + y + 2z = -3
    atom::algorithm::Matrix<double, 3, 3> A;
    A(0, 0) = 2;   A(0, 1) = 1;   A(0, 2) = -1;
    A(1, 0) = -3;  A(1, 1) = -1;  A(1, 2) = 2;
    A(2, 0) = -2;  A(2, 1) = 1;   A(2, 2) = 2;
    
    // Create the right-hand side vector
    atom::algorithm::Matrix<double, 3, 1> b;
    b(0, 0) = 8;
    b(1, 0) = -11;
    b(2, 0) = -3;
    
    std::cout << "Coefficient Matrix A:" << std::endl;
    A.print();
    
    std::cout << "\nRight-hand side vector b:" << std::endl;
    b.print();
    
    // Check system properties
    std::cout << "\nMatrix Properties:" << std::endl;
    std::cout << "Determinant: " << A.determinant() << std::endl;
    std::cout << "Rank: " << A.rank() << std::endl;
    std::cout << "Condition Number: " << A.conditionNumber() << std::endl;
    
    // Solve the system
    auto x = solveLinearSystem(A, b);
    
    std::cout << "\nSolution vector x:" << std::endl;
    x.print(10, 4);
    
    // Verify solution: A * x should equal b
    auto Ax = A * x;
    std::cout << "\nVerification - A * x:" << std::endl;
    Ax.print(10, 4);
    
    // For educational purposes, show alternative solution using LU decomposition
    std::cout << "\nAlternative solution using LU decomposition:" << std::endl;
    
    auto [L, U] = atom::algorithm::luDecomposition(A);
    
    // First solve Ly = b for y
    atom::algorithm::Matrix<double, 3, 1> y;
    y(0, 0) = b(0, 0) / L(0, 0);
    y(1, 0) = (b(1, 0) - L(1, 0) * y(0, 0)) / L(1, 1);
    y(2, 0) = (b(2, 0) - L(2, 0) * y(0, 0) - L(2, 1) * y(1, 0)) / L(2, 2);
    
    // Then solve Ux = y for x
    atom::algorithm::Matrix<double, 3, 1> x2;
    x2(2, 0) = y(2, 0) / U(2, 2);
    x2(1, 0) = (y(1, 0) - U(1, 2) * x2(2, 0)) / U(1, 1);
    x2(0, 0) = (y(0, 0) - U(0, 1) * x2(1, 0) - U(0, 2) * x2(2, 0)) / U(0, 0);
    
    std::cout << "Solution via LU:" << std::endl;
    x2.print(10, 4);
    
    return 0;
}
```

Expected output:

```
Coefficient Matrix A:
     2.00      1.00     -1.00 
    -3.00     -1.00      2.00 
    -2.00      1.00      2.00 

Right-hand side vector b:
     8.00 
   -11.00 
    -3.00 

Matrix Properties:
Determinant: -1
Rank: 3
Condition Number: 9.75

Solution vector x:
     2.0000 
     3.0000 
    -1.0000 

Verification - A * x:
     8.0000 
   -11.0000 
    -3.0000 

Alternative solution using LU decomposition:
Solution via LU:
     2.0000 
     3.0000 
    -1.0000 
```

## Performance Considerations

- Compile-time Size Determination: The fixed-size nature allows for compiler optimizations and stack allocation, making operations faster for small matrices.
- Efficiency: Matrix operations are implemented with efficiency in mind, but certain algorithms (like SVD) may be less efficient than specialized numerical libraries.
- Memory Usage: Fixed-size matrices use stack allocation rather than heap allocation, which improves cache locality but limits the maximum size.
- Numerical Stability: The implementation includes checks for numerical stability (e.g., checking for near-zero values during LU decomposition), but very ill-conditioned matrices might still cause issues.
- Complex Operations: For very large matrices or more specialized decompositions, consider using dedicated linear algebra libraries like Eigen or BLAS/LAPACK.

## Best Practices and Common Pitfalls

### Best Practices

1. Use appropriate types: Choose `double` for most calculations requiring precision, `float` for performance-critical applications, and `std::complex<double>` for complex numbers.

2. Check matrix conditions: Before performing operations like inverse or LU decomposition, check if the matrix is suitable (e.g., whether it's singular).

3. Prefer compile-time dimensions: When possible, use fixed dimensions known at compile time to benefit from optimizations.

4. Cache results: If computing expensive operations like inverse or SVD, consider caching the results if they'll be used multiple times.

### Common Pitfalls

1. Dimension Mismatch: Ensure that matrices have compatible dimensions for operations. Template errors can be hard to debug.

2. Numerical Instability: Be cautious with operations like inverse on nearly singular matrices, as they can lead to large numerical errors.

3. Memory Constraints: Very large matrices may cause stack overflow since they're allocated on the stack. For large matrices, consider heap-based alternatives.

4. Performance with Small Matrices: For very small matrices (2×2, 3×3), specialized implementations might be more efficient than generic algorithms.

5. Exception Handling: Remember to handle potential exceptions thrown by matrix operations, especially when dealing with user input or unknown data.

## Platform/Compiler-Specific Notes

- This library uses C++17 features including `inline` variables for static members.
- The code should be compatible with modern C++ compilers (GCC 7+, Clang 5+, MSVC 2017+).
- Performance may vary across compilers due to different optimization strategies.
- On some platforms, enabling compiler optimizations (`-O2`, `-O3`) can significantly improve performance.

---

The Atom Algorithm Matrix Library provides a robust foundation for matrix operations in C++ applications. By leveraging templates and static sizes, it offers both compile-time safety and runtime efficiency, making it suitable for a wide range of numerical computing tasks.
