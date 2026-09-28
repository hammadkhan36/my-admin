// These modules still require real persistence/workflows before client release.
export const unavailableFeatures: readonly string[] = ["campaigns", "referrals", "products", "followUps"];
export function isReleasedFeature(key: string) {
  return !unavailableFeatures.includes(key);
}
