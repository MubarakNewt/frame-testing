import { Token } from "./types";

// Supported tokens on Arbitrum and Mainnet
export const SUPPORTED_TOKENS: Record<number, Token[]> = {
  // Arbitrum chain
  42161: [
    {
      address: "0x82aF49447D8a07e3bd95BD0d56f313302e97F56e", // WETH
      symbol: "ETH",
      name: "Wrapped Ether",
      decimals: 18,
      chainId: 42161,
    },
    {
      address: "0xUSDC", // Update with correct Arbitrum USDC if needed
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      chainId: 42161,
    },
    {
      address: "0x912CE59144191c1204e64559fe8253a0e9b7ead8", // ARB
      symbol: "ARB",
      name: "Arbitrum",
      decimals: 18,
      chainId: 42161,
    },
    {
      address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5F86", // USDC.e (bridged USDC)
      symbol: "USDC.e",
      name: "Bridged USDC",
      decimals: 6,
      chainId: 42161,
    },
  ],
  // Mainnet
  1: [
    {
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
      symbol: "ETH",
      name: "Wrapped Ether",
      decimals: 18,
      chainId: 1,
    },
    {
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      chainId: 1,
    },
    {
      address: "0xB50721BCF8d956CB3FA2Eaf855d30E33E26B995e", // ARB
      symbol: "ARB",
      name: "Arbitrum",
      decimals: 18,
      chainId: 1,
    },
    {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
      symbol: "USDT",
      name: "Tether",
      decimals: 6,
      chainId: 1,
    },
  ],
};

// Uniswap V3 Router Address
export const UNISWAP_V3_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

// Uniswap V3 Router ABI (essential methods)
export const UNISWAP_V3_ROUTER_ABI = [
  {
    name: "exactInputSingle",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "recipient", type: "address" },
          { name: "deadline", type: "uint256" },
          { name: "amountIn", type: "uint256" },
          { name: "amountOutMinimum", type: "uint256" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
      },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
    type: "function",
  },
  {
    name: "exactOutputSingle",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "recipient", type: "address" },
          { name: "deadline", type: "uint256" },
          { name: "amountOut", type: "uint256" },
          { name: "amountInMaximum", type: "uint256" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
      },
    ],
    outputs: [{ name: "amountIn", type: "uint256" }],
    type: "function",
  },
];

// Standard ERC20 ABI for approve and balance checks
export const ERC20_ABI = [
  {
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
  {
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
  },
  {
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
  },
];

// Fee tiers for Uniswap V3 (in basis points: 1bp = 0.01%)
export const UNISWAP_FEE_TIERS = [100, 500, 3000, 10000]; // 0.01%, 0.05%, 0.30%, 1%
