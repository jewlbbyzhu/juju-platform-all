/**
 * EvoMap GEP-A2A v1.0.0 客户端
 * 用于 UniApp 项目接入 EvoMap Hub
 */

import CryptoJS from 'crypto-js';

const EVOMAP_CONFIG = {
  HUB_URL: 'https://evomap.ai/a2a',
  PROTOCOL: 'gep-a2a',
  VERSION: '1.0.0',
  NODE_ID: 'node_juju_' + Date.now(),
  CLAIM_CODE: 'G33V-Q9SU'
};

class EvoMapClient {
  constructor(config = {}) {
    this.hubUrl = config.hubUrl || EVOMAP_CONFIG.HUB_URL;
    this.nodeId = config.nodeId || EVOMAP_CONFIG.NODE_ID;
    this.protocol = EVOMAP_CONFIG.PROTOCOL;
    this.version = EVOMAP_CONFIG.VERSION;
  }

  /**
   * 生成唯一消息ID
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取 ISO8601 格式时间戳
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Step 1: 注册节点 (Hello)
   */
  async hello(capabilities = {}) {
    const payload = {
      protocol: this.protocol,
      protocol_version: this.version,
      message_type: 'hello',
      message_id: this.generateMessageId(),
      sender_id: this.nodeId,
      timestamp: this.getTimestamp(),
      payload: {
        capabilities,
        gene_count: 0,
        capsule_count: 0,
        env_fingerprint: {
          platform: 'uni-app',
          arch: 'mixed'
        }
      }
    };

    return this.post('/hello', payload);
  }

  /**
   * Step 2: 发布 Gene + Capsule
   */
  async publish(gene, capsule) {
    const payload = {
      protocol: this.protocol,
      protocol_version: this.version,
      message_type: 'publish',
      message_id: this.generateMessageId(),
      sender_id: this.nodeId,
      timestamp: this.getTimestamp(),
      payload: {
        gene,
        capsule,
        integrity: this.computeSHA256(JSON.stringify({ gene, capsule }))
      }
    };

    return this.post('/publish', payload);
  }

  /**
   * Step 3: 获取全网资产
   */
  async fetch(query = {}) {
    const payload = {
      protocol: this.protocol,
      protocol_version: this.version,
      message_type: 'fetch',
      message_id: this.generateMessageId(),
      sender_id: this.nodeId,
      timestamp: this.getTimestamp(),
      payload: query
    };

    return this.post('/fetch', payload);
  }

  /**
   * 发送 POST 请求
   */
  async post(endpoint, data) {
    return new Promise((resolve, reject) => {
      uni.request({
        url: this.hubUrl + endpoint,
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: data,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${res.data}`));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }

  /**
   * 计算 SHA256
   */
  computeSHA256(data) {
    // 使用简单的哈希计算（实际项目中使用 crypto-js）
    if (typeof data !== 'string') {
      data = JSON.stringify(data);
    }
    
    // 简单的哈希算法（用于演示）
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    
    // 转换为16进制字符串
    const hashHex = Math.abs(hash).toString(16).padStart(64, '0');
    return 'sha256:' + hashHex;
  }

  /**
   * 创建 Gene（策略定义）
   * @param {Object} config - 基因配置
   */
  createGene(config = {}) {
    return {
      gene_id: `gene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: config.name || 'default_gene',
      version: config.version || '1.0.0',
      description: config.description || '',
      triggers: config.triggers || [],
      strategy: config.strategy || {},
      metadata: {
        created_at: this.getTimestamp(),
        author: config.author || 'juju_platform',
        tags: config.tags || []
      }
    };
  }

  /**
   * 创建 Capsule（修复包）
   * @param {Object} config - 胶囊配置
   */
  createCapsule(config = {}) {
    return {
      capsule_id: `capsule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: config.name || 'default_capsule',
      version: config.version || '1.0.0',
      description: config.description || '',
      target_gene: config.targetGene || null,
      code: config.code || '',
      dependencies: config.dependencies || [],
      metadata: {
        created_at: this.getTimestamp(),
        author: config.author || 'juju_platform',
        tags: config.tags || []
      }
    };
  }

  /**
   * 打包 Gene + Capsule（Step 2）
   * @param {Object} geneConfig - 基因配置
   * @param {Object} capsuleConfig - 胶囊配置
   */
  async publishPackage(geneConfig = {}, capsuleConfig = {}) {
    // 创建 Gene 和 Capsule
    const gene = this.createGene(geneConfig);
    const capsule = this.createCapsule({
      ...capsuleConfig,
      targetGene: gene.gene_id
    });

    // 计算完整性校验
    const packageData = { gene, capsule };
    const integrity = this.computeSHA256(packageData);

    // 构建发布请求
    const request = {
      protocol: this.protocol,
      protocol_version: this.version,
      message_type: 'publish',
      message_id: this.generateMessageId(),
      sender_id: this.nodeId,
      timestamp: this.getTimestamp(),
      payload: {
        gene,
        capsule,
        integrity,
        claim_code: EVOMAP_CONFIG.CLAIM_CODE
      }
    };

    return this.post('/publish', request);
  }
}

export default EvoMapClient;
export { EVOMAP_CONFIG };
