---
title: 环境变量
description: Env 类的详细文档，包括构造函数、静态方法、实例方法和管理环境变量及命令行参数的使用示例。
---

## 目录

1. [Env 类](#env-class)
   - [构造函数](#constructors)
   - [静态方法](#static-methods)
   - [实例方法](#instance-methods)
2. [使用示例](#usage-examples)
3. [最佳实践和提示](#best-practices-and-tips)

## Env 类

`Env` 类提供了管理环境变量、命令行参数和其他程序相关信息的功能。

### 构造函数

#### 默认构造函数

```cpp
Env();
```

初始化环境变量信息。

#### 带命令行参数的构造函数

```cpp
explicit Env(int argc, char** argv);
```

使用命令行参数初始化环境变量信息。

- `argc`: 命令行参数的数量。
- `argv`: 命令行参数的数组。

### 静态方法

#### createShared

```cpp
static auto createShared(int argc, char** argv) -> std::shared_ptr<Env>;
```

创建指向 `Env` 对象的共享指针。

- `argc`: 命令行参数的数量。
- `argv`: 命令行参数的数组。
- 返回值: 指向 `Env` 对象的共享指针。

#### Environ

```cpp
static auto Environ() -> std::unordered_map<std::string, std::string>;
```

获取当前环境变量。

- 返回值: 环境变量的无序映射。

#### setVariable

```cpp
static void setVariable(const std::string& name, const std::string& value, bool overwrite = true);
```

设置环境变量。

- `name`: 变量名称。
- `value`: 变量值。
- `overwrite`: 如果变量已存在，是否覆盖该变量（默认值：true）。

#### getVariable

```cpp
static auto getVariable(const std::string& name) -> std::string;
```

获取环境变量的值。

- `name`: 变量名称。
- 返回值: 变量值。

#### unsetVariable

```cpp
static void unsetVariable(const std::string& name);
```

取消设置（删除）环境变量。

- `name`: 变量名称。

#### listVariables

```cpp
static auto listVariables() -> std::vector<std::string>;
```

列出所有环境变量。

- 返回值: 环境变量名称的向量。

#### printAllVariables

```cpp
static void printAllVariables();
```

打印所有环境变量。

### 实例方法

#### add

```cpp
void add(const std::string& key, const std::string& val);
```

向环境变量添加键值对。

- `key`: 键名称。
- `val`: 与键相关联的值。

#### has

```cpp
bool has(const std::string& key);
```

检查环境变量中是否存在某个键。

- `key`: 键名称。
- 返回值: 如果键存在则返回 true，否则返回 false。

#### del

```cpp
void del(const std::string& key);
```

从环境变量中删除键值对。

- `key`: 键名称。

#### get

```cpp
ATOM_NODISCARD auto get(const std::string& key, const std::string& default_value = "") -> std::string;
```

获取与键相关联的值，如果键不存在，则返回默认值。

- `key`: 键名称。
- `default_value`: 如果键不存在，则返回的默认值（默认值：""）。
- 返回值: 与键相关联的值，或默认值。

#### addHelp

```cpp
void addHelp(const std::string& key, const std::string& desc);
```

将命令行参数及其描述添加到帮助信息列表中。

- `key`: 参数名称。
- `desc`: 参数描述。

#### removeHelp

```cpp
void removeHelp(const std::string& key);
```

从帮助信息列表中移除命令行参数。

- `key`: 参数名称。

#### printHelp

```cpp
void printHelp();
```

打印程序的帮助信息，包括所有添加的命令行参数及其描述。

#### setEnv

```cpp
auto setEnv(const std::string& key, const std::string& val) -> bool;
```

设置环境变量的值。

- `key`: 键名称。
- `val`: 要设置的值。
- 返回值: 如果环境变量设置成功则返回 true，否则返回 false。

#### getEnv

```cpp
ATOM_NODISCARD auto getEnv(const std::string& key, const std::string& default_value = "") -> std::string;
```

获取环境变量的值，如果变量不存在，则返回默认值。

- `key`: 键名称。
- `default_value`: 如果变量不存在，则返回的默认值（默认值：""）。
- 返回值: 环境变量的值，或默认值。

#### getAbsolutePath

```cpp
ATOM_NODISCARD auto getAbsolutePath(const std::string& path) const -> std::string;
```

获取给定路径的绝对路径。

- `path`: 要转换为绝对路径的路径。
- 返回值: 绝对路径。

#### getAbsoluteWorkPath

```cpp
ATOM_NODISCARD auto getAbsoluteWorkPath(const std::string& path) const -> std::string;
```

获取相对于工作目录的给定路径的绝对路径。

- `path`: 要转换为相对于工作目录的绝对路径的路径。
- 返回值: 绝对路径。

#### getConfigPath

```cpp
ATOM_NODISCARD auto getConfigPath() -> std::string;
```

获取配置文件的路径。默认情况下，配置文件位于程序的同一目录中。

- 返回值: 配置文件路径。

## 使用示例

### 创建 Env 对象

```cpp
int main(int argc, char** argv) {
    atom::utils::Env env(argc, argv);
    // 或使用 createShared
    auto env_ptr = atom::utils::Env::createShared(argc, argv);

    // 程序的其余部分...
}
```

### 管理环境变量

```cpp
atom::utils::Env env;

// 添加变量
env.add("MY_VAR", "my_value");

// 检查变量是否存在
if (env.has("MY_VAR")) {
    std::cout << "MY_VAR exists" << std::endl;
}

// 获取变量值
std::string value = env.get("MY_VAR", "default_value");
std::cout << "MY_VAR value: " << value << std::endl;

// 删除变量
env.del("MY_VAR");

// 设置环境变量
env.setEnv("GLOBAL_VAR", "global_value");

// 获取环境变量
std::string global_value = env.getEnv("GLOBAL_VAR", "default_global");
std::cout << "GLOBAL_VAR value: " << global_value << std::endl;
```

### 管理帮助信息

```cpp
atom::utils::Env env;

env.addHelp("--verbose", "启用详细输出");
env.addHelp("--config", "指定配置文件路径");

// 打印帮助信息
env.printHelp();

// 移除帮助信息
env.removeHelp("--verbose");
```

### 处理路径

```cpp
atom::utils::Env env;

std::string rel_path = "config/settings.json";
std::string abs_path = env.getAbsolutePath(rel_path);
std::cout << "绝对路径: " << abs_path << std::endl;

std::string work_rel_path = "data/input.txt";
std::string work_abs_path = env.getAbsoluteWorkPath(work_rel_path);
std::cout << "绝对工作路径: " << work_abs_path << std::endl;

std::string config_path = env.getConfigPath();
std::cout << "配置文件路径: " << config_path << std::endl;
```

### 使用静态方法

```cpp
// 设置环境变量
atom::utils::Env::setVariable("APP_MODE", "production", true);

// 获取环境变量
std::string app_mode = atom::utils::Env::getVariable("APP_MODE");
std::cout << "应用模式: " << app_mode << std::endl;

// 取消设置环境变量
atom::utils::Env::unsetVariable("TEMP_VAR");

// 列出所有环境变量
std::vector<std::string> all_vars = atom::utils::Env::listVariables();
for (const auto& var : all_vars) {
    std::cout << var << std::endl;
}

// 打印所有环境变量
atom::utils::Env::printAllVariables();
```

### 线程安全操作

`Env` 类使用互斥量保护其成员变量，使其在多线程环境中安全使用。以下是如何在多线程上下文中使用它的示例：

```cpp
#include <thread>
#include <vector>

void worker_function(atom::utils::Env& env, const std::string& key, const std::string& value) {
    env.add(key, value);
    std::string retrieved_value = env.get(key);
    std::cout << "线程 " << std::this_thread::get_id() << ": " << key << " = " << retrieved_value << std::endl;
}

int main() {
    atom::utils::Env env;

    std::vector<std::thread> threads;
    for (int i = 0; i < 10; ++i) {
        threads.emplace_back(worker_function, std::ref(env), "KEY_" + std::to_string(i), "VALUE_" + std::to_string(i));
    }

    for (auto& thread : threads) {
        thread.join();
    }

    return 0;
}
```

## 最佳实践和提示

1. **初始化**: 始终在程序开始时初始化 `Env` 对象，最好在 `main` 函数中，以确保所有环境变量和命令行参数都正确设置。

   ```cpp
   int main(int argc, char** argv) {
       atom::utils::Env env(argc, argv);
       // 程序的其余部分...
   }
   ```

2. **错误处理**: 使用返回值的方法时，始终检查空值或默认值，以处理请求的键不存在的情况。

   ```cpp
   std::string value = env.get("IMPORTANT_VAR");
   if (value.empty()) {
       std::cerr << "IMPORTANT_VAR 未设置！" << std::endl;
       // 处理错误...
   }
   ```

3. **配置管理**: 使用 `getConfigPath()` 方法一致地定位应用程序的配置文件。

   ```cpp
   std::string config_path = env.getConfigPath();
   // 使用 config_path 加载配置文件
   ```

4. **路径处理**: 在处理文件路径时，始终使用 `getAbsolutePath()` 或 `getAbsoluteWorkPath()` 以确保在不同工作目录下的一致性。

   ```cpp
   std::string data_file = env.getAbsoluteWorkPath("data/input.csv");
   // 使用 data_file 打开和处理输入
   ```

5. **帮助信息**: 维护所有命令行参数的清晰简明的帮助信息，以改善用户体验。

   ```cpp
   env.addHelp("--log-level", "设置日志级别（debug、info、warn、error）");
   env.addHelp("--output-dir", "指定生成文件的输出目录");
   ```

6. **环境变量**: 使用环境变量进行可能在不同环境（开发、测试、生产）之间变化的配置。

   ```cpp
   std::string db_url = env.getEnv("DATABASE_URL", "localhost:5432");
   // 使用 db_url 连接到数据库
   ```

7. **线程安全**: 虽然 `Env` 类对其内部操作是线程安全的，但在多个线程之间共享同一个 `Env` 对象时，如果您还在操作它，请小心。

8. **静态与实例方法**: 当需要直接与系统的环境变量交互时，使用静态方法（`setVariable`、`getVariable` 等）。当想要处理 `Env` 对象的内部状态时，使用实例方法。

9. **性能考虑**: 对于频繁访问的值，考虑在应用程序中缓存它们，而不是重复调用 `get()` 或 `getEnv()`。

   ```cpp
   class MyApp {
       atom::utils::Env& m_env;
       std::string m_cached_value;

   public:
       MyApp(atom::utils::Env& env) : m_env(env) {
           m_cached_value = m_env.get("FREQUENTLY_USED_VAR");
       }

       // 使用 m_cached_value 而不是重复调用 m_env.get()
   };
   ```

10. **清理**: 如果在程序执行过程中设置了任何临时环境变量，请确保在程序退出前取消设置它们。

    ```cpp
    env.setEnv("TEMP_VAR", "some_value");
    // ... 使用 TEMP_VAR ...
    env.unsetVariable("TEMP_VAR");  // 完成时清理
    ```
