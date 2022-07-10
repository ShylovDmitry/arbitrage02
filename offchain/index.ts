import { createPair, getEthPairs } from "./services/sushiswap";
import { getAllPairs, SushiswapApiPair } from "./services/sushiswap.api";
import {
  Token as SushiswapToken,
  CurrencyAmount as SushiswapCurrencyAmount,
  Ether,
} from "@sushiswap/sdk";
import {
  Token as UniswapToken,
  CurrencyAmount as UniswapCurrencyAmount,
} from "@uniswap/sdk-core";
import { getChainId, getTokenBySymbol } from "./helpers";
import { getAllPools, UniswapApiPool } from "./services/uniswap.api";
import { createPool, getEthPools } from "./services/uniswap";
import { ethers } from "ethers";

const ethToken = Ether.onChain(getChainId()).wrapped;
const WETH = getTokenBySymbol("WETH");

async function main() {
  const pairs = await getAllPairs();
  const sushiswapPairs = getEthPairs(pairs);
  // sushiswapPairs
  //   .filter(
  //     (pair) =>
  //       // pair.token0.id === "0x767FE9EDC9E0dF98E07454847909b5E959D7ca0E" ||
  //       // pair.token1.id === "0x767FE9EDC9E0dF98E07454847909b5E959D7ca0E"
  //       pair.token0.symbol === "ILV" || pair.token1.symbol === "ILV"
  //   )
  //   .map(console.log);
  // return;

  const pools = await getAllPools();
  const uniswapPools = getEthPools(pools);

  const result = [];
  for (const pair of sushiswapPairs) {
    for (const pool of uniswapPools) {
      if (
        (pair.token0.id === pool.token0.id ||
          pair.token0.id === pool.token1.id) &&
        (pair.token1.id === pool.token0.id || pair.token1.id === pool.token1.id)
      ) {
        const amountArr = ["0.5", "1", "1.5", "2", "2.5"];
        for (const amount of amountArr) {
          try {
            const res = await tradeSushiUni(pair, pool, amount);
            if (res) {
              result.push(res);
            }
          } catch (e) {
            console.error(e);
          }

          try {
            const res = await tradeUniSushi(pool, pair, amount);
            if (res) {
              result.push(res);
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
  }

  // @ts-ignore
  console.log(result.sort((a, b) => b.profitOut - a.profitOut));
}

async function tradeSushiUni(
  pair: SushiswapApiPair,
  pool: UniswapApiPool,
  amountInEth: string
) {
  const sushiAmountIn = SushiswapCurrencyAmount.fromRawAmount(
    ethToken,
    ethers.utils.parseUnits(amountInEth, ethToken.decimals).toString()
  );
  const uniAmountIn = UniswapCurrencyAmount.fromRawAmount(
    WETH,
    ethers.utils.parseUnits(amountInEth, WETH.decimals).toString()
  );

  const sushiPair = createPair(pair);
  const [amountOut0] = sushiPair.getOutputAmount(sushiAmountIn);

  const amountIn1 = UniswapCurrencyAmount.fromRawAmount(
    new UniswapToken(
      getChainId(),
      amountOut0.currency.address,
      amountOut0.currency.decimals,
      amountOut0.currency.symbol,
      amountOut0.currency.name
    ),
    ethers.utils
      .parseUnits(amountOut0.toExact(), amountOut0.currency.decimals)
      .toString()
  );
  const uniPool = createPool(pool);
  const [amountOut] = await uniPool.getOutputAmount(amountIn1);

  return {
    type: "sushi-uni",
    amountIn: sushiAmountIn.toExact(),
    amountOut0: amountOut0.toExact(),
    amountOut: amountOut.toExact(),
    profitOut: amountOut.subtract(uniAmountIn).toExact(),
    pairs: [pair.token0.symbol, pair.token1.symbol],
  };
}

async function tradeUniSushi(
  pool: UniswapApiPool,
  pair: SushiswapApiPair,
  amountInEth: string
) {
  const uniAmountIn = UniswapCurrencyAmount.fromRawAmount(
    WETH,
    ethers.utils.parseUnits(amountInEth, WETH.decimals).toString()
  );
  const sushiAmountIn = SushiswapCurrencyAmount.fromRawAmount(
    ethToken,
    ethers.utils.parseUnits(amountInEth, ethToken.decimals).toString()
  );

  const uniPool = createPool(pool);
  const [amountOut0] = await uniPool.getOutputAmount(uniAmountIn);
  // console.log("amountOut0", amountOut0, amountOut0.toExact());

  const amountIn1 = SushiswapCurrencyAmount.fromRawAmount(
    new SushiswapToken(
      getChainId(),
      amountOut0.currency.address,
      amountOut0.currency.decimals,
      amountOut0.currency.symbol,
      amountOut0.currency.name
    ),
    ethers.utils
      .parseUnits(amountOut0.toExact(), amountOut0.currency.decimals)
      .toString()
  );
  // console.log("amountIn1", amountIn1, amountIn1.toExact());
  const sushiPair = createPair(pair);
  const [amountOut] = sushiPair.getOutputAmount(amountIn1);

  return {
    type: "uni-sushi",
    amountIn: uniAmountIn.toExact(),
    amountOut0: amountOut0.toExact(),
    amountOut: amountOut.toExact(),
    profitOut: amountOut.subtract(sushiAmountIn).toExact(),
    pairs: [pair.token0.symbol, pair.token1.symbol],
  };
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
