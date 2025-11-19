// Gemini AI Service for AI-powered financing assistance (using Gemini, named openaiService for compatibility)

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

// Knowledge base about German financing options
const FINANCING_KNOWLEDGE_BASE = `
You are a helpful German home renovation financing advisor. You help users understand financing options for home renovations in Germany.

# Main Financing Options in Germany

## 1. Modernisierungskredit (Modernisation Loan)
- Personal loan for home renovations, usually unsecured
- Up to €50,000–€80,000
- Used for: Bathroom/kitchen upgrades, energy-efficient windows, heating, insulation

## 2. Baufinanzierung / Nachfinanzierung
- Mortgage-based financing
- For larger renovations and structural work
- Can extend existing mortgage or take a second one

## 3. KfW Förderkredite (State-Subsidised Loans)
- Low-interest loans via KfW Bank
- Distributed through local banks
- For: Energy-efficient renovations, renewable energy, barrier-free conversions

## 4. BAFA Zuschüsse (Cash Grants)
- Direct subsidies from BAFA
- For: Heating systems, renewable energy (heat pumps, solar thermal)
- No repayment required

# Key Programmes (2025)

## KfW Programme 261 / BEG WG
- Energy-efficient house renovations or partial upgrades
- Covers: Insulation, windows, heating
- Requirement: Apply before construction starts, energy consultant required
- Interest rate: 0.01% - 1.5%
- Max amount: €150,000

## KfW Programme 262 - BEG Renovation Grant
- Direct grant for energy-efficient renovations
- Up to €75,000 (up to 50% subsidy)
- No repayment needed
- Can be combined with loans

## KfW Programme 159 – Barrier-Free Conversion
- For accessibility improvements
- Bathrooms, stairs, ramps
- No energy efficiency requirement
- Up to €50,000

## BAFA "Heizen mit Erneuerbaren Energien"
- Renewable heating systems
- Heat pumps, biomass, solar thermal
- Up to 40% subsidy
- Max €70,000
- Apply directly via BAFA portal

# Required Documents

## For Bank Loans:
1. Personal identification: Passport or residence permit, Meldebescheinigung
2. Income proof: Last 3 salary slips, Einkommensteuerbescheid
3. Bank statements: Last 3 months
4. SCHUFA report: Credit score (check at meineschufa.de)
5. Property proof: Grundbuchauszug, property valuation
6. Renovation details: Kostenvoranschlag (cost estimate)
7. Energy certificate: Energieausweis (if applicable)

## For KfW/BAFA Subsidies:
1. Energy consultant report: From certified Energieeffizienz-Experte
2. Project plan: iSFP (individueller Sanierungsfahrplan)
3. Cost estimates: Contractor quotes
4. Energy calculations: Expected savings
5. Proof of ownership: Grundbuchauszug or Grundsteuerbescheid
6. Application forms: Via bank (KfW) or BAFA portal
7. Completion proof: Invoices and consultant confirmation (after renovation)

# Step-by-Step Process

1. Define renovation goals (which rooms, what improvements)
2. Contact an Energieberater (energy consultant) - required for subsidies
3. Collect contractor quotes (Kostenvoranschlag)
4. Visit bank or comparison portal for Modernisierungskredit
5. Submit documents (ID, income, SCHUFA, estimates)
6. Wait for approval BEFORE signing contracts
7. Execute renovation and keep all invoices
8. Submit proof to BAFA/KfW for subsidy disbursement

# Common Rejection Causes

- Applying AFTER starting renovation (subsidies require application before work begins)
- Missing energy consultant report for BEG programmes
- Incomplete cost breakdown
- Low SCHUFA score (below 90-95%)
- Non-eligible measures (painting, furniture, decorative work)
- Using unapproved contractors (some subsidies require certified Fachbetrieb)

# Important Tips

- ALWAYS apply before starting work for subsidies
- Energy consultant is mandatory for KfW/BAFA energy programmes
- Many grants can be combined with loans
- Check SCHUFA score first at meineschufa.de
- Keep detailed documentation of all work
- Use certified contractors (Fachbetrieb) when required
- Typical approval time: 2-6 weeks
- Interest rates vary based on credit score and property value

Provide helpful, accurate information based on this knowledge. Be friendly and encouraging.
`;

class GeminiService {
  private apiKey: string;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models';
  private model: string = 'gemini-2.0-flash'; // Using Gemini 2.0 Flash (latest stable, free tier)

  constructor() {
    // API key should be stored in environment variables
    this.apiKey = process.env.REACT_APP_GEMINI_API_KEY || '';

    if (!this.apiKey) {
      console.warn('Gemini API key not found. Set REACT_APP_GEMINI_API_KEY in .env file');
    }
  }

  async sendMessage(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured. Please add REACT_APP_GEMINI_API_KEY to your .env file');
    }

    try {
      // Build conversation context for Gemini
      let fullPrompt = FINANCING_KNOWLEDGE_BASE + '\n\n';

      // Add conversation history
      conversationHistory.forEach(msg => {
        if (msg.role === 'user') {
          fullPrompt += `User: ${msg.content}\n`;
        } else if (msg.role === 'assistant') {
          fullPrompt += `Assistant: ${msg.content}\n`;
        }
      });

      // Add current user message
      fullPrompt += `User: ${userMessage}\nAssistant:`;

      const apiUrl = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
            topP: 0.95,
            topK: 40
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data: GeminiResponse = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }

  async generateDocumentChecklist(renovationType: string, ownership: string, energyEfficiency: string): Promise<string[]> {
    const prompt = `Create a concise document checklist for German home renovation financing.

Project details:
- Renovation type: ${renovationType}
- Ownership: ${ownership === 'yes' ? 'Owns the property' : 'Rents the property'}
- Energy efficiency focus: ${energyEfficiency}

IMPORTANT: Provide ONLY a clean, numbered list of document names. NO explanations, NO introductions, NO extra text, NO paragraphs.

Format each item exactly like this:
1. Personal Identification (Passport or Personalausweis)
2. Proof of Address (Meldebescheinigung)
3. Last 3 Salary Slips (Gehaltsabrechnungen)

Keep it SHORT and SIMPLE - just document names with German terms in parentheses.`;

    try {
      const response = await this.sendMessage(prompt);
      // Parse the response into an array of checklist items
      const items = response
        .split('\n')
        .filter(line => {
          const trimmed = line.trim();
          // Only keep lines that start with numbers, dashes, or bullets
          return trimmed.match(/^\d+\.|^-|^•/) && trimmed.length > 3;
        })
        .map(line => {
          // Remove numbering/bullets and clean up
          return line.replace(/^\d+\.\s*|^-\s*|^•\s*/, '').trim();
        })
        .filter(item => {
          // Filter out any remaining explanatory text or empty items
          return item.length > 5 && !item.toLowerCase().startsWith('here') && !item.toLowerCase().startsWith('okay');
        });

      return items.length > 0 ? items : [response];
    } catch (error) {
      throw error;
    }
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }
}

export const openAIService = new GeminiService();
export type { ChatMessage as OpenAIChatMessage };