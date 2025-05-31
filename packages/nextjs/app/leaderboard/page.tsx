"use client";

import { useState, useEffect } from "react";
import { formatEther } from "viem";
import {
  TrophyIcon,
  UserGroupIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { TrophyIcon as TrophyIconSolid, FireIcon as FireIconSolid } from "@heroicons/react/24/solid";
import { Address } from "~~/components/scaffold-eth";
import { useAccount } from "wagmi";

interface LeaderboardEntry {
  player: `0x${string}`;
  totalWins: bigint;
  totalPrizesWon: bigint;
}

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState<'wins' | 'prizes'>('wins');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const { address: connectedAccount } = useAccount();

  // TODO: Replace mock data with Blockscout API integration
  // The following endpoints will need to be implemented:
  // 1. GET /api/v2/addresses/{address}/transactions - to fetch user transactions
  // 2. GET /api/v2/transactions - to fetch all challenge-related transactions
  // 3. Parse events from transaction logs to extract:
  //    - ChallengeCreated events to identify challenge creators
  //    - GuessMade events to track wins and losses
  //    - PrizeAwarded events to calculate total prizes won
  // 4. Aggregate data to create leaderboard rankings
  
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
  ];

  useEffect(() => {
    // TODO: Implement Blockscout API calls here
    // Example implementation structure:
    // 
    // const fetchLeaderboardData = async () => {
    //   try {
    //     // 1. Fetch all transactions related to the contract
    //     const response = await fetch(`/api/blockscout/transactions?contract=${contractAddress}`);
    //     const transactions = await response.json();
    //     
    //     // 2. Parse events from transaction logs
    //     const events = parseContractEvents(transactions);
    //     
    //     // 3. Calculate leaderboard stats
    //     const leaderboard = calculateLeaderboardStats(events);
    //     
    //     // 4. Sort and set data
    //     setLeaderboardData(leaderboard);
    //   } catch (error) {
    //     console.error('Error fetching leaderboard data:', error);
    //   }
    // };
    // 
    // fetchLeaderboardData();
    
    // Using mock data for now
    setLeaderboardData(mockLeaderboardData);
  }, [activeTab]);

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

  // TODO: Implement real player count from Blockscout
  const totalPlayers = mockLeaderboardData.length;

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
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {totalPlayers}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Players</div>
                  </div>
                </div>
              </div>

              {connectedAccount && (
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <TrophyIcon className="w-8 h-8 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        Connected
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Your Status</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-2 border border-white/20 shadow-lg">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('wins')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === 'wins'
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <TrophyIcon className="w-5 h-5" />
                    <span>Top Winners</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('prizes')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === 'prizes'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <BanknotesIcon className="w-5 h-5" />
                    <span>Top Earners</span>
                  </div>
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
                        {activeTab === 'wins' 
                          ? `${leaderboardData[1].totalWins.toString()} wins`
                          : `${formatEther(leaderboardData[1].totalPrizesWon)} ETH`
                        }
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
                        {activeTab === 'wins' 
                          ? `${leaderboardData[0].totalWins.toString()} wins`
                          : `${formatEther(leaderboardData[0].totalPrizesWon)} ETH`
                        }
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
                        {activeTab === 'wins' 
                          ? `${leaderboardData[2].totalWins.toString()} wins`
                          : `${formatEther(leaderboardData[2].totalPrizesWon)} ETH`
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Leaderboard */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <FireIconSolid className="w-6 h-6 mr-2 text-orange-500" />
                    Full Rankings
                  </h3>
                </div>
                
                <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                  {leaderboardData.map((entry, index) => (
                    <div 
                      key={entry.player} 
                      className={`p-6 flex items-center justify-between hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-300 ${
                        connectedAccount?.toLowerCase() === entry.player.toLowerCase() 
                          ? 'bg-purple-50/80 dark:bg-purple-900/20 border-l-4 border-purple-500' 
                          : ''
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankBadgeColor(index + 1)} shadow-lg`}>
                          {index < 3 ? getRankIcon(index + 1) : (
                            <span className="text-lg font-bold">#{index + 1}</span>
                          )}
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
                          {activeTab === 'wins' 
                            ? `${entry.totalWins.toString()} wins`
                            : `${formatEther(entry.totalPrizesWon)} ETH`
                          }
                        </div>
                        {activeTab === 'prizes' && entry.totalWins > 0 && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {entry.totalWins.toString()} wins
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
              
              <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                No Champions Yet
              </h3>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
                Be the first to solve a challenge and claim your spot on the leaderboard!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default LeaderboardPage; 