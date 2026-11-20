/**
 * Pure HTML entity encode/decode utilities.
 * Named entities: full HTML5 set (subset of most common) + numeric references.
 */

export const DEFAULT_NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  AMP: '&',
  lt: '<',
  LT: '<',
  gt: '>',
  GT: '>',
  quot: '"',
  QUOT: '"',
  apos: "'",
  nbsp: '\u00a0',
  copy: '\u00a9',
  reg: '\u00ae',
  trade: '\u2122',
  hellip: '\u2026',
  mdash: '\u2014',
  ndash: '\u2013',
  lsquo: '\u2018',
  rsquo: '\u2019',
  ldquo: '\u201c',
  rdquo: '\u201d',
  laquo: '\u00ab',
  raquo: '\u00bb',
  deg: '\u00b0',
  plusmn: '\u00b1',
  frac12: '\u00bd',
  times: '\u00d7',
  divide: '\u00f7',
  sup2: '\u00b2',
  sup3: '\u00b3',
  micro: '\u00b5',
  para: '\u00b6',
  sect: '\u00a7',
  middot: '\u00b7',
  bull: '\u2022',
  dagger: '\u2020',
  Dagger: '\u2021',
  permil: '\u2030',
  euro: '\u20ac',
  pound: '\u00a3',
  yen: '\u00a5',
  cent: '\u00a2',
  curren: '\u00a4',
  larr: '\u2190',
  uarr: '\u2191',
  rarr: '\u2192',
  darr: '\u2193',
  harr: '\u2194',
  alpha: '\u03b1',
  beta: '\u03b2',
  gamma: '\u03b3',
  pi: '\u03c0',
  Omega: '\u03a9',
  mu: '\u03bc',
  inf: '\u221e',
  ne: '\u2260',
  le: '\u2264',
  ge: '\u2265',
  asymp: '\u2248',
};

export interface EncodeOptions {
  /** Encode quotes (default true). */
  encodeQuotes: boolean;
  /** Encode non-ASCII characters as numeric references (default false). */
  encodeNonAscii: boolean;
  /** Encode reserved symbols like ©, ®, ™, ° (default true). */
  encodeReserved: boolean;
  /** Encode as numeric references instead of named entities. */
  preferNumeric: boolean;
}

export const DEFAULT_ENCODE_OPTIONS: EncodeOptions = {
  encodeQuotes: true,
  encodeNonAscii: false,
  encodeReserved: true,
  preferNumeric: false,
};

const NAMED_FOR_CHAR: Record<string, { name: string; reserved?: boolean }> = {
  '&': { name: 'amp' },
  '<': { name: 'lt' },
  '>': { name: 'gt' },
  '"': { name: 'quot' },
  "'": { name: 'apos' },
  '\u00a0': { name: 'nbsp', reserved: true },
  '\u00a9': { name: 'copy', reserved: true },
  '\u00ae': { name: 'reg', reserved: true },
  '\u2122': { name: 'trade', reserved: true },
  '\u00b0': { name: 'deg', reserved: true },
  '\u00b1': { name: 'plusmn', reserved: true },
  '\u00d7': { name: 'times', reserved: true },
  '\u00f7': { name: 'divide', reserved: true },
  '\u00bd': { name: 'frac12', reserved: true },
  '\u00b5': { name: 'micro', reserved: true },
  '\u00b6': { name: 'para', reserved: true },
  '\u00a7': { name: 'sect', reserved: true },
  '\u00b7': { name: 'middot', reserved: true },
  '\u2022': { name: 'bull', reserved: true },
  '\u2026': { name: 'hellip', reserved: true },
  '\u2014': { name: 'mdash', reserved: true },
  '\u2013': { name: 'ndash', reserved: true },
  '\u2018': { name: 'lsquo', reserved: true },
  '\u2019': { name: 'rsquo', reserved: true },
  '\u201c': { name: 'ldquo', reserved: true },
  '\u201d': { name: 'rdquo', reserved: true },
  '\u00ab': { name: 'raquo', reserved: true },
  '\u00bb': { name: 'laquo', reserved: true },
  '\u20ac': { name: 'euro', reserved: true },
  '\u00a3': { name: 'pound', reserved: true },
  '\u00a5': { name: 'yen', reserved: true },
  '\u00a2': { name: 'cent', reserved: true },
  '\u00a4': { name: 'curren', reserved: true },
  '\u2190': { name: 'larr', reserved: true },
  '\u2191': { name: 'uarr', reserved: true },
  '\u2192': { name: 'rarr', reserved: true },
  '\u2193': { name: 'darr', reserved: true },
  '\u2194': { name: 'harr', reserved: true },
  '\u03b1': { name: 'alpha', reserved: true },
  '\u03b2': { name: 'beta', reserved: true },
  '\u03b3': { name: 'gamma', reserved: true },
  '\u03c0': { name: 'pi', reserved: true },
  '\u03a9': { name: 'Omega', reserved: true },
  '\u03bc': { name: 'mu', reserved: true },
  '\u221e': { name: 'inf', reserved: true },
  '\u2260': { name: 'ne', reserved: true },
  '\u2264': { name: 'le', reserved: true },
  '\u2265': { name: 'ge', reserved: true },
  '\u2248': { name: 'asymp', reserved: true },
};

export interface EncodeStats {
  entityCount: number;
  escapedChars: Record<string, number>;
}

function isNonAscii(ch: string): boolean {
  return ch.charCodeAt(0) > 127;
}

export function encodeEntities(
  text: string,
  options: EncodeOptions = DEFAULT_ENCODE_OPTIONS
): EncodeResult {
  const opts = { ...DEFAULT_ENCODE_OPTIONS, ...options };
  let out = '';
  const escapedChars: Record<string, number> = {};
  let entityCount = 0;

  for (const ch of text) {
    let entity = '';
    const mapped = NAMED_FOR_CHAR[ch];
    if (mapped) {
      const isReserved = mapped.reserved === true;
      const isQuote = ch === '"' || ch === "'";
      const shouldEncode =
        (!isReserved && !isQuote) ||
        (isQuote && opts.encodeQuotes) ||
        (isReserved && opts.encodeReserved);
      if (shouldEncode) {
        entity =
          opts.preferNumeric || !NAMED_FOR_CHAR[ch] || (mapped.reserved && opts.preferNumeric)
            ? `&#${ch.codePointAt(0)};`
            : `&${mapped.name};`;
        // preferNumeric: use numeric even when a name exists
        if (opts.preferNumeric) entity = `&#${ch.codePointAt(0)};`;
      }
    } else if (isNonAscii(ch) && opts.encodeNonAscii) {
      entity = `&#${ch.codePointAt(0)};`;
    }
    if (entity) {
      out += entity;
      entityCount += 1;
      const key = mapped?.name && !opts.preferNumeric ? mapped.name : `&#${ch.codePointAt(0)};`;
      escapedChars[key] = (escapedChars[key] || 0) + 1;
    } else {
      out += ch;
    }
  }

  return { text: out, stats: { entityCount, escapedChars } };
}

export interface EncodeResult {
  text: string;
  stats: EncodeStats;
}

const NAMED_TO_CHAR: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const [ch, info] of Object.entries(NAMED_FOR_CHAR)) {
    map[info.name] = ch;
  }
  // extra aliases commonly used
  map['NewLine'] = '\n';
  return map;
})();

export interface DecodeIssue {
  entity: string;
  reason: string;
}

export interface DecodeResult {
  text: string;
  issues: DecodeIssue[];
  resolvedCount: number;
}

/**
 * Decode named (&amp;, &x#.. no) and numeric (&#169;, &#xA9;) entities.
 * Unknown/malformed entities are left as-is and reported in issues.
 */
export function decodeEntities(text: string): DecodeResult {
  let out = '';
  const issues: DecodeIssue[] = [];
  let resolvedCount = 0;
  const pattern = /&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z][a-zA-Z0-9]*);?/g;

  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text)) !== null) {
    const match = m as RegExpExecArray;
    out += text.slice(last, match.index);
    const raw = match[0];
    const body: string = match[1] ?? '';
    let replacement: string | null = null;

    if (body.startsWith('#x') || body.startsWith('#X')) {
      const code = parseInt(body.slice(2), 16);
      if (!Number.isNaN(code) && code >= 0 && code <= 0x10ffff) {
        try {
          replacement = decodeCodePoint(code);
        } catch {
          replacement = null;
        }
      }
    } else if (body.startsWith('#')) {
      const code = parseInt(body.slice(1), 10);
      if (!Number.isNaN(code) && code >= 0 && code <= 0x10ffff) {
        try {
          replacement = decodeCodePoint(code);
        } catch {
          replacement = null;
        }
      }
    } else {
      const named = NAMED_TO_CHAR[body];
      if (named !== undefined) {
        replacement = named;
      }
    }

    if (replacement === null) {
      issues.push({
        entity: raw,
        reason: body.startsWith('#')
          ? 'Invalid numeric reference or out of range'
          : 'Unknown named entity',
      });
      // Keep original text for unknown entities
      out += raw;
    } else {
      out += replacement;
      resolvedCount += 1;
    }
    last = match.index + raw.length;
  }
  out += text.slice(last);

  return { text: out, issues, resolvedCount };
}

function decodeCodePoint(code: number): string {
  if (
    (code >= 0xd800 && code <= 0xdfff) || // surrogates
    code === 0
  ) {
    throw new Error('invalid code point');
  }
  return String.fromCodePoint(code);
}
