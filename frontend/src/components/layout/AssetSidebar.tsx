import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  Buildings,
  CaretLeft,
  CaretRight,
  FilmSlate,
  MagnifyingGlass,
  Package,
  Plus,
  ShoppingCart,
  SquaresFour,
  Users,
} from "@phosphor-icons/react";
import { useProjectsStore } from "@/stores/projects-store";
import { useCostStore } from "@/stores/cost-store";
import { useAppStore } from "@/stores/app-store";
import { API } from "@/api";
import { useDemoWorkbench } from "@/onboarding/use-demo-workbench";
import { isDemoProject } from "@/onboarding/demo-project";
import { normalizeRoute } from "@/utils/generation-mode";
import { ICON, iconClass } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { BrandWordmark } from "@/components/ui/BrandWordmark";
import { EpisodeCard } from "./EpisodeCard";

interface AssetSidebarProps {
  className?: string;
}

interface NavItem {
  key: string;
  path: string;
  label: string;
  icon: React.ComponentType<{
    className?: string;
    weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  }>;
  meta?: number;
}

/**
 * 工作台侧栏：scrub 绿仪器轨 + Phosphor 导航 + 分集列表。
 * 展开宽约 280px，折叠为图标轨。
 */
export function AssetSidebar({ className }: AssetSidebarProps) {
  const { t } = useTranslation(["common", "dashboard"]);
  const { currentProjectName, currentProjectData } = useProjectsStore();
  const debouncedFetchCost = useCostStore((s) => s.debouncedFetch);
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");

  const characterCount = Object.keys(currentProjectData?.characters ?? {}).length;
  const sceneCount = Object.keys(currentProjectData?.scenes ?? {}).length;
  const propCount = Object.keys(currentProjectData?.props ?? {}).length;
  const productCount = Object.keys(currentProjectData?.products ?? {}).length;
  const episodes = currentProjectData?.episodes ?? [];
  const isAd = currentProjectData?.content_mode === "ad";

  const sourceFilesVersion = useAppStore((s) => s.sourceFilesVersion);
  const [sourceCount, setSourceCount] = useState<number>(0);
  const demoMode = useDemoWorkbench();

  useEffect(() => {
    if (currentProjectName) debouncedFetchCost(currentProjectName);
  }, [currentProjectName, debouncedFetchCost]);

  useEffect(() => {
    if (!currentProjectName || demoMode || isDemoProject(currentProjectName)) return;
    let cancelled = false;
    API.listFiles(currentProjectName)
      .then((res) => {
        if (!cancelled) setSourceCount(res.files?.source?.length ?? 0);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [currentProjectName, sourceFilesVersion, demoMode]);

  const activeEp = useMemo(() => {
    const m = location.match(/^\/episodes\/(\d+)/);
    return m ? parseInt(m[1], 10) : null;
  }, [location]);

  const navItems: NavItem[] = [
    { key: "overview", path: "/", label: t("dashboard:workspace_nav_overview"), icon: SquaresFour },
    ...(demoMode
      ? []
      : [
          {
            key: "source",
            path: "/source",
            label: t("dashboard:workspace_nav_source"),
            icon: BookOpen,
            meta: sourceCount,
          },
        ]),
    {
      key: "characters",
      path: "/characters",
      label: t("dashboard:workspace_nav_characters"),
      icon: Users,
      meta: characterCount,
    },
    {
      key: "scenes",
      path: "/scenes",
      label: t("dashboard:workspace_nav_scenes"),
      icon: Buildings,
      meta: sceneCount,
    },
    {
      key: "props",
      path: "/props",
      label: t("dashboard:workspace_nav_props"),
      icon: Package,
      meta: propCount,
    },
    ...(isAd
      ? [
          {
            key: "products",
            path: "/products",
            label: t("dashboard:workspace_nav_products"),
            icon: ShoppingCart,
            meta: productCount,
          },
        ]
      : []),
  ];

  const isNavActive = (item: NavItem): boolean => {
    if (item.path === "/") return location === "/";
    return location === item.path || location.startsWith(item.path + "/");
  };

  const filteredEps = isAd
    ? episodes
    : episodes.filter(
        (ep) => !search || ep.title.includes(search) || String(ep.episode).includes(search),
      );

  return (
    <aside
      data-chrome="rail"
      className={cn("app-sidebar flex flex-col overflow-hidden", className)}
      style={{
        width: collapsed ? "var(--chrome-sidebar-collapsed)" : "var(--chrome-sidebar-w)",
        transition: "width .2s ease",
      }}
    >
      <div
        className={cn(
          "flex items-center gap-2 px-3 pb-3 pt-3.5",
          collapsed && "justify-center px-2",
        )}
        style={{ borderBottom: "1px solid var(--color-rail-line)" }}
      >
        {collapsed ? (
          <BrandWordmark showMark markSize={22} sizeClassName="sr-only" />
        ) : (
          <BrandWordmark markSize={20} sizeClassName="text-[15px] text-[var(--color-rail-text)]" />
        )}
      </div>

      <div className="px-2.5 pb-2 pt-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(item);
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setLocation(item.path)}
              title={collapsed ? item.label : ""}
              aria-label={collapsed ? item.label : undefined}
              className="relative mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors focus-ring"
              style={{
                background: active ? "oklch(1 0 0 / 0.14)" : "transparent",
                color: active ? "var(--color-rail-text)" : "var(--color-rail-muted)",
                boxShadow: active ? "inset 3px 0 0 oklch(0.88 0.06 168)" : undefined,
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = "oklch(1 0 0 / 0.08)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              <Icon
                className={cn(iconClass.lg, "shrink-0")}
                weight={active ? "fill" : ICON.weight}
              />
              {!collapsed && (
                <>
                  <span
                    className="flex-1 text-left text-[13.5px]"
                    style={{ fontWeight: active ? 600 : 500 }}
                  >
                    {item.label}
                  </span>
                  {item.meta != null && (
                    <span
                      className="num rounded-md px-1.5 py-px text-[11px]"
                      style={{
                        color: active ? "var(--color-rail-text)" : "var(--color-rail-muted)",
                        background: active ? "oklch(0 0 0 / 0.22)" : "transparent",
                      }}
                    >
                      {item.meta}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      <div className="mx-3.5 my-1 h-px" style={{ background: "var(--color-rail-line)" }} />

      {!collapsed ? (
        <>
          <div className="flex items-center gap-2 px-3.5 pb-1.5 pt-3">
            <span className="ui-kicker text-[var(--color-rail-muted)]">
              {isAd
                ? t("dashboard:ad_video_section_title")
                : t("dashboard:episodes_section_title")}
            </span>
            {!isAd && (
              <>
                <span className="num text-[11px]" style={{ color: "var(--color-rail-muted)" }}>
                  {episodes.length}
                </span>
                <span className="flex-1" />
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="grid h-6 w-6 place-items-center rounded-md focus-ring disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    background: "oklch(0 0 0 / 0.18)",
                    border: "1px solid var(--color-rail-line)",
                    color: "var(--color-rail-muted)",
                  }}
                  title={t("dashboard:add_episode_unavailable")}
                  aria-label={t("dashboard:add_episode")}
                >
                  <Plus className={iconClass.sm} weight={ICON.weight} />
                </button>
              </>
            )}
          </div>

          {!isAd && (
            <div className="px-2.5 pb-2">
              <div
                className="flex items-center gap-2 rounded-lg px-2.5 py-2"
                style={{
                  background: "oklch(0 0 0 / 0.22)",
                  border: "1px solid var(--color-rail-line)",
                }}
              >
                <MagnifyingGlass
                  className={cn(iconClass.sm, "shrink-0")}
                  weight={ICON.weight}
                  style={{ color: "var(--color-rail-muted)" }}
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("dashboard:episode_search_placeholder")}
                  aria-label={t("dashboard:episode_search_placeholder")}
                  className="min-w-0 flex-1 bg-transparent text-[13px] outline-none focus-ring placeholder:text-[var(--color-rail-muted)]"
                  style={{ color: "var(--color-rail-text)" }}
                />
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-2 pb-2.5">
            {filteredEps.length === 0 ? (
              <div
                className="px-2 py-8 text-center text-[12px] leading-relaxed"
                style={{ color: "var(--color-rail-muted)" }}
              >
                {episodes.length === 0
                  ? t("dashboard:no_episodes_yet")
                  : t("dashboard:no_episode_search_results")}
              </div>
            ) : (
              filteredEps.map((ep) => (
                <EpisodeCard
                  key={ep.episode}
                  ep={ep}
                  active={ep.episode === activeEp}
                  chrome="rail"
                  onClick={() => setLocation(`/episodes/${ep.episode}`)}
                  showEpisodeBadge={!isAd}
                  fallbackTitle={isAd ? currentProjectData?.title : undefined}
                  route={normalizeRoute(currentProjectData?.generation_mode)}
                />
              ))
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto px-2 py-1.5">
          {filteredEps.map((ep) => {
            const epLabel = isAd
              ? t("dashboard:ad_video_section_title")
              : t("dashboard:episode_collapsed_button_label", {
                  episode: ep.episode,
                  title: ep.title,
                });
            return (
              <button
                key={ep.episode}
                type="button"
                onClick={() => setLocation(`/episodes/${ep.episode}`)}
                title={epLabel}
                aria-label={epLabel}
                className="num mb-1 flex h-10 w-full items-center justify-center rounded-lg text-[11px] font-bold focus-ring"
                style={{
                  background:
                    ep.episode === activeEp ? "oklch(1 0 0 / 0.14)" : "transparent",
                  color:
                    ep.episode === activeEp
                      ? "var(--color-rail-text)"
                      : "var(--color-rail-muted)",
                }}
              >
                {isAd ? (
                  <FilmSlate className={iconClass.md} weight={ICON.weight} aria-hidden />
                ) : (
                  `E${ep.episode}`
                )}
              </button>
            );
          })}
        </div>
      )}

      <div
        className="flex items-center gap-2 px-2.5 py-2.5"
        style={{
          borderTop: "1px solid var(--color-rail-line)",
          background: "var(--color-rail)",
        }}
      >
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="grid h-8 w-8 place-items-center rounded-lg focus-ring"
          aria-expanded={!collapsed}
          style={{
            background: "oklch(0 0 0 / 0.18)",
            border: "1px solid var(--color-rail-line)",
            color: "var(--color-rail-text)",
          }}
          title={collapsed ? t("dashboard:sidebar_expand") : t("dashboard:sidebar_collapse")}
          aria-label={
            collapsed ? t("dashboard:sidebar_expand") : t("dashboard:sidebar_collapse")
          }
        >
          {collapsed ? (
            <CaretRight className={iconClass.md} weight={ICON.weight} />
          ) : (
            <CaretLeft className={iconClass.md} weight={ICON.weight} />
          )}
        </button>
      </div>
    </aside>
  );
}
