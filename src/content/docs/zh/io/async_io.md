---
title: AsyncFile 和 AsyncDirectory 类
description: 详细文档，介绍 atom::async::io 命名空间中的 AsyncFile 和 AsyncDirectory 类，包括构造函数、方法和异步文件及目录操作的使用示例。
---

## 目录

1. [介绍](#介绍)
2. [AsyncFile 类](#asyncfile-类)
   - [AsyncFile 构造函数](#asyncfile-构造函数)
   - [AsyncFile 方法](#asyncfile-方法)
   - [AsyncFile 使用示例](#asyncfile-使用示例)
3. [AsyncDirectory 类](#asyncdirectory-类)
   - [AsyncDirectory 构造函数](#asyncdirectory-构造函数)
   - [AsyncDirectory 方法](#asyncdirectory-方法)
   - [AsyncDirectory 使用示例](#asyncdirectory-使用示例)

## 介绍

`AsyncFile` 和 `AsyncDirectory` 类是 `atom::async::io` 命名空间的一部分，提供使用 ASIO 库的异步文件和目录操作。这些类允许在不阻塞主线程的情况下高效地执行 I/O 操作，这对于需要并发处理多个 I/O 操作的应用程序尤其有用。

## AsyncFile 类

`AsyncFile` 类提供多种异步文件操作，例如读取、写入、删除和复制文件。

### AsyncFile 构造函数

```cpp
explicit AsyncFile(asio::io_context& io_context);
```

使用提供的 ASIO I/O 上下文创建一个 `AsyncFile` 对象。

- `io_context`：引用 `asio::io_context` 对象，用于管理异步操作。

### AsyncFile 方法

1. **asyncRead**

   ```cpp
   void asyncRead(const std::string& filename,
                  const std::function<void(const std::string&)>& callback);
   ```

   异步读取文件内容。

2. **asyncWrite**

   ```cpp
   void asyncWrite(const std::string& filename, const std::string& content,
                   const std::function<void(bool)>& callback);
   ```

   异步写入内容到文件。

3. **asyncDelete**

   ```cpp
   void asyncDelete(const std::string& filename,
                    const std::function<void(bool)>& callback);
   ```

   异步删除文件。

4. **asyncCopy**

   ```cpp
   void asyncCopy(const std::string& src, const std::string& dest,
                  const std::function<void(bool)>& callback);
   ```

   异步复制文件。

5. **asyncReadWithTimeout**

   ```cpp
   void asyncReadWithTimeout(
       const std::string& filename, int timeoutMs,
       const std::function<void(const std::string&)>& callback);
   ```

   带超时的异步读取文件。

6. **asyncBatchRead**

   ```cpp
   void asyncBatchRead(
       const std::vector<std::string>& files,
       const std::function<void(const std::vector<std::string>&)>& callback);
   ```

   异步读取多个文件。

7. **asyncStat**

   ```cpp
   void asyncStat(
       const std::string& filename,
       const std::function<void(bool, std::uintmax_t, std::time_t)>& callback);
   ```

   异步获取文件统计信息。

8. **asyncMove**

   ```cpp
   void asyncMove(const std::string& src, const std::string& dest,
                  const std::function<void(bool)>& callback);
   ```

   异步移动文件。

9. **asyncChangePermissions**

   ```cpp
   void asyncChangePermissions(const std::string& filename,
                               std::filesystem::perms perms,
                               const std::function<void(bool)>& callback);
   ```

   异步更改文件权限。

10. **asyncCreateDirectory**

    ```cpp
    void asyncCreateDirectory(const std::string& path,
                              const std::function<void(bool)>& callback);
    ```

    异步创建目录。

11. **asyncExists**
    ```cpp
    void asyncExists(const std::string& filename,
                     const std::function<void(bool)>& callback);
    ```
    异步检查文件是否存在。

### AsyncFile 使用示例

```cpp
#include "async_io.hpp"
#include <asio.hpp>
#include <iostream>

int main() {
    asio::io_context io_context;
    atom::async::io::AsyncFile file(io_context);

    // 示例 1：读取文件
    file.asyncRead("example.txt", [](const std::string& content) {
        std::cout << "文件内容: " << content << std::endl;
    });

    // 示例 2：写入文件
    file.asyncWrite("output.txt", "Hello, World!", [](bool success) {
        if (success) {
            std::cout << "文件写入成功。" << std::endl;
        } else {
            std::cout << "写入文件失败。" << std::endl;
        }
    });

    // 示例 3：复制文件
    file.asyncCopy("source.txt", "destination.txt", [](bool success) {
        if (success) {
            std::cout << "文件复制成功。" << std::endl;
        } else {
            std::cout << "复制文件失败。" << std::endl;
        }
    });

    io_context.run();
    return 0;
}
```

## AsyncDirectory 类

`AsyncDirectory` 类提供异步目录管理操作。

### AsyncDirectory 构造函数

```cpp
explicit AsyncDirectory(asio::io_context& io_context);
```

使用提供的 ASIO I/O 上下文创建一个 `AsyncDirectory` 对象。

- `io_context`：引用 `asio::io_context` 对象，用于管理异步操作。

### AsyncDirectory 方法

1. **asyncCreate**

   ```cpp
   void asyncCreate(const std::string& path,
                    const std::function<void(bool)>& callback);
   ```

   异步创建目录。

2. **asyncRemove**

   ```cpp
   void asyncRemove(const std::string& path,
                    const std::function<void(bool)>& callback);
   ```

   异步删除目录。

3. **asyncListContents**

   ```cpp
   void asyncListContents(
       const std::string& path,
       const std::function<void(std::vector<std::string>)>& callback);
   ```

   异步列出目录的内容。

4. **asyncExists**
   ```cpp
   void asyncExists(const std::string& path,
                    const std::function<void(bool)>& callback);
   ```
   异步检查目录是否存在。

### AsyncDirectory 使用示例

```cpp
#include "async_io.hpp"
#include <asio.hpp>
#include <iostream>

int main() {
    asio::io_context io_context;
    atom::async::io::AsyncDirectory dir(io_context);

    // 示例 1：创建目录
    dir.asyncCreate("new_directory", [](bool success) {
        if (success) {
            std::cout << "目录创建成功。" << std::endl;
        } else {
            std::cout << "创建目录失败。" << std::endl;
        }
    });

    // 示例 2：列出目录内容
    dir.asyncListContents("existing_directory", [](const std::vector<std::string>& contents) {
        std::cout << "目录内容:" << std::endl;
        for (const auto& item : contents) {
            std::cout << "- " << item << std::endl;
        }
    });

    io_context.run();
    return 0;
}
```
