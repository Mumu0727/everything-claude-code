const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API路由
app.use('/api/commands', require('./routes/commands'));
app.use('/api/agents', require('./routes/agents'));
app.use('/api/skills', require('./routes/skills'));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'JTCC Web Interface API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 根路径重定向到主页
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 404处理
app.use('*', (req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    res.status(404).json({
      success: false,
      error: 'API端点未找到'
    });
  } else {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
  });
});

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(`\\n🚀 JTCC Web Interface Server 启动成功!`);
  console.log(`📍 本地访问: http://localhost:${PORT}`);
  console.log(`🔗 API文档: http://localhost:${PORT}/api/health`);
  console.log(`⏰ 启动时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log(`\\n💡 使用 Ctrl+C 停止服务器\\n`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('\\n📡 接收到终止信号，正在关闭服务器...');
  server.close(() => {
    console.log('✅ 服务器已安全关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\\n📡 接收到中断信号，正在关闭服务器...');
  server.close(() => {
    console.log('✅ 服务器已安全关闭');
    process.exit(0);
  });
});

module.exports = app;