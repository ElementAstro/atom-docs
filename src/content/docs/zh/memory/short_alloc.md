---
title: 快速分配器
description: Comprehensive for the ShortAlloc library, including the Arena and ShortAlloc classes, allocateUnique function, and usage examples for fixed-size memory allocation in C++.
---

## 目录

1. [介绍](#介绍)
2. [Arena 类](#arena-类)
3. [ShortAlloc 类](#shortalloc-类)
4. [allocateUnique 函数](#allocateunique-函数)
5. [使用示例](#使用示例)

## 介绍

`ShortAlloc` 库提供了一种固定大小的内存分配器，旨在解决性能和内存碎片问题。它包括两个主要组件：`Arena` 类，管理固定大小的内存缓冲区，以及 `ShortAlloc` 类，作为与 C++ 标准库容器兼容的分配器接口。

## Arena 类

`Arena` 类管理固定大小的内存缓冲区，并提供分配和释放功能。

### 模板参数

- `N`：固定大小内存 Arena 的大小（以字节为单位）。
- `alignment`：内存分配的对齐要求（默认：`alignof(std::max_align_t)`）。

### 公共方法

```cpp
Arena() ATOM_NOEXCEPT;
~Arena();
void* allocate(std::size_t n);
void deallocate(void* p, std::size_t n) ATOM_NOEXCEPT;
static ATOM_CONSTEXPR std::size_t size() ATOM_NOEXCEPT;
std::size_t used() const ATOM_NOEXCEPT;
void reset() ATOM_NOEXCEPT;
```

## ShortAlloc 类

`ShortAlloc` 类是一个使用 `Arena` 进行内存管理的分配器。它设计用于与 C++ 标准库容器一起使用。

### 模板参数

- `T`：要分配的对象类型。
- `N`：固定大小内存 Arena 的大小（以字节为单位）。
- `Align`：内存分配的对齐要求（默认：`alignof(std::max_align_t)`）。

### 公共方法

```cpp
explicit ShortAlloc(arena_type& a) ATOM_NOEXCEPT;
template <class U>
explicit ShortAlloc(const ShortAlloc<U, N, ALIGNMENT>& a) ATOM_NOEXCEPT;
T* allocate(std::size_t n);
void deallocate(T* p, std::size_t n) ATOM_NOEXCEPT;
template <class U, class... Args>
void construct(U* p, Args&&... args);
template <class U>
void destroy(U* p);
```

## allocateUnique 函数

`allocateUnique` 函数使用自定义分配器创建一个 `std::unique_ptr`。

```cpp
template <typename Alloc, typename T, typename... Args>
std::unique_ptr<T, std::function<void(T*)>> allocateUnique(Alloc& alloc, Args&&... args);
```

## 使用示例

### 基本用法与 std::vector

```cpp
#include "short_alloc.hpp"
#include <vector>
#include <iostream>

int main() {
    constexpr std::size_t N = 1024; // Arena 的大小（以字节为单位）
    atom::memory::Arena<N> arena;

    using IntAlloc = atom::memory::ShortAlloc<int, N>;
    std::vector<int, IntAlloc> vec((IntAlloc(arena)));

    for (int i = 0; i < 10; ++i) {
        vec.push_back(i);
    }

    for (int num : vec) {
        std::cout << num << " ";
    }
    std::cout << std::endl;

    return 0;
}
```

### 使用 ShortAlloc 与 std::map

```cpp
#include "short_alloc.hpp"
#include <map>
#include <string>
#include <iostream>

int main() {
    constexpr std::size_t N = 4096; // Arena 的大小（以字节为单位）
    atom::memory::Arena<N> arena;

    using PairType = std::pair<const std::string, int>;
    using MapAlloc = atom::memory::ShortAlloc<PairType, N>;
    std::map<std::string, int, std::less<>, MapAlloc> myMap((MapAlloc(arena)));

    myMap["one"] = 1;
    myMap["two"] = 2;
    myMap["three"] = 3;

    for (const auto& [key, value] : myMap) {
        std::cout << key << ": " << value << std::endl;
    }

    return 0;
}
```

### 使用 allocateUnique

```cpp
#include "short_alloc.hpp"
#include <iostream>

class MyClass {
public:
    MyClass(int value) : value_(value) {
        std::cout << "MyClass constructed with value: " << value_ << std::endl;
    }
    ~MyClass() {
        std::cout << "MyClass destructed with value: " << value_ << std::endl;
    }
    int getValue() const { return value_; }

private:
    int value_;
};

int main() {
    constexpr std::size_t N = 1024;
    atom::memory::Arena<N> arena;
    atom::memory::ShortAlloc<MyClass, N> alloc(arena);

    auto ptr = atom::memory::allocateUnique<decltype(alloc), MyClass>(alloc, 42);

    std::cout << "值: " << ptr->getValue() << std::endl;

    return 0;
}
```

### 测量 Arena 使用情况

```cpp
#include "short_alloc.hpp"
#include <vector>
#include <iostream>

int main() {
    constexpr std::size_t N = 1024;
    atom::memory::Arena<N> arena;

    using IntAlloc = atom::memory::ShortAlloc<int, N>;
    std::vector<int, IntAlloc> vec((IntAlloc(arena)));

    std::cout << "初始 Arena 使用情况: " << arena.used() << " 字节" << std::endl;

    for (int i = 0; i < 100; ++i) {
        vec.push_back(i);
    }

    std::cout << "添加 100 个整数后 Arena 使用情况: " << arena.used() << " 字节" << std::endl;

    vec.clear();
    arena.reset();

    std::cout << "重置后 Arena 使用情况: " << arena.used() << " 字节" << std::endl;

    return 0;
}
```
