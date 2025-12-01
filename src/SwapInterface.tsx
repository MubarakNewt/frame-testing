import { useCallback, useEffect, useState } from "react";
import { useAccount, useChainId, usePublicClient, useWalletClient } from "wagmi";
import { Token, SwapQuote } from "./types";
import { SUPPORTED_TOKENS } from "./constants";
import { getSwapQuote, getSwapData, formatTokenAmount } from "./swapUtils";
import "./SwapInterface.css";

interface SwapInterfaceProps {
  onSwapComplete?: () => void;
}

export function SwapInterface({ onSwapComplete }: SwapInterfaceProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [inputAmount, setInputAmount] = useState<string>("");
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  // Initialize with default tokens on component mount
  useEffect(() => {
    const tokens = SUPPORTED_TOKENS[chainId] || [];
    if (tokens.length > 0) {
      setFromToken(tokens[0]);
      if (tokens.length > 1) {
        setToToken(tokens[1]);
      }
    }
  }, [chainId]);

  // Fetch quote when tokens or input amount changes
  useEffect(() => {
    if (!fromToken || !toToken || !inputAmount || parseFloat(inputAmount) <= 0) {
      setQuote(null);
      return;
    }

    const fetchQuote = async () => {
      try {
        setLoading(true);
        setError("");
        const swapQuote = await getSwapQuote(fromToken, toToken, inputAmount);
        setQuote(swapQuote);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch quote");
        setQuote(null);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchQuote, 500); // Debounce API calls
    return () => clearTimeout(timeoutId);
  }, [fromToken, toToken, inputAmount]);

  const handleSwap = useCallback(async () => {
    if (!isConnected || !address || !fromToken || !toToken || !quote) {
      setError("Please connect wallet and select tokens");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Get swap transaction data
      const swapData = await getSwapData(
        fromToken,
        toToken,
        inputAmount,
        address,
        0.5
      );

      // Execute swap
      if (walletClient && publicClient) {
        const hash = await walletClient.sendTransaction({
          account: address,
          to: swapData.tx.to,
          data: swapData.tx.data,
          value: BigInt(swapData.tx.value || "0"),
        });

        // Wait for transaction confirmation
        await publicClient.waitForTransactionReceipt({ hash });

        setSuccess(`Swap completed! TX: ${hash}`);
        setInputAmount("");
        setQuote(null);
        onSwapComplete?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Swap failed");
    } finally {
      setLoading(false);
    }
  }, [
    isConnected,
    address,
    fromToken,
    toToken,
    quote,
    inputAmount,
    walletClient,
    publicClient,
    onSwapComplete,
  ]);

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setInputAmount("");
    setQuote(null);
    setFromOpen(false);
    setToOpen(false);
  };

  const availableTokens = SUPPORTED_TOKENS[chainId] || [];

  if (!isConnected) {
    return (
      <div className="swap-interface">
        <div className="connect-prompt">
          <p>Connect your wallet to start swapping</p>
        </div>
      </div>
    );
  }

  return (
    <div className="swap-interface">
      <div className="swap-header">
        <h2>Swap</h2>
      </div>

      <div className="swap-container">
        {/* From Token Section */}
        <div className="swap-section from-section">
          <div className="section-top">
            <label className="section-label">Sell</label>
          </div>

          <div className="swap-input-box">
            <div className="input-with-amount">
              <input
                type="number"
                placeholder="0"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                className="amount-input"
                disabled={loading}
              />
            </div>

            <button
              className="token-selector-btn"
              onClick={() => {
                setFromOpen(!fromOpen);
                setToOpen(false);
              }}
              type="button"
            >
              {fromToken ? (
                <>
                  <span className="token-symbol">{fromToken.symbol}</span>
                  <span className="dropdown-icon">▼</span>
                </>
              ) : (
                <span>Select token</span>
              )}
            </button>
          </div>

          {fromToken && (
            <div className="usd-value">${inputAmount ? (parseFloat(inputAmount) * 1.0).toFixed(2) : "0"}</div>
          )}

          {fromOpen && (
            <div className="token-dropdown">
              {availableTokens
                .filter((t) => !toToken || t.address !== toToken.address)
                .map((token) => (
                  <button
                    key={token.address}
                    className={`token-option ${
                      fromToken?.address === token.address ? "selected" : ""
                    }`}
                    onClick={() => {
                      setFromToken(token);
                      setFromOpen(false);
                    }}
                    type="button"
                  >
                    <div className="token-info">
                      <div className="token-name">{token.symbol}</div>
                      <div className="token-desc">{token.name}</div>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Swap Direction Button */}
        <button
          className="swap-direction-btn"
          onClick={handleSwapTokens}
          disabled={loading}
          type="button"
          title="Swap tokens"
        >
          ⇅
        </button>

        {/* To Token Section */}
        <div className="swap-section to-section">
          <div className="section-top">
            <label className="section-label">Buy</label>
          </div>

          <div className="swap-input-box">
            <div className="input-with-amount">
              <input
                type="text"
                placeholder="0"
                value={quote ? formatTokenAmount(quote.outputAmount, toToken?.decimals || 18) : ""}
                readOnly
                className="amount-input readonly"
              />
            </div>

            <button
              className="token-selector-btn"
              onClick={() => {
                setToOpen(!toOpen);
                setFromOpen(false);
              }}
              type="button"
            >
              {toToken ? (
                <>
                  <span className="token-symbol">{toToken.symbol}</span>
                  <span className="dropdown-icon">▼</span>
                </>
              ) : (
                <span>Select token</span>
              )}
            </button>
          </div>

          {toToken && (
            <div className="usd-value">${quote ? (parseFloat(formatTokenAmount(quote.outputAmount, toToken.decimals)) * 1.0).toFixed(2) : "0"}</div>
          )}

          {toOpen && (
            <div className="token-dropdown">
              {availableTokens
                .filter((t) => !fromToken || t.address !== fromToken.address)
                .map((token) => (
                  <button
                    key={token.address}
                    className={`token-option ${
                      toToken?.address === token.address ? "selected" : ""
                    }`}
                    onClick={() => {
                      setToToken(token);
                      setToOpen(false);
                    }}
                    type="button"
                  >
                    <div className="token-info">
                      <div className="token-name">{token.symbol}</div>
                      <div className="token-desc">{token.name}</div>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Success Message */}
        {success && <div className="success-message">{success}</div>}

        {/* Swap Button */}
        <button
          className={`swap-button ${!quote || loading ? "disabled" : ""}`}
          onClick={handleSwap}
          disabled={!quote || loading || !isConnected}
          type="button"
        >
          {loading ? "Processing..." : quote ? "Swap" : "Enter amount"}
        </button>
      </div>
    </div>
  );
}
