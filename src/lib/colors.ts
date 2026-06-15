/** Deterministic, evenly-spread HSL palette for cluster coloring. */
export const NOISE_COLOR = '#9ca3af'; // gray-400

export function clusterColor(clusterId: number, total: number): string {
	if (clusterId < 0) return NOISE_COLOR;
	const hue = Math.round((clusterId * 360) / Math.max(1, total));
	// Alternate lightness/saturation a little to separate adjacent hues.
	const sat = clusterId % 2 === 0 ? 65 : 58;
	const light = clusterId % 3 === 0 ? 52 : 46;
	return `hsl(${hue}, ${sat}%, ${light}%)`;
}

/** Build a MapLibre 'match' expression mapping cluster id -> color. */
export function clusterColorExpression(clusterIds: number[]): unknown[] {
	const total = clusterIds.filter((id) => id >= 0).length || 1;
	const expr: unknown[] = ['match', ['get', 'cluster']];
	for (const id of clusterIds) {
		if (id < 0) continue;
		expr.push(id, clusterColor(id, total));
	}
	expr.push(NOISE_COLOR); // default (noise / unknown)
	return expr;
}
