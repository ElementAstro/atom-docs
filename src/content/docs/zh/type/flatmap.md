---
title: atom::type::QuickFlatMap 和 QuickFlatMultiMap 文档
description: atom::type 命名空间中 QuickFlatMap 和 QuickFlatMultiMap 类的全面文档，包括模板参数、成员函数、使用示例和性能考虑。
---

# atom::type::QuickFlatMap 和 QuickFlatMultiMap 文档

`atom::type` 命名空间提供了两个扁平映射实现：`QuickFlatMap` 和 `QuickFlatMultiMap`。这些类使用排序的向量作为底层容器，提供高效的键值存储。

## 目录

1. [概述](#概述)
2. [QuickFlatMap](#quickflatmap)
   - [模板参数](#模板参数)
   - [成员函数](#成员函数)
   - [使用示例](#quickflatmap-使用示例)
3. [QuickFlatMultiMap](#quickflatmultimap)
   - [模板参数](#模板参数-1)
   - [成员函数](#成员函数-1)
   - [使用示例](#quickflatmultimap-使用示例)
4. [性能考虑](#性能考虑)

## 概述

`QuickFlatMap` 和 `QuickFlatMultiMap` 旨在提供快速查找时间，同时保持较小的内存占用。它们使用排序的向量作为底层容器，这允许进行缓存友好的操作和高效的内存使用。

## QuickFlatMap

`QuickFlatMap` 是一种扁平映射实现，用于存储唯一的键值对。

### 模板参数

```cpp
template <typename Key, typename Value, typename Comparator = std::equal_to<>>
```

- `Key`: 映射中键的类型。
- `Value`: 映射中值的类型。
- `Comparator`: 定义键之间相等性的二元谓词（默认是 `std::equal_to<>`）。

### 成员函数

- `find`: 查找具有指定键的元素。
- `size`: 返回映射中元素的数量。
- `empty`: 检查映射是否为空。
- `begin`, `end`: 返回映射的开始和结束迭代器。
- `operator[]`: 访问或插入具有给定键的元素。
- `atIndex`: 访问指定索引的值。
- `at`: 进行边界检查访问元素。
- `insertOrAssign`: 插入新元素或分配给现有元素。
- `insert`: 将新元素插入映射中。
- `assign`: 将一系列元素分配给映射。
- `contains`: 检查映射是否包含特定键。
- `erase`: 移除具有指定键的元素。

### QuickFlatMap 使用示例

```cpp
#include "flatmap.hpp"
#include <iostream>
#include <string>

int main() {
    atom::type::QuickFlatMap<std::string, int> map;

    // 插入元素
    map.insert({"apple", 5});
    map.insert({"banana", 3});
    map["cherry"] = 7;

    // 访问元素
    std::cout << "Value of 'apple': " << map["apple"] << std::endl;
    std::cout << "Value of 'banana': " << map.at("banana") << std::endl;

    // 检查键是否存在
    if (map.contains("cherry")) {
        std::cout << "Cherry exists in the map" << std::endl;
    }

    // 遍历映射
    for (const auto& [key, value] : map) {
        std::cout << key << ": " << value << std::endl;
    }

    // 删除元素
    map.erase("banana");

    // 使用 insertOrAssign
    map.insertOrAssign("date", 4);

    // 按索引访问
    std::cout << "First element value: " << map.atIndex(0) << std::endl;

    return 0;
}
```

## QuickFlatMultiMap

`QuickFlatMultiMap` 是一种扁平多映射实现，允许同一键的多个值。

### 模板参数

```cpp
template <typename Key, typename Value, typename Comparator = std::equal_to<>>
```

- `Key`: 多映射中键的类型。
- `Value`: 多映射中值的类型。
- `Comparator`: 定义键之间相等性的二元谓词（默认是 `std::equal_to<>`）。

### 成员函数

- `find`: 查找具有指定键的元素。
- `equalRange`: 查找具有指定键的元素范围。
- `size`: 返回多映射中元素的数量。
- `empty`: 检查多映射是否为空。
- `begin`, `end`: 返回多映射的开始和结束迭代器。
- `operator[]`: 访问或插入具有给定键的元素。
- `atIndex`: 访问指定索引的值。
- `at`: 进行边界检查访问元素。
- `insert`: 将新元素插入多映射中。
- `assign`: 将一系列元素分配给多映射。
- `count`: 计算具有指定键的元素数量。
- `contains`: 检查多映射是否包含特定键。
- `erase`: 移除所有具有指定键的元素。

### QuickFlatMultiMap 使用示例

```cpp
#include "flatmap.hpp"
#include <iostream>
#include <string>

int main() {
    atom::type::QuickFlatMultiMap<std::string, int> multimap;

    // 插入元素
    multimap.insert({"apple", 5});
    multimap.insert({"apple", 7});
    multimap.insert({"banana", 3});
    multimap["cherry"] = 7;

    // 访问元素
    std::cout << "First value of 'apple': " << multimap["apple"] << std::endl;

    // 计算特定键的元素数量
    std::cout << "Number of 'apple' entries: " << multimap.count("apple") << std::endl;

    // 遍历所有元素
    for (const auto& [key, value] : multimap) {
        std::cout << key << ": " << value << std::endl;
    }

    // 使用 equalRange 遍历具有特定键的元素
    auto [begin, end] = multimap.equalRange("apple");
    std::cout << "All 'apple' values:" << std::endl;
    for (auto it = begin; it != end; ++it) {
        std::cout << it->second << " ";
    }
    std::cout << std::endl;

    // 删除所有具有特定键的元素
    multimap.erase("apple");

    // 检查键是否存在
    if (multimap.contains("banana")) {
        std::cout << "Banana exists in the multimap" << std::endl;
    }

    return 0;
}
```

## 性能考虑

1. **查找性能**：`QuickFlatMap` 和 `QuickFlatMultiMap` 使用线性搜索进行查找。这在小到中等大小的容器中是高效的，但对于非常大的数据集可能不适合。

2. **插入性能**：插入操作始终在向量的末尾执行，这很高效。然而，这意味着容器不会保持排序，这会影响查找性能。

3. **内存效率**：这些实现使用向量作为底层容器，相较于基于节点的容器（如 `std::map` 或 `std::unordered_map`），提供更好的缓存局部性和内存效率。

4. **使用场景**：这些容器最适合以下情况：

   - 元素数量较少到中等。
   - 查找操作不如插入或迭代频繁。
   - 内存效率和缓存性能很重要。

5. **自定义比较器**：使用自定义比较器的能力允许灵活的键比较，这在涉及不区分大小写的字符串键或自定义对象比较的场景中非常有用。