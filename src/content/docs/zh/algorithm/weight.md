---
title: WeightSelector
description: WeightSelector 类的详细文档，包括构造函数、成员函数、选择策略和使用示例
---

## 概述

`weight.hpp` 文件提供了基于权重的选择系统的实现，允许各种选择策略和权重操作。该实现是 `atom::algorithm` 命名空间的一部分，旨在与算术类型一起使用。

## 命名空间

所有类和函数都定义在 `atom::algorithm` 命名空间中。

```cpp
namespace atom::algorithm {
    // ...
}
```

## WeightSelector 类

### 类定义

```cpp
template <Arithmetic T>
class WeightSelector {
    // ... (成员函数和嵌套类)
};
```

`WeightSelector` 类是一个模板类，可以与任何算术类型 `T` 一起使用。它提供基于权重的选择和各种权重操作的功能。

### 构造函数

```cpp
explicit WeightSelector(std::span<const T> input_weights,
                        std::unique_ptr<SelectionStrategy> custom_strategy =
                            std::make_unique<DefaultSelectionStrategy>());
```

使用给定的权重和选择策略构造一个 `WeightSelector` 对象。

- **参数：**
  - `input_weights`：初始权重的跨度。
  - `custom_strategy`：指向自定义选择策略的唯一指针（可选，默认为 `DefaultSelectionStrategy`）。
- **使用示例：**

  ```cpp
  std::vector<double> weights = {1.0, 2.0, 3.0, 4.0};
  atom::algorithm::WeightSelector<double> selector(weights);
  ```

### 成员函数

#### select

```cpp
auto select() -> size_t;
```

根据当前权重和选择策略选择一个索引。

- **返回值：** 选择的索引。
- **使用示例：**

  ```cpp
  size_t selected_index = selector.select();
  ```

#### selectMultiple

```cpp
auto selectMultiple(size_t n) -> std::vector<size_t>;
```

根据当前权重和选择策略选择多个索引。

- **参数：**
  - `n`：要选择的数量。
- **返回值：** 选定索引的向量。
- **使用示例：**

  ```cpp
  std::vector<size_t> selected_indices = selector.selectMultiple(5);
  ```

#### updateWeight

```cpp
void updateWeight(size_t index, T new_weight);
```

更新指定索引处的权重。

- **参数：**
  - `index`：要更新的权重的索引。
  - `new_weight`：新权重值。
- **抛出：** `OutOfRangeException` 如果索引超出范围。
- **使用示例：**

  ```cpp
  selector.updateWeight(2, 5.0);
  ```

#### addWeight

```cpp
void addWeight(T new_weight);
```

向集合中添加新权重。

- **参数：**
  - `new_weight`：要添加的权重。
- **使用示例：**

  ```cpp
  selector.addWeight(6.0);
  ```

#### removeWeight

```cpp
void removeWeight(size_t index);
```

删除指定索引处的权重。

- **参数：**
  - `index`：要删除的权重的索引。
- **抛出：** `OutOfRangeException` 如果索引超出范围。
- **使用示例：**

  ```cpp
  selector.removeWeight(1);
  ```

#### normalizeWeights

```cpp
void normalizeWeights();
```

规范化所有权重，使其总和为 1。

- **使用示例：**

  ```cpp
  selector.normalizeWeights();
  ```

#### applyFunctionToWeights

```cpp
void applyFunctionToWeights(std::invocable<T> auto&& func);
```

对所有权重应用一个函数。

- **参数：**
  - `func`：要应用于每个权重的函数。
- **使用示例：**

  ```cpp
  selector.applyFunctionToWeights([](double w) { return w * 2; });
  ```

#### batchUpdateWeights

```cpp
void batchUpdateWeights(const std::vector<std::pair<size_t, T>>& updates);
```

在单个操作中更新多个权重。

- **参数：**
  - `updates`：包含索引和新权重的对的向量。
- **抛出：** `OutOfRangeException` 如果任何索引超出范围。
- **使用示例：**

  ```cpp
  std::vector<std::pair<size_t, double>> updates = {{0, 1.5}, {2, 3.5}};
  selector.batchUpdateWeights(updates);
  ```

#### getWeight

```cpp
[[nodiscard]] auto getWeight(size_t index) const -> std::optional<T>;
```

检索指定索引处的权重。

- **参数：**
  - `index`：要检索的权重的索引。
- **返回值：** 如果索引有效，则包含权重的可选值，否则返回 `std::nullopt`。
- **使用示例：**

  ```cpp
  auto weight = selector.getWeight(1);
  if (weight) {
      std::cout << "Weight: " << *weight << std::endl;
  }
  ```

#### getMaxWeightIndex, getMinWeightIndex

```cpp
[[nodiscard]] auto getMaxWeightIndex() const -> size_t;
[[nodiscard]] auto getMinWeightIndex() const -> size_t;
```

获取最大或最小权重的索引。

- **返回值：** 最大或最小权重的索引。
- **使用示例：**

  ```cpp
  size_t max_index = selector.getMaxWeightIndex();
  size_t min_index = selector.getMinWeightIndex();
  ```

#### size, getWeights, getTotalWeight

```cpp
[[nodiscard]] auto size() const -> size_t;
[[nodiscard]] auto getWeights() const -> std::span<const T>;
[[nodiscard]] auto getTotalWeight() const -> T;
```

获取权重信息的实用函数。

- **使用示例：**

  ```cpp
  size_t num_weights = selector.size();
  auto weights_span = selector.getWeights();
  T total_weight = selector.getTotalWeight();
  ```

#### resetWeights, scaleWeights

```cpp
void resetWeights(const std::vector<T>& new_weights);
void scaleWeights(T factor);
```

重置或缩放所有权重的函数。

- **使用示例：**

  ```cpp
  std::vector<double> new_weights = {1.0, 2.0, 3.0};
  selector.resetWeights(new_weights);
  selector.scaleWeights(2.0);
  ```

#### getAverageWeight, printWeights

```cpp
[[nodiscard]] auto getAverageWeight() const -> T;
void printWeights(std::ostream& oss) const;
```

获取平均权重或打印所有权重的实用函数。

- **使用示例：**

  ```cpp
  T avg_weight = selector.getAverageWeight();
  selector.printWeights(std::cout);
  ```

### 选择策略

`WeightSelector` 类支持通过 `SelectionStrategy` 接口实现不同的选择策略：

1. `DefaultSelectionStrategy`：使用基于权重的均匀随机选择。
2. `BottomHeavySelectionStrategy`：偏向选择较低索引。
3. `RandomSelectionStrategy`：随机选择索引，忽略权重。
4. `TopHeavySelectionStrategy`：偏向选择较高索引。

您可以使用以下方法设置自定义策略：

```cpp
void setSelectionStrategy(std::unique_ptr<SelectionStrategy> new_strategy);
```

### WeightedRandomSampler

`WeightedRandomSampler` 类提供了一种基于权重采样多个索引的方法：

```cpp
class WeightedRandomSampler {
public:
    auto sample(std::span<const T> weights, size_t n) -> std::vector<size_t>;
};
```

#### sample

```cpp
auto sample(std::span<const T> weights, size_t n) -> std::vector<size_t>;
```

根据给定的权重采样 `n` 个索引。

- **参数：**
  - `weights`：要采样的权重的跨度。
  - `n`：要采样的数量。
- **返回值：** 采样的索引向量。
- **使用示例：**

  ```cpp
  atom::algorithm::WeightSelector<double>::WeightedRandomSampler sampler;
  std::vector<double> weights = {1.0, 2.0, 3.0, 4.0};
  auto samples = sampler.sample(weights, 5);
  ```

## Example Usage

以下示例演示如何使用 `WeightSelector` 类与不同策略：

```cpp
#include "weight.hpp"
#include <iostream>
#include <vector>

int main() {
    std::vector<double> weights = {1.0, 2.0, 3.0, 4.0};

    // 使用默认策略创建 WeightSelector
    atom::algorithm::WeightSelector<double> selector(weights);

    // 执行选择
    size_t selected = selector.select();
    std::cout << "选择的索引: " << selected << std::endl;

    // 更改为底部重策略
    selector.setSelectionStrategy(std::make_unique<atom::algorithm::WeightSelector<double>::BottomHeavySelectionStrategy>());

    // 执行多次选择
    auto multiple_selections = selector.selectMultiple(5);
    std::cout << "多次选择: ";
    for (auto idx : multiple_selections) {
        std::cout << idx << " ";
    }
    std::cout << std::endl;

    // 更新权重
    selector.updateWeight(2, 5.0);

    // 规范化权重
    selector.normalizeWeights();

    // 打印权重
    std::cout << "规范化权重: ";
    selector.printWeights(std::cout);

    // 使用 WeightedRandomSampler
    atom::algorithm::WeightSelector<double>::WeightedRandomSampler sampler;
    auto samples = sampler.sample(selector.getWeights(), 10);
    std::cout << "采样的索引: ";
    for (auto idx : samples) {
        std::cout << idx << " ";
    }
    std::cout << std::endl;

    return 0;
}
```

## 最佳实践

1. **选择适当的选择策略**：不同的选择策略会显著影响基于权重的选择行为。选择最适合您用例的策略。

2. **保持权重规范化**：如果您经常比较或组合来自不同来源的权重，考虑使用 `normalizeWeights()` 方法保持它们规范化（总和为 1）。

3. **使用批量更新**：在一次更新多个权重时，使用 `batchUpdateWeights()` 以提高性能，因为它只需重新计算一次累积权重。

4. **处理异常**：像 `updateWeight()` 和 `removeWeight()` 这样的函数可能会因超出范围的索引而抛出异常。在代码中确保处理这些异常。

5. **利用 SIMD 操作**：如果您的应用需要高性能的权重操作，考虑在自定义权重操作函数中使用 SIMD 操作。

## 性能考虑

- `WeightSelector` 类使用 `std::exclusive_scan` 计算累积权重，这可以在支持硬件上有效并行化。
- 频繁的权重更新可能会由于重新计算累积权重而成本较高。如果您的用例涉及许多更新，请考虑批量处理或使用不同的数据结构。
- `WeightSelector` 的空间复杂度为 O(n)，其中 n 是权重的数量，因为存储了原始权重和累积权重。
- 选择操作的时间复杂度为 O(log n)，由于在大多数选择策略中使用了 `std::ranges::upper_bound`。

## 线程安全性

`WeightSelector` 类默认不是线程安全的。如果您需要在多线程环境中使用它，应该实现外部同步。

## 可扩展性

`WeightSelector` 类设计为可扩展：

- 您可以通过从 `SelectionStrategy` 基类继承来创建自定义选择策略。
- `applyFunctionToWeights` 方法允许自定义权重转换。
- 您可以扩展 `WeightSelector` 类本身以添加特定领域的功能。

## 限制

- 当前实现假设权重为非负。负权重的行为未定义。
- `WeightSelector` 类目前不支持动态调整权重向量的大小，出于性能考虑。如果您需要频繁添加或删除权重，可能需要扩展类以更高效地支持此用例。
