---
title: Stat
description: 详细文档，介绍atom::system命名空间中的Stat类，包括构造函数、获取文件统计信息的方法，以及Windows和Linux系统的使用示例。
---

## 概述

`Stat`类是`atom::system`命名空间的一部分，提供了一个方便的接口，用于检索Windows和Linux系统上的文件统计信息。它提供了类似于Python的`os.stat()`的功能，允许用户访问文件的各种属性，如类型、大小、访问时间和权限。

## 类定义

```cpp
namespace atom::system {
    class Stat {
    public:
        explicit Stat(const fs::path& path);
        void update();
        [[nodiscard]] auto type() const -> fs::file_type;
        [[nodiscard]] auto size() const -> std::uintmax_t;
        [[nodiscard]] auto atime() const -> std::time_t;
        [[nodiscard]] auto mtime() const -> std::time_t;
        [[nodiscard]] auto ctime() const -> std::time_t;
        [[nodiscard]] auto mode() const -> int;
        [[nodiscard]] auto uid() const -> int;
        [[nodiscard]] auto gid() const -> int;
        [[nodiscard]] auto path() const -> fs::path;

    private:
        fs::path path_;
        std::error_code ec_;
    };
}
```

## 构造函数

### `Stat(const fs::path& path)`

构造一个`Stat`对象，用于指定文件路径的统计信息。

- **参数：**
  - `path`: 要检索统计信息的文件路径。

## 成员函数

### `void update()`

更新文件统计信息。此方法刷新构造函数中指定文件的统计信息。

### `[[nodiscard]] auto type() const -> fs::file_type`

获取文件的类型。

- **返回值：** 以`fs::file_type`枚举值表示的文件类型。

### `[[nodiscard]] auto size() const -> std::uintmax_t`

获取文件的大小。

- **返回值：** 文件大小（以字节为单位）。

### `[[nodiscard]] auto atime() const -> std::time_t`

获取文件的最后访问时间。

- **返回值：** 文件的最后访问时间，以`std::time_t`值表示。

### `[[nodiscard]] auto mtime() const -> std::time_t`

获取文件的最后修改时间。

- **返回值：** 文件的最后修改时间，以`std::time_t`值表示。

### `[[nodiscard]] auto ctime() const -> std::time_t`

获取文件的创建时间。

- **返回值：** 文件的创建时间，以`std::time_t`值表示。

### `[[nodiscard]] auto mode() const -> int`

获取文件的模式/权限。

- **返回值：** 以整数值表示的文件模式/权限。

### `[[nodiscard]] auto uid() const -> int`

获取文件所有者的用户ID。

- **返回值：** 以整数值表示的文件所有者的用户ID。

### `[[nodiscard]] auto gid() const -> int`

获取文件所有者的组ID。

- **返回值：** 以整数值表示的文件所有者的组ID。

### `[[nodiscard]] auto path() const -> fs::path`

获取文件的路径。

- **返回值：** 以`fs::path`对象表示的文件路径。

## 使用示例

### 示例 1：基本用法

```cpp
#include "stat.hpp"
#include <iostream>

int main() {
    atom::system::Stat fileStat("/path/to/your/file.txt");

    std::cout << "文件类型: " << static_cast<int>(fileStat.type()) << std::endl;
    std::cout << "文件大小: " << fileStat.size() << " 字节" << std::endl;
    std::cout << "最后访问时间: " << fileStat.atime() << std::endl;
    std::cout << "最后修改时间: " << fileStat.mtime() << std::endl;
    std::cout << "创建时间: " << fileStat.ctime() << std::endl;

    return 0;
}
```

### 示例 2：检查文件权限

```cpp
#include "stat.hpp"
#include <iostream>

int main() {
    atom::system::Stat fileStat("/path/to/your/file.txt");

    int mode = fileStat.mode();
    std::cout << "文件权限: " << std::oct << mode << std::dec << std::endl;

    // 检查文件是否可被所有者读取
    if (mode & S_IRUSR) {
        std::cout << "文件可被所有者读取。" << std::endl;
    }

    // 检查文件是否可被所有者写入
    if (mode & S_IWUSR) {
        std::cout << "文件可被所有者写入。" << std::endl;
    }

    return 0;
}
```

### 示例 3：更新文件统计信息

```cpp
#include "stat.hpp"
#include <iostream>
#include <thread>
#include <chrono>

int main() {
    atom::system::Stat fileStat("/path/to/your/file.txt");

    std::cout << "初始大小: " << fileStat.size() << " 字节" << std::endl;

    // 模拟文件修改（这里实际应修改文件）
    std::this_thread::sleep_for(std::chrono::seconds(1));

    // 更新文件统计信息
    fileStat.update();

    std::cout << "更新后的大小: " << fileStat.size() << " 字节" << std::endl;

    return 0;
}
```

## 注意事项

- `Stat`类使用`std::filesystem`进行文件操作，需要C++17或更高版本。
- 该类使用`std::error_code`内部处理错误。如果需要，可以添加错误检查方法以满足您的用例。
- 某些方法（如`uid()`和`gid()`）的行为可能在Windows和Linux系统之间有所不同。

## 另见

- [std::filesystem文档](https://en.cppreference.com/w/cpp/filesystem)
- [Python os.stat()文档](https://docs.python.org/3/library/os.html#os.stat) 用于与Python等效项进行比较
