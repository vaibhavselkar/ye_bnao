# Ye Bnao — AI Indian Cooking Companion

A React Native Expo app for Indian women to plan daily meals, manage grocery lists, and discover seasonal vegetables using AI.

## Project Structure

```
ye-bnao/           ← React Native Frontend (Expo)
ye-bnao-backend/   ← Node.js Express Backend
```

## Frontend Setup

```bash
cd ye-bnao
npm install
npx expo start
```

### Environment Variables (Frontend)
Create `.env` in `ye-bnao/`:
```
EXPO_PUBLIC_API_URL=http://localhost:3001
```

## Backend Setup

```bash
cd ye-bnao-backend
npm install
cp .env.example .env
# Edit .env with your Anthropic API key
npm run dev
```

### Environment Variables (Backend)
```
ANTHROPIC_API_KEY=your_key_here
PORT=3001
```

## Features
- 🌏 24 Indian languages + English + Hinglish
- 🍛 AI-generated daily meal plans (Claude API)
- 🥬 Seasonal vegetable guide (Sabzi Guide)
- 🛒 Smart grocery list with WhatsApp sharing
- 📈 Local food trends
- 🥣 Leftover ingredient recipe suggestions
- 🪔 Festival & fasting mode
- 💊 Health condition dietary adjustments

## Tech Stack
- **Frontend**: React Native + Expo SDK 55
- **Navigation**: React Navigation v7
- **Localization**: react-i18next (24 languages)
- **State**: React Context + AsyncStorage
- **Backend**: Node.js + Express
- **AI**: Anthropic Claude claude-sonnet-4-20250514
