import { Hash, SendTransactionParameters, TransactionReceipt, WalletClient } from "viem";
import { Config, useWalletClient } from "wagmi";
import { getPublicClient } from "wagmi/actions";
import { SendTransactionMutate } from "wagmi/query";
import { useNotification } from "@blockscout/app-sdk";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { getBlockExplorerTxLink, getParsedError, notification } from "~~/utils/scaffold-eth";
import { TransactorFuncOptions } from "~~/utils/scaffold-eth/contract";

type TransactionFunc = (
  tx: (() => Promise<Hash>) | Parameters<SendTransactionMutate<Config, undefined>>[0],
  options?: TransactorFuncOptions,
) => Promise<Hash | undefined>;

/**
 * Runs Transaction passed in to returned function showing UI feedback.
 * @param _walletClient - Optional wallet client to use. If not provided, will use the one from useWalletClient.
 * @returns function that takes in transaction function as callback, shows UI feedback for transaction and returns a promise of the transaction hash
 */
export const useTransactor = (_walletClient?: WalletClient): TransactionFunc => {
  let walletClient = _walletClient;
  const { data } = useWalletClient();
  const { openTxToast } = useNotification();
  
  if (walletClient === undefined && data) {
    walletClient = data;
  }

  const result: TransactionFunc = async (tx, options) => {
    if (!walletClient) {
      notification.error("Cannot access account");
      console.error("⚡️ ~ file: useTransactor.tsx ~ error");
      return;
    }

    let transactionHash: Hash | undefined = undefined;
    let transactionReceipt: TransactionReceipt | undefined;
    
    try {
      const network = await walletClient.getChainId();
      // Get full transaction from public client
      const publicClient = getPublicClient(wagmiConfig);

      // Execute the transaction
      if (typeof tx === "function") {
        // Tx is already prepared by the caller
        const result = await tx();
        transactionHash = result;
      } else if (tx != null) {
        transactionHash = await walletClient.sendTransaction(tx as SendTransactionParameters);
      } else {
        throw new Error("Incorrect transaction passed to transactor");
      }

      // Show ONLY Flowscan notification - no app notifications at all
      if (transactionHash) {
        try {
          await openTxToast(network.toString(), transactionHash);
          console.log("🌊 Flowscan notification shown for transaction:", transactionHash);
        } catch (error) {
          console.warn("Failed to show Flowscan transaction toast:", error);
          // If Flowscan fails, show minimal fallback
          const blockExplorerURL = getBlockExplorerTxLink(network, transactionHash);
          notification.loading(
            <div className="flex flex-col">
              <span>Transaction submitted...</span>
              {blockExplorerURL && (
                <a href={blockExplorerURL} target="_blank" rel="noreferrer" className="text-blue-500 underline text-sm">
                  View on Explorer
                </a>
              )}
            </div>
          );
        }
      }

      // Wait for transaction confirmation
      transactionReceipt = await publicClient.waitForTransactionReceipt({
        hash: transactionHash,
        confirmations: options?.blockConfirmations,
      });

      if (transactionReceipt.status === "reverted") throw new Error("Transaction reverted");

      // Optional: Simple completion notification with link (you can remove this if you want ONLY Flowscan)
      // const blockExplorerURL = getBlockExplorerTxLink(network, transactionHash);
      // notification.success(
      //   <div className="flex flex-col">
      //     <span>Transaction completed!</span>
      //     {blockExplorerURL && (
      //       <a href={blockExplorerURL} target="_blank" rel="noreferrer" className="text-blue-500 underline text-sm">
      //         View on Flowscan
      //       </a>
      //     )}
      //   </div>,
      //   { duration: 4000 }
      // );

      if (options?.onBlockConfirmation) options.onBlockConfirmation(transactionReceipt);
      
    } catch (error: any) {
      console.error("⚡️ ~ file: useTransactor.ts ~ error", error);
      const message = getParsedError(error);

      // Only show error notification if transaction fails
      notification.error(message);
      throw error;
    }

    return transactionHash;
  };

  return result;
};
