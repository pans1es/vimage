import { useEffect, useId, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, ImagePlus, Landmark, Package, User } from "lucide-react";
import type { Asset, AssetType } from "@/types/asset";
import { GlassModal } from "@/components/ui/GlassModal";
import { ModalCloseButton } from "@/components/ui/ModalCloseButton";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { sanitizeImageSrc } from "@/utils/safe-url";
import { WARM_TONE } from "@/utils/severity-tone";
import { CHROME_STYLE, FIELD_MUTED_STYLE, FIELD_STYLE } from "@/components/ui/darkroom-tokens";

type Mode = "create" | "edit" | "import";

interface Props {
  type: AssetType;
  mode: Mode;
  initialData?: Partial<Asset>;
  previewImageUrl?: string;
  conflictWith?: Asset;
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    description: string;
    voice_style: string;
    image?: File | null;
    overwrite?: boolean;
  }) => Promise<void>;
}

const TYPE_ICON: Record<AssetType, React.ComponentType<{ className?: string }>> = {
  character: User,
  scene: Landmark,
  prop: Package,
};

export function AssetFormModal({
  type, mode, initialData, previewImageUrl, conflictWith, onClose, onSubmit,
}: Props) {
  const { t } = useTranslation("assets");
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [voiceStyle, setVoiceStyle] = useState(initialData?.voice_style ?? "");
  const [image, setImage] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!image) {
      // image 变更时同步重置本地预览（动作驱动重置）
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalPreview(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setLocalPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const displayedPreview = sanitizeImageSrc(localPreview ?? previewImageUrl);
  const TypeIcon = TYPE_ICON[type];

  const isCharacter = type === "character";
  const typeLabel = t(`type.${type}`);
  const title = mode === "create" ? t("create_title", { type: typeLabel })
    : mode === "edit" ? t("edit_title", { type: typeLabel, name: initialData?.name })
    : t("import_title", { name: initialData?.name });

  const primaryLabel = mode === "create" ? t("create") : mode === "edit" ? t("save") : t("confirm_import");

  const submit = async (overwrite = false) => {
    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), description, voice_style: voiceStyle, image, overwrite });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GlassModal
      open
      onClose={onClose}
      labelledBy={titleId}
      widthClassName="w-[580px] max-w-[96vw]"
    >
      {/* Header */}
        <div
          className="flex items-start gap-3 px-6 py-5"
          style={{ borderBottom: "1px solid var(--color-hairline-soft)" }}
        >
          <span
            aria-hidden
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
            style={{
              background: "var(--color-accent-dim)",
              border: "1px solid var(--color-accent-soft)",
              color: "var(--color-accent)",
            }}
          >
            <TypeIcon className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h3
              id={titleId}
              className="display-serif truncate text-[15px] font-semibold tracking-tight"
              style={{ color: "var(--color-text)" }}
            >
              {title}
            </h3>
            <p
              className="num mt-0.5 text-[10px] uppercase"
              style={{
                color: "var(--color-text-4)",
                letterSpacing: "1.0px",
              }}
            >
              {mode === "import" ? t("library_subtitle") : typeLabel}
            </p>
          </div>
          <ModalCloseButton onClick={onClose} />
        </div>

        {/* Conflict warning */}
        {conflictWith && (
          <div
            className="flex items-start gap-2 px-6 py-3 text-[12px]"
            style={{
              borderBottom: `1px solid ${WARM_TONE.ring}`,
              background: WARM_TONE.soft,
              color: WARM_TONE.color,
            }}
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{t("conflict_warning", { name: conflictWith.name })}</span>
          </div>
        )}

        {/* Body */}
        <div className="grid grid-cols-[200px_1fr] gap-5 p-6">
          {/* Image uploader */}
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="focus-ring group relative aspect-video w-full overflow-hidden rounded-xl transition-colors"
              style={{
                ...FIELD_MUTED_STYLE,
                borderStyle: "dashed",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-accent-soft)";
                e.currentTarget.style.borderStyle = "dashed";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-hairline)";
              }}
            >
              {displayedPreview ? (
                <>
                  <img
                    src={displayedPreview}
                    alt=""
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center gap-2 text-[13px] opacity-0 transition-opacity group-hover:opacity-100"
                    style={{
                      background: "oklch(0.24 0.022 250 / 0.55)",
                      color: "var(--color-on-accent)",
                    }}
                  >
                    <ImagePlus className="h-4 w-4" />
                    {t("replace_image")}
                  </div>
                </>
              ) : (
                <div
                  className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center transition-colors"
                  style={{ color: "var(--color-text-4)" }}
                >
                  <span
                    aria-hidden
                    className="grid h-10 w-10 place-items-center rounded-full"
                    style={{
                      background: "var(--color-accent-dim)",
                      border: "1px solid var(--color-accent-soft)",
                      color: "var(--color-accent)",
                    }}
                  >
                    <ImagePlus className="h-4 w-4" />
                  </span>
                  <span
                    className="text-[12px]"
                    style={{ color: "var(--color-text-3)" }}
                  >
                    {t("upload_image_hint")}
                  </span>
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--color-text-4)" }}
                  >
                    {t("upload_image_optional")}
                  </span>
                </div>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            />
          </div>

          {/* Form fields */}
          <div className="flex flex-col gap-4">
            <FieldLabel
              label={
                <>
                  {t("field.name")}{" "}
                  <span style={{ color: "var(--color-accent-2)" }}>*</span>
                </>
              }
            >
              <input
                ref={nameRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="focus-ring rounded-[2px] px-3 py-2 text-[13px] outline-none"
                style={FIELD_STYLE}
              />
            </FieldLabel>

            <FieldLabel label={t("field.description")}>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="focus-ring resize-none rounded-[2px] px-3 py-2 text-[13px] leading-[1.55] outline-none placeholder:text-text-3"
                style={FIELD_STYLE}
              />
            </FieldLabel>

            {isCharacter && (
              <FieldLabel label={t("field.voice_style")}>
                <input
                  value={voiceStyle}
                  onChange={(e) => setVoiceStyle(e.target.value)}
                  className="focus-ring rounded-[2px] px-3 py-2 text-[13px] outline-none"
                  style={FIELD_STYLE}
                />
              </FieldLabel>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-2 px-6 py-4"
          style={{
            borderTop: "1px solid var(--color-hairline-soft)",
            ...CHROME_STYLE,
          }}
        >
          <SecondaryButton size="sm" onClick={onClose}>
            {t("cancel")}
          </SecondaryButton>
          {mode === "import" && conflictWith && (
            <PrimaryButton
              size="sm"
              tone="warm"
              onClick={() => void submit(true)}
              disabled={submitting}
            >
              {t("overwrite_existing")}
            </PrimaryButton>
          )}
          <PrimaryButton
            size="sm"
            className="ml-auto"
            onClick={() => void submit(false)}
            disabled={submitting || !name.trim()}
          >
            {primaryLabel}
          </PrimaryButton>
        </div>
    </GlassModal>
  );
}

function FieldLabel({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="num text-[10px] uppercase"
        style={{
          color: "var(--color-text-2)",
          letterSpacing: "1.0px",
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
