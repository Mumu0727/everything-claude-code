const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

class DirectoryScanner {
  constructor(baseDir) {
    this.baseDir = baseDir;
  }

  /**
   * 扫描指定目录下的所有.md文件
   * @param {string} dirPath - 目录路径
   * @returns {Array} 文件信息数组
   */
  scanMarkdownFiles(dirPath) {
    const fullPath = path.join(this.baseDir, dirPath);

    if (!fs.existsSync(fullPath)) {
      return [];
    }

    const files = [];
    const entries = fs.readdirSync(fullPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        const filePath = path.join(fullPath, entry.name);
        const fileInfo = this.parseMarkdownFile(filePath, dirPath);
        if (fileInfo) {
          files.push(fileInfo);
        }
      } else if (entry.isDirectory() && dirPath === 'skills') {
        // 对于 skills 目录，扫描子目录中的 SKILL.md 文件
        const subDirPath = path.join(fullPath, entry.name);
        const skillFilePath = path.join(subDirPath, 'SKILL.md');

        if (fs.existsSync(skillFilePath)) {
          const fileInfo = this.parseSkillFile(skillFilePath, entry.name);
          if (fileInfo) {
            files.push(fileInfo);
          }
        }
      }
    }

    return files.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * 解析单个Skill文件 (SKILL.md)
   * @param {string} filePath - 文件路径
   * @param {string} skillName - 技能名称
   * @returns {Object|null} 解析后的文件信息
   */
  parseSkillFile(filePath, skillName) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data: frontmatter, content: body } = matter(content);

      // 从内容中提取技能描述 - 通常在第一个 # 标题后
      const description = this.extractSkillDescription(body);

      return {
        id: skillName,
        name: skillName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        fileName: skillName,
        category: 'skills',
        description: frontmatter.description || description,
        frontmatter: frontmatter,
        content: body,
        lastModified: fs.statSync(filePath).mtime,
        size: fs.statSync(filePath).size,
        filePath: filePath
      };
    } catch (error) {
      console.error(`Error parsing skill file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * 从 skill 内容中提取描述
   * @param {string} content - 文件内容
   * @returns {string} 描述文本
   */
  extractSkillDescription(content) {
    const lines = content.split('\n');
    let foundTitle = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // 跳过第一个标题行
      if (trimmed.startsWith('#')) {
        foundTitle = true;
        continue;
      }

      // 找到标题后的第一个非空行作为描述
      if (foundTitle && trimmed && !trimmed.startsWith('---')) {
        return trimmed.substring(0, 200) + (trimmed.length > 200 ? '...' : '');
      }
    }

    return '暂无描述';
  }

  /**
   * 解析单个Markdown文件
   * @param {string} filePath - 文件路径
   * @param {string} category - 文件分类
   * @returns {Object|null} 解析后的文件信息
   */
  parseMarkdownFile(filePath, category) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data: frontmatter, content: body } = matter(content);
      const fileName = path.basename(filePath, '.md');

      return {
        id: fileName,
        name: fileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        fileName: fileName,
        category: category,
        description: frontmatter.description || this.extractDescription(body),
        frontmatter: frontmatter,
        content: body,
        lastModified: fs.statSync(filePath).mtime,
        size: fs.statSync(filePath).size
      };
    } catch (error) {
      console.error(`Error parsing file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * 从内容中提取描述
   * @param {string} content - 文件内容
   * @returns {string} 描述文本
   */
  extractDescription(content) {
    // 尝试提取第一个段落作为描述
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---')) {
        return trimmed.substring(0, 200) + (trimmed.length > 200 ? '...' : '');
      }
    }
    return '暂无描述';
  }

  /**
   * 获取目录统计信息
   * @param {string} dirPath - 目录路径
   * @returns {Object} 统计信息
   */
  getDirectoryStats(dirPath) {
    const files = this.scanMarkdownFiles(dirPath);
    return {
      count: files.length,
      lastModified: files.length > 0 ? Math.max(...files.map(f => f.lastModified)) : null,
      totalSize: files.reduce((sum, f) => sum + f.size, 0)
    };
  }
}

module.exports = DirectoryScanner;