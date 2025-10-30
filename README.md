<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SoulSync: A Couple's Emotional Journal

A personal, emotionally intelligent app for couples that blends journaling, daily planning, and relationship growth. It uses AI to foster connection, gratitude, and presence through shared reflections, a daily planner, and real-time conversational support.

View your app in AI Studio: https://ai.studio/apps/drive/1_vDP7tHx1YWkw4DhbFGr6T5s_wUa4_dN

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key

3. Run the app:
   ```bash
   npm run dev
   ```

## Plasmic Integration

This project is configured for Plasmic integration. To complete the setup:

### Quick Setup

Run the interactive setup script:
```bash
./setup-plasmic.sh
```

### Manual Setup

1. Get your Plasmic Project ID from [Plasmic Studio](https://studio.plasmic.app)
2. See [PLASMIC_SETUP.md](PLASMIC_SETUP.md) for detailed instructions

### Sync Plasmic Designs

After configuration, sync your designs:
```bash
plasmic sync       # One-time sync
plasmic watch      # Continuous sync
```

## Project Structure

- `App.tsx` - Main application component
- `components/` - React components
- `src/components/plasmic/` - Plasmic-generated components (after sync)
- `contexts/` - React contexts
- `calendar-views/` - Calendar view components
- `firebaseConfig.ts` - Firebase configuration
- `types.ts` - TypeScript type definitions

## Technologies

- React 19.2.0
- TypeScript
- Vite
- Firebase 10.12.2
- Google Gemini AI
- Plasmic (design integration)
