const { marked } = require('marked');
const matter = require('gray-matter');

class MarkdownParser {
  constructor() {
    this.configureMarked();
  }

  /**
   * 配置marked解析器
   */
  configureMarked() {
    marked.setOptions({
      highlight: function(code, lang) {
        // 基础的代码高亮
        return `<pre><code class="language-${lang}">${code}</code></pre>`;
      },
      breaks: true,
      gfm: true
    });
  }

  /**
   * 解析Markdown文件内容
   * @param {string} content - Markdown内容
   * @returns {Object} 解析结果
   */
  parseMarkdown(content) {
    try {
      const { data: frontmatter, content: body } = matter(content);
      const html = marked(body);

      return {
        frontmatter,
        html,
        rawContent: body,
        sections: this.extractSections(body),
        metadata: this.extractMetadata(body)
      };
    } catch (error) {
      console.error('Markdown parsing error:', error);
      return {
        frontmatter: {},
        html: '<p>解析错误</p>',
        rawContent: content,
        sections: [],
        metadata: {}
      };
    }
  }

  /**
   * 提取文档章节
   * @param {string} content - Markdown内容
   * @returns {Array} 章节数组
   */
  extractSections(content) {
    const sections = [];
    const lines = content.split('\n');
    let currentSection = null;

    for (const line of lines) {
      const trimmed = line.trim();

      // 检测标题
      const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const title = headerMatch[2];
        const id = this.generateAnchorId(title);

        if (currentSection && level <= 2) {
          sections.push(currentSection);
        }

        if (level <= 2) {
          currentSection = {
            level,
            title,
            id,
            content: []
          };
        }
      } else if (currentSection && trimmed) {
        currentSection.content.push(line);
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * 提取元数据信息
   * @param {string} content - Markdown内容
   * @returns {Object} 元数据对象
   */
  extractMetadata(content) {
    const metadata = {
      headings: [],
      codeBlocks: [],
      links: [],
      examples: []
    };

    const lines = content.split('\n');
    let inCodeBlock = false;
    let currentCodeBlock = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // 提取标题
      const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        metadata.headings.push({
          level: headerMatch[1].length,
          text: headerMatch[2],
          id: this.generateAnchorId(headerMatch[2])
        });
      }

      // 提取代码块
      if (trimmed.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          const lang = trimmed.substring(3).trim() || 'text';
          currentCodeBlock = {
            language: lang,
            content: [],
            startLine: i + 1
          };
        } else {
          inCodeBlock = false;
          if (currentCodeBlock) {
            currentCodeBlock.content = currentCodeBlock.content.join('\n');
            metadata.codeBlocks.push(currentCodeBlock);
            currentCodeBlock = null;
          }
        }
      } else if (inCodeBlock && currentCodeBlock) {
        currentCodeBlock.content.push(line);
      }

      // 提取链接
      const linkMatches = line.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
      for (const match of linkMatches) {
        metadata.links.push({
          text: match[1],
          url: match[2]
        });
      }

      // 提取示例（以Example开头的标题）
      if (headerMatch && headerMatch[2].toLowerCase().includes('example')) {
        metadata.examples.push({
          title: headerMatch[2],
          line: i + 1
        });
      }
    }

    return metadata;
  }

  /**
   * 生成锚点ID
   * @param {string} text - 文本内容
   * @returns {string} 锚点ID
   */
  generateAnchorId(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  /**
   * 提取命令信息
   * @param {Object} fileInfo - 文件信息
   * @returns {Object} 命令信息
   */
  extractCommandInfo(fileInfo) {
    const { frontmatter, content } = fileInfo;
    const parsed = this.parseMarkdown(content);

    return {
      ...fileInfo,
      ...parsed,
      commandType: this.detectCommandType(content),
      usage: this.extractUsage(content),
      examples: this.extractExamples(content),
      relatedCommands: this.extractRelatedCommands(content)
    };
  }

  /**
   * 检测命令类型
   * @param {string} content - 内容
   * @returns {string} 命令类型
   */
  detectCommandType(content) {
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('test') || lowerContent.includes('tdd')) return 'testing';
    if (lowerContent.includes('build') || lowerContent.includes('fix')) return 'build';
    if (lowerContent.includes('plan') || lowerContent.includes('design')) return 'planning';
    if (lowerContent.includes('review') || lowerContent.includes('quality')) return 'review';
    if (lowerContent.includes('doc') || lowerContent.includes('documentation')) return 'documentation';
    if (lowerContent.includes('refactor') || lowerContent.includes('clean')) return 'refactoring';

    return 'general';
  }

  /**
   * 提取使用方法
   * @param {string} content - 内容
   * @returns {Array} 使用方法数组
   */
  extractUsage(content) {
    const usage = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes('Usage') || line.includes('用法') || line.includes('使用')) {
        // 查找后续的代码块或示例
        for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
          const nextLine = lines[j].trim();
          if (nextLine.startsWith('/') || nextLine.startsWith('`/')) {
            usage.push(nextLine.replace(/`/g, ''));
          }
        }
      }
    }

    return usage;
  }

  /**
   * 提取示例
   * @param {string} content - 内容
   * @returns {Array} 示例数组
   */
  extractExamples(content) {
    const examples = [];
    const codeBlockRegex = /```[\s\S]*?```/g;
    const matches = content.match(codeBlockRegex);

    if (matches) {
      matches.forEach((match, index) => {
        const cleanCode = match.replace(/```\w*\n?/g, '').trim();
        if (cleanCode.startsWith('/') || cleanCode.includes('User:') || cleanCode.includes('Agent:')) {
          examples.push({
            id: index,
            code: cleanCode,
            description: `示例 ${index + 1}`
          });
        }
      });
    }

    return examples;
  }

  /**
   * 提取相关命令
   * @param {string} content - 内容
   * @returns {Array} 相关命令数组
   */
  extractRelatedCommands(content) {
    const related = [];
    const commandRegex = /\/[\w-]+/g;
    const matches = content.match(commandRegex);

    if (matches) {
      const unique = [...new Set(matches)];
      related.push(...unique.map(cmd => cmd.substring(1))); // 去掉斜杠
    }

    return related;
  }
}

module.exports = MarkdownParser;