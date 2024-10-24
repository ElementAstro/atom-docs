---
title: 类型转化
description: atom::meta 命名空间中类型转换系统的全面文档，包括静态和动态转换、容器转换、关键组件、使用示例、错误处理、性能考虑和可扩展性。  
---

## 关键组件

### TypeConversionBase

所有类型转换的抽象基类。

```cpp
class TypeConversionBase {
public:
    virtual auto convert(const std::any& from) const -> std::any = 0;
    virtual auto convertDown(const std::any& toAny) const -> std::any = 0;
    virtual auto to() const ATOM_NOEXCEPT -> const TypeInfo&;
    virtual auto from() const ATOM_NOEXCEPT -> const TypeInfo&;
    virtual auto bidir() const ATOM_NOEXCEPT -> bool;
    // ... 其他方法 ...
};
```

### StaticConversion

处理类型之间的静态（编译时）转换。

```cpp
template <typename From, typename To>
class StaticConversion : public TypeConversionBase {
    // ... 实现 ...
};
```

### DynamicConversion

处理多态类型之间的动态（运行时）转换。

```cpp
template <typename From, typename To>
class DynamicConversion : public TypeConversionBase {
    // ... 实现 ...
};
```

### 容器转换

专门的转换类，用于各种容器类型：

- `VectorConversion`: 在不同类型的 `std::vector` 之间转换。
- `MapConversion`: 在不同类型的映射容器之间转换。
- `SequenceConversion`: 在不同类型的序列容器之间转换。
- `SetConversion`: 在不同类型的集合容器之间转换。

### TypeConversions

一个管理和执行类型转换的类。

```cpp
class TypeConversions {
public:
    static auto createShared() -> std::shared_ptr<TypeConversions>;
    void addConversion(const std::shared_ptr<TypeConversionBase>& conversion);
    template <typename To, typename From>
    auto convert(const std::any& from) const -> std::any;
    auto canConvert(const TypeInfo& fromTypeInfo, const TypeInfo& toTypeInfo) const -> bool;
    // ... 其他方法 ...
};
```

## 使用示例

### 添加基类转换

```cpp
TypeConversions conversions;
conversions.addBaseClass<Base, Derived>();
```

这将添加 `Base` 和 `Derived` 之间的静态和动态转换。

### 添加向量转换

```cpp
conversions.addVectorConversion<From, To>();
```

这将添加 `std::vector<std::shared_ptr<From>>` 和 `std::vector<std::shared_ptr<To>>` 之间的转换。

### 执行转换

```cpp
std::any fromValue = /* ... */;
auto toValue = conversions.convert<To, From>(fromValue);
```

这将把类型为 `From` 的值转换为类型 `To`。

### 检查是否可以转换

```cpp
bool canConvert = conversions.canConvert(userType<From>(), userType<To>());
```

这将检查从 `From` 到 `To` 的转换是否可能。

## 详细描述

### StaticConversion

处理指针和引用类型的向上转换。它使用 `static_cast` 进行转换。

### DynamicConversion

处理多态类型的动态转换。它使用 `dynamic_cast` 进行转换，并在转换失败时检查空指针。

### VectorConversion

在不同类型的向量之间转换。它执行逐元素转换，使用 `dynamic_pointer_cast`。

### MapConversion

在不同键或值类型的映射容器之间转换。它使用 `static_cast` 执行键转换，并使用 `dynamic_pointer_cast` 执行值转换。

### SequenceConversion

在不同类型的序列容器（如 `std::list` 或 `std::deque`）之间转换。它执行逐元素转换，使用 `dynamic_pointer_cast`。

### SetConversion

在不同类型的集合容器之间转换。它执行逐元素转换，使用 `dynamic_pointer_cast`。

## 错误处理

该系统使用自定义 `BadConversionException` 报告转换错误。`THROW_CONVERSION_ERROR` 宏用于抛出这些异常，并附带详细的错误消息。

## 性能考虑

- 该系统使用 `std::any` 进行类型擦除，这可能会带来一些性能开销。
- 动态转换使用 `dynamic_cast`，这具有运行时成本。
- `TypeConversions` 类使用哈希图存储转换，提供快速查找时间。
- 可通过定义 `ENABLE_FASTHASH` 使用可选的快速哈希实现（`emhash8::HashMap`）。

## 线程安全

`TypeConversions` 类不提供内置线程安全性。如果在多线程环境中使用，则应应用外部同步。

## 可扩展性

该系统设计为可扩展。可以通过从 `TypeConversionBase` 派生并实现所需的虚拟函数来添加新的转换类型。

## 注意事项

- 该系统严重依赖 C++17 特性，如 `std::any` 和 `if constexpr`。
- 它支持转换的值语义和引用语义。
- 转换系统在涉及多态类型和容器转换的场景中特别有用。
- 使用动态转换时要小心，因为如果转换失败，可能会抛出异常。
