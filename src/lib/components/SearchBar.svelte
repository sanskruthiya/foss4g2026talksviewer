<script lang="ts">
	import { t } from '$lib/i18n';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
	import { app } from '$lib/stores/app.svelte';
</script>

<div class="relative">
	<span class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
		<FontAwesomeIcon icon={faMagnifyingGlass} />
	</span>
	<input
		type="search"
		bind:value={app.search}
		placeholder={t('search.placeholder', app.lang)}
		class="input input-bordered input-sm w-full pl-9 pr-8"
	/>
	{#if app.search}
		<button
			class="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
			onclick={() => (app.search = '')}
			aria-label="clear"
		>
			<FontAwesomeIcon icon={faXmark} />
		</button>
	{/if}
</div>
