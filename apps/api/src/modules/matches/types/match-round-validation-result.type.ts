export type MatchRoundValidationResult = {
  invalid_reason: string | null;
  is_valid: boolean;
  level_match: boolean | null;
  normalized_input: string;
  power_level: number | null;
  theme_match: boolean | null;
};
