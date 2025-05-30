"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Address, EtherInput } from "~~/components/scaffold-eth";

interface Guess {
  address: string;
  guess: string;
  timestamp: number;
}

// Temporary mock data
const getMockImage = (id: string) => ({
  id,
  imageUrl: "https://picsum.photos/800/800",
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
  ] as Guess[],
});

const GuessPage = ({ params }: { params: { id: string } }) => {
  const [guess, setGuess] = useState("");
  const [guessAmount, setGuessAmount] = useState("");
  const mockImage = getMockImage(params.id);

  const handleSubmitGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle submission to blockchain
    console.log({ guess, guessAmount });
  };

  return (
    <div className="flex flex-col min-h-screen py-8 px-4 lg:px-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="btn btn-ghost">
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-4xl font-bold">Guess the Prompt</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="card bg-base-100 shadow-xl">
            <figure className="relative aspect-square">
              <Image src={mockImage.imageUrl} alt="AI Generated" fill className="object-cover" />
            </figure>
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>Created by:</span>
                  <Address address={mockImage.creator} />
                </div>
                <div className="flex items-center gap-2">
                  <span>Prize Pool:</span>
                  <span className="font-bold">{mockImage.prizePool} ETH</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Make your guess</h2>
              <form onSubmit={handleSubmitGuess} className="flex flex-col gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Your guess</span>
                  </label>
                  <textarea
                    value={guess}
                    onChange={e => setGuess(e.target.value)}
                    className="textarea textarea-bordered h-24"
                    placeholder="What prompt was used to generate this image?"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Guessing fee (ETH)</span>
                  </label>
                  <EtherInput
                    value={guessAmount}
                    onChange={value => setGuessAmount(value)}
                    placeholder="Amount in ETH"
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={!guess || !guessAmount}>
                  Submit Guess
                </button>
              </form>

              <div className="divider">Previous Guesses</div>

              <div className="space-y-4">
                {mockImage.guesses.map((g, i) => (
                  <div key={i} className="bg-base-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Address address={g.address} />
                      <span className="text-sm opacity-50">{new Date(g.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p>{g.guess}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuessPage;
