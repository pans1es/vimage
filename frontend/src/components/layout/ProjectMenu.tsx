import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { CaretDown, Plus, SlidersHorizontal } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useProjectsStore } from "@/stores/projects-store";
import { useDemoWorkbench } from "@/onboarding/use-demo-workbench";
import { getProjectDisplayName } from "@/utils/project-display";
import { ICON, iconClass } from "@/lib/icons";

/**
 * 顶栏左上的项目切换菜单。
 *
 * 触发器 = 字标首字块 + 项目名（仪器 condensed）+ 模式徽标 + chevron。
 * 下拉 = 当前项目卡片 + 新建项目 / 项目设置 操作项。
 */
export function ProjectMenu() {
  const { t } = useTranslation(["dashboard", "common"]);
  const [, setLocation] = useLocation();
  const { currentProjectData, currentProjectName } = useProjectsStore();
  // 演示项目没有项目级设置页可看，指向全局设置——与顶栏齿轮入口口径一致
  const demoMode = useDemoWorkbench();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const fallbackLabel = currentProjectName
    ? t("dashboard:untitled_project")
    : t("no_project_selected");
  const projectTitle = getProjectDisplayName(currentProjectData?.title, fallbackLabel);
  const initial = (projectTitle || "?").slice(0, 1).toUpperCase();
  const contentMode = currentProjectData?.content_mode;
  const aspectRatio =
    typeof currentProjectData?.aspect_ratio === "string"
      ? currentProjectData.aspect_ratio
      : currentProjectData?.aspect_ratio?.storyboard;
  const modeLabel = contentMode === "drama" ? "DRAMA" : contentMode === "ad" ? "AD" : "NARRATION";
  const modeTagline = aspectRatio ? `${modeLabel} · ${aspectRatio}` : modeLabel;

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-w-0 items-center gap-2.5 rounded-lg py-1 pl-1 pr-2.5 transition-colors focus-ring"
        style={{ background: open ? "var(--color-field-muted)" : "transparent" }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.background = "var(--color-field-muted)";
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.background = "transparent";
        }}
      >
        <div
          className="display-serif grid h-7 w-7 shrink-0 place-items-center rounded-md text-[13px] font-bold"
          style={{
            background: "var(--color-accent)",
            color: "var(--color-on-accent)",
            boxShadow:
              "inset 0 1px 0 oklch(1 0 0 / 0.25), inset 0 -1px 0 oklch(0 0 0 / 0.15), 0 0 0 1px oklch(1 0 0 / 0.08)",
          }}
        >
          {initial}
        </div>
        <div className="min-w-0 text-left">
          <div
            className="display-serif truncate text-[15px] font-semibold leading-[1.1]"
            style={{ letterSpacing: "0.02em" }}
          >
            {projectTitle}
          </div>
          {currentProjectData && (
            <div
              className="ui-kicker mt-0.5 text-[10px] leading-[1.1] text-text-4"
            >
              {modeTagline}
            </div>
          )}
        </div>
        <span
          className="ml-0.5 transition-transform"
          style={{
            color: "var(--color-text-4)",
            transform: open ? "rotate(180deg)" : "none",
          }}
        >
          <CaretDown className={iconClass.sm} weight={ICON.weight} />
        </span>
      </button>

      {open && (
        <div
          className="absolute left-0 z-50 min-w-[288px] rounded-xl p-1.5"
          style={{
            top: "calc(100% + 8px)",
            background: "var(--color-surface)",
            backdropFilter: "blur(20px) saturate(1.2)",
            WebkitBackdropFilter: "blur(20px) saturate(1.2)",
            border: "1px solid var(--color-hairline-strong)",
            boxShadow: "0 14px 40px -16px oklch(0.24 0.022 250 / 0.18)",
          }}
        >
          <div className="ui-kicker px-2.5 pb-1 pt-1.5 text-[10px] text-text-4">
            {t("dashboard:project_switcher_current")}
          </div>
          <div
            className="flex items-center gap-2.5 rounded-lg p-2"
            style={{
              background: "var(--color-accent-dim)",
              border: "1px solid var(--color-accent-soft)",
            }}
          >
            <div
              className="display-serif grid h-8 w-8 shrink-0 place-items-center rounded-md text-sm font-bold"
              style={{ background: "var(--color-accent)", color: "var(--color-on-accent)" }}
            >
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span
                  className="display-serif truncate text-[14px] font-semibold"
                  style={{ color: "var(--color-accent)" }}
                >
                  {projectTitle}
                </span>
                <span
                  className="ui-kicker rounded px-1 py-px text-[9px] font-semibold"
                  style={{
                    background: "var(--color-accent)",
                    color: "var(--color-on-accent)",
                  }}
                >
                  {t("dashboard:project_switcher_active_tag")}
                </span>
              </div>
              {currentProjectData && (
                <div className="mt-0.5 text-[11px] leading-[1.3] text-text-4">
                  {modeTagline}
                </div>
              )}
            </div>
          </div>
          <div
            className="mx-1.5 my-1 h-px"
            style={{ background: "var(--color-hairline-soft)" }}
          />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setLocation("~/app/projects");
            }}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[12.5px] transition-colors focus-ring"
            style={{ color: "var(--color-text-2)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--color-field-muted)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Plus
              className={iconClass.sm}
              weight={ICON.weight}
              style={{ color: "var(--color-text-4)" }}
            />
            <span>{t("dashboard:project_switcher_new")}</span>
          </button>
          <button
            type="button"
            disabled={!currentProjectName}
            onClick={() => {
              if (!currentProjectName) return;
              setOpen(false);
              setLocation(
                demoMode
                  ? "~/app/settings"
                  : `~/app/projects/${encodeURIComponent(currentProjectName)}/settings`,
              );
            }}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[12.5px] transition-colors focus-ring disabled:opacity-50"
            style={{ color: "var(--color-text-2)" }}
            onMouseEnter={(e) => {
              if (!currentProjectName) return;
              e.currentTarget.style.background = "var(--color-field-muted)";
            }}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <SlidersHorizontal
              className={iconClass.sm}
              weight={ICON.weight}
              style={{ color: "var(--color-text-4)" }}
            />
            <span>{t("dashboard:project_switcher_settings")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
