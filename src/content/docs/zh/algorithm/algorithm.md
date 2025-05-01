---
title: 通用算法
description: 算法库的详细文档，包括各种算法的实现，如 KMP、布隆过滤器和博耶-摩尔算法。
---

## 类

### KMP（Knuth-Morris-Pratt）

`KMP` 类实现了 Knuth-Morris-Pratt 字符串搜索算法。

#### 构造函数

```cpp
explicit KMP(std::string_view pattern);
```

使用给定的模式构造一个 KMP 对象以进行搜索。

#### 方法

1. `search`

   ```cpp
   [[nodiscard]] auto search(std::string_view text) const -> std::vector<int>;
   ```

   在给定文本中搜索模式的出现。

   - 返回：一个整数向量，表示文本中模式匹配的起始位置。

2. `setPattern`

   ```cpp
   void setPattern(std::string_view pattern);
   ```

   设置新的搜索模式。

#### 私有方法

- `computeFailureFunction`

  ```cpp
  auto computeFailureFunction(std::string_view pattern) -> std::vector<int>;
  ```

  计算给定模式的失败函数（部分匹配表）。

### 布隆过滤器

`BloomFilter` 类实现了一种布隆过滤器数据结构。

#### 模板参数

- `N`：布隆过滤器的大小（位数）。

#### 构造函数

```cpp
explicit BloomFilter(std::size_t num_hash_functions);
```

使用指定数量的哈希函数构造一个新的布隆过滤器对象。

#### 方法

1. `insert`

   ```cpp
   void insert(std::string_view element);
   ```

   将元素插入布隆过滤器中。

2. `contains`

   ```cpp
   [[nodiscard]] auto contains(std::string_view element) const -> bool;
   ```

   检查一个元素是否可能存在于布隆过滤器中。

   - 返回：如果元素可能存在则为 `true`，否则为 `false`。

#### 私有方法

- `hash`

  ```cpp
  auto hash(std::string_view element, std::size_t seed) const -> std::size_t;
  ```

  使用特定的种子计算元素的哈希值。

### 博耶-摩尔算法

`BoyerMoore` 类实现了博耶-摩尔字符串搜索算法。

#### 构造函数

```cpp
explicit BoyerMoore(std::string_view pattern);
```

使用给定的模式构造一个 BoyerMoore 对象以进行搜索。

#### 方法

1. `search`

   ```cpp
   auto search(std::string_view text) const -> std::vector<int>;
   ```

   在给定文本中搜索模式的出现。

   - 返回：一个整数向量，表示文本中模式匹配的起始位置。

2. `setPattern`

   ```cpp
   void setPattern(std::string_view pattern);
   ```

   设置新的搜索模式。

#### 私有方法

1. `computeBadCharacterShift`

   ```cpp
   void computeBadCharacterShift();
   ```

   计算当前模式的坏字符位移表。

2. `computeGoodSuffixShift`

   ```cpp
   void computeGoodSuffixShift();
   ```

   计算当前模式的好后缀位移表。

## 使用示例

### KMP

```cpp
atom::algorithm::KMP kmp("pattern");
std::vector<int> matches = kmp.search("This is a text with a pattern in it.");
```

### 布隆过滤器

```cpp
atom::algorithm::BloomFilter<1000> filter(3);
filter.insert("apple");
bool contains = filter.contains("apple");
```

### 博耶-摩尔算法

```cpp
atom::algorithm::BoyerMoore bm("pattern");
std::vector<int> matches = bm.search("This is a text with a pattern in it.");
```

## 注意事项

- 该库使用 C++17 特性，特别是 `std::string_view`。
- 布隆过滤器的实现是模板化的，允许自定义过滤器大小。
- KMP 和博耶-摩尔算法都是高效的字符串搜索算法，具有不同的性能特征，具体取决于输入。
