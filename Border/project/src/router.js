import { createRouter, createWebHistory } from 'vue-router';
import DataTable from './components/DataTable.vue';
import DetailPage from './components/DetailPage.vue';
import ComparePage from './components/ComparePage.vue'; // 新增
import CompositeIndexPage from './components/CompositeIndexPage.vue';
import TrendChartPage    from './components/TrendChartPage.vue';



const routes = [
  { path: '/', component: DataTable },
  { path: '/detail', component: DetailPage },
  { path: '/compare', component: ComparePage },
  { path: '/trend',       component: TrendChartPage }, // 新增
  { path: '/index-analysis', component: CompositeIndexPage }  // 新增
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
