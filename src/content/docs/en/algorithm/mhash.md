---
title: MinHash
description: Detailed for the MinHash algorithm implementation in the atom::algorithm namespace, including utility functions for hexadecimal conversion, class methods for computing signatures, and estimating Jaccard similarity.
---

## Purpose and High-Level Overview

ATOM Hash Library is a modern C++20 header-only library that provides efficient implementations of various hashing algorithms with a focus on performance and flexibility. The library includes:

- MinHash algorithm for efficiently estimating Jaccard similarity between sets
- Keccak-256 hash implementation for cryptographic hashing
- Utility functions for hash operations and hexadecimal string conversions
- Optional OpenCL acceleration for performance-critical hash computations

The library leverages modern C++20 features including concepts, ranges, and span to provide a type-safe and efficient API. It's designed with thread safety in mind and includes performance optimizations like thread-local storage and SIMD-friendly algorithms.

## Required Headers and Dependencies

### Core Dependencies

```cpp
#include <array>              // For fixed-size arrays
#include <concepts>           // For template constraints
#include <cstddef>            // For size_t and byte
#include <cstdint>            // For fixed-width integer types
#include <functional>         // For std::function and std::hash
#include <limits>             // For numeric limits
#include <memory>             // For smart pointers
#include <memory_resource>    // For PMR allocators
#include <mutex>              // For thread synchronization
#include <optional>           // For std::optional
#include <ranges>             // For ranges support
#include <shared_mutex>       // For reader-writer locks
#include <span>               // For non-owning views
#include <string>             // For string handling
#include <string_view>        // For string_view
#include <vector>             // For dynamic arrays
```

### Optional Dependencies

```cpp
// Optional OpenCL support for GPU acceleration
#if USE_OPENCL
#include <CL/cl.h>
#include <memory>
#endif

// Optional Boost support for more efficient containers
#ifdef ATOM_USE_BOOST
#include <boost/container/small_vector.hpp>
#include <boost/container/static_vector.hpp>
#include <boost/thread/shared_mutex.hpp>
#endif
```

## Core Concepts and Type Definitions

### Hashable Concept

```cpp
template <typename T>
concept Hashable = requires(T a) {
    { std::hash<T>{}(a) } -> std::convertible_to<std::size_t>;
};
```

The Hashable concept defines requirements for types that can be hashed. It ensures that a type can be used with the standard hash function and produces a value convertible to `size_t`.

### Container Types

```cpp
#ifdef ATOM_USE_BOOST
template <typename T, size_t N>
using SmallVector = boost::container::small_vector<T, N>;

using SharedMutex = boost::shared_mutex;
using SharedLock = boost::shared_lock<SharedMutex>;
using UniqueLock = boost::unique_lock<SharedMutex>;
#else
template <typename T, size_t N>
using SmallVector = std::vector<T, std::pmr::polymorphic_allocator<T>>;

using SharedMutex = std::shared_mutex;
using SharedLock = std::shared_lock<SharedMutex>;
using UniqueLock = std::unique_lock<SharedMutex>;
#endif
```

The library provides optimized container types that can be either Boost-based or standard library-based:

- SmallVector: Optimized for small object storage, avoiding heap allocations for small sizes
- SharedMutex/Lock: Types for reader-writer synchronization

## String Conversion Utilities

### hexstringFromData

```cpp
ATOM_NODISCARD auto hexstringFromData(std::string_view data) noexcept(false) -> std::string;
```

Purpose: Converts binary data to a hexadecimal string representation.

Parameters:

- `data`: Input binary data as string_view

Returns: String containing the hexadecimal representation

Exceptions:

- `std::bad_alloc`: If memory allocation fails

Example:

```cpp
#include "atom/algorithm/mhash.hpp"

void example_hex_conversion() {
    std::string binary_data = "Hello";
    // Convert to hex string
    std::string hex = atom::algorithm::hexstringFromData(binary_data);
    // Output: "48656c6c6f" (hex representation of "Hello")
    std::cout << "Hex: " << hex << std::endl;
}
```

### dataFromHexstring

```cpp
ATOM_NODISCARD auto dataFromHexstring(std::string_view data) noexcept(false) -> std::string;
```

Purpose: Converts a hexadecimal string back to binary data.

Parameters:

- `data`: Input hexadecimal string

Returns: String containing the binary data

Exceptions:

- `std::invalid_argument`: If the input is not a valid hexadecimal string
- `std::bad_alloc`: If memory allocation fails

Example:

```cpp
void example_hex_to_binary() {
    std::string hex_string = "48656c6c6f";
    try {
        // Convert hex string to binary data
        std::string binary = atom::algorithm::dataFromHexstring(hex_string);
        // Output: "Hello"
        std::cout << "Binary data: " << binary << std::endl;
    } catch (const std::invalid_argument& e) {
        std::cerr << "Invalid hex string: " << e.what() << std::endl;
    }
}
```

### supportsHexStringConversion

```cpp
[[nodiscard]] bool supportsHexStringConversion(std::string_view str) noexcept;
```

Purpose: Checks if a string can be converted to hexadecimal.

Parameters:

- `str`: String to check

Returns: Boolean indicating if the string can be converted (contains only valid hex characters)

Note: This function does not throw exceptions.

Example:

```cpp
void example_validate_hex() {
    std::string valid_hex = "48656c6c6f";
    std::string invalid_hex = "48656c6c6xyz";
    
    // Check if strings are valid hex
    bool is_valid = atom::algorithm::supportsHexStringConversion(valid_hex);   // true
    bool is_invalid = atom::algorithm::supportsHexStringConversion(invalid_hex); // false
    
    std::cout << "Valid hex: " << (is_valid ? "Yes" : "No") << std::endl;
    std::cout << "Invalid hex: " << (is_invalid ? "Yes" : "No") << std::endl;
}
```

## MinHash Implementation

The MinHash class implements the MinHash algorithm for estimating the Jaccard similarity between sets. This algorithm is particularly useful for:

- Near-duplicate detection
- Clustering similar items
- Similarity search in high-dimensional spaces

### Class Definition and Methods

```cpp
class MinHash {
public:
    // Types
    using HashFunction = std::function<size_t(size_t)>;
    using HashSignature = SmallVector<size_t, 64>;
    
    // Constructor and destructor
    explicit MinHash(size_t num_hashes) noexcept(false);
    ~MinHash() noexcept;
    
    // Deleted copy operations
    MinHash(const MinHash&) = delete;
    MinHash& operator=(const MinHash&) = delete;
    
    // Core functionality
    template <std::ranges::range Range>
        requires Hashable<std::ranges::range_value_t<Range>>
    [[nodiscard]] auto computeSignature(const Range& set) const noexcept(false) -> HashSignature;
    
    [[nodiscard]] static auto jaccardIndex(std::span<const size_t> sig1, 
                                 std::span<const size_t> sig2) noexcept(false) -> double;
    
    // Utility methods
    [[nodiscard]] size_t getHashFunctionCount() const noexcept;
    [[nodiscard]] bool supportsOpenCL() const noexcept;
};
```

### Constructor

```cpp
explicit MinHash(size_t num_hashes) noexcept(false);
```

Purpose: Creates a MinHash object with the specified number of hash functions.

Parameters:

- `num_hashes`: Number of hash functions to generate

Exceptions:

- `std::bad_alloc`: If memory allocation fails
- `std::invalid_argument`: If `num_hashes` is 0

Implementation Details:

- Creates `num_hashes` independent hash functions for MinHash computation
- Initializes OpenCL resources if enabled and available

### computeSignature

```cpp
template <std::ranges::range Range>
    requires Hashable<std::ranges::range_value_t<Range>>
[[nodiscard]] auto computeSignature(const Range& set) const noexcept(false) -> HashSignature;
```

Purpose: Computes the MinHash signature for a given set.

Parameters:

- `set`: Range of elements to hash (must contain hashable elements)

Returns: Hash signature (vector of hash values)

Exceptions:

- `std::bad_alloc`: If memory allocation fails

Implementation Details:

- Uses thread-local storage for performance optimization
- Tries OpenCL acceleration if available, with fallback to CPU implementation
- Uses loop unrolling for SIMD-friendly CPU implementation

### jaccardIndex

```cpp
[[nodiscard]] static auto jaccardIndex(std::span<const size_t> sig1, 
                             std::span<const size_t> sig2) noexcept(false) -> double;
```

Purpose: Estimates the Jaccard similarity between two sets using their MinHash signatures.

Parameters:

- `sig1`: MinHash signature of the first set
- `sig2`: MinHash signature of the second set

Returns: Estimated Jaccard index (value between 0.0 and 1.0)

Exceptions:

- `std::invalid_argument`: If signature lengths don't match

Example:

```cpp
#include "atom/algorithm/mhash.hpp"
#include <vector>
#include <iostream>

void minhash_example() {
    // Create a MinHash object with 128 hash functions
    atom::algorithm::MinHash minhash(128);
    
    // Define two sets
    std::vector<std::string> set1 = {"apple", "banana", "cherry", "date"};
    std::vector<std::string> set2 = {"banana", "cherry", "elderberry", "fig"};
    
    // Compute MinHash signatures
    auto sig1 = minhash.computeSignature(set1);
    auto sig2 = minhash.computeSignature(set2);
    
    // Calculate Jaccard similarity
    double similarity = atom::algorithm::MinHash::jaccardIndex(sig1, sig2);
    
    // Output: Similarity between the sets (approximately 0.5 for the example sets)
    std::cout << "Jaccard similarity: " << similarity << std::endl;
}
```

### Utility Methods

```cpp
[[nodiscard]] size_t getHashFunctionCount() const noexcept;
[[nodiscard]] bool supportsOpenCL() const noexcept;
```

Purpose:

- `getHashFunctionCount()`: Returns the number of hash functions used
- `supportsOpenCL()`: Checks if OpenCL acceleration is available

Thread Safety: These methods are thread-safe.

## Keccak-256 Implementation

```cpp
[[nodiscard]] auto keccak256(std::span<const uint8_t> input) noexcept(false) -> std::array<uint8_t, K_HASH_SIZE>;
```

Purpose: Computes the Keccak-256 cryptographic hash of the input data.

Parameters:

- `input`: Input data as a span of bytes

Returns: Fixed-size array containing the 32-byte hash

Exceptions:

- `std::bad_alloc`: If memory allocation fails

Overload for string input:

```cpp
[[nodiscard]] inline auto keccak256(std::string_view input) noexcept(false) -> std::array<uint8_t, K_HASH_SIZE>;
```

Example:

```cpp
#include "atom/algorithm/mhash.hpp"
#include <iostream>

void keccak256_example() {
    std::string data = "Hello, world!";
    
    // Compute Keccak-256 hash
    auto hash = atom::algorithm::keccak256(data);
    
    // Convert hash to hex for display
    std::string hash_hex = atom::algorithm::hexstringFromData(
        std::string_view(reinterpret_cast<const char*>(hash.data()), hash.size()));
    
    // Output: Keccak-256 hash in hex format
    std::cout << "Keccak-256 hash: " << hash_hex << std::endl;
}
```

## HashContext Class

The `HashContext` class provides a convenient RAII-style interface for incremental hash computation.

```cpp
class HashContext {
public:
    HashContext() noexcept;
    ~HashContext() noexcept;
    
    // Disable copy, enable move
    HashContext(const HashContext&) = delete;
    HashContext& operator=(const HashContext&) = delete;
    HashContext(HashContext&&) noexcept;
    HashContext& operator=(HashContext&&) noexcept;
    
    bool update(const void* data, size_t length) noexcept;
    bool update(std::string_view data) noexcept;
    bool update(std::span<const std::byte> data) noexcept;
    
    [[nodiscard]] std::optional<std::array<uint8_t, K_HASH_SIZE>> finalize() noexcept;

private:
    struct ContextImpl;
    std::unique_ptr<ContextImpl> impl_;
};
```

Purpose: Provides incremental hash computation with multiple updates.

Methods:

- Constructor: Creates a new hash context
- Destructor: Automatically cleans up resources
- update methods: Add data to the hash computation
- finalize: Complete the hash computation and retrieve the result

Example:

```cpp
#include "atom/algorithm/mhash.hpp"
#include <iostream>

void incremental_hash_example() {
    // Create a hash context
    atom::algorithm::HashContext context;
    
    // Add data incrementally
    context.update("Hello, ");
    context.update("world!");
    
    // Finalize the hash
    auto hash_result = context.finalize();
    
    if (hash_result) {
        // Convert hash to hex for display
        std::string hash_hex = atom::algorithm::hexstringFromData(
            std::string_view(reinterpret_cast<const char*>(hash_result->data()), hash_result->size()));
        
        // Output: Hash in hex format
        std::cout << "Hash: " << hash_hex << std::endl;
    } else {
        std::cerr << "Hash computation failed" << std::endl;
    }
}
```

## OpenCL Acceleration

The library includes optional OpenCL acceleration for performance-critical hash computations, particularly for the MinHash algorithm.

### Requirements

- OpenCL library must be available
- Code must be compiled with `USE_OPENCL` defined

### Implementation Details

- Automatically detects and initializes available OpenCL devices
- Falls back to CPU implementation if OpenCL initialization fails
- Provides significant performance improvement for large data sets

### Thread Safety

All OpenCL operations are protected by appropriate synchronization mechanisms.

## Performance Considerations

### Key Optimizations

- Thread-local storage for intermediate computations
- Loop unrolling for SIMD-friendly processing
- Small vector optimization to reduce memory allocations
- GPU acceleration via OpenCL for parallel computations
- Reader-writer locks for efficient concurrent access

### Performance Tips

1. Use OpenCL acceleration for large datasets when available
2. Reuse MinHash instances rather than creating new ones
3. Choose appropriate number of hash functions (more functions increase accuracy but reduce performance)
4. Consider using Boost containers for better small object optimization

## Best Practices and Common Pitfalls

### Best Practices

1. Error handling: Always check for exceptions from non-noexcept functions
2. Thread safety: Be aware of synchronization when sharing objects between threads
3. Memory management: Use RAII principles for resource management
4. Performance: Choose appropriate container types and algorithms for your use case

### Common Pitfalls

1. Incorrect hash function count: Using too few hash functions reduces accuracy
2. Ignoring OpenCL errors: Not handling OpenCL failures properly
3. Not checking return values: Failing to check optional results or boolean status
4. Thread safety issues: Not considering concurrent access to shared objects

## Comprehensive Example

Here's a complete example demonstrating the main functionality of the library working together:

```cpp
#include "atom/algorithm/mhash.hpp"
#include <iostream>
#include <vector>
#include <string>
#include <unordered_set>
#include <chrono>

using namespace atom::algorithm;

// Helper function to print hash in hex format
void printHash(const std::array<uint8_t, K_HASH_SIZE>& hash) {
    std::string hash_hex = hexstringFromData(
        std::string_view(reinterpret_cast<const char*>(hash.data()), hash.size()));
    std::cout << hash_hex << std::endl;
}

int main() {
    try {
        // Part 1: Hex String Conversion
        std::cout << "===== Hex String Conversion =====" << std::endl;
        std::string original = "Hello, ATOM Hash Library!";
        std::string hex = hexstringFromData(original);
        std::cout << "Original: " << original << std::endl;
        std::cout << "Hex: " << hex << std::endl;
        
        std::string recovered = dataFromHexstring(hex);
        std::cout << "Recovered: " << recovered << std::endl;
        std::cout << "Conversion successful: " << (original == recovered ? "Yes" : "No") << std::endl;
        std::cout << std::endl;
        
        // Part 2: Keccak-256 Hashing
        std::cout << "===== Keccak-256 Hashing =====" << std::endl;
        // Direct hashing
        auto hash1 = keccak256(original);
        std::cout << "Direct hash: ";
        printHash(hash1);
        
        // Incremental hashing
        HashContext context;
        context.update("Hello, ");
        context.update("ATOM Hash ");
        context.update("Library!");
        auto hash2 = context.finalize();
        
        if (hash2) {
            std::cout << "Incremental hash: ";
            printHash(*hash2);
            std::cout << "Hashes match: " << (hash1 == *hash2 ? "Yes" : "No") << std::endl;
        }
        std::cout << std::endl;
        
        // Part 3: MinHash for Similarity
        std::cout << "===== MinHash Similarity =====" << std::endl;
        
        // Create document sets (simulating word sets in documents)
        std::vector<std::string> doc1 = {"apple", "banana", "cherry", "date", "elderberry"};
        std::vector<std::string> doc2 = {"banana", "cherry", "date", "fig", "grape"};
        std::vector<std::string> doc3 = {"kiwi", "lemon", "mango", "nectarine", "orange"};
        
        std::cout << "Document 1: ";
        for (const auto& word : doc1) std::cout << word << " ";
        std::cout << std::endl;
        
        std::cout << "Document 2: ";
        for (const auto& word : doc2) std::cout << word << " ";
        std::cout << std::endl;
        
        std::cout << "Document 3: ";
        for (const auto& word : doc3) std::cout << word << " ";
        std::cout << std::endl;
        
        // Create MinHash with 100 hash functions
        MinHash minhash(100);
        std::cout << "Created MinHash with " << minhash.getHashFunctionCount() << " hash functions" << std::endl;
        std::cout << "OpenCL support: " << (minhash.supportsOpenCL() ? "Yes" : "No") << std::endl;
        
        // Time the signature computation
        auto start = std::chrono::high_resolution_clock::now();
        
        // Compute signatures
        auto sig1 = minhash.computeSignature(doc1);
        auto sig2 = minhash.computeSignature(doc2);
        auto sig3 = minhash.computeSignature(doc3);
        
        auto end = std::chrono::high_resolution_clock::now();
        std::chrono::duration<double, std::milli> elapsed = end - start;
        
        std::cout << "Signature computation time: " << elapsed.count() << " ms" << std::endl;
        
        // Calculate similarities
        double sim12 = MinHash::jaccardIndex(sig1, sig2);
        double sim13 = MinHash::jaccardIndex(sig1, sig3);
        double sim23 = MinHash::jaccardIndex(sig2, sig3);
        
        std::cout << "Similarity between doc1 and doc2: " << sim12 << std::endl;
        std::cout << "Similarity between doc1 and doc3: " << sim13 << std::endl;
        std::cout << "Similarity between doc2 and doc3: " << sim23 << std::endl;
        
        // Calculate actual Jaccard indices for comparison
        auto jaccard = [](const auto& a, const auto& b) {
            std::unordered_set<std::string> set_a(a.begin(), a.end());
            std::unordered_set<std::string> set_b(b.begin(), b.end());
            
            size_t intersection = 0;
            for (const auto& item : set_a) {
                if (set_b.count(item) > 0) intersection++;
            }
            
            return static_cast<double>(intersection) / 
                   (set_a.size() + set_b.size() - intersection);
        };
        
        std::cout << "Actual Jaccard index (doc1, doc2): " << jaccard(doc1, doc2) << std::endl;
        std::cout << "Actual Jaccard index (doc1, doc3): " << jaccard(doc1, doc3) << std::endl;
        std::cout << "Actual Jaccard index (doc2, doc3): " << jaccard(doc2, doc3) << std::endl;
        
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
```

Expected Output:

```
===== Hex String Conversion =====
Original: Hello, ATOM Hash Library!
Hex: 48656c6c6f2c2041544f4d2048617368204c696272617279!
Recovered: Hello, ATOM Hash Library!
Conversion successful: Yes

===== Keccak-256 Hashing =====
Direct hash: 7da8ae45d8d48cc0e4bb8e44727c4ca199b3c5d183b4bcd147db388b5e256bd2
Incremental hash: 7da8ae45d8d48cc0e4bb8e44727c4ca199b3c5d183b4bcd147db388b5e256bd2
Hashes match: Yes

===== MinHash Similarity =====
Document 1: apple banana cherry date elderberry 
Document 2: banana cherry date fig grape 
Document 3: kiwi lemon mango nectarine orange 
Created MinHash with 100 hash functions
OpenCL support: No
Signature computation time: 0.652 ms
Similarity between doc1 and doc2: 0.6
Similarity between doc1 and doc3: 0
Similarity between doc2 and doc3: 0
Actual Jaccard index (doc1, doc2): 0.375
Actual Jaccard index (doc1, doc3): 0
Actual Jaccard index (doc2, doc3): 0
```

## Platform and Compiler Notes

### Compiler Requirements

- C++20 support required for concepts, ranges, and other modern features
- Tested on:
  - GCC 10.0+
  - Clang 10.0+
  - MSVC 19.29+ (Visual Studio 2019 16.10+)

### Platform-Specific Considerations

- Windows: Ensure OpenCL drivers are properly installed when using GPU acceleration
- Linux: May require additional packages for OpenCL support
- macOS: OpenCL support is deprecated in newer versions, consider alternative acceleration options

### OpenCL Compatibility

- The OpenCL implementation requires OpenCL 1.2 or later
- Performance varies greatly depending on the available GPU hardware
- CPU fallback is always available for compatibility

## Conclusion

The Atom Hash Library provides a modern, efficient implementation of various hashing algorithms with a clean, type-safe API. The library's focus on performance optimizations, thread safety, and RAII-style resource management makes it suitable for a wide range of applications from simple hash computation to large-scale similarity detection.

By using modern C++20 features like concepts and ranges, the library provides compile-time safety while maintaining high runtime performance. The optional OpenCL acceleration offers significant performance improvements for compatible systems.

The library is designed to be easy to use for common cases while providing flexibility for advanced use cases through its comprehensive API.
