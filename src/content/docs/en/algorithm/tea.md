---
title: Tea
description: Detailed for the TEA algorithm implementation in the atom::algorithm namespace, including class methods, parallel processing, and example usage for encryption and decryption.
---

## Introduction

The Atom Algorithm TEA Library provides implementations of the TEA family of encryption algorithms - TEA (Tiny Encryption Algorithm), XTEA (Extended TEA), and XXTEA (Corrected Block TEA). These algorithms are lightweight symmetric block ciphers that offer a good balance between security and performance.

This library includes:

- Basic TEA algorithm for 64-bit block encryption with 128-bit keys
- XTEA algorithm which addresses weaknesses in the original TEA
- XXTEA algorithm for encrypting variable-length data
- Parallel processing capabilities for improved performance on large datasets
- Utility functions for data conversion between bytes and 32-bit integers

## Core Components

### TEAException

A custom exception class for TEA-related errors that inherits from `std::runtime_error`.

```cpp
class TEAException : public std::runtime_error {
    // Uses constructor from std::runtime_error
};
```

### UInt32Container Concept

A concept that checks if a type is a container of 32-bit unsigned integers.

```cpp
template <typename T>
concept UInt32Container = std::ranges::contiguous_range<T> && requires(T t) {
    { std::data(t) } -> std::convertible_to<const uint32_t *>;
    { std::size(t) } -> std::convertible_to<std::size_t>;
    requires sizeof(std::ranges::range_value_t<T>) == sizeof(uint32_t);
};
```

### XTEAKey Type

A type alias for a 128-bit key represented as an array of four 32-bit integers.

```cpp
using XTEAKey = std::array<uint32_t, 4>;
```

## API Reference

### TEA Functions

#### teaEncrypt

```cpp
auto teaEncrypt(uint32_t &value0, uint32_t &value1, 
                const std::array<uint32_t, 4> &key) noexcept(false) -> void;
```

- Description: Encrypts two 32-bit values using the TEA algorithm
- Parameters:
  - `value0` - The first 32-bit value to be encrypted (modified in place)
  - `value1` - The second 32-bit value to be encrypted (modified in place)
  - `key` - A 128-bit key represented as an array of four 32-bit integers
- Exceptions: Throws `TEAException` if the key is invalid

#### teaDecrypt

```cpp
auto teaDecrypt(uint32_t &value0, uint32_t &value1,
                const std::array<uint32_t, 4> &key) noexcept(false) -> void;
```

- Description: Decrypts two 32-bit values using the TEA algorithm
- Parameters:
  - `value0` - The first 32-bit value to be decrypted (modified in place)
  - `value1` - The second 32-bit value to be decrypted (modified in place)
  - `key` - A 128-bit key represented as an array of four 32-bit integers
- Exceptions: Throws `TEAException` if the key is invalid

### XTEA Functions

#### xteaEncrypt

```cpp
auto xteaEncrypt(uint32_t &value0, uint32_t &value1,
                 const XTEAKey &key) noexcept(false) -> void;
```

- Description: Encrypts two 32-bit values using the XTEA algorithm
- Parameters:
  - `value0` - The first 32-bit value to be encrypted (modified in place)
  - `value1` - The second 32-bit value to be encrypted (modified in place)
  - `key` - A 128-bit key of type `XTEAKey`
- Exceptions: Throws `TEAException` if the key is invalid

#### xteaDecrypt

```cpp
auto xteaDecrypt(uint32_t &value0, uint32_t &value1,
                 const XTEAKey &key) noexcept(false) -> void;
```

- Description: Decrypts two 32-bit values using the XTEA algorithm
- Parameters:
  - `value0` - The first 32-bit value to be decrypted (modified in place)
  - `value1` - The second 32-bit value to be decrypted (modified in place)
  - `key` - A 128-bit key of type `XTEAKey`
- Exceptions: Throws `TEAException` if the key is invalid

### XXTEA Functions

#### xxteaEncrypt

```cpp
template <UInt32Container Container>
auto xxteaEncrypt(const Container &inputData,
                  std::span<const uint32_t, 4> inputKey) -> std::vector<uint32_t>;
```

- Description: Encrypts a container of 32-bit values using the XXTEA algorithm
- Parameters:
  - `inputData` - The container of 32-bit values to be encrypted
  - `inputKey` - A span of four 32-bit unsigned integers representing the 128-bit key
- Returns: A vector of encrypted 32-bit values
- Exceptions: Throws `TEAException` if the input data is too small or the key is invalid

#### xxteaDecrypt

```cpp
template <UInt32Container Container>
auto xxteaDecrypt(const Container &inputData,
                  std::span<const uint32_t, 4> inputKey) -> std::vector<uint32_t>;
```

- Description: Decrypts a container of 32-bit values using the XXTEA algorithm
- Parameters:
  - `inputData` - The container of 32-bit values to be decrypted
  - `inputKey` - A span of four 32-bit unsigned integers representing the 128-bit key
- Returns: A vector of decrypted 32-bit values
- Exceptions: Throws `TEAException` if the input data is too small or the key is invalid

### Parallel Processing Functions

#### xxteaEncryptParallel

```cpp
template <UInt32Container Container>
auto xxteaEncryptParallel(const Container &inputData,
                          std::span<const uint32_t, 4> inputKey,
                          size_t numThreads = 0) -> std::vector<uint32_t>;
```

- Description: Parallel version of XXTEA encryption for large data sets
- Parameters:
  - `inputData` - The container of 32-bit values to be encrypted
  - `inputKey` - A span of four 32-bit unsigned integers representing the 128-bit key
  - `numThreads` - The number of threads to use (0 means use available hardware threads)
- Returns: A vector of encrypted 32-bit values
- Notes: This function can significantly improve performance for large datasets

#### xxteaDecryptParallel

```cpp
template <UInt32Container Container>
auto xxteaDecryptParallel(const Container &inputData,
                          std::span<const uint32_t, 4> inputKey,
                          size_t numThreads = 0) -> std::vector<uint32_t>;
```

- Description: Parallel version of XXTEA decryption for large data sets
- Parameters:
  - `inputData` - The container of 32-bit values to be decrypted
  - `inputKey` - A span of four 32-bit unsigned integers representing the 128-bit key
  - `numThreads` - The number of threads to use (0 means use available hardware threads)
- Returns: A vector of decrypted 32-bit values
- Notes: This function can significantly improve performance for large datasets

### Utility Functions

#### toUint32Vector

```cpp
template <typename T>
    requires std::ranges::contiguous_range<T> &&
                 std::same_as<std::ranges::range_value_t<T>, uint8_t>
auto toUint32Vector(const T &data) -> std::vector<uint32_t>;
```

- Description: Converts a byte array to a vector of 32-bit unsigned integers
- Parameters:
  - `data` - The byte array to be converted
- Returns: A vector of 32-bit unsigned integers
- Notes: Used to prepare byte data for encryption or decryption with the XXTEA algorithm

#### toByteArray

```cpp
template <UInt32Container Container>
auto toByteArray(const Container &data) -> std::vector<uint8_t>;
```

- Description: Converts a vector of 32-bit unsigned integers back to a byte array
- Parameters:
  - `data` - The vector of 32-bit unsigned integers to be converted
- Returns: A byte array
- Notes: Used to convert the result of XXTEA encryption/decryption back into a byte array

## Complete Usage Example

Here's a comprehensive example demonstrating how to use the different features of the Atom Algorithm TEA Library:

```cpp
#include <algorithm/tea.hpp>
#include <iostream>
#include <iomanip>
#include <vector>
#include <string>

using namespace atom::algorithm;

// Helper function to print byte vectors as hex
void printHex(const std::vector<uint8_t>& data, const std::string& label) {
    std::cout << label << ": ";
    for (const auto& byte : data) {
        std::cout << std::hex << std::setw(2) << std::setfill('0') 
                  << static_cast<int>(byte) << " ";
    }
    std::cout << std::dec << std::endl;
}

// Helper function to print uint32_t vectors
void printUint32(const std::vector<uint32_t>& data, const std::string& label) {
    std::cout << label << ": ";
    for (const auto& value : data) {
        std::cout << value << " ";
    }
    std::cout << std::endl;
}

int main() {
    try {
        // Example 1: Basic TEA encryption and decryption
        std::cout << "=== Example 1: Basic TEA ===" << std::endl;
        uint32_t v0 = 0x12345678;
        uint32_t v1 = 0x9ABCDEF0;
        std::array<uint32_t, 4> key = {0x01234567, 0x89ABCDEF, 0xFEDCBA98, 0x76543210};
        
        std::cout << "Original values: " << std::hex << v0 << ", " << v1 << std::dec << std::endl;
        
        // Encrypt
        teaEncrypt(v0, v1, key);
        std::cout << "Encrypted values: " << std::hex << v0 << ", " << v1 << std::dec << std::endl;
        
        // Decrypt
        teaDecrypt(v0, v1, key);
        std::cout << "Decrypted values: " << std::hex << v0 << ", " << v1 << std::dec << std::endl;
        
        // Example 2: XTEA encryption and decryption
        std::cout << "\n=== Example 2: XTEA ===" << std::endl;
        v0 = 0x12345678;
        v1 = 0x9ABCDEF0;
        XTEAKey xteaKey = {0x01234567, 0x89ABCDEF, 0xFEDCBA98, 0x76543210};
        
        std::cout << "Original values: " << std::hex << v0 << ", " << v1 << std::dec << std::endl;
        
        // Encrypt
        xteaEncrypt(v0, v1, xteaKey);
        std::cout << "Encrypted values: " << std::hex << v0 << ", " << v1 << std::dec << std::endl;
        
        // Decrypt
        xteaDecrypt(v0, v1, xteaKey);
        std::cout << "Decrypted values: " << std::hex << v0 << ", " << v1 << std::dec << std::endl;
        
        // Example 3: XXTEA for larger data
        std::cout << "\n=== Example 3: XXTEA ===" << std::endl;
        std::vector<uint32_t> data = {0x01234567, 0x89ABCDEF, 0xFEDCBA98, 0x76543210, 
                                      0x11223344, 0x55667788, 0x99AABBCC, 0xDDEEFF00};
        
        printUint32(data, "Original data");
        
        // Encrypt
        auto encryptedData = xxteaEncrypt(data, std::span<const uint32_t, 4>(key));
        printUint32(encryptedData, "Encrypted data");
        
        // Decrypt
        auto decryptedData = xxteaDecrypt(encryptedData, std::span<const uint32_t, 4>(key));
        printUint32(decryptedData, "Decrypted data");
        
        // Example 4: Using parallel processing for large datasets
        std::cout << "\n=== Example 4: Parallel XXTEA ===" << std::endl;
        std::vector<uint32_t> largeData(1000, 0x12345678);
        
        std::cout << "Encrypting large dataset with " << largeData.size() << " elements..." << std::endl;
        
        // Using 4 threads for encryption
        auto encryptedLargeData = xxteaEncryptParallel(largeData, std::span<const uint32_t, 4>(key), 4);
        std::cout << "Encryption complete. Result size: " << encryptedLargeData.size() << std::endl;
        
        // Using 4 threads for decryption
        auto decryptedLargeData = xxteaDecryptParallel(encryptedLargeData, std::span<const uint32_t, 4>(key), 4);
        std::cout << "Decryption complete. Result size: " << decryptedLargeData.size() << std::endl;
        
        // Verify the decryption was successful
        bool success = (largeData == decryptedLargeData);
        std::cout << "Decryption " << (success ? "successful" : "failed") << std::endl;
        
        // Example 5: Converting between bytes and uint32_t
        std::cout << "\n=== Example 5: Data Conversion ===" << std::endl;
        std::vector<uint8_t> byteData = {
            0x01, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF,
            0xFE, 0xDC, 0xBA, 0x98, 0x76, 0x54, 0x32, 0x10
        };
        
        printHex(byteData, "Original byte data");
        
        // Convert to uint32_t for XXTEA
        auto uint32Data = toUint32Vector(byteData);
        printUint32(uint32Data, "Converted to uint32_t");
        
        // Encrypt
        auto encryptedUint32 = xxteaEncrypt(uint32Data, std::span<const uint32_t, 4>(key));
        printUint32(encryptedUint32, "Encrypted uint32_t data");
        
        // Convert back to bytes
        auto encryptedBytes = toByteArray(encryptedUint32);
        printHex(encryptedBytes, "Encrypted byte data");
        
        // Decrypt
        auto decryptedUint32 = xxteaDecrypt(encryptedUint32, std::span<const uint32_t, 4>(key));
        auto decryptedBytes = toByteArray(decryptedUint32);
        printHex(decryptedBytes, "Decrypted byte data");

    } catch (const TEAException& e) {
        std::cerr << "TEA Error: " << e.what() << std::endl;
        return 1;
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
```

This example demonstrates:

1. Basic TEA encryption and decryption
2. XTEA encryption and decryption
3. XXTEA for larger data sets
4. Parallel processing for improved performance
5. Data conversion between byte arrays and uint32_t vectors

When working with these encryption algorithms, remember that:

- TEA and XTEA operate on 64-bit blocks (two 32-bit values)
- XXTEA works with variable-length data
- All algorithms use a 128-bit key (four 32-bit values)
- For large datasets, the parallel versions can provide significant performance improvements
