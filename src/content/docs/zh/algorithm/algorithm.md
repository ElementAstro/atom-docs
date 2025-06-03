---

title: Atom 算法库
description: Atom 算法库的详细介绍，包括KMP、BloomFilter和BoyerMoore等各种算法的实现
---

## 概述

ATOM 算法库是一个高性能的 C++ 库，提供专门的字符串搜索算法和概率数据结构。该库注重效率、线程安全性和现代 C++ 特性，提供适用于各种应用的稳健实现。

该库目前包括：

- Knuth-Morris-Pratt (KMP) 算法，用于高效的字符串模式匹配
- Boyer-Moore 算法，用于优化文本搜索
- Bloom Filter 实现，用于概率集合成员测试

## 依赖项

该库需要以下标准 C++ 头文件：

- `<bitset>` - 用于 Bloom Filter 中的位操作
- `<cmath>` - 用于数学计算
- `<concepts>` - 用于编译时类型约束
- `<mutex>` & `<shared_mutex>` - 用于线程安全
- `<stdexcept>` - 用于异常处理
- `<string>` & `<string_view>` - 用于字符串操作
- `<unordered_map>` - 用于数据存储
- `<vector>` - 用于动态数组

## 类：KMP (Knuth-Morris-Pratt)

### 用途

KMP 类实现了 Knuth-Morris-Pratt 字符串搜索算法，该算法可以高效地在较大文本中查找模式字符串的出现位置。KMP 通过预处理的失效函数避免不必要的字符比较，从而实现线性时间复杂度。

### 公共方法

#### 构造函数

```cpp
explicit KMP(std::string_view pattern);
```

参数：

- `pattern`：要在文本中搜索的模式字符串

抛出：

- `std::invalid_argument`：如果模式无效（如为空）

#### 搜索方法

```cpp
[[nodiscard]] auto search(std::string_view text) const -> std::vector<int>;
```

参数：

- `text`：要搜索的文本

返回：

- 整数向量，表示模式在文本中出现的起始位置

抛出：

- `std::runtime_error`：如果搜索操作失败

#### 设置模式

```cpp
void setPattern(std::string_view pattern);
```

参数：

- `pattern`：要搜索的新模式字符串

抛出：

- `std::invalid_argument`：如果模式无效

#### 并行搜索

```cpp
[[nodiscard]] auto searchParallel(std::string_view text, size_t chunk_size = 1024) const -> std::vector<int>;
```

参数：

- `text`：要搜索的文本
- `chunk_size`：单独处理的每个文本块的大小（默认：1024）

返回：

- 整数向量，表示模式在文本中出现的起始位置

抛出：

- `std::runtime_error`：如果搜索操作失败

### 私有方法和成员

#### 计算失效函数

```cpp
[[nodiscard]] static auto computeFailureFunction(std::string_view pattern) noexcept -> std::vector<int>;
```

参数：

- `pattern`：需要计算失效函数的模式

返回：

- 包含计算好的失效函数（部分匹配表）的向量

#### 成员

- `std::string pattern_`：存储的模式字符串
- `std::vector<int> failure_`：预处理的失效函数表
- `mutable std::shared_mutex mutex_`：线程安全互斥锁

### 使用示例

```cpp
#include <iostream>
#include <string>
#include <vector>
#include "algorithm.hpp"

int main() {
    try {
        // 创建带有模式的 KMP 搜索对象
        atom::algorithm::KMP kmp("ABABC");
        
        std::string text = "ABABCABABABABC";
        
        // 搜索模式出现的位置
        auto positions = kmp.search(text);
        
        std::cout << "Pattern found at positions: ";
        for (int pos : positions) {
            std::cout << pos << " ";  // 预期：0 5 10
        }
        std::cout << std::endl;
        
        // 更改模式并再次搜索
        kmp.setPattern("AB");
        positions = kmp.search(text);
        
        std::cout << "New pattern found at positions: ";
        for (int pos : positions) {
            std::cout << pos << " ";  // 预期：0 2 5 7 9 10 12
        }
        std::cout << std::endl;
        
        // 对大文本进行并行搜索
        std::string large_text(10000, 'A');
        large_text += "ABABC";
        
        positions = kmp.searchParallel(large_text, 2048);
        std::cout << "Parallel search found pattern at: " << positions[0] << std::endl;
        
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
```

## 类模板：BloomFilter

### 用途

BloomFilter 是一种空间高效的概率数据结构，设计用于测试元素是否为集合成员。它提供快速的插入和查询，具有可控的假阳性率，但从不产生假阴性。

### 模板参数

- `std::size_t N`：Bloom 过滤器的位数大小
- `typename ElementType`：存储的元素类型（默认：`std::string_view`）
- `typename HashFunction`：自定义哈希函数类型（默认：`std::hash<ElementType>`）

### 约束

- `N` 必须大于 0
- `HashFunction` 必须为 `ElementType` 提供有效的哈希操作，并转换为 `std::size_t`

### 公共方法

#### 构造函数

```cpp
explicit BloomFilter(std::size_t num_hash_functions);
```

参数：

- `num_hash_functions`：过滤器中使用的哈希函数数量

抛出：

- `std::invalid_argument`：如果 `num_hash_functions` 为零

#### 插入元素

```cpp
void insert(const ElementType& element) noexcept;
```

参数：

- `element`：要插入 Bloom 过滤器的元素

#### 检查成员资格

```cpp
[[nodiscard]] auto contains(const ElementType& element) const noexcept -> bool;
```

参数：

- `element`：要检查成员资格的元素

返回：

- `true` 如果元素可能在集合中（可能存在假阳性）
- `false` 如果元素肯定不在集合中（绝不会有假阴性）

#### 清除过滤器

```cpp
void clear() noexcept;
```

重置过滤器，移除所有元素。

#### 获取假阳性概率

```cpp
[[nodiscard]] auto falsePositiveProbability() const noexcept -> double;
```

返回：

- 基于当前过滤器状态的估计假阳性概率

#### 获取元素计数

```cpp
[[nodiscard]] auto elementCount() const noexcept -> size_t;
```

返回：

- 添加到过滤器的元素数量

### 私有方法和成员

#### 哈希函数

```cpp
[[nodiscard]] auto hash(const ElementType& element, std::size_t seed) const noexcept -> std::size_t;
```

参数：

- `element`：要哈希的元素
- `seed`：哈希函数的种子值

返回：

- 给定种子的元素哈希值

#### 成员

- `std::bitset<N> m_bits_`：过滤器的位数组
- `std::size_t m_num_hash_functions_`：哈希函数数量
- `std::size_t m_count_`：添加的元素计数
- `HashFunction m_hasher_`：哈希函数实例

### 使用示例

```cpp
#include <iostream>
#include <string>
#include <string_view>
#include "algorithm.hpp"

int main() {
    try {
        // 创建一个具有 10000 位和 4 个哈希函数的 Bloom 过滤器
        atom::algorithm::BloomFilter<10000, std::string_view> filter(4);
        
        // 插入元素
        filter.insert("apple");
        filter.insert("banana");
        filter.insert("cherry");
        
        // 检查成员资格
        std::cout << "Contains 'apple': " << std::boolalpha 
                  << filter.contains("apple") << std::endl;    // 预期：true
        std::cout << "Contains 'banana': " << filter.contains("banana") << std::endl;  // 预期：true
        std::cout << "Contains 'orange': " << filter.contains("orange") << std::endl;  // 预期：false（很可能）
        
        // 获取统计信息
        std::cout << "Elements added: " << filter.elementCount() << std::endl;  // 预期：3
        std::cout << "False positive probability: " 
                  << filter.falsePositiveProbability() * 100 << "%" << std::endl;
        
        // 清除过滤器
        filter.clear();
        std::cout << "After clearing, contains 'apple': " 
                  << filter.contains("apple") << std::endl;  // 预期：false
        
        // 自定义类型示例
        atom::algorithm::BloomFilter<1000, int> int_filter(3);
        int_filter.insert(42);
        int_filter.insert(100);
        
        std::cout << "Contains 42: " << int_filter.contains(42) << std::endl;  // 预期：true
        std::cout << "Contains 101: " << int_filter.contains(101) << std::endl;  // 预期：false
        
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
```

### 性能考虑因素

- 最优哈希函数数量取决于预期元素数量和期望的假阳性率
- 为获得最佳性能，N 应显著大于预期元素计数
- 假阳性概率 p 可以使用以下公式估计：p ≈ (1 - e^(-k*n/m))^k，其中：
  - k = 哈希函数数量
  - n = 添加的元素数量
  - m = 位数组大小 (N)

## 类：BoyerMoore

### 用途

BoyerMoore 类实现了 Boyer-Moore 字符串搜索算法，该算法在模式相对较长且字母表大小合理的应用中特别高效。它使用两种预处理策略：坏字符规则和好后缀规则，以跳过文本的部分内容，使其通常比其他算法更快。

### 公共方法

#### 构造函数

```cpp
explicit BoyerMoore(std::string_view pattern);
```

参数：

- `pattern`：要在文本中搜索的模式

抛出：

- `std::invalid_argument`：如果模式无效（如为空）

#### 搜索方法

```cpp
[[nodiscard]] auto search(std::string_view text) const -> std::vector<int>;
```

参数：

- `text`：要搜索的文本

返回：

- 整数向量，表示模式在文本中出现的起始位置

抛出：

- `std::runtime_error`：如果搜索操作失败

#### 设置模式

```cpp
void setPattern(std::string_view pattern);
```

参数：

- `pattern`：要搜索的新模式字符串

抛出：

- `std::invalid_argument`：如果模式无效

#### 优化搜索

```cpp
[[nodiscard]] auto searchOptimized(std::string_view text) const -> std::vector<int>;
```

参数：

- `text`：要搜索的文本

返回：

- 整数向量，表示模式在文本中出现的起始位置

抛出：

- `std::runtime_error`：如果搜索操作失败

### 私有方法和成员

#### 计算坏字符偏移

```cpp
void computeBadCharacterShift() noexcept;
```

预计算坏字符偏移表，用于高效的模式偏移。

#### 计算好后缀偏移

```cpp
void computeGoodSuffixShift() noexcept;
```

预计算好后缀偏移表，用于高效的模式偏移。

#### 成员

- `std::string pattern_`：存储的模式字符串
- `std::unordered_map<char, int> bad_char_shift_`：坏字符偏移表
- `std::vector<int> good_suffix_shift_`：好后缀偏移表
- `mutable std::mutex mutex_`：线程安全互斥锁

### 使用示例

```cpp
#include <iostream>
#include <string>
#include <vector>
#include "algorithm.hpp"

int main() {
    try {
        // 创建带有模式的 BoyerMoore 搜索对象
        atom::algorithm::BoyerMoore bm("PATTERN");
        
        std::string text = "THIS IS A TEXT WITH A PATTERN AND ANOTHER PATTERN";
        
        // 标准搜索
        auto positions = bm.search(text);
        
        std::cout << "Pattern found at positions: ";
        for (int pos : positions) {
            std::cout << pos << " ";  // 预期：20 36
        }
        std::cout << std::endl;
        
        // 更改模式
        bm.setPattern("TEXT");
        positions = bm.search(text);
        
        std::cout << "New pattern found at positions: ";
        for (int pos : positions) {
            std::cout << pos << " ";  // 预期：10
        }
        std::cout << std::endl;
        
        // 对更大文本的优化搜索
        std::string large_text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. "
                                "PATTERN appears here and also PATTERN is here again.";
        
        bm.setPattern("PATTERN");
        positions = bm.searchOptimized(large_text);
        
        std::cout << "Optimized search found pattern at: ";
        for (int pos : positions) {
            std::cout << pos << " ";
        }
        std::cout << std::endl;
        
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
```

## StringLike 概念

### 用途

`StringLike` 概念用于将模板参数约束为提供类字符串接口的类型。这确保了类型安全，同时允许使用不同的字符串实现的灵活性。

### 要求

要满足 `StringLike` 概念，类型必须提供：

- 返回 `const char*` 的 `data()` 方法
- 返回与大小兼容类型的 `size()` 方法
- 返回与 `char` 兼容类型的索引运算符 `[]`

### 满足 `StringLike` 的示例类型

- `std::string`
- `std::string_view`
- `char[]`（通过 std::string_view 转换）
- 满足要求的自定义字符串类型

## 线程安全

库中的每个算法类都提供线程安全保证：

- KMP：使用共享互斥锁进行并发读取操作，独占锁用于修改
- BoyerMoore：使用标准互斥锁在操作期间保护内部数据
- BloomFilter：模板方法对并发读取是线程安全的，但对并发写入与读取不安全

## 性能考虑因素

### KMP 算法

- 时间复杂度：O(n+m)，其中 n 是文本长度，m 是模式长度
- 空间复杂度：O(m)，用于失效函数
- 最适合以下情况：
  - 使用相同模式执行多次搜索
  - 模式具有重复的子模式
- `searchParallel` 方法为大型文本提供显著改进

### Boyer-Moore 算法

- 时间复杂度：最坏情况 O(n*m)，但实际上通常是亚线性的（优于 O(n)）
- 空间复杂度：O(alphabet_size + m)，用于偏移表
- 最适合以下情况：
  - 模式较长
  - 字母表大小合理
  - 预期匹配较少
- `searchOptimized` 方法在可用时利用 SIMD 指令以提高性能

### Bloom 过滤器

- 时间复杂度：插入和查询均为 O(k)，其中 k 是哈希函数的数量
- 空间复杂度：O(m)，其中 m 是位数组的大小
- 假阳性率：近似 (1-e^(-kn/m))^k，其中 n 是元素数量
- 性能取决于适当的大小设置：
  - 太小：高假阳性率
  - 太大：内存浪费
  - 最优哈希函数数量：(m/n) * ln(2)

## 最佳实践

1. 模式选择：
   - 对于大文本中的短模式（2-5 个字符），KMP 通常更快
   - 对于较长的模式（10+ 个字符），Boyer-Moore 往往更高效
   - 当不需要精确匹配时，考虑使用 Bloom 过滤器作为预过滤器

2. 线程安全：
   - 如果多个线程需要读取相同的模式，使用 `const` 引用
   - 在多线程环境中修改模式时，考虑创建单独的实例

3. 内存管理：
   - 尽可能使用 `std::string_view` 作为模式和文本参数，以避免复制
   - 对于 Bloom 过滤器，根据预期元素计数和可接受的假阳性率选择大小

4. Bloom 过滤器大小调整：
   - 针对期望的假阳性率 p 和 n 个项目：
     - 最优位数组大小：m = -n*ln(p) / (ln(2))²
     - 最优哈希函数计数：k = (m/n) * ln(2)

## 常见陷阱

1. 空或无效模式：
   - 算法对空模式抛出异常，始终验证输入

2. 内存使用：
   - 大型模式或文本可能消耗大量内存，尤其是在并行处理模式下

3. Bloom 过滤器误用：
   - 切勿用于需要保证准确性的应用
   - 记住，随着过滤器填充，假阳性会增加
   - 无法删除单个元素

4. 性能陷阱：
   - 对非常短的模式使用 Boyer-Moore
   - 在 Bloom 过滤器中设置过多哈希函数
   - 对小文本的并行搜索使用大块大小

## 综合示例

以下是展示库主要功能协同工作的完整示例：

```cpp
#include <chrono>
#include <fstream>
#include <iostream>
#include <string>
#include "algorithm.hpp"

// 用于计时操作的辅助函数
template <typename Func>
auto measureTime(Func&& func) {
    auto start = std::chrono::high_resolution_clock::now();
    func();
    auto end = std::chrono::high_resolution_clock::now();
    return std::chrono::duration_cast<std::chrono::microseconds>(end - start).count();
}

// 生成大型文本的辅助函数
std::string generateText(size_t size, const std::string& pattern, size_t occurrences) {
    std::string text(size, 'A');
    
    // 在文本的随机位置放置模式
    size_t pos_increment = size / (occurrences + 1);
    size_t pos = pos_increment;
    
    for (size_t i = 0; i < occurrences; ++i) {
        pos += (rand() % 100) - 50;  // 添加一些随机性
        if (pos + pattern.size() < size) {
            text.replace(pos, pattern.size(), pattern);
        }
        pos += pos_increment;
    }
    
    return text;
}

int main() {
    try {
        // 生成具有已知模式的大型文本
        std::string pattern = "COMPLEX_PATTERN_123";
        std::string text = generateText(1'000'000, pattern, 50);
        
        std::cout << "Text size: " << text.size() << " bytes\n";
        std::cout << "Pattern: \"" << pattern << "\" (length: " << pattern.size() << ")\n\n";
        
        // 1. 创建搜索算法实例
        atom::algorithm::KMP kmp(pattern);
        atom::algorithm::BoyerMoore bm(pattern);
        
        // 2. 创建 Bloom 过滤器预筛选文本块
        // 使用 100,000 位和 3 个哈希函数
        atom::algorithm::BloomFilter<100'000> bloom_filter(3);
        
        // 将模式及其一些变体添加到 Bloom 过滤器
        bloom_filter.insert(pattern);
        bloom_filter.insert(pattern.substr(0, pattern.size() - 1));  // 模式减去最后一个字符
        bloom_filter.insert(pattern.substr(1));  // 模式减去第一个字符
        
        // 3. 比较不同算法的性能
        std::vector<int> kmp_positions, bm_positions;
        
        // 测量 KMP 标准搜索
        auto kmp_time = measureTime([&]() {
            kmp_positions = kmp.search(text);
        });
        
        // 测量 KMP 并行搜索
        auto kmp_parallel_time = measureTime([&]() {
            kmp_positions = kmp.searchParallel(text, 10240);
        });
        
        // 测量 Boyer-Moore 搜索
        auto bm_time = measureTime([&]() {
            bm_positions = bm.search(text);
        });
        
        // 测量 Boyer-Moore 优化搜索
        auto bm_optimized_time = measureTime([&]() {
            bm_positions = bm.searchOptimized(text);
        });
        
        // 4. 检查结果并打印性能比较
        std::cout << "Found " << kmp_positions.size() << " pattern occurrences\n";
        std::cout << "Performance comparison (microseconds):\n";
        std::cout << "KMP standard search:       " << kmp_time << std::endl;
        std::cout << "KMP parallel search:       " << kmp_parallel_time << std::endl;
        std::cout << "Boyer-Moore standard:      " << bm_time << std::endl;
        std::cout << "Boyer-Moore optimized:     " << bm_optimized_time << std::endl;
        
        // 5. 展示 Bloom 过滤器作为预过滤器的有效性
        std::cout << "\nBloom filter statistics:" << std::endl;
        std::cout << "Elements added:            " << bloom_filter.elementCount() << std::endl;
        std::cout << "False positive rate:       " << bloom_filter.falsePositiveProbability() * 100 << "%" << std::endl;
        
        // 将文本分割成块并使用 Bloom 过滤器进行预筛选
        const size_t CHUNK_SIZE = 100;
        size_t chunk_count = 0;
        size_t potential_match_chunks = 0;
        
        auto bloom_screening_time = measureTime([&]() {
            for (size_t i = 0; i < text.size() - CHUNK_SIZE; i += CHUNK_SIZE / 2) {
                // 获取一个带重叠的块
                std::string_view chunk = std::string_view(text).substr(i, CHUNK_SIZE);
                chunk_count++;
                
                // 使用 Bloom 过滤器检查该块是否可能包含模式
                if (bloom_filter.contains(chunk)) {
                    potential_match_chunks++;
                    // 在实际应用中，我们只会对这些块进行完整搜索
                }
            }
        });
        
        std::cout << "Total chunks processed:    " << chunk_count << std::endl;
        std::cout << "Chunks flagged for search: " << potential_match_chunks << std::endl;
        std::cout << "Bloom filter screening:    " << bloom_screening_time << " microseconds" << std::endl;
        
        // 6. 展示算法如何处理模式变化
        std::string new_pattern = "NEW_PATTERN_XYZ";
        kmp.setPattern(new_pattern);
        bm.setPattern(new_pattern);
        
        auto positions = kmp.search(text);
        std::cout << "\nAfter changing pattern to \"" << new_pattern << "\":" << std::endl;
        std::cout << "Found occurrences: " << positions.size() << std::endl;
        
        // 7. 清除 Bloom 过滤器并显示它为空
        bloom_filter.clear();
        std::cout << "\nAfter clearing Bloom filter:" << std::endl;
        std::cout << "Contains original pattern: " << bloom_filter.contains(pattern) << std::endl;
        std::cout << "Elements count: " << bloom_filter.elementCount() << std::endl;
        
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
```

## 平台/编译器说明

- C++ 标准：由于使用了概念（concepts），此库需要 C++20 或更高版本。
- 编译器支持：
  - GCC 10+
  - Clang 10+
  - MSVC 19.28+（Visual Studio 2019 16.8+）
- 优化：
  - Boyer-Moore 的 `searchOptimized()` 方法在可用时可能使用 SIMD 指令。性能提升将因平台而异。
  - 对于大型数据集的最佳性能，使用优化标志（-O2 或 -O3）编译。
- 线程安全：
  - 线程安全机制使用 C++17 共享互斥锁，确保您的平台提供适当的实现。

## 结论

ATOM 算法库使用现代 C++ 特性提供了关键字符串搜索算法和概率数据结构的高效实现。通过利用概念（concepts）、移动语义和线程安全机制，它为涉及模式匹配和集合成员测试的各种应用提供了性能和安全性。

KMP 和 Boyer-Moore 算法提供了适用于不同模式长度和文本属性的不同性能特征，而 Bloom 过滤器则提供了一种空间高效的概率方法，用于测试具有可控假阳性率的集合成员资格。

通过使用 Bloom 过滤器进行预过滤并根据您的特定用例选择适当的字符串搜索算法，共同使用这些算法以获得最佳性能。
