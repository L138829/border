<template>
  <div class="layout">
    <!-- 固定顶部导航 -->
    <div class="fixed-header">
      <div class="top-nav">
        <div class="nav-left">边境城镇社会治理示范评估体系构建与应用</div>
        <div class="nav-right">
          <el-button type="text" class="nav-button" @click="$router.push('/')">首页</el-button>
          <el-button type="text" class="nav-button" @click="$router.push('/compare')">地区对比</el-button>
<el-button  type="text" class="nav-button" @click="$router.push({ path: '/detail', query: { region: '临翔区' } })" > 指标对比   </el-button>          <el-button type="text" class="nav-button" @click="$router.push('/index-analysis')">社会治理水平总指数</el-button>
        </div>
      </div>
    </div>
    <div class="top-placeholder"></div>

    <!-- 内容区 -->
    <div class="box">
      <div class="detail-box">

        <!-- 并排：左侧下拉，居中标题 -->
        <div class="detail-header">
          <h2 v-if="region">{{ region }} 各项指标历年趋势对比</h2>
          <el-select
            v-model="region"
            placeholder="请选择地区"
            @change="onRegionChange"
            class="region-select"
          >
            <el-option
              v-for="r in regionOptions"
              :key="r"
              :label="r"
              :value="r"
            ></el-option>
          </el-select>
        </div>

        <!-- 图表 -->
        <div class="chart-container" v-if="region && filteredData.length">
          <div ref="chartRef" style="width: 100%; height: 600px;"></div>
        </div>
        <p v-if="region && !filteredData.length" style="color: red;">
          ⚠️ 没有找到该地区的历史数据，请检查数据源！
        </p>

        <!-- 返回按钮 -->
        <el-button
          @click="goBack"
          style="margin-top: 20px; background-color: #409EFF; color: white;"
        >
          返回主页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { tableData } from '../data/tableData.js'

const route = useRoute()
const router = useRouter()

// 当前选中地区
// 默认取 URL ?region，否则回退到 '临翔区'
const region = ref(route.query.region || '临翔区')


// 可选地区列表
const regionOptions = computed(() =>
  Array.from(new Set(tableData.map(d => d.region)))
)

// 过滤后的数据 & 图表实例
const filteredData = ref([])
const chartRef = ref(null)
let myChart = null

// 监听 ?region，或首次加载
watch(
  () => route.query.region,
  (r) => {
    region.value = r || ''
    loadData()
  },
  { immediate: true }
)
onMounted(loadData)

function loadData() {
  if (!region.value) return
  filteredData.value = tableData.filter(d => d.region === region.value)
  nextTick(drawChart)
}

// 下拉切换后更新 URL（保持分享）
function onRegionChange(val) {
  router.replace({ query: { region: val } })
}

function drawChart() {
  if (!chartRef.value) return
  if (!myChart) {
    myChart = echarts.init(chartRef.value)
  } else {
    myChart.clear()
  }
  if (!filteredData.value.length) return

  const years = filteredData.value.map(d => d.year)
  const indicatorOptions = [
    { label: '每万人口毒品及走私案件立案数',     value: 'drugSmugglingCasesPerTenThousand' },
    { label: '每年边境口岸偷渡率',             value: 'borderCrossingRate' },
    { label: '特殊人群变化率',                 value: 'specialPopulationChangeRate' },
    { label: '信访件办结率',                   value: 'petitionCaseSettlementRate' },
    { label: '公共信息资源社会开放数',         value: 'publicInfoOpenCount' },
    { label: '部门协同率',                     value: 'departmentCoordinationRate' },
    { label: '群众矛盾纠纷化解率',             value: 'conflictResolutionRate' },
    { label: '人员密集场所高清视频监控覆盖率', value: 'hdSurveillanceCoverageRate' },
    { label: '公共安全满意度',                 value: 'publicSafetySatisfaction' }
  ]
  const colors = [
    '#ff4d4f','#2f54eb','#52c41a','#fa8c16',
    '#13c2c2','#9254de','#eb2f96','#a0d911','#fa541c'
  ]

  const series = indicatorOptions.map((opt, idx) => ({
    name: opt.label,
    type: 'line',
    smooth: true,
    data: filteredData.value.map(d => d[opt.value]),
    symbol: 'circle',
    symbolSize: 8,
    lineStyle: { width: 2, color: colors[idx] },
    itemStyle: { color: colors[idx] },
    emphasis: { focus: 'series' }
  }))

  const legendSelected = {}
  indicatorOptions.forEach((o, i) => {
    legendSelected[o.label] = i === 0
  })

  myChart.setOption({
    color: colors,
    tooltip: { trigger: 'axis', axisPointer: { type: 'line' } },
    legend: {
      data: indicatorOptions.map(o => o.label),
      top: '5%', left: 'center',
      icon: 'circle', itemWidth: 12, itemHeight: 12,
      inactiveColor: '#ccc', selectedMode: true,
      selected: legendSelected
    },
    grid: { top: '15%', left: '5%', right: '5%', bottom: '10%', containLabel: true },
    xAxis: { type: 'category', data: years, boundaryGap: false },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}' } },
    series
  })
  myChart.resize()
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.layout {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
}
/* 固定顶部导航 */
.fixed-header {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  z-index: 1000;
}
.top-placeholder {
  height: 60px;
}
/* 蓝色导航栏 */
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
.nav-button { color: #fff; font-size: 18px; }

/* 内容区 */
.box {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 1305px;
  margin: 0 auto;
}
.detail-box {
  padding: 20px;
}

/* 标题 + 下拉 并排，宽度同图表容器(80%) */
.detail-header {
  position: relative;
  width: 80%;
  margin: 0 auto 16px;
  height: 40px;
}
.detail-header h2 {
  margin: 0;
  text-align: center;
  line-height: 40px;
  font-size: 24px;
}
.detail-header .region-select {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 200px;
}

/* 图表区 */
.chart-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  width: 80%;
  height: 600px;
  margin: 0 auto;
}
</style>
