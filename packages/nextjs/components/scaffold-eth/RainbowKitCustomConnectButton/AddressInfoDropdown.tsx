import { useRef, useState } from "react";
import { NetworkOptions } from "./NetworkOptions";
import { getAddress } from "viem";
import { Address } from "viem";
import { useDisconnect } from "wagmi";
import {
  ArrowLeftOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { BlockieAvatar, isENS } from "~~/components/scaffold-eth";
import { useCopyToClipboard, useOutsideClick } from "~~/hooks/scaffold-eth";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

const allowedNetworks = getTargetNetworks();

type AddressInfoDropdownProps = {
  address: Address;
  blockExplorerAddressLink: string | undefined;
  displayName: string;
  ensAvatar?: string;
};

export const AddressInfoDropdown = ({
  address,
  ensAvatar,
  displayName,
  blockExplorerAddressLink,
}: AddressInfoDropdownProps) => {
  const { disconnect } = useDisconnect();
  const checkSumAddress = getAddress(address);

  const { copyToClipboard: copyAddressToClipboard, isCopiedToClipboard: isAddressCopiedToClipboard } =
    useCopyToClipboard();
  const [selectingNetwork, setSelectingNetwork] = useState(false);
  const dropdownRef = useRef<HTMLDetailsElement>(null);

  const closeDropdown = () => {
    setSelectingNetwork(false);
    dropdownRef.current?.removeAttribute("open");
  };

  useOutsideClick(dropdownRef, closeDropdown);

  return (
    <>
      <details ref={dropdownRef} className="dropdown dropdown-end leading-3">
        <summary className="flex items-center space-x-2 px-3 py-2 cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-2xl transition-all duration-300">
          <BlockieAvatar address={checkSumAddress} size={32} ensImage={ensAvatar} />
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isENS(displayName) ? displayName : checkSumAddress?.slice(0, 6) + "..." + checkSumAddress?.slice(-4)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Wallet
            </span>
          </div>
          <ChevronDownIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </summary>
        <ul className="dropdown-content menu z-[100] p-2 mt-2 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl w-64 gap-1">
          <NetworkOptions hidden={!selectingNetwork} />
          <li className={selectingNetwork ? "hidden" : ""}>
            <div
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer transition-colors"
              onClick={() => copyAddressToClipboard(checkSumAddress)}
            >
              {isAddressCopiedToClipboard ? (
                <>
                  <CheckCircleIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
                  <span className="text-sm font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <DocumentDuplicateIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                  <span className="text-sm font-medium">Copy address</span>
                </>
              )}
            </div>
          </li>
          <li className={selectingNetwork ? "hidden" : ""}>
            <label htmlFor="qrcode-modal" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer transition-colors">
              <QrCodeIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium">View QR Code</span>
            </label>
          </li>
          <li className={selectingNetwork ? "hidden" : ""}>
            <button className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer transition-colors w-full text-left" type="button">
              <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-500" />
              <a
                target="_blank"
                href={blockExplorerAddressLink}
                rel="noopener noreferrer"
                className="text-sm font-medium"
              >
                View on Block Explorer
              </a>
            </button>
          </li>
          {allowedNetworks.length > 1 ? (
            <li className={selectingNetwork ? "hidden" : ""}>
              <button
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer transition-colors w-full text-left"
                type="button"
                onClick={() => {
                  setSelectingNetwork(true);
                }}
              >
                <ArrowsRightLeftIcon className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium">Switch Network</span>
              </button>
            </li>
          ) : null}
          <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
          <li className={selectingNetwork ? "hidden" : ""}>
            <button
              className="flex items-center gap-3 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl cursor-pointer transition-colors w-full text-left text-red-500"
              type="button"
              onClick={() => disconnect()}
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Disconnect</span>
            </button>
          </li>
        </ul>
      </details>
    </>
  );
};
