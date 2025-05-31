"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { Bars3Icon, BugAntIcon, HomeIcon, PlusIcon, SparklesIcon, TrophyIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
    icon: <HomeIcon className="h-4 w-4" />,
  },
  {
    label: "Create",
    href: "/create",
    icon: <PlusIcon className="h-4 w-4" />,
  },
  {
    label: "Leaderboard",
    href: "/leaderboard",
    icon: <TrophyIcon className="h-4 w-4" />,
  },
  {
    label: "Debug",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive
                  ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-600 dark:text-purple-400 shadow-lg backdrop-blur-sm border border-purple-200/50 dark:border-purple-400/20"
                  : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:text-purple-600 dark:hover:text-purple-400"
              } transition-all duration-300 py-2.5 px-4 text-sm rounded-2xl gap-2 flex items-center font-medium hover:shadow-md hover:backdrop-blur-sm hover:border hover:border-white/20`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-white/20 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Mobile menu button */}
            <details className="dropdown lg:hidden" ref={burgerMenuRef}>
              <summary className="btn btn-ghost btn-sm hover:bg-white/50 dark:hover:bg-gray-800/50">
                <Bars3Icon className="h-5 w-5" />
              </summary>
              <ul
                className="menu menu-compact dropdown-content mt-3 p-4 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl w-64 border border-white/20"
                onClick={() => {
                  burgerMenuRef?.current?.removeAttribute("open");
                }}
              >
                <HeaderMenuLinks />
              </ul>
            </details>

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 p-2 group-hover:scale-110 transition-transform duration-300">
                <SparklesIcon className="w-full h-full text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Prompt Guesser
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 -mt-1">AI Guessing Game</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:block">
              <ul className="flex items-center space-x-1">
                <HeaderMenuLinks />
              </ul>
            </nav>
          </div>

          {/* Right side - Wallet Connection */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isLocalNetwork && (
              <div className="hidden sm:block">
                <FaucetButton />
              </div>
            )}
            <div className="relative">
              <RainbowKitCustomConnectButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
