import { Buffer } from "buffer"
import { headers } from 'next/headers'

export default function Page() {
    // https://docs.aws.amazon.com/elasticloadbalancing/latest/application/listener-authenticate-users.html    const headersList = headers()

    // Step 1: Get the key id from JWT headers (the kid field)
    const headersList = headers()
    const encodedJwt = headersList.get('x-amzn-oidc-data')

    if (!encodedJwt) {
        return (
            <div>
                <h1>No HTTP header for x-amzn-oidc-data</h1>
            </div>
        )
    } else {

        const jwtEncodedTokenList = encodedJwt.split('.')
        const jwtEncodedHeaders = jwtEncodedTokenList[0]
        const jwtEncodedPayload = jwtEncodedTokenList[1]
        const jwtEncodedSignature = jwtEncodedTokenList[2]
        const jwtDecodedHeaders = Buffer.from(jwtEncodedHeaders, 'base64').toString('binary');
        const jwtDecodedPayload = Buffer.from(jwtEncodedPayload, 'base64').toString('binary');
        const jwtDecodedSignature = Buffer.from(jwtEncodedSignature, 'base64').toString('binary');

        return (
            <div>
                <h1>JWT Headers</h1>
                <pre>{jwtDecodedHeaders}</pre>

                <h1>JWT Payload</h1>
                <pre>{jwtDecodedPayload}</pre>

                <h1>JWT Signature</h1>
                <pre>{jwtDecodedSignature}</pre>
            </div>
        )
    }
}