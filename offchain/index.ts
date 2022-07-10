import { generatePairFlows } from "./services/sushiswap";
import { getAllPairs, SushiswapApiPair } from "./services/sushiswap.api";
import { CurrencyAmount, Ether, Pair, Token } from "@sushiswap/sdk";
import { ethers } from "ethers";
import { getChainId } from "./helpers";
import { getAddress } from "ethers/lib/utils";

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
    amountOut = trade(pair, amountOut);
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

function trade(
  pair: SushiswapApiPair,
  amountIn: CurrencyAmount<Token>
): CurrencyAmount<Token> {
  const tokenA = new Token(
    getChainId(),
    getAddress(pair.token0.id),
    Number(pair.token0.decimals),
    pair.token0.symbol,
    pair.token0.name
  );
  const tokenB = new Token(
    getChainId(),
    getAddress(pair.token1.id),
    Number(pair.token1.decimals),
    pair.token1.symbol,
    pair.token1.name
  );

  const currencyAmountA = CurrencyAmount.fromRawAmount(
    tokenA,
    ethers.utils.parseUnits(pair.reserve0, tokenA.decimals).toString()
  );
  const currencyAmountB = CurrencyAmount.fromRawAmount(
    tokenB,
    ethers.utils.parseUnits(pair.reserve1, tokenB.decimals).toString()
  );

  const sushiswapPair = new Pair(currencyAmountA, currencyAmountB);
  const [amountOut] = sushiswapPair.getOutputAmount(amountIn);

  return amountOut;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
