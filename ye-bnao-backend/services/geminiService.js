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

// ─── Meal Plan (Full Week) ────────────────────────────────────────────────────

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS_LOCAL = { en: DAYS, hi: ['सोमवार','मंगलवार','बुधवार','गुरुवार','शुक्रवार','शनिवार','रविवार'] };

function buildFamilyContext(profile) {
  const members = profile.members || [];
  const diets = profile.diets || [profile.diet || members[0]?.diet || 'vegetarian'];
  const spices = profile.spices || [profile.spice || members[0]?.spice || 3];
  const diet = diets.join(', ');
  const spice = Math.max(...spices);
  const spiceLabel = spices.map(s => s <= 2 ? 'mild' : s >= 4 ? 'very spicy' : 'medium').join(' & ');
  const focuses = profile.foodFocuses || (profile.foodFocus ? [profile.foodFocus] : ['normal']);
  const focus = focuses.join(', ');
  const count = profile.memberCount || members.length || 1;
  const healthConditions = members.flatMap(m => m.health || []).filter(Boolean);
  const healthRules = healthConditions
    .map(h => HEALTH_RULES[h.toLowerCase().replace(/\s/g, '')] || '').filter(Boolean).join(' ');
  return { diet, spice, spiceLabel, focus, count, healthConditions, healthRules };
}

// Week plan uses compact schema (no steps) for speed. Steps loaded on RecipeDetail tap.
const MEAL_SCHEMA = `{ "name": "", "nameEn": "", "desc": "", "time": "XX min", "cost": "₹XX", "ingredients": ["item1","item2"] }`;

async function generateWeekPlan({ profile, language, history = [] }) {
  const month = new Date().toLocaleString('en-IN', { month: 'long' });
  const { diet, spice, spiceLabel, focus, count, healthConditions, healthRules } = buildFamilyContext(profile);
  const recentDishes = history.map(h => h.name).join(', ') || 'none';

  const prompt = `You are an expert Indian home cook. Generate a FULL WEEK (Monday–Sunday) meal plan for an Indian family.

FAMILY:
- Name: ${profile.name}
- Members: ${count} people
- Location: ${profile.city || 'India'}, ${profile.state || 'Maharashtra'}
- Cuisine: ${profile.cuisine || 'Mixed Indian'}
- Diet: ${diet}
- Spice level: ${spiceLabel} (${spice}/5)
- Food focus: ${focus}
- Health conditions: ${healthConditions.join(', ') || 'none'}
${healthRules ? `- Health rules: ${healthRules}` : ''}
- Avoid repeating: ${recentDishes}
- Season: ${month}

LANGUAGE: ${language} — ALL text (names, descriptions, ingredients, steps) must be in ${language}.

Return ONLY valid JSON:
{
  "week": [
    {
      "day": "Monday",
      "breakfast": ${MEAL_SCHEMA},
      "lunch": ${MEAL_SCHEMA},
      "snack": ${MEAL_SCHEMA},
      "dinner": ${MEAL_SCHEMA}
    }
  ]
}

Rules:
- Exactly 7 days (Monday to Sunday)
- No repeated dish across the entire week
- Authentic ${profile.cuisine || 'Indian'} recipes, practical for home cooking
- Scale ingredients for ${count} people
- ${diet === 'nonVegetarian' ? 'Include chicken/fish/eggs 3-4 times in the week' : diet === 'eggetarian' ? 'Eggs allowed, no meat' : 'Strictly vegetarian, no eggs/meat'}`;

  return callGemini(prompt, 8192);
}

async function regenerateSingleMeal({ profile, language, dayIndex, mealType, currentWeekPlan }) {
  const month = new Date().toLocaleString('en-IN', { month: 'long' });
  const { diet, spice, count } = buildFamilyContext(profile);
  const spiceLabel = spice <= 2 ? 'mild' : spice >= 4 ? 'very spicy' : 'medium spicy';
  const dayName = DAYS[dayIndex] || 'Monday';

  // Collect all existing meals to avoid repeating
  const existingMeals = [];
  if (currentWeekPlan?.week) {
    currentWeekPlan.week.forEach(d => {
      ['breakfast','lunch','snack','dinner'].forEach(type => {
        if (d[type]?.nameEn) existingMeals.push(d[type].nameEn);
      });
    });
  }

  const prompt = `You are an expert Indian home cook. Suggest ONE alternative ${mealType} for ${dayName} for an Indian family.

FAMILY:
- Cuisine: ${profile.cuisine || 'Mixed Indian'}
- Diet: ${diet}, Spice: ${spiceLabel}, Members: ${count}
- Season: ${month}
- Do NOT suggest any of these (already in plan): ${existingMeals.join(', ')}

LANGUAGE: ${language}

Return ONLY valid JSON (just the single meal object):
${MEAL_SCHEMA}`;

  return callGemini(prompt, 2500);
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

module.exports = { generateWeekPlan, regenerateSingleMeal, getSeasonalVegetables, getLocalTrends, getLeftoverSuggestions };
