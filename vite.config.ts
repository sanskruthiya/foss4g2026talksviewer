import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	build: {
		rollupOptions: {
			output: {
				manualChunks(id: string) {
					if (id.includes('/node_modules/svelte/')) return 'svelte';
					if (id.includes('/node_modules/maplibre-gl/')) return 'maplibre';
				}
			}
		}
	}
});
