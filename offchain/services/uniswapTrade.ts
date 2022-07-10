import { getArbitrumByUniswapAddress, getToken } from "../helpers";
import uniswapApiService, { UniswapApiPool } from "./uniswap.api";
import { ProfitableSwapPath } from "../interfaces/profitableSwapPath";
import { CurrencyAmount } from "@uniswap/sdk-core";
import { ethers } from "ethers";
import { createPool, generateSwapPaths } from "./uniswap";
import { uniswapTrade } from "../../onchain/src/uniswapTrade";

const WETH = getToken("WETH");

async function getProfitableSwapPaths(
  amountInEth: number,
  swapPaths: [UniswapApiPool, UniswapApiPool, UniswapApiPool][]
): Promise<ProfitableSwapPath[]> {
  const amountIn = CurrencyAmount.fromRawAmount(
    WETH,
    ethers.utils.parseUnits(amountInEth.toString(), WETH.decimals).toString()
  );

  const profitableSwapPaths: ProfitableSwapPath[] = [];
  for (const [pool0, pool1, pool2] of swapPaths) {
    try {
      const [amountOut0] = await createPool(pool0).getOutputAmount(amountIn);
      const [amountOut1] = await createPool(pool1).getOutputAmount(amountOut0);
      const [amountOut2] = await createPool(pool2).getOutputAmount(amountOut1);

      const profitAmount = amountOut2.subtract(amountIn);

      if (profitAmount.greaterThan(0)) {
        profitableSwapPaths.push({
          amountIn,
          profitAmount,
          pool0,
          pool1,
          pool2,
        });
      }
    } catch (e) {
      // console.log(createPool(pool0), createPool(pool1), createPool(pool2));
      // console.error(e);
      // break;
    }
  }
  return profitableSwapPaths;
}

function displayProfit({
  amountIn,
  profitAmount,
  pool0,
  pool1,
  pool2,
}: ProfitableSwapPath) {
  console.log(`-----------------`);
  console.log(
    `[${pool0.token0.symbol}, ${pool0.token1.symbol}] [${pool1.token0.symbol}, ${pool1.token1.symbol}] [${pool2.token0.symbol}, ${pool2.token1.symbol}]`
  );
  console.log(
    `pool0: ${pool0.id} tokens [${pool0.token0.id} ${pool0.token1.id}] fee ${pool0.feeTier}`
  );
  console.log(
    `pool1: ${pool1.id} tokens [${pool1.token0.id} ${pool1.token1.id}] fee ${pool0.feeTier}`
  );
  console.log(
    `pool2: ${pool2.id} tokens [${pool2.token0.id} ${pool2.token1.id}] fee ${pool0.feeTier}`
  );
  console.log(`Input Amount: ${amountIn.toExact()} ETH`);
  console.log(
    `Profit: ${profitAmount.toExact()} ETH (~ ${profitAmount
      .multiply(1000)
      .toFixed(2)} USD)`
  );
  console.log(
    `Diff: ${profitAmount
      .multiply(Math.pow(10, WETH.decimals))
      .multiply(100)
      .divide(
        CurrencyAmount.fromRawAmount(
          WETH,
          ethers.utils.parseUnits("1", WETH.decimals).toString()
        )
      )
      .toFixed(4)}%`
  );
}

export async function trade(minProfitAmountEth: string) {
  console.log(new Date().toString());

  console.info("INFO: retrieving pools...");
  const pools = await uniswapApiService.getAllPools();

  console.info("INFO: generating swaps...");
  const swapPaths = await generateSwapPaths(pools);

  console.time("ProfitableSwapPaths");

  console.info(
    `INFO: finding profitable swaps for ${minProfitAmountEth} ETH...`
  );
  const profitableSwapsArray = await Promise.all([
    await getProfitableSwapPaths(0.01, swapPaths),
    // await getProfitableSwapPaths(0.15, swapPaths),
    // await getProfitableSwapPaths(0.3, swapPaths),
    // await getProfitableSwapPaths(0.4, swapPaths),
    // await getProfitableSwapPaths(0.5, swapPaths),
    //
    // await getProfitableSwapPaths(1, swapPaths),
    // await getProfitableSwapPaths(1.5, swapPaths),
    // await getProfitableSwapPaths(2, swapPaths),
    // await getProfitableSwapPaths(2.5, swapPaths),
    // await getProfitableSwapPaths(3, swapPaths),
  ]);

  const minProfitAmount = CurrencyAmount.fromRawAmount(
    WETH,
    ethers.utils.parseUnits(minProfitAmountEth, WETH.decimals).toString()
  );

  const profitableSwaps = profitableSwapsArray
    .flat()
    // .filter((swap) => swap.profitAmount.greaterThan(minProfitAmount))
    .sort((a, b) =>
      a.profitAmount.toExact().localeCompare(b.profitAmount.toExact())
    );
  // profitableSwaps.map(displayProfit);

  // const mostProfitableSwap = profitableSwaps[profitableSwaps.length - 1];
  for (let i = profitableSwaps.length - 1; i >= 0; i--) {
    // if (mostProfitableSwap) {
    const mostProfitableSwap = profitableSwaps[i];

    const { amountIn, pool0, pool1, pool2, profitAmount } = mostProfitableSwap;

    const token0 =
      pool0.token0.id.toLowerCase() === WETH.address.toLowerCase()
        ? pool0.token0.id
        : pool0.token1.id;
    const token1 =
      pool0.token0.id.toLowerCase() !== WETH.address.toLowerCase()
        ? pool0.token0.id
        : pool0.token1.id;
    const token2 =
      pool2.token0.id.toLowerCase() !== WETH.address.toLowerCase()
        ? pool2.token0.id
        : pool2.token1.id;
    const token3 =
      pool2.token0.id.toLowerCase() === WETH.address.toLowerCase()
        ? pool2.token0.id
        : pool2.token1.id;

    const arbToken0 = getArbitrumByUniswapAddress(token0);
    const arbToken1 = getArbitrumByUniswapAddress(token1);
    const arbToken2 = getArbitrumByUniswapAddress(token2);
    const arbToken3 = getArbitrumByUniswapAddress(token3);

    console.log(
      arbToken0?.address,
      arbToken1?.address,
      arbToken2?.address,
      arbToken3?.address
    );
    if (
      !arbToken0?.address ||
      !arbToken1?.address ||
      !arbToken2?.address ||
      !arbToken3?.address
    ) {
      continue;
    }

    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log("----- Most Profitable -----");
    displayProfit(mostProfitableSwap);

    await uniswapTrade(
      "mainnet",
      ethers.utils.parseUnits(amountIn.toExact(), WETH.decimals),
      ethers.utils.parseUnits(profitAmount.toExact(), WETH.decimals),
      arbToken0.address,
      pool0.feeTier,
      arbToken1.address,
      pool1.feeTier,
      arbToken2.address,
      pool2.feeTier,
      arbToken3.address
    );
    break;
  }

  console.timeEnd("ProfitableSwapPaths");
  console.log("");
}
