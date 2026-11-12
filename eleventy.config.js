// Eleventy configuration — builds the static site in /_site from
// the templates in /src and the editable texts in /content.
import markdownIt from 'markdown-it';

const md = markdownIt({ html: true, linkify: true, typographer: false });

// External links open in a new tab (same as the original hand-written HTML).
const defaultLinkOpen = md.renderer.rules.link_open
  || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const href = tokens[idx].attrGet('href') || '';
  if (/^https?:\/\//i.test(href)) {
    tokens[idx].attrSet('target', '_blank');
    tokens[idx].attrSet('rel', 'noopener noreferrer');
  }
  return defaultLinkOpen(tokens, idx, options, env, self);
};

const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export default function (eleventyConfig) {
  // Static files, copied as-is. Large "*-original.*" masters are never published.
  const notOriginal = { filter: p => !/-original\./i.test(p) };
  eleventyConfig.addPassthroughCopy({ 'css': 'css' });
  eleventyConfig.addPassthroughCopy({ 'js': 'js' });
  eleventyConfig.addPassthroughCopy({ 'assets': 'assets' }, notOriginal);
  eleventyConfig.addPassthroughCopy({ 'festivals.html': 'festivals.html' });

  // Rebuild when content changes during `npm start`.
  eleventyConfig.addWatchTarget('content/');

  // ---- Filters -----------------------------------------------------------
  // Plain text → HTML-safe text.
  eleventyConfig.addFilter('esc', esc);
  // Plain text with line breaks → text with <br>.
  eleventyConfig.addFilter('nl2br', s => esc(String(s ?? '').trim()).replace(/\s*\n\s*/g, '<br>'));
  // "Fibonacci Flow" → "Fibonacci<br>Flow" (big panel titles break after the first word).
  eleventyConfig.addFilter('titleBreak', s => esc(s).replace(' ', '<br>'));
  // Markdown → HTML (block level: paragraphs, headings, lists).
  eleventyConfig.addFilter('md', s => md.render(String(s ?? '')).trim());
  // Markdown → inline HTML (for text that sits inside an existing <p>/<span>).
  eleventyConfig.addFilter('mdInline', s => md.renderInline(String(s ?? '').trim()));
  // Bilingual inline text: plain when both languages are equal, otherwise
  // the site's standard .lng--en / .lng--nl pair.
  eleventyConfig.addFilter('bi', (en, nl, transform) => {
    const f = transform === 'lower' ? (x => esc(String(x).toLowerCase())) : esc;
    if ((en ?? '') === (nl ?? '')) return f(en);
    return `<span class="lng lng--en">${f(en)}</span><span class="lng lng--nl">${f(nl)}</span>`;
  });
  eleventyConfig.addFilter('json', v => JSON.stringify(v).replace(/</g, '\\u003c'));

  return {
    dir: { input: 'src', output: '_site', includes: '_includes', data: '_data' },
    templateFormats: ['njk'],
    htmlTemplateEngine: 'njk',
  };
}
