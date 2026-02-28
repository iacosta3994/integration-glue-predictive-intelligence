import SuggestionEngine from '../src/models/SuggestionEngine.js';

describe('SuggestionEngine', () => {
  let engine;

  beforeEach(async () => {
    engine = new SuggestionEngine();
    await engine.initialize();
  });

  describe('generateSuggestions', () => {
    test('should generate suggestions with content', async () => {
      const context = {
        userId: 'test-user',
        content: 'Working on a React project with TypeScript',
        activity: 'coding'
      };
      
      const result = await engine.generateSuggestions(context);
      
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('metadata');
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    test('should generate temporal suggestions', async () => {
      const context = {
        userId: 'test-user',
        timestamp: new Date().toISOString()
      };
      
      const result = await engine.generateSuggestions(context);
      
      const temporalSuggestions = result.suggestions.filter(
        s => s.type === 'temporal'
      );
      
      expect(temporalSuggestions.length).toBeGreaterThan(0);
    });
  });

  describe('user preferences', () => {
    test('should update user preferences on interaction', () => {
      const userId = 'test-user';
      const suggestion = { title: 'Test Suggestion', type: 'test' };
      
      engine.updateUserPreferences(userId, suggestion, 'accepted');
      
      const prefs = engine.userPreferences.get(userId);
      expect(prefs).toBeDefined();
      expect(prefs.liked).toContainEqual(suggestion);
    });
  });

  describe('analytics', () => {
    test('should return analytics', () => {
      const analytics = engine.getAnalytics('day');
      
      expect(analytics).toHaveProperty('totalSuggestions');
      expect(analytics).toHaveProperty('averagePerRequest');
      expect(analytics).toHaveProperty('timeframe');
    });
  });
});
