const MiniprogramAdapter = require('./miniprogramAdapter');
const AppAdapter = require('./appAdapter');
const WebAdapter = require('./webAdapter');
const WebsiteAdapter = require('./websiteAdapter');

/**
 * 数据适配器工厂
 * 根据客户端类型返回对应的适配器实例
 */
class AdapterFactory {
  static getAdapter(clientType) {
    switch (clientType) {
    case 'miniprogram':
      return new MiniprogramAdapter();
    case 'app':
      return new AppAdapter();
    case 'web':
      return new WebAdapter();
    case 'website':
      return new WebsiteAdapter();
    default:
      return new WebAdapter(); // 默认使用Web适配器
    }
  }
}

module.exports = AdapterFactory;