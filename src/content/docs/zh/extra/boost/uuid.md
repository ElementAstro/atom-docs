---
title: UUID
description: atom::extra::boost 命名空间中 UUID 类的详细文档，包括构造函数、生成和操作 UUID 的方法、转换方法以及使用示例。  
---

## 目录

1. [构造函数](#构造函数)
2. [基本操作](#基本操作)
3. [转换方法](#转换方法)
4. [UUID 生成](#uuid-生成)
5. [UUID 属性](#uuid-属性)
6. [高级操作](#高级操作)
7. [命名空间 UUIDs](#命名空间-uuids)
8. [比较和哈希](#比较和哈希)

## 构造函数

```cpp
UUID()
explicit UUID(const std::string& str)
explicit UUID(const ::boost::uuids::uuid& uuid)
```

`UUID` 类提供了三个构造函数：

1. 默认构造函数：生成一个新的随机 UUID（版本 4）。
2. 字符串构造函数：从字符串表示创建 UUID。
3. Boost UUID 构造函数：从 Boost UUID 对象创建 UUID。

**示例：**

```cpp
atom::extra::boost::UUID uuid1;  // 随机 UUID
atom::extra::boost::UUID uuid2("123e4567-e89b-12d3-a456-426614174000");  // 从字符串
boost::uuids::uuid boost_uuid = boost::uuids::random_generator()();
atom::extra::boost::UUID uuid3(boost_uuid);  // 从 Boost UUID
```

## 基本操作

### toString()

```cpp
[[nodiscard]] auto toString() const -> std::string
```

将 UUID 转换为其字符串表示形式。

**示例：**

```cpp
atom::extra::boost::UUID uuid;
std::cout << uuid.toString() << std::endl;  // 例如 "123e4567-e89b-12d3-a456-426614174000"
```

### isNil()

```cpp
[[nodiscard]] auto isNil() const -> bool
```

检查 UUID 是否为 nil（全零）。

**示例：**

```cpp
atom::extra::boost::UUID uuid;
bool is_nil = uuid.isNil();
```

### format()

```cpp
[[nodiscard]] auto format() const -> std::string
```

返回 UUID 的格式化字符串表示形式，包含在花括号中。

**示例：**

```cpp
atom::extra::boost::UUID uuid;
std::cout << uuid.format() << std::endl;  // 例如 "{123e4567-e89b-12d3-a456-426614174000}"
```

## 转换方法

### toBytes()

```cpp
[[nodiscard]] auto toBytes() const -> std::vector<uint8_t>
```

将 UUID 转换为字节向量。

**示例：**

```cpp
atom::extra::boost::UUID uuid;
std::vector<uint8_t> bytes = uuid.toBytes();
```

### fromBytes()

```cpp
static auto fromBytes(const std::span<const uint8_t>& bytes) -> UUID
```

从字节范围创建 UUID。

**示例：**

```cpp
std::vector<uint8_t> bytes = {/* ... 16 bytes ... */};
atom::extra::boost::UUID uuid = atom::extra::boost::UUID::fromBytes(bytes);
```

### toUint64()

```cpp
[[nodiscard]] auto toUint64() const -> uint64_t
```

将 UUID 转换为 64 位无符号整数。

**示例：**

```cpp
atom::extra::boost::UUID uuid;
uint64_t value = uuid.toUint64();
```

### toBase64()

```cpp
[[nodiscard]] auto toBase64() const -> std::string
```

将 UUID 转换为 Base64 编码字符串。

**示例：**

```cpp
atom::extra::boost::UUID uuid;
std::string base64 = uuid.toBase64();
```

## UUID 生成

### v1()

```cpp
[[nodiscard]] static auto v1() -> UUID
```

生成版本 1（基于时间）UUID。

**示例：**

```cpp
atom::extra::boost::UUID uuid = atom::extra::boost::UUID::v1();
```

### v3()

```cpp
static auto v3(const UUID& namespace_uuid, const std::string& name) -> UUID
```

生成版本 3（基于名称，MD5）UUID。

**示例：**

```cpp
atom::extra::boost::UUID namespace_uuid = atom::extra::boost::UUID::namespaceURL();
atom::extra::boost::UUID uuid = atom::extra::boost::UUID::v3(namespace_uuid, "example.com");
```

### v4()

```cpp
[[nodiscard]] static auto v4() -> UUID
```

生成版本 4（随机）UUID。

**示例：**

```cpp
atom::extra::boost::UUID uuid = atom::extra::boost::UUID::v4();
```

### v5()

```cpp
static auto v5(const UUID& namespace_uuid, const std::string& name) -> UUID
```

生成版本 5（基于名称，SHA1）UUID。

**示例：**

```cpp
atom::extra::boost::UUID namespace_uuid = atom::extra::boost::UUID::namespaceURL();
atom::extra::boost::UUID uuid = atom::extra::boost::UUID::v5(namespace_uuid, "example.com");
```

## UUID 属性

### version()

```cpp
[[nodiscard]] auto version() const -> int
```

返回 UUID 的版本。

**示例：**

```cpp
atom::extra::boost::UUID uuid;
int version = uuid.version();
```

### variant()

```cpp
[[nodiscard]] auto variant() const -> int
```

返回 UUID 的变体。

**示例：**

```cpp
atom::extra::boost::UUID uuid;
int variant = uuid.variant();
```

## 高级操作

### getTimestamp()

```cpp
[[nodiscard]] auto getTimestamp() const -> std::chrono::system_clock::time_point
```

返回版本 1 UUID 的时间戳。

**示例：**

```cpp
atom::extra::boost::UUID uuid = atom::extra::boost::UUID::v1();
auto timestamp = uuid.getTimestamp();
std::cout << "UUID timestamp: " << std::chrono::system_clock::to_time_t(timestamp) << std::endl;
```

## 命名空间 UUIDs

`UUID` 类提供静态方法访问预定义的命名空间 UUID：

```cpp
static auto namespaceDNS() -> UUID
static auto namespaceURL() -> UUID
static auto namespaceOID() -> UUID
```

**示例：**

```cpp
atom::extra::boost::UUID dns_namespace = atom::extra::boost::UUID::namespaceDNS();
atom::extra::boost::UUID url_namespace = atom::extra::boost::UUID::namespaceURL();
atom::extra::boost::UUID oid_namespace = atom::extra::boost::UUID::namespaceOID();
```

## 比较和哈希

`UUID` 类支持比较操作，并可以作为标准容器中的键。

**示例：**

```cpp
atom::extra::boost::UUID uuid1, uuid2;
if (uuid1 < uuid2) {
    std::cout << "uuid1 is less than uuid2" << std::endl;
}

std::unordered_set<atom::extra::boost::UUID> uuid_set;
uuid_set.insert(uuid1);
uuid_set.insert(uuid2);
```

## 完整使用示例

以下是一个全面示例，演示 `UUID` 类的各种功能：

```cpp
#include <iostream>
#include <unordered_set>
#include <chrono>

int main() {
    // 生成随机 UUID（v4）
    atom::extra::boost::UUID uuid1;
    std::cout << "Random UUID: " << uuid1.toString() << std::endl;

    // 从字符串创建 UUID
    atom::extra::boost::UUID uuid2("123e4567-e89b-12d3-a456-426614174000");
    std::cout << "UUID from string: " << uuid2.toString() << std::endl;

    // 生成 v1（基于时间）UUID
    atom::extra::boost::UUID uuid3 = atom::extra::boost::UUID::v1();
    std::cout << "V1 UUID: " << uuid3.toString() << std::endl;

    // 从 v1 UUID 获取时间戳
    auto timestamp = uuid3.getTimestamp();
    std::cout << "V1 UUID timestamp: " << std::chrono::system_clock::to_time_t(timestamp) << std::endl;

    // 生成 v3 和 v5 UUID
    atom::extra::boost::UUID namespace_uuid = atom::extra::boost::UUID::namespaceURL();
    atom::extra::boost::UUID uuid4 = atom::extra::boost::UUID::v3(namespace_uuid, "example.com");
    atom::extra::boost::UUID uuid5 = atom::extra::boost::UUID::v5(namespace_uuid, "example.com");
    std::cout << "V3 UUID: " << uuid4.toString() << std::endl;
    std::cout << "V5 UUID: " << uuid5.toString() << std::endl;

    // 将 UUID 转换为不同格式
    std::cout << "UUID as bytes: ";
    for (auto byte : uuid1.toBytes()) {
        std::cout << std::hex << static_cast<int>(byte) << " ";
    }
    std::cout << std::dec << std::endl;

    std::cout << "UUID as uint64: " << uuid1.toUint64() << std::endl;
    std::cout << "UUID as Base64: " << uuid1.toBase64() << std::endl;

    // 检查 UUID 属性
    std::cout << "UUID version: " << uuid1.version() << std::endl;
    std::cout << "UUID variant: " << uuid1.variant() << std::endl;

    // 比较 UUID
    if (uuid1 < uuid2) {
        std::cout << "uuid1 is less than uuid2" << std::endl;
    }

    // 在标准容器中使用 UUID
    std::unordered_set<atom::extra::boost::UUID> uuid_set;
    uuid_set.insert(uuid1);
    uuid_set.insert(uuid2);
    std::cout << "UUID set size: " << uuid_set.size() << std::endl;

    // 格式化 UUID
    std::cout << "Formatted UUID: " << uuid1.format() << std::endl;

    // 检查 UUID 是否为 nil
    atom::extra::boost::UUID nil_uuid("00000000-0000-0000-0000-000000000000");
    std::cout << "Is nil UUID nil? " << (nil_uuid.isNil() ? "Yes" : "No") << std::endl;

    return 0;
}
```

此示例演示了 `UUID` 类的以下功能：

1. 生成随机 (v4) UUID
2. 从字符串创建 UUID
3. 生成基于时间 (v1) UUID 并检索其时间戳
4. 生成基于名称的 (v3 和 v5) UUID
5. 将 UUID 转换为不同格式（字节、uint64、Base64）
6. 检查 UUID 属性（版本和变体）
7. 比较 UUID
8. 在标准容器（如 `std::unordered_set`）中使用 UUID
9. 格式化 UUID
10. 检查 UUID 是否为 nil

## 最佳实践

在使用 `UUID` 类时，请考虑以下最佳实践：

1. 根据用例使用适当的 UUID 版本：

   - 使用 V1 生成基于时间的 UUID
   - 使用 V3 或 V5 生成基于名称的 UUID（优先使用 V5 以提高碰撞抵抗力）
   - 使用 V4 生成随机 UUID

2. 生成基于名称的 UUID（V3 或 V5）时，使用适当的命名空间 UUID（DNS、URL 或 OID）。

3. 从字符串或字节创建 UUID 时，始终检查错误以确保输入有效。

4. 在必要时使用 `isNil()` 方法检查 nil UUID。

5. 在使用 V1 UUID 时，请记住时间戳基于生成 UUID 的时间，而不是当前时间。

6. 当需要以标准格式（例如，在日志或用户界面中）显示 UUID 时，使用 `format()` 方法。

7. 利用比较运算符和哈希函数支持，以高效地在排序容器或基于哈希的容器中使用 UUID。
