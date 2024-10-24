---
title: Windows注册表操作
description: 用户信息库的全面文档，包括检索用户组、用户名、主机名、用户 ID、组 ID、主目录和登录 shell 的函数。
---

## 概述

本文件介绍了一组用于与 Windows 注册表交互的函数。这些函数属于 `atom::system` 命名空间，提供查询、修改和删除注册表键和值的功能，以及更高级的操作，如递归枚举、备份和导出。

## 重要说明

这些函数专门用于 Windows 系统，仅在为 Windows 编译时可用（即，当定义了 `_WIN32` 时）。

## 函数定义

### 获取注册表子键

```cpp
[[nodiscard]] auto getRegistrySubKeys(HKEY hRootKey, std::string_view subKey,
                                      std::vector<std::string>& subKeys) -> bool;
```

检索指定注册表键下的所有子键名称。

- **参数:**
  - `hRootKey`: 根键的句柄。
  - `subKey`: 指定键的名称，可以包含多个用反斜杠分隔的嵌套键。
  - `subKeys`: 用于存储子键名称的字符串向量。
- **返回:** 成功返回 `true`，否则返回 `false`。

### 获取注册表值

```cpp
[[nodiscard]] auto getRegistryValues(
    HKEY hRootKey, std::string_view subKey,
    std::vector<std::pair<std::string, std::string>>& values) -> bool;
```

检索指定注册表键下的所有值名称和数据。

- **参数:**
  - `hRootKey`: 根键的句柄。
  - `subKey`: 指定键的名称，可以包含多个用反斜杠分隔的嵌套键。
  - `values`: 用于存储值名称和数据的字符串对向量。
- **返回:** 成功返回 `true`，否则返回 `false`。

### 修改注册表值

```cpp
[[nodiscard]] auto modifyRegistryValue(HKEY hRootKey, std::string_view subKey,
                                       std::string_view valueName,
                                       std::string_view newValue) -> bool;
```

修改指定注册表键下指定值的数据。

- **参数:**
  - `hRootKey`: 根键的句柄。
  - `subKey`: 指定键的名称，可以包含多个用反斜杠分隔的嵌套键。
  - `valueName`: 要修改的值的名称。
  - `newValue`: 值的新数据。
- **返回:** 成功返回 `true`，否则返回 `false`。

### 删除注册表子键

```cpp
[[nodiscard]] auto deleteRegistrySubKey(HKEY hRootKey,
                                        std::string_view subKey) -> bool;
```

删除指定的注册表键及其所有子键。

- **参数:**
  - `hRootKey`: 根键的句柄。
  - `subKey`: 要删除的键的名称，可以包含多个用反斜杠分隔的嵌套键。
- **返回:** 成功返回 `true`，否则返回 `false`。

### 删除注册表值

```cpp
[[nodiscard]] auto deleteRegistryValue(HKEY hRootKey, std::string_view subKey,
                                       std::string_view valueName) -> bool;
```

删除指定注册表键下的指定值。

- **参数:**
  - `hRootKey`: 根键的句柄。
  - `subKey`: 指定键的名称，可以包含多个用反斜杠分隔的嵌套键。
  - `valueName`: 要删除的值的名称。
- **返回:** 成功返回 `true`，否则返回 `false`。

### 递归枚举注册表子键

```cpp
void recursivelyEnumerateRegistrySubKeys(HKEY hRootKey,
                                         std::string_view subKey);
```

递归枚举指定注册表键下的所有子键和值。

- **参数:**
  - `hRootKey`: 根键的句柄。
  - `subKey`: 指定键的名称，可以包含多个用反斜杠分隔的嵌套键。

### 备份注册表

```cpp
[[nodiscard]] auto backupRegistry(HKEY hRootKey, std::string_view subKey,
                                  std::string_view backupFilePath) -> bool;
```

备份指定的注册表键及其所有子键和值。

- **参数:**
  - `hRootKey`: 根键的句柄。
  - `subKey`: 要备份的键的名称，可以包含多个用反斜杠分隔的嵌套键。
  - `backupFilePath`: 备份文件的完整路径。
- **返回:** 成功返回 `true`，否则返回 `false`。

### 查找注册表键

```cpp
void findRegistryKey(HKEY hRootKey, std::string_view subKey,
                     std::string_view searchKey);
```

递归搜索指定注册表键下包含指定字符串的子键名称。

- **参数:**
  - `hRootKey`: 根键的句柄。
  - `subKey`: 指定键的名称，可以包含多个用反斜杠分隔的嵌套键。
  - `searchKey`: 要在子键名称中搜索的字符串。

### 查找注册表值

```cpp
void findRegistryValue(HKEY hRootKey, std::string_view subKey,
                       std::string_view searchValue);
```

递归搜索指定注册表键下包含指定字符串的值名称和数据。

- **参数:**
  - `hRootKey`: 根键的句柄。
  - `subKey`: 指定键的名称，可以包含多个用反斜杠分隔的嵌套键。
  - `searchValue`: 要在值名称和数据中搜索的字符串。

### 导出注册表

```cpp
[[nodiscard]] auto exportRegistry(HKEY hRootKey, std::string_view subKey,
                                  std::string_view exportFilePath) -> bool;
```

将指定注册表键及其所有子键和值导出到 REG 文件。

- **参数:**
  - `hRootKey`: 根键的句柄。
  - `subKey`: 要导出的键的名称，可以包含多个用反斜杠分隔的嵌套键。
  - `exportFilePath`: 导出文件的完整路径。
- **返回:** 成功返回 `true`，否则返回 `false`。

## 使用示例

### 示例 1：检索和修改注册表值

```cpp
#include "wregistry.hpp"
#include <iostream>
#include <vector>
#include <windows.h>

int main() {
    std::vector<std::pair<std::string, std::string>> values;

    if (atom::system::getRegistryValues(HKEY_LOCAL_MACHINE, "SOFTWARE\\Microsoft\\Windows\\CurrentVersion", values)) {
        for (const auto& [name, data] : values) {
            std::cout << "名称: " << name << ", 数据: " << data << std::endl;
        }
    }

    if (atom::system::modifyRegistryValue(HKEY_CURRENT_USER, "Software\\MyApp", "LastRun", "2023-06-17")) {
        std::cout << "注册表值修改成功。" << std::endl;
    }

    return 0;
}
```

### 示例 2：递归枚举和搜索

```cpp
#include "wregistry.hpp"
#include <windows.h>

int main() {
    atom::system::recursivelyEnumerateRegistrySubKeys(HKEY_LOCAL_MACHINE, "SOFTWARE");

    atom::system::findRegistryKey(HKEY_LOCAL_MACHINE, "SOFTWARE", "Microsoft");
    atom::system::findRegistryValue(HKEY_LOCAL_MACHINE, "SOFTWARE", "Version");

    return 0;
}
```

### 示例 3：备份和导出注册表

```cpp
#include "wregistry.hpp"
#include <iostream>
#include <windows.h>

int main() {
    if (atom::system::backupRegistry(HKEY_LOCAL_MACHINE, "SOFTWARE\\Microsoft", "C:\\backup.reg")) {
        std::cout << "注册表备份成功创建。" << std::endl;
    }

    if (atom::system::exportRegistry(HKEY_LOCAL_MACHINE, "SOFTWARE\\Microsoft", "C:\\export.reg")) {
        std::cout << "注册表键导出成功。" << std::endl;
    }

    return 0;
}
```

## 重要注意事项

1. **管理员权限**：许多注册表操作，特别是涉及 HKEY_LOCAL_MACHINE 的操作，需要管理员权限。确保您的应用程序具有必要的权限。

2. **错误处理**：这些函数返回布尔值以指示成功或失败。在生产环境中，您应实现适当的错误处理和日志记录。

3. **字符串编码**：这些函数使用 `std::string_view`，这意味着使用 UTF-8 编码。在处理注册表键或值中的非 ASCII 字符时，请确保字符串文字正确编码。

4. **性能**：像 `recursivelyEnumerateRegistrySubKeys`、`findRegistryKey` 和 `findRegistryValue` 这样的递归操作在处理大型注册表层次结构时可能会耗时。请谨慎使用。

5. **修改前备份**：在进行更改之前，始终创建注册表或特定键的备份。`backupRegistry` 函数对此非常有用。

6. **安全隐患**：修改注册表可能对系统行为和稳定性产生重大影响。在使用修改或删除注册表键和值的函数时，请务必小心。

## 最佳实践

1. **最小权限**：尽可能使用 HKEY_CURRENT_USER 而不是 HKEY_LOCAL_MACHINE，以减少对提升权限的需求。

2. **错误检查**：始终检查这些函数的返回值，并优雅地处理潜在失败。

3. **有针对性的操作**：尽可能具体地指定子键路径，以最小化注册表操作的范围。

4. **清理**：如果您的应用程序创建了临时注册表项，请确保有逻辑在不再需要时清理它们。

5. **验证**：在修改注册表值时，验证您要写入的数据以确保其格式正确并在预期范围内。

6. **文档记录**：清楚记录您的应用程序使用、修改或依赖的注册表键和值。
