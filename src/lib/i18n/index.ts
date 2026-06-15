import { init, addMessages, locale as i18nLocale } from 'svelte-i18n';
import type { Lang } from '$lib/types';
import en from './en.json';
import ja from './ja.json';

// Load dictionaries synchronously so messages exist before first render
// (async register() can throw on the initial render).
addMessages('en', en);
addMessages('ja', ja);

export const SUPPORTED_LANGS: Lang[] = ['en', 'ja'];
export const STORAGE_LANG_KEY = 'tv2.lang';

export function setupI18n(initialLocale: Lang = 'en') {
	init({
		fallbackLocale: 'en',
		initialLocale
	});
}

export function setLocale(lang: Lang) {
	i18nLocale.set(lang);
}
