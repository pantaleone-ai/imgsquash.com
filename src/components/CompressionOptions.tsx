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
    <div className="border-2 border-gray-200 space-y-6 w-full bg-white p-6 rounded-lg shadow-lg">
      <div>
        <label className="text-center block text-xl font-bold text-gray-800 mb-6">
          Select Image Format & Quality:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(['webp', 'avif', 'png', 'jpeg', 'jpgxl'] as const).map((format) => (
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
          <label className="block text-md font-bold text-gray-800 mb-4">
            Image Quality: {options.quality}%
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={options.quality}
            onChange={(e) =>
              onOptionsChange({ quality: Number(e.target.value) })
            }
            className="w-full accent-blue-500"
          />
        </div>
      )}
    </div>
  );
}