import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@/auth";
import { FreelancerList } from "@/components/freelancer-list";
import { ArrowRight, Sparkles, TrendingUp, Shield } from "lucide-react";
import { redirect } from "next/navigation";

// Mock data - will be replaced with database queries
const MOCK_FREELANCERS = [
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Johnson",
    role: "Facebook Ads Specialist",
    skills: ["Facebook Ads", "Instagram Ads", "Social Media Marketing", "Analytics"],
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 850,
    location: "New York, USA",
    bio: "10+ years experience managing Facebook ad campaigns for e-commerce brands. Specialized in ROAS optimization and scaling.",
  },
  {
    id: "2",
    firstName: "Michael",
    lastName: "Chen",
    role: "Google Ads Expert",
    skills: ["Google Ads", "PPC", "SEM", "Conversion Optimization"],
    rating: 5.0,
    reviewCount: 89,
    hourlyRate: 950,
    location: "San Francisco, USA",
    bio: "Certified Google Ads professional with proven track record of reducing CPA by 40% on average.",
  },
  {
    id: "3",
    firstName: "Emma",
    lastName: "Rodriguez",
    role: "Social Media Manager",
    skills: ["Instagram", "TikTok", "Content Strategy", "Influencer Marketing"],
    rating: 4.8,
    reviewCount: 156,
    hourlyRate: 750,
    location: "Miami, USA",
    bio: "Creative social media strategist helping brands grow their presence on Instagram and TikTok.",
  },
  {
    id: "4",
    firstName: "David",
    lastName: "Kim",
    role: "SEO Specialist",
    skills: ["SEO", "Content Marketing", "Link Building", "Technical SEO"],
    rating: 4.9,
    reviewCount: 203,
    hourlyRate: 800,
    location: "Austin, USA",
    bio: "Data-driven SEO expert with 8 years experience ranking websites in competitive niches.",
  },
  {
    id: "5",
    firstName: "Lisa",
    lastName: "Anderson",
    role: "Email Marketing Strategist",
    skills: ["Email Marketing", "Automation", "Copywriting", "A/B Testing"],
    rating: 4.7,
    reviewCount: 94,
    hourlyRate: 700,
    location: "Chicago, USA",
    bio: "Email marketing specialist focused on building automated funnels that convert.",
  },
  {
    id: "6",
    firstName: "James",
    lastName: "Taylor",
    role: "Video Marketing Expert",
    skills: ["Video Production", "YouTube Ads", "TikTok Marketing", "Video Editing"],
    rating: 5.0,
    reviewCount: 67,
    hourlyRate: 900,
    location: "Los Angeles, USA",
    bio: "Award-winning video marketer creating viral campaigns for brands across all platforms.",
  },
];

export default async function Home() {
  const session = await auth();

  // Redirect authenticated users to their dashboard
  if (session?.user) {
    if (session.user.role === "client") {
      redirect("/dashboard/client");
    } else if (session.user.role === "freelancer") {
      redirect("/dashboard/freelancer");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                AdMarket
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="/#benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Benefits
              </Link>
              <Link href="/#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              {!session?.user ? (
                <>
                  <Link href="/sign-in">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button size="sm" className="rounded-full">Get Started</Button>
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>Trusted by 10,000+ businesses</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Find Top{" "}
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                Advertising Experts
              </span>{" "}
              for Your Business
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Connect with vetted freelancers who specialize in Facebook Ads, Google Ads, SEO, and more. Get results faster.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="#browse">
                <Button size="lg" className="rounded-full text-base px-8 h-14 gap-2">
                  Browse Talent
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="lg" variant="outline" className="rounded-full text-base px-8 h-14">
                  Post a Job
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Vetted Professionals</h3>
              <p className="text-muted-foreground">
                Every freelancer is thoroughly vetted with verified reviews and portfolios
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mx-auto">
                <TrendingUp className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Proven Results</h3>
              <p className="text-muted-foreground">
                Track record of delivering measurable ROI for businesses of all sizes
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/5 flex items-center justify-center mx-auto">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Fast Hiring</h3>
              <p className="text-muted-foreground">
                Connect with the perfect expert in minutes, not weeks
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Freelancers Section */}
      <section id="browse" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Meet Our Top Talent
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse expert freelancers ready to take your advertising to the next level
            </p>
          </div>

          <FreelancerList freelancers={MOCK_FREELANCERS} />
        </div>
      </section>
    </div>
  );
}
