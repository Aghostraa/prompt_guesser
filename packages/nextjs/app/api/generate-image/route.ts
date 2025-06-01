import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Helper function to upload image to Pinata IPFS
async function uploadToPinata(imageBuffer: Buffer): Promise<string> {
  console.log("🚀 Starting Pinata upload process...");
  console.log("📊 Image buffer size:", imageBuffer.length, "bytes");

  const PINATA_API_KEY = process.env.PINATA_API_KEY;
  const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

  console.log("🔑 Checking Pinata credentials...");
  console.log("📝 API Key present:", !!PINATA_API_KEY);
  console.log("🔐 Secret Key present:", !!PINATA_SECRET_KEY);

  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    console.error("❌ Pinata credentials not found!");
    throw new Error("Pinata API credentials required");
  }

  try {
    console.log("📦 Creating FormData for Pinata...");
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: "image/png" });
    const filename = `challenge-${Date.now()}.png`;
    formData.append("file", blob, filename);

    console.log("📁 File name:", filename);
    console.log("💾 Blob type:", blob.type);
    console.log("📏 Blob size:", blob.size, "bytes");

    // Optional: Add metadata
    const metadata = JSON.stringify({
      name: `Challenge Image ${Date.now()}`,
      keyvalues: {
        app: 'prompt-genius',
        type: 'challenge-image'
      }
    });
    formData.append("pinataMetadata", metadata);
    console.log("🏷️ Metadata added:", metadata);

    // Optional: Pin options
    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", options);
    console.log("⚙️ Pin options added:", options);

    console.log("🌐 Making request to Pinata API...");
    console.log("🔗 Pinata URL:", "https://api.pinata.cloud/pinning/pinFileToIPFS");

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
      body: formData,
    });

    console.log("📡 Pinata response status:", response.status);
    console.log("📋 Pinata response headers:", Object.fromEntries(response.headers));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Pinata upload failed!");
      console.error("💥 Status:", response.status);
      console.error("📝 Error response:", errorText);
      throw new Error(`Pinata upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ Pinata upload successful!");
    console.log("📊 Full Pinata response:", result);
    console.log("🔗 IPFS Hash:", result.IpfsHash);

    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
    console.log("🌍 Final IPFS URL:", ipfsUrl);

    return ipfsUrl;
  } catch (error: any) {
    console.error("💥 Pinata upload failed with error:", error);
    console.error("🔍 Error details:", error.message);
    throw new Error("Failed to upload to Pinata IPFS");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.log(process.env.OPENAI_API_KEY);
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    // Validate prompt length and content
    if (prompt.length > 4000) {
      return NextResponse.json({ error: "Prompt is too long. Maximum 4000 characters allowed." }, { status: 400 });
    }

    console.log("🎨 Starting image generation for prompt:", prompt);

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

    const tempImageUrl = response.data?.[0]?.url;
    console.log("🖼️ OpenAI generated image URL:", tempImageUrl);

    if (!tempImageUrl) {
      console.error("❌ No image URL returned from OpenAI");
      return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
    }

    // Download the image and upload to Pinata IPFS
    try {
      console.log("⬇️ Downloading image from OpenAI...");
      const imageResponse = await fetch(tempImageUrl);

      console.log("📡 Download response status:", imageResponse.status);
      console.log("📏 Content length:", imageResponse.headers.get("content-length"));
      console.log("🗂️ Content type:", imageResponse.headers.get("content-type"));

      if (!imageResponse.ok) {
        console.error("❌ Failed to download image from OpenAI");
        throw new Error(`Failed to download image: ${imageResponse.statusText}`);
      }

      const arrayBuffer = await imageResponse.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);
      console.log("✅ Image downloaded successfully, size:", imageBuffer.length, "bytes");

      console.log("☁️ Starting Pinata upload...");
      const ipfsUrl = await uploadToPinata(imageBuffer);

      console.log("🎉 Complete success! Final IPFS URL:", ipfsUrl);

      return NextResponse.json({
        imageUrl: ipfsUrl,
        success: true,
      });
    } catch (uploadError: any) {
      console.error("💥 Error in download/upload process:", uploadError);
      console.error("🔍 Upload error details:", uploadError.message);
      return NextResponse.json(
        { error: "Generated image but failed to upload to Pinata IPFS for permanent storage" },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("💥 General error in image generation:", error);

    // Handle OpenAI specific errors
    if (error?.status === 400) {
      let errorMessage = "Invalid prompt. ";

      if (error?.error?.message) {
        errorMessage += error.error.message;
      } else if (error?.type === "image_generation_user_error") {
        errorMessage +=
          "The prompt may contain content that violates OpenAI's usage policies. Please try rephrasing your prompt with appropriate content.";
      } else {
        errorMessage += "Please check your prompt and try again.";
      }

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    if (error?.status === 401) {
      return NextResponse.json({ error: "Invalid OpenAI API key" }, { status: 401 });
    }

    if (error?.status === 429) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
    }

    return NextResponse.json({ error: "Failed to generate image. Please try again." }, { status: 500 });
  }
}
