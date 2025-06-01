
"use client";

import type React from 'react';
import { Button } from "@/components/ui/button";
import { Download, FileUp, FileText } from "lucide-react";

interface AppHeaderProps {
  onExportCsv: () => void;
  onExportJson: () => void;
  onLoadPdfClick: () => void;
  onLoadJsonClick: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onExportCsv, onExportJson, onLoadPdfClick, onLoadJsonClick }) => {
  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-7 h-7 text-primary" />
          <h1 className="text-xl font-headline font-semibold text-foreground">PDF Data Editor</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onLoadPdfClick}>
            <FileUp className="mr-2 h-4 w-4" />
            Load PDF
          </Button>
          <Button variant="outline" size="sm" onClick={onLoadJsonClick}>
            <FileUp className="mr-2 h-4 w-4" />
            Load JSON
          </Button>
          <Button variant="outline" size="sm" onClick={onExportCsv}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={onExportJson}>
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
