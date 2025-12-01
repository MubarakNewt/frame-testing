import axios from "axios";
import { parseUnits } from "viem";
import { Token, SwapQuote } from "./types";

// Get price quote from 1inch API (supports Arbitrum and Mainnet)
export async function getSwapQuote(
  fromToken: Token,
  toToken: Token,
  inputAmount: string
): Promise<SwapQuote> {
  try {
    const chainId = fromToken.chainId === 42161 ? 42161 : 1; // Arbitrum or Mainnet

    const params = {
      tokenIn: fromToken.address,
      tokenOut: toToken.address,
      amountIn: parseUnits(inputAmount, fromToken.decimals).toString(),
      slippage: 0.5, // 0.5% slippage tolerance
    };

    // Using 1inch API for quote
    const response = await axios.get(
      `https://api.1inch.io/v5.2/${chainId}/quote`,
      { params }
    );

    const data = response.data;

    // Calculate price impact
    const outputAmount =
      parseFloat(data.toTokenAmount) / 10 ** toToken.decimals;
    const priceImpact = parseFloat(data.estimatedGas || "0");

    return {
      fromToken,
      toToken,
      inputAmount,
      outputAmount: outputAmount.toString(),
      priceImpact,
      fees: (parseFloat(data.protocolFee || "0") / 10 ** toToken.decimals).toString(),
    };
  } catch (error) {
    console.error("Error fetching swap quote:", error);
    throw new Error("Failed to fetch swap quote");
  }
}

// Get swap data from 1inch for transaction execution
export async function getSwapData(
  fromToken: Token,
  toToken: Token,
  inputAmount: string,
  recipient: string,
  slippage: number = 0.5
) {
  try {
    const chainId = fromToken.chainId === 42161 ? 42161 : 1;

    const params = {
      tokenIn: fromToken.address,
      tokenOut: toToken.address,
      amountIn: parseUnits(inputAmount, fromToken.decimals).toString(),
      fromAddress: recipient,
      slippage,
      allowPartialFill: false,
    };

    const response = await axios.get(
      `https://api.1inch.io/v5.2/${chainId}/swap`,
      { params }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching swap data:", error);
    throw new Error("Failed to fetch swap data");
  }
}

// Format token amount for display
export function formatTokenAmount(amount: string, decimals: number): string {
  try {
    const num = parseFloat(amount) / 10 ** decimals;
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  } catch {
    return "0";
  }
}

// Parse user input to contract format
export function parseTokenInput(
  input: string,
  decimals: number
): string {
  try {
    return parseUnits(input || "0", decimals).toString();
  } catch {
    return "0";
  }
}

// Get token by symbol for a specific chain
export function getTokenBySymbol(
  symbol: string,
  chainId: number,
  tokens: Token[]
): Token | undefined {
  return tokens.find((t) => t.symbol === symbol && t.chainId === chainId);
}
