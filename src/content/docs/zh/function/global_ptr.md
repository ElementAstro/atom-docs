---
title: 全局共享指针管理器
description: atom::meta 命名空间中 global_ptr.hpp 文件的详细文档，包括用于管理 C++ 中共享指针和弱指针的关键组件、宏、方法、使用示例和注意事项。  
---

## 目录

1. [关键组件](#关键组件)
2. [宏](#宏)
3. [GlobalSharedPtrManager 类](#globalsharedptrmanager-类)
4. [使用示例](#使用示例)
5. [注意事项和考虑因素](#注意事项和考虑因素)

## 关键组件

### GlobalSharedPtrManager

该库的核心是 `GlobalSharedPtrManager` 类，管理共享指针和弱指针的集合。

```cpp
class GlobalSharedPtrManager : public NonCopyable {
    // ...（方法和成员）
};
```

### 共享指针映射

该类使用快速哈希映射（如果定义了 `ENABLE_FASTHASH`）或标准的 `unordered_map` 来存储指针：

```cpp
#if ENABLE_FASTHASH
    emhash8::HashMap<std::string, std::any> shared_ptr_map_;
#else
    std::unordered_map<std::string, std::any> shared_ptr_map_;
#endif
```

## 宏

文件定义了几个用于常见操作的便利宏：

- `GetPtr`: 检索共享指针
- `GetWeakPtr`: 从共享指针检索弱指针
- `AddPtr`: 添加共享指针
- `RemovePtr`: 移除共享指针
- `GetPtrOrCreate`: 检索或创建共享指针
- `GET_OR_CREATE_PTR`: 创建并分配共享指针
- `GET_OR_CREATE_PTR_THIS`: 使用 `this` 上下文创建并分配共享指针
- `GET_OR_CREATE_WEAK_PTR`: 创建并分配弱指针
- `GET_OR_CREATE_PTR_WITH_DELETER`: 创建并分配带自定义删除器的共享指针

## GlobalSharedPtrManager 类

### 关键方法

1. `getInstance()`: 返回管理器的单例实例。
2. `getSharedPtr<T>(const std::string& key)`: 通过键检索共享指针。
3. `getOrCreateSharedPtr<T, CreatorFunc>(const std::string& key, CreatorFunc creator)`: 检索或创建共享指针。
4. `getWeakPtr<T>(const std::string& key)`: 通过键检索弱指针。
5. `addSharedPtr<T>(const std::string& key, std::shared_ptr<T> sharedPtr)`: 添加共享指针。
6. `removeSharedPtr(const std::string& key)`: 移除共享指针。
7. `addWeakPtr<T>(const std::string& key, const std::weak_ptr<T>& weakPtr)`: 添加弱指针。
8. `getSharedPtrFromWeakPtr<T>(const std::string& key)`: 从弱指针检索共享指针。
9. `getWeakPtrFromSharedPtr<T>(const std::string& key)`: 从共享指针检索弱指针。
10. `removeExpiredWeakPtrs()`: 移除所有过期的弱指针。
11. `addDeleter<T>(const std::string& key, const std::function<void(T*)>& deleter)`: 为共享对象添加自定义删除器。
12. `deleteObject<T>(const std::string& key, T* ptr)`: 使用自定义删除器删除共享对象（如果可用）。
13. `clearAll()`: 从管理器中移除所有指针。
14. `size()`: 返回管理的指针数量。
15. `printSharedPtrMap()`: 打印共享指针映射的内容。

## 使用示例

### 基本用法

```cpp
#include "global_ptr.hpp"
#include <iostream>

class MyClass {
public:
    void doSomething() { std::cout << "Doing something" << std::endl; }
};

int main() {
    // 创建并添加共享指针
    auto myClassPtr = std::make_shared<MyClass>();
    AddPtr("myClass", myClassPtr);

    // 检索并使用共享指针
    if (auto ptr = GetPtr<MyClass>("myClass")) {
        ptr->doSomething();
    }

    // 移除共享指针
    RemovePtr("myClass");

    return 0;
}
```

### 使用 GET_OR_CREATE_PTR

```cpp
#include "global_ptr.hpp"
#include <iostream>

class MyClass {
public:
    MyClass(int value) : value_(value) {}
    void print() { std::cout << "Value: " << value_ << std::endl; }

private:
    int value_;
};

int main() {
    std::shared_ptr<MyClass> myClassPtr;

    GET_OR_CREATE_PTR(myClassPtr, MyClass, "myClass", 42);

    if (myClassPtr) {
        myClassPtr->print();
    }

    return 0;
}
```

### 使用自定义删除器

```cpp
#include "global_ptr.hpp"
#include <iostream>

class Resource {
public:
    Resource() { std::cout << "Resource acquired" << std::endl; }
    ~Resource() { std::cout << "Resource released" << std::endl; }
};

int main() {
    auto customDeleter = [](Resource* ptr) {
        std::cout << "Custom deleter called" << std::endl;
        delete ptr;
    };

    GET_OR_CREATE_PTR_WITH_DELETER(resourcePtr, Resource, "resource", customDeleter);

    // 使用资源...

    // 当共享指针被销毁时，将调用自定义删除器
    RemovePtr("resource");

    return 0;
}
```

## 注意事项和考虑因素

1. 线程安全：`GlobalSharedPtrManager` 使用 `std::shared_mutex` 确保线程安全操作。
2. 类型安全：管理器使用 `std::any` 存储不同指针类型，这可能导致类型相关问题。
3. 性能：使用 `std::any` 和类型转换可能会引入一些性能开销。
4. 内存管理：使用弱指针时要小心，因为它们不会阻止所指向对象被删除。
5. 自定义删除器：管理器支持自定义删除器，这对于管理需要特殊清理的资源非常有用。
6. 单例模式：`GlobalSharedPtrManager` 实现为单例，这可能不适合所有用例。
7. 调试：`printSharedPtrMap()` 方法可以用于调试和跟踪管理的指针。
8. 灵活性：管理器支持共享和弱指针，提供指针管理的灵活性。
