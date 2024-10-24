---
title: Curl封装
description: CurlWrapper 类的全面文档，包括构造函数、设置请求选项的方法、执行同步和异步 HTTP 请求、处理回调以及使用示例。
---

## 介绍

`CurlWrapper` 类是一个 C++ 封装，用于使用 libcurl 库进行 HTTP 请求。它提供了多种方法来设置请求选项、执行同步和异步请求以及处理响应回调。本文件提供了关于该类及其用法的详细信息，并为每个方法提供代码示例。

### 类定义

```cpp
class CurlWrapper {
    // ...
};
```

## 构造函数和析构函数

### 构造函数

```cpp
/**
 * @brief CurlWrapper 的构造函数。
 */
CurlWrapper();
```

#### 使用示例

```cpp
CurlWrapper curl;
```

### 析构函数

```cpp
/**
 * @brief CurlWrapper 的析构函数。
 */
~CurlWrapper();
```

#### 注意

- 析构函数会自动清理 libcurl 句柄。

## 设置请求选项

### 设置 URL

```cpp
/**
 * @brief 设置 HTTP 请求将发送到的 URL。
 *
 * @param url 要设置的 URL。
 */
void setUrl(const std::string &url);
```

```cpp
curl.setUrl("http://www.example.com/api");
```

### 设置请求方法

```cpp
/**
 * @brief 设置 HTTP 请求的方法（例如，GET、POST）。
 *
 * @param method 要设置的请求方法。
 */
void setRequestMethod(const std::string &method);
```

```cpp
curl.setRequestMethod("POST");
```

### 设置请求头

```cpp
/**
 * @brief 为 HTTP 请求设置一个头。
 *
 * @param key 头的键。
 * @param value 头的值。
 */
void setHeader(const std::string &key, const std::string &value);
```

```cpp
curl.setHeader("Content-Type", "application/json");
```

### 设置超时

```cpp
/**
 * @brief 设置 HTTP 请求的超时。
 *
 * @param timeout 超时值（以秒为单位）。
 */
void setTimeout(long timeout);
```

```cpp
curl.setTimeout(30);
```

### 设置跟随重定向

```cpp
/**
 * @brief 设置是否自动跟随 HTTP 重定向。
 *
 * @param follow 布尔值，指示是否跟随重定向。
 */
void setFollowLocation(bool follow);
```

```cpp
curl.setFollowLocation(true);
```

### 设置请求体数据

```cpp
/**
 * @brief 为 POST 请求设置请求体数据。
 *
 * @param data 要设置的请求体数据。
 */
void setRequestBody(const std::string &data);
```

```cpp
curl.setRequestBody("{ \"key\": \"value\" }");
```

### 设置上传文件

```cpp
/**
 * @brief 设置请求中上传文件的文件路径。
 *
 * @param filePath 要上传的文件路径。
 */
void setUploadFile(const std::string &filePath);
```

```cpp
curl.setUploadFile("/path/to/file.txt");
```

## 处理回调

### 设置错误回调

```cpp
/**
 * @brief 设置回调函数以处理请求过程中发生的错误。
 *
 * @param callback 要设置的回调函数。
 */
void setOnErrorCallback(std::function<void(CURLcode)> callback);
```

```cpp
curl.setOnErrorCallback([](CURLcode errorCode) {
    std::cerr << "发生错误: " << curl_easy_strerror(errorCode) << std::endl;
});
```

### 设置响应回调

```cpp
/**
 * @brief 设置回调函数以处理从服务器接收到的响应数据。
 *
 * @param callback 要设置的回调函数。
 */
void setOnResponseCallback(std::function<void(const std::string &)> callback);
```

```cpp
curl.setOnResponseCallback([](const std::string &response) {
    std::cout << "收到响应: " << response << std::endl;
});
```

## 执行请求

### 执行同步请求

```cpp
/**
 * @brief 执行同步 HTTP 请求并返回响应数据。
 *
 * @return 从服务器接收到的响应数据。
 */
std::string performRequest();
```

```cpp
std::string response = curl.performRequest();
std::cout << "同步响应: " << response << std::endl;
```

### 执行异步请求

```cpp
/**
 * @brief 执行异步 HTTP 请求，并在收到响应时调用回调函数。
 *
 * @param callback 要调用的回调函数，带有响应数据。
 */
void asyncPerform(std::function<void(const std::string &)> callback);
```

```cpp
curl.asyncPerform([](const std::string &response) {
    std::cout << "异步响应: " << response << std::endl;
});
```

### 等待所有异步请求完成

```cpp
/**
 * @brief 等待所有异步请求完成。
 */
void waitAll();
```

- 此方法等待所有先前发起的异步请求完成。

## 内部实现

- 以下方法和数据成员在 `CurlWrapper` 类中内部使用，不打算供外部使用。

### 私有数据成员

- `CURL *handle`: libcurl 的简单句柄，用于单个请求
- `CURLM *multiHandle`: libcurl 的多重句柄，用于管理多个请求
- `std::vector<std::string> headers`: 存储请求自定义头的向量
- `std::function<void(CURLcode)> onErrorCallback`: 处理错误的回调函数
- `std::function<void(const std::string &)> onResponseCallback`: 处理响应数据的回调函数
- `std::mutex mutex`: 用于线程安全的互斥量
- `std::condition_variable cv`: 用于同步的条件变量
- `std::string responseData`: 从服务器接收到的响应数据

### 静态写入回调

```cpp
/**
 * @brief libcurl 用于将响应数据写入 responseData 成员变量的回调函数。
 *
 * @param contents 指向响应数据的指针。
 * @param size 每个数据元素的大小。
 * @param nmemb 数据元素的数量。
 * @param userp 用户指针。
 * @return 写入的数据的总大小。
 */
static size_t writeCallback(void *contents, size_t size, size_t nmemb, void *userp);
```

## 整体示例

```cpp
int main() {
    CurlWrapper curl;
    curl.setUrl("http://www.example.com/api");
    curl.setRequestMethod("POST");
    curl.setHeader("Content-Type", "application/json");
    curl.setRequestBody("{ \"key\": \"value\" }");

    // 执行同步请求
    std::string syncResponse = curl.performRequest();
    std::cout << "同步响应: " << syncResponse << std::endl;

    // 执行异步请求
    curl.asyncPerform([](const std::string &asyncResponse) {
        std::cout << "异步响应: " << asyncResponse << std::endl;
    });

    // 等待异步请求完成
    curl.waitAll();

    return 0;
}
```
