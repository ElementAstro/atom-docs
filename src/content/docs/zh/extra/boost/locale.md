---
title: I18n包装
description: atom::extra::boost 命名空间中 LocaleWrapper 类的详细文档，包括字符串转换、Unicode 规范化、分词、翻译、大小写转换、排序、日期/时间格式化、数字格式化、货币格式化和正则表达式操作的方法。  
---

## 类定义

```cpp
namespace atom::extra::boost {
class LocaleWrapper {
public:
    explicit LocaleWrapper(const std::string& localeName = "");

    // 静态方法
    static auto toUtf8(const std::string& str, const std::string& fromCharset) -> std::string;
    static auto fromUtf8(const std::string& str, const std::string& toCharset) -> std::string;
    static auto normalize(const std::string& str, ::boost::locale::norm_type norm = ::boost::locale::norm_default) -> std::string;
    static auto tokenize(const std::string& str, const std::string& localeName = "") -> std::vector<std::string>;
    static auto translate(const std::string& str, const std::string& domain, const std::string& localeName = "") -> std::string;
    static auto formatDate(const ::boost::posix_time::ptime& dateTime, const std::string& format) -> std::string;
    static auto formatNumber(double number, int precision = 2) -> std::string;
    static auto formatCurrency(double amount, const std::string& currency) -> std::string;
    static auto regexReplace(const std::string& str, const ::boost::regex& regex, const std::string& format) -> std::string;

    // 实例方法
    [[nodiscard]] auto toUpper(const std::string& str) const -> std::string;
    [[nodiscard]] auto toLower(const std::string& str) const -> std::string;
    [[nodiscard]] auto toTitle(const std::string& str) const -> std::string;
    [[nodiscard]] auto compare(const std::string& str1, const std::string& str2) const -> int;

    template <typename... Args>
    [[nodiscard]] auto format(const std::string& formatString, Args&&... args) const -> std::string;

private:
    std::locale locale_;
    static constexpr std::size_t K_BUFFER_SIZE = 4096;
};
}
```

## 构造函数

### `LocaleWrapper(const std::string& localeName = "")`

使用指定的语言环境创建 `LocaleWrapper` 对象。如果未提供语言环境名称，则使用全局语言环境。

```cpp
atom::extra::boost::LocaleWrapper wrapper("en_US.UTF-8");
```

## 静态方法

### 字符串转换

#### `static auto toUtf8(const std::string& str, const std::string& fromCharset) -> std::string`

将字符串从指定字符集转换为 UTF-8。

```cpp
std::string utf8String = atom::extra::boost::LocaleWrapper::toUtf8("Hello", "ISO-8859-1");
```

#### `static auto fromUtf8(const std::string& str, const std::string& toCharset) -> std::string`

将 UTF-8 字符串转换为指定字符集。

```cpp
std::string iso88591String = atom::extra::boost::LocaleWrapper::fromUtf8("Hello", "ISO-8859-1");
```

### Unicode 规范化

#### `static auto normalize(const std::string& str, ::boost::locale::norm_type norm = ::boost::locale::norm_default) -> std::string`

使用指定的规范化形式对 Unicode 字符串进行规范化。

```cpp
std::string normalizedStr = atom::extra::boost::LocaleWrapper::normalize("café", ::boost::locale::norm_nfd);
```

### 分词

#### `static auto tokenize(const std::string& str, const std::string& localeName = "") -> std::vector<std::string>`

根据指定的语言环境将字符串分词为单词。

```cpp
std::vector<std::string> tokens = atom::extra::boost::LocaleWrapper::tokenize("Hello, world!", "en_US.UTF-8");
```

### 翻译

#### `static auto translate(const std::string& str, const std::string& domain, const std::string& localeName = "") -> std::string`

使用指定的域和语言环境翻译字符串。

```cpp
std::string translated = atom::extra::boost::LocaleWrapper::translate("Hello", "mydomain", "fr_FR.UTF-8");
```

### 日期和时间格式化

#### `static auto formatDate(const ::boost::posix_time::ptime& dateTime, const std::string& format) -> std::string`

根据指定的格式字符串格式化日期和时间。

```cpp
boost::posix_time::ptime now = boost::posix_time::second_clock::local_time();
std::string formattedDate = atom::extra::boost::LocaleWrapper::formatDate(now, "%Y-%m-%d %H:%M:%S");
```

### 数字格式化

#### `static auto formatNumber(double number, int precision = 2) -> std::string`

使用指定的精度格式化数字。

```cpp
std::string formattedNumber = atom::extra::boost::LocaleWrapper::formatNumber(1234.5678, 2);
```

### 货币格式化

#### `static auto formatCurrency(double amount, const std::string& currency) -> std::string`

使用指定的货币代码格式化货币金额。

```cpp
std::string formattedCurrency = atom::extra::boost::LocaleWrapper::formatCurrency(1234.56, "USD");
```

### 正则表达式替换

#### `static auto regexReplace(const std::string& str, const ::boost::regex& regex, const std::string& format) -> std::string`

对输入字符串执行正则表达式替换。

```cpp
boost::regex pattern("\\b(\\w+)\\b");
std::string result = atom::extra::boost::LocaleWrapper::regexReplace("Hello world", pattern, "[$1]");
```

## 实例方法

### 大小写转换

#### `auto toUpper(const std::string& str) const -> std::string`

将字符串转换为大写。

```cpp
atom::extra::boost::LocaleWrapper wrapper;
std::string upperCase = wrapper.toUpper("Hello");
```

#### `auto toLower(const std::string& str) const -> std::string`

将字符串转换为小写。

```cpp
atom::extra::boost::LocaleWrapper wrapper;
std::string lowerCase = wrapper.toLower("Hello");
```

#### `auto toTitle(const std::string& str) const -> std::string`

将字符串转换为标题格式。

```cpp
atom::extra::boost::LocaleWrapper wrapper;
std::string titleCase = wrapper.toTitle("hello world");
```

### 排序

#### `auto compare(const std::string& str1, const std::string& str2) const -> int`

使用当前语言环境的排序规则比较两个字符串。

```cpp
atom::extra::boost::LocaleWrapper wrapper("fr_FR.UTF-8");
int result = wrapper.compare("école", "ecole");
```

### 消息格式化

#### `template <typename... Args> auto format(const std::string& formatString, Args&&... args) const -> std::string`

使用命名参数格式化字符串。

```cpp
atom::extra::boost::LocaleWrapper wrapper;
std::string message = wrapper.format("Hello, {1}! Today is {2}.", "Alice", "Monday");
```

## 使用示例

以下是一个全面示例，演示了 `LocaleWrapper` 类的各种功能：

```cpp
#include "locale_wrapper.hpp"
#include <iostream>
#include <boost/date_time/posix_time/posix_time.hpp>

int main() {
    // 使用特定语言环境创建 LocaleWrapper 实例
    atom::extra::boost::LocaleWrapper wrapper("en_US.UTF-8");

    // 字符串转换
    std::string utf8String = atom::extra::boost::LocaleWrapper::toUtf8("Héllo", "ISO-8859-1");
    std::cout << "UTF-8 string: " << utf8String << std::endl;

    // Unicode 规范化
    std::string normalizedStr = atom::extra::boost::LocaleWrapper::normalize("café", ::boost::locale::norm_nfd);
    std::cout << "Normalized string: " << normalizedStr << std::endl;

    // 分词
    std::vector<std::string> tokens = atom::extra::boost::LocaleWrapper::tokenize("Hello, world! How are you?");
    std::cout << "Tokens: ";
    for (const auto& token : tokens) {
        std::cout << token << " ";
    }
    std::cout << std::endl;

    ```cpp
    // 大写
    std::cout << "Uppercase: " << wrapper.toUpper("hello") << std::endl;
    // 小写
    std::cout << "Lowercase: " << wrapper.toLower("HELLO") << std::endl;
    // 标题格式
    std::cout << "Title case: " << wrapper.toTitle("hello world") << std::endl;

    // 排序
    int comparisonResult = wrapper.compare("apple", "banana");
    std::cout << "Comparison result: " << comparisonResult << std::endl;

    // 日期格式化
    boost::posix_time::ptime now = boost::posix_time::second_clock::local_time();
    std::string formattedDate = atom::extra::boost::LocaleWrapper::formatDate(now, "%Y-%m-%d %H:%M:%S");
    std::cout << "Formatted date: " << formattedDate << std::endl;

    // 数字格式化
    std::string formattedNumber = atom::extra::boost::LocaleWrapper::formatNumber(1234.5678, 2);
    std::cout << "Formatted number: " << formattedNumber << std::endl;

    // 货币格式化
    std::string formattedCurrency = atom::extra::boost::LocaleWrapper::formatCurrency(1234.56, "USD");
    std::cout << "Formatted currency: " << formattedCurrency << std::endl;

    // 正则表达式替换
    boost::regex pattern("\\b(\\w+)\\b");
    std::string regexResult = atom::extra::boost::LocaleWrapper::regexReplace("Hello world", pattern, "[$1]");
    std::cout << "Regex replace result: " << regexResult << std::endl;

    // 消息格式化
    std::string message = wrapper.format("Hello, {1}! Today is {2}.", "Alice", "Monday");
    std::cout << "Formatted message: " << message << std::endl;

    return 0;
}
```

此示例演示了 `LocaleWrapper` 类提供的各种方法的用法，包括字符串转换、Unicode 规范化、分词、大小写转换、排序、日期/时间格式化、数字格式化、货币格式化、正则表达式操作和消息格式化。

## 最佳实践

1. **语言环境初始化**：在程序开始或切换上下文时初始化 `LocaleWrapper`，以确保在所有本地化操作中行为一致。

   ```cpp
   atom::extra::boost::LocaleWrapper wrapper("en_US.UTF-8");
   ```

2. **错误处理**：将可能抛出异常的操作包装在 try-catch 块中，以优雅地处理潜在错误。

   ```cpp
   try {
       std::string utf8String = atom::extra::boost::LocaleWrapper::toUtf8("Héllo", "ISO-8859-1");
   } catch (const boost::locale::conv::conversion_error& e) {
       std::cerr << "Conversion error: " << e.what() << std::endl;
   }
   ```

3. **实例重用**：在对同一语言环境执行多个操作时，重用 `LocaleWrapper` 实例以避免不必要的对象创建并提高性能。

4. **一致的字符集使用**：在字符集之间转换时，确保在应用程序中使用一致的字符集名称，以避免意外行为。

5. **规范化**：在比较或处理 Unicode 字符串时，考虑先对其进行规范化，以确保结果一致。

   ```cpp
   std::string str1 = atom::extra::boost::LocaleWrapper::normalize(input1, ::boost::locale::norm_nfc);
   std::string str2 = atom::extra::boost::LocaleWrapper::normalize(input2, ::boost::locale::norm_nfc);
   bool areEqual = (str1 == str2);
   ```

## 高级用法场景

### 自定义排序

可以通过扩展 `LocaleWrapper` 类创建自定义排序：

```cpp
class CustomCollationWrapper : public atom::extra::boost::LocaleWrapper {
public:
    explicit CustomCollationWrapper(const std::string& localeName) : LocaleWrapper(localeName) {}

    [[nodiscard]] auto customCompare(const std::string& str1, const std::string& str2) const -> int {
        // 在此实现自定义排序逻辑
        // 例如，忽略大小写和变音符号
        std::string normalized1 = normalize(toLower(str1), ::boost::locale::norm_nfd);
        std::string normalized2 = normalize(toLower(str2), ::boost::locale::norm_nfd);
        return compare(normalized1, normalized2);
    }
};
```

### 处理多个语言环境

在应用程序中处理多个语言环境时，可以创建一个 `LocaleManager` 类：

```cpp
class LocaleManager {
public:
    LocaleManager() {
        locales_["en_US"] = std::make_unique<atom::extra::boost::LocaleWrapper>("en_US.UTF-8");
        locales_["fr_FR"] = std::make_unique<atom::extra::boost::LocaleWrapper>("fr_FR.UTF-8");
        // 根据需要添加更多语言环境
    }

    auto getWrapper(const std::string& localeName) -> atom::extra::boost::LocaleWrapper& {
        auto it = locales_.find(localeName);
        if (it != locales_.end()) {
            return *(it->second);
        }
        throw std::runtime_error("Unsupported locale: " + localeName);
    }

private:
    std::unordered_map<std::string, std::unique_ptr<atom::extra::boost::LocaleWrapper>> locales_;
};
```

### 线程安全的语言环境处理

在多线程环境中使用 `LocaleWrapper` 时，可以考虑使用线程局部存储进行语言环境特定操作：

```cpp
class ThreadSafeLocaleWrapper {
public:
    static auto getInstance() -> atom::extra::boost::LocaleWrapper& {
        static thread_local atom::extra::boost::LocaleWrapper instance;
        return instance;
    }

    static void setLocale(const std::string& localeName) {
        getInstance() = atom::extra::boost::LocaleWrapper(localeName);
    }
};

// 使用示例
void threadFunction() {
    ThreadSafeLocaleWrapper::setLocale("fr_FR.UTF-8");
    auto& wrapper = ThreadSafeLocaleWrapper::getInstance();
    // 使用 wrapper 进行语言环境特定操作
}
```
