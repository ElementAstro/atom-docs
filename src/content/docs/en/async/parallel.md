---
title: "ATOM Parallel Algorithms Library Documentation"
description: "Documentation for the ATOM Parallel Algorithms Library, including usage examples, API reference, and performance considerations."
keywords: ["C++", "parallel algorithms", "coroutines", "SIMD", "async"]
---

## Overview

The `atom::async` library provides high-performance parallel computing capabilities for modern C++ applications. It leverages C++20 features including coroutines, concepts, ranges, and synchronization primitives to enable efficient concurrent processing across multiple threads and CPU cores.

This library contains three main components:

- Task<T>: A C++20 coroutine-based task system for asynchronous execution
- Parallel: Advanced parallel algorithms with cross-platform thread optimization
- SimdOps: SIMD-accelerated vector operations with platform-specific optimizations

## Dependencies and Requirements

### Required Headers

```cpp
#include <algorithm>
#include <concepts>
#include <coroutine>
#include <execution>
#include <future>
#include <numeric>
#include <optional>
#include <thread>
#include <type_traits>
#include <vector>
#include <barrier>
#include <latch>
#include <ranges>
#include <span>
#include <stop_token>
```

### Platform-Specific Headers

- Windows: `<processthreadsapi.h>`, `<windows.h>`
- macOS: `<mach/thread_act.h>`, `<mach/thread_policy.h>`, `<pthread.h>`
- Linux: `<pthread.h>`, `<sched.h>`

### SIMD-Specific Headers

- AVX-512: `<immintrin.h>` when `__AVX512F__` is defined
- AVX2: `<immintrin.h>` when `__AVX2__` is defined
- AVX: `<immintrin.h>` when `__AVX__` is defined
- ARM NEON: `<arm_neon.h>` when `__ARM_NEON` is defined

### Compiler Requirements

- C++20 compliant compiler
- Support for coroutines
- Support for concepts

## Task<T> Class

### Purpose

`Task<T>` is a lightweight coroutine wrapper that represents an asynchronous operation that produces a result of type `T`.

### Class Declaration

```cpp
template <typename T>
class [[nodiscard]] Task {
public:
    struct promise_type;
    ~Task();
    Task(const Task&) = delete;
    Task& operator=(const Task&) = delete;
    Task(Task&& other) noexcept;
    Task& operator=(Task&& other) noexcept;
    T get();
    bool is_done() const;
private:
    explicit Task(std::coroutine_handle<promise_type> h);
    std::coroutine_handle<promise_type> handle;
};

// Specialization for void
template <>
class Task<void> {
    // Similar interface but handles void returns
};
```

### Member Functions

#### `promise_type`

- Purpose: Defines the promise interface for the coroutine
- Methods:
  - `Task get_return_object()`: Creates the Task object
  - `std::suspend_never initial_suspend()`: Start executing immediately
  - `std::suspend_always final_suspend()`: Suspend at completion
  - `void return_value(T value)`: Store the result
  - `void unhandled_exception()`: Capture exceptions

#### `get()`

- Purpose: Obtains the result of the task
- Parameters: None
- Returns: The value produced by the coroutine
- Exceptions: Rethrows any exception that occurred during task execution
- Example:

```cpp
Task<int> someTask = getSomeTask();
int result = someTask.get(); // Wait for completion and get result
```

#### `is_done()`

- Purpose: Checks if the task has completed
- Parameters: None
- Returns: `true` if the task has finished, `false` otherwise
- Example:

```cpp
Task<int> someTask = getSomeTask();
if (someTask.is_done()) {
    // Task completed
}
```

## Parallel Class

### Purpose

The `Parallel` class provides utilities for high-performance parallel computation with platform-specific optimizations.

### ThreadConfig Nested Class

#### Purpose

Provides cross-platform thread affinity and priority settings.

#### Enums

```cpp
enum class Priority { Lowest, Low, Normal, High, Highest };
```

#### Member Functions

##### `setThreadAffinity(int cpuId)`

- Purpose: Binds the current thread to a specific CPU core
- Parameters:
  - `cpuId`: The CPU core ID to bind to
- Returns: `true` if successful, `false` otherwise
- Example:

```cpp
// Bind current thread to CPU core 0
bool success = Parallel::ThreadConfig::setThreadAffinity(0);
```

##### `setThreadPriority(Priority priority)`

- Purpose: Sets the priority level of the current thread
- Parameters:
  - `priority`: The desired priority level
- Returns: `true` if successful, `false` otherwise
- Example:

```cpp
// Set thread to high priority
bool success = Parallel::ThreadConfig::setThreadPriority(
    Parallel::ThreadConfig::Priority::High);
```

### Parallel Algorithm Static Functions

#### `for_each(Iterator begin, Iterator end, Function func, size_t numThreads = 0)`

- Purpose: Applies a function to each element in a range in parallel
- Parameters:
  - `begin`: Start of the range
  - `end`: End of the range
  - `func`: Function to apply to each element
  - `numThreads`: Number of threads to use (0 = hardware concurrency)
- Returns: None
- Example:

```cpp
std::vector<int> data(1000);
// Process each element in parallel
Parallel::for_each(data.begin(), data.end(), [](int& x) {
    x = x * 2 + 1; // Some computation
});
```

#### `for_each_jthread(Iterator begin, Iterator end, Function func, size_t numThreads = 0)`

- Purpose: Similar to `for_each` but uses C++20's `jthread` for automatic joining
- Parameters: Same as `for_each`
- Returns: None
- Example:

```cpp
std::vector<int> data(1000);
// Process each element in parallel with jthreads
Parallel::for_each_jthread(data.begin(), data.end(), [](int& x) {
    x = x * 2 + 1; // Some computation
});
```

#### `map(Iterator begin, Iterator end, Function func, size_t numThreads = 0)`

- Purpose: Maps a function over a range in parallel and returns results
- Parameters:
  - `begin`: Start of the range
  - `end`: End of the range
  - `func`: Function to apply to each element
  - `numThreads`: Number of threads to use (0 = hardware concurrency)
- Returns: Vector of results from applying the function to each element
- Example:

```cpp
std::vector<int> data = {1, 2, 3, 4, 5};
// Square each element in parallel
auto results = Parallel::map(data.begin(), data.end(), [](int x) {
    return x * x;
});
// results now contains {1, 4, 9, 16, 25}
```

#### `reduce(Iterator begin, Iterator end, T init, BinaryOp binary_op, size_t numThreads = 0)`

- Purpose: Reduces a range in parallel using a binary operation
- Parameters:
  - `begin`: Start of the range
  - `end`: End of the range
  - `init`: Initial value
  - `binary_op`: Binary operation to apply
  - `numThreads`: Number of threads to use (0 = hardware concurrency)
- Returns: Result of the reduction
- Example:

```cpp
std::vector<int> data = {1, 2, 3, 4, 5};
// Sum all elements in parallel
int sum = Parallel::reduce(data.begin(), data.end(), 0,
                         std::plus<int>());
// sum is 15
```

#### `partition(RandomIt begin, RandomIt end, Predicate pred, size_t numThreads = 0)`

- Purpose: Partitions a range in parallel based on a predicate
- Parameters:
  - `begin`: Start of the range
  - `end`: End of the range
  - `pred`: Predicate to test elements
  - `numThreads`: Number of threads to use (0 = hardware concurrency)
- Returns: Iterator to the first element of the second group
- Example:

```cpp
std::vector<int> data = {5, 2, 8, 1, 7, 3, 9, 4, 6};
// Partition data by even/odd
auto middle = Parallel::partition(data.begin(), data.end(), 
                                [](int x) { return x % 2 == 0; });
// All even numbers are before middle, all odd numbers after
```

#### `filter(Iterator begin, Iterator end, Predicate pred, size_t numThreads = 0)`

- Purpose: Filters elements in a range in parallel based on a predicate
- Parameters:
  - `begin`: Start of the range
  - `end`: End of the range
  - `pred`: Predicate to test elements
  - `numThreads`: Number of threads to use (0 = hardware concurrency)
- Returns: Vector of elements that satisfy the predicate
- Example:

```cpp
std::vector<int> data = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
// Filter even numbers in parallel
auto evens = Parallel::filter(data.begin(), data.end(),
                            [](int x) { return x % 2 == 0; });
// evens contains {2, 4, 6, 8, 10}
```

#### `sort(RandomIt begin, RandomIt end, Compare comp = Compare{}, size_t numThreads = 0)`

- Purpose: Sorts a range in parallel
- Parameters:
  - `begin`: Start of the range
  - `end`: End of the range
  - `comp`: Comparison function
  - `numThreads`: Number of threads to use (0 = hardware concurrency)
- Returns: None
- Example:

```cpp
std::vector<int> data = {5, 3, 8, 1, 7, 2, 9, 4, 6};
// Sort in parallel
Parallel::sort(data.begin(), data.end());
// data is now {1, 2, 3, 4, 5, 6, 7, 8, 9}
```

#### `map_span(std::span<const T> input, Function func, size_t numThreads = 0)`

- Purpose: Maps a function over a span in parallel using C++20's `std::span`
- Parameters:
  - `input`: Input data span
  - `func`: Function to apply
  - `numThreads`: Number of threads to use (0 = hardware concurrency)
- Returns: Vector of results from applying the function to each element
- Example:

```cpp
std::vector<int> data = {1, 2, 3, 4, 5};
// Square each element using span
auto results = Parallel::map_span(std::span(data), [](int x) {
    return x * x;
});
// results contains {1, 4, 9, 16, 25}
```

#### `filter_range(Range&& range, Predicate pred, size_t numThreads = 0)`

- Purpose: Filters elements in a range using C++20 ranges
- Parameters:
  - `range`: Input range
  - `pred`: Predicate to test elements
  - `numThreads`: Number of threads to use (0 = hardware concurrency)
- Returns: Vector of elements that satisfy the predicate
- Example:

```cpp
std::vector<int> data = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
// Filter even numbers using C++20 ranges
auto evens = Parallel::filter_range(data, [](int x) { return x % 2 == 0; });
// evens contains {2, 4, 6, 8, 10}
```

#### `async(Func&& func, Args&&... args)`

- Purpose: Executes a function asynchronously using coroutines
- Parameters:
  - `func`: Function to execute
  - `args`: Arguments to pass to the function
- Returns: A `Task` containing the result of the function
- Example:

```cpp
Task<int> task = Parallel::async([](int x) { return x * x; }, 5);
int result = task.get(); // result is 25
```

#### `when_all(Tasks&&... tasks)`

- Purpose: Waits for all tasks to complete
- Parameters:
  - `tasks`: Coroutine tasks to wait for
- Returns: A void `Task` that completes when all tasks complete
- Example:

```cpp
Task<int> task1 = Parallel::async([]() { return 1; });
Task<int> task2 = Parallel::async([]() { return 2; });
Task<void> allDone = Parallel::when_all(std::move(task1), std::move(task2));
allDone.get(); // Wait for all tasks to complete
```

#### `parallel_for_each_async(std::span<const T> inputs, Func&& func, size_t numThreads = 0)`

- Purpose: Applies a function to each element asynchronously
- Parameters:
  - `inputs`: Input span
  - `func`: Function to apply
  - `numThreads`: Number of threads to use (0 = hardware concurrency)
- Returns: A void `Task` that completes when all processing is done
- Example:

```cpp
std::vector<int> data = {1, 2, 3, 4, 5};
Task<void> task = Parallel::parallel_for_each_async(
    std::span(data), [](int x) { std::cout << x * x << ' '; });
task.get(); // Prints "1 4 9 16 25 "
```

## SimdOps Class

### Purpose

The `SimdOps` class provides optimized vector operations using SIMD instructions for different CPU architectures.

### Static Member Functions

#### `add(const T* a, const T* b, T* result, size_t size)`

- Purpose: Adds two arrays element-wise using SIMD instructions when available
- Parameters:
  - `a`: First input array
  - `b`: Second input array
  - `result`: Output array
  - `size`: Array size
- Returns: None
- Exceptions: `std::invalid_argument` if any input is null
- Example:

```cpp
std::vector<float> a = {1.0f, 2.0f, 3.0f, 4.0f};
std::vector<float> b = {5.0f, 6.0f, 7.0f, 8.0f};
std::vector<float> result(4);
SimdOps::add(a.data(), b.data(), result.data(), 4);
// result contains {6.0f, 8.0f, 10.0f, 12.0f}
```

#### `multiply(const T* a, const T* b, T* result, size_t size)`

- Purpose: Multiplies two arrays element-wise using SIMD instructions when available
- Parameters:
  - `a`: First input array
  - `b`: Second input array
  - `result`: Output array
  - `size`: Array size
- Returns: None
- Exceptions: `std::invalid_argument` if any input is null
- Example:

```cpp
std::vector<float> a = {1.0f, 2.0f, 3.0f, 4.0f};
std::vector<float> b = {5.0f, 6.0f, 7.0f, 8.0f};
std::vector<float> result(4);
SimdOps::multiply(a.data(), b.data(), result.data(), 4);
// result contains {5.0f, 12.0f, 21.0f, 32.0f}
```

#### `dotProduct(const T* a, const T* b, size_t size)`

- Purpose: Calculates the dot product of two vectors using SIMD instructions when available
- Parameters:
  - `a`: First input vector
  - `b`: Second input vector
  - `size`: Vector size
- Returns: Dot product result
- Exceptions: `std::invalid_argument` if any input is null
- Example:

```cpp
std::vector<float> a = {1.0f, 2.0f, 3.0f, 4.0f};
std::vector<float> b = {5.0f, 6.0f, 7.0f, 8.0f};
float result = SimdOps::dotProduct(a.data(), b.data(), 4);
// result is 70.0f (1*5 + 2*6 + 3*7 + 4*8)
```

#### `dotProduct(std::span<const T> a, std::span<const T> b)`

- Purpose: Calculates the dot product of two spans using C++20's `std::span`
- Parameters:
  - `a`: First input span
  - `b`: Second input span
- Returns: Dot product result
- Exceptions: `std::invalid_argument` if spans have different sizes
- Example:

```cpp
std::vector<float> a = {1.0f, 2.0f, 3.0f, 4.0f};
std::vector<float> b = {5.0f, 6.0f, 7.0f, 8.0f};
float result = SimdOps::dotProduct(std::span(a), std::span(b));
// result is 70.0f
```

## Platform-Specific Considerations

### Windows Platform

- Uses `SetThreadAffinityMask` for thread affinity
- Uses `SetThreadPriority` for thread priority
- Priority levels map to Windows-specific priority constants

### Linux Platform

- Uses `pthread_setaffinity_np` for thread affinity
- Uses `pthread_setschedparam` for thread priority
- Priority levels map to the scheduler's priority range

### macOS Platform

- Uses `thread_policy_set` with `THREAD_AFFINITY_POLICY` for thread affinity preferences
- Uses `pthread_setschedparam` for thread priority
- Some limitations exist due to macOS's cooperative scheduling model

### SIMD Support

- AVX-512: Highest performance with 16-wide operations when available
- AVX2: Good performance with 8-wide operations
- AVX: Basic SIMD support
- ARM NEON: Optimized for ARM processors with 4-wide operations

## Performance Considerations and Limitations

### Thread Scaling

- Too many threads can cause contention and overhead
- Performance may degrade when numThreads > physical cores due to context switching
- For small workloads, the overhead of thread creation may exceed benefits

### Task Granularity

- Fine-grained tasks (small amount of work per task) may have high overhead
- Coarse-grained tasks (large amount of work per task) may lead to poor load balancing
- Optimal task size depends on the specific workload and hardware

### Memory Access Patterns

- Cache locality is crucial for performance
- False sharing can severely impact parallel performance
- The library works best when array elements are independent and memory-local

### SIMD Limitations

- SIMD acceleration only works with certain data types (primarily `float`)
- Performance on unaligned data may be lower
- Small arrays may not benefit from SIMD operations

### Error Handling

- Exceptions in worker threads are captured and propagated to the calling thread
- Some functions may silently fail back to sequential processing

## Best Practices and Common Pitfalls

### Best Practices

- Set appropriate thread count based on workload and hardware
- Use thread affinity for performance-critical applications
- Measure performance with and without parallelism
- Prefer algorithm-level parallelism over manual thread management
- Use span-based interfaces for modern, safe code
- Consider data layout for better cache locality

### Common Pitfalls to Avoid

- Avoid data races by ensuring each thread works on independent data
- Don't parallelize tiny workloads where overhead exceeds benefits
- Be cautious with mutable lambdas in parallel algorithms
- Don't assume all platforms support the same optimizations
- Avoid recursive parallel algorithms without proper depth limiting
- Don't ignore platform-specific thread settings

## Comprehensive Examples

### Example 1: Basic Parallel Processing

```cpp
#include "parallel.hpp"
#include <iostream>
#include <vector>

int main() {
    // Create sample data
    std::vector<int> data(1000);
    for (size_t i = 0; i < data.size(); ++i) {
        data[i] = static_cast<int>(i);
    }
    
    // Process data in parallel
    atom::async::Parallel::for_each(data.begin(), data.end(), [](int& x) {
        x = x * x;  // Square each element
    });
    
    // Print first few results
    std::cout << "First 5 squares: ";
    for (size_t i = 0; i < 5; ++i) {
        std::cout << data[i] << " ";  // Should output: 0 1 4 9 16
    }
    std::cout << std::endl;
    
    return 0;
}
```

### Example 2: Parallel Transformation and Filtering

```cpp
#include "parallel.hpp"
#include <iostream>
#include <vector>
#include <string>

int main() {
    // Sample data
    std::vector<int> numbers = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    
    // Transform numbers to strings in parallel
    auto strings = atom::async::Parallel::map(
        numbers.begin(), numbers.end(),
        [](int x) { return "Number: " + std::to_string(x); }
    );
    
    // Filter even numbers in parallel
    auto evenNumbers = atom::async::Parallel::filter(
        numbers.begin(), numbers.end(),
        [](int x) { return x % 2 == 0; }
    );
    
    // Print results
    std::cout << "Transformed strings:" << std::endl;
    for (const auto& s : strings) {
        std::cout << s << std::endl;
    }
    
    std::cout << "\nEven numbers:" << std::endl;
    for (int x : evenNumbers) {
        std::cout << x << " ";  // Should output: 2 4 6 8 10
    }
    std::cout << std::endl;
    
    return 0;
}
```

### Example 3: Using SIMD Operations

```cpp
#include "parallel.hpp"
#include <iostream>
#include <vector>
#include <iomanip>

int main() {
    // Create sample vectors
    constexpr size_t size = 16;
    std::vector<float> vec1(size, 2.0f);
    std::vector<float> vec2(size, 3.0f);
    std::vector<float> result(size);
    
    // Perform SIMD vector addition
    atom::async::SimdOps::add(vec1.data(), vec2.data(), result.data(), size);
    
    // Print results
    std::cout << "Vector addition result: ";
    for (size_t i = 0; i < 5; ++i) {
        std::cout << result[i] << " ";  // Should output: 5.0 5.0 5.0 5.0 5.0
    }
    std::cout << "..." << std::endl;
    
    // Calculate dot product
    float dotProduct = atom::async::SimdOps::dotProduct(vec1.data(), vec2.data(), size);
    std::cout << "Dot product: " << dotProduct << std::endl;  // Should be 96.0 (16 * 2.0 * 3.0)
    
    return 0;
}
```

### Example 4: Async Tasks and Coroutines

```cpp
#include "parallel.hpp"
#include <iostream>
#include <vector>
#include <chrono>

using namespace atom::async;

// Simulate a computationally intensive task
int complexCalculation(int input) {
    // Simulate work
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    return input * input;
}

// Coroutine function
Task<std::vector<int>> processBatchAsync(const std::vector<int>& batch) {
    // Process each item in parallel and collect results
    auto results = Parallel::map(batch.begin(), batch.end(), complexCalculation);
    co_return results;
}

int main() {
    std::vector<int> batch1 = {1, 2, 3, 4, 5};
    std::vector<int> batch2 = {6, 7, 8, 9, 10};
    
    // Start async processing for both batches
    auto task1 = processBatchAsync(batch1);
    auto task2 = processBatchAsync(batch2);
    
    std::cout << "Tasks are running asynchronously..." << std::endl;
    
    // Get results
    auto results1 = task1.get();
    auto results2 = task2.get();
    
    // Print results
    std::cout << "Batch 1 results: ";
    for (int x : results1) {
        std::cout << x << " ";  // Should output: 1 4 9 16 25
    }
    std::cout << std::endl;
    
    std::cout << "Batch 2 results: ";
    for (int x : results2) {
        std::cout << x << " ";  // Should output: 36 49 64 81 100
    }
    std::cout << std::endl;
    
    return 0;
}
```

### Example 5: Advanced Thread Configuration

```cpp
#include "parallel.hpp"
#include <iostream>
#include <vector>
#include <numeric>

using namespace atom::async;

int main() {
    // Create a large vector
    std::vector<double> data(10000000);
    std::iota(data.begin(), data.end(), 1.0);  // Fill with 1, 2, 3, ...
    
    // Define a compute-intensive operation
    auto computeTask = [](double& x) {
        // Simulate complex computation
        for (int i = 0; i < 100; ++i) {
            x = std::sqrt(x) * std::sin(x) + std::cos(x);
        }
    };
    
    // Get hardware concurrency
    unsigned int numCores = std::thread::hardware_concurrency();
    std::cout << "Hardware concurrency: " << numCores << " cores" << std::endl;
    
    // Process with default settings
    auto start = std::chrono::high_resolution_clock::now();
    
    Parallel::for_each_jthread(data.begin(), data.end(), [&](double& x) {
        // Set high priority for worker threads
        Parallel::ThreadConfig::setThreadPriority(
            Parallel::ThreadConfig::Priority::High);
        
        // Set thread affinity if possible
        size_t threadId = std::hash<std::thread::id>{}(std::this_thread::get_id());
        Parallel::ThreadConfig::setThreadAffinity(threadId % numCores);
        
        // Do the computation
        computeTask(x);
    });
    
    auto end = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    std::cout << "Processed " << data.size() << " elements in " 
              << duration.count() << " ms using optimized thread settings" << std::endl;
    
    return 0;
}
```

## Complete Integration Example

This example demonstrates multiple features of the library working together:

```cpp
#include "parallel.hpp"
#include <iostream>
#include <vector>
#include <string>
#include <cmath>
#include <chrono>
#include <fstream>
#include <iomanip>

using namespace atom::async;

// Define a data point structure
struct DataPoint {
    float x, y, z;
    
    float magnitude() const {
        return std::sqrt(x*x + y*y + z*z);
    }
};

// Generate a sample dataset
std::vector<DataPoint> generateData(size_t size) {
    std::vector<DataPoint> data(size);
    for (size_t i = 0; i < size; ++i) {
        float angle = static_cast<float>(i) / size * 2.0f * 3.14159f;
        data[i].x = std::sin(angle) * i / size;
        data[i].y = std::cos(angle) * i / size;
        data[i].z = std::sin(angle) * std::cos(angle) * i / size;
    }
    return data;
}

// Process data asynchronously
Task<std::vector<float>> processDataAsync(const std::vector<DataPoint>& data) {
    // Calculate magnitudes in parallel
    auto magnitudes = Parallel::map(data.begin(), data.end(), 
                                   [](const DataPoint& p) { return p.magnitude(); });
    
    // Filter out small magnitudes
    auto filtered = Parallel::filter(magnitudes.begin(), magnitudes.end(),
                                    [](float m) { return m > 0.5f; });
    
    // Sort results
    Parallel::sort(filtered.begin(), filtered.end());
    
    co_return filtered;
}

// Calculate vector statistics
Task<std::pair<float, float>> calculateStatsAsync(std::span<const float> data) {
    if (data.empty()) {
        co_return std::make_pair(0.0f, 0.0f);
    }
    
    // Calculate sum in parallel
    float sum = Parallel::reduce(data.begin(), data.end(), 0.0f, std::plus<float>());
    float mean = sum / data.size();
    
    // Calculate variance in parallel
    float variance = Parallel::reduce(data.begin(), data.end(), 0.0f,
        [mean](float acc, float x) {
            float diff = x - mean;
            return acc + diff * diff;
        }) / data.size();
    
    float stdDev = std::sqrt(variance);
    
    co_return std::make_pair(mean, stdDev);
}

// Combine vectors with SIMD acceleration
std::vector<float> combineVectors(const std::vector<float>& a, const std::vector<float>& b) {
    if (a.size() != b.size()) {
        throw std::invalid_argument("Vector sizes must match");
    }
    
    std::vector<float> result(a.size());
    SimdOps::add(a.data(), b.data(), result.data(), a.size());
    return result;
}

int main() {
    std::cout << "Starting comprehensive parallel processing example...\n" << std::endl;
    
    // Configuration
    const size_t dataSize = 1000000;
    const unsigned int numThreads = std::thread::hardware_concurrency();
    
    std::cout << "Using " << numThreads << " threads for processing " 
              << dataSize << " data points" << std::endl;
    
    // Generate test data
    auto start = std::chrono::high_resolution_clock::now();
    std::cout << "Generating data..." << std::endl;
    auto data = generateData(dataSize);
    
    // Process data asynchronously
    std::cout << "Processing data..." << std::endl;
    auto processTask = processDataAsync(data);
    auto processedData = processTask.get();
    
    // Calculate statistics
    std::cout << "Calculating statistics..." << std::endl;
    auto statsTask = calculateStatsAsync(std::span(processedData));
    auto [mean, stdDev] = statsTask.get();
    
    // Generate two additional vectors for SIMD operations
    std::vector<float> vec1(processedData.size(), 1.0f);
    std::vector<float> vec2(processedData.size(), 2.0f);
    
    // Perform SIMD operations
    std::cout << "Performing SIMD operations..." << std::endl;
    auto combined = combineVectors(vec1, vec2);
    
    auto end = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    // Report results
    std::cout << "\nResults:" << std::endl;
    std::cout << "- Processed " << dataSize << " data points" << std::endl;
    std::cout << "- Filtered results: " << processedData.size() << " elements" << std::endl;
    std::cout << "- Mean: " << mean << std::endl;
    std::cout << "- Standard Deviation: " << stdDev << std::endl;
    std::cout << "- First 5 sorted values: ";
    for (size_t i = 0; i < std::min(size_t(5), processedData.size()); ++i) {
        std::cout << processedData[i] << " ";
    }
    std::cout << std::endl;
    
    std::cout << "- SIMD operation example (first 5): ";
    for (size_t i = 0; i < std::min(size_t(5), combined.size()); ++i) {
        std::cout << combined[i] << " ";  // Should be 3.0 for all
    }
    std::cout << std::endl;
    
    std::cout << "\nTotal processing time: " << duration.count() << " ms" << std::endl;
    
    return 0;
}
```

This comprehensive example demonstrates:

- Data generation and processing
- Asynchronous parallel computation with coroutines
- Multiple parallel algorithms working together
- SIMD-accelerated vector operations
- Proper error handling and reporting
- Performance measurement

The library provides significant performance improvements for computationally intensive tasks while maintaining a clean, modern C++ interface.
