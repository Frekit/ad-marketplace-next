"use client"

import { Button } from "@heroui/react"
import { ArrowRight, Sparkles, Shield, Zap, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function HeroSection() {
    return (
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32 bg-background">
            {/* Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute top-40 right-10 w-96 h-96 bg-accent/20 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-sm text-sm font-medium text-primary hover:bg-primary/20 transition-colors cursor-default"
                    >
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span>La plataforma #1 para expertos en publicidad</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-text"
                    >
                        Escala tu negocio con <br />
                        <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-gradient-x">
                            Talento Verificado
                        </span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xl md:text-2xl text-text-muted max-w-2xl mx-auto leading-relaxed"
                    >
                        Conecta con los mejores expertos en Facebook Ads, Google Ads y SEO.
                        Sin intermediarios, sin comisiones ocultas.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto"
                    >
                        <Link href="/freelancers" className="w-full sm:w-auto">
                            <Button
                                as="div"
                                size="lg"
                                className="w-full sm:w-auto rounded-full text-base px-8 h-14 gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all cursor-pointer"
                            >
                                <span className="flex items-center gap-2">
                                    Explorar Freelancers
                                    <ArrowRight className="h-4 w-4" />
                                </span>
                            </Button>
                        </Link>
                        <Link href="/sign-up" className="w-full sm:w-auto">
                            <Button
                                as="div"
                                size="lg"
                                variant="bordered"
                                className="w-full sm:w-auto rounded-full text-base px-8 h-14 border-border text-text hover:bg-surface backdrop-blur-sm cursor-pointer"
                            >
                                Publicar Proyecto
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Trust Indicators */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl"
                    >
                        <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-surface border border-border">
                            <Shield className="h-5 w-5 text-success flex-shrink-0" />
                            <span className="text-sm font-medium text-text-secondary">Pagos Seguros</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-surface border border-border">
                            <Zap className="h-5 w-5 text-warning flex-shrink-0" />
                            <span className="text-sm font-medium text-text-secondary">Resultados Rápidos</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-surface border border-border">
                            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                            <span className="text-sm font-medium text-text-secondary">Verificados</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
