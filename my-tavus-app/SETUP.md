# Aioli - AI Cooking Assistant Setup

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# OpenAI API Key for image analysis and recipe extraction
OPENAI_API_KEY=your_openai_api_key_here

# Tavus API Key for CVI persona and conversation management
TAVUS_API_KEY=your_tavus_api_key_here

# Server Port (optional, defaults to 3001)
PORT=3001
```

## Features Added

### Speech-to-Text Layer
- Uses existing persona with STT (Speech-to-Text) layer configuration
- Configured with Whisper model for accurate transcription
- Auto-punctuation and speaker diarization support

### Recipe Extraction
- Real-time recipe extraction from cooking conversations
- Displays structured recipe with ingredients, steps, cooking time, and servings
- Automatic detection of recipe-related conversations

### Transcription Display
- Live transcription of cooking conversations
- Separate display for user and AI chef messages
- Visual indicators for listening status
- Recipe cards that appear when cooking instructions are discussed

## API Endpoints Added

### POST /api/setup-cooking-conversation
Fetches existing persona and creates a conversation with it. Uses persona_id 'p5317866' by default.

### POST /api/extract-recipe
Extracts structured recipe information from conversation text.

## Usage Flow

1. Upload an image of ingredients
2. AI analyzes and identifies ingredients
3. Click "Start Cooking Conversation" to begin chat with AI chef
4. Have a conversation about cooking - recipes are automatically extracted and displayed
5. Transcription shows both sides of the conversation in real-time

## Components Added

- `Transcription` - Real-time conversation transcription with recipe extraction
- `useTranscription` - Hook for managing transcription state
- Enhanced `ImageProcess` - Now includes conversation interface

## Dependencies

All required dependencies are already included in package.json:
- @daily-co/daily-react for video calling
- React Router for navigation
- Express for server endpoints