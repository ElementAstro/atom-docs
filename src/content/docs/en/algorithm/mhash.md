---
title: MinHash
description: Detailed for the MinHash algorithm implementation in the atom::algorithm namespace, including utility functions for hexadecimal conversion, class methods for computing signatures, and estimating Jaccard similarity.
---


## Overview

The `mhash.hpp` library is part of the ATOM framework, providing efficient hash algorithm implementations for C++ applications. This library includes:

- MinHash implementation for estimating similarity between sets
- Keccak-256 hash function
- Utilities for hex string conversion
- OpenCL acceleration (when available)

The library leverages modern C++20 features including concepts, ranges, and bit manipulation for optimal performance.

## Key Features

- High-performance hash algorithms optimized for modern hardware
- OpenCL acceleration for MinHash when available
- Type-safe interfaces using C++20 concepts
- Memory-efficient implementations
- Exception safety with proper error handling

## Requirements

- C++20 compatible compiler
- OpenSSL (for some hash implementations)
- OpenCL (optional, for hardware acceleration)
- Boost (optional)

## API Documentation

### Concept: Hashable

```cpp
template <typename T>
concept Hashable = requires(T a) {
    { std::hash<T>{}(a) } -> std::convertible_to<std::size_t>;
};
```

This concept defines types that can be hashed using the standard library's `std::hash`.

### Hex String Conversion

#### `hexstringFromData`

```cpp
auto hexstringFromData(std::string_view data) noexcept(false) -> std::string;
```

Purpose: Converts binary data to a hexadecimal string representation.

Parameters:

- `data`: The input binary data as a string_view

Returns: A string containing the hexadecimal representation

Exceptions:

- `std::bad_alloc`: If memory allocation fails
- `std::runtime_error`: If conversion fails

Example:

```cpp
std::string binary_data = "Hello";
std::string hex = atom::algorithm::hexstringFromData(binary_data);
// hex = "48656C6C6F"
```

#### `dataFromHexstring`

```cpp
auto dataFromHexstring(std::string_view data) noexcept(false) -> std::string;
```

Purpose: Converts a hexadecimal string back to binary data.

Parameters:

- `data`: A hexadecimal string (must have even length)

Returns: The original binary data

Exceptions:

- `std::invalid_argument`: If the input is not a valid hexadecimal string
- `std::bad_alloc`: If memory allocation fails
- `std::runtime_error`: If conversion fails

Example:

```cpp
std::string hex = "48656C6C6F";
std::string binary = atom::algorithm::dataFromHexstring(hex);
// binary = "Hello"
```

#### `supportsHexStringConversion`

```cpp
bool supportsHexStringConversion(const std::string &str);
```

Purpose: Checks if a string can be converted from/to hexadecimal.

Parameters:

- `str`: The string to check

Returns: `true` if the string contains only valid hexadecimal characters, `false` otherwise

Example:

```cpp
bool valid = atom::algorithm::supportsHexStringConversion("48656C6C6F");
// valid = true
```

### MinHash Algorithm

The MinHash algorithm is used to estimate the Jaccard similarity between sets by generating hash signatures.

#### `MinHash` Class

```cpp
class MinHash {
public:
    explicit MinHash(size_t num_hashes) noexcept(false);
    ~MinHash() noexcept;

    template <std::ranges::range Range>
        requires Hashable<std::ranges::range_value_t<Range>>
    auto computeSignature(const Range& set) const noexcept(false) -> std::vector<size_t>;

    static auto jaccardIndex(std::span<const size_t> sig1,
                           std::span<const size_t> sig2) noexcept(false) -> double;
};
```

Constructor:

```cpp
explicit MinHash(size_t num_hashes) noexcept(false);
```

Purpose: Creates a MinHash object with the specified number of hash functions.

Parameters:

- `num_hashes`: Number of hash functions to use (must be > 0)

Exceptions:

- `std::invalid_argument`: If `num_hashes` is zero
- `std::bad_alloc`: If memory allocation fails
- `std::runtime_error`: If initialization fails

Example:

```cpp
// Create a MinHash with 100 hash functions
atom::algorithm::MinHash minhash(100);
```

#### `computeSignature`

```cpp
template <std::ranges::range Range>
    requires Hashable<std::ranges::range_value_t<Range>>
auto computeSignature(const Range& set) const noexcept(false) -> std::vector<size_t>;
```

Purpose: Computes the MinHash signature for a set.

Parameters:

- `set`: A range of hashable elements representing the set

Returns: A vector of size_t values representing the MinHash signature

Exceptions:

- `std::bad_alloc`: If memory allocation fails
- `std::runtime_error`: If signature computation fails

Notes:

- Uses OpenCL acceleration if available
- Falls back to CPU implementation if OpenCL fails or is unavailable

Example:

```cpp
std::set<std::string> words = {"apple", "banana", "cherry"};
std::vector<size_t> signature = minhash.computeSignature(words);
```

#### `jaccardIndex`

```cpp
static auto jaccardIndex(std::span<const size_t> sig1,
                       std::span<const size_t> sig2) noexcept(false) -> double;
```

Purpose: Computes the estimated Jaccard similarity index between two sets based on their MinHash signatures.

Parameters:

- `sig1`: MinHash signature of the first set
- `sig2`: MinHash signature of the second set

Returns: A double in range [0.0, 1.0] representing the similarity (1.0 means identical)

Exceptions:

- `std::invalid_argument`: If signatures have different lengths

Example:

```cpp
double similarity = atom::algorithm::MinHash::jaccardIndex(sig1, sig2);
```

### Keccak-256 Hash

```cpp
auto keccak256(const uint8_t* input, size_t length) noexcept(false) -> std::array<uint8_t, K_HASH_SIZE>;
auto keccak256(std::string_view input) noexcept(false) -> std::array<uint8_t, K_HASH_SIZE>;
```

Purpose: Computes the Keccak-256 cryptographic hash of input data.

Parameters:

- `input`: Pointer to input data or string_view
- `length`: Length of input data (for pointer version)

Returns: Fixed-size array of 32 bytes representing the hash

Exceptions:

- `std::bad_alloc`: If memory allocation fails

Notes:

- Keccak-256 is the algorithm that was standardized as SHA-3

Example:

```cpp
std::string message = "Hello, world!";
auto hash = atom::algorithm::keccak256(message);
```

## Complete Example

Here's a comprehensive example demonstrating the key features of the mhash library:

```cpp
#include "atom/algorithm/mhash.hpp"
#include <iostream>
#include <set>
#include <iomanip>
#include <vector>

int main() {
    // Hex string conversion example
    std::string original = "Hello, ATOM!";
    std::cout << "Original: " << original << std::endl;
    
    // Convert to hex
    std::string hex = atom::algorithm::hexstringFromData(original);
    std::cout << "Hex: " << hex << std::endl;
    
    // Convert back from hex
    std::string restored = atom::algorithm::dataFromHexstring(hex);
    std::cout << "Restored: " << restored << std::endl;
    
    // Check if hex conversion is supported
    std::cout << "Is valid hex: " << std::boolalpha 
              << atom::algorithm::supportsHexStringConversion(hex) << std::endl;
    
    // Keccak-256 hash example
    auto hash = atom::algorithm::keccak256(original);
    std::cout << "Keccak-256 hash: ";
    for (uint8_t byte : hash) {
        std::cout << std::hex << std::setw(2) << std::setfill('0') << static_cast<int>(byte);
    }
    std::cout << std::dec << std::endl;
    
    // MinHash example for similarity estimation
    atom::algorithm::MinHash minhash(100);  // Create with 100 hash functions
    
    // Define two sets with some overlap
    std::set<std::string> set1 = {"apple", "banana", "cherry", "date", "elderberry"};
    std::set<std::string> set2 = {"banana", "cherry", "date", "fig", "grape"};
    
    // Compute signatures
    std::vector<size_t> sig1 = minhash.computeSignature(set1);
    std::vector<size_t> sig2 = minhash.computeSignature(set2);
    
    // Calculate Jaccard similarity
    double similarity = atom::algorithm::MinHash::jaccardIndex(sig1, sig2);
    std::cout << "Estimated Jaccard similarity: " << similarity << std::endl;
    
    // Calculate actual Jaccard similarity for comparison
    size_t intersection = 0;
    for (const auto& item : set1) {
        if (set2.count(item) > 0) {
            intersection++;
        }
    }
    double actual = static_cast<double>(intersection) / (set1.size() + set2.size() - intersection);
    std::cout << "Actual Jaccard similarity: " << actual << std::endl;
    
    return 0;
}
```

## Performance Considerations

- The MinHash implementation automatically uses OpenCL acceleration when available
- For large datasets, MinHash provides significant performance advantages over direct set comparison
- The hex string conversion functions are optimized for modern CPUs with SIMD instructions
- Keccak-256 implementation is optimized with bit manipulation and loop unrolling

## Error Handling

The library uses exception-based error handling:

- Invalid inputs throw `std::invalid_argument`
- Memory allocation failures throw `std::bad_alloc`
- Runtime failures throw `std::runtime_error`

When Boost is enabled (`ATOM_USE_BOOST`), exceptions use Boost's error info for more detailed error messages.

## Thread Safety

- MinHash objects are thread-safe for concurrent calls to `computeSignature`
- Static functions are thread-safe
- Hex conversion functions are thread-safe

## License

Copyright (C) 2023-2024 Max Qian <lightapt.com>
