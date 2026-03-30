#!/usr/bin/env node

/**
 * Web Interface 集成测试
 * 测试Web界面的核心功能
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

class WebInterfaceTests {
  constructor() {
    this.baseUrl = 'http://localhost:3001'; // 使用测试端口
    this.server = null;
    this.results = [];
  }

  /**
   * 启动测试服务器
   */
  async startTestServer() {
    const webInterfaceDir = path.join(__dirname, '..', 'web-interface');
    const serverScript = path.join(webInterfaceDir, 'server', 'app.js');

    return new Promise((resolve, reject) => {
      this.server = spawn('node', [serverScript], {
        env: { ...process.env, PORT: '3001', NODE_ENV: 'test' },
        stdio: 'pipe',
        cwd: webInterfaceDir
      });

      this.server.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('Server stdout:', output);
        if (output.includes('启动成功') || output.includes('Server 启动成功') || output.includes('listening on')) {
          setTimeout(resolve, 1000); // 等待服务器完全启动
        }
      });

      this.server.stderr.on('data', (data) => {
        const output = data.toString();
        console.error('Server stderr:', output);
        // 不要因为stderr有输出就拒绝，很多正常日志也会走stderr
      });

      this.server.on('error', reject);

      // 超时处理
      setTimeout(() => {
        reject(new Error('服务器启动超时'));
      }, 10000);
    });
  }

  /**
   * 关闭测试服务器
   */
  async stopTestServer() {
    if (this.server) {
      this.server.kill();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  /**
   * HTTP请求工具
   */
  async request(path, options = {}) {
    const url = this.baseUrl + path;

    return new Promise((resolve, reject) => {
      const req = http.request(url, {
        method: options.method || 'GET',
        headers: options.headers || {}
      }, (res) => {
        let data = '';

        res.on('data', chunk => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const result = {
              statusCode: res.statusCode,
              headers: res.headers,
              data: res.headers['content-type']?.includes('application/json')
                ? JSON.parse(data)
                : data
            };
            resolve(result);
          } catch (error) {
            // 如果JSON解析失败，直接返回原始数据
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: data
            });
          }
        });
      });

      req.on('error', reject);

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }

  /**
   * 断言函数
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(`断言失败: ${message}`);
    }
  }

  /**
   * 记录测试结果
   */
  recordTest(name, success, error = null) {
    const result = {
      name,
      success,
      error: error ? error.message : null,
      timestamp: new Date().toISOString()
    };

    this.results.push(result);

    if (success) {
      console.log(`✅ ${name}`);
    } else {
      console.log(`❌ ${name} - ${error.message}`);
    }
  }

  /**
   * 测试健康检查
   */
  async testHealthCheck() {
    try {
      const response = await this.request('/api/health');

      this.assert(response.statusCode === 200, '健康检查应返回200状态码');
      this.assert(response.data.success === true, '健康检查应返回success=true');
      this.assert(response.data.message, '健康检查应包含消息');

      this.recordTest('健康检查', true);
    } catch (error) {
      this.recordTest('健康检查', false, error);
    }
  }

  /**
   * 测试获取命令列表
   */
  async testGetCommands() {
    try {
      const response = await this.request('/api/commands');

      this.assert(response.statusCode === 200, '获取命令列表应返回200状态码');
      this.assert(response.data.success === true, '获取命令列表应返回success=true');
      this.assert(Array.isArray(response.data.data.commands), '命令列表应为数组');
      this.assert(response.data.data.total > 0, '应至少有一个命令');

      this.recordTest('获取命令列表', true);
    } catch (error) {
      this.recordTest('获取命令列表', false, error);
    }
  }

  /**
   * 测试获取单个命令详情
   */
  async testGetCommandDetail() {
    try {
      const response = await this.request('/api/commands/plan');

      this.assert(response.statusCode === 200, '获取命令详情应返回200状态码');
      this.assert(response.data.success === true, '获取命令详情应返回success=true');
      this.assert(response.data.data.fileName === 'plan', '应返回正确的命令');
      this.assert(response.data.data.name, '命令应有名称');
      this.assert(response.data.data.description, '命令应有描述');

      this.recordTest('获取命令详情', true);
    } catch (error) {
      this.recordTest('获取命令详情', false, error);
    }
  }

  /**
   * 测试命令搜索
   */
  async testSearchCommands() {
    try {
      const response = await this.request('/api/commands/search/plan');

      this.assert(response.statusCode === 200, '搜索命令应返回200状态码');
      this.assert(response.data.success === true, '搜索命令应返回success=true');
      this.assert(Array.isArray(response.data.data.results), '搜索结果应为数组');
      this.assert(response.data.data.query === 'plan', '应返回正确的搜索查询');

      this.recordTest('命令搜索', true);
    } catch (error) {
      this.recordTest('命令搜索', false, error);
    }
  }

  /**
   * 测试获取代理列表
   */
  async testGetAgents() {
    try {
      const response = await this.request('/api/agents');

      this.assert(response.statusCode === 200, '获取代理列表应返回200状态码');
      this.assert(response.data.success === true, '获取代理列表应返回success=true');
      this.assert(Array.isArray(response.data.data.agents), '代理列表应为数组');

      this.recordTest('获取代理列表', true);
    } catch (error) {
      this.recordTest('获取代理列表', false, error);
    }
  }

  /**
   * 测试获取技能列表
   */
  async testGetSkills() {
    try {
      const response = await this.request('/api/skills');

      this.assert(response.statusCode === 200, '获取技能列表应返回200状态码');
      this.assert(response.data.success === true, '获取技能列表应返回success=true');
      this.assert(Array.isArray(response.data.data.skills), '技能列表应为数组');

      this.recordTest('获取技能列表', true);
    } catch (error) {
      this.recordTest('获取技能列表', false, error);
    }
  }

  /**
   * 测试静态文件服务
   */
  async testStaticFiles() {
    try {
      const response = await this.request('/');

      this.assert(response.statusCode === 200, '主页应返回200状态码');

      // 确保响应数据是字符串且包含HTML标记
      const htmlData = typeof response.data === 'string' ? response.data : String(response.data);

      this.assert(htmlData.includes('<html>') || htmlData.includes('<!DOCTYPE html>'), '主页应返回HTML内容');
      this.assert(htmlData.includes('JTCC') || htmlData.includes('Web Interface'), '主页应包含标题');

      this.recordTest('静态文件服务', true);
    } catch (error) {
      this.recordTest('静态文件服务', false, error);
    }
  }

  /**
   * 测试错误处理
   */
  async testErrorHandling() {
    try {
      const response = await this.request('/api/commands/nonexistent');

      this.assert(response.statusCode === 404, '不存在的命令应返回404状态码');
      this.assert(response.data.success === false, '错误响应应返回success=false');

      this.recordTest('错误处理', true);
    } catch (error) {
      this.recordTest('错误处理', false, error);
    }
  }

  /**
   * 测试CORS
   */
  async testCORS() {
    try {
      const response = await this.request('/api/health', {
        headers: {
          'Origin': 'http://example.com'
        }
      });

      this.assert(response.statusCode === 200, 'CORS请求应成功');
      this.assert(response.headers['access-control-allow-origin'], '应设置CORS头');

      this.recordTest('CORS支持', true);
    } catch (error) {
      this.recordTest('CORS支持', false, error);
    }
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🧪 开始Web界面集成测试...\n');

    try {
      // 启动测试服务器
      await this.startTestServer();
      console.log('✅ 测试服务器已启动\n');

      // 运行测试
      await this.testHealthCheck();
      await this.testStaticFiles();
      await this.testGetCommands();
      await this.testGetCommandDetail();
      await this.testSearchCommands();
      await this.testGetAgents();
      await this.testGetSkills();
      await this.testErrorHandling();
      await this.testCORS();

    } catch (error) {
      console.error('❌ 测试过程中发生错误:', error.message);
    } finally {
      // 关闭测试服务器
      await this.stopTestServer();
      console.log('\n✅ 测试服务器已关闭');
    }

    this.printSummary();
  }

  /**
   * 打印测试摘要
   */
  printSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.success).length;
    const failed = total - passed;

    console.log('\n' + '='.repeat(50));
    console.log('📊 测试结果摘要');
    console.log('='.repeat(50));
    console.log(`总计测试: ${total}`);
    console.log(`✅ 通过: ${passed}`);
    console.log(`❌ 失败: ${failed}`);
    console.log(`成功率: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ 失败的测试:');
      this.results
        .filter(r => !r.success)
        .forEach(r => console.log(`   - ${r.name}: ${r.error}`));

      process.exit(1);
    } else {
      console.log('\n🎉 所有测试都通过了！');
      process.exit(0);
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const tests = new WebInterfaceTests();
  tests.runAllTests().catch((error) => {
    console.error('❌ 测试运行失败:', error);
    process.exit(1);
  });
}

module.exports = WebInterfaceTests;