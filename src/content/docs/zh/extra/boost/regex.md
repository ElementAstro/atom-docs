---
title: 正则表达式封装
description: atom::extra::boost 命名空间中 RegexWrapper 类的详细文档，包括构造函数、基本和高级正则表达式操作、实用方法和使用示例。  
---

## 目录

1. [构造函数](#构造函数)
2. [基本操作](#基本操作)
   - [match](#match)
   - [search](#search)
   - [searchAll](#searchall)
   - [replace](#replace)
   - [split](#split)
3. [高级操作](#高级操作)
   - [matchGroups](#matchgroups)
   - [forEachMatch](#foreachmatch)
   - [namedCaptures](#namedcaptures)
   - [replaceCallback](#replacecallback)
4. [实用方法](#实用方法)
   - [getPattern](#getpattern)
   - [setPattern](#setpattern)
   - [isValid](#isvalid)
   - [escapeString](#escapestring)
   - [benchmarkMatch](#benchmarkmatch)
   - [isValidRegex](#isvalidregex)

## 构造函数

```cpp
explicit RegexWrapper(std::string_view pattern,
                      ::boost::regex_constants::syntax_option_type flags =
                          ::boost::regex_constants::normal)
```

使用给定的正则表达式模式和可选标志创建 `RegexWrapper` 对象。

**示例：**

```cpp
atom::extra::boost::RegexWrapper regex("\\d+");
atom::extra::boost::RegexWrapper regex_i("\\w+", boost::regex_constants::icase);
```

## 基本操作

### match

```cpp
template <typename T>
    requires std::convertible_to<T, std::string_view>
auto match(const T& str) const -> bool
```

将整个输入字符串与正则表达式模式进行匹配。

**示例：**

```cpp
atom::extra::boost::RegexWrapper regex("\\d+");
bool result = regex.match("12345");  // true
bool result2 = regex.match("abc");   // false
```

### search

```cpp
template <typename T>
    requires std::convertible_to<T, std::string_view>
auto search(const T& str) const -> std::optional<std::string>
```

搜索输入字符串中正则表达式模式的第一次出现。

**示例：**

```cpp
atom::extra::boost::RegexWrapper regex("\\d+");
auto result = regex.search("abc123def");  // Optional containing "123"
auto result2 = regex.search("abcdef");    // std::nullopt
```

### searchAll

```cpp
template <typename T>
    requires std::convertible_to<T, std::string_view>
auto searchAll(const T& str) const -> std::vector<std::string>
```

搜索输入字符串中正则表达式模式的所有出现。

**示例：**

```cpp
atom::extra::boost::RegexWrapper regex("\\d+");
auto results = regex.searchAll("abc123def456ghi");  // Vector containing {"123", "456"}
```

### replace

```cpp
template <typename T, typename U>
    requires std::convertible_to<T, std::string_view> &&
                 std::convertible_to<U, std::string_view>
auto replace(const T& str, const U& replacement) const -> std::string
```

用替换字符串替换输入字符串中所有出现的正则表达式模式。

**示例：**

```cpp
atom::extra::boost::RegexWrapper regex("\\d+");
std::string result = regex.replace("abc123def456", "X");  // "abcXdefX"
```

### split

```cpp
template <typename T>
    requires std::convertible_to<T, std::string_view>
auto split(const T& str) const -> std::vector<std::string>
```

通过正则表达式模式拆分输入字符串。

**示例：**

```cpp
atom::extra::boost::RegexWrapper regex(",");
auto parts = regex.split("a,b,c,d");  // Vector containing {"a", "b", "c", "d"}
```

## 高级操作

### matchGroups

```cpp
template <typename T>
    requires std::convertible_to<T, std::string_view>
auto matchGroups(const T& str) const
    -> std::vector<std::pair<std::string, std::vector<std::string>>>
```

匹配输入字符串并返回每个匹配的组。

**示例：**

```cpp
atom::extra::boost::RegexWrapper regex("(\\w+)=(\\d+)");
auto groups = regex.matchGroups("key1=123,key2=456");
// 结果: {{"key1=123", {"key1", "123"}}, {"key2=456", {"key2", "456"}}}
```

### forEachMatch

```cpp
template <typename T, typename Func>
    requires std::convertible_to<T, std::string_view> &&
             std::invocable<Func, const ::boost::smatch&>
void forEachMatch(const T& str, Func&& func) const
```

对输入字符串中正则表达式模式的每个匹配应用一个函数。

**示例：**

```cpp
atom::extra::boost::RegexWrapper regex("\\d+");
regex.forEachMatch("a1b2c3", [](const boost::smatch& match) {
    std::cout << "Found: " << match.str() << std::endl;
});
// 输出:
// Found: 1
// Found: 2
// Found: 3
```

### namedCaptures

```cpp
template <typename T>
    requires std::convertible_to<T, std::string_view>
auto namedCaptures(const T& str) const
    -> std::map<std::string, std::string>
```

匹配输入字符串并返回命名捕获。

**示例：**

```cpp
atom::extra::boost::RegexWrapper regex("(?<key>\\w+)=(?<value>\\d+)");
auto captures = regex.namedCaptures("name=John");
// 结果: {"key": "name", "value": "John"}
```

### replaceCallback

```cpp
template <typename T>
    requires std::convertible_to<T, std::string_view>
auto replaceCallback(
    const T& str,
    const std::function<std::string(const ::boost::smatch&)>& callback)
    const -> std::string
```

使用回调函数替换输入字符串中所有正则表达式模式的匹配。

**示例：**

```cpp
atom::extra::boost::RegexWrapper regex("\\d+");
std::string result = regex.replaceCallback("a1b2c3", [](const boost::smatch& match) {
    int value = std::stoi(match.str());
    return std::to_string(value * 2);
});
// 结果: "a2b4c6"
```

## 实用方法

### getPattern

```cpp
[[nodiscard]] auto getPattern() const -> std::string
```

获取正则表达式模式作为字符串。

**示例：**

```cpp
atom::extra::boost::RegexWrapper regex("\\d+");
std::string pattern = regex.getPattern();  // "\d+"
```

### setPattern

```cpp
void setPattern(std::string_view pattern,
                ::boost::regex_constants::syntax_option_type flags =
                    ::boost::regex_constants::normal)
```

设置新的正则表达式模式和可选标志。

**示例：**

```cpp
atom::extra::boost::RegexWrapper regex("\\d+");
regex.setPattern("\\w+", boost::regex_constants::icase);
```

### isValid

```cpp
template <typename T>
    requires std::convertible_to<T, std::string_view>
auto isValid(const T& str) const -> bool
```

检查给定字符串是否与正则表达式模式匹配。

**示例：**

```cpp
atom::extra::boost::RegexWrapper regex("\\d{3}-\\d{2}-\\d{4}");
bool valid1 = regex.isValid("123-45-6789");  // true
bool valid2 = regex.isValid("12-345-6789");  // false
```

### escapeString

```cpp
[[nodiscard]] static auto escapeString(const std::string& str)
    -> std::string
```

转义给定字符串中的特殊字符以用于正则表达式模式。

**示例：**

```cpp
std::string escaped = atom::extra::boost::RegexWrapper::escapeString("1+1=2");
// 结果: "1\\+1\\=2"
```

### benchmarkMatch

```cpp
template <typename T>
    requires std::convertible_to<T, std::string_view>
auto benchmarkMatch(const T& str, int iterations = 1000) const
    -> std::chrono::nanoseconds
```

对给定字符串的匹配操作进行基准测试，迭代指定次数。

**示例：**

```cpp
atom::extra::boost::RegexWrapper regex("\\d+");
auto avg_time = regex.benchmarkMatch("12345", 10000);
std::cout << "Average match time: " << avg_time.count() << " ns" << std::endl;
```

### isValidRegex

```cpp
static auto isValidRegex(const std::string& pattern) -> bool
```

检查给定的正则表达式模式是否有效。

**示例：**

```cpp
bool valid1 = atom::extra::boost::RegexWrapper::isValidRegex("\\d+");    // true
bool valid2 = atom::extra::boost::RegexWrapper::isValidRegex("\\d+[");   // false
```

## 完整使用示例

以下是一个全面示例，演示 `RegexWrapper` 类的各种功能：

```cpp
#include "atom_extra_boost_regex.hpp"
#include <iostream>
#include <string>

int main() {
    // 创建 RegexWrapper 对象
    atom::extra::boost::RegexWrapper regex("(\\w+)=(\\d+)");

    // 基本操作
    std::string input = "key1=123,key2=456,key3=789";

    // Match
    bool full_match = regex.match("name=John");
    std::cout << "Full match: " << (full_match ? "true" : "false") << std::endl;

    // Search
    auto search_result = regex.search(input);
    if (search_result) {
        std::cout << "First match: " << *search_result << std::endl;
    }

    // SearchAll
    auto all_matches = regex.searchAll(input);
    std::cout << "All matches:" << std::endl;
    for (const auto& match : all_matches) {
        std::cout << "  " << match << std::endl;
    }

    // Replace
    std::string replaced = regex.replace(input, "[$1:$2]");
    std::cout << "Replaced: " << replaced << std::endl;

    // Split
    atom::extra::boost::RegexWrapper split_regex(",");
    auto parts = split_regex.split(input);
    std::cout << "Split parts:" << std::endl;
    for (const auto& part : parts) {
        std::cout << "  " << part << std::endl;
    }

    // 高级操作
    // MatchGroups
    auto groups = regex.matchGroups(input);
    std::cout << "Match groups:" << std::endl;
    for (const auto& [full_match, group_matches] : groups) {
        std::cout << "  Full match: " << full_match << std::endl;
        std::cout << "  Groups:" << std::endl;
        for (const auto& group : group_matches) {
            std::cout << "    " << group << std::endl;
        }
    }

    // ForEachMatch
    std::cout << "ForEachMatch:" << std::endl;
    regex.forEachMatch(input, [](const boost::smatch& match) {
        std::cout << "  Match: " << match[0] << ", Key: " << match[1] << ", Value: " << match[2] << std::endl;
    });

    // ReplaceCallback
    std::string callback_replaced = regex.replaceCallback(input, [](const boost::smatch& match) {
        int value = std::stoi(match[2]);
        return match[1].str() + "=" + std::to_string(value * 2);
    });
    std::cout << "Callback replaced: " << callback_replaced << std::endl;

    // 实用方法
    std::cout << "Regex pattern: " << regex.getPattern() << std::endl;

    regex.setPattern("\\d+");
    std::cout << "New pattern: " << regex.getPattern() << std::endl;

    std::cout << "Is '123' valid? " << (regex.isValid("123") ? "true" : "false") << std::endl;
    std::cout << "Is 'abc' valid? " << (regex.isValid("abc") ? "true" : "false") << std::endl;

    std::string to_escape = "1+1=2";
    std::cout << "Escaped string: " << atom::extra::boost::RegexWrapper::escapeString(to_escape) << std::endl;

    auto bench_time = regex.benchmarkMatch("12345", 10000);
    std::cout << "Average match time: " << bench_time.count() << " ns" << std::endl;

    std::cout << "Is '\\d+' a valid regex? " << (atom::extra::boost::RegexWrapper::isValidRegex("\\d+") ? "true" : "false") << std::endl;
    std::cout << "Is '\\d+[' a valid regex? " << (atom::extra::boost::RegexWrapper::isValidRegex("\\d+[") ? "true" : "false") << std::endl;

    return 0;
}
```
