# J&T Claude Code (JTCC) - 构建和发布流程

本文档描述了 JTCC 的完整构建和发布流程。

## 目录

- [前置条件](#前置条件)
- [准备发布](#准备发布)
- [版本管理](#版本管理)
- [构建流程](#构建流程)
- [发布到 NPM](#发布到-npm)
- [发布到 GitHub](#发布到-github)
- [发布后验证](#发布后验证)
- [故障排除](#故障排除)

---

## 前置条件

### 必需工具

- **Node.js**: >= 18
- **npm**: 最新版本
- **git**: 版本控制

### 必需权限

- **NPM 账号**: 发布到 `@jt-team/jtcc` 的权限
- **GitHub 访问令牌**: 用于自动化发布流程

---

## 准备发布

### 1. 检查工作区状态

```bash
# 确保所有更改已提交
git status

# 应该没有任何未提交的更改
# 如果有更改，先提交
git add .
git commit -m "chore: prepare for release"
```

### 2. 检查当前分支

```bash
# 应该在 main 分支
git branch

# 如果不在 main，先切换
git checkout main
git pull origin main
```

### 3. 运行测试

```bash
# 运行所有测试
npm test

# 确保所有测试通过
```

---

## 版本管理

### 版本格式

遵循 [语义化版本](https://semver.org/lang/zh-CN/)：

- **主版本号 (MAJOR)**: 不兼容的 API 更改
- **次版本号 (MINOR)**: 向后兼容的功能新增
- **修订号 (PATCH)**: 向后兼容的错误修复

示例：`1.0.0` → `1.0.1` → `1.1.0` → `2.0.0`

### 更新版本文件

```bash
# 编辑 VERSION 文件
echo "1.0.1" > VERSION

# 或者使用自动化脚本
npm run version:patch  # 1.0.0 → 1.0.1
npm run version:minor # 1.0.0 → 1.1.0
npm run version:major # 1.0.0 → 2.0.0
```

### 同步 package.json

```bash
# 确保 package.json 中的版本与 VERSION 文件一致
# 这个可以通过脚本自动化

# 检查
cat VERSION
grep "version" package.json

# 如果不一致，更新
VERSION=$(cat VERSION)
npm version "$VERSION" --no-git-tag-version
```

---

## 构建流程

### 1. 清理构建产物

```bash
# 清理之前的构建
rm -rf dist build .nyc

# 清理 node_modules (可选)
# rm -rf node_modules package-lock.json
```

### 2. 安装依赖

```bash
# 安装生产依赖
npm ci --production

# 或者完整安装
npm install
```

### 3. 运行代码检查

```bash
# 运行 linter
npm run lint

# 如果没有 lint 脚本，跳过
# echo "No lint script configured"
```

### 4. 生成 CHANGELOG

```bash
# 手动编辑 CHANGELOG.md
# 添加新的版本条目

# 或者使用自动化工具
# npm run changelog
```

CHANGELOG 格式：

```markdown
## [1.0.1] - 2024-04-07

### Added
- 新功能的描述

### Fixed
- 修复的问题描述

### Changed
- 更改的描述

### Deprecated
- 废弃的功能描述

### Security
- 安全相关的更改
```

---

## 发布到 NPM

### 1. 登录 NPM

```bash
# 确保已登录
npm whoami

# 如果未登录
npm login
# 输入用户名和密码/OTP
```

### 2. 构建发布包

```bash
# 构建并发布到 NPM
npm publish

# 或者先构建 tarball
npm pack

# 测试 tarball
tar -tzvf jtcc-*.tgz

# 手动发布
npm publish ./jtcc-*.tgz
```

### 3. 验证 NPM 发布

```bash
# 检查包是否成功发布
npm view jtcc

# 或者使用 npmjs.com
# 访问 https://www.npmjs.com/package/jtcc
```

### 4. 测试全局安装

```bash
# 在新的终端测试全局安装
npm install -g jtcc

# 测试 jtcc 命令
jtcc --help

# 测试 npx 调用
npx jtcc --help
```

### 5. 清理测试安装

```bash
# 卸载测试安装
npm uninstall -g jtcc
```

---

## 发布到 GitHub

### 1. 创建 Git 标签

```bash
# 从 VERSION 文件读取版本
VERSION=$(cat VERSION | tr -d '\r')

# 创建并推送标签
git tag "v$VERSION"
git push origin "v$VERSION"
```

### 2. 创建 GitHub Release

#### 方法 A: 使用 GitHub CLI

```bash
# 安装 gh CLI
# npm install -g @github/cli

# 创建 release
gh release create "v$VERSION" \
  --title "v$VERSION" \
  --notes-file CHANGELOG.md \
  --draft
```

#### 方法 B: 手动创建

1. 访问 https://github.com/jt-team/jtcc/releases/new
2. 填写以下信息：
   - Tag version: 选择刚推送的标签
   - Release title: `v$VERSION`
   - Description: 从 CHANGELOG.md 复制
   - Draft: 可以先创建为草稿
3. 点击 "Publish release"

### 3. 验证 GitHub Release

```bash
# 使用 GitHub CLI 列出 release
gh release view "v$VERSION"

# 或者手动访问
# https://github.com/jt-team/jtcc/releases/tag/v$VERSION
```

---

## 发布后验证

### 1. 安装验证

```bash
# 全局安装验证
npm install -g jtcc@$(cat VERSION)

# 测试 jtcc 命令
jtcc --help

# 测试项目级安装
mkdir /tmp/test-jtcc
cd /tmp/test-jtcc
npx jtcc --project
```

### 2. 检查文档链接

访问以下链接确认文档正确：

- GitHub Release: https://github.com/jt-team/jtcc/releases
- NPM 包页面: https://www.npmjs.com/package/jtcc
- README 中的链接应该都有效

### 3. 测试核心功能

```bash
# 测试 jtcc 安装
npx jtcc

# 测试 OpenSpec 子命令
npx jtcc spec help

# 测试项目安装
npx jtcc --project

# 清理
rm -rf /tmp/test-jtcc
```

---

## 自动化发布脚本

创建 `scripts/release.sh` 或 `scripts/release.js`：

```bash
#!/bin/bash
# scripts/release.sh

set -e

# 1. 验证前置条件
echo "🔍 验证工作区状态..."
if [ -n "$(git status --porcelain)" ]; then
    echo "✓ 工作区干净"
else
    echo "✗ 工作区有未提交的更改"
    exit 1
fi

# 2. 读取版本
VERSION=$(cat VERSION | tr -d '\r\n')
echo "📦 发布版本: $VERSION"

# 3. 运行测试
echo "🧪 运行测试..."
npm test
if [ $? -ne 0 ]; then
    echo "✗ 测试失败"
    exit 1
fi
echo "✓ 测试通过"

# 4. 构建
echo "🔨 构建包..."
npm ci --production

# 5. 发布到 NPM
echo "📦 发布到 NPM..."
npm publish

# 6. 创建 Git 标签
echo "🏷  创建 Git 标签..."
git tag "v$VERSION"
git push origin "v$VERSION"

# 7. 创建 GitHub Release
echo "🌟 创建 GitHub Release..."
gh release create "v$VERSION" \
  --title "v$VERSION" \
  --notes-file CHANGELOG.md

echo "✅ 发布完成！"
echo "🔗 GitHub: https://github.com/jt-team/jtcc/releases/tag/v$VERSION"
echo "📦 NPM: https://www.npmjs.com/package/jtcc"
```

使用方法：

```bash
chmod +x scripts/release.sh
./scripts/release.sh
```

---

## 故障排除

### 问题: NPM 发布失败 "403 Forbidden"

**原因**: 权限不足或令牌过期

**解决**:
```bash
# 重新登录
npm logout
npm login

# 检查权限
# 确保 jt-team 组织有发布权限
```

### 问题: Git 推送失败 "tag already exists"

**原因**: 标签已存在

**解决**:
```bash
# 删除本地标签
git tag -d "v$VERSION"

# 删除远程标签
git push origin --delete "v$VERSION"

# 重新创建
git tag "v$VERSION"
git push origin "v$VERSION"
```

### 问题: npm pack 生成的文件不正确

**原因**: package.json 中的 `files` 字段配置不正确

**解决**:
检查 `package.json` 中的 `files` 字段：
```json
{
  "files": [
    "agents/",
    "commands/",
    "skills/",
    "hooks/",
    "mcp-configs/",
    "scripts/",
    "CLAUDE.md",
    "README.md",
    "VERSION"
  ]
}
```

### 问题: 版本号不一致

**原因**: VERSION 文件和 package.json 版本不一致

**解决**:
```bash
# 统一版本
VERSION=$(cat VERSION | tr -d '\r\n')
npm version "$VERSION" --no-git-tag-version
```

---

## 最佳实践

1. **版本管理**:
   - 使用语义化版本
   - 在每次发布前更新 VERSION 文件
   - 维护详细的 CHANGELOG

2. **发布前检查**:
   - 运行完整测试套件
   - 检查工作区状态
   - 审查所有更改

3. **文档更新**:
   - 在发布前更新 README
   - 确保所有链接有效
   - 添加使用示例

4. **逐步发布**:
   - 先发布到 NPM
   - 验证后再推送到 GitHub
   - 最后创建 GitHub Release

5. **发布后验证**:
   - 全局安装测试
   - 运行核心命令
   - 检查文档链接

---

## 快速发布检查清单

```markdown
### 发布前

- [ ] 所有更改已提交
- [ ] 在 main 分支上
- [ ] 所有测试通过
- [ ] VERSION 文件已更新
- [ ] package.json 版本同步
- [ ] CHANGELOG 已更新
- [ ] README 已更新

### 发布过程

- [ ] 清理构建产物
- [ ] 安装依赖
- [ ] 运行 linter
- [ ] 构建 tarball
- [ ] 发布到 NPM
- [ ] 创建 Git 标签
- [ ] 推送标签到远程
- [ ] 创建 GitHub Release

### 发布后

- [ ] NPM 包页面可访问
- [ ] GitHub Release 已创建
- [ ] 全局安装测试通过
- [ ] npx 调用测试通过
- [ ] 文档链接有效
```

---

## 联系方式

遇到问题？请联系：

- **GitHub Issues**: https://github.com/jt-team/jtcc/issues
- **团队**: 通过团队内部渠道联系
