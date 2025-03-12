---
title: MatrixCompressor
description: Comprehensive documentation for the MatrixCompressor class in the atom::algorithm namespace, including compression, decompression, and matrix manipulation methods.
---

## Overview

`MatrixCompressor` is a high-performance C++20 class designed for efficient matrix compression and decompression using run-length encoding (RLE). It provides both standard and parallel processing algorithms, with optional SIMD acceleration for supported platforms. The class offers extensive utilities for matrix manipulation, comparative analysis, and file operations.

## Table of Contents

- [Basic Types](#basic-types)
- [Compression Methods](#compression-methods)
- [Decompression Methods](#decompression-methods)
- [Matrix Manipulation](#matrix-manipulation)
- [Utility Methods](#utility-methods)
- [File Operations](#file-operations)
- [Complete Usage Example](#complete-usage-example)

## Basic Types

```cpp
using Matrix = std::vector<std::vector<char>>;
using CompressedData = std::vector<std::pair<char, int>>;
```

- **Matrix**: A 2D vector of characters representing the uncompressed data
- **CompressedData**: A vector of character-count pairs representing run-length encoded data

## Compression Methods

### Standard Compression

```cpp
static auto compress(const Matrix& matrix) -> CompressedData;
```

**Description**: Compresses a character matrix using run-length encoding.

**Parameters**:

- `matrix`: The input matrix to compress

**Returns**: The compressed data as a vector of character-count pairs

**Exceptions**:

- `MatrixCompressException`: If compression fails

**Example**:

```cpp
auto matrix = MatrixCompressor::generateRandomMatrix(10, 10);
auto compressed = MatrixCompressor::compress(matrix);
```

### Parallel Compression

```cpp
static auto compressParallel(const Matrix& matrix, int thread_count = 0) -> CompressedData;
```

**Description**: Compresses a character matrix using multiple threads for improved performance on large matrices.

**Parameters**:

- `matrix`: The input matrix to compress
- `thread_count`: Number of threads to use (default: available hardware threads)

**Returns**: The compressed data as a vector of character-count pairs

**Exceptions**:

- `MatrixCompressException`: If compression fails

**Notes**:

- Automatically falls back to standard compression for small matrices
- Automatically determines optimal thread count when `thread_count` is 0

**Example**:

```cpp
auto largeMatrix = MatrixCompressor::generateRandomMatrix(1000, 1000);
auto compressed = MatrixCompressor::compressParallel(largeMatrix);
```

## Decompression Methods

### Standard Decompression

```cpp
static auto decompress(const CompressedData& compressed, int rows, int cols) -> Matrix;
```

**Description**: Reconstructs the original matrix from compressed data.

**Parameters**:

- `compressed`: The compressed data
- `rows`: Number of rows in the original matrix
- `cols`: Number of columns in the original matrix

**Returns**: The reconstructed matrix

**Exceptions**:

- `MatrixDecompressException`: If decompression fails, e.g., due to mismatched dimensions

**Example**:

```cpp
auto matrix = MatrixCompressor::decompress(compressed, 10, 10);
```

### Parallel Decompression

```cpp
static auto decompressParallel(const CompressedData& compressed, int rows, int cols, int thread_count = 0) -> Matrix;
```

**Description**: Reconstructs the original matrix using multiple threads for improved performance.

**Parameters**:

- `compressed`: The compressed data
- `rows`: Number of rows in the original matrix
- `cols`: Number of columns in the original matrix
- `thread_count`: Number of threads to use (default: available hardware threads)

**Returns**: The reconstructed matrix

**Exceptions**:

- `MatrixDecompressException`: If decompression fails

**Notes**:

- Automatically falls back to standard decompression for small matrices
- The implementation handles boundary cases between thread work divisions

**Example**:

```cpp
auto matrix = MatrixCompressor::decompressParallel(compressed, 1000, 1000);
```

## Matrix Manipulation

### Downsampling

```cpp
template <MatrixLike M>
static auto downsample(const M& matrix, int factor) -> Matrix;
```

**Description**: Reduces matrix dimensions by averaging blocks of elements.

**Parameters**:

- `matrix`: The input matrix to downsample
- `factor`: The downsampling factor (e.g., 2 means half the resolution)

**Returns**: The downsampled matrix

**Exceptions**:

- `std::invalid_argument`: If the factor is not positive

**Example**:

```cpp
auto smallerMatrix = MatrixCompressor::downsample(matrix, 2);
```

### Upsampling

```cpp
template <MatrixLike M>
static auto upsample(const M& matrix, int factor) -> Matrix;
```

**Description**: Increases matrix dimensions using nearest-neighbor interpolation.

**Parameters**:

- `matrix`: The input matrix to upsample
- `factor`: The upsampling factor (e.g., 2 means double the resolution)

**Returns**: The upsampled matrix

**Exceptions**:

- `std::invalid_argument`: If the factor is not positive

**Example**:

```cpp
auto largerMatrix = MatrixCompressor::upsample(matrix, 2);
```

## Utility Methods

### Matrix Generation

```cpp
static auto generateRandomMatrix(int rows, int cols, std::string_view charset = "ABCD") -> Matrix;
```

**Description**: Creates a random matrix with specified dimensions using characters from the provided charset.

**Parameters**:

- `rows`: Number of rows in the generated matrix
- `cols`: Number of columns in the generated matrix
- `charset`: Characters to use for generating the matrix (default: "ABCD")

**Returns**: A randomly generated matrix

**Exceptions**:

- `std::invalid_argument`: If rows or cols are not positive

**Example**:

```cpp
auto matrix = MatrixCompressor::generateRandomMatrix(10, 10, "01");
```

### Matrix Printing

```cpp
template <MatrixLike M>
static void printMatrix(const M& matrix) noexcept;
```

**Description**: Prints the matrix to the standard output.

**Parameters**:

- `matrix`: The matrix to print

**Example**:

```cpp
MatrixCompressor::printMatrix(matrix);
```

### Compression Ratio Calculation

```cpp
template <MatrixLike M>
static auto calculateCompressionRatio(const M& original, const CompressedData& compressed) noexcept -> double;
```

**Description**: Calculates the ratio of compressed size to original size.

**Parameters**:

- `original`: The original uncompressed matrix
- `compressed`: The compressed data

**Returns**: The compression ratio (smaller values indicate better compression)

**Example**:

```cpp
double ratio = MatrixCompressor::calculateCompressionRatio(matrix, compressed);
std::cout << "Compression ratio: " << ratio << std::endl;
```

### Mean Squared Error Calculation

```cpp
template <MatrixLike M1, MatrixLike M2>
    requires std::same_as<std::decay_t<decltype(std::declval<M1>()[0][0])>,
                          std::decay_t<decltype(std::declval<M2>()[0][0])>>
static auto calculateMSE(const M1& matrix1, const M2& matrix2) -> double;
```

**Description**: Calculates the mean squared error between two matrices.

**Parameters**:

- `matrix1`: The first matrix
- `matrix2`: The second matrix

**Returns**: The mean squared error

**Exceptions**:

- `std::invalid_argument`: If matrices have different dimensions

**Example**:

```cpp
double mse = MatrixCompressor::calculateMSE(original, reconstructed);
std::cout << "MSE: " << mse << std::endl;
```

## File Operations

### Saving Compressed Data

```cpp
static void saveCompressedToFile(const CompressedData& compressed, std::string_view filename);
```

**Description**: Saves compressed data to a binary file.

**Parameters**:

- `compressed`: The compressed data to save
- `filename`: The name of the output file

**Exceptions**:

- `FileOpenException`: If the file cannot be opened for writing

**Example**:

```cpp
MatrixCompressor::saveCompressedToFile(compressed, "compressed.bin");
```

### Loading Compressed Data

```cpp
static auto loadCompressedFromFile(std::string_view filename) -> CompressedData;
```

**Description**: Loads compressed data from a binary file.

**Parameters**:

- `filename`: The name of the input file

**Returns**: The loaded compressed data

**Exceptions**:

- `FileOpenException`: If the file cannot be opened for reading

**Example**:

```cpp
auto compressed = MatrixCompressor::loadCompressedFromFile("compressed.bin");
```

## Performance Testing

When compiled with `ATOM_ENABLE_DEBUG`, the library provides a performance testing function:

```cpp
void performanceTest(int rows, int cols, bool runParallel = true);
```

**Description**: Tests and compares the performance of compression and decompression methods.

**Parameters**:

- `rows`: Number of rows in the test matrix
- `cols`: Number of columns in the test matrix
- `runParallel`: Whether to test parallel versions (default: true)

**Example**:

```cpp
performanceTest(1000, 1000, true);
```

## Complete Usage Example

Below is a complete example demonstrating the main features of the `MatrixCompressor` class:

```cpp
#include "matrix_compress.hpp"
#include <iostream>

int main() {
    try {
        // Create a random matrix (10x10)
        auto matrix = atom::algorithm::MatrixCompressor::generateRandomMatrix(10, 10);
        
        // Print the original matrix
        std::cout << "Original Matrix:" << std::endl;
        atom::algorithm::MatrixCompressor::printMatrix(matrix);
        
        // Compress the matrix
        auto compressed = atom::algorithm::MatrixCompressor::compress(matrix);
        
        // Calculate and display compression ratio
        double ratio = atom::algorithm::MatrixCompressor::calculateCompressionRatio(matrix, compressed);
        std::cout << "\nCompression ratio: " << ratio << std::endl;
        std::cout << "Compressed data size: " << compressed.size() << " elements" << std::endl;
        
        // Save to file
        atom::algorithm::MatrixCompressor::saveCompressedToFile(compressed, "matrix.bin");
        
        // Load from file
        auto loadedData = atom::algorithm::MatrixCompressor::loadCompressedFromFile("matrix.bin");
        
        // Decompress
        auto decompressed = atom::algorithm::MatrixCompressor::decompress(loadedData, 10, 10);
        
        // Verify correctness
        std::cout << "\nDecompressed Matrix:" << std::endl;
        atom::algorithm::MatrixCompressor::printMatrix(decompressed);
        
        // Calculate MSE (should be 0 for lossless compression)
        double mse = atom::algorithm::MatrixCompressor::calculateMSE(matrix, decompressed);
        std::cout << "\nMean Squared Error: " << mse << std::endl;
        
        // Try downsampling
        auto downsampled = atom::algorithm::MatrixCompressor::downsample(matrix, 2);
        std::cout << "\nDownsampled Matrix (factor=2):" << std::endl;
        atom::algorithm::MatrixCompressor::printMatrix(downsampled);
        
        // Try upsampling
        auto upsampled = atom::algorithm::MatrixCompressor::upsample(downsampled, 2);
        std::cout << "\nUpsampled Matrix (factor=2):" << std::endl;
        atom::algorithm::MatrixCompressor::printMatrix(upsampled);
        
        // For larger matrices, use parallel processing
        std::cout << "\nLarge matrix processing demo:" << std::endl;
        auto largeMatrix = atom::algorithm::MatrixCompressor::generateRandomMatrix(500, 500);
        
        std::cout << "Starting parallel compression..." << std::endl;
        auto t1 = std::chrono::high_resolution_clock::now();
        auto largeCompressed = atom::algorithm::MatrixCompressor::compressParallel(largeMatrix);
        auto t2 = std::chrono::high_resolution_clock::now();
        
        std::chrono::duration<double, std::milli> duration = t2 - t1;
        std::cout << "Parallel compression time: " << duration.count() << " ms" << std::endl;
        
        std::cout << "Starting parallel decompression..." << std::endl;
        t1 = std::chrono::high_resolution_clock::now();
        auto largeDecompressed = atom::algorithm::MatrixCompressor::decompressParallel(
            largeCompressed, 500, 500);
        t2 = std::chrono::high_resolution_clock::now();
        
        duration = t2 - t1;
        std::cout << "Parallel decompression time: " << duration.count() << " ms" << std::endl;
        
        // Verify large matrix correctness
        double largeMSE = atom::algorithm::MatrixCompressor::calculateMSE(largeMatrix, largeDecompressed);
        std::cout << "MSE for large matrix: " << largeMSE << std::endl;
        
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
```

## Key Features and Benefits

- **Efficient Compression**: Implements run-length encoding for **character matrices**
- **Parallel Processing**: Utilizes **multi-threading** for large matrices
- **SIMD Acceleration**: Automatically uses **hardware acceleration** when available
- **Template Support**: Works with any **matrix-like** container
- **Robust Error Handling**: Provides **detailed exceptions** for troubleshooting
- **File I/O**: Offers simple methods to **save and load** compressed data
- **Matrix Manipulation**: Includes utilities for **downsampling and upsampling**
- **Analysis Tools**: Provides methods to calculate **compression ratios and errors**

This library is ideal for applications dealing with large matrices containing repeated elements, such as binary images, game boards, or sparse data structures.
