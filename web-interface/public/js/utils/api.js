/**
 * API工具类 - 处理与后端API的通信
 */
class ApiClient {
  constructor() {
    this.baseUrl = window.location.origin;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
  }

  /**
   * 执行HTTP请求
   * @param {string} endpoint - API端点
   * @param {Object} options - 请求选项
   * @returns {Promise<Object>} API响应
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/api${endpoint}`;
    const cacheKey = `${url}${JSON.stringify(options)}`;

    // 检查缓存
    if (options.method === 'GET' || !options.method) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '请求失败');
      }

      // 缓存GET请求结果
      if (options.method === 'GET' || !options.method) {
        this.cache.set(cacheKey, {
          data: data,
          timestamp: Date.now()
        });
      }

      return data;
    } catch (error) {
      console.error('API请求失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有命令
   * @returns {Promise<Object>} 命令列表
   */
  async getCommands() {
    return this.request('/commands');
  }

  /**
   * 获取单个命令详情
   * @param {string} commandId - 命令ID
   * @returns {Promise<Object>} 命令详情
   */
  async getCommand(commandId) {
    return this.request(`/commands/${commandId}`);
  }

  /**
   * 搜索命令
   * @param {string} query - 搜索关键词
   * @returns {Promise<Object>} 搜索结果
   */
  async searchCommands(query) {
    if (!query.trim()) {
      return this.getCommands();
    }
    return this.request(`/commands/search/${encodeURIComponent(query)}`);
  }

  /**
   * 获取命令统计信息
   * @returns {Promise<Object>} 统计信息
   */
  async getCommandStats() {
    return this.request('/commands/stats/overview');
  }

  /**
   * 获取所有代理
   * @returns {Promise<Object>} 代理列表
   */
  async getAgents() {
    return this.request('/agents');
  }

  /**
   * 获取单个代理详情
   * @param {string} agentId - 代理ID
   * @returns {Promise<Object>} 代理详情
   */
  async getAgent(agentId) {
    return this.request(`/agents/${agentId}`);
  }

  /**
   * 获取所有技能
   * @returns {Promise<Object>} 技能列表
   */
  async getSkills() {
    return this.request('/skills');
  }

  /**
   * 获取单个技能详情
   * @param {string} skillId - 技能ID
   * @returns {Promise<Object>} 技能详情
   */
  async getSkill(skillId) {
    return this.request(`/skills/${skillId}`);
  }

  /**
   * 健康检查
   * @returns {Promise<Object>} 服务状态
   */
  async healthCheck() {
    return this.request('/health');
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * 清除过期缓存
   */
  clearExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }
}

// 创建全局API客户端实例
window.api = new ApiClient();

// 定期清理过期缓存
setInterval(() => {
  window.api.clearExpiredCache();
}, 60000); // 每分钟清理一次

// 导出给Node.js环境使用（如果需要）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiClient;
}