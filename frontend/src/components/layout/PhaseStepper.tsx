import { useTranslation } from "react-i18next";
import { PHASE_ORDER } from "@/types";

interface PhaseStepperProps {
  currentPhase: string | undefined;
}

/**
 * 顶栏阶段步进器：胶囊样式（圆形号 + 标签 + 短分隔线）。
 * 当前阶段用 scrub 绿高亮；仪器 condensed 标签，与侧栏轨形成对比。
 */
export function PhaseStepper({ currentPhase }: PhaseStepperProps) {
  const { t } = useTranslation("dashboard");
  const currentIdx = PHASE_ORDER.findIndex((p) => p === currentPhase);

  return (
    <nav aria-label={t("workflow_phases")}>
      <div
        className="inline-flex items-center gap-0.5 rounded-full p-1"
        style={{
          background: "var(--color-field-muted)",
          border: "1px solid var(--color-hairline)",
          boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.7)",
        }}
      >
        {PHASE_ORDER.map((phase, idx) => {
          const isActive = currentIdx === idx;
          const isPastOrActive = currentIdx >= 0 && currentIdx >= idx;
          const nextIsActive = currentIdx === idx + 1;
          return (
            <div key={phase} className="flex items-center">
              <div
                aria-current={isActive ? "step" : undefined}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors"
                style={
                  isActive
                    ? {
                        color: "var(--color-text)",
                        background: "var(--color-field)",
                        boxShadow: "0 0 0 1px var(--color-accent-soft)",
                      }
                    : { color: "var(--color-text-3)", background: "transparent" }
                }
              >
                <span
                  className="display-serif inline-grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold"
                  style={
                    isActive
                      ? {
                          background: "var(--color-accent)",
                          color: "var(--color-on-accent)",
                        }
                      : {
                          background: "var(--color-field)",
                          border: "1px solid var(--color-hairline)",
                          color: "var(--color-text-3)",
                        }
                  }
                >
                  {idx + 1}
                </span>
                <span className="whitespace-nowrap tracking-tight">{t(`phase_${phase}`)}</span>
              </div>
              {idx < PHASE_ORDER.length - 1 && (
                <div
                  aria-hidden="true"
                  className="mx-0.5 h-px w-2"
                  style={{
                    background:
                      isPastOrActive || nextIsActive
                        ? "var(--color-accent-soft)"
                        : "var(--color-hairline-soft)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
