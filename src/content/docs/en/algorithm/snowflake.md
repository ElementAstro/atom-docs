---
title: Snowflake Algorithm
description: Comprehensive guide to the Snowflake algorithm implementation in C++, including class methods, exception handling, and example usage for generating unique IDs.
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Overview](#overview)
- [Class Documentation](#class-documentation)
  - [SnowflakeException](#snowflakeexception)
    - [Methods](#methods)
      - [Constructor](#constructor)
  - [InvalidWorkerIdException](#invalidworkeridexception)
    - [Methods](#methods-1)
      - [Constructor](#constructor-1)
  - [InvalidDatacenterIdException](#invaliddatacenteridexception)
    - [Methods](#methods-2)
      - [Constructor](#constructor-2)
  - [InvalidTimestampException](#invalidtimestampexception)
    - [Methods](#methods-3)
      - [Constructor](#constructor-3)
  - [SnowflakeNonLock](#snowflakenonlock)
    - [Methods](#methods-4)
      - [lock](#lock)
      - [unlock](#unlock)
  - [Snowflake](#snowflake)
    - [Template Parameters](#template-parameters)
    - [Static Constants](#static-constants)
    - [Methods](#methods-5)
      - [Constructor](#constructor-4)
      - [init](#init)
      - [nextid](#nextid)
      - [validateId](#validateid)
      - [extractTimestamp](#extracttimestamp)
      - [parseId](#parseid)
      - [reset](#reset)
      - [getWorkerId](#getworkerid)
      - [getDatacenterId](#getdatacenterid)
      - [getStatistics](#getstatistics)
      - [serialize](#serialize)
      - [deserialize](#deserialize)
    - [Nested Types](#nested-types)
      - [Statistics](#statistics)
- [Usage Examples](#usage-examples)
  - [Basic Usage](#basic-usage)
  - [Thread-Safe Usage](#thread-safe-usage)
  - [Batch Generation](#batch-generation)
  - [Parsing and Validating IDs](#parsing-and-validating-ids)
  - [Statistics and Serialization](#statistics-and-serialization)
- [Performance Considerations](#performance-considerations)
- [Best Practices](#best-practices)
- [Headers and Dependencies](#headers-and-dependencies)
  - [Required Headers](#required-headers)
  - [Optional Dependencies](#optional-dependencies)
- [Platform-Specific Notes](#platform-specific-notes)
- [Comprehensive Example](#comprehensive-example)
  - [Expected Output](#expected-output)

## Overview

The Atom Snowflake Algorithm is a C++ implementation of Twitter's Snowflake algorithm for generating distributed, unique 64-bit identifiers. Snowflake IDs are composed of:

- A timestamp (milliseconds since a custom epoch)
- A datacenter ID
- A worker ID
- A sequence number (for multiple IDs in the same millisecond)

This implementation provides thread-safe ID generation with configurable worker and datacenter IDs, optional locking mechanisms, and various utility methods for ID validation and parsing.

Key features:

- Generating unique, time-sortable 64-bit IDs
- Configurable epoch time
- Flexible thread-safety options
- Batch generation capabilities
- ID validation and parsing
- Statistics collection
- Serialization/deserialization support

## Class Documentation

### SnowflakeException

Base exception class for all Snowflake-related errors.

#### Methods

##### Constructor

```cpp
explicit SnowflakeException(const std::string &message)
```

- Parameters:
  - `message`: Error message describing the exception
- Description: Creates a new SnowflakeException with the specified error message.

### InvalidWorkerIdException

Exception thrown when a worker ID exceeds the maximum allowed value.

#### Methods

##### Constructor

```cpp
InvalidWorkerIdException(uint64_t worker_id, uint64_t max)
```

- Parameters:
  - `worker_id`: The invalid worker ID value
  - `max`: The maximum allowed worker ID
- Description: Creates an exception with a message indicating that the provided worker ID exceeds the maximum allowed value.

### InvalidDatacenterIdException

Exception thrown when a datacenter ID exceeds the maximum allowed value.

#### Methods

##### Constructor

```cpp
InvalidDatacenterIdException(uint64_t datacenter_id, uint64_t max)
```

- Parameters:
  - `datacenter_id`: The invalid datacenter ID value
  - `max`: The maximum allowed datacenter ID
- Description: Creates an exception with a message indicating that the provided datacenter ID exceeds the maximum allowed value.

### InvalidTimestampException

Exception thrown when there's an issue with timestamp generation, typically when clock drift occurs.

#### Methods

##### Constructor

```cpp
InvalidTimestampException(uint64_t timestamp)
```

- Parameters:
  - `timestamp`: The invalid timestamp value
- Description: Creates an exception with a message indicating that the timestamp is invalid or out of range.

### SnowflakeNonLock

A no-op lock class used when thread safety is not required.

#### Methods

##### lock

```cpp
void lock()
```

- Description: Empty implementation of lock operation.

##### unlock

```cpp
void unlock()
```

- Description: Empty implementation of unlock operation.

### Snowflake

The main class template for Snowflake ID generation.

#### Template Parameters

- `Twepoch`: The custom epoch (milliseconds since Unix epoch) used as the starting point for timestamp calculation.
- `Lock`: The lock type for thread safety. Defaults to `SnowflakeNonLock`. Can also be `std::mutex` or `boost::mutex`.

#### Static Constants

- `TWEPOCH`: The custom epoch timestamp
- `WORKER_ID_BITS`: Number of bits allocated to worker ID (5)
- `DATACENTER_ID_BITS`: Number of bits allocated to datacenter ID (5)
- `MAX_WORKER_ID`: Maximum value for worker ID (31)
- `MAX_DATACENTER_ID`: Maximum value for datacenter ID (31)
- `SEQUENCE_BITS`: Number of bits allocated to sequence number (12)
- `WORKER_ID_SHIFT`: Number of bits to shift worker ID by (12)
- `DATACENTER_ID_SHIFT`: Number of bits to shift datacenter ID by (17)
- `TIMESTAMP_LEFT_SHIFT`: Number of bits to shift timestamp by (22)
- `SEQUENCE_MASK`: Bitmask for extracting the sequence component (4095)

#### Methods

##### Constructor

```cpp
explicit Snowflake(uint64_t worker_id = 0, uint64_t datacenter_id = 0)
```

- Parameters:
  - `worker_id`: The worker ID (default: 0)
  - `datacenter_id`: The datacenter ID (default: 0)
- Throws:
  - `InvalidWorkerIdException`: If worker_id > MAX_WORKER_ID
  - `InvalidDatacenterIdException`: If datacenter_id > MAX_DATACENTER_ID
- Description: Initializes a Snowflake ID generator with the specified worker and datacenter IDs.

##### init

```cpp
void init(uint64_t worker_id, uint64_t datacenter_id)
```

- Parameters:
  - `worker_id`: The new worker ID
  - `datacenter_id`: The new datacenter ID
- Throws:
  - `InvalidWorkerIdException`: If worker_id > MAX_WORKER_ID
  - `InvalidDatacenterIdException`: If datacenter_id > MAX_DATACENTER_ID
- Description: Reinitializes the Snowflake generator with new worker and datacenter IDs.

##### nextid

```cpp
template <size_t N = 1>
[[nodiscard]] auto nextid() -> std::array<uint64_t, N>
```

- Template Parameters:
  - `N`: Number of IDs to generate (default: 1)
- Returns: An array of N unique Snowflake IDs
- Throws:
  - `InvalidTimestampException`: If a timestamp issue is detected
- Description: Generates N unique Snowflake IDs in batch.

##### validateId

```cpp
[[nodiscard]] bool validateId(uint64_t id) const
```

- Parameters:
  - `id`: The ID to validate
- Returns: True if the ID was generated by this instance, false otherwise
- Description: Validates whether an ID was generated by this Snowflake instance.

##### extractTimestamp

```cpp
[[nodiscard]] uint64_t extractTimestamp(uint64_t id) const
```

- Parameters:
  - `id`: The Snowflake ID
- Returns: The timestamp component of the ID
- Description: Extracts and returns the timestamp from a Snowflake ID.

##### parseId

```cpp
void parseId(uint64_t encrypted_id, uint64_t &timestamp, 
             uint64_t &datacenter_id, uint64_t &worker_id,
             uint64_t &sequence) const
```

- Parameters:
  - `encrypted_id`: The Snowflake ID to parse
  - `timestamp`: Reference to store the extracted timestamp
  - `datacenter_id`: Reference to store the extracted datacenter ID
  - `worker_id`: Reference to store the extracted worker ID
  - `sequence`: Reference to store the extracted sequence number
- Description: Parses a Snowflake ID into its constituent components.

##### reset

```cpp
void reset()
```

- Description: Resets the internal state of the Snowflake generator.

##### getWorkerId

```cpp
[[nodiscard]] auto getWorkerId() const -> uint64_t
```

- Returns: The worker ID of this Snowflake instance
- Description: Returns the current worker ID.

##### getDatacenterId

```cpp
[[nodiscard]] auto getDatacenterId() const -> uint64_t
```

- Returns: The datacenter ID of this Snowflake instance
- Description: Returns the current datacenter ID.

##### getStatistics

```cpp
[[nodiscard]] Statistics getStatistics() const
```

- Returns: A Statistics object with information about ID generation
- Description: Retrieves statistics about the ID generation process.

##### serialize

```cpp
[[nodiscard]] std::string serialize() const
```

- Returns: A string representation of the generator's state
- Description: Serializes the current state of the Snowflake generator.

##### deserialize

```cpp
void deserialize(const std::string &state)
```

- Parameters:
  - `state`: A serialized state string
- Throws:
  - `SnowflakeException`: If the state string is invalid
- Description: Restores the Snowflake generator state from a serialized string.

#### Nested Types

##### Statistics

A structure storing statistics about ID generation:

- `total_ids_generated`: Total number of IDs generated
- `sequence_rollovers`: Number of sequence rollovers
- `timestamp_wait_count`: Number of times we had to wait for the next millisecond

## Usage Examples

### Basic Usage

```cpp
#include <atom/algorithm/snowflake.hpp>
#include <iostream>

int main() {
    // Create a Snowflake generator with custom epoch (Jan 1, 2020)
    // 1577836800000 = 2020-01-01 00:00:00 UTC in milliseconds
    atom::algorithm::Snowflake<1577836800000> idgen(1, 1);
    
    // Generate a single ID
    auto id = idgen.nextid<1>()[0];
    std::cout << "Generated ID: " << id << std::endl;
    
    // Extract timestamp from ID
    uint64_t timestamp = idgen.extractTimestamp(id);
    std::cout << "ID was generated at timestamp: " << timestamp << std::endl;
    
    return 0;
}
// Output:
// Generated ID: 1234567890123456789 (actual value will vary)
// ID was generated at timestamp: 1650123456789 (actual value will vary)
```

### Thread-Safe Usage

```cpp
#include <atom/algorithm/snowflake.hpp>
#include <iostream>
#include <thread>
#include <vector>

int main() {
    // Create a thread-safe Snowflake generator with custom epoch
    atom::algorithm::Snowflake<1577836800000, std::mutex> idgen(1, 1);
    
    std::vector<std::thread> threads;
    std::vector<uint64_t> ids(10);
    
    // Generate IDs in multiple threads
    for (int i = 0; i < 10; ++i) {
        threads.emplace_back([&idgen, &ids, i]() {
            // Generate ID in each thread
            ids[i] = idgen.nextid<1>()[0];
        });
    }
    
    // Wait for all threads to complete
    for (auto& t : threads) {
        t.join();
    }
    
    // Print generated IDs
    for (size_t i = 0; i < ids.size(); ++i) {
        std::cout << "Thread " << i << " ID: " << ids[i] << std::endl;
    }
    
    return 0;
}
// Output:
// Thread 0 ID: 1234567890123456789 (actual values will vary)
// Thread 1 ID: 1234567890123456790
// Thread 2 ID: 1234567890123456791
// ...
```

### Batch Generation

```cpp
#include <atom/algorithm/snowflake.hpp>
#include <iostream>

int main() {
    // Create a Snowflake generator
    atom::algorithm::Snowflake<1577836800000> idgen(1, 1);
    
    // Generate 5 IDs at once
    auto ids = idgen.nextid<5>();
    
    // Print all generated IDs
    for (size_t i = 0; i < ids.size(); ++i) {
        std::cout << "ID " << i << ": " << ids[i] << std::endl;
    }
    
    return 0;
}
// Output:
// ID 0: 1234567890123456789 (actual values will vary)
// ID 1: 1234567890123456790
// ID 2: 1234567890123456791
// ID 3: 1234567890123456792
// ID 4: 1234567890123456793
```

### Parsing and Validating IDs

```cpp
#include <atom/algorithm/snowflake.hpp>
#include <iostream>

int main() {
    // Create a Snowflake generator
    atom::algorithm::Snowflake<1577836800000> idgen(1, 1);
    
    // Generate an ID
    auto id = idgen.nextid<1>()[0];
    std::cout << "Generated ID: " << id << std::endl;
    
    // Validate the ID
    bool isValid = idgen.validateId(id);
    std::cout << "ID is valid: " << (isValid ? "true" : "false") << std::endl;
    
    // Parse the ID components
    uint64_t timestamp, datacenter_id, worker_id, sequence;
    idgen.parseId(id, timestamp, datacenter_id, worker_id, sequence);
    
    std::cout << "Timestamp: " << timestamp << std::endl;
    std::cout << "Datacenter ID: " << datacenter_id << std::endl;
    std::cout << "Worker ID: " << worker_id << std::endl;
    std::cout << "Sequence: " << sequence << std::endl;
    
    return 0;
}
// Output:
// Generated ID: 1234567890123456789 (actual value will vary)
// ID is valid: true
// Timestamp: 1650123456789 (actual value will vary)
// Datacenter ID: 1
// Worker ID: 1
// Sequence: 0
```

### Statistics and Serialization

```cpp
#include <atom/algorithm/snowflake.hpp>
#include <iostream>

int main() {
    // Create a Snowflake generator
    atom::algorithm::Snowflake<1577836800000> idgen(1, 1);
    
    // Generate some IDs
    for (int i = 0; i < 1000; ++i) {
        idgen.nextid<1>();
    }
    
    // Get statistics
    auto stats = idgen.getStatistics();
    std::cout << "Total IDs generated: " << stats.total_ids_generated << std::endl;
    std::cout << "Sequence rollovers: " << stats.sequence_rollovers << std::endl;
    std::cout << "Timestamp waits: " << stats.timestamp_wait_count << std::endl;
    
    // Serialize the generator state
    std::string state = idgen.serialize();
    std::cout << "Serialized state: " << state << std::endl;
    
    // Create a new generator with the same state
    atom::algorithm::Snowflake<1577836800000> newgen;
    newgen.deserialize(state);
    
    // Verify the state was transferred correctly
    std::cout << "New generator worker ID: " << newgen.getWorkerId() << std::endl;
    std::cout << "New generator datacenter ID: " << newgen.getDatacenterId() << std::endl;
    
    return 0;
}
// Output:
// Total IDs generated: 1000
// Sequence rollovers: varies
// Timestamp waits: varies
// Serialized state: 1:1:123:1650123456789:1234567890123456789 (varies)
// New generator worker ID: 1
// New generator datacenter ID: 1
```

## Performance Considerations

1. Thread Safety vs. Performance:
   - Using the non-locking version (`SnowflakeNonLock`) provides better performance but is not thread-safe.
   - Use the mutex version for thread safety, but be aware of potential contention in high-throughput scenarios.

2. Batch Generation:
   - Use `nextid<N>()` to generate multiple IDs at once, which is more efficient than generating them individually.

3. Thread-Local Caching:
   - The implementation includes thread-local caching to reduce contention and improve performance in multi-threaded environments.

4. Time Synchronization:
   - The algorithm is sensitive to clock drift. Backward jumps in time will throw exceptions.
   - Consider using a time synchronization service (like NTP) in production environments.

5. Memory Footprint:
   - The Snowflake generator has a small memory footprint, making it suitable for embedded systems and memory-constrained environments.

## Best Practices

1. Worker and Datacenter IDs:
   - Ensure uniqueness of worker and datacenter IDs across your distributed system.
   - Consider implementing a central allocation system for these IDs.

2. Error Handling:
   - Always handle potential exceptions, especially `InvalidTimestampException` which can occur due to clock adjustments.

```cpp
try {
    auto id = idgen.nextid<1>()[0];
} catch (const atom::algorithm::InvalidTimestampException& e) {
    // Handle clock synchronization issues
    std::cerr << "Time synchronization error: " << e.what() << std::endl;
} catch (const atom::algorithm::SnowflakeException& e) {
    // Handle other Snowflake errors
    std::cerr << "Snowflake error: " << e.what() << std::endl;
}
```

3. Clock Synchronization:
   - Always maintain accurate system time to avoid issues with timestamp generation.
   - If using in distributed systems, ensure all nodes have synchronized clocks.

4. ID Persistence:
   - Consider persisting the last used timestamp and sequence to handle restarts gracefully.
   - Use the serialization/deserialization methods for this purpose.

5. Common Pitfalls:
   - Avoid clock drift: System clock adjustments can cause exceptions.
   - Don't modify generated IDs: They contain critical metadata.
   - Don't reuse worker/datacenter IDs: This can lead to ID collisions.
   - Beware of epoch selection: Choose an epoch that makes sense for your application's lifetime.

## Headers and Dependencies

### Required Headers

- `<atomic>`: For atomic operations
- `<chrono>`: For time-related functionality
- `<cstdint>`: For fixed-width integer types
- `<mutex>`: For mutex and lock_guard
- `<random>`: For random number generation
- `<stdexcept>`: For exception classes
- `<string>`: For string handling
- `<type_traits>`: For compile-time type checking

### Optional Dependencies

- Boost (optional): When `ATOM_USE_BOOST` is defined:
  - `<boost/random.hpp>`: For Boost random number generation
  - `<boost/thread/lock_guard.hpp>`: For Boost lock_guard
  - `<boost/thread/mutex.hpp>`: For Boost mutex

## Platform-Specific Notes

1. Windows:
   - The implementation works on Windows with modern C++ compilers (MSVC, MinGW-w64).
   - Clock resolution on Windows can be less precise than on Unix-like systems; consider this in high-throughput scenarios.

2. Unix/Linux:
   - Works seamlessly on most Unix-like systems.
   - Better clock precision generally results in more evenly distributed IDs.

3. Cross-Platform Considerations:
   - The code is designed to be platform-independent.
   - For maximum portability, avoid platform-specific customizations.

4. Compiler Support:
   - Requires a C++17 compatible compiler.
   - Tested with GCC 7+, Clang 5+, and MSVC 2019+.

## Comprehensive Example

Here's a comprehensive example demonstrating multiple aspects of the Snowflake algorithm:

```cpp
#include <atom/algorithm/snowflake.hpp>
#include <iostream>
#include <thread>
#include <vector>
#include <iomanip>
#include <chrono>
#include <set>

// Custom output function to format Snowflake IDs
void printIdDetails(atom::algorithm::Snowflake<1577836800000, std::mutex>& generator, uint64_t id) {
    uint64_t timestamp, datacenter_id, worker_id, sequence;
    generator.parseId(id, timestamp, datacenter_id, worker_id, sequence);
    
    // Convert timestamp to human-readable format
    auto ms = std::chrono::milliseconds(timestamp);
    auto tp = std::chrono::system_clock::time_point(ms);
    auto time_t = std::chrono::system_clock::to_time_t(tp);
    auto tm = std::localtime(&time_t);
    
    std::cout << "ID: " << id << "\n"
              << "  - Timestamp: " << timestamp 
              << " (" << std::put_time(tm, "%Y-%m-%d %H:%M:%S") << ")\n"
              << "  - Datacenter ID: " << datacenter_id << "\n"
              << "  - Worker ID: " << worker_id << "\n"
              << "  - Sequence: " << sequence << "\n" << std::endl;
}

// Function to generate IDs in a separate thread
void generateIdsWorker(atom::algorithm::Snowflake<1577836800000, std::mutex>& generator, 
                       std::vector<uint64_t>& ids, int count) {
    for (int i = 0; i < count; ++i) {
        ids.push_back(generator.nextid<1>()[0]);
    }
}

int main() {
    try {
        std::cout << "====== Snowflake ID Generator Demo ======\n" << std::endl;
        
        // Initialize the generator with worker ID 3, datacenter ID 2
        // Use custom epoch of January 1, 2020 (1577836800000 milliseconds since Unix epoch)
        atom::algorithm::Snowflake<1577836800000, std::mutex> generator(3, 2);
        
        std::cout << "Generator initialized with:\n"
                  << "  - Worker ID: " << generator.getWorkerId() << "\n"
                  << "  - Datacenter ID: " << generator.getDatacenterId() << "\n"
                  << "  - Epoch: January 1, 2020 (1577836800000)\n" << std::endl;
        
        // Generate and display a single ID
        std::cout << "Generating a single ID:" << std::endl;
        auto single_id = generator.nextid<1>()[0];
        printIdDetails(generator, single_id);
        
        // Generate IDs in batch
        std::cout << "Generating a batch of 5 IDs:" << std::endl;
        auto batch_ids = generator.nextid<5>();
        for (auto id : batch_ids) {
            printIdDetails(generator, id);
        }
        
        // Demonstrate thread safety with multiple threads
        std::cout << "Generating IDs in multiple threads..." << std::endl;
        const int num_threads = 4;
        const int ids_per_thread = 100;
        std::vector<std::thread> threads;
        std::vector<std::vector<uint64_t>> thread_ids(num_threads);
        
        for (int i = 0; i < num_threads; ++i) {
            threads.emplace_back(generateIdsWorker, std::ref(generator), 
                                 std::ref(thread_ids[i]), ids_per_thread);
        }
        
        for (auto& t : threads) {
            t.join();
        }
        
        // Collect all IDs
        std::vector<uint64_t> all_ids;
        for (const auto& ids : thread_ids) {
            all_ids.insert(all_ids.end(), ids.begin(), ids.end());
        }
        
        // Check for duplicates
        std::set<uint64_t> unique_ids(all_ids.begin(), all_ids.end());
        std::cout << "Generated " << all_ids.size() << " IDs across " 
                  << num_threads << " threads." << std::endl;
        std::cout << "Number of unique IDs: " << unique_ids.size() << std::endl;
        
        if (unique_ids.size() == all_ids.size()) {
            std::cout << "SUCCESS: All generated IDs are unique!" << std::endl;
        } else {
            std::cout << "ERROR: Duplicate IDs detected!" << std::endl;
        }
        
        // Display statistics
        auto stats = generator.getStatistics();
        std::cout << "\nGenerator Statistics:\n"
                  << "  - Total IDs generated: " << stats.total_ids_generated << "\n"
                  << "  - Sequence rollovers: " << stats.sequence_rollovers << "\n"
                  << "  - Timestamp waits: " << stats.timestamp_wait_count << std::endl;
        
        // Demonstrate serialization/deserialization
        std::cout << "\nDemonstrating serialization/deserialization:" << std::endl;
        std::string state = generator.serialize();
        std::cout << "Serialized state: " << state << std::endl;
        
        // Create a new generator with the same state
        atom::algorithm::Snowflake<1577836800000, std::mutex> new_generator;
        new_generator.deserialize(state);
        
        std::cout << "New generator initialized from state with:\n"
                  << "  - Worker ID: " << new_generator.getWorkerId() << "\n"
                  << "  - Datacenter ID: " << new_generator.getDatacenterId() << std::endl;
        
        // Generate an ID with the new generator
        auto new_id = new_generator.nextid<1>()[0];
        std::cout << "ID generated with restored generator:" << std::endl;
        printIdDetails(new_generator, new_id);
        
    } catch (const atom::algorithm::InvalidWorkerIdException& e) {
        std::cerr << "Worker ID Error: " << e.what() << std::endl;
    } catch (const atom::algorithm::InvalidDatacenterIdException& e) {
        std::cerr << "Datacenter ID Error: " << e.what() << std::endl;
    } catch (const atom::algorithm::InvalidTimestampException& e) {
        std::cerr << "Timestamp Error: " << e.what() << std::endl;
    } catch (const atom::algorithm::SnowflakeException& e) {
        std::cerr << "Snowflake Error: " << e.what() << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "Standard Error: " << e.what() << std::endl;
    }
    
    return 0;
}
```

### Expected Output

```
====== Snowflake ID Generator Demo ======

Generator initialized with:
  - Worker ID: 3
  - Datacenter ID: 2
  - Epoch: January 1, 2020 (1577836800000)

Generating a single ID:
ID: 13537914327342182403
  - Timestamp: 1650123456789 (2022-04-16 15:37:36)
  - Datacenter ID: 2
  - Worker ID: 3
  - Sequence: 0

Generating a batch of 5 IDs:
ID: 13537914327342182404
  - Timestamp: 1650123456789 (2022-04-16 15:37:36)
  - Datacenter ID: 2
  - Worker ID: 3
  - Sequence: 1

[... additional IDs omitted for brevity ...]

Generating IDs in multiple threads...
Generated 400 IDs across 4 threads.
Number of unique IDs: 400
SUCCESS: All generated IDs are unique!

Generator Statistics:
  - Total IDs generated: 406
  - Sequence rollovers: 0
  - Timestamp waits: 2

Demonstrating serialization/deserialization:
Serialized state: 3:2:6:1650123456790:13537914327342182403
New generator initialized from state with:
  - Worker ID: 3
  - Datacenter ID: 2
ID generated with restored generator:
ID: 13537914327342182410
  - Timestamp: 1650123456790 (2022-04-16 15:37:36)
  - Datacenter ID: 2
  - Worker ID: 3
  - Sequence: 7
```

This documentation should provide a comprehensive understanding of the Atom Snowflake Algorithm implementation, covering all its features, usage patterns, and considerations for effective implementation.
