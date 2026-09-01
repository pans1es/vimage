
import { useState, useEffect, useMemo, useCallback, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { ChartBar, CircleNotch } from "@phosphor-icons/react";
import { API } from "@/api";
import { CARD_STYLE } from "@/components/ui/darkroom-tokens";
import { ICON, iconClass } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { formatCostOrZero } from "@/utils/cost-format";
import type { UsageStat } from "@/types";

const KPI_VALUE_STYLE: CSSProperties = {
  fontSize: 26,
  fontWeight: 600,
  letterSpacing: "0.02em",
  lineHeight: 1.05,
  color: "var(--color-text)",
  fontVariantNumeric: "tabular-nums",
};

const STAT_VALUE_STYLE: CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  letterSpacing: "0.01em",
  color: "var(--color-text)",
  fontVariantNumeric: "tabular-nums",
};

export function UsageStatsSection() {
  const { t, i18n } = useTranslation("dashboard");
  const [stats, setStats] = useState<UsageStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7);
  const [providerFilter, setProviderFilter] = useState<string>("");

  const percentFmt = useMemo(() => {
    const lang = i18n.language.split("-")[0];
    const localeMap: Record<string, string> = { zh: "zh-CN", en: "en-US" };
    const locale = localeMap[lang] ?? "en-US";
    return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 });
  }, [i18n.language]);

  const TIME_RANGES = useMemo(
    () => [
      { label: t("last_7_days"), days: 7 },
      { label: t("last_30_days"), days: 30 },
      { label: t("all"), days: 0 },
    ],
    [t],
  );

  const fetchStats = useCallback(async () => {
    setLoading(true);
    const params: { provider?: string; start?: string; end?: string } = {};
    if (providerFilter) params.provider = providerFilter;
    if (timeRange > 0) {
      const start = new Date();
      start.setDate(start.getDate() - timeRange);
      params.start = start.toISOString().split("T")[0];
      params.end = new Date().toISOString().split("T")[0];
    }
    try {
      const res = await API.getUsageStatsGrouped(params);
      setStats(res.stats || []);
    } catch {
      setStats([]);
    }
    setLoading(false);
  }, [timeRange, providerFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 依赖变化时重新获取统计数据，fetchStats 内部有 setState
    void fetchStats();
    // 供应商名由后端按 Accept-Language 成文，语言切换后须重取，否则列表停留在切换前的语言。
  }, [fetchStats, i18n.language]);

  const providers = useMemo(() => {
    const locale = i18n.language;
    const byProvider = new Map<string, string | undefined>();
    for (const s of stats) {
      if (!byProvider.has(s.provider)) byProvider.set(s.provider, s.display_name);
    }
    return Array.from(byProvider.entries())
      .map(([provider, displayName]) => ({ provider, displayName }))
      .sort((a, b) => (a.displayName || a.provider).localeCompare(b.displayName || b.provider, locale));
  }, [stats, i18n.language]);

  // Aggregate totals — used for the editorial header summary card.
  // 这里只是求和：用 Object.entries 直接遍历，避免 costEntries 的排序/过滤开销
  // （那是 UI 展示语义，不是聚合语义）。累加后统一 4 位小数四舍五入，与
  // totalBreakdown 的精度处理保持一致，避免浮点累加产生 1.76000000000002。
  const totals = useMemo(() => {
    const costByCurrency: Record<string, number> = {};
    let calls = 0;
    let success = 0;
    for (const s of stats) {
      for (const [currency, amount] of Object.entries(s.cost_by_currency ?? {})) {
        costByCurrency[currency] = (costByCurrency[currency] ?? 0) + amount;
      }
      calls += s.total_calls;
      success += s.success_calls;
    }
    for (const currency of Object.keys(costByCurrency)) {
      costByCurrency[currency] = Math.round(costByCurrency[currency] * 10000) / 10000;
    }
    return { costByCurrency, calls, success };
  }, [stats]);

  return (
    <div className="space-y-7">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-hairline"
          style={{
            background:
              "linear-gradient(160deg, oklch(0.42 0.085 170 / 0.12), oklch(0.96 0.01 170))",
            color: "var(--color-accent)",
          }}
        >
          <ChartBar className={iconClass.lg} weight={ICON.weight} />
        </span>
        <div className="min-w-0">
          <h3 className="display-serif text-[24px] font-semibold tracking-wide text-text">
            {t("usage_stats")}
          </h3>
          <p className="mt-1.5 text-[12.5px] leading-[1.6] text-text-3">
            {t("usage_stats_by_provider")}
          </p>
        </div>
      </div>

      <div
        className="grid grid-cols-1 overflow-hidden rounded-2xl border border-hairline sm:grid-cols-3"
        style={{
          ...CARD_STYLE,
          background:
            "linear-gradient(135deg, oklch(0.42 0.085 170 / 0.06), transparent 42%), var(--color-surface)",
        }}
      >
        {[
          { label: t("total_cost"), value: formatCostOrZero(totals.costByCurrency) },
          { label: t("total_calls"), value: totals.calls.toLocaleString() },
          {
            label: t("success_rate"),
            value:
              totals.calls > 0 ? percentFmt.format(totals.success / totals.calls) : "—",
          },
        ].map((kpi, i) => (
          <div
            key={kpi.label}
            className={cn(
              "relative px-5 py-5",
              i > 0 && "border-t border-hairline-soft sm:border-t-0 sm:border-l",
            )}
          >
            {i === 0 && (
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-[2px] sm:inset-y-0 sm:left-0 sm:h-auto sm:w-[2px]"
                style={{ background: "var(--color-accent)" }}
              />
            )}
            <div className="ui-kicker text-text-4">{kpi.label}</div>
            <div className="display-serif mt-2" style={KPI_VALUE_STYLE}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {TIME_RANGES.map((r) => {
          const active = timeRange === r.days;
          return (
            <button
              key={r.days}
              type="button"
              onClick={() => setTimeRange(r.days)}
              aria-pressed={active}
              className={cn(
                "rounded-xl border px-3.5 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                active
                  ? "border-accent/45 bg-accent-dim text-accent"
                  : "border-hairline-soft bg-field-muted text-text-3 hover:border-hairline hover:text-text",
              )}
            >
              {r.label}
            </button>
          );
        })}
        {providers.length > 0 && (
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            aria-label={t("filter_by_provider")}
            className="rounded-xl border border-hairline-soft bg-field-muted px-3 py-1.5 text-[12px] text-text-2 transition-colors hover:border-hairline focus:border-accent/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <option value="">{t("all_providers")}</option>
            {providers.map(({ provider, displayName }) => (
              <option key={provider} value={provider}>
                {displayName || provider}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 px-1 text-text-3">
          <CircleNotch
            className={cn(iconClass.sm, "motion-safe:animate-spin text-accent")}
            weight={ICON.weight}
            aria-hidden
          />
          <span className="ui-kicker text-text-3">{t("common:loading")}</span>
        </div>
      ) : stats.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-hairline bg-field-muted/60 px-5 py-12 text-center text-[12.5px] text-text-3">
          {t("no_data")}
        </div>
      ) : (
        <div className="space-y-2.5">
          {stats.map((s) => {
            const successRate =
              s.total_calls > 0 ? s.success_calls / s.total_calls : 0;
            return (
              <div
                key={`${s.provider}-${s.call_type}`}
                className="rounded-2xl border border-hairline px-5 py-4 transition-colors hover:border-hairline-strong"
                style={CARD_STYLE}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="ui-kicker text-text-4">{s.call_type}</div>
                    <div className="mt-0.5 truncate text-[14px] font-medium text-text">
                      {s.display_name ?? s.provider}
                    </div>
                  </div>
                  <div className="display-serif shrink-0" style={STAT_VALUE_STYLE}>
                    {formatCostOrZero(s.cost_by_currency)}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-[11px] tabular-nums text-text-3">
                  <span>
                    <span className="text-text-4">CALLS </span>
                    {s.total_calls}
                  </span>
                  <span>
                    <span className="text-text-4">OK </span>
                    {s.success_calls}
                  </span>
                  <span>
                    <span className="text-text-4">RATE </span>
                    <span className={successRate >= 0.95 ? "text-good" : "text-warm"}>
                      {s.total_calls > 0 ? percentFmt.format(successRate) : "0%"}
                    </span>
                  </span>
                  {s.call_type === "text"
                    ? s.total_calls > 0 && (
                        <span>
                          <span className="text-text-4">TYPE </span>
                          {t("text_generation")}
                        </span>
                      )
                    : s.total_duration_seconds !== undefined && (
                        <span>
                          <span className="text-text-4">DUR </span>
                          {s.total_duration_seconds}s
                        </span>
                      )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
