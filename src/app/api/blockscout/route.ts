export const dynamic = 'force-dynamic' // defaults to auto
export async function GET(request: Request) {
  const requestToken = request.query.code;
  const txHash = '0xa412b17d7572b987899bbdc6d3e7fcdf89a62106039dc8d00d93b8fd00aba2eb' //request.
  const res = await fetch(`https://base.blockscout.com/api/v2/transactions/${txHash}`)
  const data = await res.json()

  return Response.json({ data })
}