
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { DataRow, ColumnDefinition } from "@/types";
import { Trash2, PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface DataGridProps {
  data: DataRow[];
  columns: ColumnDefinition[];
  allColumnKeys: string[]; // All available column keys for initializing new rows
  setData: (data: DataRow[]) => void;
  onNextColumns?: () => void;
  onPrevColumns?: () => void;
  canGoNext?: boolean;
  canGoPrev?: boolean;
  isMobileLayout?: boolean;
}

const DataGrid: React.FC<DataGridProps> = ({
  data,
  columns,
  allColumnKeys,
  setData,
  onNextColumns,
  onPrevColumns,
  canGoNext,
  canGoPrev,
  isMobileLayout
}) => {
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnKey: string } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  useEffect(() => {
    setEditingCell(null);
  }, [data, columns]); // Reset editing cell if data or displayed columns change

  const handleCellClick = (rowId: string, columnKey: string, currentValue: any) => {
    const columnDef = columns.find(col => col.key === columnKey);
    if (columnDef?.editable) {
      setEditingCell({ rowId, columnKey });
      // For arrays or booleans, String(currentValue) is fine for text input
      setEditValue(String(currentValue ?? ''));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const saveEdit = () => {
    if (!editingCell) return;

    const { rowId, columnKey } = editingCell;
    const newData = data.map((row) => {
      if (row.id === rowId) {
        // Note: This saves the value as a string.
        // For specific type handling (e.g., parsing back to boolean/array),
        // more complex logic would be needed here or upon data submission.
        return { ...row, [columnKey]: editValue };
      }
      return row;
    });
    setData(newData);
    setEditingCell(null);
  };

  const handleInputBlur = () => {
    saveEdit();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const addRow = () => {
    const newId = String(Date.now());
    const newRow: DataRow = { id: newId };

    allColumnKeys.forEach(key => {
      if (key !== 'id') {
        // Initialize all fields as empty strings for simplicity.
        // Booleans and arrays from the initial data are also fine as empty strings
        // when initially represented in a text input.
        newRow[key] = '';
      }
    });
    setData([...data, newRow]);
  };

  const deleteRow = (rowId: string) => {
    setData(data.filter(row => row.id !== rowId));
  };

  const showColumnNavigation = !isMobileLayout && typeof canGoNext === 'boolean' && typeof canGoPrev === 'boolean' && columns.length > 0;

  return (
    <div className="h-full flex flex-col bg-card shadow-lg rounded-lg overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">Structured Data</h2>
        <div className="flex items-center gap-2">
          {showColumnNavigation && onPrevColumns && (
            <Button onClick={onPrevColumns} disabled={!canGoPrev} size="icon" variant="outline" aria-label="Previous columns">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          {showColumnNavigation && onNextColumns && (
            <Button onClick={onNextColumns} disabled={!canGoNext} size="icon" variant="outline" aria-label="Next columns">
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          <Button onClick={addRow} size="sm" variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Row
          </Button>
        </div>
      </div>
      <div className="flex-grow overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className="font-semibold whitespace-nowrap">
                  {col.header}
                </TableHead>
              ))}
              <TableHead className="w-[100px] text-right sticky right-0 bg-card shadow-sm">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                {columns.map((col) => (
                  <TableCell
                    key={`${row.id}-${col.key}`}
                    onClick={() => handleCellClick(row.id, col.key, row[col.key])}
                    className={`${col.editable ? "cursor-pointer hover:bg-muted/50" : ""} whitespace-nowrap`}
                  >
                    {editingCell?.rowId === row.id && editingCell?.columnKey === col.key ? (
                      <Input
                        type="text"
                        value={editValue}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyDown={handleInputKeyDown}
                        autoFocus
                        className="h-8 text-sm"
                      />
                    ) : (
                      <span className="text-sm">
                        {/* Display array as comma-separated string, boolean as string, others as is */}
                        {Array.isArray(row[col.key])
                          ? (row[col.key] as any[]).join(', ')
                          : String(row[col.key] ?? '')}
                      </span>
                    )}
                  </TableCell>
                ))}
                <TableCell className="text-right sticky right-0 bg-card shadow-sm">
                  <Button variant="ghost" size="icon" onClick={() => deleteRow(row.id)} aria-label="Delete row">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
             {data.length === 0 && (
                <TableRow>
                    <TableCell colSpan={columns.length + 1} className="text-center text-muted-foreground py-8">
                        No data available. Click "Add Row" to get started.
                    </TableCell>
                </TableRow>
            )}
             {data.length > 0 && columns.length === 0 && !isMobileLayout && (
                <TableRow>
                    <TableCell colSpan={1} className="text-center text-muted-foreground py-8">
                       Panel too narrow to display columns. Try expanding it or using column navigation arrows.
                    </TableCell>
                </TableRow>
             )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DataGrid;

    