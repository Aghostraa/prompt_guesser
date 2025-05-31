"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

export interface ImagePost {
  id: bigint;
  prompt?: string;
  imageUrl: string;
  prizePool: string;
  creator: string;
}

const Home: NextPage = () => {
  const [allImages, setAllImages] = useState<ImagePost[]>([]);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(true);

  const { data: challengeEvents, isLoading: isLoadingEvents } = useScaffoldEventHistory({
    contractName: "YourContract",
    eventName: "ChallengeCreated",
    fromBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK || "0"),
    watch: true,
  });

  useEffect(() => {
    setIsLoadingChallenges(isLoadingEvents);
    if (challengeEvents) {
      const formattedChallenges = challengeEvents
        .map(event => {
          if (
            event.args.challengeId === undefined ||
            event.args.imageUrl === undefined ||
            event.args.creator === undefined
          ) {
            return null; // Skip if essential data is missing
          }
          return {
            id: event.args.challengeId,
            imageUrl: event.args.imageUrl,
            prizePool: event.args.initialPrizePool ? formatEther(event.args.initialPrizePool) : "0",
            creator: event.args.creator,
            // prompt is not part of ChallengeCreated event, so it will be undefined here
          };
        })
        .filter((challenge): challenge is ImagePost => challenge !== null) // Type guard to filter out nulls and assert type
        .sort((a, b) => Number(b.id) - Number(a.id)); // Sort by ID, newest first
      setAllImages(formattedChallenges);
    }
  }, [challengeEvents, isLoadingEvents]);

  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Prompt Guesser</h1>
        <Link href="/create" className="btn btn-primary">
          Add New Image
        </Link>
      </div>

      {isLoadingChallenges && <div className="text-center text-xl opacity-70 py-10">Loading challenges...</div>}
      {!isLoadingChallenges && allImages.length === 0 ? (
        <div className="text-center text-xl opacity-70 py-10">
          <p>No image challenges yet. Be the first to create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allImages.map(image => (
            <Link
              href={`/guess/${image.id}`}
              key={image.id}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all"
            >
              <figure className="relative aspect-square">
                <Image src={image.imageUrl} alt={image.prompt || "AI Generated Image"} fill className="object-cover" />
              </figure>
              <div className="card-body p-4">
                <div className="flex items-center gap-2">
                  <BanknotesIcon className="h-5 w-5" />
                  <span className="text-lg font-semibold">{image.prizePool} ETH</span>
                </div>
                <div className="flex items-center gap-2 text-sm opacity-70">
                  <span>Created by:</span>
                  <Address address={image.creator} disableAddressLink={true} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
