/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 상대 경로로 빌드해서 어느 하위 폴더에 올려도 동작하게 한다.
  base: './',
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
})
