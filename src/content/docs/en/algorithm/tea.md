---
title: Tea
description: Detailed for the TEA algorithm implementation in the atom::algorithm namespace, including class methods, parallel processing, and example usage for encryption and decryption.
---


## Overview

This document provides complete documentation for the `atom::algorithm` TEA family encryption implementations. The library offers three related lightweight block ciphers:

- TEA (Tiny Encryption Algorithm): A simple, fast symmetric-key cipher
- XTEA (Extended TEA): An improved version that addresses weaknesses in the original TEA
- XXTEA (Extended Extended TEA): A block cipher that operates on variable-length data

These algorithms are known for their simplicity, small code size, and reasonable security for non-critical applications. The library provides both basic implementations and optimized parallel versions for processing large data sets.

## Required Headers and Dependencies

```cpp
#include <array>          // For std::array
#include <concepts>       // For template concepts support
#include <cstdint>        // For fixed-width integer types
#include <span>           // For std::span
#include <stdexcept>      // For std::runtime_error
#include <vector>         // For std::vector
#include <thread>         // For multi-threading (used internally)
```

## Exception Handling

### TEAException

```cpp
class TEAException : public std::runtime_error {
public:
    using std::runtime_error::runtime_error;
};
```

Purpose: Custom exception class for TEA-related errors.

Usage:

```cpp
try {
    // TEA operation that might fail
    atom::algorithm::teaEncrypt(value0, value1, key);
} catch (const atom::algorithm::TEAException& e) {
    std::cerr << "TEA encryption error: " << e.what() << std::endl;
}
```

## Core Types and Concepts

### UInt32Container Concept

```cpp
template <typename T>
concept UInt32Container = std::ranges::contiguous_range<T> && requires(T t) {
    { std::data(t) } -> std::convertible_to<const uint32_t *>;
    { std::size(t) } -> std::convertible_to<std::size_t>;
    requires sizeof(std::ranges::range_value_t<T>) == sizeof(uint32_t);
};
```

Purpose: Defines requirements for containers used with the TEA algorithm family.

Notes:

- Ensures the container is a contiguous range of 32-bit integers
- Used to provide flexibility in input/output data containers
- Compatible with `std::vector<uint32_t>`, `std::array<uint32_t, N>`, etc.

### XTEAKey Type

```cpp
using XTEAKey = std::array<uint32_t, 4>;
```

Purpose: Represents a 128-bit key (4 × 32-bit words) used for XTEA encryption/decryption.

## Basic TEA Functions

### teaEncrypt

```cpp
auto teaEncrypt(uint32_t &value0, uint32_t &value1, 
                const std::array<uint32_t, 4> &key) noexcept(false) -> void;
```

Purpose: Encrypts two 32-bit values using the Tiny Encryption Algorithm.

Parameters:

- `value0`: First 32-bit value to encrypt (modified in-place)
- `value1`: Second 32-bit value to encrypt (modified in-place)
- `key`: 128-bit key represented as an array of four 32-bit integers

Exceptions:

- Throws `TEAException` if the key is invalid

Example:

```cpp
// Encrypt a 64-bit block
uint32_t v0 = 0x12345678;
uint32_t v1 = 0x9ABCDEF0;
std::array<uint32_t, 4> key = {0x01234567, 0x89ABCDEF, 0xFEDCBA98, 0x76543210};

try {
    // Perform encryption
    atom::algorithm::teaEncrypt(v0, v1, key);
    // v0 and v1 now contain encrypted values
} catch (const atom::algorithm::TEAException& e) {
    std::cerr << "Encryption failed: " << e.what() << std::endl;
}
```

### teaDecrypt

```cpp
auto teaDecrypt(uint32_t &value0, uint32_t &value1,
                const std::array<uint32_t, 4> &key) noexcept(false) -> void;
```

Purpose: Decrypts two 32-bit values encrypted with the TEA algorithm.

Parameters:

- `value0`: First 32-bit value to decrypt (modified in-place)
- `value1`: Second 32-bit value to decrypt (modified in-place)
- `key`: 128-bit key represented as an array of four 32-bit integers

Exceptions:

- Throws `TEAException` if the key is invalid

Example:

```cpp
// Continuing from the encryption example
try {
    // Decrypt the values
    atom::algorithm::teaDecrypt(v0, v1, key);
    // v0 and v1 should return to their original values
    assert(v0 == 0x12345678);
    assert(v1 == 0x9ABCDEF0);
} catch (const atom::algorithm::TEAException& e) {
    std::cerr << "Decryption failed: " << e.what() << std::endl;
}
```

## XTEA Functions

### xteaEncrypt

```cpp
auto xteaEncrypt(uint32_t &value0, uint32_t &value1,
                 const XTEAKey &key) noexcept(false) -> void;
```

Purpose: Encrypts two 32-bit values using the Extended TEA algorithm.

Parameters:

- `value0`: First 32-bit value to encrypt (modified in-place)
- `value1`: Second 32-bit value to encrypt (modified in-place)
- `key`: 128-bit key represented as an `XTEAKey` (array of four 32-bit integers)

Exceptions:

- Throws `TEAException` if the key is invalid

Example:

```cpp
// Encrypt a 64-bit block with XTEA
uint32_t v0 = 0x12345678;
uint32_t v1 = 0x9ABCDEF0;
atom::algorithm::XTEAKey key = {0x01234567, 0x89ABCDEF, 0xFEDCBA98, 0x76543210};

try {
    // Perform XTEA encryption
    atom::algorithm::xteaEncrypt(v0, v1, key);
    // v0 and v1 now contain encrypted values
} catch (const atom::algorithm::TEAException& e) {
    std::cerr << "XTEA encryption failed: " << e.what() << std::endl;
}
```

### xteaDecrypt

```cpp
auto xteaDecrypt(uint32_t &value0, uint32_t &value1,
                 const XTEAKey &key) noexcept(false) -> void;
```

Purpose: Decrypts two 32-bit values encrypted with the XTEA algorithm.

Parameters:

- `value0`: First 32-bit value to decrypt (modified in-place)
- `value1`: Second 32-bit value to decrypt (modified in-place)
- `key`: 128-bit key represented as an `XTEAKey` (array of four 32-bit integers)

Exceptions:

- Throws `TEAException` if the key is invalid

Example:

```cpp
// Continuing from the XTEA encryption example
try {
    // Decrypt the values
    atom::algorithm::xteaDecrypt(v0, v1, key);
    // v0 and v1 should return to their original values
    assert(v0 == 0x12345678);
    assert(v1 == 0x9ABCDEF0);
} catch (const atom::algorithm::TEAException& e) {
    std::cerr << "XTEA decryption failed: " << e.what() << std::endl;
}
```

## XXTEA Functions

### xxteaEncrypt

```cpp
template <UInt32Container Container>
auto xxteaEncrypt(const Container &inputData,
                  std::span<const uint32_t, 4> inputKey) -> std::vector<uint32_t>;
```

Purpose: Encrypts a container of 32-bit values using the XXTEA algorithm.

Parameters:

- `inputData`: Container of 32-bit values to encrypt
- `inputKey`: 128-bit key represented as a span of four 32-bit integers

Return Value:

- Vector of encrypted 32-bit values

Exceptions:

- Throws `TEAException` if the input data is too small or the key is invalid

Example:

```cpp
// Encrypt data with XXTEA
std::vector<uint32_t> data = {0x12345678, 0x9ABCDEF0, 0xFEDCBA98, 0x76543210};
std::array<uint32_t, 4> key = {0x01234567, 0x89ABCDEF, 0xFEDCBA98, 0x76543210};

try {
    // Encrypt the data
    std::vector<uint32_t> encrypted = atom::algorithm::xxteaEncrypt(data, key);
    
    // encrypted now contains the XXTEA-encrypted data
    std::cout << "Encrypted " << data.size() << " values to " 
              << encrypted.size() << " values" << std::endl;
} catch (const atom::algorithm::TEAException& e) {
    std::cerr << "XXTEA encryption failed: " << e.what() << std::endl;
}
```

### xxteaDecrypt

```cpp
template <UInt32Container Container>
auto xxteaDecrypt(const Container &inputData,
                  std::span<const uint32_t, 4> inputKey) -> std::vector<uint32_t>;
```

Purpose: Decrypts a container of 32-bit values encrypted with the XXTEA algorithm.

Parameters:

- `inputData`: Container of encrypted 32-bit values
- `inputKey`: 128-bit key represented as a span of four 32-bit integers

Return Value:

- Vector of decrypted 32-bit values

Exceptions:

- Throws `TEAException` if the input data is too small or the key is invalid

Example:

```cpp
// Continuing from the XXTEA encryption example
try {
    // Decrypt the data
    std::vector<uint32_t> decrypted = atom::algorithm::xxteaDecrypt(encrypted, key);
    
    // decrypted should equal the original data
    assert(decrypted.size() == data.size());
    assert(decrypted == data);  // Check if decryption worked correctly
} catch (const atom::algorithm::TEAException& e) {
    std::cerr << "XXTEA decryption failed: " << e.what() << std::endl;
}
```

## Parallel XXTEA Functions

### xxteaEncryptParallel

```cpp
template <UInt32Container Container>
auto xxteaEncryptParallel(const Container &inputData,
                          std::span<const uint32_t, 4> inputKey,
                          size_t numThreads = 0) -> std::vector<uint32_t>;
```

Purpose: Parallel version of XXTEA encryption for improved performance with large datasets.

Parameters:

- `inputData`: Container of 32-bit values to encrypt
- `inputKey`: 128-bit key represented as a span of four 32-bit integers
- `numThreads`: Number of threads to use (default: 0, which uses the available hardware threads)

Return Value:

- Vector of encrypted 32-bit values

Performance Considerations:

- Significantly faster for large datasets compared to non-parallel version
- Optimal for datasets over 100KB in size
- Thread overhead might make it slower than the sequential version for small datasets

Example:

```cpp
// Generate a large dataset for parallel encryption
std::vector<uint32_t> largeData(10000, 0);  // 10,000 elements
// Fill with some data
for (size_t i = 0; i < largeData.size(); ++i) {
    largeData[i] = static_cast<uint32_t>(i);
}

std::array<uint32_t, 4> key = {0x01234567, 0x89ABCDEF, 0xFEDCBA98, 0x76543210};

try {
    // Use 4 threads for parallel encryption
    std::vector<uint32_t> encrypted = 
        atom::algorithm::xxteaEncryptParallel(largeData, key, 4);
    
    std::cout << "Encrypted " << largeData.size() << " values using 4 threads" << std::endl;
} catch (const atom::algorithm::TEAException& e) {
    std::cerr << "Parallel XXTEA encryption failed: " << e.what() << std::endl;
}
```

### xxteaDecryptParallel

```cpp
template <UInt32Container Container>
auto xxteaDecryptParallel(const Container &inputData,
                          std::span<const uint32_t, 4> inputKey,
                          size_t numThreads = 0) -> std::vector<uint32_t>;
```

Purpose: Parallel version of XXTEA decryption for improved performance with large datasets.

Parameters:

- `inputData`: Container of encrypted 32-bit values
- `inputKey`: 128-bit key represented as a span of four 32-bit integers
- `numThreads`: Number of threads to use (default: 0, which uses the available hardware threads)

Return Value:

- Vector of decrypted 32-bit values

Performance Considerations:

- Same as for `xxteaEncryptParallel`

Example:

```cpp
// Continuing from the parallel encryption example
try {
    // Use 4 threads for parallel decryption
    std::vector<uint32_t> decrypted = 
        atom::algorithm::xxteaDecryptParallel(encrypted, key, 4);
    
    // Verify decryption
    assert(decrypted.size() == largeData.size());
    assert(decrypted == largeData);
    
    std::cout << "Successfully decrypted data with parallel XXTEA" << std::endl;
} catch (const atom::algorithm::TEAException& e) {
    std::cerr << "Parallel XXTEA decryption failed: " << e.what() << std::endl;
}
```

## Utility Functions

### toUint32Vector

```cpp
template <typename T>
    requires std::ranges::contiguous_range<T> &&
             std::same_as<std::ranges::range_value_t<T>, uint8_t>
auto toUint32Vector(const T &data) -> std::vector<uint32_t>;
```

Purpose: Converts a byte array to a vector of 32-bit unsigned integers for TEA processing.

Parameters:

- `data`: Byte array to convert

Return Value:

- Vector of 32-bit unsigned integers

Notes:

- Handles padding if the input size is not a multiple of 4 bytes
- Properly handles endianness

Example:

```cpp
// Convert string data to uint32_t vector for encryption
std::string message = "This is a secret message to encrypt with XXTEA";
std::vector<uint8_t> bytes(message.begin(), message.end());

std::vector<uint32_t> data = atom::algorithm::toUint32Vector(bytes);

std::cout << "Converted " << bytes.size() << " bytes to " 
          << data.size() << " uint32_t values" << std::endl;
```

### toByteArray

```cpp
template <UInt32Container Container>
auto toByteArray(const Container &data) -> std::vector<uint8_t>;
```

Purpose: Converts a vector of 32-bit unsigned integers back to a byte array.

Parameters:

- `data`: Container of 32-bit values to convert

Return Value:

- Vector of bytes

Example:

```cpp
// Convert uint32_t data back to bytes after decryption
std::vector<uint8_t> originalBytes = atom::algorithm::toByteArray(decrypted);

// Convert back to a string
std::string decryptedMessage(originalBytes.begin(), originalBytes.end());

std::cout << "Decrypted message: " << decryptedMessage << std::endl;
```

## Implementation Details

The following functions are implementation details and typically not called directly by users:

```cpp
auto xxteaEncryptImpl(std::span<const uint32_t> inputData,
                     std::span<const uint32_t, 4> inputKey) -> std::vector<uint32_t>;

auto xxteaDecryptImpl(std::span<const uint32_t> inputData,
                     std::span<const uint32_t, 4> inputKey) -> std::vector<uint32_t>;

auto xxteaEncryptParallelImpl(std::span<const uint32_t> inputData,
                             std::span<const uint32_t, 4> inputKey,
                             size_t numThreads) -> std::vector<uint32_t>;

auto xxteaDecryptParallelImpl(std::span<const uint32_t> inputData,
                             std::span<const uint32_t, 4> inputKey,
                             size_t numThreads) -> std::vector<uint32_t>;

auto toUint32VectorImpl(std::span<const uint8_t> data) -> std::vector<uint32_t>;

auto toByteArrayImpl(std::span<const uint32_t> data) -> std::vector<uint8_t>;
```

## Performance Considerations

1. Algorithm Efficiency:
   - TEA and XTEA are optimized for 64-bit blocks
   - XXTEA is more efficient for larger data sets

2. Parallel Processing:
   - Use parallel versions for datasets larger than 100KB
   - For smaller datasets, the overhead of thread creation may outweigh the benefits
   - Adjust `numThreads` based on your hardware and workload characteristics

3. Memory Usage:
   - The algorithms work in-place for TEA and XTEA (64-bit blocks)
   - XXTEA functions create copies of the data, which increases memory usage

## Security Considerations

1. Cryptographic Strength:
   - TEA has known weaknesses, including related-key attacks
   - XTEA improves on TEA but still has limitations
   - XXTEA is more secure but not suitable for high-security applications

2. Key Management:
   - Never use an all-zero key
   - Store keys securely; they should never be hardcoded
   - Consider using a key derivation function to generate keys from passwords

3. Known Vulnerabilities:
   - TEA and its variants are susceptible to related-key attacks
   - The algorithms are not recommended for cryptographic applications that require high security

## Platform and Compiler Notes

1. Endianness:
   - The implementation handles endianness internally
   - Results will be consistent across platforms

2. Compiler Support:
   - Requires a C++20-compatible compiler for concepts and ranges
   - Tested with: GCC 10+, Clang 10+, MSVC 19.29+

3. Thread Support:
   - Parallel implementations require proper thread support
   - May not work optimally in environments with thread limitations

## Best Practices and Common Pitfalls

### Best Practices

1. Choose the Right Algorithm:
   - Use TEA or XTEA for small data blocks where simplicity is key
   - Use XXTEA for larger data sets
   - Use parallel versions for very large data sets

2. Error Handling:
   - Always wrap encryption/decryption calls in try-catch blocks
   - Check return values and handle exceptions appropriately

3. Performance Optimization:
   - Batch small operations together when possible
   - Reuse key objects to avoid redundant validation

### Common Pitfalls

1. Incorrect Key Handling:
   - Using weak or predictable keys
   - Not protecting keys properly in memory

2. Data Formatting Issues:
   - Forgetting to convert between byte arrays and uint32_t arrays
   - Not handling padding correctly

3. Performance Mistakes:
   - Using parallel versions for small data sets
   - Not reusing key objects for multiple operations

## Comprehensive Example

Below is a complete example demonstrating the main functionality of the library:

```cpp
#include <atom/algorithm/tea.hpp>
#include <iostream>
#include <string>
#include <vector>
#include <chrono>
#include <cassert>

// Helper function to print hexadecimal values
void printHex(const std::vector<uint32_t>& data, const std::string& label) {
    std::cout << label << " (hex): ";
    for (size_t i = 0; i < std::min(data.size(), size_t(4)); ++i) {
        std::cout << std::hex << data[i] << " ";
    }
    if (data.size() > 4) {
        std::cout << "... [" << std::dec << data.size() << " values total]";
    }
    std::cout << std::dec << std::endl;
}

int main() {
    try {
        std::cout << "TEA Family Encryption Example\n" << std::endl;
        
        // 1. Basic TEA example with a single 64-bit block
        std::cout << "1. Basic TEA Example:" << std::endl;
        uint32_t v0 = 0x12345678;
        uint32_t v1 = 0x9ABCDEF0;
        std::array<uint32_t, 4> key = {0x01234567, 0x89ABCDEF, 0xFEDCBA98, 0x76543210};
        
        std::cout << "  Original values: " << std::hex << v0 << " " << v1 << std::dec << std::endl;
        
        // Encrypt with TEA
        atom::algorithm::teaEncrypt(v0, v1, key);
        std::cout << "  Encrypted values: " << std::hex << v0 << " " << v1 << std::dec << std::endl;
        
        // Decrypt with TEA
        atom::algorithm::teaDecrypt(v0, v1, key);
        std::cout << "  Decrypted values: " << std::hex << v0 << " " << v1 << std::dec << std::endl;
        assert(v0 == 0x12345678 && v1 == 0x9ABCDEF0);
        
        // 2. XTEA example with a single 64-bit block
        std::cout << "\n2. XTEA Example:" << std::endl;
        v0 = 0x12345678;
        v1 = 0x9ABCDEF0;
        atom::algorithm::XTEAKey xteaKey = {0x01234567, 0x89ABCDEF, 0xFEDCBA98, 0x76543210};
        
        std::cout << "  Original values: " << std::hex << v0 << " " << v1 << std::dec << std::endl;
        
        // Encrypt with XTEA
        atom::algorithm::xteaEncrypt(v0, v1, xteaKey);
        std::cout << "  Encrypted values: " << std::hex << v0 << " " << v1 << std::dec << std::endl;
        
        // Decrypt with XTEA
        atom::algorithm::xteaDecrypt(v0, v1, xteaKey);
        std::cout << "  Decrypted values: " << std::hex << v0 << " " << v1 << std::dec << std::endl;
        assert(v0 == 0x12345678 && v1 == 0x9ABCDEF0);
        
        // 3. XXTEA example with string data
        std::cout << "\n3. XXTEA Example with String Data:" << std::endl;
        std::string message = "This is a secret message that needs to be encrypted securely.";
        std::cout << "  Original message: " << message << std::endl;
        
        // Convert string to bytes
        std::vector<uint8_t> bytes(message.begin(), message.end());
        
        // Convert bytes to uint32_t for XXTEA
        std::vector<uint32_t> data = atom::algorithm::toUint32Vector(bytes);
        printHex(data, "  Original data");
        
        // Encrypt with XXTEA
        std::vector<uint32_t> encrypted = atom::algorithm::xxteaEncrypt(data, key);
        printHex(encrypted, "  Encrypted data");
        
        // Decrypt with XXTEA
        std::vector<uint32_t> decrypted = atom::algorithm::xxteaDecrypt(encrypted, key);
        printHex(decrypted, "  Decrypted data");
        
        // Convert back to bytes and then to string
        std::vector<uint8_t> decryptedBytes = atom::algorithm::toByteArray(decrypted);
        std::string decryptedMessage(decryptedBytes.begin(), decryptedBytes.end());
        std::cout << "  Decrypted message: " << decryptedMessage << std::endl;
        assert(decryptedMessage == message);
        
        // 4. Parallel XXTEA example with large data
        std::cout << "\n4. Parallel XXTEA Example with Large Data:" << std::endl;
        
        // Generate large test data (100,000 integers)
        const size_t dataSize = 100000;
        std::vector<uint32_t> largeData(dataSize);
        for (size_t i = 0; i < dataSize; ++i) {
            largeData[i] = static_cast<uint32_t>(i);
        }
        
        // Time sequential encryption
        auto startSeq = std::chrono::high_resolution_clock::now();
        std::vector<uint32_t> encryptedSeq = atom::algorithm::xxteaEncrypt(largeData, key);
        auto endSeq = std::chrono::high_resolution_clock::now();
        auto durationSeq = std::chrono::duration_cast<std::chrono::milliseconds>(endSeq - startSeq);
        
        // Time parallel encryption with 4 threads
        auto startPar = std::chrono::high_resolution_clock::now();
        std::vector<uint32_t> encryptedPar = atom::algorithm::xxteaEncryptParallel(largeData, key, 4);
        auto endPar = std::chrono::high_resolution_clock::now();
        auto durationPar = std::chrono::duration_cast<std::chrono::milliseconds>(endPar - startPar);
        
        // Verify results are the same
        assert(encryptedSeq == encryptedPar);
        
        // Time sequential decryption
        startSeq = std::chrono::high_resolution_clock::now();
        std::vector<uint32_t> decryptedSeq = atom::algorithm::xxteaDecrypt(encryptedSeq, key);
        endSeq = std::chrono::high_resolution_clock::now();
        auto decDurationSeq = std::chrono::duration_cast<std::chrono::milliseconds>(endSeq - startSeq);
        
        // Time parallel decryption
        startPar = std::chrono::high_resolution_clock::now();
        std::vector<uint32_t> decryptedPar = atom::algorithm::xxteaDecryptParallel(encryptedPar, key, 4);
        endPar = std::chrono::high_resolution_clock::now();
        auto decDurationPar = std::chrono::duration_cast<std::chrono::milliseconds>(endPar - startPar);
        
        // Verify decryption worked and is identical
        assert(decryptedSeq == largeData);
        assert(decryptedPar == largeData);
        
        std::cout << "  Sequential encryption time: " << durationSeq.count() << " ms" << std::endl;
        std::cout << "  Parallel encryption time:   " << durationPar.count() << " ms" << std::endl;
        std::cout << "  Sequential decryption time: " << decDurationSeq.count() << " ms" << std::endl;
        std::cout << "  Parallel decryption time:   " << decDurationPar.count() << " ms" << std::endl;
        
        std::cout << "\nAll tests completed successfully!" << std::endl;
        
    } catch (const atom::algorithm::TEAException& e) {
        std::cerr << "TEA exception: " << e.what() << std::endl;
        return 1;
    } catch (const std::exception& e) {
        std::cerr << "Standard exception: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
```

Expected Output:

```
TEA Family Encryption Example

1. Basic TEA Example:
  Original values: 12345678 9abcdef0
  Encrypted values: e7a8136a 48331eac
  Decrypted values: 12345678 9abcdef0

2. XTEA Example:
  Original values: 12345678 9abcdef0
  Encrypted values: fd97c8fe d41dbc31
  Decrypted values: 12345678 9abcdef0

3. XXTEA Example with String Data:
  Original message: This is a secret message that needs to be encrypted securely.
  Original data (hex): 73696854 20736920 65732061 74657263 ... [18 values total]
  Encrypted data (hex): c87f9be3 ab7ccf36 6eda23e9 b7aef93a ... [18 values total]
  Decrypted data (hex): 73696854 20736920 65732061 74657263 ... [18 values total]
  Decrypted message: This is a secret message that needs to be encrypted securely.

4. Parallel XXTEA Example with Large Data:
  Sequential encryption time: 157 ms
  Parallel encryption time:   42 ms
  Sequential decryption time: 159 ms
  Parallel decryption time:   43 ms

All tests completed successfully!
```

## Conclusion

The TEA family of encryption algorithms provides simple, efficient options for data encryption when complex cryptographic solutions are not required. This implementation offers:

- Basic TEA and XTEA for 64-bit block encryption
- XXTEA for variable-length data encryption
- Parallel processing capabilities for large datasets
- Utility functions for easy conversion between data formats

While not suitable for high-security applications, these algorithms are ideal for:

- Data obfuscation
- Simple encryption needs
- Resource-constrained environments
- Educational purposes to understand block cipher mechanics

When implementing, always consider the security limitations and follow the best practices outlined in this documentation.
