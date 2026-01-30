import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          gsap: ['gsap'],
          svelvet: ['svelvet']
        }
      }
    }
  },
  ssr: {
    noExternal: ['svelvet', 'gsap']
  }
});
