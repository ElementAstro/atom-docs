---
title: SSH客户端
description: SSHClient 类在 atom::connection 命名空间中的详细文档，包括连接到 SSH 服务器、执行命令和在远程服务器上执行文件操作的方法。
---

## 目录

1. [类概述](#类概述)
2. [构造函数和析构函数](#构造函数和析构函数)
3. [公共方法](#公共方法)
   - [connect](#connect)
   - [isConnected](#isconnected)
   - [disconnect](#disconnect)
   - [executeCommand](#executecommand)
   - [executeCommands](#executecommands)
   - [fileExists](#fileexists)
   - [createDirectory](#createdirectory)
   - [removeFile](#removefile)
   - [removeDirectory](#removedirectory)
   - [listDirectory](#listdirectory)
   - [rename](#rename)
   - [getFileInfo](#getfileinfo)
   - [downloadFile](#downloadfile)
   - [uploadFile](#uploadfile)
   - [uploadDirectory](#uploaddirectory)
4. [使用示例](#使用示例)

## 类概述

```cpp
namespace atom::connection {

class SSHClient {
public:
    explicit SSHClient(const std::string &host, int port = DEFAULT_SSH_PORT);
    ~SSHClient();

    // ... (公共方法)

private:
    std::string host_;
    int port_;
    ssh_session ssh_session_;
    sftp_session sftp_session_;
};

}  // namespace atom::connection
```

## 构造函数和析构函数

### 构造函数

```cpp
explicit SSHClient(const std::string &host, int port = DEFAULT_SSH_PORT);
```

创建一个新的 `SSHClient` 实例。

- **参数：**
  - `host`：SSH 服务器的主机名或 IP 地址。
  - `port`：SSH 服务器的端口号（默认为 22）。

### 析构函数

```cpp
~SSHClient();
```

销毁 `SSHClient` 实例并清理资源。

## 公共方法

### connect

```cpp
void connect(const std::string &username, const std::string &password, int timeout = DEFAULT_TIMEOUT);
```

连接到 SSH 服务器。

- **参数：**
  - `username`：用于身份验证的用户名。
  - `password`：用于身份验证的密码。
  - `timeout`：连接超时时间（默认为 10 秒）。
- **抛出：** `std::runtime_error` 如果连接或身份验证失败。

### isConnected

```cpp
[[nodiscard]] auto isConnected() const -> bool;
```

检查 SSH 客户端是否已连接到服务器。

- **返回：** 如果连接，则返回 `true`，否则返回 `false`。

### disconnect

```cpp
void disconnect();
```

从 SSH 服务器断开连接。

### executeCommand

```cpp
void executeCommand(const std::string &command, std::vector<std::string> &output);
```

在 SSH 服务器上执行单个命令。

- **参数：**
  - `command`：要执行的命令。
  - `output`：用于存储命令输出的输出向量。
- **抛出：** `std::runtime_error` 如果命令执行失败。

### executeCommands

```cpp
void executeCommands(const std::vector<std::string> &commands, std::vector<std::vector<std::string>> &output);
```

在 SSH 服务器上执行多个命令。

- **参数：**
  - `commands`：要执行的命令向量。
  - `output`：用于存储命令输出的向量的向量。
- **抛出：** `std::runtime_error` 如果任何命令执行失败。

### fileExists

```cpp
[[nodiscard]] auto fileExists(const std::string &remote_path) const -> bool;
```

检查远程服务器上是否存在文件。

- **参数：**
  - `remote_path`：远程文件的路径。
- **返回：** 如果文件存在，则返回 `true`，否则返回 `false`。

### createDirectory

```cpp
void createDirectory(const std::string &remote_path, int mode = DEFAULT_MODE);
```

在远程服务器上创建目录。

- **参数：**
  - `remote_path`：远程目录的路径。
  - `mode`：目录的权限（默认为 `S_NORMAL`）。
- **抛出：** `std::runtime_error` 如果目录创建失败。

### removeFile

```cpp
void removeFile(const std::string &remote_path);
```

从远程服务器删除文件。

- **参数：**
  - `remote_path`：远程文件的路径。
- **抛出：** `std::runtime_error` 如果文件删除失败。

### removeDirectory

```cpp
void removeDirectory(const std::string &remote_path);
```

从远程服务器删除目录。

- **参数：**
  - `remote_path`：远程目录的路径。
- **抛出：** `std::runtime_error` 如果目录删除失败。

### listDirectory

```cpp
auto listDirectory(const std::string &remote_path) const -> std::vector<std::string>;
```

列出远程服务器上目录的内容。

- **参数：**
  - `remote_path`：远程目录的路径。
- **返回：** 包含目录内容名称的字符串向量。
- **抛出：** `std::runtime_error` 如果列出目录失败。

### rename

```cpp
void rename(const std::string &old_path, const std::string &new_path);
```

在远程服务器上重命名文件或目录。

- **参数：**
  - `old_path`：远程文件或目录的当前路径。
  - `new_path`：远程文件或目录的新路径。
- **抛出：** `std::runtime_error` 如果重命名失败。

### getFileInfo

```cpp
void getFileInfo(const std::string &remote_path, sftp_attributes &attrs);
```

检索远程文件的信息。

- **参数：**
  - `remote_path`：远程文件的路径。
  - `attrs`：用于存储文件信息的属性结构。
- **抛出：** `std::runtime_error` 如果获取文件信息失败。

### downloadFile

```cpp
void downloadFile(const std::string &remote_path, const std::string &local_path);
```

从远程服务器下载文件。

- **参数：**
  - `remote_path`：远程文件的路径。
  - `local_path`：本地目标文件的路径。
- **抛出：** `std::runtime_error` 如果文件下载失败。

### uploadFile

```cpp
void uploadFile(const std::string &local_path, const std::string &remote_path);
```

将文件上传到远程服务器。

- **参数：**
  - `local_path`：本地源文件的路径。
  - `remote_path`：远程目标文件的路径。
- **抛出：** `std::runtime_error` 如果文件上传失败。

### uploadDirectory

```cpp
void uploadDirectory(const std::string &local_path, const std::string &remote_path);
```

将目录上传到远程服务器。

- **参数：**
  - `local_path`：本地源目录的路径。
  - `remote_path`：远程目标目录的路径。
- **抛出：** `std::runtime_error` 如果目录上传失败。

## 使用示例

以下是一些演示如何使用 `SSHClient` 类的示例：

### 连接到 SSH 服务器并执行命令

```cpp
#include "sshclient.hpp"
#include <iostream>

int main() {
    try {
        atom::connection::SSHClient client("example.com");
        client.connect("username", "password");

        if (client.isConnected()) {
            // 上传文件
            client.uploadFile("/path/to/local/file.txt", "/remote/path/file.txt");
            std::cout << "文件上传成功" << std::endl;

            // 下载文件
            client.downloadFile("/remote/path/downloaded_file.txt", "/path/to/local/downloaded_file.txt");
            std::cout << "文件下载成功" << std::endl;

            client.disconnect();
        }
    } catch (const std::exception& e) {
        std::cerr << "错误: " << e.what() << std::endl;
    }

    return 0;
}
```

### 管理远程目录

```cpp
#include "sshclient.hpp"
#include <iostream>
#include <vector>

int main() {
    try {
        atom::connection::SSHClient client("example.com");
        client.connect("username", "password");

        if (client.isConnected()) {
            // 创建新目录
            client.createDirectory("/remote/path/new_directory");
            std::cout << "目录创建成功" << std::endl;

            // 列出目录内容
            std::vector<std::string> contents = client.listDirectory("/remote/path");
            std::cout << "目录内容:" << std::endl;
            for (const auto& item : contents) {
                std::cout << item << std::endl;
            }

            // 重命名目录
            client.rename("/remote/path/old_name", "/remote/path/new_name");
            std::cout << "目录重命名成功" << std::endl;

            // 删除目录
            client.removeDirectory("/remote/path/to_be_removed");
            std::cout << "目录删除成功" << std::endl;

            client.disconnect();
        }
    } catch (const std::exception& e) {
        std::cerr << "错误: " << e.what() << std::endl;
    }

    return 0;
}
```

### 执行多个命令

```cpp
#include "sshclient.hpp"
#include <iostream>
#include <vector>

int main() {
    try {
        atom::connection::SSHClient client("example.com");
        client.connect("username", "password");

        if (client.isConnected()) {
            std::vector<std::string> commands = {
                "echo 'Hello, World!'",
                "ls -l /home",
                "df -h"
            };

            std::vector<std::vector<std::string>> outputs;
            client.executeCommands(commands, outputs);

            for (size_t i = 0; i < commands.size(); ++i) {
                std::cout << "命令 '" << commands[i] << "' 的输出:" << std::endl;
                for (const auto& line : outputs[i]) {
                    std::cout << line << std::endl;
                }
                std::cout << std::endl;
            }

            client.disconnect();
        }
    } catch (const std::exception& e) {
        std::cerr << "错误: " << e.what() << std::endl;
    }

    return 0;
}
```

### 检查文件存在性并获取文件信息

```cpp
#include "sshclient.hpp"
#include <iostream>
#include <iomanip>

int main() {
    try {
        atom::connection::SSHClient client("example.com");
        client.connect("username", "password");

        if (client.isConnected()) {
            std::string remote_file = "/remote/path/file.txt";

            if (client.fileExists(remote_file)) {
                std::cout << "文件存在: " << remote_file << std::endl;

                sftp_attributes attrs;
                client.getFileInfo(remote_file, attrs);

                std::cout << "文件信息:" << std::endl;
                std::cout << "大小: " << attrs.size << " 字节" << std::endl;
                std::cout << "所有者: " << attrs.owner << std::endl;
                std::cout << "组: " << attrs.group << std::endl;
                std::cout << "权限: " << std::setfill('0') << std::setw(4) << std::oct << attrs.permissions << std::endl;
                std::cout << "最后访问时间: " << attrs.atime << std::endl;
                std::cout << "最后修改时间: " << attrs.mtime << std::endl;

                sftp_attributes_free(attrs);
            } else {
                std::cout << "文件不存在: " << remote_file << std::endl;
            }

            client.disconnect();
        }
    } catch (const std::exception& e) {
        std::cerr << "错误: " << e.what() << std::endl;
    }

    return 0;
}
```

### 上传目录

```cpp
#include "sshclient.hpp"
#include <iostream>

int main() {
    try {
        atom::connection::SSHClient client("example.com");
        client.connect("username", "password");

        if (client.isConnected()) {
            std::string local_dir = "/path/to/local/directory";
            std::string remote_dir = "/remote/path/directory";

            client.uploadDirectory(local_dir, remote_dir);
            std::cout << "目录上传成功" << std::endl;

            client.disconnect();
        }
    } catch (const std::exception& e) {
        std::cerr << "错误: " << e.what() << std::endl;
    }

    return 0;
}
```

这些示例演示了 `SSHClient` 类的各种用例，包括文件和目录操作、命令执行以及检索文件信息。请记得在您的应用程序中适当地处理异常，并确保正确的错误处理和资源管理。

在项目中使用 `SSHClient` 类时，请确保：

1. 包含适当的错误处理和日志记录。
2. 使用安全的做法存储和处理凭据。
3. 为网络操作实现适当的超时机制。
4. 考虑使用基于密钥的身份验证，而不是基于密码的身份验证，以提高安全性。
5. 注意您在远程服务器上创建或修改的文件和目录的权限和所有权。
