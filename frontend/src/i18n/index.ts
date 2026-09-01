import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { BRAND } from '@/branding';

// 按需加载 i18n namespace（issue #489）：
// Vite import.meta.glob 在编译期为每个 (lang, ns) 文件生成独立 chunk；运行时由
// i18next 异步 load。资源仍是 .ts（保留 satisfies Record schema 锁），不是 JSON。
// 界面可选语言仅 zh / en；vi 文案目录仍保留供 key 一致性校验，但不进入切换器。
const loaders = import.meta.glob<{ default: Record<string, string> }>(
  './{en,zh}/*.ts',
);

function pathFor(lang: string, ns: string): string {
  return `./${lang}/${ns}.ts`;
}

export const SUPPORTED_LANGUAGES = ['zh', 'en'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const LANGUAGE_DISPLAY_LABELS: Record<SupportedLanguage, string> = {
  zh: '中文',
  en: 'English',
};

/** 用户曾在设置里手动切换过语言时写入；仅有此标记才信任 i18nextLng。 */
export const LANG_CHOSEN_STORAGE_KEY = 'vimage.langChosen';

const I18N_LNG_STORAGE_KEY = 'i18nextLng';

const I18N_NAMESPACES = [
  'common',
  'auth',
  'dashboard',
  'errors',
  'events',
  'templates',
  'assets',
  'onboarding',
  'workflow',
] as const;

function isSupportedLanguage(code: string): code is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(code);
}

// Replace every [[brand]] placeholder in a loaded namespace with the current
// brand name. Done inside the resourcesToBackend loader so it composes with
// on-demand chunk loading (issue #489). We use [[...]] rather than i18next's
// native {{...}} so the value is not treated as a runtime variable (which
// would force every t() call site to pass { brand }).
function applyBrandPlaceholders(value: unknown): unknown {
  if (typeof value === 'string') {
    // Function replacer avoids `$`-sequences in BRAND.name (e.g. "Product$1")
    // being interpreted as String.prototype.replace patterns.
    return value.replace(/\[\[\s*brand\s*\]\]/g, () => BRAND.name);
  }
  if (Array.isArray(value)) {
    return value.map(applyBrandPlaceholders);
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = applyBrandPlaceholders(v);
    }
    return out;
  }
  return value;
}

/**
 * 丢弃「仅由旧版浏览器语言探测写下、用户从未手动确认」的 i18nextLng，
 * 让首访与未选手动语言的会话固定走 fallback zh。
 */
function discardUnconfirmedDetectorLanguage(): void {
  try {
    if (typeof localStorage === 'undefined') return;
    if (localStorage.getItem(LANG_CHOSEN_STORAGE_KEY) === '1') return;
    localStorage.removeItem(I18N_LNG_STORAGE_KEY);
  } catch {
    // private mode / blocked storage — ignore
  }
}

/** 把已下架的 UI 语言（如 vi）回落到默认中文。 */
function coerceUnsupportedUiLanguage(): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(I18N_LNG_STORAGE_KEY);
    if (!raw) return;
    const base = raw.split('-')[0] ?? '';
    if (!isSupportedLanguage(base)) {
      localStorage.setItem(I18N_LNG_STORAGE_KEY, 'zh');
    }
  } catch {
    // ignore
  }
}

/** 设置页切换语言时调用：持久化选择并切换。 */
export function setAppLanguage(lang: SupportedLanguage): void {
  try {
    localStorage.setItem(LANG_CHOSEN_STORAGE_KEY, '1');
  } catch {
    // ignore
  }
  void i18n.changeLanguage(lang);
}

discardUnconfirmedDetectorLanguage();
coerceUnsupportedUiLanguage();

// 返回 init Promise，调用方（main.tsx / test setup）await 后再 render，避免首屏闪 key。
export const i18nReady = i18n
  .use(
    resourcesToBackend(async (lang: string, ns: string) => {
      const loader = loaders[pathFor(lang, ns)];
      if (!loader) {
        // LanguageDetector 可能解析出 zh-CN / en-GB 等带区域的 BCP47 代码，
        // i18next 会先按完整代码请求一次再 fallback 到 zh/en。这是预期路径，
        // 不应该升级成异常。返回空对象让 i18next 走 fallback 链。
        console.warn(`i18n: no resource for ${pathFor(lang, ns)}, falling back`);
        return {};
      }
      const mod = await loader();
      return applyBrandPlaceholders(mod.default) as Record<string, string>;
    }),
  )
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'zh',
    supportedLngs: [...SUPPORTED_LANGUAGES],
    nonExplicitSupportedLngs: true,
    debug: false,
    interpolation: { escapeValue: false },
    defaultNS: 'common',
    ns: I18N_NAMESPACES,
    partialBundledLanguages: true,
    react: { useSuspense: false },
    // 不读 navigator：避免系统英文盖过中文默认；仅信任用户手动选择后的 localStorage。
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: I18N_LNG_STORAGE_KEY,
    },
  });

export default i18n;
