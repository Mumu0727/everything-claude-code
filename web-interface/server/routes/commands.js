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
 * 获取所有命令列表
 */
router.get('/', (req, res) => {
  try {
    const commands = scanner.scanMarkdownFiles('commands');
    const enrichedCommands = commands.map(cmd => {
      const info = parser.extractCommandInfo(cmd);
      const translation = translationLoader.getCommandInfo(cmd.fileName, {
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
    const groupedCommands = enrichedCommands.reduce((groups, cmd) => {
      const type = cmd.category;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(cmd);
      return groups;
    }, {});

    res.json({
      success: true,
      data: {
        total: enrichedCommands.length,
        commands: enrichedCommands,
        grouped: groupedCommands,
        types: Object.keys(groupedCommands),
        translationStats: translationLoader.getTranslationStats()
      }
    });
  } catch (error) {
    console.error('Error fetching commands:', error);
    res.status(500).json({
      success: false,
      error: '获取命令列表失败',
      message: error.message
    });
  }
});

/**
 * 搜索命令
 */
router.get('/search/:query', (req, res) => {
  try {
    const { query } = req.params;
    const searchTerm = query.toLowerCase();

      const commands = scanner.scanMarkdownFiles('commands');
      const enrichedCommands = commands.map(cmd => {
        const info = parser.extractCommandInfo(cmd);
        const translation = translationLoader.getCommandInfo(cmd.fileName, {
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
      const results = enrichedCommands.filter(cmd =>
        cmd.name.toLowerCase().includes(searchTerm) ||
        cmd.fileName.toLowerCase().includes(searchTerm) ||
        cmd.description.toLowerCase().includes(searchTerm) ||
        cmd.title.toLowerCase().includes(searchTerm) ||
        cmd.category.toLowerCase().includes(searchTerm)
      );

      // 按相关性排序（标题匹配优先）
      results.sort((a, b) => {
        const aNameMatch = a.title.toLowerCase().includes(searchTerm);
        const bNameMatch = b.title.toLowerCase().includes(searchTerm);

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
          searchSource: 'fallback'
        }
      });
  } catch (error) {
    console.error('Error searching commands:', error);
    res.status(500).json({
      success: false,
      error: '搜索命令失败',
      message: error.message
    });
  }
});

/**
 * 获取单个命令详情
 */
router.get('/:commandId', (req, res) => {
  try {
    const { commandId } = req.params;
    const commands = scanner.scanMarkdownFiles('commands');
    const command = commands.find(cmd => cmd.fileName === commandId);

    if (!command) {
      return res.status(404).json({
        success: false,
        error: '命令未找到'
      });
    }

    const enrichedCommand = parser.extractCommandInfo(command);
    const translation = translationLoader.getCommandInfo(command.fileName, {
      description: enrichedCommand.frontmatter.description,
      name: enrichedCommand.name
    });

    // 合并翻译信息
    const result = {
      ...enrichedCommand,
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
    console.error('Error fetching command:', error);
    res.status(500).json({
      success: false,
      error: '获取命令详情失败',
      message: error.message
    });
  }
});

/**
 * 获取命令统计信息
 */
router.get('/stats/overview', (req, res) => {
  try {
    const commands = scanner.scanMarkdownFiles('commands');
    const enrichedCommands = commands.map(cmd => {
      const info = parser.extractCommandInfo(cmd);
      const translation = translationLoader.getCommandInfo(cmd.fileName, {
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
    const typeStats = enrichedCommands.reduce((stats, cmd) => {
      const type = cmd.category;
      stats[type] = (stats[type] || 0) + 1;
      return stats;
    }, {});

    // 翻译状态统计
    const translationStats = enrichedCommands.reduce((stats, cmd) => {
      stats[cmd.translated ? 'translated' : 'untranslated']++;
      return stats;
    }, { translated: 0, untranslated: 0 });

    // 最近更新的命令
    const recentlyUpdated = enrichedCommands
      .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        totalCommands: commands.length,
        typeDistribution: typeStats,
        translationStats,
        recentlyUpdated: recentlyUpdated.map(cmd => ({
          name: cmd.title,
          fileName: cmd.fileName,
          lastModified: cmd.lastModified,
          type: cmd.category,
          translated: cmd.translated
        })),
        overallStats: translationLoader.getTranslationStats()
      }
    });
  } catch (error) {
    console.error('Error fetching command stats:', error);
    res.status(500).json({
      success: false,
      error: '获取统计信息失败',
      message: error.message
    });
  }
});

/**
 * 获取所有代理列表
 */
router.get('/agents', (req, res) => {
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
 * 获取单个代理详情
 */
router.get('/agents/:name', (req, res) => {
  try {
    const { name } = req.params;
    const agents = scanner.scanMarkdownFiles('agents');
    const agent = agents.find(a => a.fileName === name);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: '代理未找到',
        message: `名为 "${name}" 的代理不存在`
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

/**
 * 搜索代理
 */
router.get('/agents/search/:query', (req, res) => {
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

module.exports = router;