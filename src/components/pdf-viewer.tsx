"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from 'lucide-react';

interface PdfElement {
  id: string;
  text: string;
  position: { top: string; left: string; width?: string };
}

const mockPdfElements: PdfElement[] = [
  { id: 'el1', text: 'Invoice Number: INV-2024-001', position: { top: '20px', left: '20px', width: 'calc(100% - 40px)' } },
  { id: 'el2', text: 'Client Name: Stellar Solutions Inc.', position: { top: '60px', left: '20px', width: 'calc(100% - 40px)' } },
  { id: 'el3', text: 'Date: July 26, 2024', position: { top: '100px', left: '20px', width: 'calc(100% - 40px)' } },
  { id: 'el4', text: 'Total Amount: $2,500.00', position: { top: '140px', left: '20px', width: 'calc(100% - 40px)' } },
  { id: 'el5', text: 'Item: Web Development Services', position: { top: '180px', left: '40px', width: 'calc(100% - 60px)' } },
  { id: 'el6', text: 'Item: UI/UX Design Package', position: { top: '220px', left: '40px', width: 'calc(100% - 60px)' } },
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
          PDF Document Viewer
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-4 bg-gray-50 relative overflow-auto">
        <div className="w-full h-full border border-dashed border-gray-300 rounded-md p-2 bg-white shadow-inner">
          {/* Placeholder for PDF content */}
          <p className="text-sm text-muted-foreground text-center mb-4">
            This is a mock PDF view. Click on an element below to select it.
          </p>
          <div className="relative h-[500px]"> {/* Ensure there's enough height for absolute positioning */}
            {mockPdfElements.map((element) => (
              <div
                key={element.id}
                onClick={() => onElementSelect(element.text)}
                className={`p-2 mb-2 cursor-pointer border rounded-md transition-all duration-150 ease-in-out hover:bg-accent/20
                  ${selectedElementText === element.text ? 'bg-accent text-accent-foreground ring-2 ring-accent' : 'bg-background hover:border-primary'}
                  absolute text-sm`}
                style={{ top: element.position.top, left: element.position.left, width: element.position.width }}
                data-ai-hint="document text"
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
