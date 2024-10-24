---
title: 密码管理器类文档
description: 密码管理器类的全面文档，包括使用AES加密和平台特定的安全存储机制进行安全密码存储、检索和删除的方法。
---

## 目录

1. [AESCipher 类](#aescipher-class)
2. [PasswordManager 类](#passwordmanager-class)
3. [使用示例](#usage-examples)
4. [平台特定的实现细节](#platform-specific-implementation-details)
5. [最佳实践](#best-practices)

## AESCipher 类

`AESCipher` 类提供了用于使用 AES 加密加密和解密字符串的静态方法。

```cpp
class AESCipher {
public:
    static std::string encrypt(const std::string& plaintext, const unsigned char* key);
    static std::string decrypt(const std::string& ciphertext, const unsigned char* key);
};
```

### 方法

1. `encrypt`: 使用提供的密钥加密明文字符串。
2. `decrypt`: 使用提供的密钥解密密文字符串。

## PasswordManager 类

`PasswordManager` 类管理密码的存储、检索和删除，使用平台特定的安全存储机制。

```cpp
class PasswordManager {
public:
    PasswordManager();
    void storePassword(const std::string& platformKey, const std::string& password);
    std::string retrievePassword(const std::string& platformKey);
    void deletePassword(const std::string& platformKey);
};
```

### 构造函数

```cpp
PasswordManager();
```

初始化一个新的 `PasswordManager` 实例，生成一个安全的加密密钥。

### 方法

1. `storePassword`: 为给定的平台密钥存储加密密码。
2. `retrievePassword`: 检索并解密给定平台密钥的密码。
3. `deletePassword`: 删除给定平台密钥的存储密码。

## 使用示例

以下是如何使用 `PasswordManager` 类的示例：

```cpp
#include "password.h"
#include <iostream>

int main() {
    PasswordManager pm;

    // 存储密码
    pm.storePassword("example.com", "mySecurePassword123");
    std::cout << "为 example.com 存储的密码" << std::endl;

    // 检索密码
    std::string retrievedPassword = pm.retrievePassword("example.com");
    std::cout << "为 example.com 检索的密码: " << retrievedPassword << std::endl;

    // 删除密码
    pm.deletePassword("example.com");
    std::cout << "为 example.com 删除的密码" << std::endl;

    // 尝试检索已删除的密码
    try {
        std::string deletedPassword = pm.retrievePassword("example.com");
    } catch (const std::exception& e) {
        std::cout << "错误: " << e.what() << std::endl;
    }

    return 0;
}
```

## 平台特定的实现细节

`PasswordManager` 类根据操作系统使用不同的安全存储机制：

### Windows

在 Windows 上，该类使用 Windows 凭据管理器：

```cpp
void storeToWindowsCredentialManager(const std::string& target, const std::string& encryptedPassword);
std::string retrieveFromWindowsCredentialManager(const std::string& target);
void deleteFromWindowsCredentialManager(const std::string& target);
```

### macOS

在 macOS 上，该类使用钥匙串：

```cpp
void storeToMacKeychain(const std::string& service, const std::string& account, const std::string& encryptedPassword);
std::string retrieveFromMacKeychain(const std::string& service, const std::string& account);
void deleteFromMacKeychain(const std::string& service, const std::string& account);
```

### Linux

在 Linux 上，该类使用 GNOME 密钥环：

```cpp
void storeToLinuxKeyring(const std::string& schema_name, const std::string& attribute_name, const std::string& encryptedPassword);
std::string retrieveFromLinuxKeyring(const std::string& schema_name, const std::string& attribute_name);
void deleteFromLinuxKeyring(const std::string& schema_name, const std::string& attribute_name);
```

## 最佳实践

1. **安全密钥管理**: `PasswordManager` 类使用 16 字节的密钥进行 AES 加密。确保安全生成和存储此密钥。

2. **平台特定的考虑**: 在跨不同操作系统部署应用程序时，注意平台特定的实现。

3. **错误处理**: 对密码存储、检索或删除可能失败的情况实施适当的错误处理。

4. **内存管理**: 在内存中处理敏感信息时要谨慎。考虑在处理密码时使用安全内存分配和清除技术。

5. **定期更新**: 保持 `PasswordManager` 类更新，以符合最新的安全实践和平台特定 API 的任何更改。

6. **用户认证**: 考虑在允许访问存储的密码之前实施用户认证。

7. **日志记录**: 实施安全的日志记录实践，避免记录敏感信息，如密码或加密密钥。

8. **测试**: 在所有支持的平台上彻底测试 `PasswordManager` 类，以确保一致的行为。

9. **合规性**: 确保您的密码管理实践符合相关的数据保护法规和行业标准。

10. **备份和恢复**: 实施安全的备份和恢复机制，以防止存储的密码丢失或损坏。
