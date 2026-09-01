import type { CSSProperties } from "react";

export const ACCENT_BUTTON_STYLE: CSSProperties = {
  color: "var(--color-on-accent)",
  background: "var(--color-accent)",
  boxShadow: "none",
  border: "1px solid oklch(0.32 0.07 172)",
};

export const CARD_STYLE: CSSProperties = {
  background: "var(--color-surface)",
};

/** 顶栏 / 侧栏 / sticky chrome — 统一浅冷灰，禁止再写暗色 oklch */
export const CHROME_STYLE: CSSProperties = {
  background: "var(--color-surface-2)",
  borderColor: "var(--color-hairline)",
};

/** 文本框 / 下拉 / 可点选空井 — 纯白控件面 */
export const FIELD_STYLE: CSSProperties = {
  background: "var(--color-field)",
  border: "1px solid var(--color-hairline)",
  color: "var(--color-text)",
  boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.65)",
};

export const FIELD_MUTED_STYLE: CSSProperties = {
  background: "var(--color-field-muted)",
  border: "1px solid var(--color-hairline)",
  color: "var(--color-text)",
};

export const INPUT_CLS =
  "w-full rounded-[2px] border border-hairline bg-field px-3 py-2 text-[13px] text-text placeholder:text-text-3 transition-colors hover:border-hairline-strong focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50";

const GHOST_BTN_BASE_CLS =
  "inline-flex items-center rounded-[2px] border border-hairline bg-field text-text-2 transition-colors hover:border-hairline-strong hover:bg-field-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50";

export const GHOST_BTN_CLS = `${GHOST_BTN_BASE_CLS} gap-1.5 px-3 py-1.5 text-[12px]`;

export const GHOST_BTN_LG_CLS = `${GHOST_BTN_BASE_CLS} gap-2 px-3.5 py-2 text-[12.5px]`;

export const DROPDOWN_PANEL_STYLE: CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-hairline)",
};

const ACCENT_BTN_BASE_CLS =
  "inline-flex items-center rounded-[2px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50";

export const ACCENT_BTN_CLS = `${ACCENT_BTN_BASE_CLS} gap-2 px-4 py-2 text-[12.5px]`;

export const ACCENT_BTN_SM_CLS = `${ACCENT_BTN_BASE_CLS} gap-1.5 px-3 py-1.5 text-[12px]`;

export const ICON_BTN_CLS =
  "rounded-[2px] p-1 text-text-3 transition-colors enabled:hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40";

export const ICON_BTN_FILLED_CLS =
  "rounded-[2px] p-1.5 text-text-2 transition-colors enabled:hover:bg-field-muted enabled:hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40";

const RADIO_CARD_BASE_CLS =
  "relative flex-1 cursor-pointer rounded-[2px] border px-3.5 py-2.5 text-center text-[12.5px] transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent";

export function radioCardClass(selected: boolean): string {
  return selected
    ? `${RADIO_CARD_BASE_CLS} border-accent bg-accent-dim text-text`
    : `${RADIO_CARD_BASE_CLS} border-hairline bg-field text-text-2 hover:border-hairline-strong hover:text-text`;
}

/**
 * 由字符串派生一个稳定色相（0-359）。同名同 salt 恒得同色，换名字才换色，
 * 让「没有配图」的资源在整个界面里保持各自固定的身份色。
 */
export function hashHue(name: string, salt: number): number {
  let hash = salt;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
}

interface PosterGridOptions {
  size?: number;
  maskShape?: string;
  opacity?: number;
}

export function posterGridStyle(opts?: PosterGridOptions): CSSProperties {
  const size = opts?.size ?? 40;
  const mask = `linear-gradient(black, black)`;
  const style: CSSProperties = {
    backgroundImage:
      "linear-gradient(oklch(0.24 0.022 250 / 0.06) 1px, transparent 1px), linear-gradient(90deg, oklch(0.24 0.022 250 / 0.06) 1px, transparent 1px)",
    backgroundSize: `${size}px ${size}px`,
    maskImage: mask,
    WebkitMaskImage: mask,
  };
  if (opts?.opacity !== undefined) style.opacity = opts.opacity;
  return style;
}

interface AmbientGlowOptions {
  at?: string;
  intensity?: number;
}

export function ambientGlowStyle(opts?: AmbientGlowOptions): CSSProperties {
  const at = opts?.at ?? "50% 0%";
  const alpha = (opts?.intensity ?? 0.16) * 0.28;
  return {
    background: `radial-gradient(circle at ${at}, oklch(0.42 0.085 170 / ${alpha}), transparent 62%)`,
  };
}
