import { NetworkOptions } from "./NetworkOptions";
import { useDisconnect } from "wagmi";
import { ArrowLeftOnRectangleIcon, ChevronDownIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export const WrongNetworkDropdown = () => {
  const { disconnect } = useDisconnect();

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-2xl px-3 py-2 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300">
        <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
        <span className="text-sm font-medium text-red-700 dark:text-red-400">Wrong Network</span>
        <ChevronDownIcon className="h-4 w-4 text-red-500" />
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu z-[100] p-2 mt-2 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl w-64 gap-1"
      >
        <NetworkOptions />
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
