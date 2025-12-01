import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { http, createConfig } from "wagmi";
import { arbitrum, mainnet } from "wagmi/chains";

export const config = createConfig({
  chains: [arbitrum, mainnet],
  connectors: [miniAppConnector()],
  transports: {
    [arbitrum.id]: http(),
    [mainnet.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
