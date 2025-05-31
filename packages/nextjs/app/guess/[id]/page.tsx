"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

interface Guess {
  address: string;
  guess: string;
  timestamp: number;
}

interface PageParams {
  id: string;
}

interface MockImage {
  id: string;
  imageUrl: string;
  promptForDisplay: string;
  prizePool: string;
  creator: string;
  guesses: Guess[];
}

const FIXED_GUESS_FEE = "0.1";

const getMockImage = (id: string): MockImage => ({
  id,
  imageUrl: "https://picsum.photos/800/800",
  promptForDisplay: "A hidden prompt for image " + id,
  prizePool: "0.5",
  creator: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  guesses: [
    {
      address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      guess: "A beautiful sunset over mountains",
      timestamp: Date.now() - 1000000,
    },
    {
      address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      guess: "Landscape with purple sky",
      timestamp: Date.now() - 500000,
    },
  ],
});

const GuessPage = ({ params: paramsPromise }: { params: Promise<PageParams> }) => {
  const resolvedParams = use(paramsPromise);
  const { address: connectedAddress } = useAccount();

  const [guess, setGuess] = useState("");
  const [displayedImage, setDisplayedImage] = useState<MockImage | null>(null);

  useEffect(() => {
    if (resolvedParams.id) {
      setDisplayedImage(getMockImage(resolvedParams.id));
    }
  }, [resolvedParams.id]);

  const handleSubmitGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess || !displayedImage) {
      console.error("Guess cannot be empty or image data not loaded.");
      return;
    }

    const newGuess: Guess = {
      address: connectedAddress || "0xAnonymousGuesser",
      guess: guess,
      timestamp: Date.now(),
    };

    setDisplayedImage(prevImage => {
      if (!prevImage) return null;
      return {
        ...prevImage,
        guesses: [...prevImage.guesses, newGuess],
      };
    });

    console.log({
      guess,
      guessFee: FIXED_GUESS_FEE,
      newGuessList: displayedImage ? [...displayedImage.guesses, newGuess] : [newGuess],
    });
    setGuess("");
  };

  if (!displayedImage) {
    return <div className="text-center py-10">Loading image data...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen py-8 px-4 lg:px-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="btn btn-ghost">
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-4xl font-bold">Guess the Prompt</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="flex-1 lg:sticky lg:top-8">
          <div className="card bg-base-100 shadow-xl">
            <figure className="relative aspect-square">
              <Image
                src={displayedImage.imageUrl}
                alt={`Challenge Image ${displayedImage.id}`}
                fill
                className="object-cover rounded-t-lg"
              />
            </figure>
            <div className="card-body p-6">
              <h2 className="card-title text-xl mb-2">Challenge Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Created by:</span>
                  <Address address={displayedImage.creator} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Current Prize Pool:</span>
                  <span className="font-bold text-lg text-secondary">{displayedImage.prizePool} ETH</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Guessing Fee:</span>
                  <span className="font-semibold">{FIXED_GUESS_FEE} ETH</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-6">
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
                    placeholder="Type your detailed prompt guess here..."
                    required
                  />
                  <label className="label mt-1">
                    <span className="label-text-alt">You will pay {FIXED_GUESS_FEE} ETH to make this guess.</span>
                  </label>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-full mt-2"
                  disabled={!guess || !connectedAddress}
                >
                  Submit Guess ({FIXED_GUESS_FEE} ETH)
                </button>
              </form>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-6">
              <h2 className="text-xl font-semibold mb-4">Previous Guesses ({displayedImage.guesses.length})</h2>
              {displayedImage.guesses.length === 0 ? (
                <p className="text-center opacity-70">No guesses have been made yet. Be the first!</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {displayedImage.guesses
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((g, i) => (
                      <div key={i} className="bg-base-200 p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between mb-1">
                          <Address address={g.address} format="short" />
                          <span className="text-xs opacity-60">{new Date(g.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap break-words">{g.guess}</p>
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
