---
title: Enhanced Packaged Task
description: Detailed for the EnhancedPackagedTask class template in the packaged_task.hpp header file, including constructors, public methods, protected members, specialization for void result type, exception handling, and usage examples.
---

## Table of Contents

1. [Overview](#overview)
2. [Dependencies](#dependencies)
3. [Class Reference](#class-reference)
4. [Key Features](#key-features)
5. [Usage Examples](#usage-examples)
6. [Implementation Details](#implementation-details)
7. [Performance Considerations](#performance-considerations)
8. [Best Practices](#best-practices)
9. [Comprehensive Example](#comprehensive-example)

<a id="overview"></a>

## 1. Overview

EnhancedPackagedTask is a robust extension of the standard `std::packaged_task` that provides advanced asynchronous task management capabilities. It is designed to wrap callable objects and execute them asynchronously with improved control mechanisms, error handling, and completion notification capabilities.

Key enhancements over standard `std::packaged_task`:

- Task cancellation support
- Completion callbacks registration
- Enhanced exception handling
- Cache-line alignment for optimal performance in multi-threaded environments
- Optional lock-free implementation for high-performance scenarios

This implementation is part of the `atom::async` namespace, providing a comprehensive solution for managing asynchronous operations with fine-grained control and reliability.

<a id="dependencies"></a>

## 2. Dependencies

### Required Headers

```cpp
#include <atomic>         // For atomic operations
#include <concepts>       // For C++20 concepts
#include <functional>     // For std::function
#include <future>         // For std::promise and std::future
#include <memory>         // For smart pointers
#include <mutex>          // For thread synchronization
#include <type_traits>    // For type traits
#include <vector>         // For callback storage
```

### Custom Dependencies

```cpp
#include "atom/async/future.hpp"  // EnhancedFuture implementation
```

### Optional Dependencies

When compiled with `ATOM_USE_LOCKFREE_QUEUE` defined:

```cpp
#include <boost/lockfree/queue.hpp>
#include <boost/lockfree/spsc_queue.hpp>
```

### Compiler Support

- Requires C++20 or later for concepts support
- `__cpp_lib_hardware_interference_size` detection for optimal cache alignment

<a id="class-reference"></a>

## 3. Class Reference

### InvalidPackagedTaskException

```cpp
class InvalidPackagedTaskException : public atom::error::RuntimeError
```

Description:  
Exception thrown when operations on an invalid task are attempted.

Methods:

- Inherits constructors from `atom::error::RuntimeError`

### EnhancedPackagedTask<ResultType, Args...>

```cpp
template <typename ResultType, typename... Args>
class EnhancedPackagedTask
```

Description:  
A wrapper for a callable object that can be executed asynchronously, with the results retrieved via a future.

#### Constructor

```cpp
explicit EnhancedPackagedTask(TaskType task)
```

- Parameters:
  - `task`: The callable object to wrap
- Throws: `InvalidPackagedTaskException` if the task is invalid

#### Move Operations

```cpp
EnhancedPackagedTask(EnhancedPackagedTask&& other) noexcept
EnhancedPackagedTask& operator=(EnhancedPackagedTask&& other) noexcept
```

- Note: Copy operations are deleted

#### Methods

```cpp
[[nodiscard]] EnhancedFuture<ResultType> getEnhancedFuture() const
```

- Returns: An `EnhancedFuture` for retrieving the task's result
- Throws: `InvalidPackagedTaskException` if the future is invalid

```cpp
void operator()(Args... args)
```

- Description: Invokes the stored task with the provided arguments
- Parameters:
  - `args`: Arguments to pass to the task
- Throws: Exceptions from the wrapped function or `InvalidPackagedTaskException`

```cpp
template <typename F>
    requires std::invocable<F, ResultType>
void onComplete(F&& func) // Only available with ATOM_USE_LOCKFREE_QUEUE
```

- Description: Registers a callback to execute when the task completes
- Parameters:
  - `func`: Callback function that accepts the task's result
- Throws: `InvalidPackagedTaskException` if the callback is invalid

```cpp
[[nodiscard]] bool cancel() noexcept
```

- Returns: `true` if the task was successfully cancelled, `false` if already cancelled
- Note: Thread-safe operation

```cpp
[[nodiscard]] bool isCancelled() const noexcept
```

- Returns: `true` if the task has been cancelled

```cpp
[[nodiscard]] explicit operator bool() const noexcept
```

- Returns: `true` if the task is valid, not cancelled, and has a valid future

### Helper Function

```cpp
template <typename F, typename... Args>
    requires std::invocable<F, Args...>
[[nodiscard]] auto make_enhanced_task(F&& f)
```

- Description: Creates an `EnhancedPackagedTask` with deduced return type
- Parameters:
  - `f`: Callable to wrap in an enhanced task
- Returns: An `EnhancedPackagedTask` instance

<a id="key-features"></a>

## 4. Key Features

### Task Cancellation

Tasks can be cancelled before execution, providing controlled termination of asynchronous operations.

```cpp
auto task = atom::async::make_enhanced_task<int(int)>([](int x) { 
    return x * 2; 
});

// Cancel the task before execution
bool wasSuccessfullyCancelled = task.cancel();

// Check if task is cancelled
if (task.isCancelled()) {
    // Handle cancellation
}
```

### Completion Callbacks

When compiled with `ATOM_USE_LOCKFREE_QUEUE`, tasks can register callbacks that execute when the task completes.

```cpp
auto task = atom::async::make_enhanced_task<int(int)>([](int x) { 
    return x * 2; 
});

// Register a callback for when the task completes
task.onComplete([](int result) {
    std::cout << "Task completed with result: " << result << std::endl;
});

// Execute the task
task(21);  // Will print "Task completed with result: 42"
```

### Enhanced Exception Handling

Exceptions in the task are captured and propagated through the future with detailed context.

```cpp
auto task = atom::async::make_enhanced_task<int(int)>([](int x) { 
    if (x < 0) throw std::invalid_argument("Value must be non-negative");
    return x * 2; 
});

auto future = task.getEnhancedFuture();
task(-1);  // Will throw an exception

try {
    int result = future.get();  // Will propagate the exception
} catch (const std::invalid_argument& e) {
    std::cerr << "Caught exception: " << e.what() << std::endl;
}
```

### Cache-Aligned Memory Layout

Tasks are aligned to hardware cache lines to minimize false sharing in multi-threaded environments.

```cpp
// The class uses alignment for optimal cache behavior
static_assert(alignof(atom::async::EnhancedPackagedTask<int, int>) >= 
              hardware_constructive_interference_size);
```

<a id="usage-examples"></a>

## 5. Usage Examples

### Basic Usage

```cpp
#include <iostream>
#include "atom/async/packaged_task.hpp"

int main() {
    // Create a task that computes a value
    atom::async::EnhancedPackagedTask<int, int> task([](int input) {
        return input * input;
    });
    
    // Get the future associated with the task
    auto future = task.getEnhancedFuture();
    
    // Execute the task
    task(5);
    
    // Get the result
    std::cout << "Result: " << future.get() << std::endl;  // Output: Result: 25
    
    return 0;
}
```

### Handling Exceptions

```cpp
#include <iostream>
#include "atom/async/packaged_task.hpp"

int main() {
    // Create a task that might throw an exception
    atom::async::EnhancedPackagedTask<int, int> task([](int input) {
        if (input < 0) {
            throw std::invalid_argument("Input must be non-negative");
        }
        return input * input;
    });
    
    // Get the future
    auto future = task.getEnhancedFuture();
    
    // Execute with invalid input
    task(-5);
    
    // Try to get the result
    try {
        int result = future.get();
        std::cout << "Result: " << result << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "Exception caught: " << e.what() << std::endl;
        // Output: Exception caught: Input must be non-negative
    }
    
    return 0;
}
```

### Task Cancellation

```cpp
#include <iostream>
#include <thread>
#include <chrono>
#include "atom/async/packaged_task.hpp"

int main() {
    // Create a long-running task
    atom::async::EnhancedPackagedTask<int, int> task([](int input) {
        // Simulate long computation
        std::this_thread::sleep_for(std::chrono::seconds(3));
        return input * input;
    });
    
    auto future = task.getEnhancedFuture();
    
    // Cancel before execution
    bool cancelled = task.cancel();
    std::cout << "Task cancelled: " << (cancelled ? "yes" : "no") << std::endl;
    
    // Try to execute the cancelled task
    task(5);
    
    try {
        int result = future.get();
        std::cout << "Result: " << result << std::endl;
    } catch (const atom::async::InvalidPackagedTaskException& e) {
        std::cerr << "Expected exception: " << e.what() << std::endl;
        // Output: Expected exception: Task has been cancelled
    }
    
    return 0;
}
```

### Using Completion Callbacks (with ATOM_USE_LOCKFREE_QUEUE)

```cpp
#include <iostream>
#include "atom/async/packaged_task.hpp"

#define ATOM_USE_LOCKFREE_QUEUE
#include "atom/async/packaged_task.hpp"

int main() {
    // Create a task
    atom::async::EnhancedPackagedTask<std::string, int> task([](int input) {
        return "Result: " + std::to_string(input * input);
    });
    
    // Register a completion callback
    task.onComplete([](const std::string& result) {
        std::cout << "Callback received: " << result << std::endl;
    });
    
    auto future = task.getEnhancedFuture();
    
    // Execute the task
    task(7);
    
    // The callback will print: "Callback received: Result: 49"
    
    // We can still get the result via the future
    std::cout << "Future result: " << future.get() << std::endl;
    
    return 0;
}
```

<a id="implementation-details"></a>

## 6. Implementation Details

### Memory Alignment

The class uses hardware-specific cache line sizes to prevent false sharing in multi-threaded environments:

```cpp
template <typename ResultType, typename... Args>
class alignas(hardware_constructive_interference_size) EnhancedPackagedTask {
    // ...
```

### Type-Checking with Concepts

C++20 concepts ensure type safety at compile time:

```cpp
template <typename F, typename R, typename... Args>
concept InvocableWithResult =
    std::invocable<F, Args...> &&
    (std::same_as<std::invoke_result_t<F, Args...>, R> ||
     std::same_as<R, void>);
```

### Task Cancellation Mechanism

Cancellation is implemented using an atomic flag for thread safety:

```cpp
std::atomic<bool> cancelled_;

[[nodiscard]] bool cancel() noexcept {
    bool expected = false;
    return cancelled_.compare_exchange_strong(expected, true,
                                              std::memory_order_acq_rel);
}
```

### Specialization for void Return Type

Separate implementation for tasks that don't return a value:

```cpp
template <typename... Args>
class EnhancedPackagedTask<void, Args...> {
    // Specialized implementation
};
```

### Lock-Free Callback Queue

When `ATOM_USE_LOCKFREE_QUEUE` is defined, a lock-free queue implementation from Boost is used for callbacks:

```cpp
std::unique_ptr<LockfreeCallbackQueue> m_lockfreeCallbacks;
```

<a id="performance-considerations"></a>

## 7. Performance Considerations

### Cache Alignment

EnhancedPackagedTask is aligned to cache line boundaries to minimize cache coherence overhead in multi-threaded environments. This can significantly improve performance when multiple tasks are being executed across different cores.

### Task Cancellation Performance

Task cancellation uses atomic operations and is designed to be lock-free and efficient. Checking for cancellation has minimal overhead.

### Lock-Free vs. Mutex-Based Callbacks

Two approaches are provided for callback handling:

1. Lock-free queue (when `ATOM_USE_LOCKFREE_QUEUE` is defined)
   - Pros: Better performance for high-contention scenarios
   - Cons: Fixed queue size (128 by default), potential for failed pushes

2. Mutex-protected vector (default)
   - Pros: Unlimited callbacks, guaranteed storage
   - Cons: Potential contention when registering callbacks

### Memory Footprint

Each `EnhancedPackagedTask` instance contains:

- Task function object
- Promise object (heap-allocated)
- Shared future
- Callback storage mechanisms
- Atomic flag for cancellation

This makes it more heavyweight than a standard `std::function` or `std::packaged_task`.

### Retry Mechanism for Lock-Free Operations

When using lock-free callbacks, exponential backoff is implemented for failed push attempts:

```cpp
for (int i = 0; i < MAX_RETRIES && !pushed; ++i) {
    pushed = m_lockfreeCallbacks->push(wrappedCallback);
    if (!pushed) {
        std::this_thread::sleep_for(std::chrono::microseconds(1 << i));
    }
}
```

<a id="best-practices"></a>

## 8. Best Practices and Pitfalls

### Best Practices

1. Always check task validity

   ```cpp
   if (task) {
       // Safe to use the task
   }
   ```

2. Handle exceptions appropriately

   ```cpp
   try {
       result = future.get();
   } catch (const atom::async::InvalidPackagedTaskException& e) {
       // Handle task-specific exceptions
   } catch (const std::exception& e) {
       // Handle other exceptions
   }
   ```

3. Consider move semantics

   ```cpp
   // Move task to avoid unnecessary copies
   executor.submit(std::move(task));
   ```

4. Check cancellation status

   ```cpp
   if (task.isCancelled()) {
       // Task was cancelled, take appropriate action
   }
   ```

5. Use make_enhanced_task for type deduction

   ```cpp
   // Let the compiler deduce return type and argument types
   auto task = atom::async::make_enhanced_task<int(std::string)>(
       [](std::string s) { return s.length(); }
   );
   ```

### Common Pitfalls

1. Using a task after moving it

   ```cpp
   auto task2 = std::move(task1);
   task1(42);  // WRONG: task1 has been moved from
   ```

2. Ignoring cancellation state

   ```cpp
   task.cancel();
   task(42);  // Will throw InvalidPackagedTaskException
   ```

3. Not checking future validity

   ```cpp
   auto future = task.getEnhancedFuture();
   task = std::move(otherTask);  // Now the future is invalid
   future.get();  // Will fail
   ```

4. Callback exceptions

   ```cpp
   // Exceptions in callbacks are caught and ignored
   // Add your own try/catch for proper handling
   task.onComplete([](int result) {
       try {
           riskyOperation(result);
       } catch (const std::exception& e) {
           log_error(e.what());
       }
   });
   ```

5. Overflowing the lock-free callback queue

   ```cpp
   // With ATOM_USE_LOCKFREE_QUEUE, the queue has a fixed size
   // Register only necessary callbacks
   ```

<a id="comprehensive-example"></a>

## 9. Comprehensive Example

Below is a complete example demonstrating multiple features of the `EnhancedPackagedTask`:

```cpp
#include <iostream>
#include <string>
#include <thread>
#include <chrono>
#include <numeric>
#include <vector>

#include "atom/async/packaged_task.hpp"

// Simulated work function - calculates sum of vector elements
int calculateSum(const std::vector<int>& data) {
    // Simulate work
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    return std::accumulate(data.begin(), data.end(), 0);
}

// Process the result
std::string formatResult(int sum) {
    return "Sum: " + std::to_string(sum);
}

// A function that might throw
int divideSafely(int a, int b) {
    if (b == 0) {
        throw std::invalid_argument("Division by zero");
    }
    return a / b;
}

int main() {
    std::cout << "EnhancedPackagedTask Demonstration\n";
    std::cout << "==================================\n\n";
    
    // Example 1: Basic task execution
    std::cout << "Example 1: Basic Task\n";
    {
        // Create a task to calculate sum
        atom::async::EnhancedPackagedTask<int, std::vector<int>> sumTask(calculateSum);
        
        // Get the future
        auto future = sumTask.getEnhancedFuture();
        
        // Create test data
        std::vector<int> data = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        
        // Execute the task
        std::cout << "Starting calculation..." << std::endl;
        sumTask(data);
        
        // Get the result
        int sum = future.get();
        std::cout << "Sum calculated: " << sum << std::endl;  // Should be 55
    }
    std::cout << std::endl;
    
    // Example 2: Task chaining
    std::cout << "Example 2: Task Chaining\n";
    {
        // First task: calculate sum
        atom::async::EnhancedPackagedTask<int, std::vector<int>> sumTask(calculateSum);
        auto sumFuture = sumTask.getEnhancedFuture();
        
        // Second task: format the result
        atom::async::EnhancedPackagedTask<std::string, int> formatTask(formatResult);
        auto formatFuture = formatTask.getEnhancedFuture();
        
        // Execute the first task
        std::vector<int> data = {10, 20, 30, 40, 50};
        sumTask(data);
        
        // Get result and feed it to the second task
        int sum = sumFuture.get();
        formatTask(sum);
        
        // Get the final result
        std::string result = formatFuture.get();
        std::cout << "Formatted result: " << result << std::endl;  // Sum: 150
    }
    std::cout << std::endl;
    
    // Example 3: Exception handling
    std::cout << "Example 3: Exception Handling\n";
    {
        // Create a task that might throw
        atom::async::EnhancedPackagedTask<int, int, int> divideTask(divideSafely);
        auto future = divideTask.getEnhancedFuture();
        
        // Execute with invalid arguments
        divideTask(10, 0);
        
        // Try to get the result
        try {
            int result = future.get();
            std::cout << "Result: " << result << std::endl;
        } catch (const std::exception& e) {
            std::cout << "Caught expected exception: " << e.what() << std::endl;
        }
    }
    std::cout << std::endl;
    
    // Example 4: Task cancellation
    std::cout << "Example 4: Task Cancellation\n";
    {
        // Create a task
        atom::async::EnhancedPackagedTask<int, std::vector<int>> sumTask(calculateSum);
        auto future = sumTask.getEnhancedFuture();
        
        // Cancel it before execution
        bool cancelled = sumTask.cancel();
        std::cout << "Task cancelled: " << (cancelled ? "yes" : "no") << std::endl;
        
        // Try to execute
        std::vector<int> data = {1, 2, 3};
        sumTask(data);
        
        // Try to get result
        try {
            int result = future.get();
            std::cout << "Result: " << result << std::endl;
        } catch (const atom::async::InvalidPackagedTaskException& e) {
            std::cout << "Caught cancellation exception: " << e.what() << std::endl;
        }
    }
    std::cout << std::endl;
    
    // Example 5: Boolean conversion operator
    std::cout << "Example 5: Task Validity Check\n";
    {
        // Create a valid task
        atom::async::EnhancedPackagedTask<int, int> validTask([](int x) { return x * 2; });
        
        // Create an invalid task
        atom::async::EnhancedPackagedTask<int, int> invalidTask(nullptr);
        
        // Create a cancelled task
        atom::async::EnhancedPackagedTask<int, int> cancelledTask([](int x) { return x * 3; });
        cancelledTask.cancel();
        
        // Check validity
        std::cout << "Valid task is valid: " << (validTask ? "yes" : "no") << std::endl;
        std::cout << "Invalid task is valid: " << (invalidTask ? "yes" : "no") << std::endl;
        std::cout << "Cancelled task is valid: " << (cancelledTask ? "yes" : "no") << std::endl;
    }

    return 0;
}
```

Expected Output:

```
EnhancedPackagedTask Demonstration
==================================

Example 1: Basic Task
Starting calculation...
Sum calculated: 55

Example 2: Task Chaining
Formatted result: Sum: 150

Example 3: Exception Handling
Caught expected exception: Division by zero

Example 4: Task Cancellation
Task cancelled: yes
Caught cancellation exception: Task has been cancelled

Example 5: Task Validity Check
Valid task is valid: yes
Invalid task is valid: no
Cancelled task is valid: no
```

This example demonstrates:

1. Basic task creation and execution
2. Chaining tasks together
3. Exception handling
4. Task cancellation
5. Checking task validity

The `EnhancedPackagedTask` provides a powerful foundation for building complex asynchronous systems with robust error handling and cancellation support.
