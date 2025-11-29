"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Info } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function PasswordPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center items-center">
                <div className="max-w-md w-full space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight">Crear una contraseña</h1>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Nombre</Label>
                            <Input id="firstName" className="h-12" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Apellido(s)</Label>
                            <Input id="lastName" className="h-12" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input id="password" type="password" className="h-12" />
                        <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                            <span className="flex items-center gap-1"><Info className="h-3 w-3" /> &gt; 8 caracteres</span>
                            <span className="flex items-center gap-1"><Info className="h-3 w-3" /> 1 letra mayúscula</span>
                            <span className="flex items-center gap-1"><Info className="h-3 w-3" /> 1 carácter especial</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start space-x-2">
                            <Checkbox id="marketing" className="mt-1" />
                            <label
                                htmlFor="marketing"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                            >
                                Quiero recibir asesoramiento personalizado y eventos para impulsar mi empresa en Malt.
                            </label>
                        </div>
                        <div className="flex items-start space-x-2">
                            <Checkbox id="terms" className="mt-1" />
                            <label
                                htmlFor="terms"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                            >
                                Acepto las <Link href="#" className="text-primary underline">Condiciones Generales de Uso de Malt</Link> y <Link href="#" className="text-primary underline">declaro conocer su política de protección de datos</Link>.
                            </label>
                        </div>
                    </div>

                    <Button className="w-full h-12 text-base" onClick={() => router.push('/onboarding/freelancer/verify-email')}>
                        Siguiente
                    </Button>
                </div>
            </div>

            {/* Right Side - Value Props (Same as previous page for consistency) */}
            <div className="hidden lg:flex w-1/2 bg-muted/10 relative overflow-hidden items-center justify-center p-12">
                <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-primary/20 to-transparent pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary rounded-full opacity-20 blur-3xl" />

                {/* We could reuse the same content or just the background graphic as per the screenshot (screenshot 5 shows just the red wave) */}
                <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-primary/40 to-transparent rounded-tl-[100%] opacity-50" />
            </div>
        </div>
    )
}
