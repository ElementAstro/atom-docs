---
title: 进程管理库文档
description: 进程管理库的全面文档，包括 ProcessInfo 结构体和检查软件安装、文件存在性、用户权限、系统关机和重启、进程信息检索以及重复进程检测的函数。
---

# 进程管理库文档

## ProcessInfo 结构体

- 存储有关进程的信息。
- 属性：
  - `processID` (int): 进程 ID。
  - `parentProcessID` (int): 父进程 ID。
  - `basePriority` (int): 进程的基准优先级。
  - `executableFile` (std::string): 与进程相关联的可执行文件。

```cpp
ProcessInfo info;
info.processID = 12345;
info.parentProcessID = 6789;
info.basePriority = 10;
info.executableFile = "example.exe";
```

## 函数: CheckSoftwareInstalled

- 检查指定的软件是否已安装。

- **参数:**
  - `software_name` (const std::string&): 软件名称。

- **返回:** 如果软件已安装，则返回 `true`，否则返回 `false`。

```cpp
bool isInstalled = CheckSoftwareInstalled("Example Software");
// 预期输出: false
```

## 函数: checkExecutableFile

- 检查指定的文件是否存在。

- **参数:**
  - `fileName` (const std::string&): 文件名称。
  - `fileExt` (const std::string&): 文件扩展名。

- **返回:** 如果文件存在，则返回 `true`，否则返回 `false`。

## 函数: IsRoot

- 检查当前用户是否具有 root/管理员权限。

- **返回:** 如果用户具有 root/管理员权限，则返回 `true`，否则返回 `false`。

## 函数: GetCurrentUsername

- 检索当前用户名。

- **返回:** 当前用户名的字符串。

## 函数: Shutdown

- 关闭系统。

- **返回:** 如果系统成功关闭，则返回 `true`，如果发生错误，则返回 `false`。

## 函数: Reboot

- 重启系统。

- **返回:** 如果系统成功重启，则返回 `true`，如果发生错误，则返回 `false`。

## 函数: GetProcessInfo

- 检索进程信息和文件地址。

- **返回:** 包含进程信息和文件地址的键值对向量。

## 函数: CheckDuplicateProcess

- 检查具有相同程序名称的重复进程。

- **参数:**
  - `program_name` (const std::string&): 要检查重复的程序名称。

## 函数: isProcessRunning

- 检查指定的进程是否正在运行。

- **参数:**
  - `processName` (const std::string&): 要检查的进程名称。

- **返回:** 如果进程正在运行，则返回 `true`，否则返回 `false`。

## 函数: GetProcessDetails

- 检索详细的进程信息。

- **返回:** 包含进程详细信息的 ProcessInfo 结构体向量。

## 函数: GetProcessInfoByID (平台特定)

- 通过进程 ID 检索进程信息。

- **参数:**
  - `_WIN32: DWORD processID`, `!_WIN32: int processID`: 进程 ID。
  - `processInfo`: 用于存储检索到的信息的 ProcessInfo 结构体。

- **返回:** 如果成功检索到进程信息，则返回 `true`，如果发生错误，则返回 `false`。

## 函数: GetProcessInfoByName

- 通过进程名称检索进程信息。

- **参数:**
  - `processName` (const std::string&): 进程名称。
  - `processInfo`: 用于存储检索到的信息的 ProcessInfo 结构体。

- **返回:** 如果成功检索到进程信息，则返回 `true`，如果发生错误，则返回 `false`。
