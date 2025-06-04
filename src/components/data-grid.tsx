import React from 'react';
import type { DataRow, ColumnDefinition } from '@/types';

interface DataGridProps {
  data: DataRow[];
  columns: ColumnDefinition[];
  allColumnKeys: string[];
  setData: (data: DataRow[]) => void;
  onNextColumns: () => void;
  onPrevColumns: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  isMobileLayout: boolean;
}

export default function DataGrid({
  data,
  columns,
  allColumnKeys,
  setData,
  onNextColumns,
  onPrevColumns,
  canGoNext,
  canGoPrev,
  isMobileLayout,
}: DataGridProps) {
  const handleCellChange = (rowIndex: number, columnKey: string, value: any) => {
    const newData = [...data];
    newData[rowIndex] = {
      ...newData[rowIndex],
      [columnKey]: value,
    };
    setData(newData);
  };

  return (
    <div className="rounded-xl border border-[#ececec] bg-white p-0 text-black overflow-auto">
      <div className="flex justify-between items-center px-6 pt-6 pb-3">
        <h2 className="text-xl font-semibold">Таблица данных</h2>
        <div className="flex gap-2">
          <button
            onClick={onPrevColumns}
            disabled={!canGoPrev}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded disabled:opacity-50 border border-[#ececec]"
          >
            ←
          </button>
          <button
            onClick={onNextColumns}
            disabled={!canGoNext}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded disabled:opacity-50 border border-[#ececec]"
          >
            →
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse rounded-xl overflow-hidden">
          <thead className="bg-[#f7f7fa]">
            <tr>
              {columns.map((column, idx) => (
                <th
                  key={column.key}
                  className={`py-3 px-4 text-left font-semibold text-gray-700 border-b border-[#ececec] ${idx === 0 ? 'rounded-tl-xl' : ''} ${idx === columns.length - 1 ? 'rounded-tr-xl' : ''}`}
                  style={{fontWeight: 600, fontSize: 16}}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={row.id}
                className="border-b border-[#ececec] hover:bg-[#f7f7fa] transition"
                style={{height: 44}}
              >
                {columns.map((column, colIdx) => (
                  <td
                    key={column.key}
                    className={`py-2 px-4 align-top text-gray-900 ${colIdx === 0 ? 'border-l-0' : ''} ${colIdx === columns.length - 1 ? 'border-r-0' : ''}`}
                    style={{border: 'none'}}
                  >
                    <input
                      type="text"
                      value={row[column.key] || ''}
                      onChange={e => handleCellChange(rowIndex, column.key, e.target.value)}
                      className="w-full bg-transparent px-0 py-1 border-b border-[#ececec] rounded-none focus:border-blue-400 focus:ring-0 text-[15px]"
                      style={{minHeight: 30}}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 