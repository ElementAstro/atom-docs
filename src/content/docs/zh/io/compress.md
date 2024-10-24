---
title: 压缩和 ZIP 操作
description: 详细文档，介绍 atom::io 命名空间中的文件压缩、解压缩和 ZIP 文件操作，包括函数、方法和使用示例。
---

## 目录

1. [介绍](#介绍)
2. [文件压缩和解压缩](#文件压缩和解压缩)
   - [compressFile](#compressfile)
   - [decompressFile](#decompressfile)
   - [compressFolder](#compressfolder)
3. [ZIP 文件操作](#zip-文件操作)
   - [extractZip](#extractzip)
   - [createZip](#createzip)
   - [listFilesInZip](#listfilesinzip)
   - [fileExistsInZip](#fileexistsinzip)
   - [removeFileFromZip](#removefilefromzip)
   - [getZipFileSize](#getzipfilesize)
4. [使用示例](#使用示例)
5. [最佳实践](#最佳实践)

## 介绍

`atom::io` 命名空间提供了一组用于文件压缩、解压缩和 ZIP 文件操作的函数。这些函数使您能够轻松压缩和解压缩单个文件、压缩文件夹，并执行各种 ZIP 文件操作。

## 文件压缩和解压缩

### compressFile

```cpp
auto compressFile(std::string_view file_name, std::string_view output_folder) -> bool;
```

压缩单个文件。

- **参数：**
  - `file_name`：要压缩的文件的名称（包括路径）。
  - `output_folder`：压缩文件将保存的文件夹。
- **返回：** 如果压缩成功，则返回 `true`，否则返回 `false`。

**注意**：如果文件名已经包含 `.gz` 后缀，则不会再次压缩。

### decompressFile

```cpp
auto decompressFile(std::string_view file_name, std::string_view output_folder) -> bool;
```

解压缩单个文件。

- **参数：**
  - `file_name`：要解压缩的文件的名称（包括路径）。
  - `output_folder`：解压缩的文件将保存的文件夹。
- **返回：** 如果解压缩成功，则返回 `true`，否则返回 `false`。

**注意**：如果文件名不包含 `.gz` 后缀，则不会被解压缩。

### compressFolder

```cpp
auto compressFolder(const char *folder_name) -> bool;
```

压缩指定目录中的所有文件。

- **参数：**
  - `folder_name`：要压缩的文件夹的名称（绝对路径）。
- **返回：** 如果压缩成功，则返回 `true`，否则返回 `false`。

**注意**：压缩的文件将保存在原目录中，子目录中的文件不会被压缩。

## ZIP 文件操作

### extractZip

```cpp
auto extractZip(std::string_view zip_file, std::string_view destination_folder) -> bool;
```

提取单个 ZIP 文件。

- **参数：**
  - `zip_file`：要提取的 ZIP 文件的名称（包括路径）。
  - `destination_folder`：提取文件将保存的路径。
- **返回：** 如果提取成功，则返回 `true`，否则返回 `false`。

**注意**：如果指定的路径不存在，函数将尝试创建它。

### createZip

```cpp
auto createZip(std::string_view source_folder, std::string_view zip_file, int compression_level = -1) -> bool;
```

从文件夹创建 ZIP 文件。

- **参数：**
  - `source_folder`：要压缩的文件夹的名称（包括路径）。
  - `zip_file`：生成的 ZIP 文件的名称（包括路径）。
  - `compression_level`：压缩级别（可选，默认值为 -1，表示使用默认级别）。
- **返回：** 如果创建成功，则返回 `true`，否则返回 `false`。

### listFilesInZip

```cpp
auto listFilesInZip(std::string_view zip_file) -> std::vector<std::string>;
```

列出 ZIP 文件中的文件。

- **参数：**
  - `zip_file`：ZIP 文件的名称（包括路径）。
- **返回：** 包含 ZIP 文件中所有文件名称的向量。

### fileExistsInZip

```cpp
auto fileExistsInZip(std::string_view zip_file, std::string_view file_name) -> bool;
```

检查指定文件是否存在于 ZIP 文件中。

- **参数：**
  - `zip_file`：ZIP 文件的名称（包括路径）。
  - `file_name`：要检查的文件名称。
- **返回：** 如果文件存在于 ZIP 中，则返回 `true`，否则返回 `false`。

### removeFileFromZip

```cpp
auto removeFileFromZip(std::string_view zip_file, std::string_view file_name) -> bool;
```

从 ZIP 文件中删除指定文件。

- **参数：**
  - `zip_file`：ZIP 文件的名称（包括路径）。
  - `file_name`：要删除的文件名称。
- **返回：** 如果删除成功，则返回 `true`，否则返回 `false`。

### getZipFileSize

```cpp
auto getZipFileSize(std::string_view zip_file) -> size_t;
```

获取 ZIP 文件的大小。

- **参数：**
  - `zip_file`：ZIP 文件的名称（包括路径）。
- **返回：** ZIP 文件的字节大小。

## 使用示例

以下示例演示了如何使用这些函数：

### 压缩和解压缩文件

```cpp
#include "compress.hpp"
#include <iostream>

int main() {
    // 压缩文件
    if (atom::io::compressFile("example.txt", "/output/folder")) {
        std::cout << "文件压缩成功。" << std::endl;
    } else {
        std::cout << "压缩文件失败。" << std::endl;
    }

    // 解压缩文件
    if (atom::io::decompressFile("/output/folder/example.txt.gz", "/decompressed/folder")) {
        std::cout << "文件解压缩成功。" << std::endl;
    } else {
        std::cout << "解压缩文件失败。" << std::endl;
    }

    // 压缩文件夹
    if (atom::io::compressFolder("/path/to/folder")) {
        std::cout << "文件夹压缩成功。" << std::endl;
    } else {
        std::cout << "压缩文件夹失败。" << std::endl;
    }

    return 0;
}
```

### 处理 ZIP 文件

```cpp
#include "compress.hpp"
#include <iostream>

int main() {
    // 创建 ZIP 文件
    if (atom::io::createZip("/source/folder", "archive.zip")) {
        std::cout << "ZIP 文件创建成功。" << std::endl;
    } else {
        std::cout << "创建 ZIP 文件失败。" << std::endl;
    }

    // 列出 ZIP 文件中的文件
    auto files = atom::io::listFilesInZip("archive.zip");
    std::cout << "ZIP 中的文件:" << std::endl;
    for (const auto& file : files) {
        std::cout << "- " << file << std::endl;
    }

    // 检查 ZIP 中是否存在文件
    if (atom::io::fileExistsInZip("archive.zip", "example.txt")) {
        std::cout << "文件存在于 ZIP 中。" << std::endl;
    } else {
        std::cout << "文件不存在于 ZIP 中。" << std::endl;
    }

    // 从 ZIP 中删除文件
    if (atom::io::removeFileFromZip("archive.zip", "example.txt")) {
        std::cout << "文件从 ZIP 中删除成功。" << std::endl;
    } else {
        std::cout << "从 ZIP 中删除文件失败。" << std::endl;
    }

    // 获取 ZIP 文件大小
    size_t size = atom::io::getZipFileSize("archive.zip");
    std::cout << "ZIP 文件大小: " << size << " 字节" << std::endl;

    // 解压 ZIP 文件
    if (atom::io::extractZip("archive.zip", "/extracted/folder")) {
        std::cout << "ZIP 文件解压成功。" << std::endl;
    } else {
        std::cout << "解压 ZIP 文件失败。" << std::endl;
    }

    return 0;
}
```

## 最佳实践

在使用 `atom::io` 命名空间提供的压缩和 ZIP 函数时，请考虑以下最佳实践：

1. **错误处理**：始终检查函数的返回值，以确保操作成功。优雅地处理潜在的失败。

2. **路径处理**：尽可能使用绝对路径，以避免歧义，特别是在处理不同目录时。

3. **大文件**：在处理大文件时，考虑使用异步 I/O 操作或分块处理，以避免阻塞主线程。

4. **压缩级别**：在创建 ZIP 文件时，尝试不同的压缩级别，以找到文件大小和压缩时间之间的最佳平衡。

5. **文件命名**：在压缩或解压缩文件时，要小心文件名，确保生成的文件名有效，并且不会意外覆盖现有文件。

6. **安全性**：在提取 ZIP 文件时，要注意潜在的安全风险，如路径遍历攻击。在提取之前验证和清理文件路径。

7. **资源管理**：在使用后关闭任何打开的文件句柄或资源，特别是在处理大量文件或在长时间运行的应用程序中。
