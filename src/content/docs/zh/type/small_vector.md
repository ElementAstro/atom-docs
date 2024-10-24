---
title: SmallVector 类文档
description: StaticVector 类的全面文档，包括类定义、成员类型、构造函数、元素访问、容量管理、修改器、非成员函数和使用示例。
---

## 目录

1. [介绍](#介绍)
2. [类概述](#类概述)
3. [构造函数和析构函数](#构造函数和析构函数)
4. [元素访问](#元素访问)
5. [容量管理](#容量管理)
6. [修改器](#修改器)
7. [迭代器](#迭代器)
8. [非成员函数](#非成员函数)
9. [使用示例](#使用示例)
10. [性能考虑](#性能考虑)

## 介绍

`SmallVector` 类是 C++ 中固定容量向量的自定义实现。它提供了与 `std::vector` 类似的功能，但具有预定的最大大小，允许更高效的内存使用，并在某些场景下可能提供更好的性能。

## 类概述

```cpp
template <typename T, std::size_t N>
class SmallVector {
    // ... (实现细节)
};
```

## 成员类型

- `value_type`: 存储的元素类型 (`T`)
- `size_type`: 用于大小和索引的无符号整数类型 (`std::size_t`)
- `difference_type`: 用于迭代器之间差异的有符号整数类型 (`std::ptrdiff_t`)
- `reference`: 对 `value_type` 的引用 (`value_type&`)
- `const_reference`: 对 `value_type` 的常量引用 (`const value_type&`)
- `pointer`: 对 `value_type` 的指针 (`value_type*`)
- `const_pointer`: 对 `value_type` 的常量指针 (`const value_type*`)
- `iterator`: 随机访问迭代器 (`pointer`)
- `const_iterator`: 常量随机访问迭代器 (`const_pointer`)
- `reverse_iterator`: 反向迭代器 (`std::reverse_iterator<iterator>`)
- `const_reverse_iterator`: 常量反向迭代器 (`std::reverse_iterator<const_iterator>`)

## 构造函数和析构函数

1. 默认构造函数：

   ```cpp
   SmallVector() = default;
   ```

2. 范围构造函数：

   ```cpp
   template <std::input_iterator InputIt>
   SmallVector(InputIt first, InputIt last);
   ```

3. 填充构造函数：

   ```cpp
   explicit SmallVector(size_type count, const T& value = T());
   ```

4. 初始化列表构造函数：

   ```cpp
   SmallVector(std::initializer_list<T> init);
   ```

5. 拷贝构造函数：

   ```cpp
   SmallVector(const SmallVector& other);
   ```

6. 移动构造函数：

   ```cpp
   SmallVector(SmallVector&& other) noexcept;
   ```

7. 析构函数：

   ```cpp
   ~SmallVector();
   ```

8. 拷贝赋值运算符：

   ```cpp
   auto operator=(const SmallVector& other) -> SmallVector&;
   ```

9. 移动赋值运算符：

   ```cpp
   auto operator=(SmallVector&& other) noexcept -> SmallVector&;
   ```

10. 初始化列表赋值运算符：

    ```cpp
    auto operator=(std::initializer_list<T> init) -> SmallVector&;
    ```

## 元素访问

1. 访问元素（无边界检查）：

   ```cpp
   [[nodiscard]] auto operator[](size_type index) noexcept -> reference;
   [[nodiscard]] auto operator[](size_type index) const noexcept -> const_reference;
   ```

2. 访问元素（带边界检查）：

   ```cpp
   [[nodiscard]] auto at(size_type index) -> reference;
   [[nodiscard]] auto at(size_type index) const -> const_reference;
   ```

3. 访问第一个元素：

   ```cpp
   [[nodiscard]] auto front() -> reference;
   [[nodiscard]] auto front() const -> const_reference;
   ```

4. 访问最后一个元素：

   ```cpp
   [[nodiscard]] auto back() -> reference;
   [[nodiscard]] auto back() const -> const_reference;
   ```

5. 访问底层数组：

   ```cpp
   [[nodiscard]] auto data() noexcept -> pointer;
   [[nodiscard]] auto data() const noexcept -> const_pointer;
   ```

## 容量管理

1. 检查向量是否为空：

   ```cpp
   [[nodiscard]] auto empty() const noexcept -> bool;
   ```

2. 获取元素数量：

   ```cpp
   [[nodiscard]] auto size() const noexcept -> size_type;
   ```

3. 获取最大可能的元素数量：

   ```cpp
   [[nodiscard]] auto maxSize() const noexcept -> size_type;
   ```

4. 保留容量：

   ```cpp
   void reserve(size_type new_cap);
   ```

5. 获取当前容量：

   ```cpp
   [[nodiscard]] auto capacity() const noexcept -> size_type;
   ```

## 修改器

1. 清空内容：

   ```cpp
   void clear() noexcept;
   ```

2. 插入元素：

   ```cpp
   auto insert(const_iterator pos, const T& value) -> iterator;
   auto insert(const_iterator pos, T&& value) -> iterator;
   auto insert(const_iterator pos, size_type count, const T& value) -> iterator;
   template <std::input_iterator InputIt>
   auto insert(const_iterator pos, InputIt first, InputIt last) -> iterator;
   auto insert(const_iterator pos, std::initializer_list<T> init) -> iterator;
   ```

3. 原地构造元素：

   ```cpp
   template <typename... Args>
   auto emplace(const_iterator pos, Args&&... args) -> iterator;
   ```

4. 删除元素：

   ```cpp
   auto erase(const_iterator pos) -> iterator;
   auto erase(const_iterator first, const_iterator last) -> iterator;
   ```

5. 向末尾添加元素：

   ```cpp
   void pushBack(const T& value);
   void pushBack(T&& value);
   ```

6. 在末尾原地构造元素：

   ```cpp
   template <typename... Args>
   auto emplaceBack(Args&&... args) -> reference;
   ```

7. 移除最后一个元素：

   ```cpp
   void popBack();
   ```

8. 调整向量大小：

   ```cpp
   void resize(size_type count, const T& value = T());
   ```

9. 与另一个 StaticVector 交换内容：

   ```cpp
   void swap(SmallVector& other) noexcept;
   ```

## 非成员函数

1. 相等运算符：

   ```cpp
   template <typename T, std::size_t N>
   constexpr auto operator==(const SmallVector<T, N>& lhs,
                             const SmallVector<T, N>& rhs) -> bool;
   ```

2. 三元比较运算符：

   ```cpp
   template <typename T, std::size_t N>
   constexpr auto operator<=>(const SmallVector<T, N>& lhs,
                              const SmallVector<T, N>& rhs) -> bool;
   ```

3. 非成员交换：

   ```cpp
   template <typename T, std::size_t N>
   void swap(SmallVector<T, N>& lhs, SmallVector<T, N>& rhs) noexcept;
   ```

## 使用示例

以下是一些示例，演示如何使用 `SmallVector` 类：

```cpp
#include "small_vector.hpp"
#include <iostream>
#include <string>

int main() {
    // 创建一个容量为 5 的整数 SmallVector
    SmallVector<int, 5> intVector;

    // 向向量添加元素
    intVector.pushBack(1);
    intVector.pushBack(2);
    intVector.pushBack(3);

    // 打印向量
    std::cout << "向量内容: ";
    for (const auto& value : intVector) {
        std::cout << value << " ";
    }
    std::cout << std::endl;

    // 使用初始化列表构造
    SmallVector<std::string, 4> stringVector {"apple", "banana", "cherry"};

    // 插入元素
    stringVector.emplaceBack("date");

    // 打印字符串向量
    std::cout << "字符串向量: ";
    for (const auto& str : stringVector) {
        std::cout << str << " ";
    }
    std::cout << std::endl;

    // 演示容量和大小
    std::cout << "容量: " << stringVector.capacity() << std::endl;
    std::cout << "大小: " << stringVector.size() << std::endl;

    // 访问元素
    std::cout << "第一个元素: " << stringVector.front() << std::endl;
    std::cout << "最后一个元素: " << stringVector.back() << std::endl;
    std::cout << "索引 2 的元素: " << stringVector.at(2) << std::endl;

    // 修改元素
    stringVector[1] = "blueberry";

    // 移除最后一个元素
    stringVector.popBack();

    // 打印修改后的向量
    std::cout << "修改后的字符串向量: ";
    for (const auto& str : stringVector) {
        std::cout << str << " ";
    }
    std::cout << std::endl;

    // 演示迭代器
    std::cout << "反向顺序: ";
    for (auto it = stringVector.rbegin(); it != stringVector.rend(); ++it) {
        std::cout << *it << " ";
    }
    std::cout << std::endl;

    // 使用算法与 SmallVector
    SmallVector<int, 10> numbers {5, 2, 8, 1, 9};
    std::sort(numbers.begin(), numbers.end());

    std::cout << "排序后的数字: ";
    for (const auto& num : numbers) {
        std::cout << num << " ";
    }
    std::cout << std::endl;

    // 演示比较运算符
    SmallVector<int, 5> vec1 {1, 2, 3};
    SmallVector<int, 5> vec2 {1, 2, 3};
    SmallVector<int, 5> vec3 {1, 2, 3, 4};

    std::cout << "vec1 == vec2: " << (vec1 == vec2) << std::endl;
    std::cout << "vec1 < vec3: " << (vec1 < vec3) << std::endl;

    // 演示交换
    swap(vec1, vec3);
    std::cout << "交换后，vec1 大小: " << vec1.size() << ", vec3 大小: " << vec3.size() << std::endl;

    return 0;
}
```

## 性能考虑

1. **查找性能**：`StaticVector` 使用线性搜索进行查找。这在小到中等大小的容器中是高效的，但对于非常大的数据集可能不适合。

2. **插入性能**：插入操作在向量的末尾执行，这使得插入操作高效。然而，这意味着容器在插入时不会保持排序，可能会影响查找性能。

3. **内存效率**：使用向量作为底层容器提供了更好的缓存局部性和内存效率，尤其是在小到中等大小的集合中。

4. **使用场景**：`StaticVector` 最适合以下情况：

   - 元素数量较少到中等。
   - 查找操作不如插入或迭代频繁。
   - 需要更好的内存效率和缓存性能。

5. **自定义比较器**：使用自定义比较器的能力允许灵活的键比较，这在处理不区分大小写的字符串键或自定义对象比较的场景中非常有用。
