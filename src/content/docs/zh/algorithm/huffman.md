---
title: 霍夫曼编码
description: 霍夫曼编码实现的详细文档，包括创建霍夫曼树、生成编码、压缩和解压缩文本的结构、函数和使用示例
---

## 命名空间

所有结构和函数都定义在 `atom::algorithm` 命名空间中。

```cpp
namespace atom::algorithm {
    // ...
}
```

## 结构

### HuffmanNode

```cpp
struct HuffmanNode {
    char data;
    int frequency;
    std::shared_ptr<HuffmanNode> left;
    std::shared_ptr<HuffmanNode> right;

    explicit HuffmanNode(char data, int frequency);
};
```

表示霍夫曼树中的一个节点。

- **成员：**

  - `data`：存储在该节点中的字符（仅在叶节点使用）。
  - `frequency`：字符的频率或内部节点的频率总和。
  - `left`：指向左子节点的指针。
  - `right`：指向右子节点的指针。

- **构造函数：**
  - `HuffmanNode(char data, int frequency)`：使用给定的字符和频率构造一个新的霍夫曼节点。

## 函数

### createHuffmanTree

```cpp
[[nodiscard]] auto createHuffmanTree(
    const std::unordered_map<char, int>& frequencies)
    -> std::shared_ptr<HuffmanNode>;
```

根据字符的频率创建霍夫曼树。

- **参数：**
  - `frequencies`：字符及其对应频率的映射。
- **返回值：** 指向霍夫曼树根节点的共享指针。
- **描述：** 此函数使用输入文本中字符的频率构建霍夫曼树。它使用优先队列从底部向上构建树，通过合并两个频率最低的节点，直到只剩下一个节点，该节点成为根节点。

### generateHuffmanCodes

```cpp
void generateHuffmanCodes(const HuffmanNode* root, const std::string& code,
                          std::unordered_map<char, std::string>& huffmanCodes);
```

根据霍夫曼树生成每个字符的霍夫曼编码。

- **参数：**
  - `root`：指向霍夫曼树根节点的指针。
  - `code`：在遍历过程中生成的当前霍夫曼编码。
  - `huffmanCodes`：引用到一个映射，其中将存储字符及其对应的霍夫曼编码。
- **描述：** 此函数递归遍历霍夫曼树，并为每个字符分配一个二进制编码。这些编码是根据到达字符的路径生成的：左子节点给出 '0'，右子节点给出 '1'。

### compressText

```cpp
[[nodiscard]] auto compressText(
    std::string_view TEXT,
    const std::unordered_map<char, std::string>& huffmanCodes) -> std::string;
```

使用霍夫曼编码压缩文本。

- **参数：**
  - `TEXT`：要压缩的原始文本。
  - `huffmanCodes`：字符及其对应霍夫曼编码的映射。
- **返回值：** 表示压缩文本的字符串。
- **描述：** 此函数将文本字符串转换为基于提供的霍夫曼编码的二进制编码字符串。输入文本中的每个字符都被其对应的霍夫曼编码替换。

### decompressText

```cpp
[[nodiscard]] auto decompressText(std::string_view COMPRESSED_TEXT,
                                  const HuffmanNode* root) -> std::string;
```

将霍夫曼编码的文本解压缩回其原始形式。

- **参数：**
  - `COMPRESSED_TEXT`：霍夫曼编码的文本。
  - `root`：指向霍夫曼树根节点的指针。
- **返回值：** 原始解压缩文本。
- **描述：** 此函数使用提供的霍夫曼树将二进制编码字符串解码回原始文本。它根据二进制字符串从根节点遍历霍夫曼树到叶节点，重建原始文本。

## 使用示例

以下示例演示如何使用霍夫曼编码函数：

```cpp
#include "huffman.hpp"
#include <iostream>
#include <unordered_map>

int main() {
    // 要压缩的示例文本
    std::string text = "hello world";

    // 第一步：计算字符频率
    std::unordered_map<char, int> frequencies;
    for (char c : text) {
        frequencies[c]++;
    }

    // 第二步：创建霍夫曼树
    auto root = atom::algorithm::createHuffmanTree(frequencies);

    // 第三步：生成霍夫曼编码
    std::unordered_map<char, std::string> huffmanCodes;
    atom::algorithm::generateHuffmanCodes(root.get(), "", huffmanCodes);

    // 第四步：压缩文本
    std::string compressedText = atom::algorithm::compressText(text, huffmanCodes);

    std::cout << "原始文本: " << text << std::endl;
    std::cout << "压缩文本: " << compressedText << std::endl;

    // 第五步：解压缩文本
    std::string decompressedText = atom::algorithm::decompressText(compressedText, root.get());

    std::cout << "解压缩文本: " << decompressedText << std::endl;

    return 0;
}
```

此示例演示了霍夫曼编码的完整过程：

1. 计算字符频率
2. 创建霍夫曼树
3. 生成霍夫曼编码
4. 压缩文本
5. 解压缩文本

## 最佳实践

1. 确保压缩的输入文本不为空，以避免未定义行为。
2. 在处理大型文本时，考虑使用文件 I/O，而不是将整个文本存储在内存中。
3. 在实际应用中，为了提高效率，考虑对压缩数据执行位级操作，而不是使用 '0' 和 '1' 的字符串。
4. 始终将霍夫曼树或其序列化版本与压缩数据一起保留，因为解压缩时需要它。

## 注意事项

- 此实现使用 `std::shared_ptr` 进行霍夫曼树节点的内存管理。
- 压缩效果取决于输入文本中字符的频率分布。当字符频率存在显著差异时，效果最佳。
- 尽管此实现提供了对霍夫曼编码的良好理解，但在生产使用中，考虑使用经过优化和彻底测试的成熟库。
