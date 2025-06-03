---
title: Convolution and Deconvolution
description: Detailed of the convolution and deconvolution functions in the Atom Algorithm Library, including 1D and 2D operations, Fourier transforms, Gaussian filters, and usage examples.
---

## Overview

The `atom::algorithm` convolution library provides a comprehensive toolkit for one-dimensional and two-dimensional convolution and deconvolution operations in C++. It includes support for parallel processing, Fourier transforms, Gaussian filtering, and optional OpenCL acceleration for high-performance computing applications.

This library is particularly useful for:

- Image processing (blurring, sharpening, edge detection)
- Signal processing applications
- Deep learning convolution operations
- Data analysis involving cross-correlation

## Core Features

- 2D convolution and deconvolution with multi-threading support
- Discrete Fourier Transform (DFT) implementation for frequency domain operations
- Gaussian kernel generation for common filtering operations
- SIMD optimization for improved performance (enabled by default)
- Optional OpenCL acceleration for GPU-based processing

## Requirements and Dependencies

- C++17 or newer compiler
- Standard library components: `<complex>`, `<thread>`, `<vector>`
- OpenCL libraries (only if `USE_OPENCL` is enabled)

## Detailed API Reference

### Convolution Functions

#### `convolve2D`

```cpp
auto convolve2D(const std::vector<std::vector<double>>& input,
                const std::vector<std::vector<double>>& kernel,
                int numThreads = availableThreads)
    -> std::vector<std::vector<double>>;
```

Purpose: Performs 2D convolution between input matrix and kernel.

Parameters:

- `input`: 2D matrix to be convolved (source data)
- `kernel`: 2D convolution kernel (filter)
- `numThreads`: Number of parallel threads to use (defaults to all available cores)

Returns:

- A 2D matrix representing the convolution result

Implementation Details:

- Uses spatial domain convolution with parallelization
- Result size is determined by input and kernel dimensions
- Edge pixels are handled with zero-padding

Example Usage:

```cpp
#include "convolve.hpp"
#include <iostream>
#include <vector>

int main() {
    // Create a simple 3x3 input matrix
    std::vector<std::vector<double>> input = {
        {1.0, 2.0, 3.0},
        {4.0, 5.0, 6.0},
        {7.0, 8.0, 9.0}
    };
    
    // Create a 2x2 kernel for edge detection
    std::vector<std::vector<double>> kernel = {
        {1.0,  1.0},
        {-1.0, -1.0}
    };
    
    // Perform convolution
    auto result = atom::algorithm::convolve2D(input, kernel);
    
    // Display result
    for (const auto& row : result) {
        for (const auto& val : row) {
            std::cout << val << " ";
        }
        std::cout << std::endl;
    }
    
    return 0;
}
```

#### `deconvolve2D`

```cpp
auto deconvolve2D(const std::vector<std::vector<double>>& signal,
                  const std::vector<std::vector<double>>& kernel,
                  int numThreads = availableThreads)
    -> std::vector<std::vector<double>>;
```

Purpose: Performs 2D deconvolution to recover original input from a convolved signal.

Parameters:

- `signal`: 2D matrix that is the result of a previous convolution
- `kernel`: The same kernel used in the original convolution
- `numThreads`: Number of parallel threads to use (defaults to all available cores)

Returns:

- A 2D matrix representing the deconvolved (recovered) original data

Implementation Details:

- Utilizes frequency domain operations for efficient deconvolution
- Implements regularization to handle numerical instabilities
- May not perfectly recover the original signal in the presence of noise

Example Usage:

```cpp
#include "convolve.hpp"
#include <iostream>
#include <vector>

int main() {
    // Original signal
    std::vector<std::vector<double>> original = {
        {1.0, 2.0, 3.0, 4.0},
        {5.0, 6.0, 7.0, 8.0},
        {9.0, 10.0, 11.0, 12.0}
    };
    
    // Blur kernel
    std::vector<std::vector<double>> kernel = {
        {0.1, 0.2, 0.1},
        {0.2, 0.8, 0.2},
        {0.1, 0.2, 0.1}
    };
    
    // Convolve to create blurred signal
    auto blurred = atom::algorithm::convolve2D(original, kernel);
    
    // Recover original through deconvolution
    auto recovered = atom::algorithm::deconvolve2D(blurred, kernel);
    
    // Compare original with recovered
    std::cout << "Original vs Recovered:" << std::endl;
    for (size_t i = 0; i < original.size(); i++) {
        for (size_t j = 0; j < original[0].size(); j++) {
            std::cout << original[i][j] << " vs " << recovered[i][j] << " | ";
        }
        std::cout << std::endl;
    }
    
    return 0;
}
```

### Fourier Transform Functions

#### `dfT2D`

```cpp
auto dfT2D(const std::vector<std::vector<double>>& signal,
           int numThreads = availableThreads)
    -> std::vector<std::vector<std::complex<double>>>;
```

Purpose: Computes the 2D Discrete Fourier Transform of a spatial domain signal.

Parameters:

- `signal`: 2D input matrix in spatial domain
- `numThreads`: Number of parallel threads to use

Returns:

- A 2D matrix of complex numbers representing the frequency domain

Implementation Details:

- Uses a direct implementation of the 2D DFT formula
- Parallelizes computation across rows/columns
- Complexity is O(N²M²) for N×M input size

Example Usage:

```cpp
#include "convolve.hpp"
#include <iostream>
#include <complex>

int main() {
    // Create a simple signal
    std::vector<std::vector<double>> signal = {
        {1.0, 0.0, 0.0, 0.0},
        {0.0, 1.0, 0.0, 0.0},
        {0.0, 0.0, 1.0, 0.0},
        {0.0, 0.0, 0.0, 1.0}
    };
    
    // Compute DFT
    auto spectrum = atom::algorithm::dfT2D(signal);
    
    // Display magnitude of first few frequency components
    std::cout << "DFT Magnitude:" << std::endl;
    for (size_t i = 0; i < 2; i++) {
        for (size_t j = 0; j < 2; j++) {
            double magnitude = std::abs(spectrum[i][j]);
            std::cout << "Frequency [" << i << "," << j << "]: " << magnitude << std::endl;
        }
    }
    
    return 0;
}
```

#### `idfT2D`

```cpp
auto idfT2D(const std::vector<std::vector<std::complex<double>>>& spectrum,
            int numThreads = availableThreads)
    -> std::vector<std::vector<double>>;
```

Purpose: Computes the inverse 2D Discrete Fourier Transform to convert from frequency to spatial domain.

Parameters:

- `spectrum`: 2D matrix of complex numbers in frequency domain
- `numThreads`: Number of parallel threads to use

Returns:

- A 2D matrix of real numbers representing the spatial domain signal

Implementation Details:

- Preserves the Parseval relationship (energy conservation)
- Handles proper normalization by signal size
- Returns only the real component after ensuring minimal imaginary residue

Example Usage:

```cpp
#include "convolve.hpp"
#include <iostream>
#include <iomanip>

int main() {
    // Create original signal
    std::vector<std::vector<double>> original = {
        {5.0, 3.0, 1.0},
        {2.0, 8.0, 4.0},
        {7.0, 6.0, 9.0}
    };
    
    // Forward transform
    auto spectrum = atom::algorithm::dfT2D(original);
    
    // Inverse transform
    auto reconstructed = atom::algorithm::idfT2D(spectrum);
    
    // Compare original and reconstructed
    std::cout << std::fixed << std::setprecision(6);
    std::cout << "Original vs Reconstructed:" << std::endl;
    for (size_t i = 0; i < original.size(); i++) {
        for (size_t j = 0; j < original[0].size(); j++) {
            double diff = std::abs(original[i][j] - reconstructed[i][j]);
            std::cout << original[i][j] << " vs " << reconstructed[i][j] 
                      << " (diff: " << diff << ") | ";
        }
        std::cout << std::endl;
    }
    
    return 0;
}
```

### Gaussian Filter Functions

#### `generateGaussianKernel`

```cpp
auto generateGaussianKernel(int size,
                            double sigma) -> std::vector<std::vector<double>>;
```

Purpose: Creates a 2D Gaussian kernel for image filtering.

Parameters:

- `size`: Size of the kernel (should be odd)
- `sigma`: Standard deviation of the Gaussian distribution

Returns:

- A 2D matrix representing the Gaussian kernel

Implementation Details:

- Generates a normalized kernel (sum of elements equals 1.0)
- Uses the Gaussian function: exp(-((x²+y²)/(2σ²)))
- Size controls the kernel dimensions, sigma controls the "spread"

Example Usage:

```cpp
#include "convolve.hpp"
#include <iostream>
#include <iomanip>

int main() {
    // Generate a 5x5 Gaussian kernel with sigma = 1.0
    int size = 5;
    double sigma = 1.0;
    auto kernel = atom::algorithm::generateGaussianKernel(size, sigma);
    
    // Print the kernel
    std::cout << "5x5 Gaussian Kernel (sigma=1.0):" << std::endl;
    double sum = 0.0;
    for (const auto& row : kernel) {
        for (const auto& val : row) {
            std::cout << std::fixed << std::setprecision(4) << val << "\t";
            sum += val;
        }
        std::cout << std::endl;
    }
    
    std::cout << "Kernel sum: " << sum << " (should be close to 1.0)" << std::endl;
    
    return 0;
}
```

#### `applyGaussianFilter`

```cpp
auto applyGaussianFilter(const std::vector<std::vector<double>>& image,
                         const std::vector<std::vector<double>>& kernel)
    -> std::vector<std::vector<double>>;
```

Purpose: Applies a Gaussian blur/smoothing filter to an image.

Parameters:

- `image`: Input image as 2D matrix of intensity values
- `kernel`: Gaussian kernel to apply

Returns:

- A 2D matrix representing the filtered image

Implementation Details:

- Wrapper function that applies convolution with a Gaussian kernel
- Handles edge pixels appropriately
- Preserves input image dimensions

Example Usage:

```cpp
#include "convolve.hpp"
#include <iostream>
#include <vector>

int main() {
    // Create a simple "image" with an edge
    std::vector<std::vector<double>> image = {
        {0.0, 0.0, 0.0, 0.0, 0.0},
        {0.0, 0.0, 0.0, 0.0, 0.0},
        {0.0, 0.0, 1.0, 1.0, 1.0},
        {0.0, 0.0, 1.0, 1.0, 1.0},
        {0.0, 0.0, 1.0, 1.0, 1.0}
    };
    
    // Generate a Gaussian kernel
    auto kernel = atom::algorithm::generateGaussianKernel(3, 0.8);
    
    // Apply Gaussian filter
    auto blurred = atom::algorithm::applyGaussianFilter(image, kernel);
    
    // Display original and blurred images
    std::cout << "Original Image:" << std::endl;
    for (const auto& row : image) {
        for (const auto& val : row) {
            std::cout << val << " ";
        }
        std::cout << std::endl;
    }
    
    std::cout << "\nBlurred Image:" << std::endl;
    for (const auto& row : blurred) {
        for (const auto& val : row) {
            std::cout << val << " ";
        }
        std::cout << std::endl;
    }
    
    return 0;
}
```

### OpenCL Accelerated Functions

The following functions are only available when `USE_OPENCL` is defined as 1:

#### `convolve2DOpenCL`

```cpp
auto convolve2DOpenCL(const std::vector<std::vector<double>>& input,
                      const std::vector<std::vector<double>>& kernel,
                      int numThreads = availableThreads)
    -> std::vector<std::vector<double>>;
```

Purpose: GPU-accelerated 2D convolution using OpenCL.

Parameters:

- `input`: 2D matrix to be convolved
- `kernel`: 2D convolution kernel
- `numThreads`: Number of CPU threads for fallback if OpenCL fails

Returns:

- A 2D matrix representing the convolution result

Implementation Details:

- Offloads computation to available OpenCL devices (GPU/CPU)
- Automatically falls back to CPU implementation if OpenCL fails
- Potential significant speedup for large matrices

Example Usage:

```cpp
#include "convolve.hpp"
#include <iostream>
#include <chrono>
#include <vector>

#if USE_OPENCL
int main() {
    // Create a large test image (500x500)
    int size = 500;
    std::vector<std::vector<double>> largeImage(size, std::vector<double>(size, 0.0));
    
    // Fill with some pattern
    for (int i = 0; i < size; i++) {
        for (int j = 0; j < size; j++) {
            largeImage[i][j] = sin(i/10.0) * cos(j/10.0);
        }
    }
    
    // Create a 5x5 Gaussian kernel
    auto kernel = atom::algorithm::generateGaussianKernel(5, 1.5);
    
    // Time CPU convolution
    auto start = std::chrono::high_resolution_clock::now();
    auto cpuResult = atom::algorithm::convolve2D(largeImage, kernel);
    auto cpuEnd = std::chrono::high_resolution_clock::now();
    auto cpuDuration = std::chrono::duration_cast<std::chrono::milliseconds>(cpuEnd - start);
    
    // Time OpenCL convolution
    start = std::chrono::high_resolution_clock::now();
    auto gpuResult = atom::algorithm::convolve2DOpenCL(largeImage, kernel);
    auto gpuEnd = std::chrono::high_resolution_clock::now();
    auto gpuDuration = std::chrono::duration_cast<std::chrono::milliseconds>(gpuEnd - start);
    
    // Compare performance
    std::cout << "CPU convolution time: " << cpuDuration.count() << " ms" << std::endl;
    std::cout << "GPU convolution time: " << gpuDuration.count() << " ms" << std::endl;
    std::cout << "Speedup factor: " << static_cast<double>(cpuDuration.count()) / gpuDuration.count() << std::endl;
    
    return 0;
}
#else
int main() {
    std::cout << "OpenCL support not enabled. Recompile with USE_OPENCL=1." << std::endl;
    return 0;
}
#endif
```

#### `deconvolve2DOpenCL`

```cpp
auto deconvolve2DOpenCL(const std::vector<std::vector<double>>& signal,
                        const std::vector<std::vector<double>>& kernel,
                        int numThreads = availableThreads)
    -> std::vector<std::vector<double>>;
```

Purpose: GPU-accelerated 2D deconvolution using OpenCL.

Parameters:

- `signal`: 2D matrix that is the result of a previous convolution
- `kernel`: The same kernel used in the original convolution
- `numThreads`: Number of CPU threads for fallback if OpenCL fails

Returns:

- A 2D matrix representing the deconvolved result

Implementation Details:

- Performs frequency domain deconvolution on GPU
- Handles numerical stability through regularization
- Includes error handling for device-specific issues

## Best Practices and Performance Considerations

### Optimal Usage

1. Choose the right kernel size:
   - For Gaussian filters, use kernel size ≈ 3σ to 4σ for efficiency
   - Larger kernels provide more accurate filtering but higher computational cost

2. Thread count optimization:
   - For very small matrices (< 50x50), reduce thread count to minimize overhead
   - For large matrices, using all available cores typically yields best performance

3. Memory considerations:
   - For large images, be aware of memory requirements for intermediate calculations
   - Very large convolutions may require tiled processing approaches

### Performance Tips

1. Use OpenCL for large matrices:
   - The OpenCL implementation provides significant speedup for large matrices (>500x500)
   - CPU implementation is often faster for smaller matrices due to overhead

2. Kernel separability:
   - Some kernels (like Gaussian) are separable and can be applied as 1D convolutions
   - This can reduce complexity from O(N²K²) to O(N²K) where K is kernel size

3. SIMD optimization:
   - SIMD is enabled by default (`USE_SIMD=1`) for best performance
   - Disable only if you experience compatibility issues with specific platforms

### Common Pitfalls

1. Kernel normalization:
   - Ensure convolution kernels are properly normalized to prevent scaling issues
   - Gaussian kernels should sum to 1.0 to preserve image brightness

2. Edge handling:
   - Be aware that edge pixels are handled with zero-padding
   - For specific edge handling needs, pre-process your input matrix

3. Numerical stability in deconvolution:
   - Deconvolution is an ill-posed problem and sensitive to noise
   - Results may contain artifacts if the signal has noise or if kernel has zeros

4. OpenCL device compatibility:
   - Some OpenCL devices have limitations on kernel size or memory usage
   - The implementation falls back to CPU if OpenCL execution fails

## Platform-Specific Considerations

### Windows

- Visual Studio 2019 or newer recommended for compilation
- For OpenCL support, ensure compatible GPU drivers are installed

### Linux

- GCC 7+ or Clang 6+ recommended
- OpenCL development packages (`opencl-headers` and platform-specific ICD loader) required for OpenCL support

### macOS

- Apple has deprecated OpenCL in favor of Metal
- Legacy OpenCL 1.2 support available but not recommended for new development

## Comprehensive Example

This example demonstrates the full workflow of using the library for image processing:

```cpp
#include "convolve.hpp"
#include <iostream>
#include <fstream>
#include <vector>
#include <chrono>

// Helper function to load image data from file (simplified)
std::vector<std::vector<double>> loadImage(const std::string& filename, int& width, int& height) {
    // This is a placeholder. In practice, use a proper image loading library
    // For this example, we'll create a synthetic image
    width = 256;
    height = 256;
    std::vector<std::vector<double>> image(height, std::vector<double>(width, 0.0));
    
    // Create a simple pattern
    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            // Create a pattern with a sharp edge
            if (x > width/2 && y > height/2) {
                image[y][x] = 1.0;
            } else {
                image[y][x] = 0.2;
            }
            
            // Add some noise
            image[y][x] += (rand() % 10) / 100.0;
        }
    }
    
    return image;
}

// Helper function to save image data to file (simplified)
void saveImage(const std::vector<std::vector<double>>& image, const std::string& filename) {
    // This is a placeholder. In practice, use a proper image writing library
    std::cout << "Image would be saved to " << filename << std::endl;
    // Print stats instead
    double min = 1.0, max = 0.0, sum = 0.0;
    for (const auto& row : image) {
        for (const auto& val : row) {
            min = std::min(min, val);
            max = std::max(max, val);
            sum += val;
        }
    }
    std::cout << "Image stats - Min: " << min << ", Max: " << max 
              << ", Avg: " << sum / (image.size() * image[0].size()) << std::endl;
}

int main() {
    try {
        std::cout << "Convolution Library Example" << std::endl;
        std::cout << "==========================" << std::endl;
        
        // 1. Load image
        int width, height;
        std::cout << "Loading image..." << std::endl;
        auto image = loadImage("input.jpg", width, height);
        std::cout << "Loaded " << width << "x" << height << " image" << std::endl;
        
        // 2. Generate a Gaussian blur kernel
        std::cout << "Creating Gaussian kernel..." << std::endl;
        double sigma = 2.5;
        int kernelSize = static_cast<int>(sigma * 3.0) * 2 + 1;  // Make sure it's odd
        auto gaussianKernel = atom::algorithm::generateGaussianKernel(kernelSize, sigma);
        std::cout << "Created " << kernelSize << "x" << kernelSize << " kernel with sigma=" << sigma << std::endl;
        
        // 3. Apply Gaussian blur - CPU version
        std::cout << "Applying Gaussian blur (CPU)..." << std::endl;
        auto startTime = std::chrono::high_resolution_clock::now();
        auto blurredImage = atom::algorithm::convolve2D(image, gaussianKernel);
        auto endTime = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(endTime - startTime);
        std::cout << "CPU blur completed in " << duration.count() << " ms" << std::endl;
        
        // 4. Save the blurred image
        saveImage(blurredImage, "blurred.jpg");
        
#if USE_OPENCL
        // 5. Apply Gaussian blur - OpenCL version
        std::cout << "Applying Gaussian blur (OpenCL)..." << std::endl;
        startTime = std::chrono::high_resolution_clock::now();
        auto blurredImageCL = atom::algorithm::convolve2DOpenCL(image, gaussianKernel);
        endTime = std::chrono::high_resolution_clock::now();
        duration = std::chrono::duration_cast<std::chrono::milliseconds>(endTime - startTime);
        std::cout << "OpenCL blur completed in " << duration.count() << " ms" << std::endl;
        
        // 6. Compare results
        double maxDiff = 0.0;
        for (size_t i = 0; i < blurredImage.size(); i++) {
            for (size_t j = 0; j < blurredImage[0].size(); j++) {
                double diff = std::abs(blurredImage[i][j] - blurredImageCL[i][j]);
                maxDiff = std::max(maxDiff, diff);
            }
        }
        std::cout << "Maximum difference between CPU and OpenCL results: " << maxDiff << std::endl;
#endif

        // 7. Create a sharpening kernel
        std::cout << "Creating sharpening kernel..." << std::endl;
        std::vector<std::vector<double>> sharpenKernel = {
            {0.0, -1.0, 0.0},
            {-1.0, 5.0, -1.0},
            {0.0, -1.0, 0.0}
        };
        
        // 8. Apply sharpening to the original image
        std::cout << "Applying sharpening filter..." << std::endl;
        auto sharpenedImage = atom::algorithm::convolve2D(image, sharpenKernel);
        saveImage(sharpenedImage, "sharpened.jpg");
        
        // 9. Attempt deconvolution to recover original from blurred
        std::cout << "Performing deconvolution..." << std::endl;
        startTime = std::chrono::high_resolution_clock::now();
        auto recoveredImage = atom::algorithm::deconvolve2D(blurredImage, gaussianKernel);
        endTime = std::chrono::high_resolution_clock::now();
        duration = std::chrono::duration_cast<std::chrono::milliseconds>(endTime - startTime);
        std::cout << "Deconvolution completed in " << duration.count() << " ms" << std::endl;
        saveImage(recoveredImage, "recovered.jpg");
        
        // 10. Calculate recovery error
        double totalError = 0.0;
        for (size_t i = 0; i < image.size(); i++) {
            for (size_t j = 0; j < image[0].size(); j++) {
                totalError += std::pow(image[i][j] - recoveredImage[i][j], 2);
            }
        }
        double rmse = std::sqrt(totalError / (image.size() * image[0].size()));
        std::cout << "Recovery RMSE: " << rmse << std::endl;
        
        std::cout << "All operations completed successfully!" << std::endl;
        return 0;
        
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
}
```

## Conclusion

The `atom::algorithm` convolution library provides a robust and flexible foundation for implementing convolution-based operations in C++. With support for multi-threading, SIMD optimizations, and optional OpenCL acceleration, it can efficiently process data of various sizes.

Whether you're implementing image processing filters, signal processing algorithms, or exploring convolutional neural networks, this library offers the necessary building blocks with a clear, consistent API.

Remember to consider the performance tips and best practices when using this library, especially when working with larger datasets or resource-constrained environments.
