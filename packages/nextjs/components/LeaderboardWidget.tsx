"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatEther } from "viem";
import { TrophyIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { TrophyIcon as TrophyIconSolid } from "@heroicons/react/24/solid";
import { Address } from "~~/components/scaffold-eth";
import { BlockscoutService } from "~~/services/blockscout";
import type { LeaderboardEntry } from "~~/services/blockscout";

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
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await BlockscoutService.getLeaderboard(showByPrizes ? 'prizes' : 'wins', true);
        setLeaderboardData(data.slice(0, maxItems));
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [showByPrizes, maxItems]);

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

  // Loading state
  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/10 dark:to-blue-900/10">
          <div className="flex items-center space-x-3">
            <TrophyIconSolid className="w-6 h-6 text-purple-500" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/10 dark:to-blue-900/10">
          <div className="flex items-center space-x-3">
            <TrophyIconSolid className="w-6 h-6 text-purple-500" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="text-red-500 text-sm mb-4">Failed to load leaderboard</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (leaderboardData.length === 0) {
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
        {leaderboardData.map((entry, index) => (
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
                    ? `${parseFloat(formatEther(entry.totalPrizesWon)).toFixed(2)} FLOW`
                    : `${entry.totalWins.toString()} wins`
                  }
                </div>
                {showByPrizes && entry.totalWins > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {entry.totalWins.toString()} wins
                  </div>
                )}
                {!showByPrizes && entry.totalPrizesWon > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {parseFloat(formatEther(entry.totalPrizesWon)).toFixed(2)} FLOW earned
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