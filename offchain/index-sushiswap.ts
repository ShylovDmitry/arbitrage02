import { createPair, generatePairFlows } from "./services/sushiswap";
import { getAllPairs, SushiswapApiPair } from "./services/sushiswap.api";
import { CurrencyAmount, Ether, Pair, Token } from "@sushiswap/sdk";
import { ethers } from "ethers";
import { getChainId } from "./helpers";

const ethToken = Ether.onChain(getChainId()).wrapped;

async function main() {
  const pairs = await getAllPairs();
  const flows = await generatePairFlows(pairs);

  const result = [];
  for (const pairs of flows) {
    result.push(tradePairs(pairs, "0.3"));
    result.push(tradePairs(pairs, "0.5"));
    result.push(tradePairs(pairs, "1"));
    result.push(tradePairs(pairs, "1.5"));
    result.push(tradePairs(pairs, "2"));
    result.push(tradePairs(pairs, "2.5"));
    result.push(tradePairs(pairs, "3"));
    result.push(tradePairs(pairs, "4"));
    result.push(tradePairs(pairs, "5"));
  }

  // @ts-ignore
  console.log(result.sort((a, b) => b.profitOut - a.profitOut));
}

function tradePairs(pairs: SushiswapApiPair[], amountInEth: string) {
  const amountIn = CurrencyAmount.fromRawAmount(
    ethToken,
    ethers.utils.parseUnits(amountInEth, ethToken.decimals).toString()
  );
  let amountOut = amountIn;
  const amountOuts = [];
  for (const pair of pairs) {
    const sushiswapPair = createPair(pair);
    [amountOut] = sushiswapPair.getOutputAmount(amountOut);

    amountOuts.push(amountOut);
  }

  return {
    amountIn: amountIn.toExact(),
    amountOut: amountOut.toExact(),
    profitOut: amountOut.subtract(amountIn).toExact(),
    amountOuts: amountOuts.map((amount) => amount.toExact()),
    pairs: pairs
      .map((pair) => [pair.token0.symbol, pair.token1.symbol])
      .toString(),
  };
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
