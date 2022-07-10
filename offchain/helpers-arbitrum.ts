import artbitrumTokens from "./data/token-list-42161.json";

const arbitrumTokenObj: {
  [key: string]: typeof artbitrumTokens.tokens[0];
} = {};
for (let i = 0; i < artbitrumTokens.tokens.length; i++) {
  const token = artbitrumTokens.tokens[i];
  if (token.extensions?.l1Address) {
    arbitrumTokenObj[token.extensions?.l1Address] = token;
  }
}

export function getArbitrumByUniswapAddress(address: string) {
  return arbitrumTokenObj[address];
}
