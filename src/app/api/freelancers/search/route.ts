import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const MOCK_FREELANCERS = [
  {
    id: "1",
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
    id: "2",
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
    id: "3",
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
    id: "4",
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
    id: "5",
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
    id: "6",
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

    let filtered = MOCK_FREELANCERS;

    if (query) {
      filtered = MOCK_FREELANCERS.filter(
        (f) =>
          f.firstName.toLowerCase().includes(query) ||
          f.lastName.toLowerCase().includes(query) ||
          f.role.toLowerCase().includes(query) ||
          f.skills.some((s) => s.toLowerCase().includes(query))
      );
    }

    return NextResponse.json(
      {
        freelancers: filtered,
        total: filtered.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
