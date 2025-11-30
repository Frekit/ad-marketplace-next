import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { HeroSection } from "@/components/landing/hero";
import { FeaturesSection } from "@/components/landing/features";
import { TestimonialsSection } from "@/components/landing/testimonials";
import { FreelancerList } from "@/components/freelancer-list";

export default async function Home() {
  const session = await auth();

  // Redirect authenticated users to their dashboard
  if (session?.user) {
    if (session.user.role === "client") {
      redirect("/dashboard/client");
    } else if (session.user.role === "freelancer") {
      redirect("/dashboard/freelancer");
    } else if (session.user.role === "admin") {
      redirect("/admin/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      {/* Header */}
      <header className="fixed top-0 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                AdMarket
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Características
              </Link>
              <Link href="/freelancers" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Freelancers
              </Link>
              <Link href="/#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Precios
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-sm">
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />

        {/* Freelancers Preview Section */}
        <section className="py-24 bg-black/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                Talento destacado
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explora perfiles de expertos listos para empezar a trabajar en tu proyecto hoy mismo.
              </p>
            </div>
            <FreelancerList />

            <div className="mt-12 text-center">
              <Link href="/freelancers">
                <Button size="lg" variant="outline" className="rounded-full px-8">
                  Ver todos los freelancers
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 bg-black/40">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 AdMarket. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
