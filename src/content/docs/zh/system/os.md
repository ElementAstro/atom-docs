---
title: C++ 系统实用函数文档
description: C++ 中系统实用函数的详细文档，包括 Utsname 结构体和用于目录遍历及文件信息检索的函数，如 walk、jwalk 和 fwalk。
---

## Utsname 结构体

表示有关操作系统的信息。

### 成员

- `sysname`: 操作系统名称
- `nodename`: 网络主机名称
- `release`: 操作系统发布版本
- `version`: 操作系统内部版本
- `machine`: 硬件标识符

## walk 函数

递归遍历一个目录及其子目录。

```cpp
void walk(const fs::path &root);
```

### 示例用法

```cpp
walk("/path/to/directory");
```

## jwalk 函数

递归遍历一个目录及其子目录，将文件信息作为 JSON 字符串返回。

```cpp
std::string jwalk(const std::string &root);
```

### 示例用法

```cpp
std::string jsonFiles = jwalk("/path/to/directory");
// 预期输出: 包含文件信息的 JSON 字符串。
```

## fwalk 函数

递归遍历一个目录及其子目录，对每个文件应用回调函数。

```cpp
void fwalk(const fs::path &root, const std::function<void(const fs::path &)> &callback);
```

### 示例用法

```cpp
fwalk("/path/to/directory", [](const fs::path &file) {
    // 对每个文件的自定义回调函数
});
```

## Environ 函数

以键值映射的形式检索环境变量。

```cpp
std::unordered_map<std::string, std::string> Environ();
```

### 示例用法

```cpp
auto envMap = Environ();
// 预期输出: 包含环境变量及其值的无序映射。
```

## ctermid 函数

返回控制终端的名称。

```cpp
std::string ctermid();
```

### 示例用法

```cpp
std::string termName = ctermid();
// 预期输出: 控制终端的名称。
```

## getpriority 函数

检索当前进程的优先级。

```cpp
int getpriority();
```

### 示例用法

```cpp
int priority = getpriority();
// 预期输出: 当前进程的优先级。
```

## getlogin 函数

检索用户的登录名。

```cpp
std::string getlogin();
```

### 示例用法

```cpp
std::string username = getlogin();
// 预期输出: 与进程关联的用户的登录名。
```

## uname 函数

检索操作系统名称及相关信息。

```cpp
Utsname uname();
```

### 示例用法

```cpp
Utsname systemInfo = uname();
// 访问各个字段，如 systemInfo.sysname、systemInfo.release 等。
```
