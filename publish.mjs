/**
 * publish.mjs — syncs Notes markdown files to WordPress as a blog series
 * Triggered by GitHub Actions on push to main
 *
 * Each folder (e.g. "Module 1") becomes a WordPress series category (slug: series-module-1).
 * Each .md file becomes a WordPress post assigned to that category + the root "blog" category.
 * Post order follows the numeric prefix on the filename.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, basename, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const WP_URL      = process.env.WP_URL;           // e.g. https://wpapi.bunisystems.com/wp-json/wp/v2
const WP_USER     = process.env.WP_USER;
const WP_PASS     = process.env.WP_APP_PASSWORD;
const DISPATCH_TOKEN = process.env.BUNISYSTEMS_DISPATCH_TOKEN; // GitHub PAT for repository_dispatch
const DISPATCH_REPO  = process.env.BUNISYSTEMS_REPO || 'macxwhale/bunisystems';

if (!WP_URL || !WP_USER || !WP_PASS) {
  console.error('Missing WP_URL, WP_USER or WP_APP_PASSWORD');
  process.exit(1);
}

const AUTH = 'Basic ' + Buffer.from(`${WP_USER}:${WP_PASS}`).toString('base64');

async function wpFetch(path, options = {}) {
  const url = `${WP_URL}/${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: AUTH,
      ...options.headers,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`WP API ${res.status} ${path}: ${JSON.stringify(body)}`);
  return body;
}

// ── Markdown → HTML (minimal, no deps) ──────────────────────────────────────
function mdToHtml(md) {
  return md
    // headings
    .replace(/^###### (.+)$/gm, '<h6>$1</h6>')
    .replace(/^##### (.+)$/gm, '<h5>$1</h5>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // blockquotes
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // horizontal rule
    .replace(/^---+$/gm, '<hr>')
    // unordered list items → wrap later
    .replace(/^[*-] (.+)$/gm, '<li>$1</li>')
    // ordered list items
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // blank lines → paragraph breaks
    .split(/\n{2,}/)
    .map(block => {
      block = block.trim();
      if (!block) return '';
      if (/^<(h[1-6]|ul|ol|li|blockquote|hr|pre|table)/.test(block)) return block;
      if (block.startsWith('<li>')) return `<ul>${block}</ul>`;
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');
}

// ── Slug helpers ─────────────────────────────────────────────────────────────
function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// ── Ensure a category exists, return it ──────────────────────────────────────
async function ensureCategory(name, slug) {
  const existing = await wpFetch(`categories?slug=${slug}`);
  if (existing.length) return existing[0];
  return wpFetch('categories', { method: 'POST', body: JSON.stringify({ name, slug }) });
}

// ── Find existing post by slug ────────────────────────────────────────────────
async function findPost(slug) {
  const results = await wpFetch(`posts?slug=${slug}&status=any`);
  return results[0] ?? null;
}

// ── Create or update a post ───────────────────────────────────────────────────
async function upsertPost({ title, slug, content, excerpt, categories, order }) {
  const payload = {
    title,
    slug,
    content,
    excerpt,
    status: 'publish',
    categories: categories.map(c => c.id),
    meta: { series_order: order },
  };

  const existing = await findPost(slug);
  if (existing) {
    console.log(`  ↻ update: ${title}`);
    return wpFetch(`posts/${existing.id}`, { method: 'POST', body: JSON.stringify(payload) });
  }
  console.log(`  + create: ${title}`);
  return wpFetch('posts', { method: 'POST', body: JSON.stringify(payload) });
}

// ── Trigger bunisystems rebuild ───────────────────────────────────────────────
async function triggerRebuild() {
  if (!DISPATCH_TOKEN) { console.log('  ⚠ No BUNISYSTEMS_DISPATCH_TOKEN — skipping rebuild trigger'); return; }
  const res = await fetch(`https://api.github.com/repos/${DISPATCH_REPO}/dispatches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${DISPATCH_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ event_type: 'notes-published' }),
  });
  if (res.ok || res.status === 204) {
    console.log(`  ✓ Triggered rebuild on ${DISPATCH_REPO}`);
  } else {
    console.warn(`  ⚠ Rebuild dispatch failed: ${res.status}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // Look up (or create) the root "blog" category — posts must be in it to appear on /blog
  const blogCategory = await ensureCategory('Blog', 'blog');

  const root = __dirname;
  const entries = readdirSync(root).filter(f => {
    try { return statSync(join(root, f)).isDirectory() && /^Module/i.test(f); } catch { return false; }
  }).sort();

  let totalPosts = 0;

  for (const folder of entries) {
    console.log(`\nProcessing: ${folder}`);
    // Series must be a category with slug "series-*" — that's what the frontend detects
    const seriesCategory = await ensureCategory(folder, `series-${toSlug(folder)}`);

    const files = readdirSync(join(root, folder))
      .filter(f => extname(f) === '.md')
      .sort();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = join(root, folder, file);
      const raw = readFileSync(filePath, 'utf8');

      // Title: first H1 or filename without number prefix
      const h1 = raw.match(/^#\s+(.+)$/m);
      const title = h1 ? h1[1].trim() : basename(file, '.md').replace(/^\d+\.\s*/, '');
      const slug = toSlug(`${folder}-${title}`);
      const content = mdToHtml(raw);
      const excerpt = raw.replace(/[#*`>\n-]/g, ' ').trim().slice(0, 160);

      await upsertPost({ title, slug, content, excerpt, categories: [blogCategory, seriesCategory], order: i + 1 });
      totalPosts++;
    }
  }

  console.log(`\n✓ Synced ${totalPosts} posts across ${entries.length} series`);
  await triggerRebuild();
}

main().catch(err => { console.error(err); process.exit(1); });
