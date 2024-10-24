---
title: 构造函数和函数绑定
description: atom::meta 命名空间中构造函数和函数绑定工具的详细文档，包括绑定成员函数、静态函数、成员变量和创建各种类型构造函数的方法。
---

## 函数绑定工具

### bindMemberFunction

```cpp
template <typename MemberFunc, typename ClassType>
auto bindMemberFunction(MemberFunc ClassType::*member_func);
```

将成员函数绑定到对象。

- **参数:**
  - `member_func`: 指向成员函数的指针。
- **返回值:** 返回一个将成员函数绑定到对象的 lambda。
- **用法:**

  ```cpp
  auto bound = bindMemberFunction(&MyClass::myMethod);
  MyClass obj;
  bound(obj, arg1, arg2);
  ```

### bindStaticFunction

```cpp
template <typename Func>
auto bindStaticFunction(Func func);
```

绑定静态函数。

- **参数:**
  - `func`: 静态函数。
- **返回值:** 静态函数本身。
- **用法:**

  ```cpp
  auto bound = bindStaticFunction(myStaticFunction);
  bound(arg1, arg2);
  ```

### bindMemberVariable

```cpp
template <typename MemberType, typename ClassType>
auto bindMemberVariable(MemberType ClassType::*member_var);
```

将成员变量绑定到对象。

- **参数:**
  - `member_var`: 指向成员变量的指针。
- **返回值:** 返回一个将成员变量绑定到对象的 lambda。
- **用法:**

  ```cpp
  auto bound = bindMemberVariable(&MyClass::myVariable);
  MyClass obj;
  auto& var = bound(obj);
  ```

## 构造函数工具

### buildSharedConstructor

```cpp
template <typename Class, typename... Params>
auto buildSharedConstructor(Class (* /*unused*/)(Params...));
```

为类构建共享构造函数。

- **返回值:** 返回一个构造共享指针到类的 lambda。
- **用法:**

  ```cpp
  auto ctor = buildSharedConstructor(static_cast<MyClass*(*)(int, string)>(nullptr));
  auto instance = ctor(42, "Hello");
  ```

### buildCopyConstructor

```cpp
template <typename Class, typename... Params>
auto buildCopyConstructor(Class (* /*unused*/)(Params...));
```

为类构建复制构造函数。

- **返回值:** 返回一个构造类实例的 lambda。
- **用法:**

  ```cpp
  auto ctor = buildCopyConstructor(static_cast<MyClass*(*)(const MyClass&)>(nullptr));
  MyClass original;
  auto copy = ctor(original);
  ```

### buildPlainConstructor

```cpp
template <typename Class, typename... Params>
auto buildPlainConstructor(Class (* /*unused*/)(Params...));
```

为类构建普通构造函数。

- **返回值:** 返回一个构造类实例的 lambda。
- **用法:**

  ```cpp
  auto ctor = buildPlainConstructor(static_cast<MyClass*(*)(int, string)>(nullptr));
  auto instance = ctor(42, "Hello");
  ```

### buildConstructor

```cpp
template <typename Class, typename... Args>
auto buildConstructor();
```

为类构建指定参数的构造函数。

- **返回值:** 返回一个构造共享指针到类的 lambda。
- **用法:**

  ```cpp
  auto ctor = buildConstructor<MyClass, int, string>();
  auto instance = ctor(42, "Hello");
  ```

### buildDefaultConstructor

```cpp
template <typename Class>
auto buildDefaultConstructor();
```

为类构建默认构造函数。

- **返回值:** 返回一个构造类实例的 lambda。
- **用法:**

  ```cpp
  auto ctor = buildDefaultConstructor<MyClass>();
  auto instance = ctor();
  ```

### buildMoveConstructor

```cpp
template <typename Class>
auto buildMoveConstructor();
```

使用移动构造函数构造类的实例。

- **返回值:** 返回一个使用移动构造函数构造类实例的 lambda。
- **用法:**

  ```cpp
  auto ctor = buildMoveConstructor<MyClass>();
  MyClass original;
  auto moved = ctor(std::move(original));
  ```

### buildInitializerListConstructor

```cpp
template <typename Class, typename T>
auto buildInitializerListConstructor();
```

使用初始化列表构造类的实例。

- **返回值:** 返回一个使用初始化列表构造类实例的 lambda。
- **用法:**

  ```cpp
  auto ctor = buildInitializerListConstructor<MyClass, int>();
  auto instance = ctor({1, 2, 3, 4, 5});
  ```

## 高级构造函数函数

### constructor

```cpp
template <typename T>
auto constructor();

template <typename Class, typename... Args>
auto constructor();
```

基于类型特征或指定参数构造类的实例。

- **返回值:** 返回一个构造类实例的 lambda。
- **用法:**

  ```cpp
  auto ctor1 = constructor<MyClass(int, string)>();
  auto instance1 = ctor1(42, "Hello");

  auto ctor2 = constructor<MyClass, int, string>();
  auto instance2 = ctor2(42, "Hello");
  ```

### defaultConstructor

```cpp
template <typename Class>
auto defaultConstructor();
```

使用默认构造函数构造类的实例。

- **返回值:** 返回一个构造类实例的 lambda。
- **抛出:** 如果类不可默认构造则抛出异常。
- **用法:**

  ```cpp
  auto ctor = defaultConstructor<MyClass>();
  auto instance = ctor();
  ```

## 注意事项

- 这些工具广泛使用了 C++17 和 C++20 特性，包括完美转发、constexpr if 和概念。
- `constructor` 函数使用 SFINAE 根据类的特征选择共享和复制构造函数。
- 许多函数返回 lambda，允许在各种上下文中灵活高效地使用。
- 这些工具适当地处理常量正确性和移动语义。
- 对于无法执行的请求（例如，无法为没有默认构造函数的类进行默认构造），实现了错误处理。
