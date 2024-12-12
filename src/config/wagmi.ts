import { http, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import { 
  metaMaskWallet,
  coinbaseWallet,
  phantomWallet,
  walletConnectWallet,
  injectedWallet
} from '@rainbow-me/rainbowkit/wallets'

const projectId = 'fb5903bbb9f77402cc890dd0313f4051'

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet,
      coinbaseWallet,
      phantomWallet,
      walletConnectWallet,
      injectedWallet
    ]
  }
], {
  appName: 'Quiz dApp',
  projectId
})

export const config = createConfig({
  chains: [sepolia],
  connectors,
  transports: {
    [sepolia.id]: http()
  },
}) 