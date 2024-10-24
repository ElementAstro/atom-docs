---
title: 类型信息记录
description: 全面文档，介绍 atom::meta 命名空间中的 TypeInfo 类，包括类型自省、类型注册的方法，以及 C++ 中运行时类型信息的使用示例。  
---

## 目录

1. [介绍](#介绍)
2. [TypeInfo 类](#typeinfo-类)
3. [GetTypeInfo 结构体](#gettypeinfo-结构体)
4. [用户类型函数](#用户类型函数)
5. [类型注册和检索](#类型注册和检索)
6. [使用示例](#使用示例)
7. [最佳实践](#最佳实践)

## 介绍

`TypeInfo` 类及其相关工具提供了一个强大的系统，用于在运行时处理和查询类型信息。这在反射类功能、序列化以及其他需要详细类型信息的场景中尤其有用。

## TypeInfo 类

`TypeInfo` 类封装了有关类型的详细信息，包括其限定符、类别和其他属性。

### 关键方法和属性

- `fromType<T>()`：静态方法，从类型创建 `TypeInfo` 实例。
- `fromInstance(const T& instance)`：静态方法，从对象创建 `TypeInfo` 实例。
- `name()`：返回类型的去修饰名称。
- `bareName()`：返回裸类型的去修饰名称（不带限定符）。
- `isConst()`、`isReference()`、`isVoid()`、`isArithmetic()`、`isArray()`、`isEnum()`、`isClass()`、`isFunction()`、`isTrivial()`、`isStandardLayout()`、`isPod()`、`isPointer()`：查询类型属性的方法。
- `bareEqual(const TypeInfo&)`：检查两个 `TypeInfo` 实例是否表示相同的裸类型。
- `bareEqualTypeInfo(const std::type_info&)`：将裸类型与 `std::type_info` 实例进行比较。

### 用法

```cpp
#include "type_info.hpp"

// 为 int 创建 TypeInfo
auto intInfo = atom::meta::TypeInfo::fromType<int>();

// 检查属性
bool isArithmetic = intInfo.isArithmetic();  // true
bool isClass = intInfo.isClass();  // false

// 获取类型名称
std::string name = intInfo.name();  // "int"
```

## GetTypeInfo 结构体

`GetTypeInfo` 结构体是一个模板工具，用于获取不同类型的 `TypeInfo`，包括对智能指针和引用包装器的特化。

### 用法

```cpp
#include "type_info.hpp"
#include <memory>

// 获取 int 的 TypeInfo
auto intInfo = atom::meta::GetTypeInfo<int>::get();

// 获取 std::shared_ptr<double> 的 TypeInfo
auto doubleSharedPtrInfo = atom::meta::GetTypeInfo<std::shared_ptr<double>>::get();
```

## 用户类型函数

`userType` 函数提供了一种方便的方法来获取类型和实例的 `TypeInfo`。

### 用法

```cpp
#include "type_info.hpp"

class MyClass {};

// 获取类型的 TypeInfo
auto myClassInfo = atom::meta::userType<MyClass>();

// 从实例获取 TypeInfo
MyClass instance;
auto instanceInfo = atom::meta::userType(instance);
```

## 类型注册和检索

该库提供了注册自定义类型和检索其 `TypeInfo` 的函数。

### 关键函数

- `registerType(const std::string&, TypeInfo)`：使用自定义名称注册类型。
- `registerType<T>(const std::string&)`：使用自定义名称注册类型 `T`。
- `getTypeInfo(const std::string&)`：检索注册类型的 `TypeInfo`。

### 用法

```cpp
#include "type_info.hpp"

// 注册自定义类型
class CustomType {};
atom::meta::registerType<CustomType>("MyCustomType");

// 检索注册类型的 TypeInfo
auto customTypeInfo = atom::meta::getTypeInfo("MyCustomType");
if (customTypeInfo) {
    std::cout << "自定义类型名称: " << customTypeInfo->name() << std::endl;
}
```

## 使用示例

以下是一些更全面的示例，演示如何使用 `TypeInfo` 和相关工具：

### 示例 1：类型属性检查

```cpp
#include "type_info.hpp"
#include <iostream>
#include <vector>

void printTypeProperties(const atom::meta::TypeInfo& info) {
    std::cout << "类型: " << info.name() << std::endl;
    std::cout << "是否为 const: " << std::boolalpha << info.isConst() << std::endl;
    std::cout << "是否为引用: " << info.isReference() << std::endl;
    std::cout << "是否为指针: " << info.isPointer() << std::endl;
    std::cout << "是否为算术类型: " << info.isArithmetic() << std::endl;
    std::cout << "是否为类: " << info.isClass() << std::endl;
    std::cout << "是否为 POD: " << info.isPod() << std::endl;
    std::cout << std::endl;
}

int main() {
    printTypeProperties(atom::meta::TypeInfo::fromType<int>());
    printTypeProperties(atom::meta::TypeInfo::fromType<const double&>());
    printTypeProperties(atom::meta::TypeInfo::fromType<std::vector<int>>());

    return 0;
}
```

### 示例 2：与自定义类型一起使用

```cpp
#include "type_info.hpp"
#include <iostream>

class MyCustomClass {
public:
    int value;
    explicit MyCustomClass(int v) : value(v) {}
};

int main() {
    // 注册自定义类型
    atom::meta::registerType<MyCustomClass>("MyCustomClass");

    // 创建实例
    MyCustomClass obj(42);

    // 从实例获取 TypeInfo
    auto instanceInfo = atom::meta::userType(obj);

    // 从注册名称获取 TypeInfo
    auto registeredInfo = atom::meta::getTypeInfo("MyCustomClass");

    if (registeredInfo) {
        std::cout << "注册类型名称: " << registeredInfo->name() << std::endl;
        std::cout << "与实例类型相同: " << std::boolalpha
                  << instanceInfo.bareEqual(*registeredInfo) << std::endl;
    }

    return 0;
}
```

### 示例 3：类型比较和哈希

```cpp
#include "type_info.hpp"
#include <iostream>
#include <unordered_set>

int main() {
    auto intInfo = atom::meta::TypeInfo::fromType<int>();
    auto doubleInfo = atom::meta::TypeInfo::fromType<double>();
    auto constIntInfo = atom::meta::TypeInfo::fromType<const int>();

    // 比较类型
    std::cout << "int == double: " << std::boolalpha << (intInfo == doubleInfo) << std::endl;
    std::cout << "int 裸类型 == const int: " << intInfo.bareEqual(constIntInfo) << std::endl;

    // 在标准容器中使用 TypeInfo
    std::unordered_set<atom::meta::TypeInfo> typeSet;
    typeSet.insert(intInfo);
    typeSet.insert(doubleInfo);
    typeSet.insert(constIntInfo);

    std::cout << "唯一类型的数量: " << typeSet.size() << std::endl;

    return 0;
}
```

## 最佳实践

1. **类型安全**：在使用 `TypeInfo` 时，确保对类型的理解清晰，避免不必要的类型转换。

2. **注册类型**：在使用自定义类型之前，务必先注册它们。确保注册名称唯一，以避免冲突。

3. **异常处理**：使用 `getTypeInfo` 和其他可能抛出异常的方法时，请务必进行异常处理。

4. **性能考虑**：虽然 `TypeInfo` 提供了强大的功能，但在性能敏感的场景中，请考虑其开销。

5. **使用标准库容器**：在使用 `TypeInfo` 时，考虑使用标准库容器（如 `std::unordered_set`）来存储和管理类型信息。

6. **文档和注释**：确保为自定义类型和注册的类型提供清晰的文档和注释，以便其他开发人员理解其用途和特性。
