import logger from '../utils/logger.js';
import { calculateAccuracy, calculatePrecision, calculateRecall } from '../utils/metrics.js';

/**
 * Adaptive Learning Loop
 * Captures feedback, measures performance, and refines models
 */
class AdaptiveLearning {
  constructor() {
    this.feedbackHistory = [];
    this.performanceMetrics = new Map();
    this.learningRate = 0.01;
    this.improvementThreshold = 0.05;
    this.retrainingThreshold = 100; // Number of feedback items before retraining
  }

  /**
   * Capture user feedback
   */
  captureFeedback(feedback) {
    try {
      const enrichedFeedback = {
        ...feedback,
        timestamp: new Date().toISOString(),
        id: this.generateFeedbackId()
      };
      
      this.feedbackHistory.push(enrichedFeedback);
      logger.info(`Captured feedback: ${feedback.type}`);
      
      // Check if retraining is needed
      if (this.shouldRetrain()) {
        logger.info('Retraining threshold reached, initiating model update');
        this.scheduleRetraining();
      }
      
      return enrichedFeedback;
    } catch (error) {
      logger.error('Failed to capture feedback:', error);
      throw error;
    }
  }

  /**
   * Capture prediction feedback
   */
  capturePredictionFeedback(prediction, actual, context = {}) {
    const feedback = {
      type: 'prediction',
      prediction,
      actual,
      correct: prediction === actual,
      context,
      confidence: prediction.confidence || null
    };
    
    return this.captureFeedback(feedback);
  }

  /**
   * Capture suggestion feedback
   */
  captureSuggestionFeedback(suggestion, action, context = {}) {
    const feedback = {
      type: 'suggestion',
      suggestion,
      action, // 'accepted', 'dismissed', 'modified'
      context
    };
    
    return this.captureFeedback(feedback);
  }

  /**
   * Capture decision feedback
   */
  captureDecisionFeedback(decision, outcome, context = {}) {
    const feedback = {
      type: 'decision',
      decision,
      outcome, // 'success', 'failure', 'partial'
      context
    };
    
    return this.captureFeedback(feedback);
  }

  /**
   * Calculate performance metrics
   */
  calculatePerformanceMetrics(timeframe = 'day') {
    try {
      const relevantFeedback = this.getRecentFeedback(timeframe);
      
      const metrics = {
        prediction: this.calculatePredictionMetrics(relevantFeedback),
        suggestion: this.calculateSuggestionMetrics(relevantFeedback),
        decision: this.calculateDecisionMetrics(relevantFeedback),
        overall: {}
      };
      
      // Calculate overall metrics
      metrics.overall = {
        totalFeedback: relevantFeedback.length,
        positiveRate: this.calculatePositiveRate(relevantFeedback),
        engagementRate: this.calculateEngagementRate(relevantFeedback),
        timeframe
      };
      
      // Store metrics
      const key = `${timeframe}-${new Date().toISOString()}`;
      this.performanceMetrics.set(key, metrics);
      
      logger.info(`Calculated performance metrics for ${timeframe}`);
      
      return metrics;
    } catch (error) {
      logger.error('Failed to calculate performance metrics:', error);
      throw error;
    }
  }

  /**
   * Calculate prediction-specific metrics
   */
  calculatePredictionMetrics(feedback) {
    const predictions = feedback.filter(f => f.type === 'prediction');
    
    if (predictions.length === 0) {
      return { count: 0 };
    }
    
    const correct = predictions.filter(p => p.correct).length;
    const accuracy = correct / predictions.length;
    
    // Calculate confidence calibration
    const calibration = this.calculateConfidenceCalibration(predictions);
    
    // Calculate by confidence level
    const byConfidence = this.groupByConfidence(predictions);
    
    return {
      count: predictions.length,
      accuracy,
      calibration,
      byConfidence
    };
  }

  /**
   * Calculate suggestion-specific metrics
   */
  calculateSuggestionMetrics(feedback) {
    const suggestions = feedback.filter(f => f.type === 'suggestion');
    
    if (suggestions.length === 0) {
      return { count: 0 };
    }
    
    const accepted = suggestions.filter(s => s.action === 'accepted').length;
    const dismissed = suggestions.filter(s => s.action === 'dismissed').length;
    const modified = suggestions.filter(s => s.action === 'modified').length;
    
    return {
      count: suggestions.length,
      acceptanceRate: accepted / suggestions.length,
      dismissalRate: dismissed / suggestions.length,
      modificationRate: modified / suggestions.length,
      accepted,
      dismissed,
      modified
    };
  }

  /**
   * Calculate decision-specific metrics
   */
  calculateDecisionMetrics(feedback) {
    const decisions = feedback.filter(f => f.type === 'decision');
    
    if (decisions.length === 0) {
      return { count: 0 };
    }
    
    const successful = decisions.filter(d => d.outcome === 'success').length;
    const failed = decisions.filter(d => d.outcome === 'failure').length;
    const partial = decisions.filter(d => d.outcome === 'partial').length;
    
    return {
      count: decisions.length,
      successRate: successful / decisions.length,
      failureRate: failed / decisions.length,
      partialRate: partial / decisions.length,
      successful,
      failed,
      partial
    };
  }

  /**
   * Generate improvement recommendations
   */
  generateImprovementRecommendations() {
    const metrics = this.calculatePerformanceMetrics();
    const recommendations = [];
    
    // Prediction improvements
    if (metrics.prediction.accuracy < 0.7) {
      recommendations.push({
        area: 'prediction',
        priority: 'high',
        issue: 'Low prediction accuracy',
        recommendation: 'Increase training data and retrain models',
        currentValue: metrics.prediction.accuracy,
        targetValue: 0.8
      });
    }
    
    if (metrics.prediction.calibration && metrics.prediction.calibration < 0.8) {
      recommendations.push({
        area: 'prediction',
        priority: 'medium',
        issue: 'Poor confidence calibration',
        recommendation: 'Recalibrate confidence scoring',
        currentValue: metrics.prediction.calibration,
        targetValue: 0.9
      });
    }
    
    // Suggestion improvements
    if (metrics.suggestion.acceptanceRate < 0.3) {
      recommendations.push({
        area: 'suggestion',
        priority: 'high',
        issue: 'Low suggestion acceptance rate',
        recommendation: 'Improve suggestion relevance and timing',
        currentValue: metrics.suggestion.acceptanceRate,
        targetValue: 0.5
      });
    }
    
    // Decision improvements
    if (metrics.decision.successRate < 0.6) {
      recommendations.push({
        area: 'decision',
        priority: 'high',
        issue: 'Low decision success rate',
        recommendation: 'Refine decision frameworks and add more validation',
        currentValue: metrics.decision.successRate,
        targetValue: 0.8
      });
    }
    
    // Overall engagement
    if (metrics.overall.engagementRate < 0.4) {
      recommendations.push({
        area: 'overall',
        priority: 'medium',
        issue: 'Low user engagement',
        recommendation: 'Improve user experience and value proposition',
        currentValue: metrics.overall.engagementRate,
        targetValue: 0.6
      });
    }
    
    logger.info(`Generated ${recommendations.length} improvement recommendations`);
    
    return {
      recommendations,
      metrics,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Apply learning from feedback
   */
  async applyLearning(models) {
    try {
      logger.info('Applying learning from feedback...');
      
      const recentFeedback = this.getRecentFeedback('week');
      const improvements = [];
      
      // Apply prediction improvements
      if (models.eventPredictor) {
        const predictionImprovement = await this.improvePredictionModel(
          models.eventPredictor,
          recentFeedback
        );
        improvements.push(predictionImprovement);
      }
      
      // Apply suggestion improvements
      if (models.suggestionEngine) {
        const suggestionImprovement = await this.improveSuggestionEngine(
          models.suggestionEngine,
          recentFeedback
        );
        improvements.push(suggestionImprovement);
      }
      
      // Apply decision framework improvements
      if (models.atlasIntegration) {
        const decisionImprovement = await this.improveDecisionFrameworks(
          models.atlasIntegration,
          recentFeedback
        );
        improvements.push(decisionImprovement);
      }
      
      logger.info('Learning applied successfully');
      
      return {
        improvements,
        feedbackProcessed: recentFeedback.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to apply learning:', error);
      throw error;
    }
  }

  /**
   * Improve prediction model based on feedback
   */
  async improvePredictionModel(predictor, feedback) {
    const predictionFeedback = feedback.filter(f => f.type === 'prediction');
    
    if (predictionFeedback.length === 0) {
      return { model: 'predictor', improvement: 'none', reason: 'No feedback available' };
    }
    
    // Extract training data from feedback
    const trainingData = predictionFeedback.map(f => ({
      input: f.context,
      output: f.actual
    }));
    
    // Retrain with new data
    await predictor.trainModels(trainingData);
    
    // Calculate improvement
    const oldMetrics = this.getHistoricalMetrics('prediction', 'week');
    const newMetrics = this.calculatePredictionMetrics(predictionFeedback);
    
    const improvement = newMetrics.accuracy - (oldMetrics.accuracy || 0);
    
    return {
      model: 'predictor',
      improvement: improvement > 0 ? 'improved' : 'stable',
      accuracyChange: improvement,
      trainingDataSize: trainingData.length
    };
  }

  /**
   * Improve suggestion engine based on feedback
   */
  async improveSuggestionEngine(engine, feedback) {
    const suggestionFeedback = feedback.filter(f => f.type === 'suggestion');
    
    if (suggestionFeedback.length === 0) {
      return { model: 'suggestionEngine', improvement: 'none', reason: 'No feedback available' };
    }
    
    // Update user preferences based on feedback
    suggestionFeedback.forEach(f => {
      const userId = f.context.userId;
      if (userId) {
        engine.updateUserPreferences(userId, f.suggestion, f.action);
      }
    });
    
    // Calculate improvement
    const oldMetrics = this.getHistoricalMetrics('suggestion', 'week');
    const newMetrics = this.calculateSuggestionMetrics(suggestionFeedback);
    
    const improvement = newMetrics.acceptanceRate - (oldMetrics.acceptanceRate || 0);
    
    return {
      model: 'suggestionEngine',
      improvement: improvement > 0 ? 'improved' : 'stable',
      acceptanceRateChange: improvement,
      feedbackProcessed: suggestionFeedback.length
    };
  }

  /**
   * Improve decision frameworks based on feedback
   */
  async improveDecisionFrameworks(atlas, feedback) {
    const decisionFeedback = feedback.filter(f => f.type === 'decision');
    
    if (decisionFeedback.length === 0) {
      return { model: 'atlasIntegration', improvement: 'none', reason: 'No feedback available' };
    }
    
    // Analyze which frameworks performed best
    const frameworkPerformance = this.analyzeFrameworkPerformance(decisionFeedback);
    
    // Calculate improvement
    const oldMetrics = this.getHistoricalMetrics('decision', 'week');
    const newMetrics = this.calculateDecisionMetrics(decisionFeedback);
    
    const improvement = newMetrics.successRate - (oldMetrics.successRate || 0);
    
    return {
      model: 'atlasIntegration',
      improvement: improvement > 0 ? 'improved' : 'stable',
      successRateChange: improvement,
      frameworkPerformance
    };
  }

  // Helper methods

  getRecentFeedback(timeframe) {
    const now = new Date();
    const cutoff = new Date(now);
    
    switch (timeframe) {
      case 'hour':
        cutoff.setHours(cutoff.getHours() - 1);
        break;
      case 'day':
        cutoff.setDate(cutoff.getDate() - 1);
        break;
      case 'week':
        cutoff.setDate(cutoff.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(cutoff.getMonth() - 1);
        break;
    }
    
    return this.feedbackHistory.filter(
      f => new Date(f.timestamp) > cutoff
    );
  }

  shouldRetrain() {
    const recentFeedback = this.getRecentFeedback('day');
    return recentFeedback.length >= this.retrainingThreshold;
  }

  scheduleRetraining() {
    // In production, this would schedule an async retraining job
    logger.info('Retraining scheduled');
  }

  calculatePositiveRate(feedback) {
    const positive = feedback.filter(f => {
      if (f.type === 'prediction') return f.correct;
      if (f.type === 'suggestion') return f.action === 'accepted';
      if (f.type === 'decision') return f.outcome === 'success';
      return false;
    }).length;
    
    return feedback.length > 0 ? positive / feedback.length : 0;
  }

  calculateEngagementRate(feedback) {
    // Simplified engagement calculation
    return feedback.length > 0 ? Math.min(feedback.length / 100, 1) : 0;
  }

  calculateConfidenceCalibration(predictions) {
    // Measure how well confidence scores match actual accuracy
    let calibrationError = 0;
    
    predictions.forEach(p => {
      if (p.confidence !== null) {
        const expected = p.confidence;
        const actual = p.correct ? 1 : 0;
        calibrationError += Math.abs(expected - actual);
      }
    });
    
    return 1 - (calibrationError / predictions.length);
  }

  groupByConfidence(predictions) {
    const groups = {
      high: [],
      medium: [],
      low: []
    };
    
    predictions.forEach(p => {
      if (p.confidence >= 0.8) groups.high.push(p);
      else if (p.confidence >= 0.5) groups.medium.push(p);
      else groups.low.push(p);
    });
    
    return {
      high: { count: groups.high.length, accuracy: this.calculateGroupAccuracy(groups.high) },
      medium: { count: groups.medium.length, accuracy: this.calculateGroupAccuracy(groups.medium) },
      low: { count: groups.low.length, accuracy: this.calculateGroupAccuracy(groups.low) }
    };
  }

  calculateGroupAccuracy(group) {
    if (group.length === 0) return 0;
    const correct = group.filter(p => p.correct).length;
    return correct / group.length;
  }

  getHistoricalMetrics(type, timeframe) {
    // Get most recent metrics of specified type
    const metricsEntries = Array.from(this.performanceMetrics.entries())
      .filter(([key]) => key.startsWith(timeframe))
      .sort(([keyA], [keyB]) => keyB.localeCompare(keyA));
    
    if (metricsEntries.length === 0) return {};
    
    const [, metrics] = metricsEntries[0];
    return metrics[type] || {};
  }

  analyzeFrameworkPerformance(feedback) {
    // Analyze which decision frameworks led to best outcomes
    const performance = new Map();
    
    feedback.forEach(f => {
      if (f.decision && f.decision.frameworks) {
        f.decision.frameworks.forEach(framework => {
          const existing = performance.get(framework) || { total: 0, successful: 0 };
          existing.total++;
          if (f.outcome === 'success') existing.successful++;
          performance.set(framework, existing);
        });
      }
    });
    
    const result = {};
    performance.forEach((stats, framework) => {
      result[framework] = {
        successRate: stats.successful / stats.total,
        total: stats.total
      };
    });
    
    return result;
  }

  generateFeedbackId() {
    return `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default AdaptiveLearning;
