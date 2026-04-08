import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
    base: '/',
    build: {
        outDir: 'dist',
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/')) {
                        return 'react';
                    }
                    if (id.includes('/node_modules/react-router-dom/')) {
                        return 'react-router';
                    }
                    if (id.includes('/node_modules/framer-motion/')) {
                        return 'framer-motion';
                    }
                    if (id.includes('/node_modules/@react-three/fiber/')) {
                        return 'r3f-fiber';
                    }
                    if (id.includes('/node_modules/@react-three/drei/')) {
                        return 'r3f-drei';
                    }
                    if (id.includes('/node_modules/@react-three/postprocessing/') || id.includes('/node_modules/postprocessing/')) {
                        return 'r3f-postprocessing';
                    }
                    if (id.includes('/node_modules/three/')) {
                        return 'three';
                    }
                }
            }
        }
    },
    plugins: [react(), glsl(), svgr()],
    resolve: {
        alias: {
            '@': '/src',
            '@app': '/src/app',
            '@canvas': '/src/canvas',
            '@components': '/src/components',
            '@config': '/src/config',
            '@hooks': '/src/hooks',
            '@routes': '/src/routes',
            '@utils': '/src/utils',
        }
    },
    server: {
        port: 3000,
    },
});
