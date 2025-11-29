import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

const MOCK_FREELANCERS = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    firstName: "Sarah",
    lastName: "Johnson",
    role: "Facebook Ads Specialist",
    skills: ["Facebook Ads", "Instagram Ads", "Social Media Marketing", "Analytics"],
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 85,
    location: "New York, USA",
    bio: "10+ years experience managing Facebook ad campaigns for e-commerce brands. Specialized in ROAS optimization and scaling.",
    availability: "available",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    firstName: "Michael",
    lastName: "Chen",
    role: "Google Ads Expert",
    skills: ["Google Ads", "PPC", "SEM", "Conversion Optimization"],
    rating: 5.0,
    reviewCount: 89,
    hourlyRate: 95,
    location: "San Francisco, USA",
    bio: "Certified Google Ads professional with proven track record of reducing CPA by 40% on average.",
    availability: "available",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    firstName: "Emma",
    lastName: "Rodriguez",
    role: "Social Media Manager",
    skills: ["Instagram", "TikTok", "Content Strategy", "Influencer Marketing"],
    rating: 4.8,
    reviewCount: 156,
    hourlyRate: 75,
    location: "Miami, USA",
    bio: "Creative social media strategist helping brands grow their presence on Instagram and TikTok.",
    availability: "available",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    firstName: "David",
    lastName: "Kim",
    role: "SEO Specialist",
    skills: ["SEO", "Content Marketing", "Link Building", "Technical SEO"],
    rating: 4.9,
    reviewCount: 203,
    hourlyRate: 80,
    location: "Austin, USA",
    bio: "Data-driven SEO expert with 8 years experience ranking websites in competitive niches.",
    availability: "available",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    firstName: "Lisa",
    lastName: "Anderson",
    role: "Email Marketing Strategist",
    skills: ["Email Marketing", "Automation", "Copywriting", "A/B Testing"],
    rating: 4.7,
    reviewCount: 94,
    hourlyRate: 70,
    location: "Chicago, USA",
    bio: "Email marketing specialist focused on building automated funnels that convert.",
    availability: "available",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    firstName: "James",
    lastName: "Taylor",
    role: "Video Marketing Expert",
    skills: ["Video Production", "YouTube Ads", "TikTok Marketing", "Video Editing"],
    rating: 5.0,
    reviewCount: 67,
    hourlyRate: 90,
    location: "Los Angeles, USA",
    bio: "Award-winning video marketer creating viral campaigns for brands across all platforms.",
    availability: "available",
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.toLowerCase() || "";

    let freelancers: any[] = [];

    // Try to fetch real freelancers from database
    try {
      const supabase = createClient();

      const { data: dbFreelancers, error } = await supabase
        .from("users")
        .select("id, first_name, last_name, email, role")
        .eq("role", "freelancer");

      if (error) {
        console.error("Database query error:", error);
      } else if (dbFreelancers && dbFreelancers.length > 0) {
        // Map database freelancers to API response format
        freelancers = dbFreelancers.map((f) => ({
          id: f.id,
          firstName: f.first_name || "",
          lastName: f.last_name || "",
          role: "Freelancer",
          skills: [],
          rating: 4.5,
          reviewCount: 0,
          hourlyRate: 50,
          location: "Remote",
          bio: "Professional freelancer",
          availability: "available",
          email: f.email,
        }));

        // Add mock test freelancers if not already in database
        MOCK_FREELANCERS.forEach((mockFreelancer) => {
          if (!freelancers.some((f) => f.id === mockFreelancer.id)) {
            freelancers.push(mockFreelancer);
          }
        });
      } else {
        // Fallback to mock data if no database freelancers
        freelancers = MOCK_FREELANCERS;
      }
    } catch (dbError) {
      console.error("Error fetching from database:", dbError);
      // Fallback to mock data on database error
      freelancers = MOCK_FREELANCERS;
    }

    // Filter by search query
    let filtered = freelancers;
    if (query) {
      filtered = freelancers.filter((f) => {
        const fullName = `${f.firstName} ${f.lastName}`.toLowerCase();
        const email = (f.email || "").toLowerCase();

        return (
          f.firstName.toLowerCase().includes(query) ||
          f.lastName.toLowerCase().includes(query) ||
          fullName.includes(query) ||
          email.includes(query) ||
          f.role.toLowerCase().includes(query) ||
          (f.skills && f.skills.some((s: string) => s.toLowerCase().includes(query)))
        );
      });
    }

    return NextResponse.json(
      {
        freelancers: filtered,
        total: filtered.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Unexpected error in freelancer search:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
