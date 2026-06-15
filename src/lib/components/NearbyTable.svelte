<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faLocationCrosshairs, faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
	import { app } from '$lib/stores/app.svelte';
	import { clusterColor } from '$lib/colors';

	function fmtTime(dt: string): string {
		if (!dt) return '';
		const d = new Date(dt);
		if (isNaN(d.getTime())) return '';
		return d.toLocaleString(app.lang, {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="bg-base-100 border-t border-base-300 flex flex-col h-full">
	<div class="px-3 py-2 border-b border-base-300 flex items-center gap-2 text-sm font-semibold">
		<FontAwesomeIcon icon={faLocationCrosshairs} class="text-primary" />
		{$_('nearby.title')}
		<span class="badge badge-sm badge-ghost ml-auto">{app.nearby.length}</span>
	</div>

	{#if app.nearby.length === 0}
		<div class="p-4 text-sm text-base-content/60">{$_('nearby.hint')}</div>
	{:else}
		<div class="overflow-y-auto thin-scroll flex-1">
			<table class="table table-sm table-pin-rows">
				<tbody>
					{#each app.nearby as s (s.id)}
						<tr
							class="hover cursor-pointer {app.selectedId === s.id ? 'bg-primary/10' : ''}"
							onclick={() => app.select(s.id)}
						>
							<td class="w-1.5 p-0">
								<div
									class="w-1.5 h-full min-h-8"
									style="background:{clusterColor(s.cluster, app.clusterIds.length)}"
								></div>
							</td>
							<td>
								<div class="font-medium text-sm leading-snug line-clamp-2">{s.title}</div>
								<div class="text-xs text-base-content/60 truncate">
									{s.speakers.map((p) => p.name).join(', ')}
								</div>
							</td>
							<td class="text-xs text-base-content/60 whitespace-nowrap hidden sm:table-cell">
								{#if s.room}<div>{s.room}</div>{/if}
								{#if fmtTime(s.datetime)}<div>{fmtTime(s.datetime)}</div>{/if}
							</td>
							<td class="w-8 text-center">
								{#if app.isBookmarked(s.id)}
									<FontAwesomeIcon icon={faStarSolid} class="text-warning text-xs" />
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
