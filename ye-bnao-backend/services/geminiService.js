const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
});

// Helper: call Gemini and parse the JSON response
async function callGemini(prompt, maxOutputTokens = 8192) {
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens,
      responseMimeType: 'application/json',
    },
  });
  const text = result.response.text();
  // Strip markdown code fences if present (```json ... ```)
  const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
  return JSON.parse(cleaned);
}

// ─── Health rules ────────────────────────────────────────────────────────────

const HEALTH_RULES = {
  diabetes: 'Avoid white rice, maida, sugar. Prefer millets, bitter gourd, low glycemic foods.',
  hypertension: 'Low sodium. Avoid pickles. Include garlic and leafy greens.',
  hypothyroidism: 'Avoid raw cruciferous vegetables. Cooked versions are fine.',
  pcos: 'Avoid refined carbs. Include flaxseeds and cinnamon. Add PCOS disclaimer.',
  heartDisease: 'Minimal ghee. Prefer oats, turmeric, heart-healthy cooking.',
  anaemia: 'Include spinach and jaggery. No tea/coffee with meals.',
  pregnancy: 'Focus on folate, iron, calcium. No raw papaya. Add pregnancy disclaimer.',
  kidneyDisease: 'Low potassium, controlled protein. Avoid excess tomatoes.',
};

// ─── Meal Plan ───────────────────────────────────────────────────────────────

async function generateMealPlan({ profile, language, date, history = [] }) {
  const today = new Date(date);
  const dayName = today.toLocaleDateString('en-IN', { weekday: 'long' });
  const monthName = today.toLocaleDateString('en-IN', { month: 'long' });

  const healthConditions = profile.members
    ?.flatMap(m => m.health || [])
    ?.filter(Boolean) || [];

  const healthRules = healthConditions
    .map(h => HEALTH_RULES[h.toLowerCase().replace(/\s/g, '')] || '')
    .filter(Boolean)
    .join(' ');

  const recentDishes = history.map(h => h.name).join(', ') || 'none';

  const prompt = `You are an expert Indian home cook and nutritionist. Generate a daily meal plan for an Indian family.

FAMILY PROFILE:
- Name: ${profile.name}
- Location: ${profile.city || 'India'}, ${profile.state || 'Maharashtra'}
- Cuisine: ${profile.cuisine || 'Maharashtrian'}
- Family members: ${JSON.stringify(profile.members || [])}
- Day: ${dayName}, ${monthName}

DIET RESTRICTIONS:
${profile.members?.map(m => `${m.name || 'Member'}: ${m.diet}, spice ${m.spice}/5`).join('\n') || 'Vegetarian'}

HEALTH CONDITIONS: ${healthConditions.join(', ') || 'none'}
${healthRules ? `HEALTH DIETARY RULES: ${healthRules}` : ''}

RECENT DISHES (avoid repeating): ${recentDishes}

RESPONSE LANGUAGE: ${language} — Respond ENTIRELY in ${language}. All dish names, descriptions, ingredients, and steps must be in ${language}.

Return ONLY this JSON (no extra text):
{
  "breakfast": {
    "name": "dish name in ${language}",
    "nameEn": "dish name in English",
    "desc": "brief description in ${language}",
    "time": "XX min",
    "cost": "₹XX",
    "serves": "4",
    "ingredients": ["ingredient 1 in ${language}", "ingredient 2"],
    "steps": ["step 1 in ${language}", "step 2"],
    "healthNote": "health note if applicable in ${language}"
  },
  "lunch": { "name": "", "nameEn": "", "desc": "", "time": "", "cost": "", "serves": "", "ingredients": [], "steps": [], "healthNote": "" },
  "snack": { "name": "", "nameEn": "", "desc": "", "time": "", "cost": "", "serves": "", "ingredients": [], "steps": [], "healthNote": "" },
  "dinner": { "name": "", "nameEn": "", "desc": "", "time": "", "cost": "", "serves": "", "ingredients": [], "steps": [], "healthNote": "" }
}

Make dishes authentic to ${profile.cuisine || 'Indian'} cuisine, appropriate for the season (${monthName}), practical to cook at home, and varied across meals.
${healthConditions.includes('PCOS') || healthConditions.includes('pregnancy') ? 'Include appropriate health disclaimer in healthNote.' : ''}`;

  return callGemini(prompt, 2000);
}

// ─── Seasonal Vegetables ─────────────────────────────────────────────────────

async function getSeasonalVegetables({ profile, language }) {
  const month = new Date().toLocaleString('en-IN', { month: 'long' });
  const state = profile?.state || 'Maharashtra';

  const prompt = `You are an expert in Indian seasonal vegetables and nutrition.

Provide seasonal vegetable information for ${state}, India in ${month}.

RESPONSE LANGUAGE: ${language} — ALL text must be in ${language}.

Return ONLY this JSON (no extra text):
{
  "vegetables": [
    {
      "name": "vegetable name in ${language}",
      "nameEn": "English name",
      "status": "in-season",
      "price": "₹XX/kg",
      "storage": "storage tip in ${language}",
      "health": "health benefit in ${language}",
      "dishes": ["dish 1 in ${language}", "dish 2", "dish 3"]
    }
  ],
  "tips": ["seasonal tip 1 in ${language}", "tip 2", "tip 3"]
}

Include 6-8 vegetables. Status must be one of: "in-season", "ending-soon", "coming-soon". Prices are approximate for ${month} in ${state}.`;

  return callGemini(prompt, 2000);
}

// ─── Local Trends ────────────────────────────────────────────────────────────

async function getLocalTrends({ profile, language }) {
  const state = profile?.state || 'Maharashtra';
  const city = profile?.city || '';

  const prompt = `You are an expert on Indian food trends.

List 6 trending dishes/foods in ${city ? city + ', ' : ''}${state}, India right now.

RESPONSE LANGUAGE: ${language} — ALL text must be in ${language}.

Return ONLY this JSON (no extra text):
{
  "trends": [
    {
      "name": "dish name in ${language}",
      "nameEn": "English name",
      "tag": "trend reason in ${language}",
      "emoji": "relevant emoji",
      "rank": 1
    }
  ]
}`;

  return callGemini(prompt, 1000);
}

// ─── Leftover Suggestions ────────────────────────────────────────────────────

async function getLeftoverSuggestions({ ingredients, profile, language }) {
  const prompt = `You are an expert Indian home cook.

The user has these leftover ingredients: ${ingredients.join(', ')}
Family diet: ${profile?.members?.[0]?.diet || 'vegetarian'}
Region: ${profile?.state || 'Maharashtra'}

RESPONSE LANGUAGE: ${language} — ALL text must be in ${language}.

Suggest 3 recipes using primarily these ingredients. Return ONLY this JSON (no extra text):
{
  "suggestions": [
    {
      "name": "recipe name in ${language}",
      "nameEn": "English name",
      "desc": "brief description in ${language}",
      "time": "XX min",
      "cost": "₹XX"
    }
  ]
}`;

  return callGemini(prompt, 800);
}

module.exports = { generateMealPlan, getSeasonalVegetables, getLocalTrends, getLeftoverSuggestions };
