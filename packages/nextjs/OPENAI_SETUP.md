# OpenAI Integration Setup

This application now uses OpenAI's DALL-E API to generate images from text prompts.

## Setup Instructions

1. **Get an OpenAI API Key:**

   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create an account or sign in
   - Generate a new API key

2. **Configure Environment Variables:**
   Create a `.env.local` file in the `packages/nextjs` directory with:

   ```
   OPENAI_API_KEY=your_actual_api_key_here
   ```

3. **Restart the Development Server:**
   After adding the API key, restart your Next.js development server:
   ```bash
   yarn dev
   ```

## Features

- **Real AI Image Generation:** Uses DALL-E 3 to create unique images from your prompts
- **High Quality Output:** Generates 1024x1024 images with standard quality
- **Error Handling:** Provides helpful error messages if the API fails
- **Secure:** API key is stored server-side only

## API Usage

The application makes requests to `/api/generate-image` which:

- Accepts a `prompt` in the request body
- Returns the generated image URL
- Handles errors gracefully

## Troubleshooting

- Make sure your OpenAI API key has sufficient credits
- Check that the API key is correctly set in `.env.local`
- Ensure you have a stable internet connection for API calls
