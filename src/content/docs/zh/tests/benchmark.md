---
title: 基准测试
description: 基准测试类的全面文档，包括构造函数、配置选项、成员函数和在 C++ 中基准测试代码性能的使用示例。
---

## 概述

`Benchmark` 类提供了一个全面的解决方案，用于基准测试代码性能。它提供了多次迭代、预热运行、异步执行等功能，以及包括 CPU 和内存统计信息在内的详细性能指标。

## 类定义

```cpp
class Benchmark {
public:
    using Clock = std::chrono::high_resolution_clock;
    using TimePoint = Clock::time_point;
    using Duration = Clock::duration;

    struct Config {
        int minIterations = 10;
        double minDurationSec = 1.0;
        bool async = false;
        bool warmup = true;
        std::string exportFormat = "json";
        Config() {}
    } ATOM_ALIGNAS(64);

    struct MemoryStats {
        size_t currentUsage;
        size_t peakUsage;
    } ATOM_ALIGNAS(16);

    struct CPUStats {
        long long instructionsExecuted;
        long long cyclesElapsed;
        long long branchMispredictions;
        long long cacheMisses;
    } ATOM_ALIGNAS(32);

    Benchmark(std::string suiteName, std::string name, Config config = {});

    template <typename SetupFunc, typename Func, typename TeardownFunc>
    void run(SetupFunc&& setupFunc, Func&& func, TeardownFunc&& teardownFunc);

    static void printResults(const std::string& suite = "");
    static void exportResults(const std::string& filename);

    // ... (省略私有成员以简化)
};
```

## 构造函数

```cpp
Benchmark(std::string suiteName, std::string name, Config config = {});
```

创建一个新的 `Benchmark` 对象。

- **参数:**
  - `suiteName`: 基准测试套件的名称。
  - `name`: 特定基准测试的名称。
  - `config`: 基准测试的配置设置（可选）。

## 成员函数

### run

```cpp
template <typename SetupFunc, typename Func, typename TeardownFunc>
void run(SetupFunc&& setupFunc, Func&& func, TeardownFunc&& teardownFunc);
```

使用指定的设置、主函数和拆卸步骤运行基准测试。

- **参数:**
  - `setupFunc`: 用于设置基准测试环境的函数。
  - `func`: 要基准测试的主函数。
  - `teardownFunc`: 用于基准测试结束后清理的函数。

### printResults

```cpp
static void printResults(const std::string& suite = "");
```

打印所有基准测试的结果或特定套件的结果。

- **参数:**
  - `suite`: 可选的套件名称以过滤结果（默认: 打印所有结果）。

### exportResults

```cpp
static void exportResults(const std::string& filename);
```

将基准测试结果导出到文件。

- **参数:**
  - `filename`: 要导出结果的文件名。

## 配置 (Config 结构体)

- `minIterations`: 最小运行的迭代次数（默认: 10）。
- `minDurationSec`: 基准测试的最小持续时间（以秒为单位，默认: 1.0）。
- `async`: 是否异步运行基准测试（默认: false）。
- `warmup`: 是否执行预热运行（默认: true）。
- `exportFormat`: 导出结果的格式（默认: "json"）。

## 使用示例

### 示例 1：基本基准测试

```cpp
#include "benchmark.hpp"
#include <vector>
#include <algorithm>

void benchmarkSort() {
    Benchmark::Config config;
    config.minIterations = 100;
    config.minDurationSec = 2.0;

    BENCHMARK("Sorting", "std::sort",
        // 设置
        []() {
            std::vector<int> vec(10000);
            for (int i = 0; i < 10000; ++i) vec[i] = rand();
            return vec;
        },
        // 基准测试函数
        [](std::vector<int>& vec) {
            std::sort(vec.begin(), vec.end());
            return vec.size();  // 返回操作的数量
        },
        // 拆卸
        [](std::vector<int>&) {},
        config
    );
}

int main() {
    benchmarkSort();
    Benchmark::printResults();
    Benchmark::exportResults("benchmark_results.json");
    return 0;
}
```

### 示例 2：使用自定义配置的异步基准测试

```cpp
#include "benchmark.hpp"
#include <thread>

void benchmarkThreadCreation() {
    Benchmark::Config config;
    config.async = true;
    config.warmup = false;
    config.minIterations = 50;

    BENCHMARK("Threading", "Thread Creation",
        // 设置
        []() { return 0; },
        // 基准测试函数
        [](int&) {
            std::thread t([]() { std::this_thread::sleep_for(std::chrono::milliseconds(1)); });
            t.join();
            return 1;  // 创建并加入一个线程
        },
        // 拆卸
        [](int&) {},
        config
    );
}

int main() {
    benchmarkThreadCreation();
    Benchmark::printResults("Threading");
    return 0;
}
```

## 重要考虑事项

1. **性能影响**：基准测试本身可能会有一些开销，特别是在测量非常快速的操作时。在解释结果时请考虑这一点。

2. **系统负载**：外部因素如系统负载可能会影响基准测试结果。尽量在后台活动最少的系统上运行基准测试，以获得更一致的结果。

3. **编译器优化**：请注意，激进的编译器优化可能会消除看似没有可观察效果的代码。如果必要，确保您的基准测试函数具有可观察的副作用。

4. **预热运行**：预热功能对于触发任何延迟初始化或缓存预热非常有用，这可以为后续运行提供更稳定的结果。

5. **异步执行**：使用异步功能时，请注意与其他系统进程的潜在资源争用。

6. **内存和 CPU 统计**：内存和 CPU 统计的准确性可能因平台和可用的系统 API 而异。

## 最佳实践

1. **代表性数据**：使用与真实使用情况相符的数据集和操作进行基准测试。

2. **多次运行**：多次运行基准测试并分析结果的分布，以考虑变异性。

3. **比较基准**：在可能的情况下，对同一功能的不同实现进行基准测试，以进行相对比较。

4. **粒度选择**：为基准测试选择适当的粒度。极短的操作可能需要在基准测试函数中重复执行以获得准确的计时。

5. **环境控制**：记录并控制基准测试运行的环境（硬件、操作系统、编译器设置），以确保可重复性。

6. **结果分析**：使用提供的统计信息（平均值、中位数、标准差）来全面了解性能特征。
