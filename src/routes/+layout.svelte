<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { setupI18n, setLocale, SUPPORTED_LANGS, STORAGE_LANG_KEY } from '$lib/i18n';
	import { app } from '$lib/stores/app.svelte';
	import type { Lang } from '$lib/types';

	let { children } = $props();

	function detectLang(): Lang {
		if (typeof localStorage !== 'undefined') {
			const stored = localStorage.getItem(STORAGE_LANG_KEY) as Lang | null;
			if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
		}
		if (typeof navigator !== 'undefined' && navigator.language.startsWith('ja')) return 'ja';
		return 'en';
	}

	const initialLang = detectLang();
	setupI18n(initialLang);

	onMount(() => {
		setLocale(initialLang);
		app.init(initialLang);
	});
</script>

{@render children()}
