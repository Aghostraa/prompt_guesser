interface ContractLog {
  decoded: {
    method_call: string;
    method_id: string;
    parameters: Array<{
      indexed: boolean;
      name: string;
      value: string;
      type: string;
    }>;
  };
  transaction_hash: string;
  block_number: number;
  index: number;
  topics: (string | null)[];
  data: string;
}

interface BlockscoutResponse {
  items: ContractLog[];
  next_page_params?: {
    block_number: number;
    index: number;
    items_count: number;
  };
}

interface PlayerStats {
  totalWins: bigint;
  totalPrizesWon: bigint;
  totalGuesses: bigint;
  correctGuesses: bigint;
  challengesCreated: bigint;
  lastActivity: number;
}

interface LeaderboardEntry {
  player: `0x${string}`;
  totalWins: bigint;
  totalPrizesWon: bigint;
  totalGuesses: bigint;
  winRate: number;
  challengesCreated: bigint;
  lastActivity: number;
}

const CONTRACT_ADDRESS = "0x3300a0e41F13117788Cfb1D9C215d10890c623d9";
const BLOCKSCOUT_BASE_URL = "https://evm-testnet.flowscan.io/api/v2";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Simple in-memory cache
interface CacheEntry {
  data: ContractLog[];
  timestamp: number;
}

let cache: CacheEntry | null = null;

export class BlockscoutService {
  /**
   * Fetch all contract logs with pagination and caching
   */
  static async fetchAllContractLogs(useCache = true): Promise<ContractLog[]> {
    // Check cache first
    if (useCache && cache && Date.now() - cache.timestamp < CACHE_DURATION) {
      console.log('Using cached data');
      return cache.data;
    }

    console.log('Fetching fresh data from Blockscout...');
    const allLogs: ContractLog[] = [];
    let nextPageParams: any = null;
    let pageCount = 0;
    
    do {
      const url = new URL(`${BLOCKSCOUT_BASE_URL}/addresses/${CONTRACT_ADDRESS}/logs`);
      
      if (nextPageParams) {
        url.searchParams.append('block_number', nextPageParams.block_number.toString());
        url.searchParams.append('index', nextPageParams.index.toString());
        url.searchParams.append('items_count', nextPageParams.items_count.toString());
      }

      try {
        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error(`Failed to fetch logs: ${response.status} ${response.statusText}`);
        }

        const data: BlockscoutResponse = await response.json();
        
        // Filter for only decoded logs
        const decodedLogs = data.items.filter(log => log.decoded && log.decoded.method_call);
        allLogs.push(...decodedLogs);
        
        nextPageParams = data.next_page_params;
        pageCount++;
        
        console.log(`Fetched page ${pageCount}, got ${decodedLogs.length} decoded logs`);
        
        // Add a small delay to avoid rate limiting
        if (nextPageParams) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (error) {
        console.error(`Error fetching page ${pageCount + 1}:`, error);
        throw error;
      }
    } while (nextPageParams);

    console.log(`Total logs fetched: ${allLogs.length}`);
    
    // Update cache
    cache = {
      data: allLogs,
      timestamp: Date.now()
    };

    return allLogs;
  }

  /**
   * Parse contract events and calculate player statistics
   */
  static processContractLogs(logs: ContractLog[]): Map<string, PlayerStats> {
    const playerStats = new Map<string, PlayerStats>();

    const getOrCreatePlayerStats = (address: string): PlayerStats => {
      if (!playerStats.has(address)) {
        playerStats.set(address, {
          totalWins: BigInt(0),
          totalPrizesWon: BigInt(0),
          totalGuesses: BigInt(0),
          correctGuesses: BigInt(0),
          challengesCreated: BigInt(0),
          lastActivity: 0,
        });
      }
      return playerStats.get(address)!;
    };

    logs.forEach(log => {
      const { method_call, parameters } = log.decoded;
      const blockNumber = log.block_number;

      switch (method_call) {
        case "PrizeAwarded(uint256 indexed challengeId, address indexed winner, uint256 amount)":
          {
            const winner = parameters.find(p => p.name === "winner")?.value;
            const amount = parameters.find(p => p.name === "amount")?.value;
            
            if (winner && amount) {
              const stats = getOrCreatePlayerStats(winner);
              stats.totalPrizesWon += BigInt(amount);
              stats.lastActivity = Math.max(stats.lastActivity, blockNumber);
            }
          }
          break;

        case "GuessMade(uint256 indexed challengeId, address indexed guesser, string guessString, bool isCorrect)":
          {
            const guesser = parameters.find(p => p.name === "guesser")?.value;
            const isCorrect = parameters.find(p => p.name === "isCorrect")?.value === "true";
            
            if (guesser) {
              const stats = getOrCreatePlayerStats(guesser);
              stats.totalGuesses += BigInt(1);
              if (isCorrect) {
                stats.correctGuesses += BigInt(1);
                stats.totalWins += BigInt(1);
              }
              stats.lastActivity = Math.max(stats.lastActivity, blockNumber);
            }
          }
          break;

        case "ChallengeCreated(uint256 indexed challengeId, address indexed creator, string imageUrl, uint256 initialPrizePool)":
          {
            const creator = parameters.find(p => p.name === "creator")?.value;
            
            if (creator) {
              const stats = getOrCreatePlayerStats(creator);
              stats.challengesCreated += BigInt(1);
              stats.lastActivity = Math.max(stats.lastActivity, blockNumber);
            }
          }
          break;

        case "FeeDistributed(uint256 indexed challengeId, address indexed creator, uint256 creatorAmount, address indexed platform, uint256 platformAmount)":
          {
            // This event indicates activity but doesn't affect player stats directly
            const creator = parameters.find(p => p.name === "creator")?.value;
            if (creator) {
              const stats = getOrCreatePlayerStats(creator);
              stats.lastActivity = Math.max(stats.lastActivity, blockNumber);
            }
          }
          break;
      }
    });

    return playerStats;
  }

  /**
   * Generate leaderboard entries from player statistics
   */
  static generateLeaderboard(
    playerStats: Map<string, PlayerStats>, 
    sortBy: 'wins' | 'prizes' | 'winRate' | 'activity' = 'wins'
  ): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = Array.from(playerStats.entries()).map(([player, stats]) => ({
      player: player as `0x${string}`,
      totalWins: stats.totalWins,
      totalPrizesWon: stats.totalPrizesWon,
      totalGuesses: stats.totalGuesses,
      winRate: stats.totalGuesses > 0 ? Number(stats.correctGuesses) / Number(stats.totalGuesses) : 0,
      challengesCreated: stats.challengesCreated,
      lastActivity: stats.lastActivity,
    }));

    // Sort based on criteria
    return entries.sort((a, b) => {
      switch (sortBy) {
        case 'wins':
          // Primary: total wins, Secondary: win rate, Tertiary: total guesses
          if (a.totalWins !== b.totalWins) {
            return Number(b.totalWins - a.totalWins);
          }
          if (Math.abs(a.winRate - b.winRate) > 0.001) {
            return b.winRate - a.winRate;
          }
          return Number(b.totalGuesses - a.totalGuesses);

        case 'prizes':
          // Primary: total prizes, Secondary: total wins, Tertiary: win rate
          if (a.totalPrizesWon !== b.totalPrizesWon) {
            return Number(b.totalPrizesWon - a.totalPrizesWon);
          }
          if (a.totalWins !== b.totalWins) {
            return Number(b.totalWins - a.totalWins);
          }
          return b.winRate - a.winRate;

        case 'winRate':
          // Primary: win rate (min 5 guesses), Secondary: total wins, Tertiary: total guesses
          const aQualified = a.totalGuesses >= 5;
          const bQualified = b.totalGuesses >= 5;
          
          if (aQualified && !bQualified) return -1;
          if (!aQualified && bQualified) return 1;
          
          if (Math.abs(a.winRate - b.winRate) > 0.001) {
            return b.winRate - a.winRate;
          }
          if (a.totalWins !== b.totalWins) {
            return Number(b.totalWins - a.totalWins);
          }
          return Number(b.totalGuesses - a.totalGuesses);

        case 'activity':
          // Primary: last activity, Secondary: total guesses, Tertiary: total wins
          if (a.lastActivity !== b.lastActivity) {
            return b.lastActivity - a.lastActivity;
          }
          if (a.totalGuesses !== b.totalGuesses) {
            return Number(b.totalGuesses - a.totalGuesses);
          }
          return Number(b.totalWins - a.totalWins);

        default:
          return 0;
      }
    });
  }

  /**
   * Get leaderboard data with caching
   */
  static async getLeaderboard(sortBy: 'wins' | 'prizes' = 'wins', useCache = true): Promise<LeaderboardEntry[]> {
    try {
      const logs = await this.fetchAllContractLogs(useCache);
      const playerStats = this.processContractLogs(logs);
      return this.generateLeaderboard(playerStats, sortBy);
    } catch (error) {
      console.error('Error generating leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get statistics for a specific player
   */
  static async getPlayerStats(playerAddress: string, useCache = true): Promise<PlayerStats | null> {
    try {
      const logs = await this.fetchAllContractLogs(useCache);
      const playerStats = this.processContractLogs(logs);
      return playerStats.get(playerAddress.toLowerCase()) || null;
    } catch (error) {
      console.error('Error getting player stats:', error);
      throw error;
    }
  }

  /**
   * Clear the cache (useful for forcing fresh data)
   */
  static clearCache(): void {
    cache = null;
  }

  /**
   * Get cache status
   */
  static getCacheStatus(): { cached: boolean; age?: number } {
    if (!cache) {
      return { cached: false };
    }
    
    const age = Date.now() - cache.timestamp;
    return { cached: true, age };
  }
}

export type { LeaderboardEntry, PlayerStats, ContractLog }; 