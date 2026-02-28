import * as tf from '@tensorflow/tfjs-node';
import brain from 'brain.js';
import logger from '../utils/logger.js';
import { calculateConfidence, normalizeData } from '../utils/mathHelpers.js';

/**
 * ML-based Event Prediction System
 * Uses pattern analysis, behavior identification, and confidence scoring
 */
class EventPredictor {
  constructor() {
    this.neuralNetwork = new brain.NeuralNetwork({
      hiddenLayers: [10, 8, 6],
      activation: 'sigmoid'
    });
    this.tfModel = null;
    this.patternCache = new Map();
    this.behaviorProfiles = new Map();
    this.confidenceThreshold = 0.7;
    this.initialized = false;
  }

  /**
   * Initialize the prediction models
   */
  async initialize(historicalData = []) {
    try {
      logger.info('Initializing EventPredictor...');
      
      if (historicalData.length > 0) {
        await this.trainModels(historicalData);
      } else {
        // Initialize with default patterns
        this.initializeDefaultPatterns();
      }
      
      this.initialized = true;
      logger.info('EventPredictor initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize EventPredictor:', error);
      throw error;
    }
  }

  /**
   * Train models with historical event data
   */
  async trainModels(historicalData) {
    try {
      logger.info(`Training models with ${historicalData.length} data points`);
      
      // Prepare training data
      const trainingData = this.prepareTrainingData(historicalData);
      
      // Train Brain.js neural network
      await this.trainNeuralNetwork(trainingData.brainData);
      
      // Build TensorFlow model for deep pattern analysis
      await this.buildTensorFlowModel(trainingData.tfData);
      
      // Extract behavior profiles
      this.extractBehaviorProfiles(historicalData);
      
      logger.info('Model training completed');
    } catch (error) {
      logger.error('Model training failed:', error);
      throw error;
    }
  }

  /**
   * Predict upcoming events based on current context
   */
  async predictEvents(context) {
    if (!this.initialized) {
      throw new Error('EventPredictor not initialized');
    }

    try {
      const predictions = [];
      
      // Pattern-based prediction
      const patternPrediction = this.predictFromPatterns(context);
      predictions.push(...patternPrediction);
      
      // Behavior-based prediction
      const behaviorPrediction = this.predictFromBehavior(context);
      predictions.push(...behaviorPrediction);
      
      // Neural network prediction
      const nnPrediction = this.predictFromNeuralNetwork(context);
      predictions.push(...nnPrediction);
      
      // TensorFlow deep learning prediction
      if (this.tfModel) {
        const tfPrediction = await this.predictFromTensorFlow(context);
        predictions.push(...tfPrediction);
      }
      
      // Aggregate and score predictions
      const aggregatedPredictions = this.aggregatePredictions(predictions);
      
      // Filter by confidence threshold
      const highConfidencePredictions = aggregatedPredictions.filter(
        p => p.confidence >= this.confidenceThreshold
      );
      
      logger.info(`Generated ${highConfidencePredictions.length} high-confidence predictions`);
      
      return {
        predictions: highConfidencePredictions,
        metadata: {
          totalPredictions: predictions.length,
          highConfidence: highConfidencePredictions.length,
          threshold: this.confidenceThreshold,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('Event prediction failed:', error);
      throw error;
    }
  }

  /**
   * Analyze patterns in historical data
   */
  analyzePatterns(events) {
    const patterns = {
      temporal: this.analyzeTemporalPatterns(events),
      sequential: this.analyzeSequentialPatterns(events),
      contextual: this.analyzeContextualPatterns(events),
      correlations: this.analyzeCorrelations(events)
    };
    
    // Cache patterns for faster prediction
    events.forEach(event => {
      const key = this.generatePatternKey(event);
      this.patternCache.set(key, patterns);
    });
    
    return patterns;
  }

  /**
   * Temporal pattern analysis (time-based)
   */
  analyzeTemporalPatterns(events) {
    const temporalPatterns = {
      hourly: new Map(),
      daily: new Map(),
      weekly: new Map(),
      monthly: new Map()
    };
    
    events.forEach(event => {
      const date = new Date(event.timestamp);
      const hour = date.getHours();
      const day = date.getDay();
      const week = this.getWeekNumber(date);
      const month = date.getMonth();
      
      temporalPatterns.hourly.set(hour, (temporalPatterns.hourly.get(hour) || 0) + 1);
      temporalPatterns.daily.set(day, (temporalPatterns.daily.get(day) || 0) + 1);
      temporalPatterns.weekly.set(week, (temporalPatterns.weekly.get(week) || 0) + 1);
      temporalPatterns.monthly.set(month, (temporalPatterns.monthly.get(month) || 0) + 1);
    });
    
    return temporalPatterns;
  }

  /**
   * Sequential pattern analysis (event chains)
   */
  analyzeSequentialPatterns(events) {
    const sequences = new Map();
    
    for (let i = 0; i < events.length - 1; i++) {
      const current = events[i].type;
      const next = events[i + 1].type;
      const key = `${current}->${next}`;
      
      sequences.set(key, (sequences.get(key) || 0) + 1);
    }
    
    return sequences;
  }

  /**
   * Contextual pattern analysis
   */
  analyzeContextualPatterns(events) {
    const contextPatterns = new Map();
    
    events.forEach(event => {
      if (event.context) {
        const contextKey = JSON.stringify(event.context);
        const existing = contextPatterns.get(contextKey) || { count: 0, outcomes: [] };
        
        existing.count++;
        existing.outcomes.push(event.outcome || 'unknown');
        
        contextPatterns.set(contextKey, existing);
      }
    });
    
    return contextPatterns;
  }

  /**
   * Correlation analysis
   */
  analyzeCorrelations(events) {
    const correlations = [];
    const eventTypes = [...new Set(events.map(e => e.type))];
    
    for (let i = 0; i < eventTypes.length; i++) {
      for (let j = i + 1; j < eventTypes.length; j++) {
        const typeA = eventTypes[i];
        const typeB = eventTypes[j];
        
        const correlation = this.calculateCorrelation(
          events.filter(e => e.type === typeA),
          events.filter(e => e.type === typeB)
        );
        
        if (Math.abs(correlation) > 0.5) {
          correlations.push({ typeA, typeB, correlation });
        }
      }
    }
    
    return correlations;
  }

  /**
   * Calculate confidence score for a prediction
   */
  calculateConfidenceScore(prediction, context) {
    const factors = [];
    
    // Pattern match strength
    const patternMatch = this.getPatternMatchScore(prediction, context);
    factors.push({ weight: 0.3, score: patternMatch });
    
    // Historical accuracy
    const historicalAccuracy = this.getHistoricalAccuracy(prediction.type);
    factors.push({ weight: 0.25, score: historicalAccuracy });
    
    // Data recency
    const recencyScore = this.getRecencyScore(prediction);
    factors.push({ weight: 0.2, score: recencyScore });
    
    // Context relevance
    const contextRelevance = this.getContextRelevance(prediction, context);
    factors.push({ weight: 0.25, score: contextRelevance });
    
    // Weighted average
    const confidence = factors.reduce((sum, factor) => {
      return sum + (factor.weight * factor.score);
    }, 0);
    
    return Math.min(Math.max(confidence, 0), 1);
  }

  // Private helper methods

  prepareTrainingData(historicalData) {
    const brainData = historicalData.map(event => ({
      input: this.normalizeEventFeatures(event),
      output: this.normalizeEventOutcome(event)
    }));
    
    const tfData = {
      inputs: historicalData.map(e => this.normalizeEventFeatures(e)),
      outputs: historicalData.map(e => this.normalizeEventOutcome(e))
    };
    
    return { brainData, tfData };
  }

  async trainNeuralNetwork(trainingData) {
    return new Promise((resolve) => {
      this.neuralNetwork.train(trainingData, {
        iterations: 20000,
        errorThresh: 0.005,
        log: true,
        logPeriod: 1000,
        callback: (stats) => {
          logger.debug(`Training iteration ${stats.iterations}, error: ${stats.error}`);
        }
      });
      resolve();
    });
  }

  async buildTensorFlowModel(data) {
    const model = tf.sequential();
    
    model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [data.inputs[0].length] }));
    model.add(tf.layers.dropout({ rate: 0.2 }));
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.2 }));
    model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
    model.add(tf.layers.dense({ units: data.outputs[0].length, activation: 'softmax' }));
    
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
    
    const xs = tf.tensor2d(data.inputs);
    const ys = tf.tensor2d(data.outputs);
    
    await model.fit(xs, ys, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          logger.debug(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
        }
      }
    });
    
    this.tfModel = model;
  }

  extractBehaviorProfiles(events) {
    const profiles = new Map();
    
    events.forEach(event => {
      const userId = event.userId || 'anonymous';
      const profile = profiles.get(userId) || {
        eventCounts: new Map(),
        patterns: [],
        preferences: new Map()
      };
      
      profile.eventCounts.set(event.type, (profile.eventCounts.get(event.type) || 0) + 1);
      
      if (event.preferences) {
        Object.entries(event.preferences).forEach(([key, value]) => {
          profile.preferences.set(key, value);
        });
      }
      
      profiles.set(userId, profile);
    });
    
    this.behaviorProfiles = profiles;
  }

  predictFromPatterns(context) {
    const predictions = [];
    
    this.patternCache.forEach((patterns, key) => {
      const relevance = this.calculatePatternRelevance(patterns, context);
      
      if (relevance > 0.6) {
        predictions.push({
          source: 'pattern',
          type: 'pattern-match',
          event: key,
          confidence: relevance,
          details: patterns
        });
      }
    });
    
    return predictions;
  }

  predictFromBehavior(context) {
    const predictions = [];
    const userId = context.userId || 'anonymous';
    const profile = this.behaviorProfiles.get(userId);
    
    if (profile) {
      const topEvents = Array.from(profile.eventCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      topEvents.forEach(([eventType, count]) => {
        const confidence = Math.min(count / 100, 0.9);
        predictions.push({
          source: 'behavior',
          type: eventType,
          confidence,
          frequency: count
        });
      });
    }
    
    return predictions;
  }

  predictFromNeuralNetwork(context) {
    try {
      const input = this.normalizeEventFeatures(context);
      const output = this.neuralNetwork.run(input);
      
      return Object.entries(output).map(([key, value]) => ({
        source: 'neural-network',
        type: key,
        confidence: value
      }));
    } catch (error) {
      logger.error('Neural network prediction failed:', error);
      return [];
    }
  }

  async predictFromTensorFlow(context) {
    try {
      const input = tf.tensor2d([this.normalizeEventFeatures(context)]);
      const prediction = this.tfModel.predict(input);
      const data = await prediction.data();
      
      return Array.from(data).map((confidence, index) => ({
        source: 'tensorflow',
        type: `event-${index}`,
        confidence
      }));
    } catch (error) {
      logger.error('TensorFlow prediction failed:', error);
      return [];
    }
  }

  aggregatePredictions(predictions) {
    const aggregated = new Map();
    
    predictions.forEach(pred => {
      const key = pred.type;
      const existing = aggregated.get(key) || {
        type: key,
        sources: [],
        confidences: [],
        details: []
      };
      
      existing.sources.push(pred.source);
      existing.confidences.push(pred.confidence);
      existing.details.push(pred);
      
      aggregated.set(key, existing);
    });
    
    return Array.from(aggregated.values()).map(agg => ({
      type: agg.type,
      confidence: agg.confidences.reduce((a, b) => a + b, 0) / agg.confidences.length,
      sources: agg.sources,
      details: agg.details
    })).sort((a, b) => b.confidence - a.confidence);
  }

  initializeDefaultPatterns() {
    // Initialize with common patterns
    this.patternCache.set('work-task-completion', {
      frequency: 'high',
      timing: 'business-hours',
      confidence: 0.8
    });
  }

  normalizeEventFeatures(event) {
    // Normalize event features to [0, 1] range
    return [
      event.timestamp ? new Date(event.timestamp).getTime() / Date.now() : 0.5,
      event.priority || 0.5,
      event.complexity || 0.5,
      event.urgency || 0.5
    ];
  }

  normalizeEventOutcome(event) {
    // Normalize outcome to binary or multi-class
    return {
      success: event.success ? 1 : 0,
      failure: event.success ? 0 : 1
    };
  }

  generatePatternKey(event) {
    return `${event.type}-${event.category || 'general'}`;
  }

  getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  calculateCorrelation(eventsA, eventsB) {
    // Simplified Pearson correlation
    if (eventsA.length === 0 || eventsB.length === 0) return 0;
    
    const timesA = eventsA.map(e => new Date(e.timestamp).getTime());
    const timesB = eventsB.map(e => new Date(e.timestamp).getTime());
    
    // Calculate overlap and timing proximity
    let overlap = 0;
    timesA.forEach(timeA => {
      const closest = Math.min(...timesB.map(timeB => Math.abs(timeA - timeB)));
      if (closest < 3600000) overlap++; // Within 1 hour
    });
    
    return overlap / Math.max(timesA.length, timesB.length);
  }

  getPatternMatchScore(prediction, context) {
    // Score how well prediction matches current patterns
    return Math.random() * 0.5 + 0.5; // Placeholder
  }

  getHistoricalAccuracy(type) {
    // Get historical accuracy for this prediction type
    return 0.75; // Placeholder
  }

  getRecencyScore(prediction) {
    // Score based on data recency
    return 0.8; // Placeholder
  }

  getContextRelevance(prediction, context) {
    // Score context relevance
    return 0.7; // Placeholder
  }

  calculatePatternRelevance(patterns, context) {
    // Calculate how relevant patterns are to current context
    return Math.random() * 0.5 + 0.4; // Placeholder
  }
}

export default EventPredictor;
