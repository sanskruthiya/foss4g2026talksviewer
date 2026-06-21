<script lang="ts">
	import 'maplibre-gl/dist/maplibre-gl.css';
	import type { Map as MlMap, StyleSpecification } from 'maplibre-gl';
	import { MapLibre, GeoJSONSource, CircleLayer, SymbolLayer, LineLayer, HeatmapLayer } from 'svelte-maplibre-gl';
	import { app } from '$lib/stores/app.svelte';
	import { clusterColorExpression } from '$lib/colors';

	let map = $state<MlMap | undefined>(undefined);
	let fitted = false;
	let hoverInfo = $state<{ title: string; speakers: string; x: number; y: number } | null>(null);
	let selPos = $state<{ x: number; y: number } | null>(null);

	function updateSelPos() {
		if (!map || !app.selected) { selPos = null; return; }
		const p = map.project([app.selected.x, app.selected.y]);
		selPos = { x: p.x, y: p.y };
	}

	function truncateText(text: string, max: number): string {
		return text.length > max ? text.slice(0, max) + '\u2026' : text;
	}

	// Minimal style: flat background only (no real-world basemap).
	const style: StyleSpecification = {
		version: 8,
		glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
		sources: {},
		layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#f1f5f9' } }]
	};

	// Points feature collection (rebuilt when sessions / filters / selection change).
	const pointData = $derived.by<GeoJSON.FeatureCollection>(() => ({
		type: 'FeatureCollection',
		features: app.sessions.map((s) => ({
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [s.x, s.y] },
			properties: {
				id: s.id,
				cluster: s.cluster,
				dim: app.hasActiveFilters && !app.filteredIds.has(s.id) ? 1 : 0,
				sel: app.selectedId === s.id ? 1 : 0,
				bm: app.isBookmarked(s.id) ? 1 : 0
			}
		}))
	}));

	// Cluster centroid labels in the active language.
	const labelData = $derived.by<GeoJSON.FeatureCollection>(() => {
		const pack = app.dataset?.packs[app.lang];
		const clusters = app.dataset?.clusters ?? [];
		return {
			type: 'FeatureCollection',
			features: clusters
				.filter((c) => c.id >= 0)
				.map((c) => ({
					type: 'Feature',
					geometry: { type: 'Point', coordinates: [c.centroid.x, c.centroid.y] },
					properties: { label: pack?.clusters[String(c.id)] ?? `#${c.id}` }
				}))
		};
	});

	// Light reference grid that pans/zooms with the abstract space.
	const gridData: GeoJSON.FeatureCollection = (() => {
		const features: GeoJSON.Feature[] = [];
		const lo = -0.3;
		const hi = 1.3;
		for (let i = 0; i <= 16; i++) {
			const v = lo + (i * (hi - lo)) / 16;
			features.push({
				type: 'Feature',
				geometry: { type: 'LineString', coordinates: [[lo, v], [hi, v]] },
				properties: {}
			});
			features.push({
				type: 'Feature',
				geometry: { type: 'LineString', coordinates: [[v, lo], [v, hi]] },
				properties: {}
			});
		}
		return { type: 'FeatureCollection', features };
	})();

	const circlePaint = $derived({
		'circle-color': clusterColorExpression(app.clusterIds),
		'circle-radius': ['case', ['==', ['get', 'sel'], 1], 9, 5],
		'circle-opacity': ['case', ['==', ['get', 'dim'], 1], 0.12, 0.9],
		'circle-stroke-color': ['case', ['==', ['get', 'sel'], 1], '#111827', '#ffffff'],
		'circle-stroke-width': [
			'case',
			['==', ['get', 'sel'], 1],
			3,
			['==', ['get', 'bm'], 1],
			2,
			0.5
		]
	});

	const linePaint = { 'line-color': '#cbd5e1', 'line-width': 1, 'line-opacity': 0.5 };

	const heatmapPaint = {
		'heatmap-weight': 0.6,
		'heatmap-intensity': 0.6,
		'heatmap-radius': 28,
		'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0.35, 11, 0],
		'heatmap-color': [
			'interpolate',
			['linear'],
			['heatmap-density'],
			0,
			'rgba(77,176,91,0)',
			0.4,
			'rgba(77,176,91,0.25)',
			1,
			'rgba(34,110,46,0.5)'
		]
	};

	const symbolLayout = {
		'text-field': ['get', 'label'],
		'text-font': ['Noto Sans Regular'],
		'text-size': 12,
		'text-anchor': 'center',
		'text-max-width': 8,
		'text-allow-overlap': false
	};

	const symbolPaint = {
		'text-color': '#334155',
		'text-halo-color': '#ffffff',
		'text-halo-width': 1.5
	};

	// Pixel radius used for queryRenderedFeatures – matches the visual scope ring.
	const NEARBY_RADIUS = 80;

	function updateNearby() {
		if (!map || !map.getLayer('sessions-circles')) return;
		const container = map.getContainer();
		const cx = container.offsetWidth / 2;
		const cy = container.offsetHeight / 2;
		const r = NEARBY_RADIUS;
		const features = map.queryRenderedFeatures(
			[
				[cx - r, cy - r],
				[cx + r, cy + r]
			],
			{
				layers: ['sessions-circles'],
				filter: ['==', ['get', 'dim'], 0]
			}
		);
		const ids = [
			...new Set(
				features
					.map((f) => String(f.properties?.id ?? ''))
					.filter(Boolean)
			)
		];
		app.setNearby(ids);
	}

	$effect(() => {
		if (!map) return;
		const onMoveEnd = () => updateNearby();
		map.on('moveend', onMoveEnd);
		updateNearby(); // initial query after map is ready
		return () => {
			map?.off('moveend', onMoveEnd);
		};
	});

	// Re-query when active filters change so NearbyTable reflects the filter state.
	$effect(() => {
		void app.filteredIds; // track reactive dependency
		if (!map) return;
		requestAnimationFrame(updateNearby);
	});

	// Pulse ring: update screen position when selection changes.
	$effect(() => {
		void app.selectedId;
		if (!map) return;
		requestAnimationFrame(updateSelPos);
	});

	// Pulse ring: keep in place while map pans/zooms.
	$effect(() => {
		if (!map) return;
		map.on('move', updateSelPos);
		return () => map?.off('move', updateSelPos);
	});

	$effect(() => {
		if (!map || fitted || !app.dataset) return;
		const b = app.dataset.metadata.bbox;
		if (b && b.length === 4) {
			map.fitBounds(
				[
					[b[0], b[1]],
					[b[2], b[3]]
				],
				{ padding: 60, duration: 0 }
			);
			fitted = true;
			// Slight zoom-in after data renders to trigger moveend → updateNearby()
			map.once('idle', () => {
				map?.easeTo({ zoom: map.getZoom() + 0.5, duration: 600 });
			});
		}
	});

	$effect(() => {
		if (!map) return;
		const onClick = (e: any) => map!.easeTo({ center: e.lngLat, duration: 300 });
		map.on('click', onClick);
		return () => map?.off('click', onClick);
	});

	function handlePointClick(e: { features?: GeoJSON.Feature[] }) {
		const f = e.features?.[0];
		if (f?.properties?.id) app.select(String(f.properties.id));
	}

	function handleMouseEnter(e: any) {
		if (!map) return;
		map.getCanvas().style.cursor = 'pointer';
		const f = e.features?.[0];
		if (!f?.properties?.id) return;
		const session = app.byId.get(String(f.properties.id));
		if (!session) return;
		hoverInfo = {
			title: truncateText(session.title, 70),
			speakers: truncateText(session.speakers.map((p: { name: string }) => p.name).join(', '), 50),
			x: e.point.x,
			y: e.point.y
		};
	}

	function handleMouseLeave() {
		if (map) map.getCanvas().style.cursor = '';
		hoverInfo = null;
	}
</script>

<div class="relative w-full h-full">
<MapLibre
	bind:map
	{style}
	class="w-full h-full"
	center={[0.5, 0.5]}
	zoom={9}
	minZoom={7}
	maxZoom={16}
	dragRotate={false}
	pitchWithRotate={false}
	renderWorldCopies={false}
>
	<GeoJSONSource id="grid" data={gridData}>
		<LineLayer paint={linePaint as never} />
	</GeoJSONSource>

	<GeoJSONSource id="sessions" data={pointData}>
		<HeatmapLayer maxzoom={11} paint={heatmapPaint as never} />
		<CircleLayer
			id="sessions-circles"
			onclick={handlePointClick}
			onmouseenter={handleMouseEnter}
			onmouseleave={handleMouseLeave}
			paint={circlePaint as never}
		/>
	</GeoJSONSource>

	<GeoJSONSource id="cluster-labels" data={labelData}>
		<SymbolLayer layout={symbolLayout as never} paint={symbolPaint as never} />
	</GeoJSONSource>
</MapLibre>

{#if selPos && app.selected}
	<div
		class="absolute pointer-events-none z-[5]"
		style="left:{selPos.x}px; top:{selPos.y}px"
	>
		<div class="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-primary animate-ping"></div>
	</div>
{/if}

{#if hoverInfo}
	<div
		class="absolute z-10 pointer-events-none bg-base-100/95 border border-base-300 rounded-md shadow-lg px-2.5 py-2 text-xs max-w-[200px]"
		style="left:{hoverInfo.x + 14}px; top:{hoverInfo.y + 14}px"
	>
		<div class="font-medium leading-snug">{hoverInfo.title}</div>
		{#if hoverInfo.speakers}
			<div class="text-base-content/60 mt-0.5">{hoverInfo.speakers}</div>
		{/if}
	</div>
{/if}
</div>
