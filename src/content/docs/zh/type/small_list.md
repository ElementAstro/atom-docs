---
title: SmallList 类文档
description: SmallList 类的全面文档，包括构造函数、元素访问、容量管理、修改器、操作、迭代器和使用示例。
---

## 目录

1. [介绍](#介绍)
2. [类概述](#类概述)
3. [构造函数和析构函数](#构造函数和析构函数)
4. [元素访问](#元素访问)
5. [容量管理](#容量管理)
6. [修改器](#修改器)
7. [操作](#操作)
8. [迭代器](#迭代器)
9. [使用示例](#使用示例)

## 介绍

`SmallList` 类是 C++ 中双向链表的自定义实现。它提供与 `std::list` 类似的功能，但旨在为小型元素集合提供更轻量和高效的实现。

## 类概述

```cpp
namespace atom::type {

template <typename T>
class SmallList {
    // ... (实现细节)
};

}  // namespace atom::type
```

## 构造函数和析构函数

1. 默认构造函数：

   ```cpp
   constexpr SmallList() noexcept;
   ```

2. 初始化列表构造函数：

   ```cpp
   constexpr SmallList(std::initializer_list<T> init_list);
   ```

3. 拷贝构造函数：

   ```cpp
   SmallList(const SmallList& other);
   ```

4. 移动构造函数：

   ```cpp
   SmallList(SmallList&& other) noexcept;
   ```

5. 拷贝赋值运算符：

   ```cpp
   SmallList& operator=(SmallList other) noexcept;
   ```

6. 析构函数：

   ```cpp
   ~SmallList() noexcept;
   ```

## 元素访问

1. 访问第一个元素：

   ```cpp
   constexpr T& front() noexcept;
   constexpr const T& front() const noexcept;
   ```

2. 访问最后一个元素：

   ```cpp
   constexpr T& back() noexcept;
   constexpr const T& back() const noexcept;
   ```

## 容量管理

1. 检查列表是否为空：

   ```cpp
   ATOM_NODISCARD constexpr bool empty() const noexcept;
   ```

2. 获取元素数量：

   ```cpp
   ATOM_NODISCARD constexpr size_t size() const noexcept;
   ```

## 修改器

1. 向末尾添加元素：

   ```cpp
   constexpr void pushBack(const T& value);
   ```

2. 向前添加元素：

   ```cpp
   constexpr void pushFront(const T& value);
   ```

3. 移除最后一个元素：

   ```cpp
   constexpr void popBack() noexcept;
   ```

4. 移除第一个元素：

   ```cpp
   constexpr void popFront() noexcept;
   ```

5. 在特定位置插入元素：

   ```cpp
   void insert(Iterator pos, const T& value);
   ```

6. 删除特定位置的元素：

   ```cpp
   Iterator erase(Iterator pos) noexcept;
   ```

7. 清空所有元素：

   ```cpp
   constexpr void clear() noexcept;
   ```

8. 在末尾原地构造元素：

   ```cpp
   template <typename... Args>
   void emplaceBack(Args&&... args);
   ```

9. 在前面原地构造元素：

   ```cpp
   template <typename... Args>
   void emplaceFront(Args&&... args);
   ```

10. 在特定位置原地构造元素：

    ```cpp
    template <typename... Args>
    Iterator emplace(Iterator pos, Args&&... args);
    ```

## 操作

1. 移除特定值的所有元素：

   ```cpp
   void remove(const T& value);
   ```

2. 移除连续的重复元素：

   ```cpp
   void unique();
   ```

3. 对元素进行排序：

   ```cpp
   void sort();
   ```

4. 与另一个列表交换内容：

   ```cpp
   void swap(SmallList<T>& other) noexcept;
   ```

## 迭代器

1. 获取指向开头的迭代器：

   ```cpp
   [[nodiscard]] constexpr auto begin() noexcept -> iterator;
   ```

2. 获取指向结尾的迭代器：

   ```cpp
   [[nodiscard]] constexpr auto end() noexcept -> iterator;
   ```

3. 获取指向开头的反向迭代器：

   ```cpp
   [[nodiscard]] constexpr auto rbegin() noexcept -> reverse_iterator;
   ```

4. 获取指向结尾的反向迭代器：

   ```cpp
   [[nodiscard]] constexpr auto rend() noexcept -> reverse_iterator;
   ```

## 使用示例

以下是一些示例，演示如何使用 `SmallList` 类：

```cpp
#include "small_vector.hpp"
#include <iostream>
#include <string>

int main() {
    // 创建一个整数的 SmallList
    atom::type::SmallList<int> intList;

    // 向列表添加元素
    intList.pushBack(1);
    intList.pushBack(2);
    intList.pushFront(0);

    // 打印列表
    std::cout << "列表内容: ";
    for (const auto& value : intList) {
        std::cout << value << " ";
    }
    std::cout << std::endl;

    // 访问元素
    std::cout << "第一个元素: " << intList.front() << std::endl;
    std::cout << "最后一个元素: " << intList.back() << std::endl;

    // 使用初始化列表构造
    atom::type::SmallList<std::string> stringList {"apple", "banana", "cherry"};

    // 插入元素
    auto it = stringList.begin();
    ++it;
    stringList.insert(it, "blueberry");

    // 打印字符串列表
    std::cout << "字符串列表: ";
    for (const auto& str : stringList) {
        std::cout << str << " ";
    }
    std::cout << std::endl;

    // 移除元素
    stringList.remove("banana");

    // 对列表进行排序
    stringList.sort();

    // 打印排序后的列表
    std::cout << "排序后的字符串列表: ";
    for (const auto& str : stringList) {
        std::cout << str << " ";
    }
    std::cout << std::endl;

    // 演示 unique() 函数
    atom::type::SmallList<int> duplicateList {1, 2, 2, 3, 3, 3, 4, 5, 5};
    duplicateList.unique();

    std::cout << "去除连续重复后的列表: ";
    for (const auto& value : duplicateList) {
        std::cout << value << " ";
    }
    std::cout << std::endl;

    // 演示 emplace 操作
    atom::type::SmallList<std::pair<int, std::string>> pairList;
    pairList.emplaceBack(1, "one");
    pairList.emplaceFront(0, "zero");
    auto pairIt = pairList.begin();
    ++pairIt;
    pairList.emplace(pairIt, 2, "two");

    std::cout << "对列表: ";
    for (const auto& pair : pairList) {
        std::cout << "(" << pair.first << ", " << pair.second << ") ";
    }
    std::cout << std::endl;

    return 0;
}
```

此示例演示了：

1. 创建 `SmallList` 对象并添加元素。
2. 使用 `pushBack` 和 `pushFront` 方法插入元素。
3. 访问元素并打印列表内容。
4. 使用初始化列表构造 `SmallList`。
5. 使用 `remove` 方法删除元素。
6. 使用 `sort` 方法对列表进行排序。
7. 使用 `unique` 方法去除连续重复元素。
8. 使用 `emplace` 方法在特定位置插入元素。

## 性能考虑

1. **查找性能**：`SmallList` 使用线性搜索进行查找。这在小到中等大小的容器中是高效的，但对于非常大的数据集可能不适合。

2. **插入性能**：插入操作在链表的头部或尾部进行，这使得插入操作高效。然而，这意味着容器在插入时不会保持排序，可能会影响查找性能。

3. **内存效率**：使用链表作为底层容器提供了更好的内存效率，尤其是在元素数量较少时。

4. **使用场景**：`SmallList` 最适合以下情况：

   - 元素数量较少到中等。
   - 需要频繁插入和删除操作。
   - 需要在不频繁查找的情况下存储数据。
