# ReaderLab Writing Studio

A two-door English and writing instruction app for Eric Robinson's tutoring work.

## What this includes

- **Practice**: student-facing self-serve lessons with instant feedback and local mastery tracking.
- **Teach**: instructor-facing live tutoring console with lesson filters, answer reveal, student profile controls, and essay blueprint overlays.
- **Shared content engine**: all principles, examples, exercises, essay tags, accessibility flags, and LRS rationales live in structured JSON data.
- **Accessibility controls**: adjustable text size, dyslexia-friendly font stack, quiet mode, focus mode, contrast, and learning profiles.

## Local development

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:3000`.

## Static build

```bash
pnpm build
```

The exported static site is generated in `out/`.

## GitHub Pages

This repo includes a GitHub Actions workflow that builds the static Next.js export and publishes it to GitHub Pages.

After the first push, enable Pages from **Settings → Pages → Build and deployment → GitHub Actions**.
