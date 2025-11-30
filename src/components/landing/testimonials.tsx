"use client"

import { Star } from "lucide-react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
    {
        content: "Encontré un experto en Google Ads en menos de 24 horas. El ROI de nuestras campañas aumentó un 150% en el primer mes.",
        author: "Carlos Rodríguez",
        role: "CEO, E-commerce Tech",
        avatar: "/avatars/carlos.jpg",
        initials: "CR"
    },
    {
        content: "La calidad del talento aquí es muy superior a otras plataformas. Son verdaderos profesionales que entienden el negocio.",
        author: "Ana Martínez",
        role: "Marketing Director, StartupFlow",
        avatar: "/avatars/ana.jpg",
        initials: "AM"
    },
    {
        content: "El sistema de pagos en depósito me da mucha tranquilidad. Solo libero el dinero cuando estoy 100% satisfecho.",
        author: "Miguel Ángel",
        role: "Founder, Digital Agency",
        avatar: "/avatars/miguel.jpg",
        initials: "MA"
    }
]

export function TestimonialsSection() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                        Lo que dicen nuestros clientes
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="p-8 rounded-2xl bg-card border border-border relative"
                        >
                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                ))}
                            </div>

                            <p className="text-lg text-muted-foreground mb-8 italic">
                                "{testimonial.content}"
                            </p>

                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={testimonial.avatar} />
                                    <AvatarFallback>{testimonial.initials}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-semibold text-white">{testimonial.author}</h4>
                                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
