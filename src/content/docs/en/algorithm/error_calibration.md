---
title: Error Calibration
description: Comprehensive for the Advanced Error Calibration Library in the atom::algorithm namespace, including methods for linear and polynomial calibration, residual analysis, outlier detection, and cross-validation.
---

## Overview

The Atom Algorithm Convolution Library provides high-performance implementations of one-dimensional and two-dimensional convolution and deconvolution operations. It offers optional acceleration via OpenCL and SIMD optimizations, making it suitable for image processing, signal processing, and scientific computing applications.

## Features

- 2D convolution and deconvolution with multi-threading support
- Discrete Fourier Transform (DFT) and inverse DFT implementations
- Gaussian kernel generation and filtering
- Hardware acceleration via OpenCL (optional)
- SIMD optimization for improved performance on modern CPUs
- Thread-safe implementations with C++20 features

## Installation

The library is header-only, so you just need to include `convolve.hpp` in your project:

```cpp
#include "atom/algorithm/convolve.hpp"
```

### Dependencies

- C++20 compatible compiler
- Standard Library with support for `<complex>`, `<thread>`, and `<vector>`
- OpenCL development libraries (optional)

## Configuration

The library provides two configuration options:

```cpp
// Enable/disable OpenCL support (default: disabled)
#define USE_OPENCL 0

// Enable/disable SIMD optimizations (default: enabled)
#define USE_SIMD 1
```

You can configure these options by defining them before including the header:

```cpp
#define USE_OPENCL 1  // Enable OpenCL support
#include "atom/algorithm/convolve.hpp"
```

## API Reference

### 2D Convolution

```cpp
auto convolve2D(
    const std::vector<std::vector<double>>& input,
    const std::vector<std::vector<double>>& kernel,
    int numThreads = availableThreads
) -> std::vector<std::vector<double>>;
```

Parameters:

- `input`: 2D matrix to be convolved
- `kernel`: 2D kernel to convolve with
- `numThreads`: Number of threads to use (default: all available cores)

Returns:

- Result of the convolution operation as a 2D vector

Throws:

- `InvalidArgumentException` if input or kernel matrices are empty or have inconsistent dimensions

Description:
Performs a 2D convolution operation, which is fundamental in image processing for operations like blurring, sharpening, and edge detection. The implementation supports multi-threading for improved performance.

### 2D Deconvolution

```cpp
auto deconvolve2D(
    const std::vector<std::vector<double>>& signal,
    const std::vector<std::vector<double>>& kernel,
    int numThreads = availableThreads
) -> std::vector<std::vector<double>>;
```

Parameters:

- `signal`: 2D matrix signal (result of convolution)
- `kernel`: 2D kernel used for convolution
- `numThreads`: Number of threads to use (default: all available cores)

Returns:

- Original input recovered via deconvolution

Throws:

- `RuntimeException` if deconvolution fails
- `InvalidArgumentException` if signal or kernel matrices are empty or have inconsistent dimensions

Description:
Performs the inverse operation of convolution, attempting to recover the original signal. Useful for image restoration and signal processing applications.

### 2D Discrete Fourier Transform

```cpp
auto dfT2D(
    const std::vector<std::vector<double>>& signal,
    int numThreads = availableThreads
) -> std::vector<std::vector<std::complex<double>>>;
```

Parameters:

- `signal`: 2D input signal in spatial domain
- `numThreads`: Number of threads to use (default: all available cores)

Returns:

- Frequency domain representation of the input signal

Description:
Computes the 2D Discrete Fourier Transform of a signal, converting it from the spatial domain to the frequency domain. This is useful for frequency analysis and as an intermediate step in many signal processing operations.

### Inverse 2D Discrete Fourier Transform

```cpp
auto idfT2D(
    const std::vector<std::vector<std::complex<double>>>& spectrum,
    int numThreads = availableThreads
) -> std::vector<std::vector<double>>;
```

Parameters:

- `spectrum`: 2D input in frequency domain
- `numThreads`: Number of threads to use (default: all available cores)

Returns:

- Spatial domain representation of the input spectrum

Description:
Computes the inverse 2D Discrete Fourier Transform, converting a signal from the frequency domain back to the spatial domain. This complements the DFT operation and is essential for many frequency-domain signal processing techniques.

### Gaussian Kernel Generation

```cpp
auto generateGaussianKernel(
    int size,
    double sigma
) -> std::vector<std::vector<double>>;
```

Parameters:

- `size`: Size of the kernel (should be odd)
- `sigma`: Standard deviation of the Gaussian distribution

Returns:

- Gaussian kernel as a 2D vector

Description:
Generates a 2D Gaussian kernel that can be used for image blurring/smoothing. The `sigma` parameter controls the amount of blurring - larger values create more blurring effect.

### Gaussian Filter Application

```cpp
auto applyGaussianFilter(
    const std::vector<std::vector<double>>& image,
    const std::vector<std::vector<double>>& kernel
) -> std::vector<std::vector<double>>;
```

Parameters:

- `image`: Input image as 2D matrix
- `kernel`: Gaussian kernel to apply

Returns:

- Filtered image as a 2D vector

Description:
Applies a Gaussian filter to an image, which typically results in a smoothing/blurring effect. This is commonly used for noise reduction in image processing.

### OpenCL Accelerated Functions (if USE_OPENCL=1)

```cpp
auto convolve2DOpenCL(
    const std::vector<std::vector<double>>& input,
    const std::vector<std::vector<double>>& kernel,
    int numThreads = availableThreads
) -> std::vector<std::vector<double>>;

auto deconvolve2DOpenCL(
    const std::vector<std::vector<double>>& signal,
    const std::vector<std::vector<double>>& kernel,
    int numThreads = availableThreads
) -> std::vector<std::vector<double>>;
```

Description:
These functions provide OpenCL-accelerated versions of the convolution and deconvolution operations, which can significantly improve performance on supported hardware. The `numThreads` parameter is used for fallback if OpenCL fails.

## Usage Example

The following example demonstrates how to use the library to apply a Gaussian blur to a simulated image:

```cpp
#include <iostream>
#include <vector>
#include "atom/algorithm/convolve.hpp"

int main() {
    try {
        // Create a sample 10x10 image (a simple gradient)
        std::vector<std::vector<double>> image(10, std::vector<double>(10, 0.0));
        for (int i = 0; i < 10; ++i) {
            for (int j = 0; j < 10; ++j) {
                image[i][j] = static_cast<double>(i + j) / 20.0;
            }
        }
        
        // Print original image
        std::cout << "Original Image:" << std::endl;
        for (const auto& row : image) {
            for (double pixel : row) {
                std::cout << pixel << " ";
            }
            std::cout << std::endl;
        }
        
        // Generate a 3x3 Gaussian kernel with sigma = 1.0
        auto kernel = atom::algorithm::generateGaussianKernel(3, 1.0);
        
        std::cout << "\nGaussian Kernel:" << std::endl;
        for (const auto& row : kernel) {
            for (double value : row) {
                std::cout << value << " ";
            }
            std::cout << std::endl;
        }
        
        // Apply convolution (blur the image)
        auto blurredImage = atom::algorithm::convolve2D(image, kernel);
        
        std::cout << "\nBlurred Image:" << std::endl;
        for (const auto& row : blurredImage) {
            for (double pixel : row) {
                std::cout << pixel << " ";
            }
            std::cout << std::endl;
        }
        
        // Try to recover the original image with deconvolution
        auto recoveredImage = atom::algorithm::deconvolve2D(blurredImage, kernel);
        
        std::cout << "\nRecovered Image:" << std::endl;
        for (const auto& row : recoveredImage) {
            for (double pixel : row) {
                std::cout << pixel << " ";
            }
            std::cout << std::endl;
        }
        
        // Compute the DFT of the image
        auto frequencyDomain = atom::algorithm::dfT2D(image);
        
        std::cout << "\nFrequency Domain (magnitude of first few elements):" << std::endl;
        for (int i = 0; i < 3; ++i) {
            for (int j = 0; j < 3; ++j) {
                std::cout << std::abs(frequencyDomain[i][j]) << " ";
            }
            std::cout << std::endl;
        }
        
        // Convert back to spatial domain
        auto spatialDomain = atom::algorithm::idfT2D(frequencyDomain);
        
        std::cout << "\nBack to Spatial Domain (first few elements):" << std::endl;
        for (int i = 0; i < 3; ++i) {
            for (int j = 0; j < 3; ++j) {
                std::cout << spatialDomain[i][j] << " ";
            }
            std::cout << std::endl;
        }
        
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
```

## Performance Considerations

- Use multiple threads when processing large images or signals
- Enable OpenCL if you have compatible GPU hardware for maximum performance
- The SIMD optimizations provide significant speedup on modern CPUs when enabled
- For very large matrices, consider breaking them into smaller blocks to improve cache efficiency

## Thread Safety

All functions in this library are designed to be thread-safe when used with different data. The multi-threaded implementations use `std::jthread` from C++20 for automatic resource management.

## Error Handling

The library uses exception-based error handling. Functions will throw exceptions from the `atom::error` namespace when they encounter issues like:

- Invalid input dimensions
- Empty matrices
- OpenCL initialization failures
- Memory allocation errors

Always use try-catch blocks when using this library in production code.
