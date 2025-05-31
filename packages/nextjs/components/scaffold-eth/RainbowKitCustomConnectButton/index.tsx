"use client";

// @refresh reset
import { Balance } from "../Balance";
import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { AddressQRCodeModal } from "./AddressQRCodeModal";
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Address } from "viem";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { useNetworkColor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const RainbowKitCustomConnectButton = () => {
  const networkColor = useNetworkColor();
  const { targetNetwork } = useTargetNetwork();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;
        const blockExplorerAddressLink = account
          ? getBlockExplorerAddressLink(targetNetwork, account.address)
          : undefined;

        return (
          <>
            {(() => {
              if (!connected) {
                return (
                  <button
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 text-sm"
                    onClick={openConnectModal}
                    type="button"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported || chain.id !== targetNetwork.id) {
                return <WrongNetworkDropdown />;
              }

              return (
                <div className="flex items-center space-x-3">
                  {/* Network Indicator */}
                  <div className="hidden sm:flex items-center space-x-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-2xl px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: networkColor }} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{chain.name}</span>
                    </div>
                  </div>

                  {/* Balance Display */}
                  <div className="hidden md:flex items-center space-x-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-2xl px-3 py-2">
                    <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
                    <Balance
                      address={account.address as Address}
                      className="min-h-0 h-auto text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-transparent p-0 btn-ghost"
                    />
                  </div>

                  {/* Wallet Address Dropdown */}
                  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-2xl">
                    <AddressInfoDropdown
                      address={account.address as Address}
                      displayName={account.displayName}
                      ensAvatar={account.ensAvatar}
                      blockExplorerAddressLink={blockExplorerAddressLink}
                    />
                  </div>

                  <AddressQRCodeModal address={account.address as Address} modalId="qrcode-modal" />
                </div>
              );
            })()}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
};
