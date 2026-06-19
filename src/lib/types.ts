export type Lang = 'en' | 'ja' | 'ko' | 'pt';

export interface Speaker {
	name: string;
	avatar: string;
	bio: string;
}

/** Language-agnostic properties stored in the FlatGeoBuf. */
export interface SessionBase {
	id: string;
	cluster: number;
	track: string;
	submission_type: string;
	datetime: string;
	room: string;
	day: number;
	duration: number;
	tags: string[];
	related: string[];
	speakers: Speaker[];
	url: string;
	/** Normalized UMAP coordinates in [0, 1], used as lng/lat in the abstract map. */
	x: number;
	y: number;
}

/** Per-language text merged onto a session at runtime. */
export interface SessionText {
	title: string;
	abstract: string;
	description: string;
}

/** Fully merged session (base + active-language text + resolved labels). */
export interface Session extends SessionBase, SessionText {
	clusterLabel: string;
	tagLabels: string[];
}

export interface Cluster {
	id: number;
	size: number;
	centroid: { x: number; y: number };
}

export interface Tag {
	id: string;
	label: string;
	count: number;
}

export interface LanguagePack {
	lang: Lang;
	sessions: Record<string, SessionText>;
	clusters: Record<string, string>;
	tags: Record<string, string>;
}

export interface Metadata {
	totalSessions: number;
	totalClusters: number;
	noiseCount: number;
	totalTags: number;
	bbox: [number, number, number, number];
	languages: Lang[];
	tagCounts: Record<string, number>;
	generatedAt: string;
	coordinateSystem: string;
}

export interface Dataset {
	base: SessionBase[];
	clusters: Cluster[];
	metadata: Metadata;
	packs: Partial<Record<Lang, LanguagePack>>;
}
