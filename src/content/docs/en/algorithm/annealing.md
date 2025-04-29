---
title: Simulated Annealing Algorithm
description: Detailed explanation of the Simulated Annealing algorithm implementation in C++, including the SimulatedAnnealing class and an example problem (Traveling Salesman Problem).
---

## Overview

This library provides a robust and flexible implementation of the Simulated Annealing algorithm for solving optimization problems in C++. Simulated annealing is a probabilistic technique for approximating the global optimum of a given function, particularly useful for problems where finding an exact solution is impractical.

The implementation offers several key features:

- Generic programming approach using C++20 concepts
- Multiple cooling strategies to control the annealing process
- Parallel execution support with multiple threads
- SIMD acceleration for performance-critical calculations (optional)
- Adaptive temperature adjustment capabilities
- Comprehensive logging and error tracking
- Builder pattern for easy configuration

The library is designed to be both powerful for experienced C++ developers and accessible to newcomers to optimization algorithms.

## Library Dependencies

### Required Headers

```cpp
#include <algorithm>
#include <atomic>
#include <cmath>
#include <functional>
#include <limits>
#include <memory>
#include <mutex>
#include <numeric>
#include <random>
#include <sstream>
#include <thread>
#include <vector>
```

### Optional Dependencies

The library can utilize the following optional components:

- SIMD Instructions: Enabled via the `ATOM_USE_SIMD` define
  - x86_64: Uses `<immintrin.h>` for AVX2 instructions
  - ARM64: Uses `<arm_neon.h>` for NEON instructions

- Boost Library: Enabled via the `ATOM_USE_BOOST` define
  - `<boost/random.hpp>`: For improved random number generation
  - `<boost/thread.hpp>`: For enhanced threading capabilities

- Atom Library Components:
  - `atom/error/exception.hpp`: For exception handling
  - `atom/log/loguru.hpp`: For logging functionality

## Core Components

### The AnnealingProblem Concept

The `AnnealingProblem` concept defines the requirements that any problem class must satisfy to be usable with the `SimulatedAnnealing` algorithm.

```cpp
template <typename ProblemType, typename SolutionType>
concept AnnealingProblem =
    requires(ProblemType problemInstance, SolutionType solutionInstance) {
        {
            problemInstance.energy(solutionInstance)
        } -> std::floating_point;  // Must return a floating-point energy value
        {
            problemInstance.neighbor(solutionInstance)
        } -> std::same_as<SolutionType>;  // Must generate a neighbor solution
        { problemInstance.randomSolution() } -> std::same_as<SolutionType>;  // Must create a random solution
    };
```

The concept requires three key functions:

1. `energy(solution)`: Calculates the energy (objective function) of a solution
   - Parameters: A solution instance
   - Returns: A floating-point value representing the energy (lower is better)

2. `neighbor(solution)`: Generates a neighboring solution by small modifications
   - Parameters: A current solution
   - Returns: A new solution that is "nearby" in the solution space

3. `randomSolution()`: Creates a completely random solution
   - Returns: A valid random solution in the solution space

### SimulatedAnnealing Class

The `SimulatedAnnealing` class implements the annealing algorithm and manages the optimization process.

```cpp
template <typename ProblemType, typename SolutionType>
    requires AnnealingProblem<ProblemType, SolutionType>
class SimulatedAnnealing {
    // Implementation details...
public:
    class Builder {...}  // Builder pattern for instantiation
    
    // Main constructor (use the Builder instead)
    explicit SimulatedAnnealing(const Builder& builder);
    
    // Configuration methods
    void setCoolingSchedule(AnnealingStrategy strategy);
    void setProgressCallback(std::function<void(int, double, const SolutionType&)> callback);
    void setStopCondition(std::function<bool(int, double, const SolutionType&)> condition);
    void setInitialTemperature(double temperature);
    void setCoolingRate(double rate);
    
    // Optimization execution
    auto optimize(int numThreads = 1) -> SolutionType;
    
    // Result retrieval
    [[nodiscard]] auto getBestEnergy() -> double;
};
```

#### Builder Pattern

The `SimulatedAnnealing` class uses the Builder pattern for better construction and configuration:

```cpp
class Builder {
public:
    Builder(ProblemType& problemInstance);
    
    Builder& setCoolingStrategy(AnnealingStrategy strategy);
    Builder& setMaxIterations(int iterations);
    Builder& setInitialTemperature(double temperature);
    Builder& setCoolingRate(double rate);
    Builder& setRestartInterval(int interval);
    
    SimulatedAnnealing build();
};
```

#### Key Methods

1. `setCoolingSchedule(strategy)`
   - Purpose: Sets the temperature reduction strategy
   - Parameters: `strategy` - One of the defined `AnnealingStrategy` values
   - Effect: Changes how temperature decreases over iterations

2. `setProgressCallback(callback)`
   - Purpose: Registers a function to receive progress updates
   - Parameters: `callback` - Function accepting iteration count, current energy, and current solution
   - Effect: The callback will be invoked at each iteration

3. `setStopCondition(condition)`
   - Purpose: Defines a custom termination criterion
   - Parameters: `condition` - Function that returns true when optimization should stop
   - Effect: Optimization stops when the condition returns true

4. `optimize(numThreads)`
   - Purpose: Runs the simulated annealing algorithm
   - Parameters: `numThreads` - Number of parallel threads to use (default: 1)
   - Returns: The best solution found
   - Effect: Performs the optimization process using the configured parameters
   - Exceptions: Propagates any exceptions from the underlying problem implementation

## Cooling Strategies

The library implements several temperature cooling strategies, each with different characteristics:

```cpp
enum class AnnealingStrategy {
    LINEAR,      // Linear decrease: T = T0 * (1 - t/tmax)
    EXPONENTIAL, // Exponential decrease: T = T0 * (cooling_rate^t)
    LOGARITHMIC, // Logarithmic decrease: T = T0 / log(t+2)
    GEOMETRIC,   // Geometric decrease: T = T0 / (1 + cooling_rate*t)
    QUADRATIC,   // Quadratic decrease: T = T0 / (1 + cooling_rate*t²)
    HYPERBOLIC,  // Hyperbolic decrease: T = T0 / (1 + cooling_rate*sqrt(t))
    ADAPTIVE     // Adaptive cooling based on acceptance rates
};
```

Strategy Selection Guide:

- LINEAR: Simple and predictable. Good for initial testing.
- EXPONENTIAL: Fast cooling, suitable when quick convergence is important.
- LOGARITHMIC: Very slow cooling, best for difficult problems requiring thorough exploration.
- GEOMETRIC: Moderate cooling, balances exploration and exploitation.
- QUADRATIC: Starts slow then accelerates cooling. Good for problems where early exploration is critical.
- HYPERBOLIC: Similar to geometric but with a different profile.
- ADAPTIVE: Automatically adjusts cooling based on acceptance rates. Best for unknown problem landscapes.

## TSP Implementation

The library includes a Traveling Salesman Problem (TSP) implementation as an example problem:

```cpp
class TSP {
private:
    std::vector<std::pair<double, double>> cities_;

public:
    explicit TSP(const std::vector<std::pair<double, double>>& cities);
    
    [[nodiscard]] auto energy(const std::vector<int>& solution) const -> double;
    [[nodiscard]] static auto neighbor(const std::vector<int>& solution) -> std::vector<int>;
    [[nodiscard]] auto randomSolution() const -> std::vector<int>;
};
```

### TSP Methods

1. `TSP(cities)`
   - Purpose: Constructor that initializes the TSP problem
   - Parameters: `cities` - Vector of coordinate pairs representing city locations

2. `energy(solution)`
   - Purpose: Calculates the total path length for a given tour
   - Parameters: `solution` - Vector of indices representing the city visitation order
   - Returns: Total tour length (distance)
   - Implementation: May use SIMD optimization if available

3. `neighbor(solution)`
   - Purpose: Generates a neighboring solution by swapping two random cities
   - Parameters: `solution` - Current tour ordering
   - Returns: Modified tour with two positions swapped

4. `randomSolution()`
   - Purpose: Creates a random tour visiting all cities
   - Returns: Random permutation of city indices

## Performance Optimizations

### SIMD Acceleration

The library uses SIMD instructions when `ATOM_USE_SIMD` is defined:

- On x86_64 platforms with AVX2 support:

  ```cpp
  __m256d v1 = _mm256_set_pd(0.0, 0.0, y1, x1);
  __m256d v2 = _mm256_set_pd(0.0, 0.0, y2, x2);
  __m256d diff = _mm256_sub_pd(v1, v2);
  __m256d squared = _mm256_mul_pd(diff, diff);
  ```

- On ARM64 platforms with NEON support:

  ```cpp
  float32x2_t p1 = vset_f32(static_cast<float>(x1), static_cast<float>(y1));
  float32x2_t p2 = vset_f32(static_cast<float>(x2), static_cast<float>(y2));
  float32x2_t diff = vsub_f32(p1, p2);
  float32x2_t squared = vmul_f32(diff, diff);
  ```

### Parallel Execution

The `optimize` method supports multi-threaded execution:

```cpp
auto SimulatedAnnealing<ProblemType, SolutionType>::optimize(int numThreads) -> SolutionType {
    // Creates multiple threads that run the optimization independently
    std::vector<std::jthread> threads;
    threads.reserve(numThreads);
    for (int threadIndex = 0; threadIndex < numThreads; ++threadIndex) {
        threads.emplace_back([this]() { optimizeThread(); });
    }
    // Returns the best solution found across all threads
    return best_solution_;
}
```

Each thread works on an independent solution path, with thread-safe updates to the best solution found.

### Restart Mechanism

The algorithm includes a restart mechanism to escape local minima:

```cpp
void restartOptimization() {
    std::lock_guard lock(best_mutex_);
    if (current_restart_ < restart_interval_) {
        current_restart_++;
        return;
    }

    LOG_F(INFO, "Performing restart optimization");
    auto newSolution = problem_instance_.randomSolution();
    double newEnergy = problem_instance_.energy(newSolution);

    if (newEnergy < best_energy_) {
        best_solution_ = newSolution;
        best_energy_ = newEnergy;
        total_restarts_++;
        current_restart_ = 0;
        LOG_F(INFO, "Restart found better solution with energy: {}", best_energy_);
    }
}
```

## Best Practices

### Configuration Guidelines

1. Initial Temperature Selection
   - Set it high enough that the algorithm accepts many transitions at the start (~80-90% acceptance rate)
   - Typically 10-100× the average energy difference between neighboring solutions

2. Cooling Strategy Selection
   - For unknown problems, start with `EXPONENTIAL` or `ADAPTIVE`
   - Use `LOGARITHMIC` for complex problems requiring extensive exploration
   - Use `LINEAR` or `EXPONENTIAL` for simpler problems

3. Cooling Rate
   - Typical values: 0.90-0.99
   - Higher values (slower cooling): Better quality, longer runtime
   - Lower values (faster cooling): Quicker results, potentially suboptimal

4. Iterations
   - Start with at least 1000 iterations
   - For complex problems, consider 10,000+ iterations
   - Monitor energy history to ensure convergence

### Common Pitfalls

1. Temperature Cooling Too Fast
   - Symptoms: Quick convergence to poor solutions, low acceptance rates
   - Solution: Increase initial temperature or cooling rate (closer to 1.0)

2. Temperature Cooling Too Slowly
   - Symptoms: Excessive runtime, algorithm wanders without converging
   - Solution: Decrease initial temperature or cooling rate

3. Poor Neighbor Function
   - Symptoms: Inability to escape local minima, plateau in solution quality
   - Solution: Redesign neighbor function to make more impactful changes

4. Thread Contention
   - Symptoms: Poor scaling with more threads, high CPU usage with limited progress
   - Solution: Reduce thread count or adjust the locking strategy

## Complete Example

The following example demonstrates how to use the library to solve a Traveling Salesman Problem:

```cpp
#include <iostream>
#include <vector>
#include "atom/algorithm/annealing.hpp"

// Define a simple problem instance
int main() {
    try {
        // Create a TSP instance with 10 cities in a circle
        std::vector<std::pair<double, double>> cities;
        for (int i = 0; i < 10; ++i) {
            double angle = 2.0 * M_PI * i / 10.0;
            cities.emplace_back(std::cos(angle), std::sin(angle));
        }
        
        TSP tspProblem(cities);
        
        // Configure the simulated annealing solver using the Builder pattern
        auto annealingBuilder = SimulatedAnnealing<TSP, std::vector<int>>::Builder(tspProblem)
            .setCoolingStrategy(AnnealingStrategy::EXPONENTIAL)
            .setMaxIterations(10000)
            .setInitialTemperature(100.0)
            .setCoolingRate(0.95)
            .setRestartInterval(1000);
            
        auto annealing = annealingBuilder.build();
        
        // Set a progress callback to display intermittent results
        annealing.setProgressCallback([](int iteration, double energy, const std::vector<int>& solution) {
            if (iteration % 1000 == 0) {
                std::cout << "Iteration " << iteration << ", Energy: " << energy << std::endl;
            }
        });
        
        // Set a stop condition (optional)
        annealing.setStopCondition([](int iteration, double energy, const std::vector<int>& solution) {
            // Stop if we reach a near-optimal solution (circle perimeter ≈ 2π)
            return energy <= 6.3; // Slightly above 2π
        });
        
        // Run the optimization with 4 threads
        std::cout << "Starting optimization..." << std::endl;
        auto bestSolution = annealing.optimize(4);
        
        // Display the results
        std::cout << "Optimization complete!" << std::endl;
        std::cout << "Best tour length: " << annealing.getBestEnergy() << std::endl;
        std::cout << "Tour: ";
        for (int city : bestSolution) {
            std::cout << city << " ";
        }
        std::cout << std::endl;
        
        return 0;
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
}
```

### Expected Output

```
Starting optimization...
Iteration 0, Energy: 12.4721
Iteration 1000, Energy: 7.8432
Iteration 2000, Energy: 6.8914
Iteration 3000, Energy: 6.4289
Iteration 4000, Energy: 6.3051
Optimization complete!
Best tour length: 6.2832
Tour: 0 1 2 3 4 5 6 7 8 9
```

## Advanced Usage Examples

### Custom Problem Implementation

To implement your own optimization problem, create a class that satisfies the `AnnealingProblem` concept:

```cpp
class CustomProblem {
private:
    // Problem-specific data
    std::vector<double> weights_;
    
public:
    explicit CustomProblem(const std::vector<double>& weights) : weights_(weights) {}
    
    // Energy function - evaluates a solution (lower is better)
    [[nodiscard]] double energy(const std::vector<bool>& solution) const {
        double total = 0.0;
        for (size_t i = 0; i < solution.size(); ++i) {
            if (solution[i]) {
                total += weights_[i];
            }
        }
        return total;
    }
    
    // Generate a neighbor by flipping one bit
    [[nodiscard]] static std::vector<bool> neighbor(const std::vector<bool>& solution) {
        std::vector<bool> result = solution;
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_int_distribution<size_t> dist(0, solution.size() - 1);
        size_t pos = dist(gen);
        result[pos] = !result[pos];
        return result;
    }
    
    // Generate a random solution
    [[nodiscard]] std::vector<bool> randomSolution() const {
        std::vector<bool> solution(weights_.size());
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_int_distribution<int> dist(0, 1);
        for (size_t i = 0; i < solution.size(); ++i) {
            solution[i] = dist(gen) == 1;
        }
        return solution;
    }
};
```

### Using Adaptive Temperature Control

For problems where the optimal cooling schedule is unknown:

```cpp
// Setup with adaptive cooling
auto annealing = SimulatedAnnealing<MyProblem, MySolution>::Builder(problem)
    .setCoolingStrategy(AnnealingStrategy::ADAPTIVE)
    .setMaxIterations(10000)
    .setInitialTemperature(100.0)
    .setCoolingRate(0.98)  // Initial rate, will adapt automatically
    .build();

// The cooling rate will adjust based on acceptance rates
auto solution = annealing.optimize();
```

### Handling Large-Scale Problems

For very large problems, consider the following approach:

```cpp
// 1. Start with a high temperature and fast cooling to get a reasonable starting point
auto initialAnnealing = SimulatedAnnealing<LargeProblem, LargeSolution>::Builder(problem)
    .setCoolingStrategy(AnnealingStrategy::EXPONENTIAL)
    .setMaxIterations(1000)
    .setInitialTemperature(1000.0)
    .setCoolingRate(0.9)  // Fast cooling
    .build();

auto initialSolution = initialAnnealing.optimize();
double initialEnergy = problem.energy(initialSolution);
std::cout << "Initial optimization: " << initialEnergy << std::endl;

// 2. Refine with a slower cooling schedule starting from the previous solution
problem.setInitialSolution(initialSolution);  // Custom method to set starting point

auto refinementAnnealing = SimulatedAnnealing<LargeProblem, LargeSolution>::Builder(problem)
    .setCoolingStrategy(AnnealingStrategy::LOGARITHMIC)  // Slower cooling
    .setMaxIterations(10000)
    .setInitialTemperature(10.0)  // Lower temperature
    .build();

auto finalSolution = refinementAnnealing.optimize(8);  // Use more threads
double finalEnergy = problem.energy(finalSolution);
std::cout << "Final optimization: " << finalEnergy << std::endl;
```

## Platform-Specific Considerations

### Compiler Support

- Required: C++20 compatible compiler for concepts support
- Recommended:
  - GCC 10+ or Clang 13+ on Linux/macOS
  - MSVC 19.29+ (Visual Studio 2022) on Windows

### SIMD Optimization

- Intel/AMD x86_64:
  - Define `ATOM_USE_SIMD` to enable AVX2 optimizations
  - Best performance on Haswell architecture or newer
  
- ARM64:
  - Define `ATOM_USE_SIMD` to enable NEON optimizations
  - Effective on Apple M-series, Cortex-A76 or newer

### Thread Safety

The implementation is thread-safe with the following guarantees:

- Multiple threads can run optimization simultaneously
- Progress callbacks may be called concurrently
- Best solution tracking is protected by a mutex

Note: User-provided callback functions must be thread-safe if using multiple threads.
