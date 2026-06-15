<script lang="ts">
	import { app } from '$lib/stores/app.svelte';
	import { SUPPORTED_LANGS, STORAGE_LANG_KEY } from '$lib/i18n';
	import type { Lang } from '$lib/types';

	const labels: Record<Lang, string> = { en: 'EN', ja: '日本語' };

	async function choose(lang: Lang) {
		await app.setLang(lang);
		if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_LANG_KEY, lang);
	}
</script>

<div class="join">
	{#each SUPPORTED_LANGS as lang (lang)}
		<button
			class="btn join-item btn-sm {app.lang === lang ? 'btn-primary' : 'btn-ghost'}"
			aria-pressed={app.lang === lang}
			onclick={() => choose(lang)}
		>
			{labels[lang]}
		</button>
	{/each}
</div>
