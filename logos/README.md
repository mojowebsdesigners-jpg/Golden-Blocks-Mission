# Golden Blocks Mission — Logos

Open **preview.html** (or **preview.png**) to see every concept side by side, including t-shirt mockups.

## Colours
| Colour | HEX | Use |
|---|---|---|
| Mustard yellow | `#D9A21B` | The blocks |
| Dark grey | `#3A3D42` | Letters |
| Light grey | `#E6E7E9` | Background tile |

## Concepts
1. **01-classic**: your sketch, cleaned up
2. **02-cross**: the gaps between the blocks form a cross
3. **03-rising**: outlined blocks on top, "still building"
4. **04-emblem**: round badge for shirt chests, caps and stickers
5. **05-horizontal**: for the website header, letterheads and banners
6. **06-gold-bars**: premium look, with blocks bevelled like gold bars
7. **07-icon**: blocks only, for profile pictures, the favicon and sleeves

## Versions (each concept has all four)
- `_color`: full colour, for white or light backgrounds
- `_dark`: for dark grey or black shirts and backgrounds
- `_mono-dark`: one ink (dark grey or black), the cheapest screen print
- `_mono-white`: one ink (white), for coloured shirts

## Which file to send
- **Printer / shirt maker:** the `.svg` file from `svg/`. It is a vector, so it scales to any size, and the text is already converted to shapes, so no fonts are needed.
- **WhatsApp, Word, social media:** the `.png` file from `png/` (3000 px, transparent background).

Font: Montserrat (free, SIL Open Font License).
To regenerate the files: `node logos/src/generate.mjs && node logos/src/render.mjs` (see the comments in each script).
