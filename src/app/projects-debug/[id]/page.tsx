"use client"

import { useEffect, useState } from "react"
import ClientLayout from "@/components/layouts/ClientLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DebugPage({ params }: { params: { id: string } }) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("Fetching project:", params.id)
                const res = await fetch(`/api/projects/${params.id}`)
                const json = await res.json()
                
                console.log("Response status:", res.status)
                console.log("Response:", json)
                
                setData(json)
                
                if (!res.ok) {
                    setError(`Error ${res.status}: ${json.error}`)
                }
            } catch (err: any) {
                console.error("Fetch error:", err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [params.id])

    return (
        <ClientLayout>
            <div className="p-8">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6">Debug: Proyecto {params.id}</h1>

                    {loading && <p>Cargando...</p>}
                    {error && <p className="text-red-600">Error: {error}</p>}
                    
                    <Card className="p-4">
                        <pre className="text-sm overflow-auto max-h-96">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </Card>

                    <Button className="mt-4" onClick={() => window.location.reload()}>
                        Recargar
                    </Button>
                </div>
            </div>
        </ClientLayout>
    )
}
