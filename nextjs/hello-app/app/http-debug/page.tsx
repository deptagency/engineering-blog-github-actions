import { headers } from 'next/headers'

export default function Page() {
    const headersList = headers()

    return (
        <div>
            <h1>HTTP Headers</h1>
            <pre>{JSON.stringify(Array.from(headersList.entries()).sort(), null, 2)}</pre>
            
            <h1>Process Env</h1>
            User pool id: {process.env.COGNITO_USER_POOL_ID}<br/>
            Client id: {process.env.COGNITO_CLIENT_ID}<br/>
            {JSON.stringify(process.env, null, 2)}

        </div>
    )
}