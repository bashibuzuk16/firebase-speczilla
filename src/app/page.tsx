"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import AppHeader from '@/components/app-header';
import PdfViewer from '@/components/pdf-viewer';
import DataGrid from '@/components/data-grid';
import SmartMapper from '@/components/smart-mapper';
import { usePdfApi } from '@/lib/api';
import type { DataRow, ColumnDefinition } from '@/types';
import { useToast } from "@/hooks/use-toast";

// Динамический импорт PDF.js только на клиенте
let pdfjsLib: any = null;

const defaultInitialData: DataRow[] = [
  {
    id: "gen-1721161200000-0",
    pos: "П1",
    name: "ИТП",
    type_original: "Кан.вент. IP54, FRC 60-30",
    code: "",
    manufacturer: "",
    measure: "",
    quantity: "1",
    weight: "",
    note: "",
    article: "",
    rag_text: "итп категория кан.вент. ip54 frc 60-30",
    artikul: "",
    category: "кан.вент.",
    sub_category: "",
    description: "ip54 frc 60-30",
    material: "",
    type_extracted: "",
    connection_type: "",
    size: "",
    allies: "",
    function: "",
    Artikul_fact: "",
    potential_artikuls: [],
    manual_check_needed: true,
    matching_thoughts: "Не найдено соответствий. Позиция строки содержит информацию об ИТП, а в справочнике артикулов нет подходящих записей.",
    found_in_pdf_on_pages: [6, 7]
  },
  {
    id: "gen-1721161200000-1",
    pos: "П2",
    name: "Помещения охраны",
    type_original: "Кан.вент. IP54, KVR 100/1",
    code: "",
    manufacturer: "",
    measure: "",
    quantity: "1",
    weight: "",
    note: "",
    article: "",
    rag_text: "помещения охраны категория кан.вент. ip54 kvr 100/1",
    artikul: "100/1",
    category: "кан.вент.",
    sub_category: "",
    description: "помещения охраны",
    material: "",
    type_extracted: "kvr",
    connection_type: "",
    size: "",
    allies: "",
    function: "",
    Artikul_fact: "",
    potential_artikuls: [],
    manual_check_needed: true,
    matching_thoughts: "The item is a 'Кан.вент. IP54, KVR 100/1'. There are no matches in the reference with the same type and size. Therefore, manual check is needed.",
    found_in_pdf_on_pages: [6, 7]
  },
];

const defaultInitialColumns: ColumnDefinition[] = [
  { key: 'pos', header: 'POS', editable: true },
  { key: 'name', header: 'Name', editable: true },
  { key: 'type_original', header: 'Type Original', editable: true },
  { key: 'code', header: 'Code', editable: true },
  { key: 'manufacturer', header: 'Manufacturer', editable: true },
  { key: 'measure', header: 'Measure', editable: true },
  { key: 'quantity', header: 'Quantity', editable: true },
  { key: 'weight', header: 'Weight', editable: true },
  { key: 'note', header: 'Note', editable: true },
  { key: 'article', header: 'Article', editable: true },
  { key: 'rag_text', header: 'RAG Text', editable: true },
  { key: 'artikul', header: 'Artikul', editable: true },
  { key: 'category', header: 'Category', editable: true },
  { key: 'sub_category', header: 'Sub Category', editable: true },
  { key: 'description', header: 'Description', editable: true },
  { key: 'material', header: 'Material', editable: true },
  { key: 'type_extracted', header: 'Type Extracted', editable: true },
  { key: 'connection_type', header: 'Connection Type', editable: true },
  { key: 'size', header: 'Size', editable: true },
  { key: 'allies', header: 'Allies', editable: true },
  { key: 'function', header: 'Function', editable: true },
  { key: 'Artikul_fact', header: 'Artikul Fact', editable: true },
  { key: 'potential_artikuls', header: 'Potential Artikuls', editable: true },
  { key: 'manual_check_needed', header: 'Manual Check Needed', editable: true },
  { key: 'matching_thoughts', header: 'Matching Thoughts', editable: true },
  { key: 'found_in_pdf_on_pages', header: 'Found In PDF (Pages)', editable: true },
];

const MIN_PANEL_PERCENTAGE = 20;
const MAX_PANEL_PERCENTAGE = 80;
const RESIZE_HANDLE_WIDTH = 8;

function generateColumnsFromJson(jsonData: DataRow[]): ColumnDefinition[] {
  if (!jsonData || jsonData.length === 0) {
    return defaultInitialColumns;
  }
  const firstRow = jsonData[0];
  return Object.keys(firstRow).map(key => ({
    key,
    header: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 
    editable: true, 
  }));
}

// Инициализация PDF.js на клиенте
const initPdfJs = async () => {
  if (typeof window !== 'undefined' && !pdfjsLib) {
    try {
      pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      console.log('PDF.js initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PDF.js:', error);
    }
  }
};

export default function PdfDataEditorPage() {
  const [structuredData, setStructuredData] = useState<DataRow[]>(defaultInitialData);
  const [currentColumns, setCurrentColumns] = useState<ColumnDefinition[]>(defaultInitialColumns);
  const [selectedPdfElementText, setSelectedPdfElementText] = useState<string | null>(null);
  const { toast } = useToast();

  // API интеграция
  const { processPdf, healthCheck } = usePdfApi();
  const [apiConnected, setApiConnected] = useState<boolean>(false);

  // Refs
  const mainContainerRef = useRef<HTMLElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  
  // PDF состояния
  const [loadedPdfName, setLoadedPdfName] = useState<string | null>(null);
  const [pdfPageImages, setPdfPageImages] = useState<string[] | null>(null);
  const [currentPageNum, setCurrentPageNum] = useState<number>(1);
  const [totalPdfPages, setTotalPdfPages] = useState<number>(0);
  const [isProcessingPdf, setIsProcessingPdf] = useState<boolean>(false);

  // Layout состояния
  const [pdfPanelPercent, setPdfPanelPercent] = useState(40);
  const [isResizing, setIsResizing] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  // Колонки и навигация
  const [currentColumnStartIndex, setCurrentColumnStartIndex] = useState(0);
  const [numColumnsAllowedByWidth, setNumColumnsAllowedByWidth] = useState(currentColumns.length);

  const dataTableColumnNamesForMapper = useMemo(() => currentColumns.map(col => col.key).filter(key => key !== 'id'), [currentColumns]);
  const allGridColumnKeys = useMemo(() => currentColumns.map(col => col.key), [currentColumns]);
  const [displayedGridColumns, setDisplayedGridColumns] = useState<ColumnDefinition[]>(currentColumns);

  // Инициализация PDF.js и проверка API при загрузке
  useEffect(() => {
    // Инициализируем PDF.js
    initPdfJs();

    // Проверяем API
    const checkApiConnection = async () => {
      try {
        const connected = await healthCheck();
        setApiConnected(connected);
        if (!connected) {
          toast({
            title: "API не доступен",
            description: "Сервер обработки PDF недоступен. Работаем в режиме просмотра данных.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "API подключен",
            description: "Сервер обработки PDF готов к работе.",
          });
        }
      } catch (error) {
        console.error('Error checking API connection:', error);
        setApiConnected(false);
      }
    };

    checkApiConnection();
  }, [healthCheck, toast]);

  // Layout обновления
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

  // Resize handle
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

  // Column width calculation
  useEffect(() => {
    if (isMobileLayout) {
      setNumColumnsAllowedByWidth(currentColumns.length);
      setPdfPanelPercent(40); 
      return;
    }
    if (containerWidth === 0 && !isMobileLayout) { 
      setNumColumnsAllowedByWidth(currentColumns.length);
      return;
    }

    const effectiveContainerWidth = containerWidth - RESIZE_HANDLE_WIDTH;
    if (effectiveContainerWidth <= 0) {
        setNumColumnsAllowedByWidth(1); 
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
    } else if (dataGridPanelWidthPx < 950) {
      newNumColsAllowed = 4;
    } else if (dataGridPanelWidthPx < 1150) {
      newNumColsAllowed = 5;
    } else {
      newNumColsAllowed = Math.min(6, currentColumns.length);
    }
    setNumColumnsAllowedByWidth(newNumColsAllowed);
  }, [pdfPanelPercent, isMobileLayout, containerWidth, currentColumns.length]);

  useEffect(() => {
    setCurrentColumnStartIndex(prevStartIndex => {
      const maxPossibleIndex = currentColumns.length - numColumnsAllowedByWidth;
      if (maxPossibleIndex <= 0) return 0;
      return Math.max(0, Math.min(prevStartIndex, maxPossibleIndex));
    });
  }, [numColumnsAllowedByWidth, currentColumns.length]);

  useEffect(() => {
    if (numColumnsAllowedByWidth <= 0 || currentColumns.length === 0) { 
        setDisplayedGridColumns([]);
        return;
    }
    const endIndex = currentColumnStartIndex + numColumnsAllowedByWidth;
    const actualEndIndex = Math.min(endIndex, currentColumns.length);
    setDisplayedGridColumns(currentColumns.slice(currentColumnStartIndex, actualEndIndex));
  }, [currentColumnStartIndex, numColumnsAllowedByWidth, currentColumns]);

  // Handlers
  const handlePdfElementSelect = (text: string) => {
    if (pdfPageImages && pdfPageImages.length > 0) {
      setSelectedPdfElementText(null);
      toast({
        title: "Info",
        description: "Выбор текста из mock элементов отключен при просмотре загруженного PDF.",
      });
      return;
    }
    setSelectedPdfElementText(text);
    toast({
      title: "PDF элемент выбран",
      description: `Текст: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
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
        let value = row[col.key];
        if (Array.isArray(value)) {
          value = value.join(';'); 
        } else if (value === null || value === undefined) {
          value = '';
        } else {
          value = String(value);
        }
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
    toast({ title: "Экспорт JSON", description: "Данные экспортированы в JSON файл." });
  };

  const handleExportCsv = () => {
    const csvData = convertToCsv(structuredData, currentColumns); 
    downloadCsv(csvData, 'edited_data');
    toast({ title: "Экспорт CSV", description: "Данные экспортированы в CSV файл." });
  };

  const handleLoadPdfClick = () => {
    if (!apiConnected) {
      toast({
        title: "API недоступен",
        description: "Сервер обработки PDF недоступен. Загрузка PDF временно невозможна.",
        variant: "destructive",
      });
      return;
    }
    pdfInputRef.current?.click();
  };

  const handleLoadJsonClick = () => {
    jsonInputRef.current?.click();
  };

  const handlePdfFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Инициализируем PDF.js если еще не сделали
    await initPdfJs();
    if (!pdfjsLib) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить PDF библиотеку",
        variant: "destructive",
      });
      return;
    }

    if (!apiConnected) {
      toast({
        title: "API недоступен",
        description: "Не удается подключиться к серверу обработки PDF.",
        variant: "destructive",
      });
      return;
    }

    setLoadedPdfName(file.name);
    setIsProcessingPdf(true);
    setPdfPageImages(null); 
    setCurrentPageNum(1);
    setTotalPdfPages(0);
    setSelectedPdfElementText(null); 

    toast({
      title: "Обработка PDF...",
      description: `Загружается "${file.name}". Это может занять некоторое время.`,
    });

    try {
      // Сначала рендерим PDF для просмотра
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      setTotalPdfPages(pdf.numPages);
      const pageImagePromises: Promise<string>[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const desiredWidth = 800; 
        const viewport = page.getViewport({ scale: 1 });
        const scale = desiredWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
            throw new Error("Could not get canvas context for page " + i);
        }

        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;

        await page.render({ canvasContext: context, viewport: scaledViewport }).promise;
        pageImagePromises.push(Promise.resolve(canvas.toDataURL('image/png')));
      }
      
      const resolvedPageImages = await Promise.all(pageImagePromises);
      setPdfPageImages(resolvedPageImages);
      setCurrentPageNum(1);

      // Теперь обрабатываем через API
      const result = await processPdf(file);

      if (result.success && result.data) {
        const newColumns = generateColumnsFromJson(result.data);
        setCurrentColumns(newColumns);
        setStructuredData(result.data);
        setCurrentColumnStartIndex(0);

        toast({
          title: "PDF обработан успешно",
          description: `${pdf.numPages} страниц обработано. Извлечено ${result.data.length} записей${result.processingTime ? ` за ${result.processingTime}с` : ''}.`,
        });
      } else {
        throw new Error(result.error || 'Неизвестная ошибка при обработке PDF');
      }
    } catch (error) {
      console.error("Error processing PDF:", error);
      setPdfPageImages(null);
      toast({
        title: "Ошибка обработки PDF",
        description: `Не удалось обработать PDF "${file.name}". Ошибка: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessingPdf(false);
    }

    if (pdfInputRef.current) pdfInputRef.current.value = ""; 
  };

  const handleNextPage = () => {
    setCurrentPageNum((prev) => Math.min(prev + 1, totalPdfPages));
  };

  const handlePrevPage = () => {
    setCurrentPageNum((prev) => Math.max(prev - 1, 1));
  };

  const handleJsonFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const jsonData = JSON.parse(text) as DataRow[];
          
          const processedJsonData = jsonData.map((row, index) => ({
            ...row,
            id: row.id || `gen-${Date.now()}-${index}` 
          }));

          setStructuredData(processedJsonData);
          const newColumns = generateColumnsFromJson(processedJsonData);
          setCurrentColumns(newColumns);
          setCurrentColumnStartIndex(0); 
          toast({
            title: "JSON данные загружены",
            description: `Успешно загружены данные из "${file.name}".`,
          });
        } catch (error) {
          console.error("Error parsing JSON:", error);
          toast({
            title: "Ошибка загрузки JSON",
            description: `Не удалось разобрать JSON из "${file.name}". Проверьте формат файла.`,
            variant: "destructive",
          });
        }
      };
      reader.onerror = () => {
        toast({
            title: "Ошибка чтения файла",
            description: `Не удалось прочитать файл "${file.name}".`,
            variant: "destructive",
          });
      };
      reader.readAsText(file);
    }
    if (jsonInputRef.current) jsonInputRef.current.value = ""; 
  };

  const handleMappingApplied = (pdfText: string, mappedColumn: string) => {
    toast({
      title: "Маппинг применен (симуляция)",
      description: `Правило создано: Если PDF содержит "${pdfText.substring(0,20)}...", сопоставлять с колонкой "${mappedColumn}".`,
    });
  };

  const handleNextColumns = () => {
    setCurrentColumnStartIndex(prev => {
      if (numColumnsAllowedByWidth <= 0) return prev;
      const maxStart = currentColumns.length - numColumnsAllowedByWidth;
      if (maxStart < 0) return 0; 
      return Math.min(prev + 1, maxStart);
    });
  };

  const handlePrevColumns = () => {
    setCurrentColumnStartIndex(prev => Math.max(0, prev - 1));
  };

  const canGoNext = numColumnsAllowedByWidth > 0 && currentColumnStartIndex < currentColumns.length - numColumnsAllowedByWidth;
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
        onLoadPdfClick={handleLoadPdfClick}
        onLoadJsonClick={handleLoadJsonClick}
        apiConnected={apiConnected}
      />
      
      <input
        type="file"
        ref={pdfInputRef}
        onChange={handlePdfFileChange}
        accept=".pdf"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={jsonInputRef}
        onChange={handleJsonFileChange}
        accept=".json,application/json"
        style={{ display: 'none' }}
      />
      
      <main
        ref={mainContainerRef}
        className={`flex-grow container mx-auto px-4 py-6 flex ${isMobileLayout ? 'flex-col gap-6' : 'flex-row'}`}
      >
        <div
          className={`flex flex-col gap-6 ${isMobileLayout ? 'w-full' : ''}`}
          style={leftPanelStyle}
        >
          <PdfViewer 
            onElementSelect={handlePdfElementSelect} 
            selectedElementText={selectedPdfElementText}
            loadedPdfName={loadedPdfName}
            pdfPageImages={pdfPageImages}
            currentPageNum={currentPageNum}
            totalPdfPages={totalPdfPages}
            onNextPage={handleNextPage}
            onPrevPage={handlePrevPage}
            isProcessingPdf={isProcessingPdf}
          />
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
            title="Перетащите для изменения размера панелей"
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
            allColumnKeys={allGridColumnKeys}
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
        {apiConnected && <span className="ml-2 text-green-600">● API Подключен</span>}
        {!apiConnected && <span className="ml-2 text-red-600">● API Отключен</span>}
      </footer>
      
      {isResizing && (
        <div className="fixed inset-0 z-50 cursor-col-resize" />
      )}
    </div>
  );
}