/**
 * Gemini AI Service
 * Handles communication with backend API for cost estimation
 *
 * @module services/gemini.service
 */

import { CostEstimateResponse, FormData } from '../types/financing.types';

class GeminiService {
  private readonly backendUrl: string;

  constructor() {
    this.backendUrl = 'http://localhost:8000/api';
  }

  /**
   * Generate cost estimate via backend API
   * @param formData - User's renovation project data
   * @returns Cost estimate with breakdown (includes _originalPrompt and _formData)
   */
  public async generateCostEstimate(formData: FormData): Promise<CostEstimateResponse> {
    const apiUrl = `${this.backendUrl}/financing/cost-estimate/`;

    console.log('[Gemini Service] Calling backend API for cost estimation');
    console.log('[Gemini Service] API URL:', apiUrl);
    console.log('[Gemini Service] Form data:', JSON.stringify(formData, null, 2));

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    console.log('[Gemini Service] Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Gemini Service] Error response:', errorData);

      // Handle rate limit error (429)
      if (response.status === 429) {
        throw new Error(
          `RATE_LIMIT: ${errorData.message || 'API rate limit exceeded'}\n\n` +
          `Details: ${errorData.details || 'Please wait and try again'}\n\n` +
          `Suggestions:\n${(errorData.suggestions || []).map((s: string) => `• ${s}`).join('\n')}`
        );
      }

      // Handle other errors
      throw new Error(
        `API Error (${response.status}): ${errorData.message || errorData.error || 'Unknown error'}\n` +
        `${errorData.details || ''}`
      );
    }

    const result = await response.json();
    console.log('[Gemini Service] Cost estimate received from backend:', JSON.stringify(result, null, 2));

    return result;
  }

  /**
   * Generate financing options based on cost estimate
   * @param originalPrompt - Original prompt sent to Gemini
   * @param costEstimate - Cost estimate response from Gemini
   * @param formData - Original form data
   * @returns Financing options
   */
  public async generateFinancingOptions(
    originalPrompt: string,
    costEstimate: any,
    formData: FormData
  ): Promise<any> {
    const apiUrl = `${this.backendUrl}/financing/financing-options/`;

    console.log('[Gemini Service] Calling backend API for financing options');
    console.log('[Gemini Service] API URL:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        original_prompt: originalPrompt,
        cost_estimate: costEstimate,
        form_data: formData
      })
    });

    console.log('[Gemini Service] Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Gemini Service] Error response:', errorData);

      if (response.status === 429) {
        throw new Error(
          `RATE_LIMIT: ${errorData.message || 'API rate limit exceeded'}\n\n` +
          `Details: ${errorData.details || 'Please wait and try again'}`
        );
      }

      throw new Error(
        `API Error (${response.status}): ${errorData.message || errorData.error || 'Unknown error'}${errorData.details ? '\nDetails: ' + errorData.details : ''}`
      );
    }

    const result = await response.json();
    console.log('[Gemini Service] Financing options received:', JSON.stringify(result, null, 2));

    return result;
  }

  /**
   * Generate image description
   */
  public async generateImageDescription(
    originalPrompt: string,
    costEstimate: any,
    formData: FormData
  ): Promise<any> {
    const apiUrl = `${this.backendUrl}/financing/image-generation/`;

    console.log('[Gemini Service] Calling backend API for image generation');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        original_prompt: originalPrompt,
        cost_estimate: costEstimate,
        form_data: formData
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Failed to generate image description');
    }

    const result = await response.json();
    console.log('[Gemini Service] Image description received:', result);

    return result;
  }

}

export const geminiService = new GeminiService();
