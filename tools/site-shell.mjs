/* The shared header and footer for every generated page.
 *
 * One module, imported by all three generators that write pages, so the
 * navigation cannot differ between a county page, a grade page, the help page
 * and the open-data page. The links below are the single list; the app's own
 * footer (js/app.js) must carry every one of them, and tests/site-shell.test.js
 * fails if it does not.
 *
 * Pure HTML and CSS: no script, so it renders the same with JavaScript off, in
 * an in-app browser, and from a saved page. The mobile menu is a <details>
 * element and the Evidence menu opens on hover and on keyboard focus.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const MARK = fs.readFileSync(path.join(root, 'icons', 'logo-mark.svg'), 'utf8')
  .replace(/<\?xml[^>]*\?>/, '')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ')
  .replace(/<svg ([^>]*)>/, (m, attrs) => '<svg class="site-mark" aria-hidden="true" focusable="false" '
    + attrs.replace(/\s?(role|aria-label|width|height)="[^"]*"/g, '') + '>')
  .replace(/njia-leaf/g, 'njia-leaf-site')
  .trim();

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* Header: four direct links and one menu. */
export const HEADER_LINKS = [
  { href: '/#discover', label: 'Discover' },
  { href: '/grades/', label: 'Grades' },
  { href: '/counties/', label: 'Counties' },
  { href: '/careers/', label: 'Careers' }
];
export const EVIDENCE_LINKS = [
  { href: '/research/', label: 'Catalogue evidence' },
  { href: '/methodology/', label: 'Methodology' },
  { href: '/research/sources/', label: 'Official sources' },
  { href: '/open-data/', label: 'Open data' },
  { href: '/analysis/', label: 'County analysis' }
];
export const COUNSELLOR_LINK = { href: '/counsellors/', label: 'Counsellors' };

/* Footer: four columns. */
export const FOOTER_COLUMNS = [
  { title: 'Explore', links: [
    { href: '/#discover', label: 'Start Discovery' },
    { href: '/grades/', label: 'Courses by grade' },
    { href: '/counties/', label: 'Courses by county' },
    { href: '/careers/', label: 'Careers by direction' },
    { href: '/pathways/', label: 'Education pathways' }
  ] },
  { title: 'Evidence', links: EVIDENCE_LINKS },
  { title: 'Counsellors', links: [
    { href: '/counsellors/', label: 'Counsellor kit' },
    { href: '/help/', label: 'Questions and answers' },
    { href: '/diagnostic/', label: 'About the questionnaire' },
    { href: '/docs/', label: 'Partnership proposal' }
  ] },
  { title: 'Trust', links: [
    { href: '/privacy/', label: 'Privacy' },
    { href: '/accessibility/', label: 'Accessibility' }
  ] }
];

const link = (l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`;

export function siteHeader() {
  const direct = HEADER_LINKS.map(link).join('\n      ');
  const panel = EVIDENCE_LINKS.map(link).join('\n          ');
  const all = [...HEADER_LINKS, ...EVIDENCE_LINKS, COUNSELLOR_LINK].map(link).join('\n      ');
  return `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="site-header-inner">
    <a class="site-brand" href="/" aria-label="Njia home">${MARK}<span class="site-word">Njia</span></a>
    <nav class="site-nav" aria-label="Site">
      ${direct}
      <div class="site-more">
        <a href="/research/" aria-haspopup="true">Evidence</a>
        <div class="site-more-panel">
          ${panel}
        </div>
      </div>
      ${link(COUNSELLOR_LINK)}
    </nav>
    <a class="site-cta" href="/#discover">Start Discovery</a>
    <details class="site-menu">
      <summary>Menu</summary>
      <nav aria-label="Site menu">
      ${all}
      </nav>
    </details>
  </div>
</header>`;
}

export function siteFooter(dateLabel) {
  const cols = FOOTER_COLUMNS.map((c) => `    <div class="site-foot-col">
      <p class="site-foot-title">${esc(c.title)}</p>
      ${c.links.map(link).join('\n      ')}
    </div>`).join('\n');
  return `<footer class="site-footer">
  <div class="site-foot-grid">
${cols}
  </div>
  <p class="site-foot-note">Njia is independent: it is not affiliated with KUCCPS, HELB or any institution, and your answers stay on your device. Figures are counted from the catalogue on ${esc(dateLabel)} and describe what Njia has listed, not everything that exists in Kenya.</p>
</footer>`;
}

export const SITE_SHELL_CSS = `
  /* ---------- Site header and footer (tools/site-shell.mjs) ---------- */
  .skip-link { position: absolute; left: -999px; top: 0; background: var(--primary, #8B2500); color: var(--bg, #FAF9F5); padding: .6rem 1rem; z-index: 10; }
  .skip-link:focus { left: .5rem; top: .5rem; }
  .site-header { margin: -1.5rem 0 1.75rem; border-bottom: 3px solid var(--primary, #8B2500); }
  .site-header-inner { display: flex; align-items: center; gap: 1.25rem; padding: .7rem 0; position: relative; }
  .site-brand { display: flex; align-items: center; gap: .6rem; text-decoration: none; color: inherit; }
  .site-mark { width: 19px; height: 28px; display: block; flex: none; }
  .site-word { font-family: var(--serif, Georgia, serif); font-weight: 700; font-size: 1.6rem; line-height: 1; letter-spacing: -.01em; }
  .site-nav { display: none; }
  .site-cta { display: none; }
  .site-menu { margin-left: auto; }
  .site-menu summary { list-style: none; cursor: pointer; min-height: 44px; display: inline-flex; align-items: center; padding: 0 .9rem; border: 1px solid var(--border, #E4DCCB); border-radius: .4rem; font-size: var(--fs-sm, .8125rem); font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
  .site-menu summary::-webkit-details-marker { display: none; }
  .site-menu[open] summary { background: var(--primary, #8B2500); color: var(--bg, #FAF9F5); border-color: var(--primary, #8B2500); }
  .site-menu nav { position: absolute; left: 0; right: 0; top: 100%; z-index: 5; background: var(--bg-elevated, #fff); border: 1px solid var(--border, #E4DCCB); border-top: 0; box-shadow: 0 12px 24px rgba(61, 28, 2, .12); padding: .35rem 1rem .75rem; display: grid; }
  .site-menu nav a { display: flex; align-items: center; min-height: 44px; text-decoration: none; color: var(--text-primary, #3D1C02); border-bottom: 1px solid var(--border, #E4DCCB); font-weight: 600; }
  .site-menu nav a:last-child { border-bottom: 0; }
  @media (min-width: 64rem) {
    .site-nav { display: flex; align-items: center; gap: 1.4rem; margin-left: auto; white-space: nowrap; }
    .site-nav a { font-size: var(--fs-sm, .8125rem); font-weight: 600; letter-spacing: .06em; text-transform: uppercase; text-decoration: none; color: var(--text-primary, #3D1C02); padding: .55rem 0; border-bottom: 2px solid transparent; }
    .site-nav a:hover, .site-nav a:focus-visible { border-bottom-color: var(--primary, #8B2500); }
    .site-more { position: relative; display: flex; align-items: center; }
    .site-more-panel { display: none; position: absolute; top: 100%; left: -1rem; z-index: 5; min-width: 15rem; background: var(--bg-elevated, #fff); border: 1px solid var(--border, #E4DCCB); border-top: 2px solid var(--primary, #8B2500); box-shadow: 0 12px 24px rgba(61, 28, 2, .12); padding: .4rem 0; }
    .site-more:hover .site-more-panel, .site-more:focus-within .site-more-panel { display: block; }
    .site-more-panel a { display: block; padding: .6rem 1rem; border-bottom: 0; text-transform: none; letter-spacing: 0; font-size: var(--fs-md, .9375rem); }
    .site-more-panel a:hover, .site-more-panel a:focus-visible { background: var(--bg, #FAF9F5); }
    .site-cta { display: inline-block; padding: .6rem 1.05rem; border-radius: .4rem; background: var(--primary, #8B2500); color: var(--bg, #FAF9F5); text-decoration: none; font-weight: 700; font-size: var(--fs-sm, .8125rem); letter-spacing: .04em; white-space: nowrap; }
    .site-menu { display: none; }
  }
  /* Full-bleed ink band from a contained element: the shadow paints outward
     and the clip keeps it to the element's own height, so no horizontal scroll. */
  .site-footer { margin: 3rem 0 -4rem; padding: 2.25rem 0 2.5rem; opacity: 1; font-size: var(--fs-md, .9375rem);
                 background: #2A1507; color: #F5E9D4; box-shadow: 0 0 0 100vmax #2A1507; clip-path: inset(0 -100vmax); }
  .site-foot-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.75rem 1.5rem; }
  .site-foot-title { margin: 0 0 .6rem; font-size: var(--fs-xs, .75rem); font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #E7C887; }
  .site-foot-col a { display: block; color: #F5E9D4; text-decoration: none; padding: .3rem 0; }
  .site-foot-col a:hover, .site-foot-col a:focus-visible { text-decoration: underline; text-underline-offset: .2em; }
  .site-foot-note { margin: 1.75rem 0 0; padding-top: 1.1rem; border-top: 1px solid #5A3A1E; font-size: var(--fs-sm, .8125rem); color: #D9C8A5; max-width: 62rem; }
  @media (min-width: 48rem) { .site-foot-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
  .split > .site-header, .split > .site-footer { grid-column: 1 / -1; }
  @media print { .skip-link, .site-header, .site-footer { display: none !important; } }
`;
