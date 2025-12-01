import { useCallback, useEffect, useState } from "react";
import { useAccount, useChainId, usePublicClient, useWalletClient } from "wagmi";
import { Token, SwapQuote } from "./types";
import { SUPPORTED_TOKENS } from "./constants";
import { getSwapQuote, getSwapData, formatTokenAmount } from "./swapUtils";
import { TokenSelector } from "./TokenSelector";
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
  };

  if (!isConnected) {
    return (
      <div className="swap-interface">
        <div className="swap-header">
          <h2>Swap Tokens</h2>
        </div>
        <div className="connect-prompt">
          <p>Connect your wallet to start swapping</p>
        </div>
      </div>
    );
  }

  return (
    <div className="swap-interface">
      <div className="swap-header">
        <h2>Swap Tokens</h2>
        <div className="chain-info">Chain: {chainId === 42161 ? "Arbitrum" : "Mainnet"}</div>
      </div>

      <div className="swap-container">
        {/* From Token */}
        <div className="swap-section">
          <label className="section-label">From</label>
          <TokenSelector
            selectedToken={fromToken}
            onTokenSelect={setFromToken}
            chainId={chainId}
            excludeToken={toToken}
          />
          <div className="input-group">
            <input
              type="number"
              placeholder="0.0"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              className="amount-input"
              disabled={loading}
            />
            {fromToken && (
              <span className="token-label">{fromToken.symbol}</span>
            )}
          </div>
        </div>

        {/* Swap Direction Button */}
        <button
          className="swap-direction-btn"
          onClick={handleSwapTokens}
          disabled={loading}
          type="button"
        >
          ⇅
        </button>

        {/* To Token */}
        <div className="swap-section">
          <label className="section-label">To</label>
          <TokenSelector
            selectedToken={toToken}
            onTokenSelect={setToToken}
            chainId={chainId}
            excludeToken={fromToken}
          />
          <div className="input-group">
            <input
              type="text"
              placeholder="0.0"
              value={quote ? formatTokenAmount(quote.outputAmount, toToken?.decimals || 18) : ""}
              readOnly
              className="amount-input readonly"
            />
            {toToken && (
              <span className="token-label">{toToken.symbol}</span>
            )}
          </div>
        </div>

        {/* Quote Details */}
        {quote && (
          <div className="quote-details">
            <div className="detail-row">
              <span>Rate</span>
              <span>
                1 {fromToken?.symbol} = {(parseFloat(quote.outputAmount) / parseFloat(inputAmount)).toFixed(6)} {toToken?.symbol}
              </span>
            </div>
            {quote.fees && (
              <div className="detail-row">
                <span>Fees</span>
                <span>{formatTokenAmount(quote.fees, toToken?.decimals || 18)} {toToken?.symbol}</span>
              </div>
            )}
          </div>
        )}

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

        {/* Address Info */}
        <div className="address-info">
          <small>Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</small>
        </div>
      </div>
    </div>
  );
}
