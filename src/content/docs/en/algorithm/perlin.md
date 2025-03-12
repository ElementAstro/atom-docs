---
title: Perlin Noise
description: Detailed for the Perlin Noise implementation in the atom::algorithm namespace, including class methods, OpenCL and SIMD support, and example usage for generating procedural textures and terrains.
---

## Overview

The `atom::algorithm::PerlinNoise` class provides a robust implementation of Perlin noise, a popular gradient noise function used to generate procedural textures, terrain, and other natural-looking patterns. This implementation includes CPU and optional OpenCL acceleration for improved performance on compatible systems.

## Features

- 3D noise generation with customizable parameters
- Octave noise for fractal detail generation
- 2D noise map generation for terrain and textures
- Template support for different floating-point types
- Optional OpenCL acceleration when compiled with `USE_OPENCL`
- Thread-safe noise generation

## Class Construction

### Constructor

```cpp
explicit PerlinNoise(unsigned int seed = std::default_random_engine::default_seed)
```

Parameters:

- `seed` - Optional random seed value that determines the noise pattern. Default is the standard random engine's default seed.

Description:
Initializes the Perlin noise generator with the provided seed. The constructor creates a permutation table that is essential for noise generation and initializes OpenCL if available.

### Destructor

```cpp
~PerlinNoise()
```

Description:
Cleans up resources, particularly those related to OpenCL if enabled.

## Main Methods

### Basic Noise Generation

```cpp
template <std::floating_point T>
[[nodiscard]] auto noise(T x, T y, T z) const -> T
```

Parameters:

- `x`, `y`, `z` - 3D coordinates where noise will be sampled

Returns:

- A noise value in range [0,1] at the specified coordinates

Description:
Generates a single noise value at the specified 3D coordinates. The method automatically uses OpenCL if available, otherwise falls back to CPU implementation.

### Octave Noise Generation

```cpp
template <std::floating_point T>
[[nodiscard]] auto octaveNoise(T x, T y, T z, int octaves, T persistence) const -> T
```

Parameters:

- `x`, `y`, `z` - 3D coordinates where noise will be sampled
- `octaves` - Number of noise layers to combine
- `persistence` - How quickly the amplitude diminishes for each octave (typically 0.0-1.0)

Returns:

- A combined noise value in range [0,1]

Description:
Generates fractal noise by combining multiple layers (octaves) of noise. Higher octave counts produce more detailed noise at the cost of performance. The persistence value controls how much influence each successive octave has on the final result.

### Noise Map Generation

```cpp
[[nodiscard]] auto generateNoiseMap(int width, int height, double scale, 
                                   int octaves, double persistence, double lacunarity,
                                   int seed = std::default_random_engine::default_seed) const
    -> std::vector<std::vector<double>>
```

Parameters:

- `width`, `height` - Dimensions of the noise map
- `scale` - Controls the "zoom level" of the noise (smaller values create more zoomed-out patterns)
- `octaves` - Number of noise layers to combine
- `persistence` - How quickly the amplitude diminishes for each octave
- `lacunarity` - Currently unused parameter (intended to control frequency increase per octave)
- `seed` - Optional seed value for the random offset, defaults to the standard random engine's default seed

Returns:

- A 2D vector containing noise values in range [0,1]

Description:
Generates a complete 2D noise map suitable for terrain generation, textures, or other applications requiring a grid of noise values. The method applies random offsets to avoid centered patterns.

## Performance Considerations

1. OpenCL Acceleration: When compiled with `USE_OPENCL`, the implementation can leverage GPU computation for improved performance, especially for batch processing.

2. Octave Count: Higher octave counts produce more detailed noise but require more computation. For real-time applications, consider using lower octave counts.

3. Template Support: The implementation supports various floating-point types, but double precision is recommended for quality results.

## Example Usage

```cpp
#include "atom/algorithm/perlin.hpp"
#include <iostream>
#include <fstream>

int main() {
    // Create a Perlin noise generator with a specific seed
    atom::algorithm::PerlinNoise noise(42);
    
    // Generate a simple noise value
    double value = noise.noise(0.5, 0.5, 0.0);
    std::cout << "Simple noise value: " << value << std::endl;
    
    // Generate octave noise for more natural-looking results
    double octaveValue = noise.octaveNoise(0.5, 0.5, 0.0, 4, 0.5);
    std::cout << "Octave noise value: " << octaveValue << std::endl;
    
    // Generate a noise map for terrain
    int width = 256;
    int height = 256;
    double scale = 50.0;
    auto noiseMap = noise.generateNoiseMap(width, height, scale, 6, 0.5, 2.0);
    
    // Export the noise map as a simple PGM image (grayscale)
    std::ofstream outFile("terrain.pgm");
    outFile << "P2\n" << width << " " << height << "\n255\n";
    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            // Convert from [0,1] to [0,255]
            int pixelValue = static_cast<int>(noiseMap[y][x] * 255);
            outFile << pixelValue << " ";
        }
        outFile << "\n";
    }
    
    std::cout << "Terrain map generated and saved as 'terrain.pgm'" << std::endl;
    return 0;
}
```

## Advanced Usage: Terrain Generation

You can create realistic terrain heightmaps by adjusting the parameters:

```cpp
// Create more mountainous terrain with fine details
double mountainScale = 150.0;
int mountainOctaves = 8;
double mountainPersistence = 0.65;
auto mountainMap = noise.generateNoiseMap(width, height, mountainScale, 
                                         mountainOctaves, mountainPersistence, 2.0, 123);

// Create smoother, rolling hills
double hillsScale = 100.0;
int hillsOctaves = 4;
double hillsPersistence = 0.4;
auto hillsMap = noise.generateNoiseMap(width, height, hillsScale, 
                                      hillsOctaves, hillsPersistence, 2.0, 456);

// Combine multiple noise maps for more complex terrain
std::vector<std::vector<double>> combinedMap(height, std::vector<double>(width));
for (int y = 0; y < height; ++y) {
    for (int x = 0; x < width; ++x) {
        // Use one noise map to blend between two others
        double blendFactor = noise.noise(x/300.0, y/300.0, 0.0);
        combinedMap[y][x] = mountainMap[y][x] * blendFactor + 
                           hillsMap[y][x] * (1.0 - blendFactor);
    }
}
```

This implementation provides a versatile foundation for procedural generation in games, simulations, and graphics applications.
