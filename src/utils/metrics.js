/**
 * Performance metrics calculation
 */

/**
 * Calculate accuracy
 */
export function calculateAccuracy(predictions, actuals) {
  if (predictions.length !== actuals.length || predictions.length === 0) {
    return 0;
  }
  
  const correct = predictions.filter((pred, i) => pred === actuals[i]).length;
  return correct / predictions.length;
}

/**
 * Calculate precision
 */
export function calculatePrecision(predictions, actuals, positiveClass = 1) {
  const truePositives = predictions.filter(
    (pred, i) => pred === positiveClass && actuals[i] === positiveClass
  ).length;
  
  const predictedPositives = predictions.filter(pred => pred === positiveClass).length;
  
  return predictedPositives === 0 ? 0 : truePositives / predictedPositives;
}

/**
 * Calculate recall
 */
export function calculateRecall(predictions, actuals, positiveClass = 1) {
  const truePositives = predictions.filter(
    (pred, i) => pred === positiveClass && actuals[i] === positiveClass
  ).length;
  
  const actualPositives = actuals.filter(actual => actual === positiveClass).length;
  
  return actualPositives === 0 ? 0 : truePositives / actualPositives;
}

/**
 * Calculate F1 score
 */
export function calculateF1Score(predictions, actuals, positiveClass = 1) {
  const precision = calculatePrecision(predictions, actuals, positiveClass);
  const recall = calculateRecall(predictions, actuals, positiveClass);
  
  if (precision + recall === 0) return 0;
  
  return 2 * (precision * recall) / (precision + recall);
}

/**
 * Calculate Mean Absolute Error
 */
export function calculateMAE(predictions, actuals) {
  if (predictions.length !== actuals.length || predictions.length === 0) {
    return 0;
  }
  
  const errors = predictions.map((pred, i) => Math.abs(pred - actuals[i]));
  return errors.reduce((a, b) => a + b, 0) / errors.length;
}

/**
 * Calculate Root Mean Squared Error
 */
export function calculateRMSE(predictions, actuals) {
  if (predictions.length !== actuals.length || predictions.length === 0) {
    return 0;
  }
  
  const squaredErrors = predictions.map((pred, i) => Math.pow(pred - actuals[i], 2));
  const mse = squaredErrors.reduce((a, b) => a + b, 0) / squaredErrors.length;
  return Math.sqrt(mse);
}

/**
 * Calculate confusion matrix
 */
export function calculateConfusionMatrix(predictions, actuals, classes) {
  const matrix = {};
  
  classes.forEach(actualClass => {
    matrix[actualClass] = {};
    classes.forEach(predClass => {
      matrix[actualClass][predClass] = 0;
    });
  });
  
  predictions.forEach((pred, i) => {
    const actual = actuals[i];
    if (matrix[actual] && matrix[actual][pred] !== undefined) {
      matrix[actual][pred]++;
    }
  });
  
  return matrix;
}
