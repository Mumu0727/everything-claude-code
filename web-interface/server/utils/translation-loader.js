const fs = require('fs');
const path = require('path');

class TranslationLoader {
  constructor(webInterfaceRoot = path.resolve(__dirname, '../..')) {
    this.webInterfaceRoot = webInterfaceRoot;
    this.i18nDir = path.join(webInterfaceRoot, 'i18n');
    this.translationsFile = path.join(this.i18nDir, 'translations.json');
  }

  /**
   * 加载所有翻译数据
   * @returns {Object} 翻译数据对象
   */
  loadTranslations() {
    if (fs.existsSync(this.translationsFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.translationsFile, 'utf8'));
        return {
          commands: data.commands || {},
          agents: data.agents || {},
          skills: data.skills || {},
          lastGenerated: data.lastGenerated,
          totalCommands: data.totalCommands || 0,
          totalAgents: data.totalAgents || 0,
          totalSkills: data.totalSkills || 0
        };
      } catch (error) {
        console.error('加载翻译文件失败:', error.message);
        return {
          commands: {},
          agents: {},
          skills: {},
          lastGenerated: null,
          totalCommands: 0,
          totalAgents: 0,
          totalSkills: 0
        };
      }
    }

    return {
      commands: {},
      agents: {},
      skills: {},
      lastGenerated: null,
      totalCommands: 0,
      totalAgents: 0,
      totalSkills: 0
    };
  }

  /**
   * 加载单个命令的翻译
   * @param {string} fileName 文件名（不含扩展名）
   * @returns {Object|null} 翻译数据
   */
  loadCommandTranslation(fileName) {
    const filePath = path.join(this.i18nDir, 'commands', `${fileName}.json`);

    if (fs.existsSync(filePath)) {
      try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (error) {
        console.error(`加载命令翻译失败 (${fileName}):`, error.message);
        return null;
      }
    }

    return null;
  }

  /**
   * 检查翻译是否存在
   * @returns {boolean} 是否存在翻译文件
   */
  hasTranslations() {
    return fs.existsSync(this.translationsFile) && fs.existsSync(path.join(this.i18nDir, 'commands'));
  }

  /**
   * 获取翻译统计信息
   * @returns {Object} 统计信息
   */
  getTranslationStats() {
    const translations = this.loadTranslations();
    const commandsCount = Object.keys(translations.commands).length;

    // 按分类统计
    const categoryStats = {};
    Object.values(translations.commands).forEach(cmd => {
      const category = cmd.category || '未分类';
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });

    return {
      totalCommands: commandsCount,
      lastGenerated: translations.lastGenerated,
      categoryStats,
      hasTranslations: commandsCount > 0
    };
  }

  /**
   * 获取命令的中文信息
   * @param {string} fileName 文件名
   * @param {Object} fallback 回退数据
   * @returns {Object} 命令信息
   */
  getCommandInfo(fileName, fallback = {}) {
    const translations = this.loadTranslations();
    const commandTranslation = translations.commands[fileName];

    if (commandTranslation) {
      return {
        description: commandTranslation.description,
        title: commandTranslation.title,
        category: commandTranslation.category,
        translated: true
      };
    }

    // 返回回退信息
    return {
      description: fallback.description || '',
      title: fallback.title || fallback.name || fileName,
      category: '未分类',
      translated: false
    };
  }

  /**
   * 获取代理翻译信息
   * @param {string} fileName - 代理文件名（不含扩展名）
   * @param {Object} fallback - 回退信息
   * @returns {Object} 翻译信息
   */
  getAgentInfo(fileName, fallback = {}) {
    const translations = this.loadTranslations();
    const agentTranslation = translations.agents[fileName];

    if (agentTranslation) {
      return {
        description: agentTranslation.description,
        title: agentTranslation.title,
        category: agentTranslation.category,
        translated: true
      };
    }

    // 返回回退信息
    return {
      description: fallback.description || '',
      title: fallback.title || fallback.name || fileName,
      category: '开发辅助',
      translated: false
    };
  }

  /**
   * 获取技能翻译信息
   * @param {string} fileName - 技能文件名（不含扩展名）
   * @param {Object} fallback - 回退信息
   * @returns {Object} 翻译信息
   */
  getSkillInfo(fileName, fallback = {}) {
    const translations = this.loadTranslations();
    const skillTranslation = translations.skills[fileName];

    if (skillTranslation) {
      return {
        description: skillTranslation.description,
        title: skillTranslation.title,
        category: skillTranslation.category,
        translated: true
      };
    }

    // 返回回退信息
    return {
      description: fallback.description || '',
      title: fallback.title || fallback.name || fileName,
      category: '通用技能',
      translated: false
    };
  }

  /**
   * 搜索命令
   * @param {string} query 搜索关键词
   * @returns {Array} 匹配的命令列表
   */
  searchCommands(query) {
    const translations = this.loadTranslations();
    const searchTerm = query.toLowerCase();
    const results = [];

    Object.entries(translations.commands).forEach(([fileName, cmd]) => {
      const matchScore = this.calculateMatchScore(cmd, searchTerm);
      if (matchScore > 0) {
        results.push({
          fileName,
          ...cmd,
          matchScore
        });
      }
    });

    // 按匹配度排序
    return results.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * 计算搜索匹配度
   * @param {Object} cmd 命令对象
   * @param {string} searchTerm 搜索词
   * @returns {number} 匹配分数
   */
  calculateMatchScore(cmd, searchTerm) {
    let score = 0;

    // 标题完全匹配
    if (cmd.title.toLowerCase() === searchTerm) {
      score += 100;
    }
    // 标题包含
    else if (cmd.title.toLowerCase().includes(searchTerm)) {
      score += 50;
    }

    // 描述包含
    if (cmd.description.toLowerCase().includes(searchTerm)) {
      score += 30;
    }

    // 分类匹配
    if (cmd.category.toLowerCase().includes(searchTerm)) {
      score += 20;
    }

    return score;
  }

  /**
   * 按分类分组命令
   * @returns {Object} 分组后的命令
   */
  getCommandsByCategory() {
    const translations = this.loadTranslations();
    const grouped = {};

    Object.entries(translations.commands).forEach(([fileName, cmd]) => {
      const category = cmd.category || '未分类';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({
        fileName,
        ...cmd
      });
    });

    // 按分类名称排序
    const sortedGroups = {};
    Object.keys(grouped).sort().forEach(category => {
      sortedGroups[category] = grouped[category].sort((a, b) =>
        a.title.localeCompare(b.title, 'zh-CN')
      );
    });

    return sortedGroups;
  }
}

module.exports = TranslationLoader;