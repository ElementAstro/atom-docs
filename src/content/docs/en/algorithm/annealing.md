---
title: Simulated Annealing Algorithm
description: Detailed explanation of the Simulated Annealing algorithm implementation in C++, including the SimulatedAnnealing class and an example problem (Traveling Salesman Problem).
---

## Overview

This library provides a **flexible and efficient implementation of the Simulated Annealing algorithm** for solving optimization problems. Simulated Annealing is a probabilistic technique used to find global optima in complex search spaces with many local minima.

## Key Features

- **Generic implementation** using C++ templates and concepts
- **Multiple cooling strategies** for different problem types
- **Parallel optimization** with multi-threading support
- **Restart mechanisms** to escape local minima
- **Adaptive temperature control**
- **Comprehensive progress monitoring** and statistics
- **SIMD acceleration** when available
- **Optional Boost integration**

## Core Components

### AnnealingProblem Concept

This concept defines the requirements for problem types that can be solved using this library:

```cpp
template <typename ProblemType, typename SolutionType>
concept AnnealingProblem =
    requires(ProblemType problemInstance, SolutionType solutionInstance) {
        { problemInstance.energy(solutionInstance) } -> std::floating_point;
        { problemInstance.neighbor(solutionInstance) } -> std::same_as<SolutionType>;
        { problemInstance.randomSolution() } -> std::same_as<SolutionType>;
        { problemInstance.validate(solutionInstance) } -> std::same_as<bool>;
    };
```

Your problem class must implement:

- **`energy(solution)`**: Calculate the energy (cost) of a solution
- **`neighbor(solution)`**: Generate a neighboring solution by making a small change
- **`randomSolution()`**: Create a random valid solution
- **`validate(solution)`**: Verify if a solution is valid

### Cooling Strategies

The algorithm supports **seven different cooling strategies**:

```cpp
enum class AnnealingStrategy {
    LINEAR,
    EXPONENTIAL,
    LOGARITHMIC,
    GEOMETRIC,
    QUADRATIC,
    HYPERBOLIC,
    ADAPTIVE
};
```

Each strategy provides different temperature reduction patterns:

- **LINEAR**: Temperature decreases linearly with iterations
- **EXPONENTIAL**: Temperature decreases exponentially (most common)
- **LOGARITHMIC**: Temperature decreases logarithmically (very slow cooling)
- **GEOMETRIC**: Temperature decreases as 1/(1+αt)
- **QUADRATIC**: Temperature decreases as 1/(1+αt²)
- **HYPERBOLIC**: Temperature decreases as 1/(1+α√t)
- **ADAPTIVE**: Adjusts cooling rate based on acceptance rate

## Main Class: SimulatedAnnealing

### Constructor & Builder Pattern

The `SimulatedAnnealing` class uses a **builder pattern** for flexible initialization:

```cpp
SimulatedAnnealing<MyProblem, MySolution>::Builder builder(problemInstance);
auto annealing = builder
    .setCoolingStrategy(AnnealingStrategy::EXPONENTIAL)
    .setMaxIterations(10000)
    .setInitialTemperature(100.0)
    .setCoolingRate(0.95)
    .setRestartInterval(500)
    .build();
```

### Core Methods

#### `setCoolingSchedule(AnnealingStrategy strategy)`

Sets the cooling schedule based on the specified strategy.

**Parameters:**

- `strategy`: The cooling strategy to use

**Example:**

```cpp
annealing.setCoolingSchedule(AnnealingStrategy::ADAPTIVE);
```

#### `setProgressCallback(std::function<void(int, double, const SolutionType&)> callback)`

Registers a callback function that will be invoked after each iteration.

**Parameters:**

- `callback`: Function taking iteration number, current energy, and current solution

**Example:**

```cpp
annealing.setProgressCallback([](int iter, double energy, const auto& sol) {
    std::cout << "Iteration " << iter << ": " << energy << std::endl;
});
```

#### `setStopCondition(std::function<bool(int, double, const SolutionType&)> condition)`

Sets a custom stop condition to terminate optimization early.

**Parameters:**

- `condition`: Function that returns true when optimization should stop

**Example:**

```cpp
annealing.setStopCondition([](int iter, double energy, const auto& sol) {
    return energy < 100.0 || iter > 5000;
});
```

#### `optimize(int numThreads = 1) -> SolutionType`

Runs the optimization process with specified number of threads.

**Parameters:**

- `numThreads`: Number of parallel optimization threads (default: 1)

**Returns:**

- The best solution found

**Example:**

```cpp
auto bestSolution = annealing.optimize(4);  // Run with 4 threads
```

#### `getBestEnergy() -> double`

Gets the energy value of the best solution found.

**Returns:**

- The energy of the best solution

**Example:**

```cpp
double energy = annealing.getBestEnergy();
```

#### `setInitialTemperature(double temperature)`

Sets the initial temperature for the annealing process.

**Parameters:**

- `temperature`: The starting temperature (must be positive)

**Example:**

```cpp
annealing.setInitialTemperature(200.0);
```

#### `setCoolingRate(double rate)`

Sets the cooling rate parameter that determines how quickly temperature decreases.

**Parameters:**

- `rate`: The cooling rate (must be between 0 and 1)

**Example:**

```cpp
annealing.setCoolingRate(0.98);
```

## TSP Implementation Example

The library includes a sample implementation for the **Traveling Salesman Problem**:

```cpp
class TSP {
private:
    std::vector<std::pair<double, double>> cities_;

public:
    explicit TSP(const std::vector<std::pair<double, double>>& cities);
    auto energy(const std::vector<int>& solution) const -> double;
    static auto neighbor(const std::vector<int>& solution) -> std::vector<int>;
    auto randomSolution() const -> std::vector<int>;
};
```

## Complete Usage Example

Here's a comprehensive example showing how to solve the Traveling Salesman Problem:

```cpp
#include "atom/algorithm/annealing.hpp"
#include <iostream>
#include <vector>

int main() {
    // 1. Create a TSP instance with city coordinates
    std::vector<std::pair<double, double>> cities = {
        {0.0, 0.0},    // City 0
        {1.0, 0.0},    // City 1
        {1.0, 1.0},    // City 2
        {0.0, 1.0},    // City 3
        {0.5, 0.5},    // City 4
        {0.0, 0.5},    // City 5
        {1.0, 0.5},    // City 6
        {0.5, 0.0},    // City 7
        {0.5, 1.0}     // City 8
    };
    
    TSP tspProblem(cities);
    
    // 2. Configure the simulated annealing solver
    SimulatedAnnealing<TSP, std::vector<int>>::Builder builder(tspProblem);
    auto annealing = builder
        .setCoolingStrategy(AnnealingStrategy::ADAPTIVE)
        .setMaxIterations(10000)
        .setInitialTemperature(100.0)
        .setCoolingRate(0.95)
        .setRestartInterval(500)
        .build();
    
    // 3. Add a progress callback
    annealing.setProgressCallback([](int iteration, double energy, const std::vector<int>& solution) {
        if (iteration % 1000 == 0) {
            std::cout << "Iteration " << iteration << ": Energy = " << energy << std::endl;
        }
    });
    
    // 4. Set a stop condition
    annealing.setStopCondition([](int iteration, double energy, const std::vector<int>& solution) {
        return energy < 5.0 || iteration > 9000;
    });
    
    // 5. Run the optimization with 4 threads
    std::cout << "Starting optimization..." << std::endl;
    auto bestSolution = annealing.optimize(4);
    
    // 6. Output results
    std::cout << "Optimization completed." << std::endl;
    std::cout << "Best tour found has length: " << annealing.getBestEnergy() << std::endl;
    
    std::cout << "Tour order: ";
    for (int cityIndex : bestSolution) {
        std::cout << cityIndex << " ";
    }
    std::cout << std::endl;
    
    return 0;
}
```

## Advanced Features

### Restart Mechanism

The restart mechanism helps escape local minima by periodically generating new random solutions:

```cpp
builder.setRestartInterval(500);  // Restart every 500 iterations
```

### Adaptive Temperature Control

When using `AnnealingStrategy::ADAPTIVE`, the cooling rate is automatically adjusted based on the acceptance rate of new solutions, optimizing the exploration-exploitation balance.

### SIMD Acceleration

The library uses SIMD instructions on supported platforms:

- **AVX2** on x86_64 architectures
- **NEON** on ARM architectures

To enable SIMD optimizations, define `ATOM_USE_SIMD` before including the header.

### Boost Integration

For enhanced random number generation and thread management, define `ATOM_USE_BOOST` before including the header.

## Best Practices

1. **Choose an appropriate cooling strategy** for your problem
2. **Set a high enough initial temperature** to allow exploration of the search space
3. **Experiment with different cooling rates** to balance exploration and exploitation
4. **Use multiple threads** for complex problems to find better solutions faster
5. **Implement an effective neighbor function** that makes meaningful changes to solutions
6. **Set proper restart intervals** to escape local minima
7. **Use the progress callback** for monitoring and logging
8. **Define a custom stop condition** based on solution quality

## Performance Considerations

- The **computational cost** is dominated by the `energy()` and `neighbor()` functions
- **Optimize these functions** for your specific problem
- **Use SIMD acceleration** for performance-critical calculations
- **Multi-threading** significantly improves results for complex problems
