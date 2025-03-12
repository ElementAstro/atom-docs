---
title: Huffman Encoding
description: Detailed for the Huffman encoding implementation in the atom::algorithm namespace, including structures, functions, and usage examples for creating Huffman trees, generating codes, compressing, and decompressing text.
---

## Overview

This library provides a comprehensive implementation of Huffman coding, a lossless data compression algorithm. Huffman coding creates variable-length codes for input symbols, with shorter codes assigned to more frequently occurring symbols, resulting in optimal prefix coding.

## Key Features

- Efficient compression of byte data using frequency-based encoding
- Lossless decompression with complete data recovery
- Tree serialization/deserialization for storing compression metadata
- Error handling through dedicated exception classes
- Visualization tools for debugging and analysis

## Class and Structure Overview

### HuffmanException

A specialized exception class for Huffman-related errors.

```cpp
class HuffmanException : public std::runtime_error {
public:
    explicit HuffmanException(const std::string& message);
};
```

### HuffmanNode

Represents a node in the Huffman tree structure.

```cpp
struct HuffmanNode {
    unsigned char data;       // Byte stored in leaf nodes
    int frequency;            // Frequency count or sum for internal nodes
    std::shared_ptr<HuffmanNode> left;   // Left child pointer
    std::shared_ptr<HuffmanNode> right;  // Right child pointer
    
    HuffmanNode(unsigned char data, int frequency);
};
```

## API Reference

### createHuffmanTree

```cpp
auto createHuffmanTree(
    const std::unordered_map<unsigned char, int>& frequencies) 
    -> std::shared_ptr<HuffmanNode>;
```

Purpose: Creates a Huffman tree from frequency data.

Parameters:

- `frequencies`: Map of bytes to their frequency counts in the original data

Returns: Root node of the created Huffman tree

Exceptions:

- `HuffmanException`: Thrown if the frequency map is empty

Notes:

- Uses a min-heap (priority queue) to efficiently build the tree
- Handles the edge case of data containing only a single unique byte

### generateHuffmanCodes

```cpp
void generateHuffmanCodes(
    const HuffmanNode* root, 
    const std::string& code,
    std::unordered_map<unsigned char, std::string>& huffmanCodes);
```

Purpose: Generates bit codes for each byte based on the Huffman tree.

Parameters:

- `root`: Pointer to the root of the Huffman tree
- `code`: Current code string (used during recursion)
- `huffmanCodes`: Reference to map for storing the resulting codes

Exceptions:

- `HuffmanException`: Thrown if the root node is null

Notes:

- Traverses the tree recursively, adding '0' for left branches and '1' for right branches
- Handles special case for trees with a single node

### compressData

```cpp
auto compressData(
    const std::vector<unsigned char>& data,
    const std::unordered_map<unsigned char, std::string>& huffmanCodes) 
    -> std::string;
```

Purpose: Compresses byte data using the generated Huffman codes.

Parameters:

- `data`: Original byte data to compress
- `huffmanCodes`: Map of bytes to their corresponding Huffman codes

Returns: String of '0's and '1's representing the compressed data

Exceptions:

- `HuffmanException`: Thrown if a byte in the input data doesn't have a corresponding code

### decompressData

```cpp
auto decompressData(
    const std::string& compressedData,
    const HuffmanNode* root) 
    -> std::vector<unsigned char>;
```

Purpose: Decompresses data back to its original form.

Parameters:

- `compressedData`: String of '0's and '1's representing compressed data
- `root`: Pointer to the root of the Huffman tree

Returns: Vector of bytes containing the decompressed data

Exceptions:

- `HuffmanException`: Thrown if the tree is null or if the compressed data is invalid

Notes:

- Verifies that the compressed data ends at a leaf node
- Validates that only '0' and '1' characters are present in the input

### serializeTree

```cpp
auto serializeTree(const HuffmanNode* root) -> std::string;
```

Purpose: Converts the Huffman tree into a compact string representation.

Parameters:

- `root`: Pointer to the root of the Huffman tree

Returns: String representing the serialized tree structure

Exceptions:

- `HuffmanException`: Thrown if the root is null

Notes:

- Uses markers '0' for leaf nodes, '1' for null nodes, and '2' for internal nodes

### deserializeTree

```cpp
auto deserializeTree(
    const std::string& serializedTree,
    size_t& index) 
    -> std::shared_ptr<HuffmanNode>;
```

Purpose: Reconstructs a Huffman tree from its serialized representation.

Parameters:

- `serializedTree`: String containing the serialized tree data
- `index`: Current position in the serialized string (modified during recursion)

Returns: Root node of the reconstructed Huffman tree

Exceptions:

- `HuffmanException`: Thrown if the serialized format is invalid

### visualizeHuffmanTree

```cpp
void visualizeHuffmanTree(
    const HuffmanNode* root,
    const std::string& indent = "");
```

Purpose: Prints a human-readable representation of the Huffman tree structure.

Parameters:

- `root`: Pointer to the root of the Huffman tree
- `indent`: String used for indentation (increases with tree depth)

Notes:

- Useful for debugging and educational purposes
- Shows node types, byte values for leaf nodes, and frequency information

## Complete Usage Example

Here's a comprehensive example demonstrating the use of this Huffman coding library:

```cpp
#include "huffman.hpp"
#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>

int main() {
    // Sample input data
    std::string message = "hello world! this is a test message for huffman encoding.";
    std::vector<unsigned char> data(message.begin(), message.end());
    
    // Step 1: Calculate frequency of each byte
    std::unordered_map<unsigned char, int> frequencies;
    for (unsigned char byte : data) {
        frequencies[byte]++;
    }
    
    // Step 2: Create Huffman tree
    std::shared_ptr<atom::algorithm::HuffmanNode> root;
    try {
        root = atom::algorithm::createHuffmanTree(frequencies);
    } catch (const atom::algorithm::HuffmanException& e) {
        std::cerr << "Error creating Huffman tree: " << e.what() << std::endl;
        return 1;
    }
    
    // Step 3: Generate Huffman codes
    std::unordered_map<unsigned char, std::string> huffmanCodes;
    try {
        atom::algorithm::generateHuffmanCodes(root.get(), "", huffmanCodes);
    } catch (const atom::algorithm::HuffmanException& e) {
        std::cerr << "Error generating Huffman codes: " << e.what() << std::endl;
        return 1;
    }
    
    // Print the Huffman codes for reference
    std::cout << "Huffman Codes:\n";
    for (const auto& [byte, code] : huffmanCodes) {
        std::cout << "'" << (char)byte << "': " << code << "\n";
    }
    
    // Step 4: Compress the data
    std::string compressedData;
    try {
        compressedData = atom::algorithm::compressData(data, huffmanCodes);
    } catch (const atom::algorithm::HuffmanException& e) {
        std::cerr << "Error compressing data: " << e.what() << std::endl;
        return 1;
    }
    
    std::cout << "\nOriginal size: " << data.size() << " bytes" << std::endl;
    std::cout << "Compressed size: " << compressedData.size() / 8 + (compressedData.size() % 8 ? 1 : 0)
              << " bytes (with " << compressedData.size() << " bits)" << std::endl;
    
    // Step 5: Serialize the Huffman tree for storage
    std::string serializedTree;
    try {
        serializedTree = atom::algorithm::serializeTree(root.get());
    } catch (const atom::algorithm::HuffmanException& e) {
        std::cerr << "Error serializing tree: " << e.what() << std::endl;
        return 1;
    }
    
    // Step 6: Decompress the data
    std::vector<unsigned char> decompressedData;
    try {
        decompressedData = atom::algorithm::decompressData(compressedData, root.get());
    } catch (const atom::algorithm::HuffmanException& e) {
        std::cerr << "Error decompressing data: " << e.what() << std::endl;
        return 1;
    }
    
    // Verify the decompressed data matches the original
    std::string decompressedMessage(decompressedData.begin(), decompressedData.end());
    std::cout << "\nDecompressed message: " << decompressedMessage << std::endl;
    std::cout << "Decompression " << (message == decompressedMessage ? "successful" : "failed") << std::endl;
    
    // Optional: Visualize the Huffman tree
    std::cout << "\nHuffman Tree Structure:\n";
    atom::algorithm::visualizeHuffmanTree(root.get());
    
    // Demonstrate tree deserialization
    size_t index = 0;
    std::shared_ptr<atom::algorithm::HuffmanNode> reconstructedRoot;
    try {
        reconstructedRoot = atom::algorithm::deserializeTree(serializedTree, index);
        std::cout << "\nHuffman tree successfully deserialized." << std::endl;
    } catch (const atom::algorithm::HuffmanException& e) {
        std::cerr << "Error deserializing tree: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
```

## Performance Considerations

- Time Complexity:
  - Tree construction: O(n log n) where n is the number of unique bytes
  - Encoding: O(n) where n is the size of the input data
  - Decoding: O(n) where n is the size of the compressed bit string

- Space Complexity:
  - Huffman tree: O(k) where k is the number of unique bytes
  - Huffman codes table: O(k)
  - Compressed data: Depends on the data pattern and redundancy

## Compatibility Notes

The library includes conditional Boost support via the `ATOM_USE_BOOST` compile-time flag, allowing for seamless integration with Boost-based projects while maintaining standard library compatibility.
