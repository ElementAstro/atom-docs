---
title: Atom Algorithm Library
description: Detailed of the Atom Algorithm Library, including implementations of various algorithms such as KMP, BloomFilter, and BoyerMoore.
---

## Overview

The Atom Algorithm Library provides efficient implementations of common algorithmic patterns and data structures with a focus on string searching and probabilistic data structures. This C++ library is designed for high performance, with optional optimizations for SIMD, OpenMP, and Boost integration.

## Table of Contents

- [Overview](#overview)
- [Table of Contents](#table-of-contents)
- [String Searching Algorithms](#string-searching-algorithms)
  - [Knuth-Morris-Pratt (KMP)](#knuth-morris-pratt-kmp)
    - [Class: `KMP`](#class-kmp)
    - [Usage Example](#usage-example)
  - [Boyer-Moore](#boyer-moore)
    - [Class: `BoyerMoore`](#class-boyermoore)
    - [Usage Example](#usage-example-1)
- [Probabilistic Data Structures](#probabilistic-data-structures)
  - [Bloom Filter](#bloom-filter)
    - [Class: `BloomFilter<N, ElementType, HashFunction>`](#class-bloomfiltern-elementtype-hashfunction)
    - [Usage Example](#usage-example-2)
- [Complete Usage Example](#complete-usage-example)

## String Searching Algorithms

### Knuth-Morris-Pratt (KMP)

The KMP algorithm is an efficient string searching algorithm that uses a precomputed failure function to avoid unnecessary character comparisons, making it particularly effective for patterns with repeating sequences.

#### Class: `KMP`

Constructor

```cpp
explicit KMP(std::string_view pattern);
```

- Parameters: `pattern` - The string pattern to search for
- Throws: `std::invalid_argument` if the pattern is invalid
- Description: Initializes a KMP searcher with the given pattern

Methods

```cpp
auto search(std::string_view text) const -> std::vector<int>;
```

- Parameters: `text` - The text to search within
- Returns: Vector of positions where the pattern was found
- Throws: `std::runtime_error` if search operation fails
- Description: Searches for all occurrences of the pattern in the given text

```cpp
void setPattern(std::string_view pattern);
```

- Parameters: `pattern` - The new pattern to search for
- Throws: `std::invalid_argument` if the pattern is invalid
- Description: Updates the pattern used for searching

```cpp
auto searchParallel(std::string_view text, size_t chunk_size = 1024) const -> std::vector<int>;
```

- Parameters:
  - `text` - The text to search within
  - `chunk_size` - Size of text chunks for parallel processing (default: 1024)
- Returns: Vector of positions where the pattern was found
- Throws: `std::runtime_error` if search operation fails
- Description: Performs parallel search using multiple threads for improved performance on large texts

#### Usage Example

```cpp
#include "atom/algorithm/algorithm.hpp"
#include <iostream>

void kmp_example() {
    // Initialize KMP with a pattern
    atom::algorithm::KMP kmp("ABABC");
    
    // Search for the pattern in a text
    std::string text = "ABABDABABCABABCABCABC";
    auto positions = kmp.search(text);
    
    // Print all found positions
    std::cout << "Pattern found at positions: ";
    for (auto pos : positions) {
        std::cout << pos << " ";
    }
    std::cout << std::endl;
    
    // Change the pattern
    kmp.setPattern("ABC");
    
    // Search with the new pattern
    positions = kmp.search(text);
    std::cout << "New pattern found at positions: ";
    for (auto pos : positions) {
        std::cout << pos << " ";
    }
    std::cout << std::endl;
    
    // Use parallel search for large texts
    std::string large_text(1000000, 'A');
    large_text.replace(500000, 5, "ABABC");
    auto parallel_positions = kmp.searchParallel(large_text);
    std::cout << "Parallel search found " << parallel_positions.size() << " occurrences" << std::endl;
}
```

### Boyer-Moore

The Boyer-Moore algorithm is a string searching algorithm known for its efficiency, especially for large alphabets and long patterns. It uses two heuristics: the bad character rule and the good suffix rule to skip portions of the search space.

#### Class: `BoyerMoore`

Constructor

```cpp
explicit BoyerMoore(std::string_view pattern);
```

- Parameters: `pattern` - The string pattern to search for
- Throws: `std::invalid_argument` if the pattern is invalid
- Description: Initializes a Boyer-Moore searcher with the given pattern

Methods

```cpp
auto search(std::string_view text) const -> std::vector<int>;
```

- Parameters: `text` - The text to search within
- Returns: Vector of positions where the pattern was found
- Throws: `std::runtime_error` if search operation fails
- Description: Searches for all occurrences of the pattern in the given text

```cpp
void setPattern(std::string_view pattern);
```

- Parameters: `pattern` - The new pattern to search for
- Throws: `std::invalid_argument` if the pattern is invalid
- Description: Updates the pattern used for searching

```cpp
auto searchOptimized(std::string_view text) const -> std::vector<int>;
```

- Parameters: `text` - The text to search within
- Returns: Vector of positions where the pattern was found
- Throws: `std::runtime_error` if search operation fails
- Description: Performs an optimized search using SIMD instructions if available

#### Usage Example

```cpp
#include "atom/algorithm/algorithm.hpp"
#include <iostream>

void boyer_moore_example() {
    // Initialize Boyer-Moore with a pattern
    atom::algorithm::BoyerMoore bm("PATTERN");
    
    // Search for the pattern in a text
    std::string text = "THIS IS A TEXT CONTAINING THE PATTERN MULTIPLE TIMES. PATTERN HERE AND PATTERN THERE.";
    auto positions = bm.search(text);
    
    // Print all found positions
    std::cout << "Pattern found at positions: ";
    for (auto pos : positions) {
        std::cout << pos << " ";
    }
    std::cout << std::endl;
    
    // Try the optimized search method
    auto opt_positions = bm.searchOptimized(text);
    std::cout << "Optimized search found " << opt_positions.size() << " occurrences" << std::endl;
    
    // Change the pattern
    bm.setPattern("TEXT");
    positions = bm.search(text);
    std::cout << "New pattern found at positions: ";
    for (auto pos : positions) {
        std::cout << pos << " ";
    }
    std::cout << std::endl;
}
```

## Probabilistic Data Structures

### Bloom Filter

A Bloom filter is a space-efficient probabilistic data structure used to test whether an element is a member of a set. False positives are possible, but false negatives are not.

#### Class: `BloomFilter<N, ElementType, HashFunction>`

Template Parameters

- `N` - The size of the Bloom filter (number of bits)
- `ElementType` - The type of elements to store (default: `std::string_view`)
- `HashFunction` - Custom hash function type (default: `std::hash<ElementType>`)

Constructor

```cpp
explicit BloomFilter(std::size_t num_hash_functions);
```

- Parameters: `num_hash_functions` - The number of hash functions to use
- Throws: `std::invalid_argument` if num_hash_functions is zero
- Description: Initializes a Bloom filter with the specified number of hash functions

Methods

```cpp
void insert(const ElementType& element) noexcept;
```

- Parameters: `element` - The element to insert into the Bloom filter
- Description: Inserts an element into the Bloom filter

```cpp
auto contains(const ElementType& element) const noexcept -> bool;
```

- Parameters: `element` - The element to check
- Returns: `true` if the element might be in the set, `false` if it's definitely not
- Description: Checks if an element might be present in the Bloom filter

```cpp
void clear() noexcept;
```

- Description: Clears the Bloom filter, removing all elements

```cpp
auto falsePositiveProbability() const noexcept -> double;
```

- Returns: The estimated false positive probability
- Description: Calculates the current false positive probability based on the filter's state

```cpp
auto elementCount() const noexcept -> size_t;
```

- Returns: The number of elements added to the filter
- Description: Gets the count of elements inserted into the filter

#### Usage Example

```cpp
#include "atom/algorithm/algorithm.hpp"
#include <iostream>
#include <string>

void bloom_filter_example() {
    // Create a Bloom filter with 1024 bits and 3 hash functions
    atom::algorithm::BloomFilter<1024, std::string> filter(3);
    
    // Insert some elements
    filter.insert("apple");
    filter.insert("banana");
    filter.insert("orange");
    
    // Check if elements exist
    std::cout << "Contains 'apple': " << (filter.contains("apple") ? "Yes" : "No") << std::endl;
    std::cout << "Contains 'grape': " << (filter.contains("grape") ? "Yes" : "No") << std::endl;
    
    // Get statistics
    std::cout << "Elements in filter: " << filter.elementCount() << std::endl;
    std::cout << "False positive probability: " << filter.falsePositiveProbability() << std::endl;
    
    // Clear the filter
    filter.clear();
    std::cout << "After clearing, contains 'apple': " 
              << (filter.contains("apple") ? "Yes" : "No") << std::endl;
}
```

## Complete Usage Example

Here's a complete example demonstrating the use of all components in the Atom Algorithm Library:

```cpp
#include "atom/algorithm/algorithm.hpp"
#include <iostream>
#include <string>
#include <vector>
#include <chrono>

// Helper function to print vector of positions
void print_positions(const std::vector<int>& positions, const std::string& label) {
    std::cout << label << ": ";
    if (positions.empty()) {
        std::cout << "None found";
    } else {
        for (size_t i = 0; i < positions.size(); ++i) {
            std::cout << positions[i];
            if (i < positions.size() - 1) std::cout << ", ";
        }
    }
    std::cout << std::endl;
}

int main() {
    std::cout << "===== Atom Algorithm Library Demo =====" << std::endl;
    
    // Create a test text
    std::string text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. "
                        "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. "
                        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris "
                        "nisi ut aliquip ex ea commodo consequat.";
    
    std::cout << "Text length: " << text.length() << " characters" << std::endl;
    std::cout << std::endl;
    
    // === KMP Algorithm Demo ===
    std::cout << "--- Knuth-Morris-Pratt Algorithm ---" << std::endl;
    
    // Initialize KMP with a pattern
    atom::algorithm::KMP kmp("dolor");
    
    // Measure search time
    auto start = std::chrono::high_resolution_clock::now();
    auto kmp_positions = kmp.search(text);
    auto end = std::chrono::high_resolution_clock::now();
    
    print_positions(kmp_positions, "Pattern 'dolor' found at positions");
    std::cout << "Search time: " 
              << std::chrono::duration_cast<std::chrono::microseconds>(end - start).count() 
              << " microseconds" << std::endl;
    
    // Test parallel search
    std::string large_text = text;
    for (int i = 0; i < 10; ++i) {
        large_text += text;  // Make the text larger for parallel demo
    }
    
    start = std::chrono::high_resolution_clock::now();
    auto kmp_parallel_positions = kmp.searchParallel(large_text);
    end = std::chrono::high_resolution_clock::now();
    
    std::cout << "Parallel search found " << kmp_parallel_positions.size() 
              << " occurrences in " 
              << std::chrono::duration_cast<std::chrono::microseconds>(end - start).count() 
              << " microseconds" << std::endl;
    std::cout << std::endl;
    
    // === Boyer-Moore Algorithm Demo ===
    std::cout << "--- Boyer-Moore Algorithm ---" << std::endl;
    
    // Initialize Boyer-Moore with a pattern
    atom::algorithm::BoyerMoore bm("dolor");
    
    // Measure search time
    start = std::chrono::high_resolution_clock::now();
    auto bm_positions = bm.search(text);
    end = std::chrono::high_resolution_clock::now();
    
    print_positions(bm_positions, "Pattern 'dolor' found at positions");
    std::cout << "Search time: " 
              << std::chrono::duration_cast<std::chrono::microseconds>(end - start).count() 
              << " microseconds" << std::endl;
    
    // Test optimized search
    start = std::chrono::high_resolution_clock::now();
    auto bm_opt_positions = bm.searchOptimized(text);
    end = std::chrono::high_resolution_clock::now();
    
    std::cout << "Optimized search found " << bm_opt_positions.size() 
              << " occurrences in " 
              << std::chrono::duration_cast<std::chrono::microseconds>(end - start).count() 
              << " microseconds" << std::endl;
    std::cout << std::endl;
    
    // === Bloom Filter Demo ===
    std::cout << "--- Bloom Filter ---" << std::endl;
    
    // Create a Bloom filter with 1024 bits and 3 hash functions
    atom::algorithm::BloomFilter<1024, std::string> filter(3);
    
    // Insert some words from the text
    std::vector<std::string> words = {"Lorem", "ipsum", "dolor", "sit", "amet"};
    for (const auto& word : words) {
        filter.insert(word);
        std::cout << "Inserted: " << word << std::endl;
    }
    
    std::cout << "Elements in filter: " << filter.elementCount() << std::endl;
    std::cout << "False positive probability: " << filter.falsePositiveProbability() << std::endl;
    
    // Test for membership
    std::vector<std::string> test_words = {"Lorem", "ipsum", "consectetur", "adipiscing"};
    for (const auto& word : test_words) {
        std::cout << "Contains '" << word << "': " 
                  << (filter.contains(word) ? "Yes" : "No") 
                  << (filter.contains(word) && 
                      std::find(words.begin(), words.end(), word) == words.end() 
                      ? " (false positive)" : "") 
                  << std::endl;
    }
    
    // Clear the filter
    filter.clear();
    std::cout << "After clearing, elements in filter: " << filter.elementCount() << std::endl;
    
    return 0;
}
```

This library provides efficient implementations of classic algorithms with modern C++ features such as concepts, SIMD optimizations, and parallel processing capabilities. The thread-safe design allows for concurrent usage in multi-threaded applications.

For optimal performance, consider:

- Using `searchOptimized()` or `searchParallel()` methods for large texts
- Configuring the Bloom filter size and hash function count based on your expected dataset size and acceptable false positive rate
- Enabling SIMD, OpenMP, or Boost integration at compile time when available for additional performance benefits

The library handles edge cases gracefully and provides detailed error messages when exceptions occur, making it suitable for production environments.
