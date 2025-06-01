
"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface PdfElement {
  id: string;
  text: string;
  position: { 
    top: string; 
    left: string; 
    width?: string; 
    textAlign?: CanvasTextAlign;
    transform?: string; 
  };
}

// Updated mock elements to look more like an engineering drawing
const mockPdfElements: PdfElement[] = [
  { id: 'title-block-project', text: 'PROJECT: Advanced Data Extraction System', position: { top: '88%', left: '60%', width: '35%', textAlign: 'right' } },
  { id: 'title-block-drawnby', text: 'DRAWN BY: AI Prototyper Unit', position: { top: '91%', left: '60%', width: '35%', textAlign: 'right' } },
  { id: 'title-block-date', text: `DATE: ${new Date().toISOString().split('T')[0]}`, position: { top: '94%', left: '60%', width: '35%', textAlign: 'right' } },
  { id: 'title-block-sheet', text: 'SHEET: M-001', position: { top: '88%', left: '5%', width: '20%' } },
  { id: 'title-block-revision', text: 'REV: 02', position: { top: '91%', left: '5%', width: '10%' } },
  { id: 'title-block-scale', text: 'SCALE: N.T.S.', position: { top: '94%', left: '5%', width: '15%' } },
  
  { id: 'data-point-1-pos', text: 'Поз.: П1', position: { top: '10%', left: '5%' } },
  { id: 'data-point-1-name', text: 'Наименование: ИТП', position: { top: '10%', left: '15%' } },
  { id: 'data-point-1-type', text: 'Тип: Кан.вент. IP54, FRC 60-30', position: { top: '10%', left: '40%'} },
  { id: 'data-point-1-qty', text: 'Кол-во: 1', position: { top: '10%', left: '75%'} },

  { id: 'data-point-2-pos', text: 'Поз.: П2', position: { top: '15%', left: '5%' } },
  { id: 'data-point-2-name', text: 'Наименование: Помещения охраны', position: { top: '15%', left: '15%' } },
  { id: 'data-point-2-type', text: 'Тип: Кан.вент. IP54, KVR 100/1', position: { top: '15%', left: '40%' } },
  { id: 'data-point-2-qty', text: 'Кол-во: 1', position: { top: '15%', left: '75%'} },
  
  { id: 'annotation-1', text: 'SECTION A-A (DETAIL)', position: { top: '30%', left: '60%' } },
  { id: 'dimension-1', text: 'Overall Height: 1200mm ±0.5', position: { top: '50%', left: '10%', width: '25%' } },
  { id: 'note-1', text: 'Note: All dimensions in mm unless otherwise specified. Refer to spec. XYZ-001 for tolerances.', position: { top: '80%', left: '5%', width: '50%' } },

  { id: 'page-indicator', text: 'MOCKUP VIEW (NO PDF LOADED)', position: { top: '2%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' } },
];


interface PdfViewerProps {
  onElementSelect: (text: string) => void;
  selectedElementText: string | null;
  loadedPdfName?: string | null;
  pdfPageImages?: string[] | null; 
  currentPageNum?: number;
  totalPdfPages?: number;
  onNextPage?: () => void;
  onPrevPage?: () => void;
  isProcessingPdf?: boolean;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ 
  onElementSelect, 
  selectedElementText, 
  loadedPdfName, 
  pdfPageImages,
  currentPageNum = 1,
  totalPdfPages = 0,
  onNextPage,
  onPrevPage,
  isProcessingPdf 
}) => {
  const viewerTitle = loadedPdfName 
    ? `PDF Viewer - ${loadedPdfName}`
    : "PDF Viewer (Mock-up)";

  const showMockContent = !isProcessingPdf && (!pdfPageImages || pdfPageImages.length === 0);
  const currentImageToDisplay = pdfPageImages && pdfPageImages.length > 0 && currentPageNum > 0 && currentPageNum <= pdfPageImages.length 
    ? pdfPageImages[currentPageNum - 1] 
    : null;

  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center text-lg font-semibold">
          <FileText className="w-5 h-5 mr-2 text-primary" />
          {viewerTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-2 bg-muted/30 relative overflow-auto flex items-center justify-center">
        {isProcessingPdf ? (
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p>Processing PDF pages...</p>
          </div>
        ) : currentImageToDisplay ? (
          <div className="w-full h-full relative bg-gray-100 rounded-md shadow-inner aspect-[8/11]">
            <Image
              src={currentImageToDisplay}
              alt={loadedPdfName ? `Page ${currentPageNum} of ${loadedPdfName}` : "Rendered PDF Page"}
              layout="fill"
              objectFit="contain"
              data-ai-hint="pdf page content"
            />
          </div>
        ) : showMockContent ? (
          // Fallback to mock-up if no PDF image is loaded/processed
          <div className="w-full h-full relative bg-gray-100 rounded-md shadow-inner aspect-[8/11]">
            <Image
              src="https://placehold.co/800x1100.png?text=Engineering+Drawing+Mock-up" 
              alt="Engineering Drawing Mockup"
              layout="fill"
              objectFit="contain"
              className="opacity-70"
              data-ai-hint="technical drawing blueprint"
              priority
            />
            <div className="absolute inset-0 w-full h-full"> 
              {mockPdfElements.map((element) => (
                <div
                  key={element.id}
                  onClick={() => onElementSelect(element.text)}
                  className={`py-0.5 px-1 cursor-pointer border border-transparent rounded-sm transition-all duration-150 ease-in-out
                    ${selectedElementText === element.text 
                      ? 'bg-accent/80 text-accent-foreground ring-1 ring-primary shadow-md' 
                      : 'bg-black/10 text-black hover:bg-accent/40 hover:border-primary/50 hover:shadow-sm'}
                    absolute text-[8px] md:text-[10px] leading-tight backdrop-blur-[1px]`}
                  style={{ 
                    top: element.position.top, 
                    left: element.position.left, 
                    width: element.position.width || 'auto',
                    transform: element.position.transform,
                    textAlign: element.position.textAlign,
                  }}
                  data-ai-hint="engineering annotation dimension"
                >
                  {element.text}
                </div>
              ))}
            </div>
          </div>
        ) : (
           <div className="flex flex-col items-center justify-center text-muted-foreground">
             <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
             <p>No PDF loaded or failed to process.</p>
             <p className="text-xs">Use "Load PDF" button in the header.</p>
           </div>
        )}
      </CardContent>
      {pdfPageImages && pdfPageImages.length > 0 && !isProcessingPdf && (
        <CardFooter className="p-2 border-t flex items-center justify-between">
          <Button 
            onClick={onPrevPage} 
            disabled={currentPageNum <= 1}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPageNum} of {totalPdfPages}
          </span>
          <Button 
            onClick={onNextPage} 
            disabled={currentPageNum >= totalPdfPages}
            variant="outline"
            size="sm"
          >
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default PdfViewer;

