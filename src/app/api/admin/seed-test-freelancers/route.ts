import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

const FREELANCERS = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    email: "sarah@admarket.com",
    firstName: "Sarah",
    lastName: "Johnson",
    profile: {
      hourly_rate: 85,
      bio: "10+ years experience managing Facebook ad campaigns for e-commerce brands. Specialized in ROAS optimization and scaling.",
      skills: ["Facebook Ads", "Instagram Ads", "Social Media Marketing", "Analytics", "A/B Testing"],
      availability: "available",
      rating: 4.9,
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    email: "michael@admarket.com",
    firstName: "Michael",
    lastName: "Chen",
    profile: {
      hourly_rate: 95,
      bio: "Certified Google Ads professional with proven track record of reducing CPA by 40% on average.",
      skills: ["Google Ads", "PPC", "SEM", "Conversion Optimization", "Analytics"],
      availability: "available",
      rating: 5.0,
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    email: "emma@admarket.com",
    firstName: "Emma",
    lastName: "Rodriguez",
    profile: {
      hourly_rate: 75,
      bio: "Creative social media strategist helping brands grow their presence on Instagram and TikTok.",
      skills: ["Instagram", "TikTok", "Content Strategy", "Influencer Marketing", "Video Marketing"],
      availability: "available",
      rating: 4.8,
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    email: "david@admarket.com",
    firstName: "David",
    lastName: "Kim",
    profile: {
      hourly_rate: 80,
      bio: "Data-driven SEO expert with 8 years experience ranking websites in competitive niches.",
      skills: ["SEO", "Content Marketing", "Link Building", "Technical SEO", "Analytics"],
      availability: "available",
      rating: 4.9,
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    email: "lisa@admarket.com",
    firstName: "Lisa",
    lastName: "Anderson",
    profile: {
      hourly_rate: 70,
      bio: "Email marketing specialist focused on building automated funnels that convert.",
      skills: ["Email Marketing", "Automation", "Copywriting", "A/B Testing", "Marketing Funnels"],
      availability: "available",
      rating: 4.7,
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    email: "james@admarket.com",
    firstName: "James",
    lastName: "Taylor",
    profile: {
      hourly_rate: 90,
      bio: "Award-winning video marketer creating viral campaigns for brands across all platforms.",
      skills: ["Video Production", "YouTube Ads", "TikTok Marketing", "Video Editing", "Storytelling"],
      availability: "available",
      rating: 5.0,
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    email: "alex@admarket.com",
    firstName: "Alex",
    lastName: "Morales",
    profile: {
      hourly_rate: 88,
      bio: "LinkedIn specialist helping B2B companies build thought leadership and generate qualified leads.",
      skills: ["LinkedIn Marketing", "B2B Marketing", "Content Marketing", "Lead Generation", "Sales"],
      availability: "busy",
      rating: 4.6,
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440008",
    email: "jessica@admarket.com",
    firstName: "Jessica",
    lastName: "Lee",
    profile: {
      hourly_rate: 82,
      bio: "Conversion rate optimization specialist improving website performance and user experience.",
      skills: ["CRO", "UX Design", "A/B Testing", "Analytics", "User Research"],
      availability: "available",
      rating: 4.9,
    }
  },
];

export async function POST(request: NextRequest) {
  try {
    const adminKey = request.headers.get("x-admin-key");
    if (adminKey !== process.env.ADMIN_SEED_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results = [];

    for (const freelancer of FREELANCERS) {
      try {
        // 1. Create user record in public schema (with placeholder password hash)
        const { error: userError } = await supabase
          .from("users")
          .upsert(
            {
              id: freelancer.id,
              email: freelancer.email,
              password_hash: "$2b$12$placeholder.hash.for.demo.purposes.only.do.not.use.in.production",
              first_name: freelancer.firstName,
              last_name: freelancer.lastName,
              role: "freelancer",
              created_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );

        if (userError) {
          results.push({ email: freelancer.email, status: "error", error: userError.message });
          continue;
        }

        // 2. Create freelancer profile
        const { error: profileError } = await supabase
          .from("freelancer_profiles")
          .upsert({
            user_id: freelancer.id,
            ...freelancer.profile,
            created_at: new Date().toISOString(),
          });

        if (profileError) {
          results.push({ email: freelancer.email, status: "error", error: profileError.message });
          continue;
        }

        results.push({ email: freelancer.email, status: "created" });
      } catch (error: any) {
        results.push({ email: freelancer.email, status: "error", error: error.message });
      }
    }

    return NextResponse.json(
      {
        success: true,
        results,
        message: "Test freelancers seeded (without auth accounts - use API directly)",
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
