import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  braveWallet,
  coinbaseWallet,
  ledgerWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains } from "wagmi";
import * as chains from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import scaffoldConfig from "~~/scaffold.config";
import { burnerWalletConfig } from "~~/services/web3/wagmi-burner/burnerWalletConfig";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

const configuredNetwork = getTargetNetwork();
const burnerConfig = scaffoldConfig.burnerWallet;

// // We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
// const enabledChains =
//   (configuredNetwork.id as number) === 1 ? [configuredNetwork] : [configuredNetwork, chains.mainnet];

const supportedChains = [
  {
    id: 5001,
    name: "Mantle testnet",
    network: "mantle-testnet",
    image: "/mantle.jpg",
    nativeCurrency: {
      decimals: 18,
      name: "Mantle",
      symbol: "MNT",
    },
    rpcUrls: {
      default: {
        http: ["https://rpc.testnet.mantle.xyz"],
      },
      public: {
        http: ["https://rpc.testnet.mantle.xyz"],
      },
    },
    blockExplorers: {
      default: {
        name: "Mantle Testnet Explorer",
        url: "https://testnet.mantlescan.org/",
      },
    },
  },
  {
    id: 534351,
    name: "Scroll testnet",
    network: "scroll-testnet",
    image: "/scroll.ico",
    nativeCurrency: {
      decimals: 18,
      name: "Ethereum",
      symbol: "ETH",
    },
    rpcUrls: {
      default: {
        http: ["https://rpc.ankr.com/scroll_sepolia_testnet"],
      },
      public: {
        http: ["https://rpc.ankr.com/scroll_sepolia_testnet"],
      },
    },
    blockExplorers: {
      default: {
        name: "Scroll Sepolia Testnet Explorer",
        url: "https://testnet.mantlescan.org/",
      },
    },
  },
  {
    id: 23011913,
    name: "Arbitrum Stylus",
    network: "arbitrum-stylus",
    image: "/arbitrum.png",
    nativeCurrency: {
      decimals: 18,
      name: "Arbitrum",
      symbol: "ARB",
    },
    rpcUrls: {
      default: {
        http: ["https://stylus-testnet.arbitrum.io/rpc"],
      },
      public: {
        http: ["https://stylus-testnet.arbitrum.io/rpc"],
      },
    },
    blockExplorers: {
      default: {
        name: "Arbitrum Stylus Testnet Explorer",
        url: "https://stylus-testnet-explorer.arbitrum.io/",
      },
    },
  },
];

/**
 * Chains for the app
 */
export const appChains = configureChains(
  supportedChains,
  [
    alchemyProvider({
      apiKey: scaffoldConfig.alchemyApiKey,
      priority: 0,
    }),
    publicProvider({ priority: 1 }),
  ],
  {
    stallTimeout: 3_000,
    // Sets pollingInterval if using chain's other than local hardhat chain
    ...(configuredNetwork.id !== chains.hardhat.id
      ? {
          pollingInterval: scaffoldConfig.pollingInterval,
        }
      : {}),
  },
);

const wallets = [
  metaMaskWallet({ chains: appChains.chains, shimDisconnect: true }),
  walletConnectWallet({ chains: appChains.chains }),
  ledgerWallet({ chains: appChains.chains }),
  braveWallet({ chains: appChains.chains }),
  coinbaseWallet({ appName: "scaffold-eth-2", chains: appChains.chains }),
  rainbowWallet({ chains: appChains.chains }),
];

/**
 * wagmi connectors for the wagmi context
 */
export const wagmiConnectors = connectorsForWallets([
  {
    groupName: "Supported Wallets",
    wallets: burnerConfig.enabled ? [...wallets, burnerWalletConfig({ chains: [appChains.chains[0]] })] : wallets,
  },
]);
