<!-- src/components/CompositeIndexPage.vue -->
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

    <div class="composite-index-page">
      <el-card shadow="hover">
        <!-- 标题 + 下拉 并排，宽度同图表容器(80%) -->
        <div class="detail-header">
          <h3>社会治理水平总指数（按年/地区）</h3>
          <el-select
            v-model="selectedYear"
            placeholder="请选择年份"
            class="year-select"
          >
            <el-option
              v-for="year in years"
              :key="year"
              :label="year"
              :value="year"
            />
          </el-select>
        </div>

        <el-table :data="filteredTableList" stripe style="width: 100%;">
          <el-table-column prop="year" label="年份" align="center" width="250" />
          <el-table-column prop="region" label="地区" align="center" width="300" />
          <el-table-column prop="compositeIndex" label="总指数" align="center" width="250" />
          <el-table-column prop="rank" label="排名" align="center" width="250" />
          <el-table-column label="操作" align="center" width="250">
            <template #default>
              <el-button type="text" size="small" @click="goTrend">
                查看趋势
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 返回主页按钮 -->
        <div class="button-container">
          <el-button type="primary" @click="goHome">返回主页</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { tableData as rawData } from '../data/tableData.js';
  
// 权重 & 反向指标（同原来逻辑）
const weights = {
  drugSmugglingCasesPerTenThousand: 0.15,
  borderCrossingRate:              0.10,
  specialPopulationChangeRate:     0.05,
  petitionCaseSettlementRate:      0.15,
  publicInfoOpenCount:             0.10,
  departmentCoordinationRate:      0.10,
  conflictResolutionRate:          0.20,
  hdSurveillanceCoverageRate:      0.05,
  publicSafetySatisfaction:        0.10
};
const invertMetrics = [
  'drugSmugglingCasesPerTenThousand',
  'borderCrossingRate',
  'specialPopulationChangeRate'
];
  
// 计算各记录的 compositeIndex 和 rank
const processed = computed(() => {
  const arr = rawData.map(item => ({ ...item }));
  const stats = {};
  Object.keys(weights).forEach(key => {
    const vals = arr.map(d => d[key]);
    stats[key] = { min: Math.min(...vals), max: Math.max(...vals) };
  });
  arr.forEach(d => {
    let sum = 0;
    Object.entries(weights).forEach(([key, w]) => {
      const { min, max } = stats[key];
      let norm = (d[key] - min) / (max - min);
      if (invertMetrics.includes(key)) {
        norm = (max - d[key]) / (max - min);
      }
      sum += norm * w;
    });
    d.compositeIndex = +(sum * 100).toFixed(2);
  });
  const byYear = {};
  arr.forEach(d => {
    (byYear[d.year] ||= []).push(d);
  });
  Object.values(byYear).forEach(list => {
    list.sort((a, b) => b.compositeIndex - a.compositeIndex);
    list.forEach((d, idx) => d.rank = idx + 1);
  });
  return arr;
});
  
// 所有可选年份
const years = computed(() =>
  Array.from(new Set(processed.value.map(d => d.year))).sort((a, b) => a - b)
);
  
// 当前选中年份
const selectedYear = ref(years.value[0] || '');
  
// 过滤出对应年份的数据并按 rank 排序
const filteredTableList = computed(() =>
  processed.value
    .filter(d => d.year === selectedYear.value)
    .sort((a, b) => a.rank - b.rank)
);
  
// 路由跳转到趋势页
const router = useRouter();
function goTrend() {
  router.push({ path: '/trend' });
}

// 路由跳转到主页
function goHome() {
  router.push({ path: '/' });
}
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

.button-container {
    flex-direction: column;
    height: 20vh;
    width: 1200px;
    max-width: 1305px;
    margin: 0 auto;
    padding: 20px;
    background-color: #fff;
  }

/* 标题 + 下拉 并排，宽度同图表容器(80%) */
.detail-header {
  position: relative;
  width: 80%;
  margin: 0 auto 16px;
  height: 40px;
}
.detail-header h3 {
  margin: 0;
  text-align: center;
  line-height: 40px;
  font-size: 24px;
}
.detail-header .year-select {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 200px;
}
</style>
