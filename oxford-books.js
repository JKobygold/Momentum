#!/usr/bin/env node
/**
 * oxford-books.js
 *
 * Fetches every book published by "Oxford University Press" in 2025 and 2026
 * using the public Google Books API, then writes the results to JSON and CSV.
 *
 * Usage:
 *   node oxford-books.js
 *
 * Optional environment variables:
 *   GOOGLE_BOOKS_API_KEY  - a Google Books API key (raises rate limits; not required)
 *
 * Requires Node.js 18+ (uses the built-in global `fetch`).
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Minimal .env loader (no dependencies): reads KEY=VALUE lines from a local
// .env file and populates process.env without overriding existing vars.
function loadDotEnv(file = path.join(__dirname, '.env')) {
  let raw;
  try {
    raw = fs.readFileSync(file, 'utf8');
  } catch {
    return; // no .env file is fine
  }
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    // Strip optional surrounding quotes.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && !(key in process.env)) process.env[key] = value;
  }
}

loadDotEnv();

const PUBLISHER = 'Oxford University Press';
const YEARS = ['2025', '2026'];
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY || '';

// Google Books returns at most 40 results per request and caps paging
// around index 1000, so we narrow each query by year to stay under that cap.
const PAGE_SIZE = 40;
const MAX_START_INDEX = 1000;
const REQUEST_DELAY_MS = 250; // be polite to the API

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function buildUrl(query, startIndex) {
  const params = new URLSearchParams({
    q: query,
    startIndex: String(startIndex),
    maxResults: String(PAGE_SIZE),
    printType: 'books',
    orderBy: 'newest',
  });
  if (API_KEY) params.set('key', API_KEY);
  return `https://www.googleapis.com/books/v1/volumes?${params.toString()}`;
}

async function fetchPage(query, startIndex) {
  const url = buildUrl(query, startIndex);

  // Retry with exponential backoff on transient/network/rate-limit errors.
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url);

      // A 429 with no API key means the anonymous daily quota (now 0 on
      // server IPs) is exhausted. No amount of retrying fixes that — the
      // caller must supply a key — so fail fast with a clear message.
      if (res.status === 429 && !API_KEY) {
        throw new Error(
          'Google Books returned HTTP 429 and no GOOGLE_BOOKS_API_KEY is set.\n' +
            '   Anonymous requests are no longer permitted from server IPs.\n' +
            '   Get a free key at https://console.cloud.google.com/apis/credentials\n' +
            '   then run:  GOOGLE_BOOKS_API_KEY=your_key node oxford-books.js'
        );
      }
      if (res.status === 429 || res.status >= 500) {
        throw new Error(`Retryable HTTP ${res.status}`);
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }
      return await res.json();
    } catch (err) {
      // Don't retry the unrecoverable "needs a key" case.
      if (err.message.startsWith('Google Books returned HTTP 429')) throw err;
      const waitMs = 1000 * 2 ** attempt;
      console.warn(`  ! ${err.message} — retrying in ${waitMs}ms`);
      await sleep(waitMs);
    }
  }
  throw new Error(`Failed to fetch after retries: ${url}`);
}

/**
 * Returns true if the volume was actually published by OUP in one of the
 * target years. The API query is fuzzy, so we re-check the structured fields.
 */
function matches(info) {
  const publisher = (info.publisher || '').toLowerCase();
  const isOxford = publisher.includes('oxford university press');

  const year = (info.publishedDate || '').slice(0, 4);
  const inYears = YEARS.includes(year);

  return isOxford && inYears;
}

function normalize(item) {
  const info = item.volumeInfo || {};
  return {
    id: item.id,
    title: info.title || '',
    subtitle: info.subtitle || '',
    authors: (info.authors || []).join('; '),
    publisher: info.publisher || '',
    publishedDate: info.publishedDate || '',
    isbn: (info.industryIdentifiers || [])
      .map((i) => `${i.type}:${i.identifier}`)
      .join('; '),
    pageCount: info.pageCount || '',
    categories: (info.categories || []).join('; '),
    language: info.language || '',
    infoLink: info.infoLink || '',
  };
}

async function collectForYear(year, byId) {
  // inpublisher narrows to the publisher; including the year as a free term
  // biases Google's relevance ranking toward that year's catalogue.
  const query = `inpublisher:"${PUBLISHER}" ${year}`;
  console.log(`\n=== Querying ${year} ===`);

  let added = 0;
  for (let start = 0; start < MAX_START_INDEX; start += PAGE_SIZE) {
    const data = await fetchPage(query, start);
    const items = data.items || [];
    if (items.length === 0) break;

    for (const item of items) {
      const info = item.volumeInfo || {};
      if (!matches(info)) continue;
      if (byId.has(item.id)) continue;
      byId.set(item.id, normalize(item));
      added++;
    }

    console.log(
      `  fetched ${items.length} (start=${start}); kept so far this year: ${added}`
    );

    if (items.length < PAGE_SIZE) break; // last page
    await sleep(REQUEST_DELAY_MS);
  }
  console.log(`=== ${year}: ${added} matching books ===`);
}

function toCsv(rows) {
  const headers = [
    'title',
    'subtitle',
    'authors',
    'publisher',
    'publishedDate',
    'isbn',
    'pageCount',
    'categories',
    'language',
    'infoLink',
  ];
  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h] ?? '')).join(','));
  }
  return lines.join('\n');
}

async function main() {
  const byId = new Map();

  for (const year of YEARS) {
    await collectForYear(year, byId);
  }

  const books = Array.from(byId.values()).sort((a, b) =>
    a.publishedDate < b.publishedDate ? 1 : -1
  );

  fs.writeFileSync('oxford-books-2025-2026.json', JSON.stringify(books, null, 2));
  fs.writeFileSync('oxford-books-2025-2026.csv', toCsv(books));

  console.log(`\n✅ Done. ${books.length} unique books found.`);
  console.log('   Saved: oxford-books-2025-2026.json');
  console.log('   Saved: oxford-books-2025-2026.csv');

  console.log('\nFirst 20 results:');
  books.slice(0, 20).forEach((b, i) => {
    console.log(`  ${i + 1}. (${b.publishedDate}) ${b.title}${b.authors ? ' — ' + b.authors : ''}`);
  });
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
