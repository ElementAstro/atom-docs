---
title: 触发器
description: atom::async 命名空间中 Trigger 类的详细文档，包括构造函数、成员函数、类型别名、异常处理和使用示例，用于处理带参数的事件驱动回调。
---

## 类声明

```cpp
namespace atom::async {
template <typename ParamType>
    requires CallableWithParam<ParamType>
class Trigger {
    // ... (成员函数和私有成员)
};
}
```

`Trigger` 类以 `ParamType` 作为模板参数，该参数必须满足 `CallableWithParam` 概念。

## 概念

### CallableWithParam

```cpp
template <typename ParamType>
concept CallableWithParam = requires(ParamType p) {
    std::invoke(std::declval<std::function<void(ParamType)>>(), p);
};
```

该概念检查是否可以使用类型 `ParamType` 的实例调用 `std::function`。

## 类型别名和枚举

```cpp
using Callback = std::function<void(ParamType)>;

enum class CallbackPriority { High, Normal, Low };
```

- `Callback`：回调函数的类型别名。
- `CallbackPriority`：回调优先级级别的枚举。

## 成员函数

### registerCallback

```cpp
void registerCallback(const std::string& event, Callback callback,
                      CallbackPriority priority = CallbackPriority::Normal);
```

为指定事件注册回调。

- **参数：**
  - `event`：要注册回调的事件名称。
  - `callback`：当事件触发时执行的回调函数。
  - `priority`：回调的优先级级别（默认值为 Normal）。

### unregisterCallback

```cpp
void unregisterCallback(const std::string& event, Callback callback);
```

注销指定事件的回调。

- **参数：**
  - `event`：要注销回调的事件名称。
  - `callback`：要移除的回调函数。

### trigger

```cpp
void trigger(const std::string& event, const ParamType& param);
```

触发与指定事件关联的回调。

- **参数：**
  - `event`：要触发的事件名称。
  - `param`：传递给回调的参数。

### scheduleTrigger

```cpp
void scheduleTrigger(const std::string& event, const ParamType& param,
                     std::chrono::milliseconds delay);
```

在延迟后调度触发指定事件。

- **参数：**
  - `event`：要触发的事件名称。
  - `param`：传递给回调的参数。
  - `delay`：触发事件的延迟时间。

### cancelTrigger

```cpp
void cancelTrigger(const std::string& event);
```

取消调度的触发指定事件。

- **参数：**
  - `event`：要取消的事件名称。

### cancelAllTriggers

```cpp
void cancelAllTriggers();
```

取消所有调度的触发。

### getActiveEvents

```cpp
auto getActiveEvents() const -> std::vector<std::string>;
```

获取当前活动的事件列表。

## 使用示例

以下示例演示如何使用 `Trigger` 类：

### 基本用法

```cpp
#include "trigger.hpp"
#include <iostream>
#include <string>

int main() {
    atom::async::Trigger<std::string> eventTrigger;

    // 注册回调
    eventTrigger.registerCallback("greet", [](const std::string& name) {
        std::cout << "Hello, " << name << "!" << std::endl;
    });

    // 触发事件
    eventTrigger.trigger("greet", "Alice");

    // 调度触发
    eventTrigger.scheduleTrigger("greet", "Bob", std::chrono::milliseconds(2000));

    // 等待调度的触发
    std::this_thread::sleep_for(std::chrono::milliseconds(3000));

    return 0;
}
```

### 使用优先级

```cpp
eventTrigger.registerCallback("greet", [](const std::string& name) {
    std::cout << "Hi, " << name << "!" << std::endl;
}, atom::async::Trigger<std::string>::CallbackPriority::High);

eventTrigger.trigger("greet", "Charlie");
```

### 使用过滤器

```cpp
eventTrigger.registerCallback("number", [](int num) {
    std::cout << "Received number: " << num << std::endl;
}, atom::async::Trigger<int>::CallbackPriority::Normal, [](int num) {
    return num % 2 == 0; // 只接收偶数
});

eventTrigger.trigger("number", 1); // 不会被接收
eventTrigger.trigger("number", 2); // 会被接收
```

## 注意事项

- `Trigger` 类是线程安全的，使用互斥量保护对其内部结构的访问。
- 回调按优先级排序后执行，优先级高的回调先执行。
- 回调中抛出的异常会被捕获并吞没，以防止中断其他回调的执行。
- 该类支持同步和异步事件的触发。
- 使用 `cancelTrigger` 和 `cancelAllTriggers` 时要小心，因为它们将移除指定事件（们）的所有注册回调。
