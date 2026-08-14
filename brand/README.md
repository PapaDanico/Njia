# Njia brand assets

Generated, not hand-drawn. Rebuild with:

```
npm i --no-save --prefix /tmp/njia-brand playwright
NODE_PATH=/tmp/njia-brand/node_modules node tools/build-brand-assets.mjs
```

| File | Sheet item | Use |
|---|---|---|
| `lockup-stacked.png` | 2 | Vertical or narrow spaces, light grounds |
| `lockup-stacked-dark.png` | 2 | Same, on dark grounds |
| `social-banner-16x9.png` | 7 | Social **profile headers** — LinkedIn, X, Facebook page |

## These are not app assets

They live in `brand/`, deliberately outside `icons/`. Nothing in the app
references them, they are not in the service worker manifest, and they must not
be — a learner on metered mobile data should not pay to download marketing art.
`tests/artefacts.test.js` enforces the orphan rule inside `icons/` only, which is
why putting them there would (correctly) fail the build.

## `social-banner-16x9.png` is not the share card

Two different jobs, and swapping them would hurt both:

- **`icons/og-image.jpg`** is what appears when someone shares a link. Its job is
  to earn a click, which is why it leads with *"Career clarity shouldn't cost
  what consultants charge."*
- **`brand/social-banner-16x9.png`** is a profile header. Its job is identity, so
  it carries the lockup, the three-part line and `#NjiaYaMaendeleo`.

The banner keeps generous margins on purpose: profile avatars overlap the
lower-left corner on most platforms, and headers crop differently on mobile.

## How faithful these are, honestly

The mark, the border strip and the palette are the real shipped assets, read out
of `icons/logo-mark.svg` and `css/styles.css` at build time — so they cannot
drift from the product.

**The wordmark is not the sheet's typeface.** The identity sheet specifies a
custom serif that is not available here, so "Njia" is set in the same
`--serif` stack the live site uses (Charter → Bitstream Charter → Sitka Text →
Cambria → Georgia). That makes these assets consistent with the product a reader
actually sees, which is the next best thing to the real face.

A first attempt hand-plotted the wordmark as SVG bezier paths. It rendered as a
broken "N jia" with crude letterforms and was deleted rather than shipped: a bad
wordmark damages a brand more than a missing one does. If the real typeface is
ever licensed, add it as a webfont, point `--serif` at it, and regenerate —
everything here follows automatically.

## Not built, and why

- **Watermark tile** (sheet item 3). Recommended against. The border strips
  already carry the Kenyan geometry, and a pattern behind text puts the AA
  contrast the site has earned at risk for decoration that adds nothing a reader
  needs. The sheet's own usage notes ask for "sufficient contrast for readability
  across backgrounds", which is the argument against it.
- **Seamless pattern tile** (sheet item 1). Nothing in the product needs a full
  tiled field yet. Build it when there is a surface asking for it, not before.

## One discrepancy to resolve

The favicon sheet's browser mockup shows **`njia.or.ke`**. The live site is
**`njiacareerpathways.work`**, which is what every canonical URL, the sitemap and
the Open Graph tags point at. Nothing here was changed on the strength of a
mockup — if `njia.or.ke` is the intended home, that is a domain migration with
canonical, sitemap, manifest and OG consequences, and it should be done
deliberately.
