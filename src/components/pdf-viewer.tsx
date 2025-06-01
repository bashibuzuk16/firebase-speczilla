
"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from 'lucide-react';
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
  { id: 'page-info', text: 'SHEET 1 OF 5 - GENERAL ASSEMBLY', position: { top: '2%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' } },
  { id: 'title-block-project', text: 'PROJECT: AUTONOMOUS DRONE CHASSIS', position: { top: '90%', left: '60%' } },
  { id: 'title-block-drawnby', text: 'DRAWN BY: A.I. Modeler', position: { top: '92%', left: '60%' } },
  { id: 'title-block-date', text: 'DATE: 2024-07-15', position: { top: '94%', left: '60%' } },
  { id: 'title-block-scale', text: 'SCALE: 1:10', position: { top: '90%', left: '85%' } },
  { id: 'title-block-rev', text: 'REV: C', position: { top: '92%', left: '85%' } },
  { id: 'annotation-1', text: 'Callout A: Mounting Hole (M3)', position: { top: '15%', left: '10%' } },
  { id: 'dimension-1', text: 'Overall Length: 450mm ±0.5', position: { top: '30%', left: '35%' } },
  { id: 'dimension-2', text: 'Overall Width: 300mm ±0.5', position: { top: '50%', left: '10%' } },
  { id: 'note-1', text: 'Note: All sharp edges to be deburred.', position: { top: '80%', left: '5%' } },
  { id: 'part-label-1', text: 'Item 1: Main Frame (AL-6061)', position: { top: '55%', left: '50%' } },
  { id: 'section-view-label', text: 'SECTION B-B', position: { top: '70%', left: '75%' } },
];


interface PdfViewerProps {
  onElementSelect: (text: string) => void;
  selectedElementText: string | null;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ onElementSelect, selectedElementText }) => {
  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center text-lg font-semibold">
          <FileText className="w-5 h-5 mr-2 text-primary" />
          Engineering Drawing Viewer (Mock-up)
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-2 bg-muted/30 relative overflow-auto">
        <div className="w-full h-full relative bg-gray-100 rounded-md shadow-inner aspect-[8/11]"> {/* Aspect ratio for portrait drawing */}
          <Image
            src="https://placehold.co/800x1100.png" // Placeholder for engineering drawing
            alt="Engineering Drawing Mockup"
            layout="fill"
            objectFit="contain" // Use "contain" to see the whole drawing, "cover" to fill
            className="opacity-70"
            data-ai-hint="technical drawing blueprint"
            priority
          />
          {/* Overlay for clickable elements */}
          <div className="absolute inset-0 w-full h-full"> 
            {mockPdfElements.map((element) => (
              <div
                key={element.id}
                onClick={() => onElementSelect(element.text)}
                className={`py-0.5 px-1 cursor-pointer border border-transparent rounded-sm transition-all duration-150 ease-in-out
                  ${selectedElementText === element.text 
                    ? 'bg-accent/80 text-accent-foreground ring-1 ring-primary shadow-md' 
                    : 'bg-black/10 text-black hover:bg-accent/40 hover:border-primary/50 hover:shadow-sm'}
                  absolute text-[10px] leading-tight backdrop-blur-[1px]`} // Smaller text, subtle background
                style={{ 
                  top: element.position.top, 
                  left: element.position.left, 
                  width: element.position.width || 'auto',
                  transform: element.position.transform,
                  textAlign: element.position.textAlign,
                }}
                data-ai-hint="engineering annotation dimension" // More specific hint
              >
                {element.text}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PdfViewer;

