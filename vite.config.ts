// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ✅ This is all you need — Tailwind works via postcss.config.js
export default defineConfig({
  plugins: [react()],
  base: '/', // <--- ADD THIS LINE
});