// ---------------------------------------------------------------------------
// Google Gemini Chat client for SalaryShield GenAI Copilot
// ---------------------------------------------------------------------------
// Uses the free Gemini API (generativelanguage.googleapis.com).
// Get your key at: https://aistudio.google.com/apikey
// ---------------------------------------------------------------------------

import { cliiData, analyzeBudget, fmtINR, analyzeWorkforce } from './inflation';

// ── Gemini config from .env ─────────────────────────────────────────────────
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ── Build the rich system prompt ────────────────────────────────────────────
function buildSystemPrompt(budget) {
  const analysis = analyzeBudget(budget);
  const nominalLPA = (budget.nominalSalary || 2500000) / 100000;
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

// ── Low-level Gemini call (shared by all AI features below) ─────────────────
function isConfigured() {
  return !!(GEMINI_KEY && GEMINI_KEY !== 'YOUR_GEMINI_API_KEY_HERE' && GEMINI_KEY.trim() !== '');
}

async function callGemini(systemPrompt, contents) {
  const url = `${GEMINI_URL}?key=${GEMINI_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024, topP: 0.95 }
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
    throw new Error(`Gemini API returned ${response.status}: ${errorBody || response.statusText}`);
  }

  const data = await response.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!reply) {
    throw new Error('Gemini returned an empty response. Please try rephrasing your question.');
  }
  return reply.trim();
}

// ── Call Google Gemini (Copilot chat) ────────────────────────────────────────
/**
 * Send a message to Google Gemini and get a response.
 *
 * @param {string}   userMessage        The user's latest message
 * @param {Array}    conversationHistory Array of {role, content} for multi-turn context
 * @param {Object}   budget             The user's budget from loadBudget()
 * @returns {Promise<string>}           The assistant's reply text
 */
export async function callLLM(userMessage, conversationHistory = [], budget) {
  // Validate configuration - if key is not configured, fall back to high-fidelity mock responses so the demo doesn't crash!
  if (!isConfigured()) {
    // Artificial latency for realism
    await new Promise(resolve => setTimeout(resolve, 800));
    return generateMockAIResponse(userMessage, budget);
  }

  const systemPrompt = buildSystemPrompt(budget);

  // Build the Gemini contents array from conversation history
  // Gemini uses "user" and "model" roles (not "assistant")
  const contents = [];
  for (const msg of conversationHistory) {
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    });
  }
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  return callGemini(systemPrompt, contents);
}

// ── AI feature 1: Negotiation script writer (Employee Portal Coach) ─────────
/**
 * Have Gemini WRITE a negotiation email or in-person pitch script, grounded
 * in the user's live budget/CLII data — instead of the fixed template.
 *
 * @param {Object} budget  The user's budget from loadBudget()
 * @param {'email'|'meeting'} format
 * @param {'formal'|'confident'|'friendly'} tone
 * @returns {Promise<string>} The generated script text
 */
export async function generateNegotiationScript(budget, format = 'email', tone = 'confident') {
  if (!isConfigured()) {
    throw new Error('AI script generation requires a Gemini API key (VITE_GEMINI_API_KEY).');
  }

  const analysis = analyzeBudget(budget);
  const nominalLPA = (budget.nominalSalary || 2500000) / 100000;
  const recommendedAsk = Math.round((analysis.breakEvenHike + 7) * 10) / 10;
  const targetLPA = nominalLPA * (1 + recommendedAsk / 100);

  const systemPrompt = `You are an expert compensation negotiation coach writing on behalf of an Indian tech employee.
Write ONLY the requested artifact — no preamble, no "here is your script" framing, no markdown headers.
Ground every number in the LIVE DATA below; do not invent figures.

## LIVE DATA
- City: ${budget.city}
- Nominal Salary: ₹${nominalLPA.toFixed(1)} LPA
- Personal Inflation Rate: ${analysis.personalInflation.toFixed(1)}%
- Annual Inflation Tax: ${fmtINR(analysis.annualInflationTax)}
- Break-Even Hike Needed: ${analysis.breakEvenHike.toFixed(1)}%
- Recommended Ask: ${recommendedAsk}% (target ₹${targetLPA.toFixed(1)} LPA)

## Tone
Write in a ${tone} tone.`;

  const instruction = format === 'email'
    ? 'Write a complete, ready-to-send salary correction request email (with subject line) citing the live data above.'
    : 'Write a 3-part talking-point script for an in-person appraisal conversation (opening fact, performance/market pivot, the ask) citing the live data above.';

  return callGemini(systemPrompt, [{ role: 'user', parts: [{ text: instruction }] }]);
}

// ── AI feature 2: Workforce anomaly explanation (Employer Console) ──────────
/**
 * Have Gemini explain, in plain English, the biggest workforce risk driver
 * from the live analyzeWorkforce() output — a narrated diff, not new math.
 *
 * @param {number} hikePercent  The current corrective-hike slider value
 * @returns {Promise<string>}   A short (~120 word) explanation
 */
export async function generateWorkforceInsight(hikePercent) {
  if (!isConfigured()) {
    throw new Error('AI insight generation requires a Gemini API key (VITE_GEMINI_API_KEY).');
  }

  const wf = analyzeWorkforce(hikePercent);
  const cityLines = wf.cities
    .map(c => `  ${c.city}: CLII ${c.clii}%, ${c.employees} employees, attrition risk ${c.simRisk}% (base ${c.baseRisk}%), purchasing-power gap ₹${c.gapLakh.toFixed(1)}L, threat ${c.threat}`)
    .join('\n');

  const systemPrompt = `You are an HR workforce analyst. Explain the data below in plain English for a CHRO audience.
No markdown headers. 2-3 short paragraphs, under 130 words total. Be specific with numbers from the data — do not invent any.
Identify the single riskiest city and why, and one concrete recommendation tied to the current ${hikePercent}% corrective hike.

## LIVE WORKFORCE DATA (at ${hikePercent}% corrective hike)
${cityLines}

- Headcount-weighted inflation: ${wf.weightedInflation.toFixed(2)}%
- Attrition risk: ${wf.baseAttrition}% (no hike) -> ${wf.simAttrition}% (at ${hikePercent}% hike)
- Employees retained by this hike: ${wf.employeesRetained}
- Additional budget required: ${fmtINR(wf.additionalBudget)}
- Replacement cost prevented: ${fmtINR(wf.replacementSavings)}
- ROI multiplier: ${wf.roiMultiplier.toFixed(1)}x
- Gender wage gap: ${wf.genderGap.toFixed(1)}%`;

  return callGemini(systemPrompt, [{ role: 'user', parts: [{ text: 'Explain this workforce risk data.' }] }]);
}

/**
 * High-fidelity fallback mock response generator for demo purposes
 */
function generateMockAIResponse(message, budget) {
  const analysis = analyzeBudget(budget);
  const nominalLPA = (budget.nominalSalary || 2500000) / 100000;
  const recommendedAsk = Math.round((analysis.breakEvenHike + 7) * 10) / 10;
  const targetLPA = nominalLPA * (1 + recommendedAsk / 100);
  const realLPA   = nominalLPA * (1 - analysis.personalInflation / 100);

  const lowerMessage = message.toLowerCase();

  // If asking about the redirect budget query
  if (lowerMessage.includes('personal inflation') && lowerMessage.includes('break even')) {
    return `### 🛡️ Inflation Deficit Negotiation Strategy

Based on your live budget data in **${budget.city}**, here is your custom compensation impact assessment:

1. **Purchasing Power Erosion**: Your personal inflation rate is currently **${analysis.personalInflation.toFixed(1)}%** (driven primarily by local rent and cost-of-living adjustments). This has eroded your gross real income from **₹${nominalLPA.toFixed(1)} LPA** to **₹${realLPA.toFixed(1)} LPA**.
2. **The Inflation Tax**: You are paying a monthly "inflation tax" of **${fmtINR(analysis.annualInflationTax / 12)}** (or **${fmtINR(analysis.annualInflationTax)}/yr**).
3. **Break-Even Hike**: You require a minimum corrective hike of **${analysis.breakEvenHike.toFixed(1)}%** just to keep your savings rate flat.

#### 💬 How to present this to your employer:
> *"Hello Team, when reviewing my compensation w.r.t market inflation index (CLII) in ${budget.city}, my personal inflation exposure on local rent and essentials stands at **${analysis.personalInflation.toFixed(1)}%**. To maintain target savings parity, I am seeking a market alignment of **${recommendedAsk}%**, positioning my target package at **₹${targetLPA.toFixed(1)} LPA**."*

Would you like me to draft a formal email template or prepare negotiation slides for this?`;
  }

  // If asking about underpaid
  if (lowerMessage.includes('underpaid') || lowerMessage.includes('salary') || lowerMessage.includes('lpa')) {
    return `### 📊 Market Valuation Report

For a **Tech Lead** in **${budget.city}**:
* **Current Nominal Salary**: ₹${nominalLPA.toFixed(1)} LPA
* **Inflation-adjusted Real Value**: ₹${realLPA.toFixed(1)} LPA (erosion of **${analysis.personalInflation.toFixed(1)}%**)
* **Recommended Market Correction**: **+${recommendedAsk}%** (targeting **₹${targetLPA.toFixed(1)} LPA**)

You are currently positioned in the **45th percentile** of tech leads in ${budget.city}. Acquiring high-premium upskilling badges (like Generative AI or Cloud Architecture) will help push you to the **75th percentile** and hedge against purchasing power losses.`;
  }

  // If asking about attrition risk
  if (lowerMessage.includes('attrition') || lowerMessage.includes('risk') || lowerMessage.includes('flight')) {
    return `### ⚠️ Attrition Risk Alert

Your monthly savings rate is **${analysis.savingsRate.toFixed(1)}%** (${fmtINR(analysis.savings)}/mo savings).
Without a corrective raise, next year's inflation will reduce your monthly savings to **${fmtINR(analysis.projectedSavings)}/mo** (a savings erosion of **${((analysis.savings - analysis.projectedSavings) / Math.max(1, analysis.savings) * 100).toFixed(0)}%**).

This savings depletion puts you at **High Flight Risk**. An adjustment of at least **+${analysis.breakEvenHike.toFixed(1)}%** is strongly recommended to stabilize employee retention.`;
  }

  // Default fallback answer
  return `### 👋 SalaryShield Copilot (Demo Mode)

I am running in **Demo Fallback Mode** because no Gemini API key is configured. However, I can still analyze your live budget data:

* **Location**: ${budget.city}
* **Current Package**: ₹${nominalLPA.toFixed(1)} LPA
* **Personal Inflation**: ${analysis.personalInflation.toFixed(1)}%
* **Break-Even Hike Required**: +${analysis.breakEvenHike.toFixed(1)}%

*Tip: To activate full conversational AI capabilities, get a free key from the [Google AI Studio](https://aistudio.google.com/apikey) and set it as \`VITE_GEMINI_API_KEY\` in your \`.env\` file.*`;
}
