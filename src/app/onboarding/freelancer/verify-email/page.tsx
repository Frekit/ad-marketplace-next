"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function VerifyEmailPage() {
    const router = useRouter()
    const [code, setCode] = useState("")

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center items-center">
                <div className="max-w-md w-full space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold tracking-tight">Confirma tu email</h1>
                        <p className="text-muted-foreground">
                            Introduce el código de 6 dígitos enviado a: <span className="font-medium text-foreground">alvarovi24@gmail.com</span>
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Input
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="123456"
                            className="h-14 text-lg tracking-widest text-center"
                            maxLength={6}
                        />

                        <div className="text-sm space-y-1">
                            <p className="text-muted-foreground">El código es válido durante una hora.</p>
                            <p className="text-muted-foreground">
                                ¿Aún no has recibido el código? <button className="text-primary font-medium hover:underline">Enviar de nuevo</button> o <button className="text-primary font-medium hover:underline">cambia tu email</button>
                            </p>
                        </div>

                        <Button
                            className="w-full h-12 text-base mt-4"
                            onClick={() => router.push('/onboarding/freelancer/upload-cv')}
                            disabled={code.length !== 6}
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            </div>

            {/* Right Side - Red Wave */}
            <div className="hidden lg:flex w-1/2 bg-muted/10 relative overflow-hidden items-end justify-end">
                <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-primary/20 to-transparent pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-[600px] h-[600px] bg-primary rounded-full opacity-90 blur-3xl translate-x-1/3 translate-y-1/3" />
                {/* Harder edge wave simulation */}
                <div className="absolute bottom-0 right-0 w-[80%] h-[80%] bg-primary rounded-tl-[100%] opacity-80" />
            </div>
        </div>
    )
}
