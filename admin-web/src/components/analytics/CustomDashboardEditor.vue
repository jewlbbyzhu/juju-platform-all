<template>
  <div class="custom-dashboard-editor">
    <el-form :model="dashboardForm" label-width="100px">
      <el-form-item label="仪表盘名称">
        <el-input v-model="dashboardForm.name" placeholder="请输入仪表盘名称" />
      </el-form-item>
      
      <el-form-item label="描述">
        <el-input
          v-model="dashboardForm.description"
          type="textarea"
          :rows="3"
          placeholder="请输入描述"
        />
      </el-form-item>
      
      <el-form-item label="设为默认">
        <el-switch v-model="dashboardForm.isDefault" />
      </el-form-item>
    </el-form>
    
    <el-divider />
    
    <div class="widget-section">
      <div class="section-header">
        <h3>组件配置</h3>
        <el-button :icon="Plus" type="primary" @click="handleAddWidget">
          添加组件
        </el-button>
      </div>
      
      <div class="widget-list">
        <el-card
          v-for="(widget, index) in dashboardForm.widgets"
          :key="widget.id"
          class="widget-card"
        >
          <template #header>
            <div class="widget-header">
              <span>{{ widget.title }}</span>
              <el-button
                :icon="Delete"
                type="danger"
                size="small"
                text
                @click="handleRemoveWidget(index)"
              />
            </div>
          </template>
          
          <el-form :model="widget" label-width="80px" size="small">
            <el-form-item label="标题">
              <el-input v-model="widget.title" />
            </el-form-item>
            
            <el-form-item label="类型">
              <el-select v-model="widget.type">
                <el-option label="图表" value="chart" />
                <el-option label="指标" value="metric" />
                <el-option label="表格" value="table" />
                <el-option label="地图" value="map" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="维度">
              <el-select v-model="widget.dimension">
                <el-option label="用户" value="user" />
                <el-option label="聚会" value="party" />
                <el-option label="订单" value="order" />
                <el-option label="收入" value="revenue" />
                <el-option label="地区" value="region" />
                <el-option label="分类" value="category" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="指标">
              <el-input v-model="widget.metric" />
            </el-form-item>
            
            <el-form-item v-if="widget.type === 'chart'" label="图表类型">
              <el-select v-model="widget.chartType">
                <el-option label="折线图" value="line" />
                <el-option label="柱状图" value="bar" />
                <el-option label="饼图" value="pie" />
                <el-option label="面积图" value="area" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="尺寸">
              <el-select v-model="widget.size">
                <el-option label="小" value="small" />
                <el-option label="中" value="medium" />
                <el-option label="大" value="large" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="自动刷新">
              <el-switch v-model="widget.autoRefresh" />
            </el-form-item>
            
            <el-form-item v-if="widget.autoRefresh" label="刷新间隔">
              <el-input-number
                v-model="widget.refreshInterval"
                :min="10"
                :max="3600"
                :step="10"
              />
              <span style="margin-left: 8px">秒</span>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </div>
    
    <div class="editor-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElSwitch,
  ElDivider,
  ElButton,
  ElCard,
  ElSelect,
  ElOption,
  ElInputNumber,
  ElMessage
} from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { CustomDashboard, DashboardWidget } from '@/types/analytics'

const emit = defineEmits<{
  save: [dashboard: CustomDashboard]
  cancel: []
}>()

// Dashboard form
const dashboardForm = reactive<Partial<CustomDashboard>>({
  name: '',
  description: '',
  isDefault: false,
  widgets: []
})

// Generate unique widget ID
const generateWidgetId = () => {
  return `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Handle add widget
const handleAddWidget = () => {
  const newWidget: DashboardWidget = {
    id: generateWidgetId(),
    type: 'chart',
    title: '新组件',
    dimension: 'user',
    metric: 'count',
    chartType: 'line',
    size: 'medium',
    position: {
      x: 0,
      y: 0,
      w: 6,
      h: 4
    },
    autoRefresh: false,
    refreshInterval: 60
  }
  
  dashboardForm.widgets?.push(newWidget)
}

// Handle remove widget
const handleRemoveWidget = (index: number) => {
  dashboardForm.widgets?.splice(index, 1)
}

// Handle save
const handleSave = () => {
  if (!dashboardForm.name) {
    ElMessage.error('请输入仪表盘名称')
    return
  }
  
  if (!dashboardForm.widgets || dashboardForm.widgets.length === 0) {
    ElMessage.error('请至少添加一个组件')
    return
  }
  
  emit('save', dashboardForm as CustomDashboard)
}

// Handle cancel
const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped lang="scss">
.custom-dashboard-editor {
  .widget-section {
    margin-top: 20px;
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
    }
    
    .widget-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 16px;
      
      .widget-card {
        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      }
    }
  }
  
  .editor-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #e8e8e8;
  }
}
</style>
