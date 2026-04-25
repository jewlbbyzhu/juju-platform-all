const dataTransformer = {
  toCamelCase(obj) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.toCamelCase(item));
    }

    const result = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelKey = this.snakeToCamel(key);
        result[camelKey] = this.toCamelCase(obj[key]);
      }
    }
    return result;
  },

  snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
  },

  camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  },

  toSnakeCase(obj) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.toSnakeCase(item));
    }

    const result = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const snakeKey = this.camelToSnake(key);
        result[snakeKey] = this.toSnakeCase(obj[key]);
      }
    }
    return result;
  },

  formatPrice(priceInCents) {
    if (typeof priceInCents !== 'number') {
      return 0;
    }
    return Math.floor(priceInCents / 100);
  },

  formatDate(date) {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString();
  },

  formatDateTime(date) {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString();
  }
};

module.exports = dataTransformer;
