
"use client";

import React, { useState, useEffect, useRef } from 'react';
import AppHeader from '@/components/app-header';
import PdfViewer from '@/components/pdf-viewer';
import DataGrid from '@/components/data-grid';
import SmartMapper from '@/components/smart-mapper';
import type { DataRow, ColumnDefinition } from '@/types';
import { useToast } from "@/hooks/use-toast";

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

const MIN_PANEL_PERCENTAGE = 20; // Minimum percentage for the PDF panel
const MAX_PANEL_PERCENTAGE = 80; // Maximum percentage for the PDF panel
const RESIZE_HANDLE_WIDTH = 8; // px

export default function PdfDataEditorPage() {
  const [structuredData, setStructuredData] = useState<DataRow[]>(initialData);
  // initialColumns will be the source of truth for all available columns
  // displayedGridColumns will be the subset of columns actually rendered in DataGrid
  const [displayedGridColumns, setDisplayedGridColumns] = useState<ColumnDefinition[]>(initialColumns);
  const [selectedPdfElementText, setSelectedPdfElementText] = useState<string | null>(null);
  const { toast } = useToast();

  const mainContainerRef = useRef<HTMLElement>(null);
  const [pdfPanelPercent, setPdfPanelPercent] = useState(40); // Initial percentage for PDF panel
  const [isResizing, setIsResizing] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const dataTableColumnNamesForMapper = initialColumns.map(col => col.key).filter(key => key !== 'id');

  useEffect(() => {
    const updateLayoutConfig = () => {
      const newIsMobile = window.innerWidth < 768; // Tailwind 'md' breakpoint
      setIsMobileLayout(newIsMobile);
      if (mainContainerRef.current) {
        setContainerWidth(mainContainerRef.current.offsetWidth);
      }
    };
    updateLayoutConfig();
    window.addEventListener('resize', updateLayoutConfig);
    return () => window.removeEventListener('resize', updateLayoutConfig);
  }, []);

  const handleMouseDownOnResizeHandle = (e: React.MouseEvent) => {
    if (isMobileLayout) return;
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (isMobileLayout) {
      setIsResizing(false); // Stop resizing if layout changes to mobile
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !mainContainerRef.current) return;

      const containerRect = mainContainerRef.current.getBoundingClientRect();
      const mouseXRelative = e.clientX - containerRect.left;
      
      // Total width available for panels is container width minus handle width
      const totalPanelWidth = containerRect.width - RESIZE_HANDLE_WIDTH;
      if (totalPanelWidth <= 0) return;

      let newPdfPanelPercent = (mouseXRelative / totalPanelWidth) * 100;
      
      // Adjust newPdfPanelPercent to be for its share of totalPanelWidth
      // If mouseXRelative is for the left edge of handle, then that's the width of pdf panel
      // newPdfPanelPercent = (mouseXRelative / totalPanelWidth) * 100;
      // No, mouseXRelative is fine, the percentage is of the total width that *panels* can occupy
      // The actual width of PDF panel is newPdfPanelPercent/100 * totalPanelWidth
      // We are setting pdfPanelPercent which is a conceptual split.
      // The flex-basis will be set using this percent relative to 100% of available space for that panel.
      // Let's simplify: pdfPanelPercent is the percentage of (container width - handle_width) for the left panel.

      const effectiveMouseX = e.clientX - containerRect.left;
      let newPercent = (effectiveMouseX / (containerRect.width - RESIZE_HANDLE_WIDTH)) * 100;
      newPercent = Math.max(MIN_PANEL_PERCENTAGE, Math.min(MAX_PANEL_PERCENTAGE, newPercent));
      setPdfPanelPercent(newPercent);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, isMobileLayout]);

  useEffect(() => {
    if (isMobileLayout) {
      setDisplayedGridColumns(initialColumns);
      setPdfPanelPercent(40); // Reset to default for mobile if needed
      return;
    }
    if (containerWidth === 0) {
      setDisplayedGridColumns(initialColumns);
      return;
    }

    const effectiveContainerWidth = containerWidth - RESIZE_HANDLE_WIDTH;
    const dataGridPanelWidthPx = effectiveContainerWidth * ((100 - pdfPanelPercent) / 100);

    let newColsToShow: ColumnDefinition[];
    const fieldNameCol = initialColumns.find(c => c.key === 'fieldName');
    const fieldValueCol = initialColumns.find(c => c.key === 'fieldValue');
    const categoryCol = initialColumns.find(c => c.key === 'category');
    const notesCol = initialColumns.find(c => c.key === 'notes');

    if (dataGridPanelWidthPx < 350) {
      newColsToShow = fieldNameCol ? [fieldNameCol] : initialColumns.slice(0, 1);
    } else if (dataGridPanelWidthPx < 550) {
      newColsToShow = [fieldNameCol, fieldValueCol].filter(Boolean) as ColumnDefinition[];
      if (newColsToShow.length === 0 && initialColumns.length > 0) newColsToShow = initialColumns.slice(0, Math.min(2, initialColumns.length));
    } else if (dataGridPanelWidthPx < 750) {
      newColsToShow = [fieldNameCol, fieldValueCol, categoryCol].filter(Boolean) as ColumnDefinition[];
      if (newColsToShow.length === 0 && initialColumns.length > 0) newColsToShow = initialColumns.slice(0, Math.min(3, initialColumns.length));
    } else {
      newColsToShow = initialColumns;
    }
    setDisplayedGridColumns(newColsToShow);

  }, [pdfPanelPercent, isMobileLayout, containerWidth, initialColumns]);


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
    const csvData = convertToCsv(structuredData, initialColumns); // Export all columns, not just visible
    downloadCsv(csvData, 'edited_data');
    toast({ title: "Exported as CSV", description: "Data has been downloaded as CSV file." });
  };
  
  const handleMappingApplied = (pdfText: string, mappedColumn: string) => {
    toast({
      title: "Mapping Applied (Simulation)",
      description: `Rule created: If PDF shows "${pdfText.substring(0,20)}...", map to column "${mappedColumn}".`,
    });
  };

  const leftPanelStyle: React.CSSProperties = isMobileLayout ? {} : {
    flexBasis: `${pdfPanelPercent}%`,
    minWidth: 0, // Important for flex shrinking
    overflow: 'hidden', // Prevent content from breaking layout
  };

  const rightPanelStyle: React.CSSProperties = isMobileLayout ? {} : {
    flexBasis: `${100 - pdfPanelPercent}%`,
    minWidth: 0, // Important for flex shrinking
    overflow: 'hidden', // Prevent content from breaking layout
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader
        onExportCsv={handleExportCsv}
        onExportJson={handleExportJson}
      />
      <main 
        ref={mainContainerRef} 
        className={`flex-grow container mx-auto px-4 py-6 flex ${isMobileLayout ? 'flex-col gap-6' : 'flex-row'}`}
      >
        <div 
          className={`flex flex-col gap-6 ${isMobileLayout ? 'w-full' : ''}`} 
          style={leftPanelStyle}
        >
          <PdfViewer onElementSelect={handlePdfElementSelect} selectedElementText={selectedPdfElementText} />
          <SmartMapper
            selectedPdfText={selectedPdfElementText}
            dataTableColumns={dataTableColumnNamesForMapper}
            onMappingApplied={handleMappingApplied}
          />
        </div>

        {!isMobileLayout && (
          <div
            onMouseDown={handleMouseDownOnResizeHandle}
            className="group cursor-col-resize flex items-center justify-center"
            style={{ width: `${RESIZE_HANDLE_WIDTH}px`, flexShrink: 0 }}
            title="Drag to resize panels"
          >
            <div className="w-1 h-10 bg-border group-hover:bg-primary/40 transition-colors rounded-full"></div>
          </div>
        )}

        <div 
          className={`${isMobileLayout ? 'w-full' : ''} flex flex-col`} // Ensure DataGrid can be h-full
          style={rightPanelStyle}
        >
          <DataGrid
            data={structuredData}
            columns={displayedGridColumns}
            setData={handleDataUpdate}
          />
        </div>
      </main>
      <footer className="text-center py-4 border-t text-sm text-muted-foreground">
        PDF Data Editor - Powered by Next.js and Firebase Genkit
      </footer>
      {isResizing && (
        <div className="fixed inset-0 z-50 cursor-col-resize" /> /* Overlay to catch mouse events globally */
      )}
    </div>
  );
}

