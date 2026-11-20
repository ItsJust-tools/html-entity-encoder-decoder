import type { Tool, DeserializeResult } from '@itsjust/core';
import toolConfig from './tool.config';
import type { ToolState } from './types';
import { encodeEntities, decodeEntities, DEFAULT_ENCODE_OPTIONS } from './entities';

function isToolState(value: unknown): value is ToolState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Partial<ToolState>;
  return (
    typeof v.input === 'string' &&
    typeof v.output === 'string' &&
    (v.mode === 'encode' || v.mode === 'decode')
  );
}

export const entityTool: Tool<ToolState> = {
  id: toolConfig.id,
  name: toolConfig.name,
  version: toolConfig.version,
  config: toolConfig,
  initialState: {
    input: 'Tom & Jerry "live" at <3 café',
    output: '',
    mode: 'encode',
    encodeQuotes: true,
    encodeNonAscii: false,
    encodeReserved: true,
    preferNumeric: false,
    entityCount: 0,
    escapedChars: {},
    issues: [],
    autoConvert: true,
  },
  serialize: (state) => JSON.stringify(state),
  deserialize: (data): DeserializeResult<ToolState> => {
    try {
      if (isToolState(data)) {
        // Fill in options that may be missing from older serialized versions
        const data_ = data as ToolState;
        return {
          success: true,
          data: {
            ...data_,
            encodeQuotes: data_.encodeQuotes ?? DEFAULT_ENCODE_OPTIONS.encodeQuotes,
            encodeNonAscii: data_.encodeNonAscii ?? DEFAULT_ENCODE_OPTIONS.encodeNonAscii,
            encodeReserved: data_.encodeReserved ?? DEFAULT_ENCODE_OPTIONS.encodeReserved,
            preferNumeric: data_.preferNumeric ?? DEFAULT_ENCODE_OPTIONS.preferNumeric,
            entityCount: typeof data_.entityCount === 'number' ? data_.entityCount : 0,
            escapedChars: data_.escapedChars ?? {},
            issues: Array.isArray(data_.issues) ? data_.issues : [],
            autoConvert: data_.autoConvert ?? true,
          },
        };
      }
      return { success: false, error: 'Invalid data format: expected valid entity tool state' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Deserialization error';
      return { success: false, error: `Failed to deserialize state: ${message}` };
    }
  },
  exporters: [
    { format: 'png', loader: () => import('./exporters/png') },
    { format: 'jpeg', loader: () => import('./exporters/jpeg') },
    { format: 'webp', loader: () => import('./exporters/webp') },
    { format: 'pdf', loader: () => import('./exporters/pdf') },
  ],
};

/** Run encode or decode on state.input depending on state.mode. Not part of the Tool contract. */
export function convert(state: ToolState): ToolState {
  if (!state.input) {
    return {
      ...state,
      output: '',
      entityCount: 0,
      escapedChars: {},
      issues: [],
    };
  }

  try {
    if (state.mode === 'encode') {
      const { text, stats } = encodeEntities(state.input, {
        encodeQuotes: state.encodeQuotes,
        encodeNonAscii: state.encodeNonAscii,
        encodeReserved: state.encodeReserved,
        preferNumeric: state.preferNumeric,
      });
      return {
        ...state,
        output: text,
        entityCount: stats.entityCount,
        escapedChars: stats.escapedChars,
        issues: [],
      };
    }
    const decoded = decodeEntities(state.input);
    return {
      ...state,
      output: decoded.text,
      entityCount: decoded.resolvedCount,
      escapedChars: {},
      issues: decoded.issues,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Conversion error';
    return {
      ...state,
      output: '',
      entityCount: 0,
      escapedChars: {},
      issues: [],
      error: message,
    } as ToolState;
  }
}

// Back-compat alias for existing tests using the class-based name.
export class EntityToolDefinition {
  initialState: ToolState = entityTool.initialState;

  serialize(state: ToolState): string {
    return entityTool.serialize(state);
  }

  deserialize(serialized: string): DeserializeResult<ToolState> {
    try {
      const parsed: unknown = JSON.parse(serialized);
      return entityTool.deserialize(parsed);
    } catch {
      return { success: false, error: 'Invalid data format: expected valid entity tool state' };
    }
  }

  convert(state: ToolState): ToolState {
    return convert(state);
  }
}
