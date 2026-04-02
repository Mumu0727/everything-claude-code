#!/usr/bin/env node

/**
 * JTCC Web Interface 启动脚本
 * 提供可视化界面来浏览命令、代理和技能
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 解析命令行参数
function parseArgs(args) {
  const options = {
    port: 3005,
    host: 'localhost',
    daemon: false,
    open: true,
    dev: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--port':
      case '-p':
        options.port = parseInt(args[++i]) || 3000;
        break;

      case '--host':
      case '-h':
        options.host = args[++i] || 'localhost';
        break;

      case '--daemon':
      case '-d':
        options.daemon = true;
        options.open = false;
        break;

      case '--no-open':
        options.open = false;
        break;

      case '--dev':
        options.dev = true;
        break;

      case '--help':
        options.help = true;
        break;
    }
  }

  return options;
}

// 显示帮助信息
function showHelp() {
  console.log(`
🌐 JTCC Web Interface - Claude Code插件可视化界面

用法:
  /web-interface [选项]

选项:
  --port, -p <端口>     指定服务器端口 (默认: 3000)
  --host, -h <主机>     指定服务器主机 (默认: localhost)
  --daemon, -d         后台运行模式
  --no-open           不自动打开浏览器
  --dev               开发模式（启用调试）
  --help              显示此帮助信息

示例:
  /web-interface                    # 启动界面（默认端口3000）
  /web-interface --port 8080        # 指定端口8080
  /web-interface --daemon           # 后台运行
  /web-interface --dev              # 开发模式

快捷键:
  Ctrl+K        聚焦搜索框
  Alt+1/2/3     切换分区
  Ctrl+R        刷新当前分区
  Esc           关闭模态框

功能特性:
  ✅ 可视化命令浏览器
  ✅ 智能搜索和筛选
  ✅ 详细的命令说明
  ✅ 响应式设计
  ✅ 主题切换
  ✅ 快捷键支持
  ✅ 离线缓存

访问地址: http://localhost:<端口>
  `);
}

// 检查端口是否可用
async function checkPortAvailable(port, host = 'localhost') {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();

    server.listen(port, host, () => {
      server.once('close', () => resolve(true));
      server.close();
    });

    server.on('error', () => resolve(false));
  });
}

// 打开浏览器
function openBrowser(url) {
  const open = (url) => {
    const { exec } = require('child_process');
    const platform = process.platform;

    let command;
    if (platform === 'darwin') {
      command = `open "${url}"`;
    } else if (platform === 'win32') {
      command = `start "" "${url}"`;
    } else {
      command = `xdg-open "${url}"`;
    }

    exec(command, (error) => {
      if (error) {
        console.warn('⚠️  无法自动打开浏览器，请手动访问:', url);
      }
    });
  };

  // 延迟打开，等待服务器启动
  setTimeout(() => open(url), 1000);
}

// 启动Web服务器
async function startWebInterface(options) {
  const webInterfaceDir = path.join(__dirname, '..', 'web-interface');
  const serverScript = path.join(webInterfaceDir, 'server', 'app.js');

  // 检查Web界面文件是否存在
  if (!fs.existsSync(serverScript)) {
    console.error('❌ Web界面文件未找到，请确保web-interface目录存在');
    console.error('   文件路径:', serverScript);
    process.exit(1);
  }

  // 检查端口是否可用
  const portAvailable = await checkPortAvailable(options.port, options.host);
  if (!portAvailable) {
    console.error(`❌ 端口 ${options.port} 已被占用`);
    console.error(`💡 请尝试使用其他端口: /web-interface --port ${options.port + 1}`);
    process.exit(1);
  }

  // 设置环境变量
  const env = {
    ...process.env,
    PORT: options.port.toString(),
    HOST: options.host,
    NODE_ENV: options.dev ? 'development' : 'production'
  };

  if (options.dev) {
    env.DEBUG = 'jtcc:*';
  }

  // 启动服务器
  const spawnOptions = {
    cwd: webInterfaceDir,
    env: env,
    stdio: options.daemon ? 'ignore' : 'inherit',
    detached: options.daemon
  };

  console.log('🚀 启动JTCC Web界面...');
  console.log(`📍 服务地址: http://${options.host}:${options.port}`);
  console.log(`📁 工作目录: ${webInterfaceDir}`);

  if (options.daemon) {
    console.log('🔄 后台运行模式');
  }

  const child = spawn('node', [serverScript], spawnOptions);

  if (options.daemon) {
    child.unref();
    console.log(`✅ Web界面已在后台启动 (PID: ${child.pid})`);
    console.log(`🌐 访问地址: http://${options.host}:${options.port}`);
    console.log(`🛑 停止服务: kill ${child.pid}`);
    process.exit(0);
  } else {
    // 打开浏览器
    if (options.open) {
      openBrowser(`http://${options.host}:${options.port}`);
    }

    // 处理进程退出
    process.on('SIGINT', () => {
      console.log('\n📡 接收到终止信号，正在关闭Web界面...');
      child.kill('SIGTERM');
      setTimeout(() => {
        console.log('✅ Web界面已关闭');
        process.exit(0);
      }, 1000);
    });

    process.on('SIGTERM', () => {
      child.kill('SIGTERM');
      process.exit(0);
    });

    child.on('error', (error) => {
      console.error('❌ 启动Web界面失败:', error.message);
      process.exit(1);
    });

    child.on('exit', (code) => {
      if (code !== 0) {
        console.error(`❌ Web界面异常退出，代码: ${code}`);
        process.exit(code);
      }
    });
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.help) {
    showHelp();
    return;
  }

  // 验证端口范围
  if (options.port < 1 || options.port > 65535) {
    console.error('❌ 端口必须在1-65535范围内');
    process.exit(1);
  }

  try {
    await startWebInterface(options);
  } catch (error) {
    console.error('❌ 启动失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ 发生未处理的错误:', error);
    process.exit(1);
  });
}

module.exports = {
  startWebInterface,
  parseArgs,
  checkPortAvailable
};