---
title: Enum辅助设施
description: atom::meta 命名空间中枚举工具的全面文档，包括枚举名称提取、枚举与字符串/整数之间转换、枚举验证和对标志枚举的支持的函数和模板。  
---

## 关键组件

### EnumTraits

```cpp
template <typename T>
struct EnumTraits;
```

这是一个模板结构，需要为每个枚举类型进行特化。它应提供两个静态的 constexpr 成员：

- `values`: 包含所有枚举值的数组
- `names`: 包含枚举值名称的 `string_view` 数组

### 核心函数

#### enum_name

```cpp
template <typename T, T Value>
constexpr std::string_view enum_name() noexcept;

template <typename T>
constexpr auto enum_name(T value) noexcept -> std::string_view;
```

这些函数将枚举值转换为其字符串表示。

**用法：**

```cpp
auto name = enum_name<MyEnum, MyEnum::Value>();
auto name2 = enum_name(MyEnum::Value);
```

#### enum_cast

```cpp
template <typename T>
constexpr auto enum_cast(std::string_view name) noexcept -> std::optional<T>;
```

将字符串转换为枚举值。

**用法：**

```cpp
auto value = enum_cast<MyEnum>("ValueName");
```

#### enum_to_integer 和 integer_to_enum

```cpp
template <typename T>
constexpr auto enum_to_integer(T value) noexcept;

template <typename T>
constexpr auto integer_to_enum(std::underlying_type_t<T> value) noexcept -> std::optional<T>;
```

这些函数在枚举值和其基础整数表示之间进行转换。

**用法：**

```cpp
auto intValue = enum_to_integer(MyEnum::Value);
auto enumValue = integer_to_enum<MyEnum>(5);
```

#### enum_contains

```cpp
template <typename T>
constexpr auto enum_contains(T value) noexcept -> bool;
```

检查枚举值是否有效（即是否在枚举中定义）。

**用法：**

```cpp
bool isValid = enum_contains(MyEnum::Value);
```

#### enum_entries

```cpp
template <typename T>
constexpr auto enum_entries() noexcept;
```

返回包含所有枚举值及其字符串表示的数组。

**用法：**

```cpp
auto entries = enum_entries<MyEnum>();
```

### 标志枚举支持

该头文件为枚举提供了重载的按位运算符，允许将它们用作标志枚举：

```cpp
template <typename T, std::enable_if_t<std::is_enum_v<T>, int> = 0>
constexpr auto operator|(T lhs, T rhs) noexcept -> T;

template <typename T, std::enable_if_t<std::is_enum_v<T>, int> = 0>
constexpr auto operator&(T lhs, T rhs) noexcept -> T;

template <typename T, std::enable_if_t<std::is_enum_v<T>, int> = 0>
constexpr auto operator^(T lhs, T rhs) noexcept -> T;

template <typename T, std::enable_if_t<std::is_enum_v<T>, int> = 0>
constexpr auto operator~(T rhs) noexcept -> T;
```

**用法：**

```cpp
MyFlagEnum flags = MyFlagEnum::Flag1 | MyFlagEnum::Flag2;
```

### 其他实用工具

#### enum_default

```cpp
template <typename T>
constexpr auto enum_default() noexcept -> T;
```

返回枚举的默认值（`EnumTraits::values` 数组中的第一个值）。

**用法：**

```cpp
auto defaultValue = enum_default<MyEnum>();
```

#### enum_sorted_by_name 和 enum_sorted_by_value

```cpp
template <typename T>
constexpr auto enum_sorted_by_name() noexcept;

template <typename T>
constexpr auto enum_sorted_by_value() noexcept;
```

返回按名称或基础值排序的枚举条目数组。

**用法：**

```cpp
auto sortedByName = enum_sorted_by_name<MyEnum>();
auto sortedByValue = enum_sorted_by_value<MyEnum>();
```

#### enum_cast_fuzzy

```cpp
template <typename T>
auto enum_cast_fuzzy(std::string_view name) -> std::optional<T>;
```

执行模糊匹配，将字符串转换为枚举值。

**用法：**

```cpp
auto value = enum_cast_fuzzy<MyEnum>("PartialName");
```

#### integer_in_enum_range

```cpp
template <typename T>
constexpr auto integer_in_enum_range(std::underlying_type_t<T> value) noexcept -> bool;
```

检查整数值是否在有效枚举值的范围内。

**用法：**

```cpp
bool isInRange = integer_in_enum_range<MyEnum>(5);
```

#### enum_cast_with_alias

```cpp
template <typename T>
constexpr auto enum_cast_with_alias(std::string_view name) noexcept -> std::optional<T>;
```

将字符串转换为枚举值，支持在 `EnumAliasTraits` 中定义的别名。

**用法：**

```cpp
auto value = enum_cast_with_alias<MyEnum>("AliasName");
```

## 注意事项

- 这些工具旨在与 C++17 或更高版本一起使用。
- 许多函数标记为 `constexpr`，允许在可能的情况下进行编译时评估。
- 必须为每个希望与这些工具一起使用的枚举类型特化 `EnumTraits` 结构。
- 这些工具支持作用域和非作用域枚举。
- 某些函数（`enum_name`、`extract_enum_name`）使用编译器特定的特性进行名称提取。

## 示例用法

以下是如何使用这些工具与自定义枚举的示例：

```cpp
enum class Color { Red, Green, Blue };

template <>
struct EnumTraits<Color> {
    static constexpr std::array values = { Color::Red, Color::Green, Color::Blue };
    static constexpr std::array names = { "Red", "Green", "Blue" };
};

int main() {
    Color c = Color::Green;
    std::cout << enum_name(c) << std::endl;  // 输出: Green

    auto blueOpt = enum_cast<Color>("Blue");
    if (blueOpt) {
        std::cout << "Enum cast successful" << std::endl;
    }

    auto entries = enum_entries<Color>();
    for (const auto& [value, name] : entries) {
        std::cout << name << ": " << enum_to_integer(value) << std::endl;
    }

    return 0;
}
```
