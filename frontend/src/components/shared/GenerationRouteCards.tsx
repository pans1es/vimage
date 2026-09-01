import type { CSSProperties, ReactNode } from "react";
import { LockSimple } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { ICON } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { GenerationRoute } from "@/utils/generation-mode";

/**
 * 生成模式二选一卡（创建向导）。
 *
 * 单框中缝分屏、无预选、必选：生成模式创建后不可更改，以对比形态呈现。
 * 图示表达输入契约——分镜图生视频是单张分镜图（I2V），
 * 参考生视频是角色/场景/道具参考图集合（R2V）。
 */

const ROUTE_FRAME_STYLE: CSSProperties = {
  background: "var(--color-surface)",
  boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.7)",
};

/**
 * 生成模式的文案与输入契约标签。向导二卡与设置页只读展示共用同一份，
 * 避免两处各自维护「生成模式 → 名称 / 描述 / I2V-R2V」的对应关系而漂移。
 */
export const ROUTE_META: Record<GenerationRoute, { nameKey: string; descKey: string; tag: string }> = {
  storyboard: { nameKey: "route_storyboard", descKey: "route_storyboard_desc", tag: "I2V" },
  reference_video: { nameKey: "route_reference_video", descKey: "route_reference_video_desc", tag: "R2V" },
};

/** 「创建后不可更改」琥珀锁形徽章。与区块标题同行，设置页只读展示复用。 */
export function RouteLockBadge() {
  const { t } = useTranslation("dashboard");
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-warm-ring bg-warm-tint-faint px-2 py-1 text-[10px] font-semibold tracking-wide text-warm">
      <LockSimple aria-hidden className="h-3 w-3" weight={ICON.weight} />
      {t("generation_route_locked")}
    </span>
  );
}

function DiagramWell({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative flex h-[88px] w-full max-w-[220px] items-center justify-center overflow-hidden rounded-xl border transition-colors",
        active
          ? "border-accent/40 bg-[linear-gradient(165deg,oklch(0.42_0.085_170_/_0.14),oklch(0.968_0.007_230_/_0.9))]"
          : "border-hairline-soft bg-field-muted",
      )}
    >
      {/* 仪器网格底纹 */}
      <span
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-hairline-soft) 1px, transparent 1px), linear-gradient(90deg, var(--color-hairline-soft) 1px, transparent 1px)",
          backgroundSize: "12px 12px",
          maskImage: "radial-gradient(ellipse 70% 65% at 50% 50%, black, transparent)",
        }}
      />
      {children}
    </span>
  );
}

function FlowArrow({ active }: { active: boolean }) {
  return (
    <svg width="22" height="12" viewBox="0 0 22 12" className="shrink-0" fill="none">
      <path
        d="M1 6h16M13 2l5 4-5 4"
        stroke={active ? "var(--color-accent)" : "var(--color-text-4)"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 输出端：监视器 + 播放 */
function OutputMonitor({ active }: { active: boolean }) {
  const stroke = active ? "var(--color-accent)" : "var(--color-text-3)";
  const fill = active ? "var(--color-accent-dim)" : "var(--color-field)";
  return (
    <svg width="44" height="52" viewBox="0 0 44 52" fill="none">
      <rect x="4" y="4" width="36" height="36" rx="7" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <path d="M18 16.5v11l10-5.5-10-5.5Z" fill={active ? "var(--color-accent)" : "var(--color-text-3)"} />
      <rect x="14" y="44" width="16" height="3" rx="1.5" fill={stroke} opacity="0.45" />
      <path d="M22 40v4" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** 输入契约图示：单张分镜帧 → 视频。 */
function StoryboardDiagram({ active }: { active: boolean }) {
  const stroke = active ? "var(--color-accent)" : "var(--color-text-3)";
  const ink = active ? "var(--color-accent)" : "var(--color-text-4)";
  const fill = active ? "var(--color-accent-dim)" : "var(--color-field)";
  return (
    <DiagramWell active={active}>
      <span className="relative z-[1] flex items-center gap-2.5 px-2">
        <svg width="52" height="60" viewBox="0 0 52 60" fill="none">
          {/* 胶片框 */}
          <rect x="6" y="4" width="40" height="52" rx="6" fill={fill} stroke={stroke} strokeWidth="1.5" />
          {[10, 22, 34, 46].map((y) => (
            <g key={y}>
              <rect x="9" y={y} width="3.5" height="5" rx="0.8" fill={ink} opacity="0.35" />
              <rect x="39.5" y={y} width="3.5" height="5" rx="0.8" fill={ink} opacity="0.35" />
            </g>
          ))}
          {/* 分镜画面 */}
          <rect x="15" y="14" width="22" height="28" rx="3" fill="var(--color-surface)" stroke={stroke} strokeWidth="1.2" />
          <path
            d="M17.5 34.5 24 26l5 6 3.5-4.5 5 7"
            stroke={ink}
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="20.5" cy="20.5" r="2.2" fill={ink} opacity="0.7" />
        </svg>
        <FlowArrow active={active} />
        <OutputMonitor active={active} />
      </span>
    </DiagramWell>
  );
}

/** 输入契约图示：角色 / 场景 / 道具参考叠层 → 视频。 */
function ReferenceDiagram({ active }: { active: boolean }) {
  const stroke = active ? "var(--color-accent)" : "var(--color-text-3)";
  const ink = active ? "var(--color-accent)" : "var(--color-text-4)";
  const fill = active ? "var(--color-accent-dim)" : "var(--color-field)";
  return (
    <DiagramWell active={active}>
      <span className="relative z-[1] flex items-center gap-2 px-1.5">
        <svg width="78" height="58" viewBox="0 0 78 58" fill="none">
          {/* 场景卡（后） */}
          <g transform="translate(22 6) rotate(7)">
            <rect width="28" height="34" rx="5" fill={fill} stroke={stroke} strokeWidth="1.4" />
            <path d="M5 24 11 16l5 6 3-3.5 5 5.5" stroke={ink} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="11" r="2" fill={ink} opacity="0.65" />
          </g>
          {/* 道具卡（中） */}
          <g transform="translate(40 10) rotate(-6)">
            <rect width="28" height="34" rx="5" fill={fill} stroke={stroke} strokeWidth="1.4" />
            <path
              d="M9 24V13.5h10V24M9 24h10M11.5 13.5 14 9.5 16.5 13.5"
              stroke={ink}
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          {/* 角色卡（前） */}
          <g transform="translate(4 8)">
            <rect width="30" height="36" rx="5" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <circle cx="15" cy="14" r="5" stroke={ink} strokeWidth="1.35" />
            <path
              d="M7.5 29c1.8-5 5-7.5 7.5-7.5S21 24 22.5 29"
              stroke={ink}
              strokeWidth="1.35"
              strokeLinecap="round"
            />
          </g>
        </svg>
        <FlowArrow active={active} />
        <OutputMonitor active={active} />
      </span>
    </DiagramWell>
  );
}

/** 左右两半的呈现顺序：分镜图生视频在左（默认路径），参考生视频在右。 */
const ROUTE_CARDS: readonly { route: GenerationRoute; Diagram: (props: { active: boolean }) => ReactNode }[] = [
  { route: "storyboard", Diagram: StoryboardDiagram },
  { route: "reference_video", Diagram: ReferenceDiagram },
];

export interface GenerationRouteCardsProps {
  /** null = 未选。必选：未选时向导不放行。 */
  value: GenerationRoute | null;
  onChange: (next: GenerationRoute) => void;
  /** 装配条等从属内容，仅分镜图生视频选中时由调用方传入。 */
  children?: ReactNode;
}

export function GenerationRouteCards({ value, onChange, children }: GenerationRouteCardsProps) {
  const { t } = useTranslation("dashboard");
  const sb = value === "storyboard";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <FieldLabel className="mb-0" required>
          {t("generation_route")}
        </FieldLabel>
        <RouteLockBadge />
      </div>

      <div
        role="radiogroup"
        aria-label={t("generation_route")}
        aria-required="true"
        className="relative grid grid-cols-1 overflow-hidden rounded-2xl border border-hairline sm:grid-cols-2"
        style={ROUTE_FRAME_STYLE}
      >
        <div aria-hidden className="pointer-events-none absolute inset-y-3 left-1/2 hidden w-px bg-hairline sm:block" />
        {value ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/2 border-2 border-accent/50 transition-[translate] duration-300 motion-reduce:transition-none sm:block"
            style={{
              translate: sb ? "0" : "100%",
              borderRadius: sb ? "16px 0 0 16px" : "0 16px 16px 0",
              boxShadow: "inset 0 0 36px -20px var(--color-accent-glow)",
            }}
          />
        ) : null}

        {ROUTE_CARDS.map(({ route, Diagram }) => {
          const selected = value === route;
          const meta = ROUTE_META[route];
          return (
            <label
              key={route}
              className={cn(
                "relative flex cursor-pointer flex-col items-center gap-3 px-4 py-5 text-center transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-accent sm:px-5 sm:py-6",
                selected ? "bg-accent-dim/70" : "bg-transparent hover:bg-field-muted/80",
                // 窄屏：未选中侧用底部分隔；选中侧加描边
                selected && "rounded-2xl ring-2 ring-accent/45 sm:rounded-none sm:ring-0",
              )}
            >
              <input
                type="radio"
                name="generationRoute"
                value={route}
                checked={selected}
                onChange={() => onChange(route)}
                className="sr-only"
              />
              <span
                className={cn(
                  "ui-kicker",
                  selected ? "text-accent" : "text-text-3",
                )}
              >
                {meta.tag}
              </span>
              <Diagram active={selected} />
              <span className="display-serif text-[17px] font-semibold tracking-wide text-text">
                {t(meta.nameKey)}
              </span>
              <span className="max-w-[18rem] text-[12px] leading-[1.55] text-text-3">
                {t(meta.descKey)}
              </span>
            </label>
          );
        })}
      </div>

      {children}
    </div>
  );
}
