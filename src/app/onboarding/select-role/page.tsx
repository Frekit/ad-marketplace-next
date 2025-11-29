"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SelectRolePage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
            <div className="max-w-5xl w-full space-y-12 text-center">
                <div className="space-y-4">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm">
                        ¡Hola!
                    </span>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                        ¿Qué tipo de cuenta te gustaría crear?
                    </h1>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Client Card */}
                    <Card
                        className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 cursor-pointer h-[400px] flex flex-col items-center justify-center text-center p-8 hover:shadow-xl"
                        onClick={() => router.push('/onboarding/client')}
                    >
                        <div className="mb-8 p-6 bg-primary/5 rounded-full group-hover:scale-110 transition-transform duration-300">
                            <Briefcase className="h-16 w-16 text-primary" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Empresa</h3>
                        <p className="text-muted-foreground text-lg">Busco freelance</p>
                    </Card>

                    {/* Freelancer Card */}
                    <Card
                        className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 cursor-pointer h-[400px] flex flex-col items-center justify-center text-center p-8 hover:shadow-xl"
                        onClick={() => router.push('/onboarding/freelancer')}
                    >
                        <div className="mb-8 p-6 bg-primary/5 rounded-full group-hover:scale-110 transition-transform duration-300">
                            <User className="h-16 w-16 text-primary" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Freelance</h3>
                        <p className="text-muted-foreground text-lg">Quiero crear mi perfil de freelance</p>
                    </Card>
                </div>

                <div className="text-sm text-muted-foreground">
                    <p>¿Eres consultor o director interino? <Link href="#" className="text-primary hover:underline font-medium">Descubre Malt Strategy</Link></p>
                    <p className="mt-4">¿Ya tienes una cuenta? <Link href="/sign-in" className="text-primary hover:underline font-medium">Iniciar sesión</Link></p>
                </div>
            </div>
        </div>
    );
}
