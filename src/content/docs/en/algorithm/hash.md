---
title: Hash Algorithms
description: Comprehensive for the hash.hpp file in the atom::algorithm namespace, including functions for hashing single values, vectors, tuples, arrays, and strings using FNV-1a.
---

## Purpose and Overview

The Enhanced Hash Algorithm Library provides a collection of optimized hash algorithms with advanced features including:

- Thread-safe hash caching for improved performance
- SIMD acceleration when available (SSE2, AVX2)
- Parallel processing for large data sets
- Type-safe hashing via concepts
- Comprehensive type support (basic types, containers, std::variant, std::optional, std::any)
- Multiple hash algorithms (std::hash, FNV-1a, etc.)
- Optional Boost integration

This library is designed to provide efficient, type-safe, and thread-aware hashing capabilities that go beyond the standard library's offerings while maintaining ease of use.

## Required Headers and Dependencies

### Standard Library Dependencies

```cpp
#include <any>           // For std::any support
#include <array>         // For std::array support
#include <functional>    // For std::hash
#include <mutex>         // For synchronization primitives
#include <optional>      // For std::optional support
#include <shared_mutex>  // For read-write locks
#include <thread>        // For parallel processing
#include <tuple>         // For std::tuple support
#include <typeindex>     // For type information
#include <variant>       // For std::variant support
#include <vector>        // For std::vector support
```

### Optional Dependencies

```cpp
// Optional Boost integration
#ifdef ATOM_USE_BOOST
#include <boost/functional/hash.hpp>
#endif

// SIMD optimizations
#if defined(__SSE2__)
#include <emmintrin.h>  // SSE2 intrinsics
#endif
#if defined(__AVX2__)
#include <immintrin.h>  // AVX2 intrinsics
#endif
```

## Classes and Concepts

### `HashCache` Class

Purpose: Provides thread-safe caching of hash values to avoid redundant computation.

```cpp
template <typename T>
class HashCache {
private:
    std::shared_mutex mutex_;
    std::unordered_map<T, std::size_t> cache_;

public:
    std::optional<std::size_t> get(const T& key);
    void set(const T& key, std::size_t hash);
    void clear();
};
```

#### Methods

- `get(const T& key)`
  - Purpose: Retrieves a cached hash value if available
  - Parameters: `key` - The value whose hash is requested
  - Returns: `std::optional<std::size_t>` containing the hash value if found, empty optional otherwise
  - Thread Safety: Uses shared (read) lock for concurrent access

- `set(const T& key, std::size_t hash)`
  - Purpose: Stores a computed hash value in the cache
  - Parameters:
    - `key` - The value whose hash is being stored
    - `hash` - The computed hash value
  - Thread Safety: Uses exclusive (write) lock to prevent data races

- `clear()`
  - Purpose: Clears all cached values
  - Thread Safety: Uses exclusive (write) lock

### `Hashable` Concept

Purpose: Defines requirements for a type to be considered hashable.

```cpp
template <typename T>
concept Hashable = requires(T a) {
    { std::hash<T>{}(a) } -> std::convertible_to<std::size_t>;
};
```

A type satisfies `Hashable` if:

- It can be hashed using `std::hash<T>`
- The hash result is convertible to `std::size_t`

### `HashAlgorithm` Enumeration

Purpose: Defines the available hash algorithms.

```cpp
enum class HashAlgorithm {
    STD,       // Standard library hash
    FNV1A,     // FNV-1a algorithm
    XXHASH,    // xxHash algorithm
    CITYHASH,  // CityHash algorithm
    MURMUR3    // MurmurHash3 algorithm
};
```

## Core Functions

### `hashCombine` Function

Purpose: Combines multiple hash values into a single value.

```cpp
inline auto hashCombine(std::size_t seed, std::size_t hash) noexcept -> std::size_t;
```

- Parameters:
  - `seed` - Initial or accumulated hash value
  - `hash` - New hash value to combine with the seed
- Returns: Combined hash value
- Implementation: Uses SIMD instructions when available for better performance
- Note: If `ATOM_USE_BOOST` is defined, this redirects to `boost::hash_combine`

### `computeHash` Functions

#### For Basic Hashable Types

```cpp
template <Hashable T>
inline auto computeHash(const T& value,
                       HashAlgorithm algorithm = HashAlgorithm::STD) noexcept -> std::size_t;
```

- Purpose: Computes hash for a single value
- Parameters:
  - `value` - The value to hash
  - `algorithm` - Hash algorithm to use (defaults to standard library hash)
- Returns: Computed hash value
- Features: Uses thread-local caching for performance
- Thread Safety: Thread-safe due to thread-local storage

#### For Vectors (with Optional Parallelization)

```cpp
template <Hashable T>
inline auto computeHash(const std::vector<T>& values, bool parallel = false) noexcept -> std::size_t;
```

- Purpose: Computes hash for a vector of values
- Parameters:
  - `values` - Vector of values to hash
  - `parallel` - Whether to use parallel processing (default: false)
- Returns: Combined hash value for the entire vector
- Features:
  - Parallel processing for large vectors (1000+ elements)
  - Uses hardware concurrency to determine thread count
- Thread Safety: Thread-safe with appropriate synchronization for parallel mode

#### For Tuples

```cpp
template <Hashable... Ts>
inline auto computeHash(const std::tuple<Ts...>& tuple) noexcept -> std::size_t;
```

- Purpose: Computes hash for a tuple of values
- Parameters: `tuple` - Tuple of values to hash
- Returns: Combined hash value for the entire tuple
- Implementation: Uses `std::apply` to hash and combine all tuple elements

#### For Arrays

```cpp
template <Hashable T, std::size_t N>
inline auto computeHash(const std::array<T, N>& array) noexcept -> std::size_t;
```

- Purpose: Computes hash for a fixed-size array
- Parameters: `array` - Array of values to hash
- Returns: Combined hash value for the entire array

#### For Pairs

```cpp
template <Hashable T1, Hashable T2>
inline auto computeHash(const std::pair<T1, T2>& pair) noexcept -> std::size_t;
```

- Purpose: Computes hash for a pair of values
- Parameters: `pair` - Pair of values to hash
- Returns: Combined hash value for the pair

#### For Optional Values

```cpp
template <Hashable T>
inline auto computeHash(const std::optional<T>& opt) noexcept -> std::size_t;
```

- Purpose: Computes hash for an optional value
- Parameters: `opt` - Optional value to hash
- Returns: Hash of the contained value plus 1 (if present), or 0 (if empty)
- Note: The +1 ensures different hashes for `T` and `std::optional<T>`

#### For Variants

```cpp
template <Hashable... Ts>
inline auto computeHash(const std::variant<Ts...>& var) noexcept -> std::size_t;
```

- Purpose: Computes hash for a variant
- Parameters: `var` - Variant value to hash
- Returns: Hash of the currently active variant alternative
- Implementation: Uses `std::visit` (or `boost::apply_visitor` if Boost is enabled)

#### For Any Values

```cpp
inline auto computeHash(const std::any& value) noexcept -> std::size_t;
```

- Purpose: Computes hash for a `std::any` value
- Parameters: `value` - The std::any value to hash
- Returns: Hash of the type information (since actual value may not be hashable)
- Features: Uses thread-safe type caching

### String Hashing Functions

```cpp
constexpr auto hash(const char* str, std::size_t basis = 2166136261u) noexcept -> std::size_t;
```

- Purpose: Computes a hash for null-terminated strings using FNV-1a algorithm
- Parameters:
  - `str` - Pointer to null-terminated string
  - `basis` - Initial value for the hash (default: FNV offset basis)
- Returns: Hash value of the string
- Features: SIMD-optimized when AVX2 is available
- Implementation: Available both as a free function and within the namespace

### `verifyHash` Function

```cpp
inline auto verifyHash(std::size_t hash1, std::size_t hash2, std::size_t tolerance = 0) noexcept -> bool;
```

- Purpose: Verifies if two hash values match, with optional tolerance
- Parameters:
  - `hash1` - First hash value
  - `hash2` - Second hash value
  - `tolerance` - Maximum allowed difference for match (default: 0)
- Returns: `true` if hashes match within tolerance, `false` otherwise

### User-Defined Literal

```cpp
constexpr auto operator""_hash(const char* str, std::size_t size) noexcept -> std::size_t;
```

- Purpose: Allows computing hash values for string literals at compile time
- Usage: `"example"_hash`
- Parameters:
  - `str` - String literal
  - `size` - Length of the string (automatically provided by compiler)
- Returns: Hash value of the string literal
- Note: The size parameter is not used in the implementation

## Usage Examples

### Basic Usage

```cpp
#include "hash.hpp"
#include <iostream>
#include <string>

int main() {
    // Compute hash of a string using standard library hash
    std::string message = "Hello, World!";
    std::size_t hash_value = atom::algorithm::computeHash(message);
    
    std::cout << "Hash of \"" << message << "\": " << hash_value << std::endl;
    
    // Using string literal operator
    auto literal_hash = "Hello, World!"_hash;
    std::cout << "Hash via literal: " << literal_hash << std::endl;
    
    // Verify hashes match
    if (atom::algorithm::verifyHash(hash_value, literal_hash)) {
        std::cout << "Hashes match!" << std::endl;
    }
    
    return 0;
}

// Output:
// Hash of "Hello, World!": [some hash value]
// Hash via literal: [same hash value]
// Hashes match!
```

### Using Different Hash Algorithms

```cpp
#include "hash.hpp"
#include <iostream>
#include <string>

int main() {
    std::string data = "Test data for hashing";
    
    // Using standard library hash (default)
    std::size_t std_hash = atom::algorithm::computeHash(data);
    
    // Using FNV-1a algorithm
    std::size_t fnv_hash = atom::algorithm::computeHash(
        data, atom::algorithm::HashAlgorithm::FNV1A);
    
    std::cout << "Standard hash: " << std_hash << std::endl;
    std::cout << "FNV-1a hash: " << fnv_hash << std::endl;
    
    return 0;
}

// Output:
// Standard hash: [hash value 1]
// FNV-1a hash: [hash value 2]
```

### Hashing Containers with Parallel Processing

```cpp
#include "hash.hpp"
#include <iostream>
#include <vector>
#include <string>
#include <chrono>

int main() {
    // Create a large vector for demonstration
    std::vector<std::string> large_data;
    for (int i = 0; i < 100000; ++i) {
        large_data.push_back("Data item #" + std::to_string(i));
    }
    
    // Time sequential hashing
    auto start1 = std::chrono::high_resolution_clock::now();
    std::size_t seq_hash = atom::algorithm::computeHash(large_data, false);
    auto end1 = std::chrono::high_resolution_clock::now();
    auto duration1 = std::chrono::duration_cast<std::chrono::milliseconds>(end1 - start1);
    
    // Time parallel hashing
    auto start2 = std::chrono::high_resolution_clock::now();
    std::size_t par_hash = atom::algorithm::computeHash(large_data, true);
    auto end2 = std::chrono::high_resolution_clock::now();
    auto duration2 = std::chrono::duration_cast<std::chrono::milliseconds>(end2 - start2);
    
    std::cout << "Sequential hash: " << seq_hash << " (took " << duration1.count() << "ms)" << std::endl;
    std::cout << "Parallel hash: " << par_hash << " (took " << duration2.count() << "ms)" << std::endl;
    
    // Verify both approaches produce the same hash
    if (atom::algorithm::verifyHash(seq_hash, par_hash)) {
        std::cout << "Sequential and parallel hashes match!" << std::endl;
    }
    
    return 0;
}

// Example output:
// Sequential hash: 12345678 (took 150ms)
// Parallel hash: 12345678 (took 42ms)
// Sequential and parallel hashes match!
```

### Hashing Complex Types

```cpp
#include "hash.hpp"
#include <iostream>
#include <tuple>
#include <optional>
#include <variant>
#include <any>

int main() {
    // Hash a tuple
    auto tuple_value = std::make_tuple(42, "test", 3.14);
    std::size_t tuple_hash = atom::algorithm::computeHash(tuple_value);
    std::cout << "Tuple hash: " << tuple_hash << std::endl;
    
    // Hash an optional
    std::optional<int> opt_value = 42;
    std::optional<int> empty_opt;
    std::cout << "Optional with value hash: " << atom::algorithm::computeHash(opt_value) << std::endl;
    std::cout << "Empty optional hash: " << atom::algorithm::computeHash(empty_opt) << std::endl;
    
    // Hash a variant
    std::variant<int, std::string, double> var_value = "variant string";
    std::cout << "Variant hash: " << atom::algorithm::computeHash(var_value) << std::endl;
    
    // Hash an any value
    std::any any_value = 42;
    std::cout << "Any value hash: " << atom::algorithm::computeHash(any_value) << std::endl;
    
    return 0;
}

// Output:
// Tuple hash: [hash value]
// Optional with value hash: [hash value]
// Empty optional hash: 0
// Variant hash: [hash value]
// Any value hash: [hash value]
```

### Thread-Safe Hash Caching

```cpp
#include "hash.hpp"
#include <iostream>
#include <string>
#include <chrono>
#include <thread>
#include <vector>

void hash_compute_thread(const std::string& value, int iterations) {
    for (int i = 0; i < iterations; ++i) {
        // Hash computations are cached per-thread
        auto hash = atom::algorithm::computeHash(value);
        // Thread will use cached value after first computation
    }
}

int main() {
    std::string complex_data = "This is a complex string that would take time to hash";
    
    // First computation (not cached)
    auto start1 = std::chrono::high_resolution_clock::now();
    auto hash1 = atom::algorithm::computeHash(complex_data);
    auto end1 = std::chrono::high_resolution_clock::now();
    auto duration1 = std::chrono::duration_cast<std::chrono::nanoseconds>(end1 - start1);
    
    // Second computation (should use cache)
    auto start2 = std::chrono::high_resolution_clock::now();
    auto hash2 = atom::algorithm::computeHash(complex_data);
    auto end2 = std::chrono::high_resolution_clock::now();
    auto duration2 = std::chrono::duration_cast<std::chrono::nanoseconds>(end2 - start2);
    
    std::cout << "First computation: " << duration1.count() << " ns" << std::endl;
    std::cout << "Second computation: " << duration2.count() << " ns (cached)" << std::endl;
    
    // Demonstrate thread-local caching with multiple threads
    std::vector<std::thread> threads;
    for (int i = 0; i < 4; ++i) {
        threads.emplace_back(hash_compute_thread, complex_data, 1000);
    }
    
    for (auto& t : threads) {
        t.join();
    }
    
    std::cout << "Completed multi-threaded hash computations with thread-local caching" << std::endl;
    
    return 0;
}

// Example output:
// First computation: 1250 ns
// Second computation: 75 ns (cached)
// Completed multi-threaded hash computations with thread-local caching
```

## Comprehensive Example

The following example demonstrates multiple features of the library working together:

```cpp
#include "hash.hpp"
#include <iostream>
#include <string>
#include <vector>
#include <tuple>
#include <optional>
#include <variant>
#include <unordered_map>

// Custom struct that can be hashed
struct Person {
    std::string name;
    int age;
    
    // Required for the Hashable concept - define hash for Person
    friend std::size_t hash_value(const Person& p) {
        std::size_t seed = 0;
        seed = atom::algorithm::hashCombine(seed, atom::algorithm::computeHash(p.name));
        seed = atom::algorithm::hashCombine(seed, atom::algorithm::computeHash(p.age));
        return seed;
    }
    
    bool operator==(const Person& other) const {
        return name == other.name && age == other.age;
    }
};

// Make Person hashable via std::hash
namespace std {
    template<>
    struct hash<Person> {
        std::size_t operator()(const Person& p) const {
            return hash_value(p);
        }
    };
}

int main() {
    std::cout << "Enhanced Hash Library Demonstration\n";
    std::cout << "==================================\n\n";
    
    // 1. Basic string hashing with different algorithms
    std::string test_string = "This is a test string";
    std::cout << "Basic string hashing:\n";
    std::cout << "  Standard hash: " << atom::algorithm::computeHash(test_string) << "\n";
    std::cout << "  FNV1A hash: " << atom::algorithm::computeHash(
        test_string, atom::algorithm::HashAlgorithm::FNV1A) << "\n";
    std::cout << "  String literal: " << "This is a test string"_hash << "\n\n";
    
    // 2. Hashing containers
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    std::cout << "Container hashing:\n";
    std::cout << "  Vector hash: " << atom::algorithm::computeHash(numbers) << "\n";
    
    // 3. Hashing complex types
    auto tuple_data = std::make_tuple(42, "tuple element", 3.14);
    std::variant<int, std::string, double> variant_data = "variant string";
    std::optional<int> optional_data = 42;
    
    std::cout << "Complex type hashing:\n";
    std::cout << "  Tuple hash: " << atom::algorithm::computeHash(tuple_data) << "\n";
    std::cout << "  Variant hash: " << atom::algorithm::computeHash(variant_data) << "\n";
    std::cout << "  Optional hash: " << atom::algorithm::computeHash(optional_data) << "\n\n";
    
    // 4. Custom type hashing
    Person person1{"John Doe", 42};
    Person person2{"Jane Doe", 38};
    
    std::cout << "Custom type hashing:\n";
    std::cout << "  Person 1 hash: " << atom::algorithm::computeHash(person1) << "\n";
    std::cout << "  Person 2 hash: " << atom::algorithm::computeHash(person2) << "\n\n";
    
    // 5. Using the hash in a hash-based container
    std::unordered_map<Person, std::string> person_map;
    person_map[person1] = "Employee";
    person_map[person2] = "Manager";
    
    std::cout << "Hash-based container:\n";
    std::cout << "  " << person1.name << " is a " << person_map[person1] << "\n";
    std::cout << "  " << person2.name << " is a " << person_map[person2] << "\n\n";
    
    // 6. Demonstrate hash verification
    auto hash1 = atom::algorithm::computeHash(test_string);
    auto hash2 = "This is a test string"_hash;
    
    std::cout << "Hash verification:\n";
    std::cout << "  Exact match: " << (atom::algorithm::verifyHash(hash1, hash2) ? "Yes" : "No") << "\n";
    std::cout << "  With tolerance (1): " << (atom::algorithm::verifyHash(hash1, hash2+1, 1) ? "Yes" : "No") << "\n";
    std::cout << "  With tolerance (0): " << (atom::algorithm::verifyHash(hash1, hash2+1, 0) ? "Yes" : "No") << "\n\n";
    
    // 7. Parallel hashing of large vectors
    std::vector<std::string> large_vector;
    for (int i = 0; i < 10000; ++i) {
        large_vector.push_back("Item " + std::to_string(i));
    }
    
    std::cout << "Parallel hashing:\n";
    auto start1 = std::chrono::high_resolution_clock::now();
    auto large_hash1 = atom::algorithm::computeHash(large_vector, false); // Sequential
    auto end1 = std::chrono::high_resolution_clock::now();
    
    auto start2 = std::chrono::high_resolution_clock::now();
    auto large_hash2 = atom::algorithm::computeHash(large_vector, true);  // Parallel
    auto end2 = std::chrono::high_resolution_clock::now();
    
    auto seq_time = std::chrono::duration_cast<std::chrono::milliseconds>(end1 - start1).count();
    auto par_time = std::chrono::duration_cast<std::chrono::milliseconds>(end2 - start2).count();
    
    std::cout << "  Sequential: " << seq_time << "ms (hash: " << large_hash1 << ")\n";
    std::cout << "  Parallel: " << par_time << "ms (hash: " << large_hash2 << ")\n";
    std::cout << "  Speedup: " << (seq_time > 0 ? static_cast<double>(seq_time)/par_time : 0) << "x\n";
    std::cout << "  Hashes match: " << (atom::algorithm::verifyHash(large_hash1, large_hash2) ? "Yes" : "No") << "\n";
    
    return 0;
}
```

## Performance Considerations

1. SIMD Optimizations:
   - AVX2 and SSE2 instructions are used when available for significantly faster string hashing and hash combining operations.
   - The code automatically detects processor capabilities and selects the appropriate implementation.

2. Thread-Local Caching:
   - Each thread maintains its own hash cache, eliminating contention and improving performance for repeated hash calculations.
   - Caching is especially beneficial when hashing the same values multiple times.

3. Parallel Processing:
   - Large vectors (1000+ elements) can be hashed in parallel using multiple threads.
   - The number of threads is automatically determined based on hardware concurrency.
   - For small vectors, sequential processing is used to avoid the overhead of thread creation.

4. Memory Usage:
   - Thread-local caching can increase memory usage if many threads are created and many distinct values are hashed.
   - Consider clearing the caches periodically in long-running applications.

## Platform and Compiler Considerations

1. SIMD Support:
   - AVX2 optimizations require a processor and compiler that support AVX2 instructions.
   - If AVX2 is not available, the code falls back to SSE2 or standard implementations.
   - Define `__AVX2__` and `__SSE2__` appropriately for your platform.

2. Compiler Compatibility:
   - Requires C++20 support for concepts.
   - Tested with GCC 10+, Clang 10+, and MSVC 19.29+.
   - Older compilers may require modifications or feature disabling.

3. Boost Integration:
   - Define `ATOM_USE_BOOST` to enable Boost integration.
   - When enabled, `hashCombine` uses `boost::hash_combine` and variant handling uses `boost::apply_visitor`.

## Best Practices and Common Pitfalls

### Best Practices

1. Select the Right Hash Algorithm:
   - Standard hash: Good general-purpose choice, but implementation varies across platforms
   - FNV1a: Fast and simple, good for short strings and small data
   - Other specialized algorithms: Use when specific properties are needed

2. Use Parallel Hashing for Large Datasets:
   - Only enable parallel processing (`computeHash(container, true)`) for containers with 1000+ elements
   - For small containers, the thread creation overhead exceeds the benefits

3. Leverage Compile-Time Hashing:
   - Use the `_hash` literal operator for string literals that are known at compile time

4. Custom Types:
   - Implement `std::hash` specialization for custom types to make them work with the library

### Common Pitfalls

1. Hash Collision Awareness:
   - Remember that different values can produce the same hash. Always use hash equality as a hint, not proof of value equality
   - For cryptographic purposes, use dedicated cryptographic hash libraries instead

2. Performance Traps:
   - Avoid excessive hash cache clearing which negates the performance benefits
   - Beware of excessive memory usage with large thread-local caches in many threads

3. Thread Safety Issues:
   - While the hash functions themselves are thread-safe, modifying the input data during hashing can lead to race conditions

4. Determinism Across Platforms:
   - Standard hash implementations can vary across platforms and stdlib implementations
   - For consistent cross-platform hashing, use the specific algorithms rather than `HashAlgorithm::STD`

## Conclusion

The Enhanced Hash Algorithm Library provides a robust, efficient, and feature-rich solution for hashing in modern C++ applications. By combining thread safety, SIMD optimizations, parallel processing, and comprehensive type support, the library delivers performance while maintaining type safety and ease of use.

For most applications, the standard usage patterns demonstrated in the examples will provide the best balance of simplicity and performance. When performance is critical, leverage the SIMD optimizations, parallel processing, and caching features to maximize throughput.
