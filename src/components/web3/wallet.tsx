import { Card, CardContent, CardDescription, CardHeader, } from "@/components/ui/card";
import { useMetaMask } from "metamask-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { queryAttestations } from "@/lib/apis/music";
import { ethers } from "ethers";

export function Wallet() {
  const { status, connect, account, ethereum } = useMetaMask();

  useEffect(() => {
    async function getAttestations() {
      if (account) {
        const signer = (new ethers.providers.Web3Provider(ethereum)).getSigner()
        console.log('s', signer)
        const data = await queryAttestations(account);
        console.log('d', data)
      }
    }
    getAttestations()
  }, [account])
  return (
    <Card>

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
      </CardContent>
    </Card>
  );
}