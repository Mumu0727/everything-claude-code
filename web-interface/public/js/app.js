/**
 * 主应用程序类 - 协调所有组件和功能
 */
class App {
  constructor() {
    this.currentSection = 'commands';
    // 增强的主题检测：系统偏好 -> 本地存储 -> 默认浅色
    this.theme = this.detectPreferredTheme();

    this.initializeApp();
  }

  /**
   * 检测首选主题
   * @returns {string} 主题名称
   */
  detectPreferredTheme() {
    // 1. 检查本地存储
    const savedTheme = localStorage.getItem('jtcc_theme');
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      return savedTheme;
    }

    // 2. 检测系统偏好
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    // 3. 默认浅色主题
    return 'light';
  }

  /**
   * 监听系统主题变化
   */
  setupSystemThemeListener() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      // 监听变化
      mediaQuery.addEventListener('change', (e) => {
        // 只有在用户没有手动设置过主题时才自动切换
        const hasManualTheme = localStorage.getItem('jtcc_theme_manual');
        if (!hasManualTheme) {
          const newTheme = e.matches ? 'dark' : 'light';
          if (this.theme !== newTheme) {
            this.theme = newTheme;
            this.applyTheme();
            this.showToast(`已自动切换到${newTheme === 'dark' ? '深色' : '浅色'}主题`, 'info');
          }
        }
      });
    }
  }

  /**
   * 初始化应用程序
   */
  async initializeApp() {
    // 应用主题
    this.applyTheme();

    // 设置系统主题监听
    this.setupSystemThemeListener();

    // 设置事件监听器
    this.setupEventListeners();

    // 健康检查
    await this.performHealthCheck();

    // 加载初始内容
    await this.loadInitialContent();

    // 显示欢迎提示
    this.showWelcomeMessage();
  }

  /**
   * 设置全局事件监听器
   */
  setupEventListeners() {
    // 导航链接
    document.querySelectorAll('[data-section]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = e.target.closest('[data-section]').dataset.section;
        this.switchSection(section);
      });
    });

    // 主题切换
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
      this.toggleTheme();
    });

    // 全局键盘快捷键
    document.addEventListener('keydown', (e) => {
      this.handleGlobalKeyboard(e);
    });

    // 窗口事件
    window.addEventListener('beforeunload', () => {
      this.saveAppState();
    });

    // 在线/离线状态
    window.addEventListener('online', () => {
      this.showToast('网络连接已恢复', 'success');
    });

    window.addEventListener('offline', () => {
      this.showToast('网络连接已断开', 'warning');
    });

    // 错误捕获
    window.addEventListener('error', (e) => {
      console.error('全局错误:', e);
      this.showToast('发生未知错误，请刷新页面重试', 'error');
    });

    // 未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (e) => {
      console.error('未处理的Promise拒绝:', e);
      this.showToast('操作失败，请重试', 'error');
    });
  }

  /**
   * 执行健康检查
   */
  async performHealthCheck() {
    try {
      const health = await api.healthCheck();
      console.log('服务器状态正常:', health.data);
    } catch (error) {
      console.error('健康检查失败:', error);
      this.showToast('无法连接到服务器，某些功能可能不可用', 'warning');
    }
  }

  /**
   * 加载初始内容
   */
  async loadInitialContent() {
    // 恢复上次的状态
    const savedState = this.loadAppState();

    if (savedState.section) {
      this.currentSection = savedState.section;
    }

    if (savedState.searchQuery) {
      window.searchBar.setSearchValue(savedState.searchQuery);
    }

    // 更新导航状态
    this.updateNavigationState();

    // 加载内容
    await window.commandList.loadContent(this.currentSection, savedState.searchQuery);
  }

  /**
   * 切换分区
   * @param {string} section - 分区名称
   */
  async switchSection(section) {
    if (this.currentSection === section) return;

    const previousSection = this.currentSection;
    this.currentSection = section;

    // 清除搜索
    const searchQuery = window.searchBar.getSearchValue();
    if (searchQuery) {
      window.searchBar.clearSearch();
    }

    // 更新导航状态
    this.updateNavigationState();

    try {
      // 加载新分区内容
      await window.commandList.loadContent(section);

      // 记录状态
      this.saveAppState();

    } catch (error) {
      console.error(`切换到${section}分区失败:`, error);

      // 恢复之前的分区
      this.currentSection = previousSection;
      this.updateNavigationState();

      this.showToast(`切换到${section}分区失败，请稍后重试`, 'error');
    }
  }

  /**
   * 更新导航状态
   */
  updateNavigationState() {
    // 更新导航链接状态
    document.querySelectorAll('[data-section]').forEach(link => {
      const linkSection = link.dataset.section;
      if (linkSection === this.currentSection) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });

    // 更新页面标题
    const sectionNames = {
      commands: '命令',
      agents: '代理',
      skills: '技能'
    };

    document.title = `${sectionNames[this.currentSection]} - JTCC Web Interface`;
  }

  /**
   * 处理全局键盘快捷键
   * @param {KeyboardEvent} e - 键盘事件
   */
  handleGlobalKeyboard(e) {
    // Ctrl/Cmd + K: 聚焦搜索框
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('globalSearch').focus();
      return;
    }

    // 数字键快速切换分区
    if (e.altKey && e.key >= '1' && e.key <= '3') {
      e.preventDefault();
      const sections = ['commands', 'agents', 'skills'];
      const index = parseInt(e.key) - 1;
      if (sections[index]) {
        this.switchSection(sections[index]);
      }
      return;
    }

    // Ctrl/Cmd + R: 刷新当前分区
    if ((e.ctrlKey || e.metaKey) && e.key === 'r' && !e.shiftKey) {
      e.preventDefault();
      this.refreshCurrentSection();
      return;
    }

    // F5: 刷新
    if (e.key === 'F5') {
      e.preventDefault();
      this.refreshCurrentSection();
      return;
    }
  }

  /**
   * 刷新当前分区
   */
  async refreshCurrentSection() {
    // 清除API缓存
    api.clearCache();

    // 重新加载内容
    const searchQuery = window.searchBar.getSearchValue();
    await window.commandList.loadContent(this.currentSection, searchQuery);

    this.showToast('已刷新', 'success');
  }

  /**
   * 切换主题
   */
  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';

    // 标记为手动设置，防止系统自动切换覆盖
    localStorage.setItem('jtcc_theme_manual', 'true');

    this.applyTheme();
    this.saveAppState();

    const themeNames = { light: '浅色', dark: '深色' };
    this.showToast(`已切换到${themeNames[this.theme]}主题`, 'info');
  }

  /**
   * 应用主题
   */
  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('jtcc_theme', this.theme);

    // 更新主题切换按钮图标
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');

    if (this.theme === 'dark') {
      icon.className = 'bi bi-sun-fill';
      themeToggle.setAttribute('title', '切换到浅色主题');
    } else {
      icon.className = 'bi bi-moon-fill';
      themeToggle.setAttribute('title', '切换到深色主题');
    }
  }

  /**
   * 显示Toast通知
   * @param {string} message - 消息内容
   * @param {string} type - 消息类型 (success, error, warning, info)
   */
  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    // 设置消息内容
    toastMessage.textContent = message;

    // 设置图标和样式
    const toastHeader = toast.querySelector('.toast-header');
    const icon = toastHeader.querySelector('i');

    const typeConfig = {
      success: { icon: 'bi-check-circle', class: 'text-success', title: '成功' },
      error: { icon: 'bi-exclamation-triangle', class: 'text-danger', title: '错误' },
      warning: { icon: 'bi-exclamation-triangle', class: 'text-warning', title: '警告' },
      info: { icon: 'bi-info-circle', class: 'text-primary', title: '提示' }
    };

    const config = typeConfig[type] || typeConfig.info;
    icon.className = `bi ${config.icon} ${config.class} me-2`;
    toastHeader.querySelector('strong').textContent = config.title;

    // 显示Toast
    const bsToast = new bootstrap.Toast(toast, {
      delay: type === 'error' ? 5000 : 3000
    });
    bsToast.show();
  }

  /**
   * 复制命令到剪贴板 - 完全现代化实现
   * @param {string} command - 命令文本
   */
  async copyCommand(command) {
    try {
      // 检查 Clipboard API 支持
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not supported');
      }

      await navigator.clipboard.writeText(command);
      this.showToast(`已复制: ${command}`, 'success');

    } catch (error) {
      console.error('复制失败:', error);

      // 直接显示手动复制提示，不再使用弃用的API
      this.showFallbackCopyDialog(command);
    }
  }

  /**
   * 显示降级复制对话框
   * @param {string} command - 要复制的命令
   */
  showFallbackCopyDialog(command) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-clipboard me-2"></i>手动复制
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="关闭"></button>
          </div>
          <div class="modal-body">
            <p class="mb-3">
              <i class="bi bi-info-circle text-primary me-2"></i>
              您的浏览器不支持自动复制，请手动选择并复制以下命令：
            </p>
            <div class="input-group">
              <input type="text" class="form-control font-monospace"
                     value="${command}" readonly id="manualCopyInput">
              <button class="btn btn-outline-secondary" type="button"
                      onclick="document.getElementById('manualCopyInput').select()">
                <i class="bi bi-cursor-text"></i> 全选
              </button>
            </div>
            <small class="text-muted mt-2 d-block">
              <kbd>Ctrl+C</kbd> (Windows/Linux) 或 <kbd>Cmd+C</kbd> (Mac) 复制
            </small>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    // 自动选中文本
    modal.addEventListener('shown.bs.modal', () => {
      const input = modal.querySelector('#manualCopyInput');
      if (input) {
        input.focus();
        input.select();
      }
    });

    // 清理模态框
    modal.addEventListener('hidden.bs.modal', () => {
      document.body.removeChild(modal);
    });
  }

  /**
   * 显示欢迎信息
   */
  showWelcomeMessage() {
    // 检查是否是首次访问
    const isFirstVisit = !localStorage.getItem('jtcc_visited');

    if (isFirstVisit) {
      localStorage.setItem('jtcc_visited', 'true');

      setTimeout(() => {
        this.showToast('欢迎使用JTCC可视化界面！使用Ctrl+K快速搜索', 'info');
      }, 1000);

      // 显示快捷键提示
      setTimeout(() => {
        this.showToast('快捷键：Alt+1切换命令，Alt+2切换代理，Alt+3切换技能', 'info');
      }, 4000);
    }
  }

  /**
   * 保存应用状态
   */
  saveAppState() {
    const state = {
      section: this.currentSection,
      searchQuery: window.searchBar.getSearchValue(),
      theme: this.theme,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem('jtcc_app_state', JSON.stringify(state));
    } catch (error) {
      console.error('保存应用状态失败:', error);
    }
  }

  /**
   * 加载应用状态
   * @returns {Object} 应用状态
   */
  loadAppState() {
    try {
      const stateJson = localStorage.getItem('jtcc_app_state');
      if (stateJson) {
        const state = JSON.parse(stateJson);

        // 检查状态是否过期（24小时）
        if (Date.now() - state.timestamp < 24 * 60 * 60 * 1000) {
          return state;
        }
      }
    } catch (error) {
      console.error('加载应用状态失败:', error);
    }

    return {};
  }

  /**
   * 获取当前分区
   * @returns {string} 当前分区
   */
  getCurrentSection() {
    return this.currentSection;
  }

  /**
   * 获取应用版本和信息
   * @returns {Object} 应用信息
   */
  getAppInfo() {
    return {
      name: 'JTCC Web Interface',
      version: '1.0.0',
      description: 'Claude Code插件可视化界面',
      author: 'JTCC Team'
    };
  }

  /**
   * 清除所有缓存和存储
   */
  clearAllData() {
    // 清除API缓存
    api.clearCache();

    // 清除搜索历史
    window.searchBar.clearSearchHistory();

    // 清除应用状态
    localStorage.removeItem('jtcc_app_state');
    localStorage.removeItem('jtcc_visited');

    this.showToast('已清除所有缓存和数据', 'success');
  }

  /**
   * 导出数据
   */
  async exportData() {
    try {
      const data = {
        commands: await api.getCommands(),
        agents: await api.getAgents(),
        skills: await api.getSkills(),
        stats: await api.getCommandStats(),
        exportTime: new Date().toISOString(),
        appInfo: this.getAppInfo()
      };

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `jtcc-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      this.showToast('数据导出成功', 'success');

    } catch (error) {
      console.error('导出数据失败:', error);
      this.showToast('导出数据失败', 'error');
    }
  }

  /**
   * 检查更新
   */
  async checkForUpdates() {
    try {
      const health = await api.healthCheck();
      const serverVersion = health.data.version;
      const appInfo = this.getAppInfo();

      if (serverVersion && serverVersion !== appInfo.version) {
        this.showToast(`发现新版本 ${serverVersion}，请刷新页面更新`, 'info');
      } else {
        this.showToast('当前已是最新版本', 'success');
      }
    } catch (error) {
      console.error('检查更新失败:', error);
      this.showToast('检查更新失败', 'error');
    }
  }
}

// 应用启动
document.addEventListener('DOMContentLoaded', () => {
  // 创建全局应用实例
  window.app = new App();

  // 添加调试工具（仅开发环境）
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.jtccDebug = {
      app: window.app,
      api: window.api,
      commandList: window.commandList,
      searchBar: window.searchBar,
      commandDetail: window.commandDetail,
      clearAll: () => window.app.clearAllData(),
      export: () => window.app.exportData()
    };

    console.log('%c🚀 JTCC Debug Tools Available', 'color: #0d6efd; font-size: 14px; font-weight: bold;');
    console.log('Use window.jtccDebug to access debug tools');
  }
});

// 导出给测试使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = App;
}