# Blockscout API Integration for Leaderboard

This document outlines the implementation plan for integrating Blockscout APIs to power the leaderboard functionality.

## Overview

The leaderboard system currently uses mock data and needs to be integrated with Blockscout APIs to fetch real blockchain data for player statistics and rankings.

## Required API Endpoints

### 1. Contract Event Logs
```
GET /api/v2/addresses/{contractAddress}/logs
```
**Purpose**: Fetch all event logs from the contract to parse game-related events.

**Parameters**:
- `contractAddress`: The deployed game contract address
- `from_block`: Starting block number (optional)
- `to_block`: Ending block number (optional)
- `topic0`: Event signature hash (optional, for filtering specific events)

### 2. Address Transactions
```
GET /api/v2/addresses/{address}/transactions
```
**Purpose**: Get all transactions for a specific player address.

**Parameters**:
- `address`: Player's wallet address
- `filter`: Transaction type filter
- `type`: Include internal transactions

## Event Types to Parse

### ChallengeCreated Event
```solidity
event ChallengeCreated(
    uint256 indexed challengeId,
    address indexed creator,
    string imageUrl,
    uint256 initialPrizePool
);
```
**Usage**: Track challenge creators and total challenges created per user.

### GuessMade Event
```solidity
event GuessMade(
    uint256 indexed challengeId,
    address indexed guesser,
    string guessString,
    bool isCorrect
);
```
**Usage**: Track wins/losses and calculate win rates.

### PrizeAwarded Event
```solidity
event PrizeAwarded(
    uint256 indexed challengeId,
    address indexed winner,
    uint256 amount
);
```
**Usage**: Calculate total prize money won by each player.

## Implementation Structure

### 1. API Service Layer
Create `services/blockscout.ts`:

```typescript
interface BlockscoutConfig {
  baseUrl: string;
  contractAddress: string;
}

interface EventLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  transactionHash: string;
  // ... other fields
}

class BlockscoutService {
  constructor(private config: BlockscoutConfig) {}

  async getContractLogs(fromBlock?: string, toBlock?: string): Promise<EventLog[]> {
    // Implementation
  }

  async getAddressTransactions(address: string): Promise<Transaction[]> {
    // Implementation
  }
}
```

### 2. Event Parser
Create `utils/eventParser.ts`:

```typescript
interface ParsedChallengeCreated {
  challengeId: bigint;
  creator: string;
  imageUrl: string;
  initialPrizePool: bigint;
  blockNumber: string;
  transactionHash: string;
}

interface ParsedGuessMade {
  challengeId: bigint;
  guesser: string;
  guessString: string;
  isCorrect: boolean;
  blockNumber: string;
  transactionHash: string;
}

interface ParsedPrizeAwarded {
  challengeId: bigint;
  winner: string;
  amount: bigint;
  blockNumber: string;
  transactionHash: string;
}

class EventParser {
  static parseChallengeCreated(log: EventLog): ParsedChallengeCreated {
    // Decode log data using ethers or viem
  }

  static parseGuessMade(log: EventLog): ParsedGuessMade {
    // Decode log data
  }

  static parsePrizeAwarded(log: EventLog): ParsedPrizeAwarded {
    // Decode log data
  }
}
```

### 3. Leaderboard Calculator
Create `utils/leaderboardCalculator.ts`:

```typescript
interface PlayerStats {
  address: string;
  totalWins: number;
  totalGuesses: number;
  totalPrizesWon: bigint;
  challengesCreated: number;
  winRate: number;
  lastActivity: string;
}

interface LeaderboardEntry {
  player: string;
  totalWins: bigint;
  totalPrizesWon: bigint;
  rank?: number;
}

class LeaderboardCalculator {
  static calculatePlayerStats(
    challengeEvents: ParsedChallengeCreated[],
    guessEvents: ParsedGuessMade[],
    prizeEvents: ParsedPrizeAwarded[]
  ): Map<string, PlayerStats> {
    // Aggregate all events by player address
    // Calculate statistics for each player
  }

  static generateLeaderboard(
    playerStats: Map<string, PlayerStats>,
    sortBy: 'wins' | 'prizes' = 'wins',
    limit?: number
  ): LeaderboardEntry[] {
    // Sort players by the specified criteria
    // Return top N players
  }
}
```

### 4. React Hooks
Create `hooks/useLeaderboard.ts`:

```typescript
interface UseLeaderboardOptions {
  sortBy?: 'wins' | 'prizes';
  limit?: number;
  refreshInterval?: number;
}

interface UseLeaderboardReturn {
  data: LeaderboardEntry[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useLeaderboard(options: UseLeaderboardOptions = {}): UseLeaderboardReturn {
  // Implement hook that fetches and processes blockchain data
  // Cache results and refresh periodically
  // Handle loading and error states
}
```

## Implementation Steps

### Phase 1: Basic Integration
1. ✅ Set up Blockscout service class
2. ✅ Implement event log fetching
3. ✅ Create event parser for basic events
4. ✅ Replace mock data in leaderboard components

### Phase 2: Advanced Features
1. ✅ Add caching layer for performance
2. ✅ Implement real-time updates using WebSocket or polling
3. ✅ Add pagination for large datasets
4. ✅ Optimize queries with block range filtering

### Phase 3: Enhanced Analytics
1. ✅ Add player streak tracking
2. ✅ Calculate win rates and performance metrics
3. ✅ Historical leaderboard snapshots
4. ✅ Advanced filtering and sorting options

## Configuration

Add to your environment variables:

```env
NEXT_PUBLIC_BLOCKSCOUT_API_URL=https://blockscout.com/api/v2
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_DEPLOY_BLOCK=12345678
```

## Error Handling

- Rate limiting from Blockscout API
- Network connectivity issues
- Invalid or missing event data
- Large dataset pagination
- Contract upgrade scenarios

## Performance Considerations

- Cache frequently accessed data
- Use block ranges to limit query scope
- Implement incremental updates rather than full refreshes
- Consider using a backend service for heavy processing
- Optimize for mobile and slower connections

## Testing Strategy

- Mock Blockscout API responses for unit tests
- Test with various network conditions
- Validate event parsing with real blockchain data
- Performance testing with large datasets
- Cross-browser compatibility testing

## Files to Update

When implementing this integration, the following files need to be modified:

1. `app/leaderboard/page.tsx` - Remove mock data, integrate real API calls
2. `components/LeaderboardWidget.tsx` - Update to use real data
3. `services/blockscout.ts` - Create new service (NEW FILE)
4. `utils/eventParser.ts` - Create event parser (NEW FILE)
5. `utils/leaderboardCalculator.ts` - Create calculator (NEW FILE)
6. `hooks/useLeaderboard.ts` - Create hook (NEW FILE)

## Example Integration

```typescript
// In leaderboard page component
export default function LeaderboardPage() {
  const { data: leaderboardData, loading, error } = useLeaderboard({
    sortBy: activeTab,
    limit: 50,
    refreshInterval: 30000 // 30 seconds
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    // Render leaderboard with real data
  );
}
```

This integration will provide real-time, accurate leaderboard data directly from the blockchain via Blockscout APIs. 