import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';
import EventPredictor from '../models/EventPredictor.js';
import SuggestionEngine from '../models/SuggestionEngine.js';
import AtlasIntegration from '../frameworks/AtlasIntegration.js';
import AdaptiveLearning from '../learning/AdaptiveLearning.js';

/**
 * Predictive Intelligence REST API
 */
class PredictiveAPI {
  constructor(config = {}) {
    this.app = express();
    this.port = config.port || 3000;
    this.config = config;
    
    // Initialize core components
    this.eventPredictor = new EventPredictor();
    this.suggestionEngine = new SuggestionEngine();
    this.atlasIntegration = new AtlasIntegration();
    this.adaptiveLearning = new AdaptiveLearning();
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Setup middleware
   */
  setupMiddleware() {
    // Security
    this.app.use(helmet());
    this.app.use(cors(this.config.cors || {}));
    
    // Parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Compression
    this.app.use(compression());
    
    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    });
    this.app.use('/api/', limiter);
    
    // Logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Setup API routes
   */
  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Predictions
    this.app.post('/api/predictions', async (req, res) => {
      try {
        const { context } = req.body;
        const result = await this.eventPredictor.predictEvents(context);
        res.json(result);
      } catch (error) {
        logger.error('Prediction error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/predictions/feedback', async (req, res) => {
      try {
        const { prediction, actual, context } = req.body;
        const feedback = this.adaptiveLearning.capturePredictionFeedback(
          prediction,
          actual,
          context
        );
        res.json({ success: true, feedback });
      } catch (error) {
        logger.error('Feedback error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Suggestions
    this.app.post('/api/suggestions', async (req, res) => {
      try {
        const { context } = req.body;
        const result = await this.suggestionEngine.generateSuggestions(context);
        res.json(result);
      } catch (error) {
        logger.error('Suggestion error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/suggestions/feedback', async (req, res) => {
      try {
        const { suggestion, action, context } = req.body;
        const feedback = this.adaptiveLearning.captureSuggestionFeedback(
          suggestion,
          action,
          context
        );
        res.json({ success: true, feedback });
      } catch (error) {
        logger.error('Feedback error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Decision Analysis
    this.app.post('/api/decisions/analyze', async (req, res) => {
      try {
        const { decision, context } = req.body;
        const result = await this.atlasIntegration.analyzeDecision(decision, context);
        res.json(result);
      } catch (error) {
        logger.error('Decision analysis error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/decisions/feedback', async (req, res) => {
      try {
        const { decision, outcome, context } = req.body;
        const feedback = this.adaptiveLearning.captureDecisionFeedback(
          decision,
          outcome,
          context
        );
        res.json({ success: true, feedback });
      } catch (error) {
        logger.error('Feedback error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/decisions/history', (req, res) => {
      try {
        const limit = parseInt(req.query.limit) || 10;
        const history = this.atlasIntegration.getHistory(limit);
        res.json({ history });
      } catch (error) {
        logger.error('History error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Learning & Analytics
    this.app.get('/api/metrics', (req, res) => {
      try {
        const timeframe = req.query.timeframe || 'day';
        const metrics = this.adaptiveLearning.calculatePerformanceMetrics(timeframe);
        res.json(metrics);
      } catch (error) {
        logger.error('Metrics error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/improvements', (req, res) => {
      try {
        const recommendations = this.adaptiveLearning.generateImprovementRecommendations();
        res.json(recommendations);
      } catch (error) {
        logger.error('Improvements error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/learning/apply', async (req, res) => {
      try {
        const models = {
          eventPredictor: this.eventPredictor,
          suggestionEngine: this.suggestionEngine,
          atlasIntegration: this.atlasIntegration
        };
        const result = await this.adaptiveLearning.applyLearning(models);
        res.json(result);
      } catch (error) {
        logger.error('Apply learning error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Error handling
    this.app.use((err, req, res, next) => {
      logger.error('Unhandled error:', err);
      res.status(500).json({
        error: 'Internal server error',
        message: err.message
      });
    });
  }

  /**
   * Initialize the API server
   */
  async initialize() {
    try {
      logger.info('Initializing Predictive Intelligence API...');
      
      // Initialize models
      await this.eventPredictor.initialize();
      await this.suggestionEngine.initialize();
      
      logger.info('API initialized successfully');
    } catch (error) {
      logger.error('API initialization failed:', error);
      throw error;
    }
  }

  /**
   * Start the API server
   */
  async start() {
    await this.initialize();
    
    this.server = this.app.listen(this.port, () => {
      logger.info(`Predictive Intelligence API listening on port ${this.port}`);
    });
    
    return this.server;
  }

  /**
   * Stop the API server
   */
  async stop() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          logger.info('API server stopped');
          resolve();
        });
      });
    }
  }
}

export default PredictiveAPI;
