/**
 * Mathematical helper functions
 */

/**
 * Calculate confidence score
 */
export function calculateConfidence(factors) {
  if (!factors || factors.length === 0) return 0;
  
  const weightedSum = factors.reduce((sum, factor) => {
    const weight = factor.weight || 1;
    const score = factor.score || 0;
    return sum + (weight * score);
  }, 0);
  
  const totalWeight = factors.reduce((sum, f) => sum + (f.weight || 1), 0);
  
  return weightedSum / totalWeight;
}

/**
 * Normalize data to [0, 1] range
 */
export function normalizeData(data, min = null, max = null) {
  if (!Array.isArray(data)) return data;
  
  const dataMin = min !== null ? min : Math.min(...data);
  const dataMax = max !== null ? max : Math.max(...data);
  const range = dataMax - dataMin;
  
  if (range === 0) return data.map(() => 0.5);
  
  return data.map(value => (value - dataMin) / range);
}

/**
 * Calculate standard deviation
 */
export function standardDeviation(values) {
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(avgSquareDiff);
}

/**
 * Calculate Pearson correlation coefficient
 */
export function pearsonCorrelation(x, y) {
  const n = Math.min(x.length, y.length);
  if (n === 0) return 0;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Calculate weighted average
 */
export function weightedAverage(values, weights) {
  if (values.length !== weights.length) {
    throw new Error('Values and weights must have the same length');
  }
  
  const weightedSum = values.reduce((sum, value, i) => sum + value * weights[i], 0);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  
  return totalWeight === 0 ? 0 : weightedSum / totalWeight;
}

/**
 * Sigmoid function
 */
export function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Softmax function
 */
export function softmax(values) {
  const maxVal = Math.max(...values);
  const expValues = values.map(v => Math.exp(v - maxVal));
  const sumExp = expValues.reduce((a, b) => a + b, 0);
  return expValues.map(v => v / sumExp);
}
