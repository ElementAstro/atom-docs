---
title: Hash Algorithms
description: Comprehensive for the hash.hpp file in the atom::algorithm namespace, including functions for hashing single values, vectors, tuples, arrays, and strings using FNV-1a.
---

## Overview

The Atom Algorithm Hash Library provides a **collection of optimized and enhanced hash algorithms** with thread safety, parallel processing, and support for various data types. This library extends beyond the standard C++ hashing capabilities by offering:

- **SIMD optimization** when available through AVX2 and SSE2
- **Thread-safe hash caching**
- **Parallel processing** for large data collections
- **Multiple hash algorithm** support
- **Comprehensive type support** including STL containers and types
- **Hash verification** with tolerance support

## Table of Contents

- [Overview](#overview)
- [Table of Contents](#table-of-contents)
- [Installation](#installation)
- [Core Components](#core-components)
  - [HashCache](#hashcache)
  - [Hashable Concept](#hashable-concept)
  - [HashAlgorithm Enum](#hashalgorithm-enum)
  - [Hash Functions](#hash-functions)
  - [Hash Combining](#hash-combining)
- [Computing Hashes](#computing-hashes)
  - [Basic Types](#basic-types)
  - [Vectors](#vectors)
  - [Tuples](#tuples)
  - [Arrays](#arrays)
  - [Pairs](#pairs)
  - [Optional Values](#optional-values)
  - [Variants](#variants)
  - [Any Type](#any-type)
- [Utility Functions](#utility-functions)
  - [Hash Verification](#hash-verification)
  - [String Literal Operator](#string-literal-operator)
- [Complete Example](#complete-example)

## Installation

Include the `hash.hpp` header in your project:

```cpp
#include "atom/algorithm/hash.hpp"
```

For Boost integration, define `ATOM_USE_BOOST` before including the header:

```cpp
#define ATOM_USE_BOOST
#include "atom/algorithm/hash.hpp"
```

## Core Components

### HashCache

A thread-safe cache for hash values to improve performance by avoiding redundant hash calculations.

```cpp
atom::algorithm::HashCache<std::string> cache;
auto cached_hash = cache.get("example"); // Returns std::nullopt if not found
cache.set("example", 123456789);         // Store a hash value
cache.clear();                          // Clear all cached values
```

### Hashable Concept

A concept that defines types that can be hashed.

```cpp
template <typename T>
concept Hashable = requires(T a) {
    { std::hash<T>{}(a) } -> std::convertible_to<std::size_t>;
};
```

This concept is used throughout the library to constrain template parameters, ensuring they can be properly hashed.

### HashAlgorithm Enum

Enum class defining supported hash algorithms:

```cpp
enum class HashAlgorithm {
    STD,       // Standard library hash
    FNV1A,     // FNV-1a
    XXHASH,    // xxHash
    CITYHASH,  // CityHash
    MURMUR3    // MurmurHash3
};
```

### Hash Functions

The library provides optimized hash functions that take advantage of SIMD instructions when available:

```cpp
// String hashing with FNV-1a algorithm
auto hash_value = atom::algorithm::hash("example string");

// String literal hashing using user-defined literal
auto literal_hash = "example string"_hash;
```

### Hash Combining

Functions to combine multiple hash values into a single hash:

```cpp
std::size_t seed = compute_hash(value1);
std::size_t combined = atom::algorithm::hashCombine(seed, compute_hash(value2));
```

## Computing Hashes

### Basic Types

Compute a hash for any hashable type:

```cpp
std::size_t hash = atom::algorithm::computeHash(42); // Integer hash
std::size_t hash = atom::algorithm::computeHash(3.14); // Double hash
std::size_t hash = atom::algorithm::computeHash(std::string("example")); // String hash

// Using a specific algorithm
std::size_t hash = atom::algorithm::computeHash(value, atom::algorithm::HashAlgorithm::FNV1A);
```

### Vectors

Compute a hash for a vector of hashable elements, with optional parallel processing:

```cpp
std::vector<int> values = {1, 2, 3, 4, 5};

// Sequential hash computation
std::size_t hash = atom::algorithm::computeHash(values);

// Parallel hash computation (recommended for large vectors)
std::size_t hash = atom::algorithm::computeHash(values, true);
```

### Tuples

Compute a hash for a tuple of hashable types:

```cpp
auto tuple = std::make_tuple(42, "example", 3.14);
std::size_t hash = atom::algorithm::computeHash(tuple);
```

### Arrays

Compute a hash for an array of hashable types:

```cpp
std::array<int, 5> arr = {1, 2, 3, 4, 5};
std::size_t hash = atom::algorithm::computeHash(arr);
```

### Pairs

Compute a hash for a pair of hashable types:

```cpp
auto pair = std::make_pair("key", 42);
std::size_t hash = atom::algorithm::computeHash(pair);
```

### Optional Values

Compute a hash for an optional value:

```cpp
std::optional<int> opt_value = 42;
std::size_t hash = atom::algorithm::computeHash(opt_value);

std::optional<int> empty_opt;
std::size_t empty_hash = atom::algorithm::computeHash(empty_opt); // Hash of empty optional
```

### Variants

Compute a hash for a variant:

```cpp
std::variant<int, std::string, double> var = "example";
std::size_t hash = atom::algorithm::computeHash(var);
```

### Any Type

Compute a hash for a std::any value:

```cpp
std::any value = 42;
std::size_t hash = atom::algorithm::computeHash(value);
```

## Utility Functions

### Hash Verification

Verify if two hash values match, with optional tolerance:

```cpp
// Exact match
bool exact_match = atom::algorithm::verifyHash(hash1, hash2);

// Match with tolerance (fuzzy matching)
bool fuzzy_match = atom::algorithm::verifyHash(hash1, hash2, 10);
```

### String Literal Operator

A user-defined literal for computing hash values of string literals:

```cpp
auto hash = "example"_hash;
```

## Complete Example

Here's a comprehensive example demonstrating various features of the library:

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <tuple>
#include "atom/algorithm/hash.hpp"

int main() {
    // Basic type hashing
    int intValue = 42;
    std::string strValue = "example string";
    
    std::size_t intHash = atom::algorithm::computeHash(intValue);
    std::size_t strHash = atom::algorithm::computeHash(strValue);
    
    std::cout << "Integer hash: " << intHash << std::endl;
    std::cout << "String hash: " << strHash << std::endl;
    
    // String literal hash
    std::size_t literalHash = "example string"_hash;
    std::cout << "String literal hash: " << literalHash << std::endl;
    
    // Using specific algorithm
    std::size_t fnv1aHash = atom::algorithm::computeHash(
        strValue, atom::algorithm::HashAlgorithm::FNV1A);
    std::cout << "FNV-1a hash: " << fnv1aHash << std::endl;
    
    // Vector hashing with parallel processing
    std::vector<int> largeVector(10000, 42);
    std::size_t vecHash = atom::algorithm::computeHash(largeVector, true);
    std::cout << "Vector hash (parallel): " << vecHash << std::endl;
    
    // Tuple hashing
    auto tuple = std::make_tuple(42, "example", 3.14);
    std::size_t tupleHash = atom::algorithm::computeHash(tuple);
    std::cout << "Tuple hash: " << tupleHash << std::endl;
    
    // Optional value hashing
    std::optional<int> optValue = 42;
    std::optional<int> emptyOpt;
    std::size_t optHash = atom::algorithm::computeHash(optValue);
    std::size_t emptyOptHash = atom::algorithm::computeHash(emptyOpt);
    std::cout << "Optional hash: " << optHash << std::endl;
    std::cout << "Empty optional hash: " << emptyOptHash << std::endl;
    
    // Variant hashing
    std::variant<int, std::string, double> var = "example";
    std::size_t varHash = atom::algorithm::computeHash(var);
    std::cout << "Variant hash: " << varHash << std::endl;
    
    // Hash verification
    bool hashesMatch = atom::algorithm::verifyHash(strHash, literalHash);
    std::cout << "Hashes match: " << (hashesMatch ? "true" : "false") << std::endl;
    
    // Hash combining
    std::size_t combinedHash = atom::algorithm::hashCombine(intHash, strHash);
    std::cout << "Combined hash: " << combinedHash << std::endl;
    
    return 0;
}
```

This example demonstrates:

- Hashing of basic types
- Using string literal operator
- Selecting specific hash algorithms
- Parallel processing for vectors
- Hashing complex types like tuples, optionals, and variants
- Hash verification
- Hash combining

The Atom Algorithm Hash Library provides a **robust and flexible solution** for hashing needs in C++ applications, with optimizations for modern hardware and comprehensive type support.
