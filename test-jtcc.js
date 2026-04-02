#!/usr/bin/env node

console.log('=== JTCC 调试开始 ===');
console.log('当前工作目录:', process.cwd());
console.log('Node.js 版本:', process.version);
console.log('脚本路径:', __filename);
console.log('脚本目录:', __dirname);

try {
    console.log('\n--- 测试 commander 加载 ---');
    const { program } = require("./bin/jtcc/commander");
    console.log('Commander 加载成功');

    console.log('\n--- 测试 package.json 加载 ---');
    const pkg = require("./package.json");
    console.log('Package.json 加载成功，版本:', pkg.version);

    console.log('\n--- 设置程序信息 ---');
    program
        .name("jtcc")
        .description("JavaScript TypeScript Claude Code - 前端开发专用 AI 助手")
        .version(pkg.version);

    console.log('程序设置成功');

    // 添加状态命令
    program
        .command("status")
        .description("显示 JTCC 状态信息")
        .action(() => {
            console.log("📊 JTCC 状态");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log(`🏷️  版本: ${pkg.version}`);
            console.log("🎯 专注领域: 前端开发 + 物流专业");
            console.log("✅ 状态: 正常运行");
        });

    console.log('\n--- 解析命令行参数 ---');
    console.log('命令行参数:', process.argv);

    program.parse(process.argv);

    // 如果没有提供命令，显示状态信息
    if (!process.argv.slice(2).length) {
        console.log('\n--- 执行默认状态命令 ---');
        program.commands.find(cmd => cmd.name() === 'status').action();
    }

} catch (error) {
    console.error('❌ 错误:', error.message);
    console.error('堆栈:', error.stack);
}

console.log('\n=== JTCC 调试结束 ===');