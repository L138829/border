<template>
  <div class="layout">
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

    <div class="box">
      <div class="compare-page">
        <h2>同年不同地区相同指标对比</h2>

        <!-- 年份和指标选择 -->
        <div class="controls">
          <el-select v-model="selectedYear" placeholder="选择年份" style="margin: 10px; width: 160px;">
            <el-option
              v-for="year in years"
              :key="year"
              :label="year"
              :value="year"
            />
          </el-select>

          <el-select v-model="selectedIndicator" placeholder="选择指标" style="margin: 10px; width: 200px;">
            <el-option
              v-for="item in indicatorOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>

          <!-- 地区多选筛选 -->
          <el-select
            v-model="selectedRegions"
            multiple
            placeholder="选择地区（可多选）"
            style="margin: 10px; width: 200px;"
          >
            <el-option
              v-for="region in regions"
              :key="region"
              :label="region"
              :value="region"
            />
          </el-select>

          <!-- 排序方式 -->
          <el-select v-model="sortOrder" placeholder="排序方式" style="margin: 10px; width: 120px;">
            <el-option label="升序" value="asc" />
            <el-option label="降序" value="desc" />
          </el-select>
        </div>

        <!-- 图表容器 -->
        <div ref="compareChart" class="chart-container"></div>

        <el-button type="primary" @click="goBack" style="margin-top: 20px;">
          返回主页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { ref, onMounted, watch, computed } from 'vue'
import { tableData } from '../data/tableData'
import { useRouter } from 'vue-router'

const router = useRouter()
function goBack() {
  router.push('/')
}

// 选择项
const selectedYear = ref('')
const selectedIndicator = ref('')
const selectedRegions = ref([])    // 多选地区
const sortOrder = ref('desc')      // 排序方式，默认降序

// 生成下拉选项
const years = [...new Set(tableData.map(item => item.year))]
const regions = [...new Set(tableData.map(item => item.region))]
const indicatorOptions = [
  { label: '每万人口毒品及走私案件立案数', value: 'drugSmugglingCasesPerTenThousand' },
  { label: '每年边境口岸偷渡率', value: 'borderCrossingRate' },
  { label: '特殊人群变化率', value: 'specialPopulationChangeRate' },
  { label: '信访件办结率', value: 'petitionCaseSettlementRate' },
  { label: '公共信息资源开放数', value: 'publicInfoOpenCount' },
  { label: '部门协同率', value: 'departmentCoordinationRate' },
  { label: '群众矛盾纠纷化解率', value: 'conflictResolutionRate' },
  { label: '高清视频监控覆盖率', value: 'hdSurveillanceCoverageRate' },
  { label: '群众安全感满意度', value: 'publicSafetySatisfaction' }
]

// 计算当前选中指标的中文标签
const selectedIndicatorLabel = computed(() => {
  const found = indicatorOptions.find(opt => opt.value === selectedIndicator.value)
  return found ? found.label : ''
})

// 计算要展示的数据，包含年份筛选、地区筛选、排序
const chartData = computed(() => {
  let data = tableData.filter(item => item.year === selectedYear.value)

  // 地区筛选
  if (selectedRegions.value.length > 0) {
    data = data.filter(item => selectedRegions.value.includes(item.region))
  }

  // 排序
  if (selectedIndicator.value) {
    data.sort((a, b) => {
      const va = a[selectedIndicator.value]
      const vb = b[selectedIndicator.value]
      return sortOrder.value === 'asc' ? va - vb : vb - va
    })
  }

  return data
})

const compareChart = ref(null)
let compareChartInstance = null

// 渲染 ECharts
function renderCompareChart() {
  if (!compareChartInstance) {
    compareChartInstance = echarts.init(compareChart.value)
  }
  if (!selectedYear.value || !selectedIndicator.value) return

  const data = chartData.value
  const regionsArr = data.map(item => item.region)
  const valuesArr = data.map(item => item[selectedIndicator.value])

  const colors = ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC']

  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: regionsArr },
    yAxis: { type: 'value' },
    series: [{
      name: selectedIndicatorLabel.value,
      type: 'bar',
      data: valuesArr,
      barWidth: '50%',
      itemStyle: {
        color: params => colors[params.dataIndex % colors.length]
      }
    }],
    legend: {
      data: regionsArr.map((region, idx) => ({
        name: region,
        icon: 'circle',
        textStyle: { color: colors[idx % colors.length] }
      })),
      right: '10%',
      top: '10%'
    }
  }

  compareChartInstance.setOption(option)
}

// 监听变化
watch(
  [selectedYear, selectedIndicator, selectedRegions, sortOrder],
  renderCompareChart
)

// 初始化
onMounted(() => {
  compareChartInstance = echarts.init(compareChart.value)
  selectedYear.value = years[0]
  selectedIndicator.value = indicatorOptions[0].value
  renderCompareChart()
})
</script>

<style scoped>
.layout {
  position: relative;
  padding-top: 40px; /* 留出导航栏高度 */
}

.fixed-header {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  z-index: 1000;
}

.top-placeholder {
  height: 50px; /* 导航栏高度 */
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
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  min-height: 700px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
}

.compare-page {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 20px;
}

.chart-container {
  width: 900px;
  height: 600px;
}
</style>
