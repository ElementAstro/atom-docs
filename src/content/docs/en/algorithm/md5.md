---
title: MD5
description: Detailed for the MD5 class, including member functions, internal state variables, and example usage for calculating MD5 hashes of input data.
---

## Overview

This library provides a modern C++ implementation of the MD5 (Message Digest Algorithm 5) cryptographic hash function. While MD5 is no longer considered secure for cryptographic purposes, it remains useful for checksums, data integrity checks, and non-security-critical applications.

The implementation offers a clean API for generating MD5 hashes from various string types and binary data, as well as verifying if a given string matches a specific MD5 hash. It leverages C++20 features including concepts, std::span, and other modern C++ paradigms.

## Key Features

- Template-based string handling - Works with various string types through concepts
- Binary data support - Hash arbitrary binary data
- Hash verification - Built-in functionality to verify strings against hashes
- Exception handling - Custom exceptions for error reporting
- Modern C++ design - Uses C++20 features for improved safety and flexibility

## Classes and Interfaces

### `MD5Exception`

A custom exception class for reporting MD5-specific errors.

```cpp
class MD5Exception : public std::runtime_error {
public:
    explicit MD5Exception(const std::string& message)
        : std::runtime_error(message) {}
};
```

Parameters:

- `message`: Description of the error that occurred

### `StringLike` Concept

A concept that constrains template parameters to string-like types.

```cpp
template <typename StrType>
concept StringLike = std::convertible_to<StrType, std::string_view>;
```

### `MD5` Class

The main class implementing the MD5 algorithm.

#### Public Methods

##### `MD5()`

Default constructor that initializes the MD5 context.

Throws: Nothing

##### `encrypt<StringLike StrType>(const StrType& input) -> std::string`

Static method that computes the MD5 hash of a string-like input.

Parameters:

- `input`: String data to be hashed

Returns:

- A string representation of the MD5 hash (32 hexadecimal characters)

Throws:

- `MD5Exception`: If input validation fails or an internal error occurs

##### `encryptBinary(std::span<const std::byte> data) -> std::string`

Static method that computes the MD5 hash of binary data.

Parameters:

- `data`: Binary data to be hashed as a span of bytes

Returns:

- A string representation of the MD5 hash (32 hexadecimal characters)

Throws:

- `MD5Exception`: If input validation fails or an internal error occurs

##### `verify<StringLike StrType>(const StrType& input, const std::string& hash) -> bool`

Static method that verifies if a string's MD5 hash matches an expected hash.

Parameters:

- `input`: String data to check
- `hash`: Expected MD5 hash to compare against

Returns:

- `true` if the computed hash matches the expected hash, `false` otherwise

Throws: Nothing (returns `false` on any internal exceptions)

#### Private Methods

##### `init() noexcept`

Initializes the MD5 context with standard initial values.

##### `update(std::span<const std::byte> input)`

Updates the MD5 context with input data.

Parameters:

- `input`: Data to incorporate into the hash

Throws:

- `MD5Exception`: If processing fails

##### `finalize() -> std::string`

Finalizes the MD5 hash computation and returns the result.

Returns:

- The final MD5 hash as a string

Throws:

- `MD5Exception`: If finalization fails

##### `processBlock(std::span<const std::byte, 64> block) noexcept`

Processes a 512-bit block of the input according to the MD5 algorithm.

Parameters:

- `block`: A 64-byte block of data to process

##### Helper Functions

```cpp
static constexpr auto F(uint32_t x, uint32_t y, uint32_t z) noexcept -> uint32_t;
static constexpr auto G(uint32_t x, uint32_t y, uint32_t z) noexcept -> uint32_t;
static constexpr auto H(uint32_t x, uint32_t y, uint32_t z) noexcept -> uint32_t;
static constexpr auto I(uint32_t x, uint32_t y, uint32_t z) noexcept -> uint32_t;
static constexpr auto leftRotate(uint32_t x, uint32_t n) noexcept -> uint32_t;
```

These auxiliary functions implement the core transformations of the MD5 algorithm.

## Usage Examples

### Basic String Hashing

```cpp
#include "md5.hpp"
#include <iostream>

int main() {
    try {
        // Hash a string
        std::string input = "Hello, World!";
        std::string hash = atom::algorithm::MD5::encrypt(input);
        
        std::cout << "Input: " << input << std::endl;
        std::cout << "MD5 Hash: " << hash << std::endl;
        // Expected output: 65a8e27d8879283831b664bd8b7f0ad4
        
        return 0;
    } catch (const atom::algorithm::MD5Exception& e) {
        std::cerr << "MD5 Error: " << e.what() << std::endl;
        return 1;
    }
}
```

### Working with Different String Types

```cpp
#include "md5.hpp"
#include <iostream>
#include <string_view>

int main() {
    try {
        // Using std::string
        std::string str = "Test string";
        std::string hash1 = atom::algorithm::MD5::encrypt(str);
        
        // Using string literal
        std::string hash2 = atom::algorithm::MD5::encrypt("Test string");
        
        // Using string_view
        std::string_view sv = "Test string";
        std::string hash3 = atom::algorithm::MD5::encrypt(sv);
        
        std::cout << "Hash from std::string: " << hash1 << std::endl;
        std::cout << "Hash from string literal: " << hash2 << std::endl;
        std::cout << "Hash from string_view: " << hash3 << std::endl;
        
        // All should output: 6f8db599de986fab7a21625b7916589c
        
        return 0;
    } catch (const atom::algorithm::MD5Exception& e) {
        std::cerr << "MD5 Error: " << e.what() << std::endl;
        return 1;
    }
}
```

### Hashing Binary Data

```cpp
#include "md5.hpp"
#include <iostream>
#include <vector>

int main() {
    try {
        // Create some binary data
        std::vector<std::byte> binary_data;
        for (int i = 0; i < 10; ++i) {
            binary_data.push_back(static_cast<std::byte>(i));
        }
        
        // Hash the binary data
        std::string hash = atom::algorithm::MD5::encryptBinary(binary_data);
        
        std::cout << "Binary data MD5 hash: " << hash << std::endl;
        // Expected output: 70ece3f177978c456e6fb7a0c7bac9e5
        
        return 0;
    } catch (const atom::algorithm::MD5Exception& e) {
        std::cerr << "MD5 Error: " << e.what() << std::endl;
        return 1;
    }
}
```

### Hash Verification

```cpp
#include "md5.hpp"
#include <iostream>

int main() {
    // String to verify
    std::string data = "Verify this data";
    
    // Known correct hash for the data
    std::string correct_hash = "ea7f1d02c5835ee1a34d73ffa56a3689";
    
    // Incorrect hash for comparison
    std::string incorrect_hash = "abcdef0123456789abcdef0123456789";
    
    // Verify against correct hash
    bool is_valid = atom::algorithm::MD5::verify(data, correct_hash);
    std::cout << "Verification against correct hash: " 
              << (is_valid ? "Passed" : "Failed") << std::endl;
    // Expected output: Verification against correct hash: Passed
    
    // Verify against incorrect hash
    is_valid = atom::algorithm::MD5::verify(data, incorrect_hash);
    std::cout << "Verification against incorrect hash: "
              << (is_valid ? "Passed" : "Failed") << std::endl;
    // Expected output: Verification against incorrect hash: Failed
    
    return 0;
}
```

### Handling Empty Input

```cpp
#include "md5.hpp"
#include <iostream>

int main() {
    try {
        // Hash an empty string
        std::string empty_string = "";
        std::string hash = atom::algorithm::MD5::encrypt(empty_string);
        
        std::cout << "MD5 hash of empty string: " << hash << std::endl;
        // Expected output: d41d8cd98f00b204e9800998ecf8427e
        
        return 0;
    } catch (const atom::algorithm::MD5Exception& e) {
        std::cerr << "MD5 Error: " << e.what() << std::endl;
        return 1;
    }
}
```

## Performance Considerations

1. Memory Usage: The implementation maintains a minimized memory footprint by processing data in chunks.

2. Exception Safety: The implementation provides strong exception guarantees. Public methods either succeed or throw an exception, leaving the object in a consistent state.

3. Large Data Handling: The algorithm is designed to handle large inputs efficiently by processing data in 64-byte blocks.

4. Move Semantics: The implementation takes advantage of modern C++ move semantics where appropriate to minimize unnecessary copying.

## Limitations and Security Considerations

Important Security Note: MD5 is not considered cryptographically secure. It has known vulnerabilities, including:

1. Collision vulnerability: It's computationally feasible to find different inputs that produce the same MD5 hash.

2. Preimage resistance weaknesses: While harder than finding collisions, there are attacks that weaken MD5's resistance to preimage attacks.

Recommended Use Cases:

- Checksums for non-security critical data integrity
- Legacy system compatibility
- Teaching/learning purposes

Not Recommended For:

- Password storage
- Digital signatures
- Security-critical applications

For security-critical applications, consider using more secure alternatives like SHA-256, SHA-3, or BLAKE2.

## Required Headers and Dependencies

This implementation depends only on the C++ Standard Library:

```cpp
#include <array>        // For fixed-size arrays
#include <concepts>     // For template constraints
#include <cstdint>      // For fixed-width integer types
#include <span>         // For views over contiguous sequences
#include <stdexcept>    // For exception handling
#include <string>       // For string handling
#include <string_view>  // For non-owning string references
#include <vector>       // For dynamic arrays
```

## Platform and Compiler Compatibility

- Requires a C++20 compatible compiler for concepts and std::span
- Tested compilers:
  - GCC 10.0+
  - Clang 10.0+
  - MSVC 19.28+ (Visual Studio 2019 16.8+)

## Best Practices

1. Error Handling: Always wrap MD5 operations in try-catch blocks to handle potential exceptions.

2. Input Validation: Validate input data before passing it to the MD5 functions, especially when dealing with user input.

3. Constants and Reuse: If you're verifying the same hash multiple times, store the hash as a constant rather than recomputing it.

4. Security: Remember that MD5 is not secure against determined attackers - use it only for non-security-critical purposes.

## Common Pitfalls

1. Forgetting to Handle Exceptions: The library can throw exceptions. Always implement proper exception handling.

2. Security Misconceptions: Don't use this implementation for security-critical applications where a cryptographically secure hash is required.

3. Expecting Binary Determinism Across Platforms: While MD5 always produces the same output for the same input, string encoding issues might cause unexpected results when working with text data across different platforms.

4. Performance Assumptions: For very small inputs, the MD5 computation overhead might be noticeable - don't use it in hot loops for tiny strings where performance is critical.

## Comprehensive Example

Here's a complete example demonstrating most features of the MD5 implementation:

```cpp
#include "md5.hpp"
#include <iostream>
#include <fstream>
#include <vector>
#include <iomanip>

// Utility function to read a file as binary data
std::vector<std::byte> readFile(const std::string& filename) {
    std::ifstream file(filename, std::ios::binary | std::ios::ate);
    if (!file.is_open()) {
        throw std::runtime_error("Could not open file: " + filename);
    }
    
    auto size = file.tellg();
    std::vector<std::byte> buffer(size);
    
    file.seekg(0);
    file.read(reinterpret_cast<char*>(buffer.data()), size);
    
    return buffer;
}

// Utility function to print a hash with a label
void printHash(const std::string& label, const std::string& hash) {
    std::cout << std::setw(20) << std::left << label << ": " << hash << std::endl;
}

int main() {
    try {
        std::cout << "MD5 Hash Demonstration\n";
        std::cout << "======================\n\n";
        
        // 1. Simple string hashing
        std::string test1 = "The quick brown fox jumps over the lazy dog";
        auto hash1 = atom::algorithm::MD5::encrypt(test1);
        printHash("Simple string", hash1);
        // Expected: 9e107d9d372bb6826bd81d3542a419d6
        
        // 2. Empty string
        auto hash2 = atom::algorithm::MD5::encrypt("");
        printHash("Empty string", hash2);
        // Expected: d41d8cd98f00b204e9800998ecf8427e
        
        // 3. String with special characters
        std::string test3 = "🔒 Special chars & UTF-8 test! 👍";
        auto hash3 = atom::algorithm::MD5::encrypt(test3);
        printHash("Special chars", hash3);
        
        // 4. Binary data (creating an array of bytes)
        std::vector<std::byte> binary_data;
        for (int i = 0; i < 256; ++i) {
            binary_data.push_back(static_cast<std::byte>(i % 256));
        }
        auto hash4 = atom::algorithm::MD5::encryptBinary(binary_data);
        printHash("Binary data", hash4);
        
        // 5. Verification (positive case)
        bool verified = atom::algorithm::MD5::verify(test1, hash1);
        std::cout << "\nVerification (correct): " 
                  << (verified ? "PASSED" : "FAILED") << std::endl;
        
        // 6. Verification (negative case)
        verified = atom::algorithm::MD5::verify(test1, hash2);
        std::cout << "Verification (incorrect): " 
                  << (verified ? "PASSED" : "FAILED") << std::endl;
        
        // 7. Try to hash from file (if exists)
        try {
            auto file_data = readFile("test_file.txt");
            auto hash5 = atom::algorithm::MD5::encryptBinary(file_data);
            printHash("\nFile hash", hash5);
        } catch (const std::exception& e) {
            std::cout << "\nFile example skipped: " << e.what() << std::endl;
        }
        
        // 8. Performance demo - hash a large string
        std::string large_string(1000000, 'A'); // 1 million 'A's
        std::cout << "\nHashing 1MB of data... ";
        auto start = std::chrono::high_resolution_clock::now();
        auto hash6 = atom::algorithm::MD5::encrypt(large_string);
        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
        std::cout << "done in " << duration.count() << "ms" << std::endl;
        printHash("1MB data hash", hash6);
        
        return 0;
    } catch (const atom::algorithm::MD5Exception& e) {
        std::cerr << "MD5 Error: " << e.what() << std::endl;
        return 1;
    } catch (const std::exception& e) {
        std::cerr << "General Error: " << e.what() << std::endl;
        return 2;
    }
}
```

## Conclusion

This MD5 implementation provides a modern, type-safe, and easy-to-use interface for generating MD5 hashes in C++. While MD5 is no longer recommended for security-critical applications, it remains useful for checksums, data integrity verification, and compatibility with legacy systems.

The implementation takes advantage of modern C++ features like concepts, spans, and exception handling to provide a robust and flexible API. It offers both high-level convenience methods for common use cases and lower-level access for more specialized needs.

Remember to consider the security implications when choosing a hash algorithm, and select an appropriate alternative like SHA-256 when security is a priority.
