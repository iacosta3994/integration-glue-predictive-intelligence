import logger from './logger.js';

/**
 * Knowledge Graph implementation
 */
class KnowledgeGraph {
  constructor() {
    this.nodes = new Map();
    this.edges = [];
    this.index = new Map();
  }

  /**
   * Build knowledge graph from data
   */
  async build(knowledgeBase) {
    try {
      logger.info('Building knowledge graph...');
      
      knowledgeBase.forEach(item => {
        this.addNode(item.id || item.title, item);
        
        if (item.relations) {
          item.relations.forEach(relation => {
            this.addEdge(
              item.id || item.title,
              relation.target,
              relation.type
            );
          });
        }
      });
      
      this.buildIndex();
      
      logger.info(`Knowledge graph built with ${this.nodes.size} nodes and ${this.edges.length} edges`);
    } catch (error) {
      logger.error('Failed to build knowledge graph:', error);
      throw error;
    }
  }

  /**
   * Add a node to the graph
   */
  addNode(id, data) {
    this.nodes.set(id, {
      id,
      label: data.title || data.label || id,
      data,
      connections: []
    });
  }

  /**
   * Add an edge to the graph
   */
  addEdge(sourceId, targetId, type) {
    const edge = { source: sourceId, target: targetId, type };
    this.edges.push(edge);
    
    const sourceNode = this.nodes.get(sourceId);
    if (sourceNode) {
      sourceNode.connections.push({ target: targetId, type });
    }
  }

  /**
   * Find connections from a node
   */
  async findConnections(nodeId, options = {}) {
    const maxDepth = options.maxDepth || 2;
    const connections = [];
    const visited = new Set();
    
    const traverse = (currentId, depth, path) => {
      if (depth > maxDepth || visited.has(currentId)) return;
      
      visited.add(currentId);
      const node = this.nodes.get(currentId);
      
      if (!node) return;
      
      node.connections.forEach(conn => {
        const targetNode = this.nodes.get(conn.target);
        if (targetNode && depth > 0) {
          connections.push({
            node: targetNode,
            relationship: conn.type,
            depth,
            path: [...path, currentId]
          });
        }
        
        traverse(conn.target, depth + 1, [...path, currentId]);
      });
    };
    
    traverse(nodeId, 0, []);
    
    return connections;
  }

  /**
   * Find similar nodes
   */
  async findSimilar(nodeId, limit = 5) {
    const node = this.nodes.get(nodeId);
    if (!node) return [];
    
    const similarities = [];
    
    this.nodes.forEach((otherNode, otherId) => {
      if (otherId !== nodeId) {
        const similarity = this.calculateSimilarity(node, otherNode);
        if (similarity > 0.3) {
          similarities.push({
            ...otherNode,
            similarity
          });
        }
      }
    });
    
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Calculate similarity between nodes
   */
  calculateSimilarity(node1, node2) {
    // Simplified similarity based on shared connections
    const connections1 = new Set(node1.connections.map(c => c.target));
    const connections2 = new Set(node2.connections.map(c => c.target));
    
    const intersection = new Set(
      [...connections1].filter(x => connections2.has(x))
    );
    const union = new Set([...connections1, ...connections2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Build search index
   */
  buildIndex() {
    this.nodes.forEach((node, id) => {
      const terms = this.extractTerms(node.label);
      terms.forEach(term => {
        if (!this.index.has(term)) {
          this.index.set(term, []);
        }
        this.index.get(term).push(id);
      });
    });
  }

  /**
   * Extract search terms
   */
  extractTerms(text) {
    return text
      .toLowerCase()
      .split(/\W+/)
      .filter(term => term.length > 2);
  }

  /**
   * Search nodes
   */
  search(query) {
    const terms = this.extractTerms(query);
    const matches = new Map();
    
    terms.forEach(term => {
      const nodeIds = this.index.get(term) || [];
      nodeIds.forEach(id => {
        matches.set(id, (matches.get(id) || 0) + 1);
      });
    });
    
    return Array.from(matches.entries())
      .map(([id, score]) => ({
        node: this.nodes.get(id),
        score: score / terms.length
      }))
      .sort((a, b) => b.score - a.score);
  }
}

export default KnowledgeGraph;
