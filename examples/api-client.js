import axios from 'axios';

/**
 * Example API Client for Predictive Intelligence System
 */
class PredictiveIntelligenceClient {
  constructor(baseURL = 'http://localhost:3000') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Health check
   */
  async health() {
    const { data } = await this.client.get('/health');
    return data;
  }

  /**
   * Generate predictions
   */
  async predict(context) {
    const { data } = await this.client.post('/api/predictions', { context });
    return data;
  }

  /**
   * Submit prediction feedback
   */
  async submitPredictionFeedback(prediction, actual, context) {
    const { data } = await this.client.post('/api/predictions/feedback', {
      prediction,
      actual,
      context
    });
    return data;
  }

  /**
   * Generate suggestions
   */
  async suggest(context) {
    const { data } = await this.client.post('/api/suggestions', { context });
    return data;
  }

  /**
   * Submit suggestion feedback
   */
  async submitSuggestionFeedback(suggestion, action, context) {
    const { data } = await this.client.post('/api/suggestions/feedback', {
      suggestion,
      action,
      context
    });
    return data;
  }

  /**
   * Analyze decision
   */
  async analyzeDecision(decision, context = {}) {
    const { data } = await this.client.post('/api/decisions/analyze', {
      decision,
      context
    });
    return data;
  }

  /**
   * Submit decision feedback
   */
  async submitDecisionFeedback(decision, outcome, context) {
    const { data } = await this.client.post('/api/decisions/feedback', {
      decision,
      outcome,
      context
    });
    return data;
  }

  /**
   * Get decision history
   */
  async getDecisionHistory(limit = 10) {
    const { data } = await this.client.get('/api/decisions/history', {
      params: { limit }
    });
    return data;
  }

  /**
   * Get performance metrics
   */
  async getMetrics(timeframe = 'day') {
    const { data } = await this.client.get('/api/metrics', {
      params: { timeframe }
    });
    return data;
  }

  /**
   * Get improvement recommendations
   */
  async getImprovements() {
    const { data } = await this.client.get('/api/improvements');
    return data;
  }

  /**
   * Apply learning
   */
  async applyLearning() {
    const { data } = await this.client.post('/api/learning/apply');
    return data;
  }
}

// Example usage
async function exampleUsage() {
  const client = new PredictiveIntelligenceClient();

  try {
    // Check health
    const health = await client.health();
    console.log('Health:', health);

    // Generate predictions
    const predictions = await client.predict({
      userId: 'user123',
      activity: 'coding',
      timestamp: new Date().toISOString()
    });
    console.log('\nPredictions:', predictions.predictions.slice(0, 3));

    // Generate suggestions
    const suggestions = await client.suggest({
      userId: 'user123',
      content: 'Working on API development',
      entities: ['Node.js', 'Express', 'REST']
    });
    console.log('\nSuggestions:', suggestions.suggestions.slice(0, 3));

    // Analyze decision
    const analysis = await client.analyzeDecision({
      title: 'Choose database technology',
      description: 'Should we use PostgreSQL or MongoDB?',
      options: ['PostgreSQL', 'MongoDB', 'Both']
    });
    console.log('\nDecision Analysis:');
    console.log('Confidence:', analysis.confidence);
    console.log('Recommendations:', analysis.recommendations.length);

    // Get metrics
    const metrics = await client.getMetrics('week');
    console.log('\nMetrics:', metrics.overall);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  exampleUsage();
}

export default PredictiveIntelligenceClient;
