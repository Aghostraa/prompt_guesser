"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { 
  BanknotesIcon, 
  SparklesIcon, 
  TrophyIcon, 
  PhotoIcon,
  PlusIcon,
  UserGroupIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { 
  BanknotesIcon as BanknotesIconSolid,
  SparklesIcon as SparklesIconSolid 
} from "@heroicons/react/24/solid";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

export interface ImagePost {
  id: bigint;
  prompt?: string;
  imageUrl: string;
  prizePool: string;
  creator: string;
}

const Home: NextPage = () => {
  const [allImages, setAllImages] = useState<ImagePost[]>([]);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(true);

  const { data: challengeEvents, isLoading: isLoadingEvents } = useScaffoldEventHistory({
    contractName: "YourContract",
    eventName: "ChallengeCreated",
    fromBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK || "0"),
    watch: true,
  });

  useEffect(() => {
    setIsLoadingChallenges(isLoadingEvents);
    if (challengeEvents) {
      const formattedChallenges = challengeEvents
        .map(event => {
          if (
            event.args.challengeId === undefined ||
            event.args.imageUrl === undefined ||
            event.args.creator === undefined
          ) {
            return null;
          }
          return {
            id: event.args.challengeId,
            imageUrl: event.args.imageUrl,
            prizePool: event.args.initialPrizePool ? formatEther(event.args.initialPrizePool) : "0",
            creator: event.args.creator,
          };
        })
        .filter((challenge): challenge is ImagePost => challenge !== null)
        .sort((a, b) => Number(b.id) - Number(a.id));
      setAllImages(formattedChallenges);
    }
  }, [challengeEvents, isLoadingEvents]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-purple-950 dark:to-indigo-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 pb-32">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-blue-400/10 to-indigo-400/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-32 right-1/4 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-700" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            {/* Main heading */}
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                  <SparklesIconSolid className="w-4 h-4" />
                  <span>AI Prompt Guessing Game</span>
                </div>
              </div>
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                Prompt
                <br />
                <span className="relative">
                  Guesser
                  <div className="absolute -top-2 -right-8 text-2xl animate-bounce">🎯</div>
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Discover AI-generated images, guess their prompts, and win ETH rewards in this exciting blockchain game!
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 pt-8">
              <div className="flex items-center space-x-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
                <PhotoIcon className="w-6 h-6 text-purple-500" />
                <div className="text-left">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{allImages.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Challenges</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
                <BanknotesIconSolid className="w-6 h-6 text-green-500" />
                <div className="text-left">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {allImages.reduce((total, image) => total + parseFloat(image.prizePool), 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total ETH Prizes</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
                <TrophyIcon className="w-6 h-6 text-yellow-500" />
                <div className="text-left">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">∞</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Possibilities</div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-8">
              <Link 
                href="/create" 
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25"
              >
                <PlusIcon className="w-6 h-6 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Create New Challenge
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Active Challenges
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Choose an image and guess the AI prompt that created it
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4" />
              <span>Updated live</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingChallenges && (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6 animate-spin">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Loading Challenges...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Discovering the latest AI-generated puzzles for you
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingChallenges && allImages.length === 0 && (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full mb-8">
              <PhotoIcon className="w-12 h-12 text-purple-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              No challenges yet
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Be the first to create an AI image challenge and start the fun!
            </p>
            <Link 
              href="/create"
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create First Challenge
            </Link>
          </div>
        )}

        {/* Image Grid */}
        {!isLoadingChallenges && allImages.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {allImages.map((image, index) => (
              <Link
                href={`/guess/${image.id}`}
                key={image.id}
                className="group relative"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/20 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <Image 
                      src={image.imageUrl} 
                      alt={image.prompt || "AI Generated Image"} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Prize Badge */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm">
                      <div className="flex items-center space-x-1">
                        <BanknotesIconSolid className="w-4 h-4" />
                        <span>{image.prizePool} ETH</span>
                      </div>
                    </div>

                    {/* Challenge ID */}
                    <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                      #{image.id.toString()}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-4">
                    {/* Prize Pool */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                          <BanknotesIcon className="w-5 h-5" />
                          <span className="text-xl font-bold">{image.prizePool} ETH</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-purple-500">
                        <SparklesIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Guess & Win</span>
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
                        <TrophyIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Click to guess prompt</span>
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
                </div>
              </Link>
            ))}
          </div>
        )}
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
      `}</style>
    </div>
  );
};

export default Home;
