---
title: FnMatch
description: Detailed for the fnmatch.hpp header file in the atom::algorithm namespace, including functions for shell-style pattern matching and filtering in C++.
---

## Overview

The `atom::algorithm` fnmatch library provides enhanced Python-like pattern matching functionality for C++ applications. This modern C++20 implementation offers flexible and powerful string pattern matching with support for wildcards, character classes, and various matching modes.

Key capabilities:

- Pattern matching with wildcard support (`*`, `?`, `[...]`)
- Case-sensitive or case-insensitive matching
- Path-aware matching for file paths
- Multiple pattern filtering with parallel execution support
- Modern C++ design with concepts, ranges, and error handling via exceptions or `expected`

## Header and Dependencies

```cpp
#include "atom/system/fnmatch.hpp"
```

Dependencies:

- C++20 compiler support
- Standard library headers: `<concepts>`, `<exception>`, `<ranges>`, `<string>`, `<string_view>`, `<vector>`
- Custom dependency: `"atom/type/expected.hpp"` (provides `atom::type::expected<T, E>` type)

## Detailed Component Documentation

### FnmatchException Class

```cpp
class FnmatchException : public std::exception {
public:
    explicit FnmatchException(const std::string& message) noexcept;
    [[nodiscard]] const char* what() const noexcept override;
};
```

A custom exception class for fnmatch-related errors that provides specific error messages.

Parameters:

- `message`: A detailed error message describing what went wrong

Example:

```cpp
try {
    // Invalid pattern with unmatched bracket
    atom::algorithm::fnmatch("[abc", "abc");
} catch (const atom::algorithm::FnmatchException& e) {
    std::cerr << "Error: " << e.what() << std::endl;
    // Output: Error: Unmatched [ in pattern
}
```

### Flags Namespace

```cpp
namespace flags {
    inline constexpr int NOESCAPE = 0x01;
    inline constexpr int PATHNAME = 0x02;
    inline constexpr int PERIOD = 0x04;
    inline constexpr int CASEFOLD = 0x08;
}
```

Flag constants for controlling pattern matching behavior:

- `NOESCAPE`: Disables backslash escaping, treating backslashes as literal characters
- `PATHNAME`: Ensures slashes in the string only match slashes in the pattern (path-aware matching)
- `PERIOD`: Requires that leading periods in filenames be matched explicitly (prevents hidden files from matching `*`)
- `CASEFOLD`: Enables case-insensitive matching

Example:

```cpp
// Case-insensitive matching
bool match = atom::algorithm::fnmatch("hello", "HELLO", 
                                     atom::algorithm::flags::CASEFOLD);
// match is true

// Path-aware matching
bool path_match = atom::algorithm::fnmatch("a/b/*", "a/b/c", 
                                         atom::algorithm::flags::PATHNAME);
// path_match is true, but "a/b/*" would not match "a/bcd" with PATHNAME flag
```

### StringLike Concept

```cpp
template <typename T>
concept StringLike = std::convertible_to<T, std::string_view>;
```

This concept is used throughout the library to accept any string-like type that can be converted to a `std::string_view`, including:

- `std::string`
- `std::string_view`
- C-style string literals
- Custom string classes convertible to `std::string_view`

### FnmatchError Enumeration

```cpp
enum class FnmatchError {
    InvalidPattern,
    UnmatchedBracket,
    EscapeAtEnd,
    InternalError
};
```

Enumeration for error types returned by the non-throwing functions:

- `InvalidPattern`: The pattern contains syntax errors
- `UnmatchedBracket`: The pattern contains an unmatched bracket (`[` without a closing `]`)
- `EscapeAtEnd`: The pattern ends with an escape character (`\`)
- `InternalError`: An unexpected internal error occurred

### fnmatch Function

```cpp
template <StringLike T1, StringLike T2>
[[nodiscard]] auto fnmatch(T1&& pattern, T2&& string, int flags = 0) -> bool;
```

The main pattern matching function that determines if a string matches a specified pattern.

Parameters:

- `pattern`: The pattern to match against, can contain wildcards (`*`, `?`) and character classes (`[abc]`, `[!abc]`)
- `string`: The input string to check against the pattern
- `flags`: Optional flags to control matching behavior (default is 0, see flags namespace)

Return Value:

- `true` if the string matches the pattern, `false` otherwise

Exceptions:

- Throws `FnmatchException` when the pattern is invalid

Example:

```cpp
#include "atom/system/fnmatch.hpp"
#include <iostream>

int main() {
    // Basic wildcard matching
    bool match1 = atom::algorithm::fnmatch("hello*", "hello world");
    std::cout << "hello* matches 'hello world': " << (match1 ? "yes" : "no") << std::endl;
    // Output: hello* matches 'hello world': yes
    
    // Character class matching
    bool match2 = atom::algorithm::fnmatch("file-[0-9].txt", "file-5.txt");
    std::cout << "file-[0-9].txt matches 'file-5.txt': " << (match2 ? "yes" : "no") << std::endl;
    // Output: file-[0-9].txt matches 'file-5.txt': yes
    
    // Non-matching example
    bool match3 = atom::algorithm::fnmatch("*.cpp", "program.h");
    std::cout << "*.cpp matches 'program.h': " << (match3 ? "yes" : "no") << std::endl;
    // Output: *.cpp matches 'program.h': no
    
    return 0;
}
```

### fnmatch_nothrow Function

```cpp
template <StringLike T1, StringLike T2>
[[nodiscard]] auto fnmatch_nothrow(T1&& pattern, T2&& string, int flags = 0) noexcept
    -> atom::type::expected<bool, FnmatchError>;
```

A non-throwing version of `fnmatch` that returns an `expected` type instead of throwing exceptions.

Parameters:

- Same as `fnmatch`

Return Value:

- An `atom::type::expected<bool, FnmatchError>` containing either:
  - The match result (`true`/`false`) on success
  - A `FnmatchError` on error

Example:

```cpp
#include "atom/system/fnmatch.hpp"
#include <iostream>

int main() {
    // Valid pattern
    auto result1 = atom::algorithm::fnmatch_nothrow("data-*.txt", "data-2023.txt");
    if (result1) {
        std::cout << "Match result: " << (*result1 ? "matched" : "not matched") << std::endl;
        // Output: Match result: matched
    }
    
    // Invalid pattern
    auto result2 = atom::algorithm::fnmatch_nothrow("[incomplete", "test");
    if (!result2) {
        std::cout << "Error occurred: ";
        switch (result2.error()) {
            case atom::algorithm::FnmatchError::UnmatchedBracket:
                std::cout << "unmatched bracket in pattern";
                break;
            default:
                std::cout << "other error";
        }
        std::cout << std::endl;
        // Output: Error occurred: unmatched bracket in pattern
    }
    
    return 0;
}
```

### filter Function (Single Pattern)

```cpp
template <std::ranges::input_range Range, StringLike Pattern>
    requires StringLike<std::ranges::range_value_t<Range>>
[[nodiscard]] auto filter(const Range& names, Pattern&& pattern, int flags = 0) -> bool;
```

Checks if any element in a range of strings matches the specified pattern.

Parameters:

- `names`: Range of string-like elements to filter
- `pattern`: Pattern to match against
- `flags`: Optional flags to control matching behavior

Return Value:

- `true` if any element in `names` matches the pattern, otherwise `false`

Example:

```cpp
#include "atom/system/fnmatch.hpp"
#include <iostream>
#include <vector>
#include <string>

int main() {
    std::vector<std::string> filenames = {
        "document.pdf",
        "image.jpg",
        "notes.txt",
        "program.cpp"
    };
    
    bool has_cpp = atom::algorithm::filter(filenames, "*.cpp");
    std::cout << "Has C++ files: " << (has_cpp ? "yes" : "no") << std::endl;
    // Output: Has C++ files: yes
    
    bool has_html = atom::algorithm::filter(filenames, "*.html");
    std::cout << "Has HTML files: " << (has_html ? "yes" : "no") << std::endl;
    // Output: Has HTML files: no
    
    return 0;
}
```

### filter Function (Multiple Patterns)

```cpp
template <std::ranges::input_range Range, std::ranges::input_range PatternRange>
    requires StringLike<std::ranges::range_value_t<Range>> &&
                 StringLike<std::ranges::range_value_t<PatternRange>>
[[nodiscard]] auto filter(const Range& names, const PatternRange& patterns,
                          int flags = 0, bool use_parallel = true)
    -> std::vector<std::ranges::range_value_t<Range>>;
```

Filters a range of strings based on multiple patterns, returning a vector of matching strings.

Parameters:

- `names`: Range of string-like elements to filter
- `patterns`: Range of patterns to match against
- `flags`: Optional flags to control matching behavior
- `use_parallel`: Whether to use parallel execution for better performance with many patterns (default is true)

Return Value:

- A vector containing strings from `names` that match any pattern in `patterns`

Example:

```cpp
#include "atom/system/fnmatch.hpp"
#include <iostream>
#include <vector>
#include <string>

int main() {
    std::vector<std::string> filenames = {
        "document.pdf",
        "image.jpg",
        "notes.txt",
        "report.pdf",
        "script.py",
        "program.cpp"
    };
    
    std::vector<std::string> patterns = {"*.pdf", "*.cpp"};
    
    // Get all PDF and CPP files
    auto matches = atom::algorithm::filter(filenames, patterns);
    
    std::cout << "Matching files:" << std::endl;
    for (const auto& match : matches) {
        std::cout << "- " << match << std::endl;
    }
    // Output:
    // Matching files:
    // - document.pdf
    // - report.pdf
    // - program.cpp
    
    return 0;
}
```

### translate Function

```cpp
template <StringLike Pattern>
[[nodiscard]] auto translate(Pattern&& pattern, int flags = 0) noexcept
    -> atom::type::expected<std::string, FnmatchError>;
```

Translates a fnmatch pattern into an equivalent regular expression string.

Parameters:

- `pattern`: The pattern to translate
- `flags`: Optional flags to control the translation behavior

Return Value:

- An `atom::type::expected` containing either:
  - The resulting regex string on success
  - A `FnmatchError` on error

Example:

```cpp
#include "atom/system/fnmatch.hpp"
#include <iostream>
#include <regex>
#include <string>

int main() {
    auto result = atom::algorithm::translate("file-*.txt");
    
    if (result) {
        std::string regex_pattern = *result;
        std::cout << "Regex pattern: " << regex_pattern << std::endl;
        // Output might be: Regex pattern: file\-.*\.txt
        
        // Using the resulting regex
        std::regex r(regex_pattern);
        bool matches = std::regex_match("file-123.txt", r);
        std::cout << "Regex matches 'file-123.txt': " << (matches ? "yes" : "no") << std::endl;
        // Output: Regex matches 'file-123.txt': yes
    } else {
        std::cout << "Error translating pattern" << std::endl;
    }
    
    return 0;
}
```

### detail::CompiledPattern Class

```cpp
namespace detail {
class CompiledPattern {
public:
    explicit CompiledPattern(std::string_view pattern, int flags = 0);
    [[nodiscard]] bool match(std::string_view string) const noexcept;
    // Additional implementation details...
};
}
```

An internal implementation class that compiles patterns for efficient repeated matching.

Note: This class is part of the implementation details and is not intended to be used directly by library users.

## Pattern Syntax Guide

The fnmatch library supports the following pattern syntax:

- `*`: Matches any sequence of characters (zero or more)
- `?`: Matches exactly one character
- `[seq]`: Matches any character in the sequence
- `[!seq]`: Matches any character not in the sequence
- `[a-z]`: Matches any character in the specified range
- `\char`: Escapes special characters (unless `NOESCAPE` flag is used)

## Performance Considerations

1. Compiled Patterns: For repeated matches using the same pattern, the internal `CompiledPattern` class provides optimized performance.

2. SIMD Acceleration: When applicable, the library uses SIMD instructions for faster pattern matching via the `simd_match_if_available` function.

3. Parallel Execution: The multi-pattern `filter` function supports parallel execution for improved performance with large sets of patterns.

4. String Views: The library accepts `std::string_view` parameters to avoid unnecessary copying of string data.

5. Performance Trade-offs:
   - Simple patterns (like `*.txt`) are fast, while complex patterns with many brackets or alternations may be slower.
   - Case-insensitive matching (`CASEFOLD` flag) is somewhat slower than case-sensitive matching.

## Best Practices

1. Error Handling:
   - Use `fnmatch_nothrow` in performance-critical code to avoid exception overhead
   - Use regular `fnmatch` in code where exceptions are already part of the error handling strategy

2. Pattern Reuse:
   - When using the same pattern multiple times, consider using the `filter` function instead of calling `fnmatch` in a loop

3. String Views:
   - Pass string views or string literals directly to avoid unnecessary conversions

4. Flag Combination:
   - Combine flags using bitwise OR: `flags::PATHNAME | flags::CASEFOLD`

5. Path Matching:
   - Always use the `PATHNAME` flag when matching file paths to ensure proper path separator handling

6. Case Sensitivity:
   - Consider using `CASEFOLD` for file matching on case-insensitive file systems (Windows)

## Common Pitfalls

1. Unescaped Special Characters:
   - Special characters (`*`, `?`, `[`, etc.) must be escaped with a backslash to match literally
   - Example: To match a literal `*`, use the pattern `\*`

2. Incorrect Bracket Usage:
   - Ensure all opening brackets `[` have matching closing brackets `]`
   - Use `[!...]` for negation, not `[^...]` (which is the regex syntax)

3. Path Separator Issues:
   - Without the `PATHNAME` flag, `*` will match across directory boundaries
   - Example: `a*c` would match `a/b/c` without `PATHNAME` flag

4. Leading Periods in Filenames:
   - Use the `PERIOD` flag when matching against filenames to properly handle hidden files (those starting with a dot)

5. Performance with Complex Patterns:
   - Avoid overly complex patterns with many character classes or alternations

## Platform-Specific Notes

1. Windows:
   - File paths use backslashes (`\`) which must be escaped in C++ strings
   - Consider using raw string literals (`R"(pattern)"`) for Windows paths
   - For case-insensitive file systems, consider using the `CASEFOLD` flag

2. Case Sensitivity:
   - Linux/Unix filesystems are typically case-sensitive
   - Windows and macOS filesystems are typically case-insensitive
   - Use `CASEFOLD` appropriately based on the target platform

3. Compiler Support:
   - Requires a C++20-compliant compiler for concepts and ranges
   - SIMD acceleration availability depends on compiler support and platform

## Comprehensive Example

The following example demonstrates the core functionality of the fnmatch library:

```cpp
#include "atom/system/fnmatch.hpp"
#include <iostream>
#include <string>
#include <vector>
#include <filesystem>

namespace fs = std::filesystem;
namespace alg = atom::algorithm;

// Helper function to list and filter files
void list_filtered_files(const fs::path& directory, 
                         const std::vector<std::string>& patterns,
                         bool case_sensitive = true) {
    std::vector<std::string> filenames;
    
    // Collect all filenames
    for (const auto& entry : fs::directory_iterator(directory)) {
        if (fs::is_regular_file(entry)) {
            filenames.push_back(entry.path().filename().string());
        }
    }
    
    // Set up flags based on parameters
    int flags = alg::flags::PATHNAME;
    if (!case_sensitive) {
        flags |= alg::flags::CASEFOLD;
    }
    
    // Apply pattern filtering
    auto matches = alg::filter(filenames, patterns, flags);
    
    // Display results
    std::cout << "Files matching patterns " << std::endl;
    for (const auto& pattern : patterns) {
        std::cout << "  - " << pattern << std::endl;
    }
    std::cout << "in directory " << directory << ":" << std::endl;
    
    if (matches.empty()) {
        std::cout << "  No matches found." << std::endl;
    } else {
        for (const auto& file : matches) {
            std::cout << "  " << file << std::endl;
        }
    }
}

// Example usage with error handling
bool is_safe_pattern(const std::string& pattern) {
    auto result = alg::fnmatch_nothrow(pattern, ""); // Syntax validation only
    return result.has_value(); // If we got a value, pattern is syntactically valid
}

int main() {
    try {
        // Basic pattern matching examples
        std::cout << "--- Basic Pattern Matching ---" << std::endl;
        std::vector<std::pair<std::string, std::string>> test_cases = {
            {"*.txt", "document.txt"},
            {"data-???.csv", "data-123.csv"},
            {"log-[0-9][0-9][0-9].txt", "log-042.txt"},
            {"report-[!a-z].pdf", "report-5.pdf"},
            {"backup_*_[0-9][0-9][0-9][0-9].zip", "backup_system_2023.zip"}
        };
        
        for (const auto& [pattern, text] : test_cases) {
            bool matches = alg::fnmatch(pattern, text);
            std::cout << "Pattern: " << pattern << std::endl;
            std::cout << "Text:    " << text << std::endl;
            std::cout << "Matches: " << (matches ? "Yes" : "No") << std::endl << std::endl;
        }
        
        // Case sensitivity example
        std::cout << "--- Case Sensitivity Example ---" << std::endl;
        std::string pattern = "*.PDF";
        std::string text = "document.pdf";
        
        bool case_sensitive = alg::fnmatch(pattern, text);
        bool case_insensitive = alg::fnmatch(pattern, text, alg::flags::CASEFOLD);
        
        std::cout << "Pattern: " << pattern << ", Text: " << text << std::endl;
        std::cout << "Case-sensitive match: " << (case_sensitive ? "Yes" : "No") << std::endl;
        std::cout << "Case-insensitive match: " << (case_insensitive ? "Yes" : "No") << std::endl << std::endl;
        
        // Multiple pattern filtering
        std::cout << "--- Multiple Pattern Filtering ---" << std::endl;
        std::vector<std::string> files = {
            "document.txt", "image.jpg", "spreadsheet.xlsx", 
            "presentation.ppt", "script.py", "data.csv"
        };
        
        std::vector<std::string> doc_patterns = {"*.txt", "*.xlsx", "*.csv"};
        
        std::cout << "Files:" << std::endl;
        for (const auto& file : files) {
            std::cout << "  " << file << std::endl;
        }
        
        std::cout << "Document patterns: ";
        for (const auto& dp : doc_patterns) {
            std::cout << dp << " ";
        }
        std::cout << std::endl;
        
        auto documents = alg::filter(files, doc_patterns);
        
        std::cout << "Matched documents:" << std::endl;
        for (const auto& doc : documents) {
            std::cout << "  " << doc << std::endl;
        }
        std::cout << std::endl;
        
        // Error handling example
        std::cout << "--- Error Handling Example ---" << std::endl;
        std::vector<std::string> test_patterns = {
            "valid-*.txt",
            "invalid-[abc.txt",   // Missing closing bracket
            "another-]abc.txt",   // Bracket without opening
            "escaped-\\",         // Escape at end
            "normal-pattern.*"
        };
        
        for (const auto& test_pattern : test_patterns) {
            std::cout << "Pattern: " << test_pattern << " - ";
            
            if (is_safe_pattern(test_pattern)) {
                std::cout << "Valid pattern" << std::endl;
            } else {
                // In real code, you'd catch the FnmatchException
                std::cout << "Invalid pattern" << std::endl;
            }
        }
        
        // Pattern translation example
        std::cout << "--- Pattern Translation Example ---" << std::endl;
        auto translated = alg::translate("data-*.txt");
        if (translated) {
            std::cout << "Pattern: data-*.txt" << std::endl;
            std::cout << "Regex:   " << *translated << std::endl;
        }
        
    } catch (const alg::FnmatchException& e) {
        std::cerr << "Fnmatch error: " << e.what() << std::endl;
        return 1;
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
```

Expected Output:

```
--- Basic Pattern Matching ---
Pattern: *.txt
Text:    document.txt
Matches: Yes

Pattern: data-???.csv
Text:    data-123.csv
Matches: Yes

Pattern: log-[0-9][0-9][0-9].txt
Text:    log-042.txt
Matches: Yes

Pattern: report-[!a-z].pdf
Text:    report-5.pdf
Matches: Yes

Pattern: backup_*_[0-9][0-9][0-9][0-9].zip
Text:    backup_system_2023.zip
Matches: Yes

--- Case Sensitivity Example ---
Pattern: *.PDF, Text: document.pdf
Case-sensitive match: No
Case-insensitive match: Yes

--- Multiple Pattern Filtering ---
Files:
  document.txt
  image.jpg
  spreadsheet.xlsx
  presentation.ppt
  script.py
  data.csv
Document patterns: *.txt *.xlsx *.csv
Matched documents:
  document.txt
  spreadsheet.xlsx
  data.csv

--- Error Handling Example ---
Pattern: valid-*.txt - Valid pattern
Pattern: invalid-[abc.txt - Invalid pattern
Pattern: another-]abc.txt - Invalid pattern
Pattern: escaped-\ - Invalid pattern
Pattern: normal-pattern.* - Valid pattern

--- Pattern Translation Example ---
Pattern: data-*.txt
Regex:   data\-.*\.txt
```

This comprehensive documentation should give both new and experienced C++ developers a clear understanding of how to use the ATOM fnmatch library effectively.
