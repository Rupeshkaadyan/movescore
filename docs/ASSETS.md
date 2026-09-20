# Asset mapping — MoveScore visual asset pack

The pack lives at `~/Downloads/MoveScore_Asset_Pack/`. It is a **visual
reference**, not a production asset library: most `02_Website` and `03_Mobile`
files are composite mockups containing baked-in UI text and statistics, so they
are **not** embedded in the site.

## Reused directly

| Source file                              | Used as                                        | Destination in repo |
| ---------------------------------------- | ---------------------------------------------- | ------------------- |
| `01_Brand/MoveScore_Logo_Light.png`      | Header logo (light background)                  | `public/brand/logo-light.png` |
| `01_Brand/MoveScore_Logo_White.png`      | Footer logo (dark background)                   | `public/brand/logo-white.png` |
| `01_Brand/MoveScore_AppIcon.png`         | Open Graph / Apple touch icon                   | `public/brand/app-icon.png` |
| `01_Brand/MoveScore_Favicon.svg`         | Favicon                                          | `public/brand/favicon.svg` |
| `01_Brand/MoveScore_Color_Codes.txt`     | Colour tokens                                    | `src/app/globals.css` (`@theme`) |

## Reference only (not shipped)

| Source file                              | Why it is reference only |
| ---------------------------------------- | ------------------------ |
| `02_Website/*.png`                       | Composite mockups with baked-in numbers; re-implemented as React |
| `03_Mobile/*.png`                        | Mobile concepts; re-implemented responsively |
| `04_Thumbnails/*.png`                    | Social thumbnails with baked-in text |
| `05_Social/*.png`                        | Social graphics |
| `06_Icons/Feature_Icons*.png`            | Icon direction; implemented with `lucide-react` for crisp scaling |
| `07_Backgrounds/Color_Palette.png`       | Palette reference (also copied to `public/brand/`) |
| `08_Source_Boards/*.png`                 | Layout/board reference |

Nothing from the mockups is embedded as an image in the live UI — every screen
was rebuilt as real HTML/CSS/React so it is responsive, accessible and
translatable.

## Colour tokens

From `01_Brand/MoveScore_Color_Codes.txt`:

| Token          | Value     | Tailwind utility      |
| -------------- | --------- | --------------------- |
| Primary        | `#2563EB` | `bg-brand`, `text-brand` |
| Success        | `#10B981` | `text-emerald-600` / score bands |
| Warning        | `#F59E0B` | `bg-amber-400`, demo banner |
| Error          | `#EF4444` | `text-danger` |
| Ink (navy)     | `#0F172A` | `text-ink`, footer background |
| Muted          | `#6B7280` | `text-muted` |
| Surface        | `#F8FAFC` | `bg-surface` |
| Background     | `#FFFFFF` | body |

Typography: Inter, loaded via `next/font` with `--font-inter` exposed to
Tailwind as `--font-sans`.

## Iconography

`lucide-react` stand-ins for the pack's feature icons:

- `Database` — Real data
- `Sparkles` — Personalized
- `Eye` — Transparent
- `CalendarRange` — 5-year planning
- `Search`, `Menu`, `ArrowRight`, `Download`, `Link2`, `Bookmark`, `MapPin`
