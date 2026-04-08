# J&T Claude Code (JTCC) - 前端聚焦重构提案

## 概述

将 Everything Claude Code (ECC) 重构为 J&T Claude Code (JTCC)，聚焦于前端开发能力。保留核心前端相关的 agents、skills 和 commands，移除后端、多语言支持和其他非前端功能。集成 OpenSpec 工作流，并提供 `jtcc spec` 命令作为 OpenSpec CLI 的接口。

## 背景

Everything Claude Code 是一个包含 50K+ stars 的庞大插件，包含：
- 25+ agents（多种语言和专业方向）
- 108+ skills（覆盖前端、后端、多语言、内容创作等）
- 57+ commands（构建、测试、代码审查、多模型协作等）
- OpenSpec 集成（opsx:explore, opsx:propose 等）

对于 J&T 团队来说，ECC 包含大量不相关的能力，导致：
- 配置臃肿，难以维护
- 命令命名不够直观
- 缺少针对性的前端最佳实践指导
- OpenSpec 集成命令未充分利用

## 目标

### 主要目标

1. **精简为前端聚焦**：只保留 React、Next.js、TypeScript 相关的能力
2. **统一命令命名**：所有命令使用 `/jtcc:*` 或 `/jtcc spec *` 格式
3. **深度集成 OpenSpec**：提供 `jtcc spec` 命令作为 OpenSpec CLI 的 passthrough
4. **保持高质量**：保留 ECC 中经过实战验证的前端最佳实践
5. **一键安装**：提供 `npx jtcc` 命令，支持全局安装或项目级安装

### 次要目标

- 简化文档和 README，聚焦前端场景
- 移除多平台适配（Cursor、Codex、OpenCode）
- 保留核心 hooks 和 rules（前端相关）
- 提供清晰的前端工作流指导

## 变更范围

> **重要**: 此变更不修改 `.claude/` 和 `openspec/` 目录，这两个是 OpenSpec CLI 的生成目录。只修改 ECC 项目文件（根目录的 agents/, skills/, commands/, rules/, hooks/ 等）。

### 保留的内容

#### Skills (8 个)

| Skill | 描述 |
|-------|--------|
| `frontend-patterns` | React, Next.js 模式和最佳实践 |
| `frontend-slides` | HTML 演示文稿生成 |
| `tdd-workflow` | TDD 工作流 |
| `e2e-testing` | Playwright E2E 测试 |
| `nextjs-turbopack` | Next.js Turbopack 优化 |
| `coding-standards` | 通用编码规范 |
| `search-first` | 研究优先工作流 |

#### Agents (7 个)

| Agent | 描述 |
|-------|--------|
| `planner` | 功能规划和实现计划 |
| `tdd-guide` | TDD 开发指导 |
| `code-reviewer` | 代码质量审查 |
| `architect` | 系统设计决策 |
| `security-reviewer` | 安全漏洞审查 |
| `e2e-runner` | E2E 测试执行 |
| `refactor-cleaner` | 死代码清理 |

#### Commands (6 个重命名)

| 原命令 | 新命令 | 描述 |
|---------|---------|--------|
| `plan.md` | `/jtcc:plan` | 创建实现计划 |
| `tdd.md` | `/jtcc:tdd` | TDD 工作流 |
| `code-review.md` | `/jtcc:code-review` | 代码审查 |
| `e2e.md` | `/jtcc:e2e` | E2E 测试生成 |
| `refactor-clean.md` | `/jtcc:refactor` | 死代码清理 |
| `multi-frontend.md` | `/jtcc:multi` | 前端多服务编排 |

#### OpenSpec CLI 集成 (Bash 命令行方式)

| 命令 | OpenSpec CLI |
|-------|-------------|
| `jtcc spec install` | npm install -g openspec-cli |
| `jtcc spec init` | openspec openspec init |
| `jtcc spec list` | openspec list --json |
| `jtcc spec show <id>` | openspec show |
| `jtcc spec validate <id>` | openspec validate |
| `jtcc spec help` | openspec help |

#### Rules

- `rules/common/` - 通用规范（保留）
- `rules/typescript/` - TypeScript/JavaScript 规范（保留）
- 其他语言规则（删除）

#### Hooks

- 保留完整的 `hooks/` 目录结构
- 移除非平台相关的适配脚本

#### MCP 配置

- 保留 `mcp-configs/` 中的前端常用服务器配置
- GitHub、Vercel、Supabase 等

#### 一键安装命令

- `npx jtcc` - 一键安装命令
  - 支持全局安装（安装到 `~/.claude/`）
  - 支持项目级安装（安装到当前项目 `.claude/`）
  - 支持选择性安装（只安装特定的 skills、agents、hooks、commands）

### 删除的内容

- 约 80 个非前端 skills
- 约 20 个非前端 agents
- 约 40 个非前端 commands
- `.cursor/`、`.codex/`、`.opencode/`、`.agents/` 平台适配
- 多语言规则目录
- 其他非前端相关资源

## 实施策略

### 阶段 1: 更新文档说明

不需要创建 jtcc-spec 命令文件。OpenSpec CLI 命令通过 Bash 命令行直接调用：
```bash
jtcc spec install
jtcc spec init
jtcc spec list
jtcc spec show <id>
jtcc spec validate <id>
jtcc spec help
```

### 阶段 2: 重命名现有命令

1. 保留 6 个前端相关命令，更新命名
2. 更新命令内部引用
3. 验证命令功能正常

### 阶段 3: 删除非前端内容

1. 删除非前端 skills
2. 删除非前端 agents
3. 删除非前端 commands
4. 删除平台适配目录
5. 删除多语言 rules

### 阶段 3: 更新配置和文档

1. 更新 `package.json` - 包名、描述、关键词
2. 更新 `.claude-plugin/plugin.json` - 插件元数据
3. 更新 `README.md` - 项目介绍和使用指南
4. 更新 `CLAUDE.md` - 项目级指导
5. 更新 `VERSION` - 版本号

### 阶段 4: 测试和验证

1. 验证所有命令可用
2. 验证 `/jtcc-spec` 命令正确调用 OpenSpec CLI
3. 验证插件安装流程
4. 更新文档和示例

## 风险与缓解

| 风险 | 缓解措施 |
||---|---|
| 删除了用户正在使用的功能 | 明确列出删除内容，提供迁移指南 |
| OpenSpec 集成不兼容 | 充分测试 openspec-cli 命令 |
| 插件安装失败 | 提供详细的安装和故障排除指南 |
| 文档不一致 | 全面更新所有引用和示例 |

## 成功标准

- [ ] 所有保留的 skills 和 agents 功能正常
- [ ] 所有命令使用 `/jtcc:*` 或 `/jtcc spec *` 格式
- [ ] `/jtcc spec install` 成功安装 openspec-cli
- [ ] `/jtcc spec list` 正确列出变更
- [ ] 插件安装和卸载流程正常
- [ ] 文档清晰，易于理解
- [ ] 所有测试通过（如果有）

## 后续工作

- 根据用户反馈补充缺失的前端技能
- 扩展 OpenSpec 变更模板
- 创建前端特定的项目模板
- 编写前端最佳实践指南
