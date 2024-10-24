---
title: 线程安全的LRU缓存
description: Detailed documentation for the ThreadSafeLRUCache class in the atom::search namespace, including constructors, basic operations, cache management, callbacks, statistics, persistence, and usage examples.
---

## 目录

1. [类声明](#类声明)
2. [构造函数](#构造函数)
3. [基本操作](#基本操作)
4. [缓存管理](#缓存管理)
5. [回调](#回调)
6. [统计信息](#统计信息)
7. [持久性](#持久性)
8. [使用示例](#使用示例)

## 类声明

```cpp
namespace atom::search {
template <typename Key, typename Value>
class ThreadSafeLRUCache {
    // ... (类成员和方法)
};
}
```

`ThreadSafeLRUCache` 类使用 `Key` 和 `Value` 类型进行模板化，允许灵活使用不同的数据类型。

## 构造函数

```cpp
explicit ThreadSafeLRUCache(size_t max_size);
```

创建一个新的 `ThreadSafeLRUCache`，并指定最大大小。

- **参数：**
  - `max_size`：缓存可以容纳的最大条目数量。

## 基本操作

### Get

```cpp
auto get(const Key& key) -> std::optional<Value>;
```

从缓存中检索值。如果找到并且未过期，则将其移动到缓存的前面（标记为最近使用）。

- **返回**：包含值的 `std::optional<Value>`，如果未找到或已过期，则返回 `std::nullopt`。

### Put

```cpp
void put(const Key& key, const Value& value, std::optional<std::chrono::seconds> ttl = std::nullopt);
```

在缓存中插入或更新值。

- **参数：**
  - `key`：要插入或更新的键。
  - `value`：要与键关联的值。
  - `ttl`：缓存项目的可选生存时间。

如果缓存已满，则删除最近最少使用的条目。

### Erase

```cpp
void erase(const Key& key);
```

从缓存中移除条目。

### Clear

```cpp
void clear();
```

移除缓存中的所有条目。

## 缓存管理

### Resize

```cpp
void resize(size_t new_max_size);
```

将缓存调整为新的最大大小。如果新大小较小，则删除最近最少使用的条目，直到缓存大小适合。

### Size

```cpp
auto size() const -> size_t;
```

返回缓存中的当前条目数量。

### Load Factor

```cpp
auto loadFactor() const -> float;
```

返回缓存的当前负载因子（当前大小与最大大小的比率）。

### Keys

```cpp
auto keys() const -> std::vector<Key>;
```

返回当前缓存中所有键的向量。

### Pop LRU

```cpp
auto popLru() -> std::optional<KeyValuePair>;
```

移除并返回缓存中最近最少使用的条目。

## 回调

该类提供方法来设置各种事件的回调函数：

```cpp
void setInsertCallback(std::function<void(const Key&, const Value&)> callback);
void setEraseCallback(std::function<void(const Key&)> callback);
void setClearCallback(std::function<void()> callback);
```

这些方法允许您在插入、删除或清空缓存时设置自定义行为。

## 统计信息

### Hit Rate

```cpp
auto hitRate() const -> float;
```

返回缓存的命中率（缓存命中与总缓存访问的比率）。

## 持久性

### Save to File

```cpp
void saveToFile(const std::string& filename) const;
```

将缓存内容保存到文件。

### Load from File

```cpp
void loadFromFile(const std::string& filename);
```

从文件加载缓存内容。

## 使用示例

### 基本用法

```cpp
#include "ThreadSafeLRUCache.h"
#include <iostream>
#include <string>

int main() {
    atom::search::ThreadSafeLRUCache<int, std::string> cache(3);  // 最大大小为 3 的缓存

    // 插入项目
    cache.put(1, "One");
    cache.put(2, "Two");
    cache.put(3, "Three");

    // 检索项目
    auto value = cache.get(2);
    if (value) {
        std::cout << "键 2 的值: " << *value << std::endl;
    }

    // 插入新项目，导致最近最少使用的项目被驱逐
    cache.put(4, "Four");

    // 尝试检索被驱逐的项目
    value = cache.get(1);
    if (!value) {
        std::cout << "键 1 在缓存中未找到" << std::endl;
    }

    return 0;
}
```

### 使用 TTL（生存时间）

```cpp
atom::search::ThreadSafeLRUCache<int, std::string> cache(5);

// 插入带有 2 秒 TTL 的项目
cache.put(1, "Short-lived", std::chrono::seconds(2));

// 立即检索项目
auto value = cache.get(1);
if (value) {
    std::cout << "找到的值: " << *value << std::endl;
}

// 等待 3 秒
std::this_thread::sleep_for(std::chrono::seconds(3));

// 尝试检索过期的项目
value = cache.get(1);
if (!value) {
    std::cout << "项目已过期，未找到" << std::endl;
}
```

### 使用回调

```cpp
atom::search::ThreadSafeLRUCache<int, std::string> cache(3);

cache.setInsertCallback([](const int& key, const std::string& value) {
    std::cout << "插入: " << key << " -> " << value << std::endl;
});

cache.setEraseCallback([](const int& key) {
    std::cout << "移除键: " << key << std::endl;
});

cache.put(1, "One");  // 触发插入回调
cache.put(2, "Two");  // 触发插入回调
cache.erase(1);       // 触发移除回调
```

### 持久性

```cpp
atom::search::ThreadSafeLRUCache<int, std::string> cache(5);

// 填充缓存
cache.put(1, "One");
cache.put(2, "Two");
cache.put(3, "Three");

// 保存缓存到文件
cache.saveToFile("cache_backup.bin");

// 清空缓存
cache.clear();

// 从文件加载缓存
cache.loadFromFile("cache_backup.bin");

// 验证加载的数据
for (int i = 1; i <= 3; ++i) {
    auto value = cache.get(i);
    if (value) {
        std::cout << "加载: " << i << " -> " << *value << std::endl;
    }
}
```

### 统计信息和缓存管理

```cpp
std::cout << "负载因子: " << cache.loadFactor() << std::endl;

// 执行一些缓存操作
for (int i = 0; i < 20; ++i) {
    cache.get(i % 10);  // 这将导致命中和未命中
}

std::cout << "命中率: " << cache.hitRate() << std::endl;

// 调整缓存大小
cache.resize(5);
std::cout << "调整到 5 后，缓存大小: " << cache.size() << std::endl;

// 获取所有键
auto keys = cache.keys();
std::cout << "当前缓存中的键: ";
for (const auto& key : keys) {
    std::cout << key << " ";
}
std::cout << std::endl;

// 弹出最近最少使用的条目
auto lru = cache.popLru();
if (lru) {
    std::cout << "弹出 LRU 项: " << lru->first << " -> " << lru->second << std::endl;
}
```

### 线程安全演示

此示例展示了缓存如何安全地从多个线程中使用：

```cpp
#include <thread>
#include <vector>

atom::search::ThreadSafeLRUCache<int, int> cache(100);

void worker(int id, int num_operations) {
    for (int i = 0; i < num_operations; ++i) {
        int key = std::rand() % 200;
        if (std::rand() % 2 == 0) {
            cache.put(key, id * 1000 + i);
        } else {
            auto value = cache.get(key);
            if (value) {
                // 处理值
            }
        }
    }
}

int main() {
    std::vector<std::thread> threads;
    int num_threads = 4;
    int operations_per_thread = 10000;

    for (int i = 0; i < num_threads; ++i) {
        threads.emplace_back(worker, i, operations_per_thread);
    }

    for (auto& t : threads) {
        t.join();
    }

    std::cout << "最终缓存大小: " << cache.size() << std::endl;
    std::cout << "命中率: " << cache.hitRate() << std::endl;

    return 0;
}
```
