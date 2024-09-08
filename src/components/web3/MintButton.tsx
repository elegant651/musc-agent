import Web3 from "web3";
import { numberToTokenQty } from "@/lib/utils";
import { mint } from "@/lib/web3";
import { Button } from "../ui/button";
import { useState } from "react";

export function MintButton(props: {
  web3: Web3;
  sender: string;
  erc20Address: string;
  destination: string;
  qty: number;
  decimals: number;
}) {
  const [txHash, setTxHash] = useState<string>("");

  return (
    <>
      <Button
        onClick={async () => {
          const receipt = await mint(
            props.web3,
            props.sender,
            props.erc20Address,
            props.destination,
            numberToTokenQty(props.qty, props.decimals)
          );
          console.log('hash', receipt)
          const txHash = receipt.transactionHash;
          // const resTxHash = await fetch(`https://base.blockscout.com/api/v2/transactions/${txHash}`)
          // console.log('ee', resTxHash)
          setTxHash(txHash);
        }}
      >
        Mint {props.qty}
      </Button>
      {txHash && <a href={`https://base-sepolia.blockscout.com/tx/${txHash}`} target="_blank">{txHash}</a>}
    </>
  );
}
