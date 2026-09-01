import { BRAND } from "@/branding";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  size?: number;
}

/**
 * vimage 字标图形：圆角监视器框 + 中心「V」折线，scrub 绿实心。
 */
export function BrandMark({ className, size = 22 }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <rect
        x="2.5"
        y="3.5"
        width="19"
        height="17"
        rx="4"
        fill="var(--color-accent)"
      />
      <path
        d="M7.5 8.25 12 16.25 16.5 8.25"
        stroke="var(--color-on-accent)"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 19.5h6"
        stroke="var(--color-on-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

interface BrandWordmarkProps {
  className?: string;
  /** 字号 class，默认跟顶栏一致 */
  sizeClassName?: string;
  /** 是否显示图形标 */
  showMark?: boolean;
  markSize?: number;
}

/**
 * 产品字标：图形标 + 半粗正体字重，仪器感，不做斜体黑重。
 */
export function BrandWordmark({
  className = "",
  sizeClassName = "text-[16px]",
  showMark = true,
  markSize = 22,
}: BrandWordmarkProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-2 text-text", className)}
    >
      {showMark ? <BrandMark size={markSize} /> : null}
      <span
        className={cn(
          "font-semibold not-italic tracking-tight display-serif",
          sizeClassName,
        )}
        style={{
          letterSpacing: "0.01em",
        }}
      >
        {BRAND.name}
      </span>
    </span>
  );
}
