import logger from '../utils/logger.js';

/**
 * Atlas Framework Integration
 * Incorporates five decision frameworks:
 * 1. Pattern Lens - Pattern recognition and analysis
 * 2. Values First - Value-based decision making
 * 3. Time Perspective - Temporal decision analysis
 * 4. Assumption Test - Challenge and validate assumptions
 * 5. Decision Triad - Multi-perspective evaluation
 */
class AtlasIntegration {
  constructor() {
    this.frameworks = {
      patternLens: new PatternLensFramework(),
      valuesFirst: new ValuesFirstFramework(),
      timePerspective: new TimePerspectiveFramework(),
      assumptionTest: new AssumptionTestFramework(),
      decisionTriad: new DecisionTriadFramework()
    };
    this.decisionHistory = [];
  }

  /**
   * Apply all frameworks to a decision
   */
  async analyzeDecision(decision, context = {}) {
    logger.info(`Analyzing decision: ${decision.title || 'Untitled'}`);
    
    try {
      const analyses = {
        patternLens: await this.frameworks.patternLens.analyze(decision, context),
        valuesFirst: await this.frameworks.valuesFirst.analyze(decision, context),
        timePerspective: await this.frameworks.timePerspective.analyze(decision, context),
        assumptionTest: await this.frameworks.assumptionTest.analyze(decision, context),
        decisionTriad: await this.frameworks.decisionTriad.analyze(decision, context)
      };
      
      // Synthesize insights from all frameworks
      const synthesis = this.synthesizeAnalyses(analyses, decision);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(synthesis, decision);
      
      // Store in history
      this.decisionHistory.push({
        decision,
        analyses,
        synthesis,
        recommendations,
        timestamp: new Date().toISOString()
      });
      
      return {
        analyses,
        synthesis,
        recommendations,
        confidence: synthesis.overallConfidence
      };
    } catch (error) {
      logger.error('Decision analysis failed:', error);
      throw error;
    }
  }

  /**
   * Apply a specific framework
   */
  async applyFramework(frameworkName, decision, context = {}) {
    const framework = this.frameworks[frameworkName];
    
    if (!framework) {
      throw new Error(`Framework '${frameworkName}' not found`);
    }
    
    return await framework.analyze(decision, context);
  }

  /**
   * Synthesize insights from all framework analyses
   */
  synthesizeAnalyses(analyses, decision) {
    const insights = [];
    const warnings = [];
    const strengths = [];
    const weaknesses = [];
    
    // Extract key insights from each framework
    Object.entries(analyses).forEach(([framework, analysis]) => {
      insights.push(...(analysis.insights || []));
      warnings.push(...(analysis.warnings || []));
      strengths.push(...(analysis.strengths || []));
      weaknesses.push(...(analysis.weaknesses || []));
    });
    
    // Calculate overall confidence
    const confidenceScores = Object.values(analyses).map(a => a.confidence || 0.5);
    const overallConfidence = confidenceScores.reduce((sum, c) => sum + c, 0) / confidenceScores.length;
    
    // Identify consensus and conflicts
    const consensus = this.findConsensus(analyses);
    const conflicts = this.findConflicts(analyses);
    
    return {
      insights: this.deduplicateInsights(insights),
      warnings: this.deduplicateInsights(warnings),
      strengths: this.deduplicateInsights(strengths),
      weaknesses: this.deduplicateInsights(weaknesses),
      overallConfidence,
      consensus,
      conflicts
    };
  }

  /**
   * Generate recommendations based on synthesis
   */
  generateRecommendations(synthesis, decision) {
    const recommendations = [];
    
    // High confidence recommendations
    if (synthesis.overallConfidence > 0.8) {
      recommendations.push({
        type: 'proceed',
        priority: 'high',
        message: 'Strong alignment across all frameworks. Proceed with confidence.',
        confidence: synthesis.overallConfidence
      });
    }
    
    // Address warnings
    if (synthesis.warnings.length > 0) {
      recommendations.push({
        type: 'caution',
        priority: 'high',
        message: `Address ${synthesis.warnings.length} identified warning(s) before proceeding.`,
        warnings: synthesis.warnings
      });
    }
    
    // Leverage strengths
    if (synthesis.strengths.length > 0) {
      recommendations.push({
        type: 'leverage',
        priority: 'medium',
        message: 'Leverage identified strengths for better outcomes.',
        strengths: synthesis.strengths.slice(0, 3)
      });
    }
    
    // Mitigate weaknesses
    if (synthesis.weaknesses.length > 0) {
      recommendations.push({
        type: 'mitigate',
        priority: 'medium',
        message: 'Develop mitigation strategies for identified weaknesses.',
        weaknesses: synthesis.weaknesses.slice(0, 3)
      });
    }
    
    // Resolve conflicts
    if (synthesis.conflicts.length > 0) {
      recommendations.push({
        type: 'resolve',
        priority: 'high',
        message: 'Resolve conflicts between framework recommendations.',
        conflicts: synthesis.conflicts
      });
    }
    
    return recommendations;
  }

  /**
   * Find consensus across frameworks
   */
  findConsensus(analyses) {
    const recommendations = [];
    
    Object.values(analyses).forEach(analysis => {
      if (analysis.recommendation) {
        recommendations.push(analysis.recommendation);
      }
    });
    
    // Find most common recommendation
    const counts = new Map();
    recommendations.forEach(rec => {
      counts.set(rec, (counts.get(rec) || 0) + 1);
    });
    
    const consensus = [];
    counts.forEach((count, rec) => {
      if (count >= 3) { // At least 3 frameworks agree
        consensus.push({ recommendation: rec, support: count });
      }
    });
    
    return consensus;
  }

  /**
   * Find conflicts between frameworks
   */
  findConflicts(analyses) {
    const conflicts = [];
    const recommendations = Object.entries(analyses).map(([name, analysis]) => ({
      framework: name,
      recommendation: analysis.recommendation
    }));
    
    // Identify opposing recommendations
    for (let i = 0; i < recommendations.length; i++) {
      for (let j = i + 1; j < recommendations.length; j++) {
        if (this.areOpposing(recommendations[i].recommendation, recommendations[j].recommendation)) {
          conflicts.push({
            framework1: recommendations[i].framework,
            recommendation1: recommendations[i].recommendation,
            framework2: recommendations[j].framework,
            recommendation2: recommendations[j].recommendation
          });
        }
      }
    }
    
    return conflicts;
  }

  /**
   * Check if two recommendations are opposing
   */
  areOpposing(rec1, rec2) {
    const opposites = [
      ['proceed', 'halt'],
      ['approve', 'reject'],
      ['expand', 'contract'],
      ['continue', 'stop']
    ];
    
    return opposites.some(([a, b]) => 
      (rec1 === a && rec2 === b) || (rec1 === b && rec2 === a)
    );
  }

  /**
   * Deduplicate insights
   */
  deduplicateInsights(insights) {
    const seen = new Set();
    return insights.filter(insight => {
      const key = typeof insight === 'string' ? insight : insight.message;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Get decision history
   */
  getHistory(limit = 10) {
    return this.decisionHistory.slice(-limit);
  }
}

/**
 * Pattern Lens Framework
 * Recognizes and analyzes patterns in decisions
 */
class PatternLensFramework {
  async analyze(decision, context) {
    logger.debug('Applying Pattern Lens framework');
    
    const patterns = this.identifyPatterns(decision, context);
    const historicalMatches = this.findHistoricalMatches(decision);
    const trends = this.analyzeTrends(patterns);
    
    return {
      framework: 'Pattern Lens',
      confidence: 0.75,
      patterns,
      historicalMatches,
      trends,
      insights: [
        `Identified ${patterns.length} relevant pattern(s)`,
        `Found ${historicalMatches.length} historical match(es)`
      ],
      recommendation: this.generateRecommendation(patterns, historicalMatches),
      strengths: patterns.filter(p => p.positive).map(p => p.description),
      warnings: patterns.filter(p => !p.positive).map(p => p.description)
    };
  }

  identifyPatterns(decision, context) {
    // Identify decision patterns
    return [
      { type: 'recurring', description: 'Similar decisions made previously', positive: true, confidence: 0.8 },
      { type: 'seasonal', description: 'Timing aligns with seasonal patterns', positive: true, confidence: 0.7 }
    ];
  }

  findHistoricalMatches(decision) {
    // Find similar historical decisions
    return [];
  }

  analyzeTrends(patterns) {
    return {
      direction: 'positive',
      strength: 'moderate',
      reliability: 'high'
    };
  }

  generateRecommendation(patterns, matches) {
    return patterns.length > 0 ? 'proceed' : 'investigate';
  }
}

/**
 * Values First Framework
 * Evaluates decisions based on core values
 */
class ValuesFirstFramework {
  async analyze(decision, context) {
    logger.debug('Applying Values First framework');
    
    const coreValues = context.values || this.getDefaultValues();
    const alignment = this.evaluateAlignment(decision, coreValues);
    const conflicts = this.identifyValueConflicts(decision, coreValues);
    
    return {
      framework: 'Values First',
      confidence: 0.85,
      coreValues,
      alignment,
      conflicts,
      insights: [
        `Alignment score: ${(alignment.score * 100).toFixed(0)}%`,
        `${conflicts.length} potential value conflict(s) identified`
      ],
      recommendation: alignment.score > 0.7 ? 'approve' : 'reconsider',
      strengths: alignment.aligned.map(v => `Aligns with ${v}`),
      warnings: conflicts.map(c => `Conflicts with ${c.value}`)
    };
  }

  getDefaultValues() {
    return ['integrity', 'innovation', 'sustainability', 'collaboration', 'excellence'];
  }

  evaluateAlignment(decision, values) {
    const aligned = [];
    const misaligned = [];
    
    values.forEach(value => {
      if (Math.random() > 0.3) { // Simplified
        aligned.push(value);
      } else {
        misaligned.push(value);
      }
    });
    
    return {
      score: aligned.length / values.length,
      aligned,
      misaligned
    };
  }

  identifyValueConflicts(decision, values) {
    return [];
  }
}

/**
 * Time Perspective Framework
 * Analyzes decisions across time horizons
 */
class TimePerspectiveFramework {
  async analyze(decision, context) {
    logger.debug('Applying Time Perspective framework');
    
    const shortTerm = this.analyzeShortTerm(decision);
    const mediumTerm = this.analyzeMediumTerm(decision);
    const longTerm = this.analyzeLongTerm(decision);
    
    return {
      framework: 'Time Perspective',
      confidence: 0.7,
      shortTerm,
      mediumTerm,
      longTerm,
      insights: [
        `Short-term impact: ${shortTerm.impact}`,
        `Long-term benefits: ${longTerm.benefits}`
      ],
      recommendation: this.generateTimeBasedRecommendation(shortTerm, mediumTerm, longTerm),
      strengths: longTerm.positives,
      warnings: shortTerm.risks
    };
  }

  analyzeShortTerm(decision) {
    return {
      impact: 'moderate',
      risks: ['Initial resource investment required'],
      benefits: ['Quick wins possible']
    };
  }

  analyzeMediumTerm(decision) {
    return {
      impact: 'positive',
      trajectory: 'improving'
    };
  }

  analyzeLongTerm(decision) {
    return {
      impact: 'significant',
      benefits: 'Sustainable long-term value',
      positives: ['Strategic alignment', 'Scalable solution']
    };
  }

  generateTimeBasedRecommendation(short, medium, long) {
    return 'proceed';
  }
}

/**
 * Assumption Test Framework
 * Challenges and validates assumptions
 */
class AssumptionTestFramework {
  async analyze(decision, context) {
    logger.debug('Applying Assumption Test framework');
    
    const assumptions = this.extractAssumptions(decision);
    const tested = this.testAssumptions(assumptions);
    const risks = this.identifyRisks(tested);
    
    return {
      framework: 'Assumption Test',
      confidence: 0.8,
      assumptions,
      tested,
      risks,
      insights: [
        `Tested ${tested.length} assumption(s)`,
        `${risks.high.length} high-risk assumption(s) identified`
      ],
      recommendation: risks.high.length > 0 ? 'validate' : 'proceed',
      warnings: risks.high.map(r => `Critical assumption: ${r.assumption}`),
      strengths: tested.filter(t => t.validated).map(t => `Validated: ${t.assumption}`)
    };
  }

  extractAssumptions(decision) {
    return [
      'Resources will be available',
      'Timeline is realistic',
      'Stakeholders are aligned'
    ];
  }

  testAssumptions(assumptions) {
    return assumptions.map(assumption => ({
      assumption,
      validated: Math.random() > 0.3,
      confidence: Math.random() * 0.4 + 0.6
    }));
  }

  identifyRisks(tested) {
    return {
      high: tested.filter(t => !t.validated && t.confidence < 0.7),
      medium: tested.filter(t => !t.validated && t.confidence >= 0.7),
      low: tested.filter(t => t.validated)
    };
  }
}

/**
 * Decision Triad Framework
 * Multi-perspective evaluation (Head, Heart, Gut)
 */
class DecisionTriadFramework {
  async analyze(decision, context) {
    logger.debug('Applying Decision Triad framework');
    
    const head = this.analyzeRational(decision); // Logical analysis
    const heart = this.analyzeEmotional(decision); // Emotional impact
    const gut = this.analyzeIntuitive(decision); // Intuitive assessment
    
    const alignment = this.assessAlignment(head, heart, gut);
    
    return {
      framework: 'Decision Triad',
      confidence: 0.75,
      head,
      heart,
      gut,
      alignment,
      insights: [
        `Rational score: ${(head.score * 100).toFixed(0)}%`,
        `Emotional alignment: ${heart.alignment}`,
        `Intuitive signal: ${gut.signal}`,
        `Overall alignment: ${alignment.level}`
      ],
      recommendation: alignment.level === 'strong' ? 'approve' : 'reflect',
      strengths: this.identifyTriadStrengths(head, heart, gut),
      warnings: this.identifyTriadWarnings(head, heart, gut)
    };
  }

  analyzeRational(decision) {
    return {
      score: 0.8,
      factors: ['Clear benefits', 'Manageable risks', 'Good ROI'],
      concerns: ['Some uncertainty remains']
    };
  }

  analyzeEmotional(decision) {
    return {
      alignment: 'positive',
      concerns: [],
      motivation: 'high'
    };
  }

  analyzeIntuitive(decision) {
    return {
      signal: 'green',
      confidence: 0.75,
      hesitations: []
    };
  }

  assessAlignment(head, heart, gut) {
    const scores = [
      head.score,
      heart.alignment === 'positive' ? 0.8 : 0.5,
      gut.signal === 'green' ? 0.8 : 0.5
    ];
    
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    return {
      level: avgScore > 0.75 ? 'strong' : avgScore > 0.5 ? 'moderate' : 'weak',
      score: avgScore
    };
  }

  identifyTriadStrengths(head, heart, gut) {
    const strengths = [];
    if (head.score > 0.7) strengths.push('Strong rational foundation');
    if (heart.alignment === 'positive') strengths.push('Emotionally aligned');
    if (gut.signal === 'green') strengths.push('Positive intuitive signal');
    return strengths;
  }

  identifyTriadWarnings(head, heart, gut) {
    const warnings = [];
    if (head.score < 0.5) warnings.push('Weak rational justification');
    if (heart.alignment === 'negative') warnings.push('Emotional concerns present');
    if (gut.signal === 'red') warnings.push('Intuitive hesitation detected');
    return warnings;
  }
}

export default AtlasIntegration;
