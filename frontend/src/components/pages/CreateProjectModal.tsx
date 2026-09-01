
import { useState, useEffect, useRef, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { errMsg, voidCall, voidPromise } from "@/utils/async";
import { useLocation } from "wouter";
import { Check, X } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { API } from "@/api";
import { useProjectsStore } from "@/stores/projects-store";
import { useAppStore } from "@/stores/app-store";
import { DEFAULT_TEMPLATE_ID } from "@/data/style-templates";
import { PROVIDER_NAMES } from "@/components/ui/ProviderIcon";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useEscapeClose } from "@/hooks/useEscapeClose";
import { WizardStep1Basics, type WizardStep1Value } from "./create-project/WizardStep1Basics";
import { WizardStep2Models, type WizardStep2Data } from "./create-project/WizardStep2Models";
import { WizardStep3Style, type WizardStep3Value } from "./create-project/WizardStep3Style";
import type { ModelConfigValue } from "@/components/shared/ModelConfigSection";
import { catalogDurations } from "@/hooks/useModelCapabilities";
import { executingImageModel, executingVideoModel } from "@/components/shared/LayeredModelFields";
import { ICON, iconClass } from "@/lib/icons";

// 新建项目对话框 · 手术室预备台
// 三步：基础信息 → 模型 → 风格。功能与校验不变，仅更换 chrome 与节奏。

const STEP_BADGE_ACTIVE_STYLE: CSSProperties = {
  background: "var(--color-accent)",
  color: "var(--color-on-accent)",
  boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.22)",
};

const STEP_BADGE_DONE_STYLE: CSSProperties = {
  background: "var(--color-accent-dim)",
  color: "var(--color-accent)",
  border: "1px solid var(--color-accent-soft)",
};

const STEP_BADGE_INACTIVE_STYLE: CSSProperties = {
  background: "var(--color-field)",
  border: "1px solid var(--color-hairline)",
  color: "var(--color-text-3)",
};

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, key: "wizard_step_basics" },
  { num: 2, key: "wizard_step_models" },
  { num: 3, key: "wizard_step_style" },
] as const;

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const { t } = useTranslation("templates");
  return (
    <ol className="flex items-stretch gap-1 py-4">
      {STEPS.map((s, i) => {
        const done = current > s.num;
        const active = current === s.num;
        const last = i === STEPS.length - 1;
        return (
          <li
            key={s.num}
            className="relative flex min-w-0 flex-1 items-center"
            aria-current={active ? "step" : undefined}
          >
            <div
              className={
                "flex min-w-0 items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors " +
                (active ? "bg-field shadow-[inset_0_0_0_1px_var(--color-accent-soft)]" : "")
              }
            >
              <span
                className="display-serif grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[13px] font-bold tabular-nums transition-colors"
                style={
                  active
                    ? STEP_BADGE_ACTIVE_STYLE
                    : done
                      ? STEP_BADGE_DONE_STYLE
                      : STEP_BADGE_INACTIVE_STYLE
                }
              >
                {done ? (
                  <Check className={iconClass.sm} weight="bold" aria-hidden />
                ) : (
                  s.num.toString().padStart(2, "0")
                )}
              </span>
              <div className="min-w-0">
                <div
                  className={
                    "ui-kicker truncate " +
                    (active ? "text-accent" : "text-text-4")
                  }
                >
                  {`${String(s.num).padStart(2, "0")} / 03`}
                </div>
                <div
                  className={
                    "truncate text-[13px] tracking-tight " +
                    (active ? "font-semibold text-text" : done ? "text-text-2" : "text-text-3")
                  }
                >
                  {t(s.key)}
                </div>
              </div>
            </div>
            {!last && (
              <div
                aria-hidden
                className="mx-1 hidden h-px flex-1 sm:block"
                style={{
                  background: done ? "var(--color-accent-soft)" : "var(--color-hairline-soft)",
                }}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CreateProjectModal() {
  const { t } = useTranslation(["dashboard", "common"]);
  const [, navigate] = useLocation();
  const { setShowCreateModal } = useProjectsStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [basics, setBasics] = useState<WizardStep1Value>({
    title: "",
    contentMode: "narration",
    sourceKind: "novel",
    aspectRatio: "9:16",
    generationRoute: null,
    gridStoryboard: false,
    targetDuration: 60,
    speechRate: null,
  });

  const [models, setModels] = useState<ModelConfigValue>({
    videoBackend: "",
    videoProviderI2V: "",
    videoProviderR2V: "",
    imageBackendDefault: "",
    imageBackendT2I: "",
    imageBackendI2I: "",
    textBackendDefault: "",
    textBackendSimple: "",
    textBackendComplex: "",
    defaultDuration: null,
    videoResolution: null,
    imageResolution: null,
  });

  const [style, setStyle] = useState<WizardStep3Value>({
    mode: "template",
    templateId: DEFAULT_TEMPLATE_ID,
    activeCategory: "live",
    uploadedFile: null,
    uploadedPreview: null,
  });

  const [creating, setCreating] = useState(false);

  // Step2 的远端数据 hoist 到此处：只在 modal 挂载时 fetch 一次，
  // 前进/后退切 step 时 Step2 unmount/mount 不再触发 HTTP。
  const [step2Data, setStep2Data] = useState<WizardStep2Data | null>(null);
  const [step2Error, setStep2Error] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    voidCall((async () => {
      try {
        const [sysConfig, providersRes, customRes] = await Promise.all([
          API.getSystemConfig(),
          API.getProviders(),
          API.listCustomProviders(),
        ]);
        if (cancelled) return;
        setStep2Data({
          options: {
            video: sysConfig.options.video_backends,
            image: sysConfig.options.image_backends,
            text: sysConfig.options.text_backends,
            providerNames: { ...PROVIDER_NAMES, ...(sysConfig.options.provider_names ?? {}) },
          },
          providers: providersRes.providers,
          customProviders: customRes.providers,
          globalDefaults: {
            video: sysConfig.settings.default_video_backend ?? "",
            videoI2V: sysConfig.settings.default_video_backend_i2v ?? "",
            videoR2V: sysConfig.settings.default_video_backend_r2v ?? "",
            image: sysConfig.settings.default_image_backend ?? "",
            imageT2I: sysConfig.settings.default_image_backend_t2i ?? "",
            imageI2I: sysConfig.settings.default_image_backend_i2i ?? "",
            textDefault: sysConfig.settings.default_text_backend ?? "",
            textSimple: sysConfig.settings.text_backend_simple ?? "",
            textComplex: sysConfig.settings.text_backend_complex ?? "",
          },
        });
      } catch (err) {
        if (!cancelled) setStep2Error(errMsg(err));
      }
    })());
    return () => {
      cancelled = true;
    };
  }, []);

  // blob: URL 所有权集中在此：StylePicker 只通过 onChange 更换引用，
  // revoke 统一由本 effect 在 URL 变更或 unmount 时触发。非 blob: 跳过。
  useEffect(() => {
    const url = style.uploadedPreview;
    if (!url?.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(url);
  }, [style.uploadedPreview]);

  const handleClose = () => {
    setShowCreateModal(false);
  };

  useEscapeClose(() => setShowCreateModal(false));

  // 背景 inert：打开期间屏蔽 #root 内容（modal 通过 portal 挂到 body，
  // 不在 #root 子树内，因此不会被 inert 传染）。
  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;
    root.setAttribute("aria-hidden", "true");
    root.setAttribute("inert", "");
    return () => {
      root.removeAttribute("aria-hidden");
      root.removeAttribute("inert");
    };
  }, []);

  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, true);

  // 第二步选好时长与分辨率后还能退回第一步改生成模式。分辨率只由执行模型决定，模型没换就不动；
  // 时长还受参考图路径影响——同一个模型走参考图时可选时长可能被收窄，故切换生成模式一律重算。
  const handleBasicsChange = (next: WizardStep1Value) => {
    setBasics(next);
    if (next.generationRoute === basics.generationRoute) return;
    const globals = step2Data?.globalDefaults ?? { video: "", videoI2V: "", videoR2V: "" };
    const usesReferenceImages = next.generationRoute === "reference_video";
    const before = executingVideoModel(models, globals, basics.generationRoute === "reference_video");
    const after = executingVideoModel(models, globals, usesReferenceImages);
    const modelChanged = before !== after;
    const nextDurations = catalogDurations(step2Data?.providers ?? [], step2Data?.customProviders ?? [], after, {
      videoResolution: modelChanged ? null : models.videoResolution,
      usesReferenceImages,
    });
    setModels((prev) => ({
      ...prev,
      videoResolution: modelChanged ? null : prev.videoResolution,
      defaultDuration:
        prev.defaultDuration !== null && nextDurations?.includes(prev.defaultDuration)
          ? prev.defaultDuration
          : null,
    }));
  };

  const handleCreate = async () => {
    // 生成模式必选（Step1 已拦一道）：缺失时后端返回 422，此处不构造缺少生成模式的创建请求
    if (!basics.generationRoute) return;
    setCreating(true);
    try {
      // resolution 的 model_settings key 用执行模型：后端按执行模型查这张表，向导只暴露默认层，
      // 但全局细分层若指向别的模型，执行的就不是默认层那个——键位对不上分辨率会被静默忽略。
      const globals = step2Data?.globalDefaults ?? { video: "", videoI2V: "", videoR2V: "", image: "", imageT2I: "" };
      const executingVideo = executingVideoModel(models, globals, basics.generationRoute === "reference_video");
      const executingImage = executingImageModel(models, globals);
      const modelSettings: Record<string, { resolution: string }> = {};
      if (executingVideo && models.videoResolution) {
        modelSettings[executingVideo] = { resolution: models.videoResolution };
      }
      if (executingImage && models.imageResolution) {
        modelSettings[executingImage] = { resolution: models.imageResolution };
      }

      const isAd = basics.contentMode === "ad";
      const resp = await API.createProject({
        title: basics.title.trim(),
        content_mode: basics.contentMode,
        // source_kind 仅 drama 暴露与生效；其余模式由服务端缺省 novel
        ...(basics.contentMode === "drama" ? { source_kind: basics.sourceKind } : {}),
        aspect_ratio: basics.aspectRatio,
        generation_mode: basics.generationRoute,
        grid_storyboard: basics.gridStoryboard,
        // 口播语速估算未填即不传（服务端不落盘，回退语言默认）
        ...(basics.speechRate !== null ? { speech_rate_units_per_second: basics.speechRate } : {}),
        // ad 不暴露 default_duration（按目标总时长逐个分镜规划），改传 target_duration
        ...(isAd
          ? { target_duration: basics.targetDuration }
          : { default_duration: models.defaultDuration }),
        style_template_id: style.mode === "template" ? style.templateId : null,
        video_backend: models.videoBackend || null,
        default_image_backend: models.imageBackendDefault || null,
        default_text_backend: models.textBackendDefault || null,
        text_backend_simple: models.textBackendSimple || null,
        text_backend_complex: models.textBackendComplex || null,
        ...(Object.keys(modelSettings).length > 0 ? { model_settings: modelSettings } : {}),
      });

      // Upload style image if in custom mode
      if (style.mode === "custom" && style.uploadedFile) {
        try {
          await API.uploadStyleImage(resp.name, style.uploadedFile);
        } catch {
          useAppStore.getState().pushToast(
            t("dashboard:style_upload_failed_hint"),
            "warning"
          );
        }
      }

      setShowCreateModal(false);
      navigate(`/app/projects/${resp.name}`);
    } catch (err) {
      useAppStore.getState().pushToast(
        `${t("dashboard:create_project_failed")}${errMsg(err)}`,
        "error"
      );
    } finally {
      setCreating(false);
    }
  };

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(900px 480px at 12% -10%, oklch(0.42 0.085 170 / 0.14), transparent 55%), radial-gradient(800px 460px at 100% 110%, oklch(0.42 0.04 230 / 0.08), transparent 55%), oklch(0.24 0.022 250 / 0.42)",
        backdropFilter: "blur(14px) saturate(1.12)",
        WebkitBackdropFilter: "blur(14px) saturate(1.12)",
      }}
    >
      {/* 遮罩层：点击关闭。键盘路径走 Esc。 */}
      <button
        type="button"
        aria-label={t("common:close")}
        tabIndex={-1}
        onClick={handleClose}
        className="absolute inset-0 cursor-default bg-transparent"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-project-title"
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-hairline bg-surface shadow-[0_32px_80px_-28px_oklch(0.24_0.022_250_/_0.45)]"
      >
        {/* scrub 顶缘 */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[3px]"
          style={{
            background:
              "linear-gradient(90deg, var(--color-rail) 0%, var(--color-accent-2) 45%, var(--color-accent) 100%)",
          }}
        />

        {/* Header */}
        <div className="relative shrink-0 px-7 pb-4 pt-7">
          <button
            type="button"
            onClick={handleClose}
            aria-label={t("common:close")}
            className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-xl border border-hairline-soft bg-field text-text-3 transition-colors hover:border-hairline hover:bg-field-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className={iconClass.md} weight={ICON.weight} />
          </button>

          <h2
            id="create-project-title"
            className="display-serif pr-12"
            style={{
              fontWeight: 600,
              fontSize: "clamp(1.75rem, 2vw + 0.8rem, 2.15rem)",
              lineHeight: 1.1,
              letterSpacing: "0.01em",
              color: "var(--color-text)",
            }}
          >
            {t("dashboard:new_project")}
          </h2>
          <p className="mt-2 max-w-xl text-[13.5px] leading-[1.5] text-text-3">
            {t("templates:wizard_step_basics")}
            <span aria-hidden className="mx-1.5 text-text-4">
              ·
            </span>
            {t("templates:wizard_step_models")}
            <span aria-hidden className="mx-1.5 text-text-4">
              ·
            </span>
            {t("templates:wizard_step_style")}
          </p>
        </div>

        {/* Step indicator strip */}
        <div
          className="shrink-0 border-y border-hairline-soft px-5 sm:px-6"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.42 0.085 170 / 0.05), transparent 100%), var(--color-surface-2)",
          }}
        >
          <StepIndicator current={step} />
        </div>

        {/* Current step body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-7 pb-7 pt-6">
          {step === 1 && (
            <WizardStep1Basics
              value={basics}
              onChange={handleBasicsChange}
              onNext={() => setStep(2)}
              onCancel={handleClose}
            />
          )}
          {step === 2 && (
            <WizardStep2Models
              value={models}
              onChange={setModels}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
              onCancel={handleClose}
              data={step2Data}
              error={step2Error}
              hideDuration={basics.contentMode === "ad"}
              usesReferenceImages={basics.generationRoute === "reference_video"}
            />
          )}
          {step === 3 && (
            <WizardStep3Style
              value={style}
              onChange={setStyle}
              onBack={() => setStep(2)}
              onCreate={voidPromise(handleCreate)}
              onCancel={handleClose}
              creating={creating}
            />
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
