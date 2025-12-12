'use server';

/**
 * @fileOverview A flow to provide personalized health guidance based on user symptoms and medical history.
 *
 * - personalizedHealthGuidance - A function that takes user symptoms and medical history and returns tailored health advice.
 * - PersonalizedHealthGuidanceInput - The input type for the personalizedHealthGuidance function.
 * - PersonalizedHealthGuidanceOutput - The return type for the personalizedHealthGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedHealthGuidanceInputSchema = z.object({
  symptoms: z
    .string()
    .describe('A description of the patient symptoms.'),
  medicalHistory: z.string().describe('The medical history of the patient.'),
  language: z.enum(['en', 'hi', 'mr']).describe('The language for the response.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "An optional photo of the symptom, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type PersonalizedHealthGuidanceInput = z.infer<typeof PersonalizedHealthGuidanceInputSchema>;

const PersonalizedHealthGuidanceOutputSchema = z.object({
  advice: z.string().describe('Tailored health advice based on the provided information.'),
});
export type PersonalizedHealthGuidanceOutput = z.infer<typeof PersonalizedHealthGuidanceOutputSchema>;

export async function personalizedHealthGuidance(input: PersonalizedHealthGuidanceInput): Promise<PersonalizedHealthGuidanceOutput> {
  return personalizedHealthGuidanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedHealthGuidancePrompt',
  input: {schema: PersonalizedHealthGuidanceInputSchema},
  output: {schema: PersonalizedHealthGuidanceOutputSchema},
  system: `You are a helpful and harmless AI healthcare assistant. Your goal is to provide safe, general health guidance based on World Health Organization (WHO) guidelines.

  IMPORTANT: You are not a doctor. You must not provide a diagnosis. Your advice should be for general informational purposes only. Always recommend that the user consult a certified doctor or visit a hospital for a proper diagnosis and treatment, especially in case of emergencies.`,
  prompt: `You are a healthcare assistant bot designed to provide personalized health guidance based on the user's symptoms and medical history, following WHO guidelines.

  The user is asking for advice in this language: {{{language}}}. All of your responses must be in this language.

  Symptoms: {{{symptoms}}}
  Medical History: {{{medicalHistory}}}
  {{#if photoDataUri}}
  Photo of symptom:
  {{media url=photoDataUri}}
  {{/if}}

  Based on the provided information, what tailored health advice can you provide in {{{language}}}? Remember to always recommend consulting a professional.`,
});

const personalizedHealthGuidanceFlow = ai.defineFlow(
  {
    name: 'personalizedHealthGuidanceFlow',
    inputSchema: PersonalizedHealthGuidanceInputSchema,
    outputSchema: PersonalizedHealthGuidanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
