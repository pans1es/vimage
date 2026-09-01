import { useState, type FormEvent } from "react";
import { CircleNotch, Lock, User } from "@phosphor-icons/react";
import { useAutoFocus } from "@/hooks/useAutoFocus";
import { errMsg, voidPromise } from "@/utils/async";
import { useLocation, useSearch } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth-store";
import { safeReturnPath } from "@/utils/safe-url";
import type { LoginResponse, ErrorResponse } from "@/api";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { BrandWordmark } from "@/components/ui/BrandWordmark";
import { BRAND } from "@/branding";
import { ICON, iconClass } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  CARD_STYLE,
  INPUT_CLS,
  ambientGlowStyle,
  posterGridStyle,
} from "@/components/ui/darkroom-tokens";

const POSTER_GRID_STYLE = posterGridStyle({
  size: 44,
  maskShape: "60% 60% at 50% 35%",
  opacity: 0.05,
});
const AMBIENT_GLOW_STYLE = ambientGlowStyle();

export function LoginPage() {
  const { t, i18n } = useTranslation(["common", "auth"]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const search = useSearch();
  const login = useAuthStore((s) => s.login);
  const usernameRef = useAutoFocus<HTMLInputElement>();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body = new URLSearchParams({
        username,
        password,
        grant_type: "password",
      });
      const resp = await fetch("/api/v1/auth/token", {
        method: "POST",
        headers: {
          "Accept-Language": i18n.language || "zh",
        },
        body,
      });

      if (!resp.ok) {
        const data = (await resp.json().catch(() => ({}))) as Partial<ErrorResponse>;
        const detail = data.detail;
        throw new Error(typeof detail === "string" ? detail : t("auth:login_failed"));
      }

      const data = (await resp.json()) as LoginResponse;
      login(data.access_token, username);
      const returnTo = safeReturnPath(new URLSearchParams(search).get("from"));
      setLocation(returnTo ?? "/app/projects");
    } catch (err) {
      setError(errMsg(err, t("auth:login_failed")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="login-page"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4 text-text"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0" style={AMBIENT_GLOW_STYLE} />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={POSTER_GRID_STYLE} />

      <div
        className="relative w-full max-w-[400px] overflow-hidden rounded-2xl border border-hairline shadow-[var(--shadow-glow)]"
        style={CARD_STYLE}
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{
            background:
              "linear-gradient(90deg, var(--color-rail) 0%, var(--color-accent-2) 50%, var(--color-accent) 100%)",
          }}
        />

        <div className="px-8 pb-8 pt-9">
          <div className="mb-7 text-center">
            <div className="flex justify-center">
              <BrandWordmark sizeClassName="text-[26px]" markSize={28} />
            </div>
            <p className="m-0 mt-2.5 text-[13px] leading-snug text-text-3">
              {BRAND.tagline}
            </p>
          </div>

          <form onSubmit={voidPromise(handleSubmit)} className="space-y-4">
            <div>
              <FieldLabel htmlFor="login-username" required>
                {t("auth:username")}
              </FieldLabel>
              <div className="relative">
                <User
                  className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${iconClass.sm} text-text-3`}
                  weight={ICON.weight}
                  aria-hidden
                />
                <input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  spellCheck={false}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`${INPUT_CLS} pl-9`}
                  ref={usernameRef}
                  required
                />
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="login-password" required>
                {t("auth:password")}
              </FieldLabel>
              <div className="relative">
                <Lock
                  className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${iconClass.sm} text-text-3`}
                  weight={ICON.weight}
                  aria-hidden
                />
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${INPUT_CLS} pl-9`}
                  required
                />
              </div>
            </div>

            {error && (
              <p role="alert" aria-live="polite" className="text-sm text-danger">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-10 w-full justify-center text-[13px] font-semibold"
            >
              {loading ? (
                <CircleNotch
                  aria-hidden
                  className={`${iconClass.md} motion-safe:animate-spin`}
                  weight={ICON.weight}
                />
              ) : null}
              {loading ? t("auth:logging_in") : t("auth:login")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
