---
title: Atom系统命令库文档
description: Atom系统命令库的全面文档，详细说明了在 `atom::system` 命名空间中执行系统命令、管理进程和处理命令输出的函数。
---

## 目录

1. [executeCommand](#executecommand)
2. [executeCommandWithInput](#executecommandwithinput)
3. [executeCommandStream](#executecommandstream)
4. [executeCommands](#executecommands)
5. [killProcessByName](#killprocessbyname)
6. [killProcessByPID](#killprocessbypid)
7. [executeCommandWithEnv](#executecommandwithenv)
8. [executeCommandWithStatus](#executecommandwithstatus)
9. [executeCommandSimple](#executecommandsimple)

## executeCommand

```cpp
ATOM_NODISCARD auto executeCommand(
    const std::string &command,
    bool openTerminal = false,
    const std::function<void(const std::string &)> &processLine = [](const std::string &) {}
) -> std::string;
```

此函数执行命令并返回命令输出作为字符串。

### 参数

- `command`: 要执行的命令（字符串）。
- `openTerminal`: 是否为命令打开一个终端窗口（布尔值，默认值：false）。
- `processLine`: 处理每行输出的回调函数（可选）。

### 返回值

返回命令的输出作为字符串。

### 异常

如果命令执行失败，则抛出 `std::runtime_error`。

### 示例用法

```cpp
try {
    std::string output = atom::system::executeCommand("ls -l", false, [](const std::string& line) {
        std::cout << "Processing: " << line << std::endl;
    });
    std::cout << "Command output: " << output << std::endl;
} catch (const std::runtime_error& e) {
    std::cerr << "Error executing command: " << e.what() << std::endl;
}
```

## executeCommandWithInput

```cpp
ATOM_NODISCARD auto executeCommandWithInput(
    const std::string &command,
    const std::string &input,
    const std::function<void(const std::string &)> &processLine = nullptr
) -> std::string;
```

此函数执行带有输入的命令并返回命令输出作为字符串。

### 参数

- `command`: 要执行的命令（字符串）。
- `input`: 提供给命令的输入（字符串）。
- `processLine`: 处理每行输出的回调函数（可选）。

### 返回值

返回命令的输出作为字符串。

### 异常

如果命令执行失败，则抛出 `std::runtime_error`。

### 示例用法

```cpp
try {
    std::string input = "Hello, World!";
    std::string output = atom::system::executeCommandWithInput("cat", input);
    std::cout << "Command output: " << output << std::endl;
} catch (const std::runtime_error& e) {
    std::cerr << "Error executing command: " << e.what() << std::endl;
}
```

## executeCommandStream

```cpp
auto executeCommandStream(
    const std::string &command,
    bool openTerminal,
    const std::function<void(const std::string &)> &processLine,
    int &status,
    const std::function<bool()> &terminateCondition = [] { return false; }
) -> std::string;
```

此函数执行命令并返回命令输出作为字符串，同时提供对执行过程的额外控制。

### 参数

- `command`: 要执行的命令（字符串）。
- `openTerminal`: 是否为命令打开一个终端窗口（布尔值）。
- `processLine`: 处理每行输出的回调函数。
- `status`: 引用整数以存储命令的退出状态。
- `terminateCondition`: 确定是否终止命令执行的回调函数（可选）。

### 返回值

返回命令的输出作为字符串。

### 异常

如果命令执行失败，则抛出 `std::runtime_error`。

### 示例用法

```cpp
try {
    int status;
    std::string output = atom::system::executeCommandStream(
        "ping -c 5 google.com",
        false,
        [](const std::string& line) { std::cout << line << std::endl; },
        status,
        []() { return false; }  // Never terminate early
    );
    std::cout << "Command exit status: " << status << std::endl;
    std::cout << "Full output: " << output << std::endl;
} catch (const std::runtime_error& e) {
    std::cerr << "Error executing command: " << e.what() << std::endl;
}
```

## executeCommands

```cpp
void executeCommands(const std::vector<std::string> &commands);
```

此函数执行命令列表。

### 参数

- `commands`: 要执行的命令列表（字符串向量）。

### 异常

如果任何命令执行失败，则抛出 `std::runtime_error`。

### 示例用法

```cpp
try {
    std::vector<std::string> commands = {
        "echo 'Hello'",
        "ls -l",
        "pwd"
    };
    atom::system::executeCommands(commands);
} catch (const std::runtime_error& e) {
    std::cerr << "Error executing commands: " << e.what() << std::endl;
}
```

## killProcessByName

```cpp
void killProcessByName(const std::string &processName, int signal);
```

此函数通过其名称杀死进程。

### 参数

- `processName`: 要杀死的进程名称（字符串）。
- `signal`: 发送给进程的信号（整数）。

### 示例用法

```cpp
atom::system::killProcessByName("firefox", SIGTERM);
```

## killProcessByPID

```cpp
void killProcessByPID(int pid, int signal);
```

此函数通过其 PID 杀死进程。

### 参数

- `pid`: 要杀死的进程的 PID（整数）。
- `signal`: 发送给进程的信号（整数）。

### 示例用法

```cpp
atom::system::killProcessByPID(1234, SIGKILL);
```

## executeCommandWithEnv

```cpp
ATOM_NODISCARD auto executeCommandWithEnv(
    const std::string &command,
    const std::unordered_map<std::string, std::string> &envVars
) -> std::string;
```

此函数执行带有环境变量的命令并返回命令输出作为字符串。

### 参数

- `command`: 要执行的命令（字符串）。
- `envVars`: 环境变量作为变量名到值的映射。

### 返回值

返回命令的输出作为字符串。

### 异常

如果命令执行失败，则抛出 `std::runtime_error`。

### 示例用法

```cpp
try {
    std::unordered_map<std::string, std::string> env = {
        {"MY_VAR", "Hello"},
        {"ANOTHER_VAR", "World"}
    };
    std::string output = atom::system::executeCommandWithEnv("echo $MY_VAR $ANOTHER_VAR", env);
    std::cout << "Command output: " << output << std::endl;
} catch (const std::runtime_error& e) {
    std::cerr << "Error executing command: " << e.what() << std::endl;
}
```

## executeCommandWithStatus

```cpp
ATOM_NODISCARD auto executeCommandWithStatus(const std::string &command)
    -> std::pair<std::string, int>;
```

此函数执行命令并返回命令输出及其退出状态。

### 参数

- `command`: 要执行的命令（字符串）。

### 返回值

返回一个包含以下内容的对：

- 第一个：命令的输出作为字符串。
- 第二个：退出状态作为整数。

### 异常

如果命令执行失败，则抛出 `std::runtime_error`。

### 示例用法

```cpp
try {
    auto [output, status] = atom::system::executeCommandWithStatus("ls -l /nonexistent");
    std::cout << "Command output: " << output << std::endl;
    std::cout << "Exit status: " << status << std::endl;
} catch (const std::runtime_error& e) {
    std::cerr << "Error executing command: " << e.what() << std::endl;
}
```

## executeCommandSimple

```cpp
ATOM_NODISCARD auto executeCommandSimple(const std::string &command) -> bool;
```

此函数执行命令并返回一个布尔值，指示命令是否成功。

### 参数

- `command`: 要执行的命令（字符串）。

### 返回值

返回布尔值：

- 如果命令成功执行（退出状态为 0），则返回 `true`。
- 如果命令失败（非零退出状态），则返回 `false`。

### 异常

如果命令执行失败，则抛出 `std::runtime_error`。

### 示例用法

```cpp
try {
    bool success = atom::system::executeCommandSimple("test -f /etc/hosts");
    if (success) {
        std::cout << "The file /etc/hosts exists." << std::endl;
    } else {
        std::cout << "The file /etc/hosts does not exist." << std::endl;
    }
} catch (const std::runtime_error& e) {
    std::cerr << "Error executing command: " << e.what() << std::endl;
}
```

## 最佳实践和提示

1. **错误处理**: 始终将命令执行包装在 try-catch 块中，以处理潜在的运行时错误。

2. **安全考虑**: 在执行带有用户提供的输入的命令时要小心。始终对输入进行清理和验证，以防止命令注入攻击。

3. **资源管理**: 对于长时间运行的命令或连续执行多个命令时，考虑使用 `executeCommandStream` 实时处理输出，并在需要时终止执行。

4. **环境变量**: 当需要为命令设置特定环境变量而不影响全局环境时，使用 `executeCommandWithEnv`。

5. **解析输出**: 当执行产生结构化输出的命令时，考虑使用 `processLine` 回调逐行解析输出，而不是一次处理整个输出。

6. **退出状态**: 在需要知道命令的退出状态以及输出时，使用 `executeCommandWithStatus` 或 `executeCommandSimple`。

7. **输入处理**: 对于需要输入的命令，使用 `executeCommandWithInput` 以编程方式提供输入数据。

8. **进程管理**: 明智地使用 `killProcessByName` 和 `killProcessByPID`，确保您拥有必要的权限，并且终止进程不会导致数据损坏或系统不稳定。
