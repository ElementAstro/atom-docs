---
title: 流式容器操作
description: atom::type 命名空间中 cstream 类的全面文档，包括构造函数、成员函数、容器转换、元素访问、聚合操作、实用函数和使用示例。
---

## 目录

1. [概述](#概述)
2. [类定义](#类定义)
3. [构造函数](#构造函数)
4. [基本操作](#基本操作)
5. [容器转换](#容器转换)
6. [元素访问和信息](#元素访问和信息)
7. [聚合操作](#聚合操作)
8. [实用函数](#实用函数)
9. [辅助结构](#辅助结构)
10. [使用示例](#使用示例)

## 概述

`cstream` 类提供了一种流畅的接口，用于对容器执行各种操作。它支持排序、过滤、转换和聚合数据等操作。该类旨在与支持标准 C++ 容器操作的任何容器类型一起使用。

## 类定义

```cpp
template <typename C>
class cstream {
public:
    using value_type = typename C::value_type;
    using it_type = decltype(std::begin(C{}));

    // ... (成员函数)
};
```

## 构造函数

`cstream` 类可以通过两种方式构造：

1. 从容器引用：

   ```cpp
   explicit cstream(C& c);
   ```

2. 从右值容器：

   ```cpp
   explicit cstream(C&& c);
   ```

## 基本操作

### getRef()

返回对底层容器的引用。

### getMove()

将容器从流中移动出来。

### get()

返回容器的副本。

### operator C&&()

将流转换为右值容器。

## 容器转换

### sorted()

按升序对容器进行排序。

```cpp
template <typename BinaryFunction = std::less<value_type>>
auto sorted(const BinaryFunction& op = {}) -> cstream<C>&;
```

### transform()

使用函数转换容器。

```cpp
template <typename T, typename UnaryFunction>
auto transform(UnaryFunction transform_f) const -> cstream<T>;
```

### remove()

根据谓词从容器中移除元素。

```cpp
template <typename UnaryFunction>
auto remove(UnaryFunction remove_f) -> cstream<C>&;
```

### erase()

从容器中删除特定值。

```cpp
template <typename ValueType>
auto erase(const ValueType& v) -> cstream<C>&;
```

### filter()

根据谓词过滤容器。

```cpp
template <typename UnaryFunction>
auto filter(UnaryFunction filter) -> cstream<C>&;
```

### cpFilter()

创建容器的副本并根据谓词过滤。

```cpp
template <typename UnaryFunction>
auto cpFilter(UnaryFunction filter) const -> cstream<C>;
```

### map()

使用函数映射容器的元素。

```cpp
template <typename UnaryFunction>
auto map(UnaryFunction f) const -> cstream<C>;
```

### flatMap()

使用函数平坦映射容器的元素。

```cpp
template <typename UnaryFunction>
auto flatMap(UnaryFunction f) const -> cstream<C>;
```

### distinct()

从容器中移除重复元素。

```cpp
auto distinct() -> cstream<C>&;
```

### reverse()

反转容器中的元素。

```cpp
auto reverse() -> cstream<C>&;
```

## 元素访问和信息

### size()

返回容器的大小。

```cpp
[[nodiscard]] auto size() const -> std::size_t;
```

### count()

计算满足谓词的元素数量或特定值的出现次数。

```cpp
template <typename UnaryFunction>
auto count(UnaryFunction f) const -> std::size_t;

auto count(const value_type& v) const -> std::size_t;
```

### contains()

检查容器是否包含某个值。

```cpp
auto contains(const value_type& value) const -> bool;
```

### first()

获取容器中的第一个元素或满足谓词的第一个元素。

```cpp
auto first() const -> std::optional<value_type>;

template <typename UnaryFunction>
auto first(UnaryFunction f) const -> std::optional<value_type>;
```

## 聚合操作

### accumulate()

使用二元函数对容器的元素进行累加。

```cpp
template <typename UnaryFunction = std::plus<value_type>>
auto accumulate(value_type initial = {}, UnaryFunction op = {}) const -> value_type;
```

### forEach()

对容器的每个元素应用一个函数。

```cpp
template <typename UnaryFunction>
auto forEach(UnaryFunction f) -> cstream<C>&;
```

### all()

检查所有元素是否满足谓词。

```cpp
template <typename UnaryFunction>
auto all(UnaryFunction f) const -> bool;
```

### any()

检查是否有元素满足谓词。

```cpp
template <typename UnaryFunction>
auto any(UnaryFunction f) const -> bool;
```

### none()

检查是否没有元素满足谓词。

```cpp
template <typename UnaryFunction>
auto none(UnaryFunction f) const -> bool;
```

### min()

获取容器中的最小元素。

```cpp
auto min() const -> value_type;
```

### max()

获取容器中的最大元素。

```cpp
auto max() const -> value_type;
```

### mean()

计算容器中元素的平均值。

```cpp
[[nodiscard]] auto mean() const -> double;
```

## 实用函数

### copy()

创建容器的副本。

```cpp
auto copy() const -> cstream<C>;
```

## 辅助结构

### ContainerAccumulate

用于累积容器的函数对象。

### identity

返回输入值的函数对象。

### JoinAccumulate

用于使用分隔符连接容器的函数对象。

### Pair

用于处理对的实用结构。

## 使用示例

以下是一些示例，演示如何使用 `cstream` 类：

```cpp
#include "cstream.hpp"
#include <iostream>
#include <vector>
#include <string>

int main() {
    std::vector<int> numbers = {5, 2, 8, 1, 9, 3, 7, 4, 6};

    // 示例 1：基本操作
    auto result = atom::type::makeStream(numbers)
        .sorted()
        .filter([](int n) { return n % 2 == 0; })
        .transform<std::vector<std::string>>([](int n) { return std::to_string(n); })
        .get();

    std::cout << "排序后的偶数并转换为字符串:" << std::endl;
    for (const auto& s : result) {
        std::cout << s << " ";
    }
    std::cout << std::endl;

    // 示例 2：聚合操作
    auto sum = atom::type::makeStream(numbers)
        .accumulate();

    auto product = atom::type::makeStream(numbers)
        .accumulate(1, std::multiplies<int>());

    std::cout << "和: " << sum << std::endl;
    std::cout << "积: " << product << std::endl;

    // 示例 3：元素访问和信息
    auto firstEven = atom::type::makeStream(numbers)
        .first([](int n) { return n % 2 == 0; });

    std::cout << "第一个偶数: " << (firstEven ? std::to_string(*firstEven) : "未找到") << std::endl;

    auto containsSeven = atom::type::makeStream(numbers)
        .contains(7);

    std::cout << "包含 7: " << (containsSeven ? "是" : "否") << std::endl;

    // 示例 4：映射和扁平映射
    std::vector<std::vector<int>> nestedNumbers = {{1, 2}, {3, 4}, {5, 6}};

    auto mappedResult = atom::type::makeStream(nestedNumbers)
        .map([](const std::vector<int>& v) { return v.size(); })
        .get();

    std::cout << "嵌套向量的大小:" << std::endl;
    for (const auto& size : mappedResult) {
        std::cout << size << " ";
    }
    std::cout << std::endl;

    auto flatMappedResult = atom::type::makeStream(nestedNumbers)
        .flatMap([](const std::vector<int>& v) { return v; })
        .get();

    std::cout << "扁平化的嵌套向量:" << std::endl;
    for (const auto& num : flatMappedResult) {
        std::cout << num << " ";
    }
    std::cout << std::endl;

    // 示例 5：去重和反转
    std::vector<int> duplicates = {1, 2, 2, 3, 3, 3, 4, 4, 4, 4};

    auto distinctResult = atom::type::makeStream(duplicates)
        .distinct()
        .reverse()
        .get();

    std::cout << "去重后的元素（反向）:" << std::endl;
    for (const auto& num : distinctResult) {
        std::cout << num << " ";
    }
    std::cout << std::endl;

    // 示例 6：自定义排序
    std::vector<std::pair<std::string, int>> pairs = {{"apple", 5}, {"banana", 2}, {"cherry", 8}};

    auto sortedPairs = atom::type::makeStream(pairs)
        .sorted([](const auto& a, const auto& b) { return a.second < b.second; })
        .get();

    std::cout << "按第二个元素排序的对:" << std::endl;
    for (const auto& [fruit, count] : sortedPairs) {
        std::cout << fruit << ": " << count << std::endl;
    }

    // 示例 7：链式多个操作
    auto complexResult = atom::type::makeStream(numbers)
        .filter([](int n) { return n > 3; })
        .map([](int n) { return n * n; })
        .sorted(std::greater<int>())
        .take(3)
        .get();

    std::cout << "大于 3 的数字的前 3 个平方:" << std::endl;
    for (const auto& num : complexResult) {
        std::cout << num << " ";
    }
    std::cout << std::endl;

    // 示例 8：使用实用函数
    std::vector<int> source = {1, 2, 3, 4, 5};
    auto streamCopy = atom::type::makeStreamCopy(source);
    streamCopy.forEach([](int& n) { n *= 2; });

    std::cout << "原始源:" << std::endl;
    for (const auto& num : source) {
        std::cout << num << " ";
    }
    std::cout << std::endl;

    std::cout << "修改后的副本:" << std::endl;
    for (const auto& num : streamCopy.get()) {
        std::cout << num << " ";
    }
    std::cout << std::endl;

    return 0;
}
```

此扩展示例演示了 `cstream` 类的更高级用法。让我们逐一解析每个示例：

1. **映射和扁平映射**：这些操作允许您转换容器的元素。`map` 对每个元素应用一个函数，而 `flatMap` 应用返回容器的函数并扁平化结果。

2. **去重和反转**：`distinct` 操作移除重复元素，`reverse` 反转容器中的元素顺序。

3. **自定义排序**：您可以向 `sorted` 提供自定义比较函数，以实现更复杂的排序逻辑。

4. **链式多个操作**：`cstream` 的流畅接口允许您将多个操作链在一起，以可读的方式创建复杂的数据处理管道。

5. **使用实用函数**：`makeStreamCopy` 函数创建一个包含原始容器副本的新流，允许您在不影响原始容器的情况下修改副本。
