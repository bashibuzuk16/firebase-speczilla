"use client";

import React, { useState, useEffect } from 'react';
import AppHeader from '@/components/app-header';
import PdfViewer from '@/components/pdf-viewer';
import DataGrid from '@/components/data-grid';
import SmartMapper from '@/components/smart-mapper';
import type { DataRow, ColumnDefinition } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from '@/components/ui/scroll-area';

const initialData: DataRow[] = [
  { id: '1', fieldName: 'Invoice Number', fieldValue: 'INV-2024-001', category: 'Metadata', notes: 'Auto-generated' },
  { id: '2', fieldName: 'Client Name', fieldValue: 'Stellar Solutions Inc.', category: 'Client Details', notes: '' },
  { id: '3', fieldName: 'Issue Date', fieldValue: '2024-07-26', category: 'Dates', notes: 'Payment due in 30 days' },
  { id: '4', fieldName: 'Total Amount', fieldValue: '$2,500.00', category: 'Financials', notes: 'Includes 10% discount' },
  { id: '5', fieldName: 'Service Rendered', fieldValue: 'Web Development', category: 'Line Items', notes: 'Homepage redesign' },
];

const initialColumns: ColumnDefinition[] = [
  { key: 'fieldName', header: 'Field Name', editable: true },
  { key: 'fieldValue', header: 'Value', editable: true },
  { key: 'category', header: 'Category', editable: true },
  { key: 'notes', header: 'Notes', editable: true },
];


export default function PdfDataEditorPage() {
  const [structuredData, setStructuredData] = useState<DataRow[]>(initialData);
  const [columns, setColumns] = useState<ColumnDefinition[]>(initialColumns);
  const [selectedPdfElementText, setSelectedPdfElementText] = useState<string | null>(null);
  const { toast } = useToast();

  const dataTableColumnNames = columns.map(col => col.key).filter(key => key !== 'id');

  const handlePdfElementSelect = (text: string) => {
    setSelectedPdfElementText(text);
    toast({
      title: "PDF Element Selected",
      description: `Text: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
    });
  };

  const handleDataUpdate = (updatedData: DataRow[]) => {
    setStructuredData(updatedData);
  };

  const downloadJson = (data: any, filename: string) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `${filename}.json`;
    link.click();
  };

  const convertToCsv = (data: DataRow[], columnDefs: ColumnDefinition[]): string => {
    const headers = columnDefs.map(col => col.header).join(',');
    const rows = data.map(row => {
      return columnDefs.map(col => {
        const value = String(row[col.key] ?? '');
        // Escape commas and quotes
        return `"${value.replace(/"/g, '""')}"`;
      }).join(',');
    });
    return [headers, ...rows].join('\n');
  };

  const downloadCsv = (data: string, filename: string) => {
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJson = () => {
    downloadJson(structuredData, 'edited_data');
    toast({ title: "Exported as JSON", description: "Data has been downloaded as JSON file." });
  };

  const handleExportCsv = () => {
    const csvData = convertToCsv(structuredData, columns);
    downloadCsv(csvData, 'edited_data');
    toast({ title: "Exported as CSV", description: "Data has been downloaded as CSV file." });
  };
  
  const handleMappingApplied = (pdfText: string, mappedColumn: string) => {
    // This is a placeholder for actual mapping logic.
    // For example, you might want to update a specific row or pre-fill a field.
    toast({
      title: "Mapping Applied (Simulation)",
      description: `Rule created: If PDF shows "${pdfText.substring(0,20)}...", map to column "${mappedColumn}".`,
    });
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader
        onExportCsv={handleExportCsv}
        onExportJson={handleExportJson}
        // onLoadPdf={() => alert("PDF loading functionality placeholder")} 
      />
      <main className="flex-grow container mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/5 lg:w-1/3 flex flex-col gap-6">
          <PdfViewer onElementSelect={handlePdfElementSelect} selectedElementText={selectedPdfElementText} />
          <SmartMapper
            selectedPdfText={selectedPdfElementText}
            dataTableColumns={dataTableColumnNames}
            onMappingApplied={handleMappingApplied}
          />
        </div>
        <div className="w-full md:w-3/5 lg:w-2/3">
          <DataGrid
            data={structuredData}
            columns={columns}
            setData={handleDataUpdate}
          />
        </div>
      </main>
      <footer className="text-center py-4 border-t text-sm text-muted-foreground">
        PDF Data Editor - Powered by Next.js and Firebase Genkit
      </footer>
    </div>
  );
}
