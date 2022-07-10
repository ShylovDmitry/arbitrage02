import ethToken from "@uniswap/default-token-list";
import { Token } from "@uniswap/sdk-core";
import { ChainId } from "@uniswap/sdk";

export function getChainId() {
  return ChainId.MAINNET;
}

const ethTokenObj: {
  [key: string]: { [key: string]: typeof ethToken.tokens[0] };
} = {};
for (let i = 0; i < ethToken.tokens.length; i++) {
  const token = ethToken.tokens[i];
  if (typeof ethTokenObj[token.chainId] === "undefined") {
    ethTokenObj[token.chainId] = {};
  }
  ethTokenObj[token.chainId][token.symbol] = token;
}

export function getEthTokenObjBySymbol(chainId: number, symbol: string) {
  return ethTokenObj[chainId][symbol];
}

export function getTokenBySymbol(symbol: string): Token {
  const chainId = getChainId();
  const tokenObj = getEthTokenObjBySymbol(chainId, symbol);
  return new Token(
    chainId,
    tokenObj.address,
    tokenObj.decimals,
    tokenObj.symbol,
    tokenObj.name
  );
}

export function getUniswapTokenByAddress(address: string): Token | null {
  const chainId = getChainId();
  const tokenObj = Object.values(ethTokenObj[chainId]).find(
    (token) => token.address === address
  );
  if (!tokenObj) {
    return null;
  }

  return new Token(
    chainId,
    tokenObj.address,
    tokenObj.decimals,
    tokenObj.symbol,
    tokenObj.name
  );
}
