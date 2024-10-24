---
title: TTL缓存
description: 全面文档，介绍 atom::search 命名空间中的 TTLCache 类，包括构造函数、基本操作、缓存管理、统计信息、线程安全性和使用示例。 
---

## 目录

1. [类声明](#类声明)
2. [构造函数和析构函数](#构造函数和析构函数)
3. [基本操作](#基本操作)
4. [缓存管理](#缓存管理)
5. [统计信息](#统计信息)
6. [线程安全](#线程安全)
7. [使用示例](#使用示例)
8. [最佳实践](#最佳实践)

## 类声明

```cpp
namespace atom::search {
template <typename Key, typename Value>
class TTLCache {
    // ... (类成员和方法)
};
}
```

`TTLCache` 类模板以 `Key` 和 `Value` 类型进行模板化，允许灵活使用不同的数据类型。

## 构造函数和析构函数

### 构造函数

```cpp
TTLCache(Duration ttl, size_t max_capacity);
```

创建一个新的 `TTLCache`，指定 TTL 和最大容量。

- **参数：**
  - `ttl`：过期后将被移除的条目的持续时间。
  - `max_capacity`：缓存可以容纳的最大条目数量。

### 析构函数

```cpp
~TTLCache();
```

销毁 `TTLCache` 对象并停止清理线程。

## 基本操作

### Put

```cpp
void put(const Key& key, const Value& value);
```

将新的键值对插入缓存或更新现有键。

- 如果键已存在，则其值被更新并移动到缓存的前面（标记为最近使用）。
- 如果缓存已达到最大容量，则移除最近最少使用的条目。

### Get

```cpp
std::optional<Value> get(const Key& key);
```

从缓存中检索与给定键关联的值。

- 返回 `std::optional<Value>`，如果找到且未过期，则包含值；否则返回 `std::nullopt`。
- 访问条目会将其移动到缓存的前面（标记为最近使用）。

## 缓存管理

### Cleanup

```cpp
void cleanup();
```

执行缓存清理，移除过期条目。此方法由清理线程自动调用，但在需要时也可以手动调用。

### Clear

```cpp
void clear();
```

清除缓存中的所有条目并重置命中/未命中计数。

## 统计信息

### Hit Rate

```cpp
double hitRate() const;
```

返回缓存的命中率（缓存命中与总访问的比率）。

### Size

```cpp
size_t size() const;
```

返回缓存中当前的条目数量。

## 线程安全

`TTLCache` 类设计为线程安全：

- 它使用 `std::shared_mutex` 进行读写锁定，允许多个并发读取，但独占写入。
- 清理线程在后台运行，定期移除过期条目。

## 使用示例

### 基本用法

```cpp
#include "TTLCache.hpp"
#include <iostream>
#include <string>

int main() {
    // 创建一个 5 秒 TTL 和最大容量为 100 的缓存
    atom::search::TTLCache<int, std::string> cache(std::chrono::seconds(5), 100);

    // 插入条目
    cache.put(1, "One");
    cache.put(2, "Two");
    cache.put(3, "Three");

    // 检索条目
    auto value = cache.get(2);
    if (value) {
        std::cout << "键 2 的值: " << *value << std::endl;
    } else {
        std::cout << "键 2 未找到或已过期" << std::endl;
    }

    // 等待条目过期
    std::this_thread::sleep_for(std::chrono::seconds(6));

    // 尝试检索已过期的条目
    value = cache.get(1);
    if (!value) {
        std::cout << "键 1 已过期" << std::endl;
    }

    // 检查缓存统计信息
    std::cout << "缓存大小: " << cache.size() << std::endl;
    std::cout << "命中率: " << cache.hitRate() << std::endl;

    return 0;
}
```

### LRU 驱逐示例

```cpp
atom::search::TTLCache<int, std::string> cache(std::chrono::minutes(5), 3);

// 插入 3 个条目（最大容量）
cache.put(1, "One");
cache.put(2, "Two");
cache.put(3, "Three");

// 访问条目 1，使其成为最近使用
cache.get(1);

// 插入新条目，这将驱逐条目 2（最近最少使用）
cache.put(4, "Four");

// 检查条目是否存在
std::cout << "条目 1 存在: " << (cache.get(1).has_value() ? "是" : "否") << std::endl;
std::cout << "条目 2 存在: " << (cache.get(2).has_value() ? "是" : "否") << std::endl;
std::cout << "条目 3 存在: " << (cache.get(3).has_value() ? "是" : "否") << std::endl;
std::cout << "条目 4 存在: " << (cache.get(4).has_value() ? "是" : "否") << std::endl;
```

### 线程安全使用

```cpp
#include <thread>
#include <vector>

atom::search::TTLCache<int, int> cache(std::chrono::seconds(30), 1000);

void worker(int id, int num_operations) {
    for (int i = 0; i < num_operations; ++i) {
        int key = std::rand() % 1000;
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

## 最佳实践

1. **选择合适的 TTL**：设置一个平衡数据新鲜度和缓存效率的 TTL。TTL 过短可能导致频繁的缓存未命中，而过长可能导致过时数据的服务。

2. **设置合理的最大容量**：选择一个符合内存限制和预期数据量的最大容量。

3. **监控命中率**：定期检查缓存的命中率，以确保其性能良好。低命中率可能表明 TTL 过短或最大容量过低。

4. **使用合适的键和值类型**：选择高效的键和值类型，以便于复制和比较，因为这些操作在缓存中频繁执行。

5. **利用回调函数**：使用插入、删除和清空回调函数，可以用于记录缓存操作或将缓存与外部数据存储同步。
