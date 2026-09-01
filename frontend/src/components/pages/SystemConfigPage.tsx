
import { useEffect, useMemo, type ComponentType } from "react";
import { Link, useLocation, useSearch } from "wouter";
import {
  Warning,
  ChartBar,
  Robot,
  CaretLeft,
  FilmStrip,
  Info,
  Key,
  Translate,
  Plugs,
  TreeStructure,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useConfigStatusStore } from "@/stores/config-status-store";
import { ONBOARDING_ANCHORS } from "@/onboarding/anchors";
import { AgentConfigTab } from "./AgentConfigTab";
import { ApiKeysTab } from "./ApiKeysTab";
import { AboutSection } from "./settings/AboutSection";
import { MediaModelSection } from "./settings/MediaModelSection";
import { ProviderSection } from "./ProviderSection";
import { UsageStatsSection } from "./settings/UsageStatsSection";
import { EndpointsSection } from "./settings/endpoints/EndpointsSection";
import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_DISPLAY_LABELS,
  setAppLanguage,
  type SupportedLanguage,
} from "@/i18n";
import { ICON, iconClass } from "@/lib/icons";
import { cn } from "@/lib/utils";

function isUiLanguage(code: string): code is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(code);
}

// 全局设置页 · Control Booth — 手术室仪器台视觉，功能与路由不变。

type SettingsSection =
  | "agent"
  | "providers"
  | "endpoints"
  | "media"
  | "usage"
  | "api-keys"
  | "about";

/** 引导第 5/6 步指向的侧栏入口——只有这两项挂锚点，其余小节不在当前引导覆盖范围内。 */
const SECTION_ONBOARDING_ANCHORS: Partial<Record<SettingsSection, string>> = {
  providers: ONBOARDING_ANCHORS.settingsProviders,
  agent: ONBOARDING_ANCHORS.settingsAgent,
};

interface SectionDef {
  id: SettingsSection;
  labelKey: string;
  Icon: ComponentType<{ className?: string; weight?: "regular" | "bold" }>;
}

interface SectionGroup {
  kicker: string;
  items: SectionDef[];
}

const SECTION_GROUPS: SectionGroup[] = [
  {
    kicker: "Configuration",
    items: [
      { id: "providers", labelKey: "dashboard:providers", Icon: Plugs },
      { id: "endpoints", labelKey: "dashboard:ce_section_title", Icon: TreeStructure },
      { id: "agent", labelKey: "dashboard:agents", Icon: Robot },
      { id: "media", labelKey: "dashboard:models", Icon: FilmStrip },
    ],
  },
  {
    kicker: "Access",
    items: [
      { id: "usage", labelKey: "dashboard:usage", Icon: ChartBar },
      { id: "api-keys", labelKey: "dashboard:api_keys", Icon: Key },
    ],
  },
  {
    kicker: "System",
    items: [{ id: "about", labelKey: "dashboard:about", Icon: Info }],
  },
];

export function SystemConfigPage() {
  const { t, i18n } = useTranslation(["common", "dashboard"]);
  const [location, navigate] = useLocation();
  const search = useSearch();

  const activeSection = useMemo((): SettingsSection => {
    const section = new URLSearchParams(search).get("section");
    if (section === "agent") return "agent";
    if (section === "endpoints") return "endpoints";
    if (section === "media") return "media";
    if (section === "usage") return "usage";
    if (section === "api-keys") return "api-keys";
    if (section === "about") return "about";
    return "providers";
  }, [search]);

  const setActiveSection = (section: SettingsSection) => {
    const params = new URLSearchParams(search);
    params.set("section", section);
    navigate(`${location}?${params.toString()}`, { replace: true });
  };

  const configIssues = useConfigStatusStore((s) => s.issues);
  const fetchConfigStatus = useConfigStatusStore((s) => s.fetch);

  useEffect(() => {
    void fetchConfigStatus();
  }, [fetchConfigStatus]);

  const currentLang = (
    isUiLanguage(i18n.language.split("-")[0] ?? "")
      ? (i18n.language.split("-")[0] as SupportedLanguage)
      : "zh"
  );
  const langDisplay = LANGUAGE_DISPLAY_LABELS[currentLang];

  const cycleLang = () => {
    const idx = SUPPORTED_LANGUAGES.indexOf(currentLang);
    const nextIdx = idx === -1 ? 0 : (idx + 1) % SUPPORTED_LANGUAGES.length;
    setAppLanguage(SUPPORTED_LANGUAGES[nextIdx]);
  };

  return (
    <div
      className="relative flex h-screen flex-col text-text"
      style={{
        background:
          "radial-gradient(900px 480px at 8% -10%, oklch(0.42 0.085 170 / 0.07), transparent 55%), radial-gradient(800px 460px at 100% 110%, oklch(0.42 0.05 230 / 0.05), transparent 55%), linear-gradient(180deg, var(--color-bg-grad-a), var(--color-bg-grad-b))",
      }}
    >
      <header
        className="relative sticky top-0 z-30 shrink-0"
        style={{
          height: "var(--chrome-header-h)",
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-hairline)",
          boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.8), 0 1px 0 var(--color-hairline-soft)",
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
          style={{
            background:
              "linear-gradient(90deg, var(--color-rail) 0%, var(--color-accent-2) 45%, var(--color-accent) 100%)",
          }}
        />
        <div className="mx-auto flex h-full max-w-[1400px] items-center gap-4 px-6">
          <Link
            href="/app/projects"
            className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-field px-3 py-2 text-[12.5px] font-medium text-text-2 transition-colors hover:border-hairline-strong hover:bg-field-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={t("common:back")}
          >
            <CaretLeft className={iconClass.sm} weight={ICON.weight} />
            <span>{t("common:back")}</span>
          </Link>
          <span aria-hidden className="h-5 w-px bg-hairline-soft" />
          <div className="min-w-0 flex-1">
            <h1 className="display-serif truncate text-[22px] font-semibold tracking-wide text-text">
              {t("common:settings")}
            </h1>
            <p className="mt-0.5 truncate text-[12.5px] text-text-3">
              {t("dashboard:system_config_title")}
            </p>
          </div>
          <button
            type="button"
            onClick={cycleLang}
            className="inline-flex items-center gap-2 rounded-xl border border-hairline bg-field px-3 py-2 text-[12px] text-text-2 transition-colors hover:border-hairline-strong hover:bg-field-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            title={langDisplay}
            aria-label={t("dashboard:language_setting")}
          >
            <Translate className={iconClass.sm} weight={ICON.weight} />
            <span className="ui-kicker text-[10px] text-text-3">{currentLang}</span>
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <nav
          aria-label={t("common:settings")}
          className="w-[232px] shrink-0 overflow-y-auto border-r border-hairline-soft px-3 py-5"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.42 0.085 170 / 0.04), transparent 28%), var(--color-surface-2)",
          }}
        >
          {SECTION_GROUPS.map((group, gi) => (
            <div key={group.kicker} className={gi > 0 ? "mt-6" : undefined}>
              <div className="ui-kicker mb-2 px-3 text-text-4">{group.kicker}</div>
              {group.items.map(({ id, labelKey, Icon }) => {
                const isActive = activeSection === id;
                const hasIssue =
                  (id === "providers" || id === "agent" || id === "media") &&
                  configIssues.length > 0;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveSection(id)}
                    data-onboarding={SECTION_ONBOARDING_ANCHORS[id]}
                    aria-current={isActive ? "page" : undefined}
                    aria-pressed={isActive}
                    className={cn(
                      "group relative mb-1 flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      isActive
                        ? "border-accent/35 bg-field font-semibold text-text shadow-[inset_3px_0_0_var(--color-accent)]"
                        : "border-transparent text-text-2 hover:border-hairline-soft hover:bg-field hover:text-text",
                    )}
                  >
                    <Icon
                      className={cn(
                        iconClass.md,
                        "shrink-0",
                        isActive ? "text-accent" : "text-text-3 group-hover:text-text-2",
                      )}
                      weight={isActive ? "bold" : ICON.weight}
                    />
                    <span className="flex-1 truncate">{t(labelKey)}</span>
                    {hasIssue && (
                      <span
                        aria-label={t("dashboard:config_incomplete")}
                        className="grid h-5 w-5 place-items-center rounded-full"
                        style={{
                          background: "var(--color-warm-tint-faint)",
                          color: "var(--color-warm)",
                          border: "1px solid var(--color-warm-ring)",
                        }}
                      >
                        <Warning className="h-3 w-3" weight={ICON.weight} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <main className="min-w-0 flex-1 overflow-y-auto">
          {activeSection === "providers" ? (
            <ProviderSection />
          ) : activeSection === "endpoints" ? (
            <EndpointsSection />
          ) : (
            <div className="mx-auto max-w-4xl px-8 py-8">
              {configIssues.length > 0 && (
                <div
                  className="mb-7 rounded-2xl border p-4"
                  style={{
                    borderColor: "var(--color-warm-ring)",
                    background: "var(--color-warm-tint)",
                  }}
                >
                  <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-warm">
                    <Warning className={iconClass.sm} weight={ICON.weight} />
                    {t("dashboard:config_issues")}
                  </div>
                  <p className="mb-2.5 text-[12.5px] leading-[1.55] text-text-2">
                    {t("dashboard:config_issues_hint")}
                  </p>
                  <ul className="space-y-1.5">
                    {configIssues.map((issue, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-[12.5px] text-text-3"
                      >
                        <span
                          aria-hidden
                          className="mt-1.5 h-[5px] w-[5px] shrink-0 rounded-full"
                          style={{ background: "var(--color-warm)" }}
                        />
                        {t(`dashboard:${issue.label}`)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeSection === "agent" && <AgentConfigTab visible />}
              {activeSection === "media" && <MediaModelSection />}
              {activeSection === "usage" && <UsageStatsSection />}
              {activeSection === "api-keys" && <ApiKeysTab />}
              {activeSection === "about" && <AboutSection />}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
