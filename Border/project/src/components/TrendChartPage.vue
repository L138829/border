<!-- TrendChartPage.vue -->
<template>
  <div class="layout">
    <div class="fixed-header">
      <div class="top-nav">
        <div class="nav-left">边境城镇社会治理示范评估体系构建与应用</div>
        <div class="nav-right">
          <el-button type="text" class="nav-button" @click="$router.push('/')">首页</el-button>
          <el-button type="text" class="nav-button" @click="$router.push('/compare')">地区对比</el-button>
          <el-button type="text" class="nav-button" @click="$router.push({ path: '/detail', query: { region: '临翔区' } })">指标对比</el-button>
          <el-button type="text" class="nav-button" @click="$router.push('/index-analysis')">社会治理水平总指数</el-button>
        </div>
      </div>
    </div>
    <div class="top-placeholder"></div>

    <div class="box">
      <div class="detail-box">
        <!-- 标题 -->
        <h2>各地区总指数趋势图</h2>

        <!-- 图表区域 -->
        <div ref="chartRef" class="chart-container"></div>

        <!-- 返回按钮：回到上一页 -->
        <el-button
          @click="goBack"
          style="margin-top: 20px; background-color: #409EFF; color: white;"
        >
          返回
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { useRouter } from 'vue-router'
import { tableData as rawData } from '../data/tableData.js'

const router = useRouter()
function goBack() {
  router.back()
}

// ECharts 实例引用
const chartRef = ref(null)
let myChart = null

// ——— 指标权重 ———
const weights = {
  drugSmugglingCasesPerTenThousand: 0.15,
  borderCrossingRate:                0.10,
  specialPopulationChangeRate:       0.05,
  petitionCaseSettlementRate:        0.15,
  publicInfoOpenCount:               0.10,
  departmentCoordinationRate:        0.10,
  conflictResolutionRate:            0.20,
  hdSurveillanceCoverageRate:        0.05,
  publicSafetySatisfaction:          0.10
}
const invertMetrics = [
  'drugSmugglingCasesPerTenThousand',
  'borderCrossingRate',
  'specialPopulationChangeRate'
]

// 处理原始数据：归一化 → 加权 → 排名
function processData() {
  const arr = rawData.map(d => ({ ...d }))
  const stats = {}
  Object.keys(weights).forEach(key => {
    const vals = arr.map(d => d[key])
    stats[key] = { min: Math.min(...vals), max: Math.max(...vals) }
  })
  arr.forEach(d => {
    let sum = 0
    Object.entries(weights).forEach(([key, w]) => {
      const { min, max } = stats[key]
      let norm = (d[key] - min) / (max - min)
      if (invertMetrics.includes(key)) norm = (max - d[key]) / (max - min)
      sum += norm * w
    })
    d.compositeIndex = +(sum * 100).toFixed(2)
  })
  const byYear = {}
  arr.forEach(d => (byYear[d.year] ||= []).push(d))
  Object.values(byYear).forEach(list => {
    list.sort((a, b) => b.compositeIndex - a.compositeIndex)
    list.forEach((d, i) => (d.rank = i + 1))
  })
  return arr
}

// 颜色列表
const colors = [
  '#ff4d4f', '#2f54eb', '#52c41a', '#fa8c16',
  '#13c2c2', '#9254de', '#eb2f96', '#a0d911',
  '#fa541c'
]

// 绘制图表
function drawChart() {
  if (!chartRef.value) return

  if (!myChart) {
    myChart = echarts.init(chartRef.value)
  } else {
    myChart.clear()
  }

  const data = processData()
  const years   = Array.from(new Set(data.map(d => d.year))).sort()
  const regions = Array.from(new Set(data.map(d => d.region)))

  const series = regions.map((r, idx) => ({
    name: r,
    type: 'line',
    smooth: true,
    data: years.map(y => {
      const rec = data.find(d => d.region === r && d.year === y)
      return rec ? rec.compositeIndex : null
    }),
    symbol: 'circle',
    symbolSize: 8,
    lineStyle:  { width: 2, color: colors[idx % colors.length] },
    itemStyle:  { color: colors[idx % colors.length] },
    emphasis:  { focus: 'series' }
  }))

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line' }
    },
    legend: {
      data: regions,
      top: '5%',
      left: 'center',
      icon: 'circle',
      itemWidth: 12,
      itemHeight: 12,
      inactiveColor: '#ccc',
      textStyle: { color: '#333' }
    },
    grid: {
      top: '15%',
      left: '5%',
      right: '5%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: years,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: '总指数'
    },
    series
  }

  myChart.setOption(option)
  window.addEventListener('resize', () => myChart.resize())
}

onMounted(drawChart)
</script>

<style scoped>
.fixed-header {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  z-index: 1000;
}

.top-placeholder {
  height: 60px; /* 导航栏高度 */
}

.top-nav {
  width: 100%;
  height: 60px;
  background-color: #1890ff;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* 左 30px，右 60px */
  padding: 0 60px 0 30px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
}

.nav-left {
  font-size: 20px;
}

.nav-right {
  display: flex;
  gap: 10px;
  margin-right: 60px; /* 与左侧边距一致 */
}

.nav-button {
  color: white;
  font-size: 18px;
}

.box {
  width: 1305px;
  margin: 20px auto;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  min-height: 600px;
}

.detail-box h2 {
  text-align: center;
  margin-bottom: 20px;
}

.chart-container {
  width: 100%;
  height: 600px;
}

.btn-home {
  align-self: center;
}
</style>
