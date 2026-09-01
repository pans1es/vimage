import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PrimaryButtonTone = "accent" | "warm" | "danger";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: PrimaryButtonTone;
  size?: "sm" | "md";
  leadingIcon?: ReactNode;
  children?: ReactNode;
}

const SIZE_CLS: Record<NonNullable<PrimaryButtonProps["size"]>, string> = {
  sm: "h-7 px-3 text-[12px]",
  md: "h-8 px-4 text-[13px]",
};

const TONE_VARIANT = {
  accent: "default",
  warm: "warm",
  danger: "danger",
} as const;

/** 主 CTA — scrub 绿（accent）/ 暖色（导出）/ 危险（删除）。底层走 shadcn Button。 */
export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  function PrimaryButton(
    { tone = "accent", size = "md", leadingIcon, className = "", children, type = "button", ...rest },
    ref,
  ) {
    return (
      <Button
        ref={ref}
        type={type}
        data-tone={tone}
        variant={TONE_VARIANT[tone]}
        className={cn("arc-btn-primary", SIZE_CLS[size], className)}
        {...rest}
      >
        {leadingIcon}
        {children}
      </Button>
    );
  },
);
