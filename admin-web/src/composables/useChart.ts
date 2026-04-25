import { ref, computed } from 'vue'
import type { EChartsOption } from 'echarts'

export interface ChartData {
  labels: string[]
  values: number[]
  series?: {
    name: string
    data: number[]
  }[]
}

/**
 * Composable for creating chart configurations
 */
export function useChart() {
  const loading = ref(false)
  
  /**
   * Create line chart option
   */
  const createLineChartOption = (
    data: ChartData,
    title?: string
  ): EChartsOption => {
    return {
      title: title ? {
        text: title,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      } : undefined,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: data.series ? {
        data: data.series.map(s => s.name),
        bottom: 0
      } : undefined,
      grid: {
        left: '3%',
        right: '4%',
        bottom: data.series ? '10%' : '3%',
        top: title ? '15%' : '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.labels
      },
      yAxis: {
        type: 'value'
      },
      series: data.series ? data.series.map(s => ({
        name: s.name,
        type: 'line',
        smooth: true,
        data: s.data,
        areaStyle: {
          opacity: 0.3
        }
      })) : [{
        type: 'line',
        smooth: true,
        data: data.values,
        areaStyle: {
          opacity: 0.3
        }
      }]
    }
  }
  
  /**
   * Create bar chart option
   */
  const createBarChartOption = (
    data: ChartData,
    title?: string
  ): EChartsOption => {
    return {
      title: title ? {
        text: title,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      } : undefined,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: data.series ? {
        data: data.series.map(s => s.name),
        bottom: 0
      } : undefined,
      grid: {
        left: '3%',
        right: '4%',
        bottom: data.series ? '10%' : '3%',
        top: title ? '15%' : '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.labels
      },
      yAxis: {
        type: 'value'
      },
      series: data.series ? data.series.map(s => ({
        name: s.name,
        type: 'bar',
        data: s.data
      })) : [{
        type: 'bar',
        data: data.values
      }]
    }
  }
  
  /**
   * Create pie chart option
   */
  const createPieChartOption = (
    data: { name: string; value: number }[],
    title?: string
  ): EChartsOption => {
    return {
      title: title ? {
        text: title,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      } : undefined,
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
          name: title || '数据',
          type: 'pie',
          radius: '50%',
          data: data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
  }
  
  /**
   * Create area chart option (similar to line but with filled area)
   */
  const createAreaChartOption = (
    data: ChartData,
    title?: string
  ): EChartsOption => {
    const lineOption = createLineChartOption(data, title)
    
    // Ensure series has areaStyle
    if (lineOption.series && Array.isArray(lineOption.series)) {
      lineOption.series = lineOption.series.map(s => ({
        ...s,
        areaStyle: {
          opacity: 0.5
        }
      }))
    }
    
    return lineOption
  }
  
  return {
    loading,
    createLineChartOption,
    createBarChartOption,
    createPieChartOption,
    createAreaChartOption
  }
}
