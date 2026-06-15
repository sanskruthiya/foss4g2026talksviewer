<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faSpinner, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
	import { app } from '$lib/stores/app.svelte';
	import Header from '$lib/components/Header.svelte';
	import FilterSidebar from '$lib/components/FilterSidebar.svelte';
	import MapView from '$lib/components/MapView.svelte';
	import CenterScope from '$lib/components/CenterScope.svelte';
	import NearbyTable from '$lib/components/NearbyTable.svelte';
	import DetailPanel from '$lib/components/DetailPanel.svelte';
	import BookmarkDrawer from '$lib/components/BookmarkDrawer.svelte';

	let filtersOpen = $state(false);
	let bookmarksOpen = $state(false);
</script>

<div class="h-screen flex flex-col overflow-hidden bg-base-200">
	<Header
		onToggleFilters={() => (filtersOpen = !filtersOpen)}
		onToggleBookmarks={() => (bookmarksOpen = !bookmarksOpen)}
	/>

	<div class="flex-1 flex overflow-hidden relative">
		<FilterSidebar open={filtersOpen} onClose={() => (filtersOpen = false)} />

		<!-- Map + nearby table column -->
		<div class="flex-1 flex flex-col min-w-0">
			<div class="relative flex-1 min-h-0">
				{#if app.loading}
					<div class="absolute inset-0 flex items-center justify-center bg-base-200 z-20">
						<div class="flex flex-col items-center gap-3 text-base-content/60">
							<FontAwesomeIcon icon={faSpinner} class="text-3xl animate-spin" />
							<span>{$_('common.loading')}</span>
						</div>
					</div>
				{:else if app.error}
					<div class="absolute inset-0 flex items-center justify-center bg-base-200 z-20 p-6">
						<div class="alert alert-error max-w-md">
							<FontAwesomeIcon icon={faTriangleExclamation} />
							<div>
								<div class="font-semibold">{$_('common.error')}</div>
								<div class="text-xs opacity-80">{app.error}</div>
							</div>
						</div>
					</div>
				{:else}
					<MapView />
					<CenterScope />
				{/if}
			</div>

			<!-- Bottom table (scope-nearby) -->
			<div class="h-56 md:h-64 shrink-0">
				<NearbyTable />
			</div>
		</div>

		<DetailPanel />
	</div>

	<BookmarkDrawer open={bookmarksOpen} onClose={() => (bookmarksOpen = false)} />
</div>
