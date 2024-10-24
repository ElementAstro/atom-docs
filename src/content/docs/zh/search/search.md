---
title: 搜索引擎
description: 介绍 atom::search 命名空间中的 SearchEngine 类，包括添加文档、基于标签的搜索、基于内容的搜索、布尔搜索、自动补全和使用示例。  
---

## 概述

`SearchEngine` 类是 `atom::search` 命名空间的一部分，提供文档的多功能搜索功能。它支持多种搜索方法，包括基于标签的搜索、基于内容的搜索、布尔搜索和自动补全建议。

## 目录

1. [文档结构](#文档结构)
2. [SearchEngine 类](#searchengine-类)
3. [添加文档](#添加文档)
4. [搜索方法](#搜索方法)
   - [基于标签的搜索](#基于标签的搜索)
   - [基于内容的搜索](#基于内容的搜索)
   - [布尔搜索](#布尔搜索)
   - [自动补全](#自动补全)
5. [使用示例](#使用示例)
6. [最佳实践](#最佳实践)

## 文档结构

在深入 `SearchEngine` 类之前，让我们看看 `Document` 结构：

```cpp
struct Document {
    std::string id;
    std::string content;
    std::set<std::string> tags;
    int clickCount;

    explicit Document(std::string id, std::string content,
                      std::initializer_list<std::string> tags);
};
```

此结构表示一个可搜索的文档，包含 ID、内容、标签和点击计数（用于调整搜索结果权重）。

## SearchEngine 类

`SearchEngine` 类提供以下公共方法：

```cpp
class SearchEngine {
public:
    void addDocument(const Document& doc);
    std::vector<Document> searchByTag(const std::string& tag);
    std::vector<Document> fuzzySearchByTag(const std::string& tag, int tolerance);
    std::vector<Document> searchByTags(const std::vector<std::string>& tags);
    std::vector<Document> searchByContent(const std::string& query);
    std::vector<Document> booleanSearch(const std::string& query);
    std::vector<Document> autoComplete(const std::string& prefix);
};
```

## 添加文档

要将文档添加到搜索引擎：

```cpp
void addDocument(const Document& doc);
```

此方法将文档添加到搜索引擎的索引中，使其可以通过标签和内容进行搜索。

## 搜索方法

### 基于标签的搜索

1. 按单个标签搜索：

   ```cpp
   std::vector<Document> searchByTag(const std::string& tag);
   ```

2. 按标签模糊搜索（允许拼写错误）：

   ```cpp
   std::vector<Document> fuzzySearchByTag(const std::string& tag, int tolerance);
   ```

3. 按多个标签搜索：
   ```cpp
   std::vector<Document> searchByTags(const std::vector<std::string>& tags);
   ```

### 基于内容的搜索

按内容搜索文档：

```cpp
std::vector<Document> searchByContent(const std::string& query);
```

### 布尔搜索

对文档内容执行布尔搜索：

```cpp
std::vector<Document> booleanSearch(const std::string& query);
```

### 自动补全

根据前缀获取自动补全建议：

```cpp
std::vector<Document> autoComplete(const std::string& prefix);
```

## 使用示例

以下是一些示例，演示如何使用 `SearchEngine` 类：

### 添加文档

```cpp
#include "search.hpp"
#include <iostream>

int main() {
    atom::search::SearchEngine engine;

    // 添加文档
    engine.addDocument(atom::search::Document("1", "C++ programming basics", {"programming", "cpp"}));
    engine.addDocument(atom::search::Document("2", "Python for data science", {"programming", "python", "data-science"}));
    engine.addDocument(atom::search::Document("3", "Introduction to algorithms", {"algorithms", "computer-science"}));

    // 按标签搜索
    auto results = engine.searchByTag("programming");
    for (const auto& doc : results) {
        std::cout << "找到文档: " << doc.id << " - " << doc.content << std::endl;
    }

    // 模糊按标签搜索
    results = engine.fuzzySearchByTag("programing", 1);  // 拼写错误 "programming"
    for (const auto& doc : results) {
        std::cout << "找到文档 (模糊): " << doc.id << " - " << doc.content << std::endl;
    }

    // 按内容搜索
    results = engine.searchByContent("data science");
    for (const auto& doc : results) {
        std::cout << "按内容找到文档: " << doc.id << " - " << doc.content << std::endl;
    }

    // 布尔搜索
    results = engine.booleanSearch("algorithms AND computer-science");
    for (const auto& doc : results) {
        std::cout << "找到文档 (布尔): " << doc.id << " - " << doc.content << std::endl;
    }

    // 自动补全
    auto suggestions = engine.autoComplete("pro");
    for (const auto& suggestion : suggestions) {
        std::cout << "自动补全建议: " << suggestion << std::endl;
    }

    return 0;
}
```

## 最佳实践

1. **高效添加文档**：在执行任何搜索之前，先将所有文档添加到搜索引擎，以确保索引完全构建。

2. **选择标签**：使用相关和特定的标签为文档，以提高基于标签的搜索的准确性。

3. **模糊搜索容忍度**：使用模糊搜索时，选择适当的容忍度。较低的容忍度（例如 1 或 2）通常足以捕捉小拼写错误，而不会引入误报。

4. **布尔搜索查询**：对于布尔搜索，在查询中使用清晰的 AND、OR、NOT 操作符。例如：“python AND (data-science OR machine-learning)”。

5. **内容索引**：确保文档内容经过适当的标记和索引，以便有效地进行基于内容的搜索。

6. **自动补全性能**：自动补全功能对于大数据集可能资源密集。考虑限制返回的建议数量或为频繁前缀实现缓存。

7. **定期更新索引**：如果文档集频繁变化，请确保通过添加新文档和删除过时文档来定期更新搜索引擎索引。

8. **点击计数利用**：`Document` 结构中的 `clickCount` 字段可用于实现相关反馈机制。考虑在用户与搜索结果交互时更新此计数，以改善未来的排名。

9. **错误处理**：实现适当的错误处理，特别是对于可能抛出异常的方法（例如，如果您扩展类以支持持久性）。

10. **性能监控**：对于大规模应用程序，考虑实现性能监控，以跟踪搜索时间、索引大小和命中率，以优化搜索引擎的性能。
