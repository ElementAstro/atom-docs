---
title: WeightSelector
description: Detailed for the WeightSelector class in the atom::algorithm namespace, including constructors, member functions, selection strategies, and usage examples.
---

## Overview

The `atom::algorithm::WeightSelector` class provides a **comprehensive framework for weighted random selection** from a collection of items. This thread-safe implementation supports various selection strategies, batch operations, and extensive utility methods for weight management.

## Core Concepts

### WeightType Concept

```cpp
template <typename T>
concept WeightType = std::floating_point<T> || std::integral<T>;
```

The `WeightType` concept ensures that only **appropriate numeric types** (floating-point or integral) can be used for weights.

### WeightError Exception

```cpp
class WeightError : public std::runtime_error
```

A custom exception class that provides **detailed error information** for weight-related errors, including source location context.

## Selection Strategies

The `WeightSelector` class offers multiple selection strategies through the `SelectionStrategy` interface:

### DefaultSelectionStrategy

**Purpose**: Standard weight selection with uniform probability distribution.

**Behavior**: Each item's probability of selection is **directly proportional to its weight**. This is the default strategy when none is specified.

### BottomHeavySelectionStrategy

**Purpose**: Selection strategy that favors lower indices.

**Behavior**: Uses a **square root distribution** which gives relatively more probability to lower-weighted items compared to the default strategy.

### RandomSelectionStrategy

**Purpose**: Completely random selection without considering weights.

**Behavior**: Each item has an **equal probability** of being selected, regardless of its weight.

### TopHeavySelectionStrategy

**Purpose**: Selection strategy that favors higher indices.

**Behavior**: Uses a **squared distribution** which gives relatively more probability to higher-weighted items.

### PowerLawSelectionStrategy

**Purpose**: Custom power-law distribution selection strategy.

**Behavior**: Allows **fine-tuning of selection bias** through a customizable exponent parameter.

## WeightedRandomSampler

A utility class for **batch sampling** with or without replacement:

- `sample()`: Sample multiple indices according to weights (with replacement)
- `sampleUnique()`: Sample unique indices (without replacement)

## Constructor Options

```cpp
// Basic constructor with weights
explicit WeightSelector(std::span<const T> input_weights, 
                       std::unique_ptr<SelectionStrategy> custom_strategy = 
                           std::make_unique<DefaultSelectionStrategy>());

// Constructor with weights and seed
WeightSelector(std::span<const T> input_weights, uint32_t seed,
               std::unique_ptr<SelectionStrategy> custom_strategy = 
                   std::make_unique<DefaultSelectionStrategy>());
```

## Core Selection Methods

### select()

```cpp
[[nodiscard]] auto select() const -> size_t;
```

**Purpose**: Selects a single index based on weights using the current strategy.

**Returns**: The selected index.

**Exceptions**: Throws `WeightError` if total weight is zero or negative, or if weights are empty.

**Usage Example**:

```cpp
size_t selected_index = weight_selector.select();
```

### selectMultiple()

```cpp
[[nodiscard]] auto selectMultiple(size_t n) const -> std::vector<size_t>;
```

**Purpose**: Selects multiple indices based on weights (with replacement).

**Parameters**:

- `n`: Number of selections to make

**Returns**: Vector of selected indices.

**Usage Example**:

```cpp
std::vector<size_t> indices = weight_selector.selectMultiple(5);
```

### selectUniqueMultiple()

```cpp
[[nodiscard]] auto selectUniqueMultiple(size_t n) const -> std::vector<size_t>;
```

**Purpose**: Selects multiple unique indices (without replacement).

**Parameters**:

- `n`: Number of unique selections to make

**Returns**: Vector of unique selected indices.

**Exceptions**: Throws `WeightError` if n > number of weights.

**Usage Example**:

```cpp
std::vector<size_t> unique_indices = weight_selector.selectUniqueMultiple(3);
```

## Weight Management Methods

### updateWeight()

```cpp
void updateWeight(size_t index, T new_weight);
```

**Purpose**: Updates a single weight.

**Parameters**:

- `index`: Index of the weight to update
- `new_weight`: New weight value

**Exceptions**:

- `std::out_of_range` if index is out of bounds
- `WeightError` if new_weight is negative

**Usage Example**:

```cpp
weight_selector.updateWeight(2, 5.0);
```

### addWeight()

```cpp
void addWeight(T new_weight);
```

**Purpose**: Adds a new weight to the collection.

**Parameters**:

- `new_weight`: Weight to add

**Exceptions**:

- `WeightError` if new_weight is negative

**Usage Example**:

```cpp
weight_selector.addWeight(3.5);
```

### removeWeight()

```cpp
void removeWeight(size_t index);
```

**Purpose**: Removes a weight at the specified index.

**Parameters**:

- `index`: Index of the weight to remove

**Exceptions**:

- `std::out_of_range` if index is out of bounds

**Usage Example**:

```cpp
weight_selector.removeWeight(1);
```

### normalizeWeights()

```cpp
void normalizeWeights();
```

**Purpose**: Normalizes weights so they sum to 1.0.

**Exceptions**:

- `WeightError` if all weights are zero

**Usage Example**:

```cpp
weight_selector.normalizeWeights();
```

### applyFunctionToWeights()

```cpp
template <std::invocable<T> F>
void applyFunctionToWeights(F&& func);
```

**Purpose**: Applies a function to all weights.

**Parameters**:

- `func`: Function that takes and returns a weight value

**Exceptions**:

- `WeightError` if resulting weights are negative

**Usage Example**:

```cpp
weight_selector.applyFunctionToWeights([](double w) { return w * 2.0; });
```

### batchUpdateWeights()

```cpp
void batchUpdateWeights(const std::vector<std::pair<size_t, T>>& updates);
```

**Purpose**: Updates multiple weights in a single operation.

**Parameters**:

- `updates`: Vector of (index, new_weight) pairs

**Exceptions**:

- `std::out_of_range` if any index is out of bounds
- `WeightError` if any new weight is negative

**Usage Example**:

```cpp
std::vector<std::pair<size_t, double>> updates = {{0, 1.0}, {2, 3.0}};
weight_selector.batchUpdateWeights(updates);
```

### resetWeights()

```cpp
void resetWeights(std::span<const T> new_weights);
```

**Purpose**: Replaces all weights with new values.

**Parameters**:

- `new_weights`: New weights collection

**Exceptions**:

- `WeightError` if any weight is negative

**Usage Example**:

```cpp
std::vector<double> new_weights = {1.0, 2.0, 3.0};
weight_selector.resetWeights(new_weights);
```

### scaleWeights()

```cpp
void scaleWeights(T factor);
```

**Purpose**: Multiplies all weights by a factor.

**Parameters**:

- `factor`: Scaling factor

**Exceptions**:

- `WeightError` if factor is negative

**Usage Example**:

```cpp
weight_selector.scaleWeights(2.0); // Double all weights
```

### clear()

```cpp
void clear();
```

**Purpose**: Removes all weights.

**Usage Example**:

```cpp
weight_selector.clear();
```

## Weight Query Methods

### getWeight()

```cpp
[[nodiscard]] auto getWeight(size_t index) const -> std::optional<T>;
```

**Purpose**: Gets the weight at the specified index.

**Parameters**:

- `index`: Index of the weight to retrieve

**Returns**: Optional containing the weight, or nullopt if index is out of bounds.

**Usage Example**:

```cpp
auto weight = weight_selector.getWeight(2);
if (weight) {
    std::cout << "Weight at index 2: " << *weight << std::endl;
}
```

### getMaxWeightIndex()

```cpp
[[nodiscard]] auto getMaxWeightIndex() const -> size_t;
```

**Purpose**: Gets the index of the maximum weight.

**Returns**: Index of the maximum weight.

**Exceptions**:

- `WeightError` if weights collection is empty

**Usage Example**:

```cpp
size_t max_index = weight_selector.getMaxWeightIndex();
```

### getMinWeightIndex()

```cpp
[[nodiscard]] auto getMinWeightIndex() const -> size_t;
```

**Purpose**: Gets the index of the minimum weight.

**Returns**: Index of the minimum weight.

**Exceptions**:

- `WeightError` if weights collection is empty

**Usage Example**:

```cpp
size_t min_index = weight_selector.getMinWeightIndex();
```

### size()

```cpp
[[nodiscard]] auto size() const -> size_t;
```

**Purpose**: Gets the number of weights.

**Returns**: Number of weights.

**Usage Example**:

```cpp
size_t count = weight_selector.size();
```

### getWeights()

```cpp
[[nodiscard]] auto getWeights() const -> std::vector<T>;
```

**Purpose**: Gets a copy of all weights.

**Returns**: Vector containing all weights.

**Usage Example**:

```cpp
std::vector<double> all_weights = weight_selector.getWeights();
```

### getTotalWeight()

```cpp
[[nodiscard]] auto getTotalWeight() const -> T;
```

**Purpose**: Gets the sum of all weights.

**Returns**: Total weight.

**Usage Example**:

```cpp
double total = weight_selector.getTotalWeight();
```

### getAverageWeight()

```cpp
[[nodiscard]] auto getAverageWeight() const -> T;
```

**Purpose**: Calculates the average of all weights.

**Returns**: Average weight.

**Exceptions**:

- `WeightError` if weights collection is empty

**Usage Example**:

```cpp
double avg = weight_selector.getAverageWeight();
```

### getMaxWeight()

```cpp
[[nodiscard]] auto getMaxWeight() const -> T;
```

**Purpose**: Gets the maximum weight value.

**Returns**: Maximum weight value.

**Exceptions**:

- `WeightError` if weights collection is empty

**Usage Example**:

```cpp
double max_weight = weight_selector.getMaxWeight();
```

### getMinWeight()

```cpp
[[nodiscard]] auto getMinWeight() const -> T;
```

**Purpose**: Gets the minimum weight value.

**Returns**: Minimum weight value.

**Exceptions**:

- `WeightError` if weights collection is empty

**Usage Example**:

```cpp
double min_weight = weight_selector.getMinWeight();
```

### empty()

```cpp
[[nodiscard]] auto empty() const -> bool;
```

**Purpose**: Checks if the weights collection is empty.

**Returns**: True if empty, false otherwise.

**Usage Example**:

```cpp
if (weight_selector.empty()) {
    std::cout << "No weights are present" << std::endl;
}
```

### findIndices()

```cpp
template <std::predicate<T> P>
[[nodiscard]] auto findIndices(P&& predicate) const -> std::vector<size_t>;
```

**Purpose**: Finds indices of weights matching a predicate.

**Parameters**:

- `predicate`: Function that takes a weight and returns a boolean

**Returns**: Vector of indices where predicate returns true.

**Usage Example**:

```cpp
auto indices = weight_selector.findIndices([](double w) { return w > 5.0; });
```

## Utility Methods

### printWeights()

```cpp
void printWeights(std::ostream& oss) const;
```

**Purpose**: Prints weights to the provided output stream.

**Parameters**:

- `oss`: Output stream

**Usage Example**:

```cpp
weight_selector.printWeights(std::cout);
```

### setSeed()

```cpp
void setSeed(uint32_t seed);
```

**Purpose**: Sets the random seed for selection strategies.

**Parameters**:

- `seed`: The new seed value

**Usage Example**:

```cpp
weight_selector.setSeed(42);
```

### reserve()

```cpp
void reserve(size_t capacity);
```

**Purpose**: Reserves memory for weights.

**Parameters**:

- `capacity`: New capacity

**Usage Example**:

```cpp
weight_selector.reserve(100);
```

### setSelectionStrategy()

```cpp
void setSelectionStrategy(std::unique_ptr<SelectionStrategy> new_strategy);
```

**Purpose**: Sets a new selection strategy.

**Parameters**:

- `new_strategy`: The new selection strategy to use

**Usage Example**:

```cpp
weight_selector.setSelectionStrategy(
    std::make_unique<TopHeavySelectionStrategy>());
```

## Thread Safety

The `WeightSelector` class is **designed to be thread-safe**. It uses `std::shared_mutex` to allow:

- **Multiple readers**: Concurrent read operations are permitted
- **Exclusive writers**: Write operations block other reads and writes

All public methods acquire the appropriate lock type based on whether they modify the weights collection.

## Complete Example

Here's a comprehensive example demonstrating the main features of the `WeightSelector` class:

```cpp
#include <iostream>
#include <vector>
#include "atom/algorithm/weight.hpp"

int main() {
    // Initialize with weights
    std::vector<double> weights = {10.0, 20.0, 30.0, 15.0, 25.0};
    atom::algorithm::WeightSelector<double> selector(weights);
    
    std::cout << "Initial weights:" << std::endl;
    selector.printWeights(std::cout);
    
    // Basic selection
    std::cout << "\nSelecting a single index:" << std::endl;
    for (int i = 0; i < 5; i++) {
        size_t index = selector.select();
        std::cout << "Selected index: " << index 
                  << " (weight: " << *selector.getWeight(index) << ")" << std::endl;
    }
    
    // Multiple selections
    std::cout << "\nSelecting multiple indices:" << std::endl;
    auto multiple = selector.selectMultiple(3);
    std::cout << "Selected indices: ";
    for (auto idx : multiple) {
        std::cout << idx << " ";
    }
    std::cout << std::endl;
    
    // Unique selections
    std::cout << "\nSelecting unique indices:" << std::endl;
    auto unique = selector.selectUniqueMultiple(3);
    std::cout << "Selected unique indices: ";
    for (auto idx : unique) {
        std::cout << idx << " ";
    }
    std::cout << std::endl;
    
    // Modify weights
    std::cout << "\nModifying weights:" << std::endl;
    selector.updateWeight(0, 50.0);
    selector.addWeight(5.0);
    selector.printWeights(std::cout);
    
    // Change selection strategy
    std::cout << "\nChanging to TopHeavySelectionStrategy:" << std::endl;
    selector.setSelectionStrategy(
        std::make_unique<atom::algorithm::WeightSelector<double>::TopHeavySelectionStrategy>());
    
    for (int i = 0; i < 5; i++) {
        size_t index = selector.select();
        std::cout << "Selected index: " << index 
                  << " (weight: " << *selector.getWeight(index) << ")" << std::endl;
    }
    
    // Get weight statistics
    std::cout << "\nWeight statistics:" << std::endl;
    std::cout << "Total weight: " << selector.getTotalWeight() << std::endl;
    std::cout << "Average weight: " << selector.getAverageWeight() << std::endl;
    std::cout << "Max weight: " << selector.getMaxWeight() 
              << " at index " << selector.getMaxWeightIndex() << std::endl;
    std::cout << "Min weight: " << selector.getMinWeight() 
              << " at index " << selector.getMinWeightIndex() << std::endl;
    
    // Normalize weights
    std::cout << "\nNormalizing weights:" << std::endl;
    selector.normalizeWeights();
    selector.printWeights(std::cout);
    
    // Apply function to all weights
    std::cout << "\nDoubling all weights:" << std::endl;
    selector.applyFunctionToWeights([](double w) { return w * 2.0; });
    selector.printWeights(std::cout);
    
    // Batch update
    std::cout << "\nBatch updating weights:" << std::endl;
    std::vector<std::pair<size_t, double>> updates = {{0, 0.1}, {2, 0.3}};
    selector.batchUpdateWeights(updates);
    selector.printWeights(std::cout);
    
    // Find indices of weights meeting a condition
    std::cout << "\nFinding indices where weight > 0.2:" << std::endl;
    auto matching = selector.findIndices([](double w) { return w > 0.2; });
    for (auto idx : matching) {
        std::cout << "Index " << idx << ": " << *selector.getWeight(idx) << std::endl;
    }
    
    return 0;
}
```

## Power Law Selection Example

Here's a specific example demonstrating the `PowerLawSelectionStrategy`:

```cpp
#include <iostream>
#include <vector>
#include <map>
#include "atom/algorithm/weight.hpp"

int main() {
    // Create uniform weights
    std::vector<double> weights(10, 1.0);
    
    // Create a selector with PowerLawSelectionStrategy
    auto power_strategy = std::make_unique<
        atom::algorithm::WeightSelector<double>::PowerLawSelectionStrategy>(3.0);
    atom::algorithm::WeightSelector<double> selector(weights, std::move(power_strategy));
    
    // Run many selections and count frequencies
    std::map<size_t, int> frequencies;
    const int trials = 10000;
    
    for (int i = 0; i < trials; i++) {
        size_t selected = selector.select();
        frequencies[selected]++;
    }
    
    // Print distribution
    std::cout << "Power Law selection distribution (exponent=3.0):" << std::endl;
    for (const auto& [index, count] : frequencies) {
        double percentage = (count * 100.0) / trials;
        std::cout << "Index " << index << ": " 
                  << std::string(percentage/2, '*') << " "
                  << percentage << "%" << std::endl;
    }
    
    return 0;
}
```

This documentation provides a comprehensive overview of the `WeightSelector` class and its capabilities for weighted random selection with various strategies.
