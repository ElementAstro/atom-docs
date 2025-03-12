---
title: FloodFill Algorithm
description: Comprehensive documentation for the FloodFill algorithm in the atom::algorithm namespace, including features, requirements, and core methods.
---

## Overview

The `FloodFill` class provides efficient implementations of the flood fill algorithm using different traversal methods. Flood fill is a fundamental algorithm used in graphics applications to fill connected regions with a specific color, similar to the "paint bucket" tool in image editing software.

## Features

- Multiple traversal strategies: BFS, DFS, and parallel implementations
- Flexible connectivity options: 4-way or 8-way connectivity
- Type safety through C++ concepts
- Thread safety in parallel implementation
- Comprehensive error handling
- Detailed logging throughout the process

## Requirements

The class requires a grid data structure that satisfies the `Grid` concept:

```cpp
template <typename T>
concept Grid = requires(T t, size_t i) {
    { t[i] } -> std::ranges::random_access_range;
    { t[i][i] } -> std::convertible_to<typename T::value_type::value_type>;
    requires std::is_default_constructible_v<T>;
};
```

This ensures the grid:

- Provides random access to its elements
- Has a 2D structure with consistent value types
- Can be default-constructed

## Connectivity Options

```cpp
enum class Connectivity {
    Four,  // 4-way connectivity (up, down, left, right)
    Eight  // 8-way connectivity (up, down, left, right, and diagonals)
};
```

## Core Methods

### BFS Flood Fill

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

Purpose: Performs flood fill using a breadth-first search algorithm.

Parameters:

- `grid`: The 2D grid to perform the flood fill on
- `start_x`: Starting x-coordinate
- `start_y`: Starting y-coordinate
- `target_color`: Color to be replaced
- `fill_color`: Color to fill with
- `conn`: Type of connectivity (4-way or 8-way)

Exceptions:

- `std::invalid_argument`: If grid is empty or coordinates are invalid

### DFS Flood Fill

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

Purpose: Performs flood fill using a depth-first search algorithm.

Parameters: Same as `fillBFS`

Exceptions: Same as `fillBFS`

### Parallel Flood Fill

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

Purpose: Performs flood fill using multiple threads for improved performance.

Parameters:

- Same as `fillBFS` and `fillDFS`
- `num_threads`: Number of threads to use (defaults to hardware concurrency)

Exceptions: Same as `fillBFS`

Implementation Details:

- First identifies "seed" points using a single-threaded BFS
- Distributes processing from these seed points across multiple threads
- Uses mutex for thread safety when accessing the grid
- Uses `std::jthread` for automatic thread joining

### Specialized Methods for Vector of Vectors

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

Purpose: Convenience methods specialized for `std::vector<std::vector<int>>` grids.

## Helper Methods

### isInBounds

```cpp
[[nodiscard]] static constexpr bool isInBounds(
    int x, 
    int y, 
    int rows,
    int cols
) noexcept;
```

Purpose: Checks if coordinates are within the grid boundaries.

### getDirections

```cpp
[[nodiscard]] static auto getDirections(Connectivity conn)
    -> std::vector<std::pair<int, int>>;
```

Purpose: Returns direction vectors based on the connectivity type.

### validateInput

```cpp
template <Grid GridType>
static void validateInput(
    const GridType& grid, 
    int start_x, 
    int start_y
);
```

Purpose: Validates grid and coordinates before processing.

## Performance Considerations

- BFS: Generally more efficient for wide, shallow fills
- DFS: More memory-efficient but may cause stack overflow for large areas
- Parallel: Best for large areas but has overhead for small fills

## Complete Usage Example

```cpp
#include <iostream>
#include <vector>
#include "flood_fill.h"

void printGrid(const std::vector<std::vector<int>>& grid) {
    for (const auto& row : grid) {
        for (int val : row) {
            std::cout << val << " ";
        }
        std::cout << std::endl;
    }
    std::cout << std::endl;
}

int main() {
    // Initialize logging
    loguru::init(argc, argv);
    
    // Create a test grid (0 = white, 1 = black)
    std::vector<std::vector<int>> grid = {
        {1, 1, 1, 1, 1, 1, 1, 1},
        {1, 0, 0, 0, 0, 0, 0, 1},
        {1, 0, 1, 1, 1, 1, 0, 1},
        {1, 0, 1, 0, 0, 1, 0, 1},
        {1, 0, 1, 0, 0, 1, 0, 1},
        {1, 0, 1, 1, 1, 1, 0, 1},
        {1, 0, 0, 0, 0, 0, 0, 1},
        {1, 1, 1, 1, 1, 1, 1, 1}
    };
    
    std::cout << "Original grid:" << std::endl;
    printGrid(grid);
    
    // Fill the inner region (at position 3,3) with value 2
    atom::algorithm::FloodFill::fillBFS(grid, 3, 3, 0, 2, Connectivity::Four);
    
    std::cout << "After BFS flood fill:" << std::endl;
    printGrid(grid);
    
    // Create a new grid for DFS demo
    std::vector<std::vector<int>> grid2 = {
        {1, 1, 1, 1, 1, 1, 1, 1},
        {1, 0, 0, 0, 0, 0, 0, 1},
        {1, 0, 1, 1, 1, 1, 0, 1},
        {1, 0, 1, 0, 0, 1, 0, 1},
        {1, 0, 1, 0, 0, 1, 0, 1},
        {1, 0, 1, 1, 1, 1, 0, 1},
        {1, 0, 0, 0, 0, 0, 0, 1},
        {1, 1, 1, 1, 1, 1, 1, 1}
    };
    
    // Fill using DFS (outer region, 8-way connectivity)
    atom::algorithm::FloodFill::fillDFS(grid2, 1, 1, 0, 3, Connectivity::Eight);
    
    std::cout << "After DFS flood fill:" << std::endl;
    printGrid(grid2);
    
    // Create a larger grid for parallel demo
    std::vector<std::vector<int>> largeGrid(100, std::vector<int>(100, 0));
    // Fill border with 1s
    for (int i = 0; i < 100; i++) {
        largeGrid[0][i] = 1;
        largeGrid[99][i] = 1;
        largeGrid[i][0] = 1;
        largeGrid[i][99] = 1;
    }
    
    // Fill using parallel implementation
    atom::algorithm::FloodFill::fillParallel(largeGrid, 50, 50, 0, 4, Connectivity::Four, 4);
    
    std::cout << "Parallel fill completed on large grid" << std::endl;
    
    return 0;
}
```

## Expected Output

```
Original grid:
1 1 1 1 1 1 1 1
1 0 0 0 0 0 0 1
1 0 1 1 1 1 0 1
1 0 1 0 0 1 0 1
1 0 1 0 0 1 0 1
1 0 1 1 1 1 0 1
1 0 0 0 0 0 0 1
1 1 1 1 1 1 1 1

After BFS flood fill:
1 1 1 1 1 1 1 1
1 0 0 0 0 0 0 1
1 0 1 1 1 1 0 1
1 0 1 2 2 1 0 1
1 0 1 2 2 1 0 1
1 0 1 1 1 1 0 1
1 0 0 0 0 0 0 1
1 1 1 1 1 1 1 1

After DFS flood fill:
1 1 1 1 1 1 1 1
1 3 3 3 3 3 3 1
1 3 1 1 1 1 3 1
1 3 1 0 0 1 3 1
1 3 1 0 0 1 3 1
1 3 1 1 1 1 3 1
1 3 3 3 3 3 3 1
1 1 1 1 1 1 1 1

Parallel fill completed on large grid
```

## Time Complexity

- BFS and DFS: O(n × m) where n and m are the dimensions of the grid
- Parallel: O(n × m / t) theoretically, where t is the number of threads, but with synchronization overhead

## Space Complexity

- BFS: O(n × m) in worst case (when filling the entire grid)
- DFS: O(n × m) in worst case due to stack space
- Parallel: O(n × m) plus additional overhead for thread management
