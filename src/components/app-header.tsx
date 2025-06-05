import React from 'react';

interface AppHeaderProps {
  onExportCsv: () => void;
  onExportJson: () => void;
  onLoadPdfClick: () => void;
  onLoadJsonClick: () => void;
  apiConnected?: boolean; // Добавили этот проп!
}

export default function AppHeader({
  onExportCsv,
  onExportJson,
  onLoadPdfClick,
  onLoadJsonClick,
  apiConnected = false, // Добавили с дефолтным значением
}: AppHeaderProps) {
  return (
    <>
      <header className="border-b border-[#ececec] bg-white py-3 px-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">PDF Data Editor</h1>
          {/* Добавили отображение статуса API */}
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              apiConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {apiConnected ? '🟢 API Подключен' : '🔴 API Отключен'}
            </span>
            {!apiConnected && (
              <span className="text-xs text-gray-500">
                Режим просмотра
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onLoadPdfClick}
            disabled={!apiConnected} // Отключаем кнопку если API недоступен
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              apiConnected 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            title={!apiConnected ? "API сервер недоступен" : "Загрузить PDF файл"}
          >
            <span>📤 Загрузить PDF</span>
          </button>
          <button
            onClick={onLoadJsonClick}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-green-50 transition"
          >
            <span>📂 Загрузить JSON</span>
          </button>
          <button
            onClick={onExportJson}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-purple-50 transition"
          >
            <span>💾 Экспорт JSON</span>
          </button>
          <button
            onClick={onExportCsv}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-orange-50 transition"
          >
            <span>📊 Экспорт CSV</span>
          </button>
        </div>
      </header>

      {/* Информационная строка при отключенном API */}
      {!apiConnected && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2 text-sm text-yellow-800">
          <div className="flex items-center justify-between">
            <span>
              ⚠️ Сервер обработки недоступен. Вы можете просматривать и редактировать загруженные JSON файлы.
            </span>
            <button 
              className="text-yellow-800 underline hover:no-underline font-medium"
              onClick={() => window.location.reload()}
            >
              🔄 Обновить
            </button>
          </div>
        </div>
      )}
    </>
  );
}