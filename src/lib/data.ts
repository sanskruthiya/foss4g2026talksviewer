import { geojson } from 'flatgeobuf';
import type {
	Cluster,
	Dataset,
	Lang,
	LanguagePack,
	Metadata,
	Session,
	SessionBase,
	Speaker
} from './types';

const DATA_BASE = 'data';

function splitList(value: unknown): string[] {
	if (!value || typeof value !== 'string') return [];
	return value
		.split(';')
		.map((s) => s.trim())
		.filter(Boolean);
}

function parseSpeakers(value: unknown): Speaker[] {
	if (!value || typeof value !== 'string') return [];
	try {
		const parsed = JSON.parse(value);
		if (Array.isArray(parsed)) {
			return parsed.map((p) => ({
				name: p.name ?? '',
				avatar: p.avatar ?? '',
				bio: p.bio ?? ''
			}));
		}
	} catch {
		/* fall through */
	}
	return [];
}

function featureToBase(feature: GeoJSON.Feature): SessionBase {
	const props = (feature.properties ?? {}) as Record<string, unknown>;
	const geom = feature.geometry as GeoJSON.Point;
	const [x, y] = geom?.coordinates ?? [0, 0];
	return {
		id: String(props.id ?? ''),
		cluster: Number(props.cluster ?? -1),
		track: String(props.track ?? ''),
		submission_type: String(props.submission_type ?? ''),
		datetime: String(props.datetime ?? ''),
		room: String(props.room ?? ''),
		day: Number(props.day ?? 0),
		duration: Number(props.duration ?? 0),
		tags: splitList(props.tags),
		related: splitList(props.related),
		speakers: parseSpeakers(props.speakers),
		url: String(props.url ?? ''),
		x,
		y
	};
}

async function loadBaseFeatures(): Promise<SessionBase[]> {
	// Primary: FlatGeoBuf
	const fgbRes = await fetch(`${DATA_BASE}/sessions.fgb`);
	if (fgbRes.ok) {
		const bytes = new Uint8Array(await fgbRes.arrayBuffer());
		const fc = geojson.deserialize(bytes) as GeoJSON.FeatureCollection;
		return fc.features.map(featureToBase);
	}
	// Fallback: GeoJSON (used for local sample data without GDAL)
	const gjRes = await fetch(`${DATA_BASE}/sessions.geojson`);
	if (gjRes.ok) {
		const fc = (await gjRes.json()) as GeoJSON.FeatureCollection;
		return fc.features.map(featureToBase);
	}
	throw new Error('Could not load sessions.fgb or sessions.geojson');
}

async function loadJson<T>(path: string): Promise<T> {
	const res = await fetch(`${DATA_BASE}/${path}`);
	if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
	return (await res.json()) as T;
}

export async function loadLanguagePack(lang: Lang): Promise<LanguagePack> {
	return loadJson<LanguagePack>(`sessions.${lang}.json`);
}

export async function loadDataset(initialLang: Lang): Promise<Dataset> {
	const [base, clusters, metadata, pack] = await Promise.all([
		loadBaseFeatures(),
		loadJson<Cluster[]>('clusters.json'),
		loadJson<Metadata>('metadata.json'),
		loadLanguagePack(initialLang)
	]);
	return { base, clusters, metadata, packs: { [initialLang]: pack } };
}

/** Merge language text + resolved labels onto base sessions for a given language. */
export function mergeSessions(dataset: Dataset, lang: Lang): Session[] {
	const pack = dataset.packs[lang];
	if (!pack) return [];
	return dataset.base.map((base) => {
		const text = pack.sessions[base.id] ?? { title: base.id, abstract: '', description: '' };
		return {
			...base,
			...text,
			clusterLabel: pack.clusters[String(base.cluster)] ?? '',
			tagLabels: base.tags.map((id) => pack.tags[id] ?? id)
		};
	});
}
