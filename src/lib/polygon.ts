"use server";
import { StockData } from "@/components/ui/chart";
import { restClient } from "@polygon.io/client-js";

import axios from "axios";

const rest = restClient(process.env.POLYGON_API_KEY);
const POLYGON_BASE_URL = "https://api.polygon.io/";

async function getFinancials(ticker: string) {
  //https://polygon.io/docs/stocks/get_vx_reference_financials
  const url = `${POLYGON_BASE_URL}vX/reference/financials?ticker=${ticker}&limit=2&apiKey=${process.env.POLYGON_API_KEY}`;
  const response = await axios.get(url);
  const data = response.data;

  if (data.status !== "OK") {
    throw new Error(`API Error: ${JSON.stringify(data)}`);
  }

  return data.results;
}

async function getNews(ticker: string) {
  try {
    //https://polygon.io/docs/stocks/get_v2_reference_news
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
    //https://polygon.io/docs/stocks/get_v2_aggs_ticker__stocksticker__range__multiplier___timespan___from___to
    const url = `${POLYGON_BASE_URL}v2/aggs/ticker/${ticker}/range/1/day/${from}/${to}?adjusted=true&sort=asc&limit=25&apiKey=${process.env.POLYGON_API_KEY}`;
    const response = await axios.get<StockData>(url);
    return response.data;
  } catch (e) {
    console.error("An error occurred while fetching the last quote:", e);
    throw e;
  }
}

async function getTickerSnapshot(ticker: string) {
  try {
    //https://polygon.io/docs/stocks/get_v2_snapshot_locale_us_markets_stocks_tickers__stocksticker
    const url = `${POLYGON_BASE_URL}v2/snapshot/locale/us/markets/stocks/tickers/${ticker}?apiKey=${process.env.POLYGON_API_KEY}`;
    const response = await axios.get<StockData>(url);
    return response.data;
  } catch (e) {
    console.error("An error occurred while fetching the last quote:", e);
    throw e;
  }
}

export { getFinancials, getNews, getAggregates, getTickerSnapshot };
