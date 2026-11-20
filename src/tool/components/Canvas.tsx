import React, { useEffect, useMemo } from 'react';
import { ToolState } from '../types';
import { convert } from '../tool-definition';

interface CanvasProps {
  state: ToolState;
  onChange: (state: ToolState) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ state, onChange }) => {
  // Live two-way conversion: recompute output whenever inputs change
  const live = useMemo(
    () => convert(state),
    [
      state.input,
      state.mode,
      state.encodeQuotes,
      state.encodeNonAscii,
      state.encodeReserved,
      state.preferNumeric,
    ]
  );
  void live; // computed inside useMemo to avoid unused var lint

  const currentOutput = state.autoConvert ? live.output : state.output;

  // Keep state.output in sync while auto-convert is on
  useEffect(() => {
    if (state.autoConvert) {
      onChange({
        ...state,
        output: live.output,
        entityCount: live.entityCount,
        escapedChars: live.escapedChars,
        issues: live.issues,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.autoConvert, live.output, live.entityCount, live.escapedChars, live.issues]);

  const handleInput = (val: string) => {
    onChange({ ...state, input: val });
  };

  const runManually = () => {
    const next = convert(state);
    onChange(next);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(currentOutput);
  };

  const downloadOutput = () => {
    const ext = state.mode === 'encode' ? 'txt' : 'txt';
    const blob = new Blob([currentOutput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `output.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 h-[calc(100vh-120px)] overflow-hidden">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Input ({state.mode === 'encode' ? 'Raw Text' : 'Encoded HTML'})
          </label>
        </div>
        <textarea
          value={state.input}
          onChange={(e) => handleInput(e.target.value)}
          placeholder={
            state.mode === 'encode' ? 'Enter raw text here...' : 'Paste HTML-encoded text here...'
          }
          className="flex-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 font-mono text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          spellCheck={false}
        />
      </div>

      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Output ({state.mode === 'encode' ? 'HTML-encoded' : 'Decoded'})
          </label>
          {currentOutput && (
            <div className="flex items-center gap-2">
              <button
                onClick={copyOutput}
                className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Copy
              </button>
              <button
                onClick={downloadOutput}
                className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Download
              </button>
            </div>
          )}
        </div>
        <div className="relative flex-1 flex flex-col h-full">
          <textarea
            value={currentOutput}
            readOnly
            placeholder="Converted output will appear here..."
            className="flex-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 font-mono text-xs text-gray-900 dark:text-gray-100 focus:outline-none resize-none"
            spellCheck={false}
          />
          {!state.autoConvert && (
            <button
              onClick={runManually}
              className="mt-2 px-3 py-1.5 text-xs font-medium rounded bg-indigo-600 text-white hover:bg-indigo-700 self-end"
            >
              Convert
            </button>
          )}
          {state.mode === 'decode' && state.issues && state.issues.length > 0 && (
            <div className="absolute bottom-3 left-3 right-3 bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 px-3 py-2 rounded text-xs overflow-auto max-h-24">
              <strong>
                {state.issues.length} unrecognized entit{state.issues.length === 1 ? 'y' : 'ies'}
              </strong>{' '}
              left as-is (e.g. <code>{state.issues[0]?.entity}</code>)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
