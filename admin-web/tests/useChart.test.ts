import { describe, it, expect } from 'vitest'
import { useChart } from '@/composables/useChart'

describe('useChart Composable', () => {
  it('should create line chart option correctly', () => {
    const { createLineChartOption } = useChart()
    
    const data = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      values: [10, 20, 30, 40, 50]
    }
    
    const option = createLineChartOption(data, 'Test Chart')
    
    expect(option).toBeDefined()
    expect(option.xAxis).toBeDefined()
    expect(option.yAxis).toBeDefined()
    expect(option.series).toBeDefined()
    expect(option.title).toBeDefined()
  })

  it('should create line chart option with series', () => {
    const { createLineChartOption } = useChart()
    
    const data = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      series: [
        { name: 'Series 1', data: [10, 20, 30, 40, 50] },
        { name: 'Series 2', data: [15, 25, 35, 45, 55] }
      ]
    }
    
    const option = createLineChartOption(data)
    
    expect(option.series).toBeDefined()
    expect(option.series).toHaveLength(2)
  })

  it('should create bar chart option correctly', () => {
    const { createBarChartOption } = useChart()
    
    const data = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      values: [10, 20, 30, 40, 50]
    }
    
    const option = createBarChartOption(data, 'Test Bar Chart')
    
    expect(option).toBeDefined()
    expect(option.xAxis).toBeDefined()
    expect(option.yAxis).toBeDefined()
    expect(option.series).toBeDefined()
  })

  it('should create pie chart option correctly', () => {
    const { createPieChartOption } = useChart()
    
    const data = [
      { name: 'Category 1', value: 100 },
      { name: 'Category 2', value: 200 },
      { name: 'Category 3', value: 150 }
    ]
    
    const option = createPieChartOption(data, 'Test Pie Chart')
    
    expect(option).toBeDefined()
    expect(option.series).toBeDefined()
    expect(option.series).toHaveLength(1)
  })

  it('should create area chart option correctly', () => {
    const { createAreaChartOption } = useChart()
    
    const data = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      values: [10, 20, 30, 40, 50]
    }
    
    const option = createAreaChartOption(data, 'Test Area Chart')
    
    expect(option).toBeDefined()
    expect(option.series).toBeDefined()
  })

  it('should handle empty data', () => {
    const { createLineChartOption } = useChart()
    
    const data = {
      labels: [],
      values: []
    }
    
    const option = createLineChartOption(data)
    
    expect(option).toBeDefined()
    expect(option.xAxis).toBeDefined()
  })
})