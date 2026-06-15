import { loadDataset, loadLanguagePack, mergeSessions } from '$lib/data';
import type { Dataset, Lang, Session, Tag } from '$lib/types';

const BOOKMARK_KEY = 'tv2.bookmarks';
const NEARBY_LIMIT = 100; // safety cap

function loadBookmarks(): string[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		const raw = localStorage.getItem(BOOKMARK_KEY);
		return raw ? (JSON.parse(raw) as string[]) : [];
	} catch {
		return [];
	}
}

class AppState {
	loading = $state(true);
	error = $state<string | null>(null);
	lang = $state<Lang>('en');
	dataset = $state<Dataset | null>(null);

	// Filters
	search = $state('');
	selectedTags = $state<string[]>([]);
	selectedClusters = $state<number[]>([]);
	selectedTracks = $state<string[]>([]);
	tagMode = $state<'and' | 'or'>('or');

	// Selection + UI
	selectedId = $state<string | null>(null);
	bookmarks = $state<string[]>([]);

	// All merged sessions for the active language
	sessions = $derived.by<Session[]>(() => {
		if (!this.dataset) return [];
		return mergeSessions(this.dataset, this.lang);
	});

	byId = $derived.by<Map<string, Session>>(() => {
		const map = new Map<string, Session>();
		for (const s of this.sessions) map.set(s.id, s);
		return map;
	});

	clusterIds = $derived.by<number[]>(() =>
		this.dataset ? this.dataset.clusters.map((c) => c.id) : []
	);

	tags = $derived.by<Tag[]>(() => {
		const pack = this.dataset?.packs[this.lang];
		const counts = this.dataset?.metadata.tagCounts ?? {};
		if (!pack) return [];
		return Object.entries(pack.tags)
			.map(([id, label]) => ({ id, label, count: counts[id] ?? 0 }))
			.sort((a, b) => b.count - a.count);
	});

	tracks = $derived.by<string[]>(() => {
		const set = new Set<string>();
		for (const s of this.sessions) if (s.track) set.add(s.track);
		return [...set].sort();
	});

	filtered = $derived.by<Session[]>(() => {
		const q = this.search.trim().toLowerCase();
		return this.sessions.filter((s) => {
			if (q) {
				const haystack = [
					s.title,
					s.abstract,
					s.track,
					s.clusterLabel,
					...s.tagLabels,
					...s.speakers.map((p) => p.name)
				]
					.join(' ')
					.toLowerCase();
				if (!haystack.includes(q)) return false;
			}
			if (this.selectedTags.length > 0) {
				const has =
					this.tagMode === 'and'
						? this.selectedTags.every((t) => s.tags.includes(t))
						: this.selectedTags.some((t) => s.tags.includes(t));
				if (!has) return false;
			}
			if (this.selectedClusters.length > 0 && !this.selectedClusters.includes(s.cluster))
				return false;
			if (this.selectedTracks.length > 0 && !this.selectedTracks.includes(s.track)) return false;
			return true;
		});
	});

	filteredIds = $derived.by<Set<string>>(() => new Set(this.filtered.map((s) => s.id)));

	selected = $derived.by<Session | null>(() =>
		this.selectedId ? (this.byId.get(this.selectedId) ?? null) : null
	);

	// Populated by MapView via queryRenderedFeatures on moveend / filter change.
	nearby = $state<Session[]>([]);

	hasActiveFilters = $derived(
		this.search.trim().length > 0 ||
			this.selectedTags.length > 0 ||
			this.selectedClusters.length > 0 ||
			this.selectedTracks.length > 0
	);

	async init(lang: Lang) {
		this.lang = lang;
		this.bookmarks = loadBookmarks();
		try {
			this.dataset = await loadDataset(lang);
		} catch (err) {
			this.error = err instanceof Error ? err.message : String(err);
		} finally {
			this.loading = false;
		}
	}

	async setLang(lang: Lang) {
		if (lang === this.lang) return;
		if (this.dataset && !this.dataset.packs[lang]) {
			try {
				this.dataset.packs[lang] = await loadLanguagePack(lang);
			} catch (err) {
				this.error = err instanceof Error ? err.message : String(err);
				return;
			}
		}
		this.lang = lang;
	}

	toggleTag(id: string) {
		this.selectedTags = this.selectedTags.includes(id)
			? this.selectedTags.filter((t) => t !== id)
			: [...this.selectedTags, id];
	}

	toggleCluster(id: number) {
		this.selectedClusters = this.selectedClusters.includes(id)
			? this.selectedClusters.filter((c) => c !== id)
			: [...this.selectedClusters, id];
	}

	toggleTrack(track: string) {
		this.selectedTracks = this.selectedTracks.includes(track)
			? this.selectedTracks.filter((t) => t !== track)
			: [...this.selectedTracks, track];
	}

	clearFilters() {
		this.search = '';
		this.selectedTags = [];
		this.selectedClusters = [];
		this.selectedTracks = [];
	}

	select(id: string | null) {
		this.selectedId = id;
	}

	isBookmarked(id: string): boolean {
		return this.bookmarks.includes(id);
	}

	toggleBookmark(id: string) {
		this.bookmarks = this.bookmarks.includes(id)
			? this.bookmarks.filter((b) => b !== id)
			: [...this.bookmarks, id];
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(BOOKMARK_KEY, JSON.stringify(this.bookmarks));
		}
	}

	exportBookmarks() {
		const data = JSON.stringify(
			{ version: 1, app: 'foss4g2026-talks-viewer', exportedAt: new Date().toISOString(), bookmarks: this.bookmarks },
			null,
			2
		);
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'foss4g2026-my-schedule.json';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	importBookmarks(ids: string[]): number {
		const deduped = [...new Set(ids)];
		this.bookmarks = deduped;
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(BOOKMARK_KEY, JSON.stringify(deduped));
		}
		return deduped.length;
	}

	setNearby(ids: string[]) {
		this.nearby = ids
			.slice(0, NEARBY_LIMIT)
			.map((id) => this.byId.get(id))
			.filter((s): s is Session => !!s);
	}
}

export const app = new AppState();
