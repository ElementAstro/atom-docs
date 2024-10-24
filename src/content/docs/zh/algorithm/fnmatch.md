---
title: FnMatch
description: shell 风格模式匹配和过滤函数
---

## 函数

### `fnmatch`

```cpp
auto fnmatch(std::string_view pattern, std::string_view string, int flags = 0) -> bool;
```

#### 描述

该函数使用 shell 风格模式匹配将字符串与指定的模式进行匹配。

#### 参数

- `pattern`：要匹配的模式（类型：`std::string_view`）
- `string`：要匹配的字符串（类型：`std::string_view`）
- `flags`：可选标志，用于修改匹配行为（类型：`int`，默认值：0）

#### 返回值

如果 `string` 与 `pattern` 匹配，则返回 `true`，否则返回 `false`。

#### 使用示例

```cpp
#include "fnmatch.hpp"

bool result = atom::algorithm::fnmatch("*.txt", "document.txt");
// result 将为 true
```

### `filter`（单个模式）

```cpp
auto filter(const std::vector<std::string>& names, std::string_view pattern, int flags = 0) -> bool;
```

#### 描述

该函数根据指定模式过滤字符串向量，使用 shell 风格模式匹配。

#### 参数

- `names`：要过滤的字符串向量（类型：`const std::vector<std::string>&`）
- `pattern`：要过滤的模式（类型：`std::string_view`）
- `flags`：可选标志，用于修改过滤行为（类型：`int`，默认值：0）

#### 返回值

如果 `names` 中的任何元素与 `pattern` 匹配，则返回 `true`，否则返回 `false`。

#### 使用示例

```cpp
#include "fnmatch.hpp"

std::vector<std::string> files = {"doc1.txt", "image.png", "doc2.txt"};
bool hasMatches = atom::algorithm::filter(files, "*.txt");
// hasMatches 将为 true
```

### `filter`（多个模式）

```cpp
auto filter(const std::vector<std::string>& names, const std::vector<std::string>& patterns, int flags = 0) -> std::vector<std::string>;
```

#### 描述

该函数根据多个模式过滤字符串向量，使用 shell 风格模式匹配。

#### 参数

- `names`：要过滤的字符串向量（类型：`const std::vector<std::string>&`）
- `patterns`：要过滤的模式向量（类型：`const std::vector<std::string>&`）
- `flags`：可选标志，用于修改过滤行为（类型：`int`，默认值：0）

#### 返回值

返回一个包含 `names` 中匹配 `patterns` 中任何模式的字符串的向量。

#### 使用示例

```cpp
#include "fnmatch.hpp"

std::vector<std::string> files = {"doc1.txt", "image.png", "doc2.txt", "data.csv"};
std::vector<std::string> patterns = {"*.txt", "*.csv"};
std::vector<std::string> matches = atom::algorithm::filter(files, patterns);
// matches 将包含 {"doc1.txt", "doc2.txt", "data.csv"}
```

### `translate`

```cpp
auto translate(std::string_view pattern, std::string& result, int flags = 0) -> bool;
```

#### 描述

该函数将模式转换为另一种表示，可能用于其他模式匹配系统或调试目的。

#### 参数

- `pattern`：要转换的模式（类型：`std::string_view`）
- `result`：一个字符串引用，用于存储转换后的模式（类型：`std::string&`）
- `flags`：可选标志，用于修改转换行为（类型：`int`，默认值：0）

#### 返回值

如果转换成功，则返回 `true`，否则返回 `false`。

#### 使用示例

```cpp
#include "fnmatch.hpp"

std::string translatedPattern;
bool success = atom::algorithm::translate("*.txt", translatedPattern);
if (success) {
    // translatedPattern 现在包含转换后的表示
}
```

## 注意事项

- 模式匹配的具体行为和 `flags` 参数的影响可能依赖于未在头文件中提供的实现细节。
- 这些函数旨在处理 UTF-8 编码的字符串，因为使用了 `std::string` 和 `std::string_view`。
- 错误处理在函数签名中没有明确规定，因此用户应在适用的情况下检查返回值。

## 最佳实践

1. 尽可能使用 `std::string_view` 作为模式输入，以避免不必要的字符串复制。
2. 在过滤大型集合时，如果需要匹配多个模式，考虑使用多个模式版本的 `filter` 以提高性能。
3. 对于用户提供的模式要谨慎，因为复杂模式可能导致大型数据集的性能问题。
4. 如果需要多次重用转换后的模式，请一次使用 `translate` 函数并存储结果以供重复使用。
