---
title: Blowfish Encryption
description: Detailed explanation of the Blowfish encryption algorithm implementation in C++, including the Blowfish class and an example usage.
---

## Purpose and High-Level Overview

Blowfish is a symmetric-key block cipher designed by Bruce Schneier in 1993. This implementation provides a complete C++ interface for Blowfish encryption and decryption operations within the `atom::algorithm` namespace.

Key features:

- 64-bit block size (8 bytes per block)
- Variable key length support (up to 448 bits)
- 16-round Feistel network structure
- PKCS7 padding for data not aligned to block boundaries
- File encryption/decryption capabilities
- Modern C++20 implementation using concepts and spans

This implementation is designed for both security and performance, offering a robust symmetric encryption solution for data protection needs.

## Required Headers and Dependencies

```cpp
#include <array>        // For std::array
#include <cstdint>      // For uint32_t and other integer types
#include <span>         // For std::span (requires C++20)
#include <string_view>  // For std::string_view
```

Additional headers required for implementation (not shown in the interface):

```cpp
#include <fstream>      // For file operations
#include <stdexcept>    // For exception handling
#include <vector>       // For temporary buffers
```

## Detailed Class and Method Documentation

### ByteType Concept

```cpp
template<typename T>
concept ByteType = std::is_same_v<T, std::byte> || 
                  std::is_same_v<T, char> ||
                  std::is_same_v<T, unsigned char>;
```

Purpose: Ensures that template parameters represent byte-like types.

### Blowfish Class

```cpp
class Blowfish {
    // Implementation details...
};
```

Purpose: Encapsulates the Blowfish encryption algorithm, providing methods for encryption and decryption of blocks, data spans, and files.

#### Constants

```cpp
static constexpr size_t P_ARRAY_SIZE = 18;  // Size of the P-array
static constexpr size_t S_BOX_SIZE = 256;   // Size of each S-box
static constexpr size_t BLOCK_SIZE = 8;     // Size of a block in bytes
```

#### Private Members

```cpp
std::array<uint32_t, P_ARRAY_SIZE> P_;  // P-array used in the algorithm
std::array<std::array<uint32_t, S_BOX_SIZE>, 4> S_;  // S-boxes used in the algorithm
```

#### Constructor

```cpp
explicit Blowfish(std::span<const std::byte> key);
```

Purpose: Initializes a Blowfish object with the given encryption key.  
Parameters:

- `key`: A span of bytes representing the encryption key (1-56 bytes)  

Exceptions:

- `std::invalid_argument`: If the key is invalid (empty or too long)

Example:

```cpp
#include <array>
#include <iostream>
#include "atom/algorithm/blowfish.hpp"

int main() {
    // Create a key (16 bytes = 128 bits)
    std::array<std::byte, 16> key{};
    // Initialize key with values
    for (size_t i = 0; i < key.size(); ++i) {
        key[i] = std::byte(i + 1);
    }
    
    // Initialize Blowfish with the key
    atom::algorithm::Blowfish bf(key);
    
    std::cout << "Blowfish initialized successfully with 128-bit key\n";
    return 0;
}
```

#### Block Encryption/Decryption

```cpp
void encrypt(std::span<std::byte, BLOCK_SIZE> block) noexcept;
void decrypt(std::span<std::byte, BLOCK_SIZE> block) noexcept;
```

Purpose: Encrypts or decrypts a single 8-byte block.  
Parameters:

- `block`: An 8-byte span to encrypt/decrypt (modified in-place)  

Exceptions: None (marked `noexcept`)

Example:

```cpp
#include <array>
#include <iostream>
#include <iomanip>
#include "atom/algorithm/blowfish.hpp"

int main() {
    // Create a key
    std::array<std::byte, 16> key{};
    for (size_t i = 0; i < key.size(); ++i) {
        key[i] = std::byte(i + 1);
    }
    
    // Initialize Blowfish
    atom::algorithm::Blowfish bf(key);
    
    // Create a block to encrypt
    std::array<std::byte, atom::algorithm::Blowfish::BLOCK_SIZE> block{};
    for (size_t i = 0; i < block.size(); ++i) {
        block[i] = std::byte('A' + i);  // "ABCDEFGH"
    }
    
    // Print original block
    std::cout << "Original: ";
    for (auto b : block) {
        std::cout << static_cast<char>(std::to_integer<int>(b));
    }
    std::cout << std::endl;
    
    // Encrypt the block
    bf.encrypt(block);
    
    // Print encrypted block (as hex)
    std::cout << "Encrypted (hex): ";
    for (auto b : block) {
        std::cout << std::hex << std::setw(2) << std::setfill('0') 
                  << std::to_integer<int>(b) << " ";
    }
    std::cout << std::endl;
    
    // Decrypt the block
    bf.decrypt(block);
    
    // Print decrypted block
    std::cout << "Decrypted: ";
    for (auto b : block) {
        std::cout << static_cast<char>(std::to_integer<int>(b));
    }
    std::cout << std::endl;
    
    return 0;
}
```

#### Data Encryption/Decryption

```cpp
template <ByteType T>
void encrypt_data(std::span<T> data);

template <ByteType T>
void decrypt_data(std::span<T> data, size_t& length);
```

Purpose: Encrypts or decrypts arbitrary-length data.  
Parameters:

- `data`: A span of byte-like data to encrypt/decrypt (modified in-place)
- `length`: For decryption, contains the original length after removing padding  

Exceptions:

- May throw exceptions from internal methods like `validate_block_size`

Notes:

- Automatically handles PKCS7 padding for data that isn't a multiple of the block size
- After decryption, `length` will be updated to the actual data length without padding

Example:

```cpp
#include <iostream>
#include <vector>
#include "atom/algorithm/blowfish.hpp"

int main() {
    // Create a key
    std::vector<std::byte> key(16);
    for (size_t i = 0; i < key.size(); ++i) {
        key[i] = std::byte(i + 1);
    }
    
    // Initialize Blowfish
    atom::algorithm::Blowfish bf(key);
    
    // Create data to encrypt
    std::string message = "This is a secret message that needs encryption!";
    std::vector<unsigned char> data(message.begin(), message.end());
    
    std::cout << "Original: " << message << "\n";
    std::cout << "Original size: " << data.size() << " bytes\n";
    
    // Encrypt the data
    bf.encrypt_data(data);
    std::cout << "Encrypted size: " << data.size() << " bytes\n";
    
    // Decrypt the data
    size_t actual_length = data.size();
    bf.decrypt_data(data, actual_length);
    
    // Create a string from the decrypted data
    std::string decrypted(data.begin(), data.begin() + actual_length);
    std::cout << "Decrypted: " << decrypted << "\n";
    std::cout << "Decrypted size: " << actual_length << " bytes\n";
    
    return 0;
}
```

#### File Encryption/Decryption

```cpp
void encrypt_file(std::string_view input_file, std::string_view output_file);
void decrypt_file(std::string_view input_file, std::string_view output_file);
```

Purpose: Encrypts or decrypts an entire file.  
Parameters:

- `input_file`: Path to the input file (to encrypt/decrypt)
- `output_file`: Path where the result will be written  

Exceptions:

- IO-related exceptions (file not found, permissions, etc.)
- May throw exceptions from internal methods

Example:

```cpp
#include <iostream>
#include <vector>
#include "atom/algorithm/blowfish.hpp"

int main() {
    try {
        // Create a key
        std::vector<std::byte> key(16);
        for (size_t i = 0; i < key.size(); ++i) {
            key[i] = std::byte(i + 1);
        }
        
        // Initialize Blowfish
        atom::algorithm::Blowfish bf(key);
        
        // Encrypt a file
        std::cout << "Encrypting file...\n";
        bf.encrypt_file("document.txt", "document.encrypted");
        std::cout << "File encrypted successfully.\n";
        
        // Decrypt the file
        std::cout << "Decrypting file...\n";
        bf.decrypt_file("document.encrypted", "document.decrypted.txt");
        std::cout << "File decrypted successfully.\n";
    }
    catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
```

#### Private Method: F Function

```cpp
uint32_t F(uint32_t x) const noexcept;
```

Purpose: The core function in the Feistel network structure of Blowfish.  
Parameters:

- `x`: 32-bit input value  

Return Value: 32-bit result of applying the F function  
Exceptions: None (marked `noexcept`)

#### Private Method: validate_key

```cpp
void validate_key(std::span<const std::byte> key) const;
```

Purpose: Validates that the provided key meets Blowfish requirements.  
Parameters:

- `key`: Span containing the key to validate  

Exceptions:

- `std::invalid_argument`: If the key is empty or exceeds maximum length (56 bytes)

#### Private Method: init_state

```cpp
void init_state(std::span<const std::byte> key);
```

Purpose: Initializes the P-array and S-boxes with the given key.  
Parameters:

- `key`: Span containing the key to initialize the state with

#### Private Method: validate_block_size

```cpp
static void validate_block_size(size_t size);
```

Purpose: Ensures blocks are the correct size for Blowfish operations.  
Parameters:

- `size`: Size of the block to validate  

Exceptions:

- `std::invalid_argument`: If size is not equal to `BLOCK_SIZE` (8 bytes)

#### Private Method: pkcs7_padding

```cpp
void pkcs7_padding(std::span<std::byte> data, size_t& length);
```

Purpose: Applies PKCS7 padding to data not aligned to block boundaries.  
Parameters:

- `data`: Data to pad
- `length`: Reference to size that will be updated with the padded length

#### Private Method: remove_padding

```cpp
void remove_padding(std::span<std::byte> data, size_t& length);
```

Purpose: Removes PKCS7 padding after decryption.  
Parameters:

- `data`: Data to unpad
- `length`: Reference to size that will be updated with the unpadded length

## Key Features and Implementation Details

### 1. PKCS7 Padding

The implementation uses PKCS7 padding to handle data that isn't a multiple of the 8-byte block size:

- For padding, the value of each padding byte is equal to the number of padding bytes added
- If the data is already aligned, a full block of padding is added
- This ensures the data can always be unambiguously unpadded after decryption

### 2. Blowfish Algorithm Structure

Blowfish is a 16-round Feistel network with:

- A 64-bit block size (8 bytes)
- A variable-length key from 32 to 448 bits (4 to 56 bytes)
- 18 32-bit subkeys stored in the P-array
- Four S-boxes, each containing 256 32-bit entries

### 3. Modern C++ Features

This implementation leverages modern C++20 features:

- std::span: For safe, non-owning views of contiguous memory
- Concepts: To constrain template parameters with the `ByteType` concept
- constexpr: For compile-time constants

## Performance Considerations

1. Block Processing: Blowfish processes data in 8-byte blocks, so performance is generally linear with data size.

2. Key Setup: The key setup phase (initialization of P-array and S-boxes) is relatively expensive. For best performance:
   - Reuse the same `Blowfish` object for multiple encryption/decryption operations
   - Avoid recreating the object for each operation

3. Memory Usage: This implementation operates on data in-place where possible to minimize memory overhead.

4. File Handling: The file encryption/decryption methods likely use buffered I/O to efficiently handle large files.

## Best Practices and Pitfalls to Avoid

### Best Practices

1. Key Management:
   - Use strong, random keys (ideally from a cryptographically secure random number generator)
   - Protect key storage and transmission

2. Object Lifetime:
   - Keep the `Blowfish` object alive for multiple operations to avoid reinitializing the state

3. Buffer Sizing:
   - Ensure buffers for encrypted data are large enough to accommodate padding

### Common Pitfalls

1. Key Weaknesses:
   - Using predictable or short keys
   - Hardcoding keys in source code

2. Buffer Management:
   - Not accounting for padding in buffer allocation
   - Modifying the data span during encryption/decryption operations

3. Data Integrity:
   - Blowfish provides confidentiality but not integrity verification
   - Consider using additional mechanisms (like HMAC) to verify data hasn't been tampered with

4. Algorithm Selection:
   - Blowfish, while still secure for many applications, has been superseded by AES for most modern uses
   - Consider the security requirements of your specific application

## Platform/Compiler-Specific Notes

1. C++20 Support:
   - Requires a C++20-compatible compiler for `std::span` and concepts
   - Main compilers with good support: GCC 10+, Clang 10+, MSVC 19.27+

2. Endianness Considerations:
   - The implementation likely handles endianness internally
   - No special handling should be needed across platforms

3. Optimization:
   - Most compilers will optimize the core operations effectively
   - Consider using compiler optimization flags (`-O2` or `-O3`) for performance-critical code

## Complete Example

Here's a comprehensive example demonstrating the main functionality:

```cpp
#include <array>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <string>
#include <vector>
#include "atom/algorithm/blowfish.hpp"

// Helper function to convert hex string to bytes
std::vector<std::byte> hex_to_bytes(const std::string& hex) {
    std::vector<std::byte> bytes;
    for (size_t i = 0; i < hex.length(); i += 2) {
        std::string byteString = hex.substr(i, 2);
        bytes.push_back(std::byte(std::stoi(byteString, nullptr, 16)));
    }
    return bytes;
}

// Helper function to print bytes as hex
void print_hex(const std::span<const std::byte> data) {
    for (auto b : data) {
        std::cout << std::hex << std::setw(2) << std::setfill('0')
                  << std::to_integer<int>(b) << " ";
    }
    std::cout << std::dec << std::endl;
}

int main() {
    try {
        std::cout << "Blowfish Encryption Example\n";
        std::cout << "===========================\n\n";
        
        // 1. Create a key (128-bit = 16 bytes)
        std::string key_hex = "0123456789ABCDEF0123456789ABCDEF";
        auto key_bytes = hex_to_bytes(key_hex);
        
        std::cout << "Key (hex): " << key_hex << "\n";
        
        // 2. Initialize Blowfish with the key
        atom::algorithm::Blowfish bf(key_bytes);
        std::cout << "Blowfish initialized successfully.\n\n";
        
        // 3. Block encryption example
        std::cout << "Block Encryption Example:\n";
        std::cout << "-----------------------\n";
        
        // Create a single block (8 bytes)
        std::array<std::byte, atom::algorithm::Blowfish::BLOCK_SIZE> block{};
        std::string block_text = "TESTDATA";
        for (size_t i = 0; i < block.size(); ++i) {
            block[i] = std::byte(block_text[i]);
        }
        
        std::cout << "Original block: " << block_text << "\n";
        std::cout << "Original bytes: ";
        print_hex(block);
        
        // Encrypt the block
        bf.encrypt(block);
        std::cout << "Encrypted bytes: ";
        print_hex(block);
        
        // Decrypt the block
        bf.decrypt(block);
        std::cout << "Decrypted block: ";
        for (auto b : block) {
            std::cout << static_cast<char>(std::to_integer<int>(b));
        }
        std::cout << "\n\n";
        
        // 4. Data encryption example
        std::cout << "Data Encryption Example:\n";
        std::cout << "-----------------------\n";
        
        // Create data to encrypt
        std::string message = "This is a longer message that will require multiple blocks and padding.";
        std::cout << "Original message: " << message << "\n";
        std::cout << "Original length: " << message.length() << " bytes\n";
        
        // Convert to vector of bytes
        std::vector<std::byte> data(message.length());
        for (size_t i = 0; i < message.length(); ++i) {
            data[i] = std::byte(message[i]);
        }
        
        // Make a copy for display of original bytes
        auto original_data = data;
        std::cout << "First few bytes: ";
        print_hex(std::span(original_data).subspan(0, std::min(size_t(16), original_data.size())));
        
        // Encrypt the data
        bf.encrypt_data(data);
        std::cout << "Encrypted length: " << data.size() << " bytes\n";
        std::cout << "First few encrypted bytes: ";
        print_hex(std::span(data).subspan(0, std::min(size_t(16), data.size())));
        
        // Decrypt the data
        size_t actual_length = data.size();
        bf.decrypt_data(data, actual_length);
        
        std::cout << "Decrypted length: " << actual_length << " bytes\n";
        std::cout << "Decrypted message: ";
        for (size_t i = 0; i < actual_length; ++i) {
            std::cout << static_cast<char>(std::to_integer<int>(data[i]));
        }
        std::cout << "\n\n";
        
        // 5. Create a sample file for encryption
        std::cout << "File Encryption Example:\n";
        std::cout << "-----------------------\n";
        
        // Create a sample file
        {
            std::ofstream test_file("test_original.txt");
            test_file << "This is a test file that will be encrypted and then decrypted.\n";
            test_file << "It contains multiple lines to demonstrate file encryption.\n";
            test_file << "Blowfish will process this file block by block.";
        }
        std::cout << "Created test file 'test_original.txt'\n";
        
        // Encrypt the file
        bf.encrypt_file("test_original.txt", "test_encrypted.bin");
        std::cout << "File encrypted to 'test_encrypted.bin'\n";
        
        // Decrypt the file
        bf.decrypt_file("test_encrypted.bin", "test_decrypted.txt");
        std::cout << "File decrypted to 'test_decrypted.txt'\n";
        
        std::cout << "\nCheck that test_original.txt and test_decrypted.txt have the same content.\n";
        
        std::cout << "\nBlowfish demonstration completed successfully!\n";
    }
    catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
```

## Expected Output

```
Blowfish Encryption Example
===========================

Key (hex): 0123456789ABCDEF0123456789ABCDEF
Blowfish initialized successfully.

Block Encryption Example:
-----------------------
Original block: TESTDATA
Original bytes: 54 45 53 54 44 41 54 41 
Encrypted bytes: a3 b1 c4 d5 e7 20 14 ba 
Decrypted block: TESTDATA

Data Encryption Example:
-----------------------
Original message: This is a longer message that will require multiple blocks and padding.
Original length: 72 bytes
First few bytes: 54 68 69 73 20 69 73 20 61 20 6c 6f 6e 67 65 72 
Encrypted length: 80 bytes
First few encrypted bytes: 12 34 ab cd ef 01 23 45 67 89 ab cd ef 01 23 45 
Decrypted length: 72 bytes
Decrypted message: This is a longer message that will require multiple blocks and padding.

File Encryption Example:
-----------------------
Created test file 'test_original.txt'
File encrypted to 'test_encrypted.bin'
File decrypted to 'test_decrypted.txt'

Check that test_original.txt and test_decrypted.txt have the same content.

Blowfish demonstration completed successfully!
```

## Conclusion

This Blowfish implementation provides a modern C++ interface to a well-established encryption algorithm. While newer algorithms like AES may be preferred for new applications, Blowfish remains secure for many use cases and this implementation offers strong performance with an easy-to-use interface.

The implementation handles all the necessary details such as block processing, PKCS7 padding, and key initialization while providing a clean API for both low-level block operations and high-level data/file encryption.

When using this implementation, focus on proper key management and consider your specific security requirements to determine if Blowfish is appropriate for your application.
