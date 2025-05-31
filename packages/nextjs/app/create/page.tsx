"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { keccak256, parseEther, stringToBytes } from "viem";
import { useAccount } from "wagmi";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { EtherInput } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const CreatePage = () => {
  const router = useRouter();
  const { address: connectedAddress } = useAccount();

  const [prompt, setPrompt] = useState("");
  const [prizePool, setPrizePool] = useState("");
  const [txValue, setTxValue] = useState("");
  const [generatedImageLocalPath, setGeneratedImageLocalPath] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmittingChallenge, setIsSubmittingChallenge] = useState(false);
  const [notification, setNotification] = useState("");

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "YourContract",
  });

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    setTxValue(prizePool);
  }, [prizePool]);

  const handleGenerateImage = async () => {
    if (!prompt || !prizePool) {
      setNotification("Error: Prompt and Initial Prize Pool amount are required.");
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedImageLocalPath("/images/test_image.jpg");
      setIsGenerating(false);
    }, 1500);
  };

  const handleSubmitChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification("");

    if (!generatedImageLocalPath || !prompt || !txValue || !connectedAddress) {
      setNotification("Error: Missing data, wallet not connected, or transaction value not set.");
      return;
    }

    try {
      setIsSubmittingChallenge(true);
      const promptBytes = stringToBytes(prompt.toLowerCase().trim());
      const hashedPrompt = keccak256(promptBytes);
      console.log("Hashed prompt:", hashedPrompt);
      console.log("Image URL:", "/images/test_image.jpg");
      console.log("Initial Prize Pool (argument to contract _initialPrizePool):", "0");
      console.log("Transaction Value (msg.value):", txValue);

      await writeContractAsync({
        functionName: "createChallenge",
        args: [hashedPrompt, "/images/test_image.jpg", parseEther("0")],
        value: parseEther(txValue),
      });

      setNotification("Challenge created successfully! Redirecting...");
      setTimeout(() => router.push("/"), 2000);
    } catch (error) {
      console.error("Error creating challenge:", error);
      setNotification("Error: Failed to create challenge. Check console.");
    } finally {
      setIsSubmittingChallenge(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen py-8 px-4 lg:px-8">
      {notification && (
        <div
          className={`alert ${notification.startsWith("Error") ? "alert-error" : "alert-success"} shadow-lg mb-4 fixed top-4 right-4 z-50 w-auto`}
        >
          <div>
            <span>{notification}</span>
          </div>
        </div>
      )}
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
              <span className="label-text-alt">This will be hashed. Keep it secret!</span>
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="textarea textarea-bordered h-28 text-base"
              placeholder="e.g., A futuristic cityscape at sunset with flying cars..."
              required
              disabled={isGenerating || !!generatedImageLocalPath || isSubmittingChallenge}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-lg font-medium">Initial Prize Pool (ETH)</span>
              <span className="label-text-alt">This ETH will be sent to the contract.</span>
            </label>
            <EtherInput
              value={prizePool}
              onChange={value => setPrizePool(value)}
              placeholder="e.g., 0.1"
              disabled={isGenerating || !!generatedImageLocalPath || isSubmittingChallenge}
            />
          </div>

          {!generatedImageLocalPath && (
            <button
              type="button"
              className={`btn btn-primary btn-lg w-full mt-4 ${isGenerating ? "loading" : ""}`}
              onClick={handleGenerateImage}
              disabled={!prompt || !prizePool || isGenerating || isSubmittingChallenge}
            >
              {isGenerating ? "Generating Image..." : "Generate Image with AI"}
            </button>
          )}

          {generatedImageLocalPath && (
            <form onSubmit={handleSubmitChallenge} className="flex flex-col gap-4 mt-4">
              <p className="text-center text-success font-semibold">Image ready for challenge!</p>
              <button
                type="submit"
                className={`btn btn-accent btn-lg w-full ${isSubmittingChallenge ? "loading" : ""}`}
                disabled={isSubmittingChallenge || !connectedAddress}
              >
                {isSubmittingChallenge ? "Submitting to Blockchain..." : "Create Challenge & Lock Prize"}
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
