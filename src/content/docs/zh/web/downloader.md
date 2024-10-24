---
title: 多线程下载器
description: DownloadManager 类的全面文档，包括构造函数、管理下载任务的公共方法、内部操作的私有方法、成员变量和使用示例。
---

## 描述

`DownloadManager` 类旨在管理下载任务，允许用户添加、删除、启动、暂停、恢复任务，并获取已下载字节的信息。

```cpp
// 创建一个 DownloadManager 实例并指定保存任务列表的文件
DownloadManager manager("task_list.txt");

// 添加一个新的高优先级下载任务
manager.add_task("https://example.com/file.zip", "downloads/file.zip", 2);

// 使用默认设置开始下载任务
manager.start();

// 按索引暂停特定任务
manager.pause_task(0);

// 恢复暂停的任务
manager.resume_task(0);

// 获取特定任务的已下载字节数
size_t downloaded_bytes = manager.get_downloaded_bytes(0);
```

## 构造函数

### `DownloadManager(const std::string &task_file)`

构造一个 `DownloadManager` 对象，指定任务文件的路径。

## 公共方法

### `void add_task(const std::string &url, const std::string &filepath, int priority = 0)`

添加一个新的下载任务，包括给定的 URL、本地文件路径和可选的优先级。

### `bool remove_task(size_t index)`

从任务列表中移除指定索引的任务。如果成功，返回 true。

### `void start(size_t thread_count = std::thread::hardware_concurrency(), size_t download_speed = 0)`

使用指定数量的线程和下载速度限制开始下载任务。

### `void pause_task(size_t index)`

暂停指定索引的任务。

### `void resume_task(size_t index)`

恢复指定索引的暂停任务。

### `size_t get_downloaded_bytes(size_t index)`

返回指定索引任务的已下载字节数。

## 私有方法

### `std::optional<size_t> get_next_task_index()`

返回下一个要下载的任务索引，如果任务队列为空，则返回空。

### `std::optional<DownloadTask> get_next_task()`

返回下一个要下载的任务，如果任务队列为空，则返回空。

### `void run(size_t download_speed)`

使用指定的下载速度限制启动下载线程。

### `void download_task(DownloadTask &task, size_t download_speed)`

使用给定的下载速度限制下载指定任务。

### `void save_task_list_to_file()`

将当前任务列表保存到对象构造时指定的文件中。

## 成员变量

- `task_file_` : 保存任务列表的文件路径。
- `tasks_` : 下载任务列表。
- `task_queue_` : 基于优先级的任务优先队列。
- `mutex_` : 用于线程同步的互斥量。
- `running_` : 原子标志，指示下载是否在进行中。
- `start_time_` : 下载管理器启动时的时间点。

- 优先队列确保任务根据优先级级别进行处理。
- 使用互斥量维护对共享数据的访问的线程安全性。

```cpp
int main() {
    DownloadManager manager("task_list.txt");

    manager.add_task("https://example.com/file1.zip", "downloads/file1.zip", 2);
    manager.add_task("https://example.com/file2.zip", "downloads/file2.zip", 1);

    manager.start(2, 1024); // 使用 2 个线程和 1KB/s 的速度限制开始下载

    manager.pause_task(0); // 暂停第一个任务

    manager.resume_task(0); // 恢复第一个任务

    size_t downloaded_bytes = manager.get_downloaded_bytes(1); // 获取第二个任务的已下载字节数

    return 0;
}
```
