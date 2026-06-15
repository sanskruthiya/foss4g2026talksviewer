<script lang="ts">
	import { t } from '$lib/i18n';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import {
		faXmark,
		faStar,
		faClock,
		faLocationDot,
		faUpRightFromSquare
	} from '@fortawesome/free-solid-svg-icons';
	import { app } from '$lib/stores/app.svelte';
	import { clusterColor } from '$lib/colors';
	import type { Session } from '$lib/types';

	const s = $derived(app.selected);
	let bookmarked = $state(false);
	$effect(() => {
		bookmarked = !!s && app.bookmarks.includes(s.id);
	});

	function fmtDateTime(dt: string): string {
		if (!dt) return '';
		const d = new Date(dt);
		if (isNaN(d.getTime())) return '';
		return d.toLocaleString(app.lang, {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function related(sess: Session): Session[] {
		return sess.related.map((id) => app.byId.get(id)).filter((x): x is Session => !!x);
	}
</script>

{#if s}
	<aside
		class="bg-base-100 border-l border-base-300 w-96 max-w-[92vw] h-full flex flex-col
			fixed lg:static inset-y-0 right-0 z-40 shadow-xl lg:shadow-none"
	>
		<div
			class="px-4 py-2 border-b border-base-300 flex items-center gap-2"
			style="border-top:4px solid {clusterColor(s.cluster, app.clusterIds.length)}"
		>
			<span class="text-xs font-semibold uppercase text-base-content/50">
				{t('detail.cluster', app.lang)}: {s.clusterLabel || t('common.other', app.lang)}
			</span>
			<div class="ml-auto flex items-center gap-1">
				<button
					class="btn btn-ghost btn-sm {bookmarked ? 'text-warning' : 'text-base-content/25'}"
					onclick={() => app.toggleBookmark(s.id)}
					aria-label={bookmarked ? t('bookmark.remove', app.lang) : t('bookmark.add', app.lang)}
				>
					<FontAwesomeIcon icon={faStar} />
				</button>
				<button class="btn btn-ghost btn-sm" onclick={() => app.select(null)} aria-label={t('common.close', app.lang)}>
					<FontAwesomeIcon icon={faXmark} />
				</button>
			</div>
		</div>

		<div class="overflow-y-auto thin-scroll flex-1 p-4 space-y-4">
			<h2 class="text-lg font-bold leading-snug">{s.title}</h2>

			<!-- Schedule / room -->
			<div class="flex flex-wrap gap-3 text-sm text-base-content/70">
				<span class="inline-flex items-center gap-1">
					<FontAwesomeIcon icon={faClock} />
					{fmtDateTime(s.datetime) || t('detail.tbd', app.lang)}
				</span>
				<span class="inline-flex items-center gap-1">
					<FontAwesomeIcon icon={faLocationDot} />
					{s.room || t('detail.tbd', app.lang)}
				</span>
			</div>

			{#if s.track}
				<div>
					<span class="badge badge-secondary badge-sm">{s.track}</span>
					{#if s.submission_type}
						<span class="badge badge-ghost badge-sm">{s.submission_type}</span>
					{/if}
				</div>
			{/if}

			{#if s.url}
				<a href={s.url} target="_blank" rel="noopener" class="btn btn-primary btn-sm w-full gap-2">
					<FontAwesomeIcon icon={faUpRightFromSquare} />
					{t('detail.openPretalx', app.lang)}
				</a>
			{/if}

			<!-- Speakers -->
			{#if s.speakers.length > 0}
				<section>
					<h3 class="text-xs font-semibold uppercase text-base-content/50 mb-2">
						{t('detail.speakers', app.lang)}
					</h3>
					<div class="space-y-2">
						{#each s.speakers as sp (sp.name)}
							<div class="flex gap-2 items-start">
								{#if sp.avatar}
									<img src={sp.avatar} alt={sp.name} class="w-8 h-8 rounded-full object-cover" />
								{:else}
									<div class="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center text-xs">
										{sp.name.charAt(0)}
									</div>
								{/if}
								<div class="min-w-0">
									<div class="text-sm font-medium">{sp.name}</div>
									{#if sp.bio}
										<p class="text-xs text-base-content/60 line-clamp-3">{sp.bio}</p>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Abstract -->
			<section>
				<h3 class="text-xs font-semibold uppercase text-base-content/50 mb-1">
					{t('detail.abstract', app.lang)}
				</h3>
				{#if s.abstract}
					<p class="text-sm whitespace-pre-line leading-relaxed">{s.abstract}</p>
				{:else}
					<p class="text-sm text-base-content/50 italic">{t('detail.tbd', app.lang)}</p>
				{/if}
			</section>

			<!-- Tags -->
			{#if s.tagLabels.length > 0}
				<section>
					<h3 class="text-xs font-semibold uppercase text-base-content/50 mb-2">{t('detail.tags', app.lang)}</h3>
					<div class="flex flex-wrap gap-1.5">
						{#each s.tags as tagId, i (tagId)}
							<button
								class="badge badge-outline badge-sm cursor-pointer hover:badge-accent"
								onclick={() => {
									app.toggleTag(tagId);
								}}
							>
								{s.tagLabels[i]}
							</button>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Related -->
			{#if related(s).length > 0}
				<section>
					<h3 class="text-xs font-semibold uppercase text-base-content/50 mb-2">
						{t('detail.related', app.lang)}
					</h3>
					<div class="space-y-1">
						{#each related(s) as r (r.id)}
							<button
								class="w-full text-left text-sm p-2 rounded hover:bg-base-200 flex items-center gap-2"
								onclick={() => app.select(r.id)}
							>
								<span
									class="w-2 h-2 rounded-full shrink-0"
									style="background:{clusterColor(r.cluster, app.clusterIds.length)}"
								></span>
								<span class="line-clamp-1">{r.title}</span>
							</button>
						{/each}
					</div>
				</section>
			{/if}

		</div>
	</aside>
{/if}
