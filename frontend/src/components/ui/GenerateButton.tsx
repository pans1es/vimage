import { Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ICON, iconClass } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface GenerateButtonProps {
  onClick: () => void;
  loading?: boolean;
  label?: string;
  className?: string;
  disabled?: boolean;
  layoutId?: string;
}

/**
 * 生成主操作 — scrub 绿实心 + 轻抬起；loading 时脉冲。
 * 签名细节留给这一处 CTA，其余壳层保持安静。
 */
export function GenerateButton({
  onClick,
  loading = false,
  label = "生成",
  className,
  disabled = false,
  layoutId,
}: GenerateButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type="button"
      layout
      layoutId={layoutId}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "focus-ring inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-transform",
        isDisabled ? "cursor-not-allowed opacity-60" : "",
        className,
      )}
      style={{
        color: "var(--color-on-accent)",
        background: loading ? "var(--color-accent-2)" : "var(--color-accent)",
        border: "1px solid oklch(0.32 0.07 172)",
        boxShadow: loading
          ? "none"
          : "inset 0 1px 0 oklch(1 0 0 / 0.18), 0 4px 12px -6px var(--color-accent-glow)",
      }}
      animate={
        loading
          ? { opacity: [0.75, 1, 0.75] }
          : { opacity: isDisabled ? 0.6 : 1 }
      }
      whileHover={isDisabled ? undefined : { y: -1 }}
      transition={
        loading
          ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.3 }
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.span
            key="loader"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <Loader2 className={cn(iconClass.md, "animate-spin")} strokeWidth={ICON.stroke} />
          </motion.span>
        ) : (
          <motion.span
            key="sparkles"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <Sparkles className={iconClass.md} strokeWidth={ICON.stroke} />
          </motion.span>
        )}
      </AnimatePresence>
      <span>{loading ? "生成中..." : label}</span>
    </motion.button>
  );
}
