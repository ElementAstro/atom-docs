---
title: Base and XOR
description: Detailed of Base64 encoding/decoding and XOR encryption/decryption functions in the Atom Algorithm Library, including runtime and compile-time implementations.
---

## Purpose and High-Level Overview

This library provides a collection of encoding, decoding, and cryptographic utilities for C++ applications, focusing primarily on Base32, Base64, and XOR encryption algorithms. The library is designed with modern C++20 features including concepts and ranges, and emphasizes type safety through the use of `expected` return types for error handling.

The main components include:

- Base32 encoding and decoding
- Base64 encoding and decoding
- XOR encryption and decryption
- Compile-time Base64 encoding and decoding
- Parallel execution utilities

This library is part of the Atom framework developed by Max Qian.

## Headers and Dependencies

### Required Headers

```cpp
#include <concepts>       // For concepts like std::convertible_to
#include <cstdint>        // For types like uint8_t
#include <ranges>         // For std::ranges functionality
#include <span>           // For std::span
#include <string>         // For std::string and std::string_view
#include <vector>         // For std::vector
#include <thread>         // For parallelExecute (implied but not shown in header)
#include <algorithm>      // For std::ranges::transform, std::fill_n, etc.
```

### Custom Dependencies

```cpp
#include "atom/type/expected.hpp"      // For atom::type::expected
#include "atom/type/static_string.hpp"  // For StaticString
```

## Detailed Explanation of Classes, Methods, and Functions

### Namespace Structure

The library is organized under the `atom::algorithm` namespace, with implementation details in the `atom::algorithm::detail` sub-namespace.

### Types and Constants

#### Error Type

```cpp
using Error = std::string;
```

Error messages are represented as strings throughout the library.

#### Detail Namespace Constants

The `detail` namespace contains various constants used for the encoding and decoding operations:

```cpp
namespace detail {
    constexpr std::string_view BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                                              "abcdefghijklmnopqrstuvwxyz"
                                              "0123456789+/";
    constexpr size_t BASE64_CHAR_COUNT = 64;
    
    // Bit manipulation masks
    constexpr uint8_t MASK_6_BITS = 0x3F;
    constexpr uint8_t MASK_4_BITS = 0x0F;
    constexpr uint8_t MASK_2_BITS = 0x03;
    constexpr uint8_t MASK_8_BITS = 0xFC;
    constexpr uint8_t MASK_12_BITS = 0xF0;
    constexpr uint8_t MASK_14_BITS = 0xC0;
    constexpr uint8_t MASK_16_BITS = 0x30;
    constexpr uint8_t MASK_18_BITS = 0x3C;
}
```

#### ByteContainer Concept

```cpp
template <typename T>
concept ByteContainer =
    std::ranges::contiguous_range<T> && requires(T container) {
        { container.data() } -> std::convertible_to<const std::byte*>;
        { container.size() } -> std::convertible_to<std::size_t>;
    };
```

This concept constrains input types to be contiguous ranges of bytes, ensuring type safety for encoding functions.

### Base32 Functions

#### encodeBase32

```cpp
template <detail::ByteContainer T>
[[nodiscard]] auto encodeBase32(const T& data) noexcept
    -> atom::type::expected<std::string>;

[[nodiscard]] auto encodeBase32(std::span<const uint8_t> data) noexcept
    -> atom::type::expected<std::string>;
```

Parameters:

- `data`: The input data to encode, either as a ByteContainer or a span of uint8_t

Return Value:

- A `atom::type::expected<std::string>` containing either the encoded string or an error

Description:
The function encodes binary data into a Base32 string representation. The first template overload handles any container that satisfies the ByteContainer concept, while the second is specialized for `std::span<const uint8_t>`.

#### decodeBase32

```cpp
[[nodiscard]] auto decodeBase32(std::string_view encoded) noexcept
    -> atom::type::expected<std::vector<uint8_t>>;
```

Parameters:

- `encoded`: A string_view containing the Base32 encoded data

Return Value:

- A `atom::type::expected<std::vector<uint8_t>>` containing either the decoded bytes or an error

Description:
Decodes a Base32 encoded string back into its original binary form.

### Base64 Functions

#### base64Encode

```cpp
[[nodiscard]] auto base64Encode(std::string_view input,
                               bool padding = true) noexcept
    -> atom::type::expected<std::string>;
```

Parameters:

- `input`: The input string to encode
- `padding`: Whether to add padding '=' characters (default: true)

Return Value:

- A `atom::type::expected<std::string>` containing either the Base64 encoded string or an error

Description:
Encodes a string into its Base64 representation. The function supports optional padding with '=' characters.

#### base64Decode

```cpp
[[nodiscard]] auto base64Decode(std::string_view input) noexcept
    -> atom::type::expected<std::string>;
```

Parameters:

- `input`: The Base64 encoded string to decode

Return Value:

- A `atom::type::expected<std::string>` containing either the decoded string or an error

Description:
Decodes a Base64 encoded string back to its original form.

#### isBase64

```cpp
[[nodiscard]] auto isBase64(std::string_view str) noexcept -> bool;
```

Parameters:

- `str`: The string to check

Return Value:

- `true` if the string is valid Base64 encoded, `false` otherwise

Description:
Validates whether a given string conforms to the Base64 encoding format.

### Compile-Time Base64 Functions

#### decodeBase64

```cpp
template <StaticString string>
consteval auto decodeBase64();
```

Template Parameters:

- `string`: A StaticString representing the Base64 encoded string

Return Value:

- A StaticString containing the decoded bytes or an empty StaticString if the input is invalid

Description:
Decodes a compile-time constant Base64 string, performing validation and decoding at compile time.

#### encode

```cpp
template <StaticString string>
constexpr auto encode();
```

Template Parameters:

- `string`: A StaticString representing the input string to encode

Return Value:

- A StaticString containing the Base64 encoded string

Description:
Encodes a compile-time constant string into its Base64 representation at compile time.

### XOR Encryption Functions

#### xorEncrypt

```cpp
[[nodiscard]] auto xorEncrypt(std::string_view plaintext, uint8_t key) noexcept
    -> std::string;
```

Parameters:

- `plaintext`: The input string to encrypt
- `key`: The encryption key (a single byte)

Return Value:

- The encrypted string

Description:
Encrypts a string using the XOR algorithm with a single-byte key.

#### xorDecrypt

```cpp
[[nodiscard]] auto xorDecrypt(std::string_view ciphertext, uint8_t key) noexcept
    -> std::string;
```

Parameters:

- `ciphertext`: The encrypted string to decrypt
- `key`: The decryption key (a single byte)

Return Value:

- The decrypted string

Description:
Decrypts a string using the XOR algorithm with a single-byte key. In practice, this function performs the same operation as `xorEncrypt` since XOR is symmetric.

### Parallel Execution Utility

#### parallelExecute

```cpp
template <typename T, std::invocable<std::span<T>> Func>
void parallelExecute(std::span<T> data, size_t threadCount,
                    Func func) noexcept;
```

Template Parameters:

- `T`: The data element type
- `Func`: A function type that can be invoked with a span of T

Parameters:

- `data`: The data to be processed
- `threadCount`: Number of threads (0 means use hardware concurrency)
- `func`: The function to be executed by each thread

Description:
Splits data into chunks and processes them in parallel using multiple threads. The function handles:

- Determining appropriate thread count (hardware concurrency if not specified)
- Calculating chunk sizes and distributing remainder elements
- Creating and managing threads
- Ensuring all threads complete before returning

## Key Features with Examples

### Base64 Encoding and Decoding

```cpp
#include <iostream>
#include "atom/algorithm/base.hpp"

int main() {
    // Basic encoding
    std::string original = "Hello, World!";
    auto encoded = atom::algorithm::base64Encode(original);
    
    if (encoded) {
        std::cout << "Encoded: " << *encoded << std::endl;
        // Expected output: "SGVsbG8sIFdvcmxkIQ=="
        
        // Decoding
        auto decoded = atom::algorithm::base64Decode(*encoded);
        if (decoded) {
            std::cout << "Decoded: " << *decoded << std::endl;
            // Expected output: "Hello, World!"
        } else {
            std::cerr << "Decode error: " << decoded.error() << std::endl;
        }
    } else {
        std::cerr << "Encode error: " << encoded.error() << std::endl;
    }
    
    return 0;
}
```

### Compile-Time Base64 Encoding

```cpp
#include <iostream>
#include "atom/algorithm/base.hpp"
#include "atom/type/static_string.hpp"

// Define a static string (compile-time constant)
constexpr auto INPUT = StaticString("Hello, World!");

int main() {
    // Encode at compile time
    constexpr auto ENCODED = atom::algorithm::encode<INPUT>();
    std::cout << "Compile-time encoded: " << ENCODED << std::endl;
    // Expected output: "SGVsbG8sIFdvcmxkIQ=="
    
    // Decode at compile time
    constexpr auto DECODED = atom::algorithm::decodeBase64<ENCODED>();
    std::cout << "Compile-time decoded: " << DECODED << std::endl; 
    // Expected output: "Hello, World!"
    
    return 0;
}
```

### XOR Encryption

```cpp
#include <iostream>
#include "atom/algorithm/base.hpp"

int main() {
    std::string message = "Confidential information";
    uint8_t key = 42;
    
    // Encrypt the message
    std::string encrypted = atom::algorithm::xorEncrypt(message, key);
    std::cout << "Encrypted: ";
    // Print hex representation of encrypted data
    for (unsigned char c : encrypted) {
        printf("%02X ", c);
    }
    std::cout << std::endl;
    
    // Decrypt the message
    std::string decrypted = atom::algorithm::xorDecrypt(encrypted, key);
    std::cout << "Decrypted: " << decrypted << std::endl;
    // Expected output: "Confidential information"
    
    return 0;
}
```

### Parallel Processing Example

```cpp
#include <iostream>
#include <vector>
#include "atom/algorithm/base.hpp"

int main() {
    // Create a large array to process
    std::vector<int> data(1000000, 1);
    
    // Process the data in parallel - square each element
    atom::algorithm::parallelExecute(std::span(data), 0, [](std::span<int> chunk) {
        for (int& value : chunk) {
            value = value * value;
        }
    });
    
    // Check results
    std::cout << "First 5 elements after processing: ";
    for (size_t i = 0; i < 5 && i < data.size(); ++i) {
        std::cout << data[i] << " ";
    }
    std::cout << std::endl;
    // Expected output: "1 1 1 1 1" (since 1² = 1)
    
    return 0;
}
```

## Implementation Details and Edge Cases

### Base64 Encoding/Decoding

1. Padding Handling: Base64 padding with '=' characters ensures the encoded string length is a multiple of 4. The algorithm properly handles both adding padding during encoding and processing it during decoding.

2. Character Set: The implementation uses the standard Base64 character set (A-Z, a-z, 0-9, +, /) defined in the `detail::BASE64_CHARS` constant.

3. Input Validation: The `isBase64` function and the decoding functions verify that the input contains only valid Base64 characters and has appropriate length.

### Parallelization Logic

1. Thread Count Management: The `parallelExecute` function intelligently handles thread counts:
   - Uses hardware concurrency if thread count is 0
   - Ensures at least one thread is used
   - Limits thread count to input data size

2. Remainder Distribution: When data size isn't evenly divisible by thread count, the remainder is distributed by giving one extra element to the first N threads (where N is the remainder).

3. Thread Safety: Each thread operates on its own non-overlapping data chunk, avoiding data races.

## Performance Considerations

1. Memory Allocation: The encoding and decoding functions pre-allocate the exact amount of memory needed for the result based on the input size, avoiding unnecessary allocations or reallocations.

2. Compile-Time Computation: The template-based Base64 functions perform encoding/decoding at compile time, eliminating runtime overhead for constant strings.

3. Parallelization: The `parallelExecute` function can significantly improve performance on multi-core systems for operations that can be parallelized. The optimal thread count depends on the specific workload and system.

4. Zero-Copy Design: The library uses `std::span` and `std::string_view` to avoid unnecessary copying of data when possible.

## Best Practices and Common Pitfalls

### Best Practices

1. Error Handling: Always check the returned `expected` objects before using their values:

   ```cpp
   auto result = atom::algorithm::base64Encode("test");
   if (result) {
       // Use *result
   } else {
       // Handle error: result.error()
   }
   ```

2. Thread Count Selection: For `parallelExecute`, consider the following:
   - Use 0 (auto) for general cases to let the library determine the optimal thread count
   - For compute-bound tasks, set thread count equal to the number of CPU cores
   - For I/O-bound tasks, you might want more threads than cores

3. Compile-Time Optimization: Use the template-based functions for constant strings known at compile time.

### Common Pitfalls

1. XOR Key Strength: Using a single-byte XOR key provides very weak encryption. For real security, use a proper cryptographic library.

2. Thread Overhead: Creating too many threads for small data sets can decrease performance due to thread creation overhead. The `parallelExecute` function mitigates this by limiting threads to data size.

3. Base64 String Validation: Not checking if a string is valid Base64 before decoding can lead to unexpected results or errors.

4. Compile-Time Template Limits: Very large compile-time strings might exceed the compiler's template depth limits.

## Platform/Compiler-Specific Notes

1. C++20 Features: Requires a C++20-compliant compiler with support for concepts, ranges, and `std::span`.

2. Thread Support: The `parallelExecute` function requires a platform with thread support. On platforms without threading support, consider providing a fallback.

3. Compiler Optimizations: Modern compilers should be able to optimize the bit manipulation operations, but performance may vary across compilers.

4. Constexpr Support: The compile-time functions rely on C++20's extended constexpr support. Older compilers may not support these features.

## Comprehensive Example

This example demonstrates several features of the library working together:

```cpp
#include <iostream>
#include <vector>
#include <chrono>
#include "atom/algorithm/base.hpp"

// Function to measure execution time
template<typename Func>
double measureTime(Func&& func) {
    auto start = std::chrono::high_resolution_clock::now();
    func();
    auto end = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double, std::milli> duration = end - start;
    return duration.count();
}

int main() {
    std::cout << "Atom Algorithm Base Library Demo\n";
    std::cout << "================================\n\n";
    
    // 1. Base64 encoding/decoding
    std::string originalText = "This is a test message for the Atom Algorithm library.";
    std::cout << "Original text: " << originalText << "\n\n";
    
    auto encoded = atom::algorithm::base64Encode(originalText);
    if (!encoded) {
        std::cerr << "Encoding failed: " << encoded.error() << std::endl;
        return 1;
    }
    
    std::cout << "Base64 encoded: " << *encoded << "\n";
    
    // Validate the encoded string
    bool isValid = atom::algorithm::isBase64(*encoded);
    std::cout << "Is valid Base64: " << (isValid ? "Yes" : "No") << "\n\n";
    
    auto decoded = atom::algorithm::base64Decode(*encoded);
    if (!decoded) {
        std::cerr << "Decoding failed: " << decoded.error() << std::endl;
        return 1;
    }
    
    std::cout << "Base64 decoded: " << *decoded << "\n";
    std::cout << "Round-trip successful: " << (originalText == *decoded ? "Yes" : "No") << "\n\n";
    
    // 2. XOR encryption/decryption
    uint8_t xorKey = 0x5A;  // 90 in decimal
    std::cout << "XOR encryption with key: 0x" << std::hex << static_cast<int>(xorKey) << std::dec << "\n";
    
    std::string encrypted = atom::algorithm::xorEncrypt(originalText, xorKey);
    std::cout << "Encrypted (first 10 bytes in hex): ";
    for (size_t i = 0; i < 10 && i < encrypted.size(); ++i) {
        printf("%02X ", static_cast<unsigned char>(encrypted[i]));
    }
    std::cout << "...\n";
    
    std::string decrypted = atom::algorithm::xorDecrypt(encrypted, xorKey);
    std::cout << "Decrypted: " << decrypted << "\n";
    std::cout << "XOR round-trip successful: " << (originalText == decrypted ? "Yes" : "No") << "\n\n";
    
    // 3. Parallel processing demonstration
    std::cout << "Parallel processing demonstration\n";
    
    // Create a large vector
    const size_t dataSize = 10000000;
    std::vector<int> data(dataSize, 1);
    
    // Sequential processing time
    double seqTime = measureTime([&]() {
        for (auto& val : data) {
            val = val * 2 + 1;  // Some arbitrary operation
        }
    });
    std::cout << "Sequential processing time: " << seqTime << " ms\n";
    
    // Reset data
    std::fill(data.begin(), data.end(), 1);
    
    // Parallel processing time (auto thread count)
    double parTime = measureTime([&]() {
        atom::algorithm::parallelExecute(std::span(data), 0, [](std::span<int> chunk) {
            for (auto& val : chunk) {
                val = val * 2 + 1;  // Same operation
            }
        });
    });
    std::cout << "Parallel processing time: " << parTime << " ms\n";
    std::cout << "Speedup: " << (seqTime / parTime) << "x\n\n";
    
    // 4. Compile-time Base64 (would be computed at compile time)
    std::cout << "Compile-time Base64 demonstration\n";
    
    // This would typically be a compile-time constant
    constexpr auto COMPILE_TIME_STRING = StaticString("Compile-time Base64 encoding");
    constexpr auto COMPILE_TIME_ENCODED = atom::algorithm::encode<COMPILE_TIME_STRING>();
    
    std::cout << "Static string: " << COMPILE_TIME_STRING << "\n";
    std::cout << "Encoded at compile time: " << COMPILE_TIME_ENCODED << "\n";
    
    // Decode the compile-time encoded string at runtime for demonstration
    auto rtDecoded = atom::algorithm::base64Decode(std::string_view(COMPILE_TIME_ENCODED));
    if (rtDecoded) {
        std::cout << "Runtime decoded: " << *rtDecoded << "\n";
        std::cout << "Match: " << (std::string_view(COMPILE_TIME_STRING) == *rtDecoded ? "Yes" : "No") << "\n";
    }
    
    return 0;
}
```

Expected Output:

```
Atom Algorithm Base Library Demo
================================

Original text: This is a test message for the Atom Algorithm library.

Base64 encoded: VGhpcyBpcyBhIHRlc3QgbWVzc2FnZSBmb3IgdGhlIEF0b20gQWxnb3JpdGhtIGxpYnJhcnku
Is valid Base64: Yes

Base64 decoded: This is a test message for the Atom Algorithm library.
Round-trip successful: Yes

XOR encryption with key: 0x5A
Encrypted (first 10 bytes in hex): 32 27 2A 3F 10 2A 3F 10 2B 10 ...
Decrypted: This is a test message for the Atom Algorithm library.
XOR round-trip successful: Yes

Parallel processing demonstration
Sequential processing time: 9.2456 ms
Parallel processing time: 1.4872 ms
Speedup: 6.2167x

Compile-time Base64 demonstration
Static string: Compile-time Base64 encoding
Encoded at compile time: Q29tcGlsZS10aW1lIEJhc2U2NCBlbmNvZGluZw==
Runtime decoded: Compile-time Base64 encoding
Match: Yes
```

This comprehensive example demonstrates:

- Base64 encoding/decoding with validation
- XOR encryption/decryption
- Performance benefits of parallel processing
- Compile-time Base64 encoding capabilities

The library provides a robust set of encoding, encryption, and parallel processing tools suitable for a wide range of C++ applications.
