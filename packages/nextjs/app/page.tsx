"use client";

import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

interface ImagePost {
  id: number;
  imageUrl: string;
  prizePool: string;
  creator: string;
}

// Temporary mock data
const mockImages: ImagePost[] = [
  {
    id: 1,
    imageUrl: "https://picsum.photos/400/400",
    prizePool: "0.5",
    creator: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  },
  {
    id: 2,
    imageUrl: "https://picsum.photos/400/400",
    prizePool: "0.8",
    creator: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  },
];

const Home: NextPage = () => {
  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Prompt Guesser</h1>
        <Link href="/create" className="btn btn-primary">
          Add New Image
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockImages.map(image => (
          <Link
            href={`/guess/${image.id}`}
            key={image.id}
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all"
          >
            <figure className="relative aspect-square">
              <Image src={image.imageUrl} alt="AI Generated" fill className="object-cover" />
            </figure>
            <div className="card-body p-4">
              <div className="flex items-center gap-2">
                <BanknotesIcon className="h-5 w-5" />
                <span className="text-lg font-semibold">{image.prizePool} ETH</span>
              </div>
              <div className="flex items-center gap-2 text-sm opacity-70">
                <span>Created by:</span>
                <Address address={image.creator} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
