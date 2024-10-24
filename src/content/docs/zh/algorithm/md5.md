---
title: MD5
description: MD5 类的详细文档，包括成员函数、内部状态变量和计算输入数据 MD5 哈希的示例用法
---

MD5 类提供使用 MD5 算法计算输入数据的 MD5 哈希的功能。

## 成员函数

### 公共方法

#### `static std::string encrypt(const std::string &input)`

使用 MD5 算法对输入字符串进行加密，并返回输入字符串的 MD5 哈希。

### 私有方法

#### `void init()`

初始化内部变量和 MD5 计算的缓冲区。

#### `void update(const std::string &input)`

使用附加的输入数据更新 MD5 计算。

#### `std::string finalize()`

完成 MD5 计算并返回到目前为止提供的所有输入数据的结果哈希。

#### `void processBlock(const uint8_t *block)`

处理 64 字节的输入数据块。

### 静态辅助函数

#### `static uint32_t F(uint32_t x, uint32_t y, uint32_t z)`

MD5 算法的 F 函数。

#### `static uint32_t G(uint32_t x, uint32_t y, uint32_t z)`

MD5 算法的 G 函数。

#### `static uint32_t H(uint32_t x, uint32_t y, uint32_t z)`

MD5 算法的 H 函数。

#### `static uint32_t I(uint32_t x, uint32_t y, uint32_t z)`

MD5 算法的 I 函数。

#### `static uint32_t leftRotate(uint32_t x, uint32_t n)`

对输入执行左旋转操作。

#### `static uint32_t reverseBytes(uint32_t x)`

反转输入中的字节。

## 成员变量

- `uint32_t _a, _b, _c, _d`：用于 MD5 计算的内部状态变量。
- `uint64_t _count`：输入位的总计数。
- `std::vector<uint8_t> _buffer`：输入数据的缓冲区。

## 示例用法

```cpp
#include "MD5.h"
#include <iostream>

int main() {
    std::string input = "Hello, World!";
    std::string md5Hash = MD5::encrypt(input);
    std::cout << "MD5 Hash: " << md5Hash << std::endl;
    return 0;
}
```

这个示例展示了如何使用 MD5 类来计算字符串 "Hello, World!" 的 MD5 哈希，并将结果输出到控制台。
