
/**
 * API Keys 管理 Tab — Control Booth / 手术室 2.0 视觉
 */
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useAutoFocus } from "@/hooks/useAutoFocus";
import { useEscapeClose } from "@/hooks/useEscapeClose";
import {
  Check,
  CircleNotch,
  Copy,
  Key,
  Plus,
  Trash,
  Warning,
  X,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { API } from "@/api";
import { useAppStore } from "@/stores/app-store";
import { copyText } from "@/utils/clipboard";
import { errMsg } from "@/utils/async";
import { formatDate } from "@/utils/date-format";
import {
  ACCENT_BTN_CLS,
  ACCENT_BUTTON_STYLE,
  CARD_STYLE,
  ICON_BTN_FILLED_CLS,
  INPUT_CLS,
} from "@/components/ui/darkroom-tokens";
import { ICON, iconClass } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { ApiKeyInfo, CreateApiKeyResponse } from "@/types";

const MODAL_STYLE: CSSProperties = {
  background: "var(--color-surface)",
  boxShadow:
    "0 24px 64px oklch(0.25 0.04 170 / 0.18), inset 0 1px 0 oklch(1 0 0 / 0.7)",
};

const FULL_DATE_OPTS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
};

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

interface CreateModalProps {
  onClose: () => void;
  onCreated: (key: ApiKeyInfo) => void;
}

function CreateModal({ onClose, onCreated }: CreateModalProps) {
  const { t } = useTranslation("dashboard");
  const [name, setName] = useState("");
  const [expiresDays, setExpiresDays] = useState<number | "">(30);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<CreateApiKeyResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<number | null>(null);

  const canCreate = useMemo(() => name.trim().length > 0, [name]);
  const nameInputRef = useAutoFocus<HTMLInputElement>();

  useEffect(
    () => () => {
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
    },
    [],
  );

  const handleCreate = useCallback(async () => {
    if (!canCreate || creating) return;
    setCreating(true);
    try {
      const days: number | undefined = expiresDays === "" ? 0 : expiresDays;
      const res = await API.createApiKey(name.trim(), days);
      setCreated(res);
      onCreated({
        id: res.id,
        name: res.name,
        key_prefix: res.key_prefix,
        created_at: res.created_at,
        expires_at: res.expires_at,
        last_used_at: null,
      });
    } catch (err) {
      useAppStore.getState().pushToast(t("create_failed", { message: errMsg(err) }), "error");
    } finally {
      setCreating(false);
    }
  }, [canCreate, creating, expiresDays, name, onCreated, t]);

  const handleCopy = useCallback(async () => {
    if (!created?.key) return;
    await copyText(created.key);
    setCopied(true);
    if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => setCopied(false), 2000);
  }, [created]);

  useEscapeClose(onClose);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !created && canCreate) void handleCreate();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [canCreate, created, handleCreate]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(800px 500px at 50% 28%, oklch(0.42 0.085 170 / 0.22), transparent 58%), oklch(0.18 0.02 170 / 0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-hairline p-6"
        style={MODAL_STYLE}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
          style={{
            background:
              "linear-gradient(90deg, var(--color-rail), var(--color-accent-2), var(--color-accent))",
          }}
        />
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="display-serif text-[22px] font-semibold tracking-wide text-text">
              {created ? t("key_created") : t("new_api_key")}
            </h3>
          </div>
          {!creating && (
            <button
              type="button"
              onClick={onClose}
              className={ICON_BTN_FILLED_CLS}
              aria-label={t("common:cancel")}
            >
              <X className={iconClass.md} weight={ICON.weight} />
            </button>
          )}
        </div>

        {!created ? (
          <div className="space-y-5">
            <div>
              <label
                htmlFor="apikey-name"
                className="ui-kicker block text-text-4"
              >
                {t("name")}
              </label>
              <p className="mt-1 text-[12px] leading-[1.55] text-text-3">
                {t("key_name_hint")}
              </p>
              <input
                id="apikey-name"
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("enter_key_name")}
                autoComplete="off"
                className={`mt-2 ${INPUT_CLS}`}
              />
            </div>

            <div>
              <label
                htmlFor="apikey-expires"
                className="ui-kicker block text-text-4"
              >
                {t("expiration_days")}
              </label>
              <p className="mt-1 text-[12px] leading-[1.55] text-text-3">
                {t("zero_permanent_hint")}
              </p>
              <input
                id="apikey-expires"
                type="number"
                min={0}
                value={expiresDays}
                onChange={(e) =>
                  setExpiresDays(e.target.value === "" ? "" : Number(e.target.value))
                }
                className={`mt-2 ${INPUT_CLS} w-1/3`}
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-hairline-soft pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-3.5 py-2 text-[12.5px] text-text-3 transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t("common:cancel")}
              </button>
              <button
                type="button"
                onClick={() => void handleCreate()}
                disabled={!canCreate || creating}
                className={ACCENT_BTN_CLS}
                style={ACCENT_BUTTON_STYLE}
              >
                {creating && (
                  <CircleNotch
                    className={cn(iconClass.sm, "motion-safe:animate-spin")}
                    weight={ICON.weight}
                    aria-hidden
                  />
                )}
                {t("common:confirm")}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className="rounded-xl border px-4 py-3 text-[12px] leading-[1.55]"
              style={{
                borderColor: "var(--color-warm-ring)",
                background: "var(--color-warm-tint)",
              }}
            >
              <div className="mb-1.5 flex items-center gap-2 ui-kicker text-warm-bright">
                <Warning className={iconClass.sm} weight={ICON.weight} />
                {t("save_key_warning")}
              </div>
              <p className="text-text-2">{t("key_not_viewable_again")}</p>
            </div>

            <div className="relative">
              <input
                readOnly
                type="text"
                value={created.key}
                aria-label={t("api_key")}
                className="w-full rounded-xl border border-hairline bg-field/65 px-3 py-3 pr-12 font-mono text-[12.5px] tracking-[0.04em] text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
              <button
                type="button"
                onClick={() => void handleCopy()}
                className={`absolute right-2 top-1/2 -translate-y-1/2 ${ICON_BTN_FILLED_CLS}`}
                title={t("common:copy")}
              >
                {copied ? (
                  <Check className={cn(iconClass.sm, "text-good")} weight="bold" />
                ) : (
                  <Copy className={iconClass.sm} weight={ICON.weight} />
                )}
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-hairline bg-field px-5 py-2 text-[12.5px] text-text-2 transition-colors hover:border-hairline-strong hover:bg-field-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t("common:done")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApiKeysTab() {
  const { t, i18n } = useTranslation("dashboard");
  const tRef = useRef(t);
  // 同步最新 t 到 ref，供异步回调读取最新翻译函数
  useEffect(() => {
    tRef.current = t;
  }, [t]);
  const [keys, setApiKeys] = useState<ApiKeyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await API.listApiKeys();
      setApiKeys(res);
    } catch (err) {
      useAppStore
        .getState()
        .pushToast(tRef.current("load_failed", { message: errMsg(err) }), "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // mount 时异步拉取 API Key 列表后回写状态，属于受控的初始化加载
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchKeys();
  }, [fetchKeys]);

  const handleDelete = useCallback(async (key: ApiKeyInfo) => {
    if (!confirm(tRef.current("confirm_delete_key", { name: key.name }))) {
      return;
    }
    setDeletingId(key.id);
    try {
      await API.deleteApiKey(key.id);
      setApiKeys((prev) => prev.filter((k) => k.id !== key.id));
      useAppStore.getState().pushToast(tRef.current("key_deleted_success"), "success");
    } catch (err) {
      useAppStore
        .getState()
        .pushToast(tRef.current("delete_failed", { message: errMsg(err) }), "error");
    } finally {
      setDeletingId(null);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden
            className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-hairline"
            style={{
              background:
                "linear-gradient(160deg, oklch(0.42 0.085 170 / 0.12), oklch(0.96 0.01 170))",
              color: "var(--color-accent)",
            }}
          >
            <Key className={iconClass.lg} weight={ICON.weight} />
          </span>
          <div className="min-w-0">
            <h3 className="display-serif text-[24px] font-semibold tracking-wide text-text">
              {t("api_key_mgmt")}
            </h3>
            <p className="mt-1.5 text-[12.5px] leading-[1.6] text-text-3">
              {t("api_key_usage_desc")}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className={`${ACCENT_BTN_CLS} shrink-0`}
          style={ACCENT_BUTTON_STYLE}
        >
          <Plus className={iconClass.sm} weight={ICON.weight} aria-hidden />
          {t("create_api_key")}
        </button>
      </div>

      <div
        className="overflow-hidden rounded-2xl border border-hairline"
        style={CARD_STYLE}
      >
        <table className="w-full border-collapse text-left text-[12.5px]">
          <thead>
            <tr
              className="border-b border-hairline-soft"
              style={{
                background:
                  "linear-gradient(180deg, oklch(0.42 0.085 170 / 0.05), transparent)",
              }}
            >
              {[
                t("name"),
                t("key_prefix"),
                t("created_at"),
                t("expires_at"),
                t("last_used"),
              ].map((label) => (
                <th key={label} className="px-4 py-3 ui-kicker text-text-4">
                  {label}
                </th>
              ))}
              <th className="px-4 py-3 text-right ui-kicker text-text-4">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-hairline-soft)]">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-text-3">
                    <CircleNotch
                      className={cn(iconClass.sm, "motion-safe:animate-spin text-accent")}
                      weight={ICON.weight}
                      aria-hidden
                    />
                    <span className="ui-kicker text-text-3">{t("common:loading")}</span>
                  </div>
                </td>
              </tr>
            ) : keys.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="mx-auto flex max-w-[260px] flex-col items-center gap-3">
                    <div
                      className="grid h-12 w-12 place-items-center rounded-2xl border border-dashed border-hairline"
                      style={{ background: "var(--color-field-muted)" }}
                    >
                      <Key className={iconClass.xl} weight={ICON.weight} aria-hidden />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[12.5px] text-text-3">{t("no_api_keys")}</p>
                      <button
                        type="button"
                        onClick={() => setShowCreate(true)}
                        className="text-[12px] font-medium text-accent transition-colors hover:text-accent-2"
                      >
                        {t("create_one_now")}
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              keys.map((key) => {
                const expired = isExpired(key.expires_at);
                return (
                  <tr
                    key={key.id}
                    className="group transition-colors hover:bg-field-muted/70"
                  >
                    <td className="px-4 py-4 font-medium text-text">{key.name}</td>
                    <td className="px-4 py-4 font-mono text-text-3">
                      {key.key_prefix}****
                    </td>
                    <td className="px-4 py-4 font-mono tabular-nums text-text-2">
                      {formatDate(key.created_at, i18n.language, FULL_DATE_OPTS)}
                    </td>
                    <td className="px-4 py-4">
                      {!key.expires_at ? (
                        <span className="ui-kicker text-text-4">{t("permanent")}</span>
                      ) : expired ? (
                        <span
                          className="inline-flex rounded-full px-2.5 py-0.5 ui-kicker"
                          style={{
                            background: "var(--color-warm-tint)",
                            color: "var(--color-warm-bright)",
                            border: "1px solid var(--color-warm-ring)",
                          }}
                        >
                          {t("expired")}
                        </span>
                      ) : (
                        <span className="font-mono tabular-nums text-text-2">
                          {formatDate(key.expires_at, i18n.language, FULL_DATE_OPTS)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 font-mono tabular-nums text-text-3">
                      {formatDate(key.last_used_at, i18n.language, FULL_DATE_OPTS)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => void handleDelete(key)}
                        disabled={deletingId === key.id}
                        className="rounded-xl p-2 text-text-3 transition-colors hover:bg-warm-tint hover:text-warm-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        title={t("common:delete")}
                      >
                        {deletingId === key.id ? (
                          <CircleNotch
                            className={cn(iconClass.sm, "motion-safe:animate-spin")}
                            weight={ICON.weight}
                            aria-hidden
                          />
                        ) : (
                          <Trash className={iconClass.sm} weight={ICON.weight} />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={(k) => setApiKeys((prev) => [k, ...prev])}
        />
      )}
    </div>
  );
}
