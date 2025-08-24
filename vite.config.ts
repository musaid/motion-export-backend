import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: './server/app.ts',
        }
      : undefined,
  },
  server: {
    cors: {
      origin: true, // Allow all origins including null
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'X-Plugin-Id',
        'X-Figma-User-Id',
        'X-API-Key',
      ],
    },
  },
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
}));
