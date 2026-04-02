---
description: 启动JTCC可视化Web界面，在浏览器中查看所有命令、代理和技能
---

# Web Interface Command

此命令启动JTCC的可视化Web界面，提供友好的图形界面来浏览和搜索所有可用的命令、代理和技能。

## 功能特性

### 🖥️ 可视化界面
- **命令浏览器**: 分类展示所有可用命令
- **智能搜索**: 支持命令名称、描述、类型搜索
- **详情查看**: 查看命令详细说明、用法示例、代码示例
- **响应式设计**: 支持桌面和移动设备

### 🔍 强大搜索
- **实时搜索**: 输入即搜，无需等待
- **搜索建议**: 智能提示相关命令和类型
- **搜索历史**: 记住常用搜索词
- **高级筛选**: 按类型、功能分类筛选

### 📊 统计信息
- **命令统计**: 各类型命令数量统计
- **最近更新**: 显示最近修改的命令
- **使用分析**: 命令使用频率统计

### 🎨 用户体验
- **主题切换**: 支持深色/浅色主题
- **快捷键**: 丰富的键盘快捷键
- **复制功能**: 一键复制命令到剪贴板
- **离线支持**: 基础功能支持离线使用

## 使用方法

### 基础用法

```bash
# 启动Web界面（默认端口3000）
/web-interface

# 指定端口启动
/web-interface --port 8080

# 在后台启动
/web-interface --daemon

# 显示帮助信息
/web-interface --help
```

### 命令选项

| 选项 | 描述 | 默认值 |
|------|------|--------|
| `--port` | 指定服务器端口 | 3000 |
| `--host` | 指定服务器主机 | localhost |
| `--daemon` | 后台运行模式 | false |
| `--open` | 自动打开浏览器 | true |
| `--dev` | 开发模式（启用热重载） | false |

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+K` | 聚焦搜索框 |
| `Alt+1` | 切换到命令分区 |
| `Alt+2` | 切换到代理分区 |
| `Alt+3` | 切换到技能分区 |
| `Ctrl+R` | 刷新当前分区 |
| `Esc` | 关闭模态框或清除搜索 |

## 技术架构

### 后端技术栈
- **Node.js + Express**: 轻量级Web服务器
- **动态解析**: 实时扫描commands、agents、skills目录
- **Markdown处理**: 解析frontmatter和内容结构
- **RESTful API**: 提供标准化的数据接口

### 前端技术栈
- **原生JavaScript**: 无框架依赖，快速加载
- **Bootstrap 5**: 现代响应式UI组件
- **模块化设计**: 组件化架构，易于维护
- **PWA特性**: 支持离线缓存和安装

### API端点

```
GET  /api/commands           # 获取所有命令
GET  /api/commands/:id       # 获取单个命令详情
GET  /api/commands/search/:q # 搜索命令
GET  /api/commands/stats/overview # 获取命令统计

GET  /api/agents            # 获取所有代理
GET  /api/agents/:id        # 获取单个代理详情

GET  /api/skills            # 获取所有技能
GET  /api/skills/:id        # 获取单个技能详情

GET  /api/health            # 健康检查
```

## 安装和部署

### 本地运行

```bash
# 进入web-interface目录
cd web-interface

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 启动生产服务器
npm start
```

### Docker部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY web-interface/ .
RUN npm install --production
EXPOSE 3000
CMD ["npm", "start"]
```

### 环境变量

```env
# 服务器配置
PORT=3000
HOST=localhost
NODE_ENV=production

# 功能配置
ENABLE_CACHE=true
CACHE_TIMEOUT=300000
MAX_SEARCH_RESULTS=50

# 安全配置
CORS_ORIGIN=*
RATE_LIMIT=100
```

## 使用示例

### 场景1：浏览命令
1. 运行 `/web-interface` 启动界面
2. 自动打开浏览器访问 http://localhost:3000
3. 在命令列表中浏览所有可用命令
4. 点击命令卡片查看详细信息
5. 使用复制按钮快速复制命令

### 场景2：搜索功能
1. 在顶部搜索框输入关键词（如"test"）
2. 查看实时搜索结果和建议
3. 点击搜索建议快速跳转
4. 使用类型筛选器进一步筛选结果

### 场景3：命令详情
1. 点击任意命令的"查看详情"按钮
2. 在详情模态框中查看：
   - 命令完整说明文档
   - 使用方法和参数
   - 代码示例和最佳实践
   - 相关命令链接
3. 使用复制按钮复制示例代码

### 场景4：移动设备使用
1. 在手机浏览器中访问界面
2. 响应式布局自动适配屏幕
3. 侧边栏自动折叠为顶部导航
4. 触摸优化的交互体验

## 故障排除

### 常见问题

**端口占用**
```bash
# 查找占用端口的进程
netstat -ano | findstr :3000   # Windows
lsof -i :3000                  # Mac/Linux

# 使用不同端口启动
/web-interface --port 8080
```

**权限问题**
```bash
# 确保有读取项目文件的权限
chmod -R 755 commands/ agents/ skills/

# 或者使用sudo启动（不推荐）
sudo /web-interface --port 80
```

**依赖问题**
```bash
# 重新安装依赖
cd web-interface
rm -rf node_modules package-lock.json
npm install
```

### 调试模式

启用调试模式获取详细日志：

```bash
DEBUG=jtcc:* /web-interface --dev
```

调试工具：
- 浏览器控制台中的 `window.jtccDebug` 对象
- 网络面板查看API调用
- 应用面板查看本地存储

## 性能优化

### 缓存策略
- **API响应缓存**: 5分钟内重复请求使用缓存
- **静态文件缓存**: 浏览器缓存CSS/JS文件
- **搜索结果缓存**: 相同搜索词使用缓存结果

### 加载优化
- **懒加载**: 大型内容按需加载
- **分页显示**: 每页显示12个项目
- **图片优化**: 使用WebP格式和适当尺寸
- **代码分割**: 按功能模块分割JavaScript

## 相关命令

- `/plan` - 制定功能实现计划
- `/tdd` - 测试驱动开发工作流
- `/code-review` - 代码质量审查
- `/docs` - 生成和更新文档

## 配置文件

Web界面配置文件 `web-interface/config.json`：

```json
{
  "server": {
    "port": 3000,
    "host": "localhost",
    "cors": {
      "origin": "*",
      "credentials": true
    }
  },
  "features": {
    "search": {
      "maxResults": 50,
      "minQueryLength": 2,
      "debounceDelay": 300
    },
    "pagination": {
      "itemsPerPage": 12,
      "maxPages": 20
    },
    "cache": {
      "enabled": true,
      "timeout": 300000
    }
  },
  "ui": {
    "theme": {
      "default": "light",
      "allowToggle": true
    },
    "shortcuts": {
      "enabled": true,
      "search": "Ctrl+K",
      "refresh": "Ctrl+R"
    }
  }
}
```

## 扩展开发

### 添加新的API端点

```javascript
// web-interface/server/routes/custom.js
router.get('/custom-endpoint', async (req, res) => {
  try {
    const data = await getCustomData();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### 添加新的前端组件

```javascript
// web-interface/public/js/components/custom-component.js
class CustomComponent {
  constructor() {
    this.initialize();
  }

  initialize() {
    // 组件初始化逻辑
  }

  render() {
    // 渲染逻辑
  }
}

window.customComponent = new CustomComponent();
```

Web界面为JTCC插件提供了强大的可视化功能，让用户能够更直观、更高效地浏览和使用所有可用的命令、代理和技能。