/**
 * 搜索栏组件 - 处理全局搜索功能
 */
class SearchBar {
  constructor() {
    this.searchInput = document.getElementById('globalSearch');
    this.searchTimeout = null;
    this.searchDelay = 300; // 搜索防抖延迟
    this.minSearchLength = 2; // 最小搜索长度

    this.initializeEventListeners();
    this.setupSearchHistory();
  }

  /**
   * 初始化事件监听器
   */
  initializeEventListeners() {
    // 搜索输入事件
    this.searchInput.addEventListener('input', (e) => {
      this.handleSearchInput(e.target.value);
    });

    // 键盘事件
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.performSearch(this.searchInput.value);
      } else if (e.key === 'Escape') {
        this.clearSearch();
      }
    });

    // 焦点事件
    this.searchInput.addEventListener('focus', () => {
      this.showSearchSuggestions();
    });

    // 失去焦点事件
    this.searchInput.addEventListener('blur', () => {
      // 延迟隐藏建议，以便点击建议项
      setTimeout(() => {
        this.hideSuggestions();
      }, 200);
    });
  }

  /**
   * 设置搜索历史功能
   */
  setupSearchHistory() {
    this.searchHistory = this.getSearchHistory();
  }

  /**
   * 处理搜索输入
   * @param {string} value - 输入值
   */
  handleSearchInput(value) {
    // 清除之前的定时器
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // 实时搜索建议
    this.showSearchSuggestions(value);

    // 防抖搜索
    this.searchTimeout = setTimeout(() => {
      if (value.trim().length >= this.minSearchLength || value.trim().length === 0) {
        this.performSearch(value);
      }
    }, this.searchDelay);
  }

  /**
   * 执行搜索
   * @param {string} query - 搜索查询
   */
  async performSearch(query) {
    const trimmedQuery = query.trim();

    try {
      // 如果有查询词，添加到历史记录
      if (trimmedQuery && !this.searchHistory.includes(trimmedQuery)) {
        this.addToSearchHistory(trimmedQuery);
      }

      // 显示搜索状态
      this.showSearchStatus(trimmedQuery);

      // 根据当前分区执行相应的搜索
      const currentSection = window.app.getCurrentSection();

      if (currentSection === 'commands') {
        await window.commandList.loadContent('commands', trimmedQuery);
      } else {
        // 对于agents和skills，只能在客户端进行简单筛选
        await this.performClientSideSearch(currentSection, trimmedQuery);
      }

      this.hideSuggestions();

    } catch (error) {
      console.error('搜索失败:', error);
      window.app.showToast('搜索失败，请稍后重试', 'error');
    }
  }

  /**
   * 客户端搜索（用于agents和skills）
   * @param {string} section - 分区
   * @param {string} query - 查询
   */
  async performClientSideSearch(section, query) {
    // 重新加载数据
    await window.commandList.loadContent(section);

    if (query) {
      // 在客户端进行筛选
      const allData = window.commandList.currentData;
      const filtered = allData.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        (item.fileName && item.fileName.toLowerCase().includes(query.toLowerCase()))
      );

      // 更新筛选后的数据
      window.commandList.filteredData = filtered;
      window.commandList.currentPage = 1;
      window.commandList.renderContent();

      // 更新分区信息
      window.commandList.updateSectionInfo(section, query, { total: filtered.length });
    }
  }

  /**
   * 显示搜索状态
   * @param {string} query - 搜索查询
   */
  showSearchStatus(query) {
    if (query) {
      // 高亮搜索框
      this.searchInput.classList.add('border-primary');

      // 显示清除按钮
      this.showClearButton();
    } else {
      // 移除高亮
      this.searchInput.classList.remove('border-primary');

      // 隐藏清除按钮
      this.hideClearButton();
    }
  }

  /**
   * 显示搜索建议
   * @param {string} query - 当前查询
   */
  showSearchSuggestions(query = '') {
    const suggestions = this.generateSuggestions(query);

    if (suggestions.length === 0) {
      this.hideSuggestions();
      return;
    }

    // 创建或获取建议容器
    let suggestionsContainer = document.getElementById('searchSuggestions');
    if (!suggestionsContainer) {
      suggestionsContainer = document.createElement('div');
      suggestionsContainer.id = 'searchSuggestions';
      suggestionsContainer.className = 'search-suggestions dropdown-menu show';

      // 定位建议容器
      const searchContainer = this.searchInput.parentElement;
      searchContainer.style.position = 'relative';
      searchContainer.appendChild(suggestionsContainer);
    }

    // 生成建议HTML
    const suggestionsHtml = suggestions.map((suggestion, index) => `
      <div class="dropdown-item search-suggestion"
           data-suggestion="${suggestion.text}"
           data-type="${suggestion.type}">
        <i class="bi ${suggestion.icon} me-2 text-${suggestion.color}"></i>
        <span>${this.highlightMatch(suggestion.text, query)}</span>
        ${suggestion.badge ? `<span class="badge bg-secondary ms-auto">${suggestion.badge}</span>` : ''}
      </div>
    `).join('');

    suggestionsContainer.innerHTML = suggestionsHtml;

    // 添加点击事件
    suggestionsContainer.querySelectorAll('.search-suggestion').forEach(item => {
      item.addEventListener('click', () => {
        const suggestionText = item.dataset.suggestion;
        this.searchInput.value = suggestionText;
        this.performSearch(suggestionText);
      });
    });
  }

  /**
   * 生成搜索建议
   * @param {string} query - 查询字符串
   * @returns {Array} 建议数组
   */
  generateSuggestions(query) {
    const suggestions = [];
    const lowerQuery = query.toLowerCase();

    // 搜索历史建议
    if (query.length === 0 && this.searchHistory.length > 0) {
      const historyItems = this.searchHistory.slice(-5).reverse().map(item => ({
        text: item,
        type: 'history',
        icon: 'bi-clock-history',
        color: 'secondary',
        badge: '历史'
      }));
      suggestions.push(...historyItems);
    }

    // 快速搜索建议
    if (query.length >= 1) {
      const quickSuggestions = [
        { text: 'plan', type: 'command', icon: 'bi-diagram-3', color: 'primary' },
        { text: 'tdd', type: 'command', icon: 'bi-check-circle', color: 'success' },
        { text: 'code-review', type: 'command', icon: 'bi-eye', color: 'warning' },
        { text: 'build-fix', type: 'command', icon: 'bi-wrench', color: 'danger' },
        { text: 'e2e', type: 'command', icon: 'bi-arrow-repeat', color: 'info' }
      ].filter(item => item.text.includes(lowerQuery));

      suggestions.push(...quickSuggestions);
    }

    // 类型建议
    if (query.length >= 2) {
      const typeSuggestions = [
        { text: 'testing', type: 'type', icon: 'bi-check-square', color: 'success' },
        { text: 'build', type: 'type', icon: 'bi-gear', color: 'warning' },
        { text: 'planning', type: 'type', icon: 'bi-diagram-2', color: 'primary' },
        { text: 'review', type: 'type', icon: 'bi-eye', color: 'info' }
      ].filter(item => item.text.includes(lowerQuery))
       .map(item => ({ ...item, badge: '类型' }));

      suggestions.push(...typeSuggestions);
    }

    return suggestions.slice(0, 8); // 限制建议数量
  }

  /**
   * 高亮匹配文本
   * @param {string} text - 原文本
   * @param {string} query - 查询
   * @returns {string} 高亮后的HTML
   */
  highlightMatch(text, query) {
    if (!query) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  }

  /**
   * 隐藏搜索建议
   */
  hideSuggestions() {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (suggestionsContainer) {
      suggestionsContainer.remove();
    }
  }

  /**
   * 显示清除按钮
   */
  showClearButton() {
    let clearButton = this.searchInput.parentElement.querySelector('.search-clear');
    if (!clearButton) {
      clearButton = document.createElement('button');
      clearButton.className = 'btn btn-sm search-clear position-absolute top-50 end-0 translate-middle-y me-1';
      clearButton.innerHTML = '<i class="bi bi-x-circle-fill text-muted"></i>';
      clearButton.style.cssText = 'border: none; background: none; z-index: 10;';

      clearButton.addEventListener('click', () => {
        this.clearSearch();
      });

      this.searchInput.parentElement.appendChild(clearButton);
    }
  }

  /**
   * 隐藏清除按钮
   */
  hideClearButton() {
    const clearButton = this.searchInput.parentElement.querySelector('.search-clear');
    if (clearButton) {
      clearButton.remove();
    }
  }

  /**
   * 清除搜索
   */
  clearSearch() {
    this.searchInput.value = '';
    this.searchInput.classList.remove('border-primary');
    this.hideClearButton();
    this.hideSuggestions();

    // 重新加载当前分区的所有内容
    const currentSection = window.app.getCurrentSection();
    window.commandList.loadContent(currentSection);
  }

  /**
   * 获取搜索历史
   * @returns {Array} 搜索历史数组
   */
  getSearchHistory() {
    try {
      const history = localStorage.getItem('jtcc_search_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('获取搜索历史失败:', error);
      return [];
    }
  }

  /**
   * 添加到搜索历史
   * @param {string} query - 搜索查询
   */
  addToSearchHistory(query) {
    if (!query.trim()) return;

    // 移除重复项
    this.searchHistory = this.searchHistory.filter(item => item !== query);

    // 添加到开头
    this.searchHistory.unshift(query);

    // 限制历史记录数量
    this.searchHistory = this.searchHistory.slice(0, 10);

    // 保存到localStorage
    try {
      localStorage.setItem('jtcc_search_history', JSON.stringify(this.searchHistory));
    } catch (error) {
      console.error('保存搜索历史失败:', error);
    }
  }

  /**
   * 清除搜索历史
   */
  clearSearchHistory() {
    this.searchHistory = [];
    try {
      localStorage.removeItem('jtcc_search_history');
    } catch (error) {
      console.error('清除搜索历史失败:', error);
    }
  }

  /**
   * 设置搜索值
   * @param {string} value - 搜索值
   */
  setSearchValue(value) {
    this.searchInput.value = value;
    this.performSearch(value);
  }

  /**
   * 获取当前搜索值
   * @returns {string} 当前搜索值
   */
  getSearchValue() {
    return this.searchInput.value;
  }
}

// 创建全局实例
window.searchBar = new SearchBar();