"use client";
import { AI } from "@/app/action";
import { UserMessage } from "@/components/llm/message";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEnterSubmit } from "@/hooks/use-enter-submit";
import { nanoid } from "ai";
import { useActions, useAIState, useUIState } from "ai/rsc";
import { CornerDownLeft } from "lucide-react";
import * as React from "react";
import { Contract, ethers } from "ethers";
import { useMetaMask } from "metamask-react";
import { ABI } from '@/lib/network';

export interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
}

export function ChatInput({ input, setInput }: ChatInputProps) {
  const [aiState] = useAIState();
  const [messages, setMessages] = useUIState<typeof AI>();
  const { submitUserMessage } = useActions();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [isTxLoading, setIsTxLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const { formRef, onKeyDown } = useEnterSubmit();
  const { status, connect, account, ethereum } = useMetaMask();

  async function submitGaladriel(query: string) {
    setError(null);
    if (!query) {
      alert('Please input a question');
      return;
    }

    const question = query.trim();
    const signer = (new ethers.providers.Web3Provider(ethereum)).getSigner()

    setLoading(true);
    setIsTxLoading(true)

    try {
      const contract = new Contract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "", ABI, signer)
      let receipt
      let agentId = undefined

      const transactionResponse = await contract.runAgent(question, 1)
      receipt = await transactionResponse.wait()
      console.log('agent id', agentId)

      setIsTxLoading(false)
      if (receipt && receipt.status) {

        if (agentId !== undefined) {

          const messages = await contract.getMessageHistoryContents(agentId)
          console.log('n', messages)
          const roles = await contract.getMessageHistoryRoles(agentId)
          console.log('r', roles)
          const newMessages: any = []
          messages.forEach((message: any, i: number) => {
            newMessages.push({
              role: roles[i],
              content: messages[i]
            })
          })

          if (newMessages) {
            const lastMessage = newMessages.at(-1)
            if (lastMessage) {
              // if (lastMessage.role == "assistant") {
              //   console.log('lastMessage.content', lastMessage.content)
              // } else {
              //   // Simple solution to show function results, not ideal
              //   console.log('newMessages', newMessages)
              // }
              console.log('lastMessage.content', lastMessage.content)
            }
          }
          await new Promise(resolve => setTimeout(resolve, 2000))
          // const responseMessage = await submitUserMessage(query)
          // return responseMessage
        }
      }
      setLoading(false);
      const responseMessage = await submitUserMessage(query)
      return responseMessage
    } catch (error) {
      setLoading(false);
      setIsTxLoading(false)
      console.log('error', error);
      return null
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-12 w-full from-muted/30 from-0% to-muted/30 to-50% duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
      <div className="mx-auto sm:max-w-3xl sm:px-4">
        <div className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring">
          <form
            ref={formRef}
            onSubmit={async (e: any) => {
              e.preventDefault();
              // Blur focus on mobile
              if (window.innerWidth < 600) {
                e.target["message"]?.blur();
              }
              const value = input.trim();
              setInput("");
              if (!value) return;
              // Optimistically add user message UI
              setMessages((currentMessages) => [
                ...currentMessages,
                {
                  id: nanoid(),
                  display: <UserMessage>{value}</UserMessage>,
                },
              ]);
              // Submit and get response message
              const responseMessage = await submitGaladriel(value) // await submitUserMessage(value);

              if (responseMessage) {
                setMessages((currentMessages) => [
                  ...currentMessages,
                  responseMessage,
                ]);
              }
            }}
          >
            <Label htmlFor="message" className="sr-only">
              Message
            </Label>
            <div className="flex items-center">
              <Textarea
                ref={inputRef}
                tabIndex={0}
                onKeyDown={onKeyDown}
                placeholder="Send a message."
                className="flex-grow min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
                autoFocus
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                name="message"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button type="submit" size="sm" className="mx-2 gap-1.5">
                Send
                <CornerDownLeft className="size-3.5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}