/**
 * 管理后台审计助手
 * 在浏览器端收集错误和交互信息
 */

(function() {
  'use strict';

  // 审计日志
  const auditLogs = [];
  const consoleErrors = [];
  const networkErrors = [];
  const apiErrors = [];

  // 记录日志
  function log(level, action, target, details) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      action,
      target,
      details,
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    auditLogs.push(entry);
    console.log(`[Audit ${level.toUpperCase()}] ${action}`, target || '', details || '');
    return entry;
  }

  // 监听控制台错误
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const errorMsg = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    consoleErrors.push({
      timestamp: new Date().toISOString(),
      message: errorMsg,
      url: window.location.href
    });
    log('error', 'Console Error', errorMsg);
    originalConsoleError.apply(console, args);
  };

  // 监听未捕获的错误
  window.addEventListener('error', function(event) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
      url: window.location.href
    };
    consoleErrors.push(errorInfo);
    log('error', 'Runtime Error', event.message, errorInfo);
  });

  // 监听未处理的Promise错误
  window.addEventListener('unhandledrejection', function(event) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      reason: event.reason?.message || event.reason,
      stack: event.reason?.stack,
      url: window.location.href
    };
    consoleErrors.push(errorInfo);
    log('error', 'Unhandled Promise Rejection', errorInfo.reason, errorInfo);
  });

  // 拦截XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    this._auditMethod = method;
    this._auditUrl = url;
    return originalXHROpen.apply(this, [method, url, ...args]);
  };

  XMLHttpRequest.prototype.send = function(...args) {
    const startTime = Date.now();
    const xhr = this;

    xhr.addEventListener('loadend', function() {
      const duration = Date.now() - startTime;
      const status = xhr.status;

      if (status >= 400) {
        // Handle blob response type - responseText is not accessible when responseType is 'blob'
        let responseText = '';
        try {
          responseText = xhr.responseText?.substring(0, 500) || '';
        } catch (e) {
          // responseText not available for blob responses
          responseText = '[Blob response - text not accessible]';
        }
        const errorInfo = {
          timestamp: new Date().toISOString(),
          method: xhr._auditMethod,
          url: xhr._auditUrl,
          status: status,
          statusText: xhr.statusText,
          response: responseText,
          duration,
          pageUrl: window.location.href
        };
        networkErrors.push(errorInfo);
        apiErrors.push(errorInfo);
        log('error', 'API Error', `${xhr._auditMethod} ${xhr._auditUrl}`, errorInfo);
      } else {
        log('success', 'API Success', `${xhr._auditMethod} ${xhr._auditUrl}`, { status, duration });
      }
    });

    return originalXHRSend.apply(this, args);
  };

  // 拦截fetch
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const startTime = Date.now();
    const url = typeof args[0] === 'string' ? args[0] : args[0].url;
    const method = args[1]?.method || 'GET';

    try {
      const response = await originalFetch.apply(this, args);
      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorInfo = {
          timestamp: new Date().toISOString(),
          method,
          url,
          status: response.status,
          statusText: response.statusText,
          duration,
          pageUrl: window.location.href
        };
        networkErrors.push(errorInfo);
        apiErrors.push(errorInfo);
        log('error', 'Fetch Error', `${method} ${url}`, errorInfo);
      } else {
        log('success', 'Fetch Success', `${method} ${url}`, { status: response.status, duration });
      }

      return response;
    } catch (error) {
      const errorInfo = {
        timestamp: new Date().toISOString(),
        method,
        url,
        error: error.message,
        pageUrl: window.location.href
      };
      networkErrors.push(errorInfo);
      log('error', 'Fetch Exception', `${method} ${url}`, errorInfo);
      throw error;
    }
  };

  // 自动点击测试
  async function runAutoTap() {
    log('info', 'Starting auto tap test');

    const elements = {
      buttons: document.querySelectorAll('button:not([disabled]), .el-button:not(.is-disabled)'),
      links: document.querySelectorAll('a[href^="/"]:not([href="/"])'),
      inputs: document.querySelectorAll('input:not([disabled])'),
      selects: document.querySelectorAll('.el-select'),
      tabs: document.querySelectorAll('.el-tabs__item'),
      menuItems: document.querySelectorAll('.el-menu-item, .el-sub-menu__title')
    };

    log('info', 'Found elements', undefined, {
      buttons: elements.buttons.length,
      links: elements.links.length,
      inputs: elements.inputs.length,
      selects: elements.selects.length,
      tabs: elements.tabs.length,
      menuItems: elements.menuItems.length
    });

    // 点击按钮
    for (let i = 0; i < Math.min(elements.buttons.length, 5); i++) {
      const btn = elements.buttons[i];
      try {
        if (btn.offsetParent !== null) { // 可见
          btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
          await new Promise(r => setTimeout(r, 100));
          btn.click();
          log('success', 'Button clicked', btn.textContent?.trim() || 'Unknown');
          await new Promise(r => setTimeout(r, 200));
        }
      } catch (e) {
        log('error', 'Button click failed', btn.textContent?.trim(), e.message);
      }
    }

    // 点击标签页
    for (const tab of elements.tabs) {
      try {
        if (tab.offsetParent !== null) {
          tab.click();
          log('success', 'Tab clicked', tab.textContent?.trim());
          await new Promise(r => setTimeout(r, 300));
        }
      } catch (e) {
        log('error', 'Tab click failed', tab.textContent?.trim(), e.message);
      }
    }

    // 点击菜单
    for (let i = 0; i < Math.min(elements.menuItems.length, 5); i++) {
      const item = elements.menuItems[i];
      try {
        if (item.offsetParent !== null) {
          item.click();
          log('success', 'Menu item clicked', item.textContent?.trim());
          await new Promise(r => setTimeout(r, 300));
        }
      } catch (e) {
        log('error', 'Menu item click failed', item.textContent?.trim(), e.message);
      }
    }

    log('info', 'Auto tap test completed');
  }

  // 生成报告
  function generateReport() {
    const report = {
      summary: {
        pageUrl: window.location.href,
        timestamp: new Date().toISOString(),
        totalLogs: auditLogs.length,
        consoleErrors: consoleErrors.length,
        networkErrors: networkErrors.length,
        apiErrors: apiErrors.length
      },
      consoleErrors,
      networkErrors,
      apiErrors,
      auditLogs
    };

    console.log('%c========== 审计报告 ==========', 'color: blue; font-size: 16px; font-weight: bold');
    console.log('页面:', report.summary.pageUrl);
    console.log('控制台错误:', report.summary.consoleErrors);
    console.log('网络错误:', report.summary.networkErrors);
    console.log('API错误:', report.summary.apiErrors);
    console.log('总日志数:', report.summary.totalLogs);

    // 下载报告
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return report;
  }

  // 暴露全局API
  window.AuditHelper = {
    log,
    runAutoTap,
    generateReport,
    getLogs: () => auditLogs,
    getErrors: () => ({ consoleErrors, networkErrors, apiErrors })
  };

  // 自动启动（如果URL包含audit参数）
  if (window.location.search.includes('audit=true')) {
    log('info', 'Audit mode enabled');
    window.addEventListener('load', () => {
      setTimeout(runAutoTap, 2000);
      setTimeout(generateReport, 10000);
    });
  }

  log('info', 'Audit Helper initialized');
})();
