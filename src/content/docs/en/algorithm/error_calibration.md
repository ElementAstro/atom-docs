---
title: Error Calibration
description: Comprehensive for the Advanced Error Calibration Library in the atom::algorithm namespace, including methods for linear and polynomial calibration, residual analysis, outlier detection, and cross-validation.
---

## Purpose and High-Level Overview

The Error Calibration Library is a comprehensive C++ template library for statistical calibration of measurement errors. It provides tools to establish mathematical relationships between measured and actual values, allowing for accurate correction of systematic measurement errors.

Key capabilities include:

- Multiple calibration models: linear, polynomial, exponential, logarithmic, and power law
- Statistical analysis tools: residual analysis, outlier detection, and cross-validation
- Statistical metrics: R-squared, Mean Squared Error (MSE), Mean Absolute Error (MAE)
- Confidence interval estimation through bootstrap resampling
- High-performance processing through parallelization, SIMD operations, and memory optimization
- Asynchronous calibration support via C++20 coroutines

The library is designed for scientific and engineering applications where precise measurement calibration is critical, such as sensor calibration, analytical instrument validation, and quality control.

## Dependencies and Requirements

### Required Headers

```cpp
#include <algorithm>
#include <cmath>
#include <concepts>
#include <coroutine>
#include <execution>
#include <fstream>
#include <functional>
#include <memory_resource>
#include <mutex>
#include <numeric>
#include <optional>
#include <random>
#include <string>
#include <thread>
#include <vector>
```

### Optional Dependencies

```cpp
// SIMD support for acceleration
#ifdef USE_SIMD
#ifdef __AVX__
#include <immintrin.h>
#elif defined(__ARM_NEON)
#include <arm_neon.h>
#endif
#endif

// Internal library dependencies
#include "atom/async/pool.hpp"  // Thread pool implementation
#include "atom/error/exception.hpp" // Exception handling
#include "atom/log/loguru.hpp"  // Logging functionality

// Optional Boost support for advanced linear algebra
#ifdef ATOM_USE_BOOST
#include <boost/numeric/ublas/io.hpp>
#include <boost/numeric/ublas/lu.hpp>
#include <boost/numeric/ublas/matrix.hpp>
#include <boost/random.hpp>
#endif
```

### Compiler Requirements

- C++20 compatible compiler (for concepts and coroutines)
- Optional: AVX or ARM NEON support for SIMD acceleration
- Optional: Boost libraries for enhanced numerical computations

## Class Documentation

### `ErrorCalibration<T>` Class

#### Overview

The primary class template for performing error calibration, working with any floating-point type.

#### Template Parameters

- `T`: A floating-point type (enforced by `std::floating_point` concept constraint)

#### Member Variables

```cpp
private:
    T slope_ = 1.0;                 // Calibration slope
    T intercept_ = 0.0;             // Calibration intercept
    std::optional<T> r_squared_;    // Coefficient of determination
    std::vector<T> residuals_;      // Residuals from calibration
    T mse_ = 0.0;                   // Mean Squared Error
    T mae_ = 0.0;                   // Mean Absolute Error

    std::mutex metrics_mutex_;      // Thread safety for metric calculations
    std::unique_ptr<atom::async::ThreadPool<>> thread_pool_; // Thread pool for parallel processing
    
    // Memory management
    static constexpr size_t MAX_CACHE_SIZE = 10000;
    std::shared_ptr<std::pmr::monotonic_buffer_resource> memory_resource_;
    std::pmr::vector<T> cached_residuals_{memory_resource_.get()};
    
    // Thread-local storage optimization
    thread_local static std::vector<T> tls_buffer;
```

#### Constructor and Destructor

```cpp
public:
    // Constructor - sets up memory resources
    ErrorCalibration();
    
    // Destructor - ensures safe thread pool shutdown
    ~ErrorCalibration();
```

#### Public Methods

##### Calibration Methods

```cpp
// Linear calibration (y = mx + b)
void linearCalibrate(const std::vector<T>& measured, const std::vector<T>& actual);

// Polynomial calibration of specified degree
void polynomialCalibrate(const std::vector<T>& measured, 
                        const std::vector<T>& actual, 
                        int degree);

// Exponential calibration (y = a * e^(bx))
void exponentialCalibrate(const std::vector<T>& measured, 
                         const std::vector<T>& actual);

// Logarithmic calibration (y = a + b * ln(x))
void logarithmicCalibrate(const std::vector<T>& measured, 
                         const std::vector<T>& actual);

// Power law calibration (y = a * x^b)
void powerLawCalibrate(const std::vector<T>& measured, 
                      const std::vector<T>& actual);
```

##### Application and Retrieval

```cpp
// Apply calibration to a single value
[[nodiscard]] auto apply(T value) const -> T;

// Display calibration parameters to log
void printParameters() const;

// Get residuals from calibration
[[nodiscard]] auto getResiduals() const -> std::vector<T>;

// Write residuals to a CSV file
void plotResiduals(const std::string& filename) const;

// Getters for calibration parameters
[[nodiscard]] auto getSlope() const -> T;
[[nodiscard]] auto getIntercept() const -> T;
[[nodiscard]] auto getRSquared() const -> std::optional<T>;
[[nodiscard]] auto getMse() const -> T;
[[nodiscard]] auto getMae() const -> T;
```

##### Statistical Analysis

```cpp
// Bootstrap confidence interval for slope parameter
auto bootstrapConfidenceInterval(const std::vector<T>& measured,
                               const std::vector<T>& actual,
                               int n_iterations = 1000,
                               double confidence_level = 0.95)
    -> std::pair<T, T>;

// Detect outliers based on residual analysis
auto outlierDetection(const std::vector<T>& measured,
                    const std::vector<T>& actual, 
                    T threshold = 2.0)
    -> std::tuple<T, T, T>;

// K-fold cross-validation
void crossValidation(const std::vector<T>& measured,
                   const std::vector<T>& actual, 
                   int k = 5);
```

#### Private Methods

```cpp
// Initialize the thread pool for parallel processing
void initThreadPool();

// Calculate statistical metrics after calibration
void calculateMetrics(const std::vector<T>& measured, const std::vector<T>& actual);

// Nonlinear curve fitting using Levenberg-Marquardt algorithm
auto levenbergMarquardt(const std::vector<T>& x, 
                      const std::vector<T>& y,
                      NonlinearFunction func,
                      std::vector<T> initial_params,
                      int max_iterations = 100, 
                      T lambda = 0.01,
                      T epsilon = 1e-8) -> std::vector<T>;

// Solve system of linear equations (when not using Boost)
auto solveLinearSystem(const std::vector<std::vector<T>>& A,
                     const std::vector<T>& b) -> std::vector<T>;
```

### `AsyncCalibrationTask<T>` Class

#### Overview

Provides coroutine-based asynchronous calibration capabilities.

#### Template Parameters

- `T`: A floating-point type (enforced by `std::floating_point` concept constraint)

#### Methods

```cpp
// Get the calibration result
ErrorCalibration<T>* getResult();
```

#### Related Free Function

```cpp
// Create an asynchronous calibration task
template <std::floating_point T>
AsyncCalibrationTask<T> calibrateAsync(const std::vector<T>& measured,
                                     const std::vector<T>& actual);
```

## Detailed Method Explanations

### Calibration Methods

#### `void linearCalibrate(const std::vector<T>& measured, const std::vector<T>& actual)`

Purpose: Performs linear calibration (y = mx + b) between measured and actual values.

Parameters:

- `measured`: Vector of measured values
- `actual`: Vector of actual/reference values

Throws:

- `INVALID_ARGUMENT`: If input vectors are empty or have different sizes
- `RUNTIME_ERROR`: If division by zero occurs during slope calculation

Implementation Details:

- Uses the least squares method to find optimal slope and intercept
- Calculates statistical metrics (R-squared, MSE, MAE)
- Thread-safe implementation using the metrics mutex

Example:

```cpp
std::vector<double> measured = {1.0, 2.0, 3.0, 4.0, 5.0};
std::vector<double> actual = {1.1, 2.3, 2.9, 4.2, 5.1};

atom::algorithm::ErrorCalibration<double> calibrator;
calibrator.linearCalibrate(measured, actual);

// Apply calibration to a new measurement
double raw_measurement = 3.5;
double calibrated = calibrator.apply(raw_measurement);
std::cout << "Raw: " << raw_measurement << ", Calibrated: " << calibrated << std::endl;
```

#### `void polynomialCalibrate(const std::vector<T>& measured, const std::vector<T>& actual, int degree)`

Purpose: Performs polynomial calibration of specified degree between measured and actual values.

Parameters:

- `measured`: Vector of measured values
- `actual`: Vector of actual/reference values
- `degree`: Degree of the polynomial (1 = linear, 2 = quadratic, etc.)

Throws:

- `INVALID_ARGUMENT`: If input vectors are empty, have different sizes, contain NaN/infinity, or if degree is invalid
- `RUNTIME_ERROR`: If the calibration algorithm fails

Implementation Details:

- Uses the Levenberg-Marquardt algorithm for nonlinear curve fitting
- For performance, uses parallel execution where possible
- Extracts slope and intercept from polynomial coefficients for simple linear application

Example:

```cpp
std::vector<double> measured = {1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0};
std::vector<double> actual = {1.1, 2.4, 3.9, 5.2, 7.1, 9.6, 12.5};

atom::algorithm::ErrorCalibration<double> calibrator;
// Fit a quadratic polynomial (y = ax² + bx + c)
calibrator.polynomialCalibrate(measured, actual, 2);
calibrator.printParameters();

// Apply calibration to new measurements
for (double x = 1.0; x <= 7.0; x += 0.5) {
    std::cout << "Raw: " << x << ", Calibrated: " << calibrator.apply(x) << std::endl;
}
```

#### `void exponentialCalibrate(const std::vector<T>& measured, const std::vector<T>& actual)`

Purpose: Performs exponential calibration (y = a * e^(bx)) between measured and actual values.

Parameters:

- `measured`: Vector of measured values
- `actual`: Vector of actual/reference values

Throws:

- `INVALID_ARGUMENT`: If input vectors are empty, have different sizes, or if actual values are not positive
- `RUNTIME_ERROR`: If the calibration algorithm fails

Implementation Details:

- Uses the Levenberg-Marquardt algorithm with an exponential function model
- Requires positive actual values (since exponential functions are strictly positive)

Example:

```cpp
std::vector<double> measured = {0.0, 1.0, 2.0, 3.0, 4.0};
std::vector<double> actual = {1.0, 2.7, 7.4, 20.1, 54.6};

atom::algorithm::ErrorCalibration<double> calibrator;
calibrator.exponentialCalibrate(measured, actual);

// Check calibration quality
if (calibrator.getRSquared().has_value()) {
    std::cout << "R-squared: " << calibrator.getRSquared().value() << std::endl;
}
```

#### `void logarithmicCalibrate(const std::vector<T>& measured, const std::vector<T>& actual)`

Purpose: Performs logarithmic calibration (y = a + b * ln(x)) between measured and actual values.

Parameters:

- `measured`: Vector of measured values
- `actual`: Vector of actual/reference values

Throws:

- `INVALID_ARGUMENT`: If input vectors are empty, have different sizes, or if measured values are not positive
- `RUNTIME_ERROR`: If the calibration algorithm fails

Implementation Details:

- Uses the Levenberg-Marquardt algorithm with a logarithmic function model
- Requires positive measured values (since logarithm is only defined for positive numbers)

Example:

```cpp
std::vector<double> measured = {1.0, 2.0, 5.0, 10.0, 20.0, 50.0, 100.0};
std::vector<double> actual = {0.0, 0.7, 1.6, 2.3, 3.0, 3.9, 4.6};

atom::algorithm::ErrorCalibration<double> calibrator;
calibrator.logarithmicCalibrate(measured, actual);

// Examine calibration errors
std::cout << "MSE: " << calibrator.getMse() << ", MAE: " << calibrator.getMae() << std::endl;
```

#### `void powerLawCalibrate(const std::vector<T>& measured, const std::vector<T>& actual)`

Purpose: Performs power law calibration (y = a * x^b) between measured and actual values.

Parameters:

- `measured`: Vector of measured values
- `actual`: Vector of actual/reference values

Throws:

- `INVALID_ARGUMENT`: If input vectors are empty, have different sizes, or if values are not positive
- `RUNTIME_ERROR`: If the calibration algorithm fails

Implementation Details:

- Uses the Levenberg-Marquardt algorithm with a power function model
- Requires positive values (power law is typically defined only for positive values)

Example:

```cpp
std::vector<double> measured = {1.0, 2.0, 3.0, 4.0, 5.0};
std::vector<double> actual = {2.0, 8.0, 18.0, 32.0, 50.0};

atom::algorithm::ErrorCalibration<double> calibrator;
calibrator.powerLawCalibrate(measured, actual);
calibrator.printParameters();
```

### Statistical Analysis Methods

#### `auto bootstrapConfidenceInterval(...) -> std::pair<T, T>`

Purpose: Estimates confidence intervals for the slope parameter using bootstrap resampling.

Parameters:

- `measured`: Vector of measured values
- `actual`: Vector of actual/reference values
- `n_iterations`: Number of bootstrap iterations (default: 1000)
- `confidence_level`: Confidence level (default: 0.95 for 95% confidence)

Returns: A pair containing the lower and upper bounds of the confidence interval

Throws:

- `INVALID_ARGUMENT`: If arguments are invalid
- `RUNTIME_ERROR`: If all bootstrap iterations fail

Example:

```cpp
std::vector<double> measured = {1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0};
std::vector<double> actual = {1.2, 2.1, 3.3, 4.0, 4.8, 6.2, 7.1, 8.3, 9.2, 10.1};

atom::algorithm::ErrorCalibration<double> calibrator;
calibrator.linearCalibrate(measured, actual);

// Get 95% confidence interval for the slope
auto [lower, upper] = calibrator.bootstrapConfidenceInterval(measured, actual);
std::cout << "Slope: " << calibrator.getSlope() 
          << " (95% CI: " << lower << " - " << upper << ")" << std::endl;
```

#### `auto outlierDetection(...) -> std::tuple<T, T, T>`

Purpose: Detects outliers in the calibration data based on residual analysis.

Parameters:

- `measured`: Vector of measured values
- `actual`: Vector of actual/reference values
- `threshold`: Threshold for outlier detection in standard deviations (default: 2.0)

Returns: A tuple containing mean residual, standard deviation, and the threshold used

Example:

```cpp
std::vector<double> measured = {1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0};
std::vector<double> actual = {1.1, 2.2, 3.1, 8.5, 5.2, 6.1, 7.3}; // 4.0 maps to 8.5 (outlier)

atom::algorithm::ErrorCalibration<double> calibrator;
calibrator.linearCalibrate(measured, actual);

// Detect outliers with 2.5 standard deviation threshold
auto [mean, stddev, thresh] = calibrator.outlierDetection(measured, actual, 2.5);
std::cout << "Mean residual: " << mean << ", StdDev: " << stddev << std::endl;

// Examine all residuals to identify outliers
auto residuals = calibrator.getResiduals();
for (size_t i = 0; i < residuals.size(); i++) {
    if (std::abs(residuals[i] - mean) > thresh * stddev) {
        std::cout << "Outlier at index " << i << ": measured=" << measured[i] 
                  << ", actual=" << actual[i] << ", residual=" << residuals[i] << std::endl;
    }
}
```

#### `void crossValidation(const std::vector<T>& measured, const std::vector<T>& actual, int k = 5)`

Purpose: Performs k-fold cross-validation to assess calibration model stability.

Parameters:

- `measured`: Vector of measured values
- `actual`: Vector of actual/reference values
- `k`: Number of folds for cross-validation (default: 5)

Throws:

- `INVALID_ARGUMENT`: If input vectors are empty, have different sizes, or size < k
- `RUNTIME_ERROR`: If all cross-validation folds fail

Example:

```cpp
std::vector<double> measured(100), actual(100);
// Fill with some test data...
for (int i = 0; i < 100; i++) {
    measured[i] = i * 0.1;
    actual[i] = 0.5 + 1.05 * measured[i] + ((i % 10 == 0) ? 0.2 : 0.0); // Some noise
}

atom::algorithm::ErrorCalibration<double> calibrator;
// Perform 10-fold cross-validation
calibrator.crossValidation(measured, actual, 10);
```

### Asynchronous Calibration

#### `AsyncCalibrationTask<T> calibrateAsync(const std::vector<T>& measured, const std::vector<T>& actual)`

Purpose: Creates an asynchronous calibration task using C++20 coroutines.

Parameters:

- `measured`: Vector of measured values
- `actual`: Vector of actual/reference values

Returns: An `AsyncCalibrationTask<T>` object that represents the asynchronous operation

Example:

```cpp
std::vector<double> measured = {1.0, 2.0, 3.0, 4.0, 5.0};
std::vector<double> actual = {1.1, 2.3, 2.9, 4.2, 5.1};

// Start asynchronous calibration
auto task = atom::algorithm::calibrateAsync(measured, actual);

// Do other work while calibration runs...
std::cout << "Calibration is running asynchronously..." << std::endl;

// Get the result when needed
auto* calibrator = task.getResult();
std::cout << "Calibration complete. Slope: " << calibrator->getSlope() 
          << ", Intercept: " << calibrator->getIntercept() << std::endl;

// Clean up (since calibrateAsync creates calibrator with new)
delete calibrator;
```

## Performance Considerations

### Thread Pool and Parallelization

The library utilizes parallel execution where beneficial:

- Thread pool initialization: The thread pool is lazily initialized to avoid overhead when not needed.
- Parallel algorithms: Uses `std::execution::par_unseq` for key computational steps.
- Thread count limits: Thread pool is limited to prevent over-subscription.

```cpp
// Example showing explicit thread pool initialization
ErrorCalibration<float> calibrator;
// The thread pool will be automatically initialized during first calibration
```

### Memory Optimization

The library implements several memory optimization techniques:

- Memory resources: Uses `std::pmr` for efficient memory allocation.
- Preallocated buffers: Preallocates buffers to avoid frequent reallocations.
- Thread-local storage: Uses thread-local storage to reduce contention.

### SIMD Acceleration

When compiled with `USE_SIMD` defined, the library can use SIMD instructions:

```cpp
// To enable SIMD acceleration:
#define USE_SIMD
#include "atom/algorithm/error_calibration.hpp"

// The library will automatically detect and use AVX or NEON instructions
```

### Boost Integration

Boost numerical libraries can be used for enhanced performance:

```cpp
// To enable Boost integration:
#define ATOM_USE_BOOST
#include "atom/algorithm/error_calibration.hpp"

// The library will use Boost's ublas for numerical operations
```

## Best Practices and Common Pitfalls

### Best Practices

1. Choose the appropriate calibration model:
   - Use linear calibration for simple linear relationships
   - Use polynomial calibration for nonlinear but polynomial relationships
   - Use exponential calibration for exponential growth patterns
   - Use logarithmic calibration for logarithmic relationships
   - Use power law calibration for power law relationships

2. Validate calibration results:
   - Check R-squared value to assess fit quality
   - Analyze residuals for patterns that might indicate a poor model fit
   - Use cross-validation for more robust validation

3. Handle outliers appropriately:
   - Use `outlierDetection` to identify outliers
   - Consider removing clear outliers before final calibration

4. Optimize for performance:
   - For large datasets, enable SIMD and Boost support
   - For real-time applications, consider using asynchronous calibration

### Common Pitfalls

1. Inappropriate model selection:
   - Using linear calibration for clearly nonlinear relationships
   - Using high-degree polynomials that overfit the data

2. Insufficient data validation:
   - Not checking for NaN or infinite values
   - Not ensuring data vectors are of equal size

3. Ignoring numerical stability issues:
   - Division by zero in special cases
   - Overflow or underflow with extreme values

4. Misinterpreting statistical metrics:
   - Focusing only on R-squared without examining residuals
   - Not considering confidence intervals

5. Memory management issues:
   - Not deleting calibrator objects created with `calibrateAsync`

## Comprehensive Example

This example demonstrates a complete workflow using the Error Calibration library:

```cpp
#include <iostream>
#include <iomanip>
#include <vector>
#include "atom/algorithm/error_calibration.hpp"

int main() {
    // 1. Prepare test data with known relationship (y = 2x + 1) plus some noise
    std::vector<double> measured(20);
    std::vector<double> actual(20);
    
    std::random_device rd;
    std::mt19937 gen(rd());
    std::normal_distribution<double> noise(0.0, 0.2); // Mean 0, stddev 0.2
    
    for (int i = 0; i < 20; i++) {
        measured[i] = i * 0.5;  // 0.0, 0.5, 1.0, 1.5, ...
        actual[i] = 1.0 + 2.0 * measured[i] + noise(gen);  // 2x + 1 + noise
    }
    
    // Add one outlier
    actual[10] = actual[10] + 2.0;
    
    // 2. Create calibrator
    atom::algorithm::ErrorCalibration<double> calibrator;
    
    // 3. Perform linear calibration
    try {
        calibrator.linearCalibrate(measured, actual);
    }
    catch (const std::exception& e) {
        std::cerr << "Calibration error: " << e.what() << std::endl;
        return 1;
    }
    
    // 4. Print calibration parameters
    std::cout << "======= Linear Calibration Results =======" << std::endl;
    std::cout << "Slope: " << calibrator.getSlope() << std::endl;
    std::cout << "Intercept: " << calibrator.getIntercept() << std::endl;
    
    if (calibrator.getRSquared().has_value()) {
        std::cout << "R-squared: " << calibrator.getRSquared().value() << std::endl;
    }
    
    std::cout << "MSE: " << calibrator.getMse() << std::endl;
    std::cout << "MAE: " << calibrator.getMae() << std::endl;
    
    // 5. Detect outliers
    std::cout << "\n======= Outlier Detection =======" << std::endl;
    auto [meanResidual, stdDev, threshold] = calibrator.outlierDetection(measured, actual, 2.0);
    
    std::cout << "Mean residual: " << meanResidual << std::endl;
    std::cout << "Standard deviation: " << stdDev << std::endl;
    
    auto residuals = calibrator.getResiduals();
    std::cout << "Detected outliers:" << std::endl;
    for (size_t i = 0; i < residuals.size(); i++) {
        if (std::abs(residuals[i] - meanResidual) > threshold * stdDev) {
            std::cout << "  Index " << i 
                      << ": measured=" << measured[i] 
                      << ", actual=" << actual[i]
                      << ", residual=" << residuals[i] << std::endl;
        }
    }
    
    // 6. Bootstrap confidence intervals
    std::cout << "\n======= Bootstrap Confidence Intervals =======" << std::endl;
    auto [lowerBound, upperBound] = calibrator.bootstrapConfidenceInterval(
        measured, actual, 1000, 0.95);
    
    std::cout << "Slope: " << calibrator.getSlope() << std::endl;
    std::cout << "95% Confidence Interval: [" << lowerBound << ", " << upperBound << "]" << std::endl;
    
    // 7. Cross-validation
    std::cout << "\n======= Cross-Validation =======" << std::endl;
    calibrator.crossValidation(measured, actual, 5);
    
    // 8. Apply calibration to new values
    std::cout << "\n======= Applying Calibration =======" << std::endl;
    std::cout << std::fixed << std::setprecision(3);
    std::cout << "Raw Value | Calibrated Value" << std::endl;
    std::cout << "-------------------------" << std::endl;
    
    for (double raw = 0.0; raw <= 10.0; raw += 1.0) {
        double calibrated = calibrator.apply(raw);
        std::cout << std::setw(9) << raw << " | " << std::setw(16) << calibrated << std::endl;
    }
    
    // 9. Try a different calibration model (polynomial)
    std::cout << "\n======= Polynomial Calibration =======" << std::endl;
    atom::algorithm::ErrorCalibration<double> polyCalibrator;
    
    try {
        // Try a quadratic model
        polyCalibrator.polynomialCalibrate(measured, actual, 2);
        
        std::cout << "MSE (linear): " << calibrator.getMse() << std::endl;
        std::cout << "MSE (polynomial): " << polyCalibrator.getMse() << std::endl;
        
        // Compare which model is better based on MSE
        if (polyCalibrator.getMse() < calibrator.getMse()) {
            std::cout << "Polynomial model provides better fit!" << std::endl;
        } else {
            std::cout << "Linear model provides better fit!" << std::endl;
        }
    }
    catch (const std::exception& e) {
        std::cerr << "Polynomial calibration error: " << e.what() << std::endl;
    }
    
    // 10. Save residuals to file for external plotting
    try {
        calibrator.plotResiduals("residuals.csv");
        std::cout << "\nResiduals saved to 'residuals.csv'" << std::endl;
    }
    catch (const std::exception& e) {
        std::cerr << "Failed to save residuals: " << e.what() << std::endl;
    }
    
    return 0;
}
```

### Expected Output

The output will vary based on the random noise, but should look similar to:

```
======= Linear Calibration Results =======
Slope: 2.035
Intercept: 0.968
R-squared: 0.984
MSE: 0.087
MAE: 0.193

======= Outlier Detection =======
Mean residual: 0.011
Standard deviation: 0.293
Detected outliers:
  Index 10: measured=5.000, actual=11.982, residual=2.180

======= Bootstrap Confidence Intervals =======
Slope: 2.035
95% Confidence Interval: [1.891, 2.176]

======= Cross-Validation =======

======= Applying Calibration =======
Raw Value | Calibrated Value
-------------------------
    0.000 |            0.968
    1.000 |            3.003
    2.000 |            5.038
    3.000 |            7.073
    4.000 |            9.108
    5.000 |           11.143
    6.000 |           13.178
    7.000 |           15.213
    8.000 |           17.248
    9.000 |           19.283
   10.000 |           21.318

======= Polynomial Calibration =======
MSE (linear): 0.087
MSE (polynomial): 0.082
Polynomial model provides better fit!

Residuals saved to 'residuals.csv'
```

## Platform and Compiler Notes

- MSVC: Ensure C++20 support with `/std:c++latest` compiler flag
- GCC/Clang: Use `-std=c++20` compiler flag
- SIMD Support:
  - For AVX support on x86 platforms, use `-mavx`
  - For NEON support on ARM platforms, use `-mfpu=neon`
- Thread pool limitations:
  - On Windows, thread priority is not adjusted
  - On Unix-like systems, thread priority can be adjusted via `pthread`

## Conclusion

The Error Calibration Library provides a comprehensive suite of tools for statistical calibration of measurement data. With support for multiple calibration models, statistical analysis features, and high-performance computing capabilities, it is suitable for a wide range of scientific and engineering applications where precise measurement calibration is required.

The template design allows for use with any floating-point type, making it versatile for different precision requirements. Advanced features like asynchronous processing and SIMD acceleration make it suitable even for real-time applications and large datasets.

By following the best practices outlined in this documentation and understanding the various calibration models available, developers can effectively implement robust calibration solutions for their specific use cases.
