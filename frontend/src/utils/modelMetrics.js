/**
 * Verified metrics for the deployed tuned Random Forest model.
 *
 * Test-set values: final_random_forest.pkl evaluated on test_features_encoded.csv
 * (matches models/tuned/tuned_model_results.csv)
 *
 * Cross-validation: 5-fold stratified CV on train_features_encoded.csv
 */

export const VERIFIED_MODEL_METRICS = {
  accuracy: 97.79,
  precision_score: 97.9,
  recall_score: 97.79,
  f1_score: 97.78,
  cross_validation_accuracy: 99.92,
};

export function withVerifiedMetrics(apiModel) {
  if (!apiModel) {
    return null;
  }

  return {
    ...apiModel,
    ...VERIFIED_MODEL_METRICS,
  };
}

export function formatMetricPercent(value) {
  if (value === null || value === undefined) {
    return "N/A";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return "N/A";
  }

  return `${numericValue.toFixed(2)}%`;
}
