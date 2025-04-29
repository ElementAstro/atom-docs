---
title: "Atom Pathfinding Library"
description: "Comprehensive pathfinding library for C++20 with various algorithms and utilities."
keywords: ["C++20", "pathfinding", "A*", "Dijkstra", "JPS", "grid", "graph"]
---

## Purpose and High-Level Overview

The Atom Pathfinding Library provides a comprehensive collection of pathfinding algorithms and related utilities for navigating 2D grids and abstract graphs. It is designed for applications such as:

- Game development (character navigation, AI pathing)
- Robotics (route planning)
- Geographic information systems
- Network routing

This C++20 library offers multiple pathfinding algorithms, customizable heuristics, terrain handling, and path optimization tools with a focus on performance and extensibility.

## Required Headers and Dependencies

The library requires C++20 or newer and depends on the following standard library components:

```cpp
#include <algorithm>    // For std::ranges algorithms
#include <cmath>        // For math functions
#include <concepts>     // For C++20 concepts
#include <cstdint>      // For fixed-width integer types
#include <functional>   // For std::greater and function objects
#include <optional>     // For std::optional
#include <queue>        // For std::priority_queue
#include <ranges>       // For C++20 ranges
#include <span>         // For std::span
#include <unordered_map>    // For hash maps
#include <unordered_set>    // For hash sets
#include <vector>       // For std::vector
```

No external dependencies are required.

## Class and Component Documentation

### Point Structure

```cpp
namespace atom::algorithm {

struct Point {
    int x;
    int y;

    // Using C++20 spaceship operator
    auto operator<=>(const Point&) const = default;
    bool operator==(const Point&) const = default;

    // Utility functions for point arithmetic
    Point operator+(const Point& other) const;
    Point operator-(const Point& other) const;
};

}
```

Purpose: Represents a 2D coordinate with integer x and y components.

Features:

- Full comparison support with C++20's spaceship operator
- Equality testing
- Addition and subtraction for coordinate arithmetic

Example:

```cpp
#include <atom/algorithm/pathfinding.hpp>

void point_example() {
    using atom::algorithm::Point;
    
    // Create points
    Point p1 = {5, 10};
    Point p2 = {3, 4};
    
    // Arithmetic operations
    Point sum = p1 + p2;      // Results in {8, 14}
    Point diff = p1 - p2;     // Results in {2, 6}
    
    // Comparison
    bool equal = (p1 == p2);  // false
}
```

### Graph Interface and Concept

```cpp
template <typename NodeType>
class IGraph {
public:
    using node_type = NodeType;

    virtual ~IGraph() = default;
    virtual std::vector<NodeType> neighbors(const NodeType& node) const = 0;
    virtual float cost(const NodeType& from, const NodeType& to) const = 0;
};

// Concept for a valid Graph type
template <typename G>
concept Graph = requires(G g, typename G::node_type n) {
    { g.neighbors(n) } -> std::ranges::range;
    { g.cost(n, n) } -> std::convertible_to<float>;
};
```

Purpose: Defines a generic interface for any graph structure that can be used with the pathfinding algorithms.

Key Methods:

- neighbors: Returns all nodes directly connected to the given node
- cost: Returns the cost/distance between two adjacent nodes

The Graph Concept:

- Ensures a type has a `node_type` and the required methods
- Used in template constraints to validate graph types at compile time

### Heuristic Functions

```cpp
namespace heuristics {

// Heuristic concept
template <typename F, typename Node>
concept Heuristic =
    std::invocable<F, Node, Node> &&
    std::convertible_to<std::invoke_result_t<F, Node, Node>, float>;

// Heuristic functions
float manhattan(const Point& a, const Point& b);
float euclidean(const Point& a, const Point& b);
float diagonal(const Point& a, const Point& b);
float zero(const Point& a, const Point& b);
float octile(const Point& a, const Point& b);

}
```

Purpose: Provides estimations of distance between nodes for guided pathfinding algorithms.

Available Heuristics:

- manhattan: Sum of absolute differences in coordinates (best for grid-based maps with no diagonal movement)
- euclidean: Straight-line distance (best for unrestricted movement)
- diagonal: Accounts for diagonal movement on grids
- zero: Always returns 0 (turns A* into Dijkstra's algorithm)
- octile: Optimized distance metric for grid maps with diagonal movement

Example:

```cpp
#include <atom/algorithm/pathfinding.hpp>

void heuristic_example() {
    using namespace atom::algorithm;
    
    Point a = {0, 0};
    Point b = {3, 4};
    
    float manhattan_dist = heuristics::manhattan(a, b);  // 7
    float euclidean_dist = heuristics::euclidean(a, b);  // 5
    float octile_dist = heuristics::octile(a, b);        // ~5.4
    
    // Custom heuristic example
    auto custom_heuristic = [](const Point& a, const Point& b) -> float {
        // Weighted euclidean distance
        return 1.2f * std::hypot(a.x - b.x, a.y - b.y);
    };
}
```

### GridMap Class

```cpp
class GridMap : public IGraph<Point> {
public:
    // Movement direction flags
    enum Direction : uint8_t {
        NONE = 0, N = 1, E = 2, S = 4, W = 8,
        NE = N | E, SE = S | E, SW = S | W, NW = N | W
    };

    // Terrain types with associated costs
    enum class TerrainType : uint8_t {
        Open = 0,           // Normal traversable area
        Difficult = 1,      // Difficult terrain (like gravel, high grass)
        VeryDifficult = 2,  // Very difficult terrain (like swamp)
        Road = 3,           // Road (faster movement)
        Water = 4,          // Water (some units may traverse)
        Obstacle = 5        // Obstacle (impassable)
    };

    // Constructors
    GridMap(int width, int height);
    GridMap(std::span<const bool> obstacles, int width, int height);
    GridMap(std::span<const uint8_t> obstacles, int width, int height);

    // IGraph implementation
    std::vector<Point> neighbors(const Point& p) const override;
    float cost(const Point& from, const Point& to) const override;

    // Advanced neighborhood functions
    std::vector<Point> getNeighborsForJPS(const Point& p, Direction allowedDirections) const;
    std::vector<Point> naturalNeighbors(const Point& p) const;

    // Grid management
    bool isValid(const Point& p) const;
    void setObstacle(const Point& p, bool isObstacle);
    bool hasObstacle(const Point& p) const;

    // Terrain functions
    void setTerrain(const Point& p, TerrainType terrain);
    TerrainType getTerrain(const Point& p) const;
    float getTerrainCost(TerrainType terrain) const;

    // JPS support methods
    bool hasForced(const Point& p, Direction dir) const;
    Direction getDirType(const Point& p, const Point& next) const;

    // Accessors
    int getWidth() const;
    int getHeight() const;
    Point indexToPoint(int index) const;
    int pointToIndex(const Point& p) const;

private:
    int width_;
    int height_;
    std::vector<bool> obstacles_;
    std::vector<TerrainType> terrain_;
};
```

Purpose: Implements a 2D grid map with obstacles and different terrain types for pathfinding.

Key Features:

- Multiple constructors for different initialization scenarios
- Terrain system with varying movement costs
- Directional movement flags for advanced algorithms
- Helper methods for Jump Point Search algorithm
- Coordinate conversion utilities

Example:

```cpp
#include <atom/algorithm/pathfinding.hpp>

void gridmap_example() {
    using namespace atom::algorithm;
    
    // Create a 20x15 grid
    GridMap map(20, 15);
    
    // Add obstacles
    map.setObstacle({5, 5}, true);
    map.setObstacle({5, 6}, true);
    map.setObstacle({5, 7}, true);
    
    // Set terrain types
    map.setTerrain({10, 8}, GridMap::TerrainType::Difficult);
    map.setTerrain({11, 8}, GridMap::TerrainType::Road);
    map.setTerrain({12, 8}, GridMap::TerrainType::Water);
    
    // Check if position is valid and has obstacle
    bool is_valid = map.isValid({15, 10});  // true
    bool has_obstacle = map.hasObstacle({5, 5});  // true
    
    // Get accessible neighbors
    std::vector<Point> neighbors = map.neighbors({6, 6});
    
    // Convert between 1D index and 2D coordinates
    int index = map.pointToIndex({3, 2});
    Point point = map.indexToPoint(index);
}
```

### PathFinder Class

```cpp
class PathFinder {
public:
    // Enum for selecting heuristic type
    enum class HeuristicType { Manhattan, Euclidean, Diagonal, Octile };

    // Enum for selecting algorithm type
    enum class AlgorithmType { AStar, Dijkstra, BiDirectional, JPS };

    // Main pathfinding algorithms
    template <Graph G, heuristics::Heuristic<typename G::node_type> H>
    static std::optional<std::vector<typename G::node_type>> findPath(
        const G& graph, const typename G::node_type& start,
        const typename G::node_type& goal, H&& heuristic);
        
    template <Graph G>
    static std::optional<std::vector<typename G::node_type>> findPath(
        const G& graph, const typename G::node_type& start,
        const typename G::node_type& goal);
        
    template <Graph G, heuristics::Heuristic<typename G::node_type> H>
    static std::optional<std::vector<typename G::node_type>> findBidirectionalPath(
        const G& graph, const typename G::node_type& start,
        const typename G::node_type& goal, H&& heuristic);
        
    static std::optional<std::vector<Point>> findJPSPath(
        const GridMap& map, const Point& start, const Point& goal);
        
    // Convenience method
    static std::optional<std::vector<Point>> findGridPath(
        const GridMap& map, const Point& start, const Point& goal,
        HeuristicType heuristicType = HeuristicType::Manhattan,
        AlgorithmType algorithmType = AlgorithmType::AStar);
        
    // Path post-processing
    static std::vector<Point> smoothPath(
        const std::vector<Point>& path, const GridMap& map);
        
    static std::vector<Point> funnelAlgorithm(
        const std::vector<Point>& path, const GridMap& map);
        
private:
    // Helper methods
    static std::optional<Point> jump(
        const GridMap& map, const Point& current,
        const Point& direction, const Point& goal);
        
    template <Graph G, heuristics::Heuristic<typename G::node_type> H>
    static bool processOneStep(/* parameters */);
};
```

Purpose: Provides various pathfinding algorithms and utilities for finding and optimizing paths.

Key Algorithms:

- A* algorithm: Efficient guided pathfinding (with heuristic)
- Dijkstra's algorithm: Guarantees shortest path (A* with zero heuristic)
- Bidirectional search: Searches from both start and goal for faster results
- Jump Point Search (JPS): Highly optimized for uniform grid maps

Path Optimization:

- smoothPath: Removes unnecessary waypoints
- funnelAlgorithm: Finds shortest path through a corridor

Example:

```cpp
#include <atom/algorithm/pathfinding.hpp>

void pathfinder_example() {
    using namespace atom::algorithm;
    
    GridMap map(30, 30);
    
    // Add some obstacles
    for (int i = 10; i < 20; i++) {
        map.setObstacle({i, 15}, true);
    }
    
    Point start = {5, 15};
    Point goal = {25, 15};
    
    // A* with Manhattan heuristic
    auto path1 = PathFinder::findPath(map, start, goal, heuristics::manhattan);
    
    // Dijkstra's algorithm
    auto path2 = PathFinder::findPath(map, start, goal);
    
    // Bidirectional search
    auto path3 = PathFinder::findBidirectionalPath(map, start, goal, heuristics::manhattan);
    
    // Jump Point Search
    auto path4 = PathFinder::findJPSPath(map, start, goal);
    
    // Convenience method
    auto path5 = PathFinder::findGridPath(
        map, start, goal,
        PathFinder::HeuristicType::Octile,
        PathFinder::AlgorithmType::AStar);
    
    // Post-process a path
    if (path1) {
        auto smoothed_path = PathFinder::smoothPath(*path1, map);
        auto funnel_path = PathFinder::funnelAlgorithm(*path1, map);
    }
}
```

## Algorithm Descriptions and Implementation Details

### A* Algorithm

The A* algorithm is implemented in the `findPath` method:

```cpp
template <Graph G, heuristics::Heuristic<typename G::node_type> H>
static std::optional<std::vector<typename G::node_type>> findPath(
    const G& graph, const typename G::node_type& start,
    const typename G::node_type& goal, H&& heuristic);
```

Key Implementation Details:

- Uses a priority queue for open set management
- Pre-allocates memory for maps and sets to improve performance
- Tracks path using a cameFrom map for path reconstruction
- Uses f-score = g-score + heuristic to prioritize promising nodes

Parameters:

- `graph`: Any type that satisfies the Graph concept
- `start`: Starting node
- `goal`: Goal node
- `heuristic`: Function estimating distance from a node to goal

Returns:

- `std::optional<std::vector<Node>>`: A path from start to goal if one exists, or nullopt if no path is found

Exceptions:

- None thrown directly, but may propagate exceptions from the graph implementation

### Bidirectional Search

```cpp
template <Graph G, heuristics::Heuristic<typename G::node_type> H>
static std::optional<std::vector<typename G::node_type>> findBidirectionalPath(
    const G& graph, const typename G::node_type& start,
    const typename G::node_type& goal, H&& heuristic);
```

Purpose: Searches from both start and goal simultaneously to find a meeting point, which can be significantly faster than unidirectional search for long paths.

Key Implementation Details:

- Maintains two sets of data structures (one for forward search, one for backward)
- Uses a meeting point to track where the two searches meet
- Alternates between forward and backward searches for balanced exploration
- Tracks the best total cost path when searches meet

### Jump Point Search (JPS)

```cpp
static std::optional<std::vector<Point>> findJPSPath(
    const GridMap& map, const Point& start, const Point& goal);
```

Purpose: A highly optimized algorithm specifically for uniform-cost grid maps that can be significantly faster than A* by eliminating symmetrical paths.

Key Implementation Details:

- Only examines "jump points" instead of all neighbors
- Uses forced neighbors concept to identify potential turning points
- Skips straight-line segments with no decision points
- Specialized for grid maps only (not generic graphs)

## Key Features with Code Examples

### Custom Graph Implementation

```cpp
#include <atom/algorithm/pathfinding.hpp>
#include <string>
#include <unordered_map>

class CityGraph : public atom::algorithm::IGraph<std::string> {
private:
    std::unordered_map<std::string, std::vector<std::string>> connections;
    std::unordered_map<std::string, std::unordered_map<std::string, float>> distances;

public:
    // Add a connection between cities
    void addConnection(const std::string& from, const std::string& to, float distance) {
        connections[from].push_back(to);
        connections[to].push_back(from); // Two-way connection
        distances[from][to] = distance;
        distances[to][from] = distance;
    }

    // IGraph implementation
    std::vector<std::string> neighbors(const std::string& node) const override {
        auto it = connections.find(node);
        if (it != connections.end()) {
            return it->second;
        }
        return {};
    }

    float cost(const std::string& from, const std::string& to) const override {
        auto fromIt = distances.find(from);
        if (fromIt != distances.end()) {
            auto toIt = fromIt->second.find(to);
            if (toIt != fromIt->second.end()) {
                return toIt->second;
            }
        }
        return std::numeric_limits<float>::infinity();
    }
};

int main() {
    using namespace atom::algorithm;
    
    // Create a graph of cities
    CityGraph cities;
    
    // Add connections with distances in kilometers
    cities.addConnection("New York", "Boston", 306.0f);
    cities.addConnection("New York", "Philadelphia", 151.0f);
    cities.addConnection("Boston", "Portland", 175.0f);
    // Add more cities...
    
    // Find path from Boston to Atlanta
    auto path = PathFinder::findPath(cities, "Boston", "Atlanta", 
                                     heuristics::zero); // Using Dijkstra
    
    // Check if path exists and print it
    if (path) {
        std::cout << "Path found:\n";
        for (const auto& city : *path) {
            std::cout << city << " -> ";
        }
        std::cout << "Arrived!\n";
    } else {
        std::cout << "No path found\n";
    }
    
    return 0;
}
```

### Working with Terrain Types

```cpp
#include <atom/algorithm/pathfinding.hpp>
#include <iostream>

int main() {
    using namespace atom::algorithm;
    
    // Create a 20x20 grid map
    GridMap map(20, 20);
    
    // Set up different terrain types
    // Create a road
    for (int i = 0; i < 20; i++) {
        map.setTerrain({i, 10}, GridMap::TerrainType::Road);
    }
    
    // Create difficult terrain area
    for (int x = 5; x < 15; x++) {
        for (int y = 5; y < 9; y++) {
            map.setTerrain({x, y}, GridMap::TerrainType::Difficult);
        }
    }
    
    // Create a water area (more expensive to cross)
    for (int x = 5; x < 15; x++) {
        for (int y = 12; y < 16; y++) {
            map.setTerrain({x, y}, GridMap::TerrainType::Water);
        }
    }
    
    // Add some obstacles
    for (int i = 5; i < 15; i++) {
        if (i != 10) { // Leave a passage at x=10
            map.setObstacle({i, 4}, true);
            map.setObstacle({i, 16}, true);
        }
    }
    
    Point start = {2, 10};
    Point goal = {18, 10};
    
    // Find path considering terrain costs
    auto path = PathFinder::findPath(map, start, goal, heuristics::manhattan);
    
    if (path) {
        std::cout << "Path found with " << path->size() << " steps\n";
        
        // Print terrain type for each step
        for (const auto& point : *path) {
            auto terrain = map.getTerrain(point);
            std::cout << "(" << point.x << ", " << point.y << ") - ";
            
            switch (terrain) {
                case GridMap::TerrainType::Open:
                    std::cout << "Open ground\n";
                    break;
                case GridMap::TerrainType::Road:
                    std::cout << "Road (fast)\n";
                    break;
                case GridMap::TerrainType::Difficult:
                    std::cout << "Difficult terrain\n";
                    break;
                case GridMap::TerrainType::Water:
                    std::cout << "Water (slow)\n";
                    break;
                default:
                    std::cout << "Other terrain\n";
                    break;
            }
        }
    } else {
        std::cout << "No path found!\n";
    }
    
    return 0;
}
```

### Path Optimization

```cpp
#include <atom/algorithm/pathfinding.hpp>
#include <iostream>

int main() {
    using namespace atom::algorithm;
    
    GridMap map(30, 30);
    
    // Add walls to create corridors
    for (int i = 5; i < 25; i++) {
        map.setObstacle({i, 10}, true);
        map.setObstacle({i, 20}, true);
    }
    
    // Leave gaps in the walls
    map.setObstacle({15, 10}, false);
    map.setObstacle({15, 20}, false);
    
    Point start = {2, 15};
    Point goal = {28, 15};
    
    // Find a basic path
    auto path = PathFinder::findPath(map, start, goal, heuristics::manhattan);
    
    if (path) {
        std::cout << "Original path: " << path->size() << " points\n";
        
        // Smooth the path to remove unnecessary zigzags
        auto smoothed_path = PathFinder::smoothPath(*path, map);
        std::cout << "Smoothed path: " << smoothed_path.size() << " points\n";
        
        // Apply funnel algorithm for optimal corridor navigation
        auto funnel_path = PathFinder::funnelAlgorithm(*path, map);
        std::cout << "Funnel path: " << funnel_path.size() << " points\n";
        
        // Print the paths for comparison
        std::cout << "\nOriginal path coordinates:\n";
        for (const auto& point : *path) {
            std::cout << "(" << point.x << ", " << point.y << ") ";
        }
        
        std::cout << "\n\nSmoothed path coordinates:\n";
        for (const auto& point : smoothed_path) {
            std::cout << "(" << point.x << ", " << point.y << ") ";
        }
        
        std::cout << "\n\nFunnel path coordinates:\n";
        for (const auto& point : funnel_path) {
            std::cout << "(" << point.x << ", " << point.y << ") ";
        }
        std::cout << "\n";
    } else {
        std::cout << "No path found!\n";
    }
    
    return 0;
}
```

### Algorithm Comparison

```cpp
#include <atom/algorithm/pathfinding.hpp>
#include <iostream>
#include <chrono>
#include <iomanip>

int main() {
    using namespace atom::algorithm;
    using namespace std::chrono;
    
    // Create a grid map
    GridMap map(100, 100);
    
    // Add some random obstacles
    std::srand(42); // For reproducible results
    for (int i = 0; i < 2000; i++) {
        int x = std::rand() % 100;
        int y = std::rand() % 100;
        map.setObstacle({x, y}, true);
    }
    
    // Make sure start and goal are not obstacles
    Point start = {5, 5};
    Point goal = {95, 95};
    map.setObstacle(start, false);
    map.setObstacle(goal, false);
    
    // Lambda to run and time a pathfinding algorithm
    auto run_algorithm = [&](const std::string& name, auto algorithm_func) {
        auto t1 = high_resolution_clock::now();
        auto path = algorithm_func();
        auto t2 = high_resolution_clock::now();
        auto time_ms = duration_cast<milliseconds>(t2 - t1).count();
        
        std::cout << std::left << std::setw(15) << name
                  << std::setw(8) << time_ms << "ms  "
                  << std::setw(10) << (path ? std::to_string(path->size()) + " steps" : "No path")
                  << std::endl;
                  
        return path;
    };
    
    std::cout << "Algorithm comparison:\n";
    std::cout << "-----------------------------------------\n";
    std::cout << std::left << std::setw(15) << "Algorithm" 
              << std::setw(10) << "Time" 
              << std::setw(10) << "Path Size" << std::endl;
    std::cout << "-----------------------------------------\n";
    
    // Run all algorithms
    auto path_astar = run_algorithm("A* Manhattan", [&]() {
        return PathFinder::findPath(map, start, goal, heuristics::manhattan);
    });
    
    auto path_astar_octile = run_algorithm("A* Octile", [&]() {
        return PathFinder::findPath(map, start, goal, heuristics::octile);
    });
    
    auto path_dijkstra = run_algorithm("Dijkstra", [&]() {
        return PathFinder::findPath(map, start, goal);
    });
    
    auto path_bidir = run_algorithm("Bidirectional", [&]() {
        return PathFinder::findBidirectionalPath(map, start, goal, heuristics::manhattan);
    });
    
    auto path_jps = run_algorithm("JPS", [&]() {
        return PathFinder::findJPSPath(map, start, goal);
    });
    
    std::cout << "-----------------------------------------\n";
    
    return 0;
}
```

## Performance Considerations

### Memory Usage

- The library pre-allocates memory for data structures to reduce allocations during search
- For large maps (>1000×1000), the closed set can consume significant memory
- Path storage vectors are pre-allocated based on estimated path length

### Algorithm Performance

| Algorithm | Strengths | Weaknesses | Best For |
|-----------|-----------|------------|----------|
| A* | Fast with good heuristic | Depends on heuristic quality | General pathfinding |
| Dijkstra | Optimal paths | Slow on large maps | When no good heuristic exists |
| Bidirectional | Faster for long paths | More complex implementation | Long distances in large graphs |
| JPS | Very fast on uniform grids | Only works on grid maps | Games with open areas |

### Optimization Tips

1. Choose the appropriate algorithm for your specific use case
2. Select the right heuristic:
   - Manhattan for grid maps with no diagonal movement
   - Octile for grid maps with diagonal movement
   - Euclidean for unrestricted movement
3. Batch processing:
   - Pre-compute common paths for frequently used routes
   - Reuse grid maps when possible instead of creating new instances

## 7. Best Practices and Common Pitfalls

### Best Practices

1. Initialization:
   - Use the appropriate GridMap constructor for your use case
   - Pre-allocate space if you know the expected map size

2. Algorithm Selection:
   - A* for general pathfinding
   - JPS for uniform-cost grid maps with many open areas
   - Bidirectional for very long paths

3. Path Post-Processing:
   - Use `smoothPath()` to remove unnecessary zigzags
   - Apply `funnelAlgorithm()` for optimal paths through corridors

### Common Pitfalls

1. Invalid Points:
   - Always check if a point is valid (`isValid()`) before using it
   - Handle the case when no path is found (check the optional return)

2. Heuristic Selection:
   - Using Euclidean distance for grid-based movement can lead to suboptimal paths
   - Non-admissible heuristics may not find optimal paths

3. Performance Issues:
   - Using Dijkstra's algorithm on very large maps
   - Not implementing chunking for extremely large worlds

4. Diagonal Movement:
   - Allowing diagonal movement through obstacles at corners
   - Not accounting for increased diagonal movement cost

## Platform/Compiler-specific Notes

### Compiler Requirements

This library requires a C++20-compliant compiler for:

- Concepts
- Ranges library
- `<span>` header
- Spaceship operator (<=>)

### Tested Compilers

| Compiler | Minimum Version | Notes |
|----------|-----------------|-------|
| GCC | 10.0+ | Full C++20 support |
| Clang | 10.0+ | Full C++20 support |
| MSVC | 19.29+ | Visual Studio 2019 v16.10+ |

### Platform-Specific Considerations

- Windows: Enable `/std:c++20` or `/std:c++latest` in MSVC compiler options
- Linux/macOS: Ensure libstdc++ or libc++ with C++20 support is installed
- Embedded: Consider using 16-bit integers for Point coordinates to save memory

## Comprehensive Example

This example demonstrates a complete application that creates a complex map, finds paths using different algorithms, compares their performance, and illustrates the path smoothing capabilities.

```cpp
#include <atom/algorithm/pathfinding.hpp>
#include <iostream>
#include <chrono>
#include <iomanip>
#include <string>
#include <vector>

// Helper function to create a test map
atom::algorithm::GridMap createTestMap() {
    using namespace atom::algorithm;
    
    // Create a 30x30 grid map
    GridMap map(30, 30);
    
    // Add maze-like obstacles
    for (int i = 5; i < 25; i++) {
        map.setObstacle({i, 10}, true);
        map.setObstacle({i, 20}, true);
    }
    
    // Create openings in the walls
    map.setObstacle({15, 10}, false);
    map.setObstacle({15, 20}, false);
    
    // Add vertical walls
    for (int i = 10; i < 21; i++) {
        map.setObstacle({10, i}, true);
        map.setObstacle({20, i}, true);
    }
    
    // Create an opening
    map.setObstacle({10, 15}, false);
    map.setObstacle({20, 15}, false);
    
    // Add different terrain types
    
    // Road along the bottom
    for (int x = 0; x < 30; x++) {
        map.setTerrain({x, 28}, GridMap::TerrainType::Road);
    }
    
    // Difficult terrain in top-left
    for (int y = 2; y < 8; y++) {
        for (int x = 2; x < 8; x++) {
            map.setTerrain({x, y}, GridMap::TerrainType::Difficult);
        }
    }
    
    // Water area in bottom-right
    for (int y = 22; y < 28; y++) {
        for (int x = 22; x < 28; x++) {
            map.setTerrain({x, y}, GridMap::TerrainType::Water);
        }
    }
    
    return map;
}

// Helper function to print a map with a path
void printMap(const atom::algorithm::GridMap& map, 
              const std::vector<atom::algorithm::Point>* path = nullptr,
              const atom::algorithm::Point* start = nullptr,
              const atom::algorithm::Point* goal = nullptr) {
    
    using namespace atom::algorithm;
    
    // Characters for different cell types
    const char EMPTY = ' ';
    const char OBSTACLE = '#';
    const char PATH = '*';
    const char START = 'S';
    const char GOAL = 'G';
    const char DIFFICULT = '-';
    const char VERY_DIFFICULT = '=';
    const char ROAD = '.';
    const char WATER = '~';
    
    std::cout << '+' << std::string(map.getWidth() * 2 - 1, '-') << '+' << std::endl;
    
    for (int y = 0; y < map.getHeight(); y++) {
        std::cout << '|';
        for (int x = 0; x < map.getWidth(); x++) {
            Point current{x, y};
            char cell = EMPTY;
            
            // Determine cell type
            if (start && current == *start) {
                cell = START;
            } else if (goal && current == *goal) {
                cell = GOAL;
            } else if (map.hasObstacle(current)) {
                cell = OBSTACLE;
            } else if (path) {
                // Check if point is in path
                bool in_path = false;
                for (const auto& p : *path) {
                    if (p == current) {
                        in_path = true;
                        break;
                    }
                }
                
                if (in_path) {
                    cell = PATH;
                } else {
                    // Show terrain
                    auto terrain = map.getTerrain(current);
                    switch (terrain) {
                        case GridMap::TerrainType::Difficult:
                            cell = DIFFICULT;
                            break;
                        case GridMap::TerrainType::VeryDifficult:
                            cell = VERY_DIFFICULT;
                            break;
                        case GridMap::TerrainType::Road:
                            cell = ROAD;
                            break;
                        case GridMap::TerrainType::Water:
                            cell = WATER;
                            break;
                        default:
                            cell = EMPTY;
                            break;
                    }
                }
            }
            
            std::cout << cell << ' ';
        }
        std::cout << '|' << std::endl;
    }
    
    std::cout << '+' << std::string(map.getWidth() * 2 - 1, '-') << '+' << std::endl;
    
    // Print legend
    std::cout << "Legend: "
              << START << "=Start, "
              << GOAL << "=Goal, "
              << PATH << "=Path, "
              << OBSTACLE << "=Obstacle, "
              << DIFFICULT << "=Difficult, "
              << VERY_DIFFICULT << "=Very Difficult, "
              << ROAD << "=Road, "
              << WATER << "=Water"
              << std::endl;
}

int main() {
    using namespace atom::algorithm;
    using namespace std::chrono;
    
    // Create our test map
    GridMap map = createTestMap();
    
    // Define start and goal points
    Point start{2, 2};
    Point goal{27, 27};
    
    std::cout << "Pathfinding Example\n";
    std::cout << "===================\n\n";
    std::cout << "Map with obstacles and terrain types:\n";
    
    // Print the initial map
    printMap(map, nullptr, &start, &goal);
    
    // Function to run and time a pathfinding algorithm
    auto run_algorithm = [&](const std::string& name, auto algorithm_func) {
        std::cout << "\nRunning " << name << "...\n";
        
        auto t1 = high_resolution_clock::now();
        auto path = algorithm_func();
        auto t2 = high_resolution_clock::now();
        auto time_ms = duration_cast<milliseconds>(t2 - t1).count();
        
        if (path) {
            std::cout << "Path found with " << path->size() << " steps in " 
                      << time_ms << "ms.\n";
            
            // Print the map with path
            printMap(map, &(*path), &start, &goal);
            return *path;  // Return a copy of the path
        } else {
            std::cout << "No path found!\n";
            return std::vector<Point>{};  // Return empty path
        }
    };
    
    // Run A* with Manhattan heuristic
    auto path_astar = run_algorithm("A* with Manhattan heuristic", [&]() {
        return PathFinder::findPath(map, start, goal, heuristics::manhattan);
    });
    
    // Run JPS
    auto path_jps = run_algorithm("Jump Point Search", [&]() {
        return PathFinder::findJPSPath(map, start, goal);
    });
    
    // If we found a path with A*, demonstrate path smoothing
    if (!path_astar.empty()) {
        std::cout << "\nApplying path smoothing...\n";
        
        auto t1 = high_resolution_clock::now();
        auto smoothed_path = PathFinder::smoothPath(path_astar, map);
        auto t2 = high_resolution_clock::now();
        auto time_ms = duration_cast<milliseconds>(t2 - t1).count();
        
        std::cout << "Smoothed path has " << smoothed_path.size() << " steps (reduced from " 
                  << path_astar.size() << ") in " << time_ms << "ms.\n";
        
        // Print the map with smoothed path
        printMap(map, &smoothed_path, &start, &goal);
        
        // Apply funnel algorithm
        std::cout << "\nApplying funnel algorithm...\n";
        
        t1 = high_resolution_clock::now();
        auto funnel_path = PathFinder::funnelAlgorithm(path_astar, map);
        t2 = high_resolution_clock::now();
        time_ms = duration_cast<milliseconds>(t2 - t1).count();
        
        std::cout << "Funnel path has " << funnel_path.size() << " steps (reduced from " 
                  << path_astar.size() << ") in " << time_ms << "ms.\n";
        
        // Print the map with funnel path
        printMap(map, &funnel_path, &start, &goal);
    }
    
    // Compare different heuristics
    std::cout << "\nComparing different heuristics:\n";
    std::cout << "--------------------------------\n";
    
    auto run_with_heuristic = [&](const std::string& name, auto heuristic) {
        auto t1 = high_resolution_clock::now();
        auto path = PathFinder::findPath(map, start, goal, heuristic);
        auto t2 = high_resolution_clock::now();
        auto time_ms = duration_cast<milliseconds>(t2 - t1).count();
        
        std::cout << std::left << std::setw(12) << name 
                  << std::setw(8) << time_ms << "ms  "
                  << std::setw(10) << (path ? std::to_string(path->size()) + " steps" : "No path")
                  << std::endl;
    };
    
    run_with_heuristic("Manhattan", heuristics::manhattan);
    run_with_heuristic("Euclidean", heuristics::euclidean);
    run_with_heuristic("Diagonal", heuristics::diagonal);
    run_with_heuristic("Octile", heuristics::octile);
    run_with_heuristic("Zero", heuristics::zero);
    
    std::cout << "\nThank you for using the Atom Pathfinding Library!\n";
    
    return 0;
}
```

Expected Output:
The program will display:

1. The initial map with obstacles and terrain types
2. Paths found by different algorithms with timing information
3. Visual representations of the paths on the map
4. Smoothed and optimized paths
5. A comparison of different heuristics

The output in the console will show the map using ASCII characters, with different symbols for path, obstacles, and various terrain types.

This comprehensive example demonstrates all the main features of the library working together, including:

- Different pathfinding algorithms
- Terrain handling
- Path smoothing and optimization
- Performance measurements
- Visual representation of paths

## Conclusion

The Atom Pathfinding Library provides a powerful, flexible, and efficient solution for finding optimal paths in both grid-based and abstract graph structures. With its support for multiple algorithms, terrain types, and path optimization techniques, it is suitable for a wide range of applications from game development to robotics.

The library's C++20 features such as concepts and ranges ensure type safety and modern programming practices, while its optimized implementations offer excellent performance for real-time applications.
