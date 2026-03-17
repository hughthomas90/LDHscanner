import { EXCLUSION_PATTERNS, TOPIC_PATTERNS } from "@/lib/rules/dictionaries";

export type ScoreResult = {
  fitScore: number;
  solicitationScore: number;
  reasonFlags: string[];
  modalityTags: string[];
};

type ScoringInput = {
  title: string;
  abstractText?: string | null;
  sourceType: "preprint" | "trial" | "grant";
  currentStatus?: string | null;
  sponsorName?: string | null;
};

export function scoreItem(input: ScoringInput): ScoreResult {
  const combinedText = `${input.title}\n${input.abstractText ?? ""}`;
  const reasonFlags = new Set<string>();
  const modalityTags = new Set<string>();
  let fitScore = 10;
  let solicitationScore = input.sourceType === "trial" ? 20 : 10;

  if (EXCLUSION_PATTERNS.some((pattern) => pattern.test(combinedText))) {
    return {
      fitScore: 0,
      solicitationScore: 0,
      reasonFlags: ["matched_exclusion_keyword"],
      modalityTags: []
    };
  }

  Object.entries(TOPIC_PATTERNS).forEach(([tag, patterns]) => {
    if (patterns.some((pattern) => pattern.test(combinedText))) {
      modalityTags.add(tag);
      reasonFlags.add(`matched_${tag}`);
      fitScore += 8;
    }
  });

  if (/multicentre|multi-centre|multicenter/i.test(combinedText)) {
    solicitationScore += 10;
    reasonFlags.add("multicentre_signal");
  }

  if (/industry|company|commercial/i.test(combinedText) || input.sponsorName) {
    solicitationScore += 8;
    reasonFlags.add("company_link_signal");
  }

  if (/prospective|randomi[sz]ed|real-world/i.test(combinedText)) {
    solicitationScore += 12;
    reasonFlags.add("strong_study_design_signal");
  }

  if (input.sourceType === "trial" && /recruiting|active, not recruiting|completed/i.test(input.currentStatus ?? "")) {
    solicitationScore += 14;
    reasonFlags.add("actionable_trial_status");
  }

  return {
    fitScore: Math.min(fitScore, 100),
    solicitationScore: Math.min(solicitationScore, 100),
    reasonFlags: [...reasonFlags],
    modalityTags: [...modalityTags]
  };
}
