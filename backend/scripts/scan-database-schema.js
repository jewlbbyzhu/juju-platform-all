/**
 * 数据库结构扫描脚本
 * 用于获取真实 MySQL 数据库的表结构和字段信息
 * 并与后端 Sequelize 模型进行对比
 */

const { Sequelize, QueryTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');

// 数据库连接配置 - 直接从配置文件读取
const DB_CONFIG = {
  host: '122.51.255.13',
  port: 3306,
  database: 'hfparty_db_new',
  username: 'hfparty_user',
  password: 'Zaqzzh.521',
  ssl: false
};

// 数据库连接配置
const sequelize = new Sequelize(
  DB_CONFIG.database,
  DB_CONFIG.username,
  DB_CONFIG.password,
  {
    host: DB_CONFIG.host,
    port: DB_CONFIG.port,
    dialect: 'mysql',
    dialectOptions: {
      ssl: DB_CONFIG.ssl ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    logging: false
  }
);

// 获取所有表的结构
async function getDatabaseSchema() {
  try {
    console.log('🔌 正在连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功！\n');

    // 获取所有表名
    const tables = await sequelize.query(
      `SELECT TABLE_NAME 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = ?`,
      {
        replacements: [DB_CONFIG.database],
        type: QueryTypes.SELECT
      }
    );

    console.log(`📊 发现 ${tables.length} 个表\n`);

    const schema = {};

    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      console.log(`🔍 正在扫描表: ${tableName}`);

      // 获取表字段信息
      const columns = await sequelize.query(
        `SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          CHARACTER_MAXIMUM_LENGTH,
          NUMERIC_PRECISION,
          NUMERIC_SCALE,
          IS_NULLABLE,
          COLUMN_DEFAULT,
          COLUMN_COMMENT,
          EXTRA,
          COLUMN_KEY
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
         ORDER BY ORDINAL_POSITION`,
        {
          replacements: [DB_CONFIG.database, tableName],
          type: QueryTypes.SELECT
        }
      );

      // 获取表索引信息
      const indexes = await sequelize.query(
        `SELECT
          INDEX_NAME,
          COLUMN_NAME,
          NON_UNIQUE,
          SEQ_IN_INDEX
         FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
         ORDER BY INDEX_NAME, SEQ_IN_INDEX`,
        {
          replacements: [DB_CONFIG.database, tableName],
          type: QueryTypes.SELECT
        }
      );

      // 获取外键信息
      const foreignKeys = await sequelize.query(
        `SELECT
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME,
          CONSTRAINT_NAME
         FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
         WHERE TABLE_SCHEMA = ?
           AND TABLE_NAME = ?
           AND REFERENCED_TABLE_NAME IS NOT NULL`,
        {
          replacements: [DB_CONFIG.database, tableName],
          type: QueryTypes.SELECT
        }
      );

      // 获取表注释
      const tableInfo = await sequelize.query(
        `SELECT TABLE_COMMENT
         FROM INFORMATION_SCHEMA.TABLES
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
        {
          replacements: [DB_CONFIG.database, tableName],
          type: QueryTypes.SELECT
        }
      );

      schema[tableName] = {
        comment: tableInfo[0]?.TABLE_COMMENT || '',
        columns: columns.map(col => ({
          name: col.COLUMN_NAME,
          type: col.DATA_TYPE,
          length: col.CHARACTER_MAXIMUM_LENGTH,
          precision: col.NUMERIC_PRECISION,
          scale: col.NUMERIC_SCALE,
          nullable: col.IS_NULLABLE === 'YES',
          default: col.COLUMN_DEFAULT,
          comment: col.COLUMN_COMMENT,
          extra: col.EXTRA,
          key: col.COLUMN_KEY
        })),
        indexes: indexes.reduce((acc, idx) => {
          if (!acc[idx.INDEX_NAME]) {
            acc[idx.INDEX_NAME] = {
              unique: idx.NON_UNIQUE === 0,
              columns: []
            };
          }
          acc[idx.INDEX_NAME].columns.push(idx.COLUMN_NAME);
          return acc;
        }, {}),
        foreignKeys: foreignKeys.map(fk => ({
          column: fk.COLUMN_NAME,
          references: {
            table: fk.REFERENCED_TABLE_NAME,
            column: fk.REFERENCED_COLUMN_NAME
          },
          constraint: fk.CONSTRAINT_NAME
        }))
      };
    }

    return schema;
  } catch (error) {
    console.error('❌ 获取数据库结构失败:', error.message);
    throw error;
  }
}

// 获取 Sequelize 模型定义
function getModelDefinitions() {
  const modelsDir = path.join(__dirname, '..', 'src', 'models');
  const models = {};

  // 读取所有模型文件
  const modelFiles = fs.readdirSync(modelsDir)
    .filter(file => file.endsWith('.js') && file !== 'index.js');

  console.log(`\n📦 发现 ${modelFiles.length} 个模型文件\n`);

  for (const file of modelFiles) {
    const modelName = path.basename(file, '.js');
    const modelPath = path.join(modelsDir, file);
    
    try {
      // 清除缓存，确保获取最新定义
      delete require.cache[require.resolve(modelPath)];
      const model = require(modelPath);
      
      if (model && model.rawAttributes) {
        models[modelName] = {
          tableName: model.getTableName(),
          attributes: model.rawAttributes,
          indexes: model.options.indexes || []
        };
      }
    } catch (error) {
      console.warn(`⚠️  无法加载模型 ${modelName}: ${error.message}`);
    }
  }

  return models;
}

// 对比数据库和模型
function compareSchema(dbSchema, models) {
  const report = {
    summary: {
      totalTablesInDB: Object.keys(dbSchema).length,
      totalModels: Object.keys(models).length,
      matched: 0,
      missingInDB: [],
      missingInModels: [],
      mismatched: []
    },
    details: {}
  };

  // 检查模型对应的表是否在数据库中
  for (const [modelName, modelDef] of Object.entries(models)) {
    const tableName = modelDef.tableName;
    
    if (!dbSchema[tableName]) {
      report.summary.missingInDB.push({
        model: modelName,
        table: tableName
      });
      continue;
    }

    report.summary.matched++;

    // 对比字段
    const dbTable = dbSchema[tableName];
    const modelAttrs = modelDef.attributes;
    const fieldDiffs = [];

    // 检查模型中的字段
    for (const [attrName, attrDef] of Object.entries(modelAttrs)) {
      // 跳过虚拟字段
      if (attrDef.type === undefined) continue;

      const dbColumn = dbTable.columns.find(col => col.name === attrName);
      
      if (!dbColumn) {
        fieldDiffs.push({
          field: attrName,
          issue: 'missing_in_db',
          modelType: attrDef.type.constructor.name
        });
        continue;
      }

      // 对比字段类型
      const typeMismatch = compareFieldTypes(attrDef, dbColumn);
      if (typeMismatch) {
        fieldDiffs.push({
          field: attrName,
          issue: 'type_mismatch',
          modelType: attrDef.type.constructor.name,
          dbType: dbColumn.type,
          details: typeMismatch
        });
      }

      // 对比是否可空
      if (attrDef.allowNull !== undefined && attrDef.allowNull !== dbColumn.nullable) {
        fieldDiffs.push({
          field: attrName,
          issue: 'nullable_mismatch',
          modelNullable: attrDef.allowNull,
          dbNullable: dbColumn.nullable
        });
      }

      // 对比默认值
      if (attrDef.defaultValue !== undefined) {
        const modelDefault = String(attrDef.defaultValue);
        const dbDefault = dbColumn.default !== null ? String(dbColumn.default) : null;
        
        if (modelDefault !== dbDefault) {
          fieldDiffs.push({
            field: attrName,
            issue: 'default_mismatch',
            modelDefault: attrDef.defaultValue,
            dbDefault: dbColumn.default
          });
        }
      }
    }

    // 检查数据库中有多余的字段
    for (const dbCol of dbTable.columns) {
      if (!modelAttrs[dbCol.name] && !['created_at', 'updated_at'].includes(dbCol.name)) {
        fieldDiffs.push({
          field: dbCol.name,
          issue: 'extra_in_db',
          dbType: dbCol.type
        });
      }
    }

    if (fieldDiffs.length > 0) {
      report.summary.mismatched.push({
        model: modelName,
        table: tableName,
        differences: fieldDiffs.length
      });
      report.details[tableName] = fieldDiffs;
    }
  }

  // 检查数据库中有多余的表
  for (const tableName of Object.keys(dbSchema)) {
    const hasModel = Object.values(models).some(m => m.tableName === tableName);
    if (!hasModel) {
      report.summary.missingInModels.push(tableName);
    }
  }

  return report;
}

// 对比字段类型
function compareFieldTypes(attrDef, dbColumn) {
  const sequelizeType = attrDef.type.constructor.name;
  const dbType = dbColumn.type.toUpperCase();

  const typeMapping = {
    'INTEGER': ['INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'TINYINT'],
    'BIGINT': ['BIGINT', 'INT', 'INTEGER'],
    'STRING': ['VARCHAR', 'CHAR', 'TEXT', 'LONGTEXT'],
    'TEXT': ['TEXT', 'LONGTEXT', 'VARCHAR'],
    'DECIMAL': ['DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE'],
    'DATE': ['DATE', 'DATETIME', 'TIMESTAMP'],
    'DATEONLY': ['DATE'],
    'BOOLEAN': ['TINYINT', 'BOOLEAN', 'BIT'],
    'ENUM': ['ENUM', 'VARCHAR'],
    'JSON': ['JSON', 'TEXT'],
    'FLOAT': ['FLOAT', 'DOUBLE', 'DECIMAL']
  };

  // 检查类型是否匹配
  let isMatch = false;
  
  if (typeMapping[sequelizeType]) {
    isMatch = typeMapping[sequelizeType].some(t => dbType.includes(t));
  } else {
    isMatch = dbType.includes(sequelizeType.toUpperCase());
  }

  if (!isMatch) {
    return {
      sequelizeType,
      dbType,
      message: `类型不匹配: 模型使用 ${sequelizeType}, 数据库使用 ${dbType}`
    };
  }

  // 检查字符串长度
  if (sequelizeType === 'STRING' && dbColumn.length) {
    const modelLength = attrDef.type.options?.length;
    if (modelLength && modelLength !== dbColumn.length) {
      return {
        sequelizeType,
        dbType,
        modelLength,
        dbLength: dbColumn.length,
        message: `长度不匹配: 模型长度 ${modelLength}, 数据库长度 ${dbColumn.length}`
      };
    }
  }

  // 检查 DECIMAL 精度
  if (sequelizeType === 'DECIMAL') {
    const modelPrecision = attrDef.type.options?.precision;
    const modelScale = attrDef.type.options?.scale;
    
    if ((modelPrecision && modelPrecision !== dbColumn.precision) ||
        (modelScale && modelScale !== dbColumn.scale)) {
      return {
        sequelizeType,
        dbType,
        modelPrecision,
        modelScale,
        dbPrecision: dbColumn.precision,
        dbScale: dbColumn.scale,
        message: `精度不匹配: 模型 (${modelPrecision},${modelScale}), 数据库 (${dbColumn.precision},${dbColumn.scale})`
      };
    }
  }

  return null;
}

// 生成报告
function generateReport(report, dbSchema) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(__dirname, '..', `database-schema-report-${timestamp}.md`);

  let markdown = `# 数据库架构对比报告\n\n`;
  markdown += `**生成时间**: ${new Date().toLocaleString()}\n\n`;
  markdown += `**数据库**: ${DB_CONFIG.database}@${DB_CONFIG.host}\n\n`;
  markdown += `---\n\n`;

  // 摘要
  markdown += `## 📊 摘要\n\n`;
  markdown += `- **数据库中的表数量**: ${report.summary.totalTablesInDB}\n`;
  markdown += `- **模型定义数量**: ${report.summary.totalModels}\n`;
  markdown += `- **匹配的表**: ${report.summary.matched}\n`;
  markdown += `- **数据库中缺失的表**: ${report.summary.missingInDB.length}\n`;
  markdown += `- **模型中缺失的表**: ${report.summary.missingInModels.length}\n`;
  markdown += `- **字段不匹配的表**: ${report.summary.mismatched.length}\n\n`;

  // 数据库中缺失的表
  if (report.summary.missingInDB.length > 0) {
    markdown += `## 🔴 数据库中缺失的表（需要创建）\n\n`;
    markdown += `| 模型名 | 表名 | 状态 |\n`;
    markdown += `|--------|------|------|\n`;
    for (const item of report.summary.missingInDB) {
      markdown += `| ${item.model} | ${item.table} | ❌ 缺失 |\n`;
    }
    markdown += `\n`;
  }

  // 模型中缺失的表
  if (report.summary.missingInModels.length > 0) {
    markdown += `## 🟡 模型中未定义的表（多余表）\n\n`;
    markdown += `| 表名 | 操作建议 |\n`;
    markdown += `|------|----------|\n`;
    for (const table of report.summary.missingInModels) {
      markdown += `| ${table} | 考虑删除或创建对应模型 |\n`;
    }
    markdown += `\n`;
  }

  // 字段不匹配的表
  if (report.summary.mismatched.length > 0) {
    markdown += `## ⚠️ 字段不匹配的表\n\n`;
    
    for (const item of report.summary.mismatched) {
      markdown += `### ${item.table} (${item.differences} 处差异)\n\n`;
      markdown += `| 字段 | 问题类型 | 模型定义 | 数据库实际 |\n`;
      markdown += `|------|----------|----------|------------|\n`;
      
      const diffs = report.details[item.table];
      for (const diff of diffs) {
        let modelDef = '-';
        let dbDef = '-';
        
        switch (diff.issue) {
          case 'missing_in_db':
            modelDef = diff.modelType;
            dbDef = '❌ 不存在';
            break;
          case 'extra_in_db':
            modelDef = '❌ 未定义';
            dbDef = diff.dbType;
            break;
          case 'type_mismatch':
            modelDef = `${diff.modelType}`;
            dbDef = `${diff.dbType}`;
            if (diff.details) {
              modelDef += ` (${diff.details.modelLength || diff.details.modelPrecision || ''})`;
              dbDef += ` (${diff.details.dbLength || diff.details.dbPrecision || ''})`;
            }
            break;
          case 'nullable_mismatch':
            modelDef = diff.modelNullable ? '可空' : '非空';
            dbDef = diff.dbNullable ? '可空' : '非空';
            break;
          case 'default_mismatch':
            modelDef = diff.modelDefault;
            dbDef = diff.dbDefault;
            break;
        }
        
        const issueType = {
          'missing_in_db': '🔴 缺失',
          'extra_in_db': '🟡 多余',
          'type_mismatch': '⚠️ 类型不匹配',
          'nullable_mismatch': '⚠️ 可空性不匹配',
          'default_mismatch': '⚠️ 默认值不匹配'
        }[diff.issue] || diff.issue;
        
        markdown += `| ${diff.field} | ${issueType} | ${modelDef} | ${dbDef} |\n`;
      }
      markdown += `\n`;
    }
  }

  // 完整的表结构
  markdown += `## 📋 完整数据库表结构\n\n`;
  
  for (const [tableName, tableInfo] of Object.entries(dbSchema)) {
    markdown += `### ${tableName}\n\n`;
    if (tableInfo.comment) {
      markdown += `> ${tableInfo.comment}\n\n`;
    }
    
    markdown += `**字段**:\n\n`;
    markdown += `| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |\n`;
    markdown += `|--------|------|-----------|------|--------|------|\n`;
    
    for (const col of tableInfo.columns) {
      const typeStr = col.length 
        ? `${col.type}(${col.length})`
        : col.precision 
          ? `${col.type}(${col.precision},${col.scale})`
          : col.type;
      
      markdown += `| ${col.name} | ${typeStr} | ${col.nullable ? '是' : '否'} | ${col.default || '-'} | ${col.comment || '-'} |\n`;
    }
    
    if (Object.keys(tableInfo.indexes).length > 0) {
      markdown += `\n**索引**:\n\n`;
      markdown += `| 索引名 | 类型 | 字段 |\n`;
      markdown += `|--------|------|------|\n`;
      
      for (const [idxName, idxInfo] of Object.entries(tableInfo.indexes)) {
        const type = idxName === 'PRIMARY' ? '主键' : idxInfo.unique ? '唯一' : '普通';
        markdown += `| ${idxName} | ${type} | ${idxInfo.columns.join(', ')} |\n`;
      }
    }
    
    if (tableInfo.foreignKeys.length > 0) {
      markdown += `\n**外键**:\n\n`;
      markdown += `| 字段 | 引用表 | 引用字段 |\n`;
      markdown += `|------|--------|----------|\n`;
      
      for (const fk of tableInfo.foreignKeys) {
        markdown += `| ${fk.column} | ${fk.references.table} | ${fk.references.column} |\n`;
      }
    }
    
    markdown += `\n---\n\n`;
  }

  fs.writeFileSync(reportPath, markdown);
  console.log(`\n✅ 报告已生成: ${reportPath}`);
  
  return reportPath;
}

// 主函数
async function main() {
  try {
    console.log('🚀 开始扫描数据库结构...\n');
    
    // 获取数据库结构
    const dbSchema = await getDatabaseSchema();
    
    // 获取模型定义
    console.log('\n📦 正在加载 Sequelize 模型...');
    const models = getModelDefinitions();
    
    // 对比差异
    console.log('\n🔍 正在对比数据库和模型...');
    const report = compareSchema(dbSchema, models);
    
    // 生成报告
    const reportPath = generateReport(report, dbSchema);
    
    // 打印摘要
    console.log('\n' + '='.repeat(60));
    console.log('📊 扫描完成！');
    console.log('='.repeat(60));
    console.log(`数据库表数量: ${report.summary.totalTablesInDB}`);
    console.log(`模型定义数量: ${report.summary.totalModels}`);
    console.log(`匹配的表: ${report.summary.matched}`);
    console.log(`数据库中缺失的表: ${report.summary.missingInDB.length}`);
    console.log(`模型中缺失的表: ${report.summary.missingInModels.length}`);
    console.log(`字段不匹配的表: ${report.summary.mismatched.length}`);
    console.log('='.repeat(60));
    
    if (report.summary.missingInDB.length > 0) {
      console.log('\n🔴 需要在数据库中创建的表:');
      report.summary.missingInDB.forEach(item => {
        console.log(`  - ${item.table} (${item.model})`);
      });
    }
    
    if (report.summary.mismatched.length > 0) {
      console.log('\n⚠️  需要修复字段的表:');
      report.summary.mismatched.forEach(item => {
        console.log(`  - ${item.table} (${item.differences} 处差异)`);
      });
    }
    
    console.log(`\n📄 详细报告: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ 扫描失败:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 运行
main();
