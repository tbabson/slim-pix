# SlimPix

A fast, client-friendly image compression and conversion web app. Upload multiple images, choose a quality level and output format, and download all results in a single ZIP file. Processed images are automatically deleted after 5 hours.

## Features

- **Batch processing** — compress up to 10 images in one go
- **Quality control** — four levels: Low, Medium, High, Maximum
- **Format conversion** — keep the original format or convert to JPG, PNG, or WebP
- **Drag & drop upload** — or click to browse
- **ZIP download** — all compressed images bundled in one file
- **Auto-cleanup** — images are deleted from the server after 5 hours

## Tech Stack

| Layer    | Technology                            |
|----------|---------------------------------------|
| Frontend | React 19, Vite 7                      |
| Styling  | Tailwind CSS 4                        |
| Icons    | Lucide React                          |
| HTTP     | Axios                                 |
| Backend  | External API (`slimpix.onrender.com`) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone <repo-url>
cd slim-pix
npm install
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview   # preview the build locally
```

## API

The frontend communicates with a REST backend. All requests go to:

```
POST /api/v1/upload
```

**Form fields:**

| Field     | Type   | Required | Description                               |
|-----------|--------|----------|-------------------------------------------|
| `files`   | File[] | Yes      | One or more image files (max 5 MB each)   |
| `quality` | string | Yes      | `low` \| `medium` \| `high` \| `maximum` |
| `format`  | string | No       | `jpg` \| `png` \| `webp`                 |

**Response:**

```json
{
  "downloadUrl": "https://...",
  "expiresAt": "2026-05-22T10:00:00.000Z"
}
```

## Constraints

- Image files only (PNG, JPG, WebP)
- Maximum 10 files per upload
- Maximum 5 MB per file
- Upload timeout: 5 minutes

## License

MIT
