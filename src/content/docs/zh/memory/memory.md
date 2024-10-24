---
title: 内存池
description: 详细文档，介绍 MemoryPool 类模板，包括构造函数、公共和保护方法、私有方法以及用于 C++ 中高效内存管理的使用示例。  
---

## 目录

1. [介绍](#介绍)
2. [类概述](#类概述)
3. [构造函数和析构函数](#构造函数和析构函数)
4. [公共方法](#公共方法)
5. [保护方法](#保护方法)
6. [私有方法](#私有方法)
7. [使用示例](#使用示例)

## 介绍

`MemoryPool` 类模板是一个自定义内存分配器，实现了 `std::pmr::memory_resource` 接口。它旨在高效地管理对象类型 `T` 的内存分配和释放，使用基于块的分配策略。

## 类概述

```cpp
template <typename T, size_t BlockSize = 4096>
class MemoryPool : public std::pmr::memory_resource, NonCopyable {
    // ... (类内容)
};
```

- `T`：要分配的对象类型。
- `BlockSize`：每个内存块的大小（默认为 4096 字节）。

该类继承自 `std::pmr::memory_resource` 和 `NonCopyable`，使其成为不可复制的多态内存资源。

## 构造函数和析构函数

```cpp
MemoryPool() = default;
~MemoryPool() override = default;
```

构造函数和析构函数被默认化，这意味着它们使用编译器生成的实现。

## 公共方法

### allocate

```cpp
auto allocate(size_t n) -> T*;
```

为 `n` 个类型 `T` 的对象分配内存。

- **参数：**
  - `n`：要分配空间的对象数量。
- **返回：** 指向分配内存的指针。
- **抛出：** `std::bad_alloc` 如果分配失败。

### deallocate

```cpp
void deallocate(T* p, size_t n);
```

释放之前通过 `allocate` 分配的内存。

- **参数：**
  - `p`：指向要释放的内存的指针。
  - `n`：分配内存的对象数量。

### do_is_equal

```cpp
[[nodiscard]] auto do_is_equal(const std::pmr::memory_resource& other) const noexcept -> bool override;
```

检查此内存资源是否等于另一个。

- **参数：**
  - `other`：要比较的另一个内存资源。
- **返回：** 如果内存资源是同一对象，则返回 `true`，否则返回 `false`。

## 保护方法

### do_allocate

```cpp
auto do_allocate(size_t bytes, size_t alignment) -> void* override;
```

分配指定大小和对齐的内存。

- **参数：**
  - `bytes`：要分配的字节数。
  - `alignment`：对齐要求。
- **返回：** 指向分配内存的指针。
- **抛出：** `std::bad_alloc` 如果分配失败。

### do_deallocate

```cpp
void do_deallocate(void* p, size_t bytes, size_t alignment) override;
```

释放之前通过 `do_allocate` 分配的内存。

- **参数：**
  - `p`：指向要释放的内存的指针。
  - `bytes`：分配的大小。
  - `alignment`：分配的对齐。

## 私有方法

类包括几个用于内部内存管理的私有方法：

- `maxSize()`: 返回单次分配的最大大小。
- `chunkSpace()`: 返回内存块的大小。
- `allocateFromPool()`: 尝试从现有内存池中分配。
- `deallocateToPool()`: 将内存释放回池中。
- `allocateFromChunk()`: 分配新内存块。
- `deallocateToChunk()`: 释放内存块。
- `isFromPool()`: 检查指针是否来自内存池。

## 使用示例

### 基本用法

```cpp
#include "memory_pool.hpp"
#include <iostream>

int main() {
    MemoryPool<int> pool;

    // 为 10 个整数分配内存
    int* numbers = pool.allocate(10);

    // 使用分配的内存
    for (int i = 0; i < 10; ++i) {
        numbers[i] = i * 10;
    }

    // 打印数字
    for (int i = 0; i < 10; ++i) {
        std::cout << numbers[i] << " ";
    }
    std::cout << std::endl;

    // 释放内存
    pool.deallocate(numbers, 10);

    return 0;
}
```

### 与标准容器一起使用

```cpp
#include "memory_pool.hpp"
#include <vector>
#include <memory_resource>

int main() {
    MemoryPool<int> pool;
    std::pmr::polymorphic_allocator<int> alloc(&pool);

    // 使用自定义分配器创建向量
    std::vector<int, std::pmr::polymorphic_allocator<int>> vec(alloc);

    // 向向量添加元素
    for (int i = 0; i < 100; ++i) {
        vec.push_back(i);
    }

    // 正常使用向量
    for (int num : vec) {
        std::cout << num << " ";
    }
    std::cout << std::endl;

    return 0;
}
```

### 自定义对象分配

```cpp
#include "memory_pool.hpp"
#include <iostream>

class MyClass {
public:
    MyClass(int val) : value(val) {}
    int getValue() const { return value; }
private:
    int value;
};

int main() {
    MemoryPool<MyClass> pool;

    // 为 5 个 MyClass 对象分配内存
    MyClass* objects = pool.allocate(5);

    // 在分配的内存中构造对象
    for (int i = 0; i < 5; ++i) {
        new (&objects[i]) MyClass(i * 100);
    }

    // 使用对象
    for (int i = 0; i < 5; ++i) {
        std::cout << "对象 " << i << " 的值: " << objects[i].getValue() << std::endl;
    }

    // 销毁对象并释放内存
    for (int i = 0; i < 5; ++i) {
        objects[i].~MyClass();
    }
    pool.deallocate(objects, 5);

    return 0;
}
```
