"use server";
import { StockData } from "@/components/ui/chart";
import { restClient } from "@polygon.io/client-js";
import aggregateJson from "./data/sample_aggregate.json";
import tickerJson from "./data/sample_ticker.json"
import axios from "axios";

const rest = restClient(process.env.POLYGON_API_KEY);
const POLYGON_BASE_URL = "https://api.polygon.io/";

//@TODO
async function getFinancials(ticker: string) {
  //https://polygon.io/docs/stocks/get_vx_reference_financials
  const url = `${POLYGON_BASE_URL}vX/reference/financials?ticker=X:${ticker}&limit=2&apiKey=${process.env.POLYGON_API_KEY}`;
  const response = await axios.get(url);
  const data = response.data;

  if (data.status !== "OK") {
    throw new Error(`API Error: ${JSON.stringify(data)}`);
  }

  return data.results;
}

async function getNews(ticker: string) {
  try {
    //coinmarketcap news
    const data = await rest.reference.tickerNews({ ticker: ticker });
    return data.results.map((item: any) => {
      const { amp_url, keywords, publisher, id, ...rest } = item;
      return rest;
    });
  } catch (e) {
    console.error("An error occurred while fetching the last quote:", e);
    throw e;
  }
}

async function getAggregates(ticker: string, from: string, to: string) {
  try {
    //https://polygon.io/docs/crypto/get_v2_aggs_ticker__cryptoticker__range__multiplier___timespan___from___to
    // const url = `${POLYGON_BASE_URL}v2/aggs/ticker/X:${ticker}/range/1/day/${from}/${to}?adjusted=true&sort=asc&limit=25&apiKey=${process.env.POLYGON_API_KEY}`;
    // const response = await axios.get<StockData>(url);
    // return response.data;
    return aggregateJson
  } catch (e) {
    console.error("An error occurred while fetching the last quote:", e);
    throw e;
  }
}

async function getTickerSnapshot(ticker: string) {
  try {
    //https://polygon.io/docs/crypto/get_v2_snapshot_locale_global_markets_crypto_tickers__ticker
    // const url = `${POLYGON_BASE_URL}v2/snapshot/locale/global/markets/crypto/tickers/X:${ticker}?apiKey=${process.env.POLYGON_API_KEY}`;
    // const response = await axios.get<StockData>(url);
    // return response.data;
    return tickerJson
  } catch (e) {
    console.error("An error occurred while fetching the last quote:", e);
    throw e;
  }
}

export { getFinancials, getNews, getAggregates, getTickerSnapshot };
