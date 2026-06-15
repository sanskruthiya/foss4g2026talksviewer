<script lang="ts">
	import { t } from '$lib/i18n';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faFilter, faStar } from '@fortawesome/free-solid-svg-icons';
	import LanguageToggle from './LanguageToggle.svelte';
	import { app } from '$lib/stores/app.svelte';

	interface Props {
		onToggleFilters: () => void;
		onToggleBookmarks: () => void;
	}
	let { onToggleFilters, onToggleBookmarks }: Props = $props();
</script>

<header class="navbar bg-base-100 border-b border-base-300 min-h-14 px-3 z-30 shadow-sm">
	<div class="flex-1 flex items-center gap-2 min-w-0">
		<img src="/logo-04.svg" alt="FOSS4G 2026" class="h-8 w-auto shrink-0" />
		<div class="min-w-0">
			<h1 class="text-base font-bold leading-tight truncate">
				{t('app.title', app.lang)}
			</h1>
		</div>
	</div>

	<div class="flex items-center gap-2">
		<LanguageToggle />
		<button
			class="btn btn-sm btn-ghost gap-1 {app.hasActiveFilters ? 'text-primary' : ''}"
			onclick={onToggleFilters}
			aria-label={t('nav.filters', app.lang)}
		>
			<FontAwesomeIcon icon={faFilter} />
			<span class="hidden sm:inline">{t('nav.filters', app.lang)}</span>
		</button>
		<button
			class="btn btn-sm btn-ghost gap-1"
			onclick={onToggleBookmarks}
			aria-label={t('nav.bookmarks', app.lang)}
		>
			<FontAwesomeIcon icon={faStar} />
			<span class="hidden sm:inline">{app.bookmarks.length}</span>
		</button>
	</div>
</header>
