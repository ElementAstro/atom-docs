---
title: 资源缓存
description: 详细文档，介绍 lithium 命名空间中的 ResourceCache 类，包括构造函数、公共方法、LogEntry 结构体和使用示例，用于管理和分析日志文件。
---

## 目录

1. [介绍](#介绍)
2. [类概述](#类概述)
3. [LogEntry 结构体](#logentry-结构体)
4. [构造函数和析构函数](#构造函数和析构函数)
5. [公共方法](#公共方法)
6. [使用示例](#使用示例)

## 介绍

`ResourceCache` 类是一个基于模板的缓存系统，旨在高效存储和检索资源。它是 `atom::search` 命名空间的一部分，提供了过期、最近最少使用（LRU）驱逐、异步操作和持久存储等多种功能。

## 类概述

```cpp
template <typename T>
concept Cacheable = std::copy_constructible<T> && std::is_copy_assignable_v<T>;

template <Cacheable T>
class ResourceCache {
public:
    explicit ResourceCache(int maxSize);
    std::vector<LogEntry> searchLogs(std::string_view keyword);
    void uploadFile(const std::string &filePath);
    void analyzeLogs();

private:
    class Impl;
    std::unique_ptr<Impl> pImpl;
};
```

`ResourceCache` 类是以类型 `T` 为模板参数的，`T` 必须满足 `Cacheable` 概念，确保其可以被复制和赋值。

## LogEntry 结构体

```cpp
struct LogEntry {
    std::string fileName;
    int lineNumber;
    std::string message;
};
```

`LogEntry` 结构体表示单个日志条目，包含以下字段：

- `fileName`：包含日志条目的文件名。
- `lineNumber`：日志条目在文件中的行号。
- `message`：日志消息的内容。

## 构造函数和析构函数

### 构造函数

```cpp
explicit ResourceCache(int maxSize);
```

- **参数：**
  - `maxSize`：设置缓存中最大条目的数量。

### 析构函数

```cpp
~ResourceCache();
```

确保资源的正确清理，包括停止清理线程。

## 公共方法

### insert

```cpp
void insert(const std::string &key, const T &value, std::chrono::seconds expirationTime);
```

将新条目插入缓存，指定键、值和过期时间。

### get

```cpp
auto get(const std::string &key) -> std::optional<T>;
```

从缓存中检索条目。如果条目不存在或已过期，则返回 `std::nullopt`。

### remove

```cpp
void remove(const std::string &key);
```

从缓存中移除条目。

### contains

```cpp
auto contains(const std::string &key) const -> bool;
```

检查缓存中是否存在条目。

### clear

```cpp
void clear();
```

移除缓存中的所有条目。

### size

```cpp
auto size() const -> size_t;
```

返回缓存中的条目数量。

### empty

```cpp
auto empty() const -> bool;
```

检查缓存是否为空。

### setMaxSize

```cpp
void setMaxSize(int maxSize);
```

设置缓存可以容纳的最大条目数量。

## 使用示例

### 基本用法

```cpp
ResourceCache<std::string> cache(100); // 创建一个最大大小为 100 的缓存

// 插入条目
cache.insert("key1", "value1", std::chrono::seconds(60));

// 检索条目
auto value = cache.get("key1");
if (value) {
    std::cout << "值: " << *value << std::endl;
} else {
    std::cout << "键未找到或已过期" << std::endl;
}

// 移除条目
cache.remove("key1");
```

### 异步操作

```cpp
auto future = cache.asyncInsert("key2", "value2", std::chrono::seconds(120));
future.wait(); // 等待插入完成

auto valueFuture = cache.asyncGet("key2");
auto value = valueFuture.get();
if (value) {
    std::cout << "异步检索到的值: " << *value << std::endl;
}
```

### JSON 持久性

```cpp
// 保存到 JSON 文件
cache.writeToJsonFile("cache_data.json", [](const std::string& value) {
    return json{{"data", value}};
});

// 从 JSON 文件加载
cache.readFromJsonFile("cache_data.json", [](const json& j) {
    return j["data"].get<std::string>();
});
```

### 批量操作

```cpp
std::vector<std::pair<std::string, std::string>> items = {
    {"key3", "value3"},
    {"key4", "value4"},
    {"key5", "value5"}
};
cache.insertBatch(items, std::chrono::seconds(300));

std::vector<std::string> keysToRemove = {"key3", "key4"};
cache.removeBatch(keysToRemove);
```
