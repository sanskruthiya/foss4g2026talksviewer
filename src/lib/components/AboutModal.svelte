<script lang="ts">
	import { t } from '$lib/i18n';
	import { app } from '$lib/stores/app.svelte';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faXmark } from '@fortawesome/free-solid-svg-icons';

	interface Props {
		open: boolean;
		onClose: () => void;
	}
	let { open = $bindable(false), onClose }: Props = $props();

	function parseMarkdown(text: string): string {
		return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
	}
</script>

{#if open}
	<div class="modal modal-open" role="dialog">
		<div class="modal-box max-w-2xl">
			<button
				class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
				onclick={onClose}
				aria-label={t('common.close', app.lang)}
			>
				<FontAwesomeIcon icon={faXmark} />
			</button>

			<h2 class="text-2xl font-bold mb-4">{t('about.title', app.lang)}</h2>

			<div class="space-y-4">
				<p class="text-base-content/80">
					{t('about.description', app.lang)}
				</p>

				<div>
					<h3 class="text-lg font-semibold mb-2">{t('about.features.title', app.lang)}</h3>
					<ul class="space-y-2 text-sm text-base-content/80">
						<li>
							{@html parseMarkdown(t('about.features.map', app.lang))}
						</li>
						<li>
							{@html parseMarkdown(t('about.features.search', app.lang))}
						</li>
						<li>
							{@html parseMarkdown(t('about.features.bookmark', app.lang))}
						</li>
						<li>
							{@html parseMarkdown(t('about.features.nearby', app.lang))}
						</li>
					</ul>
				</div>

				<div>
					<h3 class="text-lg font-semibold mb-2">{t('about.github', app.lang)}</h3>
					<p class="text-sm text-base-content/80 mb-2">
						{t('about.github.description', app.lang)}
					</p>
					<a
						href="https://github.com/sanskruthiya/foss4g2026talksviewer"
						target="_blank"
						rel="noopener noreferrer"
						class="link link-primary text-sm"
					>
						{t('about.github.link', app.lang)}
					</a>
				</div>

				<div>
					<h3 class="text-lg font-semibold mb-2">{t('about.logo.title', app.lang)}</h3>
					<p class="text-sm text-base-content/80 mb-2">
						{t('about.logo.description', app.lang)}
					</p>
					<a
						href="https://github.com/foss4g-2026/foss4g-2026.github.io/tree/main/logo"
						target="_blank"
						rel="noopener noreferrer"
						class="link link-primary text-sm"
					>
						{t('about.logo.link', app.lang)}
					</a>
				</div>
			</div>

			<div class="modal-action">
				<button class="btn" onclick={onClose}>{t('common.close', app.lang)}</button>
			</div>
		</div>
		<button
			class="modal-backdrop"
			onclick={onClose}
			aria-label={t('common.close', app.lang)}
			tabindex="-1"
		></button>
	</div>
{/if}
