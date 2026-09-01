import { FIELD_STYLE } from "@/components/ui/darkroom-tokens";

interface CompactInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** 只读展示：保留可选中的文本，但不接受输入。 */
  readOnly?: boolean;
}

/** Single-line labeled input — 亮色控件面，与标签拉开对比。 */
export function CompactInput({
  label,
  value,
  onChange,
  placeholder,
  className,
  readOnly,
}: CompactInputProps) {
  return (
    <label className={`flex items-center gap-2 ${className ?? ""}`}>
      <span className="shrink-0 text-[11px] font-medium text-text-2">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
        className="focus-ring min-w-0 flex-1 rounded-[2px] px-2 py-1 text-xs outline-none placeholder:text-text-3"
        style={FIELD_STYLE}
      />
    </label>
  );
}
