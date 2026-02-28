import PredictiveAPI from '../src/api/PredictiveAPI.js';
import logger from '../src/utils/logger.js';

/**
 * Basic usage example of the Predictive Intelligence System
 */

async function basicExample() {
  // Initialize the API
  const api = new PredictiveAPI({
    port: 3000
  });

  await api.start();
  logger.info('API started successfully');

  // Example 1: Generate event predictions
  const predictionContext = {
    userId: 'user123',
    timestamp: new Date().toISOString(),
    activity: 'coding',
    priority: 0.8,
    complexity: 0.6
  };

  const predictions = await api.eventPredictor.predictEvents(predictionContext);
  console.log('\n=== Event Predictions ===');
  console.log(JSON.stringify(predictions, null, 2));

  // Example 2: Generate suggestions
  const suggestionContext = {
    userId: 'user123',
    content: 'Working on a React TypeScript project with state management',
    activity: 'coding',
    entities: ['React', 'TypeScript', 'Redux'],
    timestamp: new Date().toISOString()
  };

  const suggestions = await api.suggestionEngine.generateSuggestions(suggestionContext);
  console.log('\n=== Suggestions ===');
  console.log(JSON.stringify(suggestions.suggestions.slice(0, 5), null, 2));

  // Example 3: Analyze a decision
  const decision = {
    title: 'Migrate to microservices architecture',
    description: 'Should we migrate our monolithic application to microservices?',
    options: ['Migrate now', 'Gradual migration', 'Stay monolithic']
  };

  const decisionContext = {
    values: ['scalability', 'maintainability', 'cost-efficiency', 'team-size']
  };

  const analysis = await api.atlasIntegration.analyzeDecision(decision, decisionContext);
  console.log('\n=== Decision Analysis ===');
  console.log('Confidence:', analysis.confidence);
  console.log('Recommendations:', analysis.recommendations);
  console.log('\nPattern Lens:', analysis.analyses.patternLens.insights);
  console.log('Values First:', analysis.analyses.valuesFirst.insights);
  console.log('Time Perspective:', analysis.analyses.timePerspective.insights);

  // Example 4: Capture feedback
  api.adaptiveLearning.capturePredictionFeedback(
    { type: 'code-review', confidence: 0.85 },
    'code-review',
    predictionContext
  );

  api.adaptiveLearning.captureSuggestionFeedback(
    suggestions.suggestions[0],
    'accepted',
    suggestionContext
  );

  // Example 5: Get performance metrics
  const metrics = api.adaptiveLearning.calculatePerformanceMetrics('day');
  console.log('\n=== Performance Metrics ===');
  console.log(JSON.stringify(metrics, null, 2));

  // Example 6: Get improvement recommendations
  const improvements = api.adaptiveLearning.generateImprovementRecommendations();
  console.log('\n=== Improvement Recommendations ===');
  improvements.recommendations.forEach(rec => {
    console.log(`[${rec.priority.toUpperCase()}] ${rec.area}: ${rec.recommendation}`);
  });

  // Clean up
  setTimeout(async () => {
    await api.stop();
    logger.info('API stopped');
  }, 5000);
}

// Run the example
basicExample().catch(error => {
  logger.error('Example failed:', error);
  process.exit(1);
});
