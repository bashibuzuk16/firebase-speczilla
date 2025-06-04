import React from 'react';

interface PdfViewerProps {
  onElementSelect: (text: string) => void;
  selectedElementText: string | null;
  loadedPdfName: string | null;
  pdfPageImages: string[] | null;
  currentPageNum: number;
  totalPdfPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  isProcessingPdf: boolean;
}

export default function PdfViewer({
  onElementSelect,
  selectedElementText,
  loadedPdfName,
  pdfPageImages,
  currentPageNum,
  totalPdfPages,
  onNextPage,
  onPrevPage,
  isProcessingPdf,
}: PdfViewerProps) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {loadedPdfName || 'PDF Viewer'}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onPrevPage}
            disabled={currentPageNum <= 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {currentPageNum} of {totalPdfPages}
          </span>
          <button
            onClick={onNextPage}
            disabled={currentPageNum >= totalPdfPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      
      <div className="relative min-h-[500px] border rounded">
        {isProcessingPdf ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : pdfPageImages && pdfPageImages[currentPageNum - 1] ? (
          <img
            src={pdfPageImages[currentPageNum - 1]}
            alt={`Page ${currentPageNum}`}
            className="w-full h-auto blueprint-filter"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            No PDF loaded
          </div>
        )}
      </div>
    </div>
  );
} 