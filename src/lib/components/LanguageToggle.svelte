<script lang="ts">
	import { app } from '$lib/stores/app.svelte';
	import { SUPPORTED_LANGS, STORAGE_LANG_KEY } from '$lib/i18n';
	import type { Lang } from '$lib/types';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faGlobe } from '@fortawesome/free-solid-svg-icons';

	const labels: Record<Lang, string> = { 
		en: 'English', 
		ja: '日本語',
		ko: '한국어',
		pt: 'Português',
		th: 'ไทย',
		es: 'Español',
		fr: 'Français',
		de: 'Deutsch'
	};

	const shortLabels: Record<Lang, string> = {
		en: 'EN',
		ja: 'JA',
		ko: 'KO',
		pt: 'PT',
		th: 'TH',
		es: 'ES',
		fr: 'FR',
		de: 'DE'
	};

	async function choose(lang: Lang) {
		await app.setLang(lang);
		if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_LANG_KEY, lang);
	}
</script>

<div class="dropdown dropdown-end">
	<button
		tabindex="0"
		class="btn btn-sm btn-ghost gap-1"
		aria-label="Select language"
	>
		<FontAwesomeIcon icon={faGlobe} />
		<span class="hidden sm:inline">{shortLabels[app.lang]}</span>
	</button>
	<ul
		class="dropdown-content menu bg-base-100 rounded-box z-50 w-40 p-2 shadow-lg border border-base-300 mt-1"
		style="max-height: 20rem; overflow-y: auto;"
	>
		{#each SUPPORTED_LANGS as lang (lang)}
			<li>
				<button
					class="text-sm {app.lang === lang ? 'active' : ''}"
					onclick={() => choose(lang)}
				>
					{labels[lang]}
				</button>
			</li>
		{/each}
	</ul>
</div>
