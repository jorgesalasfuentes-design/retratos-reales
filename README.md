# Retratos Reales v2.0 - AI Pet Portraits

Transform your pet photos into stunning AI-generated artwork with auto-detection and 900 unique style variants.

## Features

### 🔍 Auto-Detection
- Automatically detects breed, fur colors, markings, coat type
- Identifies humans in photos with handling options
- Uses Claude Vision API for accurate trait extraction

### 🎨 9 Styles × 100 Variants = 900 Options
- 👑 Royal Portrait
- 🎨 Pop Art  
- 🚀 Space Explorer
- 🎭 Renaissance Master
- 🐉 Fantasy Hero
- 🎬 Film Noir
- 🌸 Japanese Art
- 🤖 Cyberpunk
- 🌈 GO CRAZY (wild/random)

### ✨ Custom Prompts
- Write your own creative vision
- Identity strictness slider: Strict / Balanced / Wild
- Safety constraints automatically applied

### 👥 Human Handling
- Style humans together with dogs
- Remove humans from output
- Preserve human identity (face, age, gender)

## Deployment to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Retratos Reales v2.0"
git remote add origin https://github.com/YOUR_USERNAME/retratos-reales.git
git push -u origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables:
   - `ANTHROPIC_API_KEY` - Your Claude API key
   - `FAL_API_KEY` - Your fal.ai API key
4. Deploy!

## Local Development

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your API keys
npm run dev
```

## API Keys Required

### Anthropic (Claude Vision for detection)
- Get key at: https://console.anthropic.com
- Cost: ~$0.01 per detection

### fal.ai (FLUX Kontext for generation)
- Get key at: https://fal.ai
- Cost: ~$0.04 per image

## Tech Stack
- Next.js 14 (App Router)
- Claude Vision API (detection)
- fal.ai FLUX Kontext Pro (generation)
- PWA-ready

## License
Property of Pet's Table / Retratos Reales
