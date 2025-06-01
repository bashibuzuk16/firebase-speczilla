
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
  { id: 'el1', text: 'Поз.: П1', position: { top: '20px', left: '20px', width: 'auto' } },
  { id: 'el2', text: 'Наименование: ИТП', position: { top: '50px', left: '20px', width: 'auto' } },
  { id: 'el3', text: 'Тип, характеристика: Кан.вент. IP54, FRC 60-30', position: { top: '80px', left: '20px', width: 'calc(100% - 40px)' } },
  { id: 'el4', text: 'Кол-во: 1', position: { top: '120px', left: '20px', width: 'auto' } },
  { id: 'el5', text: 'Артикул: ABC-123', position: { top: '150px', left: '20px', width: 'auto' } },
  { id: 'el6', text: 'Заметка: Требуется проверка размеров', position: { top: '180px', left: '20px', width: 'calc(100% - 40px)' } },
  { id: 'el7', text: 'Поз.: П2', position: { top: '220px', left: '20px', width: 'auto' } },
  { id: 'el8', text: 'Наименование: Помещения охраны', position: { top: '250px', left: '20px', width: 'auto' } },
  { id: 'el9', text: 'Тип, характеристика: Кан.вент. IP54, KVR 100/1', position: { top: '280px', left: '20px', width: 'calc(100% - 40px)' } },
  { id: 'el10', text: 'Производитель: Systemair', position: { top: '320px', left: '20px', width: 'auto' } },
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

    