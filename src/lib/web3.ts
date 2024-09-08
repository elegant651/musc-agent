import ERC20Abi from "../abi/ERC20MockAbi.json";
import Web3 from "web3";
import { BigNumber } from "ethers";


export const CONFIG_CONTRACT = {
  // Each token is configured with its ERC20 contract address and Pyth Price Feed ID.
  // You can find the list of price feed ids at https://pyth.network/developers/price-feed-ids
  baseToken: {
    name: "mWETH",
    erc20Address: "0xE4DA5F3da7f4931fdbAc9F6e596622093A62aa36",
    pythPriceFeedId:
      "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
    decimals: 18,
  },
  quoteToken: {
    name: "mSOL",
    erc20Address: "0xD9e40B1F5952E90f65FfF38B1BFf8Fb1026012CD",
    pythPriceFeedId:
      "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
    decimals: 18,
  },
  swapContractAddress: "0x9f3B7591749EE201ab837f94b65fE14e86169A96",
  pythContractAddress: "0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a",
  hermesUrl: "https://hermes.pyth.network",
  mintQty: 10,
};


/**
 * Allow `approvedSpender` to spend your
 * @param web3
 * @param erc20Address
 * @param sender
 * @param approvedSpender
 */
export async function approveToken(
  web3: Web3,
  erc20Address: string,
  sender: string,
  approvedSpender: string
) {
  const erc20 = new web3.eth.Contract(ERC20Abi as any, erc20Address);

  await erc20.methods
    .approve(approvedSpender, BigNumber.from("2").pow(256).sub(1))
    .send({ from: sender });
}

export async function getApprovedQuantity(
  web3: Web3,
  erc20Address: string,
  sender: string,
  approvedSpender: string
): Promise<BigNumber> {
  const erc20 = new web3.eth.Contract(ERC20Abi as any, erc20Address);
  let allowance = BigNumber.from(
    await erc20.methods.allowance(sender, approvedSpender).call()
  );
  return allowance as BigNumber;
}

export async function getBalance(
  web3: Web3,
  erc20Address: string,
  address: string
): Promise<BigNumber> {
  const erc20 = new web3.eth.Contract(ERC20Abi as any, erc20Address);
  return BigNumber.from(await erc20.methods.balanceOf(address).call());
}

export async function mint(
  web3: Web3,
  sender: string,
  erc20Address: string,
  destinationAddress: string,
  quantity: BigNumber
) {
  const erc20 = new web3.eth.Contract(ERC20Abi as any, erc20Address);
  const receipt = await erc20.methods.mint(destinationAddress, quantity).send({ from: sender });
  return receipt;
}
