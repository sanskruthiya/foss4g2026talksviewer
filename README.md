# FOSS4G 2026 Talk Explorer

An interactive web application that visualizes FOSS4G Hiroshima 2026 conference sessions on a semantic map. This unofficial tool helps attendees discover related talks and plan their conference schedule.

## Overview

This application uses NLP embeddings to position conference sessions based on their content similarity, creating an intuitive visual map with MapLibre where related topics are clustered together. Navigate the map to explore sessions, filter by tags or tracks, and build your personalized schedule.

**Live Demo**: [https://foss4g2026talksviewer.party071985.workers.dev/](https://foss4g2026talksviewer.party071985.workers.dev/)

## Features

### 🗺️ Semantic Map
- Sessions are positioned based on topic similarity using AI embeddings
- Visual clustering helps identify related talks at a glance
- Interactive map navigation with zoom and pan controls

### 🔍 Search & Filter
- Full-text search across session titles, speakers, and abstracts
- Filter by tags, tracks, and semantic clusters
- AND/OR filter modes for flexible querying

### ⭐ My Schedule
- Bookmark sessions you want to attend
- Export your schedule as JSON for backup
- Import schedules across devices

### 📍 Nearby View
- Automatically displays sessions near the map center
- Quickly browse related talks in your current view area

### 🌐 Bilingual Support
- Full English and Japanese interface
- Easy language switching

## Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/) with TypeScript
- **Styling**: [TailwindCSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)
- **Mapping**: [MapLibre GL JS](https://maplibre.org/)
- **Data Format**: [FlatGeobuf](https://flatgeobuf.org/) for efficient spatial data
- **Icons**: [Font Awesome](https://fontawesome.com/)
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/)

## Development

### Prerequisites

- Node.js 18+ and npm

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment

This project is configured for deployment to Cloudflare Pages:

```bash
npm run deploy
```

## Data Source

Session data is sourced from the FOSS4G 2026 Hiroshima conference program via Pretalx API. The semantic embeddings are generated using AI models to analyze session content.

## Logo Attribution

The FOSS4G 2026 Hiroshima logo is licensed under [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/) by the official conference organizing committee. The logo files are available at: https://github.com/foss4g-2026/foss4g-2026.github.io/tree/main/logo

## License

This is an unofficial, personal project created to enhance the conference experience. Please refer to the official [FOSS4G 2026 Hiroshima website](https://2026.foss4g.org/) for authoritative conference information.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Acknowledgments

- FOSS4G 2026 Hiroshima organizing committee for the conference data and logo
- The open-source community for the excellent tools and libraries used in this project