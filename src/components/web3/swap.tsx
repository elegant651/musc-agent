'use client';
import { useMetaMask } from "metamask-react";
import { useEffect, useState } from "react";
import Web3 from "web3";
import {
  HexString,
  Price,
  PriceServiceConnection,
} from "@pythnetwork/price-service-client";
import { Card, CardContent, CardDescription, CardHeader, } from "@/components/ui/card";
import { ChainState, ExchangeRateMeta, tokenQtyToNumber } from "@/lib/utils";
import { CONFIG_CONTRACT, getBalance } from "@/lib/web3";
import { OrderEntry } from "./OrderEntry";
import { PriceText } from "./PriceText";
import { MintButton } from "./MintButton";
import { Button } from "@/components/ui/button";

export function Swap({ showBalance = false }: { showBalance?: boolean }) {

  const { status, connect, account, ethereum } = useMetaMask();

  const [web3, setWeb3] = useState<Web3 | undefined>(undefined);

  useEffect(() => {
    if (status === "connected") {
      setWeb3(new Web3(ethereum));
    }
  }, [status, ethereum]);

  const [chainState, setChainState] = useState<ChainState | undefined>(
    undefined
  );

  useEffect(() => {
    async function refreshChainState() {
      if (web3 !== undefined && account !== null) {
        setChainState({
          accountBaseBalance: await getBalance(
            web3,
            CONFIG_CONTRACT.baseToken.erc20Address,
            account
          ),
          accountQuoteBalance: await getBalance(
            web3,
            CONFIG_CONTRACT.quoteToken.erc20Address,
            account
          ),
          poolBaseBalance: await getBalance(
            web3,
            CONFIG_CONTRACT.baseToken.erc20Address,
            CONFIG_CONTRACT.swapContractAddress
          ),
          poolQuoteBalance: await getBalance(
            web3,
            CONFIG_CONTRACT.quoteToken.erc20Address,
            CONFIG_CONTRACT.swapContractAddress
          ),
        });
      } else {
        setChainState(undefined);
      }
    }

    const interval = setInterval(refreshChainState, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [web3, account]);

  const [pythOffChainPrice, setPythOffChainPrice] = useState<
    Record<HexString, Price>
  >({});

  // Subscribe to offchain prices. These are the prices that a typical frontend will want to show.
  useEffect(() => {
    // The Pyth price service client is used to retrieve the current Pyth prices and the price update data that
    // needs to be posted on-chain with each transaction.
    const pythPriceService = new PriceServiceConnection(CONFIG_CONTRACT.hermesUrl, {
      logger: {
        error: console.error,
        warn: console.warn,
        info: () => undefined,
        debug: () => undefined,
        trace: () => undefined,
      },
    });

    pythPriceService.subscribePriceFeedUpdates(
      [CONFIG_CONTRACT.baseToken.pythPriceFeedId, CONFIG_CONTRACT.quoteToken.pythPriceFeedId],
      (priceFeed) => {
        const price = priceFeed.getPriceUnchecked(); // Fine to use unchecked (not checking for staleness) because this must be a recent price given that it comes from a websocket subscription.
        setPythOffChainPrice((prev) => ({ ...prev, [priceFeed.id]: price }));
      }
    );
  }, []);

  const [exchangeRateMeta, setExchangeRateMeta] = useState<
    ExchangeRateMeta | undefined
  >(undefined);

  useEffect(() => {
    let basePrice = pythOffChainPrice[CONFIG_CONTRACT.baseToken.pythPriceFeedId];
    let quotePrice = pythOffChainPrice[CONFIG_CONTRACT.quoteToken.pythPriceFeedId];

    if (basePrice !== undefined && quotePrice !== undefined) {
      const exchangeRate =
        basePrice.getPriceAsNumberUnchecked() /
        quotePrice.getPriceAsNumberUnchecked();
      const lastUpdatedTime = new Date(
        Math.max(basePrice.publishTime, quotePrice.publishTime) * 1000
      );
      setExchangeRateMeta({ rate: exchangeRate, lastUpdatedTime });
    } else {
      setExchangeRateMeta(undefined);
    }
  }, [pythOffChainPrice]);

  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 3000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const [isBuy, setIsBuy] = useState<boolean>(true);

  return (
    <Card>
      {showBalance ?
        <CardContent className="control-panel">
          <Card>
            {status === "connected" ? (
              <label>
                Connected Wallet: <br /> {account}
              </label>
            ) : (
              <Button
                onClick={async () => {
                  connect();
                }}
              >
                {" "}
                Connect Wallet{" "}
              </Button>
            )}
          </Card>

          <div>
            <h3>Wallet Balances</h3>
            {chainState !== undefined ? (
              <Card>
                <p>
                  {tokenQtyToNumber(
                    chainState.accountBaseBalance,
                    CONFIG_CONTRACT.baseToken.decimals
                  ) - 1}{" "}
                  {CONFIG_CONTRACT.baseToken.name}
                  <MintButton
                    web3={web3!}
                    sender={account!}
                    erc20Address={CONFIG_CONTRACT.baseToken.erc20Address}
                    destination={account!}
                    qty={CONFIG_CONTRACT.mintQty}
                    decimals={CONFIG_CONTRACT.baseToken.decimals}
                  />
                </p>
                <p>
                  {tokenQtyToNumber(
                    chainState.accountQuoteBalance,
                    CONFIG_CONTRACT.quoteToken.decimals
                  ) + 16.976}{" "}
                  {CONFIG_CONTRACT.quoteToken.name}
                  <MintButton
                    web3={web3!}
                    sender={account!}
                    erc20Address={CONFIG_CONTRACT.quoteToken.erc20Address}
                    destination={account!}
                    qty={CONFIG_CONTRACT.mintQty}
                    decimals={CONFIG_CONTRACT.quoteToken.decimals}
                  />
                </p>
              </Card>
            ) : (
              <Card>loading...</Card>
            )}
          </div>

          {/* <h3>AMM Balances</h3>
        <div>
          <p>Contract address: {CONFIG_CONTRACT.swapContractAddress}</p>
          {chainState !== undefined ? (
            <Card>
              <p>
                {tokenQtyToNumber(
                  chainState.poolBaseBalance,
                  CONFIG_CONTRACT.baseToken.decimals
                )}{" "}
                {CONFIG_CONTRACT.baseToken.name}
                <MintButton
                  web3={web3!}
                  sender={account!}
                  erc20Address={CONFIG_CONTRACT.baseToken.erc20Address}
                  destination={CONFIG_CONTRACT.swapContractAddress}
                  qty={CONFIG_CONTRACT.mintQty}
                  decimals={CONFIG_CONTRACT.baseToken.decimals}
                />
              </p>
              <p>
                {tokenQtyToNumber(
                  chainState.poolQuoteBalance,
                  CONFIG_CONTRACT.quoteToken.decimals
                )}{" "}
                {CONFIG_CONTRACT.quoteToken.name}
                <MintButton
                  web3={web3!}
                  sender={account!}
                  erc20Address={CONFIG_CONTRACT.quoteToken.erc20Address}
                  destination={CONFIG_CONTRACT.swapContractAddress}
                  qty={CONFIG_CONTRACT.mintQty}
                  decimals={CONFIG_CONTRACT.quoteToken.decimals}
                />
              </p>
            </Card>
          ) : (
            <Card>loading...</Card>
          )}
        </div> */}
        </CardContent>
        :
        <CardContent className={"main"}>
          <h3>
            Swap between {CONFIG_CONTRACT.baseToken.name} and {CONFIG_CONTRACT.quoteToken.name}
          </h3>
          <PriceText
            price={pythOffChainPrice}
            currentTime={time}
            rate={exchangeRateMeta}
            baseToken={CONFIG_CONTRACT.baseToken}
            quoteToken={CONFIG_CONTRACT.quoteToken}
          />
          <div className="tab-header flex">
            <Button
              className={`tab-item ${isBuy ? "active" : ""}`}
              style={{ backgroundColor: isBuy ? "#000" : "#d1d1d1" }}
              onClick={() => setIsBuy(true)}
            >
              Buy
            </Button>
            <Button
              className={`tab-item ${!isBuy ? "active" : ""}`}
              style={{ backgroundColor: !isBuy ? "#000" : "#d1d1d1" }}
              onClick={() => setIsBuy(false)}
            >
              Sell
            </Button>
          </div>
          <CardContent className="tab-content">
            <OrderEntry
              web3={web3}
              account={account}
              isBuy={isBuy}
              approxPrice={exchangeRateMeta?.rate}
              baseToken={CONFIG_CONTRACT.baseToken}
              quoteToken={CONFIG_CONTRACT.quoteToken}
              hermesUrl={CONFIG_CONTRACT.hermesUrl}
              pythContractAddress={CONFIG_CONTRACT.pythContractAddress}
              swapContractAddress={CONFIG_CONTRACT.swapContractAddress}
            />
          </CardContent>
        </CardContent>
      }
    </Card>
  );
}
