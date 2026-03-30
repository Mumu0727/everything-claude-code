#!/usr/bin/env node

/**
 * JTCC 通用NPM发布脚本
 * 支持发布到公共NPM仓库和私有仓库
 * 包含Web界面功能的完整验证
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 配置
const DEFAULT_REGISTRY = 'https://registry.npmjs.org/';
const INTERNAL_REGISTRY = 'https://maven.jtexpress.com.cn/nexus3/repository/npm-hosted-2/';
const PACKAGE_PATH = path.join(__dirname, '..', 'package.json');
const WEB_INTERFACE_PATH = path.join(__dirname, '..', 'web-interface');

// 颜色输出
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  magenta: (text) => `\x1b[35m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
  reset: '\x1b[0m'
};

class PublishManager {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.skipTests = options.skipTests || false;
    this.force = options.force || false;
    this.registry = options.registry || DEFAULT_REGISTRY;
    this.internal = options.internal || false;

    if (this.internal) {
      this.registry = INTERNAL_REGISTRY;
    }

    this.packageJson = null;
    this.testResults = {
      main: false,
      web: false,
      lint: false
    };
  }

  /**
   * 输出带颜色的日志
   */
  log(message, color = 'cyan') {
    console.log(colors[color](message));
  }

  /**
   * 执行命令
   */
  execCommand(command, description, options = {}) {
    this.log(`\n▶ ${description}`, 'cyan');

    if (this.dryRun && !options.allowDryRun) {
      this.log(`[DRY RUN] 将要执行: ${command}`, 'yellow');
      return null;
    }

    this.log(`执行命令: ${command}`, 'blue');

    try {
      const result = execSync(command, {
        encoding: 'utf8',
        stdio: options.silent ? 'pipe' : 'inherit',
        env: {
          ...process.env,
          NPM_CONFIG_REGISTRY: this.registry
        }
      });

      this.log(`✅ ${description} - 成功`, 'green');
      return result;
    } catch (error) {
      this.log(`❌ ${description} - 失败`, 'red');
      if (options.exitOnError !== false) {
        this.log(`错误: ${error.message}`, 'red');
        process.exit(1);
      }
      throw error;
    }
  }

  /**
   * 异步提问
   */
  async ask(question) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(colors.yellow(question), (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }

  /**
   * 验证package.json
   */
  validatePackage() {
    this.log('\n📦 验证package.json配置...', 'blue');

    if (!fs.existsSync(PACKAGE_PATH)) {
      this.log('❌ package.json文件不存在', 'red');
      process.exit(1);
    }

    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));

    // 检查必要字段
    const requiredFields = ['name', 'version', 'description', 'main', 'bin'];
    const missingFields = requiredFields.filter(field => !packageJson[field]);

    if (missingFields.length > 0) {
      this.log(`❌ package.json缺少必要字段: ${missingFields.join(', ')}`, 'red');
      process.exit(1);
    }

    // 验证Web界面相关脚本
    const webScripts = ['web:start', 'web:dev', 'web:test'];
    const missingWebScripts = webScripts.filter(script =>
      !packageJson.scripts || !packageJson.scripts[script]
    );

    if (missingWebScripts.length > 0) {
      this.log(`⚠️ 缺少Web界面脚本: ${missingWebScripts.join(', ')}`, 'yellow');
    }

    // 验证bin字段包含web界面
    if (packageJson.bin && !packageJson.bin['jtcc-web']) {
      this.log('⚠️ bin字段缺少jtcc-web命令', 'yellow');
    }

    this.log(`✅ 包名: ${packageJson.name}`, 'green');
    this.log(`✅ 版本: ${packageJson.version}`, 'green');
    this.log(`✅ 描述: ${packageJson.description}`, 'green');

    this.packageJson = packageJson;
    return packageJson;
  }

  /**
   * 检查Web界面文件完整性
   */
  validateWebInterface() {
    this.log('\n🌐 验证Web界面文件...', 'blue');

    const requiredFiles = [
      'package.json',
      'server/app.js',
      'public/index.html',
      'public/css/styles.css',
      'public/js/app.js',
      'README.md'
    ];

    let allFilesExist = true;

    for (const file of requiredFiles) {
      const filePath = path.join(WEB_INTERFACE_PATH, file);
      const exists = fs.existsSync(filePath);

      if (exists) {
        this.log(`✅ ${file}`, 'green');
      } else {
        this.log(`❌ ${file} 不存在`, 'red');
        allFilesExist = false;
      }
    }

    if (!allFilesExist) {
      this.log('❌ Web界面文件不完整', 'red');
      process.exit(1);
    }

    // 检查Web界面依赖
    const webPackageJson = path.join(WEB_INTERFACE_PATH, 'package.json');
    if (fs.existsSync(webPackageJson)) {
      const webPkg = JSON.parse(fs.readFileSync(webPackageJson, 'utf8'));
      const hasNodeModules = fs.existsSync(path.join(WEB_INTERFACE_PATH, 'node_modules'));

      if (!hasNodeModules) {
        this.log('⚠️ Web界面依赖未安装，正在安装...', 'yellow');
        this.execCommand('npm install', 'Web界面依赖安装', {
          cwd: WEB_INTERFACE_PATH
        });
      }
    }

    this.log('✅ Web界面文件验证通过', 'green');
  }

  /**
   * 检查npm认证状态
   */
  async checkNpmAuth() {
    this.log('\n🔐 检查npm认证状态...', 'blue');

    try {
      const whoami = this.execCommand(
        `npm whoami --registry=${this.registry}`,
        '检查登录状态',
        { silent: true, allowDryRun: true }
      );

      if (whoami) {
        this.log(`✅ 已登录用户: ${whoami.trim()}`, 'green');
        return whoami.trim();
      }
    } catch (error) {
      // 未登录
    }

    if (this.dryRun) {
      this.log('⚠️ [DRY RUN] 跳过登录检查', 'yellow');
      return 'dry-run-user';
    }

    this.log('⚠️ 未登录到npm仓库', 'yellow');
    this.log('请手动登录:', 'cyan');
    this.log(`npm login --registry=${this.registry}`, 'yellow');

    const answer = await this.ask('登录完成后按回车继续，或输入 "skip" 跳过: ');

    if (answer.toLowerCase() === 'skip') {
      this.log('⚠️ 跳过认证检查，继续发布...', 'yellow');
      return 'unknown';
    }

    try {
      const whoami = this.execCommand(
        `npm whoami --registry=${this.registry}`,
        '重新检查登录状态',
        { silent: true }
      );
      this.log(`✅ 已登录用户: ${whoami.trim()}`, 'green');
      return whoami.trim();
    } catch (error) {
      this.log('❌ 仍未登录，请先登录npm', 'red');
      process.exit(1);
    }
  }

  /**
   * 运行主测试套件
   */
  runMainTests() {
    this.log('\n🧪 运行主测试套件...', 'blue');

    if (this.skipTests) {
      this.log('⚠️ 跳过测试步骤', 'yellow');
      return true;
    }

    try {
      this.execCommand('npm test', '执行主测试');
      this.testResults.main = true;
      return true;
    } catch (error) {
      this.log('❌ 主测试失败', 'red');
      this.testResults.main = false;

      if (!this.force) {
        process.exit(1);
      }

      this.log('⚠️ 强制模式，继续发布...', 'yellow');
      return false;
    }
  }

  /**
   * 运行Web界面测试
   */
  runWebTests() {
    this.log('\n🌐 运行Web界面测试...', 'blue');

    if (this.skipTests) {
      this.log('⚠️ 跳过Web界面测试', 'yellow');
      return true;
    }

    try {
      this.execCommand('npm run web:test', '执行Web界面测试');
      this.testResults.web = true;
      return true;
    } catch (error) {
      this.log('❌ Web界面测试失败', 'red');
      this.testResults.web = false;

      if (!this.force) {
        process.exit(1);
      }

      this.log('⚠️ 强制模式，继续发布...', 'yellow');
      return false;
    }
  }

  /**
   * 运行代码检查
   */
  runLintCheck() {
    this.log('\n📋 运行代码检查...', 'blue');

    if (this.skipTests) {
      this.log('⚠️ 跳过代码检查', 'yellow');
      return true;
    }

    try {
      this.execCommand('npm run lint', '执行代码检查', { exitOnError: false });
      this.testResults.lint = true;
      return true;
    } catch (error) {
      this.log('⚠️ 代码检查发现问题，但继续发布', 'yellow');
      this.testResults.lint = false;
      return false;
    }
  }

  /**
   * 构建项目
   */
  buildProject() {
    this.log('\n🔨 检查构建需求...', 'blue');

    if (this.packageJson.scripts && this.packageJson.scripts.build) {
      this.execCommand('npm run build', '构建项目');
    } else {
      this.log('ℹ️ 无需构建步骤', 'cyan');
    }

    // 检查Web界面构建
    const webPackageJson = path.join(WEB_INTERFACE_PATH, 'package.json');
    if (fs.existsSync(webPackageJson)) {
      const webPkg = JSON.parse(fs.readFileSync(webPackageJson, 'utf8'));
      if (webPkg.scripts && webPkg.scripts.build) {
        this.execCommand(
          'npm run build',
          'Web界面构建',
          { cwd: WEB_INTERFACE_PATH }
        );
      }
    }
  }

  /**
   * 显示发布前摘要
   */
  async showPublishSummary() {
    this.log('\n📋 发布前摘要', 'bold');
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    this.log(`📦 包名: ${this.packageJson.name}`, 'cyan');
    this.log(`🏷️ 版本: ${this.packageJson.version}`, 'cyan');
    this.log(`📡 仓库: ${this.registry}`, 'cyan');
    this.log(`🌐 Web界面: ${fs.existsSync(WEB_INTERFACE_PATH) ? '✅ 包含' : '❌ 缺失'}`, 'cyan');

    this.log('\n🧪 测试结果:', 'blue');
    this.log(`   主测试: ${this.testResults.main ? '✅ 通过' : '❌ 失败'}`,
      this.testResults.main ? 'green' : 'red');
    this.log(`   Web测试: ${this.testResults.web ? '✅ 通过' : '❌ 失败'}`,
      this.testResults.web ? 'green' : 'red');
    this.log(`   代码检查: ${this.testResults.lint ? '✅ 通过' : '⚠️ 有警告'}`,
      this.testResults.lint ? 'green' : 'yellow');

    if (this.dryRun) {
      this.log('\n🔍 这是干运行模式 - 不会实际发布', 'yellow');
      return true;
    }

    if (this.force) {
      this.log('\n⚡ 强制发布模式 - 跳过确认', 'yellow');
      return true;
    }

    const answer = await this.ask('\n确认发布? (y/N): ');
    return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
  }

  /**
   * 发布包
   */
  publishPackage() {
    this.log('\n🚀 发布到npm仓库...', 'blue');

    if (this.dryRun) {
      this.log('[DRY RUN] 模拟发布完成', 'yellow');
      return true;
    }

    const publishCommand = `npm publish --registry=${this.registry}`;
    this.execCommand(publishCommand, '发布包');

    return true;
  }

  /**
   * 验证发布结果
   */
  async verifyPublish() {
    this.log('\n✅ 验证发布结果...', 'blue');

    if (this.dryRun) {
      this.log('[DRY RUN] 跳过发布验证', 'yellow');
      return;
    }

    // 等待一下让npm同步
    this.log('等待npm同步...', 'cyan');
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      const viewCommand = `npm view ${this.packageJson.name}@${this.packageJson.version} --registry=${this.registry}`;
      this.execCommand(viewCommand, '查看发布的包信息');

      this.log('\n🎉 发布成功！', 'green');
      this.log(`📦 安装命令: npm install -g ${this.packageJson.name}@${this.packageJson.version}`, 'cyan');
      this.log(`🌐 Web界面: ${this.packageJson.name} web:start`, 'cyan');

      // 测试安装
      const testInstall = await this.ask('是否测试安装? (y/N): ');
      if (testInstall.toLowerCase() === 'y') {
        await this.testInstallation();
      }

    } catch (error) {
      this.log('⚠️ 无法验证发布结果，但发布过程已完成', 'yellow');
    }
  }

  /**
   * 测试安装
   */
  async testInstallation() {
    this.log('\n🧪 测试安装...', 'blue');

    try {
      // 全局安装
      this.execCommand(
        `npm install -g ${this.packageJson.name}@${this.packageJson.version} --registry=${this.registry}`,
        '全局安装测试'
      );

      // 测试基本命令
      this.execCommand('jtcc --version', '测试版本命令');

      // 测试Web界面命令
      this.execCommand('jtcc-web --help', '测试Web界面命令');

      this.log('✅ 安装测试通过！', 'green');

    } catch (error) {
      this.log('⚠️ 安装测试失败，请手动验证', 'yellow');
    }
  }

  /**
   * 主发布流程
   */
  async publish() {
    this.log(colors.bold('\n🚀 JTCC NPM发布工具'), 'blue');
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    if (this.dryRun) {
      this.log('🔍 干运行模式 - 不会实际发布', 'yellow');
    }

    try {
      // 1. 验证包配置
      this.validatePackage();

      // 2. 验证Web界面
      this.validateWebInterface();

      // 3. 检查npm认证
      await this.checkNpmAuth();

      // 4. 运行测试
      this.runMainTests();
      this.runWebTests();
      this.runLintCheck();

      // 5. 构建项目
      this.buildProject();

      // 6. 显示发布摘要并确认
      const confirmed = await this.showPublishSummary();

      if (!confirmed) {
        this.log('📦 发布已取消', 'yellow');
        return false;
      }

      // 7. 发布包
      this.publishPackage();

      // 8. 验证发布
      await this.verifyPublish();

      this.log('\n✨ 发布流程完成！', 'green');
      return true;

    } catch (error) {
      this.log('\n❌ 发布过程中发生错误:', 'red');
      this.log(error.message, 'red');
      process.exit(1);
    }
  }
}

// 命令行参数处理
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    skipTests: args.includes('--skip-tests'),
    force: args.includes('--force'),
    internal: args.includes('--internal'),
    help: args.includes('--help') || args.includes('-h')
  };

  // 自定义仓库
  const registryIndex = args.findIndex(arg => arg === '--registry');
  if (registryIndex !== -1 && args[registryIndex + 1]) {
    options.registry = args[registryIndex + 1];
  }

  return options;
}

// 显示帮助
function showHelp() {
  console.log(`
${colors.bold('JTCC NPM发布工具')}

${colors.cyan('使用方法:')}
  npm run publish              # 发布到公共NPM
  npm run publish:dry          # 干运行模式
  npm run publish:force        # 强制发布

${colors.cyan('选项:')}
  --help, -h                  显示帮助信息
  --dry-run                   干运行模式，不实际发布
  --skip-tests                跳过测试步骤
  --force                     强制发布，跳过确认和测试失败
  --internal                  发布到内部仓库
  --registry <url>            指定自定义仓库地址

${colors.cyan('发布流程:')}
  1. 验证package.json配置
  2. 验证Web界面文件完整性
  3. 检查npm认证状态
  4. 运行主测试套件
  5. 运行Web界面测试
  6. 执行代码检查
  7. 构建项目（如果需要）
  8. 显示发布摘要并确认
  9. 发布到指定仓库
  10. 验证发布结果

${colors.cyan('示例:')}
  npm run publish              # 标准发布流程
  npm run publish:dry          # 验证发布配置
  node scripts/publish-npm.js --internal --force
  `);
}

// 主程序
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  const publisher = new PublishManager(options);
  await publisher.publish();
}

// 执行
if (require.main === module) {
  main().catch(error => {
    console.error(colors.red('❌ 发布失败:'), error.message);
    process.exit(1);
  });
}

module.exports = { PublishManager, parseArgs, showHelp };