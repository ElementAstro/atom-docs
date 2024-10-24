---
title: Glob模式匹配
description: Detailed documentation for the glob pattern matching functions in the atom::io namespace, including single and multiple pattern matching, recursive matching, and helper functions for file system operations in C++.
---

## 目录

1. [glob 函数](#glob-函数)
2. [rglob 函数](#rglob-函数)
3. [辅助函数](#辅助函数)

## glob 函数

`glob` 函数用于查找与指定模式匹配的路径名。

### 单个模式 Glob

```cpp
static ATOM_INLINE auto glob(const std::string &pathname) -> std::vector<fs::path>
```

此函数接受单个路径名模式并返回与之匹配的文件系统路径的向量。

#### 用法

```cpp
auto matches = atom::io::glob("*.txt");
```

#### 示例

```cpp
#include <iostream>
#include "atom/io/glob.hpp"

int main() {
    for (const auto& match : atom::io::glob("*.cpp")) {
        std::cout << match << std::endl;
    }
    return 0;
}
```

这将打印当前目录中的所有 `.cpp` 文件。

### 多个模式 Glob

```cpp
static ATOM_INLINE auto glob(const std::vector<std::string> &pathnames) -> std::vector<fs::path>
```

此重载接受路径名模式的向量并返回与之匹配的文件系统路径的向量。

#### 用法

```cpp
auto matches = atom::io::glob({"*.txt", "*.cpp"});
```

#### 示例

```cpp
#include <iostream>
#include "atom/io/glob.hpp"

int main() {
    for (const auto& match : atom::io::glob({"*.txt", "*.cpp"})) {
        std::cout << match << std::endl;
    }
    return 0;
}
```

这将打印当前目录中的所有 `.txt` 和 `.cpp` 文件。

### 初始化列表 Glob

```cpp
static ATOM_INLINE auto glob(const std::initializer_list<std::string> &pathnames) -> std::vector<fs::path>
```

此重载允许您传递路径名模式的初始化列表。

#### 用法

```cpp
auto matches = atom::io::glob({"*.txt", "*.cpp", "*.h"});
```

#### 示例

```cpp
#include <iostream>
#include "atom/io/glob.hpp"

int main() {
    for (const auto& match : atom::io::glob({"*.txt", "*.cpp", "*.h"})) {
        std::cout << match << std::endl;
    }
    return 0;
}
```

这将打印当前目录中的所有 `.txt`、`.cpp` 和 `.h` 文件。

## rglob 函数

`rglob` 函数是 `glob` 函数的递归版本。它在当前目录及所有子目录中搜索匹配的路径名。

### 单个模式递归 Glob

```cpp
static ATOM_INLINE auto rglob(const std::string &pathname) -> std::vector<fs::path>
```

#### 用法

```cpp
auto matches = atom::io::rglob("*.txt");
```

#### 示例

```cpp
#include <iostream>
#include "atom/io/glob.hpp"

int main() {
    for (const auto& match : atom::io::rglob("*.cpp")) {
        std::cout << match << std::endl;
    }
    return 0;
}
```

这将递归打印当前目录及其子目录中的所有 `.cpp` 文件。

### 多个模式递归 Glob

```cpp
static ATOM_INLINE auto rglob(const std::vector<std::string> &pathnames) -> std::vector<fs::path>
```

#### 用法

```cpp
auto matches = atom::io::rglob({"*.txt", "*.cpp"});
```

### 初始化列表递归 Glob

```cpp
static ATOM_INLINE auto rglob(const std::initializer_list<std::string> &pathnames) -> std::vector<fs::path>
```

#### 用法

```cpp
auto matches = atom::io::rglob({"*.txt", "*.cpp", "*.h"});
```

## 辅助函数

这些函数在 `glob` 和 `rglob` 函数内部使用，但在某些情况下也可能非常有用。

### expandTilde

```cpp
ATOM_INLINE auto expandTilde(fs::path path) -> fs::path
```

将路径中的波浪号 (`~`) 展开为用户的主目录。

### hasMagic

```cpp
ATOM_INLINE auto hasMagic(const std::string &pathname) -> bool
```

检查路径名是否包含任何 glob 魔术字符（`*`、`?` 或 `[`）。

### isHidden

```cpp
ATOM_INLINE auto isHidden(const std::string &pathname) -> bool
```

检查路径名是否表示隐藏文件或目录（以点开头）。

### isRecursive

```cpp
ATOM_INLINE auto isRecursive(const std::string &pattern) -> bool
```

检查模式是否为递归模式（即 `**`）。
