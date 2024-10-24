---
title: MinHash & QuickHash
description: MinHash & QuickHash
---

## 概述

`mhash.hpp` 文件提供了 MinHash 算法的实现，用于估计集合之间的 Jaccard 相似度。它还包括用于在十六进制字符串和二进制数据之间转换的实用函数。该实现支持 CPU 和基于 OpenCL 的 GPU 计算。

## 命名空间

所有类和函数都定义在 `atom::algorithm` 命名空间中。

```cpp
namespace atom::algorithm {
    // ...
}
```

## 实用函数

### hexstringFromData

```cpp
ATOM_NODISCARD auto hexstringFromData(const std::string& data) -> std::string;
```

将字符串转换为其十六进制字符串表示。

- **参数：**
  - `data`：要转换的输入字符串。
- **返回值：** 输入数据的十六进制字符串表示。
- **使用示例：**

  ```cpp
  std::string data = "Hello, World!";
  std::string hex = atom::algorithm::hexstringFromData(data);
  // hex 将为 "48656C6C6F2C20576F726C6421"
  ```

### dataFromHexstring

```cpp
ATOM_NODISCARD auto dataFromHexstring(const std::string& data) -> std::string;
```

将十六进制字符串表示转换回二进制数据。

- **参数：**
  - `data`：要转换的输入十六进制字符串。
- **返回值：** 输入十六进制字符串表示的二进制数据。
- **抛出：** `std::invalid_argument` 如果输入不是有效的十六进制字符串。
- **使用示例：**

  ```cpp
  std::string hex = "48656C6C6F2C20576F726C6421";
  std::string data = atom::algorithm::dataFromHexstring(hex);
  // data 将为 "Hello, World!"
  ```

## MinHash 类

`MinHash` 类实现了 MinHash 算法，用于估计集合之间的 Jaccard 相似度。

### 类定义

```cpp
class MinHash {
public:
    using HashFunction = std::function<size_t(size_t)>;

    explicit MinHash(size_t num_hashes);
    ~MinHash();

    template <std::ranges::range Range>
    auto computeSignature(const Range& set) const -> std::vector<size_t>;

    static auto jaccardIndex(const std::vector<size_t>& sig1,
                             const std::vector<size_t>& sig2) -> double;

private:
    // ... (私有成员和方法)
};
```

### 构造函数

```cpp
explicit MinHash(size_t num_hashes);
```

使用指定数量的哈希函数构造一个 MinHash 对象。

- **参数：**
  - `num_hashes`：用于 MinHash 的哈希函数数量。
- **使用示例：**

  ```cpp
  atom::algorithm::MinHash minhash(100); // 创建一个具有 100 个哈希函数的 MinHash
  ```

### computeSignature

```cpp
template <std::ranges::range Range>
auto computeSignature(const Range& set) const -> std::vector<size_t>;
```

计算给定集合的 MinHash 签名（哈希值）。

- **模板参数：**
  - `Range`：表示集合元素的范围类型。
- **参数：**
  - `set`：要计算 MinHash 签名的集合。
- **返回值：** 表示集合的 MinHash 签名的 `size_t` 向量。
- **使用示例：**

  ```cpp
  std::vector<std::string> set = {"apple", "banana", "cherry"};
  atom::algorithm::MinHash minhash(100);
  std::vector<size_t> signature = minhash.computeSignature(set);
  ```

### jaccardIndex

```cpp
static auto jaccardIndex(const std::vector<size_t>& sig1,
                         const std::vector<size_t>& sig2) -> double;
```

根据两个集合的 MinHash 签名计算 Jaccard 指数。

- **参数：**
  - `sig1`：第一个集合的 MinHash 签名。
  - `sig2`：第二个集合的 MinHash 签名。
- **返回值：** 两个集合之间的估计 Jaccard 指数，类型为 `double`。
- **使用示例：**

  ```cpp
  std::vector<size_t> sig1 = minhash.computeSignature(set1);
  std::vector<size_t> sig2 = minhash.computeSignature(set2);
  double similarity = atom::algorithm::MinHash::jaccardIndex(sig1, sig2);
  ```

## OpenCL 支持

MinHash 实现包括对 OpenCL 基于 GPU 计算的支持，当定义了 `USE_OPENCL` 宏时，将自动使用 GPU 加速计算。

### OpenCL 特定方法

这些方法仅在定义了 `USE_OPENCL` 时可用：

- `initializeOpenCL()`: 初始化 OpenCL 上下文和资源。
- `cleanupOpenCL()`: 清理 OpenCL 资源。
- `computeSignatureOpenCL()`: 使用 OpenCL 计算 MinHash 签名。

## 示例用法

以下示例演示如何使用 MinHash 类估计两个集合之间的 Jaccard 相似度：

```cpp
#include "mhash.hpp"
#include <iostream>
#include <vector>
#include <string>

int main() {
    // 创建两个示例集合
    std::vector<std::string> set1 = {"apple", "banana", "cherry", "date"};
    std::vector<std::string> set2 = {"banana", "cherry", "elderberry", "fig"};

    // 创建一个具有 100 个哈希函数的 MinHash 对象
    atom::algorithm::MinHash minhash(100);

    // 计算两个集合的 MinHash 签名
    auto sig1 = minhash.computeSignature(set1);
    auto sig2 = minhash.computeSignature(set2);

    // 估计 Jaccard 相似度
    double similarity = atom::algorithm::MinHash::jaccardIndex(sig1, sig2);

    std::cout << "估计的 Jaccard 相似度: " << similarity << std::endl;

    // 将字符串转换为十六进制并恢复
    std::string original = "Hello, World!";
    std::string hex = atom::algorithm::hexstringFromData(original);
    std::string restored = atom::algorithm::dataFromHexstring(hex);

    std::cout << "原始: " << original << std::endl;
    std::cout << "十六进制: " << hex << std::endl;
    std::cout << "恢复: " << restored << std::endl;

    return 0;
}
```

该示例展示了：

1. 创建 MinHash 对象
2. 计算集合的 MinHash 签名
3. 估计集合之间的 Jaccard 相似度
4. 使用实用函数进行十六进制字符串转换

## 最佳实践

1. 确保输入集合不为空，以避免未定义行为。
2. 当处理大型集合时，考虑使用文件 I/O，而不是将整个集合存储在内存中。
3. 对于性能要求较高的应用，考虑使用 OpenCL 加速 MinHash 计算。
4. 在使用 MinHash 签名进行相似度估计时，确保使用相同数量的哈希函数以确保结果的可比性。

## 注意事项

- 此实现使用 `std::shared_ptr` 进行霍夫曼树节点的内存管理。
- MinHash 算法的效果取决于输入集合的大小和元素的多样性。对于元素频率相对均匀的集合，MinHash 的优势更加明显。
- 尽管此实现提供了对 MinHash 的良好理解，但在生产使用中，考虑使用经过优化和彻底测试的成熟库。
