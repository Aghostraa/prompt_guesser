"use client";

import Link from "next/link";
import { formatEther } from "viem";
import { TrophyIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { TrophyIcon as TrophyIconSolid } from "@heroicons/react/24/solid";
import { Address } from "~~/components/scaffold-eth";

interface LeaderboardEntry {
  player: `0x${string}`;
  totalWins: bigint;
  totalPrizesWon: bigint;
}

interface LeaderboardWidgetProps {
  title?: string;
  maxItems?: number;
  showByPrizes?: boolean;
}

export const LeaderboardWidget = ({ 
  title = "Top Players", 
  maxItems = 5,
  showByPrizes = false 
}: LeaderboardWidgetProps) => {
  // TODO: Replace with Blockscout API integration
  // This widget should fetch data from the same Blockscout endpoints as the main leaderboard page:
  // 1. GET /api/v2/addresses/{contractAddress}/logs - to fetch contract event logs
  // 2. Parse ChallengeCreated, GuessMade, and PrizeAwarded events
  // 3. Aggregate player statistics (wins, total prizes)
  // 4. Sort by wins or prizes based on showByPrizes prop
  // 5. Return top N players based on maxItems prop
  
  // Mock data for demonstration - REMOVE when implementing Blockscout APIs
  const mockLeaderboardData: LeaderboardEntry[] = [
    {
      player: "0x1234567890123456789012345678901234567890",
      totalWins: BigInt(5),
      totalPrizesWon: BigInt("2500000000000000000"), // 2.5 ETH
    },
    {
      player: "0x2345678901234567890123456789012345678901",
      totalWins: BigInt(3),
      totalPrizesWon: BigInt("1800000000000000000"), // 1.8 ETH
    },
    {
      player: "0x3456789012345678901234567890123456789012",
      totalWins: BigInt(2),
      totalPrizesWon: BigInt("1200000000000000000"), // 1.2 ETH
    },
    {
      player: "0x4567890123456789012345678901234567890123",
      totalWins: BigInt(1),
      totalPrizesWon: BigInt("800000000000000000"), // 0.8 ETH
    },
    {
      player: "0x5678901234567890123456789012345678901234",
      totalWins: BigInt(1),
      totalPrizesWon: BigInt("600000000000000000"), // 0.6 ETH
    },
  ];

  // Sort by wins or prizes based on prop
  const sortedData = [...mockLeaderboardData]
    .sort((a, b) => {
      if (showByPrizes) {
        return Number(b.totalPrizesWon - a.totalPrizesWon);
      }
      return Number(b.totalWins - a.totalWins);
    })
    .slice(0, maxItems);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <TrophyIconSolid className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <TrophyIconSolid className="w-5 h-5 text-gray-400" />;
      case 3:
        return <TrophyIconSolid className="w-5 h-5 text-amber-600" />;
      default:
        return <div className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</div>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-400 text-black";
      case 3:
        return "bg-gradient-to-r from-amber-500 to-amber-600 text-white";
      default:
        return "bg-gradient-to-r from-purple-500 to-blue-500 text-white";
    }
  };

  if (sortedData.length === 0) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full mb-4">
            <TrophyIcon className="w-8 h-8 text-purple-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No Champions Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Be the first to claim your spot!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/10 dark:to-blue-900/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TrophyIconSolid className="w-6 h-6 text-purple-500" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          <Link 
            href="/leaderboard"
            className="flex items-center space-x-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200 text-sm font-medium"
          >
            <span>View All</span>
            <ChevronRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
        {sortedData.map((entry, index) => (
          <div 
            key={entry.player} 
            className="p-4 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRankBadgeColor(index + 1)} shadow-sm text-sm font-bold`}>
                  {index < 3 ? getRankIcon(index + 1) : `#${index + 1}`}
                </div>
                
                <div className="min-w-0">
                  <Address address={entry.player} size="sm" />
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {showByPrizes 
                    ? `${parseFloat(formatEther(entry.totalPrizesWon)).toFixed(2)} ETH`
                    : `${entry.totalWins.toString()} wins`
                  }
                </div>
                {showByPrizes && entry.totalWins > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {entry.totalWins.toString()} wins
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gradient-to-r from-purple-50/30 to-blue-50/30 dark:from-purple-900/5 dark:to-blue-900/5 border-t border-gray-200/50 dark:border-gray-700/50">
        <Link 
          href="/leaderboard"
          className="w-full flex items-center justify-center space-x-2 py-3 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200 font-medium rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/30"
        >
          <TrophyIcon className="w-4 h-4" />
          <span>View Full Leaderboard</span>
          <ChevronRightIcon className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}; 