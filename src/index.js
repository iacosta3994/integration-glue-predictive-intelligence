import dotenv from 'dotenv';
import PredictiveAPI from './api/PredictiveAPI.js';
import logger from './utils/logger.js';
import GitHubConnector from './integrations/GitHubConnector.js';
import SupabaseConnector from './integrations/SupabaseConnector.js';
import NetlifyConnector from './integrations/NetlifyConnector.js';
import NotionConnector from './integrations/NotionConnector.js';

// Load environment variables
dotenv.config();

/**
 * Main application entry point
 */
async function main() {
  try {
    logger.info('Starting Predictive Intelligence System...');
    
    // Initialize integrations (optional, based on env vars)
    const integrations = {};
    
    if (process.env.GITHUB_TOKEN) {
      integrations.github = new GitHubConnector(process.env.GITHUB_TOKEN);
      logger.info('GitHub integration enabled');
    }
    
    if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
      integrations.supabase = new SupabaseConnector(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY
      );
      await integrations.supabase.initialize();
      logger.info('Supabase integration enabled');
    }
    
    if (process.env.NETLIFY_TOKEN) {
      integrations.netlify = new NetlifyConnector(process.env.NETLIFY_TOKEN);
      logger.info('Netlify integration enabled');
    }
    
    if (process.env.NOTION_TOKEN) {
      integrations.notion = new NotionConnector(process.env.NOTION_TOKEN);
      logger.info('Notion integration enabled');
    }
    
    // Initialize and start API server
    const api = new PredictiveAPI({
      port: process.env.PORT || 3000,
      cors: {
        origin: process.env.CORS_ORIGIN || '*'
      },
      integrations
    });
    
    await api.start();
    
    logger.info('Predictive Intelligence System started successfully');
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully...');
      await api.stop();
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully...');
      await api.stop();
      process.exit(0);
    });
    
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

// Run the application
main();
