import type { Lang } from '$lib/types';
import en from './en.json';
import ja from './ja.json';
import ko from './ko.json';
import pt from './pt.json';
import th from './th.json';
import es from './es.json';
import fr from './fr.json';
import de from './de.json';

export const SUPPORTED_LANGS: Lang[] = ['en', 'ja', 'ko', 'pt', 'th', 'es', 'fr', 'de'];
export const STORAGE_LANG_KEY = 'tv2.lang';

const messages: Record<Lang, Record<string, string>> = {
	en: en as Record<string, string>,
	ja: ja as Record<string, string>,
	ko: ko as Record<string, string>,
	pt: pt as Record<string, string>,
	th: th as Record<string, string>,
	es: es as Record<string, string>,
	fr: fr as Record<string, string>,
	de: de as Record<string, string>
};

export function t(key: string, lang: Lang, params?: Record<string, string | number>): string {
	const raw = messages[lang]?.[key] ?? messages['en']?.[key] ?? key;
	if (!params) return raw;
	return raw.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
}
