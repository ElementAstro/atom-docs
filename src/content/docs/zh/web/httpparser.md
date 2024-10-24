---
title: Http头解析
description: HttpHeaderParser 类的全面文档，包括构造函数、析构函数、解析和操作 HTTP 头的方法，以及使用示例。
---

## 概述

`HttpHeaderParser` 类负责解析和操作 HTTP 头部。

### 构造函数

```cpp
HttpHeaderParser();
```

- 构造一个新的 `HttpHeaderParser` 对象。

```cpp
HttpHeaderParser parser;
```

---

### 析构函数

```cpp
~HttpHeaderParser();
```

- 销毁 `HttpHeaderParser` 对象。

---

### 方法: parseHeaders

```cpp
void parseHeaders(const std::string &rawHeaders);
```

- 解析原始 HTTP 头并将其内部存储。

```cpp
std::string rawHeaders = "Content-Type: application/json\r\n";
rawHeaders += "Content-Length: 123\r\n\r\n";
parser.parseHeaders(rawHeaders);
```

---

### 方法: setHeaderValue

```cpp
void setHeaderValue(const std::string &key, const std::string &value);
```

- 设置特定头字段的值。

```cpp
parser.setHeaderValue("Content-Type", "text/html");
```

---

### 方法: setHeaders

```cpp
void setHeaders(const std::map<std::string, std::vector<std::string>> &headers);
```

- 一次设置多个头字段。

```cpp
std::map<std::string, std::vector<std::string>> headers = {
    {"Content-Type", {"application/json"}},
    {"Content-Length", {"123"}}
};
parser.setHeaders(headers);
```

---

### 方法: getHeaderValues

```cpp
std::vector<std::string> getHeaderValues(const std::string &key) const;
```

- 检索特定头字段的值。

```cpp
std::vector<std::string> values = parser.getHeaderValues("Content-Type");
for (const auto &value : values) {
    std::cout << "Value: " << value << std::endl;
}
```

---

### 方法: removeHeader

```cpp
void removeHeader(const std::string &key);
```

- 移除特定头字段。

```cpp
parser.removeHeader("Content-Length");
```

---

### 方法: printHeaders

```cpp
void printHeaders() const;
```

- 将所有解析的头打印到控制台。

```cpp
parser.printHeaders();
```

---

### 方法: getAllHeaders

```cpp
std::map<std::string, std::vector<std::string>> getAllHeaders() const;
```

- 检索所有解析的头。

```cpp
std::map<std::string, std::vector<std::string>> headers = parser.getAllHeaders();
// 处理检索到的头
```

---

### 方法: hasHeader

```cpp
bool hasHeader(const std::string &key) const;
```

- 检查特定头字段是否存在。

```cpp
bool exists = parser.hasHeader("Content-Type");
if (exists) {
    std::cout << "头存在" << std::endl;
} else {
    std::cout << "头不存在" << std::endl;
}
```

---

### 方法: clearHeaders

```cpp
void clearHeaders();
```

- 清除所有解析的头。

```cpp
parser.clearHeaders();
```

---

### 注意

- `HttpHeaderParser` 使用 Pimpl 习惯用法，具体实现细节隐藏在指向实现的指针（`m_pImpl`）后面。这允许更好的封装并减少编译时依赖。

### 完整示例

以下是使用 `HttpHeaderParser` 类的完整示例：

```cpp
int main() {
    HttpHeaderParser parser;

    std::string rawHeaders = "Content-Type: application/json\r\n";
    rawHeaders += "Content-Length: 123\r\n\r\n";
    parser.parseHeaders(rawHeaders);

    parser.setHeaderValue("Content-Type", "text/html");

    std::vector<std::string> values = parser.getHeaderValues("Content-Type");
    for (const auto &value : values) {
        std::cout << "值: " << value << std::endl;
    }

    parser.removeHeader("Content-Length");

    parser.printHeaders();

    return 0;
}
```
