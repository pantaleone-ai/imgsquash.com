import React from 'react';
import type { OutputType, CompressionOptions } from '../types';

interface CompressionOptionsProps {
  options: CompressionOptions;
  outputType: OutputType;
  onOptionsChange: (options: CompressionOptions) => void;
  onOutputTypeChange: (type: OutputType) => void;
}

export function CompressionOptions({
  options,
  outputType,
  onOptionsChange,
  onOutputTypeChange,
}: CompressionOptionsProps) {
  return (
    <div className="space-y-6 w-full bg-white p-6 rounded-lg shadow-md">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Select an Output Format:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(['avif', 'jpeg', 'jxl', 'png', 'webp'] as const).map((format) => (
            <button
              key={format}
              className={`px-4 py-2 rounded-md text-md font-medium uppercase border-[.1rem] ${
                outputType === format
                  ? 'bg-blue-500 text-white border-blue-600 shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:border-gray-400'
              }`}
              onClick={() => onOutputTypeChange(format)}
            >
              {format}
            </button>
          ))}
        </div>
      </div>

      {outputType !== 'png' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Set Image Quality: {options.quality}%
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={options.quality}
            onChange={(e) =>
              onOptionsChange({ quality: Number(e.target.value) })
            }
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}