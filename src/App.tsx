import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { SwapInterface } from "./SwapInterface";
import "./App.css";

function App() {
  const [appMode, setAppMode] = useState<"menu" | "swap">("menu");

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <div className="app">
      <div className="app-container">
        {appMode === "menu" ? (
          <MainMenu onSelectSwap={() => setAppMode("swap")} />
        ) : (
          <div className="app-content">
            <button
              className="back-button"
              onClick={() => setAppMode("menu")}
              type="button"
            >
              ← Back
            </button>
            <SwapInterface onSwapComplete={() => setAppMode("menu")} />
          </div>
        )}
      </div>
    </div>
  );
}

function MainMenu({ onSelectSwap }: { onSelectSwap: () => void }) {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();

  return (
    <div className="main-menu">
      <div className="menu-header">
        <h1>Farcaster Swap Mini-App</h1>
        <p>Trade tokens seamlessly on Base & Mainnet</p>
      </div>

      {isConnected ? (
        <div className="connected-state">
          <div className="connection-status">
            <div className="status-indicator">✓</div>
            <div>
              <p className="status-text">Wallet Connected</p>
              <p className="address">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
            </div>
          </div>

          <button
            className="primary-button"
            onClick={onSelectSwap}
            type="button"
          >
            Open Swap
          </button>
        </div>
      ) : (
        <div className="disconnected-state">
          <div className="menu-item">
            <h3>Connect Your Wallet</h3>
            <p>Connect to swap tokens inside Farcaster</p>
          </div>

          {connectors.length > 0 ? (
            <button
              className="primary-button"
              onClick={() => connect({ connector: connectors[0] })}
              type="button"
            >
              Connect Wallet
            </button>
          ) : (
            <p className="error-text">No wallet connector available</p>
          )}
        </div>
      )}

      <div className="features">
        <h3>Features</h3>
        <ul>
          <li>✓ Swap tokens on Base & Mainnet</li>
          <li>✓ Live price quotes</li>
          <li>✓ Powered by Uniswap V3</li>
          <li>✓ Secure wallet integration</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
