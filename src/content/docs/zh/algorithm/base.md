---
title: Base64 和 XOR 加密
description: Atom 算法库中 Base64 编码/解码和 XOR 加密/解密函数的详细文档，包括运行时和编译时实现。
---

本文档提供了 Atom 算法库中 Base64 编码/解码和 XOR 加密/解密函数的详细说明。

## 目录

1. [概述](#概述)
2. [Base64 编码和解码](#base64-编码和解码)
   - [运行时函数](#运行时函数)
   - [编译时函数](#编译时函数)
3. [XOR 加密和解密](#xor-加密和解密)
4. [使用示例](#使用示例)

## 概述

Atom 算法库提供了 Base64 编码/解码和 XOR 加密/解密的实现。它包括 Base64 函数的运行时和编译时版本。

## Base64 编码和解码

### 运行时函数

#### Base64 编码

```cpp
[[nodiscard]] auto base64Encode(std::string_view bytes_to_encode) -> std::string;
```

此函数使用 Base64 算法对输入数据进行编码。

- **参数：**
  - `bytes_to_encode`：要编码的数据的字符串视图。
- **返回：** 包含 Base64 编码数据的字符串。

#### Base64 解码

```cpp
[[nodiscard]] auto base64Decode(std::string_view encoded_string) -> std::string;
```

此函数解码 Base64 编码的数据。

- **参数：**
  - `encoded_string`：Base64 编码数据的字符串视图。
- **返回：** 包含解码数据的字符串。

#### 快速 Base64 编码

```cpp
auto fbase64Encode(std::span<const unsigned char> input) -> std::string;
```

Base64 编码的优化版本。

- **参数：**
  - `input`：要编码的无符号字符的跨度。
- **返回：** 包含 Base64 编码数据的字符串。

#### 快速 Base64 解码

```cpp
auto fbase64Decode(std::span<const char> input) -> std::vector<unsigned char>;
```

Base64 解码的优化版本。

- **参数：**
  - `input`：包含 Base64 编码数据的字符跨度。
- **返回：** 包含解码数据的无符号字符向量。

### 编译时函数

#### 编译时 Base64 编码

```cpp
template <size_t N>
constexpr auto cbase64Encode(const StaticString<N>& input);
```

此函数在编译时执行 Base64 编码。

- **模板参数：**
  - `N`：输入字符串的大小。
- **参数：**
  - `input`：包含要编码数据的 `StaticString`。
- **返回：** 包含 Base64 编码数据的 `StaticString`。

#### 编译时 Base64 解码

```cpp
template <size_t N>
constexpr auto cbase64Decode(const StaticString<N>& input);
```

此函数在编译时执行 Base64 解码。

- **模板参数：**
  - `N`：输入字符串的大小。
- **参数：**
  - `input`：包含 Base64 编码数据的 `StaticString`。
- **返回：** 包含解码数据的 `StaticString`。

## XOR 加密和解密

### XOR 加密

```cpp
[[nodiscard]] auto xorEncrypt(std::string_view plaintext, uint8_t key) -> std::string;
```

此函数使用 XOR 算法对输入数据进行加密。

- **参数：**
  - `plaintext`：要加密的数据的字符串视图。
  - `key`：用作加密密钥的 8 位无符号整数。
- **返回：** 包含加密数据的字符串。

### XOR 解密

```cpp
[[nodiscard]] auto xorDecrypt(std::string_view ciphertext, uint8_t key) -> std::string;
```

此函数解密 XOR 加密的数据。

- **参数：**
  - `ciphertext`：加密数据的字符串视图。
  - `key`：用作解密密钥的 8 位无符号整数（必须与加密密钥相同）。
- **返回：** 包含解密数据的字符串。

## 使用示例

### Base64 编码和解码

```cpp
#include "atom/algorithm/base.hpp"
#include <iostream>

int main() {
    std::string original = "Hello, World!";

    // 运行时 Base64 编码
    std::string encoded = atom::algorithm::base64Encode(original);
    std::cout << "编码: " << encoded << std::endl;

    // 运行时 Base64 解码
    std::string decoded = atom::algorithm::base64Decode(encoded);
    std::cout << "解码: " << decoded << std::endl;

    // 编译时 Base64 编码
    constexpr auto staticOriginal = atom::StaticString("Hello, World!");
    constexpr auto staticEncoded = atom::algorithm::cbase64Encode(staticOriginal);
    std::cout << "静态编码: " << staticEncoded.data() << std::endl;

    // 编译时 Base64 解码
    constexpr auto staticDecoded = atom::algorithm::cbase64Decode(staticEncoded);
    std::cout << "静态解码: " << staticDecoded.data() << std::endl;

    return 0;
}
```

### XOR 加密和解密

```cpp
#include "atom/algorithm/base.hpp"
#include <iostream>

int main() {
    std::string original = "Secret message";
    uint8_t key = 42;

    // XOR 加密
    std::string encrypted = atom::algorithm::xorEncrypt(original, key);
    std::cout << "加密: " << encrypted << std::endl;

    // XOR 解密
    std::string decrypted = atom::algorithm::xorDecrypt(encrypted, key);
    std::cout << "解密: " << decrypted << std::endl;

    return 0;
}
```

这些示例演示了如何使用 Atom 算法库提供的 Base64 编码/解码和 XOR 加密/解密函数。该库为 Base64 操作提供了运行时和编译时选项，允许在不同用例中灵活使用。
