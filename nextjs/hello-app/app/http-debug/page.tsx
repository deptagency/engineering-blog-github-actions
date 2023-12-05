import { headers } from 'next/headers'

export default function Page() {
    const headersList = headers()

    return (
        <div>
            <h1>HTTP Headers</h1>
            <pre>{JSON.stringify(Array.from(headersList.entries()).sort(), null, 2)}</pre>
        </div>
    )
}