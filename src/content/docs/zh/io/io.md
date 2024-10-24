---
title: IO辅助函数
description: 详细文档，介绍 atom::io 命名空间中的函数和结构，用于文件和目录操作、符号链接管理、路径验证、文件类型和大小操作、文件分割和合并以及其他实用工具。  
---

## 目录

1. [目录操作](#目录操作)
2. [文件操作](#文件操作)
3. [符号链接操作](#符号链接操作)
4. [路径和名称验证](#路径和名称验证)
5. [文件类型和大小操作](#文件类型和大小操作)
6. [文件分割和合并](#文件分割和合并)
7. [杂项函数](#杂项函数)

## 目录操作

### createDirectory

```cpp
[[nodiscard]] auto createDirectory(const std::string &path) -> bool;
```

创建指定路径的目录。

- **参数：**
  - `path`：要创建的目录的路径。
- **返回：** 如果操作成功，则返回 `true`，否则返回 `false`。

**示例：**

```cpp
if (atom::io::createDirectory("/path/to/new/directory")) {
    std::cout << "目录创建成功。" << std::endl;
} else {
    std::cout << "创建目录失败。" << std::endl;
}
```

### createDirectoriesRecursive

```cpp
auto createDirectoriesRecursive(
    const fs::path &basePath, const std::vector<std::string> &subdirs,
    const CreateDirectoriesOptions &options) -> bool;
```

递归创建指定基路径和子目录的目录结构。

- **参数：**
  - `basePath`：目录结构的基路径。
  - `subdirs`：要创建的子目录名称的向量。
  - `options`：包含其他选项的 `CreateDirectoriesOptions` 结构。
- **返回：** 如果操作成功，则返回 `true`，否则返回 `false`。

**示例：**

```cpp
atom::io::CreateDirectoriesOptions options;
options.verbose = true;
options.dryRun = false;
options.delay = 100; // 毫秒

std::vector<std::string> subdirs = {"folder1", "folder2/subfolder", "folder3"};

if (atom::io::createDirectoriesRecursive("/path/to/base", subdirs, options)) {
    std::cout << "目录创建成功。" << std::endl;
} else {
    std::cout << "创建目录失败。" << std::endl;
}
```

### removeDirectory

```cpp
[[nodiscard]] auto removeDirectory(const std::string &path) -> bool;
```

删除指定路径的空目录。

- **参数：**
  - `path`：要删除的目录的路径。
- **返回：** 如果操作成功，则返回 `true`，否则返回 `false`。

**示例：**

```cpp
if (atom::io::removeDirectory("/path/to/empty/directory")) {
    std::cout << "目录删除成功。" << std::endl;
} else {
    std::cout << "删除目录失败。" << std::endl;
}
```

### removeDirectoriesRecursive

```cpp
[[nodiscard]] auto removeDirectoriesRecursive(
    const fs::path &basePath, const std::vector<std::string> &subdirs,
    const CreateDirectoriesOptions &options = {}) -> bool;
```

递归删除指定基路径和子目录的目录结构。

- **参数：**
  - `basePath`：目录结构的基路径。
  - `subdirs`：要删除的子目录名称的向量。
  - `options`：包含其他选项的 `CreateDirectoriesOptions` 结构（可选）。
- **返回：** 如果操作成功，则返回 `true`，否则返回 `false`。

**示例：**

```cpp
std::vector<std::string> subdirs = {"folder1", "folder2/subfolder", "folder3"};

if (atom::io::removeDirectoriesRecursive("/path/to/base", subdirs)) {
    std::cout << "目录删除成功。" << std::endl;
} else {
    std::cout << "删除目录失败。" << std::endl;
}
```

### renameDirectory

```cpp
[[nodiscard]] auto renameDirectory(const std::string &old_path,
                                   const std::string &new_path) -> bool;
```

将目录从旧路径重命名为新路径。

- **参数：**
  - `old_path`：目录的当前路径。
  - `new_path`：目录的新路径。
- **返回：** 如果操作成功，则返回 `true`，否则返回 `false`。

**示例：**

```cpp
if (atom::io::renameDirectory("/path/to/old_dir", "/path/to/new_dir")) {
    std::cout << "目录重命名成功。" << std::endl;
} else {
    std::cout << "重命名目录失败。" << std::endl;
}
```

### moveDirectory

```cpp
[[nodiscard]] auto moveDirectory(const std::string &old_path,
                                 const std::string &new_path) -> bool;
```

将目录从旧路径移动到新路径。

- **参数：**
  - `old_path`：目录的当前路径。
  - `new_path`：目录的新路径。
- **返回：** 如果操作成功，则返回 `true`，否则返回 `false`。

**示例：**

```cpp
if (atom::io::moveDirectory("/path/to/source_dir", "/path/to/destination_dir")) {
    std::cout << "目录移动成功。" << std::endl;
} else {
    std::cout << "移动目录失败。" << std::endl;
}
```

## 文件操作

### copyFile

```cpp
[[nodiscard]] auto copyFile(const std::string &src_path,
                            const std::string &dst_path) -> bool;
```

将文件从源路径复制到目标路径。

- **参数：**
  - `src_path`：源文件的路径。
  - `dst_path`：目标文件的路径。
- **返回：** 如果操作成功，则返回 `true`，否则返回 `false`。

**示例：**

```cpp
if (atom::io::copyFile("/path/to/source.txt", "/path/to/destination.txt")) {
    std::cout << "文件复制成功。" << std::endl;
} else {
    std::cout << "复制文件失败。" << std::endl;
}
```

### moveFile

```cpp
[[nodiscard]] auto moveFile(const std::string &src_path,
                            const std::string &dst_path) -> bool;
```

将文件从源路径移动到目标路径。

- **参数：**
  - `src_path`：文件的当前路径。
  - `dst_path`：文件的新路径。
- **返回：** 如果操作成功，则返回 `true`，否则返回 `false`。

**示例：**

```cpp
if (atom::io::moveFile("/path/to/source.txt", "/path/to/destination.txt")) {
    std::cout << "文件移动成功。" << std::endl;
} else {
    std::cout << "移动文件失败。" << std::endl;
}
```

### renameFile

```cpp
[[nodiscard]] auto renameFile(const std::string &old_path,
                              const std::string &new_path) -> bool;
```

将文件从旧路径重命名为新路径。

- **参数：**
  - `old_path`：文件的当前路径。
  - `new_path`：文件的新路径。
- **返回：** 如果操作成功，则返回 `true`，否则返回 `false`。

**示例：**

```cpp
if (atom::io::renameFile("/path/to/oldname.txt", "/path/to/newname.txt")) {
    std::cout << "文件重命名成功。" << std::endl;
} else {
    std::cout << "重命名文件失败。" << std::endl;
}
```

### removeFile

```cpp
[[nodiscard]] auto removeFile(const std::string &path) -> bool;
```

删除指定路径的文件。

- **参数：**
  - `path`：要删除的文件的路径。
- **返回：** 如果操作成功，则返回 `true`，否则返回 `false`。

**示例：**

```cpp
if (atom::io::removeFile("/path/to/file.txt")) {
    std::cout << "文件删除成功。" << std::endl;
} else {
    std::cout << "删除文件失败。" << std::endl;
}
```

### truncateFile

```cpp
auto truncateFile(const std::string &path, std::streamsize size) -> bool;
```

将文件截断到指定大小。

- **参数：**
  - `path`：要截断的文件的路径。
  - `size`：要截断到的大小。
- **返回：** 如果操作成功，则返回 `true`，否则返回 `false`。

**示例：**

```cpp
if (atom::io::truncateFile("/path/to/file.txt", 1024)) {
    std::cout << "文件截断成功。" << std::endl;
} else {
    std::cout << "截断文件失败。" << std::endl;
}
```

## 符号链接操作

### createSymlink

```cpp
[[nodiscard]] auto createSymlink(const std::string &target_path,
                                 const std::string &symlink_path) -> bool;
```

创建具有指定目标和符号链接路径的符号链接。

- **参数：**
  - `target_path`：符号链接的目标文件或目录的路径。
  - `symlink_path`：要创建的符号链接的路径。
- **返回：** 如果操作成功，则返回 `true`，否则返回 `false`。

**示例：**

```cpp
if (atom::io::createSymlink("/path/to/target", "/path/to/symlink")) {
    std::cout << "符号链接创建成功。" << std::endl;
} else {
    std::cout << "创建符号链接失败。" << std::endl;
}
```

### removeSymlink

```cpp
[[nodiscard]] auto removeSymlink(const std::string &path) -> bool;
```

删除指定路径的符号链接。

- **参数：**
  - `path`：要删除的符号链接的路径。
- **返回：** 如果操作成功，则返回 `true`，否则返回 `false`。

**示例：**

```cpp
if (atom::io::removeSymlink("/path/to/symlink")) {
    std::cout << "符号链接删除成功。" << std::endl;
} else {
    std::cout << "删除符号链接失败。" << std::endl;
}
```

## 路径和名称验证

### isFolderNameValid

```cpp
[[nodiscard]] auto isFolderNameValid(const std::string &folderName) -> bool;
```

检查文件夹名称是否有效。

- **参数：**
  - `folderName`：要检查的文件夹名称。
- **返回：** 如果文件夹名称有效，则返回 `true`，否则返回 `false`。

**示例：**

```cpp
if (atom::io::isFolderNameValid("my_folder")) {
    std::cout << "文件夹名称有效。" << std::endl;
} else {
    std::cout << "文件夹名称无效。" << std::endl;
}
```

### isFileNameValid

```cpp
[[nodiscard]] auto isFileNameValid(const std::string &fileName) -> bool;
```

检查文件名称是否有效。

- **参数：**
  - `fileName`：要检查的文件名称。
- **返回：** 如果文件名称有效，则返回 `true`，否则返回 `false`。

**示例：**

```cpp
if (atom::io::isFileNameValid("document.txt")) {
    std::cout << "文件名称有效。" << std::endl;
} else {
    std::cout << "文件名称无效。" << std::endl;
}
```

### isAbsolutePath

```cpp
[[nodiscard]] auto isAbsolutePath(const std::string &path) -> bool;
```

检查路径是否为绝对路径。

- **参数：**
  - `path`：要检查的路径。
- **返回：** 如果路径是绝对路径，则返回 `true`，否则返回 `false`。

**示例：**

```cpp
if (atom::io::isAbsolutePath("/home/user/document.txt")) {
    std::cout << "路径是绝对的。" << std::endl;
} else {
    std::cout << "路径是相对的。" << std::endl;
}
```

## 文件类型和大小操作

### fileSize

```cpp
[[nodiscard]] auto fileSize(const std::string &path) -> std::uintmax_t;
```

返回文件的大小（以字节为单位）。

- **参数：**
  - `path`：要获取大小的文件路径。
- **返回：** 文件的字节大小，如果文件不存在或无法读取，则返回 0。

**示例：**

```cpp
std::uintmax_t size = atom::io::fileSize("/path/to/file.txt");
std::cout << "文件大小: " << size << " 字节" << std::endl;
```

### checkFileTypeInFolder

```cpp
[[nodiscard]] auto checkFileTypeInFolder(
    const std::string &folderPath, const std::string &fileType,
    FileOption fileOption) -> std::vector<std::string>;
```

检查文件夹中的文件类型，并返回文件路径或名称的向量。

- **参数：**
  - `folderPath`：要检查的文件夹路径。
  - `fileType`：要检查的文件类型（例如，`.txt`、`.cpp`）。
  - `fileOption`：一个枚举类 `FileOption`，指定是返回完整路径（`PATH`）还是仅返回文件名（`NAME`）。
- **返回：** 匹配指定文件类型的文件路径或名称的向量。

**示例：**

```cpp
std::vector<std::string> textFiles = atom::io::checkFileTypeInFolder("/path/to/folder", ".txt", atom::io::FileOption::PATH);
for (const auto& file : textFiles) {
    std::cout << "找到的文本文件: " << file << std::endl;
}
```

## 文件分割和合并

### splitFile

```cpp
void splitFile(const std::string &filePath, std::size_t chunkSize,
               const std::string &outputPattern = "");
```

将文件分割为多个部分。

- **参数：**
  - `filePath`：要分割的文件路径。
  - `chunkSize`：每个块的大小（以字节为单位）。
  - `outputPattern`：输出文件模式（可选）。

**示例：**

```cpp
atom::io::splitFile("/path/to/largefile.dat", 1024 * 1024, "output_part_");
```

### mergeFiles

```cpp
void mergeFiles(const std::string &outputFilePath,
                const std::vector<std::string> &partFiles);
```

将多个部分合并为一个文件。

- **参数：**
  - `outputFilePath`：合并后文件的输出路径。
  - `partFiles`：要合并的部分文件路径的向量。

**示例：**

```cpp
std::vector<std::string> partFiles = {"part1.dat", "part2.dat", "part3.dat"};
atom::io::mergeFiles("/path/to/merged_file.dat", partFiles);
```

### quickSplit

```cpp
void quickSplit(const std::string &filePath, int numChunks,
                const std::string &outputPattern = "");
```

快速将文件分割为多个部分。

- **参数：**
  - `filePath`：要分割的文件路径。
  - `numChunks`：要将文件分割成的块数。
  - `outputPattern`：输出文件模式（可选）。

**示例：**

```cpp
atom::io::quickSplit("/path/to/largefile.dat", 5, "output_chunk_");
```

### quickMerge

```cpp
void quickMerge(const std::string &outputFilePath,
                const std::string &partPattern, int numChunks);
```

快速将多个部分合并为一个文件。

- **参数：**
  - `outputFilePath`：合并后文件的输出路径。
  - `partPattern`：要合并的部分文件的模式。
  - `numChunks`：要合并的块数。

**示例：**

```cpp
atom::io::quickMerge("/path/to/merged_file.dat", "output_chunk_", 5);
```

## 杂项函数

### jwalk

```cpp
auto jwalk(const std::string &root) -> std::string;
```

递归遍历目录及其子目录，返回包含文件信息的 JSON 字符串。

- **参数：**
  - `root`：要遍历的目录的根路径。
- **返回：** 包含文件信息的 JSON 字符串。

**示例：**

```cpp
std::string fileInfo = atom::io::jwalk("/path/to/directory");
std::cout << "目录结构: " << fileInfo << std::endl;
```

### fwalk

```cpp
void fwalk(const fs::path &root,
           const std::function<void(const fs::path &)> &callback);
```

递归遍历目录及其子目录，为每个文件应用回调函数。

- **参数：**
  - `root`：要遍历的目录的根路径。
  - `callback`：对每个文件执行的回调函数。

**示例：**

```cpp
atom::io::fwalk("/path/to/directory", [](const fs::path& filePath) {
    std::cout << "找到文件: " << filePath << std::endl;
});
```

### convertToLinuxPath

```cpp
[[nodiscard]] auto convertToLinuxPath(std::string_view windows_path) -> std::string;
```

将 Windows 路径转换为 Linux 路径，通过将反斜杠替换为斜杠。

- **参数：**
  - `windows_path`：要转换的 Windows 路径。
- **返回：** 转换后的 Linux 路径。

**示例：**

```cpp
std::string linuxPath = atom::io::convertToLinuxPath("C:\\Users\\John\\Documents");
std::cout << "Linux 路径: " << linuxPath << std::endl;
```

### convertToWindowsPath

```cpp
[[nodiscard]] auto convertToWindowsPath(std::string_view linux_path) -> std::string;
```

将 Linux 路径转换为 Windows 路径，通过将斜杠替换为反斜杠。

- **参数：**
  - `linux_path`：要转换的 Linux 路径。
- **返回：** 转换后的 Windows 路径。

**示例：**

```cpp
std::string windowsPath = atom::io::convertToWindowsPath("/home/john/documents");
std::cout << "Windows 路径: " << windowsPath << std::endl;
```

### normPath

```cpp
[[nodiscard]] auto normPath(std::string_view raw_path) -> std::string;
```

通过删除冗余分隔符并解析 ".." 和 "." 组件来规范化路径。

- **参数：**
  - `raw_path`：要规范化的路径。
- **返回：** 规范化的路径。

**示例：**

```cpp
std::string normalizedPath = atom::io::normPath("/home/user/../john/./documents");
std::cout << "规范化路径: " << normalizedPath << std::endl;
```

### isFolderExists

```cpp
[[nodiscard]] auto isFolderExists(const std::string &folderName) -> bool;
```

检查文件夹是否存在。

- **参数：**
  - `folderName`：要检查的文件夹路径。
- **返回：** 如果文件夹存在，则返回 `true`，否则返回 `false`。

**示例：**

```cpp
if (atom::io::isFolderExists("/path/to/folder")) {
    std::cout << "文件夹存在。" << std::endl;
} else {
    std::cout << "文件夹不存在。" << std::endl;
}
```

### isFileExists

```cpp
[[nodiscard]] auto isFileExists(const std::string &fileName) -> bool;
```

检查文件是否存在。

- **参数：**
  - `fileName`：要检查的文件路径。
- **返回：** 如果文件存在，则返回 `true`，否则返回 `false`。

**示例：**

```cpp
if (atom::io::isFileExists("/path/to/file.txt")) {
    std::cout << "文件存在。" << std::endl;
} else {
    std::cout << "文件不存在。" << std::endl;
}
```

### isFolderEmpty

```cpp
[[nodiscard]] auto isFolderEmpty(const std::string &folderName) -> bool;
```

检查文件夹是否为空。

- **参数：**
  - `folderName`：要检查的文件夹路径。
- **返回：** 如果文件夹为空，则返回 `true`，否则返回 `false`。

**示例：**

```cpp
if (atom::io::isFolderEmpty("/path/to/folder")) {
    std::cout << "文件夹是空的。" << std::endl;
} else {
    std::cout << "文件夹不是空的。" << std::endl;
}
```

### changeWorkingDirectory

```cpp
[[nodiscard]] auto changeWorkingDirectory(const std::string &directoryPath) -> bool;
```

更改工作目录。

- **参数：**
  - `directoryPath`：要更改到的目录路径。
- **返回：** 如果工作目录成功更改，则返回 `true`，否则返回 `false`。

**示例：**

```cpp
if (atom::io::changeWorkingDirectory("/path/to/new/working/directory")) {
    std::cout << "工作目录更改成功。" << std::endl;
} else {
    std::cout << "更改工作目录失败。" << std::endl;
}
```

### getFileTimes

```cpp
[[nodiscard]] std::pair<std::string, std::string> getFileTimes(const std::string &filePath);
```

获取文件的创建和修改时间。

- **参数：**
  - `filePath`：文件的路径。
- **返回：** 包含创建时间和修改时间的字符串对。

**示例：**

```cpp
auto [creationTime, modificationTime] = atom::io::getFileTimes("/path/to/file.txt");
std::cout << "创建时间: " << creationTime << std::endl;
std::cout << "修改时间: " << modificationTime << std::endl;
```

### isExecutableFile

```cpp
auto isExecutableFile(const std::string &fileName, const std::string &fileExt) -> bool;
```

检查指定文件是否存在并且可执行。

- **参数：**
  - `fileName`：文件名称。
  - `fileExt`：文件扩展名。
- **返回：** 如果文件存在并且可执行，则返回 `true`，否则返回 `false`。

**示例：**

```cpp
if (atom::io::isExecutableFile("myprogram", ".exe")) {
    std::cout << "文件是可执行的。" << std::endl;
} else {
    std::cout << "文件不可执行或不存在。" << std::endl;
}
```

### getFileSize

```cpp
auto getFileSize(const std::string &filePath) -> std::size_t;
```

获取文件大小。

- **参数：**
  - `filePath`：文件路径。
- **返回：** 文件大小（以字节为单位）。

**示例：**

```cpp
std::size_t size = atom::io::getFileSize("/path/to/file.txt");
std::cout << "文件大小: " << size << " 字节" << std::endl;
```

### calculateChunkSize

```cpp
auto calculateChunkSize(std::size_t fileSize, int numChunks) -> std::size_t;
```

计算文件分割的块大小。

- **参数：**
  - `fileSize`：总文件大小。
  - `numChunks`：要将文件分割成的块数。
- **返回：** 计算出的块大小。

**示例：**

```cpp
std::size_t fileSize = 1024 * 1024 * 10; // 10 MB
int numChunks = 4;
std::size_t chunkSize = atom::io::calculateChunkSize(fileSize, numChunks);
std::cout << "块大小```cpp
: " << chunkSize << " 字节" << std::endl;
```

### getExecutableNameFromPath

```cpp
[[nodiscard]] auto getExecutableNameFromPath(const std::string &path) -> std::string;
```

从路径中获取可执行文件的名称。

- **参数：**
  - `path`：可执行文件的路径。
- **返回：** 可执行文件的名称。

**示例：**

```cpp
std::string exeName = atom::io::getExecutableNameFromPath("/usr/bin/myprogram");
std::cout << "可执行文件名称: " << exeName << std::endl;
```

## 结构和枚举

### CreateDirectoriesOptions

```cpp
struct CreateDirectoriesOptions {
    bool verbose = true;
    bool dryRun = false;
    int delay = 0;
    std::function<bool(const std::string &)> filter = [](const std::string &) {
        return true;
    };
    std::function<void(const std::string &)> onCreate =
        [](const std::string &) {};
    std::function<void(const std::string &)> onDelete =
        [](const std::string &) {};
};
```

此结构提供目录创建操作的选项。

- `verbose`：如果为 true，则启用详细输出。
- `dryRun`：如果为 true，则执行干运行而不实际创建目录。
- `delay`：操作之间的延迟（以毫秒为单位）。
- `filter`：一个函数，用于过滤哪些目录应该被创建。
- `onCreate`：创建目录时调用的函数。
- `onDelete`：删除目录时调用的函数。

### FileOption

```cpp
enum class FileOption { PATH, NAME };
```

此枚举类在 `checkFileTypeInFolder` 函数中用于指定是返回完整路径还是仅返回文件名。

- `PATH`：返回完整的文件路径。
- `NAME`：仅返回文件名。

## 最佳实践和注意事项

1. **始终检查返回值**：对于返回布尔值的函数，始终检查返回值以确保操作成功。

2. **使用 `[[nodiscard]]` 属性**：在返回重要值的函数上使用 `[[nodiscard]]` 属性，以鼓励检查结果。

3. **路径处理**：在处理路径时，考虑使用 `normPath` 函数规范化路径以确保一致性。

4. **长时间运行的文件操作**：在处理可能需要较长时间的文件操作（如分割或合并大文件）时，考虑实现进度报告或在应用程序中使用异步操作。

5. **谨慎使用修改文件系统的函数**：在使用可能修改文件系统的函数（如删除或移动操作）时，始终仔细检查路径，并在可用时考虑使用干运行选项。

6. **符号链接的安全性**：在处理符号链接时，注意潜在的安全隐患，尤其是在处理用户提供的路径时。

7. **跨平台应用**：在跨平台应用中，使用路径转换函数（`convertToLinuxPath` 和 `convertToWindowsPath`）以确保路径兼容性。

8. **文件扩展名的可靠性**：在基于文件扩展名进行类型检查或操作时，记住文件扩展名并不总是文件内容的可靠指示。

9. **使用 `CreateDirectoriesOptions` 结构**：在创建目录时，考虑使用 `CreateDirectoriesOptions` 结构自定义目录创建行为，特别是在更复杂的场景中。

10. **分割和合并文件时的选择**：根据对速度与灵活性的具体需求，在常规和“快速”版本之间进行选择。
