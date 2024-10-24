---
title: TypeCaster
description: 详细文档，介绍 atom::meta 命名空间中的 TypeCaster 类，包括构造函数、关键方法、类型转换、枚举处理和使用示例。  
---

## 目录

1. [类概述](#类概述)
2. [构造函数](#构造函数)
3. [静态工厂方法](#静态工厂方法)
4. [关键方法](#关键方法)
5. [使用示例](#使用示例)

## 类概述

`TypeCaster` 类旨在处理 C++ 应用程序中的复杂类型转换。它允许注册自定义类型转换、创建类型别名、分组类型和执行多阶段转换。

## 构造函数

```cpp
TypeCaster()
```

默认构造函数初始化一个 `TypeCaster` 对象，并自动注册内置类型。

## 静态工厂方法

```cpp
static auto createShared() -> std::shared_ptr<TypeCaster>
```

此静态方法创建并返回一个指向新 `TypeCaster` 实例的共享指针。

## 关键方法

### 1. 转换

```cpp
template <typename DestinationType>
auto convert(const std::any& input) const -> std::any
```

将任意类型的输入转换为指定的目标类型。

- **参数：**
  - `input`：要转换的输入值（类型为 `std::any`）
- **返回：** 转换后的值，类型为 `std::any`
- **抛出：** `std::invalid_argument` 如果未找到源类型

### 2. 注册转换

```cpp
template <typename SourceType, typename DestinationType>
void registerConversion(ConvertFunc func)
```

注册两个类型之间的转换函数。

- **参数：**
  - `func`：转换函数
- **抛出：** `std::invalid_argument` 如果源类型和目标类型相同

### 3. 注册别名

```cpp
template <typename T>
void registerAlias(const std::string& alias)
```

为类型注册一个别名。

- **参数：**
  - `alias`：别名名称

### 4. 注册类型组

```cpp
void registerTypeGroup(const std::string& groupName, const std::vector<std::string>& types)
```

在一个公共组名下注册一组类型。

- **参数：**
  - `groupName`：组的名称
  - `types`：要分组的类型名称列表

### 5. 注册多阶段转换

```cpp
template <typename IntermediateType, typename SourceType, typename DestinationType>
void registerMultiStageConversion(ConvertFunc func1, ConvertFunc func2)
```

注册一个多阶段转换函数。

- **参数：**
  - `func1`：第一阶段转换函数
  - `func2`：第二阶段转换函数

### 6. 检查转换

```cpp
auto hasConversion(TypeInfo src, TypeInfo dst) const -> bool
```

检查两个类型之间是否存在转换。

- **参数：**
  - `src`：源类型
  - `dst`：目标类型
- **返回：** 如果存在转换则返回 `true`，否则返回 `false`

### 7. 获取注册类型

```cpp
auto getRegisteredTypes() const -> std::vector<std::string>
```

获取注册类型的列表。

- **返回：** 注册类型名称的向量

### 8. 注册类型

```cpp
template <typename T>
void registerType(const std::string& name)
```

使用给定名称注册类型。

- **参数：**
  - `name`：注册类型的名称

### 9. 注册枚举值

```cpp
template <typename EnumType>
void registerEnumValue(const std::string& enum_name, const std::string& string_value, EnumType enum_value)
```

注册枚举值及其字符串表示。

- **参数：**
  - `enum_name`：枚举类型的名称
  - `string_value`：枚举值的字符串表示
  - `enum_value`：实际的枚举值

### 10. 获取枚举映射

```cpp
template <typename EnumType>
auto getEnumMap(const std::string& enum_name) const -> const std::unordered_map<std::string, EnumType>&
```

检索给定枚举类型的枚举映射。

- **参数：**
  - `enum_name`：枚举类型的名称
- **返回：** 对枚举映射的常量引用

### 11. 枚举转字符串

```cpp
template <typename EnumType>
auto enumToString(EnumType value, const std::string& enum_name) -> std::string
```

将枚举值转换为其字符串表示。

- **参数：**
  - `value`：要转换的枚举值
  - `enum_name`：枚举类型的名称
- **返回：** 枚举值的字符串表示
- **抛出：** `std::invalid_argument` 如果未找到枚举值

### 12. 字符串转枚举

```cpp
template <typename EnumType>
auto stringToEnum(const std::string& string_value, const std::string& enum_name) -> EnumType
```

将字符串转换为其对应的枚举值。

- **参数：**
  - `string_value`：枚举值的字符串表示
  - `enum_name`：枚举类型的名称
- **返回：** 对应的枚举值
- **抛出：** `std::invalid_argument` 如果未找到字符串值

## 使用示例

以下是一些示例，演示如何使用 `TypeCaster` 类：

### 基本用法

```cpp
#include "type_caster.hpp"
#include <iostream>

int main() {
    auto caster = atom::meta::TypeCaster::createShared();

    // 将整数转换为字符串
    int intValue = 42;
    std::any result = caster->convert<std::string>(std::any(intValue));
    std::cout << std::any_cast<std::string>(result) << std::endl;  // 输出: "42"

    return 0;
}
```

### 注册自定义转换

```cpp
#include "type_caster.hpp"
#include <iostream>

struct CustomType {
    int value;
    explicit CustomType(int v) : value(v) {}
};

int main() {
    auto caster = atom::meta::TypeCaster::createShared();

    // 注册从 CustomType 到 int 的自定义转换
    caster->registerConversion<CustomType, int>([](const std::any& input) {
        return std::any(std::any_cast<CustomType>(input).value);
    });

    // 使用自定义转换
    CustomType customValue(123);
    std::any result = caster->convert<int>(std::any(customValue));
    std::cout << std::any_cast<int>(result) << std::endl;  // 输出: 123

    return 0;
}
```

### 使用类型别名

```cpp
#include "type_caster.hpp"
#include <iostream>

int main() {
    auto caster = atom::meta::TypeCaster::createShared();

    // 为 int 注册一个别名
    caster->registerAlias<int>("Integer");

    // 在转换中使用别名
    double doubleValue = 3.14;
    std::any result = caster->convert<Integer>(std::any(doubleValue));
    std::cout << std::any_cast<int>(result) << std::endl;  // 输出: 3

    return 0;
}
```

### 多阶段转换

```cpp
#include "type_caster.hpp"
#include <iostream>
#include <string>

int main() {
    auto caster = atom::meta::TypeCaster::createShared();

    // 注册从 double 到 string 的多阶段转换，通过 int
    caster->registerMultiStageConversion<int, double, std::string>(
        [](const std::any& input) {
            return std::any(static_cast<int>(std::any_cast<double>(input)));
        },
        [](const std::any& input) {
            return std::any(std::to_string(std::any_cast<int>(input)));
        }
    );

    // 使用多阶段转换
    double doubleValue = 3.14159;
    std::any result = caster->convert<std::string>(std::any(doubleValue));
    std::cout << std::any_cast<std::string>(result) << std::endl;  // 输出: "3"

    return 0;
}
```

### 处理枚举

```cpp
#include "type_caster.hpp"
#include <iostream>

enum class Color { Red, Green, Blue };

int main() {
    auto caster = atom::meta::TypeCaster::createShared();

    // 注册枚举值
    caster->registerEnumValue<Color>("Color", "Red", Color::Red);
    caster->registerEnumValue<Color>("Color", "Green", Color::Green);
    caster->registerEnumValue<Color>("Color", "Blue", Color::Blue);

    // 将枚举转换为字符串
    Color color = Color::Green;
    std::string colorStr = caster->enumToString(color, "Color");
    std::cout << "Color 枚举转字符串: " << colorStr << std::endl;  // 输出: "Green"

    // 将字符串转换为枚举
    Color convertedColor = caster->stringToEnum<Color>("Blue", "Color");
    std::cout << "字符串转 Color 枚举: " << static_cast<int>(convertedColor) << std::endl;  // 输出: 2

    return 0;
}
```

### 类型组

```cpp
#include "type_caster.hpp"
#include <iostream>
#include <vector>

int main() {
    auto caster = atom::meta::TypeCaster::createShared();

    // 注册一个数字类型的类型组
    caster->registerTypeGroup("Numeric", {"int", "float", "double"});

    // 检查注册的类型
    std::vector<std::string> registeredTypes = caster->getRegisteredTypes();
    std::cout << "注册的类型:" << std::endl;
    for (const auto& type : registeredTypes) {
        std::cout << "- " << type << std::endl;
    }

    return 0;
}
```

## 最佳实践

1. **线程安全**：`TypeCaster` 类使用互斥锁确保线程安全。然而，在多线程环境中使用该类时要谨慎，尤其是在注册新转换或别名时。

2. **错误处理**：始终处理潜在的异常，特别是在使用 `convert`、`enumToString` 和 `stringToEnum` 方法时，因为它们可能会因无效输入而抛出异常。

3. **性能考虑**：`TypeCaster` 类缓存转换路径以提高性能。然而，频繁注册新转换会清除此缓存，可能会影响性能。

4. **类型安全**：虽然 `TypeCaster` 提供了灵活的类型转换，但应谨慎使用。过度使用动态类型转换可能导致类型安全性降低和潜在的运行时错误。

5. **自定义类型**：在使用 `TypeCaster` 时，与自定义类型一起使用时，始终在使用之前注册它们及其转换。

6. **枚举处理**：在处理枚举时，为了更好的类型安全，考虑使用强类型枚举（`enum class`）并将其注册到 `TypeCaster`。
