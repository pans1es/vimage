import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Check, Upload, X } from "@phosphor-icons/react";
import {
  DEFAULT_TEMPLATE_ID,
  getTemplatesByCategory,
  type StyleCategory,
} from "@/data/style-templates";
import { ICON, iconClass } from "@/lib/icons";
import { cn } from "@/lib/utils";

export interface StylePickerValue {
  mode: "template" | "custom";
  templateId: string | null;
  activeCategory: "live" | "anim";
  uploadedFile: File | null;
  /** Either a blob: URL (just-uploaded) or a /api/v1/files/... URL (already saved). */
  uploadedPreview: string | null;
}

export interface StylePickerProps {
  value: StylePickerValue;
  onChange: (next: StylePickerValue) => void;
}

interface StyleChoiceProps {
  label: string;
  tagline: string;
  isSelected: boolean;
  isDefault: boolean;
  defaultLabel: string;
  onClick: () => void;
}

function StyleChoice({
  label,
  tagline,
  isSelected,
  isDefault,
  defaultLabel,
  onClick,
}: StyleChoiceProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isSelected}
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        isSelected
          ? "border-accent/45 bg-accent-dim shadow-[inset_3px_0_0_var(--color-accent)]"
          : "border-hairline-soft bg-field hover:border-hairline hover:bg-field-muted",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border",
          isSelected
            ? "border-accent bg-accent text-[var(--color-on-accent)]"
            : "border-hairline-strong bg-field-muted text-transparent",
        )}
      >
        <Check className="h-3 w-3" weight="bold" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-medium text-text">{label}</span>
          {isDefault && (
            <span className="ui-kicker rounded-full border border-accent/30 bg-accent-dim px-1.5 py-0.5 text-[9px] text-accent">
              {defaultLabel}
            </span>
          )}
        </span>
        {tagline ? (
          <span className="mt-0.5 block text-[12px] leading-[1.45] text-text-3">{tagline}</span>
        ) : null}
      </span>
    </button>
  );
}

function revokeBlobUrl(url: string | null) {
  if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
}

export function StylePicker({ value, onChange }: StylePickerProps) {
  const { t } = useTranslation(["common", "templates"]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ownedBlobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      revokeBlobUrl(ownedBlobUrlRef.current);
      ownedBlobUrlRef.current = null;
    };
  }, []);

  const handleCustomTab = () => {
    onChange({ ...value, mode: "custom" });
  };

  const handleCategoryTab = (cat: StyleCategory) => {
    onChange({
      ...value,
      mode: "template",
      activeCategory: cat,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    revokeBlobUrl(ownedBlobUrlRef.current);
    const objectUrl = URL.createObjectURL(file);
    ownedBlobUrlRef.current = objectUrl;
    onChange({
      ...value,
      mode: "custom",
      templateId: null,
      uploadedFile: file,
      uploadedPreview: objectUrl,
    });
    e.target.value = "";
  };

  const handleClearUpload = () => {
    revokeBlobUrl(ownedBlobUrlRef.current);
    ownedBlobUrlRef.current = null;
    onChange({ ...value, uploadedFile: null, uploadedPreview: null });
  };

  const tabCls = (active: boolean) =>
    [
      "rounded-[6px] px-3 py-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
      active
        ? "bg-accent-dim text-accent-2"
        : "text-text-3 hover:text-text",
    ].join(" ");

  const isCustomActive = value.mode === "custom";
  const isLiveActive = value.mode === "template" && value.activeCategory === "live";
  const isAnimActive = value.mode === "template" && value.activeCategory === "anim";
  const templates = value.mode === "template" ? getTemplatesByCategory(value.activeCategory) : [];
  const questionKey =
    value.activeCategory === "anim" ? "templates:tab_anim_question" : "templates:tab_live_question";

  return (
    <div className="space-y-4">
      <div className="flex w-fit gap-1 rounded-[8px] border border-hairline bg-field p-1">
        <button type="button" onClick={handleCustomTab} className={tabCls(isCustomActive)}>
          {t("templates:category.custom")}
        </button>
        <button
          type="button"
          onClick={() => handleCategoryTab("live")}
          className={tabCls(isLiveActive)}
        >
          {t("templates:category.live")}
        </button>
        <button
          type="button"
          onClick={() => handleCategoryTab("anim")}
          className={tabCls(isAnimActive)}
        >
          {t("templates:category.anim")}
        </button>
      </div>

      {value.mode === "custom" ? (
        <div>
          <p className="mb-3 text-[12.5px] leading-[1.55] text-text-3">
            {t("templates:tab_custom_desc")}
          </p>

          {value.uploadedPreview ? (
            <div className="relative overflow-hidden rounded-[10px] border border-hairline">
              <img
                src={value.uploadedPreview}
                alt={t("templates:upload_reference")}
                className="h-40 w-full object-cover"
              />
              <button
                type="button"
                onClick={handleClearUpload}
                aria-label={t("common:remove")}
                className="absolute right-1.5 top-1.5 rounded-full p-1 text-text-2 transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                style={{
                  background: "oklch(0 0 0 / 0.55)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                }}
              >
                <X className={iconClass.sm} weight={ICON.weight} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-dashed border-hairline-strong bg-field-muted px-3 py-7 text-[12.5px] text-text-3 transition-colors hover:border-accent/45 hover:bg-accent-dim hover:text-accent-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Upload className={iconClass.sm} weight={ICON.weight} />
              <span>{t("templates:upload_reference")}</span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-text-4">
            {t("templates:supported_formats")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[13.5px] font-medium leading-snug text-text">{t(questionKey)}</p>
          <div
            className="max-h-[420px] space-y-2 overflow-y-auto pr-1"
            role="group"
            aria-label={t(questionKey)}
          >
            {templates.map((tpl) => (
              <StyleChoice
                key={tpl.id}
                label={t(`templates:name.${tpl.id}`)}
                tagline={t(`templates:tagline.${tpl.id}`, "")}
                isSelected={value.templateId === tpl.id}
                isDefault={tpl.id === DEFAULT_TEMPLATE_ID}
                defaultLabel={t("templates:template_selected_default")}
                onClick={() => onChange({ ...value, mode: "template", templateId: tpl.id })}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
