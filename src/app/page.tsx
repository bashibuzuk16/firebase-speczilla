
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
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

const MIN_PANEL_PERCENTAGE = 20; 
const MAX_PANEL_PERCENTAGE = 80; 
const RESIZE_HANDLE_WIDTH = 8; // px

export default function PdfDataEditorPage() {
  const [structuredData, setStructuredData] = useState<DataRow[]>(initialData);
  const [displayedGridColumns, setDisplayedGridColumns] = useState<ColumnDefinition[]>(initialColumns);
  const [selectedPdfElementText, setSelectedPdfElementText] = useState<string | null>(null);
  const { toast } = useToast();

  const mainContainerRef = useRef<HTMLElement>(null);
  const [pdfPanelPercent, setPdfPanelPercent] = useState(40);
  const [isResizing, setIsResizing] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  // State for column pagination
  const [currentColumnStartIndex, setCurrentColumnStartIndex] = useState(0);
  const [numColumnsAllowedByWidth, setNumColumnsAllowedByWidth] = useState(initialColumns.length);

  const dataTableColumnNamesForMapper = useMemo(() => initialColumns.map(col => col.key).filter(key => key !== 'id'), [initialColumns]);

  useEffect(() => {
    const updateLayoutConfig = () => {
      const newIsMobile = window.innerWidth < 768; 
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
      setIsResizing(false); 
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !mainContainerRef.current) return;
      const containerRect = mainContainerRef.current.getBoundingClientRect();
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


  // Effect 1: Determine numColumnsAllowedByWidth based on panel size and layout
  useEffect(() => {
    if (isMobileLayout) {
      setNumColumnsAllowedByWidth(initialColumns.length);
      setPdfPanelPercent(40); // Reset to default for mobile
      return;
    }
    if (containerWidth === 0 && !isMobileLayout) { // ensure this doesn't run unnecessarily on mobile init
      setNumColumnsAllowedByWidth(initialColumns.length);
      return;
    }
    
    const effectiveContainerWidth = containerWidth - RESIZE_HANDLE_WIDTH;
    // Ensure dataGridPanelWidthPx is not calculated if containerWidth is 0 or effectiveContainerWidth is negative.
    if (effectiveContainerWidth <= 0) {
        setNumColumnsAllowedByWidth(1); // Show at least one column if panel is extremely small
        return;
    }
    const dataGridPanelWidthPx = effectiveContainerWidth * ((100 - pdfPanelPercent) / 100);

    let newNumColsAllowed: number;
    if (dataGridPanelWidthPx < 350) {
      newNumColsAllowed = 1;
    } else if (dataGridPanelWidthPx < 550) {
      newNumColsAllowed = 2;
    } else if (dataGridPanelWidthPx < 750) {
      newNumColsAllowed = 3;
    } else {
      newNumColsAllowed = initialColumns.length;
    }
    setNumColumnsAllowedByWidth(newNumColsAllowed);
  }, [pdfPanelPercent, isMobileLayout, containerWidth, initialColumns.length]);

  // Effect 2: Adjust currentColumnStartIndex when numColumnsAllowedByWidth changes
  useEffect(() => {
    setCurrentColumnStartIndex(prevStartIndex => {
      const maxPossibleIndex = initialColumns.length - numColumnsAllowedByWidth;
      // If all columns can be shown, or more slots than columns, start index must be 0.
      if (maxPossibleIndex <= 0) return 0; 
      return Math.max(0, Math.min(prevStartIndex, maxPossibleIndex));
    });
  }, [numColumnsAllowedByWidth, initialColumns.length]);

  // Effect 3: Update displayedGridColumns based on startIndex and numAllowed
  useEffect(() => {
    if (numColumnsAllowedByWidth <= 0) { // Handle edge case where no columns can be shown
        setDisplayedGridColumns([]);
        return;
    }
    const endIndex = currentColumnStartIndex + numColumnsAllowedByWidth;
    const actualEndIndex = Math.min(endIndex, initialColumns.length);
    setDisplayedGridColumns(initialColumns.slice(currentColumnStartIndex, actualEndIndex));
  }, [currentColumnStartIndex, numColumnsAllowedByWidth, initialColumns]);


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
    const csvData = convertToCsv(structuredData, initialColumns);
    downloadCsv(csvData, 'edited_data');
    toast({ title: "Exported as CSV", description: "Data has been downloaded as CSV file." });
  };
  
  const handleMappingApplied = (pdfText: string, mappedColumn: string) => {
    toast({
      title: "Mapping Applied (Simulation)",
      description: `Rule created: If PDF shows "${pdfText.substring(0,20)}...", map to column "${mappedColumn}".`,
    });
  };

  const handleNextColumns = () => {
    setCurrentColumnStartIndex(prev => {
      if (numColumnsAllowedByWidth <= 0) return prev;
      // Ensure new start index doesn't go beyond what's possible
      const maxStart = initialColumns.length - numColumnsAllowedByWidth;
      if (maxStart < 0) return 0; // Should not happen if numColumnsAllowedByWidth is well-behaved
      return Math.min(prev + 1, maxStart);
    });
  };

  const handlePrevColumns = () => {
    setCurrentColumnStartIndex(prev => Math.max(0, prev - 1));
  };

  const canGoNext = numColumnsAllowedByWidth > 0 && currentColumnStartIndex < initialColumns.length - numColumnsAllowedByWidth;
  const canGoPrev = currentColumnStartIndex > 0;

  const leftPanelStyle: React.CSSProperties = isMobileLayout ? {} : {
    flexBasis: `${pdfPanelPercent}%`,
    minWidth: 0, 
    overflow: 'hidden', 
  };

  const rightPanelStyle: React.CSSProperties = isMobileLayout ? {} : {
    flexBasis: `${100 - pdfPanelPercent}%`,
    minWidth: 0, 
    overflow: 'hidden',
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
          className={`${isMobileLayout ? 'w-full' : ''} flex flex-col`}
          style={rightPanelStyle}
        >
          <DataGrid
            data={structuredData}
            columns={displayedGridColumns}
            setData={handleDataUpdate}
            onNextColumns={handleNextColumns}
            onPrevColumns={handlePrevColumns}
            canGoNext={canGoNext}
            canGoPrev={canGoPrev}
            isMobileLayout={isMobileLayout}
          />
        </div>
      </main>
      <footer className="text-center py-4 border-t text-sm text-muted-foreground">
        PDF Data Editor - Powered by Next.js and Firebase Genkit
      </footer>
      {isResizing && (
        <div className="fixed inset-0 z-50 cursor-col-resize" />
      )}
    </div>
  );
}
