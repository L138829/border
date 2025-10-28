import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './', // ✅ 避免路径错乱，或改为 '/' 也可
  build: {
    outDir: 'dist' // ✅ 明确设置，确保 CloudBase 能找到
  }
})
