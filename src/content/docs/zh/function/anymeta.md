---
title: 动态反射
description: atom::meta 命名空间中 TypeMetadata 和 TypeRegistry 类的全面文档，包括动态反射、方法重载和事件处理的方法。  
---

## TypeMetadata 类

`TypeMetadata` 类存储关于类型的元数据，包括其方法、属性、构造函数和事件。

### 关键组件

- `MethodFunction`: 用于方法的函数类型，接受一个 `BoxedValue` 参数向量并返回一个 `BoxedValue`。
- `GetterFunction`: 属性获取器的函数类型。
- `SetterFunction`: 属性设置器的函数类型。
- `ConstructorFunction`: 构造函数的函数类型。
- `EventCallback`: 事件监听器的函数类型。

### 公有方法

```cpp
void addMethod(const std::string& name, MethodFunction method);
void removeMethod(const std::string& name);
void addProperty(const std::string& name, GetterFunction getter, SetterFunction setter);
void removeProperty(const std::string& name);
void addConstructor(const std::string& type_name, ConstructorFunction constructor);
void addEvent(const std::string& event_name);
void removeEvent(const std::string& event_name);
void addEventListener(const std::string& event_name, EventCallback callback);
void fireEvent(BoxedValue& obj, const std::string& event_name, const std::vector<BoxedValue>& args) const;
auto getMethods(const std::string& name) const -> std::optional<const std::vector<MethodFunction>*>;
auto getProperty(const std::string& name) const -> std::optional<Property>;
auto getConstructor(const std::string& type_name, size_t index = 0) const -> std::optional<ConstructorFunction>;
auto getEvent(const std::string& name) const -> std::optional<const Event*>;
```

## TypeRegistry 类

`TypeRegistry` 类是一个单例，管理全局的类型元数据注册。

### 公有方法

```cpp
static auto instance() -> TypeRegistry&;
void registerType(const std::string& name, TypeMetadata metadata);
auto getMetadata(const std::string& name) const -> std::optional<TypeMetadata>;
```

## 辅助函数

### callMethod

```cpp
auto callMethod(BoxedValue& obj, const std::string& method_name, std::vector<BoxedValue> args) -> BoxedValue;
```

动态调用 `BoxedValue` 对象上的重载方法。

### getProperty

```cpp
auto getProperty(const BoxedValue& obj, const std::string& property_name) -> BoxedValue;
```

动态检索 `BoxedValue` 对象的属性值。

### setProperty

```cpp
void setProperty(BoxedValue& obj, const std::string& property_name, const BoxedValue& value);
```

动态设置 `BoxedValue` 对象的属性值。

### fireEvent

```cpp
void fireEvent(BoxedValue& obj, const std::string& event_name, const std::vector<BoxedValue>& args);
```

在 `BoxedValue` 对象上触发事件。

### createInstance

```cpp
auto createInstance(const std::string& type_name, std::vector<BoxedValue> args) -> BoxedValue;
```

通过类型名称动态构造对象。

## TypeRegistrar 模板类

`TypeRegistrar` 类提供了一种将类型注册到 `TypeRegistry` 的方式。

### 公有方法

```cpp
static void registerType(const std::string& type_name);
```

注册一个类型及其元数据，包括默认构造函数、事件和方法。

## 使用示例

### 注册类型

```cpp
class MyClass {};

atom::meta::TypeRegistrar<MyClass>::registerType("MyClass");
```

### 调用方法

```cpp
atom::meta::BoxedValue obj = atom::meta::createInstance("MyClass", {});
atom::meta::callMethod(obj, "print", {atom::meta::BoxedValue("Hello, World!")});
```

### 获取和设置属性

```cpp
auto value = atom::meta::getProperty(obj, "someProperty");
atom::meta::setProperty(obj, "someProperty", atom::meta::BoxedValue(42));
```

### 触发事件

```cpp
atom::meta::fireEvent(obj, "onCreate", {});
```

## 注意事项

- 系统支持方法重载，但当前实现不检查参数类型以匹配重载。
- `TypeRegistry` 是线程安全的，使用共享互斥量以支持并发访问。
- 错误处理使用自定义异常实现（例如，`THROW_NOT_FOUND`）。
- `TypeRegistrar` 提供了注册类型的基本实现。对于更复杂的类型注册，可能需要扩展它。
- 系统依赖于 `BoxedValue` 类（在本文件中未显示）进行类型擦除值存储。
