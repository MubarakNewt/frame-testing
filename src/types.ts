export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
}

export interface SwapQuote {
  fromToken: Token;
  toToken: Token;
  inputAmount: string;
  outputAmount: string;
  priceImpact: number;
  fees: string;
}

export interface SwapTransaction {
  to: string;
  from: string;
  data: string;
  value: string;
}
