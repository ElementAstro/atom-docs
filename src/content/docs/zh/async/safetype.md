---
title: 线程安全的数据类型
description: LockFreeStack、LockFreeHashTable、ThreadSafeVector 和 LockFreeList
---

## 目录

1. [LockFreeStack](#lockfreestack)
2. [LockFreeHashTable](#lockfreehashtable)
3. [ThreadSafeVector](#threadsafevector)
4. [LockFreeList](#lockfreelist)

## LockFreeStack

### 概述

`LockFreeStack` 是一个无锁实现的堆栈数据结构，适合并发使用。

### 模板参数

- `T`：存储在堆栈中的元素类型。

### 公共方法

#### 构造函数

```cpp
LockFreeStack();
```

创建一个空的无锁堆栈。

#### 析构函数

```cpp
~LockFreeStack();
```

销毁堆栈并释放所有分配的内存。

#### push

```cpp
void push(const T& value);
void push(T&& value);
```

将值推入堆栈。支持左值和右值引用。

#### pop

```cpp
auto pop() -> std::optional<T>;
```

尝试弹出堆栈顶部的值。如果成功，返回 `std::optional<T>`，如果堆栈为空，则返回 `std::nullopt`。

#### top

```cpp
auto top() const -> std::optional<T>;
```

返回堆栈顶部的值而不将其移除。如果堆栈为空，则返回 `std::nullopt`。

#### empty

```cpp
[[nodiscard]] auto empty() const -> bool;
```

检查堆栈是否为空。

#### size

```cpp
[[nodiscard]] auto size() const -> int;
```

返回堆栈中元素的近似数量。

### 使用示例

```cpp
atom::async::LockFreeStack<int> stack;

// 推送元素
stack.push(1);
stack.push(2);
stack.push(3);

// 弹出元素
auto top = stack.pop(); // 返回 3
auto second = stack.pop(); // 返回 2

// 检查是否为空
bool isEmpty = stack.empty(); // 返回 false

// 获取大小
int size = stack.size(); // 返回 1
```

## LockFreeHashTable

### 概述

`LockFreeHashTable` 是一个无锁实现的哈希表，允许并发访问和修改。

### 模板参数

- `Key`：哈希表中键的类型。
- `Value`：与键关联的值的类型。

### 公共方法

#### 构造函数

```cpp
explicit LockFreeHashTable(size_t num_buckets = 16);
```

创建一个具有指定数量桶的无锁哈希表（默认是 16）。

#### find

```cpp
auto find(const Key& key) const -> std::optional<Value>;
```

在哈希表中搜索键。如果找到，返回包含相关值的 `std::optional<Value>`，否则返回 `std::nullopt`。

#### insert

```cpp
void insert(const Key& key, const Value& value);
```

将键值对插入哈希表。

#### erase

```cpp
void erase(const Key& key);
```

从哈希表中删除指定键的条目。

#### empty

```cpp
[[nodiscard]] auto empty() const -> bool;
```

检查哈希表是否为空。

#### size

```cpp
[[nodiscard]] auto size() const -> size_t;
```

返回哈希表中的元素数量。

#### clear

```cpp
void clear();
```

从哈希表中移除所有元素。

### 迭代器

`LockFreeHashTable` 提供了一个前向迭代器用于遍历元素。

```cpp
auto begin() -> Iterator;
auto end() -> Iterator;
```

### 使用示例

```cpp
atom::async::LockFreeHashTable<std::string, int> hashTable;

// 插入元素
hashTable.insert("one", 1);
hashTable.insert("two", 2);

// 查找元素
auto value = hashTable.find("one"); // 返回包含 1 的 std::optional
auto notFound = hashTable.find("three"); // 返回 std::nullopt

// 删除元素
hashTable.erase("two");

// 检查是否为空
bool isEmpty = hashTable.empty(); // 返回 false

// 获取大小
size_t size = hashTable.size(); // 返回 1

// 迭代元素
for (const auto& [key, value] : hashTable) {
    std::cout << key << ": " << value << std::endl;
}
```

## ThreadSafeVector

### 概述

`ThreadSafeVector` 是一个线程安全的动态数组实现，允许并发访问和修改。

### 模板参数

- `T`：存储在向量中的元素类型。

### 公共方法

#### 构造函数

```cpp
explicit ThreadSafeVector(size_t initial_capacity = 16);
```

创建一个具有指定初始容量的线程安全向量（默认是 16）。

#### 析构函数

```cpp
~ThreadSafeVector();
```

销毁向量并释放所有分配的内存。

#### pushBack

```cpp
void pushBack(const T& value);
void pushBack(T&& value);
```

将元素添加到向量的末尾。支持左值和右值引用。

#### popBack

```cpp
auto popBack() -> std::optional<T>;
```

移除并返回向量的最后一个元素。如果向量为空，则返回 `std::nullopt`。

#### at

```cpp
auto at(size_t index) const -> std::optional<T>;
```

返回指定索引处的元素。如果索引超出范围，则返回 `std::nullopt`。

#### empty

```cpp
auto empty() const -> bool;
```

检查向量是否为空。

#### getSize

```cpp
auto getSize() const -> size_t;
```

返回向量中的元素数量。

#### getCapacity

```cpp
auto getCapacity() const -> size_t;
```

返回向量的当前容量。

#### clear

```cpp
void clear();
```

从向量中移除所有元素。

#### shrinkToFit

```cpp
void shrinkToFit();
```

将向量的容量减少到适合其大小。

#### front

```cpp
auto front() const -> T;
```

返回向量的第一个元素。如果向量为空，则抛出异常。

#### back

```cpp
auto back() const -> T;
```

返回向量的最后一个元素。如果向量为空，则抛出异常。

#### operator[]

```cpp
auto operator[](size_t index) const -> T;
```

返回指定索引处的元素。如果索引超出范围，则抛出异常。

### 使用示例

```cpp
atom::async::ThreadSafeVector<int> vector;

// 添加元素
vector.pushBack(1);
vector.pushBack(2);
vector.pushBack(3);

// 访问元素
auto firstElement = vector.front(); // 返回 1
auto lastElement = vector.back(); // 返回 3
auto elementAtIndex = vector[1]; // 返回 2

// 移除元素
auto poppedElement = vector.popBack(); // 返回 3

// 检查大小和容量
auto size = vector.getSize(); // 返回 2
auto capacity = vector.getCapacity(); // 返回一个大于等于 2 的值

// 清空向量
vector.clear();

// 检查是否为空
bool isEmpty = vector.empty(); // 返回 true
```

## LockFreeList

### 概述

`LockFreeList` 是一个无锁实现的单链表，允许并发访问和修改。

### 模板参数

- `T`：存储在列表中的元素类型。

### 公共方法

#### 构造函数

```cpp
LockFreeList();
```

创建一个空的无锁列表。

#### 析构函数

```cpp
~LockFreeList();
```

销毁列表并释放所有分配的内存。

#### pushFront

```cpp
void pushFront(T value);
```

将元素添加到列表的前面。

#### popFront

```cpp
auto popFront() -> std::optional<T>;
```

移除并返回列表的第一个元素。如果列表为空，则返回 `std::nullopt`。

#### empty

```cpp
[[nodiscard]] auto empty() const -> bool;
```

检查列表是否为空。

### 迭代器

`LockFreeList` 提供了一个前向迭代器用于遍历元素。

```cpp
auto begin() -> Iterator;
auto end() -> Iterator;
```

### 使用示例

```cpp
atom::async::LockFreeList<int> list;

// 添加元素
list.pushFront(3);
list.pushFront(2);
list.pushFront(1);

// 移除元素
auto firstElement = list.popFront(); // 返回 1
auto secondElement = list.popFront(); // 返回 2

// 检查是否为空
bool isEmpty = list.empty(); // 返回 false

// 迭代元素
for (const auto& value : list) {
    std::cout << value << std::endl; // 输出: 3
}
```

## 一般使用说明

1. **线程安全**：所有这些数据结构设计为并发使用。它们可以安全地从多个线程访问和修改，而无需外部同步。

2. **内存管理**：这些结构使用各种技术在并发环境中安全地管理内存，例如在 `LockFreeList` 中使用危险指针。

3. **性能考虑**：尽管这些结构提供了线程安全性，但与其非并发对等物相比，它们可能具有不同的性能特征。选择这些和其他同步方法（如使用互斥量保护的标准容器）取决于具体用例和性能要求。

4. **异常安全性**：这些结构设计为异常安全。然而，它们假设对包含对象的操作（如复制构造函数、移动构造函数和析构函数）不会抛出异常。

5. **迭代**：`LockFreeHashTable` 和 `LockFreeList` 提供迭代器。然而，请注意，在其他线程修改它们时，迭代这些结构可能无法提供数据的一致视图。

6. **可选返回值**：许多方法返回 `std::optional<T>`，而不是抛出异常或返回哨兵值。这提供了一种清晰且类型安全的方式来处理无法完成的操作（例如，从空容器弹出）。

7. **移动语义**：在适用的情况下，这些结构支持移动语义，以实现高效的元素插入和移除。

## 最佳实践

1. **选择合适的结构**：根据具体需求选择合适的数据结构。例如，使用 `LockFreeStack` 进行 LIFO 操作，使用 `LockFreeHashTable` 处理快速查找的键值对，使用 `ThreadSafeVector` 进行动态数组操作，以及在需要频繁插入开头的情况下使用 `LockFreeList`。

2. **错误处理**：在使用返回 `std::optional<T>` 的方法之前，始终检查返回值。

3. **迭代器**：使用迭代器时，要注意结构可能由于并发修改而发生变化。如果需要一致的视图，请考虑使用其他同步机制。

4. **内存使用**：注意内存使用，特别是在 `ThreadSafeVector` 中。适当时使用 `shrinkToFit()` 以优化内存消耗。

5. **性能调优**：对于 `LockFreeHashTable`，根据预期元素数量选择适当的初始桶数，以最小化碰撞和调整大小操作。
