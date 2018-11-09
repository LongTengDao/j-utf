# `require('@ltd/j-utf')`

## API

### `.toStringFollowBOM(buffer[, swapDirectly])` 方法

-   用途：根据传入 `Buffer` 的 `BOM` 值获取字符串（字符串中不包括 `BOM`）。
-   参数：
    *   `buffer`
        -   用途：要解析为字符串的 `Buffer`。
        -   类型：`Buffer`
    +   `swapDirectly`
        -   用途：当 `Buffer` 采用 `utf-16ge` 编码时，是否可以安全地在原始 `Buffer` 上进行位交换以减少开销。
        -   类型：`boolean`
        -   默认：`false`

### `.toStringWithBOM(buffer[, swapDirectly])` 方法

-   用途：根据传入 `Buffer` 的 `BOM` 值获取字符串（字符串中保留了 `BOM`）。
-   参数：
    *   `buffer`
        -   用途：要解析为字符串的 `Buffer`。
        -   类型：`Buffer`
    +   `swapDirectly`
        -   用途：当 `Buffer` 采用 `utf-16ge` 编码时，是否可以安全地在原始 `Buffer` 上进行位交换以减少开销。
        -   类型：`boolean`
        -   默认：`false`

### `.BOM` 常量

-   量值：`"\uFEFF"`

### `.trimBOM(string)` 方法

-   用途：返回剔除开头可能存在的 `BOM` 后的 `string`。
-   参数：
    *   `string`
        -   类型：`string`

### `.startsWithBOM(string)` 方法

-   用途：测试传入的 `string` 是否以 `BOM` 开头。
-   参数：
    *   `string`
        -   类型：`string`

### `.formatOf(buffer)` 方法

-   用途：根据传入 `Buffer` 的 `BOM` 值，返回 `UTF` 数字（`8` 代表 `UTF-8`，`16` 代表 `UTF-16LE`，`16` 代表 `UTF-16BE`，其它情况返回 `0`）。
-   参数：
    *   `buffer`
        -   类型：`Buffer`

### `.bytesOf(buffer)` 方法

-   用途：根据传入 `Buffer` 的 `BOM` 值，返回 `BOM` 值所占的字节数。
-   参数：
    *   `buffer`
        -   类型：`Buffer`
