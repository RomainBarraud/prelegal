# Manual Test Checklist — Mutual NDA creator

Run `npm run dev` in `frontend/` and open the printed URL (usually http://localhost:3000).
Work through the flows below and check each box.

## 1. First load
- [ ] Page renders without console errors (DevTools → Console).
- [ ] Two Party sections (Party 1, Party 2) are visible on the left.
- [ ] The right pane shows the full Common Paper Mutual NDA with placeholders like `[Party company]`, `[Fill in state]`.
- [ ] Effective date input defaults to today.
- [ ] `Expires` MNDA term is pre-selected with `1` year.
- [ ] `year(s) from Effective Date` confidentiality option is pre-selected with `1` year.

## 2. Party fields
- [ ] Typing into Party 1 → Company updates ONLY the Party 1 column of the signature table in the preview.
- [ ] Typing into Party 2 → Company updates ONLY the Party 2 column.
- [ ] The Notice address textarea accepts multi-line input; in the preview, each newline becomes `<br>` inside the corresponding table cell.
- [ ] Blank fields render `[Party company]`, `[Party signatoryName]`, `[Party title]`, `[Party noticeAddress]` in the appropriate table cells.
- [ ] A pipe character `|` in a party field is rendered as `\|` in the preview (does not break the markdown table).

## 3. Deal terms — Purpose & Effective date
- [ ] Editing the Purpose textarea updates the `### Purpose` section live.
- [ ] Clearing Purpose falls back to `[Purpose]`.
- [ ] Changing Effective Date updates both `### Effective Date` and both `Date` cells in the signature table.
- [ ] Clearing Effective Date (if possible via keyboard) falls back to `[Effective Date]`.

## 4. MNDA Term
- [ ] With `Expires after N year(s)` selected: preview shows `- [x]     Expires N year(s)` and `- [ ]     Continues until terminated`.
- [ ] Switching to `Continues until terminated` disables the years number input AND flips the checkboxes in the preview.
- [ ] Switching back to `Expires after` re-enables the years input.
- [ ] Clearing the years value while `Expires` is selected renders `[N]` in the preview.

## 5. Term of Confidentiality
- [ ] Same as MNDA Term but for the confidentiality group:
  - `years` mode ↔ `perpetuity` mode.
  - Years input is disabled in perpetuity mode.
  - Preview `[x]` / `[ ]` markers move accordingly.

## 6. Governing Law & Jurisdiction
- [ ] Typing a state in Governing Law updates both `Governing Law: …` on the cover page AND `laws of the State of …` in Standard Terms § 9.
- [ ] Typing a jurisdiction updates both `Jurisdiction: …` and `courts located in …` in § 9.
- [ ] Blank values render the bracketed placeholders shown at first load.

## 7. Modifications
- [ ] With modifications empty, `### MNDA Modifications` reads `None.`
- [ ] Typing text updates the section live.
- [ ] A whitespace-only entry still renders `None.`

## 8. Download
- [ ] Click `Download .md`.
- [ ] The browser downloads a file named `Mutual-NDA-<party1-slug>-<party2-slug>.md`.
- [ ] With empty companies the filename is `Mutual-NDA-party1-party2.md`.
- [ ] Companies with punctuation (`Foo & Bar, Inc.`) produce a clean slug (`foo-bar-inc`).
- [ ] Opening the downloaded file in a markdown viewer renders the full document (title, cover page, signature table, all 11 Standard Terms).
- [ ] Downloading twice back-to-back works (no memory leak: no stale blob URL, `URL.revokeObjectURL` is called — inspectable via DevTools → Memory tab).

## 9. Accessibility
- [ ] All inputs are reachable via Tab; the tab order is Party 1 → Party 2 → Deal terms → Download button.
- [ ] Radio groups can be navigated with arrow keys.
- [ ] Screen reader announces the section headings ("Party 1", "Party 2", "Deal terms", "Preview").
- [ ] Focus ring is visible on interactive elements (Tailwind `focus:ring-*` classes).
- [ ] Color contrast passes WCAG AA on the slate palette (spot-check with browser devtools).

## 10. Responsive layout
- [ ] At `lg` and above the form and preview render side-by-side.
- [ ] Below `lg` (e.g. 640px viewport) they stack vertically and remain fully usable.

## 11. Regressions to watch
- [ ] No console errors or React key warnings after ~30 seconds of editing.
- [ ] No text overflow in the preview column (long single-line addresses should wrap thanks to `break-words`).
