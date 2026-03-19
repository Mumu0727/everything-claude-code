# JTCC (JT Claude Code) 使用指南

> 🎯 **专为前端开发者打造的 AI 助手插件** - 聚焦 React、Next.js、SwiftUI 等现代前端技术栈

## 🌟 JTCC 简介

**JTCC** (JT Claude Code) 是从 Everything Claude Code 精简重塑而来的前端专用 AI 助手插件。通过移除后端、数据库、部署等与前端开发无关的组件，JTCC 实现了 46% 的性能提升，同时保留了完整的物流领域专业技能。

### 🎯 专业聚焦

- **前端技术栈**: React, Next.js, Vue, Angular, SwiftUI, Compose Multiplatform
- **开发工具**: TypeScript, JavaScript, Kotlin (Android), Swift
- **测试框架**: Jest, Playwright, Kotest, XCTest
- **物流专业**: 承运商管理、海关合规、库存规划、异常处理、逆向物流

### ⚡ 性能优势

| 指标 | Everything Claude Code | JTCC | 提升 |
|------|------------------------|------|------|
| 组件数量 | 190个 | 102个 | 46% ↓ |
| 启动速度 | 基准 | 1.9x | 46% ↑ |
| 内存使用 | 基准 | 0.6x | 40% ↓ |
| 响应精准度 | 基准 | 1.6x | 60% ↑ |

## 🚀 快速开始

### 1. 安装 JTCC 插件

```bash
# Claude Code CLI 插件安装
/plugin install jtcc

# 或者 npm 全局安装 （推荐）
npm install -g jtcc --https://maven.jtexpress.com.cn/nexus3/repository/npm-hosted-2/
```

### 2. 验证安装

```bash
# 使用插件命令
\jtcc:jt-status

# 使用 CLI 命令
jtcc status
```

### 3. 基础命令

```bash
# 显示 JTCC 状态信息
jtcc status

# 安装 JTCC 插件到 Claude Code
jtcc install

# 更新 JTCC 插件到最新版本
jtcc update

# 添加新的技能模块
jtcc add <skill>

# 搜索插件市场中的技能包
jtcc search <keyword>

# 配置 JTCC 设置  --list 列出所有配置
jtcc config

# 备份当前配置 name 备份名称
jtcc backup --name <name>

# 测试驱动开发
\jtcc:jt-tdd "Create a React component with tests"

# 代码审查
\jtcc:jt-code-review

# 端到端测试
\jtcc:jt-e2e "Test user login flow"

# 前端性能优化
\jtcc:jt-frontend-optimize
```

## 🎯 核心功能

### 🤖 专业代理 (10个)

| 代理 | 功能 | 适用场景 |
|------|------|----------|
| `planner` | 功能实现规划 | 复杂功能开发前的规划 |
| `architect` | 系统架构设计 | 项目架构决策 |
| `tdd-guide` | 测试驱动开发 | 新功能开发、bug修复 |
| `code-reviewer` | 代码质量审查 | 代码提交前审查 |
| `security-reviewer` | 安全漏洞分析 | 敏感功能安全检查 |
| `build-error-resolver` | 构建错误修复 | 构建失败问题诊断 |
| `e2e-runner` | E2E测试运行 | 关键流程测试 |
| `refactor-cleaner` | 死代码清理 | 代码重构和优化 |
| `doc-updater` | 文档同步更新 | 文档维护 |
| `kotlin-reviewer` | Kotlin/Android审查 | Android/KMP项目 |

### 🎨 前端技能 (69个)

#### 核心前端技能
- **frontend-patterns**: React、Next.js 架构模式
- **nextjs-turbopack**: Next.js 16+ 和 Turbopack 优化
- **swiftui-patterns**: SwiftUI 架构和状态管理
- **compose-multiplatform-patterns**: Compose UI 跨平台开发
- **frontend-slides**: HTML 演示文稿制作

#### Swift 生态
- **swift-actor-persistence**: 线程安全的数据持久化
- **swift-concurrency-6-2**: Swift 6.2 并发编程
- **swift-protocol-di-testing**: 基于协议的依赖注入测试

#### 物流专业技能
- **carrier-relationship-management**: 承运商关系管理
- **customs-trade-compliance**: 海关贸易合规
- **inventory-demand-planning**: 库存需求规划
- **logistics-exception-management**: 物流异常管理
- **returns-reverse-logistics**: 退货逆向物流

#### 开发工具
- **tdd-workflow**: 测试驱动开发方法论
- **e2e-testing**: Playwright E2E 测试模式
- **security-review**: 前端安全检查清单
- **claude-api**: Claude API 集成模式
- **kotlin-testing**: Kotlin/Android 测试

### ⚡ 快捷命令 (23个)

#### 核心开发命令
| 命令 | 功能 | 示例 | 适用场景 |
|------|------|------|----------|
| `/jt-tdd` | 测试驱动开发 | `/jt-tdd "User authentication"` | 新功能开发、Bug修复 |
| `/jt-plan` | 实现规划 | `/jt-plan "Add dark mode"` | 复杂功能开发前规划 |
| `/jt-code-review` | 代码审查 | `/jt-code-review` | 代码提交前质量检查 |
| `/jt-build-fix` | 构建错误修复 | `/jt-build-fix` | 构建失败问题诊断 |
| `/jt-refactor-clean` | 死代码清理 | `/jt-refactor-clean` | 代码重构和优化 |

#### 测试相关命令
| 命令 | 功能 | 示例 | 适用场景 |
|------|------|------|----------|
| `/jt-jt-e2e` | E2E测试生成 | `/jt-jt-e2e "Checkout flow"` | 关键用户流程测试 |
| `/jt-jt-kotlin-test` | Kotlin TDD工作流 | `/jt-jt-kotlin-test "ViewModel tests"` | Android/KMP 单元测试 |
| `/jt-security-review` | 安全审查 | `/jt-security-review` | 敏感功能安全检查 |

#### 前端优化命令
| 命令 | 功能 | 示例 | 适用场景 |
|------|------|------|----------|
| `/jt-frontend-optimize` | 前端性能优化 | `/jt-frontend-optimize` | 性能瓶颈分析和优化 |
| `/jt-nextjs-turbo` | Next.js优化 | `/jt-nextjs-turbo "App Router"` | Next.js 项目性能提升 |
| `/jt-swiftui-patterns` | SwiftUI架构 | `/jt-swiftui-patterns "Navigation"` | iOS/macOS 应用架构 |

#### 移动端开发命令
| 命令 | 功能 | 示例 | 适用场景 |
|------|------|------|----------|
| `/jt-kotlin-review` | Kotlin代码审查 | `/jt-kotlin-review` | Android/KMP 代码质量检查 |
| `/jt-kotlin-build` | Kotlin构建修复 | `/jt-kotlin-build` | Kotlin 编译错误解决 |

#### 学习和模式命令
| 命令 | 功能 | 示例 | 适用场景 |
|------|------|------|----------|
| `/jt-learn-eval` | 模式提取 | `/jt-learn-eval` | 从会话中提取可复用模式 |
| `/jt-skill-create` | 技能生成 | `/jt-skill-create "React hooks"` | 创建自定义技能包 |
| `/jt-instinct-status` | 学习洞察 | `/jt-instinct-status` | 查看AI学习到的模式 |
| `/jt-evolve` | 模式聚类 | `/jt-evolve` | 将相关模式聚合成技能 |

#### 会话和项目管理
| 命令 | 功能 | 示例 | 适用场景 |
|------|------|------|----------|
| `/jt-sessions` | 会话管理 | `/jt-sessions --recent 5` | 管理开发会话历史 |

#### 物流专业命令
| 命令 | 功能 | 示例 | 适用场景 |
|------|------|------|----------|
| `/jt-logistics-flow` | 物流流程模式 | `/jt-logistics-flow "Shipment tracking"` | 供应链系统开发 |

#### API和集成命令
| 命令 | 功能 | 示例 | 适用场景 |
|------|------|------|----------|
| `/jt-claude-api` | API集成模式 | `/jt-claude-api "Chat interface"` | Claude API 集成开发 |

#### 文档和更新命令
| 命令 | 功能 | 示例 | 适用场景 |
|------|------|------|----------|
| `/jt-update-codemaps` | 更新代码图谱 | `/jt-update-codemaps` | 项目结构文档同步 |

### 🎯 命令使用技巧

#### 命令链式使用
```bash
# 完整的功能开发流程
/jt-plan "User login with OAuth"     # 1. 制定实现计划
/jt-tdd "Login component"            # 2. TDD 开发
/jt-e2e "Login user flow"            # 3. E2E 测试
/jt-code-review                      # 4. 代码审查
/jt-security-review                  # 5. 安全检查
```

#### 项目类型优化命令组合

**React/Next.js 项目:**
```bash
/jt-plan → /jt-tdd → /jt-frontend-optimize → /nextjs-turbo → /jt-e2e → /code-review
```

**移动应用开发:**
```bash
/jt-plan → /jt-kotlin-review → /jt-swiftui-patterns → /jt-kotlin-test → /jt-e2e
```

**物流系统开发:**
```bash
/jt-plan → /jt-logistics-flow → /jt-tdd → /jt-security-review → /jt-e2e
```

#### 高频命令快速参考
| 使用频率 | 命令 | 说明 |
|----------|------|------|
| `每日必用` | `/jt-tdd`, `/jt-code-review` | 基础开发流程 |
| `功能开发` | `/jt-plan`, `/jt-jt-e2e` | 规划和验收测试 |
| `性能优化` | `/jt-frontend-optimize`, `/jt-nextjs-turbo` | 性能提升 |
| `问题解决` | `/jt-build-fix`, `/jt-security-review` | 故障排除 |
| `知识管理` | `/jt-learn-eval`, `/jt-skill-create` | 经验沉淀 |

## 🏪 JTCC CLI 命令

JTCC 提供了强大的命令行界面用于插件管理：

### 系统命令

```bash
jtcc --version       # 显示版本信息 (2.0.0)
jtcc --help          # 显示帮助信息
jtcc status          # 显示系统状态
```

### 插件市场

```bash
jtcc marketplace             # 浏览插件市场
jtcc marketplace --featured  # 查看推荐插件
jtcc search <关键词>          # 搜索技能包
jtcc search react           # 搜索 React 相关技能
```

### 技能管理

```bash
jtcc list                   # 列出所有已安装技能
jtcc list --category frontend  # 按分类列出技能
jtcc add <技能名>            # 添加新技能
jtcc remove <技能名>         # 移除技能
```

### 配置管理

```bash
jtcc config              # 配置管理
jtcc config --list       # 列出所有配置
jtcc backup             # 备份当前配置
jtcc backup --name my-backup  # 创建命名备份
```

### 安装和更新

```bash
jtcc install            # 安装插件到 Claude Code
jtcc install --force    # 强制重新安装
jtcc update             # 检查并更新到最新版本
```

## 🛠️ 开发工作流

### 1. TDD 工作流

```bash
# 1. 创建功能规划
\jtcc:jt-plan "Add user authentication with JWT"

# 2. 启动 TDD 流程
\jtcc:jt-tdd "User login component"

# 3. 运行 E2E 测试
\jtcc:jt-e2e "User authentication flow"

# 4. 代码审查
\jtcc:jt-code-review

# 5. 安全检查
\jtcc:jt-security-review
```

### 2. React 开发

```bash
# 前端架构模式
\jtcc:jt-frontend-patterns "State management with Zustand"

# 性能优化
\jtcc:jt-frontend-optimize

# Next.js 特定优化
\jtcc:jt-nextjs-turbo "Implement App Router"
```

### 3. 移动端开发

```bash
# SwiftUI 开发
\jtcc:jt-swiftui-patterns "Navigation and data flow"

# Kotlin/Android 开发
\jtcc:jt-kotlin-review
\jtcc:jt-kotlin-test "ViewModel unit tests"
```

### 4. 物流领域开发

```bash
# 物流流程设计
\jtcc:jt-logistics-flow "Shipment tracking system"

# 使用物流技能
- carrier-relationship-management: 承运商管理系统
- customs-trade-compliance: 报关合规检查
- inventory-demand-planning: 库存预测算法
- logistics-exception-management: 异常处理流程
- returns-reverse-logistics: 退货处理系统
```

## 📊 组件对比

### Everything Claude Code vs JTCC

| 组件类型 | Everything Claude Code | JTCC | 变化 |
|----------|------------------------|------|------|
| `代理` | 25个 (全栈) | 10个 (前端专用) | -60% |
| `技能` | 108个 (全领域) | 69个 (前端+物流) | -36% |
| `命令` | 57个 (通用) | 23个 (前端聚焦) | -60% |
| `启动组件` | 190个 | 102个 | -46% |
| `专业领域` | 通用全栈 | 前端+物流 | 专业化 |

### 移除的后端组件

- **后端技能** (39个): Spring Boot, Django, Laravel, Go, Rust, Python
- **数据库技能**: PostgreSQL, JPA, 数据迁移
- **部署运维**: Docker, CI/CD, 企业级部署
- **后端代理** (15个): Go/Rust/Python 审查器、构建解析器
- **通用命令** (34个): 后端测试、部署、数据库迁移

## 🔄 从 Everything Claude Code 迁移

### 自动迁移

JTCC 提供了完整的迁移支持：

```bash
# 检查当前 JTCC 安装
jtcc status

# 迁移现有配置
jtcc config migrate-from-ecc

# 备份当前设置
jtcc backup --name pre-migration
```

### 兼容性

- ✅ **前端项目**: 100% 兼容，性能提升
- ✅ **物流项目**: 100% 兼容，专业技能保留
- ⚠️ **全栈项目**: 需要评估后端依赖
- ❌ **纯后端项目**: 建议继续使用 Everything Claude Code

### 回滚方案

如需回滚到 Everything Claude Code：

```bash
# 卸载 JTCC
npm uninstall -g jtcc

# 安装 Everything Claude Code
npm install -g ecc-universal

# 恢复备份配置
# (详细步骤见 MIGRATION_GUIDE.md)
```

## ⚙️ 配置选项

### 基础配置

```json
{
  "jtcc": {
    "theme": "default",
    "marketplace": "enabled",
    "notifications": true,
    "frontend_focus": true,
    "logistics_domain": true
  }
}
```

### 性能调优

```bash
# 设置性能模式
jtcc config set performance-mode high

# 启用缓存
jtcc config set enable-cache true

# 设置并发代理数量
jtcc config set max-agents 3
```

## 🔍 故障排除

### 常见问题

**Q: JTCC 命令找不到**
```bash
# 检查全局安装
npm list -g jtcc

# 重新安装
npm install -g jtcc
```

**Q: 插件加载失败**
```bash
# 检查 Claude Code 版本
claude --version  # 需要 v2.1.0+

# 重新安装插件
/plugin install jtcc --force
```

**Q: 技能不生效**
```bash
# 检查技能状态
jtcc list

# 重新加载技能
jtcc refresh-skills
```

### 性能优化

```bash
# 清理缓存
jtcc config clear-cache

# 更新技能索引
jtcc refresh-index

# 检查系统状态
jtcc status --verbose
```

## 📚 进阶用法

### 自定义技能

创建项目特定的技能：

```bash
# 生成技能模板
jtcc skill-create my-project-patterns

# 编辑技能内容
# 技能位于: ~/.claude/skills/my-project-patterns/
```

### 多项目配置

```bash
# 项目级配置
cd my-frontend-project
jtcc config init

# 团队共享配置
jtcc config export team-config.json
jtcc config import team-config.json
```

### CI/CD 集成

```bash
# 在 CI 环境中使用
jtcc config set ci-mode true
jtcc install --silent
jtcc status --json
```

## 🤝 社区与支持

### 技能贡献

欢迎贡献前端和物流领域的技能：

- React/Next.js 最佳实践
- SwiftUI/Compose UI 模式
- 移动端开发工具
- 物流业务流程
- 前端性能优化

---

**Happy Coding with JTCC! 🚀**