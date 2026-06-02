#!/usr/bin/env node
/**
 * academic-books.js
 *
 * Builds a list of recently published academic books from a set of publishers
 * (Routledge, MIT Press, Oxford, Columbia, Cambridge, Springer, Harvard,
 * Palgrave Macmillan, ...), each with a permanent link (its DOI).
 *
 * Data source: Crossref REST API (https://api.crossref.org) — free, no API key.
 * Every book's link is its DOI, which resolves to the publisher's page:
 *   https://doi.org/<DOI>
 *
 * Usage:
 *   node academic-books.js
 *
 * Config: edit PUBLISHERS / FROM_DATE / UNTIL_DATE / BOOK_TYPES below.
 * Optional environment variable:
 *   CROSSREF_MAILTO  - your email; joining Crossref's "polite pool" is faster
 *                      and more reliable. Defaults to the constant below.
 *
 * Requires Node.js 18+ (uses the built-in global `fetch`).
 */

'use strict';

const fs = require('fs');

// ---------------------------------------------------------------------------
// CONFIG — edit these
// ---------------------------------------------------------------------------

// Publisher display names. The script resolves each to a Crossref member ID.
const PUBLISHERS = [
  'Oxford University Press',
  'Cambridge University Press',
  'Routledge', // Taylor & Francis
  'Springer',
  'The MIT Press',
  'Columbia University Press',
  'Harvard University Press',
  'Palgrave Macmillan',
];

const FROM_DATE = '2025-01-01'; // inclusive (YYYY-MM-DD)
const UNTIL_DATE = '';          // inclusive; '' = no upper bound

// Crossref work types that represent books (not chapters or journal articles).
const BOOK_TYPES = ['monograph', 'book', 'edited-book', 'reference-book'];

// Safety cap on books collected per publisher (set to Infinity for everything).
const MAX_PER_PUBLISHER = 5000;

const CROSSREF_MAILTO = process.env.CROSSREF_MAILTO || 'you@example.com';

// ---------------------------------------------------------------------------

const ROWS = 100; // Crossref max page size
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const UA = `academic-books-script/1.0 (mailto:${CROSSREF_MAILTO})`;

async function crossref(pathAndQuery) {
  const url = `https://api.crossref.org${pathAndQuery}`;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (res.status === 429 || res.status >= 500) {
        throw new Error(`Retryable HTTP ${res.status}`);
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      return await res.json();
    } catch (err) {
      const waitMs = 1000 * 2 ** attempt;
      console.warn(`  ! ${err.message} — retrying in ${waitMs}ms`);
      await sleep(waitMs);
    }
  }
  throw new Error(`Failed after retries: ${url}`);
}

// Resolve a publisher display name to the best-matching Crossref member ID.
async function resolveMemberId(name) {
  const data = await crossref(
    `/members?query=${encodeURIComponent(name)}&rows=5`
  );
  const items = data.message?.items || [];
  if (items.length === 0) return null;

  // Prefer an exact (case-insensitive) primary-name match, else the top hit.
  const lower = name.toLowerCase();
  const exact = items.find((m) => (m['primary-name'] || '').toLowerCase() === lower);
  const chosen = exact || items[0];
  return { id: chosen.id, name: chosen['primary-name'] };
}

function authorsOf(item) {
  return (item.author || [])
    .map((a) => [a.given, a.family].filter(Boolean).join(' ') || a.name)
    .filter(Boolean)
    .join('; ');
}

function dateOf(item) {
  const parts = (item.published || item['published-print'] || item['published-online'] || {})['date-parts'];
  if (!parts || !parts[0]) return '';
  return parts[0].map((n) => String(n).padStart(2, '0')).join('-');
}

function normalize(item) {
  return {
    title: (item.title && item.title[0]) || '',
    authors: authorsOf(item),
    publisher: item.publisher || '',
    publishedDate: dateOf(item),
    type: item.type || '',
    isbn: (item.ISBN || []).join('; '),
    doi: item.DOI || '',
    link: item.DOI ? `https://doi.org/${item.DOI}` : item.URL || '',
  };
}

async function collectPublisher(name, byDoi) {
  console.log(`\n=== ${name} ===`);
  const member = await resolveMemberId(name);
  if (!member) {
    console.warn(`  ! Could not resolve "${name}" to a Crossref member — skipping`);
    return 0;
  }
  console.log(`  member id ${member.id} (${member.name})`);

  const filters = [
    `member:${member.id}`,
    `type:${BOOK_TYPES.join(',type:')}`, // OR within a filter key
    `from-pub-date:${FROM_DATE}`,
  ];
  if (UNTIL_DATE) filters.push(`until-pub-date:${UNTIL_DATE}`);
  const select = 'title,author,publisher,published,type,ISBN,DOI,URL';

  let cursor = '*';
  let added = 0;
  while (added < MAX_PER_PUBLISHER) {
    const q =
      `/works?filter=${filters.join(',')}` +
      `&select=${select}&rows=${ROWS}&cursor=${encodeURIComponent(cursor)}`;
    const data = await crossref(q);
    const items = data.message?.items || [];
    if (items.length === 0) break;

    for (const item of items) {
      const rec = normalize(item);
      if (!rec.doi || byDoi.has(rec.doi)) continue;
      rec.publisherQuery = name;
      byDoi.set(rec.doi, rec);
      added++;
    }
    console.log(`  +${items.length} (total kept: ${added})`);

    cursor = data.message['next-cursor'];
    if (!cursor) break;
    await sleep(200); // be polite
  }
  console.log(`=== ${name}: ${added} books ===`);
  return added;
}

function toCsv(rows) {
  const headers = [
    'publisherQuery', 'title', 'authors', 'publisher',
    'publishedDate', 'type', 'isbn', 'doi', 'link',
  ];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [headers.join(',')];
  for (const r of rows) lines.push(headers.map((h) => esc(r[h])).join(','));
  return lines.join('\n');
}

async function main() {
  const byDoi = new Map();
  for (const name of PUBLISHERS) {
    try {
      await collectPublisher(name, byDoi);
    } catch (err) {
      console.error(`  ✗ ${name} failed: ${err.message}`);
    }
  }

  const books = Array.from(byDoi.values()).sort((a, b) => {
    if (a.publisherQuery !== b.publisherQuery)
      return a.publisherQuery < b.publisherQuery ? -1 : 1;
    return a.publishedDate < b.publishedDate ? 1 : -1;
  });

  fs.writeFileSync('academic-books.json', JSON.stringify(books, null, 2));
  fs.writeFileSync('academic-books.csv', toCsv(books));

  console.log(`\n✅ Done. ${books.length} unique books across ${PUBLISHERS.length} publishers.`);
  console.log('   Saved: academic-books.json');
  console.log('   Saved: academic-books.csv');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
