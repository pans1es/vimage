import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-ring inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-[13px] font-medium transition-[background,color,border-color,opacity,box-shadow] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-accent)] text-[var(--color-on-accent)] border border-[oklch(0.32_0.07_172)] hover:bg-[var(--color-accent-2)]",
        secondary:
          "bg-[var(--color-field)] text-[var(--color-text-2)] border border-[var(--color-hairline)] hover:bg-[var(--color-field-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-hairline-strong)]",
        ghost:
          "text-[var(--color-text-3)] hover:bg-[var(--color-field-muted)] hover:text-[var(--color-text)]",
        outline:
          "border border-[var(--color-hairline)] bg-transparent text-[var(--color-text-2)] hover:bg-[var(--color-field-muted)]",
        warm: "bg-[var(--color-warm)] text-[oklch(0.20_0.04_95)] border border-[oklch(0.52_0.12_95)] hover:bg-[var(--color-warm-bright)]",
        danger:
          "bg-[var(--color-danger)] text-[var(--color-on-accent)] border border-[oklch(0.42_0.16_25)] hover:bg-[var(--color-danger-2)]",
      },
      size: {
        default: "h-8 px-4 py-2",
        sm: "h-7 rounded-md px-3 text-[12px]",
        lg: "h-9 rounded-md px-5",
        icon: "h-[30px] w-[30px]",
        "icon-sm": "h-7 w-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type = "button", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        type={asChild ? undefined : type}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
