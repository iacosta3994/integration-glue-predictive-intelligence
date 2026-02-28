import natural from 'natural';
import compromise from 'compromise';
import logger from '../utils/logger.js';
import KnowledgeGraph from '../utils/KnowledgeGraph.js';

/**
 * Context-Aware Suggestion System
 * Provides proactive recommendations with knowledge graph connections
 */
class SuggestionEngine {
  constructor() {
    this.knowledgeGraph = new KnowledgeGraph();
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
    this.suggestionHistory = [];
    this.userPreferences = new Map();
    this.contextCache = new Map();
  }

  /**
   * Initialize the suggestion engine
   */
  async initialize(knowledgeBase = []) {
    try {
      logger.info('Initializing SuggestionEngine...');
      
      // Build knowledge graph from knowledge base
      await this.knowledgeGraph.build(knowledgeBase);
      
      // Index documents for TF-IDF
      knowledgeBase.forEach(doc => {
        this.tfidf.addDocument(doc.content || doc.title || '');
      });
      
      logger.info('SuggestionEngine initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize SuggestionEngine:', error);
      throw error;
    }
  }

  /**
   * Generate context-aware suggestions
   */
  async generateSuggestions(context) {
    try {
      logger.debug('Generating suggestions for context:', context);
      
      const suggestions = [];
      
      // Content-based suggestions
      const contentSuggestions = await this.generateContentBasedSuggestions(context);
      suggestions.push(...contentSuggestions);
      
      // Collaborative filtering suggestions
      const collaborativeSuggestions = this.generateCollaborativeSuggestions(context);
      suggestions.push(...collaborativeSuggestions);
      
      // Knowledge graph-based suggestions
      const graphSuggestions = await this.generateGraphBasedSuggestions(context);
      suggestions.push(...graphSuggestions);
      
      // Temporal suggestions (time-sensitive)
      const temporalSuggestions = this.generateTemporalSuggestions(context);
      suggestions.push(...temporalSuggestions);
      
      // Contextual suggestions (based on current activity)
      const contextualSuggestions = this.generateContextualSuggestions(context);
      suggestions.push(...contextualSuggestions);
      
      // Rank and filter suggestions
      const rankedSuggestions = this.rankSuggestions(suggestions, context);
      const topSuggestions = rankedSuggestions.slice(0, 10);
      
      // Store suggestions for learning
      this.suggestionHistory.push({
        context,
        suggestions: topSuggestions,
        timestamp: new Date().toISOString()
      });
      
      logger.info(`Generated ${topSuggestions.length} suggestions`);
      
      return {
        suggestions: topSuggestions,
        metadata: {
          total: suggestions.length,
          returned: topSuggestions.length,
          sources: this.getSuggestionSources(topSuggestions),
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('Suggestion generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate content-based suggestions using NLP
   */
  async generateContentBasedSuggestions(context) {
    const suggestions = [];
    
    if (!context.content && !context.query) {
      return suggestions;
    }
    
    const text = context.content || context.query;
    const doc = compromise(text);
    
    // Extract entities
    const people = doc.people().out('array');
    const places = doc.places().out('array');
    const topics = doc.topics().out('array');
    const verbs = doc.verbs().out('array');
    
    // Find related content using TF-IDF
    const terms = this.tokenizer.tokenize(text);
    const relatedDocs = [];
    
    this.tfidf.tfidfs(terms.join(' '), (i, measure) => {
      if (measure > 0.1) {
        relatedDocs.push({ index: i, relevance: measure });
      }
    });
    
    // Generate suggestions from entities
    [...people, ...places, ...topics].forEach(entity => {
      suggestions.push({
        type: 'content-based',
        category: 'entity-related',
        title: `Explore: ${entity}`,
        description: `Related content about ${entity}`,
        relevance: 0.7,
        entity,
        actions: [
          { label: 'Search', action: 'search', query: entity },
          { label: 'Learn More', action: 'info', entity }
        ]
      });
    });
    
    // Generate action suggestions from verbs
    verbs.forEach(verb => {
      suggestions.push({
        type: 'content-based',
        category: 'action',
        title: `Action: ${verb}`,
        description: `Suggested action based on context`,
        relevance: 0.6,
        action: verb
      });
    });
    
    return suggestions;
  }

  /**
   * Generate collaborative filtering suggestions
   */
  generateCollaborativeSuggestions(context) {
    const suggestions = [];
    const userId = context.userId;
    
    if (!userId) {
      return suggestions;
    }
    
    const userPrefs = this.userPreferences.get(userId);
    
    if (userPrefs) {
      // Find similar users
      const similarUsers = this.findSimilarUsers(userId);
      
      // Get their preferences
      similarUsers.forEach(similarUser => {
        const theirPrefs = this.userPreferences.get(similarUser.id);
        
        if (theirPrefs) {
          theirPrefs.liked.forEach(item => {
            if (!userPrefs.liked.includes(item)) {
              suggestions.push({
                type: 'collaborative',
                category: 'user-based',
                title: item.title || item,
                description: `Recommended by similar users`,
                relevance: 0.65 * similarUser.similarity,
                item
              });
            }
          });
        }
      });
    }
    
    return suggestions;
  }

  /**
   * Generate knowledge graph-based suggestions
   */
  async generateGraphBasedSuggestions(context) {
    const suggestions = [];
    
    if (!context.entities || context.entities.length === 0) {
      return suggestions;
    }
    
    for (const entity of context.entities) {
      // Find connected nodes in knowledge graph
      const connections = await this.knowledgeGraph.findConnections(entity, { maxDepth: 2 });
      
      connections.forEach(connection => {
        suggestions.push({
          type: 'knowledge-graph',
          category: 'related-concept',
          title: connection.node.label,
          description: `Connected via ${connection.relationship}`,
          relevance: 0.8 / connection.depth,
          entity: connection.node,
          relationship: connection.relationship,
          path: connection.path
        });
      });
      
      // Find similar nodes
      const similar = await this.knowledgeGraph.findSimilar(entity);
      
      similar.forEach(node => {
        suggestions.push({
          type: 'knowledge-graph',
          category: 'similar-concept',
          title: node.label,
          description: `Similar to ${entity}`,
          relevance: node.similarity,
          entity: node
        });
      });
    }
    
    return suggestions;
  }

  /**
   * Generate temporal suggestions (time-sensitive)
   */
  generateTemporalSuggestions(context) {
    const suggestions = [];
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    // Time-of-day suggestions
    if (hour >= 6 && hour < 12) {
      suggestions.push({
        type: 'temporal',
        category: 'time-of-day',
        title: 'Morning Planning',
        description: 'Review your priorities for today',
        relevance: 0.75,
        timing: 'morning',
        actions: [
          { label: 'View Tasks', action: 'view-tasks' },
          { label: 'Set Goals', action: 'set-goals' }
        ]
      });
    } else if (hour >= 12 && hour < 17) {
      suggestions.push({
        type: 'temporal',
        category: 'time-of-day',
        title: 'Afternoon Check-in',
        description: 'Review progress and adjust priorities',
        relevance: 0.7,
        timing: 'afternoon'
      });
    } else if (hour >= 17 && hour < 22) {
      suggestions.push({
        type: 'temporal',
        category: 'time-of-day',
        title: 'Evening Wrap-up',
        description: 'Summarize accomplishments and plan tomorrow',
        relevance: 0.8,
        timing: 'evening'
      });
    }
    
    // Day-of-week suggestions
    if (day === 1) { // Monday
      suggestions.push({
        type: 'temporal',
        category: 'day-of-week',
        title: 'Week Planning',
        description: 'Set your goals for the week',
        relevance: 0.85,
        timing: 'monday'
      });
    } else if (day === 5) { // Friday
      suggestions.push({
        type: 'temporal',
        category: 'day-of-week',
        title: 'Week Review',
        description: 'Review your week and plan for next week',
        relevance: 0.8,
        timing: 'friday'
      });
    }
    
    return suggestions;
  }

  /**
   * Generate contextual suggestions based on current activity
   */
  generateContextualSuggestions(context) {
    const suggestions = [];
    
    // Activity-based suggestions
    if (context.activity) {
      switch (context.activity) {
        case 'coding':
          suggestions.push({
            type: 'contextual',
            category: 'activity',
            title: 'Code Review',
            description: 'Review recent pull requests',
            relevance: 0.75
          });
          suggestions.push({
            type: 'contextual',
            category: 'activity',
            title: 'Documentation',
            description: 'Update relevant documentation',
            relevance: 0.65
          });
          break;
        
        case 'planning':
          suggestions.push({
            type: 'contextual',
            category: 'activity',
            title: 'Create Roadmap',
            description: 'Visualize your project timeline',
            relevance: 0.8
          });
          break;
        
        case 'meeting':
          suggestions.push({
            type: 'contextual',
            category: 'activity',
            title: 'Meeting Notes',
            description: 'Capture meeting notes and action items',
            relevance: 0.85
          });
          break;
      }
    }
    
    // Location-based suggestions
    if (context.location) {
      suggestions.push({
        type: 'contextual',
        category: 'location',
        title: `${context.location} Resources`,
        description: `Resources relevant to ${context.location}`,
        relevance: 0.7
      });
    }
    
    // Device-based suggestions
    if (context.device === 'mobile') {
      suggestions.push({
        type: 'contextual',
        category: 'device',
        title: 'Quick Actions',
        description: 'Mobile-optimized quick actions',
        relevance: 0.6
      });
    }
    
    return suggestions;
  }

  /**
   * Rank suggestions by relevance and context fit
   */
  rankSuggestions(suggestions, context) {
    return suggestions
      .map(suggestion => {
        const score = this.calculateSuggestionScore(suggestion, context);
        return { ...suggestion, score };
      })
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate suggestion score
   */
  calculateSuggestionScore(suggestion, context) {
    let score = suggestion.relevance || 0.5;
    
    // Boost based on type
    if (suggestion.type === 'knowledge-graph') score *= 1.2;
    if (suggestion.type === 'temporal') score *= 1.1;
    
    // Boost based on user preferences
    if (context.userId) {
      const prefs = this.userPreferences.get(context.userId);
      if (prefs && prefs.preferredTypes.includes(suggestion.type)) {
        score *= 1.15;
      }
    }
    
    // Penalize duplicate suggestions
    const isDuplicate = this.suggestionHistory.some(h => 
      h.suggestions.some(s => s.title === suggestion.title)
    );
    if (isDuplicate) score *= 0.8;
    
    return Math.min(score, 1);
  }

  /**
   * Update user preferences based on interaction
   */
  updateUserPreferences(userId, suggestion, interaction) {
    const prefs = this.userPreferences.get(userId) || {
      liked: [],
      dismissed: [],
      preferredTypes: [],
      interactionCount: 0
    };
    
    prefs.interactionCount++;
    
    if (interaction === 'accepted' || interaction === 'clicked') {
      prefs.liked.push(suggestion);
      if (!prefs.preferredTypes.includes(suggestion.type)) {
        prefs.preferredTypes.push(suggestion.type);
      }
    } else if (interaction === 'dismissed') {
      prefs.dismissed.push(suggestion);
    }
    
    this.userPreferences.set(userId, prefs);
    logger.debug(`Updated preferences for user ${userId}`);
  }

  /**
   * Find similar users for collaborative filtering
   */
  findSimilarUsers(userId) {
    const userPrefs = this.userPreferences.get(userId);
    if (!userPrefs) return [];
    
    const similarities = [];
    
    this.userPreferences.forEach((otherPrefs, otherId) => {
      if (otherId !== userId) {
        const similarity = this.calculateUserSimilarity(userPrefs, otherPrefs);
        if (similarity > 0.5) {
          similarities.push({ id: otherId, similarity });
        }
      }
    });
    
    return similarities.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
  }

  /**
   * Calculate similarity between two users
   */
  calculateUserSimilarity(prefs1, prefs2) {
    // Jaccard similarity on liked items
    const liked1 = new Set(prefs1.liked.map(s => s.title));
    const liked2 = new Set(prefs2.liked.map(s => s.title));
    
    const intersection = new Set([...liked1].filter(x => liked2.has(x)));
    const union = new Set([...liked1, ...liked2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Get suggestion sources for metadata
   */
  getSuggestionSources(suggestions) {
    const sources = new Map();
    
    suggestions.forEach(s => {
      sources.set(s.type, (sources.get(s.type) || 0) + 1);
    });
    
    return Object.fromEntries(sources);
  }

  /**
   * Get suggestion analytics
   */
  getAnalytics(timeframe = 'day') {
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
    }
    
    const recentHistory = this.suggestionHistory.filter(
      h => new Date(h.timestamp) > cutoff
    );
    
    return {
      totalSuggestions: recentHistory.reduce((sum, h) => sum + h.suggestions.length, 0),
      averagePerRequest: recentHistory.length > 0 
        ? recentHistory.reduce((sum, h) => sum + h.suggestions.length, 0) / recentHistory.length 
        : 0,
      requests: recentHistory.length,
      timeframe
    };
  }
}

export default SuggestionEngine;
