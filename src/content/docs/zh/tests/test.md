---
title: Atom 测试框架
description: Atom 测试框架的全面文档，包括关键特性、核心组件、测试注册与执行、断言、高级特性和使用示例。
---

## 概述

Atom 测试框架是一个全面的 C++ 测试库，旨在易于使用、灵活且高效。它提供了一系列丰富的特性，用于编写和运行单元测试，包括对异步测试、并行测试执行和各种断言类型的支持。

## 目录

1. [关键特性](#关键特性)
2. [核心组件](#核心组件)
3. [测试注册与执行](#测试注册与执行)
4. [断言](#断言)
5. [高级特性](#高级特性)
6. [使用示例](#使用示例)

## 关键特性

- 简单的测试用例注册
- 支持测试套件
- 异步测试执行
- 并行测试执行
- 可自定义的测试钩子（每个测试前/后、所有测试前/后）
- 综合的断言集
- 测试结果报告（控制台输出和可导出格式）
- 测试过滤和依赖管理
- 针对不稳定测试的重试机制

## 核心组件

### TestCase

`TestCase` 结构体表示一个单独的测试用例：

```cpp
struct TestCase {
    std::string name;
    std::function<void()> func;
    bool skip = false;
    bool async = false;
    double timeLimit = 0.0;
    std::vector<std::string> dependencies;
};
```

### TestResult

`TestResult` 结构体存储测试用例的结果：

```cpp
struct TestResult {
    std::string name;
    bool passed;
    bool skipped;
    std::string message;
    double duration;
    bool timedOut;
};
```

### TestSuite

`TestSuite` 结构体将相关测试用例分组：

```cpp
struct TestSuite {
    std::string name;
    std::vector<TestCase> testCases;
};
```

### TestStats

`TestStats` 结构体跟踪总体测试统计信息：

```cpp
struct TestStats {
    int totalTests = 0;
    int totalAsserts = 0;
    int passedAsserts = 0;
    int failedAsserts = 0;
    int skippedTests = 0;
    std::vector<TestResult> results;
};
```

## 测试注册与执行

### 注册测试

可以使用 `registerTest` 函数或 `_test` 用户定义字面量注册测试：

```cpp
registerTest("测试名称", []() { /* 测试代码 */ });

"测试名称"_test([]() { /* 测试代码 */ }, async, timeLimit, skip, dependencies);
```

### 运行测试

可以使用 `runTests` 函数运行测试，该函数接受命令行参数：

```cpp
int main(int argc, char* argv[]) {
    atom::test::runTests(argc, argv);
    return 0;
}
```

命令行选项包括：

- `--retry <count>`: 失败测试的重试次数
- `--parallel <threads>`: 启用并行执行，并指定线程数
- `--export <format> <filename>`: 以指定格式导出测试结果（json、xml、html）

## 断言

该框架提供了一系列断言宏：

- `expect(expr)`: 一般断言
- `expect_eq(lhs, rhs)`: 相等断言
- `expect_ne(lhs, rhs)`: 不相等断言
- `expect_gt(lhs, rhs)`: 大于断言
- `expect_lt(lhs, rhs)`: 小于断言
- `expect_ge(lhs, rhs)`: 大于或等于断言
- `expect_le(lhs, rhs)`: 小于或等于断言
- `expect_approx(lhs, rhs, eps)`: 近似相等断言
- `expect_contains(str, substr)`: 字符串包含断言
- `expect_set_eq(lhs, rhs)`: 集合相等断言

## 高级特性

### 异步测试

可以将测试标记为异步并设置时间限制：

```cpp
"异步测试"_test([]() { /* 异步测试代码 */ }, true, 1000.0);
```

### 并行执行

可以通过指定 `--parallel` 选项以并行方式运行测试：

```bash
./test_program --parallel 4
```

### 测试钩子

可以为测试执行设置自定义钩子：

```cpp
getHooks().beforeEach = []() { /* 每个测试前的设置 */ };
getHooks().afterEach = []() { /* 每个测试后的清理 */ };
getHooks().beforeAll = []() { /* 所有测试前的设置 */ };
getHooks().afterAll = []() { /* 所有测试后的清理 */ };
```

### 测试过滤

可以使用正则表达式过滤测试：

```cpp
auto filteredTests = filterTests(std::regex("测试模式"));
```

### 测试依赖

测试可以指定对其他测试的依赖：

```cpp
"依赖测试"_test([]() { /* 测试代码 */ }, false, 0.0, false, {"前提测试"});
```

## 使用示例

以下是如何使用 Atom 测试框架的简单示例：

```cpp
#include "atom_test.hpp"

using namespace atom::test;

int main(int argc, char* argv[]) {
    "加法测试"_test([]() {
        expect_eq(2 + 2, 4);
    });

    "异步测试"_test([]() {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        expect(true);
    }, true, 200.0);

    runTests(argc, argv);
    return 0;
}
```
