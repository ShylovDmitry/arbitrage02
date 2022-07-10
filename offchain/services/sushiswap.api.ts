import axios from "axios";

// const endpoint =
//   "https://api.thegraph.com/subgraphs/name/sushiswap/arbitrum-exchange";
const endpoint = "https://api.thegraph.com/subgraphs/name/sushiswap/exchange";

export interface SushiswapApiPair {
  id: string;
  name: string;
  reserve0: string;
  reserve1: string;
  token0Price: string;
  token1Price: string;
  volumeToken0: string;
  volumeToken1: string;
  token0: {
    id: string;
    name: string;
    symbol: string;
    decimals: string;
  };
  token1: {
    id: string;
    name: string;
    symbol: string;
    decimals: string;
  };
}

export async function getPairs(
  first: number,
  skip: number
): Promise<SushiswapApiPair[]> {
  const response = await axios({
    url: endpoint,
    method: "post",
    data: {
      query: `
query Pairs($first: Int, $skip: Int) {
  pairs(first: $first, skip: $skip, orderBy: volumeUSD, orderDirection: desc) {
    id
    name
    reserve0
    reserve1
    token0Price
    token1Price
    volumeToken0
    volumeToken1
    token0 {
      id
      name
      symbol
      decimals
    }
    token1 {
      id
      name
      symbol
      decimals
    }
  }
}
      `,
      variables: {
        first,
        skip,
      },
    },
  });

  // console.log(response.data.errors);
  const pairs: SushiswapApiPair[] = response.data.data.pairs;
  return pairs;
}

export async function getAllPairs(): Promise<SushiswapApiPair[]> {
  const limit = 100;
  const result = await Promise.all(
    [...Array(10).keys()].map((val) => getPairs(limit, val * limit))
  );
  return result.flat();
}
