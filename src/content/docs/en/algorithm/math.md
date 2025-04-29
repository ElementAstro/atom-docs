---
title: Extra Math Library
description: Comprehensive for the Extra Math Library in the atom::algorithm namespace, including functions for safe arithmetic operations, bit manipulation, and mathematical calculations for 64-bit unsigned integers.
---

## Purpose and High-Level Overview

The `atom::algorithm` namespace provides an extended mathematics library designed for high-performance C++ applications. It offers a collection of optimized mathematical operations, focusing on safety, efficiency, and thread-safety.

This library implements:

- Thread-safe caching for expensive mathematical computations
- Safe arithmetic operations with overflow/underflow protection
- Bit manipulation and binary operations
- Prime number generation and testing
- SIMD-accelerated parallel vector operations
- Advanced modular arithmetic
- Cryptographically secure random number generation
- Specialized memory management for mathematical operations

The library is built with modern C++20 features and leverages compile-time optimizations, SIMD instructions, and multithreading where appropriate to maximize performance while maintaining safety.

## Detailed Explanation of Components

### Concepts

```cpp
template <typename T>
concept UnsignedIntegral = std::unsigned_integral<T>;

template <typename T>
concept Arithmetic = std::integral<T> || std::floating_point<T>;
```

These concepts constrain template parameters:

- `UnsignedIntegral`: Restricts types to unsigned integers
- `Arithmetic`: Allows any numeric type (integer or floating-point)

### MathCache Class

```cpp
class MathCache {
public:
    static MathCache& getInstance() noexcept;
    [[nodiscard]] std::shared_ptr<const std::vector<uint64_t>> getCachedPrimes(uint64_t limit);
    void clear() noexcept;
    
private:
    // Implementation details...
};
```

Purpose: A singleton class that provides thread-safe caching for expensive mathematical operations, particularly prime number generation.

#### Methods

- getInstance():
  - Returns the singleton instance of `MathCache`
  - Return: Reference to the singleton instance
  - Thread safety: Thread-safe, can be called from multiple threads

- getCachedPrimes(uint64_t limit):
  - Retrieves a vector of prime numbers up to the specified limit
  - Parameters: `limit` - Upper bound for prime number generation
  - Return: Thread-safe shared pointer to a const vector of uint64_t primes
  - Thread safety: Uses shared mutex to allow concurrent reads but exclusive writes
  - Performance: Avoids regenerating prime lists for repeated calls with the same limit

- clear():
  - Clears all cached values from memory
  - Thread safety: Acquires exclusive lock before clearing cache

#### Usage Example

```cpp
#include <atom/algorithm/math.hpp>
#include <iostream>

void printFirstNPrimes(uint64_t n, uint64_t limit) {
    // Get the cache instance
    auto& cache = atom::algorithm::MathCache::getInstance();
    
    // Get cached primes up to limit
    auto primes = cache.getCachedPrimes(limit);
    
    // Print first n primes (or all if fewer than n)
    for (size_t i = 0; i < std::min(n, static_cast<uint64_t>(primes->size())); ++i) {
        std::cout << (*primes)[i] << " ";
    }
    std::cout << std::endl;
}

int main() {
    // Print first 10 primes up to 100
    printFirstNPrimes(10, 100);  // Output: 2 3 5 7 11 13 17 19 23 29
    
    // Subsequent calls reuse cached results
    printFirstNPrimes(5, 100);   // Uses cached result, no recalculation
    
    return 0;
}
```

### Safe Arithmetic Operations

#### safeAdd

```cpp
[[nodiscard]] constexpr auto safeAdd(uint64_t a, uint64_t b) -> uint64_t;
```

Purpose: Performs addition with overflow checking.

- Parameters: `a` and `b` - The two operands for addition
- Return: The sum of `a` and `b`
- Exceptions: Throws `atom::error::OverflowException` if the operation would overflow
- Constexpr: Can be evaluated at compile time when possible

#### safeSub

```cpp
[[nodiscard]] constexpr auto safeSub(uint64_t a, uint64_t b) -> uint64_t;
```

Purpose: Performs subtraction with underflow checking.

- Parameters: `a` and `b` - The operands for subtraction (a - b)
- Return: The result of subtracting `b` from `a`
- Exceptions: Throws `atom::error::UnderflowException` if the operation would underflow
- Constexpr: Can be evaluated at compile time when possible

#### safeMul

```cpp
[[nodiscard]] constexpr auto safeMul(uint64_t a, uint64_t b) -> uint64_t;
```

Purpose: Performs multiplication with overflow checking.

- Parameters: `a` and `b` - The operands for multiplication
- Return: The product of `a` and `b`
- Exceptions: Throws `atom::error::OverflowException` if the operation would overflow
- Constexpr: Can be evaluated at compile time when possible

#### safeDiv

```cpp
[[nodiscard]] constexpr auto safeDiv(uint64_t a, uint64_t b) -> uint64_t;
```

Purpose: Performs division with division-by-zero checking.

- Parameters: `a` (numerator) and `b` (denominator)
- Return: The result of dividing `a` by `b`
- Exceptions: Throws `atom::error::InvalidArgumentException` if `b` is zero
- Constexpr: Can be evaluated at compile time when possible

#### mulDiv64

```cpp
[[nodiscard]] auto mulDiv64(uint64_t operant, uint64_t multiplier, uint64_t divider) -> uint64_t;
```

Purpose: Performs a 64-bit multiplication followed by division, avoiding intermediate overflow.

- Parameters:
  - `operant` - First multiplicand
  - `multiplier` - Second multiplicand
  - `divider` - Divisor
- Return: The result of (operant * multiplier) / divider
- Exceptions: Throws `atom::error::InvalidArgumentException` if divider is zero
- Performance: Uses processor-specific optimizations when available

#### Usage Example

```cpp
#include <atom/algorithm/math.hpp>
#include <iostream>
#include <stdexcept>

int main() {
    try {
        // Safe addition
        uint64_t sum = atom::algorithm::safeAdd(18446744073709551610ULL, 5ULL);
        // This would throw an exception
        
    } catch (const std::exception& e) {
        std::cout << "Addition overflow caught: " << e.what() << std::endl;
    }
    
    try {
        // Safe multiplication
        uint64_t product = atom::algorithm::safeMul(100000000000ULL, 100000000000ULL);
        std::cout << "Product: " << product << std::endl;
        
        // Safe division
        uint64_t quotient = atom::algorithm::safeDiv(product, 1000000ULL);
        std::cout << "Quotient: " << quotient << std::endl;
        
        // mulDiv64 - avoids intermediate overflow
        uint64_t result = atom::algorithm::mulDiv64(9223372036854775800ULL, 
                                                   2ULL, 
                                                   3ULL);
        std::cout << "mulDiv64 result: " << result << std::endl;
    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << std::endl;
    }
    
    return 0;
}
```

### Bit Manipulation Functions

#### rotl64 & rotr64

```cpp
[[nodiscard]] constexpr auto rotl64(uint64_t n, unsigned int c) noexcept -> uint64_t;
[[nodiscard]] constexpr auto rotr64(uint64_t n, unsigned int c) noexcept -> uint64_t;
```

Purpose: Rotate bits left or right in a 64-bit integer.

- Parameters:
  - `n` - The value to rotate
  - `c` - The number of bit positions to rotate
- Return: The rotated value
- Performance: Uses `std::rotl` and `std::rotr` from C++20 when available

#### clz64

```cpp
[[nodiscard]] constexpr auto clz64(uint64_t x) noexcept -> int;
```

Purpose: Counts leading zeros in a 64-bit integer.

- Parameters: `x` - The value to count leading zeros in
- Return: The number of leading zeros
- Performance: Uses `std::countl_zero` from C++20 when available

#### normalize

```cpp
[[nodiscard]] constexpr auto normalize(uint64_t x) noexcept -> uint64_t;
```

Purpose: Normalizes a 64-bit integer by shifting it left until the most significant bit is set.

- Parameters: `x` - The value to normalize
- Return: The normalized value
- Note: Returns 0 if input is 0

#### bitReverse64

```cpp
[[nodiscard]] auto bitReverse64(uint64_t n) noexcept -> uint64_t;
```

Purpose: Reverses the bits in a 64-bit integer.

- Parameters: `n` - The value to reverse
- Return: The bit-reversed value
- Performance: Uses SIMD optimizations when available

#### isPowerOfTwo

```cpp
[[nodiscard]] constexpr auto isPowerOfTwo(uint64_t n) noexcept -> bool;
```

Purpose: Checks if a number is a power of two.

- Parameters: `n` - The value to check
- Return: `true` if `n` is a power of two, `false` otherwise
- Performance: Uses `std::has_single_bit` from C++20 when available

#### nextPowerOfTwo

```cpp
[[nodiscard]] constexpr auto nextPowerOfTwo(uint64_t n) noexcept -> uint64_t;
```

Purpose: Finds the next power of two greater than or equal to the input.

- Parameters: `n` - The starting value
- Return: The next power of two
- Performance: Uses `std::bit_ceil` from C++20 when available

#### Usage Example

```cpp
#include <atom/algorithm/math.hpp>
#include <iostream>
#include <bitset>

int main() {
    uint64_t value = 0x1234567890ABCDEF;
    
    // Bit rotation
    uint64_t rotated_left = atom::algorithm::rotl64(value, 8);
    uint64_t rotated_right = atom::algorithm::rotr64(value, 8);
    
    std::cout << "Original: 0x" << std::hex << value << std::endl;
    std::cout << "Rotated left by 8: 0x" << rotated_left << std::endl;
    std::cout << "Rotated right by 8: 0x" << rotated_right << std::endl;
    
    // Count leading zeros
    uint64_t val = 0x0000000000010000;
    int zeros = atom::algorithm::clz64(val);
    std::cout << "Leading zeros in 0x" << val << ": " << std::dec << zeros << std::endl;
    
    // Bit reversal
    uint64_t reversed = atom::algorithm::bitReverse64(value);
    std::cout << "Original bits: " << std::bitset<64>(value) << std::endl;
    std::cout << "Reversed bits: " << std::bitset<64>(reversed) << std::endl;
    
    // Power of two functions
    for (uint64_t i = 0; i < 20; i++) {
        std::cout << i << " is " 
                  << (atom::algorithm::isPowerOfTwo(i) ? "a" : "not a") 
                  << " power of 2. Next power of 2: " 
                  << atom::algorithm::nextPowerOfTwo(i) << std::endl;
    }
    
    return 0;
}
```

### Mathematical Functions

#### approximateSqrt

```cpp
[[nodiscard]] auto approximateSqrt(uint64_t n) noexcept -> uint64_t;
```

Purpose: Calculates an approximate square root of a 64-bit integer.

- Parameters: `n` - The value to calculate the square root of
- Return: The approximate square root
- Performance: Uses SIMD optimizations when available
- Note: Faster than exact methods but may be slightly inaccurate

#### gcd64

```cpp
[[nodiscard]] constexpr auto gcd64(uint64_t a, uint64_t b) noexcept -> uint64_t;
```

Purpose: Calculates the greatest common divisor of two 64-bit integers.

- Parameters: `a` and `b` - The two values
- Return: The greatest common divisor
- Performance: Uses `std::gcd` from C++17

#### lcm64

```cpp
[[nodiscard]] auto lcm64(uint64_t a, uint64_t b) -> uint64_t;
```

Purpose: Calculates the least common multiple of two 64-bit integers.

- Parameters: `a` and `b` - The two values
- Return: The least common multiple
- Exceptions: Throws `atom::error::OverflowException` if the result would overflow
- Performance: Uses `std::lcm` from C++17 with added overflow protection

#### isPrime

```cpp
[[nodiscard]] auto isPrime(uint64_t n) noexcept -> bool;
```

Purpose: Checks if a number is prime.

- Parameters: `n` - The value to check
- Return: `true` if `n` is prime, `false` otherwise
- Performance: Uses optimized trial division and caching

#### generatePrimes

```cpp
[[nodiscard]] auto generatePrimes(uint64_t limit) -> std::vector<uint64_t>;
```

Purpose: Generates all prime numbers up to a specified limit.

- Parameters: `limit` - The upper bound
- Return: Vector containing all primes up to `limit`
- Performance: Uses the Sieve of Eratosthenes and thread-safe caching

#### Usage Example

```cpp
#include <atom/algorithm/math.hpp>
#include <iostream>
#include <vector>

int main() {
    // Approximate square root
    uint64_t num = 1000000000ULL;
    uint64_t sqrt_approx = atom::algorithm::approximateSqrt(num);
    std::cout << "Approximate square root of " << num << ": " << sqrt_approx << std::endl;
    
    // GCD and LCM
    uint64_t a = 48, b = 180;
    std::cout << "GCD of " << a << " and " << b << ": " << atom::algorithm::gcd64(a, b) << std::endl;
    std::cout << "LCM of " << a << " and " << b << ": " << atom::algorithm::lcm64(a, b) << std::endl;
    
    // Prime check
    uint64_t testNum = 997;
    std::cout << testNum << " is " 
              << (atom::algorithm::isPrime(testNum) ? "a prime number" : "not a prime number") 
              << std::endl;
    
    // Generate primes up to limit
    uint64_t limit = 50;
    std::vector<uint64_t> primes = atom::algorithm::generatePrimes(limit);
    
    std::cout << "Primes up to " << limit << ": ";
    for (uint64_t prime : primes) {
        std::cout << prime << " ";
    }
    std::cout << std::endl;
    
    // Subsequent calls use cached results
    std::vector<uint64_t> cached_primes = atom::algorithm::generatePrimes(limit);
    // This call is very fast as it uses the cache
    
    return 0;
}
```

### Modular Arithmetic

#### montgomeryMultiply

```cpp
[[nodiscard]] auto montgomeryMultiply(uint64_t a, uint64_t b, uint64_t n) -> uint64_t;
```

Purpose: Performs modular multiplication using the Montgomery reduction technique.

- Parameters:
  - `a` and `b` - The operands to multiply
  - `n` - The modulus
- Return: (a * b) mod n
- Performance: Uses platform-specific optimizations

#### modPow

```cpp
[[nodiscard]] auto modPow(uint64_t base, uint64_t exponent, uint64_t modulus) -> uint64_t;
```

Purpose: Performs modular exponentiation (base^exponent mod modulus).

- Parameters:
  - `base` - The base value
  - `exponent` - The exponent
  - `modulus` - The modulus
- Return: (base^exponent) mod modulus
- Performance: Uses the Montgomery reduction technique for improved performance

#### Usage Example

```cpp
#include <atom/algorithm/math.hpp>
#include <iostream>

int main() {
    // Montgomery multiplication
    uint64_t a = 123456789ULL;
    uint64_t b = 987654321ULL;
    uint64_t n = 1000000007ULL;  // A prime modulus
    
    uint64_t result = atom::algorithm::montgomeryMultiply(a, b, n);
    std::cout << "(" << a << " * " << b << ") mod " << n << " = " << result << std::endl;
    
    // Verify the result with direct computation
    uint64_t direct = (a * b) % n;
    std::cout << "Direct computation: " << direct << std::endl;
    
    // Modular exponentiation
    uint64_t base = 2ULL;
    uint64_t exponent = 63ULL;
    uint64_t modulus = 1000000009ULL;
    
    uint64_t power = atom::algorithm::modPow(base, exponent, modulus);
    std::cout << base << "^" << exponent << " mod " << modulus << " = " << power << std::endl;
    
    return 0;
}
```

### Vector Operations

#### parallelVectorAdd

```cpp
template <Arithmetic T>
[[nodiscard]] auto parallelVectorAdd(std::span<const T> a, std::span<const T> b) -> std::vector<T>;
```

Purpose: Performs element-wise addition of two vectors, using parallelism for large inputs.

- Template Parameters: `T` - Any arithmetic type (integer or floating-point)
- Parameters:
  - `a` and `b` - Input vectors (as spans)
- Return: Vector containing the element-wise sums
- Performance: Uses SIMD and multithreading for large inputs
- Requirements: Input vectors must have the same size

#### parallelVectorMul

```cpp
template <Arithmetic T>
[[nodiscard]] auto parallelVectorMul(std::span<const T> a, std::span<const T> b) -> std::vector<T>;
```

Purpose: Performs element-wise multiplication of two vectors, using parallelism for large inputs.

- Template Parameters: `T` - Any arithmetic type (integer or floating-point)
- Parameters:
  - `a` and `b` - Input vectors (as spans)
- Return: Vector containing the element-wise products
- Performance: Uses SIMD and multithreading for large inputs
- Requirements: Input vectors must have the same size

#### Usage Example

```cpp
#include <atom/algorithm/math.hpp>
#include <iostream>
#include <vector>

int main() {
    // Create test vectors
    std::vector<int> vec1 = {1, 2, 3, 4, 5, 6, 7, 8};
    std::vector<int> vec2 = {8, 7, 6, 5, 4, 3, 2, 1};
    
    // Parallel vector addition
    std::vector<int> sum = atom::algorithm::parallelVectorAdd(vec1, vec2);
    
    std::cout << "Vector addition result: ";
    for (int val : sum) {
        std::cout << val << " ";  // Expected: 9 9 9 9 9 9 9 9
    }
    std::cout << std::endl;
    
    // Parallel vector multiplication
    std::vector<int> product = atom::algorithm::parallelVectorMul(vec1, vec2);
    
    std::cout << "Vector multiplication result: ";
    for (int val : product) {
        std::cout << val << " ";  // Expected: 8 14 18 20 20 18 14 8
    }
    std::cout << std::endl;
    
    // Example with larger vectors to demonstrate parallelism benefits
    std::vector<double> large_vec1(100000, 1.5);
    std::vector<double> large_vec2(100000, 2.5);
    
    // These operations will automatically use parallelism due to size
    auto large_sum = atom::algorithm::parallelVectorAdd(large_vec1, large_vec2);
    auto large_product = atom::algorithm::parallelVectorMul(large_vec1, large_vec2);
    
    std::cout << "Large vector addition first 5 results: ";
    for (int i = 0; i < 5; ++i) {
        std::cout << large_sum[i] << " ";  // Expected: 4.0 4.0 4.0 4.0 4.0
    }
    std::cout << std::endl;
    
    std::cout << "Large vector multiplication first 5 results: ";
    for (int i = 0; i < 5; ++i) {
        std::cout << large_product[i] << " ";  // Expected: 3.75 3.75 3.75 3.75 3.75
    }
    std::cout << std::endl;
    
    return 0;
}
```

### Miscellaneous Functions

#### fastPow

```cpp
template <std::integral T>
[[nodiscard]] constexpr auto fastPow(T base, T exponent) noexcept -> T;
```

Purpose: Performs fast exponentiation for integral types.

- Template Parameters: `T` - Any integral type
- Parameters:
  - `base` - The base value
  - `exponent` - The exponent value
- Return: base^exponent
- Performance: Uses binary exponentiation algorithm (O(log n))

#### secureRandom

```cpp
[[nodiscard]] auto secureRandom() noexcept -> std::optional<uint64_t>;
```

Purpose: Generates a cryptographically secure random number.

- Return: An optional containing the random value, or nullopt if generation failed
- Performance: Uses the platform's secure random number generator

#### randomInRange

```cpp
[[nodiscard]] auto randomInRange(uint64_t min, uint64_t max) noexcept -> std::optional<uint64_t>;
```

Purpose: Generates a random number in the specified range.

- Parameters:
  - `min` - Minimum value (inclusive)
  - `max` - Maximum value (inclusive)
- Return: An optional containing the random value, or nullopt if generation failed
- Requirements: min <= max

#### Usage Example

```cpp
#include <atom/algorithm/math.hpp>
#include <iostream>

int main() {
    // Fast exponentiation
    int base = 2;
    int exp = 10;
    int result = atom::algorithm::fastPow(base, exp);
    std::cout << base << "^" << exp << " = " << result << std::endl;  // 2^10 = 1024
    
    // Secure random number generation
    auto random_opt = atom::algorithm::secureRandom();
    if (random_opt) {
        std::cout << "Secure random number: " << *random_opt << std::endl;
    } else {
        std::cout << "Failed to generate secure random number" << std::endl;
    }
    
    // Random number in range
    auto range_random_opt = atom::algorithm::randomInRange(1, 100);
    if (range_random_opt) {
        std::cout << "Random number between 1 and 100: " << *range_random_opt << std::endl;
    } else {
        std::cout << "Failed to generate random number in range" << std::endl;
    }
    
    return 0;
}
```

### Memory Management

#### MathMemoryPool

```cpp
class MathMemoryPool {
public:
    static MathMemoryPool& getInstance() noexcept;
    [[nodiscard]] void* allocate(size_t size);
    void deallocate(void* ptr, size_t size) noexcept;
private:
    // Implementation details...
};
```

Purpose: A singleton class that provides a specialized memory pool for efficient allocation in mathematical operations.

- Performance: Reduces allocation overhead for frequently used small allocations
- Thread safety: All methods are thread-safe

#### MathAllocator

```cpp
template <typename T>
class MathAllocator {
public:
    using value_type = T;
    MathAllocator() noexcept = default;
    template <typename U> MathAllocator(const MathAllocator<U>&) noexcept {}
    [[nodiscard]] T* allocate(std::size_t n);
    void deallocate(T* p, std::size_t n) noexcept;
    // Comparison operators...
};
```

Purpose: A custom allocator that uses `MathMemoryPool` for efficient memory allocation.

- Template Parameters: `T` - Type to allocate
- Performance: Uses the specialized memory pool to reduce allocation overhead
- Compatibility: Can be used with standard containers

#### Usage Example

```cpp
#include <atom/algorithm/math.hpp>
#include <iostream>
#include <vector>
#include <list>

int main() {
    // Using MathAllocator with standard containers
    std::vector<int, atom::algorithm::MathAllocator<int>> vec;
    
    // Add elements
    for (int i = 0; i < 1000; ++i) {
        vec.push_back(i);
    }
    
    std::cout << "Vector size: " << vec.size() << std::endl;
    
    // Using MathAllocator with a different container
    std::list<double, atom::algorithm::MathAllocator<double>> list;
    
    for (int i = 0; i < 100; ++i) {
        list.push_back(i * 1.5);
    }
    
    std::cout << "List size: " << list.size() << std::endl;
    
    // Direct use of MathMemoryPool is also possible but less common
    auto& pool = atom::algorithm::MathMemoryPool::getInstance();
    
    // Allocate memory for 10 integers
    int* mem = static_cast<int*>(pool.allocate(10 * sizeof(int)));
    
    // Use the memory
    for (int i = 0; i < 10; ++i) {
        mem[i] = i * 2;
    }
    
    // Print the values
    std::cout << "Memory pool values: ";
    for (int i = 0; i < 10; ++i) {
        std::cout << mem[i] << " ";
    }
    std::cout << std::endl;
    
    // Don't forget to deallocate
    pool.deallocate(mem, 10 * sizeof(int));
    
    return 0;
}
```

## Performance Considerations

1. Caching Strategy
   - The `MathCache` class uses a thread-safe caching mechanism to avoid recalculating expensive results
   - Prime number generation uses this cache extensively to improve performance on repeated calls

2. SIMD Optimizations
   - Functions like `parallelVectorAdd`, `parallelVectorMul`, and `approximateSqrt` use SIMD instructions when available
   - These optimizations significantly improve performance for large data sets

3. Memory Management
   - `MathMemoryPool` and `MathAllocator` provide specialized memory management to reduce allocation overhead
   - These are particularly beneficial for algorithms that make many small allocations

4. Algorithm Selection
   - The library automatically selects between sequential and parallel implementations based on input size
   - For small inputs, it avoids the overhead of parallelism

5. Compile-Time Evaluation
   - Many functions are marked `constexpr` to allow compile-time evaluation when possible
   - This eliminates runtime costs for computations with constant inputs

## Best Practices and Common Pitfalls

### Best Practices

1. Use Safe Arithmetic Operations
   - Always use `safeAdd`, `safeSub`, `safeMul`, and `safeDiv` when dealing with values that might cause overflow or underflow
   - Handle exceptions appropriately

2. Leverage Caching for Repeated Operations
   - For repeated prime number operations, rely on the caching mechanism
   - Avoid clearing the cache unnecessarily

3. Choose the Right Data Structures
   - Use `std::span` for function parameters to avoid copying large vectors
   - Consider using containers with `MathAllocator` for mathematical operations

4. Error Handling
   - Check the return value of `secureRandom()` and `randomInRange()` as they return `std::optional`
   - Use proper exception handling for safe arithmetic functions

### Common Pitfalls

1. Ignoring Overflow/Underflow Risks
   - Pitfall: Assuming regular arithmetic operations are safe for large numbers
   - Solution: Always use safe arithmetic functions when working with values near the limits of the data type

2. Thread Safety Issues
   - Pitfall: Assuming all functions are thread-safe
   - Solution: Note that while caching and memory pool operations are thread-safe, individual mathematical functions generally are not

3. Performance Bottlenecks
   - Pitfall: Using high-level functions for small inputs where overhead exceeds benefits
   - Solution: For very small vectors, consider using direct operations instead of the parallel functions

4. Memory Management
   - Pitfall: Memory leaks when directly using `MathMemoryPool`
   - Solution: Always match `allocate()` with `deallocate()` or use `MathAllocator` with standard containers

## Required Headers and Dependencies

### Required Headers

```cpp
#include <concepts>      // For template constraints
#include <cstdint>       // For fixed-width integers
#include <memory>        // For std::shared_ptr
#include <optional>      // For std::optional
#include <shared_mutex>  // For thread-safe caching
#include <span>          // For non-owning views of sequences
#include <unordered_map> // For cache implementation
#include <vector>        // For return values and storage
```

### External Dependencies

1. C++20 Standard Library
   - The library requires C++20 support for features like concepts and std::span
   - Some functions optionally use C++20 bit manipulation functions when available

2. SIMD Instructions
   - For optimal performance, the CPU should support SSE2, AVX, or equivalent instructions
   - The library includes fallbacks for platforms without SIMD support

## Platform/Compiler-Specific Notes

1. Compiler Support
   - GCC: Requires version 10 or later for full C++20 support
   - Clang: Requires version 10 or later
   - MSVC: Requires Visual Studio 2019 version 16.8 or later

2. Optimization Levels
   - Compile with at least `-O2` (or equivalent) to enable compiler optimizations
   - For maximum performance, use `-O3` and enable architecture-specific optimizations

3. Platform-Specific Optimizations
   - x86/x64: Uses SSE2/AVX when available
   - ARM: Uses NEON instructions on supported platforms
   - WebAssembly: Limited SIMD support based on browser capabilities

4. Thread Safety
   - All caching and memory management classes are thread-safe
   - Individual algorithm functions are not guaranteed to be thread-safe unless explicitly stated

## Comprehensive Example

The following example demonstrates many of the library's features working together:

```cpp
#include <atom/algorithm/math.hpp>
#include <iostream>
#include <vector>
#include <iomanip>
#include <stdexcept>

// Custom type that uses the math allocator
template <typename T>
using MathVector = std::vector<T, atom::algorithm::MathAllocator<T>>;

// Function to find primes in a range and check if they are Mersenne primes
void findMersennePrimes(uint64_t limit) {
    std::cout << "Finding Mersenne primes (primes of form 2^n - 1) up to " << limit << std::endl;
    
    // Get vector of all primes up to limit
    auto primes = atom::algorithm::generatePrimes(limit);
    
    std::cout << "Found " << primes.size() << " prime numbers up to " << limit << std::endl;
    
    MathVector<uint64_t> mersenneCandidates;
    
    // Check for each n if 2^n - 1 is prime
    for (uint64_t n = 2; n < 64; ++n) {
        try {
            // Calculate 2^n - 1 safely
            uint64_t candidatePrime = atom::algorithm::safeSub(
                atom::algorithm::fastPow(static_cast<uint64_t>(2), n),
                static_cast<uint64_t>(1)
            );
            
            // Skip if beyond our limit
            if (candidatePrime > limit) break;
            
            // Check if this is a prime number
            if (atom::algorithm::isPrime(candidatePrime)) {
                mersenneCandidates.push_back(candidatePrime);
            }
        } catch (const std::exception& e) {
            std::cout << "Calculation stopped at n=" << n << ": " << e.what() << std::endl;
            break;
        }
    }
    
    // Print results
    std::cout << "\nMersenne primes up to " << limit << ":" << std::endl;
    std::cout << std::setw(10) << "n" << std::setw(25) << "Mersenne Prime (2^n-1)" << std::endl;
    std::cout << std::string(35, '-') << std::endl;
    
    for (uint64_t prime : mersenneCandidates) {
        // Find n where 2^n - 1 = prime
        uint64_t n = 0;
        uint64_t power = 1;
        while (power <= prime) {
            power *= 2;
            n++;
        }
        n--; // Adjust since we went one too far
        
        std::cout << std::setw(10) << n << std::setw(25) << prime << std::endl;
    }
}

// Function to demonstrate modular exponentiation with large numbers
void demonstrateModPow() {
    std::cout << "\nDemonstrating modular exponentiation:" << std::endl;
    
    const uint64_t base = 2;
    const uint64_t modulus = 1000000007; // A prime number
    
    std::cout << "Calculating powers of " << base << " modulo " << modulus << std::endl;
    
    MathVector<uint64_t> results;
    
    // Calculate 2^1, 2^2, 2^4, 2^8, ..., 2^512 (mod m)
    for (uint64_t i = 1; i <= 512; i *= 2) {
        uint64_t result = atom::algorithm::modPow(base, i, modulus);
        results.push_back(result);
    }
    
    std::cout << std::setw(10) << "Exponent" << std::setw(20) << "Result (mod " << modulus << ")" << std::endl;
    std::cout << std::string(30, '-') << std::endl;
    
    uint64_t exp = 1;
    for (uint64_t result : results) {
        std::cout << std::setw(10) << exp << std::setw(20) << result << std::endl;
        exp *= 2;
    }
}

// Function to demonstrate vector operations
void demonstrateVectorOps() {
    std::cout << "\nDemonstrating vector operations:" << std::endl;
    
    // Create two vectors with the Fibonacci sequence
    MathVector<uint64_t> fibonacci1;
    MathVector<uint64_t> fibonacci2;
    
    uint64_t a = 0, b = 1;
    for (int i = 0; i < 20; ++i) {
        fibonacci1.push_back(a);
        uint64_t next = atom::algorithm::safeAdd(a, b);
        a = b;
        b = next;
    }
    
    a = 1, b = 1;
    for (int i = 0; i < 20; ++i) {
        fibonacci2.push_back(a);
        uint64_t next = atom::algorithm::safeAdd(a, b);
        a = b;
        b = next;
    }
    
    // Perform parallel vector addition
    std::vector<uint64_t> sum = atom::algorithm::parallelVectorAdd(fibonacci1, fibonacci2);
    
    // Perform parallel vector multiplication
    std::vector<uint64_t> product = atom::algorithm::parallelVectorMul(fibonacci1, fibonacci2);
    
    // Print results
    std::cout << std::setw(5) << "Index" << std::setw(15) << "Fibonacci1" 
              << std::setw(15) << "Fibonacci2" << std::setw(15) << "Sum" 
              << std::setw(20) << "Product" << std::endl;
    std::cout << std::string(70, '-') << std::endl;
    
    for (size_t i = 0; i < 20; ++i) {
        std::cout << std::setw(5) << i << std::setw(15) << fibonacci1[i] 
                  << std::setw(15) << fibonacci2[i] << std::setw(15) << sum[i] 
                  << std::setw(20) << product[i] << std::endl;
    }
}

// Main function to run all demos
int main() {
    try {
        std::cout << "===============================================" << std::endl;
        std::cout << "        ATOM ALGORITHM MATH LIBRARY DEMO       " << std::endl;
        std::cout << "===============================================" << std::endl;
        
        // Find Mersenne primes up to 10,000
        findMersennePrimes(10000);
        
        // Demonstrate modular exponentiation
        demonstrateModPow();
        
        // Demonstrate vector operations
        demonstrateVectorOps();
        
        // Clean up any cached resources
        atom::algorithm::MathCache::getInstance().clear();
        
        std::cout << "\nAll demonstrations completed successfully!" << std::endl;
        
    } catch (const std::exception& e) {
        std::cerr << "ERROR: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
```

This example demonstrates:

1. Using the `MathAllocator` with standard containers
2. Finding Mersenne primes using prime generation and primality testing
3. Safe arithmetic operations with overflow protection
4. Modular exponentiation with large numbers
5. Parallel vector operations on Fibonacci sequences
6. Proper cleanup of cached resources

When run, this program will output information about Mersenne primes, demonstrate modular arithmetic, and show the results of vector operations on Fibonacci sequences.
