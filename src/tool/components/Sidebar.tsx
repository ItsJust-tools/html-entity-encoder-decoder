import React from 'react';
import { ToolState, SAMPLES } from '../types';

interface SidebarProps {
  state: ToolState;
  onChange: (state: ToolState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ state, onChange }) => {
  return (
    <div className="p-4 space-y-6 text-sm bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full overflow-y-auto">
      <div>
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Encoding Options</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between text-xs font-medium text-gray-700 dark:text-gray-300">
            Encode quotes (“ ”)
            <input
              type="checkbox"
              checked={state.encodeQuotes}
              onChange={(e) => onChange({ ...state, encodeQuotes: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </label>
          <label className="flex items-center justify-between text-xs font-medium text-gray-700 dark:text-gray-300">
            Encode non-ASCII (é → &#233;)
            <input
              type="checkbox"
              checked={state.encodeNonAscii}
              onChange={(e) => onChange({ ...state, encodeNonAscii: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </label>
          <label className="flex items-center justify-between text-xs font-medium text-gray-700 dark:text-gray-300">
            Encode reserved (© ® ™ …)
            <input
              type="checkbox"
              checked={state.encodeReserved}
              onChange={(e) => onChange({ ...state, encodeReserved: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </label>
          <label className="flex items-center justify-between text-xs font-medium text-gray-700 dark:text-gray-300">
            Prefer numeric (&#38; over &amp;)
            <input
              type="checkbox"
              checked={state.preferNumeric}
              onChange={(e) => onChange({ ...state, preferNumeric: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </label>
          <label className="flex items-center justify-between text-xs font-medium text-gray-700 dark:text-gray-300">
            Live conversion
            <input
              type="checkbox"
              checked={state.autoConvert}
              onChange={(e) => onChange({ ...state, autoConvert: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </label>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Stats</h3>
        <div className="rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Input chars</span>
            <span className="font-mono">{state.input.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Output chars</span>
            <span className="font-mono">{state.output.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">
              {state.mode === 'encode' ? 'Entities created' : 'Entities resolved'}
            </span>
            <span className="font-mono">{state.entityCount}</span>
          </div>
          {state.mode === 'encode' && Object.keys(state.escapedChars).length > 0 && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-gray-500 dark:text-gray-400 mb-1">Escaped characters:</div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(state.escapedChars).map(([entity, count]) => (
                  <span
                    key={entity}
                    className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-[10px]"
                  >
                    {entity} ×{count}
                  </span>
                ))}
              </div>
            </div>
          )}
          {state.mode === 'decode' && state.issues.length > 0 && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-amber-600 dark:text-amber-400 mb-1">
                {state.issues.length} unresolved entit{state.issues.length === 1 ? 'y' : 'ies'}
              </div>
              <div className="flex flex-wrap gap-1">
                {state.issues.map((issue, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 font-mono text-[10px]"
                    title={issue.reason}
                  >
                    {issue.entity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Samples</h3>
        <div className="space-y-2">
          {Object.entries(SAMPLES).map(([key, text]) => (
            <button
              key={key}
              onClick={() =>
                onChange({
                  ...state,
                  mode: key === 'entities' ? 'decode' : 'encode',
                  input: text,
                  output: '',
                })
              }
              className="w-full text-left px-3 py-2 text-xs rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {key === 'basic' && 'Basic text with & " < >'}
              {key === 'symbols' && 'Special symbols (© ® ™ é …)'}
              {key === 'html' && 'Raw HTML snippet'}
              {key === 'entities' && 'Pre-encoded entities'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Entity Reference</h3>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 leading-relaxed">
          <p>
            <code className="font-mono">&amp;amp;</code> → <code className="font-mono">&amp;</code>
          </p>
          <p>
            <code className="font-mono">&amp;lt;</code> /{' '}
            <code className="font-mono">&amp;gt;</code> → <code className="font-mono">&lt;</code> /{' '}
            <code className="font-mono">&gt;</code>
          </p>
          <p>
            <code className="font-mono">&amp;quot;</code> →{' '}
            <code className="font-mono">&quot;</code>
          </p>
          <p>
            <code className="font-mono">&amp;nbsp;</code> → non-breaking space
          </p>
          <p>
            <code className="font-mono">&amp;#169;</code> /{' '}
            <code className="font-mono">&amp;#xA9;</code> → ©
          </p>
        </div>
      </div>
    </div>
  );
};
