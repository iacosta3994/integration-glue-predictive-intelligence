import AtlasIntegration from '../src/frameworks/AtlasIntegration.js';

describe('AtlasIntegration', () => {
  let atlas;

  beforeEach(() => {
    atlas = new AtlasIntegration();
  });

  describe('analyzeDecision', () => {
    test('should analyze decision with all frameworks', async () => {
      const decision = {
        title: 'Launch new feature',
        description: 'Should we launch the new feature next week?',
        options: ['Launch', 'Delay', 'Cancel']
      };
      
      const context = {
        values: ['innovation', 'quality']
      };
      
      const result = await atlas.analyzeDecision(decision, context);
      
      expect(result).toHaveProperty('analyses');
      expect(result).toHaveProperty('synthesis');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('confidence');
    });

    test('should include all five frameworks', async () => {
      const decision = { title: 'Test Decision' };
      const result = await atlas.analyzeDecision(decision);
      
      expect(result.analyses).toHaveProperty('patternLens');
      expect(result.analyses).toHaveProperty('valuesFirst');
      expect(result.analyses).toHaveProperty('timePerspective');
      expect(result.analyses).toHaveProperty('assumptionTest');
      expect(result.analyses).toHaveProperty('decisionTriad');
    });
  });

  describe('applyFramework', () => {
    test('should apply specific framework', async () => {
      const decision = { title: 'Test' };
      const result = await atlas.applyFramework('patternLens', decision);
      
      expect(result).toHaveProperty('framework');
      expect(result.framework).toBe('Pattern Lens');
    });

    test('should throw error for invalid framework', async () => {
      const decision = { title: 'Test' };
      
      await expect(atlas.applyFramework('invalid', decision))
        .rejects.toThrow('Framework \'invalid\' not found');
    });
  });

  describe('decision history', () => {
    test('should store decision history', async () => {
      const decision = { title: 'Test Decision' };
      await atlas.analyzeDecision(decision);
      
      const history = atlas.getHistory();
      expect(history.length).toBeGreaterThan(0);
    });
  });
});
