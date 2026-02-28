import { createClient } from '@supabase/supabase-js';
import logger from '../utils/logger.js';

/**
 * Supabase Integration Connector
 */
class SupabaseConnector {
  constructor(url, key) {
    this.client = createClient(url, key);
    this.initialized = false;
  }

  /**
   * Initialize database schema
   */
  async initialize() {
    try {
      logger.info('Initializing Supabase connection...');
      
      // Test connection
      const { error } = await this.client.from('predictions').select('count');
      
      if (error && error.code === '42P01') {
        logger.info('Creating database tables...');
        await this.createTables();
      }
      
      this.initialized = true;
      logger.info('Supabase connection initialized');
    } catch (error) {
      logger.error('Failed to initialize Supabase:', error);
      throw error;
    }
  }

  /**
   * Save prediction
   */
  async savePrediction(prediction) {
    try {
      const { data, error } = await this.client
        .from('predictions')
        .insert([{
          type: prediction.type,
          confidence: prediction.confidence,
          context: prediction.context,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      
      logger.debug('Saved prediction to database');
      return data[0];
    } catch (error) {
      logger.error('Failed to save prediction:', error);
      throw error;
    }
  }

  /**
   * Get predictions
   */
  async getPredictions(filters = {}) {
    try {
      let query = this.client.from('predictions').select('*');
      
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      
      if (filters.minConfidence) {
        query = query.gte('confidence', filters.minConfidence);
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      logger.error('Failed to fetch predictions:', error);
      throw error;
    }
  }

  /**
   * Save suggestion
   */
  async saveSuggestion(suggestion) {
    try {
      const { data, error } = await this.client
        .from('suggestions')
        .insert([{
          title: suggestion.title,
          description: suggestion.description,
          type: suggestion.type,
          relevance: suggestion.relevance,
          context: suggestion.context,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      
      logger.debug('Saved suggestion to database');
      return data[0];
    } catch (error) {
      logger.error('Failed to save suggestion:', error);
      throw error;
    }
  }

  /**
   * Save feedback
   */
  async saveFeedback(feedback) {
    try {
      const { data, error } = await this.client
        .from('feedback')
        .insert([{
          type: feedback.type,
          prediction: feedback.prediction,
          actual: feedback.actual,
          correct: feedback.correct,
          context: feedback.context,
          created_at: feedback.timestamp
        }])
        .select();

      if (error) throw error;
      
      logger.debug('Saved feedback to database');
      return data[0];
    } catch (error) {
      logger.error('Failed to save feedback:', error);
      throw error;
    }
  }

  /**
   * Get feedback
   */
  async getFeedback(filters = {}) {
    try {
      let query = this.client.from('feedback').select('*');
      
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      logger.error('Failed to fetch feedback:', error);
      throw error;
    }
  }

  /**
   * Save decision
   */
  async saveDecision(decision, analysis) {
    try {
      const { data, error } = await this.client
        .from('decisions')
        .insert([{
          title: decision.title,
          description: decision.description,
          analysis: analysis,
          confidence: analysis.confidence,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      
      logger.debug('Saved decision to database');
      return data[0];
    } catch (error) {
      logger.error('Failed to save decision:', error);
      throw error;
    }
  }

  /**
   * Create database tables
   */
  async createTables() {
    // Note: In production, use proper migrations
    // This is a simplified version for demonstration
    logger.info('Database tables should be created via Supabase dashboard or migrations');
  }
}

export default SupabaseConnector;
