'use server';

/**
 * @fileOverview A flow that summarizes a large amount of health information provided by the user.
 *
 * - summarizeHealthInfo - A function that takes health information as input and returns a summary.
 * - SummarizeHealthInfoInput - The input type for the summarizeHealthInfo function.
 * - SummarizeHealthInfoOutput - The return type for the summarizeHealthInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeHealthInfoInputSchema = z.object({
  healthInfo: z
    .string()
    .describe('A large amount of health information that needs to be summarized.'),
});
export type SummarizeHealthInfoInput = z.infer<typeof SummarizeHealthInfoInputSchema>;

const SummarizeHealthInfoOutputSchema = z.object({
  summary: z.string().describe('A summary of the health information.'),
});
export type SummarizeHealthInfoOutput = z.infer<typeof SummarizeHealthInfoOutputSchema>;

export async function summarizeHealthInfo(input: SummarizeHealthInfoInput): Promise<SummarizeHealthInfoOutput> {
  return summarizeHealthInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeHealthInfoPrompt',
  input: {schema: SummarizeHealthInfoInputSchema},
  output: {schema: SummarizeHealthInfoOutputSchema},
  prompt: `You are a healthcare assistant that summarizes health information for users.

  Summarize the following health information:

  {{{healthInfo}}} `,
});

const summarizeHealthInfoFlow = ai.defineFlow(
  {
    name: 'summarizeHealthInfoFlow',
    inputSchema: SummarizeHealthInfoInputSchema,
    outputSchema: SummarizeHealthInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
