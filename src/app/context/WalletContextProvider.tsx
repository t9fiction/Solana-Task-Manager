"use client";
import React, { ReactNode, useMemo } from "react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
    WalletProvider,
    ConnectionProvider,
  } from "@solana/wallet-adapter-react";
  import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
  } from "@solana/wallet-adapter-wallets";
  import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
  import { clusterApiUrl } from "@solana/web3.js";

interface WalletContextProviderProps {
  children: ReactNode;
}

const WalletContextProvider: React.FC<WalletContextProviderProps> = ({
  children,
}) => {
  const network =
    process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet"
      ? WalletAdapterNetwork.Mainnet
      : WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl(network),
    [network]
  );

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;