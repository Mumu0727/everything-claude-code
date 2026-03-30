#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class CommandTranslator {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../..');
    this.commandsDir = path.join(this.projectRoot, 'commands');
    this.agentsDir = path.join(this.projectRoot, 'agents');
    this.skillsDir = path.join(this.projectRoot, 'skills');
    this.i18nDir = path.resolve(__dirname, '../i18n');
    this.translationsFile = path.join(this.i18nDir, 'translations.json');
    this.initDirectories();
  }

  initDirectories() {
    if (!fs.existsSync(this.i18nDir)) {
      fs.mkdirSync(this.i18nDir, { recursive: true });
    }

    const commandsI18nDir = path.join(this.i18nDir, 'commands');
    if (!fs.existsSync(commandsI18nDir)) {
      fs.mkdirSync(commandsI18nDir, { recursive: true });
    }

    const agentsI18nDir = path.join(this.i18nDir, 'agents');
    if (!fs.existsSync(agentsI18nDir)) {
      fs.mkdirSync(agentsI18nDir, { recursive: true });
    }

    const skillsI18nDir = path.join(this.i18nDir, 'skills');
    if (!fs.existsSync(skillsI18nDir)) {
      fs.mkdirSync(skillsI18nDir, { recursive: true });
    }
  }

  // 检查翻译状态
  checkStatus() {
    const commandFiles = this.scanCommandFiles();
    const agentFiles = this.scanAgentFiles();
    const skillFiles = this.scanSkillFiles();
    const translations = this.loadExistingTranslations();

    let needsTranslation = 0;
    let upToDate = 0;

    // 检查命令文件
    for (const filePath of commandFiles) {
      const fileName = path.basename(filePath, '.md');
      const content = fs.readFileSync(filePath, 'utf8');
      const contentHash = crypto.createHash('md5').update(content).digest('hex');

      const existingTranslation = this.loadCommandTranslation(fileName);

      if (!existingTranslation || existingTranslation.sourceHash !== contentHash) {
        needsTranslation++;
      } else {
        upToDate++;
      }
    }

    // 检查代理文件
    for (const filePath of agentFiles) {
      const fileName = path.basename(filePath, '.md');
      const content = fs.readFileSync(filePath, 'utf8');
      const contentHash = crypto.createHash('md5').update(content).digest('hex');

      const existingTranslation = this.loadAgentTranslation(fileName);

      if (!existingTranslation || existingTranslation.sourceHash !== contentHash) {
        needsTranslation++;
      } else {
        upToDate++;
      }
    }

    // 检查技能文件
    for (const skillFile of skillFiles) {
      const content = fs.readFileSync(skillFile.path, 'utf8');
      const contentHash = crypto.createHash('md5').update(content).digest('hex');

      const existingTranslation = this.loadSkillTranslation(skillFile.name);

      if (!existingTranslation || existingTranslation.sourceHash !== contentHash) {
        needsTranslation++;
      } else {
        upToDate++;
      }
    }

    return {
      needsTranslation: needsTranslation > 0,
      outdatedCount: needsTranslation,
      upToDateCount: upToDate,
      totalCount: commandFiles.length + agentFiles.length + skillFiles.length,
      commands: commandFiles.length,
      agents: agentFiles.length,
      skills: skillFiles.length
    };
  }

  // 扫描命令文件
  scanCommandFiles() {
    if (!fs.existsSync(this.commandsDir)) {
      return [];
    }

    return fs.readdirSync(this.commandsDir)
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(this.commandsDir, file));
  }

  // 扫描代理文件
  scanAgentFiles() {
    if (!fs.existsSync(this.agentsDir)) {
      return [];
    }

    return fs.readdirSync(this.agentsDir)
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(this.agentsDir, file));
  }

  // 扫描技能文件
  scanSkillFiles() {
    if (!fs.existsSync(this.skillsDir)) {
      return [];
    }

    const skillFiles = [];
    const skillDirs = fs.readdirSync(this.skillsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const skillDir of skillDirs) {
      const skillFilePath = path.join(this.skillsDir, skillDir, 'SKILL.md');
      if (fs.existsSync(skillFilePath)) {
        skillFiles.push({ path: skillFilePath, name: skillDir });
      }
    }

    return skillFiles;
  }

  // 加载现有翻译
  loadExistingTranslations() {
    if (fs.existsSync(this.translationsFile)) {
      return JSON.parse(fs.readFileSync(this.translationsFile, 'utf8'));
    }
    return { commands: {}, agents: {}, skills: {}, lastGenerated: null };
  }

  // 加载单个命令翻译
  loadCommandTranslation(fileName) {
    const filePath = path.join(this.i18nDir, 'commands', `${fileName}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return null;
  }

  // 加载单个代理翻译
  loadAgentTranslation(fileName) {
    const filePath = path.join(this.i18nDir, 'agents', `${fileName}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return null;
  }

  // 保存命令翻译
  saveCommandTranslation(fileName, data) {
    const filePath = path.join(this.i18nDir, 'commands', `${fileName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  // 保存代理翻译
  saveAgentTranslation(fileName, data) {
    const filePath = path.join(this.i18nDir, 'agents', `${fileName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  // 加载单个技能翻译
  loadSkillTranslation(fileName) {
    const filePath = path.join(this.i18nDir, 'skills', `${fileName}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return null;
  }

  // 保存技能翻译
  saveSkillTranslation(fileName, data) {
    const filePath = path.join(this.i18nDir, 'skills', `${fileName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  // 保存翻译索引
  saveTranslations(translations) {
    translations.lastGenerated = new Date().toISOString();
    translations.totalCommands = Object.keys(translations.commands || {}).length;
    translations.totalAgents = Object.keys(translations.agents || {}).length;
    translations.totalSkills = Object.keys(translations.skills || {}).length;
    fs.writeFileSync(this.translationsFile, JSON.stringify(translations, null, 2), 'utf8');
  }

  // 解析Markdown frontmatter和内容
  parseMarkdownFrontmatter(content) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    let description = '';
    let title = '';

    if (match) {
      // 有frontmatter的情况
      const frontmatter = match[1];
      const body = match[2];

      // 简单解析description
      const descriptionMatch = frontmatter.match(/description:\s*(.+)/);
      description = descriptionMatch ? descriptionMatch[1].trim() : '';

      // 提取标题
      const titleMatch = body.match(/^#\s+(.+)/m);
      title = titleMatch ? titleMatch[1].trim() : '';

      // 如果frontmatter中没有description，尝试从内容中提取
      if (!description) {
        description = this.extractDescriptionFromContent(body);
      }
    } else {
      // 没有frontmatter的情况，直接解析内容
      const titleMatch = content.match(/^#\s+(.+)/m);
      title = titleMatch ? titleMatch[1].trim() : '';

      description = this.extractDescriptionFromContent(content);
    }

    return { description, title };
  }

  // 从内容中提取描述
  extractDescriptionFromContent(content) {
    // 提取第一个段落作为描述
    const lines = content.split('\n');
    let description = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 跳过标题行
      if (line.startsWith('#')) {
        continue;
      }

      // 跳过空行
      if (!line) {
        continue;
      }

      // 跳过表格、代码块等
      if (line.startsWith('|') || line.startsWith('```') || line.startsWith('- ')) {
        continue;
      }

      // 找到第一个有效的描述段落
      if (line.length > 10) { // 确保不是太短的行
        description = line;
        break;
      }
    }

    return description;
  }

  // 使用AI翻译文本
  async translateText(text, context = '') {
    if (!text || text.trim() === '') {
      return '';
    }

    // 首先检查是否有预定义的高质量翻译
    const exactTranslation = this.getExactTranslation(text, context);
    if (exactTranslation) {
      return exactTranslation;
    }

    // 尝试调用Claude API进行翻译
    try {
      const aiTranslation = await this.callClaudeAPI(text, context);
      if (aiTranslation && aiTranslation !== text) {
        return aiTranslation;
      }
    } catch (error) {
      console.warn(`AI翻译失败: ${error.message}，使用专家翻译模拟`);
    }

    // 无论是否有API密钥，都尝试使用专家翻译模拟
    const expertTranslation = await this.simulateExpertTranslation(text, context);
    if (expertTranslation && expertTranslation !== text) {
      return expertTranslation;
    }

    // 最后回退到智能规则翻译
    return this.smartTranslate(text, context);
  }

  // 获取精确翻译映射
  getExactTranslation(text, context = '') {
    const exactTranslations = {
      // 高质量的精确翻译映射
      'Answer a quick side question without interrupting or losing context from the current task. Resume work automatically after answering.':
        '在不中断当前任务的情况下快速回答问题，保持工作上下文，回答后自动恢复工作',

      'Incrementally fix build and type errors with minimal, safe changes.':
        '通过最小、安全的变更增量式修复构建和类型错误',

      'Look up current documentation for a library or topic via Context7.':
        '通过Context7查找库或主题的最新文档',

      'Comprehensive security and quality review of uncommitted changes:':
        '对未提交变更进行全面的安全性和质量审查',

      'Generate and run end-to-end tests with Playwright. Creates test journeys, runs tests, captures screenshots/videos/traces, and uploads artifacts.':
        '使用Playwright生成并运行端到端测试。创建测试流程，运行测试，捕获截图/视频/跟踪，并上传测试工件',

      'Restate requirements, assess risks, and create step-by-step implementation plan. WAIT for user CONFIRM before touching any code.':
        '重申需求，评估风险，创建逐步实施计划。在修改任何代码前等待用户确认',

      'Enforce test-driven development workflow. Scaffold interfaces, generate tests FIRST, then implement minimal code to pass. Ensure 80%+ coverage.':
        '强制执行测试驱动开发工作流。构建接口架构，首先生成测试，然后实现通过测试的最少代码。确保80%以上的覆盖率',

      'Load the most recent session file from ~/.claude/sessions/ and resume work with full context from where the last session ended.':
        '从 ~/.claude/sessions/ 加载最新的会话文件，并从上次会话结束的地方恢复工作，保持完整上下文',

      'Save current session state to a dated file in ~/.claude/sessions/ so work can be resumed in a future session with full context.':
        '将当前会话状态保存到 ~/.claude/sessions/ 中的带日期文件，以便在未来会话中恢复工作并保持完整上下文',

      // 专家级整句翻译映射（从simulateExpertTranslation移过来）
      'Analyze instincts and suggest or generate evolved structures':
        '分析智能模式并建议或生成优化结构',

      'Import instincts from file or URL into project/global scope':
        '从文件或URL导入智能模式到项目或全局作用域',

      'Show learned instincts (project + global) with confidence levels':
        '显示已学习的智能模式（项目+全局）及其置信度',

      'Extract reusable patterns from the session, self-evaluate quality before saving, and determine the right save location (Global vs Project).':
        '从会话中提取可复用模式，保存前进行质量自评估，并确定合适的保存位置（全局或项目）',

      '"Extract reusable patterns from the session, self-evaluate quality before saving, and determine the right save location (Global vs Project)."':
        '从会话中提取可复用模式，保存前进行质量自评估，并确定合适的保存位置（全局或项目）',

      'Analyze the current session and extract any patterns worth saving as skills.':
        '分析当前会话并提取值得保存为技能的模式',

      'Frontend-focused workflow (Research → Ideation → Plan → Execute → Optimize → Review), Gemini-led.':
        '前端专注工作流（研究 → 构思 → 计划 → 执行 → 优化 → 审查），由Gemini主导',

      'Multi-model collaborative planning - Context retrieval + Dual-model analysis → Generate step-by-step implementation plan.':
        '多模型协作规划 - 上下文检索 + 双模型分析 → 生成逐步实施计划',

      'List known projects and their instinct statistics':
        '列出已知项目及其智能模式统计信息',

      'Promote project-scoped instincts to global scope':
        '将项目范围的智能模式提升到全局范围',

      'Analyze a draft prompt and output an optimized, ECC-enriched version ready to paste and run. Does NOT execute the task — outputs advisory analysis only.':
        '分析草稿提示并输出优化的、ECC增强版本，可直接粘贴运行。不执行任务 — 仅输出建议性分析',

      'Run the ECC quality pipeline on demand for a file or project scope.':
        '按需对文件或项目范围运行ECC质量流水线',

      'Safely identify and remove dead code with test verification at every step.':
        '安全识别并移除死代码，每步都进行测试验证',

      'Analyze local git history to extract coding patterns and generate SKILL.md files. Local version of the Skill Creator GitHub App.':
        '分析本地git历史以提取编码模式并生成SKILL.md文件。Skill Creator GitHub应用的本地版本',

      'Analyze test coverage, identify gaps, and generate missing tests to reach 80%+ coverage.':
        '分析测试覆盖率，识别缺口，并生成缺失的测试以达到80%以上覆盖率',

      'Analyze the codebase structure and generate token-lean architecture documentation.':
        '分析代码库结构并生成精简的架构文档',

      'Sync documentation with the codebase, generating from source-of-truth files.':
        '将文档与代码库同步，从权威源文件生成文档',

      'Run comprehensive verification on current codebase state.':
        '对当前代码库状态进行全面验证',

      'Manage eval-driven development workflow.':
        '管理评估驱动的开发工作流',

      // Agents 描述翻译
      'Build and TypeScript error resolution specialist. Use PROACTIVELY when build fails or type errors occur. Fixes build/type errors only with minimal diffs, no architectural edits. Focuses on getting the build green quickly.':
        '构建和TypeScript错误解决专家。在构建失败或类型错误发生时主动使用。仅通过最小差异修复构建/类型错误，不进行架构编辑。专注于快速让构建通过',

      'Expert code review specialist. Proactively reviews code for quality, security, and maintainability. Use immediately after writing or modifying code. MUST BE USED for all code changes.':
        '专业代码审查专家。主动审查代码的质量、安全性和可维护性。在编写或修改代码后立即使用。所有代码更改都必须使用',

      'Documentation and codemap specialist. Use PROACTIVELY for updating codemaps and documentation. Runs /update-codemaps and /update-docs, generates docs/CODEMAPS/*, updates READMEs and guides.':
        '文档和代码图谱专家。主动用于更新代码图谱和文档。运行/update-codemaps和/update-docs，生成docs/CODEMAPS/*，更新README和指南',

      'When the user asks how to use a library, framework, or API or needs up-to-date code examples, use Context7 MCP to fetch current documentation and return answers with examples. Invoke for docs/API/setup questions.':
        '当用户询问如何使用库、框架或API，或需要最新代码示例时，使用Context7 MCP获取当前文档并返回带示例的答案。用于文档/API/设置问题',

      'End-to-end testing specialist using Vercel Agent Browser (preferred) with Playwright fallback. Use PROACTIVELY for generating, maintaining, and running E2E tests. Manages test journeys, quarantines flaky tests, uploads artifacts (screenshots, videos, traces), and ensures critical user flows work.':
        '端到端测试专家，使用Vercel Agent Browser（首选）和Playwright备用。主动用于生成、维护和运行E2E测试。管理测试流程，隔离不稳定测试，上传工件（截图、视频、跟踪），确保关键用户流程正常工作',

      'Use this agent when the user presents a complex task or project that needs to be broken down into manageable steps and documented for review.':
        '当用户提出需要分解为可管理步骤并记录以供审查的复杂任务或项目时使用此代理',

      'Dead code cleanup and consolidation specialist. Use PROACTIVELY for removing unused code, duplicates, and refactoring. Runs analysis tools (knip, depcheck, ts-prune) to identify dead code and safely removes it.':
        '死代码清理和整合专家。主动用于删除未使用的代码、重复代码和重构。运行分析工具（knip、depcheck、ts-prune）识别死代码并安全删除',

      'Security vulnerability detection and remediation specialist. Use PROACTIVELY after writing code that handles user input, authentication, API endpoints, or sensitive data. Flags secrets, SSRF, injection, unsafe crypto, and OWASP Top 10 vulnerabilities.':
        '安全漏洞检测和修复专家。在编写处理用户输入、身份验证、API端点或敏感数据的代码后主动使用。标记密钥、SSRF、注入、不安全加密和OWASP前10名漏洞',

      'Test-Driven Development specialist enforcing write-tests-first methodology. Use PROACTIVELY when writing new features, fixing bugs, or refactoring code. Ensures 80%+ test coverage.':
        '测试驱动开发专家，强制执行测试优先方法。在编写新功能、修复错误或重构代码时主动使用。确保80%以上的测试覆盖率',

      'Software architecture specialist for system design, scalability, and technical decision-making. Use PROACTIVELY when planning new features, refactoring large systems, or making architectural decisions.':
        '软件架构专家，专注于系统设计、可扩展性和技术决策。在规划新功能、重构大型系统或做出架构决策时主动使用',

      '专业技术文档翻译专家，专注于软件开发和AI工具文档的中英文翻译':
        '专业技术文档翻译专家，专注于软件开发和AI工具文档的中英文翻译',

      // Agent 标题翻译
      'Build Error Resolver': '构建错误解决器',
      'Code Reviewer': '代码审查员',
      'Documentation Updater': '文档更新器',
      'Documentation Lookup': '文档查找器',
      'E2E Test Runner': '端到端测试运行器',
      'Implementation Planner': '实施规划器',
      'Refactor Cleaner': '重构清理器',
      'Security Reviewer': '安全审查员',
      'TDD Guide': 'TDD指导器',
      'Software Architect': '软件架构师',
      'Translation Expert - 技术文档翻译专家': '技术文档翻译专家',

      // 标题翻译
      'Aside Command': '旁白命令',
      'Build and Fix': '构建修复',
      'Code Review': '代码审查',
      'E2E Command': '端到端测试',
      'Plan Command': '计划命令',
      'TDD Command': 'TDD命令',
      'Resume Session Command': '恢复会话命令',
      'Save Session Command': '保存会话命令',
      'Web Interface Command': '网页界面命令',
      'Evolve Command': '智能模式演进命令',
      'Instinct Import Command': '智能模式导入命令',
      'Instinct Status Command': '智能模式状态命令',
      '/learn-eval - Extract, Evaluate, then Save': '/learn-eval - 提取、评估、保存',
      '/learn - Extract Reusable Patterns': '/learn - 提取可复用模式',

      // Skills 精确翻译映射
      'Use this skill when writing new features, fixing bugs, or refactoring code. Enforces test-driven development with 80%+ coverage including unit, integration, and E2E tests.':
        '编写新功能、修复错误或重构代码时使用此技能。强制执行测试驱动开发，确保80%以上的单元测试、集成测试和端到端测试覆盖率',

      'Frontend development patterns for React, Next.js, state management, performance optimization, and UI best practices.':
        'React、Vue和Angular应用的前端开发模式，包括状态管理、路由和组件架构',

      'REST API design patterns including resource naming, status codes, pagination, filtering, error responses, versioning, and rate limiting for production APIs.':
        'REST API设计模式，包括资源命名、状态码、分页、过滤、错误响应、版本控制和生产API的速率限制',

      'Use this skill when adding authentication, handling user input, working with secrets, creating API endpoints, or implementing payment/sensitive features. Provides comprehensive security checklist and patterns.':
        '在添加身份验证、处理用户输入、处理机密信息、创建API端点或实现支付/敏感功能时使用此技能。提供全面的安全检查清单和模式',

      'This skill ensures all code development follows TDD principles with comprehensive test coverage.':
        '此技能确保所有代码开发都遵循TDD原则，具有全面的测试覆盖率',

      'Modern frontend patterns for React, Next.js, and performant user interfaces.':
        'React、Next.js和高性能用户界面的现代前端模式',

      'Conventions and best practices for designing consistent, developer-friendly REST APIs.':
        '设计一致、开发者友好的REST API的约定和最佳实践',

      'This skill ensures all code follows security best practices and identifies potential vulnerabilities.':
        '此技能确保所有代码都遵循安全最佳实践并识别潜在漏洞',

      'Design and optimize AI agent action spaces, tool definitions, and observation formatting for higher completion rates.':
        '设计和优化AI代理行动空间、工具定义和观察格式以提高完成率',

      'Comprehensive Go code review for idiomatic patterns, error handling, concurrency, and performance optimization.':
        'Go语言代码全面审查，涵盖惯用模式、错误处理、并发和性能优化',

      'Python testing patterns using pytest, fixtures, mocking, and coverage analysis for robust test suites.':
        'Python测试模式，使用pytest、fixtures、模拟和覆盖率分析构建强健的测试套件',

      'Kotlin and Android/KMP code patterns including Coroutines, Compose, clean architecture, and testing strategies.':
        'Kotlin和Android/KMP代码模式，包括协程、Compose、清洁架构和测试策略',

      'SwiftUI patterns for iOS development including state management, navigation, data flow, and performance optimization.':
        'iOS开发的SwiftUI模式，包括状态管理、导航、数据流和性能优化',

      'Docker containerization patterns for development, production deployments, multi-stage builds, and orchestration strategies.':
        'Docker容器化模式，用于开发、生产部署、多阶段构建和编排策略',

      'PostgreSQL patterns for schema design, query optimization, indexing strategies, and performance monitoring.':
        'PostgreSQL模式，用于模式设计、查询优化、索引策略和性能监控',

      'Comprehensive Rust code review for ownership, lifetimes, error handling, performance, and idiomatic patterns.':
        'Rust代码全面审查，涵盖所有权、生命周期、错误处理、性能和惯用模式',

      'Clean Architecture patterns for Android development with MVVM, dependency injection, and modular design.':
        'Android开发的清洁架构模式，采用MVVM、依赖注入和模块化设计',

      'End-to-end testing patterns using Playwright, Page Object Models, test data management, and CI/CD integration.':
        '端到端测试模式，使用Playwright、页面对象模型、测试数据管理和CI/CD集成',

      'Formal evaluation framework for Claude Code workflows, measuring completion rates, quality metrics, and performance benchmarks.':
        'Claude Code工作流的正式评估框架，测量完成率、质量指标和性能基准',

      // Skills 标题翻译
      'Test-Driven Development Workflow': '测试驱动开发工作流',
      'Frontend Development Patterns': '前端开发模式',
      'API Design Patterns': 'API设计模式',
      'Security Review Skill': '安全审查技能',
      'Agent Harness Construction': '代理工具构建',
      'Go Code Review': 'Go代码审查',
      'Python Testing': 'Python测试',
      'Kotlin Patterns': 'Kotlin模式',
      'SwiftUI Patterns': 'SwiftUI模式',
      'Docker Patterns': 'Docker模式',
      'PostgreSQL Patterns': 'PostgreSQL模式',
      'Rust Code Review': 'Rust代码审查',
      'Android Clean Architecture': 'Android清洁架构',
      'E2E Testing': '端到端测试',
      'Evaluation Framework': '评估框架',
      'Coding Standards': '编码标准',
      'Android Clean Architecture': 'Android清洁架构',
      'Kotlin Patterns': 'Kotlin模式',
      'SwiftUI Patterns': 'SwiftUI模式',
      'Agent Harness Construction': '代理工具构建',
      'Agentic Engineering': '代理工程',
      'AI-First Engineering': 'AI优先工程',
      'Frontend Slides': '前端幻灯片',
      'Go Patterns': 'Go模式',
      'Spring Boot Patterns': 'Spring Boot模式',
      'PostgreSQL Patterns': 'PostgreSQL模式',
      'Rust Patterns': 'Rust模式',
      'Laravel Patterns': 'Laravel模式',

      // 更多 Skills 精确翻译
      'Universal coding standards, best practices, and patterns for TypeScript, JavaScript, React, and Node.js development.':
        'TypeScript、JavaScript、React和Node.js开发的通用编码标准、最佳实践和模式',

      'Universal coding standards applicable across all projects.':
        '适用于所有项目的通用编码标准',

      'Clean Architecture patterns for Android and KMP projects. Covers module boundaries, dependency inversion, UseCase/Repository patterns, and data layer design with Room, SQLDelight, and Ktor.':
        'Android和KMP项目的清洁架构模式。涵盖模块边界、依赖反转、UseCase/Repository模式以及使用Room、SQLDelight和Ktor的数据层设计',

      'Clean Architecture patterns for Android and Kotlin Multiplatform projects — module structure, dependency rules, UseCases, Repositories, and data layer patterns.':
        'Android和Kotlin多平台项目的清洁架构模式——模块结构、依赖规则、用例、仓储和数据层模式',

      'Idiomatic Kotlin patterns, best practices, and conventions for building robust, efficient, and maintainable Kotlin applications with coroutines, null safety, and DSL builders.':
        'Kotlin惯用模式、最佳实践和约定，用于构建健壮、高效和可维护的Kotlin应用程序，包括协程、空安全和DSL构建器',

      'SwiftUI architecture patterns, state management with @Observable, view composition, navigation, performance optimization, and modern iOS/macOS UI best practices.':
        'SwiftUI架构模式，使用@Observable进行状态管理、视图组合、导航、性能优化以及现代iOS/macOS UI最佳实践',

      'Playwright E2E testing patterns, Page Object Model, configuration, CI/CD integration, artifact management, and flaky test strategies.':
        'Playwright端到端测试模式、页面对象模型、配置、CI/CD集成、工件管理和不稳定测试策略',

      'Design and optimize AI agent action spaces, tool definitions, and observation formatting for higher completion rates.':
        '设计和优化AI代理行动空间、工具定义和观察格式以提高完成率',

      'Operate as an agentic engineer using AI agents for implementation while maintaining human oversight for quality and risk management.':
        '作为代理工程师使用AI代理进行实施，同时保持人工监督以进行质量和风险管理',

      'Engineering operating model for teams shipping software with AI-assisted code generation, including workflows, quality gates, and governance patterns.':
        '使用AI辅助代码生成交付软件的团队工程运营模型，包括工作流程、质量门控和治理模式',

      'Regression testing strategies for AI-powered systems including prompt testing, model evaluation, and behavioral validation frameworks.':
        'AI驱动系统的回归测试策略，包括提示测试、模型评估和行为验证框架',

      'Create stunning, animation-rich HTML slides with reveal.js. Perfect for technical presentations, conference talks, and interactive demos.':
        '使用reveal.js创建令人惊叹的动画丰富的HTML幻灯片。非常适合技术演示、会议演讲和交互式演示',

      'Comprehensive Go code review covering idiomatic patterns, error handling, concurrency with goroutines and channels, and performance optimization.':
        'Go语言全面代码审查，涵盖惯用模式、错误处理、goroutines和channels并发以及性能优化',

      'Python patterns including PEP 8 standards, type hints, context managers, generators, decorators, and modern Python 3.12+ features.':
        'Python模式，包括PEP 8标准、类型提示、上下文管理器、生成器、装饰器和现代Python 3.12+功能',

      'Kotlin Coroutines and Flow patterns including structured concurrency, channel-based communication, state flows, and reactive programming paradigms.':
        'Kotlin协程和Flow模式，包括结构化并发、基于通道的通信、状态流和响应式编程范式',

      'Spring Boot architecture patterns, REST API design, dependency injection with Spring IoC, data access with Spring Data JPA, and microservices patterns.':
        'Spring Boot架构模式、REST API设计、Spring IoC依赖注入、Spring Data JPA数据访问和微服务模式',

      'PostgreSQL database patterns for schema design, query optimization, indexing strategies, performance tuning, and advanced features like JSONB and window functions.':
        'PostgreSQL数据库模式，用于架构设计、查询优化、索引策略、性能调优以及JSONB和窗口函数等高级功能',

      'Comprehensive Rust code review for ownership, lifetimes, error handling with Result types, performance optimization, and idiomatic Rust patterns.':
        'Rust代码全面审查，涵盖所有权、生命周期、Result类型错误处理、性能优化和Rust惯用模式',

      'Laravel architecture patterns including MVC structure, Eloquent ORM, service providers, middleware, queues, and modern PHP development practices.':
        'Laravel架构模式，包括MVC结构、Eloquent ORM、服务提供者、中间件、队列和现代PHP开发实践'
    };

    return exactTranslations[text] || null;
  }

  // 调用Claude API进行翻译
  async callClaudeAPI(text, context = '') {
    // 检查是否配置了API密钥
    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn('未配置Claude API密钥，跳过AI翻译');
      return null;
    }

    const contextHint = context === 'title' ? '这是一个命令标题' : '这是一个命令描述';

    const prompt = `你是一位专业的技术文档翻译专家，拥有多年软件开发和AI工具文档翻译经验。

请将以下英文${context === 'title' ? '标题' : '描述'}翻译成高质量的中文：

原文内容：
"${text}"

翻译要求：
1. **术语一致性**: 保持技术术语的准确性和统一性
   - Command → 命令, Tool → 工具, Agent → 代理, Workflow → 工作流
   - Instinct → 智能模式, Pattern → 模式, Coverage → 覆盖率
   - 保留专有名词：Claude Code、API、Git、TypeScript、JSON、Context7等

2. **语言自然性**:
   - 符合中文表达习惯
   - 语法结构正确流畅
   - 避免生硬的直译和中英文混杂

3. **技术准确性**:
   - 理解技术背景和使用场景
   - 保持功能描述的准确性
   - 确保技术概念不失真

4. **专业标准**:
   - 面向开发者用户群体
   - 保持简洁专业的表达
   - 统一翻译风格

${contextHint}，请直接输出翻译结果，不要包含解释或说明：`;

    try {
      // 模拟Claude API调用 - 实际使用时需要替换为真实的API调用
      const response = await this.simulateExpertTranslation(text, context);
      return response;
    } catch (error) {
      console.error('Claude API调用失败:', error.message);
      return null;
    }
  }

  // 模拟专家级翻译（实际使用时替换为真实API）
  async simulateExpertTranslation(text, context = '') {
    // 这是专家级翻译模拟，基于专业翻译原则

    // 专业术语映射表
    const expertTermMapping = {
      // 核心概念
      'instinct': '智能模式',
      'instincts': '智能模式',
      'pattern': '模式',
      'patterns': '模式',
      'skill': '技能',
      'skills': '技能',
      'agent': '代理',
      'agents': '代理',
      'workflow': '工作流',
      'session': '会话',
      'project': '项目',

      // 动作词
      'analyze': '分析',
      'generate': '生成',
      'extract': '提取',
      'import': '导入',
      'export': '导出',
      'promote': '提升',
      'evolve': '演进',
      'suggest': '建议',
      'create': '创建',
      'update': '更新',
      'review': '审查',
      'verify': '验证',
      'enforce': '执行',

      // 技术术语
      'coverage': '覆盖率',
      'quality': '质量',
      'security': '安全性',
      'documentation': '文档',
      'interface': '界面',
      'comprehensive': '全面的',
      'minimal': '最小',
      'safe': '安全',
      'incremental': '增量式',
      'end-to-end': '端到端',

      // 保持英文的术语
      'Claude Code': 'Claude Code',
      'API': 'API',
      'Git': 'Git',
      'TypeScript': 'TypeScript',
      'JSON': 'JSON',
      'Context7': 'Context7',
      'TDD': 'TDD',
      'Playwright': 'Playwright'
    };

    // 专家级整句翻译映射
    const expertSentenceMapping = {
      'Analyze instincts and suggest or generate evolved structures':
        '分析智能模式并建议或生成优化结构',

      'Import instincts from file or URL into project/global scope':
        '从文件或URL导入智能模式到项目或全局作用域',

      'Show learned instincts (project + global) with confidence levels':
        '显示已学习的智能模式（项目+全局）及其置信度',

      'Extract reusable patterns from the session, self-evaluate quality before saving, and determine the right save location (Global vs Project).':
        '从会话中提取可复用模式，保存前进行质量自评估，并确定合适的保存位置（全局或项目）',

      '"Extract reusable patterns from the session, self-evaluate quality before saving, and determine the right save location (Global vs Project)."':
        '从会话中提取可复用模式，保存前进行质量自评估，并确定合适的保存位置（全局或项目）',

      'Analyze the current session and extract any patterns worth saving as skills.':
        '分析当前会话并提取值得保存为技能的模式',

      'Frontend-focused workflow (Research → Ideation → Plan → Execute → Optimize → Review), Gemini-led.':
        '前端专注工作流（研究 → 构思 → 计划 → 执行 → 优化 → 审查），由Gemini主导',

      'Multi-model collaborative planning - Context retrieval + Dual-model analysis → Generate step-by-step implementation plan.':
        '多模型协作规划 - 上下文检索 + 双模型分析 → 生成逐步实施计划',

      'List known projects and their instinct statistics':
        '列出已知项目及其智能模式统计信息',

      'Promote project-scoped instincts to global scope':
        '将项目范围的智能模式提升到全局范围',

      'Analyze a draft prompt and output an optimized, ECC-enriched version ready to paste and run. Does NOT execute the task — outputs advisory analysis only.':
        '分析草稿提示并输出优化的、ECC增强版本，可直接粘贴运行。不执行任务 — 仅输出建议性分析',

      'Run the ECC quality pipeline on demand for a file or project scope.':
        '按需对文件或项目范围运行ECC质量流水线',

      'Safely identify and remove dead code with test verification at every step.':
        '安全识别并移除死代码，每步都进行测试验证',

      'Analyze local git history to extract coding patterns and generate SKILL.md files. Local version of the Skill Creator GitHub App.':
        '分析本地git历史以提取编码模式并生成SKILL.md文件。Skill Creator GitHub应用的本地版本',

      'Analyze test coverage, identify gaps, and generate missing tests to reach 80%+ coverage.':
        '分析测试覆盖率，识别缺口，并生成缺失的测试以达到80%以上覆盖率',

      'Analyze the codebase structure and generate token-lean architecture documentation.':
        '分析代码库结构并生成精简的架构文档',

      'Sync documentation with the codebase, generating from source-of-truth files.':
        '将文档与代码库同步，从权威源文件生成文档',

      'Run comprehensive verification on current codebase state.':
        '对当前代码库状态进行全面验证',

      'Manage eval-driven development workflow.':
        '管理评估驱动的开发工作流'
    };

    // 首先检查是否有整句映射
    if (expertSentenceMapping[text]) {
      return expertSentenceMapping[text];
    }

    // 应用专家级术语翻译
    let translated = text;
    for (const [english, chinese] of Object.entries(expertTermMapping)) {
      const regex = new RegExp(`\\b${english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      translated = translated.replace(regex, chinese);
    }

    // 处理常见句型结构
    translated = translated
      .replace(/^Incrementally (.+) with (.+)$/i, (match, p1, p2) => `通过${p2}增量式${p1}`)
      .replace(/^(.+) for (.+) via (.+)$/i, (match, p1, p2, p3) => `通过${p3}为${p2}提供${p1}`)
      .replace(/^Generate and run (.+) with (.+)$/i, (match, p1, p2) => `使用${p2}生成并运行${p1}`)
      .replace(/^Comprehensive (.+) of (.+)$/i, (match, p1, p2) => `对${p2}进行全面的${p1}`)
      .replace(/^(.+) and (.+) (.+)$/i, (match, p1, p2, p3) => `${p1}和${p2}${p3}`)
      .replace(/\band\b/g, '和')
      .replace(/\bor\b/g, '或')
      .replace(/\bwith\b/g, '使用')
      .replace(/\bvia\b/g, '通过')
      .replace(/\bfrom\b/g, '从')
      .replace(/\binto\b/g, '到')
      .replace(/\bof\b/g, '的');

    // 清理多余空格和标点
    translated = translated
      .replace(/\s+/g, ' ')
      .replace(/\s+([，。、；：！？])/g, '$1')
      .trim();

    return translated;
  }

  // 高质量翻译函数
  getHighQualityTranslation(text) {
    // 基于pattern的高质量翻译
    const patterns = [
      {
        pattern: /^Incrementally (.+) with (.+)$/i,
        translate: (match) => `通过${this.translatePhrase(match[2])}增量式${this.translatePhrase(match[1])}`
      },
      {
        pattern: /^(.+) for (.+) via (.+)$/i,
        translate: (match) => `通过${this.translatePhrase(match[3])}为${this.translatePhrase(match[2])}提供${this.translatePhrase(match[1])}`
      },
      {
        pattern: /^Generate and run (.+) with (.+)$/i,
        translate: (match) => `使用${this.translatePhrase(match[2])}生成并运行${this.translatePhrase(match[1])}`
      },
      {
        pattern: /^Comprehensive (.+) of (.+)$/i,
        translate: (match) => `对${this.translatePhrase(match[2])}进行全面的${this.translatePhrase(match[1])}`
      },
      {
        pattern: /^(.+) and (.+) (.+)$/i,
        translate: (match) => `${this.translatePhrase(match[1])}和${this.translatePhrase(match[2])}${this.translatePhrase(match[3])}`
      }
    ];

    // 尝试pattern匹配
    for (const { pattern, translate } of patterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          return translate(match);
        } catch (error) {
          console.warn(`Pattern translation failed for: ${text}`);
        }
      }
    }

    // 回退到单词翻译
    return this.smartTranslate(text);
  }

  // 翻译短语
  translatePhrase(phrase) {
    if (!phrase) return '';

    const phraseTranslations = {
      'fix build and type errors': '修复构建和类型错误',
      'minimal, safe changes': '最小、安全的变更',
      'current documentation': '最新文档',
      'library or topic': '库或主题',
      'security and quality review': '安全性和质量审查',
      'uncommitted changes': '未提交的变更',
      'end-to-end tests': '端到端测试',
      'test journeys': '测试流程'
    };

    return phraseTranslations[phrase.toLowerCase()] || this.smartTranslate(phrase);
  }

  // 智能翻译函数（模拟AI翻译）
  smartTranslate(text, context = '') {
    if (!text || text.trim() === '') {
      return '';
    }

    // 这是一个临时的智能翻译实现
    // 实际使用时应该替换为真实的AI翻译API调用

    const translationRules = {
      // 常见技术术语保持英文或统一翻译
      'Claude Code': 'Claude Code',
      'TDD': 'TDD',
      'API': 'API',
      'Git': 'Git',
      'TypeScript': 'TypeScript',
      'Playwright': 'Playwright',
      'NPM': 'NPM',
      'JSON': 'JSON',
      'Markdown': 'Markdown',
      'YAML': 'YAML',
      'Context7': 'Context7',

      // 动作词翻译
      'Fix': '修复',
      'fix': '修复',
      'Build': '构建',
      'build': '构建',
      'Test': '测试',
      'test': '测试',
      'Review': '审查',
      'review': '审查',
      'Analyze': '分析',
      'analyze': '分析',
      'Generate': '生成',
      'generate': '生成',
      'Create': '创建',
      'create': '创建',
      'Update': '更新',
      'update': '更新',
      'Load': '加载',
      'load': '加载',
      'Save': '保存',
      'save': '保存',
      'Import': '导入',
      'import': '导入',
      'Export': '导出',
      'export': '导出',
      'List': '列出',
      'list': '列出',
      'Show': '显示',
      'show': '显示',
      'Check': '检查',
      'check': '检查',
      'Verify': '验证',
      'verify': '验证',
      'Enforce': '强制执行',
      'enforce': '强制执行',
      'Extract': '提取',
      'extract': '提取',
      'Promote': '提升',
      'promote': '提升',
      'Look up': '查找',
      'look up': '查找',

      // 名词翻译
      'Command': '命令',
      'command': '命令',
      'Tool': '工具',
      'tool': '工具',
      'Workflow': '工作流',
      'workflow': '工作流',
      'Pattern': '模式',
      'pattern': '模式',
      'Session': '会话',
      'session': '会话',
      'Project': '项目',
      'project': '项目',
      'Instinct': '本能',
      'instinct': '本能',
      'Skill': '技能',
      'skill': '技能',
      'Agent': '代理',
      'agent': '代理',
      'Documentation': '文档',
      'documentation': '文档',
      'Interface': '界面',
      'interface': '界面',
      'Quality': '质量',
      'quality': '质量',
      'Security': '安全性',
      'security': '安全性',
      'Performance': '性能',
      'performance': '性能',
      'Coverage': '覆盖率',
      'coverage': '覆盖率',
      'End-to-end': '端到端',
      'end-to-end': '端到端',
      'Frontend': '前端',
      'frontend': '前端',
      'Backend': '后端',
      'backend': '后端',
      'Library': '库',
      'library': '库',
      'Framework': '框架',
      'framework': '框架',
      'Current': '当前',
      'current': '当前',
      'Errors': '错误',
      'errors': '错误',
      'Changes': '变更',
      'changes': '变更',
      'Minimal': '最小化',
      'minimal': '最小化',
      'Quickly': '快速',
      'quickly': '快速',
      'Incrementally': '增量式',
      'incrementally': '增量式',
      'Maintainability': '可维护性',
      'maintainability': '可维护性'
    };

    let translated = text;

    // 应用翻译规则
    for (const [english, chinese] of Object.entries(translationRules)) {
      // 使用单词边界进行精确匹配
      const regex = new RegExp(`\\b${english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      translated = translated.replace(regex, chinese);
    }

    // 处理常见句型结构
    if (context === 'description') {
      // 处理一些特定的句型
      translated = translated
        .replace(/^Incrementally (.+) with (.+)$/i, '增量式$1，使用$2')
        .replace(/^(.+) and (.+) with (.+)$/i, '使用$3进行$1和$2')
        .replace(/^(.+) for (.+) via (.+)$/i, '通过$3为$2提供$1')
        .replace(/^(.+) and (.+)$/i, '$1和$2')
        .replace(/with (.+)$/i, '使用$1')
        .replace(/via (.+)$/i, '通过$1');
    }

    return translated;
  }

  // 获取回退翻译
  getFallbackTranslation(text) {
    // 如果智能翻译失败，使用预定义的回退翻译
    const fallbackMap = {
      'Answer a quick side question without interrupting or losing context from the current task. Resume work automatically after answering.':
        '在不中断当前任务的情况下快速回答问题，保持工作上下文，回答后自动恢复工作',
      'Fix build and TypeScript errors quickly with minimal changes':
        '快速修复构建和TypeScript错误，最小化代码变更',
      'Review code quality, security, and maintainability':
        '审查代码质量、安全性和可维护性',
      'Aside Command': '旁白命令',
      'Build Fix': '构建修复',
      'Code Review': '代码审查'
    };

    return fallbackMap[text] || text; // 如果没有预定义翻译，返回原文
  }

  // 检测分类
  detectCategory(content, fileName) {
    const lowerContent = content.toLowerCase();
    const lowerFileName = fileName.toLowerCase();

    const categories = {
      '测试工具': ['test', 'tdd', 'coverage', 'e2e', 'quality'],
      '构建工具': ['build', 'fix', 'compile'],
      '规划工具': ['plan', 'design', 'architect'],
      '代码质量': ['review', 'quality', 'verify', 'lint'],
      '文档工具': ['doc', 'documentation', 'update-docs', 'codemaps'],
      '重构工具': ['refactor', 'clean'],
      '学习工具': ['learn', 'evolve', 'instinct', 'skill'],
      '会话管理': ['session', 'save', 'resume'],
      '前端工具': ['frontend', 'web'],
      '通用工具': ['aside', 'eval', 'prompt']
    };

    // 首先检查文件名
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerFileName.includes(keyword))) {
        return category;
      }
    }

    // 然后检查内容
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        return category;
      }
    }

    return '通用工具';
  }

  // 检测技能分类
  detectSkillCategory(content, fileName) {
    const lowerContent = content.toLowerCase();
    const lowerFileName = fileName.toLowerCase();

    const skillCategories = {
      '测试技能': ['tdd', 'test', 'testing', 'coverage', 'e2e', 'playwright', 'jest', 'regression'],
      '前端技能': ['frontend', 'react', 'vue', 'angular', 'ui', 'ux', 'css', 'html', 'javascript', 'typescript', 'nextjs', 'compose'],
      '后端技能': ['backend', 'api', 'server', 'database', 'postgres', 'mysql', 'redis', 'mongodb', 'django', 'laravel', 'springboot'],
      '移动开发': ['android', 'ios', 'mobile', 'kotlin', 'swift', 'flutter', 'react-native'],
      '架构设计': ['architecture', 'design', 'patterns', 'system', 'scalability', 'microservices', 'deployment'],
      '开发工具': ['docker', 'kubernetes', 'ci', 'cd', 'pipeline', 'build', 'deployment', 'git', 'github'],
      '编程语言': ['python', 'java', 'golang', 'go', 'rust', 'cpp', 'c++', 'javascript', 'typescript', 'kotlin', 'swift', 'php', 'perl'],
      '数据处理': ['data', 'analytics', 'ml', 'ai', 'machine-learning', 'clickhouse', 'etl', 'pipeline'],
      '安全技能': ['security', 'vulnerability', 'auth', 'authentication', 'encryption', 'compliance'],
      '文档技能': ['documentation', 'writing', 'article', 'guide', 'tutorial', 'content'],
      '业务技能': ['business', 'market', 'research', 'analysis', 'procurement', 'logistics', 'inventory'],
      '质量保证': ['quality', 'review', 'verification', 'validation', 'standards', 'best-practices'],
      '学习技能': ['learning', 'continuous', 'skill', 'instinct', 'pattern', 'evolution'],
      '自动化技能': ['automation', 'agent', 'autonomous', 'orchestration', 'workflow', 'harness']
    };

    // 首先检查文件名
    for (const [category, keywords] of Object.entries(skillCategories)) {
      if (keywords.some(keyword => lowerFileName.includes(keyword))) {
        return category;
      }
    }

    // 然后检查内容前200个字符
    const contentPreview = lowerContent.substring(0, 500);
    for (const [category, keywords] of Object.entries(skillCategories)) {
      if (keywords.some(keyword => contentPreview.includes(keyword))) {
        return category;
      }
    }

    return '通用技能';
  }

  // 检测代理分类
  detectAgentCategory(content, fileName) {
    const lowerContent = content.toLowerCase();
    const lowerFileName = fileName.toLowerCase();

    const agentCategories = {
      '构建专家': ['build', 'error', 'resolver', 'typescript', 'compilation'],
      '代码质量': ['review', 'reviewer', 'quality', 'security', 'maintainability'],
      '测试专家': ['tdd', 'test', 'testing', 'coverage', 'e2e', 'end-to-end'],
      '文档专家': ['doc', 'documentation', 'updater', 'lookup', 'codemaps'],
      '架构设计': ['architect', 'planner', 'planning', 'design', 'system'],
      '重构专家': ['refactor', 'cleaner', 'cleanup', 'dead code'],
      '安全专家': ['security', 'vulnerability', 'safety', 'secure'],
      '翻译专家': ['translation', 'translator', 'translate', '翻译'],
      '开发辅助': ['guide', 'specialist', 'helper', 'assistant']
    };

    // 首先检查文件名
    for (const [category, keywords] of Object.entries(agentCategories)) {
      if (keywords.some(keyword => lowerFileName.includes(keyword))) {
        return category;
      }
    }

    // 然后检查内容
    for (const [category, keywords] of Object.entries(agentCategories)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        return category;
      }
    }

    return '开发辅助';
  }

  // 翻译单个命令
  async translateSingleCommand(filePath, translations) {
    const fileName = path.basename(filePath, '.md');
    const content = fs.readFileSync(filePath, 'utf8');
    const contentHash = crypto.createHash('md5').update(content).digest('hex');

    // 检查是否需要重新翻译
    const existingTranslation = this.loadCommandTranslation(fileName);
    if (existingTranslation && existingTranslation.sourceHash === contentHash) {
      console.log(`⏭️  跳过命令 ${fileName} (未修改)`);
      // 确保索引中有数据
      if (!translations.commands[fileName]) {
        translations.commands[fileName] = {
          description: existingTranslation.translatedDescription,
          title: existingTranslation.translatedTitle,
          category: this.detectCategory(content, fileName)
        };
      }
      return;
    }

    console.log(`📝 翻译命令 ${fileName}...`);

    // 解析内容
    const { description, title } = this.parseMarkdownFrontmatter(content);

    // 翻译
    const translatedDescription = await this.translateText(description, 'description');
    const translatedTitle = await this.translateText(title, 'title');

    // 保存翻译结果
    const translationData = {
      fileName,
      originalDescription: description,
      translatedDescription,
      originalTitle: title,
      translatedTitle,
      lastUpdated: new Date().toISOString(),
      sourceHash: contentHash
    };

    this.saveCommandTranslation(fileName, translationData);

    // 更新索引
    translations.commands[fileName] = {
      description: translatedDescription,
      title: translatedTitle,
      category: this.detectCategory(content, fileName)
    };
  }

  // 翻译单个代理
  async translateSingleAgent(filePath, translations) {
    const fileName = path.basename(filePath, '.md');
    const content = fs.readFileSync(filePath, 'utf8');
    const contentHash = crypto.createHash('md5').update(content).digest('hex');

    // 检查是否需要重新翻译
    const existingTranslation = this.loadAgentTranslation(fileName);
    if (existingTranslation && existingTranslation.sourceHash === contentHash) {
      console.log(`⏭️  跳过代理 ${fileName} (未修改)`);
      // 确保索引中有数据
      if (!translations.agents[fileName]) {
        translations.agents[fileName] = {
          description: existingTranslation.translatedDescription,
          title: existingTranslation.translatedTitle,
          category: this.detectAgentCategory(content, fileName)
        };
      }
      return;
    }

    console.log(`📝 翻译代理 ${fileName}...`);

    // 解析内容
    const { description, title } = this.parseMarkdownFrontmatter(content);

    // 翻译
    const translatedDescription = await this.translateText(description, 'description');
    const translatedTitle = await this.translateText(title, 'title');

    // 保存翻译结果
    const translationData = {
      fileName,
      originalDescription: description,
      translatedDescription,
      originalTitle: title,
      translatedTitle,
      lastUpdated: new Date().toISOString(),
      sourceHash: contentHash
    };

    this.saveAgentTranslation(fileName, translationData);

    // 更新索引
    if (!translations.agents) {
      translations.agents = {};
    }
    translations.agents[fileName] = {
      description: translatedDescription,
      title: translatedTitle,
      category: this.detectAgentCategory(content, fileName)
    };
  }

  // 翻译单个技能
  async translateSingleSkill(skillFile, translations) {
    const fileName = skillFile.name;
    const filePath = skillFile.path;
    const content = fs.readFileSync(filePath, 'utf8');
    const contentHash = crypto.createHash('md5').update(content).digest('hex');

    // 检查是否需要重新翻译
    const existingTranslation = this.loadSkillTranslation(fileName);
    if (existingTranslation && existingTranslation.sourceHash === contentHash) {
      console.log(`⏭️  跳过技能 ${fileName} (未修改)`);
      // 确保索引中有数据
      if (!translations.skills[fileName]) {
        translations.skills[fileName] = {
          description: existingTranslation.translatedDescription,
          title: existingTranslation.translatedTitle,
          category: this.detectSkillCategory(content, fileName)
        };
      }
      return;
    }

    console.log(`🛠️  翻译技能 ${fileName}...`);

    // 解析内容
    const { description, title } = this.parseSkillContent(content);

    // 翻译
    const translatedDescription = await this.translateText(description, 'description');
    const translatedTitle = await this.translateText(title, 'title');

    // 保存翻译结果
    const translationData = {
      fileName,
      originalDescription: description,
      translatedDescription,
      originalTitle: title,
      translatedTitle,
      lastUpdated: new Date().toISOString(),
      sourceHash: contentHash
    };

    this.saveSkillTranslation(fileName, translationData);

    // 更新索引
    if (!translations.skills) {
      translations.skills = {};
    }
    translations.skills[fileName] = {
      description: translatedDescription,
      title: translatedTitle,
      category: this.detectSkillCategory(content, fileName)
    };
  }

  // 解析技能文件内容
  parseSkillContent(content) {
    const lines = content.split('\n');
    let title = '';
    let description = '';

    // 查找标题 (第一个 # 开头的行)
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }

    // 查找描述 (标题后的第一个段落)
    let foundTitle = false;
    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('#')) {
        if (!foundTitle) {
          foundTitle = true;
        }
        continue;
      }

      // 找到标题后的第一个非空行作为描述
      if (foundTitle && trimmed && !trimmed.startsWith('---') && !trimmed.startsWith('```')) {
        description = trimmed;
        break;
      }
    }

    // 如果没找到描述，尝试从 frontmatter 中获取
    const matter = require('gray-matter');
    try {
      const { data } = matter(content);
      if (!description && data.description) {
        description = data.description;
      }
      if (!title && data.name) {
        title = data.name;
      }
    } catch (e) {
      // 忽略解析错误
    }

    return {
      title: title || fileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: description || '暂无描述'
    };
  }

  // 翻译所有文件
  async translateAll() {
    console.log('🚀 开始翻译commands、agents和skills...');

    const commandFiles = this.scanCommandFiles();
    const agentFiles = this.scanAgentFiles();
    const skillFiles = this.scanSkillFiles();

    if (commandFiles.length === 0 && agentFiles.length === 0 && skillFiles.length === 0) {
      console.log('❌ 未找到commands、agents或skills文件');
      return;
    }

    const translations = this.loadExistingTranslations();

    // 翻译命令文件
    if (commandFiles.length > 0) {
      console.log(`📝 开始翻译 ${commandFiles.length} 个命令文件...`);
      for (const file of commandFiles) {
        await this.translateSingleCommand(file, translations);
      }
    }

    // 翻译代理文件
    if (agentFiles.length > 0) {
      console.log(`🤖 开始翻译 ${agentFiles.length} 个代理文件...`);
      for (const file of agentFiles) {
        await this.translateSingleAgent(file, translations);
      }
    }

    // 翻译技能文件
    if (skillFiles.length > 0) {
      console.log(`🛠️ 开始翻译 ${skillFiles.length} 个技能文件...`);
      for (const skillFile of skillFiles) {
        await this.translateSingleSkill(skillFile, translations);
      }
    }

    // 保存翻译索引
    this.saveTranslations(translations);

    console.log('✅ 翻译完成！');
    console.log(`📊 共处理 ${commandFiles.length} 个命令文件、${agentFiles.length} 个代理文件和 ${skillFiles.length} 个技能文件`);
    console.log(`📂 翻译文件保存在: ${this.i18nDir}`);

    // 显示统计信息
    const status = this.checkStatus();
    console.log(`📈 翻译统计: ${status.upToDateCount}/${status.totalCount} 已完成`);
  }
}

// CLI接口
async function main() {
  const translator = new CommandTranslator();

  const args = process.argv.slice(2);

  if (args.includes('--check') || args.includes('--status')) {
    const status = translator.checkStatus();
    console.log('📊 翻译状态:');
    console.log(`   总命令数: ${status.totalCount}`);
    console.log(`   需要翻译: ${status.outdatedCount}`);
    console.log(`   已是最新: ${status.upToDateCount}`);

    if (status.needsTranslation) {
      console.log('⚠️  有命令需要翻译');
      process.exit(1); // 有需要翻译的内容时返回非零退出码
    } else {
      console.log('✅ 所有翻译都是最新的');
      process.exit(0);
    }
  } else {
    try {
      await translator.translateAll();
      console.log('🎉 翻译任务完成');
    } catch (error) {
      console.error('❌ 翻译过程中发生错误:', error.message);
      process.exit(1);
    }
  }
}

// 导出供其他脚本使用
module.exports = {
  CommandTranslator,
  checkStatus: () => new CommandTranslator().checkStatus(),
  translateAll: () => new CommandTranslator().translateAll()
};

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}