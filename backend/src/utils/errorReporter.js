const logger = require('./logger');

async function reportError(error, context = {}) {
  if (process.env.NODE_ENV !== 'production') {
    logger.debug('Error reporting skipped in non-production environment');
    return;
  }

  const errorReport = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      type: error.type
    },
    context: {
      url: context.url,
      method: context.method,
      userAgent: context.userAgent,
      client: context.client,
      body: context.body,
      query: context.query,
      params: context.params,
      headers: context.headers,
      requestId: context.requestId
    },
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      env: process.env.NODE_ENV
    }
  };

  try {
    const errorReportUrl = process.env.ERROR_REPORT_URL;
    if (errorReportUrl) {
      const fetch = require('node-fetch');
      await fetch(errorReportUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorReport)
      });
      logger.info('Error reported successfully:', { requestId: context.requestId });
    } else {
      logger.warn('Error report URL not configured, logging error report:', errorReport);
    }
  } catch (reportError) {
    logger.error('Failed to report error:', reportError);
  }
}

module.exports = { reportError };
