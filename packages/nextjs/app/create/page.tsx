"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ImagePost } from "../page";
import { useAccount } from "wagmi";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { EtherInput } from "~~/components/scaffold-eth";

const CreatePage = () => {
  const router = useRouter();
  const { address: connectedAddress } = useAccount();

  const [prompt, setPrompt] = useState("");
  const [prizePool, setPrizePool] = useState("");
  const [generatedImageLocalPath, setGeneratedImageLocalPath] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateImage = async () => {
    if (!prompt || !prizePool) {
      console.error("Prompt and Prize Pool are required to generate an image.");
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedImageLocalPath("/images/test_image.jpg");
      setIsGenerating(false);
    }, 2000);
  };

  const handleSubmitChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatedImageLocalPath || !prompt || !prizePool || !connectedAddress) {
      console.error("Cannot submit challenge: Missing data or disconnected wallet.");
      return;
    }

    const newImagePost: ImagePost = {
      id: Date.now(),
      prompt: prompt,
      imageUrl: "/images/test_image.jpg",
      prizePool: prizePool,
      creator: connectedAddress,
    };

    try {
      const existingPostsString = localStorage.getItem("userImagePosts");
      const existingPosts: ImagePost[] = existingPostsString ? JSON.parse(existingPostsString) : [];
      localStorage.setItem("userImagePosts", JSON.stringify([...existingPosts, newImagePost]));
    } catch (error) {
      console.error("Failed to save image post to localStorage:", error);
    }

    router.push("/");
  };

  return (
    <div className="flex flex-col min-h-screen py-8 px-4 lg:px-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="btn btn-ghost">
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-4xl font-bold">Create New Challenge</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="flex-1 flex flex-col gap-6 p-4 border rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2">1. Define Your Challenge</h2>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-lg font-medium">Enter your prompt</span>
              <span className="label-text-alt">This will be used to generate the image.</span>
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="textarea textarea-bordered h-28 text-base"
              placeholder="e.g., A futuristic cityscape at sunset with flying cars..."
              required
              disabled={isGenerating || !!generatedImageLocalPath}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-lg font-medium">Set Prize Pool (ETH)</span>
              <span className="label-text-alt">Reward for guessing the prompt correctly.</span>
            </label>
            <EtherInput
              value={prizePool}
              onChange={value => setPrizePool(value)}
              placeholder="e.g., 0.1"
              disabled={isGenerating || !!generatedImageLocalPath}
            />
          </div>

          {!generatedImageLocalPath && (
            <button
              type="button"
              className={`btn btn-primary btn-lg w-full mt-4 ${isGenerating ? "loading" : ""}`}
              onClick={handleGenerateImage}
              disabled={!prompt || !prizePool || isGenerating}
            >
              {isGenerating ? "Generating Image..." : "Generate Image with AI"}
            </button>
          )}

          {generatedImageLocalPath && (
            <form onSubmit={handleSubmitChallenge} className="flex flex-col gap-4 mt-4">
              <p className="text-center text-success font-semibold">Image generated successfully!</p>
              <button type="submit" className="btn btn-accent btn-lg w-full">
                Create Challenge & Lock Prize
              </button>
            </form>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-4 text-center">2. Generated Image Preview</h2>
          {generatedImageLocalPath ? (
            <div className="card bg-base-100 shadow-xl w-full max-w-lg">
              <figure className="relative aspect-square">
                <Image src={generatedImageLocalPath} alt="AI Generated" fill className="object-cover rounded-t-lg" />
              </figure>
              <div className="card-body items-center text-center">
                <p className="italic">This is the image for your challenge.</p>
              </div>
            </div>
          ) : (
            <div className="card bg-base-200 aspect-square flex items-center justify-center w-full max-w-lg shadow-md">
              <div className="text-center p-4">
                <p className="text-xl opacity-60">Your AI-generated image will appear here.</p>
                <p className="text-sm opacity-50 mt-2">
                  Once you provide a prompt and prize pool, click &quot;Generate Image&quot;.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
