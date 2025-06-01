
"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Loader2 } from 'lucide-react';
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

const mockPdfElements: PdfElement[] = [
  { id: 'title-block-project', text: 'PROJECT: PDF Data Extraction Tool', position: { top: '88%', left: '65%', width: '30%' } },
  { id: 'title-block-drawnby', text: 'DRAWN BY: AI Prototyper', position: { top: '91%', left: '65%' } },
  { id: 'title-block-date', text: 'DATE: 2024-07-16', position: { top: '94%', left: '65%' } },
  { id: 'title-block-sheet', text: 'SHEET: 1 OF 1', position: { top: '88%', left: '5%', width: '15%' } },
  { id: 'title-block-scale', text: 'SCALE: NTS', position: { top: '91%', left: '85%' } },
  
  { id: 'data-point-1-pos', text: 'Поз.: П1', position: { top: '10%', left: '5%' } },
  { id: 'data-point-1-name', text: 'Наименование: ИТП', position: { top: '10%', left: '15%' } },
  { id: 'data-point-1-type', text: 'Тип: Кан.вент. IP54, FRC 60-30', position: { top: '10%', left: '40%'} },

  { id: 'data-point-2-pos', text: 'Поз.: П2', position: { top: '15%', left: '5%' } },
  { id: 'data-point-2-name', text: 'Наименование: Помещения охраны', position: { top: '15%', left: '15%' } },
  { id: 'data-point-2-type', text: 'Тип: Кан.вент. IP54, KVR 100/1', position: { top: '15%', left: '40%' } },
  
  { id: 'annotation-1', text: 'Section A-A', position: { top: '30%', left: '60%' } },
  { id: 'dimension-1', text: 'Overall Height: 1200mm', position: { top: '50%', left: '10%' } },
  { id: 'note-1', text: 'Note: All dimensions in mm unless otherwise specified.', position: { top: '80%', left: '5%', width: '40%' } },

  { id: 'page-1-indicator', text: 'PAGE 1 (Mock)', position: { top: '2%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' } },
];


interface PdfViewerProps {
  onElementSelect: (text: string) => void;
  selectedElementText: string | null;
  loadedPdfName?: string | null;
  pdfPageImage?: string | null; // Image data URL of the rendered PDF page
  isProcessingPdf?: boolean; // True if PDF is being processed
}

const PdfViewer: React.FC<PdfViewerProps> = ({ 
  onElementSelect, 
  selectedElementText, 
  loadedPdfName, 
  pdfPageImage,
  isProcessingPdf 
}) => {
  const viewerTitle = loadedPdfName 
    ? `PDF Viewer - ${loadedPdfName}`
    : "PDF Viewer (Mock-up)";

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
            <p>Processing PDF page...</p>
          </div>
        ) : pdfPageImage ? (
          <div className="w-full h-full relative bg-gray-100 rounded-md shadow-inner aspect-[8/11]">
            <Image
              src={pdfPageImage}
              alt={loadedPdfName ? `First page of ${loadedPdfName}` : "Rendered PDF Page"}
              layout="fill"
              objectFit="contain"
              data-ai-hint="pdf page content"
            />
          </div>
        ) : (
          // Fallback to mock-up if no PDF image is loaded/processed
          <div className="w-full h-full relative bg-gray-100 rounded-md shadow-inner aspect-[8/11]">
            <Image
              src="https://placehold.co/800x1100.png" 
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
                    absolute text-[10px] leading-tight backdrop-blur-[1px]`}
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
        )}
      </CardContent>
    </Card>
  );
};

export default PdfViewer;
