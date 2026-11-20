import { describe, it, expect } from 'vitest';
import { EntityToolDefinition } from '@/tool/tool-definition';
import type { ToolState } from '@/tool/types';
import { encodeEntities, decodeEntities } from '@/tool/entities';

describe('EntityToolDefinition (alias compat)', () => {
  const def = new EntityToolDefinition();

  it('encodes < > & correctly', () => {
    const state: ToolState = {
      ...def.initialState,
      mode: 'encode',
      input: '<div>Tom & Jerry</div>',
    };
    const res = def.convert(state);
    expect(res.output).toBe('&lt;div&gt;Tom &amp; Jerry&lt;/div&gt;');
  });

  it('decodes named and numeric entities back to original', () => {
    const state: ToolState = {
      ...def.initialState,
      mode: 'decode',
      input: '&lt;div&gt;hello &amp;#9731; &#9731;',
    };
    const res = def.convert(state);
    expect(res.output).toBe('<div>hello &#9731; ☃');
  });

  it('handles malformed entities without throwing', () => {
    const state: ToolState = {
      ...def.initialState,
      mode: 'decode',
      input: 'Hello &unknownxyz; &#99999999; world',
    };
    expect(() => def.convert(state)).not.toThrow();
    const res = def.convert(state);
    expect(res.output).toContain('&unknownxyz;');
    expect(res.issues.length).toBeGreaterThan(0);
  });

  it('round-trips encode → decode', () => {
    const original = 'Tom & Jerry "live" <strong>café</strong>';
    const enc = encodeEntities(original, {
      encodeQuotes: true,
      encodeNonAscii: true,
      encodeReserved: true,
      preferNumeric: true,
    });
    const dec = decodeEntities(enc.text);
    expect(dec.text).toBe(original);
  });

  it('does not encode quotes when disabled', () => {
    const res = encodeEntities('a "b" \'c\'', {
      encodeQuotes: false,
      encodeNonAscii: false,
      encodeReserved: true,
      preferNumeric: false,
    });
    expect(res.text).toBe('a "b" \'c\'');
  });

  it('encodes non-ascii numerically when enabled', () => {
    const res = encodeEntities('café', {
      encodeQuotes: true,
      encodeNonAscii: true,
      encodeReserved: true,
      preferNumeric: false,
    });
    expect(res.text).toBe('caf&#233;');
  });

  it('keeps non-ascii when encoding disabled', () => {
    const res = encodeEntities('café', {
      encodeQuotes: true,
      encodeNonAscii: false,
      encodeReserved: true,
      preferNumeric: false,
    });
    expect(res.text).toBe('café');
  });

  it('handles empty input', () => {
    const state: ToolState = { ...def.initialState, input: '' };
    const res = def.convert(state);
    expect(res.output).toBe('');
    expect(res.entityCount).toBe(0);
  });

  it('reports stats for encoded characters', () => {
    const res = encodeEntities('<>&', {
      encodeQuotes: true,
      encodeNonAscii: false,
      encodeReserved: true,
      preferNumeric: false,
    });
    expect(res.stats.entityCount).toBe(3);
    expect(res.stats.escapedChars['lt']).toBe(1);
    expect(res.stats.escapedChars['gt']).toBe(1);
    expect(res.stats.escapedChars['amp']).toBe(1);
  });

  it('serializes and deserializes valid state', () => {
    const state: ToolState = { ...def.initialState, input: 'abc', mode: 'encode' };
    const json = def.serialize(state);
    expect(() => JSON.parse(json)).not.toThrow();
    const result = def.deserialize(json);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.input).toBe('abc');
      expect(result.data.mode).toBe('encode');
    }
  });

  it('rejects invalid deserialization data', () => {
    expect(def.deserialize('not json').success).toBe(false);
    expect(def.deserialize(JSON.stringify({ foo: 'bar' })).success).toBe(false);
    expect(def.deserialize(JSON.stringify(null)).success).toBe(false);
  });
});

describe('alias sanity', () => {
  it('EntityToolDefinition exists', () => {
    expect(new EntityToolDefinition()).toBeInstanceOf(EntityToolDefinition);
  });
});
