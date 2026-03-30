/**
 * 命令列表组件 - 负责渲染和管理命令列表的显示
 */
class CommandList {
  constructor() {
    this.currentData = [];
    this.filteredData = [];
    this.currentPage = 1;
    this.itemsPerPage = 12;
    this.currentFilters = new Set();
    this.currentSection = 'commands';

    this.initializeElements();
    this.setupEventListeners();
  }

  /**
   * 初始化DOM元素引用
   */
  initializeElements() {
    this.contentContainer = document.getElementById('contentContainer');
    this.contentList = document.getElementById('contentList');
    this.loadingSpinner = document.getElementById('loadingSpinner');
    this.resultInfo = document.getElementById('resultInfo');
    this.pagination = document.getElementById('pagination');
    this.sectionTitle = document.getElementById('sectionTitle');
    this.sectionDescription = document.getElementById('sectionDescription');
    this.typeFilters = document.getElementById('typeFilters');
    this.statsContainer = document.getElementById('statsContainer');
    this.recentUpdates = document.getElementById('recentUpdates');
    this.clearFilters = document.getElementById('clearFilters');
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 清除筛选器
    this.clearFilters.addEventListener('click', () => {
      this.clearAllFilters();
    });

    // 分页点击事件
    this.pagination.addEventListener('click', (e) => {
      e.preventDefault();
      if (e.target.matches('[data-page]')) {
        const page = parseInt(e.target.dataset.page);
        this.goToPage(page);
      }
    });
  }

  /**
   * 加载并显示内容
   * @param {string} section - 内容类型 (commands/agents/skills)
   * @param {string} searchQuery - 搜索查询
   */
  async loadContent(section = 'commands', searchQuery = '') {
    this.currentSection = section;
    this.showLoading();

    try {
      let response;

      switch (section) {
        case 'commands':
          response = searchQuery
            ? await api.searchCommands(searchQuery)
            : await api.getCommands();
          this.currentData = response.data.commands || response.data.results || [];
          break;
        case 'agents':
          response = await api.getAgents();
          this.currentData = response.data.agents || [];
          break;
        case 'skills':
          response = await api.getSkills();
          this.currentData = response.data.skills || [];
          break;
      }

      this.filteredData = [...this.currentData];
      this.updateSectionInfo(section, searchQuery, response.data);
      this.renderFilters();
      this.renderStats();
      this.renderContent();
      this.hideLoading();

    } catch (error) {
      console.error('加载内容失败:', error);
      this.showError('加载数据失败，请稍后重试。');
    }
  }

  /**
   * 更新分区信息
   */
  updateSectionInfo(section, searchQuery, data) {
    const sectionConfig = {
      commands: {
        title: '命令列表',
        icon: 'bi-terminal',
        description: searchQuery
          ? `搜索 "${searchQuery}" 的结果`
          : '浏览所有可用的Claude Code命令，点击查看详细信息和用法示例'
      },
      agents: {
        title: '代理列表',
        icon: 'bi-robot',
        description: '浏览所有可用的Claude Code代理，查看专用工作流程'
      },
      skills: {
        title: '技能列表',
        icon: 'bi-gear',
        description: '浏览所有可用的Claude Code技能，了解领域知识和最佳实践'
      }
    };

    const config = sectionConfig[section];
    this.sectionTitle.innerHTML = `<i class="bi ${config.icon} me-2"></i>${config.title}`;
    this.sectionDescription.textContent = config.description;

    // 更新结果信息
    const total = data.total || this.currentData.length;
    this.resultInfo.textContent = searchQuery
      ? `找到 ${total} 个匹配结果`
      : `共 ${total} 个项目`;
  }

  /**
   * 渲染筛选器
   */
  renderFilters() {
    if (this.currentSection !== 'commands') {
      this.typeFilters.innerHTML = '<p class="text-muted small">此分区暂无筛选选项</p>';
      return;
    }

    // 统计类型分布
    const typeCount = {};
    this.currentData.forEach(item => {
      const type = item.commandType || 'general';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    // 类型显示名称映射
    const typeNames = {
      testing: '测试',
      build: '构建',
      planning: '规划',
      review: '审查',
      documentation: '文档',
      refactoring: '重构',
      general: '通用'
    };

    // 生成筛选器HTML
    const filtersHtml = Object.entries(typeCount)
      .sort(([,a], [,b]) => b - a) // 按数量排序
      .map(([type, count]) => `
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="filter_${type}"
                 data-type="${type}" ${this.currentFilters.has(type) ? 'checked' : ''}>
          <label class="form-check-label d-flex justify-content-between" for="filter_${type}">
            <span>${typeNames[type] || type}</span>
            <span class="badge bg-secondary">${count}</span>
          </label>
        </div>
      `).join('');

    this.typeFilters.innerHTML = filtersHtml;

    // 添加筛选器事件监听
    this.typeFilters.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const type = e.target.dataset.type;
        if (e.target.checked) {
          this.currentFilters.add(type);
        } else {
          this.currentFilters.delete(type);
        }
        this.applyFilters();
      });
    });
  }

  /**
   * 渲染统计信息
   */
  async renderStats() {
    if (this.currentSection !== 'commands') {
      this.statsContainer.innerHTML = '<p class="text-muted small">统计信息仅在命令分区可用</p>';
      this.recentUpdates.innerHTML = '<p class="text-muted small">最近更新仅在命令分区可用</p>';
      return;
    }

    try {
      const response = await api.getCommandStats();
      const stats = response.data;

      // 渲染统计信息
      const statsHtml = `
        <div class="stat-item">
          <span>总命令数</span>
          <span class="stat-value">${stats.totalCommands}</span>
        </div>
        ${Object.entries(stats.typeDistribution)
          .map(([type, count]) => `
            <div class="stat-item">
              <span class="text-capitalize">${type}</span>
              <span class="stat-value">${count}</span>
            </div>
          `).join('')}
      `;
      this.statsContainer.innerHTML = statsHtml;

      // 渲染最近更新
      const updatesHtml = stats.recentlyUpdated
        .map(item => `
          <div class="d-flex justify-content-between align-items-start mb-2 pb-2 border-bottom border-light">
            <div>
              <div class="fw-semibold small">${item.name}</div>
              <div class="text-muted small">${new Date(item.lastModified).toLocaleDateString('zh-CN')}</div>
            </div>
            <span class="badge type-${item.type} small">${item.type}</span>
          </div>
        `).join('');
      this.recentUpdates.innerHTML = updatesHtml || '<p class="text-muted small">暂无更新记录</p>';

    } catch (error) {
      console.error('加载统计信息失败:', error);
      this.statsContainer.innerHTML = '<p class="text-danger small">加载统计信息失败</p>';
      this.recentUpdates.innerHTML = '<p class="text-danger small">加载更新记录失败</p>';
    }
  }

  /**
   * 应用筛选器
   */
  applyFilters() {
    if (this.currentFilters.size === 0) {
      this.filteredData = [...this.currentData];
    } else {
      this.filteredData = this.currentData.filter(item => {
        const type = item.commandType || 'general';
        return this.currentFilters.has(type);
      });
    }

    this.currentPage = 1;
    this.renderContent();
  }

  /**
   * 清除所有筛选器
   */
  clearAllFilters() {
    this.currentFilters.clear();
    this.typeFilters.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = false;
    });
    this.applyFilters();
  }

  /**
   * 渲染内容列表
   */
  renderContent() {
    if (this.filteredData.length === 0) {
      this.showEmptyState();
      return;
    }

    // 分页计算
    const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageData = this.filteredData.slice(startIndex, endIndex);

    // 渲染内容项
    const contentHtml = pageData.map(item => this.renderContentItem(item)).join('');
    this.contentList.innerHTML = contentHtml;

    // 更新结果信息
    this.resultInfo.textContent = `显示 ${startIndex + 1}-${Math.min(endIndex, this.filteredData.length)} 项，共 ${this.filteredData.length} 项`;

    // 渲染分页
    this.renderPagination(totalPages);

    // 添加动画效果
    this.contentList.classList.add('fade-in');
  }

  /**
   * 渲染单个内容项
   */
  renderContentItem(item) {
    const typeClass = `type-${item.commandType || 'general'}`;
    const lastModified = new Date(item.lastModified).toLocaleDateString('zh-CN');

    return `
      <div class="card content-card" data-id="${item.id || item.fileName}">
        <div class="card-body">
          <h5 class="content-title">
            ${this.getSectionIcon()} ${item.name}
          </h5>
          <p class="content-description">${item.description}</p>

          ${this.currentSection === 'commands' ? `
            <div class="mb-2">
              <span class="badge command-type ${typeClass}">${item.commandType || 'general'}</span>
              ${item.usage && item.usage.length > 0 ? `
                <span class="badge bg-info">有用法示例</span>
              ` : ''}
              ${item.examples && item.examples.length > 0 ? `
                <span class="badge bg-success">有代码示例</span>
              ` : ''}
            </div>
          ` : ''}

          <div class="content-meta">
            <small class="text-muted">
              <i class="bi bi-clock me-1"></i>更新于 ${lastModified}
            </small>
            <div class="content-actions">
              <button class="btn btn-outline-primary btn-sm"
                      onclick="window.commandDetail.showDetail('${item.fileName}', '${this.currentSection}')">
                <i class="bi bi-eye me-1"></i>查看详情
              </button>
              ${this.currentSection === 'commands' ? `
                <button class="btn btn-outline-success btn-sm"
                        onclick="window.app.copyCommand('/${item.fileName}')">
                  <i class="bi bi-clipboard me-1"></i>复制
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 获取分区图标
   */
  getSectionIcon() {
    const icons = {
      commands: '<i class="bi bi-terminal text-primary"></i>',
      agents: '<i class="bi bi-robot text-info"></i>',
      skills: '<i class="bi bi-gear text-warning"></i>'
    };
    return icons[this.currentSection] || '';
  }

  /**
   * 渲染分页
   */
  renderPagination(totalPages) {
    if (totalPages <= 1) {
      this.pagination.style.display = 'none';
      return;
    }

    this.pagination.style.display = 'block';

    let paginationHtml = '';

    // 上一页
    paginationHtml += `
      <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${this.currentPage - 1}">
          <i class="bi bi-chevron-left"></i>
        </a>
      </li>
    `;

    // 页码
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    if (startPage > 1) {
      paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>`;
      if (startPage > 2) {
        paginationHtml += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationHtml += `
        <li class="page-item ${i === this.currentPage ? 'active' : ''}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationHtml += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
      }
      paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a></li>`;
    }

    // 下一页
    paginationHtml += `
      <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${this.currentPage + 1}">
          <i class="bi bi-chevron-right"></i>
        </a>
      </li>
    `;

    this.pagination.querySelector('ul').innerHTML = paginationHtml;
  }

  /**
   * 跳转到指定页面
   */
  goToPage(page) {
    if (page >= 1 && page <= Math.ceil(this.filteredData.length / this.itemsPerPage)) {
      this.currentPage = page;
      this.renderContent();

      // 滚动到顶部
      this.contentContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * 显示空状态
   */
  showEmptyState() {
    this.contentList.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-inbox"></i>
        <h4>暂无数据</h4>
        <p class="text-muted">没有找到匹配的项目，请尝试调整筛选条件或搜索词。</p>
        <button class="btn btn-outline-primary" onclick="window.commandList.clearAllFilters()">
          <i class="bi bi-arrow-clockwise me-1"></i>清除筛选
        </button>
      </div>
    `;
    this.pagination.style.display = 'none';
  }

  /**
   * 显示加载状态
   */
  showLoading() {
    this.loadingSpinner.style.display = 'block';
    this.contentContainer.style.display = 'none';
  }

  /**
   * 隐藏加载状态
   */
  hideLoading() {
    this.loadingSpinner.style.display = 'none';
    this.contentContainer.style.display = 'block';
  }

  /**
   * 显示错误信息
   */
  showError(message) {
    this.hideLoading();
    this.contentContainer.style.display = 'block';
    this.contentList.innerHTML = `
      <div class="error-message">
        <i class="bi bi-exclamation-triangle me-2"></i>
        ${message}
        <button class="btn btn-outline-danger btn-sm ms-2" onclick="location.reload()">
          <i class="bi bi-arrow-clockwise me-1"></i>重新加载
        </button>
      </div>
    `;
  }
}

// 创建全局实例
window.commandList = new CommandList();