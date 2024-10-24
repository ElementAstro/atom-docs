---
title: 模拟退火算法实现
description: C++ 中模拟退火算法实现的详细说明，包括 `SimulatedAnnealing` 类和一个示例问题（旅行商问题）。
---

## 目录

1. [概述](#概述)
2. [SimulatedAnnealing 类](#simulatedannealing-类)
3. [旅行商问题（TSP）实现](#旅行商问题-tsp-实现)
4. [使用示例](#使用示例)
5. [优化技术](#优化技术)

## 概述

模拟退火算法是一种概率性技术，用于近似给定函数的全局最优解。它通常用于优化问题，在这些问题中，找到精确解是不切实际的。此实现提供了一种灵活高效的方式将模拟退火应用于各种问题。

## SimulatedAnnealing 类

### 类模板

```cpp
template <typename ProblemType, typename SolutionType>
    requires AnnealingProblem<ProblemType, SolutionType>
class SimulatedAnnealing;
```

`SimulatedAnnealing` 类是模板化的，可以与不同的问题类型和解的表示一起使用。

### 构造函数

```cpp
SimulatedAnnealing(ProblemType& problemInstance,
                   AnnealingStrategy coolingStrategy = AnnealingStrategy::EXPONENTIAL,
                   int maxIterations = K_DEFAULT_MAX_ITERATIONS,
                   double initialTemperature = K_DEFAULT_INITIAL_TEMPERATURE);
```

- `problemInstance`：对问题实例的引用。
- `coolingStrategy`：降低温度的策略（默认：指数）。
- `maxIterations`：最大迭代次数（默认：1000）。
- `initialTemperature`：起始温度（默认：100.0）。

### 公共方法

1. `setCoolingSchedule(AnnealingStrategy strategy)`

   - 根据指定策略设置冷却计划。

2. `setProgressCallback(std::function<void(int, double, const SolutionType&)> callback)`

   - 设置一个回调函数，以在优化过程中报告进度。

3. `setStopCondition(std::function<bool(int, double, const SolutionType&)> condition)`

   - 设置一个条件，以提前停止优化过程。

4. `optimize(int numThreads = 1) -> SolutionType`

   - 运行优化过程，并指定线程数量。
   - 返回找到的最佳解决方案。

5. `getBestEnergy() const -> double`
   - 返回找到的最佳解决方案的能量（成本）。

### 私有方法

1. `optimizeThread()`
   - 每个线程执行的主要优化循环。

## 旅行商问题（TSP）实现

TSP 类演示了如何实现特定问题，以便与 `SimulatedAnnealing` 类一起使用。

### 构造函数

```cpp
TSP(const std::vector<std::pair<double, double>>& cities);
```

- `cities`：一个表示城市位置的 (x, y) 坐标的向量。

### 公共方法

1. `energy(const std::vector<int>& solution) const -> double`

   - 计算给定旅行路线（解决方案）的总距离。

2. `neighbor(const std::vector<int>& solution) -> std::vector<int>`

   - 通过交换两个城市生成一个邻近的解决方案。

3. `randomSolution() const -> std::vector<int>`
   - 生成一个随机的初始解决方案。

## 使用示例

以下是如何使用 `SimulatedAnnealing` 类与 TSP 问题的示例：

```cpp
#include "annealing.hpp"
#include <iostream>

int main() {
    // 定义城市
    std::vector<std::pair<double, double>> cities = {
        {0, 0}, {1, 5}, {2, 2}, {3, 3}, {5, 1}
    };

    // 创建 TSP 实例
    TSP tsp(cities);

    // 创建 SimulatedAnnealing 实例
    SimulatedAnnealing<TSP, std::vector<int>> sa(tsp);

    // 设置进度回调（可选）
    sa.setProgressCallback([](int iteration, double energy, const std::vector<int>& solution) {
        std::cout << "Iteration " << iteration << ": Energy = " << energy << std::endl;
    });

    // 运行优化
    auto bestSolution = sa.optimize(4);  // 使用 4 个线程

    // 打印结果
    std::cout << "最佳解决方案能量: " << sa.getBestEnergy() << std::endl;
    std::cout << "最佳旅行路线: ";
    for (int city : bestSolution) {
        std::cout << city << " ";
    }
    std::cout << std::endl;

    return 0;
}
```

## 优化技术

1. **SIMD 指令**：TSP 类中的 `energy` 计算在可用时使用 SIMD（单指令多数据）指令来并行化距离计算。

2. **多线程**：`optimize` 方法支持并行运行多个优化线程。

3. **灵活的冷却策略**：该实现支持不同的冷却策略（线性、指数、对数），可以轻松切换。

4. **提前停止**：可以设置自定义停止条件，以在满足特定条件时提前终止优化过程。

5. **进度跟踪**：可以设置回调函数来实时监控优化进度。
