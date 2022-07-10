import { SushiswapApiPair } from "./sushiswap.api";
import { getChainId } from "../helpers";
import { CurrencyAmount, Pair, Token } from "@sushiswap/sdk";
import { getAddress } from "ethers/lib/utils";
import { ethers } from "ethers";

export function createPair(pair: SushiswapApiPair): Pair {
  const token0 = new Token(
    getChainId(),
    getAddress(pair.token0.id),
    Number(pair.token0.decimals),
    pair.token0.symbol,
    pair.token0.name
  );
  const token1 = new Token(
    getChainId(),
    getAddress(pair.token1.id),
    Number(pair.token1.decimals),
    pair.token1.symbol,
    pair.token1.name
  );

  const currencyAmount0 = CurrencyAmount.fromRawAmount(
    token0,
    ethers.utils.parseUnits(pair.reserve0, token0.decimals).toString()
  );
  const currencyAmount1 = CurrencyAmount.fromRawAmount(
    token1,
    ethers.utils.parseUnits(pair.reserve1, token1.decimals).toString()
  );

  return new Pair(currencyAmount0, currencyAmount1);
}

export async function generatePairFlows(
  pairs: SushiswapApiPair[]
): Promise<[SushiswapApiPair, SushiswapApiPair, SushiswapApiPair][]> {
  const pairFlows: [SushiswapApiPair, SushiswapApiPair, SushiswapApiPair][] =
    [];

  const ethPairs = pairs.filter(
    ({ token0, token1 }) => token0.symbol === "WETH" || token1.symbol === "WETH"
  );
  const nonEthPairs = pairs.filter(
    ({ token0, token1 }) => token0.symbol !== "WETH" && token1.symbol !== "WETH"
  );

  for (let i = 0; i < ethPairs.length; i++) {
    const pair0 = ethPairs[i];

    for (let j = 0; j < ethPairs.length; j++) {
      if (i === j) continue;
      const pair2 = ethPairs[j];

      const findToken0 =
        pair0.token0.symbol !== "WETH" ? pair0.token0 : pair0.token1;
      const findToken1 =
        pair2.token0.symbol !== "WETH" ? pair2.token0 : pair2.token1;

      nonEthPairs
        .filter(({ token0, token1 }) => {
          return (
            (token0.id === findToken0.id && token1.id === findToken1.id) ||
            (token0.id === findToken1.id && token1.id === findToken0.id)
          );
        })
        .map((pair1) => {
          pairFlows.push([pair0, pair1, pair2]);
        });
    }
  }
  return pairFlows;
}

export async function getEthPairs(
  pairs: SushiswapApiPair[]
): Promise<SushiswapApiPair[]> {
  return pairs.filter(
    ({ token0, token1 }) => token0.symbol === "WETH" || token1.symbol === "WETH"
  );
}
