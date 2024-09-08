"use client";

import React, { useState } from "react";
import { useAIState, useUIState } from "ai/rsc";
import { MessageList } from "@/components/llm/message-list";
import { cn } from "@/lib/utils";
import { ChatInput } from "@/components/llm/chat-input";
import { Card, CardContent, CardHeader, } from "@/components/ui/card";
import { Swap } from "../web3/swap";
import { MetaMaskProvider } from "metamask-react";
import { Wallet } from "../web3/wallet";

export function Chat() {
  const [messages] = useUIState();
  const [input, setInput] = useState("");
  const [aiState] = useAIState();

  return (
    <MetaMaskProvider>
      <div
        className="group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]">
        <Wallet />

        {messages.length === 0 ? (
          <IntroSection setInput={setInput} />
        ) : (
          <div className={cn("pb-[200px] pt-4 md:pt-10")}>
            <MessageList messages={messages} />
          </div>
        )}

        <ChatInput input={input} setInput={setInput} />
      </div>
    </MetaMaskProvider>
  );
}

function IntroSection({ setInput }: { setInput: (input: string) => void }) {
  const examples = [
    "Get to know about daft funk",
  ];

  return (
    <div className="flex justify-center items-center h-full">
      <Card className="sm:mx-0 max-w-screen-md rounded-md border sm:w-full">
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div className="text-lg font-semibold text-black">
              Music Album Agent
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4  ">
            {examples.map((example, i) => (
              <button
                key={i}
                className="rounded-md border border-gray-200 bg-white px-5 py-3 text-left text-sm text-gray-500 transition-all duration-75 hover:border-black hover:text-gray-700 active:bg-gray-50"
                onClick={() => {
                  setInput(example);
                }}
              >
                {example}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
