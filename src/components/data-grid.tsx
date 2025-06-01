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
import { Trash2, PlusCircle } from "lucide-react";

interface DataGridProps {
  data: DataRow[];
  columns: ColumnDefinition[];
  setData: (data: DataRow[]) => void;
}

const DataGrid: React.FC<DataGridProps> = ({ data, columns, setData }) => {
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnKey: string } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  useEffect(() => {
    // Close editor if data changes externally, e.g. a row is deleted
    setEditingCell(null);
  }, [data]);

  const handleCellClick = (rowId: string, columnKey: string, currentValue: any) => {
    const columnDef = columns.find(col => col.key === columnKey);
    if (columnDef?.editable) {
      setEditingCell({ rowId, columnKey });
      setEditValue(String(currentValue));
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
    const newId = String(Date.now()); // Simple unique ID generator
    const newRow: DataRow = { id: newId };
    columns.forEach(col => {
      newRow[col.key] = col.key === 'id' ? newId : ''; // Initialize new row with empty values or ID
    });
    setData([...data, newRow]);
  };
  
  const deleteRow = (rowId: string) => {
    setData(data.filter(row => row.id !== rowId));
  };


  return (
    <div className="h-full flex flex-col bg-card shadow-lg rounded-lg overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">Structured Data</h2>
        <Button onClick={addRow} size="sm" variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Row
        </Button>
      </div>
      <div className="flex-grow overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className="font-semibold">
                  {col.header}
                </TableHead>
              ))}
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                {columns.map((col) => (
                  <TableCell
                    key={`${row.id}-${col.key}`}
                    onClick={() => handleCellClick(row.id, col.key, row[col.key])}
                    className={col.editable ? "cursor-pointer hover:bg-muted/50" : ""}
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
                      <span className="text-sm">{String(row[col.key] ?? '')}</span>
                    )}
                  </TableCell>
                ))}
                <TableCell className="text-right">
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
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DataGrid;
