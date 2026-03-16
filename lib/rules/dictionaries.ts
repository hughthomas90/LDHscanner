export const TOPIC_PATTERNS = {
  ai_ml: [
    /\bai\b/i,
    /\bartificial intelligence\b/i,
    /\bmachine learning\b/i,
    /\bdeep learning\b/i,
    /\bneural network(s)?\b/i,
    /\bfoundation model(s)?\b/i
  ],
  digital_therapeutics: [/\bdigital therapeutics?\b/i, /\bsoftware as a medical device\b/i, /\btherapeutic app(s)?\b/i],
  telemedicine: [/\btelemedicine\b/i, /\btelehealth\b/i, /\bvirtual care\b/i, /\bvideo consultation(s)?\b/i],
  remote_monitoring: [/\bremote monitoring\b/i, /\bhome monitoring\b/i, /\bremote patient monitoring\b/i],
  wearables: [/\bwearable(s)?\b/i, /\bsmartwatch(es)?\b/i, /\bfitness tracker(s)?\b/i, /\bacceleromet(er|ry)\b/i],
  imaging_ai: [/\bmedical imaging\b/i, /\bradiology\b/i, /\bimage classification\b/i, /\bcomputer vision\b/i],
  ehr_workflow: [/\behr\b/i, /\belectronic health record(s)?\b/i, /\bclinical workflow\b/i, /\bdecision support\b/i],
  implementation: [/\bimplementation\b/i, /\bdeployment\b/i, /\bscale-up\b/i, /\bservice delivery\b/i],
  validation: [/\bvalidation\b/i, /\bexternal validation\b/i, /\bcalibration\b/i, /\bgeneralizab(le|ility)\b/i],
  real_world: [/\breal-world\b/i, /\broutine care\b/i, /\bpragmatic\b/i, /\bobservational deployment\b/i],
  randomized_trials: [/\brandomi[sz]ed\b/i, /\brandomised controlled trial\b/i, /\brct\b/i],
  prospective_studies: [/\bprospective\b/i, /\bcohort\b/i, /\bfeasibility study\b/i],
  accuracy_studies: [/\bdiagnostic accuracy\b/i, /\bprognostic\b/i, /\bauc\b/i, /\bsensitivity\b/i, /\bspecificity\b/i],
  policy_regulatory: [/\bguideline(s)?\b/i, /\bregulatory\b/i, /\breimbursement\b/i, /\bhealth technolog(y|ies) assessment\b/i],
  stakeholder_context: [/\bpatient(s)?\b/i, /\bclinician(s)?\b/i, /\bhospital(s)?\b/i, /\bhealth system(s)?\b/i]
} as const;

export const EXCLUSION_PATTERNS = [
  /\bveterinary\b/i,
  /\bplant phenotyping\b/i,
  /\bagricultural\b/i,
  /\banimal model(s)?\b/i
];
