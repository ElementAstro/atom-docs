---
title: 异步压缩和解压缩库
description: 详细文档，介绍异步压缩和解压缩库，包括用于压缩和解压缩文件及目录的类、ZIP 文件操作和使用示例。
---

## 目录

1. [介绍](#介绍)
2. [压缩类](#压缩类)
   - [BaseCompressor](#basecompressor)
   - [SingleFileCompressor](#singlefilecompressor)
   - [DirectoryCompressor](#directorycompressor)
3. [解压缩类](#解压缩类)
   - [BaseDecompressor](#basedecompressor)
   - [SingleFileDecompressor](#singlefiledecompressor)
   - [DirectoryDecompressor](#directorydecompressor)
4. [ZIP 操作](#zip-操作)
   - [ListFilesInZip](#listfilesinzip)
   - [FileExistsInZip](#fileexistsinzip)
   - [RemoveFileFromZip](#removefilefromzip)
   - [GetZipFileSize](#getzipfilesize)
5. [使用示例](#使用示例)
6. [最佳实践](#最佳实践)

## 介绍

此库提供了使用 ASIO 库进行 I/O 操作和 zlib 进行压缩的异步压缩和解压缩功能。它支持对单个文件和目录进行压缩和解压缩，以及各种 ZIP 文件操作。

## 压缩类

### BaseCompressor

压缩操作的抽象基类。

#### 关键方法：

- `BaseCompressor(asio::io_context& io_context, const fs::path& output_file)`
- `virtual void start() = 0`

### SingleFileCompressor

异步压缩单个文件。

#### 关键方法：

- `SingleFileCompressor(asio::io_context& io_context, const fs::path& input_file, const fs::path& output_file)`
- `void start() override`

### DirectoryCompressor

异步压缩整个目录。

#### 关键方法：

- `DirectoryCompressor(asio::io_context& io_context, fs::path input_dir, const fs::path& output_file)`
- `void start() override`

## 解压缩类

### BaseDecompressor

解压缩操作的抽象基类。

#### 关键方法：

- `explicit BaseDecompressor(asio::io_context& io_context)`
- `virtual void start() = 0`

### SingleFileDecompressor

异步解压缩单个文件。

#### 关键方法：

- `SingleFileDecompressor(asio::io_context& io_context, fs::path input_file, fs::path output_folder)`
- `void start() override`

### DirectoryDecompressor

异步解压缩目录中的多个文件。

#### 关键方法：

- `DirectoryDecompressor(asio::io_context& io_context, const fs::path& input_dir, const fs::path& output_folder)`
- `void start() override`

## ZIP 操作

### ListFilesInZip

列出 ZIP 存档中的文件。

#### 关键方法：

- `ListFilesInZip(asio::io_context& io_context, std::string_view zip_file)`
- `void start() override`
- `[[nodiscard]] auto getFileList() const -> std::vector<std::string>`

### FileExistsInZip

检查文件是否存在于 ZIP 存档中。

#### 关键方法：

- `FileExistsInZip(asio::io_context& io_context, std::string_view zip_file, std::string_view file_name)`
- `void start() override`
- `[[nodiscard]] auto found() const -> bool`

### RemoveFileFromZip

从 ZIP 存档中删除文件。

#### 关键方法：

- `RemoveFileFromZip(asio::io_context& io_context, std::string_view zip_file, std::string_view file_name)`
- `void start() override`
- `[[nodiscard]] auto isSuccessful() const -> bool`

### GetZipFileSize

获取 ZIP 文件的大小。

#### 关键方法：

- `GetZipFileSize(asio::io_context& io_context, std::string_view zip_file)`
- `void start() override`
- `[[nodiscard]] auto getSizeValue() const -> size_t`

## 使用示例

### 压缩单个文件

```cpp
#include "async_compress.hpp"
#include <asio.hpp>
#include <iostream>

int main() {
    asio::io_context io_context;

    atom::async::io::SingleFileCompressor compressor(
        io_context,
        "input.txt",
        "output.gz"
    );

    compressor.start();

    io_context.run();

    std::cout << "压缩完成。" << std::endl;

    return 0;
}
```

### 压缩目录

```cpp
#include "async_compress.hpp"
#include <asio.hpp>
#include <iostream>

int main() {
    asio::io_context io_context;

    atom::async::io::DirectoryCompressor compressor(
        io_context,
        "input_directory",
        "output_archive.gz"
    );

    compressor.start();

    io_context.run();

    std::cout << "目录压缩完成。" << std::endl;

    return 0;
}
```

### 解压缩单个文件

```cpp
#include "async_compress.hpp"
#include <asio.hpp>
#include <iostream>

int main() {
    asio::io_context io_context;

    atom::async::io::SingleFileDecompressor decompressor(
        io_context,
        "input.gz",
        "output_directory"
    );

    decompressor.start();

    io_context.run();

    std::cout << "解压缩完成。" << std::endl;

    return 0;
}
```

### 列出 ZIP 存档中的文件

```cpp
#include "async_compress.hpp"
#include <asio.hpp>
#include <iostream>

int main() {
    asio::io_context io_context;

    atom::async::io::ListFilesInZip list_files(
        io_context,
        "archive.zip"
    );

    list_files.start();

    io_context.run();

    for (const auto& file : list_files.getFileList()) {
        std::cout << file << std::endl;
    }

    return 0;
}
```

### 检查 ZIP 存档中是否存在文件

```cpp
#include "async_compress.hpp"
#include <asio.hpp>
#include <iostream>

int main() {
    asio::io_context io_context;

    atom::async::io::FileExistsInZip file_exists(
        io_context,
        "archive.zip",
        "file_to_check.txt"
    );

    file_exists.start();

    io_context.run();

    if (file_exists.found()) {
        std::cout << "文件存在于存档中。" << std::endl;
    } else {
        std::cout << "文件不存在于存档中。" << std::endl;
    }

    return 0;
}
```

## 最佳实践

1. **异步操作**：确保在使用异步操作时正确管理 `asio::io_context` 的生命周期。

2. **错误处理**：在压缩和解压缩过程中，务必处理可能的错误和异常，确保程序的健壮性。

3. **资源管理**：注意在压缩和解压缩过程中对文件和目录的资源管理，确保在操作完成后正确释放资源。

4. **性能考虑**：对于大文件或大量文件的压缩和解压缩，考虑使用适当的缓冲区和线程池来提高性能。

5. **测试和验证**：在生产环境中使用之前，确保充分测试压缩和解压缩功能，以验证其正确性和性能。
