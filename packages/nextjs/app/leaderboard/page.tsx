"use client";

import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { ArrowPathIcon, BanknotesIcon, TrophyIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { FireIcon as FireIconSolid, TrophyIcon as TrophyIconSolid } from "@heroicons/react/24/solid";
import { Address } from "~~/components/scaffold-eth";
import { BlockscoutService } from "~~/services/blockscout";
import type { LeaderboardEntry } from "~~/services/blockscout";

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState<"wins" | "prizes">("wins");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { address: connectedAccount } = useAccount();

  const fetchLeaderboardData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      if (forceRefresh) {
        setRefreshing(true);
        BlockscoutService.clearCache();
      }

      const data = await BlockscoutService.getLeaderboard(activeTab, !forceRefresh);
      setLeaderboardData(data);
    } catch (err) {
      console.error("Error fetching leaderboard data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch leaderboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, [activeTab]);

  const handleRefresh = () => {
    fetchLeaderboardData(true);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <TrophyIconSolid className="w-8 h-8 text-yellow-500" />;
      case 2:
        return <TrophyIconSolid className="w-8 h-8 text-gray-400" />;
      case 3:
        return <TrophyIconSolid className="w-8 h-8 text-amber-600" />;
      default:
        return <div className="w-8 h-8 flex items-center justify-center text-lg font-bold text-gray-500">#{rank}</div>;
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

  const totalPlayers = leaderboardData.length;
  const cacheStatus = BlockscoutService.getCacheStatus();

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-purple-950 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error && !refreshing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-purple-950 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error loading leaderboard</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-purple-950 dark:to-indigo-950">
      {/* Header Section */}
      <section className="relative overflow-hidden pt-20 pb-16">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-blue-400/10 to-indigo-400/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-32 right-1/4 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-700" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg">
                <TrophyIconSolid className="w-4 h-4" />
                <span>Hall of Fame</span>
              </div>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight drop-shadow-2xl">
              <span className="block drop-shadow-lg">Leaderboard</span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed font-medium">
              Discover the champions of the prompt guessing realm. See who dominates the art of AI intuition.
            </p>

            {/* Stats Cards */}
            <div className="flex flex-wrap justify-center gap-6 pt-8">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20 shadow-lg">
                <div className="flex items-center space-x-3">
                  <UserGroupIcon className="w-8 h-8 text-purple-500" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalPlayers}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Players</div>
                  </div>
                </div>
              </div>

              {connectedAccount && (
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <TrophyIcon className="w-8 h-8 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">Connected</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Your Status</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cache Status Card */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${cacheStatus.cached ? "bg-green-500" : "bg-gray-400"}`} />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {cacheStatus.cached ? "Live Data" : "Loading..."}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {cacheStatus.age ? `Updated ${Math.floor(cacheStatus.age / 1000)}s ago` : "Real-time"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Navigation with Refresh Button */}
          <div className="flex justify-center mb-12">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-2 border border-white/20 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab("wins")}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === "wins"
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105"
                        : "text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <TrophyIcon className="w-5 h-5" />
                      <span>Top Winners</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("prizes")}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === "prizes"
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105"
                        : "text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <BanknotesIcon className="w-5 h-5" />
                      <span>Top Earners</span>
                    </div>
                  </button>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 disabled:opacity-50"
                  title="Refresh data"
                >
                  <ArrowPathIcon className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          {leaderboardData.length > 0 ? (
            <div className="space-y-4">
              {/* Top 3 Podium */}
              {leaderboardData.length >= 3 && (
                <div className="flex justify-center items-end space-x-4 mb-12">
                  {/* Second Place */}
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-black">2</span>
                      </div>
                      <Address address={leaderboardData[1].player} />
                      <div className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
                        {activeTab === "wins"
                          ? `${leaderboardData[1].totalWins.toString()} wins`
                          : `${formatEther(leaderboardData[1].totalPrizesWon)} FLOW`}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {(leaderboardData[1].winRate * 100).toFixed(1)}% win rate
                      </div>
                    </div>
                  </div>

                  {/* First Place */}
                  <div className="text-center transform scale-110">
                    <div className="bg-gradient-to-r from-yellow-300 to-yellow-400 dark:from-yellow-500 dark:to-yellow-600 rounded-2xl p-8 shadow-xl">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                        <TrophyIconSolid className="w-10 h-10 text-black" />
                      </div>
                      <Address address={leaderboardData[0].player} />
                      <div className="mt-3 text-xl font-bold text-black">
                        {activeTab === "wins"
                          ? `${leaderboardData[0].totalWins.toString()} wins`
                          : `${formatEther(leaderboardData[0].totalPrizesWon)} FLOW`}
                      </div>
                      <div className="text-sm text-gray-800">
                        {(leaderboardData[0].winRate * 100).toFixed(1)}% win rate
                      </div>
                    </div>
                  </div>

                  {/* Third Place */}
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-amber-400 to-amber-500 dark:from-amber-600 dark:to-amber-700 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">3</span>
                      </div>
                      <Address address={leaderboardData[2].player} />
                      <div className="mt-2 text-lg font-bold text-white">
                        {activeTab === "wins"
                          ? `${leaderboardData[2].totalWins.toString()} wins`
                          : `${formatEther(leaderboardData[2].totalPrizesWon)} FLOW`}
                      </div>
                      <div className="text-sm text-gray-200">
                        {(leaderboardData[2].winRate * 100).toFixed(1)}% win rate
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Leaderboard */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                      <FireIconSolid className="w-6 h-6 mr-2 text-orange-500" />
                      Full Rankings
                    </h3>
                    {refreshing && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <ArrowPathIcon className="w-4 h-4 mr-1 animate-spin" />
                        Refreshing...
                      </div>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                  {leaderboardData.map((entry, index) => (
                    <div
                      key={entry.player}
                      className={`p-6 flex items-center justify-between hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-300 ${
                        connectedAccount?.toLowerCase() === entry.player.toLowerCase()
                          ? "bg-purple-50/80 dark:bg-purple-900/20 border-l-4 border-purple-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankBadgeColor(index + 1)} shadow-lg`}
                        >
                          {index < 3 ? getRankIcon(index + 1) : <span className="text-lg font-bold">#{index + 1}</span>}
                        </div>

                        <div>
                          <Address address={entry.player} />
                          {connectedAccount?.toLowerCase() === entry.player.toLowerCase() && (
                            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">You</div>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {activeTab === "wins"
                            ? `${entry.totalWins.toString()} wins`
                            : `${formatEther(entry.totalPrizesWon)} FLOW`}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {entry.totalGuesses.toString()} total guesses • {(entry.winRate * 100).toFixed(1)}% win rate
                        </div>
                        {entry.challengesCreated > 0 && (
                          <div className="text-xs text-blue-500 dark:text-blue-400">
                            Created {entry.challengesCreated.toString()} challenges
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-24">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full mb-8">
                <TrophyIcon className="w-12 h-12 text-purple-500" />
              </div>

              <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">No Champions Yet</h3>

              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
                Be the first to solve a challenge and claim your spot on the leaderboard!
              </p>

              <button
                onClick={handleRefresh}
                className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-lg"
              >
                Refresh Data
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default LeaderboardPage;
