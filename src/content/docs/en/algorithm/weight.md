---
title: WeightSelector
description: Detailed for the WeightSelector class in the atom::algorithm namespace, including constructors, member functions, selection strategies, and usage examples.
---

## **Purpose and High-Level Overview**

The Atom Weighted Selection Library provides a robust implementation for **weighted random selection** - a technique where items are selected with probabilities proportional to their assigned weights. This header-only C++ library offers thread-safe operations, multiple selection strategies, and comprehensive weight manipulation functionality.

**Key features:**

- **Thread-safe** weighted selection with read-write locks
- **Multiple selection strategies** (uniform, bottom-heavy, top-heavy, power-law, random)
- Support for **sampling with and without replacement**
- **Comprehensive weight manipulation** (updating, scaling, normalizing)
- **Template-based implementation** supporting any numeric type
- Optional **Boost integration** for enhanced performance
- Rich set of **utility functions** for statistics and weight analysis

## **Detailed Class and Function Documentation**

### **WeightType Concept**

```cpp
template <typename T>
concept WeightType = std::floating_point<T> || std::integral<T>;
```

Defines numeric types that can be used for weights, requiring either floating-point or integral types.

### **WeightError Exception Class**

```cpp
class WeightError : public std::runtime_error {
public:
    explicit WeightError(
        const std::string& message,
        const std::source_location& loc = std::source_location::current());
};
```

A specialized exception class for weight-related errors with source location tracking.

**Parameters:**

- `message`: The error message
- `loc`: Source code location where the error occurred (automatically captured)

### **WeightSelector Class**

```cpp
template <WeightType T>
class WeightSelector;
```

The core class managing weights and selection strategies.

#### **Construction & Initialization**

```cpp
explicit WeightSelector(
    std::span<const T> input_weights,
    std::unique_ptr<SelectionStrategy> custom_strategy = 
        std::make_unique<DefaultSelectionStrategy>());

WeightSelector(
    std::span<const T> input_weights, 
    uint32_t seed,
    std::unique_ptr<SelectionStrategy> custom_strategy = 
        std::make_unique<DefaultSelectionStrategy>());
```

**Parameters:**

- `input_weights`: Initial weights (must be non-negative)
- `seed`: Optional seed for random number generation
- `custom_strategy`: Optional custom selection strategy

**Exceptions:**

- `WeightError`: Thrown if weights contain negative values

#### **Selection Methods**

```cpp
[[nodiscard]] auto select() -> size_t;
```

Selects a single index based on weights using the current strategy.

**Returns:** The selected index

**Exceptions:**

- `WeightError`: Thrown if total weight is zero/negative or weights are empty

```cpp
[[nodiscard]] auto selectMultiple(size_t n) -> std::vector<size_t>;
```

Selects multiple indices based on weights (with replacement).

**Parameters:**

- `n`: Number of selections to make

**Returns:** Vector of selected indices

```cpp
[[nodiscard]] auto selectUniqueMultiple(size_t n) const -> std::vector<size_t>;
```

Selects multiple unique indices based on weights (without replacement).

**Parameters:**

- `n`: Number of unique selections to make

**Returns:** Vector of unique selected indices

**Exceptions:**

- `WeightError`: Thrown if `n` exceeds number of weights

#### **Weight Manipulation Methods**

```cpp
void updateWeight(size_t index, T new_weight);
```

Updates a single weight.

**Parameters:**

- `index`: Index of weight to update
- `new_weight`: New weight value (must be non-negative)

**Exceptions:**

- `std::out_of_range`: If index is out of bounds
- `WeightError`: If new weight is negative

```cpp
void addWeight(T new_weight);
```

Adds a new weight to the collection.

**Parameters:**

- `new_weight`: Weight to add (must be non-negative)

**Exceptions:**

- `WeightError`: If weight is negative

```cpp
void removeWeight(size_t index);
```

Removes a weight at the specified index.

**Parameters:**

- `index`: Index of weight to remove

**Exceptions:**

- `std::out_of_range`: If index is out of bounds

```cpp
void normalizeWeights();
```

Normalizes weights so they sum to 1.0.

**Exceptions:**

- `WeightError`: If all weights are zero

```cpp
template <std::invocable<T> F>
void applyFunctionToWeights(F&& func);
```

Applies a function to all weights.

**Parameters:**

- `func`: Function that takes and returns a weight value

**Exceptions:**

- `WeightError`: If resulting weights are negative

```cpp
void batchUpdateWeights(const std::vector<std::pair<size_t, T>>& updates);
```

Updates multiple weights in batch.

**Parameters:**

- `updates`: Vector of (index, new_weight) pairs

**Exceptions:**

- `std::out_of_range`: If any index is out of bounds
- `WeightError`: If any new weight is negative

```cpp
void resetWeights(std::span<const T> new_weights);
```

Replaces all weights with new values.

**Parameters:**

- `new_weights`: New weights collection

**Exceptions:**

- `WeightError`: If any weight is negative

```cpp
void scaleWeights(T factor);
```

Multiplies all weights by a factor.

**Parameters:**

- `factor`: Scaling factor (must be non-negative)

**Exceptions:**

- `WeightError`: If factor is negative

```cpp
void clear();
```

Clears all weights.

```cpp
void reserve(size_t capacity);
```

Reserves space for weights.

**Parameters:**

- `capacity`: New capacity

#### **Weight Information Methods**

```cpp
[[nodiscard]] auto getWeight(size_t index) const -> std::optional<T>;
```

Gets the weight at the specified index.

**Parameters:**

- `index`: Index of weight to retrieve

**Returns:** Optional containing the weight, or nullopt if index is out of bounds

```cpp
[[nodiscard]] auto getMaxWeightIndex() const -> size_t;
```

Gets the index of the maximum weight.

**Returns:** Index of the maximum weight

**Exceptions:**

- `WeightError`: If weights collection is empty

```cpp
[[nodiscard]] auto getMinWeightIndex() const -> size_t;
```

Gets the index of the minimum weight.

**Returns:** Index of the minimum weight

**Exceptions:**

- `WeightError`: If weights collection is empty

```cpp
[[nodiscard]] auto size() const -> size_t;
```

Gets the number of weights.

**Returns:** Number of weights

```cpp
[[nodiscard]] auto getWeights() const -> std::vector<T>;
```

Gets read-only access to the weights.

**Returns:** A copy of the weights vector

```cpp
[[nodiscard]] auto getTotalWeight() -> T;
```

Gets the sum of all weights.

**Returns:** Total weight

```cpp
[[nodiscard]] auto getAverageWeight() -> T;
```

Calculates the average of all weights.

**Returns:** Average weight

**Exceptions:**

- `WeightError`: If weights collection is empty

```cpp
[[nodiscard]] auto getMaxWeight() const -> T;
```

Gets the weight with the maximum value.

**Returns:** Maximum weight value

**Exceptions:**

- `WeightError`: If weights collection is empty

```cpp
[[nodiscard]] auto getMinWeight() const -> T;
```

Gets the weight with the minimum value.

**Returns:** Minimum weight value

**Exceptions:**

- `WeightError`: If weights collection is empty

```cpp
[[nodiscard]] auto empty() const -> bool;
```

Checks if the weights collection is empty.

**Returns:** True if empty, false otherwise

```cpp
template <std::predicate<T> P>
[[nodiscard]] auto findIndices(P&& predicate) const -> std::vector<size_t>;
```

Finds indices of weights matching a predicate.

**Parameters:**

- `predicate`: Function that takes a weight and returns a boolean

**Returns:** Vector of indices where predicate returns true

#### **Other Utility Methods**

```cpp
void printWeights(std::ostream& oss) const;
```

Prints weights to the provided output stream.

**Parameters:**

- `oss`: Output stream

```cpp
void setSeed(uint32_t seed);
```

Sets the random seed for selection strategies.

**Parameters:**

- `seed`: The new seed value

```cpp
void setSelectionStrategy(std::unique_ptr<SelectionStrategy> new_strategy);
```

Sets a new selection strategy.

**Parameters:**

- `new_strategy`: The new selection strategy to use

### **Selection Strategies**

The `WeightSelector` class provides several selection strategies to customize the distribution of selections:

#### **DefaultSelectionStrategy**

```cpp
class DefaultSelectionStrategy : public SelectionStrategy;
```

Standard weight selection with uniform probability distribution. Items are selected with probability exactly proportional to their weight.

#### **BottomHeavySelectionStrategy**

```cpp
class BottomHeavySelectionStrategy : public SelectionStrategy;
```

Selection strategy that favors lower indices using a square root distribution. This makes smaller weights more likely to be selected than with the default strategy.

#### **RandomSelectionStrategy**

```cpp
class RandomSelectionStrategy : public SelectionStrategy;
```

Completely random selection strategy that ignores weights entirely. Each item has an equal chance of selection regardless of weight.

#### **TopHeavySelectionStrategy**

```cpp
class TopHeavySelectionStrategy : public SelectionStrategy;
```

Selection strategy that favors higher indices using a squared distribution. This makes larger weights even more likely to be selected.

#### **PowerLawSelectionStrategy**

```cpp
class PowerLawSelectionStrategy : public SelectionStrategy;
```

Custom power-law distribution selection strategy. Allows configuring the distribution with a custom exponent.

**Additional Methods:**

```cpp
void setExponent(T exponent);
[[nodiscard]] auto getExponent() const noexcept -> T;
```

### **WeightedRandomSampler Class**

```cpp
class WeightedRandomSampler;
```

A utility class for batch sampling with replacement.

#### **Methods:**

```cpp
WeightedRandomSampler();
explicit WeightedRandomSampler(uint32_t seed);
```

**Constructor parameters:**

- `seed`: Optional seed for random number generation

```cpp
[[nodiscard]] auto sample(std::span<const T> weights, size_t n) const -> std::vector<size_t>;
```

Sample n indices according to their weights (with replacement).

**Parameters:**

- `weights`: The weights for each index
- `n`: Number of samples to draw

**Returns:** Vector of sampled indices

**Exceptions:**

- `WeightError`: If weights vector is empty

```cpp
[[nodiscard]] auto sampleUnique(std::span<const T> weights, size_t n) const -> std::vector<size_t>;
```

Sample n unique indices according to their weights (without replacement).

**Parameters:**

- `weights`: The weights for each index
- `n`: Number of samples to draw

**Returns:** Vector of unique sampled indices

**Exceptions:**

- `WeightError`: If n is greater than the number of weights or weights vector is empty

## **Required Headers and Dependencies**

### **Standard Library Headers**

```cpp
#include <algorithm>
#include <cassert>
#include <concepts>
#include <format>
#include <functional>
#include <memory>
#include <mutex>
#include <numeric>
#include <optional>
#include <random>
#include <shared_mutex>
#include <source_location>
#include <span>
#include <vector>
```

### **Internal Dependencies**

```cpp
#include "atom/utils/random.hpp"
```

### **Optional Boost Dependencies**

When `ATOM_USE_BOOST` is defined:

```cpp
#include <boost/format.hpp>
#include <boost/random.hpp>
#include <boost/range/algorithm.hpp>
#include <boost/range/numeric.hpp>
```

## **Usage Examples**

### **Basic Usage**

```cpp
#include <iostream>
#include <vector>
#include "atom/algorithm/weight.hpp"

int main() {
    // Create a weight selector with floating-point weights
    std::vector<double> weights = {10.0, 20.0, 5.0, 15.0, 25.0};
    atom::algorithm::WeightSelector<double> selector(weights);
    
    // Perform a single selection
    size_t selected_index = selector.select();
    std::cout << "Selected index: " << selected_index << std::endl;
    
    // Perform multiple selections (with replacement)
    std::vector<size_t> multiple_selections = selector.selectMultiple(5);
    std::cout << "Multiple selections: ";
    for (auto idx : multiple_selections) {
        std::cout << idx << " ";
    }
    std::cout << std::endl;
    
    return 0;
}
```

**Expected output:**

```
Selected index: 4  // The output will vary due to randomness, but index 4 (weight 25.0) has the highest probability
Multiple selections: 1 4 1 4 1  // Random selection with probabilities based on weights
```

### **Different Selection Strategies**

```cpp
#include <iostream>
#include <vector>
#include <memory>
#include "atom/algorithm/weight.hpp"

int main() {
    // Create weights that increase linearly
    std::vector<double> weights = {1.0, 2.0, 3.0, 4.0, 5.0};
    
    // Default strategy (uniform probability distribution)
    {
        atom::algorithm::WeightSelector<double> default_selector(weights);
        
        // Track how many times each index is selected
        std::vector<int> selection_counts(weights.size(), 0);
        for (int i = 0; i < 10000; ++i) {
            size_t selected = default_selector.select();
            selection_counts[selected]++;
        }
        
        std::cout << "Default strategy distribution: ";
        for (auto count : selection_counts) {
            std::cout << count / 100.0 << "% ";  // Convert to percentage
        }
        std::cout << std::endl;
    }
    
    // Bottom-heavy strategy (favors lower weights)
    {
        auto strategy = std::make_unique<atom::algorithm::WeightSelector<double>::BottomHeavySelectionStrategy>();
        atom::algorithm::WeightSelector<double> bottom_heavy_selector(weights, std::move(strategy));
        
        std::vector<int> selection_counts(weights.size(), 0);
        for (int i = 0; i < 10000; ++i) {
            size_t selected = bottom_heavy_selector.select();
            selection_counts[selected]++;
        }
        
        std::cout << "Bottom-heavy strategy distribution: ";
        for (auto count : selection_counts) {
            std::cout << count / 100.0 << "% ";
        }
        std::cout << std::endl;
    }
    
    // Top-heavy strategy (favors higher weights)
    {
        auto strategy = std::make_unique<atom::algorithm::WeightSelector<double>::TopHeavySelectionStrategy>();
        atom::algorithm::WeightSelector<double> top_heavy_selector(weights, std::move(strategy));
        
        std::vector<int> selection_counts(weights.size(), 0);
        for (int i = 0; i < 10000; ++i) {
            size_t selected = top_heavy_selector.select();
            selection_counts[selected]++;
        }
        
        std::cout << "Top-heavy strategy distribution: ";
        for (auto count : selection_counts) {
            std::cout << count / 100.0 << "% ";
        }
        std::cout << std::endl;
    }
    
    return 0;
}
```

**Expected output (approximate):**

```
Default strategy distribution: 6.7% 13.3% 20.0% 26.7% 33.3%  // Proportional to weights
Bottom-heavy strategy distribution: 13.4% 19.0% 22.3% 23.1% 22.2%  // More evenly distributed
Top-heavy strategy distribution: 2.8% 7.9% 15.2% 25.8% 48.3%  // Heavily favors higher weights
```

### **Sampling Without Replacement**

```cpp
#include <iostream>
#include <vector>
#include "atom/algorithm/weight.hpp"

int main() {
    std::vector<double> weights = {5.0, 10.0, 15.0, 20.0, 25.0};
    atom::algorithm::WeightSelector<double> selector(weights);
    
    // Sample 3 unique indices
    std::vector<size_t> unique_samples = selector.selectUniqueMultiple(3);
    
    std::cout << "Sampled unique indices: ";
    for (auto idx : unique_samples) {
        std::cout << idx << " ";
    }
    std::cout << std::endl;
    
    // We can also use the WeightedRandomSampler directly
    atom::algorithm::WeightSelector<double>::WeightedRandomSampler sampler(42);  // With seed 42
    
    std::vector<size_t> more_samples = sampler.sampleUnique(weights, 4);
    
    std::cout << "More unique samples: ";
    for (auto idx : more_samples) {
        std::cout << idx << " ";
    }
    std::cout << std::endl;
    
    return 0;
}
```

**Expected output:**

```
Sampled unique indices: 4 1 3  // Indices with higher weights are more likely to be selected
More unique samples: 4 3 2 0   // Different samples due to seeded randomness
```

### **Weight Manipulation**

```cpp
#include <iostream>
#include <vector>
#include <sstream>
#include "atom/algorithm/weight.hpp"

int main() {
    std::vector<double> weights = {10.0, 20.0, 30.0, 40.0, 50.0};
    atom::algorithm::WeightSelector<double> selector(weights);
    
    // Print initial weights
    std::stringstream ss;
    selector.printWeights(ss);
    std::cout << "Initial weights: " << ss.str();
    ss.str("");  // Clear stringstream
    
    // Update a weight
    selector.updateWeight(2, 60.0);  // Index 2 now has weight 60.0
    selector.printWeights(ss);
    std::cout << "After updating index 2: " << ss.str();
    ss.str("");
    
    // Normalize weights
    selector.normalizeWeights();
    selector.printWeights(ss);
    std::cout << "After normalization: " << ss.str();
    ss.str("");
    
    // Apply a function to all weights (double them)
    selector.applyFunctionToWeights([](double w) { return w * 2.0; });
    selector.printWeights(ss);
    std::cout << "After doubling all weights: " << ss.str();
    ss.str("");
    
    // Batch update weights
    std::vector<std::pair<size_t, double>> updates = {
        {0, 0.1}, {3, 0.2}, {4, 0.3}
    };
    selector.batchUpdateWeights(updates);
    selector.printWeights(ss);
    std::cout << "After batch update: " << ss.str();
    
    return 0;
}
```

**Expected output:**

```
Initial weights: [10.00, 20.00, 30.00, 40.00, 50.00]
After updating index 2: [10.00, 20.00, 60.00, 40.00, 50.00]
After normalization: [0.06, 0.11, 0.33, 0.22, 0.28]
After doubling all weights: [0.11, 0.22, 0.67, 0.44, 0.56]
After batch update: [0.10, 0.22, 0.67, 0.20, 0.30]
```

### **Thread-Safe Operations**

```cpp
#include <iostream>
#include <vector>
#include <thread>
#include <atomic>
#include "atom/algorithm/weight.hpp"

int main() {
    std::vector<double> weights = {10.0, 20.0, 30.0, 40.0, 50.0};
    atom::algorithm::WeightSelector<double> selector(weights);
    
    // Create counters for each index
    std::vector<std::atomic<int>> selection_counts(weights.size());
    for (auto& count : selection_counts) {
        count = 0;
    }
    
    // Create multiple threads that perform selections
    constexpr int NUM_THREADS = 4;
    constexpr int SELECTIONS_PER_THREAD = 10000;
    
    std::vector<std::thread> threads;
    for (int t = 0; t < NUM_THREADS; ++t) {
        threads.emplace_back([&selector, &selection_counts]() {
            for (int i = 0; i < SELECTIONS_PER_THREAD; ++i) {
                size_t selected = selector.select();
                selection_counts[selected]++;
                
                // Occasionally modify weights (thread-safe)
                if (i % 1000 == 0) {
                    double new_weight = static_cast<double>(rand() % 100);
                    size_t index = rand() % selection_counts.size();
                    selector.updateWeight(index, new_weight);
                }
            }
        });
    }
    
    // Wait for all threads to complete
    for (auto& thread : threads) {
        thread.join();
    }
    
    // Print the selection distribution
    std::cout << "Selection counts after " << NUM_THREADS * SELECTIONS_PER_THREAD 
              << " concurrent selections:\n";
    for (size_t i = 0; i < selection_counts.size(); ++i) {
        std::cout << "Index " << i << ": " << selection_counts[i] << std::endl;
    }
    
    return 0;
}
```

**Expected output (will vary):**

```
Selection counts after 40000 concurrent selections:
Index 0: 5824
Index 1: 8042
Index 2: 8361
Index 3: 8196
Index 4: 9577
```

## **Performance Considerations and Implementation Notes**

### **Algorithmic Details**

1. **Selection Algorithm**:
   - Uses the cumulative weights and binary search (`upper_bound`) for selection
   - Time complexity: O(log n) per selection where n is the number of weights

2. **Sampling Without Replacement**:
   - For small sample sizes (< 25% of population): Uses rejection sampling
   - For larger sample sizes: Uses a modified weighted reservoir sampling algorithm
   - Adapts automatically to the most efficient approach based on sample size

3. **Thread Safety**:
   - Uses `std::shared_mutex` for reader-writer lock pattern
   - Multiple concurrent selections can occur simultaneously
   - Weight modifications use exclusive locks

### **Performance Optimizations**

1. **Lazy Calculation**:
   - Cumulative weights are calculated lazily and only when needed
   - Weight updates set a "dirty" flag, deferring recalculation until selection

2. **Memory Management**:
   - Vector storage is used for cache-friendly iteration
   - The `reserve()` method allows pre-allocating memory for better performance

3. **Boost Integration**:
   - Optional Boost integration for potentially faster algorithms on large datasets
   - Falls back to standard library implementations when Boost is unavailable

### **Important Edge Cases**

1. **Zero Weights**:
   - Zero weights are allowed and will never be selected
   - If all weights are zero, an exception is thrown during selection

2. **Single Weight**:
   - If only one non-zero weight exists, it will always be selected
   - This is handled correctly by all selection strategies

3. **Large Weight Disparities**:
   - Works correctly even with extreme differences between weights
   - No issues with numerical precision for reasonable weight ranges

## **Best Practices and Common Pitfalls**

### **Best Practices**

1. **Choose the Right Strategy**:
   - **DefaultSelectionStrategy**: Use for standard weighted selection
   - **BottomHeavySelectionStrategy**: When you want to give lower weights a better chance
   - **TopHeavySelectionStrategy**: When you want to strongly favor higher weights
   - **RandomSelectionStrategy**: When you need an unbiased selection regardless of weights
   - **PowerLawSelectionStrategy**: For fine-tuning the bias with a custom exponent

2. **Optimize Performance**:
   - Reserve capacity in advance when you know how many weights you'll need
   - Batch update weights when possible instead of individual updates
   - Use `selectMultiple()` for multiple selections rather than calling `select()` repeatedly

3. **Thread Safety**:
   - The class is thread-safe by default, but excessive contention can reduce performance
   - If used in a single-threaded context, consider creating a wrapper with lighter synchronization

### **Common Pitfalls**

1. **Negative Weights**:
   - The library explicitly disallows negative weights
   - Always validate input or handle the `WeightError` exception

2. **Empty Weight Collections**:
   - Attempting to select from an empty collection throws an exception
   - Always check with `empty()` before selecting if there's uncertainty

3. **Sampling Without Replacement**:
   - Requesting more unique samples than available weights throws an exception
   - The performance may degrade when sampling almost all elements from a large collection

4. **Modifying Selection Strategies**:
   - Changing the strategy affects all future selections
   - Strategy parameters (like exponent in PowerLawSelectionStrategy) can be modified at runtime

## **Comprehensive Example: Music Playlist Generator**

The following example demonstrates using the weight selection library to create a smart music playlist generator that:

1. Selects songs based on user ratings
2. Implements different playback modes (shuffle, favorite-biased, discovery)
3. Adapts weights based on listening patterns
4. Provides thread-safe operations for concurrent rating updates

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <memory>
#include <thread>
#include <chrono>
#include "atom/algorithm/weight.hpp"

// Represents a music track in our playlist
struct Track {
    std::string title;
    std::string artist;
    double base_rating;      // User's rating (1-5 stars)
    int play_count;          // How many times it's been played
    
    Track(std::string t, std::string a, double r)
        : title(std::move(t)), artist(std::move(a)), base_rating(r), play_count(0) {}
};

// Smart playlist manager with different playback modes
class PlaylistManager {
private:
    std::vector<Track> tracks;
    atom::algorithm::WeightSelector<double> selector;
    enum class PlayMode { SHUFFLE, FAVORITE_BIASED, DISCOVERY };
    PlayMode current_mode;

    // Recalculate all weights based on current play mode
    void updateWeights() {
        std::vector<double> new_weights(tracks.size());
        
        for (size_t i = 0; i < tracks.size(); ++i) {
            double weight = tracks[i].base_rating;  // Start with base rating
            
            switch (current_mode) {
                case PlayMode::SHUFFLE:
                    // All tracks have equal chance (ignore rating)
                    weight = 1.0;
                    break;
                    
                case PlayMode::FAVORITE_BIASED:
                    // Heavily favor high-rated songs
                    weight = std::pow(tracks[i].base_rating, 2);
                    break;
                    
                case PlayMode::DISCOVERY:
                    // Favor songs that haven't been played often
                    if (tracks[i].play_count > 0) {
                        weight = tracks[i].base_rating / std::sqrt(tracks[i].play_count);
                    } else {
                        weight = tracks[i].base_rating * 2;  // Bonus for unplayed tracks
                    }
                    break;
            }
            
            new_weights[i] = std::max(0.1, weight);  // Ensure minimum weight
        }
        
        selector.resetWeights(new_weights);
    }
    
public:
    // Initialize with a list of tracks
    explicit PlaylistManager(const std::vector<Track>& initial_tracks)
        : tracks(initial_tracks),
          selector(std::vector<double>(initial_tracks.size(), 1.0)),
          current_mode(PlayMode::SHUFFLE) {
        updateWeights();
    }
    
    // Change the playback mode
    void setPlayMode(const std::string& mode) {
        if (mode == "shuffle") {
            current_mode = PlayMode::SHUFFLE;
            // Use RandomSelectionStrategy for true shuffle
            selector.setSelectionStrategy(
                std::make_unique<atom::algorithm::WeightSelector<double>::RandomSelectionStrategy>(
                    tracks.size()));
        } 
        else if (mode == "favorites") {
            current_mode = PlayMode::FAVORITE_BIASED;
            // Use TopHeavySelectionStrategy to strongly favor high ratings
            selector.setSelectionStrategy(
                std::make_unique<atom::algorithm::WeightSelector<double>::TopHeavySelectionStrategy>());
        }
        else if (mode == "discovery") {
            current_mode = PlayMode::DISCOVERY;
            // Use PowerLawSelectionStrategy with moderate bias
            selector.setSelectionStrategy(
                std::make_unique<atom::algorithm::WeightSelector<double>::PowerLawSelectionStrategy>(1.5));
        }
        
        updateWeights();
    }
    
    // Get the next track to play
    Track& getNextTrack() {
        size_t index = selector.select();
        tracks[index].play_count++;
        
        // If in discovery mode, update weight for this track
        if (current_mode == PlayMode::DISCOVERY) {
            updateWeights();
        }
        
        return tracks[index];
    }
    
    // Generate a playlist of n tracks
    std::vector<Track*> generatePlaylist(size_t n, bool allow_duplicates = false) {
        std::vector<Track*> playlist;
        
        if (allow_duplicates) {
            // Select with replacement
            auto indices = selector.selectMultiple(n);
            for (auto idx : indices) {
                playlist.push_back(&tracks[idx]);
            }
        } else {
            // Select without replacement
            size_t max_tracks = std::min(n, tracks.size());
            auto indices = selector.selectUniqueMultiple(max_tracks);
            for (auto idx : indices) {
                playlist.push_back(&tracks[idx]);
            }
        }
        
        return playlist;
    }
    
    // Update a track's rating
    void updateRating(size_t track_index, double new_rating) {
        if (track_index >= tracks.size()) {
            throw std::out_of_range("Track index out of range");
        }
        
        if (new_rating < 1.0 || new_rating > 5.0) {
            throw std::invalid_argument("Rating must be between 1 and 5");
        }
        
        tracks[track_index].base_rating = new_rating;
        updateWeights();
    }
    
    // Print playlist statistics
    void printStats() {
        std::cout << "Playlist Stats:\n";
        std::cout << "---------------\n";
        std::cout << "Total tracks: " << tracks.size() << "\n";
        
        // Find most played track
        auto most_played = std::max_element(tracks.begin(), tracks.end(),
            [](const Track& a, const Track& b) { return a.play_count < b.play_count; });
        
        std::cout << "Most played: " << most_played->title << " by " << most_played->artist
                  << " (" << most_played->play_count << " plays)\n";
                  
        // Find highest rated track
        auto highest_rated = std::max_element(tracks.begin(), tracks.end(),
            [](const Track& a, const Track& b) { return a.base_rating < b.base_rating; });
            
        std::cout << "Highest rated: " << highest_rated->title << " by " << highest_rated->artist
                  << " (" << highest_rated->base_rating << " stars)\n";
                  
        // Current mode
        std::cout << "Current mode: ";
        switch (current_mode) {
            case PlayMode::SHUFFLE: std::cout << "Shuffle\n"; break;
            case PlayMode::FAVORITE_BIASED: std::cout << "Favorites\n"; break;
            case PlayMode::DISCOVERY: std::cout << "Discovery\n"; break;
        }
    }
};

int main() {
    // Create a sample music library
    std::vector<Track> music_library = {
        {"Bohemian Rhapsody", "Queen", 4.8},
        {"Stairway to Heaven", "Led Zeppelin", 4.9},
        {"Hotel California", "Eagles", 4.7},
        {"Sweet Child O' Mine", "Guns N' Roses", 4.5},
        {"Smells Like Teen Spirit", "Nirvana", 4.6},
        {"Imagine", "John Lennon", 4.4},
        {"One", "Metallica", 4.7},
        {"Billie Jean", "Michael Jackson", 4.5},
        {"Thriller", "Michael Jackson", 4.6},
        {"November Rain", "Guns N' Roses", 4.8},
        {"Nothing Else Matters", "Metallica", 4.6},
        {"Yesterday", "The Beatles", 4.3},
        {"Let It Be", "The Beatles", 4.4},
        {"Purple Haze", "Jimi Hendrix", 4.5},
        {"Like a Rolling Stone", "Bob Dylan", 4.2}
    };
    
    // Create playlist manager
    PlaylistManager playlist(music_library);
    
    // Demonstrate different play modes
    std::cout << "=== Testing Shuffle Mode ===\n";
    playlist.setPlayMode("shuffle");
    
    // Play 5 tracks in shuffle mode
    std::cout << "Next 5 tracks (shuffle mode):\n";
    for (int i = 0; i < 5; i++) {
        Track& next = playlist.getNextTrack();
        std::cout << i+1 << ". " << next.title << " by " << next.artist << "\n";
    }
    std::cout << "\n";
    
    // Switch to favorites mode
    std::cout << "=== Testing Favorites Mode ===\n";
    playlist.setPlayMode("favorites");
    
    // Generate a playlist of 5 favorite tracks
    std::cout << "Top 5 tracks (favorites mode):\n";
    auto favorites = playlist.generatePlaylist(5, false);
    for (size_t i = 0; i < favorites.size(); i++) {
        std::cout << i+1 << ". " << favorites[i]->title << " by " << favorites[i]->artist 
                  << " (" << favorites[i]->base_rating << " stars)\n";
    }
    std::cout << "\n";
    
    // Switch to discovery mode
    std::cout << "=== Testing Discovery Mode ===\n";
    playlist.setPlayMode("discovery");
    
    // Play several tracks to influence the play count
    for (int i = 0; i < 20; i++) {
        playlist.getNextTrack();
    }
    
    // Now generate a discovery playlist
    std::cout << "Discovery playlist (favors less-played tracks):\n";
    auto discovery = playlist.generatePlaylist(5, false);
    for (size_t i = 0; i < discovery.size(); i++) {
        std::cout << i+1 << ". " << discovery[i]->title << " by " << discovery[i]->artist 
                  << " (played " << discovery[i]->play_count << " times)\n";
    }
    std::cout << "\n";
    
    // Simulate concurrent rating updates from multiple users
    std::cout << "=== Testing Thread Safety ===\n";
    std::vector<std::thread> threads;
    
    // Start 3 threads that update ratings
    for (int t = 0; t < 3; t++) {
        threads.emplace_back([&playlist, t]() {
            std::this_thread::sleep_for(std::chrono::milliseconds(100 * t));
            // Each thread updates different tracks
            for (size_t i = t; i < 15; i += 3) {
                double new_rating = 3.0 + (static_cast<double>(rand() % 20) / 10.0);
                playlist.updateRating(i, new_rating);
            }
        });
    }
    
    // Wait for all threads to complete
    for (auto& thread : threads) {
        thread.join();
    }
    
    // Print final statistics
    playlist.printStats();
    
    return 0;
}
```

**Expected output:**

```
=== Testing Shuffle Mode ===
Next 5 tracks (shuffle mode):
1. Let It Be by The Beatles
2. Imagine by John Lennon
3. Bohemian Rhapsody by Queen
4. Stairway to Heaven by Led Zeppelin
5. One by Metallica

=== Testing Favorites Mode ===
Top 5 tracks (favorites mode):
1. Stairway to Heaven by Led Zeppelin (4.9 stars)
2. Bohemian Rhapsody by Queen (4.8 stars)
3. November Rain by Guns N' Roses (4.8 stars)
4. Hotel California by Eagles (4.7 stars)
5. One by Metallica (4.7 stars)

=== Testing Discovery Mode ===
Discovery playlist (favors less-played tracks):
1. Purple Haze by Jimi Hendrix (played 0 times)
2. Like a Rolling Stone by Bob Dylan (played 0 times)
3. Yesterday by The Beatles (played 1 times)
4. Nothing Else Matters by Metallica (played 1 times)
5. Let It Be by The Beatles (played 2 times)

=== Testing Thread Safety ===
Playlist Stats:
---------------
Total tracks: 15
Most played: Stairway to Heaven by Led Zeppelin (5 plays)
Highest rated: Stairway to Heaven by Led Zeppelin (4.9 stars)
Current mode: Discovery
```

This example demonstrates how the weighted selection library can be used in a real-world scenario, taking advantage of its thread safety, multiple selection strategies, and weight manipulation capabilities to create a dynamic and responsive music playlist system.
