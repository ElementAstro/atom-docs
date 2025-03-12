---
title: FnMatch
description: Detailed for the fnmatch.hpp header file in the atom::algorithm namespace, including functions for shell-style pattern matching and filtering in C++.
---

## Overview

`atom::algorithm::fnmatch` is a comprehensive C++ library for pattern matching that brings Python's flexible `fnmatch` functionality to C++20. It enables powerful glob-style pattern matching with a clean, modern API that leverages C++20 concepts, ranges, and other advanced features.

## Features

- Python-like wildcard syntax: `*`, `?`, character classes `[abc]`, etc.
- Modern C++20 interface with concepts and ranges support
- Flexible string type handling works with any string-like type
- Detailed error reporting with exceptions or expected types
- Performance optimizations:
  - Pattern caching for repeated matches
  - SIMD acceleration when available
  - Parallel execution for multiple patterns
- Cross-platform with platform-specific optimizations

## Requirements

- C++20-compatible compiler
- Optional dependencies:
  - Boost (for `ATOM_USE_BOOST` mode)
  - SIMD capabilities (auto-detected via `__SSE4_2__`)

## Basic Usage

```cpp
#include "atom/algorithm/fnmatch.hpp"

// Simple pattern matching
bool matches = atom::algorithm::fnmatch("file*.txt", "file123.txt");  // true

// Case-insensitive matching
bool insensitive = atom::algorithm::fnmatch("README.MD", "readme.md", 
                                            atom::algorithm::flags::CASEFOLD);  // true

// Filter an array of file names
std::vector<std::string> files = {"test.txt", "data.csv", "image.png"};
auto filtered = atom::algorithm::filter(files, "*.txt");  // Returns matching entries
```

## API Reference

### Exception Class

#### `FnmatchException`

Purpose: Provides detailed error information for fnmatch operations.

```cpp
class FnmatchException : public std::exception {
public:
    explicit FnmatchException(const std::string& message) noexcept;
    [[nodiscard]] const char* what() const noexcept override;
};
```

### Error Enum

```cpp
enum class FnmatchError {
    InvalidPattern,
    UnmatchedBracket,
    EscapeAtEnd,
    InternalError
};
```

### Flags

Flags can be combined with bitwise OR (`|`).

```cpp
namespace flags {
    inline constexpr int NOESCAPE = 0x01;  // Disable backslash escaping
    inline constexpr int PATHNAME = 0x02;  // Slash in string only matches slash in pattern
    inline constexpr int PERIOD = 0x04;    // Leading period must be matched explicitly
    inline constexpr int CASEFOLD = 0x08;  // Case insensitive matching
}
```

### Core Functions

#### `fnmatch`

Purpose: Matches a string against a pattern with exception-based error handling.

```cpp
template <StringLike T1, StringLike T2>
[[nodiscard]] auto fnmatch(T1&& pattern, T2&& string, int flags = 0) -> bool;
```

- Parameters:
  - `pattern`: The glob pattern to match against
  - `string`: The string to test
  - `flags`: Optional bit flags to modify matching behavior
- Returns: `true` if the string matches the pattern, `false` otherwise
- Throws: `FnmatchException` on invalid patterns or internal errors

#### `fnmatch_nothrow`

Purpose: Non-throwing version using `expected` return type for error handling.

```cpp
template <StringLike T1, StringLike T2>
[[nodiscard]] auto fnmatch_nothrow(T1&& pattern, T2&& string, int flags = 0) noexcept
    -> atom::type::expected<bool, FnmatchError>;
```

- Parameters: Same as `fnmatch`
- Returns: `expected<bool, FnmatchError>` containing either the match result or an error

### Collection Functions

#### `filter` (Single Pattern)

Purpose: Checks if any element in a range matches a pattern.

```cpp
template <std::ranges::input_range Range, StringLike Pattern>
    requires StringLike<std::ranges::range_value_t<Range>>
[[nodiscard]] auto filter(const Range& names, Pattern&& pattern, int flags = 0) -> bool;
```

- Parameters:
  - `names`: Range of string-like elements to check
  - `pattern`: Pattern to match against
  - `flags`: Optional matching flags
- Returns: `true` if any element matches the pattern

#### `filter` (Multiple Patterns)

Purpose: Filters a range against multiple patterns, optionally using parallel execution.

```cpp
template <std::ranges::input_range Range, std::ranges::input_range PatternRange>
    requires StringLike<std::ranges::range_value_t<Range>> &&
             StringLike<std::ranges::range_value_t<PatternRange>>
[[nodiscard]] auto filter(const Range& names, const PatternRange& patterns,
                         int flags = 0, bool use_parallel = true)
    -> std::vector<std::ranges::range_value_t<Range>>;
```

- Parameters:
  - `names`: Range of string-like elements to filter
  - `patterns`: Range of patterns to match against
  - `flags`: Optional matching flags
  - `use_parallel`: Whether to use parallel execution (default: true)
- Returns: Vector containing the elements from `names` that match any pattern

### Utility Functions

#### `translate`

Purpose: Converts a glob pattern to a regular expression.

```cpp
template <StringLike Pattern>
[[nodiscard]] auto translate(Pattern&& pattern, int flags = 0) noexcept
    -> atom::type::expected<std::string, FnmatchError>;
```

- Parameters:
  - `pattern`: Glob pattern to translate
  - `flags`: Optional flags affecting translation
- Returns: `expected` with the regex string or an error

## Pattern Syntax

The pattern matching syntax follows the Unix shell wildcard format:

| Character | Meaning |
|-----------|---------|
| `*`       | Matches any sequence of characters (including empty) |
| `?`       | Matches any single character |
| `[seq]`   | Matches any character in sequence `seq` |
| `[!seq]`  | Matches any character not in sequence `seq` |
| `[a-z]`   | Matches any character in range `a` through `z` |
| `\c`      | Matches character `c` literally (escapes special characters) |

## Usage Examples

### Basic Pattern Matching

```cpp
// Match file extensions
bool is_txt = fnmatch("*.txt", "report.txt");                      // true
bool is_image = fnmatch("*.{jpg,png,gif}", "vacation.jpg");        // true

// Wildcard matching
bool matches = fnmatch("file_???", "file_123");                     // true
bool not_matches = fnmatch("file_???", "file_12");                  // false

// Character class matching
bool in_range = fnmatch("Report[0-9]", "Report5");                 // true
bool not_in_range = fnmatch("Report[!0-9]", "Report5");            // false
```

### Using Different Flags

```cpp
// Case-insensitive matching
using namespace atom::algorithm::flags;
bool case_match = fnmatch("README.md", "readme.MD", CASEFOLD);     // true

// Disable escape characters
bool escaped = fnmatch("file\\.txt", "file.txt", 0);               // true
bool literal = fnmatch("file\\.txt", "file\\.txt", NOESCAPE);      // true

// Combining flags
int flags = CASEFOLD | PATHNAME;
bool combined = fnmatch("Docs/README.md", "docs/readme.md", flags); // true
```

### Working with Collections

```cpp
// Checking if any file matches a pattern
std::vector<std::string> files = {"doc.pdf", "image.png", "data.csv"};
bool has_image = filter(files, "*.png");  // true

// Filtering with multiple patterns
std::vector<std::string> patterns = {"*.jpg", "*.png", "*.gif"};
std::vector<std::string> all_files = {"report.pdf", "photo.jpg", "icon.png", "data.csv"};
auto images = filter(all_files, patterns);  // contains "photo.jpg" and "icon.png"

// Working with std::filesystem paths
namespace fs = std::filesystem;
std::vector<fs::path> paths = {
    "documents/report.pdf", 
    "images/photo.jpg", 
    "data/config.ini"
};
bool has_ini = filter(paths, "*.ini");  // true
```

### Error Handling

#### Using Exceptions

```cpp
try {
    bool matches = fnmatch("[unclosed", "test");  // Will throw
} catch (const FnmatchException& e) {
    std::cerr << "Pattern error: " << e.what() << std::endl;
}
```

#### Using Expected

```cpp
auto result = fnmatch_nothrow("[unclosed", "test");
if (!result) {
    switch (result.error()) {
        case FnmatchError::UnmatchedBracket:
            std::cerr << "Unmatched bracket in pattern" << std::endl;
            break;
        // Handle other errors...
    }
}
```

## Complete Example

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <filesystem>
#include "atom/algorithm/fnmatch.hpp"

namespace fs = std::filesystem;
using namespace atom::algorithm;

void process_directory(const fs::path& directory) {
    // Collect all files
    std::vector<fs::path> all_files;
    for (const auto& entry : fs::directory_iterator(directory)) {
        if (entry.is_regular_file()) {
            all_files.push_back(entry.path().filename());
        }
    }
    
    if (all_files.empty()) {
        std::cout << "No files found in directory" << std::endl;
        return;
    }
    
    // Show all files
    std::cout << "All files:" << std::endl;
    for (const auto& file : all_files) {
        std::cout << "  " << file << std::endl;
    }
    
    // Define patterns for different file types
    std::vector<std::string> document_patterns = {"*.txt", "*.pdf", "*.doc", "*.docx"};
    std::vector<std::string> image_patterns = {"*.jpg", "*.png", "*.gif", "*.bmp"};
    std::vector<std::string> code_patterns = {"*.cpp", "*.hpp", "*.h", "*.c", "*.py"};
    
    // Filter files by type
    auto documents = filter(all_files, document_patterns);
    auto images = filter(all_files, image_patterns);
    auto code_files = filter(all_files, code_patterns);
    
    // Create filters with flags
    int case_flags = flags::CASEFOLD;
    auto readme_files = filter(all_files, "README*", case_flags);
    
    // Display results
    std::cout << "\nFound " << documents.size() << " documents" << std::endl;
    std::cout << "Found " << images.size() << " images" << std::endl;
    std::cout << "Found " << code_files.size() << " code files" << std::endl;
    std::cout << "Found " << readme_files.size() << " README files" << std::endl;
    
    // Find specific file patterns
    try {
        if (filter(all_files, "*.log")) {
            std::cout << "\nLog files exist in this directory" << std::endl;
        }
        
        // Demonstrate error handling
        std::cout << "\nTesting error handling with invalid pattern..." << std::endl;
        bool test = fnmatch("[unclosed", "test");
    } catch (const FnmatchException& e) {
        std::cout << "Caught expected exception: " << e.what() << std::endl;
    }
    
    // Demonstrate non-throwing version
    std::cout << "\nUsing non-throwing version with invalid pattern..." << std::endl;
    auto result = fnmatch_nothrow("[unclosed", "test");
    if (!result) {
        std::cout << "Error detected without exception" << std::endl;
    }
}

int main() {
    std::cout << "fnmatch Library Demo" << std::endl;
    std::cout << "===================" << std::endl;
    
    // Process current directory
    process_directory(fs::current_path());
    
    return 0;
}
```

## Performance Considerations

- Pattern caching: The library automatically caches compiled patterns for better performance with repeated matches
- SIMD acceleration: On supported platforms, SIMD instructions may be used for faster matching
- Parallel execution: When filtering collections with multiple patterns, parallel execution can improve performance
- Optimization tips:
  - For repeated matches with the same pattern, reuse the same pattern object
  - When filtering large collections, enable parallel execution (default)
  - Consider using `fnmatch_nothrow` in performance-critical code to avoid exception overhead

## Conclusion

The `atom::algorithm::fnmatch` library provides a powerful and flexible pattern matching solution that combines the simplicity of Unix/Python glob patterns with modern C++ features. Its extensive API supports a wide range of use cases, from simple file name matching to complex filtering operations with multiple patterns.
