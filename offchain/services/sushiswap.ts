import { SushiswapApiPair } from "./sushiswap.api";

export async function generatePairFlows(
  pairs: SushiswapApiPair[]
): Promise<[SushiswapApiPair, SushiswapApiPair, SushiswapApiPair][]> {
  const pairFlows: [SushiswapApiPair, SushiswapApiPair, SushiswapApiPair][] =
    [];

  const ethPools = pairs.filter(
    ({ token0, token1 }) => token0.symbol === "WETH" || token1.symbol === "WETH"
  );
  const nonEthPools = pairs.filter(
    ({ token0, token1 }) => token0.symbol !== "WETH" && token1.symbol !== "WETH"
  );

  for (let i = 0; i < ethPools.length; i++) {
    const pool0 = ethPools[i];

    for (let j = 0; j < ethPools.length; j++) {
      if (i === j) continue;
      const pool2 = ethPools[j];

      const findToken0 =
        pool0.token0.symbol !== "WETH" ? pool0.token0 : pool0.token1;
      const findToken1 =
        pool2.token0.symbol !== "WETH" ? pool2.token0 : pool2.token1;

      nonEthPools
        .filter(({ token0, token1 }) => {
          return (
            (token0.id === findToken0.id && token1.id === findToken1.id) ||
            (token0.id === findToken1.id && token1.id === findToken0.id)
          );
        })
        .map((pool1) => {
          pairFlows.push([pool0, pool1, pool2]);
        });
    }
  }
  return pairFlows;
}
