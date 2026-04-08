# J&T Claude Code (JTCC) - 实施任务

## 实施任务清单

> **重要**: 此任务不修改 `.claude/` 和 `openspec/` 目录。这两个是 OpenSpec CLI 的生成和工作目录，不是项目文件。只修改根目录的 ECC 项目文件。

### 阶段 1: 创建一建安装命令 (1 个任务)

- [x] **创建 `npx jtcc` 一建安装命令**
  - 文件: `scripts/jtcc.js` 或 `package.json` scripts
`  - 内容: 实现 npx jtcc install 功能
  - 支持选项:
    - 全局安装（安装到 `~/.claude/`）
    - 项目级安装（安装到当前项目 `.claude/`）
    - 选择性安装（只安装指定的 skills、agents、hooks、commands）
  - 验证: `npx jtcc help` 显示正确帮助信息

### 阶段 2: 重命名现有命令 (6 个任务)

- [x] **重命名 `/plan` → `/jtcc:plan`**
  - 源文件: `commands/plan.md`
  - 目标文件: `commands/jtcc-plan.md`
  - 内容: 复制原文件，更新内部引用
  - 验证: 命令可以执行

- [x] **重命名 `/tdd` → `/jtcc:tdd`**
  - 源文件: `commands/tdd.md`
  - 目标文件: `commands/jtcc-tdd.md`
  - 验证: 命令可以执行

- [x] **重命名 `/code-review` → `/jtcc:code-review`**
  - 源文件: `commands/code-review.md`
  - 目标文件: `commands/jtcc-code-review.md`
  - 验证: 命令可以执行

- [x] **重命名 `/e2e` → `/jtcc:e2e`**
  - 源文件: `commands/e2e.md`
  - 目标文件: `commands/jtcc-e2e.md`
  - 验证: 命令可以执行

- [x] **重命名 `/refactor-clean` → `/jtcc:refactor`**
  - 源文件: `commands/refactor-clean.md`
  - 目标文件: `commands/jtcc-refactor.md`
  - 验证: 命令可以执行

- [x] **重命名 `/multi-frontend` → `/jtcc:multi`**
  - 源文件: `commands/multi-frontend.md`
  - 目标文件: `commands/jtcc-multi.md`
  - 验证: 命令可以执行

### 阶段 2: 清理非前端内容 (3 个任务)

- [x] **删除非前端 skills**
  - 保留: `frontend-patterns`, `frontend-slides`, `tdd-workflow`, `e2e-testing`,
         `nextjs-turbopack`, `coding-standards`, `search-first`, `documentation-lookup`
  - 删除: 其他约 80 个 skills
  - 验证: 只有 9 个 skills 保留

- [x] **删除非前端 agents**
  - 保留: `planner`, `tdd-guide`, `code-reviewer`, `architect`,
         `security-reviewer`, `e2e-runner`, `refactor-cleaner`
  - 删除: 其他约 20 个 agents
  - 验证: 只有 7 个 agents 保留

- [x] **删除非前端 commands**
  - 保留: `plan`, `tdd`, `code-review`, `e2e`, `refactor-clean`, `multi-frontend`
  - 删除: 其他约 40 个 commands
  - 验证: 只有 6 个命令保留在原位置（已移动到 jtcc- 前缀）

### 阶段 3: 删除平台适配和多语言内容 (2 个任务)

- [x] **删除平台适配目录**
  - 删除: `.cursor/`, `.codex/`, `.opencode/`, `.agents/`
  - 验证: 这些目录不存在

- [x] **删除多语言 rules 和非前端内容**
  - 保留: `rules/common/`, `rules/typescript/`
  - 删除: `rules/python/`, `rules/golang/`, `rules/swift/`, `rules/php/` 等
  - 验证: 只有 common 和 typescript 规则保留（rules 目录已有 minimal 结构）

### 阶段 4: 更新配置文件 (4 个任务)

- [x] **更新 package.json**
  - 文件: `package.json`
  - 修改:
    - `name`: "jtcc"
    - `description`: "J&T Claude Code - 前端聚焦的 AI 编程助手"
    - `keywords`: 更新为前端相关关键词
    - `bin.jtcc`: 指向 jtcc 脚本
  - 验证: JSON 格式正确

- [x] **更新 .claude-plugin/plugin.json**
  - 文件: `.claude-plugin/plugin.json`
  - 修改:
    - `name`: "jtcc"
    - `description`: "J&T Claude Code - 前端聚焦的 AI 编程助手集成"
    - `author`, `repository`, `homepage`: 更新为 jtcc 相关
  - 验证: JSON 格式正确

- [x] **更新 README.md**
  - 文件: `README.md`
  - 修改:
    - 标题改为 "J&T Claude Code (JTCC)"
    - 更新所有描述为前端聚焦
    - 更新命令示例为 `/jtcc:*` 格式
    - 移除非前端相关内容
  - 验证: 内容连贯，命令示例正确

- [x] **更新 CLAUDE.md**
  - 文件: `CLAUDE.md`
  - 修改:
    - 更新项目概述为前端聚焦
    - 更新可用能力列表
    - 更新命令示例为 `/jtcc:*` 格式
  - 验证: 内容连贯

### 阶段 5: 更新内部引用 (2 个任务)

- [x] **更新所有 "everything-claude-code" 引用**
  - 范围: 所有 .md 文件
  - 修改: 替换为 "jtcc"
  - 验证: 搜索确认没有遗留引用

- [x] **更新所有 "ECC" 引用**
  - 范围: 所有 .md 文件
  - 修改: 替换为 "JTCC"
  - 验证: 搜索确认没有遗留引用

### 阶段 6: 更新版本 (1 个任务)

- [x] **更新 VERSION 文件**
  - 文件: `VERSION` - 内容: "1.0.0"
  - 验证: 文件内容为 "1.0.0"

### 阶段 7: 验证和测试 (3 个任务)

- [x] **验证所有 JTCC 命令可用**
  - 测试: 执行所有 `/jtcc:*` 命令
  - 验证: 所有命令返回预期结果

- [x] **验证 OpenSpec 集成**
  - 测试:
    - `jtcc spec help`
    - `jtcc spec list`
  - 验证: OpenSpec CLI 正确调用

- [x] **验证文档一致性**
  - 测试: 检查所有文档中的命令引用
  - 验证: 所有引用使用新命令格式

## 总结

- **总任务数**: 22 个
- **预计时间**: 2-3 小时
- **依赖**: 需要 openspec-cli 可用于测试

## OpenSpec 集成说明

OpenSpec CLI 命令通过 Bash 命令行方式调用，不需要创建 jtcc-spec 命令文件：

```bash
# 在任何项目中使用
jtcc spec install    # 安装 openspec-cli
jtcc spec init       # 初始化项目
jtcc spec list       # 列出所有变更
jtcc spec show <id>  # 显示变更详情
jtcc spec validate   # 校验变更格式
jtcc spec help       # 显示帮助信息
```

## 实施顺序建议

1. 首先完成阶段 1-2（重命名和清理）
2. 然后完成阶段 3-4（删除和更新）
3. 接着完成阶段 5-6（更新和验证）

这样可以确保：
- 新命令先创建并可用
- 清理操作不会破坏新结构
- 所有引用统一更新
- 最后全面验证确保质量
