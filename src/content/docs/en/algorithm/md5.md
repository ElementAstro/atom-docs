---
title: MD5
description: Detailed for the MD5 class, including member functions, internal state variables, and example usage for calculating MD5 hashes of input data.
---

## Overview

The MD5 algorithm produces a 128-bit (16-byte) hash value, typically expressed as a 32-character hexadecimal string. While no longer recommended for security-critical applications due to known vulnerabilities, MD5 remains useful for:

- Data integrity checks
- Checksumming
- Non-security critical fingerprinting

## API Documentation

### Class `MD5`

The `MD5` class provides static methods for easy hashing as well as instance methods for more controlled processing.

#### Public Methods

##### Constructor

```cpp
MD5() noexcept;
```

- Description: Creates a new MD5 instance with initialized internal state.
- Return: An MD5 object ready for hashing operations.
- Exceptions: None - constructor is noexcept.

##### Static Methods

```cpp
template <StringLike T>
static auto encrypt(const T& input) -> std::string;
```

- Description: Computes the MD5 hash of any string-like input.
- Parameters:
  - `input`: Any type convertible to `std::string_view` (strings, string literals, etc.)
- Return: The MD5 hash as a 32-character hexadecimal string.
- Exceptions: `MD5Exception` if the input validation fails or an internal error occurs.
- Usage Example:

  ```cpp
  std::string hash = MD5::encrypt("Hello, world!");
  std::string hash2 = MD5::encrypt(std::string("Hello, world!"));
  ```

```cpp
static auto encryptBinary(std::span<const std::byte> data) -> std::string;
```

- Description: Computes the MD5 hash of binary data.
- Parameters:
  - `data`: A span of bytes representing the data to hash.
- Return: The MD5 hash as a 32-character hexadecimal string.
- Exceptions: `MD5Exception` if an error occurs during processing.
- Usage Example:

  ```cpp
  std::vector<std::byte> data = { /* binary data */ };
  std::string hash = MD5::encryptBinary(data);
  ```

```cpp
template <StringLike T>
static auto verify(const T& input, const std::string& hash) noexcept -> bool;
```

- Description: Verifies if a string's MD5 hash matches an expected hash value.
- Parameters:
  - `input`: Any string-like type to compute the hash for.
  - `hash`: The expected MD5 hash to compare against.
- Return: `true` if the computed hash matches the expected hash, `false` otherwise.
- Exceptions: None - method is noexcept and handles exceptions internally.
- Usage Example:

  ```cpp
  bool isValid = MD5::verify("Hello, world!", "6cd3556deb0da54bca060b4c39479839");
  ```

#### Private Methods

These methods provide the core functionality but are generally not called directly by users:

```cpp
void init() noexcept;
void update(std::span<const std::byte> input);
auto finalize() -> std::string;
void processBlock(std::span<const std::byte, 64> block) noexcept;
```

#### Helper Functions

The implementation includes optimized auxiliary functions used by the MD5 algorithm:

```cpp
static constexpr auto F(uint32_t x, uint32_t y, uint32_t z) noexcept -> uint32_t;
static constexpr auto G(uint32_t x, uint32_t y, uint32_t z) noexcept -> uint32_t;
static constexpr auto H(uint32_t x, uint32_t y, uint32_t z) noexcept -> uint32_t;
static constexpr auto I(uint32_t x, uint32_t y, uint32_t z) noexcept -> uint32_t;
static constexpr auto leftRotate(uint32_t x, uint32_t n) noexcept -> uint32_t;
```

## Performance Optimizations

This implementation includes several performance optimizations:

1. SIMD Acceleration: When compiled with AVX2 support (`__AVX2__` defined), the implementation uses vector instructions to process data more efficiently.

2. OpenMP Parallelization: When compiled with OpenMP support (`USE_OPENMP` defined), the implementation parallelizes certain computations across multiple threads.

3. Modern C++ Features:
   - Uses `std::span` for zero-copy memory views
   - Employs `std::byte` for type-safe byte manipulation
   - Utilizes `std::rotl` for optimized bit rotation (C++20)
   - Uses `std::byteswap` for efficient byte order conversion (C++20)

4. Memory Management:
   - Pre-allocation of buffers to minimize reallocations
   - Efficient processing of data in 64-byte blocks

## Error Handling

The implementation provides comprehensive error handling through the `MD5Exception` class:

```cpp
class MD5Exception : public std::runtime_error {
public:
    explicit MD5Exception(const std::string& message)
        : std::runtime_error(message) {}
};
```

Errors that may be reported include:

- Input validation failures
- Buffer size issues
- Counter overflow for extremely large inputs

## Complete Usage Example

Below is a comprehensive example demonstrating various ways to use the MD5 implementation:

```cpp
#include "md5.hpp"
#include <iostream>
#include <vector>
#include <string>
#include <iomanip>

int main() {
    using namespace atom::algorithm;
    
    try {
        // Example 1: Basic string hashing
        std::string input = "Hello, world!";
        std::string hash = MD5::encrypt(input);
        std::cout << "MD5 hash of '" << input << "': " << hash << std::endl;
        
        // Example 2: String literal hashing
        auto hash2 = MD5::encrypt("The quick brown fox jumps over the lazy dog");
        std::cout << "MD5 hash of fox sentence: " << hash2 << std::endl;
        
        // Example 3: Binary data hashing
        std::vector<std::byte> binary_data(1024);
        // Fill with some test data
        for (size_t i = 0; i < binary_data.size(); ++i) {
            binary_data[i] = static_cast<std::byte>(i & 0xFF);
        }
        auto binary_hash = MD5::encryptBinary(binary_data);
        std::cout << "MD5 hash of binary data: " << binary_hash << std::endl;
        
        // Example 4: Hash verification
        bool is_valid = MD5::verify(input, hash);
        std::cout << "Hash verification: " << (is_valid ? "Valid" : "Invalid") << std::endl;
        
        // Example 5: Empty string hashing
        std::string empty_hash = MD5::encrypt("");
        std::cout << "MD5 hash of empty string: " << empty_hash << std::endl;
        
        // Example 6: Manual multi-step hashing
        MD5 md5;
        md5.init();
        
        std::string part1 = "Part one of ";
        std::string part2 = "a multi-part message";
        
        md5.update(std::span<const std::byte>(
            reinterpret_cast<const std::byte*>(part1.data()), 
            part1.size()));
            
        md5.update(std::span<const std::byte>(
            reinterpret_cast<const std::byte*>(part2.data()), 
            part2.size()));
            
        std::string multi_part_hash = md5.finalize();
        std::cout << "Multi-part hash: " << multi_part_hash << std::endl;
        
        // Verify that multi-part hash equals single operation
        std::string combined = part1 + part2;
        std::string combined_hash = MD5::encrypt(combined);
        std::cout << "Combined hash: " << combined_hash << std::endl;
        std::cout << "Hashes match: " << (multi_part_hash == combined_hash ? "Yes" : "No") << std::endl;
        
    } catch (const MD5Exception& e) {
        std::cerr << "MD5 Error: " << e.what() << std::endl;
        return 1;
    } catch (const std::exception& e) {
        std::cerr << "Standard exception: " << e.what() << std::endl;
        return 2;
    }
    
    return 0;
}
```

## Performance Considerations

For optimal performance:

1. Compile with optimizations enabled: `-O2` or `-O3`
2. Enable SIMD support: Compile with `-mavx2` on supported platforms
3. Enable OpenMP: Compile with `-fopenmp` for multi-threaded execution
4. Large data: For very large data, use the incremental interface (`init`, `update`, `finalize`) instead of the one-shot `encrypt` method
5. Reuse instances: When hashing multiple pieces of data, consider reusing an `MD5` instance with `init`, `update`, and `finalize`

## Limitations

- MD5 is not secure for cryptographic purposes - use SHA-256 or better for security applications
- The implementation has a theoretical limit on input size (due to 64-bit counter)
- Performance is dependent on hardware support for SIMD and multi-threading
