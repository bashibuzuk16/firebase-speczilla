import React, { useRef, useState } from 'react';
import SmartMapper from './smart-mapper';

interface FloatingSmartMapperProps {
  selectedPdfText: string | null;
  dataTableColumns: string[];
  onMappingApplied: (pdfText: string, mappedColumn: string) => void;
  onClose: () => void;
}

const FloatingSmartMapper: React.FC<FloatingSmartMapperProps> = ({
  selectedPdfText,
  dataTableColumns,
  onMappingApplied,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 100, y: 100 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && dragStart) {
      setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };
  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return (
    <div
      ref={modalRef}
      style={{
        position: 'fixed',
        top: offset.y,
        left: offset.x,
        zIndex: 1000,
        minWidth: 350,
        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
        background: 'white',
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        userSelect: isDragging ? 'none' : 'auto',
      }}
    >
      <div
        style={{
          cursor: 'move',
          padding: '8px 12px',
          background: '#f3f4f6',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        onMouseDown={handleMouseDown}
      >
        Smart Mapper
        <button onClick={onClose} style={{ marginLeft: 8, fontWeight: 700, fontSize: 18, background: 'none', border: 'none', cursor: 'pointer' }} title="Close">×</button>
      </div>
      <div style={{ padding: 16 }}>
        <SmartMapper
          selectedPdfText={selectedPdfText}
          dataTableColumns={dataTableColumns}
          onMappingApplied={onMappingApplied}
        />
      </div>
    </div>
  );
};

export default FloatingSmartMapper;
