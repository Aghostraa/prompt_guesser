import React from "react";
import Link from "next/link";
import { hardhat } from "viem/chains";
import {
  ChatBubbleLeftRightIcon,
  CodeBracketIcon,
  CurrencyDollarIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { Faucet } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useGlobalState } from "~~/services/store/store";

/**
 * Site footer
 */
export const Footer = () => {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  return (
    <footer className="relative bg-gradient-to-t from-purple-50/50 to-transparent dark:from-gray-950/50 border-t border-gray-200/50 dark:border-gray-700/50">
      {/* Development Tools - Fixed Bottom */}
      {(nativeCurrencyPrice > 0 || isLocalNetwork) && (
        <div className="fixed bottom-4 left-4 right-4 z-40 flex justify-between items-end pointer-events-none">
          {/* Left side - Dev tools */}
          <div className="flex flex-col gap-2 pointer-events-auto">
            {nativeCurrencyPrice > 0 && (
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 rounded-2xl px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CurrencyDollarIcon className="h-4 w-4 text-green-500" />
                  <span className="text-gray-900 dark:text-white">${nativeCurrencyPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
            {isLocalNetwork && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Faucet />
                <Link
                  href="/blockexplorer"
                  className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 rounded-2xl px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                    <MagnifyingGlassIcon className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
                    <span>Explorer</span>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Right side - Theme switcher */}
          <div className="pointer-events-auto">
            <SwitchTheme className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300" />
          </div>
        </div>
      )}

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-20 sm:mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 p-2">
                <SparklesIcon className="w-full h-full text-white" />
              </div>
              <div>
                <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                  Prompt Genius
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">AI Guessing Game</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left max-w-sm">
              Discover AI-generated images, guess their prompts, and win ETH rewards in this exciting blockchain game.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Links</h3>
            <div className="flex flex-col space-y-2 text-center">
              <Link
                href="/"
                className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm"
              >
                Browse Challenges
              </Link>
              <Link
                href="/create"
                className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm"
              >
                Create Challenge
              </Link>
              {isLocalNetwork && (
                <Link
                  href="/debug"
                  className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm"
                >
                  Debug Contracts
                </Link>
              )}
            </div>
          </div>

          {/* Built With */}
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Built With</h3>
            <div className="flex flex-col space-y-3 text-center">
              <a
                href="https://github.com/scaffold-eth/se-2"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm group"
              >
                <CodeBracketIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Scaffold-ETH 2</span>
              </a>
              <a
                href="https://buidlguidl.com/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm group"
              >
                <HeartIcon className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                <span>BuidlGuidl</span>
              </a>
              <a
                href="https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm group"
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Get Support</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
              © 2024 Prompt Genius. Built with 💜 for the blockchain community.
            </p>
            <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
              <span>Powered by</span>
              <span className="font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Ethereum
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
