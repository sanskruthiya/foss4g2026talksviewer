<script lang="ts">
	import { t } from '$lib/i18n';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faFilter, faStar, faCircleInfo, faGlobe } from '@fortawesome/free-solid-svg-icons';
	import { app } from '$lib/stores/app.svelte';
	import { SUPPORTED_LANGS, STORAGE_LANG_KEY } from '$lib/i18n';
	import type { Lang } from '$lib/types';

	interface Props {
		onToggleFilters: () => void;
		onToggleBookmarks: () => void;
		onToggleAbout: () => void;
	}
	let { onToggleFilters, onToggleBookmarks, onToggleAbout }: Props = $props();

	const langLabels: Record<Lang, string> = {
		en: 'English',
		ja: '日本語',
		ko: '한국어',
		pt: 'Português'
	};

	async function switchLanguage(lang: Lang) {
		await app.setLang(lang);
		if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_LANG_KEY, lang);
	}
</script>

<header class="navbar bg-base-100 border-b border-base-300 min-h-14 px-3 z-30 shadow-sm sticky top-0">
	<!-- Logo and Title -->
	<div class="navbar-start">
		<div class="flex items-center gap-2">
			<img src="/logo-04.svg" alt="FOSS4G 2026" class="h-8 w-auto shrink-0" />
			<h1 class="text-sm md:text-base font-bold leading-tight truncate max-w-[400px] md:max-w-none">
				{t('app.title', app.lang)}
			</h1>
		</div>
	</div>

	<!-- Desktop Navigation -->
	<div class="navbar-center hidden md:flex">
		<ul class="menu menu-horizontal px-1">
			<li>
				<button class="gap-1" onclick={onToggleAbout}>
					<FontAwesomeIcon icon={faCircleInfo} />
					<span>{t('nav.about', app.lang)}</span>
				</button>
			</li>
			<li>
				<button
					class="gap-1 {app.hasActiveFilters ? 'text-primary' : ''}"
					onclick={onToggleFilters}
				>
					<FontAwesomeIcon icon={faFilter} />
					<span>{t('nav.filters', app.lang)}</span>
				</button>
			</li>
			<li>
				<button class="gap-1" onclick={onToggleBookmarks}>
					<FontAwesomeIcon icon={faStar} />
					<span>{t('nav.bookmarks', app.lang)} ({app.bookmarks.length})</span>
				</button>
			</li>
		</ul>
	</div>

	<!-- Right Side: Language Switcher (Desktop) + Mobile Menu -->
	<div class="navbar-end">
		<!-- Language Switcher (Desktop) -->
		<div class="dropdown dropdown-end hidden md:block">
			<button tabindex="0" class="btn btn-ghost btn-sm gap-1">
				<FontAwesomeIcon icon={faGlobe} />
				<span class="hidden lg:inline">{langLabels[app.lang]}</span>
			</button>
			<ul
				class="menu dropdown-content bg-base-100 rounded-box z-50 mt-3 w-36 p-2 shadow-lg border border-base-300"
			>
				{#each SUPPORTED_LANGS as lang (lang)}
					<li>
						<button
							class="text-sm {app.lang === lang ? 'active' : ''}"
							onclick={() => switchLanguage(lang)}
						>
							{langLabels[lang]}
						</button>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Mobile Menu Button -->
		<div class="dropdown dropdown-end md:hidden">
			<button tabindex="0" class="btn btn-ghost" aria-label="Menu">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h8m-8 6h16"
					></path>
				</svg>
			</button>
			<ul
				class="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow-lg border border-base-300"
			>
				<li>
					<button class="justify-start gap-2" onclick={onToggleAbout}>
						<FontAwesomeIcon icon={faCircleInfo} />
						<span>{t('nav.about', app.lang)}</span>
					</button>
				</li>
				<li>
					<button
						class="justify-start gap-2 {app.hasActiveFilters ? 'text-primary' : ''}"
						onclick={onToggleFilters}
					>
						<FontAwesomeIcon icon={faFilter} />
						<span>{t('nav.filters', app.lang)}</span>
					</button>
				</li>
				<li>
					<button class="justify-start gap-2" onclick={onToggleBookmarks}>
						<FontAwesomeIcon icon={faStar} />
						<span>{t('nav.bookmarks', app.lang)} ({app.bookmarks.length})</span>
					</button>
				</li>
				<li class="menu-title mt-2">
					<span class="flex items-center gap-1">
						<FontAwesomeIcon icon={faGlobe} />
						{t('nav.language', app.lang)}
					</span>
				</li>
				{#each SUPPORTED_LANGS as lang (lang)}
					<li>
						<button
							class="justify-start {app.lang === lang ? 'active' : ''}"
							onclick={() => switchLanguage(lang)}
						>
							{langLabels[lang]}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</header>
