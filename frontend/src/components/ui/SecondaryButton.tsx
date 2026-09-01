import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md";
  leadingIcon?: ReactNode;
  children?: ReactNode;
}

const SIZE_CLS: Record<NonNullable<SecondaryButtonProps["size"]>, string> = {
  sm: "h-7 px-3 text-[12px]",
  md: "h-8 px-4 text-[13px]",
};

/** 次按钮 — Cancel / 普通操作。底层走 shadcn Button secondary。 */
export const SecondaryButton = forwardRef<HTMLButtonElement, SecondaryButtonProps>(
  function SecondaryButton(
    { size = "md", leadingIcon, className = "", children, type = "button", ...rest },
    ref,
  ) {
    return (
      <Button
        ref={ref}
        type={type}
        variant="secondary"
        className={cn("arc-btn-secondary", SIZE_CLS[size], className)}
        {...rest}
      >
        {leadingIcon}
        {children}
      </Button>
    );
  },
);
