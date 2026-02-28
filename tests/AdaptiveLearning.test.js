import AdaptiveLearning from '../src/learning/AdaptiveLearning.js';

describe('AdaptiveLearning', () => {
  let learning;

  beforeEach(() => {
    learning = new AdaptiveLearning();
  });

  describe('feedback capture', () => {
    test('should capture prediction feedback', () => {
      const feedback = learning.capturePredictionFeedback(
        { type: 'event', confidence: 0.8 },
        'actual-event',
        { userId: 'test' }
      );
      
      expect(feedback).toHaveProperty('id');
      expect(feedback).toHaveProperty('timestamp');
      expect(feedback.type).toBe('prediction');
    });

    test('should capture suggestion feedback', () => {
      const feedback = learning.captureSuggestionFeedback(
        { title: 'Test Suggestion' },
        'accepted',
        { userId: 'test' }
      );
      
      expect(feedback.type).toBe('suggestion');
      expect(feedback.action).toBe('accepted');
    });

    test('should capture decision feedback', () => {
      const feedback = learning.captureDecisionFeedback(
        { title: 'Test Decision' },
        'success',
        { userId: 'test' }
      );
      
      expect(feedback.type).toBe('decision');
      expect(feedback.outcome).toBe('success');
    });
  });

  describe('performance metrics', () => {
    beforeEach(() => {
      // Add some test feedback
      learning.capturePredictionFeedback(
        { type: 'event', confidence: 0.8 },
        'event',
        {}
      );
      learning.captureSuggestionFeedback(
        { title: 'Test' },
        'accepted',
        {}
      );
    });

    test('should calculate performance metrics', () => {
      const metrics = learning.calculatePerformanceMetrics('day');
      
      expect(metrics).toHaveProperty('prediction');
      expect(metrics).toHaveProperty('suggestion');
      expect(metrics).toHaveProperty('decision');
      expect(metrics).toHaveProperty('overall');
    });
  });

  describe('improvement recommendations', () => {
    test('should generate improvement recommendations', () => {
      const result = learning.generateImprovementRecommendations();
      
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('metrics');
      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });
});
