---
title: FFI
description: atom::meta 命名空间中 FFI（外部函数接口）系统的详细文档，包括关键组件、函数模板、类描述、错误处理、平台兼容性、性能考虑和使用示例。  
---

## 关键组件

### getFFIType

```cpp
template <typename T>
constexpr auto getFFIType() -> ffi_type*;
```

该函数模板将 C++ 类型映射到相应的 `ffi_type*`。它支持各种整数类型、浮点类型、指针和字符串。

**用法：**

```cpp
ffi_type* intType = getFFIType<int>();
ffi_type* doubleType = getFFIType<double>();
ffi_type* stringType = getFFIType<const char*>();
```

### FFIWrapper

```cpp
template <typename ReturnType, typename... Args>
class FFIWrapper;
```

此类封装特定函数签名的 FFI 调用接口。

#### 关键方法：

- 构造函数：准备 FFI 调用接口。
- `call`：使用给定参数调用函数。

**用法：**

```cpp
FFIWrapper<int, double, const char*> wrapper;
int result = wrapper.call(functionPointer, 3.14, "Hello");
```

### DynamicLibrary

```cpp
class DynamicLibrary;
```

该类管理动态库的加载、卸载和交互。

#### 关键方法：

- 构造函数：加载动态库。
- `getFunction`：从库中检索函数。
- `reload`：重新加载库。
- `addFunction`：将函数添加到内部函数映射中。
- `callFunction`：调用库中的函数。
- `hasFunction`：检查库中是否存在函数。
- `getBoundFunction`：从库中获取绑定函数。
- `bindFunction`：为库函数创建 `std::function` 包装器。

**用法：**

```cpp
DynamicLibrary lib("mylib.so");
auto func = lib.getFunction<int(double)>("my_function");
int result = func(3.14);

lib.addFunction<int(double)>("another_function");
auto result = lib.callFunction<int>("another_function", 2.71);

auto boundFunc = lib.bindFunction<int, double>("bound_function");
int boundResult = boundFunc(1.41);
```

### LibraryObject

```cpp
template <typename T>
class LibraryObject;
```

该类模板管理由动态库中的工厂函数创建的对象。

**用法：**

```cpp
DynamicLibrary lib("mylib.so");
LibraryObject<MyClass> obj(lib, "create_my_class");
obj->someMethod();
```

## 详细描述

### getFFIType

该函数模板使用编译时类型特征确定给定 C++ 类型的适当 `ffi_type*`。它支持：

- 整数类型（有符号和无符号，8 到 64 位）
- 浮点类型（float 和 double）
- 指针和字符串

如果使用不受支持的类型，则会在编译时失败。

### FFIWrapper

`FFIWrapper` 类封装 FFI 调用的设置和调用：

1. 构造函数准备 FFI 调用接口（`ffi_cif`），基于函数签名。
2. `call` 方法使用 `ffi_call` 调用函数，处理 C++ 和 C 类型之间的转换。

此类通常由 `DynamicLibrary` 内部使用。

### DynamicLibrary

`DynamicLibrary` 类提供了与共享库交互的高级接口：

1. **加载和卸载**：

   - 构造函数使用平台特定调用（在 Windows 上使用 `LoadLibraryA`，在 POSIX 上使用 `dlopen`）加载库。
   - 析构函数和 `unloadLibrary` 方法处理适当的清理。

2. **函数管理**：

   - `getFunction`：检索函数指针并将其包装在 `std::function` 中。
   - `addFunction`：将函数添加到内部映射以供后用。
   - `hasFunction`：检查函数是否已添加到内部映射中。

3. **函数调用**：

   - `callFunction`：使用 `FFIWrapper` 按名称调用函数。
   - `getBoundFunction`：以 `std::function` 的形式检索函数指针。
   - `bindFunction`：创建一个 `std::function`，包装库调用，包括错误处理。

4. **线程安全**：

   - 使用互斥量确保对库句柄和函数映射的线程安全操作。

5. **错误处理**：
   - 对于各种错误条件（例如，库加载失败、符号未找到）抛出 `FFIException`。

### LibraryObject

`LibraryObject` 模板提供了一种管理由动态库中的工厂函数创建的 C++ 对象的方法：

1. 构造函数调用库中的工厂函数以创建对象。
2. 使用 `std::unique_ptr` 管理对象的生命周期。
3. 提供类似指针的语法以访问管理的对象。

## 错误处理

该系统使用自定义的 `FFIException` 类进行错误报告。`THROW_FFI_EXCEPTION` 宏用于抛出这些异常，并附带详细的错误消息，包括文件、行和函数信息。

## 平台兼容性

该系统使用条件编译来支持 Windows 和 POSIX 兼容系统：

- 在 Windows 上，使用 `LoadLibraryA`、`GetProcAddress` 和 `FreeLibrary`。
- 在 POSIX 系统上，使用 `dlopen`、`dlsym` 和 `dlclose`。

## 性能考虑

- 该系统使用哈希映射存储函数指针，提供快速查找时间。
- 可通过定义 `ENABLE_FASTHASH` 使用可选的快速哈希实现（`emhash8::HashMap`）。
- `FFIWrapper` 类允许高效地重复调用相同的函数，通过仅准备一次 FFI 调用接口实现。

## 线程安全

`DynamicLibrary` 类使用互斥量确保对库句柄和函数映射的线程安全操作。

## 注意事项

- 此系统需要链接到 `libffi` 库。
- 它严重依赖 C++17 特性，如 `if constexpr` 和 `std::optional`。
- 使用此系统时应谨慎，因为它涉及原始指针操作，如果使用不当，可能导致未定义行为。
- 系统不提供复杂类型的自动类型转换；用户必须确保 C++ 和外部函数之间的类型兼容性。
