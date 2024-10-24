---
title: Atom内建日志（弃用）
description: 详细文档，介绍 atom::log 命名空间中的 Logger 类，包括构造函数、日志记录方法、配置方法、接收器管理和使用示例。  
---

## 目录

1. [介绍](#介绍)
2. [类概述](#类概述)
3. [构造函数](#构造函数)
4. [日志记录方法](#日志记录方法)
5. [配置方法](#配置方法)
6. [接收器管理](#接收器管理)
7. [使用示例](#使用示例)

## 介绍

`atom::log::Logger` 类是 `atom::log` 命名空间的一部分，提供了 C++ 应用程序的灵活日志记录系统。它支持多种日志级别、文件轮换和可自定义的日志模式。

## 类概述

```cpp
namespace atom::log {

enum class LogLevel {
    TRACE, DEBUG, INFO, WARN, ERROR, CRITICAL, OFF
};

class Logger {
public:
    explicit Logger(const fs::path& file_name,
                    LogLevel min_level = LogLevel::TRACE,
                    size_t max_file_size = 1048576, int max_files = 10);
    ~Logger();

    // 日志记录方法
    template <typename... Args>
    void trace(const std::string& format, const Args&... args);
    template <typename... Args>
    void debug(const std::string& format, const Args&... args);
    template <typename... Args>
    void info(const std::string& format, const Args&... args);
    template <typename... Args>
    void warn(const std::string& format, const Args&... args);
    template <typename... Args>
    void error(const std::string& format, const Args&... args);
    template <typename... Args>
    void critical(const std::string& format, const Args&... args);

    // 配置方法
    void setLevel(LogLevel level);
    void setPattern(const std::string& pattern);
    void setThreadName(const std::string& name);

    // 接收器管理
    void registerSink(const std::shared_ptr<Logger>& logger);
    void removeSink(const std::shared_ptr<Logger>& logger);
    void clearSinks();

    void enableSystemLogging(bool enable);

private:
    std::shared_ptr<LoggerImpl> impl_;
    void log(LogLevel level, const std::string& msg);
};

} // namespace atom::log
```

## 构造函数

```cpp
explicit Logger(const fs::path& file_name,
                LogLevel min_level = LogLevel::TRACE,
                size_t max_file_size = 1048576, int max_files = 10);
```

创建一个新的 `Logger` 实例。

- **参数：**
  - `file_name`：日志文件的路径和名称。
  - `min_level`：要记录的最低日志级别（默认值：TRACE）。
  - `max_file_size`：单个日志文件的最大大小（以字节为单位，默认值：1MB）。
  - `max_files`：要保留的日志文件的最大数量（默认值：10）。

**示例：**

```cpp
atom::log::Logger logger("app.log", atom::log::LogLevel::INFO, 5 * 1024 * 1024, 5);
```

## 日志记录方法

`Logger` 类为每个日志级别提供方法：

```cpp
template <typename... Args>
void trace(const std::string& format, const Args&... args);

template <typename... Args>
void debug(const std::string& format, const Args&... args);

template <typename... Args>
void info(const std::string& format, const Args&... args);

template <typename... Args>
void warn(const std::string& format, const Args&... args);

template <typename... Args>
void error(const std::string& format, const Args&... args);

template <typename... Args>
void critical(const std::string& format, const Args&... args);
```

这些方法使用 C++20 的 `std::format` 进行字符串格式化。

**示例：**

```cpp
logger.info("应用程序启动。版本: {}", app_version);
logger.error("无法打开文件: {}", filename);
```

## 配置方法

### setLevel

```cpp
void setLevel(LogLevel level);
```

设置最低日志级别。低于此级别的消息将被忽略。

**示例：**

```cpp
logger.setLevel(atom::log::LogLevel::WARN);
```

### setPattern

```cpp
void setPattern(const std::string& pattern);
```

设置日志模式。（注意：模式格式在头文件中未指定。）

**示例：**

```cpp
logger.setPattern("[%Y-%m-%d %H:%M:%S.%e] [%l] %v");
```

### setThreadName

```cpp
void setThreadName(const std::string& name);
```

在日志消息中为当前线程设置名称。

**示例：**

```cpp
logger.setThreadName("WorkerThread");
```

## 接收器管理

### registerSink

```cpp
void registerSink(const std::shared_ptr<Logger>& logger);
```

注册另一个记录器作为接收器。日志消息将被转发到此记录器。

**示例：**

```cpp
auto console_logger = std::make_shared<atom::log::Logger>("console");
file_logger.registerSink(console_logger);
```

### removeSink

```cpp
void removeSink(const std::shared_ptr<Logger>& logger);
```

移除先前注册的接收器记录器。

**示例：**

```cpp
file_logger.removeSink(console_logger);
```

### clearSinks

```cpp
void clearSinks();
```

移除所有注册的接收器记录器。

**示例：**

```cpp
logger.clearSinks();
```

### enableSystemLogging

```cpp
void enableSystemLogging(bool enable);
```

启用或禁用系统日志记录。（注意：系统日志记录的具体细节在头文件中未详细说明。）

**示例：**

```cpp
logger.enableSystemLogging(true);
```

## 使用示例

### 基本日志记录

```cpp
#include "atom/log/atomlog.hpp"

int main() {
    atom::log::Logger logger("app.log");

    logger.info("应用程序启动");
    logger.debug("调试消息: {}", 42);
    logger.warn("警告: 磁盘空间不足 ({}%)", 10);

    try {
        // 一些风险操作
        throw std::runtime_error("示例错误");
    } catch (const std::exception& e) {
        logger.error("捕获异常: {}", e.what());
    }

    logger.info("应用程序关闭");
    return 0;
}
```

### 高级配置

```cpp
#include "atom/log/atomlog.hpp"
#include <memory>

int main() {
    auto file_logger = std::make_shared<atom::log::Logger>("app.log", atom::log::LogLevel::DEBUG);
    auto console_logger = std::make_shared<atom::log::Logger>("console", atom::log::LogLevel::INFO);

    file_logger->setPattern("[%Y-%m-%d %H:%M:%S.%e] [%l] [%t] %v");
    file_logger->registerSink(console_logger);

    file_logger->setThreadName("MainThread");

    file_logger->info("此消息同时发送到文件和控制台");
    file_logger->debug("此消息仅发送到文件");

    return 0;
}
```
