---
title: 自定义万能类型
description: atom::meta 命名空间中 BoxedValue 类的详细文档，包括构造函数、成员函数、属性处理、实用函数和使用示例。  
---

## 类声明

```cpp
namespace atom::meta {
class BoxedValue {
    // ...（成员函数和私有成员）
};
}
```

## 主要特性

- 使用 `std::any` 的类型擦除值存储
- 使用共享互斥量进行线程安全操作
- 支持属性
- 存储类型信息
- 支持引用和常量正确性
- 表示 void 类型

## 公有成员函数

### 构造函数

```cpp
template <typename T>
    requires(!std::same_as<BoxedValue, std::decay_t<T>>)
explicit BoxedValue(T&& value, bool return_value = false, bool readonly = false);

BoxedValue();  // void 类型的默认构造函数

explicit BoxedValue(std::shared_ptr<Data> data);

BoxedValue(const BoxedValue& other);  // 复制构造函数

BoxedValue(BoxedValue&& other) noexcept;  // 移动构造函数

template <typename T>
explicit BoxedValue(const T& value);  // 常量值构造函数
```

### 赋值运算符

```cpp
auto operator=(const BoxedValue& other) -> BoxedValue&;  // 复制赋值

auto operator=(BoxedValue&& other) noexcept -> BoxedValue&;  // 移动赋值

template <typename T>
    requires(!std::same_as<BoxedValue, std::decay_t<T>>)
auto operator=(T&& value) -> BoxedValue&;  // 值赋值
```

### 实用函数

```cpp
void swap(BoxedValue& rhs) noexcept;

[[nodiscard]] auto isUndef() const noexcept -> bool;
[[nodiscard]] auto isConst() const noexcept -> bool;
[[nodiscard]] auto isType(const TypeInfo& type_info) const noexcept -> bool;
[[nodiscard]] auto isRef() const noexcept -> bool;
[[nodiscard]] auto isReturnValue() const noexcept -> bool;
[[nodiscard]] auto isReadonly() const noexcept -> bool;
[[nodiscard]] auto isConstDataPtr() const noexcept -> bool;
[[nodiscard]] auto isNull() const noexcept -> bool;

void resetReturnValue() noexcept;

[[nodiscard]] auto get() const noexcept -> const std::any&;
[[nodiscard]] auto getTypeInfo() const noexcept -> const TypeInfo&;
[[nodiscard]] auto getPtr() const noexcept -> void*;

template <typename T>
[[nodiscard]] auto tryCast() const noexcept -> std::optional<T>;

template <typename T>
[[nodiscard]] auto canCast() const noexcept -> bool;

[[nodiscard]] auto debugString() const -> std::string;
```

### 属性处理

```cpp
auto setAttr(const std::string& name, const BoxedValue& value) -> BoxedValue&;
[[nodiscard]] auto getAttr(const std::string& name) const -> BoxedValue;
[[nodiscard]] auto hasAttr(const std::string& name) const -> bool;
void removeAttr(const std::string& name);
[[nodiscard]] auto listAttrs() const -> std::vector<std::string>;
```

## 辅助函数

```cpp
template <typename T>
auto var(T&& value) -> BoxedValue;

template <typename T>
auto constVar(const T& value) -> BoxedValue;

inline auto voidVar() -> BoxedValue;

template <typename T>
auto makeBoxedValue(T&& value, bool is_return_value = false, bool readonly = false) -> BoxedValue;
```

## 使用示例

### 基本用法

```cpp
#include "any.hpp"
#include <iostream>

int main() {
    atom::meta::BoxedValue intValue(42);
    atom::meta::BoxedValue stringValue("Hello, BoxedValue!");

    std::cout << intValue.debugString() << std::endl;
    std::cout << stringValue.debugString() << std::endl;

    if (auto intPtr = intValue.tryCast<int>()) {
        std::cout << "Int value: " << *intPtr << std::endl;
    }

    if (auto stringPtr = stringValue.tryCast<std::string>()) {
        std::cout << "String value: " << *stringPtr << std::endl;
    }

    return 0;
}
```

### 使用属性

```cpp
atom::meta::BoxedValue person("John Doe");
person.setAttr("age", atom::meta::BoxedValue(30));
person.setAttr("city", atom::meta::BoxedValue("New York"));

if (auto age = person.getAttr("age").tryCast<int>()) {
    std::cout << "Age: " << *age << std::endl;
}

auto attrs = person.listAttrs();
for (const auto& attr : attrs) {
    std::cout << "Attribute: " << attr << std::endl;
}
```

### 使用辅助函数

```cpp
auto intValue = atom::meta::var(42);
auto constIntValue = atom::meta::constVar(42);
auto emptyValue = atom::meta::voidVar();

auto boxedInt = atom::meta::makeBoxedValue(42, true, false);
```

## 注意事项

- `BoxedValue` 类使用共享互斥量进行线程安全操作。
- 它支持值语义和引用语义。
- 该类通过 `tryCast` 和 `canCast` 方法提供类型安全的转换。
- 属性可以用于将附加数据与 `BoxedValue` 实例关联。
- `debugString` 方法提供调试用途的字符串表示。
- 辅助函数如 `var`、`constVar` 和 `voidVar` 提供了创建 `BoxedValue` 实例的便捷方式。
- `makeBoxedValue` 函数提供了对 `BoxedValue` 实例创建的细粒度控制。
