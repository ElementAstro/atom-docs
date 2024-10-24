---
title: 函数序列
description: 详细文档，介绍 atom::meta 命名空间中的 FunctionSequence 类，包括类概述、成员函数、使用示例、错误处理和创建及执行函数管道的最佳实践。  
---

## 目录

1. [介绍](#介绍)
2. [类概述](#类概述)
3. [成员函数](#成员函数)
4. [使用示例](#使用示例)
5. [错误处理](#错误处理)
6. [最佳实践](#最佳实践)

## 介绍

`FunctionSequence` 类定义在 `atom::meta` 命名空间中，提供了一种机制来注册和执行函数序列。该类特别适用于创建操作管道，其中每个函数可以独立执行或作为序列的一部分执行。

## 类概述

```cpp
namespace atom::meta {
class FunctionSequence {
public:
    using FunctionType = std::function<std::any(const std::vector<std::any>&)>;

    void registerFunction(FunctionType func);
    auto run(const std::vector<std::vector<std::any>>& argsBatch) -> std::vector<std::any>;
    auto runAll(const std::vector<std::vector<std::any>>& argsBatch) -> std::vector<std::vector<std::any>>;

private:
    std::vector<FunctionType> functions_;
};
}
```

## 成员函数

### `registerFunction`

```cpp
void registerFunction(FunctionType func)
```

注册一个函数，使其成为序列的一部分。

- **参数:**
  - `func`：一个函数对象，接受 `const std::vector<std::any>&` 并返回 `std::any`。

### `run`

```cpp
auto run(const std::vector<std::vector<std::any>>& argsBatch) -> std::vector<std::any>
```

使用提供的每组参数运行最后注册的函数。

- **参数:**
  - `argsBatch`：一个参数向量的向量，每个内部向量表示一组单独函数调用的参数。
- **返回值:**
  - 一个 `std::any` 向量，包含将最后一个函数应用于每组参数的结果。

### `runAll`

```cpp
auto runAll(const std::vector<std::vector<std::any>>& argsBatch) -> std::vector<std::vector<std::any>>
```

使用提供的每组参数运行所有注册的函数。

- **参数:**
  - `argsBatch`：一个参数向量的向量，每个内部向量表示一组单独函数调用的参数。
- **返回值:**
  - 一个 `std::vector<std::vector<std::any>>`，其中每个内部向量包含将所有函数应用于单组参数的结果。

## 使用示例

### 示例 1：基本用法

```cpp
#include "stepper.hpp"
#include <iostream>

int main() {
    atom::meta::FunctionSequence sequence;

    // 注册函数
    sequence.registerFunction([](const std::vector<std::any>& args) {
        int x = std::any_cast<int>(args[0]);
        return std::any(x * 2);
    });

    sequence.registerFunction([](const std::vector<std::any>& args) {
        int x = std::any_cast<int>(args[0]);
        return std::any(x + 10);
    });

    // 准备参数
    std::vector<std::vector<std::any>> argsBatch = {{5}, {10}};

    // 运行最后一个函数
    auto results = sequence.run(argsBatch);

    for (const auto& result : results) {
        std::cout << std::any_cast<int>(result) << std::endl;
    }

    return 0;
}
```

输出：

```
15
20
```

### 示例 2：运行所有函数

```cpp
#include "stepper.hpp"
#include <iostream>

int main() {
    atom::meta::FunctionSequence sequence;

    // 注册函数
    sequence.registerFunction([](const std::vector<std::any>& args) {
        int x = std::any_cast<int>(args[0]);
        return std::any(x * 2);
    });

    sequence.registerFunction([](const std::vector<std::any>& args) {
        int x = std::any_cast<int>(args[0]);
        return std::any(x + 10);
    });

    // 准备参数
    std::vector<std::vector<std::any>> argsBatch = {{5}, {10}};

    // 运行所有函数
    auto resultsBatch = sequence.runAll(argsBatch);

    for (const auto& results : resultsBatch) {
        for (const auto& result : results) {
            std::cout << std::any_cast<int>(result) << " ";
        }
        std::cout << std::endl;
    }

    return 0;
}
```

输出：

```
10 15
20 20
```

## 错误处理

`FunctionSequence` 类使用异常处理来管理错误。如果在执行函数时抛出异常，将捕获并重新抛出，附加上下文信息。

```cpp
try {
    auto results = sequence.run(argsBatch);
} catch (const std::exception& e) {
    std::cerr << "错误: " << e.what() << std::endl;
}
```

## 最佳实践

1. **类型安全**：由于使用了 `std::any`，在类型转换时要小心。确保在从 `std::any` 转换时类型匹配。

2. **错误处理**：将对 `run` 和 `runAll` 的调用包装在 try-catch 块中，以处理潜在的异常。

3. **函数设计**：设计函数时要适当地处理 `std::any` 输入和输出。考虑使用辅助函数进行类型检查和转换。

4. **性能**：注意使用 `std::any` 和函数对象可能会有一定的性能开销。对于性能关键的应用，考虑替代设计。

5. **灵活性**：`FunctionSequence` 类允许在创建函数管道时具有很大的灵活性。利用这一点来创建模块化和可重用的代码。
