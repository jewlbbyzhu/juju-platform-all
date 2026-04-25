const fs = require('fs');
const path = require('path');

class I18n {
  constructor() {
    this.defaultLocale = 'zh-CN';
    this.locales = {};
    this.currentLocale = this.defaultLocale;
    this.loadLocales();
  }

  loadLocales() {
    const localesDir = path.join(__dirname, '../locales');
    
    if (!fs.existsSync(localesDir)) {
      fs.mkdirSync(localesDir, { recursive: true });
    }
    
    const files = fs.readdirSync(localesDir);
    
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const locale = file.replace('.json', '');
        const filePath = path.join(localesDir, file);
        this.locales[locale] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    });
  }

  setLocale(locale) {
    if (this.locales[locale]) {
      this.currentLocale = locale;
    } else {
      this.currentLocale = this.defaultLocale;
    }
  }

  getLocale() {
    return this.currentLocale;
  }

  t(key, params = {}) {
    const keys = key.split('.');
    let message = this.locales[this.currentLocale] || this.locales[this.defaultLocale] || {};
    
    for (const k of keys) {
      if (message && message[k]) {
        message = message[k];
      } else {
        return key;
      }
    }
    
    if (typeof message === 'string') {
      return this.interpolate(message, params);
    }
    
    return key;
  }

  interpolate(message, params) {
    return message.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }

  getAvailableLocales() {
    return Object.keys(this.locales);
  }
}

const i18n = new I18n();

module.exports = i18n;
