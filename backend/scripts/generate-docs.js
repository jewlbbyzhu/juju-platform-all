const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'JuJu Party API',
      version: '1.0.0',
      description: 'JuJu Party 聚聚平台统一后端API文档'
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server'
      }
    ]
  },
  apis: ['./src/routes/**/*.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

const outputPath = path.join(__dirname, '../docs/api-docs.json');
fs.writeFileSync(outputPath, JSON.stringify(swaggerDocs, null, 2));

console.log('API documentation generated successfully!');
console.log(`Output: ${outputPath}`);
