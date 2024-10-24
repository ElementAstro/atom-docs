---
title: BoostCharConv包装
description: BoostCharConv 类在 atom::extra::boost 命名空间中的详细文档，包括使用 Boost 的 charconv 功能在字符串和数值类型之间转换的方法。
---

## 类定义

```cpp
namespace atom::extra::boost {

class BoostCharConv {
public:
    static auto intToString(T value, int base = DEFAULT_BASE, const FormatOptions& options = {}) -> std::string;
    static auto floatToString(T value, const FormatOptions& options = {}) -> std::string;
    static auto stringToInt(const std::string& str, int base = DEFAULT_BASE) -> T;
    static auto stringToFloat(const std::string& str) -> T;
    static auto toString(T value, const FormatOptions& options = {}) -> std::string;
    static auto fromString(const std::string& str, int base = DEFAULT_BASE) -> T;
    static auto specialValueToString(T value) -> std::string;
};

}
```

## 常量

- `ALIGNMENT`：设置为 16，用于内存对齐。
- `DEFAULT_BASE`：设置为 10，作为转换中的默认数值基数。
- `BUFFER_SIZE`：设置为 128，用于内部转换缓冲区。

## 枚举

### `NumberFormat`

定义数字表示的格式：

- `GENERAL`：一般格式（默认）
- `SCIENTIFIC`：科学记数法
- `FIXED`：定点表示法
- `HEX`：十六进制格式

## 结构体

### `FormatOptions`

提供数字到字符串转换的格式选项：

```cpp
struct alignas(ALIGNMENT) FormatOptions {
    NumberFormat format = NumberFormat::GENERAL;
    std::optional<int> precision = std::nullopt;
    bool uppercase = false;
    char thousandsSeparator = '\0';
};
```

## 公共方法

### `intToString`

将整数转换为字符串。

```cpp
template <typename T>
static auto intToString(T value, int base = DEFAULT_BASE, const FormatOptions& options = {}) -> std::string;
```

### `floatToString`

将浮点数转换为字符串。

```cpp
template <typename T>
static auto floatToString(T value, const FormatOptions& options = {}) -> std::string;
```

### `stringToInt`

将字符串转换为整数。

```cpp
template <typename T>
static auto stringToInt(const std::string& str, int base = DEFAULT_BASE) -> T;
```

### `stringToFloat`

将字符串转换为浮点数。

```cpp
template <typename T>
static auto stringToFloat(const std::string& str) -> T;
```

### `toString`

通用函数，将数字（整数或浮点数）转换为字符串。

```cpp
template <typename T>
static auto toString(T value, const FormatOptions& options = {}) -> std::string;
```

### `fromString`

通用函数，将字符串转换为数字（整数或浮点数）。

```cpp
template <typename T>
static auto fromString(const std::string& str, int base = DEFAULT_BASE) -> T;
```

### `specialValueToString`

处理特殊浮点值（NaN、Inf）的字符串转换。

```cpp
template <typename T>
static auto specialValueToString(T value) -> std::string;
```

## 使用示例

### 整数到字符串转换

```cpp
#include "boost_charconv.hpp"
#include <iostream>

int main() {
    int value = 12345;

    // 基本转换
    std::string str = atom::extra::boost::BoostCharConv::intToString(value);
    std::cout << "基本: " << str << std::endl;

    // 带格式选项
    atom::extra::boost::FormatOptions options;
    options.thousandsSeparator = ',';
    str = atom::extra::boost::BoostCharConv::intToString(value, 10, options);
    std::cout << "带分隔符: " << str << std::endl;

    // 十六进制
    str = atom::extra::boost::BoostCharConv::intToString(value, 16);
    std::cout << "十六进制: " << str << std::endl;

    return 0;
}
```

输出：

```
基本: 12345
带分隔符: 12,345
十六进制: 3039
```

### 浮点数到字符串转换

```cpp
#include "boost_charconv.hpp"
#include <iostream>

int main() {
    double value = 3.14159265359;

    // 基本转换
    std::string str = atom::extra::boost::BoostCharConv::floatToString(value);
    std::cout << "基本: " << str << std::endl;

    // 带精度
    atom::extra::boost::FormatOptions options;
    options.precision = 2;
    str = atom::extra::boost::BoostCharConv::floatToString(value, options);
    std::cout << "带精度: " << str << std::endl;

    // 科学记数法
    options.format = atom::extra::boost::NumberFormat::SCIENTIFIC;
    str = atom::extra::boost::BoostCharConv::floatToString(value, options);
    std::cout << "科学: " << str << std::endl;

    return 0;
}
```

输出：

```
基本: 3.14159265359
带精度: 3.14
科学: 3.14e+00
```

### 字符串到数字转换

```cpp
#include "boost_charconv.hpp"
#include <iostream>

int main() {
    std::string intStr = "12345";
    std::string floatStr = "3.14159";

    int intValue = atom::extra::boost::BoostCharConv::stringToInt<int>(intStr);
    double floatValue = atom::extra::boost::BoostCharConv::stringToFloat<double>(floatStr);

    std::cout << "整数值: " << intValue << std::endl;
    std::cout << "浮点值: " << floatValue << std::endl;

    return 0;
}
```

输出：

```
整数值: 12345
浮点值: 3.14159
```

### 通用转换

```cpp
#include "boost_charconv.hpp"
#include <iostream>

int main() {
    int intValue = 42;
    double floatValue = 3.14;

    std::string intStr = atom::extra::boost::BoostCharConv::toString(intValue);
    std::string floatStr = atom::extra::boost::BoostCharConv::toString(floatValue);

    std::cout << "整数转字符串: " << intStr << std::endl;
    std::cout << "浮点转字符串: " << floatStr << std::endl;

    int newIntValue = atom::extra::boost::BoostCharConv::fromString<int>(intStr);
    double newFloatValue = atom::extra::boost::BoostCharConv::fromString<double>(floatStr);

    std::cout << "字符串转整数: " << newIntValue << std::endl;
    std::cout << "字符串转浮点: " << newFloatValue << std::endl;

    return 0;
}
```

输出：

```
整数转字符串: 42
浮点转字符串: 3.14
字符串转整数: 42
字符串转浮点: 3.14
```

## 最佳实践

1. **错误处理**：始终在转换中使用 try-catch 块来处理潜在的异常。

```cpp
try {
    int value = atom::extra::boost::BoostCharConv::stringToInt<int>("123abc");
} catch (const std::runtime_error& e) {
    std::cerr << "转换错误: " << e.what() << std::endl;
}
```

2. **使用适当的类型**：确保在转换时使用正确的类型，以避免意外结果或溢出。

```cpp
// 良好的实践
long long largeValue = atom::extra::boost::BoostCharConv::stringToInt<long long>("9223372036854775807");

// 可能的溢出
int smallValue = atom::extra::boost::BoostCharConv::stringToInt<int>("9223372036854775807"); // 这将抛出异常
```

3. **区域设置感知转换**：`BoostCharConv` 类使用与区域设置无关的转换。如果您需要区域设置感知的转换，可以考虑使用 `std::locale` 和 `std::num_put`、`std::num_get`。

4. **精度控制**：在转换浮点数时，使用 `FormatOptions` 中的 `precision` 选项来控制小数位数。

```cpp
atom::extra::boost::FormatOptions options;
options.precision = 3;
std::string str = atom::extra::boost::BoostCharConv::floatToString(3.14159265359, options);
// 结果: "3.142"
```

5. **基数规范**：在将整数转换为字符串或反之时，如果不是十进制，请始终显式指定基数，以避免歧义。

```cpp
std::string hexStr = atom::extra::boost::BoostCharConv::intToString(255, 16);
// 结果: "ff"

int value = atom::extra::boost::BoostCharConv::stringToInt<int>("ff", 16);
// 结果: 255
```

## 高级用法

### 处理特殊浮点值

`specialValueToString` 方法处理特殊浮点值（如 NaN 和 Infinity）的字符串转换：

```cpp
#include <limits>
#include <iostream>

int main() {
    double nan = std::numeric_limits<double>::quiet_NaN();
    double inf = std::numeric_limits<double>::infinity();

    std::cout << "NaN: " << atom::extra::boost::BoostCharConv::specialValueToString(nan) << std::endl;
    std::cout << "Inf: " << atom::extra::boost::BoostCharConv::specialValueToString(inf) << std::endl;
    std::cout << "-Inf: " << atom::extra::boost::BoostCharConv::specialValueToString(-inf) << std::endl;

    return 0;
}
```

输出：

```
NaN: NaN
Inf: Inf
-Inf: -Inf
```

### 使用千位分隔符的自定义格式

您可以使用 `thousandsSeparator` 选项格式化大数字，添加自定义分隔符：

```cpp
atom::extra::boost::FormatOptions options;
options.thousandsSeparator = '_';
std::string str = atom::extra::boost::BoostCharConv::intToString(1234567890, 10, options);
std::cout << "格式化大数字: " << str << std::endl;
```

输出：

```
格式化大数字: 1_234_567_890
```

### 使用不同的数字格式

`NumberFormat` 枚举允许您为浮点数指定不同的表示：

```cpp
atom::extra::boost::FormatOptions options;
double value = 12345.6789;

options.format = atom::extra::boost::NumberFormat::GENERAL;
std::cout << "一般: " << atom::extra::boost::BoostCharConv::floatToString(value, options) << std::endl;

options.format = atom::extra::boost::NumberFormat::SCIENTIFIC;
std::cout << "科学: " << atom::extra::boost::BoostCharConv::floatToString(value, options) << std::endl;

options.format = atom::extra::boost::NumberFormat::FIXED;
options.precision = 2;
std::cout << "定点: " << atom::extra::boost::BoostCharConv::floatToString(value, options) << std::endl;

options.format = atom::extra::boost::NumberFormat::HEX;
std::cout << "十六进制: " << atom::extra::boost::BoostCharConv::floatToString(value, options) << std::endl;
```

输出：

```
一般: 12345.6789
科学: 1.23456789e+04
定点: 12345.68
十六进制: 1.81cd6b74c8b4396p+13
```

## 性能考虑

1. **缓冲区大小**：`BUFFER_SIZE` 常量（128 字节）用于内部转换。对于大多数用例，这应该足够。然而，如果您处理极大的数字或需要高精度，您可能需要增加此值。

2. **对齐**：`ALIGNMENT` 常量（16 字节）用于结构体对齐。这可能会影响某些架构上的性能。如有必要，根据目标平台进行调整。

3. **重用 FormatOptions**：如果您使用相同格式进行多次转换，请创建一个 `FormatOptions` 对象并重用，以避免不必要的对象创建。

```cpp
atom::extra::boost::FormatOptions options;
options.precision = 2;
options.format = atom::extra::boost::NumberFormat::FIXED;

for (double value : largeArrayOfDoubles) {
    std::string str = atom::extra::boost::BoostCharConv::floatToString(value, options);
    // 处理 str...
}
```
