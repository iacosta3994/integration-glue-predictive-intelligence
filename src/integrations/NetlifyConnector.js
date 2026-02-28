import axios from 'axios';
import logger from '../utils/logger.js';

/**
 * Netlify Integration Connector
 */
class NetlifyConnector {
  constructor(token) {
    this.token = token;
    this.baseURL = 'https://api.netlify.com/api/v1';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  /**
   * Get sites
   */
  async getSites() {
    try {
      const { data } = await this.client.get('/sites');
      logger.info(`Fetched ${data.length} Netlify sites`);
      return data;
    } catch (error) {
      logger.error('Failed to fetch Netlify sites:', error);
      throw error;
    }
  }

  /**
   * Get site details
   */
  async getSite(siteId) {
    try {
      const { data } = await this.client.get(`/sites/${siteId}`);
      return data;
    } catch (error) {
      logger.error('Failed to fetch site details:', error);
      throw error;
    }
  }

  /**
   * Get deploys
   */
  async getDeploys(siteId) {
    try {
      const { data } = await this.client.get(`/sites/${siteId}/deploys`);
      logger.info(`Fetched ${data.length} deploys for site ${siteId}`);
      return data;
    } catch (error) {
      logger.error('Failed to fetch deploys:', error);
      throw error;
    }
  }

  /**
   * Trigger deploy
   */
  async triggerDeploy(siteId) {
    try {
      const { data } = await this.client.post(`/sites/${siteId}/builds`);
      logger.info(`Triggered deploy for site ${siteId}`);
      return data;
    } catch (error) {
      logger.error('Failed to trigger deploy:', error);
      throw error;
    }
  }

  /**
   * Get build hooks
   */
  async getBuildHooks(siteId) {
    try {
      const { data } = await this.client.get(`/sites/${siteId}/build_hooks`);
      return data;
    } catch (error) {
      logger.error('Failed to fetch build hooks:', error);
      throw error;
    }
  }

  /**
   * Get site analytics
   */
  async getAnalytics(siteId, period = '30d') {
    try {
      const { data } = await this.client.get(`/sites/${siteId}/analytics/${period}`);
      return data;
    } catch (error) {
      logger.error('Failed to fetch analytics:', error);
      throw error;
    }
  }
}

export default NetlifyConnector;
