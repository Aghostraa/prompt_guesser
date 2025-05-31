//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "hardhat/console.sol"; // For debugging, remove in production

contract YourContract {
    address public immutable owner;

    struct Challenge {
        uint256 id;
        address creator;
        bytes32 hashedPrompt; // Store hash of the prompt
        string imageUrl;
        uint256 prizePool; // In Wei
        bool isActive;
        uint256 creationTime;
    }

    uint256 public constant GUESS_FEE = 0.1 ether; // Fixed guess fee: 0.1 ETH
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

    constructor(address _owner) {
        owner = _owner;
    }

    function createChallenge(
        bytes32 _hashedPrompt,
        string memory _imageUrl,
        uint256 _initialPrizePool // Creator can optionally fund initial prize pool with this argument
    ) public payable {
        require(bytes(_imageUrl).length > 0, "Image URL cannot be empty");
        require(_hashedPrompt != bytes32(0), "Hashed prompt cannot be empty");

        uint256 currentChallengeId = nextChallengeId;
        // The total initial prize pool is the sum of _initialPrizePool argument and any ETH sent with the transaction (msg.value)
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
        Challenge storage currentChallenge = challenges[_challengeId]; // Use storage pointer
        require(currentChallenge.isActive, "Challenge is not active");
        require(msg.value == GUESS_FEE, "Incorrect guess fee sent");

        bytes32 guessedPromptHash = keccak256(abi.encodePacked(_guess));

        if (guessedPromptHash == currentChallenge.hashedPrompt) {
            currentChallenge.isActive = false; // End the challenge
            uint256 totalPrize = currentChallenge.prizePool + GUESS_FEE; // Winner also gets their fee back essentially
            currentChallenge.prizePool = 0; // Reset prize pool for this challenge

            (bool success, ) = msg.sender.call{value: totalPrize}("");
            require(success, "Failed to send prize to winner");

            emit GuessMade(_challengeId, msg.sender, _guess, true);
            emit PrizeAwarded(_challengeId, msg.sender, totalPrize);
        } else {
            currentChallenge.prizePool += GUESS_FEE;
            emit GuessMade(_challengeId, msg.sender, _guess, false);
            emit PrizePoolIncreased(_challengeId, msg.sender, GUESS_FEE);
        }
    }

    // Function to allow the owner to withdraw any ETH sent directly to the contract (not part of prize pools)
    // Or to handle stuck funds if a challenge mechanism has a flaw.
    function withdrawContractBalance() public {
        require(msg.sender == owner, "Not the contract owner");
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