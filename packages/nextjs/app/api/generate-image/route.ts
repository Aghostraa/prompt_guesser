import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.log(process.env.OPENAI_API_KEY);
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Validate prompt length and content
    if (prompt.length > 4000) {
      return NextResponse.json(
        { error: 'Prompt is too long. Maximum 4000 characters allowed.' },
        { status: 400 }
      );
    }

    // Initialize OpenAI client with API key
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Generate image using DALL-E
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const imageUrl = response.data?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      imageUrl,
      success: true 
    });

  } catch (error: any) {
    console.error('Error generating image:', error);
    
    // Handle OpenAI specific errors
    if (error?.status === 400) {
      let errorMessage = 'Invalid prompt. ';
      
      if (error?.error?.message) {
        errorMessage += error.error.message;
      } else if (error?.type === 'image_generation_user_error') {
        errorMessage += 'The prompt may contain content that violates OpenAI\'s usage policies. Please try rephrasing your prompt with appropriate content.';
      } else {
        errorMessage += 'Please check your prompt and try again.';
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }
    
    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key' },
        { status: 401 }
      );
    }
    
    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate image. Please try again.' },
      { status: 500 }
    );
  }
} 