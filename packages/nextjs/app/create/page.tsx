"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { EtherInput } from "~~/components/scaffold-eth";

const CreatePage = () => {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [prizePool, setPrizePool] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    // TODO: Integrate with actual AI image generation API
    // For now, just use a placeholder
    setTimeout(() => {
      setGeneratedImage("https://picsum.photos/800/800");
      setIsGenerating(false);
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle submission to blockchain
    console.log({ prompt, generatedImage, prizePool });
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

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-lg">Enter your prompt</span>
              </label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                className="textarea textarea-bordered h-24"
                placeholder="Describe the image you want to generate..."
                required
              />
            </div>

            <button
              type="button"
              className={`btn btn-primary ${isGenerating ? "loading" : ""}`}
              onClick={handleGenerateImage}
              disabled={!prompt || isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate Image"}
            </button>

            {generatedImage && (
              <>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-lg">Prize Pool (ETH)</span>
                  </label>
                  <EtherInput value={prizePool} onChange={value => setPrizePool(value)} placeholder="Amount in ETH" />
                </div>

                <button type="submit" className="btn btn-primary" disabled={!prizePool}>
                  Create Challenge
                </button>
              </>
            )}
          </form>
        </div>

        <div className="flex-1">
          {generatedImage ? (
            <div className="card bg-base-100 shadow-xl">
              <figure className="relative aspect-square">
                <Image src={generatedImage} alt="AI Generated" fill className="object-cover" />
              </figure>
            </div>
          ) : (
            <div className="card bg-base-200 aspect-square flex items-center justify-center">
              <p className="text-lg opacity-50">Generated image will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
