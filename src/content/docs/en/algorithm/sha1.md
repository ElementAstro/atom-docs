---
title: SHA1
description: Detailed documentation for the SHA1 class, including member functions, SIMD support, and example usage for hashing data.
---

## Overview

This document provides detailed information about the `atom::algorithm::SHA1` class, a C++20 implementation of the SHA-1 cryptographic hash function. Although SHA-1 is no longer considered secure for cryptographic purposes, it remains useful for checksums and data integrity verification.

## Features

- Standard Compliant: Implements SHA-1 according to FIPS PUB 180-4
- Modern C++: Utilizes C++20 features including concepts, spans, and byte manipulation
- Incremental Updates: Supports hashing data in chunks
- SIMD Optimization: Optional AVX2 acceleration for improved performance
- Parallel Processing: Ability to compute multiple hashes concurrently
- Flexible Input: Works with various byte container types

## Class Documentation

### Constructor

```cpp
SHA1() noexcept;
```

Description: Initializes a new SHA1 object with the standard initial hash values. If AVX2 instructions are available, SIMD optimization will be enabled automatically.

### Core Methods

#### `update` Methods

```cpp
void update(std::span<const uint8_t> data) noexcept;
void update(const uint8_t* data, size_t length);

template <ByteContainer Container>
void update(const Container& container) noexcept;
```

Description: Updates the hash state with new data. Can be called multiple times to process data incrementally.

Parameters:

- `data`: The data to hash, provided as a span, raw pointer, or byte container
- `length`: The number of bytes to hash (only for raw pointer version)

Usage:

```cpp
SHA1 hasher;
hasher.update(std::vector<uint8_t>{...});  // Using container
hasher.update(std::span<const uint8_t>(...));  // Using span
hasher.update(rawBytes, byteCount);  // Using raw pointer
```

Notes:

- The templated version works with any type satisfying the `ByteContainer` concept
- Throws `std::invalid_argument` if a null pointer with non-zero length is provided

#### `digest` Method

```cpp
[[nodiscard]] auto digest() noexcept -> std::array<uint8_t, 20>;
```

Description: Finalizes the hash computation and returns the 20-byte SHA-1 digest.

Returns: A fixed-size array of 20 bytes containing the SHA-1 hash value.

Usage:

```cpp
SHA1 hasher;
hasher.update(data);
std::array<uint8_t, 20> hash = hasher.digest();
```

Notes:

- This method does not modify the internal state, allowing you to continue updating with more data
- Handles message padding and bit length according to the SHA-1 specification

#### `digestAsString` Method

```cpp
[[nodiscard]] auto digestAsString() noexcept -> std::string;
```

Description: Finalizes the hash computation and returns the digest as a hexadecimal string.

Returns: A 40-character string containing the hexadecimal representation of the SHA-1 digest.

Usage:

```cpp
SHA1 hasher;
hasher.update(data);
std::string hashStr = hasher.digestAsString();  // e.g. "a9993e364706816aba3e25717850c26c9cd0d89d"
```

#### `reset` Method

```cpp
void reset() noexcept;
```

Description: Resets the hash state to its initial values, allowing the object to be reused for a new hash computation.

Usage:

```cpp
SHA1 hasher;
hasher.update(data1);
std::string hash1 = hasher.digestAsString();

hasher.reset();  // Reset state for new computation
hasher.update(data2);
std::string hash2 = hasher.digestAsString();
```

### Helper Functions

#### `bytesToHex` Function

```cpp
template <size_t N>
[[nodiscard]] auto bytesToHex(const std::array<uint8_t, N>& bytes) noexcept -> std::string;
```

Description: Converts an array of bytes to a hexadecimal string representation.

Parameters:

- `bytes`: The array of bytes to convert

Returns: A string with the hexadecimal representation (2 characters per byte).

Usage:

```cpp
std::array<uint8_t, 20> digest = hasher.digest();
std::string hexString = bytesToHex(digest);
```

#### `computeHashesInParallel` Function

```cpp
template <ByteContainer... Containers>
[[nodiscard]] auto computeHashesInParallel(const Containers&... containers)
    -> std::vector<std::array<uint8_t, SHA1::DIGEST_SIZE>>;
```

Description: Computes SHA-1 hashes of multiple containers concurrently using parallel execution.

Parameters:

- `containers`: A variable number of byte containers to hash

Returns: A vector of SHA-1 digests, one for each input container.

Usage:

```cpp
std::vector<uint8_t> data1 = {...};
std::string data2 = "Hello World";
std::array<uint8_t, 100> data3 = {...};

auto hashes = computeHashesInParallel(data1, data2, data3);
// hashes[0] corresponds to data1's hash, etc.
```

## ByteContainer Concept

```cpp
template <typename T>
concept ByteContainer = requires(T t) {
    { std::data(t) } -> std::convertible_to<const uint8_t*>;
    { std::size(t) } -> std::convertible_to<size_t>;
};
```

Description: A concept that defines requirements for types that can be used as byte containers.

Types that satisfy this concept include:

- `std::vector<uint8_t>`
- `std::array<uint8_t, N>`
- `std::string`
- `std::string_view`
- Any contiguous container with elements convertible to `uint8_t`

## SIMD Optimization

This implementation includes optimizations using AVX2 SIMD instructions when available:

- Automatic Detection: The constructor detects AVX2 support at runtime
- Optimized Processing: Uses `processBlockSIMD` method when AVX2 is available
- Performance Gain: Significant performance improvement for large inputs

## Complete Example

Here's a comprehensive example showing how to use the SHA1 class:

```cpp
#include "sha1.hpp"
#include <iostream>
#include <string>
#include <vector>
#include <iomanip>

int main() {
    // Basic usage with string
    {
        std::string input = "Hello, world!";
        
        atom::algorithm::SHA1 hasher;
        hasher.update(input);
        
        auto digest = hasher.digest();
        std::cout << "SHA-1 of '" << input << "': " << hasher.digestAsString() << std::endl;
        
        // Expected: "0a0a9f2a6772942557ab5355d76af442f8f65e01"
    }
    
    // Incremental updates
    {
        atom::algorithm::SHA1 hasher;
        hasher.update(std::string("Hello"));
        hasher.update(std::string(", "));
        hasher.update(std::string("world!"));
        
        std::cout << "Incremental SHA-1: " << hasher.digestAsString() << std::endl;
        // Should match the previous result
    }
    
    // Using with raw byte data
    {
        const uint8_t data[] = {0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c, 0x20, 
                                0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21};
        
        atom::algorithm::SHA1 hasher;
        hasher.update(data, sizeof(data));
        
        std::cout << "Raw bytes SHA-1: " << hasher.digestAsString() << std::endl;
        // Should match the previous results
    }
    
    // Using with std::vector<uint8_t>
    {
        std::vector<uint8_t> data = {0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c, 0x20, 
                                     0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21};
        
        atom::algorithm::SHA1 hasher;
        hasher.update(data);
        
        std::cout << "Vector SHA-1: " << hasher.digestAsString() << std::endl;
    }
    
    // Computing multiple hashes in parallel
    {
        std::string data1 = "First input";
        std::string data2 = "Second input";
        std::string data3 = "Third input";
        
        auto hashes = atom::algorithm::computeHashesInParallel(data1, data2, data3);
        
        std::cout << "Parallel hashing results:" << std::endl;
        for (size_t i = 0; i < hashes.size(); ++i) {
            std::cout << "  Hash " << (i+1) << ": " 
                      << atom::algorithm::bytesToHex(hashes[i]) << std::endl;
        }
    }
    
    // Reusing the hasher object
    {
        atom::algorithm::SHA1 hasher;
        
        hasher.update(std::string("First message"));
        std::cout << "First hash: " << hasher.digestAsString() << std::endl;
        
        hasher.reset();
        hasher.update(std::string("Second message"));
        std::cout << "Second hash: " << hasher.digestAsString() << std::endl;
    }
    
    return 0;
}
```

## Performance Considerations

- Block Processing: Data is processed in 64-byte blocks
- SIMD Optimization: Significant speedup when AVX2 is available
- Parallel Execution: `computeHashesInParallel` utilizes multiple cores for better throughput
- Memory Usage: Minimal memory footprint with fixed-size internal buffers
- Endianness: Automatically handles both little-endian and big-endian architectures

For large volumes of data or performance-critical applications, consider:

1. Using SIMD-optimized builds where available
2. Processing multiple inputs in parallel with `computeHashesInParallel`
3. Using incremental updates with appropriately sized chunks to minimize memory pressure

## Security Note

SHA-1 is no longer considered cryptographically secure. For security-sensitive applications, consider using SHA-256, SHA-3, or other more secure hash functions.
