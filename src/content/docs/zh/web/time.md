---
title: 系统时间
description: 系统时间管理 API 的全面文档，包括获取、设置和同步系统时间及时区的函数，并附有使用示例。
---

## 函数: getSystemTime

```cpp
std::time_t getSystemTime();
```

- 检索自 Unix 纪元以来的当前系统时间（以秒为单位）。

```cpp
std::time_t currentTime = getSystemTime();
std::cout << "当前系统时间: " << currentTime << " 秒自 Unix 纪元" << std::endl;
```

预期输出

```txt
当前系统时间: 1648323625 秒自 Unix 纪元
```

---

## 函数: setSystemTime

```cpp
void setSystemTime(int year, int month, int day, int hour, int minute, int second);
```

- 将系统时间设置为指定的日期和时间。

```cpp
setSystemTime(2024, 3, 25, 15, 0, 0); // 将系统时间设置为 2024 年 3 月 25 日 3:00:00 PM
```

---

## 函数: setSystemTimezone

```cpp
bool setSystemTimezone(const std::string &timezone);
```

- 将系统时区设置为指定的时区。

```cpp
bool success = setSystemTimezone("America/New_York");
if (success) {
    std::cout << "时区设置成功" << std::endl;
} else {
    std::cout << "设置时区失败" << std::endl;
}
```

---

## 函数: syncTimeFromRTC

```cpp
bool syncTimeFromRTC();
```

- 将系统时间与 RTC（实时时钟）设备同步。

```cpp
bool syncSuccess = syncTimeFromRTC();
if (syncSuccess) {
    std::cout << "系统时间与 RTC 同步" << std::endl;
} else {
    std::cout << "与 RTC 同步系统时间失败" << std::endl;
}
```

---

## 完整示例

以下是使用系统时间管理函数的完整示例：

```cpp
int main() {
    std::time_t currentTime = getSystemTime();
    std::cout << "当前系统时间: " << currentTime << " 秒自 Unix 纪元" << std::endl;

    setSystemTime(2024, 3, 25, 15, 0, 0);

    bool tzSetSuccess = setSystemTimezone("America/New_York");
    if (tzSetSuccess) {
        std::cout << "时区设置成功" << std::endl;
    } else {
        std::cout << "设置时区失败" << std::endl;
    }

    bool syncSuccess = syncTimeFromRTC();
    if (syncSuccess) {
        std::cout << "系统时间与 RTC 同步" << std::endl;
    } else {
        std::cout << "与 RTC 同步系统时间失败" << std::endl;
    }

    return 0;
}
```
