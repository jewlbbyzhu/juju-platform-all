/* eslint-disable no-unused-vars */
const request = require('supertest');
const app = require('../src/server');
const logger = require('../src/utils/logger');

class PerformanceTestService {
  constructor() {
    this.baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
    this.results = [];
    this.thresholds = {
      responseTime: 200,
      throughput: 1000,
      errorRate: 0.01,
      p95ResponseTime: 500,
      p99ResponseTime: 1000
    };
  }

  async runLoadTest(endpoint, method = 'GET', data = null, options = {}) {
    const {
      concurrentUsers = 100,
      totalRequests = 10000,
      duration = 60
    } = options;

    const startTime = Date.now();
    const results = {
      endpoint,
      method,
      concurrentUsers,
      totalRequests,
      duration,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errors: []
    };

    try {
      logger.info(`Starting load test for ${method} ${endpoint}`);
      logger.info(`Concurrent users: ${concurrentUsers}, Total requests: ${totalRequests}`);

      const requestsPerUser = Math.ceil(totalRequests / concurrentUsers);
      const userPromises = [];

      for (let i = 0; i < concurrentUsers; i++) {
        const userPromise = this.runUserRequests(
          endpoint,
          method,
          data,
          requestsPerUser,
          duration
        );
        userPromises.push(userPromise);
      }

      const userResults = await Promise.all(userPromises);

      userResults.forEach(userResult => {
        results.successfulRequests += userResult.successful;
        results.failedRequests += userResult.failed;
        results.responseTimes.push(...userResult.responseTimes);
        results.errors.push(...userResult.errors);
      });

      results.duration = Date.now() - startTime;
      results.throughput = results.successfulRequests / (results.duration / 1000);
      results.errorRate = results.failedRequests / totalRequests;
      results.avgResponseTime = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length;
      results.minResponseTime = Math.min(...results.responseTimes);
      results.maxResponseTime = Math.max(...results.responseTimes);
      results.p50ResponseTime = this.calculatePercentile(results.responseTimes, 50);
      results.p95ResponseTime = this.calculatePercentile(results.responseTimes, 95);
      results.p99ResponseTime = this.calculatePercentile(results.responseTimes, 99);

      this.results.push(results);
      logger.info(`Load test completed for ${method} ${endpoint}`);
      logger.info(`Successful: ${results.successfulRequests}, Failed: ${results.failedRequests}`);
      logger.info(`Throughput: ${results.throughput.toFixed(2)} req/s`);
      logger.info(`Avg response time: ${results.avgResponseTime.toFixed(2)}ms`);
      logger.info(`P95 response time: ${results.p95ResponseTime.toFixed(2)}ms`);
      logger.info(`P99 response time: ${results.p99ResponseTime.toFixed(2)}ms`);

      return results;
    } catch (error) {
      logger.error('Load test failed:', error);
      throw error;
    }
  }

  async runUserRequests(endpoint, method, data, requestCount, duration) {
    const results = {
      successful: 0,
      failed: 0,
      responseTimes: [],
      errors: []
    };

    const startTime = Date.now();
    const interval = duration / requestCount;

    for (let i = 0; i < requestCount; i++) {
      if (Date.now() - startTime >= duration) {
        break;
      }

      try {
        const requestStart = Date.now();
        let response;

        if (method === 'GET') {
          response = await request(app).get(endpoint);
        } else if (method === 'POST') {
          response = await request(app).post(endpoint).send(data);
        } else if (method === 'PUT') {
          response = await request(app).put(endpoint).send(data);
        } else if (method === 'DELETE') {
          response = await request(app).delete(endpoint);
        }

        const requestDuration = Date.now() - requestStart;

        if (response.status >= 200 && response.status < 300) {
          results.successful++;
          results.responseTimes.push(requestDuration);
        } else {
          results.failed++;
          results.responseTimes.push(requestDuration);
          results.errors.push({
            status: response.status,
            message: response.body?.message || 'Request failed'
          });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          message: error.message,
          stack: error.stack
        });
      }

      await this.sleep(interval);
    }

    return results;
  }

  async runConcurrentTest(tests, maxConcurrency = 10) {
    const results = {
      totalTests: tests.length,
      successfulTests: 0,
      failedTests: 0,
      testResults: []
    };

    try {
      logger.info(`Starting concurrent test with ${tests.length} tests`);
      const startTime = Date.now();

      const testPromises = tests.map(test => 
        this.runSingleTest(test)
      );

      const testResults = await Promise.all(testPromises);

      testResults.forEach((testResult, index) => {
        results.testResults.push({
          test: tests[index],
          result: testResult
        });

        if (testResult.success) {
          results.successfulTests++;
        } else {
          results.failedTests++;
        }
      });

      results.duration = Date.now() - startTime;
      results.avgTestDuration = results.testResults.reduce((sum, tr) => sum + tr.duration, 0) / results.testResults.length;

      logger.info(`Concurrent test completed: ${results.successfulTests}/${results.totalTests} successful`);
      logger.info(`Total duration: ${results.duration}ms`);
      logger.info(`Avg test duration: ${results.avgTestDuration.toFixed(2)}ms`);

      return results;
    } catch (error) {
      logger.error('Concurrent test failed:', error);
      throw error;
    }
  }

  async runSingleTest(test) {
    const startTime = Date.now();
    try {
      let response;
      if (test.method === 'GET') {
        response = await request(app).get(test.endpoint);
      } else if (test.method === 'POST') {
        response = await request(app).post(test.endpoint).send(test.data);
      } else if (test.method === 'PUT') {
        response = await request(app).put(test.endpoint).send(test.data);
      } else if (test.method === 'DELETE') {
        response = await request(app).delete(test.endpoint);
      }

      const duration = Date.now() - startTime;
      return {
        success: response.status >= 200 && response.status < 300,
        status: response.status,
        duration,
        data: response.body
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        error: error.message,
        duration
      };
    }
  }

  async runStressTest(endpoint, method = 'GET', data = null, options = {}) {
    const {
      startConcurrency = 10,
      maxConcurrency = 1000,
      step = 10,
      stepDuration = 30,
      requestsPerUser = 10
    } = options;

    const results = {
      endpoint,
      method,
      steps: []
    };

    try {
      logger.info(`Starting stress test for ${method} ${endpoint}`);
      logger.info(`Concurrency range: ${startConcurrency} - ${maxConcurrency}`);

      for (let concurrency = startConcurrency; concurrency <= maxConcurrency; concurrency += step) {
        logger.info(`Testing with ${concurrency} concurrent users`);

        const stepResult = await this.runLoadTest(
          endpoint,
          method,
          data,
          {
            concurrentUsers: concurrency,
            totalRequests: concurrency * requestsPerUser,
            duration: stepDuration
          }
        );

        stepResult.concurrency = concurrency;
        results.steps.push(stepResult);

        if (stepResult.errorRate > 0.1) {
          logger.warn(`High error rate at concurrency ${concurrency}: ${stepResult.errorRate.toFixed(2)}%`);
        }

        if (stepResult.avgResponseTime > this.thresholds.p99ResponseTime) {
          logger.warn(`High response time at concurrency ${concurrency}: ${stepResult.avgResponseTime.toFixed(2)}ms`);
        }
      }

      logger.info(`Stress test completed for ${method} ${endpoint}`);
      return results;
    } catch (error) {
      logger.error('Stress test failed:', error);
      throw error;
    }
  }

  calculatePercentile(values, percentile) {
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async runFullPerformanceTest() {
    const fullResults = {
      timestamp: new Date().toISOString(),
      loadTests: [],
      stressTests: [],
      summary: {}
    };

    try {
      logger.info('Starting full performance test suite');

      const loadTests = [
        { endpoint: '/api/v1/parties', method: 'GET', name: 'Get Parties List' },
        { endpoint: '/api/v1/parties/1', method: 'GET', name: 'Get Party Detail' },
        { endpoint: '/api/v1/users/1', method: 'GET', name: 'Get User Profile' },
        { endpoint: '/api/v1/orders', method: 'GET', name: 'Get Orders List' }
      ];

      for (const test of loadTests) {
        logger.info(`Running load test: ${test.name}`);
        const result = await this.runLoadTest(test.endpoint, test.method, null, {
          concurrentUsers: 100,
          totalRequests: 1000,
          duration: 30
        });
        result.name = test.name;
        fullResults.loadTests.push(result);
      }

      const stressTests = [
        { endpoint: '/api/v1/parties', method: 'GET', name: 'Get Parties Stress Test' },
        { endpoint: '/api/v1/parties/1', method: 'GET', name: 'Get Party Detail Stress Test' }
      ];

      for (const test of stressTests) {
        logger.info(`Running stress test: ${test.name}`);
        const result = await this.runStressTest(test.endpoint, test.method, null, {
          startConcurrency: 10,
          maxConcurrency: 500,
          step: 10,
          stepDuration: 10,
          requestsPerUser: 5
        });
        result.name = test.name;
        fullResults.stressTests.push(result);
      }

      fullResults.summary = this.generateSummary(fullResults);

      logger.info('Full performance test suite completed');
      return fullResults;
    } catch (error) {
      logger.error('Full performance test suite failed:', error);
      throw error;
    }
  }

  generateSummary(results) {
    const summary = {
      totalLoadTests: results.loadTests.length,
      totalStressTests: results.stressTests.length,
      avgThroughput: 0,
      avgResponseTime: 0,
      avgErrorRate: 0,
      passedTests: 0,
      failedTests: 0,
      recommendations: []
    };

    results.loadTests.forEach(test => {
      summary.avgThroughput += test.throughput;
      summary.avgResponseTime += test.avgResponseTime;
      summary.avgErrorRate += test.errorRate;

      if (test.throughput >= this.thresholds.throughput) {
        summary.passedTests++;
      } else {
        summary.failedTests++;
        summary.recommendations.push({
          test: test.name || test.endpoint,
          issue: 'Low throughput',
          current: test.throughput.toFixed(2) + ' req/s',
          threshold: this.thresholds.throughput + ' req/s'
        });
      }

      if (test.avgResponseTime > this.thresholds.responseTime) {
        summary.recommendations.push({
          test: test.name || test.endpoint,
          issue: 'High response time',
          current: test.avgResponseTime.toFixed(2) + 'ms',
          threshold: this.thresholds.responseTime + 'ms'
        });
      }

      if (test.errorRate > this.thresholds.errorRate) {
        summary.recommendations.push({
          test: test.name || test.endpoint,
          issue: 'High error rate',
          current: (test.errorRate * 100).toFixed(2) + '%',
          threshold: (this.thresholds.errorRate * 100).toFixed(2) + '%'
        });
      }
    });

    if (results.loadTests.length > 0) {
      summary.avgThroughput /= results.loadTests.length;
      summary.avgResponseTime /= results.loadTests.length;
      summary.avgErrorRate /= results.loadTests.length;
    }

    if (summary.avgErrorRate > this.thresholds.errorRate) {
      summary.recommendations.push({
        test: 'Overall',
        issue: 'High average error rate',
        current: (summary.avgErrorRate * 100).toFixed(2) + '%',
        threshold: (this.thresholds.errorRate * 100).toFixed(2) + '%',
        action: 'Review error handling and retry mechanisms'
      });
    }

    if (summary.avgResponseTime > this.thresholds.responseTime) {
      summary.recommendations.push({
        test: 'Overall',
        issue: 'High average response time',
        current: summary.avgResponseTime.toFixed(2) + 'ms',
        threshold: this.thresholds.responseTime + 'ms',
        action: 'Review database queries and implement caching'
      });
    }

    if (summary.avgThroughput < this.thresholds.throughput) {
      summary.recommendations.push({
        test: 'Overall',
        issue: 'Low average throughput',
        current: summary.avgThroughput.toFixed(2) + ' req/s',
        threshold: this.thresholds.throughput + ' req/s',
        action: 'Review server capacity and optimize bottlenecks'
      });
    }

    return summary;
  }

  generateReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      thresholds: this.thresholds,
      results,
      summary: results.summary,
      passed: results.summary.passedTests >= results.summary.totalLoadTests * 0.8,
      recommendations: results.summary.recommendations
    };

    return report;
  }

  async saveReport(report, filePath = './performance-report.json') {
    try {
      const fs = require('fs');
      fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
      logger.info(`Performance report saved to ${filePath}`);
      return true;
    } catch (error) {
      logger.error('Save performance report failed:', error);
      return false;
    }
  }
}

module.exports = new PerformanceTestService();
