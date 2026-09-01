
import { useCallback, useEffect, useRef, useState } from "react";
import { DownloadSimple, Play } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { API } from "@/api";
import { BRAND } from "@/branding";
import { CARD_STYLE, GHOST_BTN_LG_CLS } from "@/components/ui/darkroom-tokens";
import { ICON, iconClass } from "@/lib/icons";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { formatDate } from "@/utils/date-format";
import { downloadBlob } from "@/utils/download";

/** 产品展示用发布日期（与上游 GitHub Release 解耦） */
const APP_PUBLISHED_AT = "2026-08-30T00:00:00+08:00";

const ABOUT_DATE_OPTS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

export function AboutSection() {
  const { t, i18n } = useTranslation("dashboard");
  const { t: tOnboarding } = useTranslation("onboarding");
  const startTour = useOnboardingStore((s) => s.start);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    [],
  );

  const handleDownloadDiagnostics = useCallback(async () => {
    if (!mountedRef.current) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const { blob, filename } = await API.downloadDiagnostics();
      downloadBlob(blob, filename);
    } catch (err) {
      if (!mountedRef.current) return;
      setDownloadError(err instanceof Error ? err.message : String(err));
    } finally {
      if (mountedRef.current) {
        setDownloading(false);
      }
    }
  }, []);

  return (
    <section className="space-y-6">
      <div
        className="relative overflow-hidden rounded-2xl border border-hairline p-6"
        style={{
          ...CARD_STYLE,
          background:
            "linear-gradient(145deg, oklch(0.42 0.085 170 / 0.08), transparent 48%), var(--color-surface)",
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
          style={{
            background:
              "linear-gradient(90deg, var(--color-rail), var(--color-accent-2), var(--color-accent))",
          }}
        />
        <div className="space-y-3">
          <div className="ui-kicker text-accent">{t("about_current_version")}</div>
          <div className="display-serif text-[44px] font-semibold tracking-wide text-text">
            {BRAND.version}
          </div>
          <div className="space-y-0.5 text-[12.5px] text-text-3">
            <p>{BRAND.name}</p>
            <p>
              {t("about_published_at", {
                date: formatDate(APP_PUBLISHED_AT, i18n.language, ABOUT_DATE_OPTS, "2026-08-30"),
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-hairline p-6" style={CARD_STYLE}>
        <div className="ui-kicker mb-3 text-accent">{tOnboarding("replay_title")}</div>
        <p className="text-[12.5px] text-text-3">{tOnboarding("replay_desc")}</p>
        <button type="button" onClick={startTour} className={`${GHOST_BTN_LG_CLS} mt-3`}>
          <Play className={iconClass.sm} weight={ICON.weight} aria-hidden />
          {tOnboarding("replay_action")}
        </button>
      </div>

      <div className="rounded-2xl border border-hairline p-6" style={CARD_STYLE}>
        <div className="ui-kicker mb-3 text-accent">{t("diagnostics_section_title")}</div>
        <p className="text-[12.5px] text-text-3">{t("diagnostics_section_desc")}</p>
        <button
          type="button"
          onClick={() => void handleDownloadDiagnostics()}
          disabled={downloading}
          className={`${GHOST_BTN_LG_CLS} mt-3`}
        >
          <DownloadSimple className={iconClass.sm} weight={ICON.weight} aria-hidden />
          {downloading ? t("diagnostics_downloading") : t("diagnostics_download")}
        </button>
        {downloadError && (
          <p className="mt-2 text-sm text-red-400">
            {t("diagnostics_download_failed", { error: downloadError })}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-hairline p-6" style={CARD_STYLE}>
        <div className="ui-kicker mb-3 text-accent">{t("about_legal_title")}</div>
        <div className="space-y-1 text-[12.5px] text-text-3">
          <p>Copyright © 2026 {BRAND.name}</p>
          <p>{t("about_powered_by", { brand: BRAND.name })}</p>
        </div>
      </div>
    </section>
  );
}
