import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { getAggregates, getFinancials, getNews } from "@/lib/polygon";
import { getPrompts, queryAttestations } from "@/lib/apis/music";

export const tools = [
  // new DynamicStructuredTool({
  //   name: "getFinancials",
  //   description: "Retrieves financial data for a given stock ticker.",
  //   schema: z.object({
  //     ticker: z.string().describe("The stock ticker symbol"),
  //   }),
  //   func: async ({ ticker }) => {
  //     const data = await getFinancials(ticker);
  //     return JSON.stringify(data);
  //   },
  // }),

  // new DynamicStructuredTool({
  //   name: "getNews",
  //   description: "Retrieves news articles for a given stock ticker. Use this information to answer concisely",
  //   schema: z.object({
  //     ticker: z.string().describe("The stock ticker symbol"),
  //   }),
  //   func: async ({ ticker }) => {
  //     const data = await getNews(ticker);
  //     return JSON.stringify(data);
  //   },
  // }),

  //music
  new DynamicStructuredTool({
    name: "getPrompts",
    description: "Retrieves analysis from albums for a given artist name. Use this information to answer concisely",
    schema: z.object({
      artist: z.string().describe("The artist name"),
    }),

    func: async ({ artist }) => {
      const data = await getPrompts(artist);
      return JSON.stringify(data);
    },
  }),

  new DynamicStructuredTool({
    name: "getAttestation",
    description: "Retrieves attestations for a given address. Use this information to answer concisely",
    schema: z.object({
      fromAddress: z.string().describe("fromAddress"),
    }),

    func: async ({ fromAddress }) => {
      const data = await queryAttestations(fromAddress);
      console.log('d', data)
      return JSON.stringify(data);
    },
  }),
];