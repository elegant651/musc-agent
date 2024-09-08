/* eslint-disable @next/next/no-img-element */
"use client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, } from "@/components/ui/carousel";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

import { SignProtocolClient, SpMode, EvmChains } from "@ethsign/sp-sdk"
import { privateKeyToAccount } from "viem/accounts";
import { useMetaMask } from "metamask-react";
import { useEffect, useState } from "react";
import { queryAttestations } from "@/lib/apis/music";

// const privateKey = process.env.NEXT_PUBLIC_SIGN_PRIV_KEY;
const client = new SignProtocolClient(SpMode.OnChain, {
  chain: EvmChains.baseSepolia,
  // account: privateKeyToAccount(privateKey), // Optional, depending on environment
});

interface Prompt {
  strAlbum: string;
  strArtist: string;
  strStyle: string;
  strGenre: string;
  strAlbumThumb: string;
  strDescriptionEN: string;
  strMood: string;
  strReview: string;
}

export function CardPrompts({ prompts }: { prompts: Prompt[] }) {
  const { status, connect, account, ethereum } = useMetaMask();
  const [success, setSuccess] = useState(false);

  const signing = async (contractDetails: string, signer: string) => {
    const res = await client.createAttestation({
      schemaId: "0x1e3",
      data: {
        contractDetails,
        signer
      },
      indexingValue: signer.toLowerCase()
    });
    console.log('res', res)
    if (res) {
      setSuccess(true)
    }
  }

  return (
    <>
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent className="flex space-x-4 p-4">
          {prompts.map((prompt, index) => (
            <CarouselItem key={index} className="md:basis-1/2">
              <Card className="w-full h-full flex flex-col">
                <img
                  className="w-full h-48 object-cover"
                  src={prompt.strAlbumThumb}
                  alt={prompt.strAlbum}
                />
                <CardContent className="space-y-2 flex-grow pt-2">
                  <h3 className="text-base font-semibold">{prompt.strAlbum}</h3>
                  <p className="text-sm text-gray-600">by {prompt.strArtist}</p>
                  <p className="mt-2 text-sm line-clamp-4">
                    {prompt.strDescriptionEN}
                  </p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Badge>{prompt.strStyle}</Badge>
                  <Badge>{prompt.strGenre}</Badge>
                  <Badge>{prompt.strMood}</Badge>
                </CardFooter>
                <CardFooter className="flex justify-between">

                  {account && <Button variant="outline" onClick={() => signing(prompt.strAlbum + '/' + prompt.strArtist, account)}>Collect</Button>}
                </CardFooter>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <span className="text-sm">
        {success ? 'Success' : ''}
      </span>
    </>
  );
}
