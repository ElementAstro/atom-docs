---
title: 自主实现SSH服务器
description: SshServer 类在 atom::connection 命名空间中的详细文档，包括在 C++ 中设置和管理 SSH 服务器的构造函数、公共方法和使用示例。
---

## 目录

1. [类概述](#类概述)
2. [构造函数和析构函数](#构造函数和析构函数)
3. [公共方法](#公共方法)
   - [start](#start)
   - [stop](#stop)
   - [isRunning](#isrunning)
   - [setPort](#setport)
   - [getPort](#getport)
   - [setListenAddress](#setlistenaddress)
   - [getListenAddress](#getlistenaddress)
   - [setHostKey](#sethostkey)
   - [getHostKey](#gethostkey)
   - [setAuthorizedKeys](#setauthorizedkeys)
   - [getAuthorizedKeys](#getauthorizedkeys)
   - [allowRootLogin](#allowrootlogin)
   - [isRootLoginAllowed](#isrootloginallowed)
   - [setPasswordAuthentication](#setpasswordauthentication)
   - [isPasswordAuthenticationEnabled](#ispasswordauthenticationenabled)
   - [setSubsystem](#setsubsystem)
   - [removeSubsystem](#removesubsystem)
   - [getSubsystem](#getsubsystem)
4. [使用示例](#使用示例)

## 类概述

```cpp
namespace atom::connection {

class SshServer : public NonCopyable {
public:
    explicit SshServer(const std::filesystem::path& configFile);
    ~SshServer() override;

    // ... (公共方法)

private:
    class Impl;
    std::unique_ptr<Impl> impl_;
};

}  // namespace atom::connection
```

## 构造函数和析构函数

### 构造函数

```cpp
explicit SshServer(const std::filesystem::path& configFile);
```

创建一个新的 `SshServer` 实例。

- **参数：**
  - `configFile`：SSH 服务器的配置文件路径。

### 析构函数

```cpp
~SshServer() override;
```

销毁 `SshServer` 实例并清理资源。

## 公共方法

### start

```cpp
void start();
```

启动 SSH 服务器，监听配置的端口和地址上的传入连接。

### stop

```cpp
void stop();
```

停止 SSH 服务器，关闭所有现有连接并停止接受新连接。

### isRunning

```cpp
ATOM_NODISCARD auto isRunning() const -> bool;
```

检查 SSH 服务器是否当前正在运行。

- **返回：** 如果服务器正在运行，则返回 `true`，否则返回 `false`。

### setPort

```cpp
void setPort(int port);
```

设置 SSH 服务器监听连接的端口。

- **参数：**
  - `port`：要监听的端口号。

### getPort

```cpp
ATOM_NODISCARD auto getPort() const -> int;
```

获取 SSH 服务器正在监听的端口。

- **返回：** 当前监听的端口。

### setListenAddress

```cpp
void setListenAddress(const std::string& address);
```

设置 SSH 服务器监听连接的地址。

- **参数：**
  - `address`：用于监听的 IP 地址或主机名。

### getListenAddress

```cpp
ATOM_NODISCARD auto getListenAddress() const -> std::string;
```

获取 SSH 服务器正在监听的地址。

- **返回：** 当前监听地址的字符串。

### setHostKey

```cpp
void setHostKey(const std::filesystem::path& keyFile);
```

设置用于 SSH 连接的主机密钥文件。

- **参数：**
  - `keyFile`：主机密钥文件的路径。

### getHostKey

```cpp
ATOM_NODISCARD auto getHostKey() const -> std::filesystem::path;
```

获取主机密钥文件的路径。

- **返回：** 当前主机密钥文件路径。

### setAuthorizedKeys

```cpp
void setAuthorizedKeys(const std::vector<std::filesystem::path>& keyFiles);
```

设置用于用户身份验证的授权公钥文件列表。

- **参数：**
  - `keyFiles`：公钥文件路径的向量。

### getAuthorizedKeys

```cpp
ATOM_NODISCARD auto getAuthorizedKeys() const -> std::vector<std::filesystem::path>;
```

获取授权公钥文件列表。

- **返回：** 授权公钥文件路径的向量。

### allowRootLogin

```cpp
void allowRootLogin(bool allow);
```

启用或禁用 SSH 服务器的 root 登录。

- **参数：**
  - `allow`：`true` 允许 root 登录，`false` 禁止。

### isRootLoginAllowed

```cpp
ATOM_NODISCARD auto isRootLoginAllowed() const -> bool;
```

检查是否允许 root 登录。

- **返回：** 如果允许 root 登录，则返回 `true`，否则返回 `false`。

### setPasswordAuthentication

```cpp
void setPasswordAuthentication(bool enable);
```

启用或禁用 SSH 服务器的密码身份验证。

- **参数：**
  - `enable`：`true` 启用密码身份验证，`false` 禁用。

### isPasswordAuthenticationEnabled

```cpp
ATOM_NODISCARD auto isPasswordAuthenticationEnabled() const -> bool;
```

检查密码身份验证是否启用。

- **返回：** 如果启用了密码身份验证，则返回 `true`，否则返回 `false`。

### setSubsystem

```cpp
void setSubsystem(const std::string& name, const std::string& command);
```

设置用于处理特定命令的子系统。

- **参数：**
  - `name`：子系统的名称。
  - `command`：子系统将执行的命令。

### removeSubsystem

```cpp
void removeSubsystem(const std::string& name);
```

通过名称移除先前设置的子系统。

- **参数：**
  - `name`：要移除的子系统的名称。

### getSubsystem

```cpp
ATOM_NODISCARD auto getSubsystem(const std::string& name) const -> std::string;
```

获取与子系统关联的命令。

- **参数：**
  - `name`：子系统的名称。
- **返回：** 与子系统关联的命令。

## 使用示例

以下是一些演示如何使用 `SshServer` 类的示例：

### 基本服务器设置和启动

```cpp
#include "sshserver.hpp"
#include <iostream>

int main() {
    try {
        atom::connection::SshServer server("/path/to/config/file.conf");

        server.setPort(2222);
        server.setListenAddress("0.0.0.0");
        server.setHostKey("/path/to/host_key");

        server.start();

        std::cout << "SSH 服务器已在 " << server.getListenAddress()
                  << ":" << server.getPort() << " 上启动" << std::endl;

        // 保持服务器运行
        while (server.isRunning()) {
            std::this_thread::sleep_for(std::chrono::seconds(1));
        }
    } catch (const std::exception& e) {
        std::cerr << "错误: " << e.what() << std::endl;
    }

    return 0;
}
```

### 配置身份验证方法

```cpp
#include "sshserver.hpp"
#include <iostream>

int main() {
    try {
        atom::connection::SshServer server("/path/to/config/file.conf");

        // 设置 SFTP 子系统
        server.setSubsystem("sftp", "/usr/lib/openssh/sftp-server");

        // 设置自定义子系统
        server.setSubsystem("my-custom-subsystem", "/path/to/custom/script.sh");

        server.start();

        std::cout << "SSH 服务器已启动并配置了子系统" << std::endl;

        // 后来，如果我们想要移除一个子系统
        server.removeSubsystem("my-custom-subsystem");

        // 保持服务器运行
        while (server.isRunning()) {
            std::this_thread::sleep_for(std::chrono::seconds(1));
        }
    } catch (const std::exception& e) {
        std::cerr << "错误: " << e.what() << std::endl;
    }

    return 0;
}
```

### 动态配置更改

```cpp
#include "sshserver.hpp"
#include <iostream>
#include <thread>

void configurationThread(atom::connection::SshServer& server) {
    while (server.isRunning()) {
        // 定期更新服务器配置
        std::this_thread::sleep_for(std::chrono::minutes(5));

        // 更改监听端口
        server.setPort(2223);

        // 更新主机密钥
        server.setHostKey("/path/to/new/host_key");

        // 切换 root 登录权限
        server.allowRootLogin(!server.isRootLoginAllowed());

        std::cout << "服务器配置已更新" << std::endl;
    }
}

int main() {
    try {
        atom::connection::SshServer server("/path/to/config/file.conf");
        server.start();

        std::thread config_thread(configurationThread, std::ref(server));

        // 主线程保持服务器运行
        while (server.isRunning()) {
            std::this_thread::sleep_for(std::chrono::seconds(1));
        }

        config_thread.join();
    } catch (const std::exception& e) {
        std::cerr << "错误: " << e.what() << std::endl;
    }

    return 0;
}
```

### 实现简单的 SSH 服务器监控

```cpp
#include "sshserver.hpp"
#include <iostream>
#include <chrono>
#include <thread>

class SshServerMonitor {
public:
    SshServerMonitor(atom::connection::SshServer& server) : server_(server) {}

    void run() {
        while (true) {
            if (server_.isRunning()) {
                std::cout << "SSH 服务器状态: 正在运行" << std::endl;
                std::cout << "监听地址: " << server_.getListenAddress() << ":" << server_.getPort() << std::endl;
                std::cout << "Root 登录: " << (server_.isRootLoginAllowed() ? "允许" : "拒绝") << std::endl;
                std::cout << "密码认证: " << (server_.isPasswordAuthenticationEnabled() ? "启用" : "禁用") << std::endl;
            } else {
                std::cout << "SSH 服务器状态: 已停止" << std::endl;
            }

            std::this_thread::sleep_for(std::chrono::seconds(10));
        }
    }

private:
    atom::connection::SshServer& server_;
};

int main() {
    try {
        atom::connection::SshServer server("/path/to/config/file.conf");
        server.start();

        SshServerMonitor monitor(server);
        std::thread monitor_thread(&SshServerMonitor::run, &monitor);

        // 保持主线程活着
        while (true) {
            std::this_thread::sleep_for(std::chrono::seconds(1));
        }

        monitor_thread.join();
    } catch (const std::exception& e) {
        std::cerr << "错误: " << e.what() << std::endl;
    }

    return 0;
}
```

### 优雅关闭处理

```cpp
#include "sshserver.hpp"
#include <iostream>
#include <csignal>

atom::connection::SshServer* g_server = nullptr;

void signalHandler(int signum) {
    std::cout << "接收到中断信号 (" << signum << ")。\n";

    if (g_server && g_server->isRunning()) {
        std::cout << "正在优雅地停止 SSH 服务器..." << std::endl;
        g_server->stop();
    }

    exit(signum);
}

int main() {
    try {
        atom::connection::SshServer server("/path/to/config/file.conf");
        g_server = &server;

        // 注册信号处理程序
        signal(SIGINT, signalHandler);

        server.start();

        std::cout << "SSH 服务器已启动。按 Ctrl+C 停止。" << std::endl;

        // 保持服务器运行
        while (server.isRunning()) {
            std::this_thread::sleep_for(std::chrono::seconds(1));
        }

    } catch (const std::exception& e) {
        std::cerr << "错误: " << e.what() << std::endl;
    }

    return 0;
}
```
