"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { hardhat } from "viem/chains";
import {
  BanknotesIcon,
  ClockIcon,
  PhotoIcon,
  PlusIcon,
  SparklesIcon,
  TrophyIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import {
  BanknotesIcon as BanknotesIconSolid,
  ExclamationTriangleIcon,
  SparklesIcon as SparklesIconSolid,
} from "@heroicons/react/24/solid";
import { LeaderboardWidget } from "~~/components/LeaderboardWidget";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

interface ImagePost {
  id: bigint;
  prompt?: string;
  imageUrl: string;
  prizePool: string;
  creator: `0x${string}`;
}

const Home: NextPage = () => {
  const [allImages, setAllImages] = useState<ImagePost[]>([]);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "solved">("active");

  const { data: challengeEvents, isLoading: isLoadingEvents } = useScaffoldEventHistory({
    contractName: "YourContract",
    eventName: "ChallengeCreated",
    fromBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK || "0"),
    watch: true,
  });

  const { data: guessEvents } = useScaffoldEventHistory({
    contractName: "YourContract",
    eventName: "GuessMade",
    fromBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK || "0"),
    watch: true,
  });

  const { targetNetwork } = useTargetNetwork();

  useEffect(() => {
    setIsLoadingChallenges(isLoadingEvents);

    // Handle case where contract might not exist on the network
    if (challengeEvents) {
      try {
        const formattedChallenges = challengeEvents
          .map(event => {
            // Add comprehensive safety checks for event structure
            if (
              !event?.args ||
              typeof event.args !== "object" ||
              event.args.challengeId === undefined ||
              event.args.imageUrl === undefined ||
              event.args.creator === undefined ||
              typeof event.args.creator !== "string" ||
              !event.args.creator.startsWith("0x")
            ) {
              console.warn("Invalid event structure:", event);
              return null;
            }

            // Check if this challenge has been solved with safety checks
            const correctGuess = guessEvents?.find(
              guess =>
                guess?.args &&
                typeof guess.args === "object" &&
                guess.args.challengeId === event.args.challengeId &&
                guess.args.isCorrect === true,
            );

            return {
              id: event.args.challengeId,
              imageUrl: event.args.imageUrl,
              prizePool: event.args.initialPrizePool ? formatEther(event.args.initialPrizePool) : "0",
              creator: event.args.creator as `0x${string}`,
              isActive: !correctGuess, // Challenge is active if no correct guess exists
            };
          })
          .filter((challenge): challenge is ImagePost & { isActive: boolean } => challenge !== null)
          .sort((a, b) => Number(b.id) - Number(a.id));

        setAllImages(formattedChallenges);
      } catch (error) {
        console.error("Error processing challenge events:", error);
        // Set empty array to prevent UI crashes
        setAllImages([]);
      }
    } else {
      // If no events, set empty array
      setAllImages([]);
    }
  }, [challengeEvents, isLoadingEvents, guessEvents]);

  // Filter challenges based on active tab
  const activeChallenges = allImages.filter(image => (image as any).isActive);
  const solvedChallenges = allImages.filter(image => !(image as any).isActive);
  const displayedChallenges = activeTab === "active" ? activeChallenges : solvedChallenges;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-purple-950 dark:to-indigo-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-24 lg:pb-40">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-blue-400/10 to-indigo-400/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-32 right-1/4 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-700" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-12">
            {/* Badge and Main heading */}
            <div className="space-y-8">
              <div className="flex justify-center">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg">
                  <SparklesIconSolid className="w-4 h-4" />
                  <span>Blockchain-Powered AI Game</span>
                </div>
              </div>

              <div className="space-y-6">
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tight drop-shadow-2xl">
                  <span className="block drop-shadow-lg">Prompt Genius</span>
                </h1>

                <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed font-medium">
                  The ultimate AI prompt guessing game on the blockchain. Create stunning AI images, challenge the
                  community, and win FLOW rewards!
                </p>

                <p className="text-lg text-gray-500 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                  Test your creativity and intuition by guessing the prompts behind AI-generated masterpieces. Guessing
                  fee is 10% of the prize pool (in FLOW), with fees distributed to the creator and platform.
                </p>
              </div>
            </div>

            {/* Stats Section */}
            <div className="pt-8">
              <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
                <div className="flex items-center space-x-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <PhotoIcon className="w-6 h-6 text-purple-500" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeChallenges.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Active Challenges</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <TrophyIcon className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{solvedChallenges.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Solved Challenges</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                    <BanknotesIconSolid className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {activeChallenges.reduce((total, image) => total + parseFloat(image.prizePool), 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">FLOW in Active Pools</div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="pt-12">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/create"
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25"
                >
                  <PlusIcon className="w-6 h-6 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  Create Challenge
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>

                <div className="text-center sm:text-left space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">or scroll down to start guessing</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Dynamic FLOW fee per guess • Winner takes prize
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview Section */}
      <section className="relative py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Hall of Fame</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              See who&apos;s dominating the prompt guessing arena. Will you be next?
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <LeaderboardWidget title="Top Winners" maxItems={5} showByPrizes={false} />
            <LeaderboardWidget title="Top Earners" maxItems={5} showByPrizes={true} />
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="relative py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header with Tabs */}
          <div className="flex flex-col items-center space-y-12 mb-16">
            <div className="text-center space-y-4">
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white">Explore Challenges</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Dive into our collection of AI-generated puzzles. Test your skills against active challenges or learn
                from solved masterpieces.
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-2 border border-white/20 shadow-lg">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab("active")}
                  className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === "active"
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105"
                      : "text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white/50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <SparklesIcon className="w-5 h-5" />
                    <div className="text-left">
                      <div className="text-sm font-bold">Active Challenges</div>
                      <div className="text-xs opacity-75">{activeChallenges.length} waiting to be solved</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("solved")}
                  className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === "solved"
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105"
                      : "text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-white/50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <TrophyIcon className="w-5 h-5" />
                    <div className="text-left">
                      <div className="text-sm font-bold">Solved Challenges</div>
                      <div className="text-xs opacity-75">{solvedChallenges.length} already conquered</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Live Update Indicator */}
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <ClockIcon className="w-4 h-4" />
              <span>Live updates from the blockchain</span>
            </div>
          </div>

          {/* Content Area */}
          <div className="min-h-[500px]">
            {/* Loading State */}
            {isLoadingChallenges && (
              <div className="text-center py-24">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-8 animate-spin">
                  <SparklesIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Loading Challenges</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Fetching the latest AI masterpieces from the blockchain...
                </p>
              </div>
            )}

            {/* Empty State */}
            {!isLoadingChallenges && displayedChallenges.length === 0 && (
              <div className="text-center py-24">
                {/* Network Status Alert for non-hardhat networks with no challenges */}
                {!isLoadingEvents && challengeEvents?.length === 0 && targetNetwork.id !== hardhat.id && (
                  <div className="mb-8 mx-auto max-w-md">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-2xl p-6">
                      <div className="flex items-center justify-center mb-4">
                        <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500" />
                      </div>
                      <h4 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                        Network Notice
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                        No challenges found on <strong>{targetNetwork.name}</strong>. The contract might not be deployed
                        on this network yet.
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">
                        Try switching to a supported network or check if the contract is deployed.
                      </p>
                    </div>
                  </div>
                )}

                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full mb-8">
                  {activeTab === "active" ? (
                    <PhotoIcon className="w-12 h-12 text-purple-500" />
                  ) : (
                    <TrophyIcon className="w-12 h-12 text-green-500" />
                  )}
                </div>

                <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  {activeTab === "active" ? "No Active Challenges" : "No Solved Challenges Yet"}
                </h3>

                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
                  {activeTab === "active"
                    ? "Be the pioneer! Create the first AI image challenge and ignite the guessing game revolution."
                    : "The community is still working on cracking these puzzles. Check back soon to see the first winners!"}
                </p>

                {activeTab === "active" && (
                  <Link
                    href="/create"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Create the First Challenge
                  </Link>
                )}
              </div>
            )}

            {/* Challenges Grid */}
            {!isLoadingChallenges && displayedChallenges.length > 0 && (
              <>
                <div className="text-center mb-12">
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {activeTab === "active"
                      ? `${displayedChallenges.length} challenge${displayedChallenges.length !== 1 ? "s" : ""} ready for your genius`
                      : `${displayedChallenges.length} challenge${displayedChallenges.length !== 1 ? "s" : ""} already mastered`}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {displayedChallenges.map((image, index) => (
                    <Link
                      href={`/guess/${image.id}`}
                      key={image.id}
                      className="group relative"
                      style={{
                        animationName: "fadeInUp",
                        animationDuration: "0.6s",
                        animationTimingFunction: "ease-out",
                        animationFillMode: "forwards",
                        animationDelay: `${index * 100}ms`,
                      }}
                    >
                      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/20 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
                        {/* Image */}
                        <div className="relative aspect-square overflow-hidden">
                          <Image
                            src={image.imageUrl}
                            alt={image.prompt || "AI Generated Challenge"}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          {/* Status Badge */}
                          <div
                            className={`absolute top-4 right-4 ${
                              (image as any).isActive
                                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                : "bg-gradient-to-r from-purple-500 to-indigo-500"
                            } text-white px-3 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm`}
                          >
                            <div className="flex items-center space-x-1">
                              {(image as any).isActive ? (
                                <>
                                  <SparklesIconSolid className="w-4 h-4" />
                                  <span>{image.prizePool} FLOW</span>
                                </>
                              ) : (
                                <>
                                  <TrophyIcon className="w-4 h-4" />
                                  <span>Solved</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Challenge ID */}
                          <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                            #{image.id.toString()}
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-6 space-y-4">
                          {/* Prize Pool or Status */}
                          <div className="flex items-center justify-between">
                            {(image as any).isActive ? (
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                                  <BanknotesIcon className="w-5 h-5" />
                                  <span className="text-xl font-bold">{image.prizePool} FLOW</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1 text-purple-600 dark:text-purple-400">
                                  <TrophyIcon className="w-5 h-5" />
                                  <span className="text-xl font-bold">Solved</span>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center space-x-1 text-purple-500">
                              <SparklesIcon className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {(image as any).isActive ? "Guess & Win" : "View Solution"}
                              </span>
                            </div>
                          </div>

                          {/* Creator */}
                          <div className="flex items-center space-x-2 text-sm">
                            <UserGroupIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">Created by:</span>
                            <Address address={image.creator} disableAddressLink={true} />
                          </div>

                          {/* Action Hint */}
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-center space-x-2 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                              {(image as any).isActive ? (
                                <>
                                  <TrophyIcon className="w-4 h-4" />
                                  <span className="text-sm font-medium">Click to guess the prompt</span>
                                </>
                              ) : (
                                <>
                                  <TrophyIcon className="w-4 h-4" />
                                  <span className="text-sm font-medium">Click to see the winning prompt</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Hover Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

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
      `}</style>
    </div>
  );
};

export default Home;
