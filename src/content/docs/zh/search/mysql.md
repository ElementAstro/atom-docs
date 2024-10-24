---
title: MysqlDB
description: 详细文档，介绍 MysqlDB 类，包括构造函数、执行查询的方法、检索数据、管理事务和处理错误的功能，以及详细的使用示例。  
---

## 介绍

`MysqlDB` 类提供与 MySQL 数据库交互的功能。它允许执行查询、检索数据和管理事务。

### 示例用法

```cpp
// 实例化 MysqlDB 对象
MysqlDB db("localhost", "root", "password", "my_database");
```

## 构造函数

### 方法签名

```cpp
explicit MysqlDB(const char *host, const char *user, const char *password, const char *database);
```

### 使用示例

```cpp
MysqlDB db("localhost", "root", "password", "my_database");
```

### 预期输出

如果成功，则没有输出。如果连接失败，可能会抛出异常。

## 析构函数

### 方法签名

```cpp
~MysqlDB();
```

### 使用示例

```cpp
// 当对象超出作用域时，析构函数会自动调用
```

### 预期输出

关闭数据库连接。

## executeQuery

### 方法签名

```cpp
bool executeQuery(const char *query);
```

### 使用示例

```cpp
bool success = db.executeQuery("INSERT INTO table_name (column1, column2) VALUES (value1, value2)");
```

### 预期输出

如果查询成功执行，则返回 true，否则返回 false。

## selectData

### 方法签名

```cpp
void selectData(const char *query);
```

### 使用示例

```cpp
db.selectData("SELECT * FROM table_name");
```

### 预期输出

打印 SELECT 查询的结果。

## getIntValue

### 方法签名

```cpp
int getIntValue(const char *query);
```

### 使用示例

```cpp
int result = db.getIntValue("SELECT COUNT(*) FROM table_name");
```

### 预期输出

返回查询结果中的整数值。

## getDoubleValue

### 方法签名

```cpp
double getDoubleValue(const char *query);
```

### 使用示例

```cpp
double result = db.getDoubleValue("SELECT AVG(salary) FROM employee_table");
```

### 预期输出

返回查询结果中的双精度值。

## getTextValue

### 方法签名

```cpp
const char *getTextValue(const char *query);
```

### 使用示例

```cpp
const char *text = db.getTextValue("SELECT name FROM user_table WHERE id=1");
```

### 预期输出

返回查询结果中的文本值。注意，调用者必须适当地处理内存管理。

## searchData

### 方法签名

```cpp
bool searchData(const char *query, const char *searchTerm);
```

### 使用示例

```cpp
bool found = db.searchData("SELECT title FROM article_table", "MySQL");
```

### 预期输出

如果在查询结果中找到搜索词，则返回 true，否则返回 false。

## updateData

### 方法签名

```cpp
bool updateData(const char *query);
```

### 使用示例

```cpp
bool success = db.updateData("UPDATE employee_table SET salary=60000 WHERE id=123");
```

### 预期输出

如果数据成功更新，则返回 true，否则返回 false。

## deleteData

### 方法签名

```cpp
bool deleteData(const char *query);
```

### 使用示例

```cpp
bool success = db.deleteData("DELETE FROM student_table WHERE graduation_year<2020");
```

### 预期输出

如果数据成功删除，则返回 true，否则返回 false。

## beginTransaction

### 方法签名

```cpp
bool beginTransaction();
```

### 使用示例

```cpp
bool success = db.beginTransaction();
```

### 预期输出

如果事务成功开始，则返回 true，否则返回 false。

## commitTransaction

### 方法签名

```cpp
bool commitTransaction();
```

### 使用示例

```cpp
bool success = db.commitTransaction();
```

### 预期输出

如果事务成功提交，则返回 true，否则返回 false。

## rollbackTransaction

### 方法签名

```cpp
bool rollbackTransaction();
```

### 使用示例

```cpp
bool success = db.rollbackTransaction();
```

### 预期输出

如果事务成功回滚，则返回 true，否则返回 false。

## handleMySQLError

### 方法签名

```cpp
void handleMySQLError();
```

### 使用示例

```cpp
// 通常在内部调用以处理错误
```

### 预期输出

如果有任何 MySQL 错误，打印错误消息。

## validateData

### 方法签名

```cpp
bool validateData(const char *query, const char *validationQuery);
```

### 使用示例

```cpp
bool isValid = db.validateData("SELECT * FROM user_table WHERE id=1", "SELECT COUNT(*) FROM user_table");
```

### 预期输出

如果数据根据验证查询有效，则返回 true，否则返回 false。

## selectDataWithPagination

### 方法签名

```cpp
void selectDataWithPagination(const char *query, int limit, int offset);
```

### 使用示例

```cpp
db.selectDataWithPagination("SELECT * FROM large_table", 10, 0);
```

### 预期输出

打印带有分页支持的 SELECT 查询结果。

## setErrorMessageCallback

### 方法签名

```cpp
void setErrorMessageCallback(const std::function<void(const char *)> &errorCallback);
```

### 使用示例

```cpp
db.setErrorMessageCallback([](const char *errorMessage) {
    std::cerr << "错误: " << errorMessage << std::endl;
});
```

### 预期输出

设置用于处理错误消息的回调函数。

## 私有成员

- `MYSQL *db`：指向 MySQL 连接句柄的指针。
- `std::function<void(const char *)> errorCallback`：用于错误消息的回调函数。

## 结论

`MysqlDB` 类为 C++ 应用程序提供了与 MySQL 数据库的交互功能。通过灵活的查询执行、数据检索和事务管理，开发人员可以高效地处理数据库操作。文档中的示例展示了该类的基本用法和高级功能，帮助开发人员快速上手。