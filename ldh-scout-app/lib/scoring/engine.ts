import { clamp, compact, matchPattern } from "@/lib/utils";
import { inferTopicKeys, topicLabel } from "./topic-taxonomy";
import type { Rubric } from "./rubric";
import type { ExtractedContact } from "@/lib/preprints/types";

interface PaperLike {
  title: string;
  abstract: string | null;
  category: string | null;
  corresponding_institution: string | null;
  published_doi: string | null;
  normalized_topics: string[] | null;
}

export interface ScoreResult {
  fitScore: number;
  impactScore: number;
  contactabilityScore: number;
  penaltyTotal: number;
  priorityScore: number;
  scoreBand: "high" | "review" | "low";
  explanationJson: Record<string, unknown>;
  normalizedTopics: string[];
}

const METHODOLOGY_PATTERNS: Record<string, RegExp[]> = {
  external_validation: [/\bexternal validation\b/i, /\bexternally validated\b/i],
  prospective_study: [/\bprospective\b/i, /\bpragmatic\b/i],
  multicentre_study: [/\bmulticentre\b/i, /\bmulticenter\b/i, /\bmulti-site\b/i, /\bmulti hospital\b/i],
  randomised_evaluation: [/\brandomi[sz]ed\b/i, /\bcluster random/i],
  implementation_in_real_workflow: [/\bworkflow\b/i, /\bimplemented in\b/i, /\bdeployment\b/i],
  health_equity_analysis: [/\bfairness\b/i, /\bequity\b/i, /\bbias\b/i],
  regulatory_or_safety_analysis: [/\bregulatory\b/i, /\bsafety\b/i, /\bgovernance\b/i],
  open_code_or_open_model_card: [/\bopen source\b/i, /\bopen code\b/i, /\bmodel card\b/i],
};

const FIT_PENALTY_PATTERNS: Record<string, RegExp[]> = {
  no_real_health_application: [/\bnon-clinical\b/i, /\bwithout clinical deployment\b/i],
  toy_dataset_only: [/\bmnist\b/i, /\bcifar\b/i, /\btoy dataset\b/i],
  pure_methods_without_clinical_context: [/\bmethodological\b/i, /\bproof of concept\b/i],
  single_centre_small_sample: [/\bsingle-centre\b/i, /\bsingle center\b/i, /\bn\s*[<=>]\s*100\b/i],
  marketing_or_product_promo_tone: [/\bplatform\b.{0,25}\bleading\b/i, /\bcommercial solution\b/i],
  non_health_domain: [/\bretail\b/i, /\bfinance\b/i, /\btraffic\b/i, /\bsports analytics\b/i],
};

const IMPACT_PATTERNS: Record<string, RegExp[]> = {
  top_institution: [
    /\b(stanford|harvard|oxford|cambridge|mit|imperial college|ucl|johns hopkins|karolinska|mass general|mayo clinic)\b/i,
  ],
  strong_funder: [/\b(nih|nihr|wellcome|gates foundation|ukri|mrc|horizon europe|european commission)\b/i],
  large_dataset: [/\bn\s*[=>: ]+\s*(\d{4,}|\d+\.\d+\s*million|\d+\s*million)\b/i, /\bcohort of\s+\d{4,}\b/i],
  multinational_dataset: [/\bmultinational\b/i, /\bmulti-country\b/i, /\bacross\s+\d+\s+countries\b/i],
  novel_task_or_population: [/\bnovel\b/i, /\bfirst\b/i, /\bunderserved\b/i, /\brare disease\b/i],
  high_download_velocity: [],
  linked_published_version: [],
  clinically_actionable_endpoint: [/\bmortality\b/i, /\breadmission\b/i, /\bdiagnostic accuracy\b/i, /\bclinical outcome\b/i],
  policy_or_health_system_relevance: [/\bhealth system\b/i, /\bpolicy\b/i, /\bnational rollout\b/i],
};

const ANIMAL_ONLY_PATTERNS = [/\bmouse\b/i, /\bmice\b/i, /\bmurine\b/i, /\brat model\b/i, /\bzebrafish\b/i];
const HUMAN_PATTERNS = [/\bpatient\b/i, /\bhuman\b/i, /\bcohort\b/i, /\bclinic\b/i, /\bhospital\b/i];
const DIGITAL_HEALTH_HINTS = [
  /\bhealth\b/i,
  /\bclinical\b/i,
  /\bpatient\b/i,
  /\bcare\b/i,
  /\bpublic health\b/i,
  /\bdiagnos/i,
];

function textForPaper(paper: PaperLike) {
  return `${paper.title}\n${paper.abstract || ""}\n${paper.category || ""}\n${
    paper.corresponding_institution || ""
  }`;
}

function patternMatches(patterns: RegExp[], text: string) {
  return patterns.some((pattern) => pattern.test(text));
}

function hasHumanSignal(text: string) {
  return HUMAN_PATTERNS.some((pattern) => pattern.test(text));
}

function hasAnimalOnlySignal(text: string) {
  return ANIMAL_ONLY_PATTERNS.some((pattern) => pattern.test(text)) && !hasHumanSignal(text);
}

function calculateContactability(
  contacts: ExtractedContact[],
  rubric: Rubric,
  reasons: string[],
  penalties: string[],
) {
  let score = 0;
  const publicEmails = contacts.filter((contact) => Boolean(contact.contact_email));
  const orcids = contacts.filter((contact) => Boolean(contact.orcid));
  const fullAffiliations = contacts.filter((contact) => Boolean(contact.affiliation));
  const publicProfiles = contacts.filter((contact) => Boolean(contact.contact_url));

  if (publicEmails.length > 0) {
    score += rubric.contactability.signals.public_corresponding_email || 0;
    reasons.push("Public corresponding-author email found");
  }

  if (orcids.length > 0) {
    score += rubric.contactability.signals.orcid_present || 0;
    reasons.push("ORCID present");
  }

  if (publicProfiles.length > 0) {
    score += rubric.contactability.signals.institutional_profile_found || 0;
    reasons.push("Public profile link found");
  }

  if (fullAffiliations.length > 0) {
    score += rubric.contactability.signals.complete_affiliation || 0;
    reasons.push("Affiliation present");
  }

  if (publicEmails.length + orcids.length + publicProfiles.length >= 2) {
    score += rubric.contactability.signals.multiple_public_contacts || 0;
    reasons.push("Multiple public contact routes");
  }

  if (contacts.length === 0 || (!publicEmails.length && !orcids.length && !publicProfiles.length)) {
    score -= rubric.contactability.penalties.no_public_contact_found || 0;
    penalties.push("No public contact route located");
  } else if (publicEmails.length === 0) {
    score -= rubric.contactability.penalties.generic_contact_only || 0;
    penalties.push("No direct public email available");
  }

  return clamp(score, 0, 100);
}

function calculateImpact(paper: PaperLike, rubric: Rubric, reasons: string[]) {
  const text = textForPaper(paper);
  let score = 0;

  for (const [signal, patterns] of Object.entries(IMPACT_PATTERNS)) {
    if (signal === "linked_published_version") {
      if (paper.published_doi) {
        score += rubric.impact.signals.linked_published_version || 0;
        reasons.push("Linked published version found");
      }
      continue;
    }

    if (patterns.length > 0 && patternMatches(patterns, text)) {
      score += rubric.impact.signals[signal] || 0;
      reasons.push(signal.replace(/_/g, " "));
    }
  }

  return clamp(score, 0, 100);
}

export function scorePaper(
  paper: PaperLike,
  contacts: ExtractedContact[],
  rubric: Rubric,
): ScoreResult {
  const text = textForPaper(paper);
  const fitReasons: string[] = [];
  const fitPenaltyReasons: string[] = [];
  const impactReasons: string[] = [];
  const contactReasons: string[] = [];
  const contactPenaltyReasons: string[] = [];
  const hardFiltersTriggered: string[] = [];

  const inferredTopics = paper.normalized_topics?.length ? paper.normalized_topics : inferTopicKeys(text);
  let fitPositive = 0;
  let penaltyTotal = 0;

  for (const topicKey of inferredTopics) {
    const points = rubric.fit.topic_weights[topicKey] || 0;
    if (points > 0) {
      fitPositive += points;
      fitReasons.push(`${topicLabel(topicKey)} (+${points})`);
    }
  }

  for (const [methodologyKey, patterns] of Object.entries(METHODOLOGY_PATTERNS)) {
    if (patternMatches(patterns, text)) {
      const points = rubric.fit.methodology_weights[methodologyKey] || 0;
      if (points > 0) {
        fitPositive += points;
        fitReasons.push(`${methodologyKey.replace(/_/g, " ")} (+${points})`);
      }
    }
  }

  for (const boost of rubric.fit.keyword_boosts) {
    if (matchPattern(boost.pattern, text)) {
      fitPositive += boost.points;
      fitReasons.push(`keyword boost: ${boost.pattern} (+${boost.points})`);
    }
  }

  for (const [penaltyKey, patterns] of Object.entries(FIT_PENALTY_PATTERNS)) {
    if (patternMatches(patterns, text)) {
      const points = rubric.fit.penalties[penaltyKey] || 0;
      if (points > 0) {
        penaltyTotal += points;
        fitPenaltyReasons.push(`${penaltyKey.replace(/_/g, " ")} (-${points})`);
      }
    }
  }

  for (const penalty of rubric.fit.keyword_penalties) {
    if (matchPattern(penalty.pattern, text)) {
      penaltyTotal += penalty.points;
      fitPenaltyReasons.push(`keyword penalty: ${penalty.pattern} (-${penalty.points})`);
    }
  }

  const fitScore = clamp(fitPositive - penaltyTotal, 0, 100);
  const impactScore = calculateImpact(paper, rubric, impactReasons);
  const contactabilityScore = calculateContactability(
    contacts,
    rubric,
    contactReasons,
    contactPenaltyReasons,
  );

  if (rubric.hard_filters.exclude_if_already_published && paper.published_doi) {
    hardFiltersTriggered.push("Already linked to a journal publication");
  }

  if (
    rubric.hard_filters.exclude_animal_only_without_human_health_link &&
    hasAnimalOnlySignal(text)
  ) {
    hardFiltersTriggered.push("Animal-only work without clear human-health link");
  }

  if (
    rubric.hard_filters.exclude_non_health_domain &&
    inferredTopics.length === 0 &&
    !DIGITAL_HEALTH_HINTS.some((pattern) => pattern.test(text))
  ) {
    hardFiltersTriggered.push("Does not appear to be a health paper");
  }

  let priorityScore = clamp(
    rubric.weights.fit * fitScore +
      rubric.weights.impact * impactScore +
      rubric.weights.contactability * contactabilityScore,
    0,
    100,
  );

  if (hardFiltersTriggered.length > 0) {
    priorityScore = Math.min(priorityScore, Math.max(0, rubric.thresholds.low_priority - 5));
  }

  const scoreBand =
    hardFiltersTriggered.length > 0
      ? "low"
      : priorityScore >= rubric.thresholds.auto_high_priority
        ? "high"
        : priorityScore >= rubric.thresholds.editor_review
          ? "review"
          : "low";

  const summary =
    scoreBand === "high"
      ? rubric.explanation_templates.high_priority
      : scoreBand === "review"
        ? rubric.explanation_templates.review
        : rubric.explanation_templates.low_priority;

  return {
    fitScore,
    impactScore,
    contactabilityScore,
    penaltyTotal,
    priorityScore,
    scoreBand,
    normalizedTopics: inferredTopics,
    explanationJson: {
      summary,
      fit_reasons: fitReasons,
      fit_penalties: fitPenaltyReasons,
      impact_reasons: impactReasons,
      contact_reasons: compact([...contactReasons, ...contactPenaltyReasons]),
      hard_filters: hardFiltersTriggered,
      matched_topics: inferredTopics.map((key) => ({
        key,
        label: topicLabel(key),
        weight: rubric.fit.topic_weights[key] || 0,
      })),
    },
  };
}
