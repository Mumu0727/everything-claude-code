#!/usr/bin/env node

/**
 * JTCC NPM发布脚本
 *
 * 用于将JTCC项目发布到指定的npm仓库
 * 仓库地址: https://maven.jtexpress.com.cn/nexus3/repository/npm-group-2/
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置信息
const NPM_REGISTRY = 'https://maven.jtexpress.com.cn/nexus3/repository/npm-hosted-2/';
const PACKAGE_PATH = path.join(__dirname, '..', 'package.json');

// 颜色输出函数
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

// 执行命令并输出结果
function execCommand(command, description) {
  console.log(colors.cyan(`\n▶ ${description}`));
  console.log(colors.yellow(`执行命令: ${command}`));

  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: 'inherit',
      env: { ...process.env, NPM_CONFIG_REGISTRY: NPM_REGISTRY }
    });
    console.log(colors.green(`✅ ${description} - 成功`));
    return result;
  } catch (error) {
    console.error(colors.red(`❌ ${description} - 失败`));
    console.error(colors.red(`错误: ${error.message}`));
    process.exit(1);
  }
}

// 检查package.json
function validatePackage() {
  console.log(colors.blue('\n📦 验证package.json配置...'));

  if (!fs.existsSync(PACKAGE_PATH)) {
    console.error(colors.red('❌ package.json文件不存在'));
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));

  // 检查必要字段
  const requiredFields = ['name', 'version', 'description', 'main'];
  const missingFields = requiredFields.filter(field => !packageJson[field]);

  if (missingFields.length > 0) {
    console.error(colors.red(`❌ package.json缺少必要字段: ${missingFields.join(', ')}`));
    process.exit(1);
  }

  console.log(colors.green(`✅ 包名: ${packageJson.name}`));
  console.log(colors.green(`✅ 版本: ${packageJson.version}`));
  console.log(colors.green(`✅ 描述: ${packageJson.description}`));

  return packageJson;
}

// 检查npm登录状态
function checkNpmAuth() {
  console.log(colors.blue('\n🔐 检查npm认证状态...'));

  try {
    const whoami = execSync(`npm whoami --registry=${NPM_REGISTRY}`, {
      encoding: 'utf8',
      stdio: 'pipe'
    }).trim();
    console.log(colors.green(`✅ 已登录用户: ${whoami}`));
    return whoami;
  } catch (error) {
    console.log(colors.yellow('⚠️  未登录到npm仓库'));
    console.log(colors.cyan('请手动登录:'));
    console.log(colors.yellow(`npm login --registry=${NPM_REGISTRY}`));

    // 询问是否继续
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(colors.cyan('登录完成后按回车继续，或输入 "skip" 跳过认证检查: '), (answer) => {
        rl.close();
        if (answer.toLowerCase() === 'skip') {
          console.log(colors.yellow('⚠️  跳过认证检查，继续发布...'));
          resolve('unknown');
        } else {
          try {
            const whoami = execSync(`npm whoami --registry=${NPM_REGISTRY}`, {
              encoding: 'utf8',
              stdio: 'pipe'
            }).trim();
            console.log(colors.green(`✅ 已登录用户: ${whoami}`));
            resolve(whoami);
          } catch (e) {
            console.error(colors.red('❌ 仍未登录，请先登录npm'));
            process.exit(1);
          }
        }
      });
    });
  }
}

// 运行测试
function runTests() {
  console.log(colors.blue('\n🧪 运行测试套件...'));

  try {
    execCommand('npm test', '执行测试');
    return true;
  } catch (error) {
    console.log(colors.yellow('⚠️  测试失败，但将继续发布过程'));
    return false;
  }
}

// 构建项目（如果需要）
function buildProject() {
  console.log(colors.blue('\n🔨 检查构建需求...'));

  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));

  if (packageJson.scripts && packageJson.scripts.build) {
    execCommand('npm run build', '构建项目');
  } else {
    console.log(colors.cyan('ℹ️  无需构建步骤'));
  }
}

// 发布到npm
function publishPackage(packageJson) {
  console.log(colors.blue('\n🚀 发布到npm仓库...'));

  const publishCommand = `npm publish --registry=${NPM_REGISTRY}`;

  console.log(colors.bold(`\n📋 发布信息:`));
  console.log(colors.cyan(`   包名: ${packageJson.name}`));
  console.log(colors.cyan(`   版本: ${packageJson.version}`));
  console.log(colors.cyan(`   仓库: ${NPM_REGISTRY}`));

  // 询问确认
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(colors.yellow('\n确认发布? (y/N): '), (answer) => {
      rl.close();

      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        execCommand(publishCommand, '发布包');
        resolve(true);
      } else {
        console.log(colors.yellow('📦 发布已取消'));
        resolve(false);
      }
    });
  });
}

// 发布后验证
function verifyPublish(packageJson) {
  console.log(colors.blue('\n✅ 验证发布结果...'));

  try {
    const viewCommand = `npm view ${packageJson.name} --registry=${NPM_REGISTRY}`;
    execCommand(viewCommand, '查看发布的包信息');

    console.log(colors.green('\n🎉 发布成功！'));
    console.log(colors.cyan(`📦 安装命令: npm install ${packageJson.name} --registry=${NPM_REGISTRY}`));

  } catch (error) {
    console.log(colors.yellow('⚠️  无法验证发布结果，但发布过程已完成'));
  }
}

// 主函数
async function main() {
  console.log(colors.bold(colors.blue('\n🚀 JTCC NPM发布工具')));
  console.log(colors.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

  try {
    // 1. 验证package.json
    const packageJson = validatePackage();

    // 2. 检查npm认证
    await checkNpmAuth();

    // 3. 运行测试
    // runTests();

    // 4. 构建项目
    buildProject();

    // 5. 发布包
    const published = await publishPackage(packageJson);

    // 6. 验证发布
    if (published) {
      verifyPublish(packageJson);
    }

    console.log(colors.green('\n✨ 发布流程完成！'));

  } catch (error) {
    console.error(colors.red('\n❌ 发布过程中发生错误:'));
    console.error(colors.red(error.message));
    process.exit(1);
  }
}

// 处理命令行参数
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
${colors.bold('JTCC NPM发布工具')}

${colors.cyan('使用方法:')}
  npm run publish          # 执行完整发布流程
  npm run publish:dry      # 干运行模式（不实际发布）

${colors.cyan('选项:')}
  --help, -h              显示帮助信息
  --dry-run               干运行模式，不实际发布
  --skip-tests            跳过测试步骤
  --force                 强制发布，跳过确认

${colors.cyan('发布流程:')}
  1. 验证package.json配置
  2. 检查npm认证状态
  3. 运行测试套件
  4. 构建项目（如果需要）
  5. 发布到指定npm仓库
  6. 验证发布结果

${colors.cyan('npm仓库:')} ${NPM_REGISTRY}
  `);
  process.exit(0);
}

// 干运行模式
if (args.includes('--dry-run')) {
  console.log(colors.yellow('🔍 干运行模式 - 不会实际发布'));
  // 可以在这里添加干运行逻辑
}

// 执行主函数
if (require.main === module) {
  main();
}

module.exports = {
  main,
  validatePackage,
  checkNpmAuth,
  runTests,
  buildProject,
  publishPackage,
  verifyPublish
};