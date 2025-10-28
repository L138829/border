<template>
  <div class="layout">
    <!-- 占位符，防止内容被吸顶部分遮挡 -->
    <div class="top-placeholder"></div>

    <!-- 固定顶部部分 -->
    <div class="fixed-header">
      <!-- 导航栏 -->
      <div class="top-nav">
        <div class="nav-left">边境城镇社会治理示范评估体系构建与应用</div>
        <div class="nav-right">
          <el-button type="text" class="nav-button" @click="$router.push('/')">首页</el-button>
          <el-button type="text" class="nav-button" @click="$router.push('/compare')">地区对比</el-button>
<el-button  type="text" class="nav-button" @click="$router.push({ path: '/detail', query: { region: '临翔区' } })" > 指标对比   </el-button>          <el-button type="text" class="nav-button" @click="$router.push('/index-analysis')">社会治理水平总指数</el-button>
        </div>
      </div> <!-- /.top-nav -->

      <!-- 主体内容 -->
      <div class="box">
        <h3 style="text-align: left;">边境城镇社会治理示范评估系统</h3>

        <!-- 筛选区域 -->
        <div class="filters">
          <div style="display: flex; align-items: center; gap: 12px;">
            <el-select v-model="filter.region" placeholder="地区" style="width: 180px;">
              <el-option label="所有" value=""></el-option>
              <el-option label="临翔区" value="临翔区"></el-option>
              <el-option label="云县" value="云县"></el-option>
              <el-option label="凤庆县" value="凤庆县"></el-option>
              <el-option label="永德县" value="永德县"></el-option>
              <el-option label="镇康县" value="镇康县"></el-option>
              <el-option label="耿马县" value="耿马县"></el-option>
              <el-option label="沧源县" value="沧源县"></el-option>
              <el-option label="双江县" value="双江县"></el-option>
            </el-select>

            <el-date-picker
              v-model="filter.year"
              type="year"
              placeholder="选择年份"
              style="width: 180px;"
            ></el-date-picker>
          </div>

          <div>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button type="success" @click="goToCompare">地区对比</el-button>
            <el-button type="primary" @click="$router.push('/index-analysis')">查看综合指数与趋势</el-button>
          </div>
        </div>

        <!-- 表格区域 -->
        <el-table :data="pagedData" border style="width: 100%; margin-top: 20px;">
          <el-table-column label="序号" width="80">
            <template #default="scope">
              {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="region" label="地区" width="120"></el-table-column>
          <el-table-column prop="year" label="考核年" width="100"></el-table-column>
          <el-table-column label="考核目标" width="120">
            <template #default="scope">
              <span :style="getTargetStyle(scope.row.target)">{{ scope.row.target }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="目标描述" min-width="220" show-overflow-tooltip></el-table-column>
          <el-table-column label="操作" width="180" align="center">
            <template #default="scope">
              <el-button type="text" size="small" @click="handleView(scope.row.region)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 数据总数 + 分页 -->
        <div class="footer-bar">
          <span class="total">共 {{ filteredData.length }} 条</span>
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="filteredData.length"
            layout="prev, pager, next, jumper"
          ></el-pagination>
        </div>
      </div> <!-- /.box -->
    </div> <!-- /.fixed-header -->
  </div> <!-- /.layout -->
</template>


<script setup>
import { ref, computed, watch } from 'vue'
import { tableData as rawTableData } from '../data/tableData.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const filter = ref({ region: '', year: '' })
const currentPage = ref(1)
const pageSize = 10
const tableData = ref(rawTableData)

const filteredData = computed(() =>
  tableData.value.filter(item =>
    (!filter.value.region || item.region.includes(filter.value.region)) &&
    (!filter.value.year || Number(item.year) === filter.value.year.getFullYear())
  )
)

const pagedData = computed(() =>
  filteredData.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize)
)

watch(filteredData, () => {
  if ((currentPage.value - 1) * pageSize >= filteredData.value.length) {
    currentPage.value = 1
  }
})

function handleSearch() {
  currentPage.value = 1
}

function handleView(region) {
  router.push({ path: '/detail', query: { region } })
}

function goToCompare() {
  router.push('/compare')
}
function getTargetStyle(target) {
  // 你可以根据实际等级设置不同颜色
  const colorMap = {
    'I': 'green',
    'II': 'orange',
    'III': 'red'
  }
  return {
    color: colorMap[target] || 'black',
    fontWeight: 'bold'
  }
}

</script>

<style scoped>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #e0dfdf;
  font-family: "Microsoft YaHei", sans-serif;
  overflow-x: hidden;
}

.layout {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
}

/* 固定区域 */
.fixed-header {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  z-index: 1000;
}

/* 占位高度：确保下方内容不被遮挡 */
.top-placeholder {
  height: 700px; /* 导航栏 + box 的总体高度，按需调整 */
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

.nav-button {
  color: white; /* 与左侧文字颜色一致 */
  font-size: 18px; /* 与左侧文字大小一致 */
}

.box {
  width: calc(100% - 40px); /* 动态宽度，左右各留 20px 空隙 */
  margin: 0 20px; /* 确保左右对齐 */
  background-color: #fff;
  padding: 20px 30px;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
}

.filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 10px;
  justify-content: flex-start;
}

.el-button {
  height: 36px;
  line-height: 36px;
}

.footer-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0 0;
}

.footer-bar .total {
  color: #606266;
  font-size: 14px;
}
</style>
