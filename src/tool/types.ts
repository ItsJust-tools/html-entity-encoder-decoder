export type ConversionMode = 'encode' | 'decode';

export interface ToolState {
  input: string;
  output: string;
  mode: ConversionMode;
  encodeQuotes: boolean;
  encodeNonAscii: boolean;
  encodeReserved: boolean;
  preferNumeric: boolean;
  entityCount: number;
  escapedChars: Record<string, number>;
  issues: { entity: string; reason: string }[];
  autoConvert: boolean;
}

export const SAMPLES: Record<string, string> = {
  basic: 'Tom & Jerry "live" at 5 < 10 > 3',
  symbols: '© 2026 ACME®™ — café, naïve résumé • €100 £50 ¥20',
  html: '<div class="hero">&nbsp;Hello&nbsp;World</div>',
  entities: 'Fish &amp; Chips &lt;menu&gt; &copy; 2026 &#9731; snowman',
};
