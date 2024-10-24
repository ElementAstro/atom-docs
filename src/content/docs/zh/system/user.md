---
title: 用户信息库文档
description: 用户信息库的全面文档，包括检索用户组、用户名、主机名、用户 ID、组 ID、主目录和登录 shell 的函数。
---

# 用户信息库文档

## 函数: GetUserGroups

- 检索与当前用户相关联的用户组。

- 返回一个包含用户组的宽字符串向量。

```cpp
std::vector<std::wstring> userGroups = GetUserGroups();
// 预期输出: {"group1", "group2", "group3"}
```

## 函数: getUsername

- 检索当前用户的用户名。

- 返回用户名的字符串。

```cpp
std::string username = getUsername();
// 预期输出: "john_doe"
```

## 函数: getHostname

- 检索系统的主机名。

- 返回主机名的字符串。

```cpp
std::string hostname = getHostname();
// 预期输出: "mycomputer"
```

## 函数: getUserId

- 检索当前用户的用户 ID。

- 返回用户 ID 的整数值。

```cpp
int userId = getUserId();
// 预期输出: 1001
```

## 函数: getGroupId

- 检索当前用户的组 ID。

- 返回组 ID 的整数值。

```cpp
int groupId = getGroupId();
// 预期输出: 1001
```

## 函数: getHomeDirectory

- 检索用户的主目录。

- 返回用户的主目录字符串。

```cpp
std::string homeDirectory = getHomeDirectory();
// 预期输出: "/home/john_doe"
```

## 函数: getLoginShell

- 检索用户的登录 shell。

- 返回登录 shell 的字符串。

```cpp
std::string loginShell = getLoginShell();
// 预期输出: "/bin/bash"
```