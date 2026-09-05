import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
    base: '/',
    build: {
        outDir: 'dist',
    },
    resolve: {
        // No path.resolve needed. Just use root-relative paths starting with '/'
        alias: {
            '@': '/src',
            '@app': '/src/app',
            '@canvas': '/src/canvas',
            '@components': '/src/components',
            '@config': '/src/config',
            '@hooks': '/src/hooks',
            '@routes': '/src/routes',
            '@utils': '/src/utils',
        },
    },
    plugins: [react(), glsl(), svgr()],
    server: {
        port: 3000,
    },
});
