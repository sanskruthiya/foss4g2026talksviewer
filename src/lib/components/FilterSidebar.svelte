<script lang="ts">
	import { t } from '$lib/i18n';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faXmark } from '@fortawesome/free-solid-svg-icons';
	import { app } from '$lib/stores/app.svelte';
	import { clusterColor } from '$lib/colors';
	import SearchBar from './SearchBar.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}
	let { open, onClose }: Props = $props();

	const TAG_LIMIT = 40;
	let showAllTags = $state(false);
	const visibleTags = $derived(showAllTags ? app.tags : app.tags.slice(0, TAG_LIMIT));

	function clusterLabelFor(id: number): string {
		const pack = app.dataset?.packs[app.lang];
		return pack?.clusters[String(id)] ?? `#${id}`;
	}
</script>

<aside
	class="bg-base-100 border-r border-base-300 w-80 max-w-[85vw] flex flex-col h-full
		transition-transform duration-300 fixed lg:static inset-y-0 left-0 z-40
		{open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}"
>
	<div class="p-3 border-b border-base-300 flex items-center justify-between">
		<h2 class="font-semibold">{t('nav.filters', app.lang)}</h2>
		<button class="btn btn-ghost btn-sm lg:hidden" onclick={onClose} aria-label={t('common.close', app.lang)}>
			<FontAwesomeIcon icon={faXmark} />
		</button>
	</div>

	<div class="p-3 border-b border-base-300 space-y-2">
		<SearchBar />
		<div class="flex items-center gap-2 text-xs">
			<span class="text-base-content/60">{t('filter.mode', app.lang)}:</span>
			<div class="join">
				<button
					class="btn btn-xs join-item {app.tagMode === 'or' ? 'btn-primary' : 'btn-ghost'}"
					onclick={() => (app.tagMode = 'or')}>{t('filter.mode.or', app.lang)}</button
				>
				<button
					class="btn btn-xs join-item {app.tagMode === 'and' ? 'btn-primary' : 'btn-ghost'}"
					onclick={() => (app.tagMode = 'and')}>{t('filter.mode.and', app.lang)}</button
				>
			</div>
		</div>
		<div class="flex items-center justify-between text-xs">
			<span class="badge badge-ghost">{t('filter.matches', app.lang, { count: app.filtered.length })}</span>
			{#if app.hasActiveFilters}
				<button class="btn btn-xs btn-ghost text-error" onclick={() => app.clearFilters()}>
					{t('filter.clearAll', app.lang)}
				</button>
			{/if}
		</div>
	</div>

	<div class="flex-1 overflow-y-auto thin-scroll p-3 space-y-5">
		<!-- Clusters -->
		<section>
			<h3 class="text-xs font-semibold uppercase text-base-content/50 mb-2">
				{t('filter.clusters', app.lang)}
			</h3>
			<div class="flex flex-wrap gap-1.5">
				{#each app.clusterIds.filter((id) => id >= 0) as id (id)}
					<button
						class="badge gap-1 cursor-pointer max-w-[16rem] {app.selectedClusters.includes(id)
							? 'badge-primary'
							: 'badge-outline'}"
						onclick={() => app.toggleCluster(id)}
						title={clusterLabelFor(id)}
					>
						<span class="w-2 h-2 rounded-full shrink-0" style="background:{clusterColor(id, app.clusterIds.length)}"
						></span>
						<span class="truncate">{clusterLabelFor(id)}</span>
					</button>
				{/each}
			</div>
		</section>

		<!-- Tracks -->
		{#if app.tracks.length > 0}
			<section>
				<h3 class="text-xs font-semibold uppercase text-base-content/50 mb-2">
					{t('filter.tracks', app.lang)}
				</h3>
				<div class="flex flex-wrap gap-1.5">
					{#each app.tracks as track (track)}
						<button
							class="badge cursor-pointer {app.selectedTracks.includes(track)
								? 'badge-secondary'
								: 'badge-outline'}"
							onclick={() => app.toggleTrack(track)}
						>
							{track}
						</button>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Tags -->
		<section>
			<h3 class="text-xs font-semibold uppercase text-base-content/50 mb-2">
				{t('filter.tags', app.lang)} ({app.tags.length})
			</h3>
			<div class="flex flex-wrap gap-1.5">
				{#each visibleTags as tag (tag.id)}
					<button
						class="badge cursor-pointer {app.selectedTags.includes(tag.id)
							? 'badge-accent'
							: 'badge-outline'}"
						onclick={() => app.toggleTag(tag.id)}
					>
						{tag.label}
						<span class="opacity-60 ml-1">{tag.count}</span>
					</button>
				{/each}
			</div>
			{#if app.tags.length > TAG_LIMIT}
				<button class="btn btn-ghost btn-xs mt-2" onclick={() => (showAllTags = !showAllTags)}>
					{showAllTags ? '− less' : `+ ${app.tags.length - TAG_LIMIT} more`}
				</button>
			{/if}
		</section>
	</div>
</aside>

{#if open}
	<button
		class="fixed inset-0 bg-black/40 z-30 lg:hidden"
		onclick={onClose}
		aria-label={t('common.close', app.lang)}
	></button>
{/if}
