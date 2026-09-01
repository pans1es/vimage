import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CustomProviderInfo } from "@/types";

// ---------------------------------------------------------------------------
// Status dot (replicates preset provider pattern)
// ---------------------------------------------------------------------------

function CustomStatusDot({ provider }: { provider: CustomProviderInfo }) {
  const { t } = useTranslation("dashboard");
  const ready = provider.base_url && provider.api_key_masked;
  const color = ready ? "bg-good" : "bg-text-4";
  const label = ready ? t("status_connected") : t("status_unconfigured");
  return <span className={`h-2 w-2 shrink-0 rounded-full ${color}`} role="img" aria-label={label} />;
}

// ---------------------------------------------------------------------------
// Sidebar section for custom providers
// ---------------------------------------------------------------------------

interface CustomProviderSectionProps {
  providers: CustomProviderInfo[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAdd: () => void;
}

export function CustomProviderSection({ providers, selectedId, onSelect, onAdd }: CustomProviderSectionProps) {
  const { t } = useTranslation("dashboard");
  return (
    <div className="mt-3 border-t border-hairline pt-3">
      <div className="px-3 pb-2 font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-text-3">
        {t("custom_providers")}
      </div>
      {providers.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onSelect(p.id)}
          className={`mb-0.5 flex w-full items-center gap-2.5 rounded-[6px] border px-3 py-2 text-left text-[12.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            selectedId === p.id
              ? "border-accent/40 bg-field text-text shadow-[inset_3px_0_0_var(--color-accent)]"
              : "border-transparent text-text-2 hover:border-hairline-soft hover:bg-field hover:text-text"
          }`}
        >
          {/* 自定义 provider 恒用字母徽章，不按 display_name 猜品牌：中转站协议无关，
              打某品牌图标会名不副实，且自由文本名匹配对中文名割裂。将来若要品牌化，
              走用户显式选图标，而非名字猜测。 */}
          <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] border border-hairline bg-field font-mono text-[10px] font-bold uppercase text-text-2">
            {Array.from(p.display_name)[0] ?? "?"}
          </span>
          <span className="min-w-0 flex-1 truncate">{p.display_name}</span>
          <CustomStatusDot provider={p} />
        </button>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="mt-1 flex w-full items-center gap-2.5 rounded-[2px] border border-dashed border-hairline bg-field px-3 py-2 text-left text-[12.5px] text-accent transition-colors hover:border-accent hover:bg-accent-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{t("add_custom_provider")}</span>
      </button>
    </div>
  );
}
