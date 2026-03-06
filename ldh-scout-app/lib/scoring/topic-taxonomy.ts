import { unique } from "@/lib/utils";

export type TopicKey =
  | "ai_ml_in_healthcare"
  | "clinical_decision_support"
  | "medical_imaging_ai"
  | "diagnostics_prognostics_prediction"
  | "telemedicine_virtual_care"
  | "digital_therapeutics"
  | "wearables_remote_monitoring"
  | "digital_clinical_trials"
  | "health_systems_engineering"
  | "health_data_management_security"
  | "public_health_digital_intervention"
  | "global_health_digital_implementation"
  | "clinical_genomics_precision_medicine"
  | "robotics_biosensors_bionics";

export const TOPIC_DEFINITIONS: Array<{
  key: TopicKey;
  label: string;
  patterns: RegExp[];
}> = [
  {
    key: "ai_ml_in_healthcare",
    label: "AI/ML in healthcare",
    patterns: [
      /\b(machine learning|deep learning|artificial intelligence|foundation model|large language model|neural network)\b/i,
      /\bclinical ai\b/i,
    ],
  },
  {
    key: "clinical_decision_support",
    label: "Clinical decision support",
    patterns: [/\bdecision support\b/i, /\btriage model\b/i, /\bclinical alert\b/i],
  },
  {
    key: "medical_imaging_ai",
    label: "Medical imaging AI",
    patterns: [/\b(imaging|radiology|ct|mri|x-ray|ultrasound|pathology image)\b/i],
  },
  {
    key: "diagnostics_prognostics_prediction",
    label: "Diagnostics and prognostics",
    patterns: [/\b(diagnos|prognos|risk prediction|screening tool|prediction model)\b/i],
  },
  {
    key: "telemedicine_virtual_care",
    label: "Telemedicine and virtual care",
    patterns: [/\b(telemedicine|telehealth|virtual care|remote consultation)\b/i],
  },
  {
    key: "digital_therapeutics",
    label: "Digital therapeutics",
    patterns: [/\b(digital therapeutic|app-based intervention|software as a medical device)\b/i],
  },
  {
    key: "wearables_remote_monitoring",
    label: "Wearables and remote monitoring",
    patterns: [/\b(wearable|remote monitoring|sensor-based monitoring|smartwatch|activity tracker)\b/i],
  },
  {
    key: "digital_clinical_trials",
    label: "Digital clinical trials",
    patterns: [/\b(digital trial|virtual trial|decentralized trial|econsent)\b/i],
  },
  {
    key: "health_systems_engineering",
    label: "Health systems engineering",
    patterns: [/\b(health system|workflow optimization|hospital operations|care pathway)\b/i],
  },
  {
    key: "health_data_management_security",
    label: "Health data management and security",
    patterns: [/\b(data governance|health data|privacy-preserving|cybersecurity|federated learning)\b/i],
  },
  {
    key: "public_health_digital_intervention",
    label: "Public health digital intervention",
    patterns: [/\b(contact tracing|public health|population health|digital intervention)\b/i],
  },
  {
    key: "global_health_digital_implementation",
    label: "Global health implementation",
    patterns: [/\b(global health|low-resource|lmic|implementation research)\b/i],
  },
  {
    key: "clinical_genomics_precision_medicine",
    label: "Precision medicine and clinical genomics",
    patterns: [/\b(genomic|precision medicine|polygenic|clinical genomics)\b/i],
  },
  {
    key: "robotics_biosensors_bionics",
    label: "Robotics, biosensors, and bionics",
    patterns: [/\b(robotic|biosensor|bionic|prosthetic control|implantable sensor)\b/i],
  },
];

export const TOPIC_LABEL_BY_KEY = Object.fromEntries(
  TOPIC_DEFINITIONS.map((topic) => [topic.key, topic.label]),
) as Record<TopicKey, string>;

export function inferTopicKeys(text: string) {
  const matched = TOPIC_DEFINITIONS.filter((topic) =>
    topic.patterns.some((pattern) => pattern.test(text)),
  ).map((topic) => topic.key);
  return unique(matched);
}

export function topicLabel(key: string) {
  return TOPIC_LABEL_BY_KEY[key as TopicKey] || key;
}
