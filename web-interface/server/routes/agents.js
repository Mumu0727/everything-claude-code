const express = require('express');
const path = require('path');
const DirectoryScanner = require('../utils/scanner');
const MarkdownParser = require('../utils/parser');
const TranslationLoader = require('../utils/translation-loader');

const router = express.Router();
const scanner = new DirectoryScanner(path.join(__dirname, '../../../'));
const parser = new MarkdownParser();
const translationLoader = new TranslationLoader();

/**
 * 获取所有代理列表
 */
router.get('/', (req, res) => {
  try {
    const agents = scanner.scanMarkdownFiles('agents');
    const enrichedAgents = agents.map(agent => {
      const info = parser.extractCommandInfo(agent);
      const translation = translationLoader.getAgentInfo(agent.fileName, {
        description: info.frontmatter.description,
        name: info.name
      });

      return {
        ...info,
        // 使用中文翻译替换英文描述
        description: translation.description,
        title: translation.title,
        category: translation.category,
        translated: translation.translated
      };
    });

    // 按中文类别分组
    const groupedAgents = enrichedAgents.reduce((groups, agent) => {
      const type = agent.category;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(agent);
      return groups;
    }, {});

    res.json({
      success: true,
      data: {
        total: enrichedAgents.length,
        agents: enrichedAgents,
        grouped: groupedAgents,
        types: Object.keys(groupedAgents),
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({
      success: false,
      error: '获取代理列表失败',
      message: error.message
    });
  }
});

/**
 * 搜索代理
 */
router.get('/search/:query', (req, res) => {
  try {
    const { query } = req.params;
    const searchTerm = query.toLowerCase();

    const agents = scanner.scanMarkdownFiles('agents');
    const enrichedAgents = agents.map(agent => {
      const info = parser.extractCommandInfo(agent);
      const translation = translationLoader.getAgentInfo(agent.fileName, {
        description: info.frontmatter.description,
        name: info.name
      });

      return {
        ...info,
        description: translation.description,
        title: translation.title,
        category: translation.category,
        translated: translation.translated
      };
    });

    // 搜索匹配
    const results = enrichedAgents.filter(agent => {
      return agent.title.toLowerCase().includes(searchTerm) ||
             agent.description.toLowerCase().includes(searchTerm) ||
             agent.fileName.toLowerCase().includes(searchTerm) ||
             agent.category.toLowerCase().includes(searchTerm);
    });

    // 按匹配相关性排序
    results.sort((a, b) => {
      const aNameMatch = a.fileName.toLowerCase().includes(searchTerm);
      const bNameMatch = b.fileName.toLowerCase().includes(searchTerm);

      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;

      return a.title.localeCompare(b.title, 'zh-CN');
    });

    res.json({
      success: true,
      data: {
        query: query,
        total: results.length,
        results: results,
        searchSource: 'agents'
      }
    });
  } catch (error) {
    console.error('Error searching agents:', error);
    res.status(500).json({
      success: false,
      error: '搜索代理失败',
      message: error.message
    });
  }
});

/**
 * 获取代理统计信息
 */
router.get('/stats/overview', (req, res) => {
  try {
    const agents = scanner.scanMarkdownFiles('agents');
    const enrichedAgents = agents.map(agent => {
      const info = parser.extractCommandInfo(agent);
      const translation = translationLoader.getAgentInfo(agent.fileName, {
        description: info.frontmatter.description,
        name: info.name
      });

      return {
        ...info,
        description: translation.description,
        title: translation.title,
        category: translation.category,
        translated: translation.translated
      };
    });

    // 按类型统计
    const typeStats = enrichedAgents.reduce((stats, agent) => {
      const type = agent.category;
      stats[type] = (stats[type] || 0) + 1;
      return stats;
    }, {});

    // 翻译状态统计
    const translationStats = enrichedAgents.reduce((stats, agent) => {
      stats[agent.translated ? 'translated' : 'untranslated']++;
      return stats;
    }, { translated: 0, untranslated: 0 });

    // 最近更新的代理
    const recentlyUpdated = enrichedAgents
      .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        totalAgents: agents.length,
        typeDistribution: typeStats,
        translationStats,
        recentlyUpdated: recentlyUpdated.map(agent => ({
          name: agent.title,
          fileName: agent.fileName,
          lastModified: agent.lastModified,
          type: agent.category,
          translated: agent.translated
        })),
        categories: Object.keys(typeStats)
      }
    });
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    res.status(500).json({
      success: false,
      error: '获取代理统计信息失败',
      message: error.message
    });
  }
});

/**
 * 获取单个代理详情
 */
router.get('/:agentId', (req, res) => {
  try {
    const { agentId } = req.params;
    const agents = scanner.scanMarkdownFiles('agents');
    const agent = agents.find(a => a.fileName === agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: '代理未找到',
        message: `名为 "${agentId}" 的代理不存在`
      });
    }

    const enrichedAgent = parser.extractCommandInfo(agent);
    const translation = translationLoader.getAgentInfo(agent.fileName, {
      description: enrichedAgent.frontmatter.description,
      name: enrichedAgent.name
    });

    // 合并翻译信息
    const result = {
      ...enrichedAgent,
      description: translation.description,
      title: translation.title,
      category: translation.category,
      translated: translation.translated
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({
      success: false,
      error: '获取代理详情失败',
      message: error.message
    });
  }
});

module.exports = router;