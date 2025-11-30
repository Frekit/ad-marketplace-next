"use client"

import { Shield, Zap, Users, BarChart3, Globe, Lock } from "lucide-react"
import { motion } from "framer-motion"

const features = [
    {
        icon: Shield,
        title: "Verificación Rigurosa",
        description: "Cada freelancer pasa por un proceso de verificación manual de identidad y habilidades."
    },
    {
        icon: Zap,
        title: "Contratación Instantánea",
        description: "Sin largas esperas. Contacta y contrata expertos en cuestión de minutos."
    },
    {
        icon: Lock,
        title: "Pagos Protegidos",
        description: "Tu dinero está seguro en depósito (escrow) hasta que apruebes el trabajo entregado."
    },
    {
        icon: Users,
        title: "Talento Especializado",
        description: "Accede a una red exclusiva de expertos en marketing digital y publicidad."
    },
    {
        icon: BarChart3,
        title: "Enfoque en ROI",
        description: "Nuestros freelancers entienden que lo único que importa son los resultados."
    },
    {
        icon: Globe,
        title: "Colaboración Global",
        description: "Trabaja con talento de todo el mundo con herramientas de gestión integradas."
    }
]

export function FeaturesSection() {
    return (
        <section className="py-24 bg-surface relative" id="features">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-text">
                        Todo lo que necesitas para <br />
                        <span className="text-primary">contratar con confianza</span>
                    </h2>
                    <p className="text-lg text-text-muted">
                        Hemos eliminado la fricción del proceso de contratación para que puedas enfocarte en crecer.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="p-8 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all group shadow-lg"
                        >
                            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <feature.icon className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold text-text mb-3">{feature.title}</h3>
                            <p className="text-text-muted leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
