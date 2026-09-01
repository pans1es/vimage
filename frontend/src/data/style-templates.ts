/** 风格模版前端清单（id + category，prompt 由后端展开）。 */
export type StyleCategory = "live" | "anim";

export interface StyleTemplate {
  id: string;
  category: StyleCategory;
}

export const STYLE_TEMPLATES: StyleTemplate[] = [
  // ===== 真人 =====
  { id: "live_cinematic_ancient", category: "live" },
  { id: "live_zhang_yimou", category: "live" },
  { id: "live_ancient_xianxia", category: "live" },
  { id: "live_premium_drama", category: "live" },
  { id: "live_cinema", category: "live" },
  { id: "live_spartan", category: "live" },
  { id: "live_bladerunner", category: "live" },
  { id: "live_got", category: "live" },
  { id: "live_breaking_bad", category: "live" },
  { id: "live_kdrama", category: "live" },
  { id: "live_kurosawa", category: "live" },
  { id: "live_nolan", category: "live" },
  { id: "live_tarantino", category: "live" },
  { id: "live_lynch", category: "live" },
  { id: "live_anderson", category: "live" },
  { id: "live_wong", category: "live" },
  { id: "live_shaw", category: "live" },
  { id: "live_cyberpunk", category: "live" },
  // ===== 动画 =====
  { id: "anim_3d_cg", category: "anim" },
  { id: "anim_cn_3d", category: "anim" },
  { id: "anim_kyoto", category: "anim" },
  { id: "anim_arcane", category: "anim" },
  { id: "anim_us_3d", category: "anim" },
  { id: "anim_ink_wushan", category: "anim" },
  { id: "anim_ink_papercut", category: "anim" },
  { id: "anim_felt", category: "anim" },
  { id: "anim_clay", category: "anim" },
  { id: "anim_jp_horror", category: "anim" },
  { id: "anim_kr_webtoon", category: "anim" },
  { id: "anim_zzz", category: "anim" },
  { id: "anim_ghibli", category: "anim" },
  { id: "anim_demon_slayer", category: "anim" },
  { id: "anim_cyberpunk", category: "anim" },
  { id: "anim_bloodborne", category: "anim" },
  { id: "anim_itojunji", category: "anim" },
  { id: "anim_90s_retro", category: "anim" },
];

export const DEFAULT_TEMPLATE_ID = "live_premium_drama";

export function getTemplatesByCategory(cat: StyleCategory): StyleTemplate[] {
  return STYLE_TEMPLATES.filter((t) => t.category === cat);
}
