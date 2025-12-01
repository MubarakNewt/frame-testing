import { Token } from "./types";
import { SUPPORTED_TOKENS } from "./constants";
import "./TokenSelector.css";

interface TokenSelectorProps {
  selectedToken: Token | null;
  onTokenSelect: (token: Token) => void;
  chainId: number;
  excludeToken?: Token | null;
}

export function TokenSelector({
  selectedToken,
  onTokenSelect,
  chainId,
  excludeToken,
}: TokenSelectorProps) {
  const availableTokens = (SUPPORTED_TOKENS[chainId] || []).filter(
    (t) => !excludeToken || t.address !== excludeToken.address
  );

  return (
    <div className="token-selector">
      <div className="token-selector-header">
        {selectedToken ? (
          <div className="selected-token">
            <span className="token-symbol">{selectedToken.symbol}</span>
            <span className="token-name">{selectedToken.name}</span>
          </div>
        ) : (
          <span className="placeholder">Select Token</span>
        )}
      </div>

      <div className="token-list">
        {availableTokens.length > 0 ? (
          availableTokens.map((token) => (
            <button
              key={token.address}
              className={`token-item ${
                selectedToken?.address === token.address ? "selected" : ""
              }`}
              onClick={() => onTokenSelect(token)}
              type="button"
            >
              <div className="token-item-content">
                <span className="token-symbol">{token.symbol}</span>
                <span className="token-name">{token.name}</span>
              </div>
            </button>
          ))
        ) : (
          <div className="no-tokens">No tokens available</div>
        )}
      </div>
    </div>
  );
}
