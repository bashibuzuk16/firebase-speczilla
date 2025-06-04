import React from 'react';

interface SmartMapperProps {
  selectedPdfText: string | null;
  dataTableColumns: string[];
  onMappingApplied: (pdfText: string, mappedColumn: string) => void;
}

export default function СпросиAI({
  selectedPdfText,
  dataTableColumns,
  onMappingApplied,
}: SmartMapperProps) {
  const [selectedColumn, setSelectedColumn] = React.useState<string>('');
  const [manualText, setManualText] = React.useState("");
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const handleApplyMapping = () => {
    const textToMap = manualText.trim() !== '' ? manualText : selectedPdfText;
    if (textToMap && selectedColumn) {
      onMappingApplied(textToMap, selectedColumn);
      setSelectedColumn('');
      setManualText('');
    }
  };

  return (
    <div
      className="bg-white rounded-[22px] shadow-[0_6px_32px_0_rgba(0,0,0,0.10)] border border-[#ececec] w-[600px] flex flex-col"
      style={{padding: 0}}
    >
      {/* Заголовок */}
      <div className="px-6 pt-5 pb-1">
        <span className="text-xl font-semibold">Спроси AI</span>
      </div>
      {/* Поле ввода и кнопки */}
      <div className="flex items-center px-6 pt-1 pb-1 gap-3">
        <button
          className="w-11 h-11 rounded-full bg-white border border-[#ececec] flex items-center justify-center text-2xl font-bold hover:bg-blue-100"
          title="Спросить"
        >
          +
        </button>
        <textarea
          ref={inputRef}
          value={manualText}
          onChange={e => {
            setManualText(e.target.value);
            const el = inputRef.current;
            if (el) {
              el.style.height = 'auto';
              el.style.height = Math.min(el.scrollHeight, 180) + 'px';
            }
          }}
          placeholder="Задайте вопрос по документу"
          rows={1}
          className="flex-1 min-h-[44px] max-h-[180px] px-4 py-2 rounded-xl border border-[#ececec] bg-[#f7f7fa] text-[17px] placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none resize-none overflow-auto transition-all"
          style={{width: '100%'}}
        />
        <button
          onClick={handleApplyMapping}
          disabled={!manualText.trim()}
          className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold hover:bg-blue-700 disabled:opacity-40 ml-2"
          title="Отправить"
        >
          &#8594;
        </button>
      </div>
      {/* Линия-разделитель */}
      <div className="border-t border-[#ececec] mx-0" />
      {/* Нижняя панель с настройками */}
      <div className="flex flex-row items-center justify-between px-6 py-2 gap-3">
        {/* Ссылки */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Ссылки</span>
          <input type="range" min={1} max={10} value={4} className="accent-blue-500 w-12 h-1" readOnly />
          <input type="number" min={1} max={10} value={4} className="w-7 h-7 text-xs border border-[#ececec] rounded px-1" readOnly />
        </div>
        {/* Страницы */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">Страницы</span>
          <input type="number" min={1} value={1} className="w-7 h-7 text-xs border border-[#ececec] rounded px-1" readOnly />
          <span className="text-xs text-gray-400">-</span>
          <input type="number" min={1} value={1} className="w-7 h-7 text-xs border border-[#ececec] rounded px-1" readOnly />
        </div>
        {/* Модель */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">Модель</span>
          <select className="text-xs border border-[#ececec] rounded px-1 bg-white">
            <option>Gemini 2</option>
            <option>GPT-4o</option>
            <option>Claude 3</option>
          </select>
        </div>
      </div>
    </div>
  );
}