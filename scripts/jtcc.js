#!/usr/bin/env node

/**
 * J&T Claude Code (JTCC) - Installation CLI
 *
 * Usage:
 *   jtcc install [spec]      # Global installation (install to ~/.claude/)
 *   jtcc i [spec]            # Short alias for install
 *   jtcc --project           # Project-level installation (install to current project .claude/)
 *   jtcc --help              # Show help
 *
 * Selective installation examples:
 *   jtcc install skills:frontend-patterns,tdd-workflow
 *   jtcc i agents:planner,tdd-guide
 *   jtcc install hooks:session-start,session-end
 *   jtcc i commands:plan,tdd,code-review
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Default components to install
const DEFAULT_COMPONENTS = {
  skills: [
    'frontend-patterns',
    'frontend-slides',
    'tdd-workflow',
    'e2e-testing',
    'nextjs-turbopack',
    'coding-standards',
    'search-first'
  ],
  agents: [
    'planner',
    'tdd-guide',
    'code-reviewer',
    'architect',
    'security-reviewer',
    'e2e-runner',
    'refactor-cleaner'
  ],
  commands: [
    'plan',
    'tdd',
    'code-review',
    'e2e',
    'refactor',
    'verify',
    'test',
    'multi'
  ],
  rules: ['common', 'typescript'],
  mcp: true
};

// Parse command line arguments
function parseArgs(args) {
  const options = {
    project: false,
    with: null,
    help: false
  };

  for (const arg of args) {
    if (arg === '--project') {
      options.project = true;
    } else if (arg.startsWith('--with=')) {
      options.with = arg.substring(7);
    } else if (arg.startsWith('--with')) {
      const idx = args.indexOf(arg);
      if (idx + 1 < args.length && !args[idx + 1].startsWith('--')) {
        options.with = args[idx + 1];
      }
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }

  return options;
}

// Show help message
function showHelp() {
  console.log(`
J&T Claude Code (JTCC) - 前端聚焦的 AI 编程助手

安装命令:
  jtcc install [spec]         # 全局安装（安装到 ~/.claude/）
  jtcc i [spec]               # install 的简写
  jtcc --project              # 项目级安装（安装到当前项目 .claude/）

管理命令:
  jtcc list                   # 列出已安装的组件
  jtcc status                 # 显示 JTCC 状态信息
  jtcc update                 # 更新 JTCC 到最新版本

选择性安装:
  jtcc install skills:frontend-patterns,tdd-workflow
  jtcc i agents:planner,tdd-guide
  jtcc install hooks:session-start,session-end
  jtcc i commands:plan,tdd,code-review

OpenSpec CLI 命令:
  jtcc spec install            # 安装 openspec-cli
  jtcc spec init               # 初始化项目
  jtcc spec list               # 列出所有变更
  jtcc spec show <id>          # 显示变更详情
  jtcc spec validate <id>      # 校验变更格式
  jtcc spec help               # 显示帮助信息

更多信息: https://github.com/jt-team/jtcc
`);
}

// Parse --with specification
function parseWithSpec(spec) {
  if (!spec) return null;

  const components = {};
  const parts = spec.split(',');

  for (const part of parts) {
    const [type, value] = part.split(':');

    if (!type || !value) {
      console.error(`Invalid specification: ${part}`);
      process.exit(1);
    }

    const values = value.split(',').map(v => v.trim());

    switch (type.trim()) {
      case 'skills':
        components.skills = values;
        break;
      case 'agents':
        components.agents = values;
        break;
      case 'hooks':
        components.hooks = values;
        break;
      case 'commands':
        // Convert to jtcc- prefixed names
        components.commands = values.map(cmd =>
          cmd.startsWith('jtcc-') ? cmd : `${cmd}`
        );
        break;
      case 'rules':
        components.rules = values;
        break;
      default:
        console.error(`Unknown component type: ${type}`);
        process.exit(1);
    }
  }

  return components;
}

// Get the installation directory
function getInstallDir(isProject) {
  if (isProject) {
    return path.join(process.cwd(), '.claude');
  } else {
    return path.join(os.homedir(), '.claude');
  }
}

// Get jtcc root directory (where agents/, skills/, etc. are located)
function getJtccRoot() {
  // Get the directory of this script
  const scriptDir = path.dirname(__filename);
  // The jtcc root is the parent of the scripts directory
  return path.resolve(scriptDir, '..');
}

// Ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Copy directory recursively
function copyDir(src, dest, filter = null) {
  if (!fs.existsSync(src)) {
    console.warn(`  ⚠ Source does not exist: ${src}`);
    return;
  }

  ensureDir(dest);

  const items = fs.readdirSync(src);

  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);

    if (filter && !filter(item, srcPath)) {
      continue;
    }

    if (stat.isDirectory()) {
      copyDir(srcPath, destPath, filter);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  ✓ Copied: ${item}`);
    }
  }
}

// Copy selected files
function copySelectedItems(srcDir, destDir, items) {
  if (!items || items.length === 0) return;

  ensureDir(destDir);

  for (const item of items) {
    let srcPath = path.join(srcDir, item);
    let destPath = path.join(destDir, item);

    // If not found as directory/file, try with .md extension
    if (!fs.existsSync(srcPath) && !item.endsWith('.md') && !item.endsWith('.json')) {
      srcPath = path.join(srcDir, item + '.md');
      destPath = path.join(destDir, item) + '.md';
    }

    if (fs.existsSync(srcPath)) {
      if (fs.statSync(srcPath).isDirectory()) {
        copyDir(srcPath, destPath);
        console.log(`  ✓ Copied: ${item}/`);
      } else {
        fs.copyFileSync(srcPath, destPath);
        console.log(`  ✓ Copied: ${item}`);
      }
    } else {
      console.warn(`  ⚠ Not found: ${item}`);
    }
  }
}

// Install components
function installComponents(installDir, components) {
  const jtccRoot = getJtccRoot();

  console.log('\n📦 Installing components...');

  // Install skills
  if (components.skills && components.skills.length > 0) {
    console.log('\n🔧 Installing skills...');
    const skillsSrc = path.join(jtccRoot, 'skills');
    const skillsDest = path.join(installDir, 'skills');
    copySelectedItems(skillsSrc, skillsDest, components.skills);
  }

  // Install agents
  if (components.agents && components.agents.length > 0) {
    console.log('\n🤖 Installing agents...');
    const agentsSrc = path.join(jtccRoot, 'agents');
    const agentsDest = path.join(installDir, 'agents');
    copySelectedItems(agentsSrc, agentsDest, components.agents);
  }

  // Install commands
  if (components.commands && components.commands.length > 0) {
    console.log('\n📝 Installing commands...');
    const commandsSrc = path.join(jtccRoot, 'commands');
    const commandsDest = path.join(installDir, 'commands/jtcc');
    copySelectedItems(commandsSrc, commandsDest, components.commands);
  }

  // Install rules
  if (components.rules && components.rules.length > 0) {
    console.log('\n📏 Installing rules...');
    const rulesSrc = path.join(jtccRoot, 'rules');
    const rulesDest = path.join(installDir, 'rules');
    copySelectedItems(rulesSrc, rulesDest, components.rules);
  }

  // Install hooks (all or selected)
  if (components.hooks) {
    console.log('\n🪝 Installing hooks...');
    const hooksSrc = path.join(jtccRoot, 'hooks');
    const hooksDest = path.join(installDir, 'hooks');

    if (Array.isArray(components.hooks) && components.hooks.length.length > 0) {
      // Copy selected hooks
      copySelectedItems(hooksSrc, hooksDest, components.hooks);
    } else {
      // Copy all hooks
      copyDir(hooksSrc, hooksDest);
    }
  }

  // Install MCP configs
  if (components.mcp) {
    console.log('\n🔌 Installing MCP configurations...');
    const mcpSrc = path.join(jtccRoot, 'mcp-configs');
    const mcpDest = path.join(installDir, 'mcp-configs');

    if (fs.existsSync(mcpSrc)) {
      copyDir(mcpSrc, mcpDest);
    }
  }
}

// Main installation function
function install(options) {
  const installDir = getInstallDir(options.project);
  const components = options.with
    ? parseWithSpec(options.with)
    : DEFAULT_COMPONENTS;

  console.log('\n🚀 Installing J&T Claude Code (JTCC)');
  console.log(`📁 Target directory: ${installDir}`);
  console.log(`📦 Mode: ${options.project ? 'Project-level' : 'Global'}`);

  if (options.with) {
    console.log(`🎯 Selective installation: ${options.with}`);
  } else {
    console.log(`🎯 Full installation (default components)`);
  }

  // Ensure installation directory exists
  ensureDir(installDir);

  // Install components
  installComponents(installDir, components);

  console.log('\n✅ Installation complete!');
  console.log(`\n💡 To use JTCC commands, run:`);
  console.log(`   /jtcc:plan     - Create implementation plan`);
  console.log(`   /jtcc:tdd      - TDD workflow`);
  console.log(`   /jtcc:code-review - Code review`);
  console.log(`   /jtcc:e2e      - E2E test generation`);
  console.log(`   /jtcc:refactor - Dead code cleanup`);
  console.log(`   /jtcc:multi    - Frontend multi-service orchestration`);
  console.log(`\n📖 For OpenSpec commands, use:`);
  console.log(`   jtcc spec list     # List changes`);
  console.log(`   jtcc spec show <id>  # Show change details`);
}

// List installed components
function listComponents() {
  const installDir = getInstallDir(false);

  console.log('\n📋 J&T Claude Code (JTCC) - 已安装组件');
  console.log(`\n📁 安装目录: ${installDir}`);

  // Check and list skills
  const skillsDir = path.join(installDir, 'skills');
  if (fs.existsSync(skillsDir)) {
    const skills = fs.readdirSync(skillsDir).filter(item =>
      item.endsWith('.md') || fs.statSync(path.join(skillsDir, item)).isDirectory()
    ).map(item => item.replace('.md', '').replace('.json', ''));
    console.log(`\n🔧 Skills (${skills.length}):`);
    if (skills.length > 0) {
      skills.forEach(skill => console.log(`   - ${skill}`));
    } else {
      console.log('   (无)');
    }
  } else {
    console.log(`\n🔧 Skills: (未安装)`);
  }

  // Check and list agents
  const agentsDir = path.join(installDir, 'agents');
  if (fs.existsSync(agentsDir)) {
    const agents = fs.readdirSync(agentsDir).filter(item =>
      item.endsWith('.md') || fs.statSync(path.join(agentsDir, item)).isDirectory()
    ).map(item => item.replace('.md', '').replace('.json', ''));
    console.log(`\n🤖 Agents (${agents.length}):`);
    if (agents.length > 0) {
      agents.forEach(agent => console.log(`   - ${agent}`));
    } else {
      console.log('   (无)');
    }
  } else {
    console.log(`\n🤖 Agents: (未安装)`);
  }

  // Check and list commands
  const commandsDir = path.join(installDir, 'commands');
  if (fs.existsSync(commandsDir)) {
    const commands = fs.readdirSync(commandsDir).filter(item =>
      item.endsWith('.md') || fs.statSync(path.join(commandsDir, item)).isDirectory()
    ).map(item => item.replace('.md', '').replace('.json', ''));
    console.log(`\n📝 Commands (${commands.length}):`);
    if (commands.length > 0) {
      commands.forEach(cmd => console.log(`   - ${cmd}`));
    } else {
      console.log('   (无)');
    }
  } else {
    console.log(`\n📝 Commands: (未安装)`);
  }

  // Check and list rules
  const rulesDir = path.join(installDir, 'rules');
  if (fs.existsSync(rulesDir)) {
    const rules = fs.readdirSync(rulesDir).filter(item =>
      fs.statSync(path.join(rulesDir, item)).isDirectory()
    );
    console.log(`\n📏 Rules (${rules.length}):`);
    if (rules.length > 0) {
      rules.forEach(rule => console.log(`   - ${rule}`));
    } else {
      console.log('   (无)');
    }
  } else {
    console.log(`\n📏 Rules: (未安装)`);
  }

  // Check MCP configs
  const mcpDir = path.join(installDir, 'mcp-configs');
  if (fs.existsSync(mcpDir)) {
    const mcpConfigs = fs.readdirSync(mcpDir);
    console.log(`\n🔌 MCP Configs (${mcpConfigs.length}):`);
    if (mcpConfigs.length > 0) {
      mcpConfigs.forEach(config => console.log(`   - ${config}`));
    } else {
      console.log('   (无)');
    }
  } else {
    console.log(`\n🔌 MCP Configs: (未安装)`);
  }

  // Check hooks
  const hooksDir = path.join(installDir, 'hooks');
  if (fs.existsSync(hooksDir)) {
    const hooks = fs.readdirSync(hooksDir);
    console.log(`\n🪝 Hooks (${hooks.length}):`);
    if (hooks.length > 0) {
      hooks.forEach(hook => console.log(`   - ${hook}`));
    } else {
      console.log('   (无)');
    }
  } else {
    console.log(`\n🪝 Hooks: (未安装)`);
  }
}

// Show JTCC status
function showStatus() {
  const installDir = getInstallDir(false);
  const packageJsonPath = path.join(getJtccRoot(), 'package.json');

  console.log('\n📊 J&T Claude Code (JTCC) - 状态信息');

  // Show JTCC version
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      console.log(`\n📦 版本: ${packageJson.version || 'unknown'}`);
    } catch (error) {
      console.log(`\n📦 版本: 无法读取`);
    }
  }

  console.log(`\n📁 安装目录: ${installDir}`);
  console.log(`📁 JTCC 根目录: ${getJtccRoot()}`);

  // Check installation status
  const skillsInstalled = fs.existsSync(path.join(installDir, 'skills'));
  const agentsInstalled = fs.existsSync(path.join(installDir, 'agents'));
  const commandsInstalled = fs.existsSync(path.join(installDir, 'commands'));
  const rulesInstalled = fs.existsSync(path.join(installDir, 'rules'));
  const hooksInstalled = fs.existsSync(path.join(installDir, 'hooks'));
  const mcpInstalled = fs.existsSync(path.join(installDir, 'mcp-configs'));

  console.log(`\n📦 组件状态:`);
  console.log(`   Skills:      ${skillsInstalled ? '✅ 已安装' : '❌ 未安装'}`);
  console.log(`   Agents:      ${agentsInstalled ? '✅ 已安装' : '❌ 未安装'}`);
  console.log(`   Commands:    ${commandsInstalled ? '✅ 已安装' : '❌ 未安装'}`);
  console.log(`   Rules:       ${rulesInstalled ? '✅ 已安装' : '❌ 未安装'}`);
  console.log(`   Hooks:       ${hooksInstalled ? '✅ 已安装' : '❌ 未安装'}`);
  console.log(`   MCP Configs: ${mcpInstalled ? '✅ 已安装' : '❌ 未安装'}`);

  // Check Node.js version
  console.log(`\n🔧 运行环境:`);
  console.log(`   Node.js:     ${process.version}`);
  console.log(`   Platform:    ${process.platform}`);
  console.log(`   Architecture: ${process.arch}`);
}

// Update JTCC
function update() {
  console.log('\n🔄 更新 J&T Claude Code (JTCC)...');

  const { execSync } = require('child_process');

  try {
    // Get current package manager
    let packageManager = 'npm';
    try {
      const pnpmLock = fs.existsSync(path.join(getJtccRoot(), 'pnpm-lock.yaml'));
      const yarnLock = fs.existsSync(path.join(getJtccRoot(), 'yarn.lock'));
      const bunLock = fs.existsSync(path.join(getJtccRoot(), 'bun.lockb'));

      if (pnpmLock) packageManager = 'pnpm';
      else if (yarnLock) packageManager = 'yarn';
      else if (bunLock) packageManager = 'bun';
    } catch (error) {
      // Use npm as default
    }

    console.log(`\n📦 检测到包管理器: ${packageManager}`);
    console.log(`\n⬇️  正在更新 jtcc...`);

    let updateCommand;
    if (packageManager === 'npm') {
      updateCommand = 'npm update -g jtcc';
    } else if (packageManager === 'pnpm') {
      updateCommand = 'pnpm update -g jtcc';
    } else if (packageManager === 'yarn') {
      updateCommand = 'yarn global upgrade jtcc';
    } else if (packageManager === 'bun') {
      updateCommand = 'bun update -g jtcc';
    }

    console.log(`\n🔧 执行命令: ${updateCommand}`);
    execSync(updateCommand, { stdio: 'inherit' });

    console.log('\n✅ 更新完成!');
    console.log('\n💡 重新安装组件以应用更新:');
    console.log('   jtcc install');
  } catch (error) {
    console.error('\n❌ 更新失败:', error.message);
    console.log('\n💡 手动更新尝试:');
    console.log('   npm update -g jtcc');
    console.log('   pnpm update -g jtcc');
    console.log('   yarn global upgrade jtcc');
    console.log('   bun update -g jtcc');
    process.exit(1);
  }
}

// Entry point
function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.help) {
    showHelp();
    return;
  }

  // Handle spec subcommand (OpenSpec CLI passthrough using exec)
  if (args[0] === 'spec') {
    const specArgs = args.slice(1);
    const { exec } = require('child_process');
    if (specArgs.length === 1 && specArgs.includes('init')) {
      specArgs.push(...['--tools', 'claude'])
    }

    exec('openspec ' + specArgs.join(' '), (err, stdout, stderr) => {
      if (err) {
        if (err.code === 'ENOENT') {
          console.error(`\n❌ openspec command not found: ${specArgs[0] || 'openspec'}`);
          console.log('\n💡与其他版本一起安装 openspec-cli。尝试:');
          console.log('  npm install -g @fission-ai/openspec@latest');
          console.log('  pnpm add -g @fission-ai/openspec@latest');
          console.log('  yarn global add @fission-ai/openspec@latest');
          console.log('  bun install -g @fission-ai/openspec@latest');
          console.log('\n或本地安装:');
          console.log('  npm install @fission-ai/openspec@latest');
          process.exit(1);
        } else {
          console.error(`Error executing openspec: ${err.message}`);
          process.exit(1);
        }
      }

      if (stdout) {
        console.log(stdout);
      }

      if (stderr) {
        console.error(stderr);
      }
    });

    return;
  }

  // Handle install/i commands
  if (args[0] === 'install' || args[0] === 'i') {
    // Check for --project flag after install/i
    const projectIndex = args.indexOf('--project');
    if (projectIndex !== -1) {
      options.project = true;
    }

    // Get the spec argument (next argument after install/i, skipping --project)
    let specIndex = 1;
    for (let i = 1; i < args.length; i++) {
      if (args[i] !== '--project') {
        specIndex = i;
        break;
      }
    }

    // Only use with spec if it exists and is not a flag
    if (args[specIndex] && !args[specIndex].startsWith('--')) {
      options.with = args[specIndex];
    }

    install(options);
    return;
  }

  // Handle list command
  if (args[0] === 'list') {
    listComponents();
    return;
  }

  // Handle status command
  if (args[0] === 'status') {
    showStatus();
    return;
  }

  // Handle update command
  if (args[0] === 'update') {
    update();
    return;
  }

  // Default behavior: install without explicit install command (for backward compatibility)
  install(options);
}

// Run
main();
