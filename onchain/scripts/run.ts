import * as dotenv from "dotenv";
import hre, { ethers } from "hardhat";
import { uniswapTrade } from "../src/uniswapTrade";

dotenv.config();

async function main() {
  const networkName = hre.network.name;
  console.log("NETWORK:", networkName);

  const amountIn = ethers.utils.parseUnits("100", 9);
  const profitAmount = ethers.utils.parseUnits("1", 18);

  // const WETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
  // const fee0 = "3000";
  // const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
  // const fee1 = "3000";
  // const UNI = "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0";
  // const fee2 = "3000";

  const WETH = "0x82af49447d8a07e3bd95bd0d56f35241523fbab1";
  const fee0 = "3000";
  const DAI = "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1";
  const fee1 = "500";
  const UNI = "0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0";
  const fee2 = "3000";

  await uniswapTrade(
    networkName,
    amountIn,
    profitAmount,
    WETH,
    fee0,
    DAI,
    fee1,
    UNI,
    fee2,
    WETH
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
