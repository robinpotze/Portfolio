---
description: "Use when adding project entries, editing work/about data, modifying the autogen pipeline, or working with WorkContext, sortItems, or normalizeKey."
applyTo: "src/routes/Entry/**, src/routes/About/about.data.js, src/app/App.jsx, src/utils/workUtils.js, src/utils/stringUtils.js"
---
# Data Structures & Content

## Project Entry Data

### Required Schema

Every project page in `src/routes/Entry/pages/` must export a `Data` object with this shape:

```javascript
export const Data = {
    id: 2,                                    // number — sort tiebreaker (ascending)
    title: 'LD58',                            // string — display title, also used for URL key
    synopsis: 'Short one-liner description',  // string — shown in ProjectHero subtitle
    description: 'Detailed description...',   // string — full description in hero section
    client: 'LUDUM DRUNKS',                   // string — client or event name
    year: 2025,                               // number — primary sort key (descending)
    software: ['Figma', 'Unity', 'Blender'],  // string[] — tools used
    skills: ['UI Design', 'Game Dev'],        // string[] — skills demonstrated
    banner: '/img/work/ld58/Wallpaper.png',   // string — hero banner image path
};
```

| Field | Required | Type | Purpose |
|-------|----------|------|---------|
| `title` | **Yes** | `string` | Display name + autogen key (normalized for URL) |
| `year` | **Yes** | `number` | Primary sort: newest first |
| `date` | No | `string` | ISO date string for month-level precision (e.g., `'2024-06'`) — overrides `year` in sort when present |
| `id` | **Yes** | `number` | Secondary sort: ascending tiebreaker |
| `synopsis` | **Yes** | `string` | Short tagline in ProjectHero |
| `description` | **Yes** | `string` | Full description in entry page |
| `client` | **Yes** | `string` | Client/event name shown on work cards |
| `banner` | **Yes** | `string` | Hero image path (must exist in `public/img/work/`) |
| `software` | No | `string[]` | Tools list in ProjectHero |
| `skills` | No | `string[]` | Skills list in ProjectHero |

### Adding a New Project

1. Create a folder: `src/routes/Entry/pages/MyProject/`
2. Create the component file: `MyProject.jsx`
3. Export `Data` (named) and the component (default):

```javascript
export const Data = {
    id: 4,
    title: 'My Project',
    synopsis: 'Brief tagline',
    description: 'Full description of the project.',
    client: 'Client Name',
    year: 2026,
    software: ['React', 'Three.js'],
    skills: ['Creative Dev'],
    banner: '/img/work/myproject/banner.png',
};

export default function MyProject() {
    return (
        <>
            {/* Project-specific content sections */}
        </>
    );
}
```

4. Place banner image at `public/img/work/myproject/banner.png`
5. The autogen pipeline discovers and registers it automatically — no manual route or import needed

## Autogen Pipeline

`src/routes/Entry/pages/autogen.js` uses `import.meta.glob` to discover all entry pages:

```
pages/*/*.jsx  →  glob import  →  normalize title  →  { [key]: { Component, data } }
```

- The glob runs at build time (Vite eager import)
- Keys are normalized via `normalizeKey(data.title)`: lowercased, spaces/hyphens/special chars removed
- URL matching: `/work/:title` param is normalized the same way for lookup

### Key Normalization

`normalizeKey('LSD JAM')` → `'lsdjam'`
`normalizeKey('My Project')` → `'myproject'`

This means project titles can contain spaces, hyphens, and mixed case — the URL will always work.

## Sorting & WorkContext

### Data Flow

```
autogen.js (discovers pages)
    → App.jsx calls sortItems(pages)
    → WorkContext.Provider exposes sorted array
    → useWorkItems() returns sorted items in any component
```

### Sort Order

1. **Primary:** `date` or `year` descending (newest first). `date` (ISO string like `'2024-06'`) takes precedence over `year` when present, allowing month-level ordering within the same year.
2. **Tiebreaker:** `id` ascending (lower ID first when dates are equal)

Use `year` (number) for most entries. Add `date` when multiple projects share the same year and need finer ordering.

## About Page Data

About data lives in `src/routes/About/about.data.js` with four section types:

```javascript
export const ABOUT_SECTIONS = ['EXP', 'SKL', 'SFT', 'EDU'];

export const ABOUT_DATA = {
    EXP: [{ name, function, date, details: [{ text, icon }] }],
    SKL: [{ text, icon }],
    SFT: [{ text, icon }],
    EDU: [{ school, icon, course, date }],
};
```

| Section | Key | Item shape | Rendered by |
|---------|-----|------------|-------------|
| Experience | `EXP` | `{ name, function, date, details[] }` | `ExpSection` |
| Skills | `SKL` | `{ text, icon }` | `ListSection` |
| Software | `SFT` | `{ text, icon }` | `ListSection` |
| Education | `EDU` | `{ school, icon, course, date }` | `EduSection` |

Section rendering is mapped via `SECTION_MAP` in `About.jsx` — each section key maps to a component and prop name.

### Adding a New Section

1. Add the section key to `ABOUT_SECTIONS`
2. Add the data array to `ABOUT_DATA` with a consistent item shape
3. Create a section component in `src/routes/About/components/`
4. Add the mapping in `SECTION_MAP` in `About.jsx`

## Icon & Image Paths

All static assets live under `public/`:

| Content | Path pattern |
|---------|--------------|
| Work banners | `/img/work/{project}/` |
| About icons | `/img/icon/` or `/img/software/` |
| Logo assets | `/img/logo/` |
| 3D models | `/assets/3d/` |
| Fonts | `/assets/fonts/` |
