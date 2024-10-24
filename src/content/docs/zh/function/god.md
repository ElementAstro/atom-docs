---
title: 神的代码
description: atom::meta 命名空间中 god.hpp 文件的详细文档，包括用于类型转换、内存对齐、位操作和类型检查的工具、类型别名、类型特征和使用示例。  
---

## 目录

1. [实用函数](#实用函数)
2. [类型别名](#类型别名)
3. [类型特征](#类型特征)
4. [使用示例](#使用示例)
5. [注意事项和考虑因素](#注意事项和考虑因素)

## 实用函数

### blessNoBugs

一个无操作函数，用于“祝福”没有错误。

```cpp
ATOM_INLINE void blessNoBugs();
```

### cast

将值从一种类型转换为另一种类型。

```cpp
template <typename To, typename From>
constexpr auto cast(From&& fromValue) -> To;
```

### alignUp 和 alignDown

将值或指针向上或向下对齐到给定对齐的最近倍数。

```cpp
template <std::size_t Alignment, typename ValueType>
constexpr auto alignUp(ValueType value) -> ValueType;

template <std::size_t Alignment, typename PointerType>
constexpr auto alignUp(PointerType* pointer) -> PointerType*;

template <typename ValueType, typename AlignmentType>
constexpr auto alignUp(ValueType value, AlignmentType alignment) -> ValueType;

template <typename PointerType, typename AlignmentType>
constexpr auto alignUp(PointerType* pointer, AlignmentType alignment) -> PointerType*;

// 类似的函数也存在用于 alignDown
```

### log2

计算整数值的以 2 为底的对数。

```cpp
template <typename IntegralType>
constexpr auto log2(IntegralType value) -> IntegralType;
```

### nb

计算覆盖某个值所需的 N 大小的块数。

```cpp
template <std::size_t BlockSize, typename ValueType>
constexpr auto nb(ValueType value) -> ValueType;
```

### eq

比较两个值是否相等。

```cpp
template <typename ValueType>
ATOM_INLINE auto eq(const void* first, const void* second) -> bool;
```

### copy

将 N 字节从源复制到目标。

```cpp
template <std::size_t NumBytes>
ATOM_INLINE void copy(void* destination, const void* source);
```

### swap, fetchAdd, fetchSub, fetchAnd, fetchOr, fetchXor

对值进行类似原子的操作。

```cpp
template <typename PointerType, typename ValueType>
ATOM_INLINE auto swap(PointerType* pointer, ValueType value) -> PointerType;

template <typename PointerType, typename ValueType>
ATOM_INLINE auto fetchAdd(PointerType* pointer, ValueType value) -> PointerType;

// 类似的函数也存在用于 fetchSub, fetchAnd, fetchOr, fetchXor
```

## 类型别名

```cpp
template <bool Condition, typename Type = void>
using if_t = std::enable_if_t<Condition, Type>;

template <typename Type>
using rmRefT = std::remove_reference_t<Type>;

template <typename Type>
using rmCvT = std::remove_cv_t<Type>;

template <typename Type>
using rmCvRefT = rmCvT<rmRefT<Type>>;

template <typename Type>
using rmArrT = std::remove_extent_t<Type>;

template <typename Type>
using constT = std::add_const_t<Type>;

template <typename Type>
using constRefT = std::add_lvalue_reference_t<constT<rmRefT<Type>>>;
```

## 类型特征

```cpp
template <typename FirstType, typename SecondType, typename... RemainingTypes>
constexpr auto isSame() -> bool;

template <typename Type>
constexpr auto isRef() -> bool;

template <typename Type>
constexpr auto isArray() -> bool;

template <typename Type>
constexpr auto isClass() -> bool;

template <typename Type>
constexpr auto isScalar() -> bool;

template <typename Type>
constexpr auto isTriviallyCopyable() -> bool;

template <typename Type>
constexpr auto isTriviallyDestructible() -> bool;

template <typename BaseType, typename DerivedType>
constexpr auto isBaseOf() -> bool;

template <typename Type>
constexpr auto hasVirtualDestructor() -> bool;
```

## 使用示例

### 对齐函数

```cpp
#include "god.hpp"
#include <iostream>

int main() {
    int value = 17;
    std::cout << "Original value: " << value << std::endl;
    std::cout << "Aligned up to 8: " << atom::meta::alignUp<8>(value) << std::endl;
    std::cout << "Aligned down to 8: " << atom::meta::alignDown<8>(value) << std::endl;

    int* ptr = &value;
    std::cout << "Original pointer: " << ptr << std::endl;
    std::cout << "Aligned up to 16: " << atom::meta::alignUp<16>(ptr) << std::endl;

    return 0;
}
```

### 类型特征

```cpp
#include "god.hpp"
#include <iostream>

class BaseClass {};
class DerivedClass : public BaseClass {};

int main() {
    std::cout << "Is int a scalar? " << atom::meta::isScalar<int>() << std::endl;
    std::cout << "Is BaseClass a base of DerivedClass? "
              << atom::meta::isBaseOf<BaseClass, DerivedClass>() << std::endl;
    std::cout << "Does BaseClass have a virtual destructor? "
              << atom::meta::hasVirtualDestructor<BaseClass>() << std::endl;

    return 0;
}
```

### 类似原子的操作

```cpp
#include "god.hpp"
#include <iostream>

int main() {
    int value = 10;
    std::cout << "Original value: " << value << std::endl;

    std::cout << "Fetch and add 5: " << atom::meta::fetchAdd(&value, 5) << std::endl;
    std::cout << "New value: " << value << std::endl;

    std::cout << "Fetch and AND with 14: " << atom::meta::fetchAnd(&value, 14) << std::endl;
    std::cout << "New value: " << value << std::endl;

    return 0;
}
```

## 注意事项和考虑因素

1. 本库中的许多函数标记为 `constexpr`，允许在可能的情况下进行编译时评估。
2. 对齐函数假设对齐值是 2 的幂。使用非 2 的幂的对齐可能会导致意外结果。
3. 类似原子的操作（swap、fetchAdd 等）并不是实际的原子操作。它们是对非原子操作的简单包装，不应在多线程上下文中使用而不进行适当的同步。
4. 提供的类型特征是对标准 C++ 类型特征的薄包装，提供了更简洁的语法。
5. `blessNoBugs` 函数是一个无操作，其目的可能是幽默或迷信。
6. 使用像 `cast` 这样的模板函数时，请注意潜在的窄化转换或其他不安全的转换。
7. `ATOM_INLINE` 宏在许多地方被频繁使用。确保在项目中正确定义该宏。
