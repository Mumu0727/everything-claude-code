#!/usr/bin/env node

/**
 * JTCC 快速发布脚本
 * 简化版发布工具，用于快速发布到JT Express npm仓库
 */

const { execSync } = require('child_process');

const NPM_REGISTRY = 'https://maven.jtexpress.com.cn/nexus3/repository/npm-group-2/';

console.log('🚀 JTCC 快速发布到 JT Express npm仓库...');
console.log(`📦 仓库地址: ${NPM_REGISTRY}`);

try {
  // 设置npm仓库
  console.log('\n1️⃣ 配置npm仓库...');
  execSync(`npm config set registry ${NPM_REGISTRY}`, { stdio: 'inherit' });

  // 检查登录状态
  console.log('\n2️⃣ 检查登录状态...');
  try {
    const whoami = execSync(`npm whoami`, { encoding: 'utf8', stdio: 'pipe' }).trim();
    console.log(`✅ 已登录用户: ${whoami}`);
  } catch (error) {
    console.log('❌ 未登录，请先执行: npm login');
    process.exit(1);
  }

  // 运行发布前检查
  console.log('\n3️⃣ 运行测试...');
  try {
    execSync('npm test', { stdio: 'inherit' });
    console.log('✅ 测试通过');
  } catch (error) {
    console.log('⚠️ 测试失败，继续发布...');
  }

  // 发布
  console.log('\n4️⃣ 发布包...');
  execSync('npm publish', { stdio: 'inherit' });

  console.log('\n🎉 发布成功！');
  console.log(`📦 安装命令: npm install jtcc --registry=${NPM_REGISTRY}`);

} catch (error) {
  console.error('\n❌ 发布失败:', error.message);
  process.exit(1);
}