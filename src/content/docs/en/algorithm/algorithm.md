---
title: Atom Algorithm Library
description: Detailed of the Atom Algorithm Library, including implementations of various algorithms such as KMP, BloomFilter, and BoyerMoore.
---

## Overview

ATOM Algorithm Library is a high-performance C++ library providing specialized string searching algorithms and probabilistic data structures. The library focuses on efficiency, thread safety, and modern C++ features to deliver robust implementations suitable for a variety of applications.

The library currently includes:

- Knuth-Morris-Pratt (KMP) algorithm for efficient string pattern matching
- Boyer-Moore algorithm for optimized text searches
- Bloom Filter implementation for probabilistic set membership testing

## Dependencies

This library requires the following standard C++ headers:

- `<bitset>` - For bit manipulation in Bloom Filter
- `<cmath>` - For mathematical calculations
- `<concepts>` - For compile-time type constraints
- `<mutex>` & `<shared_mutex>` - For thread safety
- `<stdexcept>` - For exception handling
- `<string>` & `<string_view>` - For string manipulation
- `<unordered_map>` - For data storage
- `<vector>` - For dynamic arrays

## Class: KMP (Knuth-Morris-Pratt)

### Purpose

The KMP class implements the Knuth-Morris-Pratt string searching algorithm, which efficiently finds occurrences of a pattern string within a larger text. KMP achieves linear time complexity by avoiding unnecessary character comparisons through a preprocessed failure function.

### Public Methods

#### Constructor

```cpp
explicit KMP(std::string_view pattern);
```

Parameters:

- `pattern`: The pattern string to search for in text

Throws:

- `std::invalid_argument`: If the pattern is invalid (e.g., empty)

#### Search Method

```cpp
[[nodiscard]] auto search(std::string_view text) const -> std::vector<int>;
```

Parameters:

- `text`: The text to search within

Returns:

- Vector of integers representing the starting positions where the pattern occurs in the text

Throws:

- `std::runtime_error`: If the search operation fails

#### Set Pattern

```cpp
void setPattern(std::string_view pattern);
```

Parameters:

- `pattern`: The new pattern string to search for

Throws:

- `std::invalid_argument`: If the pattern is invalid

#### Parallel Search

```cpp
[[nodiscard]] auto searchParallel(std::string_view text, size_t chunk_size = 1024) const -> std::vector<int>;
```

Parameters:

- `text`: The text to search within
- `chunk_size`: Size of each text chunk to process separately (default: 1024)

Returns:

- Vector of integers representing the starting positions where the pattern occurs in the text

Throws:

- `std::runtime_error`: If the search operation fails

### Private Methods and Members

#### Compute Failure Function

```cpp
[[nodiscard]] static auto computeFailureFunction(std::string_view pattern) noexcept -> std::vector<int>;
```

Parameters:

- `pattern`: The pattern for which to compute the failure function

Returns:

- Vector containing the computed failure function (partial match table)

#### Members

- `std::string pattern_`: Stored pattern string
- `std::vector<int> failure_`: Preprocessed failure function table
- `mutable std::shared_mutex mutex_`: Thread safety mutex

### Usage Example

```cpp
#include <iostream>
#include <string>
#include <vector>
#include "algorithm.hpp"

int main() {
    try {
        // Create KMP search object with a pattern
        atom::algorithm::KMP kmp("ABABC");
        
        std::string text = "ABABCABABABABC";
        
        // Search for pattern occurrences
        auto positions = kmp.search(text);
        
        std::cout << "Pattern found at positions: ";
        for (int pos : positions) {
            std::cout << pos << " ";  // Expected: 0 5 10
        }
        std::cout << std::endl;
        
        // Change pattern and search again
        kmp.setPattern("AB");
        positions = kmp.search(text);
        
        std::cout << "New pattern found at positions: ";
        for (int pos : positions) {
            std::cout << pos << " ";  // Expected: 0 2 5 7 9 10 12
        }
        std::cout << std::endl;
        
        // Parallel search for large text
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

## Class Template: BloomFilter

### Purpose

BloomFilter is a space-efficient probabilistic data structure designed to test whether an element is a member of a set. It provides fast insertions and queries with a controlled false positive rate, but never produces false negatives.

### Template Parameters

- `std::size_t N`: Size of the Bloom filter in bits
- `typename ElementType`: Type of elements stored (default: `std::string_view`)
- `typename HashFunction`: Custom hash function type (default: `std::hash<ElementType>`)

### Constraints

- `N` must be greater than 0
- `HashFunction` must provide a valid hash operation for `ElementType` that converts to `std::size_t`

### Public Methods

#### Constructor

```cpp
explicit BloomFilter(std::size_t num_hash_functions);
```

Parameters:

- `num_hash_functions`: Number of hash functions to use in the filter

Throws:

- `std::invalid_argument`: If `num_hash_functions` is zero

#### Insert Element

```cpp
void insert(const ElementType& element) noexcept;
```

Parameters:

- `element`: The element to insert into the Bloom filter

#### Check Membership

```cpp
[[nodiscard]] auto contains(const ElementType& element) const noexcept -> bool;
```

Parameters:

- `element`: The element to check for membership

Returns:

- `true` if the element might be in the set (possible false positive)
- `false` if the element is definitely not in the set (never a false negative)

#### Clear Filter

```cpp
void clear() noexcept;
```

Resets the filter, removing all elements.

#### Get False Positive Probability

```cpp
[[nodiscard]] auto falsePositiveProbability() const noexcept -> double;
```

Returns:

- The estimated false positive probability based on current filter state

#### Get Element Count

```cpp
[[nodiscard]] auto elementCount() const noexcept -> size_t;
```

Returns:

- Number of elements added to the filter

### Private Methods and Members

#### Hash Function

```cpp
[[nodiscard]] auto hash(const ElementType& element, std::size_t seed) const noexcept -> std::size_t;
```

Parameters:

- `element`: The element to hash
- `seed`: Seed value for the hash function

Returns:

- Hash value for the element with the given seed

#### Members

- `std::bitset<N> m_bits_`: Bit array for the filter
- `std::size_t m_num_hash_functions_`: Number of hash functions
- `std::size_t m_count_`: Count of elements added
- `HashFunction m_hasher_`: Hash function instance

### Usage Example

```cpp
#include <iostream>
#include <string>
#include <string_view>
#include "algorithm.hpp"

int main() {
    try {
        // Create a Bloom filter with 10000 bits and 4 hash functions
        atom::algorithm::BloomFilter<10000, std::string_view> filter(4);
        
        // Insert elements
        filter.insert("apple");
        filter.insert("banana");
        filter.insert("cherry");
        
        // Check membership
        std::cout << "Contains 'apple': " << std::boolalpha 
                  << filter.contains("apple") << std::endl;    // Expected: true
        std::cout << "Contains 'banana': " << filter.contains("banana") << std::endl;  // Expected: true
        std::cout << "Contains 'orange': " << filter.contains("orange") << std::endl;  // Expected: false (most likely)
        
        // Get statistics
        std::cout << "Elements added: " << filter.elementCount() << std::endl;  // Expected: 3
        std::cout << "False positive probability: " 
                  << filter.falsePositiveProbability() * 100 << "%" << std::endl;
        
        // Clear the filter
        filter.clear();
        std::cout << "After clearing, contains 'apple': " 
                  << filter.contains("apple") << std::endl;  // Expected: false
        
        // Example with custom type
        atom::algorithm::BloomFilter<1000, int> int_filter(3);
        int_filter.insert(42);
        int_filter.insert(100);
        
        std::cout << "Contains 42: " << int_filter.contains(42) << std::endl;  // Expected: true
        std::cout << "Contains 101: " << int_filter.contains(101) << std::endl;  // Expected: false
        
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
```

### Performance Considerations

- The optimal number of hash functions depends on the expected number of elements and desired false positive rate
- For best performance, N should be significantly larger than the expected element count
- The false positive probability p can be estimated using the formula: p ≈ (1 - e^(-k*n/m))^k where:
  - k = number of hash functions
  - n = number of elements added
  - m = bit array size (N)

## Class: BoyerMoore

### Purpose

The BoyerMoore class implements the Boyer-Moore string searching algorithm, which is particularly efficient for applications where the pattern is relatively long and the alphabet is reasonably sized. It uses two preprocessing strategies: bad character rule and good suffix rule to skip portions of the text, making it often faster than other algorithms.

### Public Methods

#### Constructor

```cpp
explicit BoyerMoore(std::string_view pattern);
```

Parameters:

- `pattern`: The pattern to search for in text

Throws:

- `std::invalid_argument`: If the pattern is invalid (e.g., empty)

#### Search Method

```cpp
[[nodiscard]] auto search(std::string_view text) const -> std::vector<int>;
```

Parameters:

- `text`: The text to search within

Returns:

- Vector of integers representing the starting positions where the pattern occurs in the text

Throws:

- `std::runtime_error`: If the search operation fails

#### Set Pattern

```cpp
void setPattern(std::string_view pattern);
```

Parameters:

- `pattern`: The new pattern string to search for

Throws:

- `std::invalid_argument`: If the pattern is invalid

#### Optimized Search

```cpp
[[nodiscard]] auto searchOptimized(std::string_view text) const -> std::vector<int>;
```

Parameters:

- `text`: The text to search within

Returns:

- Vector of integers representing the starting positions where the pattern occurs in the text

Throws:

- `std::runtime_error`: If the search operation fails

### Private Methods and Members

#### Compute Bad Character Shift

```cpp
void computeBadCharacterShift() noexcept;
```

Pre-computes the bad character shift table for efficient pattern shifting.

#### Compute Good Suffix Shift

```cpp
void computeGoodSuffixShift() noexcept;
```

Pre-computes the good suffix shift table for efficient pattern shifting.

#### Members

- `std::string pattern_`: Stored pattern string
- `std::unordered_map<char, int> bad_char_shift_`: Bad character shift table
- `std::vector<int> good_suffix_shift_`: Good suffix shift table
- `mutable std::mutex mutex_`: Thread safety mutex

### Usage Example

```cpp
#include <iostream>
#include <string>
#include <vector>
#include "algorithm.hpp"

int main() {
    try {
        // Create BoyerMoore search object with pattern
        atom::algorithm::BoyerMoore bm("PATTERN");
        
        std::string text = "THIS IS A TEXT WITH A PATTERN AND ANOTHER PATTERN";
        
        // Standard search
        auto positions = bm.search(text);
        
        std::cout << "Pattern found at positions: ";
        for (int pos : positions) {
            std::cout << pos << " ";  // Expected: 20 36
        }
        std::cout << std::endl;
        
        // Change pattern
        bm.setPattern("TEXT");
        positions = bm.search(text);
        
        std::cout << "New pattern found at positions: ";
        for (int pos : positions) {
            std::cout << pos << " ";  // Expected: 10
        }
        std::cout << std::endl;
        
        // Optimized search for larger text
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

## StringLike Concept

### Purpose

The `StringLike` concept is used to constrain template parameters to types that provide a string-like interface. This ensures type safety while allowing flexibility with different string implementations.

### Requirements

For a type to satisfy the `StringLike` concept, it must provide:

- A `data()` method returning a `const char*`
- A `size()` method returning a size-compatible type
- An indexing operator `[]` that returns a `char`-compatible type

### Example Types That Satisfy `StringLike`

- `std::string`
- `std::string_view`
- `char[]` (through std::string_view conversion)
- Custom string types that meet the requirements

## Thread Safety

Each algorithm class in the library provides thread safety guarantees:

- KMP: Uses shared mutex for concurrent read operations, exclusive for modification
- BoyerMoore: Uses standard mutex to protect internal data during operations
- BloomFilter: Template methods are thread-safe for concurrent reads, but not for concurrent writes with reads

## Performance Considerations

### KMP Algorithm

- Time Complexity: O(n+m) where n is the text length and m is the pattern length
- Space Complexity: O(m) for the failure function
- Best for cases where:
  - Multiple searches are performed with the same pattern
  - Pattern has repeated subpatterns
- The `searchParallel` method provides significant improvements for large texts

### Boyer-Moore Algorithm

- Time Complexity: O(n*m) worst case, but in practice often sub-linear (better than O(n))
- Space Complexity: O(alphabet_size + m) for the shift tables
- Best for cases where:
  - Pattern is long
  - Alphabet is reasonably sized
  - Few matches expected
- The `searchOptimized` method leverages SIMD instructions when available for improved performance

### Bloom Filter

- Time Complexity: O(k) for both insertions and queries, where k is the number of hash functions
- Space Complexity: O(m) where m is the size of the bit array
- False Positive Rate: Approximately (1-e^(-kn/m))^k where n is the number of elements
- Performance depends on proper sizing:
  - Too small: High false positive rate
  - Too large: Wasted memory
  - Optimal hash function count: (m/n) * ln(2)

## Best Practices

1. Pattern Selection:
   - For short patterns (2-5 chars) in large texts, KMP is generally faster
   - For longer patterns (10+ chars), Boyer-Moore tends to be more efficient
   - When exact matches are not required, consider using a Bloom Filter as a pre-filter

2. Thread Safety:
   - If multiple threads need to read the same pattern, use `const` references
   - When modifying patterns in multi-threaded environments, consider creating separate instances

3. Memory Management:
   - Use `std::string_view` for pattern and text parameters when possible to avoid copies
   - For Bloom Filters, choose size based on expected element count and acceptable false positive rate

4. Bloom Filter Sizing:
   - For a desired false positive rate p and n items:
     - Optimal bit array size: m = -n*ln(p) / (ln(2))²
     - Optimal hash function count: k = (m/n) * ln(2)

## Common Pitfalls

1. Empty or Invalid Patterns:
   - The algorithms throw exceptions for empty patterns, always validate inputs

2. Memory Usage:
   - Large patterns or texts can consume significant memory, especially in parallel processing mode

3. Bloom Filter Misuse:
   - Never use for applications requiring guaranteed accuracy
   - Remember that false positives increase as the filter fills up
   - Cannot delete individual elements

4. Performance Traps:
   - Using Boyer-Moore for very short patterns
   - Setting too many hash functions in Bloom Filter
   - Using large chunk sizes in parallel searches for small texts

## Comprehensive Example

Below is a complete example demonstrating the main features of the library working together:

```cpp
#include <chrono>
#include <fstream>
#include <iostream>
#include <string>
#include "algorithm.hpp"

// Helper function for timing operations
template <typename Func>
auto measureTime(Func&& func) {
    auto start = std::chrono::high_resolution_clock::now();
    func();
    auto end = std::chrono::high_resolution_clock::now();
    return std::chrono::duration_cast<std::chrono::microseconds>(end - start).count();
}

// Helper function to generate a large text
std::string generateText(size_t size, const std::string& pattern, size_t occurrences) {
    std::string text(size, 'A');
    
    // Place the pattern at random positions in the text
    size_t pos_increment = size / (occurrences + 1);
    size_t pos = pos_increment;
    
    for (size_t i = 0; i < occurrences; ++i) {
        pos += (rand() % 100) - 50;  // Add some randomness
        if (pos + pattern.size() < size) {
            text.replace(pos, pattern.size(), pattern);
        }
        pos += pos_increment;
    }
    
    return text;
}

int main() {
    try {
        // Generate a large text with known patterns
        std::string pattern = "COMPLEX_PATTERN_123";
        std::string text = generateText(1'000'000, pattern, 50);
        
        std::cout << "Text size: " << text.size() << " bytes\n";
        std::cout << "Pattern: \"" << pattern << "\" (length: " << pattern.size() << ")\n\n";
        
        // 1. Create instances of search algorithms
        atom::algorithm::KMP kmp(pattern);
        atom::algorithm::BoyerMoore bm(pattern);
        
        // 2. Create a Bloom filter to pre-screen text chunks
        // Using 100,000 bits and 3 hash functions
        atom::algorithm::BloomFilter<100'000> bloom_filter(3);
        
        // Add pattern and some variations to the Bloom filter
        bloom_filter.insert(pattern);
        bloom_filter.insert(pattern.substr(0, pattern.size() - 1));  // Pattern minus last char
        bloom_filter.insert(pattern.substr(1));  // Pattern minus first char
        
        // 3. Compare performance of different algorithms
        std::vector<int> kmp_positions, bm_positions;
        
        // Measure KMP standard search
        auto kmp_time = measureTime([&]() {
            kmp_positions = kmp.search(text);
        });
        
        // Measure KMP parallel search
        auto kmp_parallel_time = measureTime([&]() {
            kmp_positions = kmp.searchParallel(text, 10240);
        });
        
        // Measure Boyer-Moore search
        auto bm_time = measureTime([&]() {
            bm_positions = bm.search(text);
        });
        
        // Measure Boyer-Moore optimized search
        auto bm_optimized_time = measureTime([&]() {
            bm_positions = bm.searchOptimized(text);
        });
        
        // 4. Check results and print performance comparison
        std::cout << "Found " << kmp_positions.size() << " pattern occurrences\n";
        std::cout << "Performance comparison (microseconds):\n";
        std::cout << "KMP standard search:       " << kmp_time << std::endl;
        std::cout << "KMP parallel search:       " << kmp_parallel_time << std::endl;
        std::cout << "Boyer-Moore standard:      " << bm_time << std::endl;
        std::cout << "Boyer-Moore optimized:     " << bm_optimized_time << std::endl;
        
        // 5. Demonstrate Bloom filter's effectiveness as a pre-filter
        std::cout << "\nBloom filter statistics:" << std::endl;
        std::cout << "Elements added:            " << bloom_filter.elementCount() << std::endl;
        std::cout << "False positive rate:       " << bloom_filter.falsePositiveProbability() * 100 << "%" << std::endl;
        
        // Split text into chunks and use Bloom filter to pre-screen
        const size_t CHUNK_SIZE = 100;
        size_t chunk_count = 0;
        size_t potential_match_chunks = 0;
        
        auto bloom_screening_time = measureTime([&]() {
            for (size_t i = 0; i < text.size() - CHUNK_SIZE; i += CHUNK_SIZE / 2) {
                // Get a chunk with overlap
                std::string_view chunk = std::string_view(text).substr(i, CHUNK_SIZE);
                chunk_count++;
                
                // Use Bloom filter to check if this chunk may contain the pattern
                if (bloom_filter.contains(chunk)) {
                    potential_match_chunks++;
                    // In a real application, we'd do a full search only on these chunks
                }
            }
        });
        
        std::cout << "Total chunks processed:    " << chunk_count << std::endl;
        std::cout << "Chunks flagged for search: " << potential_match_chunks << std::endl;
        std::cout << "Bloom filter screening:    " << bloom_screening_time << " microseconds" << std::endl;
        
        // 6. Show how algorithms handle pattern changes
        std::string new_pattern = "NEW_PATTERN_XYZ";
        kmp.setPattern(new_pattern);
        bm.setPattern(new_pattern);
        
        auto positions = kmp.search(text);
        std::cout << "\nAfter changing pattern to \"" << new_pattern << "\":" << std::endl;
        std::cout << "Found occurrences: " << positions.size() << std::endl;
        
        // 7. Clear the Bloom filter and show it's empty
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

## Platform/Compiler Notes

- C++ Standard: This library requires C++20 or later due to the use of concepts.
- Compiler Support:
  - GCC 10+
  - Clang 10+
  - MSVC 19.28+ (Visual Studio 2019 16.8+)
- Optimizations:
  - The Boyer-Moore `searchOptimized()` method may use SIMD instructions when available. Performance improvement will vary by platform.
  - For best performance on large datasets, compile with optimization flags (-O2 or -O3).
- Thread Safety:
  - The thread safety mechanisms use C++17 shared mutexes, ensure your platform provides proper implementations.

## Conclusion

The ATOM Algorithm Library provides efficient implementations of key string searching algorithms and probabilistic data structures using modern C++ features. By leveraging concepts, move semantics, and thread safety mechanisms, it offers both performance and safety for various applications involving pattern matching and set membership testing.

The KMP and Boyer-Moore algorithms provide different performance characteristics suitable for different pattern lengths and text properties, while the Bloom Filter offers a space-efficient probabilistic approach for testing set membership with controllable false positive rates.

Use these algorithms together for optimal performance by pre-filtering with Bloom Filters and selecting the appropriate string searching algorithm based on your specific use case.
