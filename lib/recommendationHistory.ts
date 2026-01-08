import type { SupabaseClient } from '@supabase/supabase-js';

export type RecommendationNutrition = {
  sugar_g_100g?: number | null;
  sodium_mg_100g?: number | null;
  protein_g_100g?: number | null;
  fiber_g_100g?: number | null;
  fat_sat_g_100g?: number | null;
};

export type RecommendationItem = {
  rank: number;
  brand: string;
  category: string;
  reasons: string[];
  nutrition?: RecommendationNutrition;
};

export type RecommendationResult = {
  status?: string | null;
  is_safe?: boolean | null;
  assessment_summary?: string | null;
  assessment_reasons?: string[] | null;
  answer?: {
    recommendations?: RecommendationItem[];
    summary?: string | null;
  } | null;
  used_query?: string | null;
  query?: string | null;
};

export type RecommendationHistoryRow = {
  id: string;
  user_id: string;
  status: string | null;
  used_query: string | null;
  is_safe: boolean | null;
  assessment_summary: string | null;
  assessment_reasons: string[] | null;
  answer_summary: string | null;
  rec1_rank: number | null;
  rec1_brand: string | null;
  rec1_category: string | null;
  rec1_reasons: string[] | null;
  rec1_sugar_g_100g: number | null;
  rec1_sodium_mg_100g: number | null;
  rec1_protein_g_100g: number | null;
  rec1_fiber_g_100g: number | null;
  rec1_fat_sat_g_100g: number | null;
  rec2_rank: number | null;
  rec2_brand: string | null;
  rec2_category: string | null;
  rec2_reasons: string[] | null;
  rec2_sugar_g_100g: number | null;
  rec2_sodium_mg_100g: number | null;
  rec2_protein_g_100g: number | null;
  rec2_fiber_g_100g: number | null;
  rec2_fat_sat_g_100g: number | null;
  rec3_rank: number | null;
  rec3_brand: string | null;
  rec3_category: string | null;
  rec3_reasons: string[] | null;
  rec3_sugar_g_100g: number | null;
  rec3_sodium_mg_100g: number | null;
  rec3_protein_g_100g: number | null;
  rec3_fiber_g_100g: number | null;
  rec3_fat_sat_g_100g: number | null;
  rec4_rank: number | null;
  rec4_brand: string | null;
  rec4_category: string | null;
  rec4_reasons: string[] | null;
  rec4_sugar_g_100g: number | null;
  rec4_sodium_mg_100g: number | null;
  rec4_protein_g_100g: number | null;
  rec4_fiber_g_100g: number | null;
  rec4_fat_sat_g_100g: number | null;
  rec5_rank: number | null;
  rec5_brand: string | null;
  rec5_category: string | null;
  rec5_reasons: string[] | null;
  rec5_sugar_g_100g: number | null;
  rec5_sodium_mg_100g: number | null;
  rec5_protein_g_100g: number | null;
  rec5_fiber_g_100g: number | null;
  rec5_fat_sat_g_100g: number | null;
  created_at: string;
};

export type RecommendationHistoryInsertPayload = Omit<
  RecommendationHistoryRow,
  'id' | 'created_at' | 'user_id'
>;

const normalizeString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length ? trimmed : null;
};

const normalizeStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);
};

const normalizeNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const normalizeBoolean = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase();
    if (trimmed === 'true') {
      return true;
    }
    if (trimmed === 'false') {
      return false;
    }
  }

  if (typeof value === 'number') {
    if (value === 1) {
      return true;
    }
    if (value === 0) {
      return false;
    }
  }

  return null;
};

const mapRecommendationForInsert = (item?: RecommendationItem | null) => ({
  rank: normalizeNumber(item?.rank),
  brand: normalizeString(item?.brand),
  category: normalizeString(item?.category),
  reasons: normalizeStringArray(item?.reasons),
  sugar: normalizeNumber(item?.nutrition?.sugar_g_100g),
  sodium: normalizeNumber(item?.nutrition?.sodium_mg_100g),
  protein: normalizeNumber(item?.nutrition?.protein_g_100g),
  fiber: normalizeNumber(item?.nutrition?.fiber_g_100g),
  fat_sat: normalizeNumber(item?.nutrition?.fat_sat_g_100g),
});

const buildRecommendationFromHistory = (
  slice: {
    rank: number | null;
    brand: string | null;
    category: string | null;
    reasons: string[] | null;
    sugar: number | null;
    sodium: number | null;
    protein: number | null;
    fiber: number | null;
    fat_sat: number | null;
  },
  fallbackRank: number,
): RecommendationItem | null => {
  const rank = normalizeNumber(slice.rank) ?? fallbackRank;
  const brand = normalizeString(slice.brand);
  const category = normalizeString(slice.category);
  const reasons = normalizeStringArray(slice.reasons);
  const sugar = normalizeNumber(slice.sugar);
  const sodium = normalizeNumber(slice.sodium);
  const protein = normalizeNumber(slice.protein);
  const fiber = normalizeNumber(slice.fiber);
  const fatSat = normalizeNumber(slice.fat_sat);

  const hasContent =
    slice.rank !== null ||
    brand !== null ||
    category !== null ||
    reasons.length > 0 ||
    sugar !== null ||
    sodium !== null ||
    protein !== null ||
    fiber !== null ||
    fatSat !== null;

  if (!hasContent) {
    return null;
  }

  const nutrition = {
    sugar_g_100g: sugar,
    sodium_mg_100g: sodium,
    protein_g_100g: protein,
    fiber_g_100g: fiber,
    fat_sat_g_100g: fatSat,
  };

  const hasNutrition = Object.values(nutrition).some((value) => value !== null);

  return {
    rank,
    brand: brand ?? '',
    category: category ?? '',
    reasons,
    nutrition: hasNutrition ? nutrition : undefined,
  };
};

export const mapResultToHistoryInsertPayload = (
  result: RecommendationResult,
  usedQuery?: string | null,
): RecommendationHistoryInsertPayload => {
  const recommendations = (result.answer?.recommendations ?? [])
    .slice()
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
    .slice(0, 5);

  const rec1 = mapRecommendationForInsert(recommendations[0]);
  const rec2 = mapRecommendationForInsert(recommendations[1]);
  const rec3 = mapRecommendationForInsert(recommendations[2]);
  const rec4 = mapRecommendationForInsert(recommendations[3]);
  const rec5 = mapRecommendationForInsert(recommendations[4]);

  const fallbackUsedQuery = normalizeString(result.used_query ?? result.query);

  return {
    status: normalizeString(result.status),
    used_query: normalizeString(usedQuery) ?? fallbackUsedQuery,
    is_safe: normalizeBoolean(result.is_safe),
    assessment_summary: normalizeString(result.assessment_summary),
    assessment_reasons: normalizeStringArray(result.assessment_reasons),
    answer_summary: normalizeString(result.answer?.summary),
    rec1_rank: rec1.rank,
    rec1_brand: rec1.brand,
    rec1_category: rec1.category,
    rec1_reasons: rec1.reasons,
    rec1_sugar_g_100g: rec1.sugar,
    rec1_sodium_mg_100g: rec1.sodium,
    rec1_protein_g_100g: rec1.protein,
    rec1_fiber_g_100g: rec1.fiber,
    rec1_fat_sat_g_100g: rec1.fat_sat,
    rec2_rank: rec2.rank,
    rec2_brand: rec2.brand,
    rec2_category: rec2.category,
    rec2_reasons: rec2.reasons,
    rec2_sugar_g_100g: rec2.sugar,
    rec2_sodium_mg_100g: rec2.sodium,
    rec2_protein_g_100g: rec2.protein,
    rec2_fiber_g_100g: rec2.fiber,
    rec2_fat_sat_g_100g: rec2.fat_sat,
    rec3_rank: rec3.rank,
    rec3_brand: rec3.brand,
    rec3_category: rec3.category,
    rec3_reasons: rec3.reasons,
    rec3_sugar_g_100g: rec3.sugar,
    rec3_sodium_mg_100g: rec3.sodium,
    rec3_protein_g_100g: rec3.protein,
    rec3_fiber_g_100g: rec3.fiber,
    rec3_fat_sat_g_100g: rec3.fat_sat,
    rec4_rank: rec4.rank,
    rec4_brand: rec4.brand,
    rec4_category: rec4.category,
    rec4_reasons: rec4.reasons,
    rec4_sugar_g_100g: rec4.sugar,
    rec4_sodium_mg_100g: rec4.sodium,
    rec4_protein_g_100g: rec4.protein,
    rec4_fiber_g_100g: rec4.fiber,
    rec4_fat_sat_g_100g: rec4.fat_sat,
    rec5_rank: rec5.rank,
    rec5_brand: rec5.brand,
    rec5_category: rec5.category,
    rec5_reasons: rec5.reasons,
    rec5_sugar_g_100g: rec5.sugar,
    rec5_sodium_mg_100g: rec5.sodium,
    rec5_protein_g_100g: rec5.protein,
    rec5_fiber_g_100g: rec5.fiber,
    rec5_fat_sat_g_100g: rec5.fat_sat,
  };
};

export const mapHistoryRowToUiModel = (row: RecommendationHistoryRow): RecommendationResult => {
  const recommendations: RecommendationItem[] = [];

  const rec1 = buildRecommendationFromHistory(
    {
      rank: row.rec1_rank,
      brand: row.rec1_brand,
      category: row.rec1_category,
      reasons: row.rec1_reasons,
      sugar: row.rec1_sugar_g_100g,
      sodium: row.rec1_sodium_mg_100g,
      protein: row.rec1_protein_g_100g,
      fiber: row.rec1_fiber_g_100g,
      fat_sat: row.rec1_fat_sat_g_100g,
    },
    1,
  );
  if (rec1) {
    recommendations.push(rec1);
  }

  const rec2 = buildRecommendationFromHistory(
    {
      rank: row.rec2_rank,
      brand: row.rec2_brand,
      category: row.rec2_category,
      reasons: row.rec2_reasons,
      sugar: row.rec2_sugar_g_100g,
      sodium: row.rec2_sodium_mg_100g,
      protein: row.rec2_protein_g_100g,
      fiber: row.rec2_fiber_g_100g,
      fat_sat: row.rec2_fat_sat_g_100g,
    },
    2,
  );
  if (rec2) {
    recommendations.push(rec2);
  }

  const rec3 = buildRecommendationFromHistory(
    {
      rank: row.rec3_rank,
      brand: row.rec3_brand,
      category: row.rec3_category,
      reasons: row.rec3_reasons,
      sugar: row.rec3_sugar_g_100g,
      sodium: row.rec3_sodium_mg_100g,
      protein: row.rec3_protein_g_100g,
      fiber: row.rec3_fiber_g_100g,
      fat_sat: row.rec3_fat_sat_g_100g,
    },
    3,
  );
  if (rec3) {
    recommendations.push(rec3);
  }

  const rec4 = buildRecommendationFromHistory(
    {
      rank: row.rec4_rank,
      brand: row.rec4_brand,
      category: row.rec4_category,
      reasons: row.rec4_reasons,
      sugar: row.rec4_sugar_g_100g,
      sodium: row.rec4_sodium_mg_100g,
      protein: row.rec4_protein_g_100g,
      fiber: row.rec4_fiber_g_100g,
      fat_sat: row.rec4_fat_sat_g_100g,
    },
    4,
  );
  if (rec4) {
    recommendations.push(rec4);
  }

  const rec5 = buildRecommendationFromHistory(
    {
      rank: row.rec5_rank,
      brand: row.rec5_brand,
      category: row.rec5_category,
      reasons: row.rec5_reasons,
      sugar: row.rec5_sugar_g_100g,
      sodium: row.rec5_sodium_mg_100g,
      protein: row.rec5_protein_g_100g,
      fiber: row.rec5_fiber_g_100g,
      fat_sat: row.rec5_fat_sat_g_100g,
    },
    5,
  );
  if (rec5) {
    recommendations.push(rec5);
  }

  return {
    status: row.status,
    is_safe: row.is_safe,
    assessment_summary: row.assessment_summary,
    assessment_reasons: normalizeStringArray(row.assessment_reasons),
    answer: {
      summary: row.answer_summary,
      recommendations,
    },
    used_query: row.used_query,
  };
};

export const getLatestRecommendationHistory = async (
  supabaseClient: SupabaseClient,
): Promise<RecommendationHistoryRow | null> => {
  const { data: userData, error: userError } = await supabaseClient.auth.getUser();

  if (userError || !userData.user) {
    return null;
  }

  const { data, error } = await supabaseClient
    .from('recommendation_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as RecommendationHistoryRow | null;
};

export const getRecommendationHistoryById = async (
  supabaseClient: SupabaseClient,
  id: string,
): Promise<RecommendationHistoryRow | null> => {
  const { data: userData, error: userError } = await supabaseClient.auth.getUser();

  if (userError || !userData.user) {
    return null;
  }

  const { data, error } = await supabaseClient
    .from('recommendation_history')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as RecommendationHistoryRow | null;
};
