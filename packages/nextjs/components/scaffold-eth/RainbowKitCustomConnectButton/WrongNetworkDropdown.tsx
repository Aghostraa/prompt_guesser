import { NetworkOptions } from "./NetworkOptions";
import { useDisconnect } from "wagmi";
import {
  ArrowLeftOnRectangleIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

const addFlowNetworkToMetaMask = async (networkType: "testnet" | "mainnet") => {
  if (typeof window.ethereum === "undefined") {
    console.error("MetaMask is not installed");
    return;
  }

  const networkConfig =
    networkType === "testnet"
      ? {
          chainId: "0x221", // 545 in hex
          chainName: "Flow EVM Testnet",
          nativeCurrency: {
            name: "Flow",
            symbol: "FLOW",
            decimals: 18,
          },
          rpcUrls: ["https://testnet.evm.nodes.onflow.org"],
          blockExplorerUrls: ["https://flowscan.org?network=testnet"],
        }
      : {
          chainId: "0x2EB", // 747 in hex
          chainName: "Flow EVM Mainnet",
          nativeCurrency: {
            name: "Flow",
            symbol: "FLOW",
            decimals: 18,
          },
          rpcUrls: ["https://mainnet.evm.nodes.onflow.org"],
          blockExplorerUrls: ["https://flowscan.org"],
        };

  try {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [networkConfig],
    });
  } catch (error) {
    console.error("Failed to add Flow network to MetaMask:", error);
  }
};

export const WrongNetworkDropdown = () => {
  const { disconnect } = useDisconnect();
  const { targetNetwork } = useTargetNetwork();

  const isFlowNetwork = targetNetwork.id === 545 || targetNetwork.id === 747;

  return (
    <div className="dropdown dropdown-end">
      <label
        tabIndex={0}
        className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-2xl px-3 py-2 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300"
      >
        <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
        <span className="text-sm font-medium text-red-700 dark:text-red-400">Wrong Network</span>
        <ChevronDownIcon className="h-4 w-4 text-red-500" />
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu z-[100] p-2 mt-2 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl w-72 gap-1"
      >
        <NetworkOptions />

        {/* Add Flow Network to MetaMask button */}
        {isFlowNetwork && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
            <li>
              <button
                className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl cursor-pointer transition-colors w-full text-left text-blue-600 dark:text-blue-400"
                type="button"
                onClick={() => addFlowNetworkToMetaMask(targetNetwork.id === 545 ? "testnet" : "mainnet")}
              >
                <PlusIcon className="h-5 w-5" />
                <div>
                  <div className="text-sm font-medium">Add Flow to MetaMask</div>
                  <div className="text-xs opacity-75">Automatically configure {targetNetwork.name}</div>
                </div>
              </button>
            </li>
          </>
        )}

        <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
        <li>
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
    </div>
  );
};
