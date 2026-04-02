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
 * 获取所有技能列表
 */
router.get('/', (req, res) => {
  try {
    const skills = scanner.scanMarkdownFiles('skills');
    const enrichedSkills = skills.map(skill => {
      const info = parser.extractCommandInfo(skill);
      const translation = translationLoader.getSkillInfo(skill.fileName, {
        description: info.frontmatter.description || skill.description,
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
    const groupedSkills = enrichedSkills.reduce((groups, skill) => {
      const type = skill.category;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(skill);
      return groups;
    }, {});

    res.json({
      success: true,
      data: {
        total: enrichedSkills.length,
        skills: enrichedSkills,
        grouped: groupedSkills,
        types: Object.keys(groupedSkills),
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({
      success: false,
      error: '获取技能列表失败',
      message: error.message
    });
  }
});

/**
 * 搜索技能
 */
router.get('/search/:query', (req, res) => {
  try {
    const { query } = req.params;
    const searchTerm = query.toLowerCase();

    const skills = scanner.scanMarkdownFiles('skills');
    const enrichedSkills = skills.map(skill => {
      const info = parser.extractCommandInfo(skill);
      const translation = translationLoader.getSkillInfo(skill.fileName, {
        description: info.frontmatter.description || skill.description,
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
    const results = enrichedSkills.filter(skill => {
      return skill.title.toLowerCase().includes(searchTerm) ||
             skill.description.toLowerCase().includes(searchTerm) ||
             skill.fileName.toLowerCase().includes(searchTerm) ||
             skill.category.toLowerCase().includes(searchTerm);
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
        searchSource: 'skills'
      }
    });
  } catch (error) {
    console.error('Error searching skills:', error);
    res.status(500).json({
      success: false,
      error: '搜索技能失败',
      message: error.message
    });
  }
});

/**
 * 获取技能统计信息
 */
router.get('/stats/overview', (req, res) => {
  try {
    const skills = scanner.scanMarkdownFiles('skills');
    const enrichedSkills = skills.map(skill => {
      const info = parser.extractCommandInfo(skill);
      const translation = translationLoader.getSkillInfo(skill.fileName, {
        description: info.frontmatter.description || skill.description,
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
    const typeStats = enrichedSkills.reduce((stats, skill) => {
      const type = skill.category;
      stats[type] = (stats[type] || 0) + 1;
      return stats;
    }, {});

    // 翻译状态统计
    const translationStats = enrichedSkills.reduce((stats, skill) => {
      stats[skill.translated ? 'translated' : 'untranslated']++;
      return stats;
    }, { translated: 0, untranslated: 0 });

    // 最近更新的技能
    const recentlyUpdated = enrichedSkills
      .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        totalSkills: skills.length,
        typeDistribution: typeStats,
        translationStats,
        recentlyUpdated: recentlyUpdated.map(skill => ({
          name: skill.title,
          fileName: skill.fileName,
          lastModified: skill.lastModified,
          type: skill.category,
          translated: skill.translated
        })),
        categories: Object.keys(typeStats)
      }
    });
  } catch (error) {
    console.error('Error fetching skill stats:', error);
    res.status(500).json({
      success: false,
      error: '获取技能统计信息失败',
      message: error.message
    });
  }
});

/**
 * 获取单个技能详情
 */
router.get('/:skillId', (req, res) => {
  try {
    const { skillId } = req.params;
    const skills = scanner.scanMarkdownFiles('skills');
    const skill = skills.find(s => s.fileName === skillId);

    if (!skill) {
      return res.status(404).json({
        success: false,
        error: '技能未找到',
        message: `名为 "${skillId}" 的技能不存在`
      });
    }

    const enrichedSkill = parser.extractCommandInfo(skill);
    const translation = translationLoader.getSkillInfo(skill.fileName, {
      description: enrichedSkill.frontmatter.description || skill.description,
      name: enrichedSkill.name
    });

    // 合并翻译信息
    const result = {
      ...enrichedSkill,
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
    console.error('Error fetching skill:', error);
    res.status(500).json({
      success: false,
      error: '获取技能详情失败',
      message: error.message
    });
  }
});

module.exports = router;