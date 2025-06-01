"use client";

import type React from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { suggestDataMapping, type SuggestDataMappingInput, type SuggestDataMappingOutput } from "@/ai/flows/suggest-data-mapping";
import { useToast } from "@/hooks/use-toast";

interface SmartMapperProps {
  selectedPdfText: string | null;
  dataTableColumns: string[];
  onMappingApplied?: (pdfText: string, mappedColumn: string) => void; // Optional: If you want to do something with the applied mapping
}

const SmartMapper: React.FC<SmartMapperProps> = ({ selectedPdfText, dataTableColumns, onMappingApplied }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestDataMappingOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSuggestMapping = async () => {
    if (!selectedPdfText) {
      toast({
        title: "No PDF Element Selected",
        description: "Please select an element from the PDF document first.",
        variant: "destructive",
      });
      return;
    }
    if (dataTableColumns.length === 0) {
      toast({
        title: "No Data Columns",
        description: "There are no columns in the data table to map to.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuggestion(null);

    try {
      const input: SuggestDataMappingInput = {
        pdfElementText: selectedPdfText,
        dataTableColumns: dataTableColumns,
      };
      const result = await suggestDataMapping(input);
      setSuggestion(result);
    } catch (err) {
      console.error("Error suggesting mapping:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to get suggestion: ${errorMessage}`);
      toast({
        title: "Smart Mapping Error",
        description: `Could not get mapping suggestion. ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApplySuggestion = () => {
    if (suggestion && selectedPdfText && onMappingApplied) {
      onMappingApplied(selectedPdfText, suggestion.suggestedColumn);
      toast({
        title: "Mapping Applied (Simulated)",
        description: `PDF element "${selectedPdfText.substring(0,30)}..." mapped to column "${suggestion.suggestedColumn}".`,
      });
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold">
          <Sparkles className="w-5 h-5 mr-2 text-primary" />
          Smart Field Mapper
        </CardTitle>
        <CardDescription>
          Select an element in the PDF, then click below to get an AI-powered mapping suggestion.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedPdfText && (
          <Alert variant="default" className="bg-muted/50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-medium">Selected PDF Element Text:</AlertTitle>
            <AlertDescription className="text-sm italic break-all">"{selectedPdfText}"</AlertDescription>
          </Alert>
        )}
        <Button
          onClick={handleSuggestMapping}
          disabled={isLoading || !selectedPdfText}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Suggest Mapping
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {suggestion && (
          <Alert variant={suggestion.confidenceScore > 0.7 ? "default" : "default"} className={suggestion.confidenceScore > 0.7 ? "border-green-500" : "border-amber-500"}>
             {suggestion.confidenceScore > 0.7 ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-amber-600" /> }
            <AlertTitle className={suggestion.confidenceScore > 0.7 ? "text-green-700" : "text-amber-700"}>Mapping Suggestion</AlertTitle>
            <AlertDescription>
              <p>Suggested Column: <strong className="font-medium">{suggestion.suggestedColumn}</strong></p>
              <p>Confidence: <span className="font-medium">{(suggestion.confidenceScore * 100).toFixed(1)}%</span></p>
              {onMappingApplied && (
                 <Button size="sm" variant="outline" onClick={handleApplySuggestion} className="mt-2">
                    Apply Suggestion (Simulated)
                 </Button>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartMapper;
