---
title: Blowfish Encryption
description: Detailed explanation of the Blowfish encryption algorithm implementation in C++, including the Blowfish class and an example usage.
---

## Overview

The Blowfish encryption algorithm is a symmetric block cipher designed by Bruce Schneier in 1993. This implementation provides a C++ class for using Blowfish encryption in various contexts, including encrypting/decrypting blocks of data, memory buffers, and files.

## Table of Contents

- [Overview](#overview)
- [Table of Contents](#table-of-contents)
- [Class Description](#class-description)
- [Constructor](#constructor)
- [Public Methods](#public-methods)
  - [Block Operations](#block-operations)
    - [Encrypt a Block](#encrypt-a-block)
    - [Decrypt a Block](#decrypt-a-block)
  - [Buffer Operations](#buffer-operations)
    - [Encrypt Data](#encrypt-data)
    - [Decrypt Data](#decrypt-data)
  - [File Operations](#file-operations)
    - [Encrypt File](#encrypt-file)
    - [Decrypt File](#decrypt-file)
- [Usage Example](#usage-example)

## Class Description

The `Blowfish` class implements the Blowfish encryption algorithm with a key size from 1 to 56 bytes. It provides methods for encrypting and decrypting data at different levels of abstraction.

**Key Features:**

- **Block Size**: 8 bytes (64 bits)
- **Key Size**: 1 to 56 bytes
- **Security**: Considered secure for most applications
- **Performance**: Optimized with multi-threading support for large data operations

## Constructor

```cpp
explicit Blowfish(std::span<const std::byte> key);
```

**Parameters:**

- `key`: A span containing the encryption key (1-56 bytes)

**Description:**
Creates a new Blowfish encryption object initialized with the provided key. The key must be between 1 and 56 bytes in length.

**Exceptions:**

- Throws a runtime error if the key is empty or larger than 56 bytes.

## Public Methods

### Block Operations

#### Encrypt a Block

```cpp
void encrypt(std::span<std::byte, BLOCK_SIZE> block) noexcept;
```

**Parameters:**

- `block`: A span of exactly 8 bytes to be encrypted in place

**Description:**
Encrypts a single 8-byte block of data in place. This is the most basic operation and forms the foundation for all other encryption methods.

#### Decrypt a Block

```cpp
void decrypt(std::span<std::byte, BLOCK_SIZE> block) noexcept;
```

**Parameters:**

- `block`: A span of exactly 8 bytes to be decrypted in place

**Description:**
Decrypts a single 8-byte block of data in place.

### Buffer Operations

#### Encrypt Data

```cpp
template <ByteType T>
void encrypt_data(std::span<T> data);
```

**Template Parameters:**

- `T`: Type of the data (must satisfy the `ByteType` concept - std::byte, char, or unsigned char)

**Parameters:**

- `data`: A span of data to be encrypted in place

**Description:**
Encrypts arbitrary-sized data in place. The **data size must be a multiple of the block size** (8 bytes). This method applies PKCS7 padding automatically to ensure the data meets the block size requirement.

**Implementation Notes:**

- Uses multi-threading to improve performance on large datasets
- Validates that the data size is a multiple of the block size

#### Decrypt Data

```cpp
template <ByteType T>
void decrypt_data(std::span<T> data, size_t& length);
```

**Template Parameters:**

- `T`: Type of the data (must satisfy the `ByteType` concept)

**Parameters:**

- `data`: A span of data to be decrypted in place
- `length`: Reference to a size_t that will be updated with the actual data length after removing padding

**Description:**
Decrypts arbitrary-sized data in place and removes the PKCS7 padding. The **input data size must be a multiple of the block size** (8 bytes).

**Implementation Notes:**

- Updates the `length` parameter to reflect the actual data size after removing padding
- Validates that the data size is a multiple of the block size

### File Operations

#### Encrypt File

```cpp
void encrypt_file(std::string_view input_file, std::string_view output_file);
```

**Parameters:**

- `input_file`: Path to the input file to be encrypted
- `output_file`: Path where the encrypted file will be written

**Description:**
Reads the contents of `input_file`, encrypts it, and writes the result to `output_file`. The method handles all aspects of file I/O, buffer allocation, and padding.

**Exceptions:**

- Throws a runtime error if unable to open the input or output file
- Throws a runtime error if unable to read from the input file

#### Decrypt File

```cpp
void decrypt_file(std::string_view input_file, std::string_view output_file);
```

**Parameters:**

- `input_file`: Path to the encrypted input file
- `output_file`: Path where the decrypted file will be written

**Description:**
Reads the contents of `input_file`, decrypts it, removes padding, and writes the result to `output_file`. The method handles all aspects of file I/O and buffer allocation.

**Exceptions:**

- Throws a runtime error if unable to open the input or output file
- Throws a runtime error if unable to read from the input file

## Usage Example

Below is a complete example demonstrating how to use the Blowfish class for various encryption and decryption operations:

```cpp
#include "blowfish.hpp"
#include <iostream>
#include <vector>
#include <string>

int main() {
    try {
        // Create a key (1-56 bytes)
        std::vector<std::byte> key = {
            std::byte{0x01}, std::byte{0x23}, std::byte{0x45}, std::byte{0x67},
            std::byte{0x89}, std::byte{0xAB}, std::byte{0xCD}, std::byte{0xEF}
        };
        
        // Initialize the Blowfish object with the key
        atom::algorithm::Blowfish blowfish(key);
        
        // Example 1: Encrypt and decrypt a single block
        std::array<std::byte, 8> block = {
            std::byte{0x01}, std::byte{0x23}, std::byte{0x45}, std::byte{0x67},
            std::byte{0x89}, std::byte{0xAB}, std::byte{0xCD}, std::byte{0xEF}
        };
        
        std::cout << "Original block: ";
        for (auto b : block) {
            std::cout << std::hex << std::to_integer<int>(b) << " ";
        }
        std::cout << std::endl;
        
        // Encrypt the block
        blowfish.encrypt(block);
        
        std::cout << "Encrypted block: ";
        for (auto b : block) {
            std::cout << std::hex << std::to_integer<int>(b) << " ";
        }
        std::cout << std::endl;
        
        // Decrypt the block
        blowfish.decrypt(block);
        
        std::cout << "Decrypted block: ";
        for (auto b : block) {
            std::cout << std::hex << std::to_integer<int>(b) << " ";
        }
        std::cout << std::endl;
        
        // Example 2: Encrypt and decrypt larger data
        std::string message = "This is a secret message that we want to encrypt securely.";
        // Ensure the buffer is a multiple of block size and has room for padding
        size_t buffer_size = message.size() + (8 - (message.size() % 8));
        if (message.size() % 8 == 0) buffer_size += 8; // Full block of padding if already aligned
        
        std::vector<unsigned char> buffer(buffer_size);
        std::copy(message.begin(), message.end(), buffer.begin());
        
        // Encrypt the data
        blowfish.encrypt_data(std::span<unsigned char>(buffer));
        
        std::cout << "Encrypted data (hex): ";
        for (size_t i = 0; i < 16; ++i) { // Just show first 16 bytes
            std::cout << std::hex << static_cast<int>(buffer[i]) << " ";
        }
        std::cout << "..." << std::endl;
        
        // Decrypt the data
        size_t decrypted_length = buffer.size();
        blowfish.decrypt_data(std::span<unsigned char>(buffer), decrypted_length);
        
        // Convert decrypted data back to string
        std::string decrypted_message(buffer.begin(), buffer.begin() + decrypted_length);
        
        std::cout << "Decrypted message: " << decrypted_message << std::endl;
        
        // Example 3: Encrypt and decrypt files
        blowfish.encrypt_file("plaintext.txt", "encrypted.bin");
        blowfish.decrypt_file("encrypted.bin", "decrypted.txt");
        
        std::cout << "File encryption and decryption completed." << std::endl;
        
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
```

This example demonstrates:

1. Creating a Blowfish instance with a key
2. **Encrypting and decrypting a single block** of data
3. **Encrypting and decrypting a larger buffer** with automatic padding
4. **Encrypting and decrypting files**

The example handles proper buffer sizing and shows how to use the different API methods properly.
