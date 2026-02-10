import { defineConfig } from 'vite';

export default defineConfig({
    // Set base to the repository name for GitHub Pages deployment
    base: '/',
    build: {
        outDir: 'dist',
    },
});
