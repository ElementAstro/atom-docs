---
title: 平凡Vector
description: Comprehensive for the PodVector class in the atom::type namespace, including class definition, member types, constructors, capacity management, element access, iterators, modifiers, other member functions, and usage examples.
---

## 目录

1. [介绍](#介绍)
2. [类定义](#类定义)
3. [成员类型](#成员类型)
4. [构造函数](#构造函数)
5. [容量](#容量)
6. [元素访问](#元素访问)
7. [迭代器](#迭代器)
8. [修改器](#修改器)
9. [其他成员函数](#其他成员函数)
10. [示例](#示例)

## 介绍

`PodVector` 类是一个专门为 POD（Plain Old Data）类型设计的动态数组的自定义实现。它提供了与 `std::vector` 类似的功能，但针对 POD 类型进行了优化，在某些场景下提供更好的性能。

## 类定义

```cpp
namespace atom::type {

template <PodType T, int Growth = 2>
class PodVector {
    // ... (实现细节)
};

}  // namespace atom::type
```

`PodVector` 类定义在 `atom::type` 命名空间中，并接受两个模板参数：

- `T`：存储在向量中的元素类型（必须满足 `PodType` 概念）
- `Growth`：容量扩展的增长因子（默认值为 2）

## 成员类型

- `size_type`：表示大小和索引的 `int` 别名
- `iterator`：`PodVector` 的随机访问迭代器
- `const_iterator`：`PodVector` 的常量随机访问迭代器

## 构造函数

1. 默认构造函数：

   ```cpp
   constexpr PodVector() noexcept = default;
   ```

2. 初始化列表构造函数：

   ```cpp
   constexpr PodVector(std::initializer_list<T> il);
   ```

3. 大小构造函数：

   ```cpp
   explicit constexpr PodVector(int size);
   ```

4. 拷贝构造函数：

   ```cpp
   PodVector(const PodVector& other);
   ```

5. 移动构造函数：

   ```cpp
   PodVector(PodVector&& other) noexcept;
   ```

## 容量

- `empty()`：检查向量是否为空
- `size()`：获取元素数量
- `capacity()`：获取当前容量
- `reserve(int cap)`：为至少 `cap` 个元素保留容量
- `resize(int size)`：调整向量大小以包含 `size` 个元素

## 元素访问

- `operator[](int index)`：访问指定索引的元素
- `back()`：访问最后一个元素
- `data()`：获取指向底层数组的指针

## 迭代器

- `begin()`：返回指向开头的迭代器
- `end()`：返回指向末尾的迭代器
- `begin() const`：返回指向开头的常量迭代器
- `end() const`：返回指向末尾的常量迭代器

## 修改器

- `pushBack(ValueT&& t)`：在末尾添加元素
- `emplaceBack(Args&&... args)`：在末尾就地构造元素
- `popBack()`：移除最后一个元素
- `popxBack()`：移除并返回最后一个元素
- `extend(const PodVector& other)`：从另一个 PodVector 追加元素
- `extend(const T* begin, const T* end)`：从范围追加元素
- `insert(int i, ValueT&& val)`：在指定位置插入元素
- `erase(int i)`：移除指定位置的元素
- `clear()`：移除所有元素
- `reverse()`：反转元素的顺序

## 其他成员函数

- `detach()`：从向量中分离底层数组

## 示例

以下是一些演示 `PodVector` 类用法的示例：

```cpp
#include "pod_vector.hpp"
#include <iostream>

int main() {
    // 创建一个整数的 PodVector
    atom::type::PodVector<int> vec;

    // 添加元素
    vec.pushBack(1);
    vec.pushBack(2);
    vec.pushBack(3);

    // 使用初始化列表构造函数
    atom::type::PodVector<int> vec2 = {4, 5, 6};

    // 用 vec2 扩展 vec
    vec.extend(vec2);

    // 打印元素
    for (const auto& elem : vec) {
        std::cout << elem << " ";
    }
    std::cout << std::endl;

    // 访问元素
    std::cout << "第一个元素: " << vec[0] << std::endl;
    std::cout << "最后一个元素: " << vec.back() << std::endl;

    // 修改元素
    vec[0] = 10;

    // 插入和删除
    vec.insert(2, 100);
    vec.erase(4);

    // 反转向量
    vec.reverse();

    // 打印修改后的元素
    for (const auto& elem : vec) {
        std::cout << elem << " ";
    }
    std::cout << std::endl;

    // 使用自定义 POD 类型
    struct Point {
        int x;
        int y;
    };

    atom::type::PodVector<Point> points;
    points.emplaceBack(1, 2);
    points.emplaceBack(3, 4);

    for (const auto& point : points) {
        std::cout << "(" << point.x << ", " << point.y << ") ";
    }
    std::cout << std::endl;

    return 0;
}
```
