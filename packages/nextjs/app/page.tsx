"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

export interface ImagePost {
  id: number;
  prompt?: string;
  imageUrl: string;
  prizePool: string;
  creator: string;
}

// Initial mock data
const initialMockImages: ImagePost[] = [
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
  const [allImages, setAllImages] = useState<ImagePost[]>(initialMockImages);

  useEffect(() => {
    // Load images from localStorage on component mount (client-side)
    try {
      const storedImagesString = localStorage.getItem("userImagePosts");
      if (storedImagesString) {
        const storedImages: ImagePost[] = JSON.parse(storedImagesString);
        // Combine mock images with stored images, ensuring no duplicates by id
        setAllImages(prevImages => {
          const combined = [...prevImages];
          storedImages.forEach(storedImg => {
            if (!combined.find(img => img.id === storedImg.id)) {
              combined.push(storedImg);
            }
          });
          return combined.sort((a, b) => b.id - a.id); // Sort by ID, newest first
        });
      }
    } catch (error) {
      console.error("Failed to load image posts from localStorage:", error);
    }
  }, []);

  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Prompt Guesser</h1>
        <Link href="/create" className="btn btn-primary">
          Add New Image
        </Link>
      </div>

      {allImages.length === 0 ? (
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
