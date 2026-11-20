import React from 'react';
import { ToolState } from '../types';

interface ToolbarProps {
  state: ToolState;
  onChange: (state: ToolState) => void;
  onClear: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ state, onChange, onClear }) => {
  const swap = (mode: 'encode' | 'decode') => {
    // Two-way swap: input becomes previous output, converting direction
    onChange({
      ...state,
      mode,
      input: state.output || state.input,
      output: '',
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange({ ...state, mode: 'encode' })}
          className={`px-3 py-1.5 text-xs font-medium rounded-md ${
            state.mode === 'encode'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Encode
        </button>
        <button
          onClick={() => swap('decode')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md ${
            state.mode === 'decode'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Decode
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange({ ...state, mode: 'decode', input: state.output })}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Use output as new input and decode"
        >
          ⇄ Swap
        </button>
        <button
          onClick={onClear}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Clear
        </button>
      </div>
    </div>
  );
};
