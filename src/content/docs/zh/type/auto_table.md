---
title: 定时排序的哈希表
description: Atom::type 命名空间中 CountingHashTable 类的全面文档，包括模板参数、类成员、构造函数、公有方法和使用示例，用于实现线程安全的带访问计数的哈希表。
---

## 目录

1. [概述](#概述)
2. [模板参数](#模板参数)
3. [类成员](#类成员)
4. [构造函数和析构函数](#构造函数和析构函数)
5. [公有方法](#公有方法)
6. [使用示例](#使用示例)

## 概述

`CountingHashTable` 类提供了一个线程安全的哈希表实现，能够跟踪每个条目的访问次数。它支持插入、检索、删除和基于访问计数的自动排序等操作。

## 模板参数

该类使用两个模板参数：

- `Key`: 哈希表中键的类型，必须可进行相等比较。
- `Value`: 哈希表中值的类型，必须可移动。

## 类成员

### Entry 结构体

`Entry` 结构体表示哈希表中的单个条目：

```cpp
struct Entry {
    Value value;                   // 存储在条目中的值
    std::atomic<size_t> count{0};  // 条目的访问计数

    Entry() = default;
    explicit Entry(Value val) : value(std::move(val)) {}
};
```

### 私有成员

- `std::unordered_map<Key, Entry> table_`: 底层哈希表。
- `std::atomic_flag stopSorting`: 标志位，用于指示是否停止自动排序。
- `std::jthread sortingThread`: 用于自动排序的线程。

## 构造函数和析构函数

```cpp
CountingHashTable();
~CountingHashTable();
```

构造函数初始化一个空的哈希表。析构函数确保在对象销毁之前停止自动排序。

## 公有方法

### 插入

```cpp
void insert(const Key& key, const Value& value);
void insertBatch(const std::vector<std::pair<Key, Value>>& items);
```

将单个键值对或多个键值对插入哈希表中。

### 检索

```cpp
auto get(const Key& key) -> std::optional<Value>;
auto getBatch(const std::vector<Key>& keys) -> std::vector<std::optional<Value>>;
```

检索与单个键或多个键关联的值。如果键未找到，则返回 `std::nullopt`。

### 删除

```cpp
auto erase(const Key& key) -> bool;
void clear();
```

移除单个条目或清空哈希表中的所有条目。

### 条目管理

```cpp
auto getAllEntries() const -> std::vector<std::pair<Key, Entry>>;
void sortEntriesByCountDesc();
```

检索所有条目或按访问计数降序排序。

### 自动排序

```cpp
void startAutoSorting(std::chrono::milliseconds interval);
void stopAutoSorting();
```

在指定的时间间隔内启动或停止条目的自动排序。

## 使用示例

以下是一些示例，演示如何使用 `CountingHashTable` 类：

```cpp
#include "auto_table.hpp"
#include <iostream>
#include <string>

int main() {
    atom::type::CountingHashTable<std::string, int> table;

    // 插入键值对
    table.insert("one", 1);
    table.insert("two", 2);
    table.insert("three", 3);

    // 检索值
    auto value = table.get("two");
    if (value) {
        std::cout << "Value for 'two': " << *value << std::endl;
    }

    // 批量插入
    std::vector<std::pair<std::string, int>> batch = {
        {"four", 4},
        {"five", 5}
    };
    table.insertBatch(batch);

    // 批量检索
    auto results = table.getBatch({"one", "three", "five"});
    for (const auto& result : results) {
        if (result) {
            std::cout << "Found value: " << *result << std::endl;
        } else {
            std::cout << "Value not found" << std::endl;
        }
    }

    // 删除条目
    bool erased = table.erase("two");
    std::cout << "Erased 'two': " << (erased ? "yes" : "no") << std::endl;

    // 获取所有条目
    auto allEntries = table.getAllEntries();
    std::cout << "All entries:" << std::endl;
    for (const auto& [key, entry] : allEntries) {
        std::cout << key << ": " << entry.value << " (count: " << entry.count.load() << ")" << std::endl;
    }

    // 按计数排序条目
    table.sortEntriesByCountDesc();

    // 启动自动排序
    table.startAutoSorting(std::chrono::seconds(5));

    // 执行一些操作...

    // 停止自动排序
    table.stopAutoSorting();

    // 清空表格
    table.clear();

    return 0;
}
```
