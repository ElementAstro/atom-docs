---
title: Base and XOR
description: Detailed of Base64 encoding/decoding and XOR encryption/decryption functions in the Atom Algorithm Library, including runtime and compile-time implementations.
---

## Overview

This library provides a comprehensive collection of encoding and decoding algorithms implemented in modern C++20, focusing on Base64, Base32, and XOR encryption techniques. The library is designed to be efficient, easy to use, and leverages modern C++ features including concepts, ranges, and SIMD optimizations when available.

## Key Features

- Base64 encoding and decoding with optional padding
- Base32 encoding and decoding with standard alphabet
- XOR encryption and decryption for simple data obfuscation
- Compile-time Base64 encoding and decoding using static strings
- SIMD acceleration for improved performance on supported platforms
- Modern C++ design utilizing C++20 features
- Error handling through `expected<T>` return types

## API Reference

### Base64 Functions

#### `base64Encode`

```cpp
auto base64Encode(std::string_view input, bool padding = true) noexcept 
    -> atom::type::expected<std::string>;
```

Description: Encodes a string into a Base64 encoded string.

Parameters:

- `input`: The input string to encode
- `padding`: Whether to add padding characters (=) to the output (defaults to true)

Returns: An `expected<std::string>` containing either:

- The Base64 encoded string, if successful
- An error message, if encoding fails

Example:

```cpp
auto result = atom::algorithm::base64Encode("Hello, world!");
if (result.has_value()) {
    std::cout << "Encoded: " << result.value() << std::endl;
}
```

#### `base64Decode`

```cpp
auto base64Decode(std::string_view input) noexcept
    -> atom::type::expected<std::string>;
```

Description: Decodes a Base64 encoded string back into its original form.

Parameters:

- `input`: The Base64 encoded string to decode

Returns: An `expected<std::string>` containing either:

- The decoded string, if successful
- An error message, if decoding fails

Example:

```cpp
auto result = atom::algorithm::base64Decode("SGVsbG8sIHdvcmxkIQ==");
if (result.has_value()) {
    std::cout << "Decoded: " << result.value() << std::endl;
}
```

#### `isBase64`

```cpp
auto isBase64(std::string_view str) noexcept -> bool;
```

Description: Checks if a given string is a valid Base64 encoded string.

Parameters:

- `str`: The string to validate

Returns: `true` if the string is a valid Base64 encoded string, `false` otherwise.

Example:

```cpp
if (atom::algorithm::isBase64("SGVsbG8sIHdvcmxkIQ==")) {
    std::cout << "Valid Base64 string" << std::endl;
}
```

### Base32 Functions

#### `encodeBase32` (for byte containers)

```cpp
template <detail::ByteContainer T>
auto encodeBase32(const T& data) noexcept -> atom::type::expected<std::string>;
```

Description: Encodes a byte container into a Base32 string.

Parameters:

- `data`: The input data to encode (must satisfy the `ByteContainer` concept)

Returns: An `expected<std::string>` containing either:

- The Base32 encoded string, if successful
- An error message, if encoding fails

Example:

```cpp
std::vector<std::byte> data = {std::byte{72}, std::byte{101}, std::byte{108}, std::byte{108}, std::byte{111}};
auto result = atom::algorithm::encodeBase32(data);
if (result.has_value()) {
    std::cout << "Base32 encoded: " << result.value() << std::endl;
}
```

#### `encodeBase32` (for uint8_t spans)

```cpp
auto encodeBase32(std::span<const uint8_t> data) noexcept
    -> atom::type::expected<std::string>;
```

Description: Specialized Base32 encoder for vector<uint8_t> or spans of uint8_t.

Parameters:

- `data`: The input data to encode as a span of uint8_t

Returns: An `expected<std::string>` containing either:

- The Base32 encoded string, if successful
- An error message, if encoding fails

Example:

```cpp
std::vector<uint8_t> data = {72, 101, 108, 108, 111};
auto result = atom::algorithm::encodeBase32(std::span(data));
if (result.has_value()) {
    std::cout << "Base32 encoded: " << result.value() << std::endl;
}
```

#### `decodeBase32`

```cpp
auto decodeBase32(std::string_view encoded) noexcept
    -> atom::type::expected<std::vector<uint8_t>>;
```

Description: Decodes a Base32 encoded string back into bytes.

Parameters:

- `encoded`: The Base32 encoded string

Returns: An `expected<std::vector<uint8_t>>` containing either:

- The decoded bytes, if successful
- An error message, if decoding fails

Example:

```cpp
auto result = atom::algorithm::decodeBase32("JBSWY3DPEBLW64TMMQ======");
if (result.has_value()) {
    const auto& decoded = result.value();
    std::cout << "Decoded bytes: ";
    for (auto byte : decoded) {
        std::cout << static_cast<int>(byte) << " ";
    }
    std::cout << std::endl;
}
```

### XOR Encryption Functions

#### `xorEncrypt`

```cpp
auto xorEncrypt(std::string_view plaintext, uint8_t key) noexcept -> std::string;
```

Description: Encrypts a string using the XOR algorithm.

Parameters:

- `plaintext`: The input string to encrypt
- `key`: The encryption key (a single byte value)

Returns: The encrypted string

Example:

```cpp
std::string encrypted = atom::algorithm::xorEncrypt("Secret message", 42);
std::cout << "Encrypted: " << encrypted << std::endl;
```

#### `xorDecrypt`

```cpp
auto xorDecrypt(std::string_view ciphertext, uint8_t key) noexcept -> std::string;
```

Description: Decrypts a string using the XOR algorithm.

Parameters:

- `ciphertext`: The encrypted string to decrypt
- `key`: The decryption key (must be the same as the encryption key)

Returns: The decrypted string

Example:

```cpp
std::string decrypted = atom::algorithm::xorDecrypt(encrypted, 42);
std::cout << "Decrypted: " << decrypted << std::endl;
```

### Compile-Time Functions

#### `decodeBase64`

```cpp
template <StaticString string>
consteval auto decodeBase64();
```

Description: Decodes a compile-time constant Base64 string.

Parameters:

- `string`: A `StaticString` template parameter representing the Base64 encoded string

Returns: A `StaticString` containing the decoded bytes or empty if invalid

Example:

```cpp
constexpr auto decoded = atom::algorithm::decodeBase64<"SGVsbG8=">();
```

#### `encode` (Base64)

```cpp
template <StaticString string>
constexpr auto encode();
```

Description: Encodes a compile-time constant string into Base64.

Parameters:

- `string`: A `StaticString` template parameter representing the input string to encode

Returns: A `StaticString` containing the Base64 encoded string

Example:

```cpp
constexpr auto encoded = atom::algorithm::encode<"Hello">();
```

### Parallel Execution

#### `parallelExecute`

```cpp
template <typename T, std::invocable<std::span<T>> Func>
void parallelExecute(std::span<T> data, size_t threadCount, Func func) noexcept;
```

Description: Executes a function in parallel over the provided data.

Parameters:

- `data`: The data to process
- `threadCount`: Number of threads to use (0 means use hardware-supported thread count)
- `func`: Function to execute for each thread

Example:

```cpp
std::vector<int> data(1000, 1);
atom::algorithm::parallelExecute(std::span(data), 4, [](std::span<int> chunk) {
    for (auto& i : chunk) {
        i *= 2;
    }
});
```

## Complete Usage Example

Here's a complete example demonstrating the main features of the library:

```cpp
#include "atom/algorithm/base.hpp"
#include <iostream>
#include <vector>

int main() {
    // Base64 encoding and decoding
    std::string original = "Hello, Base64 World!";
    
    auto encoded = atom::algorithm::base64Encode(original);
    if (!encoded) {
        std::cerr << "Encoding error: " << encoded.error() << std::endl;
        return 1;
    }
    
    std::cout << "Base64 encoded: " << encoded.value() << std::endl;
    
    auto decoded = atom::algorithm::base64Decode(encoded.value());
    if (!decoded) {
        std::cerr << "Decoding error: " << decoded.error() << std::endl;
        return 1;
    }
    
    std::cout << "Base64 decoded: " << decoded.value() << std::endl;
    
    // Base32 encoding and decoding
    std::vector<uint8_t> binaryData = {0x48, 0x65, 0x6C, 0x6C, 0x6F}; // "Hello"
    
    auto base32Encoded = atom::algorithm::encodeBase32(std::span(binaryData));
    if (!base32Encoded) {
        std::cerr << "Base32 encoding error: " << base32Encoded.error() << std::endl;
        return 1;
    }
    
    std::cout << "Base32 encoded: " << base32Encoded.value() << std::endl;
    
    auto base32Decoded = atom::algorithm::decodeBase32(base32Encoded.value());
    if (!base32Decoded) {
        std::cerr << "Base32 decoding error: " << base32Decoded.error() << std::endl;
        return 1;
    }
    
    std::cout << "Base32 decoded: ";
    for (auto byte : base32Decoded.value()) {
        std::cout << static_cast<char>(byte);
    }
    std::cout << std::endl;
    
    // XOR encryption and decryption
    uint8_t key = 42;
    std::string message = "This is a secret message";
    
    std::string encrypted = atom::algorithm::xorEncrypt(message, key);
    std::cout << "XOR encrypted (hex): ";
    for (unsigned char c : encrypted) {
        std::cout << std::hex << std::setw(2) << std::setfill('0') 
                  << static_cast<int>(c) << " ";
    }
    std::cout << std::endl;
    
    std::string decrypted = atom::algorithm::xorDecrypt(encrypted, key);
    std::cout << "XOR decrypted: " << decrypted << std::endl;
    
    // Checking if a string is valid Base64
    std::string validBase64 = "SGVsbG8=";
    std::string invalidBase64 = "SGVs$bG8=";
    
    std::cout << "Is '" << validBase64 << "' valid Base64? " 
              << (atom::algorithm::isBase64(validBase64) ? "Yes" : "No") << std::endl;
    
    std::cout << "Is '" << invalidBase64 << "' valid Base64? " 
              << (atom::algorithm::isBase64(invalidBase64) ? "Yes" : "No") << std::endl;
    
    return 0;
}
```

This example demonstrates:

- Base64 encoding and decoding with error handling
- Base32 encoding and decoding of binary data
- XOR encryption and decryption
- Validation of Base64 strings

The library provides a robust, modern C++ implementation of these common encoding algorithms with strong error handling, making it suitable for production use in systems requiring data encoding and light encryption.
