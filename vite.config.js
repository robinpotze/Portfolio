import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import svgr from 'vite-plugin-svgr';

function manualChunks(id) {
    if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/')) {
        return 'react';
    }
    if (id.includes('/node_modules/react-router-dom/')) {
        return 'react-router';
    }
    if (id.includes('/node_modules/motion/')) {
        return 'motion';
    }
    if (id.includes('/node_modules/@react-three/fiber/')) {
        return 'r3f-fiber';
    }
    if (id.includes('/node_modules/@react-three/drei/')) {
        const dreiMatch = id.match(/\/node_modules\/@react-three\/drei\/([^/]+)\//);
        if (dreiMatch?.[1]) {
            return `r3f-drei-${dreiMatch[1]}`;
        }
        return 'r3f-drei';
    }
    if (id.includes('/node_modules/three-stdlib/')) {
        const stdlibMatch = id.match(/\/node_modules\/three-stdlib\/([^/]+)\//);
        if (stdlibMatch?.[1]) {
            return `three-stdlib-${stdlibMatch[1]}`;
        }
        return 'three-stdlib';
    }
    if (id.includes('/node_modules/@react-three/postprocessing/') || id.includes('/node_modules/postprocessing/')) {
        return 'r3f-postprocessing';
    }
    if (id.includes('/node_modules/three/')) {
        return 'three';
    }
}

export default defineConfig({
    base: '/',
    build: {
        outDir: 'dist',
        chunkSizeWarningLimit: 600,
        rolldownOptions: {
            output: {
                codeSplitting: true,
                manualChunks,
            },
        },
        rollupOptions: {
            output: {
                manualChunks,
            },
        },
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
        },
    },
    server: {
        port: 3000,
    },
});
