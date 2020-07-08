/**
 * 类型值递增，stop表示禁止滚动冒泡，比常规值大1，用于优化计算
 */
export const SG_SCROLL_TYPE = {
  // 纵向滚动
  vertical: 1000,
  vertical_stop: 1001,
  vertical_base: 1002,
  // 横向滚动
  horizontal: 2000,
  horizontal_stop: 2001,
  horizontal_base: 2002,
  // 双向滚动
  normal: 3000,
  normal_stop: 3001,
  normal_base: 3002
}