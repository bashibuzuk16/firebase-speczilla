// src/lib/api.ts
interface ProcessPdfResponse {
  success: boolean;
  data?: any[];
  error?: string;
  processingTime?: number;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export class PdfApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  async processPdf(
    file: File, 
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ProcessPdfResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${this.baseUrl}/api/process-pdf-sync/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
        processingTime: response.headers.get('X-Processing-Time') 
          ? parseInt(response.headers.get('X-Processing-Time')!) 
          : undefined
      };
    } catch (error) {
      console.error('Error processing PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Хук для использования в компонентах
export const usePdfApi = () => {
  const client = new PdfApiClient();
  
  return {
    processPdf: client.processPdf.bind(client),
    healthCheck: client.healthCheck.bind(client),
  };
};