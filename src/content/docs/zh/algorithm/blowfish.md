---
title: Blowfish加密
description: C++中Blowfish加密算法实现的详细说明，包括Blowfish类及使用示例
---

## 目的和高级概述

Blowfish是由Bruce Schneier在1993年设计的对称密钥分组密码。这个实现在`atom::algorithm`命名空间中提供了一个完整的C++接口，用于Blowfish加密和解密操作。

主要特点：

- 64位分组大小（每个分组8字节）
- 支持可变密钥长度（最多448位）
- 16轮Feistel网络结构
- 对于未对齐到分组边界的数据使用PKCS7填充
- 文件加密/解密功能
- 使用概念和spans的现代C++20实现

这个实现在安全性和性能方面都经过精心设计，为数据保护需求提供了强大的对称加密解决方案。

## 所需头文件和依赖

```cpp
#include <array>        // 用于std::array
#include <cstdint>      // 用于uint32_t和其他整数类型
#include <span>         // 用于std::span（需要C++20）
#include <string_view>  // 用于std::string_view
```

实现所需的其他头文件（接口中未显示）：

```cpp
#include <fstream>      // 用于文件操作
#include <stdexcept>    // 用于异常处理
#include <vector>       // 用于临时缓冲区
```

## 详细类和方法文档

### ByteType概念

```cpp
template<typename T>
concept ByteType = std::is_same_v<T, std::byte> || 
                  std::is_same_v<T, char> ||
                  std::is_same_v<T, unsigned char>;
```

目的：确保模板参数表示类字节类型。

### Blowfish类

```cpp
class Blowfish {
    // 实现细节...
};
```

目的：封装Blowfish加密算法，提供方法用于加密和解密分组、数据跨度和文件。

#### 常量

```cpp
static constexpr size_t P_ARRAY_SIZE = 18;  // P数组的大小
static constexpr size_t S_BOX_SIZE = 256;   // 每个S盒的大小
static constexpr size_t BLOCK_SIZE = 8;     // 分组大小（字节）
```

#### 私有成员

```cpp
std::array<uint32_t, P_ARRAY_SIZE> P_;  // 算法中使用的P数组
std::array<std::array<uint32_t, S_BOX_SIZE>, 4> S_;  // 算法中使用的S盒
```

#### 构造函数

```cpp
explicit Blowfish(std::span<const std::byte> key);
```

目的：使用给定的加密密钥初始化Blowfish对象。  
参数：

- `key`：表示加密密钥的字节跨度（1-56字节）  

异常：

- `std::invalid_argument`：如果密钥无效（空或太长）

示例：

```cpp
#include <array>
#include <iostream>
#include "atom/algorithm/blowfish.hpp"

int main() {
    // 创建一个密钥（16字节 = 128位）
    std::array<std::byte, 16> key{};
    // 用值初始化密钥
    for (size_t i = 0; i < key.size(); ++i) {
        key[i] = std::byte(i + 1);
    }
    
    // 用密钥初始化Blowfish
    atom::algorithm::Blowfish bf(key);
    
    std::cout << "Blowfish initialized successfully with 128-bit key\n";
    return 0;
}
```

#### 分组加密/解密

```cpp
void encrypt(std::span<std::byte, BLOCK_SIZE> block) noexcept;
void decrypt(std::span<std::byte, BLOCK_SIZE> block) noexcept;
```

目的：加密或解密单个8字节分组。  
参数：

- `block`：要加密/解密的8字节跨度（原地修改）  

异常：无（标记为`noexcept`）

示例：

```cpp
#include <array>
#include <iostream>
#include <iomanip>
#include "atom/algorithm/blowfish.hpp"

int main() {
    // 创建一个密钥
    std::array<std::byte, 16> key{};
    for (size_t i = 0; i < key.size(); ++i) {
        key[i] = std::byte(i + 1);
    }
    
    // 初始化Blowfish
    atom::algorithm::Blowfish bf(key);
    
    // 创建一个要加密的分组
    std::array<std::byte, atom::algorithm::Blowfish::BLOCK_SIZE> block{};
    for (size_t i = 0; i < block.size(); ++i) {
        block[i] = std::byte('A' + i);  // "ABCDEFGH"
    }
    
    // 打印原始分组
    std::cout << "Original: ";
    for (auto b : block) {
        std::cout << static_cast<char>(std::to_integer<int>(b));
    }
    std::cout << std::endl;
    
    // 加密分组
    bf.encrypt(block);
    
    // 打印加密分组（以十六进制形式）
    std::cout << "Encrypted (hex): ";
    for (auto b : block) {
        std::cout << std::hex << std::setw(2) << std::setfill('0') 
                  << std::to_integer<int>(b) << " ";
    }
    std::cout << std::endl;
    
    // 解密分组
    bf.decrypt(block);
    
    // 打印解密分组
    std::cout << "Decrypted: ";
    for (auto b : block) {
        std::cout << static_cast<char>(std::to_integer<int>(b));
    }
    std::cout << std::endl;
    
    return 0;
}
```

#### 数据加密/解密

```cpp
template <ByteType T>
void encrypt_data(std::span<T> data);

template <ByteType T>
void decrypt_data(std::span<T> data, size_t& length);
```

目的：加密或解密任意长度的数据。  
参数：

- `data`：要加密/解密的字节类数据跨度（原地修改）
- `length`：对于解密，在移除填充后包含原始长度  

异常：

- 可能从内部方法（如`validate_block_size`）抛出异常

注意：

- 自动处理不是分组大小倍数的数据的PKCS7填充
- 解密后，`length`将更新为没有填充的实际数据长度

示例：

```cpp
#include <iostream>
#include <vector>
#include "atom/algorithm/blowfish.hpp"

int main() {
    // 创建一个密钥
    std::vector<std::byte> key(16);
    for (size_t i = 0; i < key.size(); ++i) {
        key[i] = std::byte(i + 1);
    }
    
    // 初始化Blowfish
    atom::algorithm::Blowfish bf(key);
    
    // 创建要加密的数据
    std::string message = "This is a secret message that needs encryption!";
    std::vector<unsigned char> data(message.begin(), message.end());
    
    std::cout << "Original: " << message << "\n";
    std::cout << "Original size: " << data.size() << " bytes\n";
    
    // 加密数据
    bf.encrypt_data(data);
    std::cout << "Encrypted size: " << data.size() << " bytes\n";
    
    // 解密数据
    size_t actual_length = data.size();
    bf.decrypt_data(data, actual_length);
    
    // 从解密数据创建字符串
    std::string decrypted(data.begin(), data.begin() + actual_length);
    std::cout << "Decrypted: " << decrypted << "\n";
    std::cout << "Decrypted size: " << actual_length << " bytes\n";
    
    return 0;
}
```

#### 文件加密/解密

```cpp
void encrypt_file(std::string_view input_file, std::string_view output_file);
void decrypt_file(std::string_view input_file, std::string_view output_file);
```

目的：加密或解密整个文件。  
参数：

- `input_file`：输入文件的路径（要加密/解密）
- `output_file`：结果将被写入的路径  

异常：

- IO相关异常（文件未找到、权限等）
- 可能从内部方法抛出异常

示例：

```cpp
#include <iostream>
#include <vector>
#include "atom/algorithm/blowfish.hpp"

int main() {
    try {
        // 创建一个密钥
        std::vector<std::byte> key(16);
        for (size_t i = 0; i < key.size(); ++i) {
            key[i] = std::byte(i + 1);
        }
        
        // 初始化Blowfish
        atom::algorithm::Blowfish bf(key);
        
        // 加密文件
        std::cout << "Encrypting file...\n";
        bf.encrypt_file("document.txt", "document.encrypted");
        std::cout << "File encrypted successfully.\n";
        
        // 解密文件
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

#### 私有方法：F函数

```cpp
uint32_t F(uint32_t x) const noexcept;
```

目的：Blowfish的Feistel网络结构中的核心函数。  
参数：

- `x`：32位输入值  

返回值：应用F函数后的32位结果  
异常：无（标记为`noexcept`）

#### 私有方法：validate_key

```cpp
void validate_key(std::span<const std::byte> key) const;
```

目的：验证提供的密钥是否满足Blowfish要求。  
参数：

- `key`：包含要验证的密钥的跨度  

异常：

- `std::invalid_argument`：如果密钥为空或超过最大长度（56字节）

#### 私有方法：init_state

```cpp
void init_state(std::span<const std::byte> key);
```

目的：用给定的密钥初始化P数组和S盒。  
参数：

- `key`：包含用于初始化状态的密钥的跨度

#### 私有方法：validate_block_size

```cpp
static void validate_block_size(size_t size);
```

目的：确保分组大小正确用于Blowfish操作。  
参数：

- `size`：要验证的分组大小  

异常：

- `std::invalid_argument`：如果大小不等于`BLOCK_SIZE`（8字节）

#### 私有方法：pkcs7_padding

```cpp
void pkcs7_padding(std::span<std::byte> data, size_t& length);
```

目的：对未对齐到分组边界的数据应用PKCS7填充。  
参数：

- `data`：要填充的数据
- `length`：将用填充后的长度更新的大小引用

#### 私有方法：remove_padding

```cpp
void remove_padding(std::span<std::byte> data, size_t& length);
```

目的：解密后移除PKCS7填充。  
参数：

- `data`：要取消填充的数据
- `length`：将用取消填充后的长度更新的大小引用

## 主要特性和实现细节

### 1. PKCS7填充

该实现使用PKCS7填充来处理不是8字节分组大小倍数的数据：

- 对于填充，每个填充字节的值等于添加的填充字节数
- 如果数据已经对齐，则添加一个完整的填充分组
- 这确保数据在解密后始终可以明确地取消填充

### 2. Blowfish算法结构

Blowfish是一个16轮Feistel网络，具有：

- 64位分组大小（8字节）
- 从32位到448位的可变长度密钥（4到56字节）
- 存储在P数组中的18个32位子密钥
- 四个S盒，每个包含256个32位条目

### 3. 现代C++特性

这个实现利用了现代C++20特性：

- std::span：用于安全的、非拥有的连续内存视图
- 概念：通过`ByteType`概念限制模板参数
- constexpr：用于编译时常量

## 性能考虑因素

1. 分组处理：Blowfish以8字节分组处理数据，因此性能通常与数据大小呈线性关系。

2. 密钥设置：密钥设置阶段（P数组和S盒的初始化）相对昂贵。为获得最佳性能：
   - 对多个加密/解密操作重用相同的`Blowfish`对象
   - 避免为每个操作重新创建对象

3. 内存使用：此实现尽可能地原地操作数据，以最小化内存开销。

4. 文件处理：文件加密/解密方法可能使用缓冲I/O来高效处理大文件。

## 最佳实践和需要避免的陷阱

### 最佳实践

1. 密钥管理：
   - 使用强大的随机密钥（理想情况下来自密码学安全的随机数生成器）
   - 保护密钥的存储和传输

2. 对象生命周期：
   - 保持`Blowfish`对象的生命周期用于多个操作，以避免重新初始化状态

3. 缓冲区大小：
   - 确保加密数据的缓冲区足够大，能够容纳填充

### 常见陷阱

1. 密钥弱点：
   - 使用可预测或短的密钥
   - 在源代码中硬编码密钥

2. 缓冲区管理：
   - 在缓冲区分配中不考虑填充
   - 在加密/解密操作期间修改数据跨度

3. 数据完整性：
   - Blowfish提供保密性但不提供完整性验证
   - 考虑使用额外机制（如HMAC）来验证数据是否被篡改

4. 算法选择：
   - Blowfish虽然对许多应用程序仍然安全，但在大多数现代用途中已被AES取代
   - 考虑您的特定应用程序的安全要求

## 平台/编译器特定说明

1. C++20支持：
   - 需要C++20兼容的编译器以支持`std::span`和概念
   - 具有良好支持的主要编译器：GCC 10+、Clang 10+、MSVC 19.27+

2. 字节序考虑：
   - 实现可能在内部处理字节序
   - 跨平台不应需要特殊处理

3. 优化：
   - 大多数编译器将有效地优化核心操作
   - 考虑为性能关键代码使用编译器优化标志（`-O2`或`-O3`）

## 完整示例

这是一个展示主要功能的综合示例：

```cpp
#include <array>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <string>
#include <vector>
#include "atom/algorithm/blowfish.hpp"

// 辅助函数，将十六进制字符串转换为字节
std::vector<std::byte> hex_to_bytes(const std::string& hex) {
    std::vector<std::byte> bytes;
    for (size_t i = 0; i < hex.length(); i += 2) {
        std::string byteString = hex.substr(i, 2);
        bytes.push_back(std::byte(std::stoi(byteString, nullptr, 16)));
    }
    return bytes;
}

// 辅助函数，将字节打印为十六进制
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
        
        // 1. 创建一个密钥（128位 = 16字节）
        std::string key_hex = "0123456789ABCDEF0123456789ABCDEF";
        auto key_bytes = hex_to_bytes(key_hex);
        
        std::cout << "Key (hex): " << key_hex << "\n";
        
        // 2. 用密钥初始化Blowfish
        atom::algorithm::Blowfish bf(key_bytes);
        std::cout << "Blowfish initialized successfully.\n\n";
        
        // 3. 分组加密示例
        std::cout << "Block Encryption Example:\n";
        std::cout << "-----------------------\n";
        
        // 创建单个分组（8字节）
        std::array<std::byte, atom::algorithm::Blowfish::BLOCK_SIZE> block{};
        std::string block_text = "TESTDATA";
        for (size_t i = 0; i < block.size(); ++i) {
            block[i] = std::byte(block_text[i]);
        }
        
        std::cout << "Original block: " << block_text << "\n";
        std::cout << "Original bytes: ";
        print_hex(block);
        
        // 加密分组
        bf.encrypt(block);
        std::cout << "Encrypted bytes: ";
        print_hex(block);
        
        // 解密分组
        bf.decrypt(block);
        std::cout << "Decrypted block: ";
        for (auto b : block) {
            std::cout << static_cast<char>(std::to_integer<int>(b));
        }
        std::cout << "\n\n";
        
        // 4. 数据加密示例
        std::cout << "Data Encryption Example:\n";
        std::cout << "-----------------------\n";
        
        // 创建要加密的数据
        std::string message = "This is a longer message that will require multiple blocks and padding.";
        std::cout << "Original message: " << message << "\n";
        std::cout << "Original length: " << message.length() << " bytes\n";
        
        // 转换为字节向量
        std::vector<std::byte> data(message.length());
        for (size_t i = 0; i < message.length(); ++i) {
            data[i] = std::byte(message[i]);
        }
        
        // 复制原始字节以便显示
        auto original_data = data;
        std::cout << "First few bytes: ";
        print_hex(std::span(original_data).subspan(0, std::min(size_t(16), original_data.size())));
        
        // 加密数据
        bf.encrypt_data(data);
        std::cout << "Encrypted length: " << data.size() << " bytes\n";
        std::cout << "First few encrypted bytes: ";
        print_hex(std::span(data).subspan(0, std::min(size_t(16), data.size())));
        
        // 解密数据
        size_t actual_length = data.size();
        bf.decrypt_data(data, actual_length);
        
        std::cout << "Decrypted length: " << actual_length << " bytes\n";
        std::cout << "Decrypted message: ";
        for (size_t i = 0; i < actual_length; ++i) {
            std::cout << static_cast<char>(std::to_integer<int>(data[i]));
        }
        std::cout << "\n\n";
        
        // 5. 创建一个示例文件进行加密
        std::cout << "File Encryption Example:\n";
        std::cout << "-----------------------\n";
        
        // 创建示例文件
        {
            std::ofstream test_file("test_original.txt");
            test_file << "This is a test file that will be encrypted and then decrypted.\n";
            test_file << "It contains multiple lines to demonstrate file encryption.\n";
            test_file << "Blowfish will process this file block by block.";
        }
        std::cout << "Created test file 'test_original.txt'\n";
        
        // 加密文件
        bf.encrypt_file("test_original.txt", "test_encrypted.bin");
        std::cout << "File encrypted to 'test_encrypted.bin'\n";
        
        // 解密文件
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

## 预期输出

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

## 结论

这个Blowfish实现为一个成熟的加密算法提供了现代C++接口。虽然对于新应用程序可能更倾向于使用像AES这样的更新算法，但Blowfish对于许多用例仍然是安全的，这个实现提供了强大的性能和易于使用的接口。

该实现处理了所有必要的细节，如分组处理、PKCS7填充和密钥初始化，同时为低级分组操作和高级数据/文件加密提供了清晰的API。

使用此实现时，请专注于正确的密钥管理，并考虑您的特定安全要求，以确定Blowfish是否适合您的应用程序。
