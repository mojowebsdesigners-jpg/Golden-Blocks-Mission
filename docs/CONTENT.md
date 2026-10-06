# Content: what is real, what is a placeholder, and how to update it

The site invents **no** statistics, testimonials, partnerships, donation totals, locations or completed projects.

## Clearly marked placeholders

| Where | What you see | How to replace |
|---|---|---|
| Footer, Contact page, menu | `[Email address — to be confirmed]` and similar | Admin → Settings |
| Donate page (bank transfer) | `[Bank name — to be confirmed]` and similar | Admin → Settings → Bank transfer details |
| Social icons | `[Social media links — to be confirmed]` | Admin → Settings → Social media |
| Projects | Four projects with a **Demonstration** badge, "Location to be confirmed" and "Example objective" text | Admin → Projects: edit or delete them; untick "Demonstration content" on anything you keep |
| Privacy Policy / Terms | A "Template text — to be reviewed" banner | Edit `src/pages/Legal.tsx` after review |

The admin dashboard's totals and counts come only from real database records.

## The SDA partnership

The homepage and About page say that Golden Blocks Mission **works closely with** the Seventh-day Adventist Church. They also state clearly that it is **not an official entity or department** of the worldwide Church.

The official SDA logo is **not** bundled, because it is a protected mark. Once the relevant Church office grants permission, upload it under **Admin → Settings → Seventh-day Adventist Church partnership**. Until then, a respectful typographic treatment is shown.

## Photography

- The 55 gallery photographs are openly licensed images from Wikimedia Commons: CC0, public domain, CC BY and CC BY-SA. They were selected to fit modern church architecture, construction, renovation and East African congregations and communities.
- They were colour-graded and resized for the web.
- Attribution is shown in each lightbox and on `/credits`. Keep it if you keep the images; it is required by their licences.
- These photographs are **illustrative**. They do not depict Golden Blocks Mission projects. Replace them with your own photography as projects progress (Admin → Gallery).
- The 3D visuals (the interactive Golden Blocks Mission name on the homepage, the block-assembly church, the gallery sphere) are rendered live in the browser. They need no image files.

## Editorial copy

Static copy (mission areas, values, scripture, page introductions) lives in `src/data/site.ts` and the page files in `src/pages/`. Scripture is quoted from the King James Version (public domain).

The suggested vision and mission statements from the brief are used verbatim on the About page.
