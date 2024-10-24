---
title: C++名称ABI解码
description: atom::meta 命名空间中 DemangleHelper 类的详细文档，包括用于去除 C++ 类型名称的修饰、可视化复杂类型的方法和使用示例。 
---

## 类声明

```cpp
namespace atom::meta {
class DemangleHelper {
public:
    // 公有成员函数
    // ...（详细信息见下文）

private:
    // 私有成员函数
    // ...（详细信息见下文）
};
}
```

## 公有成员函数

### demangleType

```cpp
template <typename T>
static auto demangleType() -> std::string;

template <typename T>
static auto demangleType(const T& instance) -> std::string;
```

去除给定类型 `T` 或类型 `T` 的实例的名称修饰。

- **返回值:** 包含去除修饰的类型名称的字符串。

### demangle

```cpp
static auto demangle(std::string_view mangled_name,
                     const std::optional<std::source_location>& location = std::nullopt) -> std::string;
```

去除给定的修饰名称，并可选择性地包含源位置信息。

- **参数:**
  - `mangled_name`: 要去除修饰的名称。
  - `location`: 可选的源位置信息。
- **返回值:** 包含去除修饰的名称和可选位置信息的字符串。

### demangleMany

```cpp
static auto demangleMany(const std::vector<std::string_view>& mangled_names,
                         const std::optional<std::source_location>& location = std::nullopt) -> std::vector<std::string>;
```

去除多个修饰名称，并可选择性地为每个名称包含源位置信息。

- **参数:**
  - `mangled_names`: 要去除修饰的名称的向量。
  - `location`: 可选的源位置信息。
- **返回值:** 包含去除修饰的名称和可选位置信息的字符串向量。

### visualize（仅在调试模式下）

```cpp
static auto visualize(const std::string& demangled_name) -> std::string;
```

可视化去除修饰的类型名称的结构。此功能仅在调试模式下可用。

- **参数:**
  - `demangled_name`: 要可视化的去除修饰的类型名称。
- **返回值:** 类型结构的字符串表示。

## 私有成员函数

### demangleInternal

```cpp
static auto demangleInternal(std::string_view mangled_name) -> std::string;
```

用于去除名称修饰的内部函数。它使用平台特定的去除修饰函数。

### visualizeType、visualizeTemplateParams、visualizeFunctionParams（仅在调试模式下）

这些是 `visualize` 函数使用的辅助函数，用于创建复杂类型的结构化表示。

## 使用示例

### 基本去除修饰

```cpp
#include "abi.hpp"
#include <iostream>
#include <vector>

int main() {
    // 去除类型修饰
    std::cout << atom::meta::DemangleHelper::demangleType<std::vector<int>>() << std::endl;

    // 去除实例的修饰
    std::vector<double> vec;
    std::cout << atom::meta::DemangleHelper::demangleType(vec) << std::endl;

    // 去除修饰名称
    std::cout << atom::meta::DemangleHelper::demangle("_ZNSt6vectorIiSaIiEE") << std::endl;

    return 0;
}
```

### 去除多个名称的修饰

```cpp
#include "abi.hpp"
#include <iostream>
#include <vector>

int main() {
    std::vector<std::string_view> mangled_names = {
        "_ZNSt6vectorIiSaIiEE",
        "_ZNSt6vectorIdSaIdEE",
        "_ZNSt3mapIiNSt6vectorIiSaIiEESt4lessIiESaISt4pairIKiS1_EEE"
    };

    auto demangled = atom::meta::DemangleHelper::demangleMany(mangled_names);
    for (const auto& name : demangled) {
        std::cout << name << std::endl;
    }

    return 0;
}
```

### 可视化类型（仅在调试模式下）

```cpp
#include "abi.hpp"
#include <iostream>
#include <vector>
#include <map>

int main() {
    using ComplexType = std::map<int, std::vector<double>>;
    std::string demangled = atom::meta::DemangleHelper::demangleType<ComplexType>();
    std::cout << atom::meta::DemangleHelper::visualize(demangled) << std::endl;

    return 0;
}
```

## 注意事项

- `DemangleHelper` 类使用平台特定的去除修饰函数（在 MSVC 上使用 `UnDecorateSymbolName`，在其他平台上使用 `__cxa_demangle`）。
- 可视化功能仅在定义了 `ENABLE_DEBUG` 时可用。
- 该类使用 C++17 特性，如 `std::optional` 和 `std::string_view`。
- `visualize` 函数提供了复杂类型的树状结构表示，这对理解模板实例化和嵌套类型非常有帮助。
- 使用 `demangle` 或 `demangleMany` 时，如果包含源位置信息，请确保使用 C++20 支持编译，以使用 `std::source_location`。
