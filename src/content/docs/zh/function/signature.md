---
title: 函数签名解析
description: 详细文档，介绍 atom::meta 命名空间中的 FunctionSignature 类和 parseFunctionDefinition 函数，包括类定义、成员函数、解析工具和使用示例。  
---

## 目录

1. [介绍](#介绍)
2. [FunctionSignature 类](#functionsignature-类)
3. [parseFunctionDefinition 函数](#parsefunctiondefinition-函数)
4. [使用示例](#使用示例)
5. [限制和注意事项](#限制和注意事项)

## 介绍

`signature.hpp` 文件提供了用于解析和表示类似 Python 语法的函数签名的工具。它包括 `FunctionSignature` 类来存储解析的签名信息，以及 `parseFunctionDefinition` 函数来解析函数定义字符串。

## FunctionSignature 类

`FunctionSignature` 类表示解析后的函数签名。

### 类定义

```cpp
struct alignas(128) FunctionSignature {
public:
    constexpr FunctionSignature(
        std::string_view name,
        std::array<std::pair<std::string_view, std::string_view>, 2> parameters,
        std::optional<std::string_view> returnType);

    [[nodiscard]] auto getName() const -> std::string_view;
    [[nodiscard]] auto getParameters() const
        -> const std::array<std::pair<std::string_view, std::string_view>, 2>&;
    [[nodiscard]] auto getReturnType() const
        -> std::optional<std::string_view>;

private:
    std::string_view name_;
    std::array<std::pair<std::string_view, std::string_view>, 2> parameters_;
    std::optional<std::string_view> returnType_;
};
```

### 成员函数

- `getName()`：返回函数名称。
- `getParameters()`：返回参数名称-类型对的数组。
- `getReturnType()`：返回可选的返回类型。

## parseFunctionDefinition 函数

`parseFunctionDefinition` 函数解析函数定义字符串并返回一个可选的 `FunctionSignature`。

### 函数签名

```cpp
constexpr auto parseFunctionDefinition(
    const std::string_view DEFINITION) noexcept
    -> std::optional<FunctionSignature>;
```

### 参数

- `DEFINITION`：包含要解析的函数定义的字符串视图。

### 返回值

返回一个 `std::optional<FunctionSignature>`。如果解析成功，则包含解析后的 `FunctionSignature`；如果解析失败，则返回 `std::nullopt`。

## 使用示例

以下是一些演示如何使用 `parseFunctionDefinition` 函数以及如何处理 `FunctionSignature` 的示例：

### 示例 1：基本函数解析

```cpp
#include "signature.hpp"
#include <iostream>

int main() {
    constexpr std::string_view functionDef = "def add(a: int, b: int) -> int";

    if (auto signature = atom::meta::parseFunctionDefinition(functionDef)) {
        std::cout << "函数名称: " << signature->getName() << std::endl;
        std::cout << "参数:" << std::endl;
        for (const auto& [name, type] : signature->getParameters()) {
            if (!name.empty()) {
                std::cout << "  " << name << ": " << type << std::endl;
            }
        }
        if (auto returnType = signature->getReturnType()) {
            std::cout << "返回类型: " << *returnType << std::endl;
        }
    } else {
        std::cout << "解析函数定义失败。" << std::endl;
    }

    return 0;
}
```

预期输出：

```
函数名称: add
参数:
  a: int
  b: int
返回类型: int
```

### 示例 2：具有默认参数类型的函数

```cpp
#include "signature.hpp"
#include <iostream>

int main() {
    constexpr std::string_view functionDef = "def greet(name, greeting='Hello')";

    if (auto signature = atom::meta::parseFunctionDefinition(functionDef)) {
        std::cout << "函数名称: " << signature->getName() << std::endl;
        std::cout << "参数:" << std::endl;
        for (const auto& [name, type] : signature->getParameters()) {
            if (!name.empty()) {
                std::cout << "  " << name << ": " << type << std::endl;
            }
        }
        if (auto returnType = signature->getReturnType()) {
            std::cout << "返回类型: " << *returnType << std::endl;
        }
    } else {
        std::cout << "解析函数定义失败。" << std::endl;
    }

    return 0;
}
```

预期输出：

```
函数名称: greet
参数:
  name: any
  greeting: any
返回类型: none
```

### 示例 3：具有复杂参数类型的函数

```cpp
#include "signature.hpp"
#include <iostream>

int main() {
    constexpr std::string_view functionDef = "def process(data: List[int], options: Dict[str, Any]) -> bool";

    if (auto signature = atom::meta::parseFunctionDefinition(functionDef)) {
        std::cout << "函数名称: " << signature->getName() << std::endl;
        std::cout << "参数:" << std::endl;
        for (const auto& [name, type] : signature->getParameters()) {
            if (!name.empty()) {
                std::cout << "  " << name << ": " << type << std::endl;
            }
        }
        if (auto returnType = signature->getReturnType()) {
            std::cout << "返回类型: " << *returnType << std::endl;
        }
    } else {
        std::cout << "解析函数定义失败。" << std::endl;
    }

    return 0;
}
```

预期输出：

```
函数名称: process
参数:
  data: List[int]
  options: Dict[str, Any]
返回类型: bool
```

## 限制和注意事项

1. `FunctionSignature` 类限制为存储最多两个参数。对于具有更多参数的函数，仅存储前两个参数。

2. 解析设计用于类似 Python 的函数定义。它可能无法正确处理其他语法。

3. 解析器假设函数定义以 "def " 开头，并遵循特定格式。如果输入不匹配此预期格式，解析可能会失败。

4. 解析是在编译时使用 `constexpr` 完成的，这允许高效的运行时性能，但可能会增加复杂函数定义的编译时间。

5. 错误处理通过使用 `std::optional` 来完成。如果解析失败，则返回 `std::nullopt`，而不是抛出异常。

6. 解析器使用简单的方法处理参数类型中的嵌套括号，但可能无法正确处理所有复杂情况。

7. 解析器中使用的 `trim` 函数假定在 `atom::utils` 命名空间中定义。确保该实用函数在您的项目中可用。
