import EventPredictor from '../src/models/EventPredictor.js';

describe('EventPredictor', () => {
  let predictor;

  beforeEach(() => {
    predictor = new EventPredictor();
  });

  describe('initialization', () => {
    test('should initialize without data', async () => {
      await predictor.initialize();
      expect(predictor.initialized).toBe(true);
    });

    test('should initialize with historical data', async () => {
      const historicalData = [
        { type: 'task', timestamp: new Date().toISOString(), success: true },
        { type: 'meeting', timestamp: new Date().toISOString(), success: true }
      ];
      await predictor.initialize(historicalData);
      expect(predictor.initialized).toBe(true);
    });
  });

  describe('predictEvents', () => {
    beforeEach(async () => {
      await predictor.initialize();
    });

    test('should generate predictions', async () => {
      const context = {
        userId: 'test-user',
        timestamp: new Date().toISOString(),
        activity: 'coding'
      };
      
      const result = await predictor.predictEvents(context);
      
      expect(result).toHaveProperty('predictions');
      expect(result).toHaveProperty('metadata');
      expect(Array.isArray(result.predictions)).toBe(true);
    });

    test('should throw error if not initialized', async () => {
      const uninitializedPredictor = new EventPredictor();
      const context = { userId: 'test' };
      
      await expect(uninitializedPredictor.predictEvents(context))
        .rejects.toThrow('EventPredictor not initialized');
    });
  });

  describe('pattern analysis', () => {
    test('should analyze patterns in events', () => {
      const events = [
        { type: 'task', timestamp: new Date().toISOString() },
        { type: 'task', timestamp: new Date().toISOString() }
      ];
      
      const patterns = predictor.analyzePatterns(events);
      
      expect(patterns).toHaveProperty('temporal');
      expect(patterns).toHaveProperty('sequential');
      expect(patterns).toHaveProperty('contextual');
    });
  });

  describe('confidence scoring', () => {
    test('should calculate confidence scores', () => {
      const prediction = { type: 'test' };
      const context = { userId: 'test' };
      
      const confidence = predictor.calculateConfidenceScore(prediction, context);
      
      expect(confidence).toBeGreaterThanOrEqual(0);
      expect(confidence).toBeLessThanOrEqual(1);
    });
  });
});
