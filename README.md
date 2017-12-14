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
