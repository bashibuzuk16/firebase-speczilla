'use server';

/**
 * @fileOverview Implements a Genkit flow to suggest data table column mappings for a selected PDF element.
 *
 * - suggestDataMapping - A function that suggests which data table column maps to a chosen PDF element.
 * - SuggestDataMappingInput - The input type for the suggestDataMapping function.
 * - SuggestDataMappingOutput - The return type for the suggestDataMapping function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDataMappingInputSchema = z.object({
  pdfElementText: z
    .string()
    .describe('The text content of the selected PDF element.'),
  dataTableColumns: z
    .array(z.string())
    .describe('An array of strings representing the data table column names.'),
});
export type SuggestDataMappingInput = z.infer<typeof SuggestDataMappingInputSchema>;

const SuggestDataMappingOutputSchema = z.object({
  suggestedColumn: z
    .string()
    .describe('The name of the data table column that the AI suggests mapping to the PDF element.'),
  confidenceScore: z
    .number()
    .describe('A numerical score (0-1) indicating the AI models confidence in the suggested mapping.'),
});
export type SuggestDataMappingOutput = z.infer<typeof SuggestDataMappingOutputSchema>;

export async function suggestDataMapping(input: SuggestDataMappingInput): Promise<SuggestDataMappingOutput> {
  return suggestDataMappingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDataMappingPrompt',
  input: {schema: SuggestDataMappingInputSchema},
  output: {schema: SuggestDataMappingOutputSchema},
  prompt: `Given a selected PDF element with the text content "{{pdfElementText}}" and a data table with the following columns: {{dataTableColumns}}.\n\nSuggest the most appropriate data table column to map to the PDF element. Return the column name and a confidence score (0-1) for the suggestion.\n\nConsider the semantic meaning of both the PDF element text and the data table column names when making your suggestion.\n\nEnsure that the outputted column is one of the columns provided in the dataTableColumns input parameter.\n\nOutput in JSON format.`,
});

const suggestDataMappingFlow = ai.defineFlow(
  {
    name: 'suggestDataMappingFlow',
    inputSchema: SuggestDataMappingInputSchema,
    outputSchema: SuggestDataMappingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
