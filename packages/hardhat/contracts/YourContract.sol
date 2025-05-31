//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "hardhat/console.sol"; // For debugging, remove in production

contract YourContract {
    address public immutable owner;
    address public platformWallet; // Address to receive platform fees

    struct Challenge {
        uint256 id;
        address creator;
        bytes32 hashedPrompt; // Store hash of the prompt
        string imageUrl;
        uint256 prizePool; // In Wei
        bool isActive;
        uint256 creationTime;
    }

    uint256 private nextChallengeId = 1;
    mapping(uint256 => Challenge) public challenges;
    // mapping(uint256 => mapping(address => string[])) private userGuesses; // Optional for on-chain guess history

    event ChallengeCreated(
        uint256 indexed challengeId,
        address indexed creator,
        string imageUrl,
        uint256 initialPrizePool
    );

    event GuessMade(
        uint256 indexed challengeId,
        address indexed guesser,
        string guessString, // Storing the raw guess string in event for off-chain use
        bool isCorrect
    );

    event PrizeAwarded(uint256 indexed challengeId, address indexed winner, uint256 amount);
    event PrizePoolIncreased(uint256 indexed challengeId, address indexed contributor, uint256 amount);
    event FeeDistributed(uint256 indexed challengeId, address indexed creator, uint256 creatorAmount, address indexed platform, uint256 platformAmount);

    constructor(address _owner, address _platformWallet) {
        owner = _owner;
        platformWallet = _platformWallet; // Initialize platform wallet
    }

    function createChallenge(
        bytes32 _hashedPrompt,
        string memory _imageUrl,
        uint256 _initialPrizePool // Creator can optionally fund initial prize pool with this argument
    ) public payable {
        require(bytes(_imageUrl).length > 0, "Image URL cannot be empty");
        require(_hashedPrompt != bytes32(0), "Hashed prompt cannot be empty");

        uint256 currentChallengeId = nextChallengeId;
        challenges[currentChallengeId] = Challenge({
            id: currentChallengeId,
            creator: msg.sender,
            hashedPrompt: _hashedPrompt,
            imageUrl: _imageUrl,
            prizePool: msg.value + _initialPrizePool,
            isActive: true,
            creationTime: block.timestamp
        });

        nextChallengeId++;
        emit ChallengeCreated(currentChallengeId, msg.sender, _imageUrl, challenges[currentChallengeId].prizePool);
    }

    function makeGuess(uint256 _challengeId, string memory _guess) public payable {
        require(_challengeId > 0 && _challengeId < nextChallengeId, "Invalid challenge ID");
        Challenge storage currentChallenge = challenges[_challengeId];
        require(currentChallenge.isActive, "Challenge is not active");

        uint256 rewardPool = currentChallenge.prizePool;
        require(rewardPool > 0, "Challenge has no prize pool, cannot calculate fee"); // Prevent division by zero if prize pool is 0

        uint256 guessingFee = rewardPool / 10; // 10% of the reward pool
        require(msg.value == guessingFee, "Incorrect guess fee sent");

        uint256 creatorShare = (guessingFee * 98) / 100; // 98% for the creator
        uint256 platformShare = guessingFee - creatorShare; // Remaining 2% for the platform

        // Transfer creator's share
        (bool successCreator, ) = currentChallenge.creator.call{value: creatorShare}("");
        require(successCreator, "Failed to send fee to creator");

        // Transfer platform's share
        (bool successPlatform, ) = platformWallet.call{value: platformShare}("");
        require(successPlatform, "Failed to send fee to platform");
        
        emit FeeDistributed(_challengeId, currentChallenge.creator, creatorShare, platformWallet, platformShare);

        bytes32 guessedPromptHash = keccak256(abi.encodePacked(_guess));

        if (guessedPromptHash == currentChallenge.hashedPrompt) {
            currentChallenge.isActive = false;
            uint256 prizeToWinner = currentChallenge.prizePool;
            currentChallenge.prizePool = 0; // Reset prize pool

            (bool successWinner, ) = msg.sender.call{value: prizeToWinner}("");
            require(successWinner, "Failed to send prize to winner");

            emit GuessMade(_challengeId, msg.sender, _guess, true);
            emit PrizeAwarded(_challengeId, msg.sender, prizeToWinner);
        } else {
            // If guess is incorrect, prize pool is not changed. Fee is already distributed.
            emit GuessMade(_challengeId, msg.sender, _guess, false);
            // No longer emitting PrizePoolIncreased here
        }
    }

    // Function to allow the owner to withdraw any ETH sent directly to the contract (not part of prize pools)
    // Or to handle stuck funds if a challenge mechanism has a flaw.
    function withdrawContractBalance() public {
        require(msg.sender == owner, "Not the contract owner");
        // This function will now primarily withdraw any ETH accidentally sent to the contract,
        // as platform fees are directly sent to platformWallet.
        // However, if platformWallet fails or is a contract itself that can't receive ETH this way,
        // funds might get stuck. Consider this if platformWallet is complex.
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Failed to withdraw contract balance");
    }

    // Fallback function to receive Ether - allows contract to receive ETH directly
    receive() external payable {
        // Allows contract to receive ETH, can be used for general funding if desired
        // or left empty if only specific functions should receive ETH.
    }

    // Helper to view a challenge (optional, for client-side convenience)
    function getChallenge(uint256 _challengeId) public view returns (Challenge memory) {
        require(_challengeId > 0 && _challengeId < nextChallengeId, "Invalid challenge ID");
        return challenges[_challengeId];
    }
}