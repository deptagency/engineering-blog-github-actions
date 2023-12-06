import { Buffer } from "buffer"
import { headers } from 'next/headers'
import crypto from 'crypto'


async function getJwtPayload() {
    // https://docs.aws.amazon.com/elasticloadbalancing/latest/application/listener-authenticate-users.html

    // Step 1: Get the key id from JWT headers (the kid field)
    const headersList = headers()
    const encodedJwt = headersList.get('x-amzn-oidc-data')
    console.log(`encodedJwt = ${encodedJwt}`)
    if (encodedJwt) {
        const awsRegion = 'us-east-1'
        const jwtEncodedTokenList = encodedJwt.split('.')
        const jwtEncodedHeaders = jwtEncodedTokenList[0]
        const jwtEncodedPayload = jwtEncodedTokenList[1]
        const jwtEncodedSignature = jwtEncodedTokenList[2]
        const jwtDecodedHeaders = Buffer.from(jwtEncodedHeaders, 'base64').toString('binary');
        const jwtPayload = Buffer.from(jwtEncodedPayload, 'base64').toString('binary');
        console.log(`jwtDecodedHeaders = ${jwtDecodedHeaders}`)

        // Step 2: Get the public key from regional endpoint
        const jwtKid = JSON.parse(jwtDecodedHeaders).kid
        console.log(`jwtKid = ${jwtKid}`)
        const jwtPublicKeyUrl = `https://public-keys.auth.elb.${awsRegion}.amazonaws.com/${jwtKid}`
        const jwtPublicKeyResponse = await fetch(jwtPublicKeyUrl, { method: 'GET' , cache: "no-store"})
        const jwtPublicKey = await jwtPublicKeyResponse.text()
        console.log(`jwtPublicKey = ${jwtPublicKey}`)

        // Step 3: Verify the signature of the JWT using the public key
        const verifier = crypto.createVerify('sha256')
        verifier.update(`${jwtEncodedHeaders}.${jwtEncodedPayload}`)
        const isVerified = verifier.verify(jwtPublicKey, jwtEncodedSignature, 'base64')
        if (isVerified) {
            console.log('JWT signature verified.')
            return jwtPayload
        } else {
            console.log('JWT NOT signature verified.')
            return null
        }
    }
}
export default async function Page(){
    const jwtPayload = await getJwtPayload()
    if (!jwtPayload) {
        return (
            <div>
                <h1>No JWT Payload</h1>
            </div>
        )
    } else {
        const jwtUsername = JSON.parse(jwtPayload).username
        return (
            <div>
                <h1>JWT Payload</h1>
                <pre>{jwtPayload}</pre>

                <h1>JWT Username</h1>
                <pre>{jwtUsername}</pre>
            </div>
        )
    }
}