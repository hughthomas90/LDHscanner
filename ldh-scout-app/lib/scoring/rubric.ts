import { coerceBoolean, coerceNumber, coerceString, safeJsonParse } from "@/lib/utils";

export type RubricStatus = "draft" | "active" | "archived";

export interface PatternPoints {
  pattern: string;
  points: number;
}

export interface Rubric {
  rubric_version: string;
  description: string;
  status: RubricStatus;
  weights: {
    fit: number;
    impact: number;
    contactability: number;
  };
  thresholds: {
    auto_high_priority: number;
    editor_review: number;
    low_priority: number;
  };
  fit: {
    topic_weights: Record<string, number>;
    methodology_weights: Record<string, number>;
    penalties: Record<string, number>;
    keyword_boosts: PatternPoints[];
    keyword_penalties: PatternPoints[];
  };
  impact: {
    signals: Record<string, number>;
    caps: Record<string, number>;
  };
  contactability: {
    signals: Record<string, number>;
    penalties: Record<string, number>;
  };
  hard_filters: Record<string, boolean>;
  topic_taxonomy: string[];
  explanation_templates: {
    high_priority: string;
    review: string;
    low_priority: string;
  };
}

export interface RubricVersionRow {
  id: string;
  version_name: string;
  status: RubricStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  activated_at: string | null;
  rubric_json: Rubric;
}

export function normalizeRubric(rubric: Rubric): Rubric {
  const totalWeight =
    Number(rubric.weights.fit || 0) +
    Number(rubric.weights.impact || 0) +
    Number(rubric.weights.contactability || 0);

  const safeWeight = totalWeight > 0 ? totalWeight : 1;
  return {
    ...rubric,
    weights: {
      fit: Number((Number(rubric.weights.fit || 0) / safeWeight).toFixed(4)),
      impact: Number((Number(rubric.weights.impact || 0) / safeWeight).toFixed(4)),
      contactability: Number((Number(rubric.weights.contactability || 0) / safeWeight).toFixed(4)),
    },
    thresholds: {
      auto_high_priority: Number(rubric.thresholds.auto_high_priority || 80),
      editor_review: Number(rubric.thresholds.editor_review || 65),
      low_priority: Number(rubric.thresholds.low_priority || 45),
    },
  };
}

export function serializeKeyValueMap(input: Record<string, number>) {
  return Object.entries(input)
    .map(([key, value]) => `${key} = ${value}`)
    .join("\n");
}

export function parseKeyValueMap(text: string) {
  const entries = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const result: Record<string, number> = {};
  for (const line of entries) {
    const match = line.match(/^([^=]+)=(.+)$/);
    if (!match) {
      continue;
    }
    const key = match[1].trim();
    const value = Number(match[2].trim());
    if (!key || Number.isNaN(value)) {
      continue;
    }
    result[key] = value;
  }
  return result;
}

export function serializePatternList(input: PatternPoints[]) {
  return input.map((item) => `${item.pattern} | ${item.points}`).join("\n");
}

export function parsePatternList(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const [pattern, pointsRaw] = line.split("|").map((value) => value.trim());
      const points = Number(pointsRaw);
      if (!pattern || Number.isNaN(points)) {
        return [];
      }
      return [{ pattern, points }];
    });
}

export function serializeTopicTaxonomy(input: string[]) {
  return input.join("\n");
}

export function parseTopicTaxonomy(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function rubricToFormFields(rubric: Rubric) {
  return {
    rubric_version: rubric.rubric_version,
    description: rubric.description,
    weights_fit: String(rubric.weights.fit),
    weights_impact: String(rubric.weights.impact),
    weights_contactability: String(rubric.weights.contactability),
    threshold_high: String(rubric.thresholds.auto_high_priority),
    threshold_review: String(rubric.thresholds.editor_review),
    threshold_low: String(rubric.thresholds.low_priority),
    fit_topic_weights: serializeKeyValueMap(rubric.fit.topic_weights),
    fit_methodology_weights: serializeKeyValueMap(rubric.fit.methodology_weights),
    fit_penalties: serializeKeyValueMap(rubric.fit.penalties),
    fit_keyword_boosts: serializePatternList(rubric.fit.keyword_boosts),
    fit_keyword_penalties: serializePatternList(rubric.fit.keyword_penalties),
    impact_signals: serializeKeyValueMap(rubric.impact.signals),
    impact_caps: serializeKeyValueMap(rubric.impact.caps),
    contact_signals: serializeKeyValueMap(rubric.contactability.signals),
    contact_penalties: serializeKeyValueMap(rubric.contactability.penalties),
    hard_filters_json: JSON.stringify(rubric.hard_filters, null, 2),
    topic_taxonomy: serializeTopicTaxonomy(rubric.topic_taxonomy),
    template_high: rubric.explanation_templates.high_priority,
    template_review: rubric.explanation_templates.review,
    template_low: rubric.explanation_templates.low_priority,
    raw_json: JSON.stringify(rubric, null, 2),
  };
}

export function formDataToRubric(formData: FormData, fallback: Rubric) {
  const mode = coerceString(formData.get("editor_mode")) || "guided";

  if (mode === "raw") {
    const rawJson = coerceString(formData.get("raw_json"));
    const parsed = safeJsonParse<Rubric>(rawJson, fallback);
    return normalizeRubric(parsed);
  }

  const hardFilters = safeJsonParse<Record<string, boolean>>(
    coerceString(formData.get("hard_filters_json")),
    fallback.hard_filters,
  );

  const rubric: Rubric = {
    rubric_version: coerceString(formData.get("rubric_version")) || fallback.rubric_version,
    description: coerceString(formData.get("description")) || fallback.description,
    status: fallback.status,
    weights: {
      fit: coerceNumber(formData.get("weights_fit"), fallback.weights.fit),
      impact: coerceNumber(formData.get("weights_impact"), fallback.weights.impact),
      contactability: coerceNumber(
        formData.get("weights_contactability"),
        fallback.weights.contactability,
      ),
    },
    thresholds: {
      auto_high_priority: coerceNumber(
        formData.get("threshold_high"),
        fallback.thresholds.auto_high_priority,
      ),
      editor_review: coerceNumber(
        formData.get("threshold_review"),
        fallback.thresholds.editor_review,
      ),
      low_priority: coerceNumber(formData.get("threshold_low"), fallback.thresholds.low_priority),
    },
    fit: {
      topic_weights: parseKeyValueMap(
        coerceString(formData.get("fit_topic_weights")) ||
          serializeKeyValueMap(fallback.fit.topic_weights),
      ),
      methodology_weights: parseKeyValueMap(
        coerceString(formData.get("fit_methodology_weights")) ||
          serializeKeyValueMap(fallback.fit.methodology_weights),
      ),
      penalties: parseKeyValueMap(
        coerceString(formData.get("fit_penalties")) || serializeKeyValueMap(fallback.fit.penalties),
      ),
      keyword_boosts: parsePatternList(
        coerceString(formData.get("fit_keyword_boosts")) ||
          serializePatternList(fallback.fit.keyword_boosts),
      ),
      keyword_penalties: parsePatternList(
        coerceString(formData.get("fit_keyword_penalties")) ||
          serializePatternList(fallback.fit.keyword_penalties),
      ),
    },
    impact: {
      signals: parseKeyValueMap(
        coerceString(formData.get("impact_signals")) ||
          serializeKeyValueMap(fallback.impact.signals),
      ),
      caps: parseKeyValueMap(
        coerceString(formData.get("impact_caps")) || serializeKeyValueMap(fallback.impact.caps),
      ),
    },
    contactability: {
      signals: parseKeyValueMap(
        coerceString(formData.get("contact_signals")) ||
          serializeKeyValueMap(fallback.contactability.signals),
      ),
      penalties: parseKeyValueMap(
        coerceString(formData.get("contact_penalties")) ||
          serializeKeyValueMap(fallback.contactability.penalties),
      ),
    },
    hard_filters: Object.fromEntries(
      Object.keys(fallback.hard_filters).map((key) => {
        if (Object.prototype.hasOwnProperty.call(hardFilters, key)) {
          return [key, Boolean(hardFilters[key])];
        }
        return [key, coerceBoolean(formData.get(key))];
      }),
    ),
    topic_taxonomy: parseTopicTaxonomy(
      coerceString(formData.get("topic_taxonomy")) || serializeTopicTaxonomy(fallback.topic_taxonomy),
    ),
    explanation_templates: {
      high_priority:
        coerceString(formData.get("template_high")) || fallback.explanation_templates.high_priority,
      review: coerceString(formData.get("template_review")) || fallback.explanation_templates.review,
      low_priority: coerceString(formData.get("template_low")) || fallback.explanation_templates.low_priority,
    },
  };

  return normalizeRubric(rubric);
}
