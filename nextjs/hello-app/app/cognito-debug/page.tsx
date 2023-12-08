import { Buffer } from "buffer";
import { headers } from 'next/headers';
import { CognitoJwtVerifier } from "aws-jwt-verify";
import crypto from "crypto";

async function getJwtPayload() {
    // https://docs.aws.amazon.com/elasticloadbalancing/latest/application/listener-authenticate-users.html
    // https://github.com/awslabs/aws-jwt-verify

    // Step 1: Get the key id from JWT headers (the kid field)
    const headersList = headers();
    const encodedJwt = headersList.get('x-amzn-oidc-data');
    console.log(`encodedJwt = ${encodedJwt}`);
    if (encodedJwt) {
        const awsRegion = 'us-east-1';
        const jwtEncodedTokenList = encodedJwt.split('.');
        const jwtEncodedHeaders = jwtEncodedTokenList[0];
        const jwtEncodedPayload = jwtEncodedTokenList[1];
        const jwtEncodedSignature = jwtEncodedTokenList[2];
        const jwtDecodedHeaders = Buffer.from(jwtEncodedHeaders, 'base64').toString('binary');
        const jwtPayload = Buffer.from(jwtEncodedPayload, 'base64').toString('binary');
        console.log(`jwtDecodedHeaders = ${jwtDecodedHeaders}`);
        console.log(`jwtPayload = ${jwtPayload}`);

        // Step 2: Get the public key from regional endpoint
        const jwtKid = JSON.parse(jwtDecodedHeaders).kid;
        console.log(`jwtKid = ${jwtKid}`);
        const jwtPublicKeyUrl = `https://public-keys.auth.elb.${awsRegion}.amazonaws.com/${jwtKid}`;
        const jwtPublicKeyResponse = await fetch(jwtPublicKeyUrl, { method: 'GET' , cache: "no-store"});
        const jwtPublicKey = await jwtPublicKeyResponse.text();
        console.log(`jwtPublicKey = ${jwtPublicKey}`);

        // Step 3: Verify the signature of the JWT using the public key
        const verifier = crypto.createVerify('RSA-SHA256');
        verifier.update(`${jwtEncodedHeaders}.${jwtEncodedPayload}`);
        const isVerified = verifier.verify(jwtPublicKey, jwtEncodedSignature, 'base64');
        if (isVerified) {
            console.log('JWT signature verified.')
            // return jwtPayload
            return encodedJwt;
        } else {
            console.log('JWT NOT signature verified via manual verify.')
        }

        // Verifier not verifying JWT
        const cognitoUserPoolId = process.env.COGNITO_USER_POOL_ID;
        if (!cognitoUserPoolId) {
            console.log('No process.env.COGNITO_USER_POOL_ID found.');
            return null;
        }
        const cognitoClientId = process.env.COGNITO_CLIENT_ID;
        if (!cognitoClientId) {
            console.log('No process.env.COGNITO_CLIENT_ID found.');
            return null;
        }
        const cognitoVerifier = CognitoJwtVerifier.create({
            userPoolId: cognitoUserPoolId,
            tokenUse: null,
            clientId: cognitoClientId,
        });
        try {
            const jwtVerifiedPayload = await cognitoVerifier.verify(encodedJwt, {});
            console.log(`Token is valid. Verified Payload: ${jwtVerifiedPayload}`);
            // CognitoJwtPayload not a string
            // return jwtVerifiedPayload;
            // return jwtPayload;
            return encodedJwt;
        } catch {
            console.log("Token not valid via CognitoJwtVerifier!");
        }

        // For now return the unverified JWT payload since verifier is not working
        // return jwtPayload;
        return encodedJwt;
    } else {
        console.log('No JWT found.');
        return null;
    }
}
export default async function Page(){
    // Getting the entire JWT payload to show debugging
    const encodedJwt = await getJwtPayload()

    // const jwtPayload = await getJwtPayload()
    if (!encodedJwt) {
        return (
            <div>
                <h1>No JWT Payload and x-amzn-oidc-data HTTP header 12-7 100</h1>
            </div>
        )
    } else {
        const jwtEncodedTokenList = encodedJwt.split('.');
        const jwtEncodedHeaders = jwtEncodedTokenList[0];
        const jwtEncodedPayload = jwtEncodedTokenList[1];
        const jwtEncodedSignature = jwtEncodedTokenList[2];
        const jwtDecodedHeaders = Buffer.from(jwtEncodedHeaders, 'base64').toString('binary');
        const jwtPayload = Buffer.from(jwtEncodedPayload, 'base64').toString('binary');

        const jwtParsed = JSON.parse(jwtPayload)
        const jwtUsername = jwtParsed.username
        const jwtEmail = jwtParsed.email
        return (
            <div>
                <h1>Process Env</h1>
                {JSON.stringify(process.env, null, 2)}

                <h1>JWT Encoded</h1>
                <pre>{encodedJwt}</pre>

                <h1>JWT Headers</h1>
                <pre>{jwtDecodedHeaders}</pre>

                <h1>JWT Payload</h1>
                <pre>{jwtPayload}</pre>

                <h1>JWT Signature base64</h1>
                <pre>{jwtEncodedSignature}</pre>

                <h1>JWT Username</h1>
                <pre>{jwtUsername}</pre>

                <h1>JWT Email</h1>
                <pre>{jwtEmail}</pre>
            </div>
        )
    }
}