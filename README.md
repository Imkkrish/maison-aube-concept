# Maison Aube — concept storefront

A self-initiated concept by [webtheory.co](https://webtheory-co.web.app), built to accompany the
case study at <https://webtheory-co.web.app/work/maison-aube>.

> **This is a concept.** Maison Aube is a fictional slow-fashion label. The brand, pieces, prices,
> places, people and making details are invented. Nothing is for sale, nothing is ordered, and no
> data leaves your browser. Every page is marked `noindex, nofollow`, and `robots.txt` disallows all
> crawling.

## The idea

Most fashion stores look alike: a product grid and a discount banner. People who buy fewer, better
things want the thinking behind each piece. So this store reads like a lookbook until you're ready
to buy, then keeps out of the way at checkout.

- **Editorial home page** laid out like a magazine spread: hero plate, the label's idea, two
  collections introduced through their landscapes, a few pieces up close, the making.
- **Collections opened through their landscape:** a wide dusk arch, an intro, then the pieces in a
  staggered, plate-numbered layout with a pull quote in the middle.
- **Product pages that give materials and making real space:** fibre, weave, dye, trims, workshop,
  hours at the bench, run size and care notes.
- **Design:** warm paper tones, Instrument Serif for headlines, arched frames that echo dusk in the
  valley. Images settle into place (a slow fade and scale-down) instead of sliding. No idle or
  looping motion; `prefers-reduced-motion` turns it all off.

## Interaction flow

`index.html` → `collection.html?c=valley|coast` → `product.html?id=<piece>` → bag drawer.

1. Browse the home page or open a collection (Madder Valley or Salt Coast).
2. Open a piece. Choose a size (required; sold-out sizes are crossed out and disabled). Adding
   without a size shows an announced error and moves focus to the sizes.
3. **Add to bag** opens the bag drawer, available on every page from the header. It's a native
   modal `<dialog>`: focus is trapped, Esc closes, focus returns to where you were.
4. In the bag: change quantity (1–5), remove lines, see the subtotal in INR. The bag is saved in
   `localStorage` (key `maison-aube-bag`) on your device only.
5. **Checkout** shows an inline note: this is a concept, nothing was ordered, no payment was
   taken. It does nothing else.

Without JavaScript, the home page and Our story read in full; collection and product pages show a
short note, since they open a specific item from the query string.

## Files

```
index.html          editorial home page
collection.html     a collection (?c=valley | ?c=coast)
product.html        a piece (?id=hollow-coat, …; 12 pieces)
story.html          "Our story" (concept copy)
404.html            not found
assets/data.js      collections + all 12 pieces (copy, prices, materials, care)
assets/app.js       bag drawer, image settle, collection + product rendering
assets/style.css    all styles
assets/art/         original SVG illustrations (landscapes, skeins, still life, 12 garments)
assets/fonts/       self-hosted woff2 (latin subset) + OFL licences
favicon.svg, robots.txt, .nojekyll
```

Plain HTML, CSS and vanilla JS modules. No framework, no build step, no third-party requests. All
paths are relative, so it works from a subpath (GitHub Pages project site).

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000/
```

(ES modules need a server; opening the files directly from disk won't load the scripts.)

## Fonts

- **Instrument Serif** (regular + italic) and **Instrument Sans** (variable, 400–600), both by the
  Instrument Serif / Instrument Sans Project Authors, licensed under the SIL Open Font License 1.1.
  Latin subsets downloaded from Google Fonts and self-hosted; licence texts are in
  `assets/fonts/OFL-InstrumentSerif.txt` and `assets/fonts/OFL-InstrumentSans.txt`.
- The rupee sign (₹) isn't in either family, so it falls back to the system sans.

## Credits

Designed & built by [webtheory.co](https://webtheory-co.web.app). All imagery is original SVG
illustration drawn for this concept; there are no photographs.
