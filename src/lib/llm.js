// ---------------------------------------------------------------------------
// Google Gemini Chat client for SalaryShield GenAI Copilot
// ---------------------------------------------------------------------------
// Uses the free Gemini API (generativelanguage.googleapis.com).
// Get your key at: https://aistudio.google.com/apikey
// ---------------------------------------------------------------------------

import { cliiData, analyzeBudget, fmtINR } from './inflation';

// ── Gemini config from .env ─────────────────────────────────────────────────
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ── Build the rich system prompt ────────────────────────────────────────────
function buildSystemPrompt(budget) {
  const analysis = analyzeBudget(budget);
  const nominalLPA = 25.0;
  const recommendedAsk = Math.round((analysis.breakEvenHike + 7) * 10) / 10;
  const targetLPA = nominalLPA * (1 + recommendedAsk / 100);
  const realLPA   = nominalLPA * (1 - analysis.personalInflation / 100);

  // Format the expense breakdown for context
  const expenseBreakdown = analysis.rows
    .map(r => `  - ${r.label}: ${fmtINR(r.amount)}/mo (inflation: ${r.rate.toFixed(1)}%, next year: ${fmtINR(r.nextYear)}/mo)`)
    .join('\n');

  // Format CLII data for all cities
  const cityData = Object.entries(cliiData)
    .map(([city, d]) => `  ${city}: Total ${d.total}%, Housing ${d.housing}%, Food ${d.food}%, Transport ${d.transport}%, Utilities ${d.utilities}%, Education ${d.education}%`)
    .join('\n');

  return `You are the **SalaryShield GenAI Advisor** — an expert AI compensation and inflation analyst for Indian tech professionals.

## Your Role
- Provide data-driven salary advice, inflation analysis, and career guidance.
- Always ground answers in the LIVE user data provided below.
- Be specific with numbers — use the user's actual budget figures, not generic estimates.
- Format responses with clear markdown: use **bold** for key figures, bullet points for lists, and numbered steps for recommendations.
- Keep responses concise but insightful (aim for 150-300 words).
- When discussing salary, use LPA (Lakhs Per Annum) format common in India.

## User Profile (LIVE DATA)
- **Role**: Tech Lead
- **City**: ${budget.city}
- **Nominal Salary**: ₹${nominalLPA.toFixed(1)} LPA
- **Monthly Take-Home**: ${fmtINR(analysis.income)}
- **Real Salary (inflation-adjusted)**: ₹${realLPA.toFixed(1)} LPA

## Monthly Budget Breakdown
${expenseBreakdown}

## Computed Metrics
- **Total Monthly Expenses**: ${fmtINR(analysis.totalExpenses)}
- **Monthly Savings**: ${fmtINR(analysis.savings)} (savings rate: ${analysis.savingsRate.toFixed(1)}%)
- **Personal Inflation Rate**: ${analysis.personalInflation.toFixed(1)}% (expense-weighted, unique to this user's spending mix)
- **Annual Inflation Tax**: ${fmtINR(analysis.annualInflationTax)} (how much inflation costs this user per year)
- **Break-Even Hike Needed**: ${analysis.breakEvenHike.toFixed(1)}% (minimum raise to maintain current savings)
- **Recommended Ask**: ${recommendedAsk}% (to reach 75th percentile + inflation protection → ₹${targetLPA.toFixed(1)} LPA)
- **Projected Savings (next year, no raise)**: ${fmtINR(analysis.projectedSavings)}/mo

## City-Level Inflation Index (CLII)
${cityData}

## Key Guidelines
- If asked "Am I underpaid?", compare their real salary to market benchmarks and show purchasing power erosion.
- If asked about attrition risk, use savings erosion and inflation lag as risk signals.
- If asked about skills, recommend high-premium, inflation-resilient skills with market premium percentages.
- If asked about a specific city, use the CLII data above.
- Always tie advice back to their personal inflation rate and budget data.
- You can suggest they update their Budget Planner for more accurate analysis.`;
}

// ── Call Google Gemini ───────────────────────────────────────────────────────
/**
 * Send a message to Google Gemini and get a response.
 *
 * @param {string}   userMessage        The user's latest message
 * @param {Array}    conversationHistory Array of {role, content} for multi-turn context
 * @param {Object}   budget             The user's budget from loadBudget()
 * @returns {Promise<string>}           The assistant's reply text
 */
export async function callLLM(userMessage, conversationHistory = [], budget) {
  // Validate configuration
  if (!GEMINI_KEY || GEMINI_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    throw new Error(
      'Gemini API key not configured. Get your free key at https://aistudio.google.com/apikey and set it as VITE_GEMINI_API_KEY in your .env file.'
    );
  }

  const systemPrompt = buildSystemPrompt(budget);

  // Build the Gemini contents array from conversation history
  // Gemini uses "user" and "model" roles (not "assistant")
  const contents = [];

  // Add conversation history
  for (const msg of conversationHistory) {
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    });
  }

  // Add the new user message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  const url = `${GEMINI_URL}?key=${GEMINI_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        topP: 0.95
      }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    if (response.status === 400 && errorBody.includes('API_KEY')) {
      throw new Error('Invalid Gemini API key. Please check your VITE_GEMINI_API_KEY in the .env file.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. The free Gemini API has usage limits — please wait a moment and try again.');
    }
    throw new Error(
      `Gemini API returned ${response.status}: ${errorBody || response.statusText}`
    );
  }

  const data = await response.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!reply) {
    throw new Error('Gemini returned an empty response. Please try rephrasing your question.');
  }

  return reply.trim();
}
