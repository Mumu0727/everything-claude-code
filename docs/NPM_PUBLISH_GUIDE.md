# JTCC NPM 发布指南

本文档描述如何将JTCC项目发布到JT Express的npm仓库。

## 🎯 仓库信息

**npm仓库地址**: `https://maven.jtexpress.com.cn/nexus3/repository/npm-group-2/`

## 📋 发布前准备

### 1. 确保已登录npm仓库

```bash
# 登录到JT Express npm仓库
npm login --registry=https://maven.jtexpress.com.cn/nexus3/repository/npm-group-2/

# 验证登录状态
npm whoami --registry=https://maven.jtexpress.com.cn/nexus3/repository/npm-group-2/
```

### 2. 更新版本号

根据更改类型更新 `package.json` 中的版本号：

```bash
# 补丁版本 (2.0.0 -> 2.0.1) - 修复bug
npm version patch

# 次要版本 (2.0.0 -> 2.1.0) - 新增功能
npm version minor

# 主要版本 (2.0.0 -> 3.0.0) - 破坏性更改
npm version major
```

## 🚀 发布方法

### 方法1：完整发布流程 (推荐)

```bash
# 执行完整发布流程
npm run publish
```

**发布流程包括**:
1. ✅ 验证package.json配置
2. 🔐 检查npm认证状态
3. 🧪 运行测试套件
4. 🔨 构建项目（如果需要）
5. 📦 发布到npm仓库
6. ✅ 验证发布结果

### 方法2：干运行模式

```bash
# 干运行模式，检查发布流程但不实际发布
npm run publish:dry
```

### 方法3：强制发布

```bash
# 跳过确认步骤，直接发布
npm run publish:force
```

### 方法4：快速发布

```bash
# 使用简化的快速发布脚本
node scripts/publish-quick.js
```

## 📋 发布检查清单

发布前请确认：

- [ ] 🔢 版本号已正确更新
- [ ] 📝 CHANGELOG.md已更新
- [ ] 🧪 所有测试通过
- [ ] 📚 文档已更新
- [ ] 🔐 已登录到正确的npm仓库
- [ ] 🏷️ Git标签已创建（可选）

## 🛠️ 发布脚本说明

### 主发布脚本

**文件**: `scripts/publish-npm.js`

- 完整的发布流程管理
- 交互式确认
- 错误处理和回滚
- 发布验证

**功能特点**:
- 🔍 自动验证package.json
- 🔐 检查npm认证
- 🧪 运行测试套件
- 📦 安全发布流程
- ✅ 发布后验证

### 快速发布脚本

**文件**: `scripts/publish-quick.js`

- 简化的发布流程
- 适合紧急发布
- 最少交互

## 🎛️ 配置文件

### npm配置

**文件**: `.npmrc-jtexpress`

```ini
registry=https://maven.jtexpress.com.cn/nexus3/repository/npm-group-2/
tag=latest
access=public
```

## 📦 安装发布的包

发布成功后，可以通过以下方式安装：

```bash
# 安装JTCC
npm install jtcc --registry=https://maven.jtexpress.com.cn/nexus3/repository/npm-group-2/

# 全局安装
npm install -g jtcc --registry=https://maven.jtexpress.com.cn/nexus3/repository/npm-group-2/

# 在项目中安装
npm install jtcc --save --registry=https://maven.jtexpress.com.cn/nexus3/repository/npm-group-2/
```

## 🔧 常见问题

### 1. 认证失败

**问题**: `npm ERR! 401 Unauthorized`

**解决方案**:
```bash
# 重新登录
npm login --registry=https://maven.jtexpress.com.cn/nexus3/repository/npm-group-2/

# 检查.npmrc配置
cat ~/.npmrc
```

### 2. 版本冲突

**问题**: `npm ERR! 403 Forbidden - PUT https://...`

**解决方案**:
```bash
# 检查当前版本
npm view jtcc version --registry=https://maven.jtexpress.com.cn/nexus3/repository/npm-group-2/

# 更新版本号
npm version patch
```

### 3. 网络问题

**问题**: 连接超时或网络错误

**解决方案**:
```bash
# 检查网络连接
ping maven.jtexpress.com.cn

# 配置代理（如果需要）
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

## 📊 发布后验证

发布成功后，建议进行以下验证：

1. **查看包信息**:
   ```bash
   npm view jtcc --registry=https://maven.jtexpress.com.cn/nexus3/repository/npm-group-2/
   ```

2. **测试安装**:
   ```bash
   # 在临时目录测试安装
   mkdir /tmp/test-jtcc && cd /tmp/test-jtcc
   npm install jtcc --registry=https://maven.jtexpress.com.cn/nexus3/repository/npm-group-2/
   ```

3. **验证功能**:
   ```bash
   # 测试JTCC命令
   npx jtcc --version
   npx jtcc status
   ```

## 🔄 自动化发布

对于CI/CD环境，可以设置自动化发布：

```yaml
# .github/workflows/publish.yml
name: Publish to NPM
on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run publish:force
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 📞 支持

如果在发布过程中遇到问题，请联系：

- 📧 技术支持: tech-support@jtexpress.com
- 📚 内部文档: [JT Express NPM仓库使用指南]
- 🤝 开发团队: JTCC开发组