---
title: 注册表操作
description: 详细文档，介绍用于操作Windows注册表的函数，包括获取子键和值、修改值、删除键和值、递归枚举、备份、搜索和导出操作。
---

## getRegistrySubKeys

获取指定注册表键下的所有子键名称。

```cpp
bool getRegistrySubKeys(HKEY hRootKey, const std::string &subKey,
                        std::vector<std::string> &subKeys);
```

```cpp
std::vector<std::string> subKeys;
if (getRegistrySubKeys(HKEY_LOCAL_MACHINE, "SOFTWARE\\Microsoft", subKeys)) {
    for (const auto &key : subKeys) {
        std::cout << key << std::endl;
    }
}
```

## getRegistryValues

获取指定注册表键下的所有值名称和数据。

```cpp
bool getRegistryValues(
    HKEY hRootKey, const std::string &subKey,
    std::vector<std::pair<std::string, std::string>> &values);
```

```cpp
std::vector<std::pair<std::string, std::string>> values;
if (getRegistryValues(HKEY_CURRENT_USER, "Software\\Classes", values)) {
    for (const auto &value : values) {
        std::cout << value.first << ": " << value.second << std::endl;
    }
}
```

## modifyRegistryValue

修改指定注册表键下值的数据。

```cpp
bool modifyRegistryValue(HKEY hRootKey, const std::string &subKey,
                         const std::string &valueName,
                         const std::string &newValue);
```

```cpp
if (modifyRegistryValue(HKEY_CURRENT_USER, "Control Panel\\Desktop", "Wallpaper", "new_wallpaper.jpg")) {
    std::cout << "值修改成功。" << std::endl;
}
```

## deleteRegistrySubKey

删除指定的注册表键及其所有子键。

```cpp
bool deleteRegistrySubKey(HKEY hRootKey, const std::string &subKey);
```

```cpp
if (deleteRegistrySubKey(HKEY_LOCAL_MACHINE, "SOFTWARE\\MyApp")) {
    std::cout << "键及子键删除成功。" << std::endl;
}
```

## deleteRegistryValue

删除指定注册表键下的值。

```cpp
bool deleteRegistryValue(HKEY hRootKey, const std::string &subKey,
                         const std::string &valueName);
```

```cpp
if (deleteRegistryValue(HKEY_CURRENT_USER, "Software\\MyApp", "Setting")) {
    std::cout << "值删除成功。" << std::endl;
}
```

## recursivelyEnumerateRegistrySubKeys

递归枚举指定注册表键下的所有子键和值。

```cpp
void recursivelyEnumerateRegistrySubKeys(HKEY hRootKey, const std::string &subKey);
```

### 特别说明

此函数将输出指定键下的所有子键和值。

## backupRegistry

备份指定的注册表键及其所有子键和值。

```cpp
bool backupRegistry(HKEY hRootKey, const std::string &subKey,
                    const std::string &backupFilePath);
```

```cpp
if (backupRegistry(HKEY_LOCAL_MACHINE, "SOFTWARE\\MyApp", "C:\\backup\\myapp_backup.reg")) {
    std::cout << "注册表备份成功。" << std::endl;
}
```

## findRegistryKey

递归搜索注册表键下包含指定字符串的子键名称。

```cpp
void findRegistryKey(HKEY hRootKey, const std::string &subKey,
                     const std::string &searchKey);
```

```cpp
findRegistryKey(HKEY_CURRENT_USER, "Software", "Microsoft");
```

## findRegistryValue

递归搜索注册表键下包含指定字符串的值名称和数据。

```cpp
void findRegistryValue(HKEY hRootKey, const std::string &subKey,
                       const std::string &searchValue);
```

```cpp
findRegistryValue(HKEY_LOCAL_MACHINE, "SOFTWARE\\Microsoft", "Version");
```

## exportRegistry

将指定注册表键及其所有子键和值导出到.reg文件。

```cpp
bool exportRegistry(HKEY hRootKey, const std::string &subKey,
                    const std::string &exportFilePath);
```

```cpp
if (exportRegistry(HKEY_CURRENT_USER, "Software\\MyApp", "C:\\exports\\myapp_export.reg")) {
    std::cout << "注册表导出成功。" << std::endl;
}
```