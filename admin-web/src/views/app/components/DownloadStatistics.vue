<template>
  <div class="download-statistics">
    <!-- Filter Form -->
    <el-form :inline="true" :model="filterForm" class="filter-form">
      <el-form-item label="版本">
        <el-select
          v-model="filterForm.versionId"
          placeholder="全部版本"
          clearable
          filterable
        >
          <el-option
            v-for="version in versionOptions"
            :key="version.id"
            :label="`${version.versionName} (${version.platform})`"
            :value="version.id"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="平台">
        <el-select v-model="filterForm.platform" placeholder="全部平台" clearable>
          <el-option label="Android" value="android" />
          <el-option label="iOS" value="ios" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="时间范围">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      
      <el-form-item label="分组">
        <el-select v-model="filterForm.groupBy" placeholder="按天">
          <el-option label="按天" value="day" />
          <el-option label="按周" value="week" />
          <el-option label="按月" value="month" />
        </el-select>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="handleQuery">
          <el-icon><Search /></el-icon>
          查询
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- Statistics Cards -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="总下载量" :value="Number(totalDownloads) || 0">
            <template #prefix>
              <el-icon><Download /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="Android下载" :value="Number(androidDownloads) || 0">
            <template #prefix>
              <el-icon style="color: #52c41a"><Cellphone /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="iOS下载" :value="Number(iosDownloads) || 0">
            <template #prefix>
              <el-icon style="color: #1890ff"><Iphone /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- Download Trend Chart -->
    <el-card shadow="never" class="chart-card">
      <template #header>
        <div class="card-header">
          <span>下载趋势</span>
          <el-button type="primary" size="small" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>
      </template>
      
      <div ref="chartRef" class="chart-container"></div>
    </el-card>

    <!-- Platform Distribution Chart -->
    <el-card shadow="never" class="chart-card">
      <template #header>
        <span>平台分布</span>
      </template>
      
      <div ref="pieChartRef" class="chart-container" style="height: 400px"></div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Download, Cellphone, Iphone } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { AppAPI } from '@/api'
import type { AppVersion, DownloadStatsParams } from '@/types/app'

const chartRef = ref<HTMLElement>()
const pieChartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null
let pieChartInstance: echarts.ECharts | null = null

const versionOptions = ref<AppVersion[]>([])
const dateRange = ref<[string, string] | []>([])
const totalDownloads = ref(0)
const androidDownloads = ref(0)
const iosDownloads = ref(0)

const filterForm = reactive<DownloadStatsParams>({
  versionId: undefined,
  platform: undefined,
  startDate: undefined,
  endDate: undefined,
  groupBy: 'day'
})

const loadVersions = async () => {
  try {
    const response = await AppAPI.getVersions({
      page: 1,
      pageSize: 100,
      status: 'published'
    })
    versionOptions.value = response.list
  } catch (error) {
    console.error('Load versions error:', error)
  }
}

const loadStats = async () => {
  try {
    const params = { ...filterForm }
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }

    const response = await AppAPI.getDownloadStats(params)
    totalDownloads.value = response.totalDownloads
    
    // Calculate platform downloads
    androidDownloads.value = response.stats
      .filter(s => s.platform === 'android')
      .reduce((sum, s) => sum + s.downloads, 0)
    
    iosDownloads.value = response.stats
      .filter(s => s.platform === 'ios')
      .reduce((sum, s) => sum + s.downloads, 0)

    // Update charts
    updateTrendChart(response.stats)
    updatePieChart()
  } catch (error) {
    console.error('Load stats error:', error)
    ElMessage.error('加载统计数据失败')
  }
}

const updateTrendChart = (stats: any[]) => {
  if (!chartRef.value) return

  // Check if DOM has valid dimensions
  const { clientWidth, clientHeight } = chartRef.value
  if (clientWidth === 0 || clientHeight === 0) {
    // DOM not ready, retry after a short delay
    setTimeout(() => updateTrendChart(stats), 100)
    return
  }

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  // Group data by platform
  const androidData = stats
    .filter(s => s.platform === 'android')
    .map(s => ({ date: s.date, value: s.downloads }))
  
  const iosData = stats
    .filter(s => s.platform === 'ios')
    .map(s => ({ date: s.date, value: s.downloads }))

  // Get all unique dates
  const dates = Array.from(new Set([
    ...androidData.map(d => d.date),
    ...iosData.map(d => d.date)
  ])).sort()

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['Android', 'iOS']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value',
      name: '下载量'
    },
    series: [
      {
        name: 'Android',
        type: 'line',
        smooth: true,
        data: dates.map(date => {
          const item = androidData.find(d => d.date === date)
          return item ? item.value : 0
        }),
        itemStyle: {
          color: '#52c41a'
        }
      },
      {
        name: 'iOS',
        type: 'line',
        smooth: true,
        data: dates.map(date => {
          const item = iosData.find(d => d.date === date)
          return item ? item.value : 0
        }),
        itemStyle: {
          color: '#1890ff'
        }
      }
    ]
  }

  chartInstance.setOption(option)
}

const updatePieChart = () => {
  if (!pieChartRef.value) return

  // Check if DOM has valid dimensions
  const { clientWidth, clientHeight } = pieChartRef.value
  if (clientWidth === 0 || clientHeight === 0) {
    // DOM not ready, retry after a short delay
    setTimeout(updatePieChart, 100)
    return
  }

  if (!pieChartInstance) {
    pieChartInstance = echarts.init(pieChartRef.value)
  }

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '平台分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {d}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        data: [
          {
            value: androidDownloads.value,
            name: 'Android',
            itemStyle: { color: '#52c41a' }
          },
          {
            value: iosDownloads.value,
            name: 'iOS',
            itemStyle: { color: '#1890ff' }
          }
        ]
      }
    ]
  }

  pieChartInstance.setOption(option)
}

const handleQuery = () => {
  loadStats()
}

const handleReset = () => {
  Object.assign(filterForm, {
    versionId: undefined,
    platform: undefined,
    startDate: undefined,
    endDate: undefined,
    groupBy: 'day'
  })
  dateRange.value = []
  loadStats()
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

const refresh = () => {
  loadStats()
}

// Handle window resize
const handleResize = () => {
  chartInstance?.resize()
  pieChartInstance?.resize()
}

onMounted(async () => {
  await loadVersions()
  await nextTick()
  await loadStats()
  
  window.addEventListener('resize', handleResize)
})

watch(() => filterForm.groupBy, () => {
  loadStats()
})

defineExpose({
  refresh
})
</script>

<style scoped lang="scss">
.download-statistics {
  .filter-form {
    margin-bottom: 20px;
  }

  .stats-row {
    margin-bottom: 20px;
  }

  .chart-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chart-container {
      width: 100%;
      height: 500px;
    }
  }
}
</style>
