# J&T Claude Code (JTCC) - 设计文档

## 架构概览

> **重要**: 此重构不修改 `.claude/` 和 `openspec/` 目录。这两个是 OpenSpec CLI 的生成和工作目录，不是项目文件。只修改根目录的 ECC 项目文件。

```
┌─────────────────────────────────────────────────┐
│              ECC 项目文件结构 → JTCC 项目文件结构              │
├─────────────────────────────────────────────────┤
│                                                   │
│  [修改] 根目录文件                          │
│  ├── package.json                → 更新包名和描述          │
│  ├── README.md                   → 更新项目介绍            │
│  ├── CLAUDE.md                   → 更新项目指导            │
│  ├── VERSION                      → 更新版本号              │
│  └── .claude-plugin/plugin.json    → 更新插件元数据          │
│                                                   │
│  [保留] agents/ (7 个)                          │
│  ├── planner.md                                   │
│  ├── tdd-guide.md                                 │
│  ├── code-reviewer.md                              │
│  ├── architect.md                                  │
│  ├── security-reviewer.md                            │
│  ├── e2e-runner.md                                 │
│  └── refactor-cleaner.md                           │
│                                                   │
│  [精简] skills/ (8 个保留，删除 ~80 个)          │
│  ├── frontend-patterns/SKILL.md             │
│  ├── frontend-slides/SKILL.md               │
│  ├── frontend-slides/STYLE_PRESETS.md         │
│  ├── tdd-workflow/SKILL.md                     │
│  ├── e2e-testing/SKILL.md                           │
│  ├── nextjs-turbopack/SKILL.md                 │
│  ├── coding-standards/SKILL.md                      │
│  └── search-first/SKILL.md                          │
│                                                   │
│  [精简] commands/ (6 个保留，删除 ~40 个)       │
│  ├── plan.md → jtcc-plan.md                     │
│  ├── tdd.md → jtcc-tdd.md                            │
│  ├── code-review.md → jtcc-code-review.md              │
│  ├── e2e.md → jtcc-e2e.md                           │
│  ├── refactor-clean.md → jtcc-refactor.md              │
│  └── multi-frontend.md → jtcc-multi.md                     │
│                                                   │
│  [精简] rules/ (保留 common/ 和 typescript/)        │
│  ├── common/                 # 保留                          │
│  ├── typescript/              # 保留                          │
│  └── [删除] python/, golang/, swift/, php/, 等        │
│                                                   │
│  [保留] hooks/                                    │
│  └── hooks/              # 保留核心 hooks                   │
│                                                   │
│  [保留] mcp-configs/                                │
│  └── mcp-servers.json      # 前端常用 MCP 服务器            │
│                                                   │
│  [删除] 平台适配目录                                │
│  ├── .cursor/              # 删除                            │
│  ├── .codex/               # 删除                            │
│  ├── .opencode/             # 删除                            │
│  └── .agents/              # 删除                            │
│                                                   │
│  [不修改] OpenSpec 生成目录                        │
│  .claude/                  # OpenSpec CLI 生成，不修改                  │
│  openspec/                 # OpenSpec CLI 工作目录，区不修改            │
│                                                   │
└─────────────────────────────────────────────────┘
```

## 命令命名约定

所有 JTCC 命令遵循以下约定：

- **工作流命令**: `/jtcc:<action<` - 例如 `/jtcc:plan`
- **OpenSpec 命令**: ``jtcc spec <subcommand<` - 例如 `jtcc spec list`

## 可用命令

### 工作流命令

- `/jtcc:plan` - 创建实现计划
- `/jtcc:tdd` - TDD 工作流
- `/jtcc:code-review` - 代码审查
- `/jtcc:e2e` - E2E 测试生成
- `/jtcc:refactor` - 死代码清理
- `/jtcc:multi` - 前端多服务编排

### OpenSpec CLI 命令 (Bash 命令行方式)

```bash
jtcc spec install     # 安装 openspec-cli
jtcc spec init        # 初始化项目
jtcc spec list        # 列出所有变更
jtcc spec show <id>  # 显示变更详情
jtcc spec validate    # 校验变更格式
jtcc spec help        # 显示帮助信息
```

## 配置更新

### package.json

```json
{
  "name": "jtcc",
  "version": "1.0.0",
  "description": "J&T Claude Code - 前端聚焦的 AI 编程助手",
  "keywords": [
    "claude-code",
    "frontend",
    "react",
    "nextjs",
    "typescript",
    "tdd",
    "e2e",
    "openspec"
  ],
  "bin": {
    "jtcc": "scripts/jtcc.js"
  }
}
```

### .claude-plugin/plugin.json

```json
{
  "name": "jtcc",
  "version": "1.0.0",
  "description": "J&T Claude Code - 前端聚焦的 AI 编程助手集成"
}
```

## 一建安装实现 (`scripts/jtcc.js` - 新增)

使用 npx 实现一建安装命令，提供以下功能：

```bash
# 全局安装（安装到 ~/.claude/）
npx jtcc

# 项目级安装（安装到当前项目 .claude/）
npx jtcc --project

# 选择性安装（只安装特定的 skills、agents、hooks、commands）
npx jtcc --with skills:frontend-patterns,tdd-workflow
npx jtcc --with agents:planner,tdd-guide

px jtcc --with hooks:session-start,session-end
npx jtcc --with commands:plan,tdd,code-review

# 显示帮助
npx jtcc --help
```

**安装策略**:
- 检测当前目录，确定是项目还是全局
- 读取 package.json 中的 jtcc 配置
- 根据 `--with` 选项选择性地安装组件
- 复制文件到目标位置（~/.claude/ 或 .claude/）
- 显示安装摘要

**支持组件类型**:
- `skills` - 前端相关 skills
- `agents` - 前端相关 agents
- `hooks` - 核心 hooks
- `commands` - 工作流命令
- `rules` - 规则文件（common + typescript）
- `mcp` - MCP 配置

**`package.json` 配置示例**:
```json
{
  "jtcc": {
    "components": {
      "skills": ["frontend-patterns", "tdd-workflow"],
      "agents": ["planner", "tdd-guide"],
      "hooks": ["session-start", "session-end"],
      "commands": ["plan", "tdd", "code-review"],
      "rules": true
    }
  }
}
```

**默认组件列表**（当 `--with` 未指定时）:
- Skills: frontend-patterns, frontend-slides, tdd-workflow, e2e-testing, nextjs-turbopack, coding-standards, search-first
- Agents: planner, tdd-guide, code-reviewer, architect, security-reviewer, e2e-runner, refactor-cleaner
- Hooks: 所有
- Commands: plan, tdd, code-review, e2e, refactor-clean, multi-frontend
- Rules: common, typescript
- MCP: mcp-servers.json
