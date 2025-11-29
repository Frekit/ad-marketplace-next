"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CreateAccountPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center items-center">
                <div className="max-w-md w-full space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight">Crea tu cuenta</h1>
                    </div>

                    <Button variant="outline" className="w-full h-12 text-base font-medium border-2" onClick={() => router.push('/onboarding/freelancer/password')}>
                        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Registrarse con Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">O</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="sr-only">Email</Label>
                            <Input id="email" placeholder="Email" type="email" className="h-12" />
                        </div>
                        <Button className="w-full h-12 text-base" onClick={() => router.push('/onboarding/freelancer/password')}>
                            Siguiente
                        </Button>
                    </div>
                </div>
            </div>

            {/* Right Side - Value Props */}
            <div className="hidden lg:flex w-1/2 bg-muted/10 relative overflow-hidden items-center justify-center p-12">
                {/* Red Wave Background (Simulated with SVG or Div) */}
                <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-primary/20 to-transparent pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary rounded-full opacity-20 blur-3xl" />

                <div className="relative z-10 max-w-md space-y-8 bg-white/50 backdrop-blur-sm p-8 rounded-2xl border shadow-sm">
                    <h2 className="text-3xl font-bold text-foreground">
                        Concéntrate en tus proyectos y olvídate del papeleo.
                    </h2>

                    <ul className="space-y-6">
                        <li className="flex items-start gap-3">
                            <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                            <span className="text-lg text-muted-foreground">Sin prospección: los clientes te contactan directamente.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                            <span className="text-lg text-muted-foreground">Facturas automatizadas y pagos rápidos.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                            <span className="text-lg text-muted-foreground">Seguro incluido.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
