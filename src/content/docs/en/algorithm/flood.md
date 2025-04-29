---
title: FloodFill Algorithm
description: Comprehensive documentation for the FloodFill algorithm in the atom::algorithm namespace, including features, requirements, and core methods.
---

## Purpose and High-Level Overview

This library provides a comprehensive implementation of the flood fill algorithm with multiple variants for different use cases. Flood fill is a common algorithm used in graphics applications to fill connected regions with a specified color, similar to the "paint bucket" tool in image editing software.

Key features:

- Three fill strategies: BFS, DFS, and parallel implementations
- Configurable connectivity: 4-way or 8-way neighborhood connections
- Generic programming: Works with any grid-like data structure via C++20 concepts
- Thread safety: Careful synchronization in parallel implementation
- Detailed logging: Built-in support for debugging and monitoring

The implementation uses modern C++ features, including concepts, ranges, and thread management facilities from C++20.

## Required Headers and Dependencies

```cpp
#include <atomic>        // For std::atomic in parallel implementation
#include <concepts>      // For Grid concept
#include <mutex>         // For thread synchronization
#include <queue>         // For BFS implementation
#include <ranges>        // For Grid concept
#include <stack>         // For DFS implementation
#include <thread>        // For parallel implementation
#include <type_traits>   // For type traits
#include <vector>        // For storing directions and grid data

// External dependency
#include "atom/log/loguru.hpp" // For logging
```

## Detailed API Documentation

### Connectivity Enum

```cpp
enum class Connectivity {
    Four,  // 4-way connectivity (up, down, left, right)
    Eight  // 8-way connectivity (up, down, left, right, and diagonals)
};
```

Purpose: Defines the type of connectivity to use when determining which cells are considered adjacent during the flood fill operation.

### Grid Concept

```cpp
template <typename T>
concept Grid = requires(T t, size_t i) {
    { t[i] } -> std::ranges::random_access_range;
    { t[i][i] } -> std::convertible_to<typename T::value_type::value_type>;
    requires std::is_default_constructible_v<T>;
};
```

Purpose: Defines requirements for a type to be used as a grid with the flood fill algorithms.

Requirements:

- Must support indexed access with `[]` operator
- Each element accessed via `grid[i]` must be a random access range
- Elements of the inner range must be convertible to the grid's element type
- The grid type must be default constructible

### FloodFill Class

Namespace: `atom::algorithm`

#### Public Methods

##### `fillBFS` - Breadth-First Search Flood Fill

```cpp
template <Grid GridType>
static void fillBFS(
    GridType& grid, 
    int start_x, 
    int start_y,
    typename GridType::value_type::value_type target_color,
    typename GridType::value_type::value_type fill_color,
    Connectivity conn = Connectivity::Four
);
```

Purpose: Performs flood fill using a breadth-first search approach, which processes cells level by level, starting from the closest neighbors.

Parameters:

- `grid`: The 2D grid to perform flood fill on (modified in-place)
- `start_x`: The starting x-coordinate
- `start_y`: The starting y-coordinate
- `target_color`: The color to be replaced
- `fill_color`: The color to fill with
- `conn`: The connectivity type (default: Four)

Exceptions:

- `std::invalid_argument`: If the grid is empty or coordinates are invalid

Algorithm:

1. Validates input parameters
2. Uses a queue to manage cells to visit
3. Processes cells breadth-first (nearest neighbors first)
4. Logs operations via loguru

##### `fillDFS` - Depth-First Search Flood Fill

```cpp
template <Grid GridType>
static void fillDFS(
    GridType& grid, 
    int start_x, 
    int start_y,
    typename GridType::value_type::value_type target_color,
    typename GridType::value_type::value_type fill_color,
    Connectivity conn = Connectivity::Four
);
```

Purpose: Performs flood fill using a depth-first search approach, which follows each path as far as possible before backtracking.

Parameters:

- `grid`: The 2D grid to perform flood fill on (modified in-place)
- `start_x`: The starting x-coordinate
- `start_y`: The starting y-coordinate
- `target_color`: The color to be replaced
- `fill_color`: The color to fill with
- `conn`: The connectivity type (default: Four)

Exceptions:

- `std::invalid_argument`: If the grid is empty or coordinates are invalid

Algorithm:

1. Validates input parameters
2. Uses a stack to manage cells to visit
3. Processes cells depth-first (exploring each path completely)
4. Logs operations via loguru

##### `fillParallel` - Parallel Flood Fill

```cpp
template <Grid GridType>
static void fillParallel(
    GridType& grid, 
    int start_x, 
    int start_y,
    typename GridType::value_type::value_type target_color,
    typename GridType::value_type::value_type fill_color,
    Connectivity conn = Connectivity::Four,
    unsigned int num_threads = std::thread::hardware_concurrency()
);
```

Purpose: Performs flood fill using multiple threads, distributing work across the available cores for improved performance on large grids.

Parameters:

- `grid`: The 2D grid to perform flood fill on (modified in-place)
- `start_x`: The starting x-coordinate
- `start_y`: The starting y-coordinate
- `target_color`: The color to be replaced
- `fill_color`: The color to fill with
- `conn`: The connectivity type (default: Four)
- `num_threads`: Number of threads to use (default: hardware_concurrency)

Exceptions:

- `std::invalid_argument`: If the grid is empty or coordinates are invalid

Algorithm:

1. Validates input parameters
2. Performs initial BFS to identify seed points for parallel processing
3. Launches worker threads that process different regions of the grid
4. Uses mutex for thread synchronization when accessing the grid
5. Uses std::jthread for automatic joining on destruction

##### Specialized Implementations for std::vector<std::vector<int>>

```cpp
static void fillBFS(
    std::vector<std::vector<int>>& grid, 
    int start_x, 
    int start_y, 
    int target_color, 
    int fill_color,
    Connectivity conn = Connectivity::Four
);

static void fillDFS(
    std::vector<std::vector<int>>& grid, 
    int start_x, 
    int start_y, 
    int target_color, 
    int fill_color,
    Connectivity conn = Connectivity::Four
);
```

Purpose: Specialized versions optimized for the common case of integer grids.

Parameters: Same as template versions but specifically for `std::vector<std::vector<int>>`.

#### Private Methods

##### `isInBounds` - Boundary Check

```cpp
[[nodiscard]] static constexpr bool isInBounds(
    int x, 
    int y, 
    int rows, 
    int cols
) noexcept;
```

Purpose: Checks if coordinates are within the bounds of the grid.

Parameters:

- `x`: The x-coordinate to check
- `y`: The y-coordinate to check
- `rows`: Number of rows in the grid
- `cols`: Number of columns in the grid

Returns: `true` if position is within bounds, `false` otherwise

Notes:

- Marked `[[nodiscard]]` to ensure return value is used
- Marked `constexpr` for compile-time evaluation when possible
- Marked `noexcept` as it won't throw exceptions

##### `getDirections` - Direction Vector Generation

```cpp
[[nodiscard]] static auto getDirections(Connectivity conn) 
    -> std::vector<std::pair<int, int>>;
```

Purpose: Creates a vector of direction pairs based on the connectivity type.

Parameters:

- `conn`: The connectivity type (Four or Eight)

Returns: A vector of coordinate pairs representing direction vectors:

- For Four: (0,1), (1,0), (0,-1), (-1,0)
- For Eight: adds (-1,-1), (-1,1), (1,-1), (1,1)

##### `validateInput` - Input Validation

```cpp
template <Grid GridType>
static void validateInput(const GridType& grid, int start_x, int start_y);
```

Purpose: Validates that the grid is not empty and coordinates are within bounds.

Parameters:

- `grid`: The grid to validate
- `start_x`: The x-coordinate to validate
- `start_y`: The y-coordinate to validate

Exceptions:

- `std::invalid_argument`: If grid is empty or coordinates are invalid

## Usage Examples

### Basic BFS Flood Fill Example

```cpp
#include <iostream>
#include <vector>
#include "flood_fill.h"

int main() {
    // Create a 5x5 grid with all cells set to 0
    std::vector<std::vector<int>> grid(5, std::vector<int>(5, 0));
    
    // Set some cells to 1 to form a pattern
    grid[1][1] = 1;
    grid[1][2] = 1;
    grid[1][3] = 1;
    grid[2][1] = 1;
    grid[2][2] = 1;
    grid[2][3] = 1;
    grid[3][1] = 1;
    grid[3][2] = 1;
    grid[3][3] = 1;
    
    // Print the original grid
    std::cout << "Original grid:" << std::endl;
    for (const auto& row : grid) {
        for (int cell : row) {
            std::cout << cell << " ";
        }
        std::cout << std::endl;
    }
    
    // Perform flood fill using BFS
    // Parameters: grid, start_x, start_y, target_color, fill_color, connectivity
    atom::algorithm::FloodFill::fillBFS(grid, 2, 2, 1, 2, Connectivity::Four);
    
    // Print the filled grid
    std::cout << "\nGrid after flood fill:" << std::endl;
    for (const auto& row : grid) {
        for (int cell : row) {
            std::cout << cell << " ";
        }
        std::cout << std::endl;
    }
    
    return 0;
}
```

Expected output:

```
Original grid:
0 0 0 0 0
0 1 1 1 0
0 1 1 1 0
0 1 1 1 0
0 0 0 0 0

Grid after flood fill:
0 0 0 0 0
0 2 2 2 0
0 2 2 2 0
0 2 2 2 0
0 0 0 0 0
```

### DFS vs BFS Comparison Example

```cpp
#include <iostream>
#include <vector>
#include <string>
#include "flood_fill.h"

void printGrid(const std::vector<std::vector<int>>& grid, const std::string& label) {
    std::cout << label << ":" << std::endl;
    for (const auto& row : grid) {
        for (int cell : row) {
            std::cout << cell << " ";
        }
        std::cout << std::endl;
    }
    std::cout << std::endl;
}

int main() {
    // Create a larger grid with a maze-like pattern (0 is wall, 1 is path)
    std::vector<std::vector<int>> gridBFS = {
        {0, 0, 0, 0, 0, 0, 0, 0},
        {0, 1, 1, 1, 0, 1, 1, 0},
        {0, 1, 0, 1, 0, 1, 0, 0},
        {0, 1, 1, 1, 1, 1, 1, 0},
        {0, 0, 0, 1, 0, 0, 1, 0},
        {0, 1, 1, 1, 1, 1, 1, 0},
        {0, 1, 0, 0, 0, 0, 0, 0},
        {0, 1, 1, 1, 1, 1, 1, 0},
        {0, 0, 0, 0, 0, 0, 0, 0}
    };
    
    // Create a copy for DFS comparison
    auto gridDFS = gridBFS;
    
    printGrid(gridBFS, "Original grid");
    
    // Fill using BFS (breadth-first)
    atom::algorithm::FloodFill::fillBFS(gridBFS, 1, 1, 1, 2, Connectivity::Four);
    printGrid(gridBFS, "After BFS fill (fills in 'layers')");
    
    // Fill using DFS (depth-first)
    atom::algorithm::FloodFill::fillDFS(gridDFS, 1, 1, 1, 3, Connectivity::Four);
    printGrid(gridDFS, "After DFS fill (follows paths to completion)");
    
    return 0;
}
```

### Eight-Way Connectivity Example

```cpp
#include <iostream>
#include <vector>
#include "flood_fill.h"

void printGrid(const std::vector<std::vector<int>>& grid, const std::string& label) {
    std::cout << label << ":" << std::endl;
    for (const auto& row : grid) {
        for (int cell : row) {
            std::cout << cell << " ";
        }
        std::cout << std::endl;
    }
    std::cout << std::endl;
}

int main() {
    // Create two identical grids
    std::vector<std::vector<int>> grid4Way = {
        {1, 1, 1, 1, 1},
        {1, 0, 0, 0, 1},
        {1, 0, 1, 0, 1},
        {1, 0, 0, 0, 1},
        {1, 1, 1, 1, 1}
    };
    
    auto grid8Way = grid4Way;
    
    printGrid(grid4Way, "Original grid");
    
    // Fill using 4-way connectivity
    atom::algorithm::FloodFill::fillBFS(grid4Way, 0, 0, 1, 2, Connectivity::Four);
    printGrid(grid4Way, "After 4-way connectivity fill");
    // Note: The center '1' at (2,2) remains unchanged because it's 
    // diagonally connected to the outer '1's
    
    // Fill using 8-way connectivity
    atom::algorithm::FloodFill::fillBFS(grid8Way, 0, 0, 1, 3, Connectivity::Eight);
    printGrid(grid8Way, "After 8-way connectivity fill");
    // All '1's will be filled because 8-way connectivity includes diagonals
    
    return 0;
}
```

### Parallel Flood Fill Example

```cpp
#include <iostream>
#include <vector>
#include <chrono>
#include "flood_fill.h"

// Helper to measure execution time
template<typename Func>
long long measureExecutionTime(Func func) {
    auto start = std::chrono::high_resolution_clock::now();
    func();
    auto end = std::chrono::high_resolution_clock::now();
    return std::chrono::duration_cast<std::chrono::microseconds>(end - start).count();
}

int main() {
    // Create a large grid (100x100) for meaningful parallel comparison
    const int size = 100;
    std::vector<std::vector<int>> gridSerial(size, std::vector<int>(size, 1));
    auto gridParallel = gridSerial;
    
    std::cout << "Comparing performance on " << size << "x" << size << " grid...\n";
    
    // Measure BFS fill time
    auto serialTime = measureExecutionTime([&]() {
        atom::algorithm::FloodFill::fillBFS(gridSerial, 0, 0, 1, 2, Connectivity::Four);
    });
    
    // Measure parallel fill time (using 4 threads)
    auto parallelTime = measureExecutionTime([&]() {
        atom::algorithm::FloodFill::fillParallel(gridParallel, 0, 0, 1, 2, Connectivity::Four, 4);
    });
    
    std::cout << "Serial BFS fill time: " << serialTime << " microseconds\n";
    std::cout << "Parallel fill time: " << parallelTime << " microseconds\n";
    std::cout << "Speedup: " << static_cast<double>(serialTime) / parallelTime << "x\n";
    
    // Verify both grids have the same result
    bool identical = true;
    for (int i = 0; i < size && identical; i++) {
        for (int j = 0; j < size; j++) {
            if (gridSerial[i][j] != gridParallel[i][j]) {
                identical = false;
                break;
            }
        }
    }
    
    std::cout << "Results are " << (identical ? "identical" : "different") << std::endl;
    
    return 0;
}
```

### Custom Grid Type Example

```cpp
#include <iostream>
#include <vector>
#include <array>
#include "flood_fill.h"

// Define a custom grid type that meets the Grid concept requirements
template<size_t Rows, size_t Cols, typename T = int>
class FixedGrid {
public:
    using value_type = std::array<T, Cols>;
    
    FixedGrid() {
        // Initialize with default values
        for (auto& row : data) {
            row.fill(T{});
        }
    }
    
    std::array<T, Cols>& operator[](size_t idx) {
        return data[idx];
    }
    
    const std::array<T, Cols>& operator[](size_t idx) const {
        return data[idx];
    }
    
    bool empty() const { return false; }  // Never empty
    size_t size() const { return Rows; }
    
private:
    std::array<std::array<T, Cols>, Rows> data;
};

int main() {
    // Create a fixed-size grid (5x5)
    FixedGrid<5, 5, int> grid;
    
    // Set some cells to form a pattern
    for (int i = 1; i < 4; i++) {
        for (int j = 1; j < 4; j++) {
            grid[i][j] = 1;
        }
    }
    
    // Print the original grid
    std::cout << "Original grid:" << std::endl;
    for (size_t i = 0; i < grid.size(); i++) {
        for (size_t j = 0; j < grid[i].size(); j++) {
            std::cout << grid[i][j] << " ";
        }
        std::cout << std::endl;
    }
    
    // Perform flood fill on the custom grid type
    atom::algorithm::FloodFill::fillBFS(grid, 2, 2, 1, 5, Connectivity::Four);
    
    // Print the filled grid
    std::cout << "\nGrid after flood fill:" << std::endl;
    for (size_t i = 0; i < grid.size(); i++) {
        for (size_t j = 0; j < grid[i].size(); j++) {
            std::cout << grid[i][j] << " ";
        }
        std::cout << std::endl;
    }
    
    return 0;
}
```

## Implementation Details and Edge Cases

### Direction Vectors

The implementation uses direction vectors to determine which cells to check:

- Four-way connectivity: Checks only the cells directly above, below, left, and right of the current cell

  ```
  (0,1), (1,0), (0,-1), (-1,0)
  ```

- Eight-way connectivity: Also considers diagonal neighbors

  ```
  (0,1), (1,0), (0,-1), (-1,0), (-1,-1), (-1,1), (1,-1), (1,1)
  ```

### Edge Cases

1. Empty Grid: The implementation checks and throws an exception if the grid is empty.

2. Out-of-Bounds Access: Validates coordinates before accessing grid elements.

3. Target Color Equals Fill Color: No changes occur if the target color is the same as the fill color (prevents infinite recursion).

4. Start Position Doesn't Match Target Color: If the starting position doesn't contain the target color, the algorithm exits without making changes.

5. Small Areas in Parallel Fill: For very small regions, the parallel implementation might fall back to serial execution if not enough seed points are found.

## Performance Considerations

### Algorithm Complexity

- BFS and DFS: Both have O(n) time complexity where n is the number of cells with the target color. Each cell is visited exactly once.

- Space Complexity:
  - BFS: O(w) where w is the width of the region (maximum queue size)
  - DFS: O(h) where h is the height of the region (maximum stack depth)

### Parallel Implementation

- Overhead: For small grids, the overhead of thread creation may outweigh the benefits of parallelism.

- Optimal Thread Count: The default uses `std::thread::hardware_concurrency()`, but this can be adjusted based on the specific workload and hardware.

- Mutex Contention: Each thread locks the grid when accessing cells, which can cause contention in densely connected regions.

### Memory Usage

- BFS tends to use more memory than DFS due to the queue potentially holding large numbers of cells.

- Parallelization increases memory usage due to each thread maintaining its own local queue.

## Best Practices and Common Pitfalls

### Best Practices

1. Choose the Right Algorithm:
   - Use BFS for breadth-first filling (good for animation)
   - Use DFS when memory is limited and for deeper paths
   - Use Parallel for large grids on multi-core systems

2. Error Handling:
   - Always check return values and handle exceptions
   - Log failures for debugging

3. Performance:
   - For small grids, use the sequential algorithms
   - Adjust thread count based on grid size and system capabilities

### Common Pitfalls

1. Infinite Loops: Can occur if target color equals fill color (handled by the implementation)

2. Stack Overflow: DFS implementation uses an explicit stack to avoid recursion depth issues

3. Thread Contention: Over-parallelization can lead to thread contention and reduced performance

4. Memory Exhaustion: Very large grids can cause memory issues, especially with BFS

5. Type Compatibility: Ensure your grid type meets the `Grid` concept requirements

## Platform and Compiler Notes

- C++20 Required: Uses concepts, which require C++20 support
- Thread Support: Requires platform with thread support
- Compiler Compatibility:
  - GCC 10+ (full C++20 support)
  - Clang 13+
  - MSVC 19.28+ (Visual Studio 2019 16.8+)

- Logging: Uses loguru for logging, which may have platform-specific behavior

## Comprehensive Example

This example demonstrates all main features of the library: BFS, DFS, and parallel filling on different types of grids and connectivity patterns.

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <chrono>
#include <iomanip>
#include "flood_fill.h"

// Helper function to print a grid
template<typename GridType>
void printGrid(const GridType& grid, const std::string& label) {
    std::cout << label << ":" << std::endl;
    for (size_t i = 0; i < grid.size(); i++) {
        for (size_t j = 0; j < grid[0].size(); j++) {
            std::cout << std::setw(2) << grid[i][j] << " ";
        }
        std::cout << std::endl;
    }
    std::cout << std::endl;
}

// Helper to measure execution time
template<typename Func>
auto measureTime(Func&& func) {
    auto start = std::chrono::high_resolution_clock::now();
    std::forward<Func>(func)();
    auto end = std::chrono::high_resolution_clock::now();
    return std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count();
}

int main() {
    try {
        std::cout << "Flood Fill Algorithm Demonstration\n";
        std::cout << "==================================\n\n";
        
        // Create a maze-like grid for demonstration
        std::vector<std::vector<int>> maze = {
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
            {1, 0, 0, 0, 1, 0, 0, 0, 0, 1},
            {1, 0, 1, 0, 1, 0, 1, 1, 0, 1},
            {1, 0, 1, 0, 0, 0, 1, 0, 0, 1},
            {1, 0, 1, 1, 1, 1, 1, 0, 1, 1},
            {1, 0, 0, 0, 0, 0, 0, 0, 0, 1},
            {1, 1, 1, 1, 1, 1, 1, 1, 0, 1},
            {1, 0, 0, 0, 0, 0, 0, 0, 0, 1},
            {1, 0, 1, 1, 1, 1, 1, 1, 1, 1},
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1}
        };
        
        // Copy the original maze for different algorithms
        auto mazeBFS = maze;
        auto mazeDFS = maze;
        auto mazeParallel = maze;
        auto maze8Way = maze;
        
        printGrid(maze, "Original Maze (1=wall, 0=path)");
        
        // Part 1: Demonstrate BFS Fill
        std::cout << "Part 1: BFS Fill (replacing path with 2)\n";
        auto bfsTime = measureTime([&]() {
            atom::algorithm::FloodFill::fillBFS(mazeBFS, 1, 1, 0, 2, Connectivity::Four);
        });
        printGrid(mazeBFS, "After BFS Fill");
        std::cout << "BFS Execution time: " << bfsTime << "ms\n\n";
        
        // Part 2: Demonstrate DFS Fill
        std::cout << "Part 2: DFS Fill (replacing path with 3)\n";
        auto dfsTime = measureTime([&]() {
            atom::algorithm::FloodFill::fillDFS(mazeDFS, 1, 1, 0, 3, Connectivity::Four);
        });
        printGrid(mazeDFS, "After DFS Fill");
        std::cout << "DFS Execution time: " << dfsTime << "ms\n\n";
        
        // Part 3: Demonstrate Parallel Fill
        std::cout << "Part 3: Parallel Fill (replacing path with 4)\n";
        auto parallelTime = measureTime([&]() {
            atom::algorithm::FloodFill::fillParallel(mazeParallel, 1, 1, 0, 4, Connectivity::Four, 4);
        });
        printGrid(mazeParallel, "After Parallel Fill");
        std::cout << "Parallel Execution time: " << parallelTime << "ms\n\n";
        
        // Part 4: Demonstrate 8-way connectivity
        std::cout << "Part 4: 8-way Connectivity Fill (replacing path with 5)\n";
        auto time8Way = measureTime([&]() {
            atom::algorithm::FloodFill::fillBFS(maze8Way, 1, 1, 0, 5, Connectivity::Eight);
        });
        printGrid(maze8Way, "After 8-way Connectivity Fill");
        std::cout << "8-way Execution time: " << time8Way << "ms\n\n";
        
        // Part 5: Test larger grid for performance comparison
        const int largeSize = 500;
        std::cout << "Part 5: Performance Test on " << largeSize << "x" << largeSize << " grid\n";
        
        // Create a large grid
        std::vector<std::vector<int>> largeGrid(largeSize, std::vector<int>(largeSize, 0));
        // Add some barriers
        for (int i = 0; i < largeSize; i++) {
            largeGrid[i][largeSize/3] = 1;
            largeGrid[i][2*largeSize/3] = 1;
            largeGrid[largeSize/3][i] = 1;
            largeGrid[2*largeSize/3][i] = 1;
        }
        
        auto largeGridBFS = largeGrid;
        auto largeGridParallel = largeGrid;
        
        std::cout << "Running BFS on large grid...\n";
        auto largeBfsTime = measureTime([&]() {
            atom::algorithm::FloodFill::fillBFS(largeGridBFS, 0, 0, 0, 2, Connectivity::Four);
        });
        
        std::cout << "Running Parallel fill on large grid...\n";
        auto largeParallelTime = measureTime([&]() {
            atom::algorithm::FloodFill::fillParallel(largeGridParallel, 0, 0, 0, 2, 
                                                   Connectivity::Four, 
                                                   std::thread::hardware_concurrency());
        });
        
        std::cout << "Large grid BFS time: " << largeBfsTime << "ms\n";
        std::cout << "Large grid Parallel time: " << largeParallelTime << "ms\n";
        std::cout << "Speedup: " << static_cast<double>(largeBfsTime)/largeParallelTime << "x\n\n";
        
        std::cout << "All tests completed successfully.\n";
        
    } catch (const std::exception& e) {
        std::cerr << "ERROR: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
```

This comprehensive code example demonstrates:

1. All three fill algorithms (BFS, DFS, and parallel)
2. Both connectivity options (4-way and 8-way)
3. Performance measurements and comparisons
4. Error handling
5. Visual representation of results

The output will show the different fill patterns and execution times, highlighting the strengths of each algorithm variant.

## Conclusion

The `FloodFill` library provides a flexible and efficient implementation of flood fill algorithms suitable for various applications such as image processing, game development, and graph traversal. The library leverages modern C++ features to ensure type safety, performance, and extensibility.

By choosing the appropriate algorithm variant (BFS, DFS, or parallel) and connectivity type (4-way or 8-way), developers can optimize for their specific use case, whether it's memory usage, execution speed, or visual appearance of the fill pattern.
