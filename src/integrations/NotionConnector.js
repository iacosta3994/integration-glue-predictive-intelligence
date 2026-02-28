import { Client } from '@notionhq/client';
import logger from '../utils/logger.js';

/**
 * Notion Integration Connector
 */
class NotionConnector {
  constructor(token) {
    this.notion = new Client({ auth: token });
  }

  /**
   * Query database
   */
  async queryDatabase(databaseId, filter = {}) {
    try {
      const response = await this.notion.databases.query({
        database_id: databaseId,
        filter
      });

      logger.info(`Queried ${response.results.length} items from Notion database`);
      return response.results;
    } catch (error) {
      logger.error('Failed to query Notion database:', error);
      throw error;
    }
  }

  /**
   * Create page
   */
  async createPage(parentId, properties, children = []) {
    try {
      const response = await this.notion.pages.create({
        parent: { database_id: parentId },
        properties,
        children
      });

      logger.info(`Created Notion page: ${response.id}`);
      return response;
    } catch (error) {
      logger.error('Failed to create Notion page:', error);
      throw error;
    }
  }

  /**
   * Update page
   */
  async updatePage(pageId, properties) {
    try {
      const response = await this.notion.pages.update({
        page_id: pageId,
        properties
      });

      logger.info(`Updated Notion page: ${pageId}`);
      return response;
    } catch (error) {
      logger.error('Failed to update Notion page:', error);
      throw error;
    }
  }

  /**
   * Get page
   */
  async getPage(pageId) {
    try {
      const response = await this.notion.pages.retrieve({
        page_id: pageId
      });

      return response;
    } catch (error) {
      logger.error('Failed to fetch Notion page:', error);
      throw error;
    }
  }

  /**
   * Search
   */
  async search(query) {
    try {
      const response = await this.notion.search({
        query,
        filter: {
          property: 'object',
          value: 'page'
        }
      });

      logger.info(`Found ${response.results.length} pages matching "${query}"`);
      return response.results;
    } catch (error) {
      logger.error('Failed to search Notion:', error);
      throw error;
    }
  }

  /**
   * Get block children
   */
  async getBlockChildren(blockId) {
    try {
      const response = await this.notion.blocks.children.list({
        block_id: blockId
      });

      return response.results;
    } catch (error) {
      logger.error('Failed to fetch block children:', error);
      throw error;
    }
  }
}

export default NotionConnector;
