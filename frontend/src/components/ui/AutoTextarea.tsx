import { useAutoResizeTextarea } from "@/hooks/useAutoResizeTextarea";
import { FIELD_STYLE } from "@/components/ui/darkroom-tokens";

interface AutoTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
  /** 只读展示：文本仍可选中复制，但不接受输入。 */
  readOnly?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

/** Auto-resizing textarea that grows with its content. */
export function AutoTextarea({
  value,
  onChange,
  placeholder,
  className,
  id,
  disabled,
  readOnly,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: AutoTextareaProps) {
  const { ref, resize } = useAutoResizeTextarea(value);

  return (
    <textarea
      ref={ref}
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      disabled={disabled}
      readOnly={readOnly}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onInput={resize}
      placeholder={placeholder}
      rows={2}
      className={`focus-ring w-full resize-none overflow-hidden rounded-[2px] px-2.5 py-2 font-mono text-xs outline-none placeholder:text-text-3 disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ""}`}
      style={FIELD_STYLE}
    />
  );
}
