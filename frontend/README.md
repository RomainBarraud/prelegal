# Prelegal frontend — Mutual NDA creator

Next.js 14 app (App Router, TypeScript, Tailwind) that generates a Common Paper
Mutual NDA from a short form.

Implements Jira KAN-3.

## Getting started

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

## What it does

- Form on the left, live-updating rendered NDA on the right
- Full Common Paper Mutual NDA text (cover page + all Standard Terms)
- Download the completed document as Markdown

## Structure

- `app/page.tsx` — main page, holds form state, wires up download
- `components/NdaForm.tsx` — controlled form for all NDA inputs
- `components/NdaPreview.tsx` — renders the assembled markdown preview
- `lib/template.ts` — pure `(formData) => markdown` renderer
- `lib/types.ts` — form data types and defaults

The template text mirrors `../templates/Mutual-NDA-coverpage.md` and
`../templates/Mutual-NDA.md` from the repository, with fields the user fills in
on the cover page substituted into both the cover page and the Standard Terms.
