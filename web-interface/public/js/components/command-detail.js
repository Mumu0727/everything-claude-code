/**
 * 命令详情组件 - 处理详情模态框的显示和交互
 */
class CommandDetail {
  constructor() {
    this.modal = document.getElementById('detailModal');
    this.modalTitle = document.getElementById('modalTitle');
    this.modalIcon = document.getElementById('modalIcon');
    this.modalContent = document.getElementById('modalContent');
    this.copyButton = document.getElementById('copyCommand');

    this.currentItem = null;
    this.currentSection = 'commands';

    this.initializeEventListeners();
    this.setupModal();
  }

  /**
   * 初始化事件监听器
   */
  initializeEventListeners() {
    // 复制命令按钮
    this.copyButton.addEventListener('click', () => {
      if (this.currentItem) {
        const command = this.generateCopyCommand();
        this.copyToClipboard(command);
      }
    });

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      if (this.modal.classList.contains('show')) {
        if (e.key === 'Escape') {
          this.hideDetail();
        } else if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          this.copyButton.click();
        }
      }
    });
  }

  /**
   * 设置Bootstrap模态框
   */
  setupModal() {
    this.bootstrapModal = new bootstrap.Modal(this.modal);

    // 模态框事件
    this.modal.addEventListener('shown.bs.modal', () => {
      // 焦点管理
      const firstButton = this.modal.querySelector('button');
      if (firstButton) firstButton.focus();
    });

    this.modal.addEventListener('hidden.bs.modal', () => {
      // 清理资源
      this.currentItem = null;
    });
  }

  /**
   * 显示详情
   * @param {string} itemId - 项目ID
   * @param {string} section - 分区类型
   */
  async showDetail(itemId, section = 'commands') {
    this.currentSection = section;

    try {
      // 显示加载状态
      this.showLoadingState();
      this.bootstrapModal.show();

      // 获取详情数据
      let response;
      switch (section) {
        case 'commands':
          response = await api.getCommand(itemId);
          break;
        case 'agents':
          response = await api.getAgent(itemId);
          break;
        case 'skills':
          response = await api.getSkill(itemId);
          break;
      }

      this.currentItem = response.data;
      this.renderDetail();

    } catch (error) {
      console.error('加载详情失败:', error);
      this.showErrorState(error.message);
    }
  }

  /**
   * 隐藏详情
   */
  hideDetail() {
    this.bootstrapModal.hide();
  }

  /**
   * 显示加载状态
   */
  showLoadingState() {
    this.modalTitle.textContent = '加载中...';
    this.modalIcon.className = 'bi bi-hourglass-split me-2';
    this.modalContent.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">加载中...</span>
        </div>
        <div class="mt-3 text-muted">正在加载详细信息...</div>
      </div>
    `;
    this.copyButton.style.display = 'none';
  }

  /**
   * 显示错误状态
   */
  showErrorState(message) {
    this.modalTitle.textContent = '加载失败';
    this.modalIcon.className = 'bi bi-exclamation-triangle text-danger me-2';
    this.modalContent.innerHTML = `
      <div class="error-message">
        <i class="bi bi-exclamation-triangle me-2"></i>
        ${message}
        <button class="btn btn-outline-danger btn-sm ms-2" onclick="window.commandDetail.hideDetail()">
          <i class="bi bi-x-circle me-1"></i>关闭
        </button>
      </div>
    `;
    this.copyButton.style.display = 'none';
  }

  /**
   * 渲染详情内容
   */
  renderDetail() {
    const item = this.currentItem;

    // 更新标题和图标
    this.modalTitle.textContent = item.name;
    this.modalIcon.className = `bi ${this.getSectionIcon()} me-2`;

    // 渲染内容
    this.modalContent.innerHTML = this.generateDetailContent(item);

    // 显示复制按钮（仅对命令）
    this.copyButton.style.display = this.currentSection === 'commands' ? 'block' : 'none';

    // 初始化内容交互
    this.initializeContentInteractions();
  }

  /**
   * 生成详情内容HTML
   */
  generateDetailContent(item) {
    let contentHtml = '';

    // 基本信息部分
    contentHtml += this.generateBasicInfo(item);

    // 内容部分
    contentHtml += `
      <div class="detail-content mt-4">
        ${item.html || this.formatContent(item.content)}
      </div>
    `;

    // 命令特有部分
    if (this.currentSection === 'commands') {
      contentHtml += this.generateCommandSpecificContent(item);
    }

    // 元数据部分
    contentHtml += this.generateMetadata(item);

    return contentHtml;
  }

  /**
   * 生成基本信息
   */
  generateBasicInfo(item) {
    const lastModified = new Date(item.lastModified).toLocaleString('zh-CN');

    let infoHtml = `
      <div class="row mb-4">
        <div class="col-md-8">
          <p class="lead">${item.description}</p>
        </div>
        <div class="col-md-4">
          <div class="card bg-light">
            <div class="card-body">
              <h6 class="card-title mb-3">
                <i class="bi bi-info-circle me-1"></i>基本信息
              </h6>
    `;

    // 类型信息（仅命令）
    if (this.currentSection === 'commands' && item.commandType) {
      const typeClass = `type-${item.commandType}`;
      infoHtml += `
        <div class="mb-2">
          <strong>类型：</strong>
          <span class="badge ${typeClass}">${item.commandType}</span>
        </div>
      `;
    }

    // 文件信息
    infoHtml += `
              <div class="mb-2">
                <strong>文件名：</strong>
                <code>${item.fileName}</code>
              </div>
              <div class="mb-2">
                <strong>更新时间：</strong><br>
                <small class="text-muted">${lastModified}</small>
              </div>
              <div class="mb-0">
                <strong>文件大小：</strong>
                <small class="text-muted">${this.formatFileSize(item.size)}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    return infoHtml;
  }

  /**
   * 生成命令特有内容
   */
  generateCommandSpecificContent(item) {
    let commandHtml = '';

    // 用法示例
    if (item.usage && item.usage.length > 0) {
      commandHtml += `
        <div class="mt-4">
          <h5><i class="bi bi-terminal me-1"></i>使用方法</h5>
          <div class="usage-examples">
      `;

      item.usage.forEach((usage, index) => {
        commandHtml += `
          <div class="usage-item mb-2">
            <code class="usage-command">${usage}</code>
            <button class="btn btn-outline-secondary btn-sm ms-2"
                    onclick="window.app.copyCommand('\jtcc:${usage}')">
              <i class="bi bi-clipboard"></i>
            </button>
          </div>
        `;
      });

      commandHtml += `
          </div>
        </div>
      `;
    }

    // 代码示例
    if (item.examples && item.examples.length > 0) {
      commandHtml += `
        <div class="mt-4">
          <h5><i class="bi bi-code-square me-1"></i>示例</h5>
          <div class="examples-container">
      `;

      item.examples.forEach((example, index) => {
        commandHtml += `
          <div class="example-item mb-3">
            <h6>示例 ${index + 1}${example.description ? ': ' + example.description : ''}</h6>
            <pre><code>${this.escapeHtml(example.code)}</code></pre>
            <button class="btn btn-outline-primary btn-sm"
                    onclick="window.commandDetail.copyExample('${index}')">
              <i class="bi bi-clipboard me-1"></i>复制示例
            </button>
          </div>
        `;
      });

      commandHtml += `
          </div>
        </div>
      `;
    }

    // 相关命令
    if (item.relatedCommands && item.relatedCommands.length > 0) {
      commandHtml += `
        <div class="mt-4">
          <h5><i class="bi bi-link-45deg me-1"></i>相关命令</h5>
          <div class="related-commands">
      `;

      item.relatedCommands.forEach(relatedCmd => {
        commandHtml += `
          <span class="badge bg-secondary me-2 mb-2 related-command"
                onclick="window.commandDetail.showDetail('${relatedCmd}', 'commands')">
            /${relatedCmd}
          </span>
        `;
      });

      commandHtml += `
          </div>
        </div>
      `;
    }

    return commandHtml;
  }

  /**
   * 生成元数据部分
   */
  generateMetadata(item) {
    let metaHtml = `
      <div class="detail-metadata mt-4 pt-4 border-top">
        <h6><i class="bi bi-gear me-1"></i>元数据</h6>
        <div class="row">
    `;

    // Frontmatter信息
    if (item.frontmatter && Object.keys(item.frontmatter).length > 0) {
      metaHtml += `
        <div class="col-md-6">
          <h6 class="small text-muted">Frontmatter</h6>
          <pre class="small"><code>${JSON.stringify(item.frontmatter, null, 2)}</code></pre>
        </div>
      `;
    }

    // 文档结构（如果有sections）
    if (item.sections && item.sections.length > 0) {
      metaHtml += `
        <div class="col-md-6">
          <h6 class="small text-muted">文档结构</h6>
          <ul class="list-unstyled small">
      `;

      item.sections.forEach(section => {
        metaHtml += `
          <li>
            <a href="#" class="text-decoration-none"
               onclick="window.commandDetail.scrollToSection('${section.id}')">
              ${'#'.repeat(section.level)} ${section.title}
            </a>
          </li>
        `;
      });

      metaHtml += `
          </ul>
        </div>
      `;
    }

    metaHtml += `
        </div>
      </div>
    `;

    return metaHtml;
  }

  /**
   * 获取分区图标
   */
  getSectionIcon() {
    const icons = {
      commands: 'bi-terminal',
      agents: 'bi-robot',
      skills: 'bi-gear'
    };
    return icons[this.currentSection] || 'bi-file-text';
  }

  /**
   * 格式化内容
   */
  formatContent(content) {
    if (!content) return '<p class="text-muted">暂无内容</p>';

    // 简单的Markdown到HTML转换
    return content
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/```([\\s\\S]*?)```/gim, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      .replace(/\\n\\n/gim, '</p><p>')
      .replace(/\\n/gim, '<br>');
  }

  /**
   * 初始化内容交互
   */
  initializeContentInteractions() {
    // 代码块复制功能
    this.modalContent.querySelectorAll('pre code').forEach((codeBlock, index) => {
      const pre = codeBlock.parentElement;
      if (!pre.querySelector('.code-copy-btn')) {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn btn-outline-secondary btn-sm code-copy-btn position-absolute top-0 end-0 m-2';
        copyBtn.innerHTML = '<i class="bi bi-clipboard"></i>';
        copyBtn.onclick = () => this.copyCodeBlock(codeBlock.textContent);

        pre.style.position = 'relative';
        pre.appendChild(copyBtn);
      }
    });

    // 表格响应式处理
    this.modalContent.querySelectorAll('table').forEach(table => {
      if (!table.parentElement.classList.contains('table-responsive')) {
        table.classList.add('table', 'table-striped', 'table-hover');
        const wrapper = document.createElement('div');
        wrapper.className = 'table-responsive';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
    });

    // 添加锚点平滑滚动
    this.modalContent.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /**
   * 生成复制命令
   */
  generateCopyCommand() {
    if (this.currentSection === 'commands' && this.currentItem) {
      return `/${this.currentItem.fileName}`;
    }
    return '';
  }

  /**
   * 复制到剪贴板
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      window.app.showToast(`已复制: ${text}`, 'success');
    } catch (error) {
      console.error('复制失败:', error);
      window.app.showToast('复制失败', 'error');
    }
  }

  /**
   * 复制代码块
   */
  async copyCodeBlock(text) {
    await this.copyToClipboard(text);
  }

  /**
   * 复制示例
   */
  async copyExample(index) {
    if (this.currentItem.examples && this.currentItem.examples[index]) {
      const example = this.currentItem.examples[index];
      await this.copyToClipboard(example.code);
    }
  }

  /**
   * 滚动到指定节
   */
  scrollToSection(sectionId) {
    const section = this.modalContent.querySelector(`#${sectionId}`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * 转义HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}

// 创建全局实例
window.commandDetail = new CommandDetail();