<script lang="ts">
	import { t } from '$lib/i18n';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faXmark, faStar, faTrash, faDownload, faUpload } from '@fortawesome/free-solid-svg-icons';
	import { app } from '$lib/stores/app.svelte';
	import { clusterColor } from '$lib/colors';
	import type { Session } from '$lib/types';

	interface Props {
		open: boolean;
		onClose: () => void;
	}
	let { open, onClose }: Props = $props();

	function fmtDay(dt: string): string {
		const d = new Date(dt);
		if (isNaN(d.getTime())) return '';
		return d.toLocaleDateString(app.lang, { month: 'short', day: 'numeric', weekday: 'short' });
	}

	function fmtTime(dt: string): string {
		if (!dt) return '—';
		const d = new Date(dt);
		if (isNaN(d.getTime())) return '—';
		return d.toLocaleTimeString(app.lang, { hour: '2-digit', minute: '2-digit' });
	}

	function dayKey(dt: string): string {
		if (!dt) return '9999-99-99';
		const d = new Date(dt);
		if (isNaN(d.getTime())) return '9999-99-99';
		return d.toISOString().slice(0, 10);
	}

	const grouped = $derived.by(() => {
		const sorted = app.bookmarks
			.map((id) => app.byId.get(id))
			.filter((x): x is Session => !!x)
			.sort((a, b) => {
				const ta = a.datetime ? new Date(a.datetime).getTime() : Infinity;
				const tb = b.datetime ? new Date(b.datetime).getTime() : Infinity;
				return ta - tb;
			});

		const map = new Map<string, Session[]>();
		for (const s of sorted) {
			const key = dayKey(s.datetime);
			if (!map.has(key)) map.set(key, []);
			map.get(key)!.push(s);
		}

		return [...map.entries()].map(([key, sessions]) => ({
			key,
			dayLabel:
				key === '9999-99-99' ? t('detail.tbd', app.lang) : fmtDay(sessions[0].datetime),
			sessions
		}));
	});

	const total = $derived(app.bookmarks.length);

	let importStatus = $state<'ok' | 'error' | null>(null);
	let fileInput = $state<HTMLInputElement | undefined>(undefined);

	function handleImport(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			try {
				const json = JSON.parse(reader.result as string);
				const ids: string[] = Array.isArray(json.bookmarks) ? json.bookmarks : [];
				if (ids.length === 0) throw new Error('empty');
				app.importBookmarks(ids);
				importStatus = 'ok';
			} catch {
				importStatus = 'error';
			} finally {
				(e.target as HTMLInputElement).value = '';
				setTimeout(() => (importStatus = null), 3000);
			}
		};
		reader.readAsText(file);
	}
</script>

<aside
	class="bg-base-100 border-l border-base-300 w-80 max-w-[85vw] h-full flex flex-col
		fixed inset-y-0 right-0 z-50 shadow-xl transition-transform duration-300
		{open ? 'translate-x-0' : 'translate-x-full'}"
>
	<div class="px-4 py-2 border-b border-base-300 flex items-center gap-2">
		<FontAwesomeIcon icon={faStar} class="text-warning" />
		<h2 class="font-semibold">{t('bookmark.title', app.lang)}</h2>
		<span class="badge badge-sm badge-ghost">{total}</span>
		<div class="flex items-center gap-1 ml-auto">
			<button
				class="btn btn-ghost btn-xs"
				title={t('bookmark.export', app.lang)}
				disabled={total === 0}
				onclick={() => app.exportBookmarks()}
			>
				<FontAwesomeIcon icon={faDownload} />
			</button>
			<button
				class="btn btn-ghost btn-xs"
				title={t('bookmark.import', app.lang)}
				onclick={() => fileInput?.click()}
			>
				<FontAwesomeIcon icon={faUpload} />
			</button>
			<input
				bind:this={fileInput}
				type="file"
				accept=".json"
				class="hidden"
				onchange={handleImport}
			/>
			<button class="btn btn-ghost btn-xs" onclick={onClose} aria-label={t('common.close', app.lang)}>
				<FontAwesomeIcon icon={faXmark} />
			</button>
		</div>
	</div>
	{#if importStatus}
		<div class="px-4 py-1.5 text-xs {importStatus === 'ok' ? 'bg-success/15 text-success' : 'bg-error/15 text-error'}">
			{importStatus === 'ok' ? t('bookmark.importOk', app.lang, { count: total }) : t('bookmark.importError', app.lang)}
		</div>
	{/if}

	<div class="overflow-y-auto thin-scroll flex-1 py-1">
		{#if total === 0}
			<p class="p-4 text-sm text-base-content/60">{t('bookmark.empty', app.lang)}</p>
		{:else}
			{#each grouped as group (group.key)}
				<!-- Day header -->
				<div class="flex items-center gap-2 px-3 pt-3 pb-1">
					<span class="text-xs font-bold text-primary">{group.dayLabel}</span>
					<div class="flex-1 border-t border-base-300"></div>
				</div>

				{#each group.sessions as s (s.id)}
					<div
						class="flex items-start gap-2 px-3 py-2 hover:bg-base-200 group cursor-pointer"
						onclick={() => app.select(s.id)}
						role="button"
						tabindex="0"
						onkeydown={(e) => e.key === 'Enter' && app.select(s.id)}
					>
						<!-- Time + Room -->
						<div class="w-14 shrink-0 text-right pt-0.5">
							<div class="text-xs font-mono font-semibold tabular-nums">{fmtTime(s.datetime)}</div>
							{#if s.room}
								<div class="text-[10px] text-base-content/50 leading-tight">{s.room}</div>
							{/if}
						</div>

						<!-- Dot + Title + Speakers -->
						<div class="flex-1 min-w-0 flex gap-1.5">
							<span
								class="w-2 h-2 rounded-full shrink-0 mt-1.5"
								style="background:{clusterColor(s.cluster, app.clusterIds.length)}"
							></span>
							<div class="min-w-0">
								<div class="text-sm font-medium leading-snug line-clamp-2">{s.title}</div>
								<div class="text-xs text-base-content/55 truncate mt-0.5">
									{s.speakers.map((p) => p.name).join(', ')}
								</div>
							</div>
						</div>

						<!-- Remove -->
						<button
							class="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 shrink-0"
							onclick={(e) => { e.stopPropagation(); app.toggleBookmark(s.id); }}
							aria-label={t('bookmark.remove', app.lang)}
						>
							<FontAwesomeIcon icon={faTrash} class="text-error" />
						</button>
					</div>
				{/each}
			{/each}
		{/if}
	</div>
</aside>

{#if open}
	<button class="fixed inset-0 bg-black/40 z-40" onclick={onClose} aria-label={t('common.close', app.lang)}
	></button>
{/if}
