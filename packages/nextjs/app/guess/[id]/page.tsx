"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatEther, parseEther } from "viem";
import { useAccount, useBalance } from "wagmi";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  SparklesIcon,
  UserGroupIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import {
  BanknotesIcon as BanknotesIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  SparklesIcon as SparklesIconSolid,
} from "@heroicons/react/24/solid";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldEventHistory, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface Guess {
  address: `0x${string}`;
  guess: string;
  timestamp: number;
  isCorrect?: boolean;
}

interface PageParams {
  id: string;
}

interface ChallengeData {
  id: string;
  imageUrl: string;
  prizePool: string;
  creator: `0x${string}`;
  isActive: boolean;
  guesses: Guess[];
}

const FIXED_GUESS_FEE_ETH = "0.1";

const GuessPage = ({ params: paramsPromise }: { params: Promise<PageParams> }) => {
  const resolvedParams = use(paramsPromise);
  const { address: connectedAddress } = useAccount();
  const { data: userBalance } = useBalance({ address: connectedAddress });

  const [guess, setGuess] = useState("");
  const [challengeData, setChallengeData] = useState<ChallengeData | null>(null);
  const [isGuessingTxLoading, setIsGuessingTxLoading] = useState(false);
  const [notification, setNotification] = useState("");

  const challengeIdBigInt = resolvedParams.id ? BigInt(resolvedParams.id) : undefined;

  const { data: fetchedChallengeData, isLoading: isLoadingChallengeDetails } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getChallenge",
    args: [challengeIdBigInt],
  });

  const { writeContractAsync, isMining } = useScaffoldWriteContract({
    contractName: "YourContract",
  });

  const { data: guessEvents, isLoading: isLoadingGuessEvents } = useScaffoldEventHistory({
    contractName: "YourContract",
    eventName: "GuessMade",
    fromBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK || "0"),
    filters: { challengeId: challengeData?.id ? BigInt(challengeData.id) : undefined },
    blockData: true,
    transactionData: true,
    receiptData: true,
    watch: true,
  });

  useEffect(() => {
    if (fetchedChallengeData) {
      const contractChallenge = fetchedChallengeData as any;
      setChallengeData({
        id: contractChallenge.id.toString(),
        imageUrl: contractChallenge.imageUrl,
        prizePool: formatEther(contractChallenge.prizePool),
        creator: contractChallenge.creator as `0x${string}`,
        isActive: contractChallenge.isActive,
        guesses: [],
      });
    }
  }, [fetchedChallengeData]);

  useEffect(() => {
    if (guessEvents && fetchedChallengeData) {
      const contractData = fetchedChallengeData as any;

      try {
        const formattedGuesses = guessEvents
          .map(event => {
            // Add safety checks for event structure
            if (!event?.args || typeof event.args !== 'object') {
              console.warn('Invalid guess event structure:', event);
              return null;
            }

            const blockTimestamp = (event as any).blockTimestamp;
            return {
              address: event.args.guesser as `0x${string}`,
              guess: event.args.guessString || "",
              timestamp: blockTimestamp ? Number(blockTimestamp) * 1000 : Date.now(),
              isCorrect: event.args.isCorrect,
            } as Guess;
          })
          .filter((guess): guess is Guess => guess !== null);

        let calculatedPrizePoolWei = contractData.prizePool !== undefined ? BigInt(contractData.prizePool) : BigInt(0);
        let calculatedIsActive = contractData.isActive !== undefined ? contractData.isActive : true;

        for (const event of guessEvents) {
          if (event?.args && event.args.isCorrect) {
            calculatedPrizePoolWei = BigInt(0);
            calculatedIsActive = false;
            break;
          } else if (event?.args) {
            calculatedPrizePoolWei += parseEther(FIXED_GUESS_FEE_ETH);
          }
        }

        setChallengeData({
          id: contractData.id.toString(),
          imageUrl: contractData.imageUrl,
          creator: contractData.creator as `0x${string}`,
          guesses: formattedGuesses.sort((a, b) => b.timestamp - a.timestamp),
          prizePool: formatEther(calculatedPrizePoolWei),
          isActive: calculatedIsActive,
        });
      } catch (error) {
        console.error('Error processing guess events:', error);
        // Fallback to basic challenge data without guesses
        setChallengeData({
          id: contractData.id.toString(),
          imageUrl: contractData.imageUrl,
          creator: contractData.creator as `0x${string}`,
          guesses: [],
          prizePool: contractData.prizePool ? formatEther(contractData.prizePool) : "0",
          isActive: contractData.isActive !== undefined ? contractData.isActive : true,
        });
      }
    }
  }, [guessEvents, fetchedChallengeData]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(""), 7000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSubmitGuess = async (_e: React.FormEvent) => {
    _e.preventDefault();
    setNotification("");

    if (!guess || !challengeData) {
      setNotification("Error: Guess cannot be empty or challenge data not loaded.");
      return;
    }
    if (!challengeData.isActive) {
      setNotification("Error: This challenge is no longer active.");
      return;
    }
    if (!connectedAddress) {
      setNotification("Error: Please connect your wallet to make a guess.");
      return;
    }

    const feeInWei = parseEther(FIXED_GUESS_FEE_ETH);
    if (userBalance && userBalance.value < feeInWei) {
      setNotification("Error: Insufficient balance to pay the guessing fee.");
      return;
    }

    setIsGuessingTxLoading(true);

    try {
      await writeContractAsync({
        functionName: "makeGuess",
        args: [BigInt(challengeData.id), guess.trim()],
        value: feeInWei,
      });
      setNotification("Guess submitted! Waiting for confirmation...");
      setGuess("");
    } catch (error: any) {
      console.error("Error submitting guess:", error);
      setNotification(`Error: ${error.shortMessage || error.message || "Failed to submit guess."}`);
    } finally {
    }
  };

  useEffect(() => {
    setIsGuessingTxLoading(isMining);
  }, [isMining]);

  if (!challengeData && (isLoadingGuessEvents || isLoadingChallengeDetails)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-purple-950 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-spin">
            <ArrowPathIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Loading Challenge...</h2>
          <p className="text-gray-600 dark:text-gray-400">Fetching the latest data from the blockchain</p>
        </div>
      </div>
    );
  }

  if (!challengeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-purple-950 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Challenge Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            This challenge doesn&apos;t exist or there was an error loading it. Please check the URL and try again.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            View All Challenges
          </Link>
        </div>
      </div>
    );
  }

  const correctGuess = challengeData.guesses.find(g => g.isCorrect);
  const totalGuesses = challengeData.guesses.length;
  const uniqueGuessers = new Set(challengeData.guesses.map(g => g.address)).size;

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

      {/* Winner Banner - Show when challenge is solved */}
      {correctGuess && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center space-x-3">
              <CheckCircleIconSolid className="w-6 h-6" />
              <div className="text-center">
                <div className="text-lg font-bold">🎉 Challenge Solved!</div>
                <div className="text-sm opacity-90">
                  Winner: <Address address={correctGuess.address} /> 
                  {" • "}
                  Winning prompt: &quot;{correctGuess.guess}&quot;
                </div>
              </div>
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
              <span className="text-sm font-medium">Back to Challenges</span>
            </Link>
          </div>

          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-full">
                <SparklesIconSolid className="w-5 h-5" />
                <span className="font-semibold">Challenge #{challengeData.id}</span>
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Guess the Prompt
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Study the AI-generated image and try to guess the exact prompt that created it!
            </p>
          </div>
        </div>
      </div>

      {/* Challenge Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{uniqueGuessers}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Unique Players</div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <LightBulbIcon className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalGuesses}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Guesses</div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <BanknotesIconSolid className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{challengeData.prizePool} ETH</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Prize Pool</div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div
                className={`w-12 h-12 rounded-2xl ${challengeData.isActive ? "bg-emerald-500/10" : "bg-red-500/10"} flex items-center justify-center`}
              >
                {challengeData.isActive ? (
                  <SparklesIcon className="w-6 h-6 text-emerald-500" />
                ) : (
                  <CheckCircleIcon className="w-6 h-6 text-red-500" />
                )}
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {challengeData.isActive ? "Active" : "Solved"}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Challenge Status</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Panel - Image and Details */}
          <div className="space-y-8">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/20">
              {/* Image */}
              <div className="relative aspect-square">
                <Image
                  src={challengeData.imageUrl}
                  alt={`Challenge Image ${challengeData.id}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Status Badge */}
                <div
                  className={`absolute top-4 right-4 ${
                    challengeData.isActive
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : "bg-gradient-to-r from-red-500 to-rose-500"
                  } text-white px-3 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm`}
                >
                  <div className="flex items-center space-x-1">
                    {challengeData.isActive ? (
                      <>
                        <SparklesIconSolid className="w-4 h-4" />
                        <span>Active Challenge</span>
                      </>
                    ) : (
                      <>
                        <CheckCircleIconSolid className="w-4 h-4" />
                        <span>Challenge Solved!</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Challenge ID */}
                <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                  #{challengeData.id}
                </div>
              </div>

              {/* Challenge Info */}
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserGroupIcon className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-600 dark:text-gray-400">Created by:</span>
                    <Address address={challengeData.creator} />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BanknotesIconSolid className="w-5 h-5 text-green-500" />
                      <span className="text-green-700 dark:text-green-300 font-medium">Current Prize Pool:</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {challengeData.prizePool} ETH
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm bg-purple-500/10 rounded-2xl p-4">
                  <div className="flex items-center space-x-2">
                    <BanknotesIcon className="w-5 h-5 text-purple-500" />
                    <span className="text-purple-700 dark:text-purple-300 font-medium">Guessing Fee:</span>
                  </div>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">{FIXED_GUESS_FEE_ETH} ETH</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Guessing Form and History */}
          <div className="space-y-8">
            {/* Guessing Form */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Make Your Guess</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Study the image carefully and try to guess the exact prompt that created it
                  </p>
                </div>

                <form onSubmit={handleSubmitGuess} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Your Guess</label>
                    <div className="relative">
                      <textarea
                        value={guess}
                        onChange={e => setGuess(e.target.value)}
                        className="w-full h-32 px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none disabled:opacity-50"
                        placeholder="e.g., A majestic dragon soaring over a crystal mountain range at sunset..."
                        disabled={!challengeData.isActive || isGuessingTxLoading}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={!challengeData.isActive || isGuessingTxLoading || !connectedAddress}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      {isGuessingTxLoading ? (
                        <>
                          <ArrowPathIcon className="w-5 h-5 animate-spin" />
                          <span>Submitting Guess...</span>
                        </>
                      ) : !connectedAddress ? (
                        <>
                          <SparklesIcon className="w-5 h-5" />
                          <span>Connect Wallet to Guess</span>
                        </>
                      ) : !challengeData.isActive ? (
                        <>
                          <CheckCircleIcon className="w-5 h-5" />
                          <span>Challenge Completed</span>
                        </>
                      ) : (
                        <>
                          <LightBulbIcon className="w-5 h-5" />
                          <span>Submit Guess ({FIXED_GUESS_FEE_ETH} ETH)</span>
                        </>
                      )}
                    </div>
                  </button>
                </form>
              </div>
            </div>

            {/* Guess History */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Guess History</h2>
                  <p className="text-gray-600 dark:text-gray-400">Previous attempts to solve this challenge</p>
                </div>

                <div className="space-y-4">
                  {challengeData.guesses.length === 0 ? (
                    <div className="text-center py-8">
                      <LightBulbIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No guesses yet. Be the first to try!</p>
                    </div>
                  ) : (
                    challengeData.guesses.map((guess, index) => (
                      <div
                        key={index}
                        className={`bg-white/50 dark:bg-gray-700/50 rounded-2xl p-4 border ${
                          guess.isCorrect
                            ? "border-green-200 dark:border-green-800"
                            : "border-gray-200 dark:border-gray-600"
                        }`}
                        style={{
                          animationName: "fadeInUp",
                          animationDuration: "0.6s",
                          animationTimingFunction: "ease-out",
                          animationFillMode: "forwards",
                          animationDelay: `${index * 100}ms`,
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Address address={guess.address} />
                              <span className="text-gray-400 dark:text-gray-500">•</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(guess.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-gray-900 dark:text-white font-medium">&quot;{guess.guess}&quot;</p>
                          </div>
                          <div className={`ml-4 ${guess.isCorrect ? "text-green-500" : "text-red-500"}`}>
                            {guess.isCorrect ? (
                              <CheckCircleIconSolid className="w-6 h-6" />
                            ) : (
                              <XCircleIcon className="w-6 h-6" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
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
            transform: translateY(20px);
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

export default GuessPage;
