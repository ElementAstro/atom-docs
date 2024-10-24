---
title: 增强版字符串
description: Enhanced String 类的全面文档，包括构造函数、运算符、基本和高级字符串操作、实用方法、静态方法和使用示例。
---

## 目录

1. [介绍](#介绍)
2. [类概述](#类概述)
3. [构造函数](#构造函数)
4. [运算符](#运算符)
5. [基本字符串操作](#基本字符串操作)
6. [高级字符串操作](#高级字符串操作)
7. [实用方法](#实用方法)
8. [静态方法](#静态方法)
9. [使用示例](#使用示例)
10. [最佳实践和注意事项](#最佳实践和注意事项)

## 介绍

`String` 类是对标准 C++ `std::string` 的功能丰富的封装，提供了一系列字符串操作。它旨在比标准字符串类更方便和强大，提供常见字符串操作和一些高级功能的方法。

## 类概述

```cpp
class String {
public:
    // 构造函数
    String();
    String(const char* str);
    String(std::string_view str);
    String(std::string str);
    String(const String& other);
    String(String&& other) noexcept;

    // 运算符
    auto operator=(const String& other) -> String&;
    auto operator=(String&& other) noexcept -> String&;
    auto operator==(const String& other) const -> bool;
    auto operator<=>(const String& other) const;
    auto operator+=(const String& other) -> String&;
    auto operator+=(const char* str) -> String&;
    auto operator+=(char c) -> String&;

    // 方法
    // ... (在后续部分列出各种方法)

    static constexpr size_t NPOS = std::string::npos;

private:
    std::string m_data_;
};
```

## 构造函数

1. 默认构造函数：`String()`
2. C 风格字符串构造函数：`String(const char* str)`
3. 字符串视图构造函数：`String(std::string_view str)`
4. 标准字符串构造函数：`String(std::string str)`
5. 拷贝构造函数：`String(const String& other)`
6. 移动构造函数：`String(String&& other) noexcept`

## 运算符

1. 赋值运算符：

   - `auto operator=(const String& other) -> String&`
   - `auto operator=(String&& other) noexcept -> String&`
   
2. 相等比较：`auto operator==(const String& other) const -> bool`
3. 三元比较：`auto operator<=>(const String& other) const`
4. 连接：
   - `auto operator+=(const String& other) -> String&`
   - `auto operator+=(const char* str) -> String&`
   - `auto operator+=(char c) -> String&`

## 基本字符串操作

1. 获取 C 风格字符串：`auto cStr() const -> const char*`
2. 获取长度：`auto length() const -> size_t`
3. 获取子字符串：`auto substr(size_t pos, size_t count = std::string::npos) const -> String`
4. 查找子字符串：`auto find(const String& str, size_t pos = 0) const -> size_t`
5. 替换第一个出现的子字符串：`auto replace(const String& oldStr, const String& newStr) -> bool`
6. 替换所有出现的子字符串：`auto replaceAll(const String& oldStr, const String& newStr) -> size_t`
7. 转换为大写：`auto toUpper() const -> String`
8. 转换为小写：`auto toLower() const -> String`
9. 拆分字符串：`auto split(const String& delimiter) const -> std::vector<String>`
10. 连接字符串：`static auto join(const std::vector<String>& strings, const String& separator) -> String`
11. 插入字符：`void insert(size_t pos, char c)`
12. 删除子字符串：`void erase(size_t pos = 0, size_t count = std::string::npos)`
13. 反转字符串：`auto reverse() const -> String`

## 高级字符串操作

1. 不区分大小写比较：`auto equalsIgnoreCase(const String& other) const -> bool`
2. 检查是否以某个字符串开头：`auto startsWith(const String& prefix) const -> bool`
3. 检查是否以某个字符串结尾：`auto endsWith(const String& suffix) const -> bool`
4. 去除空格：`void trim()`, `void ltrim()`, `void rtrim()`
5. 替换字符：`auto replace(char oldChar, char newChar) -> size_t`
6. 移除字符：`auto remove(char ch) -> size_t`
7. 左侧填充：`auto padLeft(size_t totalLength, char paddingChar = ' ') -> String&`
8. 右侧填充：`auto padRight(size_t totalLength, char paddingChar = ' ') -> String&`
9. 移除前缀：`auto removePrefix(const String& prefix) -> bool`
10. 移除后缀：`auto removeSuffix(const String& suffix) -> bool`
11. 检查是否包含子字符串：`auto contains(const String& str) const -> bool`
12. 检查是否包含字符：`auto contains(char c) const -> bool`
13. 压缩空格：`void compressSpaces()`
14. 反转单词：`auto reverseWords() const -> String`
15. 使用正则表达式替换：`auto replaceRegex(const std::string& pattern, const std::string& replacement) -> String`

## 实用方法

1. 获取底层数据：`auto data() const -> std::string`
2. 检查是否为空：`auto empty() const -> bool`

## 静态方法

1. 格式化字符串：`static auto format(std::string_view format_str, Args&&... args) -> std::string`

## 使用示例

### 基本字符串操作

```cpp
#include "string.hpp"
#include <iostream>

int main() {
    String s1("Hello, World!");
    String s2 = " Welcome to C++!";

    // 连接
    s1 += s2;
    std::cout << "连接后的字符串: " << s1 << std::endl;

    // 子字符串
    String sub = s1.substr(0, 5);
    std::cout << "子字符串: " << sub << std::endl;

    // 查找
    size_t pos = s1.find("World");
    if (pos != String::NPOS) {
        std::cout << "找到 'World' 的位置: " << pos << std::endl;
    }

    // 替换
    s1.replace("World", "Universe");
    std::cout << "替换后: " << s1 << std::endl;

    // 转为大写和小写
    std::cout << "大写: " << s1.toUpper() << std::endl;
    std::cout << "小写: " << s1.toLower() << std::endl;

    return 0;
}
```

### 高级字符串操作

```cpp
#include "string.hpp"
#include <iostream>

int main() {
    String s("  Hello,   World!  How are   you?  ");

    // 去除空格并压缩空格
    s.trim();
    s.compressSpaces();
    std::cout << "去除空格并压缩: '" << s << "'" << std::endl;

    // 拆分和连接
    auto words = s.split(" ");
    std::cout << "单词数量: " << words.size() << std::endl;
    String joined = String::join(words, "-");
    std::cout << "用破折号连接: " << joined << std::endl;

    // 反转单词
    String reversed = s.reverseWords();
    std::cout << "反转单词: " << reversed << std::endl;

    // 左侧和右侧填充
    String num = "42";
    std::cout << "左侧填充: '" << num.padLeft(5, '0') << "'" << std::endl;
    std::cout << "右侧填充: '" << num.padRight(5, '*') << "'" << std::endl;

    // 不区分大小写比较
    String s1 = "Hello";
    String s2 = "hello";
    if (s1.equalsIgnoreCase(s2)) {
        std::cout << "字符串相等（不区分大小写）" << std::endl;
    }

    return 0;
}
```

### 正则表达式和格式化

```cpp
#include "string.hpp"
#include <iostream>

int main() {
    String text = "The quick brown fox jumps over the lazy dog";

    // 使用正则表达式替换
    String result = text.replaceRegex("\\b\\w{4}\\b", "XXXX");
    std::cout << "正则替换后: " << result << std::endl;

    // 格式化
    int age = 30;
    double height = 1.75;
    String formatted = String::format("年龄: {}, 身高: {:.2f}米", age, height);
    std::cout << "格式化字符串: " << formatted << std::endl;

    return 0;
}
```

### 高级用法示例

```cpp
#include "string.hpp"
#include <iostream>
#include <algorithm>

// 自定义函数，用于大写每个其他字符
String capitalizeAlternate(const String& input) {
    String result = input;
    for (size_t i = 0; i < result.length(); i += 2) {
        result[i] = std::toupper(result[i]);
    }
    return result;
}

int main() {
    String s = "hello world";

    // 使用自定义函数
    String alternateCapitalized = capitalizeAlternate(s);
    std::cout << "交替大写: " << alternateCapitalized << std::endl;

    // 使用 lambda 和 replaceAll
    s.replaceAll("o", [](const String&) { return String("0"); });
    std::cout << "将 'o' 替换为 '0' 后: " << s << std::endl;

    return 0;
}
```

### 字符串解析和操作

```cpp
#include "string.hpp"
#include <iostream>
#include <vector>

int main() {
    String csvData = "John,Doe,30,New York,Engineer";

    // 拆分 CSV 数据
    std::vector<String> fields = csvData.split(",");

    // 处理每个字段
    for (size_t i = 0; i < fields.size(); ++i) {
        fields[i].trim();
        std::cout << "字段 " << i + 1 << ": " << fields[i] << std::endl;
    }

    // 使用不同的分隔符连接字段
    String joined = String::join(fields, " | ");
    std::cout << "连接数据: " << joined << std::endl;

    // 提取和操作特定字段
    String name = fields[0] + " " + fields[1];
    String location = fields[3];

    std::cout << "姓名: " << name.toUpper() << std::endl;
    std::cout << "位置: " << location.padRight(15, '.') << std::endl;

    return 0;
}
```

### 使用文件路径

```cpp
#include "string.hpp"
#include <iostream>

int main() {
    String filePath = "/home/user/documents/report.txt";

    // 提取文件名
    size_t lastSlash = filePath.find("/");
    String filename = (lastSlash != String::NPOS) ? filePath.substr(lastSlash + 1) : filePath;
    std::cout << "文件名: " << filename << std::endl;

    // 提取文件扩展名
    size_t lastDot = filename.find(".");
    String extension = (lastDot != String::NPOS) ? filename.substr(lastDot + 1) : "";
    std::cout << "扩展名: " << extension << std::endl;

    // 更改文件扩展名
    if (!extension.empty()) {
        filePath.removeSuffix("." + extension);
        filePath += ".pdf";
    }
    std::cout << "新文件路径: " << filePath << std::endl;

    return 0;
}
```

## 最佳实践和注意事项

1. **性能**：虽然 `String` 类提供了许多方便的方法，但在链式调用多个操作时要注意性能。一些操作可能会创建临时的字符串对象。

2. **内存管理**：`String` 类内部处理内存管理，但在按值传递 `String` 对象时要注意潜在的拷贝。

3. **线程安全**：`String` 类本身并不具备线程安全性。如果需要在多线程环境中使用 `String` 对象，请确保适当的同步。

4. **不可变性**：许多方法返回新的 `String` 对象，而不是修改原始对象。这促进了不可变性，但在频繁修改的情况下可能会对性能产生影响。

5. **Unicode 支持**：当前实现主要处理 ASCII 字符。对于完整的 Unicode 支持，考虑使用支持 Unicode 的库或扩展 `String` 类。

6. **正则表达式**：`replaceRegex` 方法提供基本的正则支持。对于更复杂的正则操作，考虑直接使用完整的 `<regex>` 库。

7. **格式化**：`format` 方法使用 C++20 的 `std::format`。确保您的编译器支持此功能，或为旧编译器提供回退。

8. **自定义操作**：`String` 类可以通过自定义方法轻松扩展。考虑子类化或添加自由函数以实现特定领域的字符串操作。

9. **与 std::string 的比较**：虽然 `String` 提供了许多方便的方法，但在某些上下文中，`std::string` 可能更合适，特别是在与标准库函数或第三方代码交互时。

10. **错误处理**：大多数方法不会对无效操作（例如，越界访问）抛出异常。在关键应用程序中，考虑添加边界检查和抛出异常以增强错误处理。
