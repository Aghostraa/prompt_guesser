"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { keccak256, parseEther, stringToBytes, formatEther } from "viem";
import { useAccount, useBalance } from "wagmi";
import { 
  ArrowLeftIcon,
  SparklesIcon,
  PhotoIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  BanknotesIcon,
  CpuChipIcon
} from "@heroicons/react/24/outline";
import { 
  SparklesIcon as SparklesIconSolid,
  CheckCircleIcon as CheckCircleIconSolid
} from "@heroicons/react/24/solid";
import { EtherInput } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

const CreatePage = () => {
  const router = useRouter();
  const { address: connectedAddress } = useAccount();
  const { data: balance } = useBalance({ address: connectedAddress });
  const { targetNetwork } = useTargetNetwork();

  const [currentStep, setCurrentStep] = useState(1);
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

  // Check if the entered prize pool exceeds user's balance
  const prizePoolExceedsBalance = () => {
    if (!balance || !prizePool) return false;
    try {
      const prizePoolWei = parseEther(prizePool);
      return prizePoolWei > balance.value;
    } catch {
      return false; // Invalid input
    }
  };

  const isInsufficientBalance = prizePoolExceedsBalance();

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setNotification("Error: Please enter a prompt before generating an image.");
      return;
    }

    if (!prizePool.trim()) {
      setNotification("Error: Please enter a prize pool amount.");
      return;
    }

    // Check balance before proceeding
    if (balance && prizePool) {
      try {
        const prizePoolWei = parseEther(prizePool);
        if (prizePoolWei > balance.value) {
          setNotification("Error: Prize pool amount exceeds your account balance.");
          return;
        }
      } catch {
        setNotification("Error: Invalid prize pool amount entered.");
        return;
      }
    }

    setIsGenerating(true);
    setCurrentStep(2);
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific OpenAI content policy violations gracefully
        if (response.status === 400 && data.error?.includes('content policy')) {
          setNotification("Error: Your prompt may contain inappropriate content. Please try rephrasing with family-friendly language.");
        } else if (data.error?.includes('usage policies')) {
          setNotification("Error: Please rephrase your prompt to comply with content guidelines.");
        } else {
          setNotification(`Error: ${data.error || 'Failed to generate image. Please try again.'}`);
        }
        setCurrentStep(1); // Go back to step 1 on error
        return; // Don't throw error, just return
      }

      if (data.success && data.imageUrl) {
        setGeneratedImageLocalPath(data.imageUrl);
        setCurrentStep(3);
      } else {
        setNotification("Error: Unexpected response from image generation. Please try again.");
        setCurrentStep(1); // Go back to step 1 on error
      }
    } catch (error) {
      // Only console.warn for network errors, not user input errors
      console.warn('Network error during image generation:', error);
      setNotification("Error: Network error occurred. Please check your connection and try again.");
      setCurrentStep(1); // Go back to step 1 on error
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification("");

    if (!generatedImageLocalPath || !prompt || !txValue || !connectedAddress) {
      setNotification("Error: Missing data, wallet not connected, or transaction value not set.");
      return;
    }

    // Additional check for Flow networks
    if (targetNetwork.id === 545 || targetNetwork.id === 747) {
      setNotification("🌊 Submitting to Flow network... This may take a moment.");
    }

    try {
      setIsSubmittingChallenge(true);
      setCurrentStep(4);
      const normalizedPrompt = prompt.trim().toLowerCase();
      const promptBytes = stringToBytes(normalizedPrompt);
      const hashedPrompt = keccak256(promptBytes);
      console.log("Normalized prompt for hashing (all whitespace removed):", normalizedPrompt);
      console.log("Hashed prompt:", hashedPrompt);
      console.log("Image URL:", generatedImageLocalPath);
      console.log("Initial Prize Pool (argument to contract _initialPrizePool):", "0");
      console.log("Transaction Value (msg.value):", txValue);
      console.log("Target Network:", targetNetwork.name, "Chain ID:", targetNetwork.id);

      await writeContractAsync({
        functionName: "createChallenge",
        args: [hashedPrompt, generatedImageLocalPath, parseEther("0")],
        value: parseEther(txValue),
      });

      // Only Flowscan notifications will show - no app UI notifications
      setCurrentStep(5);
      setTimeout(() => router.push("/"), 3000);
    } catch (error) {
      console.error("Error creating challenge:", error);
      
      // Provide Flow-specific error guidance
      if (targetNetwork.id === 545 || targetNetwork.id === 747) {
        setNotification("Error: Failed to create challenge on Flow network. Make sure Flow network is added to your wallet and you have FLOW tokens for gas fees.");
      } else {
        setNotification("Error: Failed to create challenge. Check console for details.");
      }
      setCurrentStep(3); // Go back to previous step
    } finally {
      setIsSubmittingChallenge(false);
    }
  };

  const steps = [
    { id: 1, title: "Create Prompt", description: "Define your AI image prompt", icon: SparklesIcon },
    { id: 2, title: "Generate Image", description: "AI creates your image", icon: CpuChipIcon },
    { id: 3, title: "Review & Deploy", description: "Lock in your challenge", icon: LockClosedIcon },
    { id: 4, title: "Deploying", description: "Submitting to blockchain", icon: BanknotesIcon },
    { id: 5, title: "Complete", description: "Challenge is live!", icon: CheckCircleIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-purple-950 dark:to-indigo-950">
      {/* Notification */}
      {notification && (
        <div className="fixed top-24 right-4 z-50 animate-fade-in">
          <div
            className={`alert ${
              notification.startsWith("Error") 
                ? "bg-red-500/90 text-white border-red-600" 
                : "bg-green-500/90 text-white border-green-600"
            } shadow-2xl backdrop-blur-lg border rounded-2xl max-w-sm`}
          >
            <div className="flex items-center space-x-2">
              {notification.startsWith("Error") ? (
                <ExclamationTriangleIcon className="w-5 h-5" />
              ) : (
                <CheckCircleIconSolid className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">{notification}</span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 mb-8">
            <Link 
              href="/" 
              className="group flex items-center space-x-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300"
            >
              <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
          </div>

          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-full">
                <SparklesIconSolid className="w-5 h-5" />
                <span className="font-semibold">Create New Challenge</span>
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Craft Your Challenge
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Create an AI-generated image, set a prize pool, and challenge others to guess your prompt!
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const IconComponent = step.icon;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center space-y-2">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isCompleted
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white scale-110"
                          : isCurrent
                          ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white scale-110 animate-pulse"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircleIconSolid className="w-6 h-6" />
                      ) : (
                        <IconComponent className="w-6 h-6" />
                      )}
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-semibold ${isCurrent ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-400"}`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 h-1 mx-4 transition-all duration-500 ${
                        currentStep > step.id ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Flow Network Info Banner */}
        {(targetNetwork.id === 545 || targetNetwork.id === 747) && (
          <div className="mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-2xl p-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">🌊</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    Using Flow Network
                  </h3>
                  <div className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
                    <p>
                      You're creating a challenge on <strong>{targetNetwork.name}</strong>. Make sure you have:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>FLOW tokens for transaction fees</li>
                      <li>Flow network added to your wallet</li>
                      <li>Sufficient balance for the prize pool amount</li>
                    </ul>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
                      If you need to add Flow network to MetaMask, switch networks and use the "Add Flow to MetaMask" option.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Panel - Form */}
          <div className="space-y-8">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Define Your Challenge
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Create a unique prompt and set the prize pool for your challenge
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        AI Image Prompt
                      </label>
                      <div className="relative">
                        <textarea
                          value={prompt}
                          onChange={e => setPrompt(e.target.value)}
                          className="w-full h-32 px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                          placeholder="e.g., A majestic dragon soaring over a crystal mountain range at sunset, digital art style..."
                          required
                        />
                        <div className="absolute bottom-3 right-3 flex items-center space-x-1 text-xs text-gray-400">
                          <EyeIcon className="w-4 h-4" />
                          <span>Keep it secret!</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        This prompt will be hashed and hidden until someone guesses correctly
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Prize Pool (FLOW)
                      </label>
                      <div className="relative">
                        <BanknotesIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                        <EtherInput
                          value={prizePool}
                          onChange={value => setPrizePool(value)}
                          placeholder="0.1"
                        />
                      </div>
                      
                      {/* Balance display and validation */}
                      <div className="mt-2 space-y-1">
                        {balance && connectedAddress && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">
                              Your balance: <span className="font-medium text-gray-700 dark:text-gray-300">
                                {parseFloat(formatEther(balance.value)).toFixed(4)} FLOW
                              </span>
                            </span>
                            {prizePool && !isInsufficientBalance && (
                              <span className="text-green-600 dark:text-green-400 text-xs">✓ Valid amount</span>
                            )}
                          </div>
                        )}

                        {!connectedAddress && (
                          <div className="flex items-center space-x-1 text-amber-600 dark:text-amber-400 text-xs">
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            <span>Connect your wallet to see your balance</span>
                          </div>
                        )}
                        
                        {isInsufficientBalance && (
                          <div className="flex items-center space-x-1 text-red-600 dark:text-red-400 text-xs">
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            <span>Insufficient balance for this prize pool</span>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          This FLOW will be locked in the smart contract as the reward
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    onClick={handleGenerateImage}
                    disabled={!prompt || !prizePool || isGenerating || isInsufficientBalance}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <SparklesIcon className="w-5 h-5" />
                      <span>
                        {isInsufficientBalance 
                          ? "Insufficient Balance" 
                          : "Generate AI Image"
                        }
                      </span>
                    </div>
                  </button>
                </div>
              )}

              {currentStep >= 3 && generatedImageLocalPath && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Review & Deploy
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Confirm your challenge details and deploy to the blockchain
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 border border-purple-200 dark:border-purple-700">
                      <div className="flex items-center space-x-2 mb-2">
                        <SparklesIcon className="w-5 h-5 text-purple-600" />
                        <span className="font-semibold text-purple-900 dark:text-purple-300">Your Prompt</span>
                      </div>
                      <p className="text-purple-800 dark:text-purple-200 text-sm">
                        &quot;{prompt}&quot;
                      </p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 border border-green-200 dark:border-green-700">
                      <div className="flex items-center space-x-2 mb-2">
                        <BanknotesIcon className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-900 dark:text-green-300">Prize Pool</span>
                      </div>
                      <p className="text-green-800 dark:text-green-200 text-lg font-bold">
                        {prizePool} FLOW
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitChallenge}>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      disabled={isSubmittingChallenge || !connectedAddress}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <LockClosedIcon className="w-5 h-5" />
                        <span>Create Challenge & Lock Prize</span>
                      </div>
                    </button>
                  </form>
                </div>
              )}

              {currentStep === 4 && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6 animate-spin">
                    <CpuChipIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    Deploying to Blockchain
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your challenge is being submitted to the Flow network...
                  </p>
                </div>
              )}

              {currentStep === 5 && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6">
                    <CheckCircleIconSolid className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    Challenge Created Successfully!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Your challenge is now live and ready for players to guess!
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                  >
                    View All Challenges
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Image Preview */}
          <div className="space-y-8">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Image Preview
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your AI-generated challenge image
                  </p>
                </div>

                <div className="relative">
                  {isGenerating && (
                    <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl flex items-center justify-center border-2 border-dashed border-purple-300 dark:border-purple-600">
                      <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-spin">
                          <CpuChipIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            AI is creating your image...
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            This may take a few moments
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {generatedImageLocalPath && !isGenerating && (
                    <div className="relative aspect-square overflow-hidden rounded-2xl border-4 border-gradient-to-r from-purple-200 to-blue-200 dark:from-purple-700 dark:to-blue-700">
                      <Image 
                        src={generatedImageLocalPath} 
                        alt="AI Generated Challenge Image" 
                        fill 
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        ✓ Ready
                      </div>
                    </div>
                  )}

                  {!generatedImageLocalPath && !isGenerating && (
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700/20 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <div className="text-center space-y-4">
                        <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto" />
                        <div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Image Preview
                          </div>
                          <div className="text-gray-600 dark:text-gray-400 text-sm">
                            Your AI-generated image will appear here after you provide a prompt and generate it
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {generatedImageLocalPath && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <PhotoIcon className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-900 dark:text-blue-300">Challenge Image</span>
                    </div>
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      This image will be shown to players who attempt to guess your prompt. 
                      Make sure it represents your prompt well!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CreatePage;
