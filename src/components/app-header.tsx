import React from 'react';

interface AppHeaderProps {
  onExportCsv: () => void;
  onExportJson: () => void;
  onLoadPdfClick: () => void;
  onLoadJsonClick: () => void;
}

export default function AppHeader({
  onExportCsv,
  onExportJson,
  onLoadPdfClick,
  onLoadJsonClick,
}: AppHeaderProps) {
  return (
    <header className="border-b border-[#ececec] bg-white py-3 px-6 flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-800 tracking-tight">smetzilla</h1>
      <div className="flex gap-2">
        <button
          onClick={onLoadPdfClick}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-blue-50 transition"
        >
          <span>Загрузить PDF</span>
        </button>
        <button
          onClick={onLoadJsonClick}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-green-50 transition"
        >
          <span>Загрузить JSON</span>
        </button>
        <button
          onClick={onExportJson}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-purple-50 transition"
        >
          <span>Экспорт JSON</span>
        </button>
        <button
          onClick={onExportCsv}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-orange-50 transition"
        >
          <span>Экспорт CSV</span>
        </button>
      </div>
    </header>
  );
} 