/**
 * 全站图标约定（Phosphor Regular + Lucide 遗留面）。
 * 壳层 / 大厅 / 登录优先 Phosphor；画布深处仍可用 Lucide，描边保持细线。
 */
export const ICON = {
  stroke: 1.5,
  strokeMuted: 1.5,
  /** Phosphor weight */
  weight: "regular" as const,
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
  },
} as const;

export const iconClass = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-[18px] w-[18px]",
  xl: "h-5 w-5",
} as const;
