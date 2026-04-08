# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 项目概述

J&T Claude Code (JTCC) 是一个**前端聚焦的 AI 编程助手** - 生产就绪的代理、技能、命令、钩子和 MCP 配置集合，专门为 React、Next.js 和 TypeScript 开发优化。

## 架构

项目组织为多个核心组件：

- **agents/** - 专用子代理用于委托（planner、tdd-guide、code-reviewer 等）
- **skills/** - 前端工作流定义和领域知识（React 模式、Next.js、测试）
- **commands/** - 用户调用的斜杠命令（/jtcc:plan、/jtcc:tdd、/jtcc:e2e 等）
- **hooks/** - 基于触器的自动化（会话持久化、工具前后钩子）
- **rules/** - 始终遵循的指导原则（安全、编码风格、测试要求）
- **mcp-configs/** - 前端集成的 MCP 服务器配置
- **scripts/** - 跨平台 Node.js 实用程序，用于安装和设置

## 核心命令

- `/jtcc:plan` - 创建实现计划
- `/jtcc:tdd` - 测试驱动开发工作流
- `/jtcc:code-review` - 质量审查
- `/jtcc:e2e` - E2E 测试生成和执行
- `/jtcc:refactor` - 死代码清理
- `/jtcc:multi` - 前端多服务编排

## OpenSpec 集成

JTCC 提供 OpenSpec CLI 集成用于结构化变更管理：

```bash
jtcc spec install     # 安装 openspec-cli
jtcc spec init        # 初始化项目 默认 claude code 通过参数配置 --tools
  # antigravity
  # auggie
  # claude
  # cline
  # codex
  # codebuddy
  # continue
  # costrict
  # crush
  # cursor
  # factory
  # gemini
  # github-copilot
  # iflow
  # kilocode
  # kiro
  # opencode
  # pi
  # qoder
  # qwen
  # roocode
  # trae
  # windsurf
jtcc spec list        # 列出所有变更
jtcc spec show <id>   # 显示变更详情
jtcc spec validate    # 校验变更格式
jtcc spec help        # 显示帮助
```

## 安装

```bash
# 全局安装
jtcc install

# 项目级安装
jtcc install --project

# 选择性安装
jtcc install skills:frontend-patterns
```

## 管理命令

```bash
# 查看已安装组件
jtcc list

# 显示 JTCC 状态信息
jtcc status

# 更新 JTCC 到最新版本
jtcc update
```

## 开发说明

- 包管理器检测：npm、pnpm、yarn、bun（可通过 `CLAUDE_PACKAGE_MANAGER` 环境变量或项目配置配置）
- 跨平台：通过 Node.js 脚本支持 Windows、macOS、Linux
- 代理格式：带有 YAML frontmatter 的 Markdown（name、description、tools、model）
- 技能格式：带有清晰章节的 Markdown（使用时机、工作原理、示例）
- 钩子格式：带有匹配器条件和命令/通知钩子的 JSON
- OpenSpec 集成：openspec-cli 的 Bash 命令透传

## 前端聚焦

此插件专为以下内容优化：
- **React 和 Next.js** - 组件模式、钩子、状态管理
- **TypeScript/JavaScript** - 类型安全、现代 JS 特性
- **测试** - 使用 Playwright 的 TDD、E2E 测试
- **前端工具** - Turbopack、构建优化
- **代码质量** - Linting、格式化、安全审查

## 贡献

遵循 CONTRIBUTING.md 中的格式：
- 代理：带有 frontmatter 的 Markdown（name、description、tools、model）
- 技能：清晰章节（使用时机、工作原理、示例）
- 命令：带有描述 frontmatter 的 Markdown
- 钩子：带有匹配器和 hooks 数组的 JSON

文件命名：小写字母加连字符（如 `code-reviewer.md`、`tdd-workflow.md`）
