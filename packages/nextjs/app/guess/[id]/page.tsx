"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatEther, parseEther } from "viem";
import { useAccount, useBalance } from "wagmi";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldEventHistory, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface Guess {
  address: string;
  guess: string;
  timestamp: number;
  isCorrect?: boolean;
}

interface PageParams {
  id: string;
}

interface ChallengeData {
  id: string;
  imageUrl: string;
  prizePool: string;
  creator: string;
  isActive: boolean;
  guesses: Guess[];
}

const FIXED_GUESS_FEE_ETH = "0.1";

const GuessPage = ({ params: paramsPromise }: { params: Promise<PageParams> }) => {
  const resolvedParams = use(paramsPromise);
  const { address: connectedAddress } = useAccount();
  const { data: userBalance } = useBalance({ address: connectedAddress });

  const [guess, setGuess] = useState("");
  const [challengeData, setChallengeData] = useState<ChallengeData | null>(null);
  const [isGuessingTxLoading, setIsGuessingTxLoading] = useState(false);
  const [notification, setNotification] = useState("");

  const challengeIdBigInt = resolvedParams.id ? BigInt(resolvedParams.id) : undefined;

  const { data: fetchedChallengeData, isLoading: isLoadingChallengeDetails } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getChallenge",
    args: [challengeIdBigInt],
    // watch: true, // Enable if you want to auto-update on contract state changes for this challenge
  });

  const { writeContractAsync, isMining } = useScaffoldWriteContract({
    contractName: "YourContract",
  });

  const { data: guessEvents, isLoading: isLoadingGuessEvents } = useScaffoldEventHistory({
    contractName: "YourContract",
    eventName: "GuessMade",
    fromBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK || "0"),
    filters: { challengeId: challengeData?.id ? BigInt(challengeData.id) : undefined },
    blockData: true,
    transactionData: true,
    receiptData: true,
    watch: true,
  });

  useEffect(() => {
    if (fetchedChallengeData) {
      const contractChallenge = fetchedChallengeData as any; // Cast for now, ideally generate types or define a stricter interface
      setChallengeData({
        id: contractChallenge.id.toString(), // Convert BigInt to string for consistency in ChallengeData
        imageUrl: contractChallenge.imageUrl,
        prizePool: formatEther(contractChallenge.prizePool),
        creator: contractChallenge.creator,
        isActive: contractChallenge.isActive,
        guesses: [], // Guesses will be populated by useScaffoldEventHistory
      });
    }
  }, [fetchedChallengeData]);

  useEffect(() => {
    if (guessEvents && challengeData) {
      const formattedGuesses = guessEvents.map(event => {
        const blockTimestamp = (event as any).blockTimestamp;
        return {
          address: event.args.guesser || "",
          guess: event.args.guessString || "",
          timestamp: blockTimestamp ? Number(blockTimestamp) * 1000 : Date.now(),
          isCorrect: event.args.isCorrect,
        };
      });
      let currentPrizePoolWei;
      // Initialize prize pool based on the fetched challenge data if available, otherwise start from 0 or a sensible default
      if (challengeData && challengeData.prizePool) {
        try {
          currentPrizePoolWei = parseEther(challengeData.prizePool);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_e) {
          console.warn("Could not parse initial prize pool from challengeData, defaulting to 0 or fetched data.");
          // Fallback to directly using fetchedChallengeData's prizePool if parsing fails or challengeData.prizePool is not yet set correctly
          currentPrizePoolWei = fetchedChallengeData ? (fetchedChallengeData as any).prizePool : BigInt(0);
        }
      } else if (fetchedChallengeData) {
        currentPrizePoolWei = (fetchedChallengeData as any).prizePool;
      } else {
        currentPrizePoolWei = BigInt(0); // Absolute fallback
      }

      let isActive = challengeData
        ? challengeData.isActive
        : fetchedChallengeData
          ? (fetchedChallengeData as any).isActive
          : true;

      for (const event of guessEvents) {
        if (event.args.isCorrect) {
          currentPrizePoolWei = BigInt(0);
          isActive = false;
          break;
        } else {
          currentPrizePoolWei += parseEther(FIXED_GUESS_FEE_ETH);
        }
      }
      setChallengeData(prevData => ({
        ...(prevData as ChallengeData),
        guesses: formattedGuesses.sort((a, b) => b.timestamp - a.timestamp),
        prizePool: formatEther(currentPrizePoolWei),
        isActive: isActive,
      }));
    }
  }, [guessEvents, challengeData, fetchedChallengeData]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(""), 7000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSubmitGuess = async (_e: React.FormEvent) => {
    _e.preventDefault();
    setNotification("");

    if (!guess || !challengeData) {
      setNotification("Error: Guess cannot be empty or challenge data not loaded.");
      return;
    }
    if (!challengeData.isActive) {
      setNotification("Error: This challenge is no longer active.");
      return;
    }
    if (!connectedAddress) {
      setNotification("Error: Please connect your wallet to make a guess.");
      return;
    }

    const feeInWei = parseEther(FIXED_GUESS_FEE_ETH);
    if (userBalance && userBalance.value < feeInWei) {
      setNotification("Error: Insufficient balance to pay the guessing fee.");
      return;
    }

    setIsGuessingTxLoading(true);

    try {
      await writeContractAsync({
        functionName: "makeGuess",
        args: [BigInt(challengeData.id), guess.trim()],
        value: feeInWei,
      });
      setNotification("Guess submitted! Waiting for confirmation...");
      setGuess("");
    } catch (error: any) {
      console.error("Error submitting guess:", error);
      setNotification(`Error: ${error.shortMessage || error.message || "Failed to submit guess."}`);
    } finally {
    }
  };

  useEffect(() => {
    setIsGuessingTxLoading(isMining);
  }, [isMining]);

  if (!challengeData && (isLoadingGuessEvents || isLoadingChallengeDetails)) {
    return <div className="text-center py-10">Loading challenge data...</div>;
  }
  if (!challengeData) {
    return <div className="text-center py-10">Challenge not found or error loading.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen py-8 px-4 lg:px-8">
      {notification && (
        <div
          className={`alert ${notification.includes("Error:") ? "alert-error" : "alert-success"} shadow-lg mb-4 fixed top-4 right-4 z-50 w-auto`}
        >
          <div>
            <span>{notification}</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="btn btn-ghost">
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-4xl font-bold">Guess the Prompt</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="flex-1 lg:sticky lg:top-8">
          <div className={`card bg-base-100 shadow-xl ${!challengeData.isActive ? "opacity-70" : ""}`}>
            <figure className="relative aspect-square">
              <Image
                src={challengeData.imageUrl}
                alt={`Challenge Image ${challengeData.id}`}
                fill
                className="object-cover rounded-t-lg"
              />
            </figure>
            <div className="card-body p-6">
              <h2 className="card-title text-xl mb-2">
                Challenge Details {challengeData.isActive ? "(Active)" : "(Ended)"}
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Created by:</span>
                  <Address address={challengeData.creator} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Current Prize Pool:</span>
                  <span className="font-bold text-lg text-secondary">{challengeData.prizePool} ETH</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Guessing Fee:</span>
                  <span className="font-semibold">{FIXED_GUESS_FEE_ETH} ETH</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-8">
          <div className="card bg-base-100 shadow-xl">
            <div className={`card-body p-6 ${!challengeData.isActive ? "opacity-50 cursor-not-allowed" : ""}`}>
              <h2 className="text-xl font-semibold mb-4">Make Your Guess</h2>
              <form onSubmit={handleSubmitGuess} className="flex flex-col gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-base font-medium">
                      What&apos;s your guess for the image&apos;s prompt?
                    </span>
                  </label>
                  <textarea
                    value={guess}
                    onChange={e => setGuess(e.target.value)}
                    className="textarea textarea-bordered h-32 text-base mt-1"
                    placeholder={
                      challengeData.isActive ? "Type your detailed prompt guess here..." : "This challenge has ended."
                    }
                    required
                    disabled={isGuessingTxLoading || !challengeData.isActive}
                  />
                  <label className="label mt-1">
                    <span className="label-text-alt">
                      {challengeData.isActive
                        ? `You will pay ${FIXED_GUESS_FEE_ETH} ETH to make this guess.`
                        : "Guesses are no longer accepted."}
                    </span>
                  </label>
                </div>
                <button
                  type="submit"
                  className={`btn btn-primary btn-lg w-full mt-2 ${isGuessingTxLoading ? "loading" : ""}`}
                  disabled={!guess || !connectedAddress || isGuessingTxLoading || !challengeData.isActive}
                >
                  {isGuessingTxLoading ? "Submitting Guess..." : `Submit Guess (${FIXED_GUESS_FEE_ETH} ETH)`}
                </button>
              </form>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-6">
              <h2 className="text-xl font-semibold mb-4">Previous Guesses ({challengeData.guesses.length})</h2>
              {isLoadingGuessEvents && challengeData.guesses.length === 0 && (
                <p className="text-center">Loading guess history...</p>
              )}
              {!isLoadingGuessEvents && challengeData.guesses.length === 0 && (
                <p className="text-center opacity-70">No guesses have been made yet. Be the first!</p>
              )}
              {challengeData.guesses.length > 0 && (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {challengeData.guesses.map((g, i) => (
                    <div
                      key={`${g.timestamp}-${i}`}
                      className={`bg-base-200 p-4 rounded-lg shadow ${g.isCorrect ? "ring-2 ring-success" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Address address={g.address} format="short" />
                        <span className="text-xs opacity-60">{new Date(g.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap break-words">{g.guess}</p>
                      {g.isCorrect && <p className="text-sm font-bold text-success mt-1">Correct Guess!</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuessPage;
