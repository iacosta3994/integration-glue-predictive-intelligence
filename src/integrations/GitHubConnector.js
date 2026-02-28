import { Octokit } from '@octokit/rest';
import logger from '../utils/logger.js';

/**
 * GitHub Integration Connector
 */
class GitHubConnector {
  constructor(token) {
    this.octokit = new Octokit({
      auth: token
    });
    this.cache = new Map();
    this.cacheTTL = 300000; // 5 minutes
  }

  /**
   * Get user repositories
   */
  async getRepositories(username) {
    try {
      const cacheKey = `repos-${username}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const { data } = await this.octokit.repos.listForUser({
        username,
        sort: 'updated',
        per_page: 100
      });

      this.setCache(cacheKey, data);
      logger.info(`Fetched ${data.length} repositories for ${username}`);
      return data;
    } catch (error) {
      logger.error('Failed to fetch repositories:', error);
      throw error;
    }
  }

  /**
   * Get repository issues
   */
  async getIssues(owner, repo, state = 'open') {
    try {
      const cacheKey = `issues-${owner}-${repo}-${state}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const { data } = await this.octokit.issues.listForRepo({
        owner,
        repo,
        state,
        per_page: 100
      });

      this.setCache(cacheKey, data);
      logger.info(`Fetched ${data.length} issues for ${owner}/${repo}`);
      return data;
    } catch (error) {
      logger.error('Failed to fetch issues:', error);
      throw error;
    }
  }

  /**
   * Get pull requests
   */
  async getPullRequests(owner, repo, state = 'open') {
    try {
      const { data } = await this.octokit.pulls.list({
        owner,
        repo,
        state,
        per_page: 100
      });

      logger.info(`Fetched ${data.length} pull requests for ${owner}/${repo}`);
      return data;
    } catch (error) {
      logger.error('Failed to fetch pull requests:', error);
      throw error;
    }
  }

  /**
   * Get commit activity
   */
  async getCommitActivity(owner, repo) {
    try {
      const { data } = await this.octokit.repos.getCommitActivityStats({
        owner,
        repo
      });

      return data;
    } catch (error) {
      logger.error('Failed to fetch commit activity:', error);
      throw error;
    }
  }

  /**
   * Create an issue
   */
  async createIssue(owner, repo, title, body, labels = []) {
    try {
      const { data } = await this.octokit.issues.create({
        owner,
        repo,
        title,
        body,
        labels
      });

      logger.info(`Created issue #${data.number} in ${owner}/${repo}`);
      return data;
    } catch (error) {
      logger.error('Failed to create issue:', error);
      throw error;
    }
  }

  // Cache helpers
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

export default GitHubConnector;
