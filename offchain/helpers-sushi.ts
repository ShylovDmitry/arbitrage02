import uniswapToken from "@uniswap/default-token-list";
import artbitrumTokens from "./data/token-list-42161.json";
import { Token } from "@uniswap/sdk-core";
import { ChainId } from "@uniswap/sdk";
import { getChainId } from "./helpers";

const uniswapTokenObj: {
  [key: string]: { [key: string]: typeof uniswapToken.tokens[0] };
} = {};
for (let i = 0; i < uniswapToken.tokens.length; i++) {
  const token = uniswapToken.tokens[i];
  if (typeof uniswapTokenObj[token.chainId] === "undefined") {
    uniswapTokenObj[token.chainId] = {};
  }
  uniswapTokenObj[token.chainId][token.symbol] = token;
}

export function getUniswapTokenObjBySymbol(chainId: number, symbol: string) {
  return uniswapTokenObj[chainId][symbol];
}

export function getTokenBySymbol(symbol: string): Token {
  const chainId = getChainId();
  const tokenObj = getUniswapTokenObjBySymbol(chainId, symbol);
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
  const tokenObj = Object.values(uniswapTokenObj[chainId]).find(
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

// export function getTokenByAddress(address: string): Token | null {
//   const tokenObj = getUniswapTokenObjByAddress(address);
//   return tokenObj
//     ? new Token(
//         chainId,
//         tokenObj.address,
//         tokenObj.decimals,
//         tokenObj.symbol,
//         tokenObj.name
//       )
//     : null;
// }

// export function findPoolAddress(token0: Token, token1: Token): string {
//   return (
//     POOL_ADDRESSES[`${token0.symbol}_${token1.symbol}`] ||
//     POOL_ADDRESSES[`${token1.symbol}_${token0.symbol}`]
//   );
// }

// export async function getPoolImmutables(
//   poolContract: ethers.Contract
// ): Promise<PoolImmutables> {
//   const [factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick] =
//     await Promise.all([
//       poolContract.factory(),
//       poolContract.token0(),
//       poolContract.token1(),
//       poolContract.fee(),
//       poolContract.tickSpacing(),
//       poolContract.maxLiquidityPerTick(),
//     ]);
//
//   return {
//     factory,
//     token0,
//     token1,
//     fee,
//     tickSpacing,
//     maxLiquidityPerTick,
//   };
// }

// export async function getPoolState(
//   poolContract: ethers.Contract
// ): Promise<PoolState> {
//   const [liquidity, slot] = await Promise.all([
//     poolContract.liquidity(),
//     poolContract.slot0(),
//   ]);
//
//   return {
//     liquidity,
//     sqrtPriceX96: slot[0],
//     tick: slot[1],
//     observationIndex: slot[2],
//     observationCardinality: slot[3],
//     observationCardinalityNext: slot[4],
//     feeProtocol: slot[5],
//     unlocked: slot[6],
//   };
// }
