import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

const FREELANCERS = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    email: "sarah.johnson@admarket.test",
    firstName: "Sarah",
    lastName: "Johnson",
    role: "freelancer",
    profile: {
      hourly_rate: 85,
      bio: "10+ years experience managing Facebook ad campaigns for e-commerce brands. Specialized in ROAS optimization and scaling.",
      skills: ["Facebook Ads", "Instagram Ads", "Social Media Marketing", "Analytics", "A/B Testing"],
      availability: "available",
      rating: 4.9,
      total_jobs: 45,
      total_earnings: 125000,
      profile_completion: 100,
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    email: "michael.chen@admarket.test",
    firstName: "Michael",
    lastName: "Chen",
    role: "freelancer",
    profile: {
      hourly_rate: 95,
      bio: "Certified Google Ads professional with proven track record of reducing CPA by 40% on average.",
      skills: ["Google Ads", "PPC", "SEM", "Conversion Optimization", "Analytics"],
      availability: "available",
      rating: 5.0,
      total_jobs: 67,
      total_earnings: 189000,
      profile_completion: 100,
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    email: "emma.rodriguez@admarket.test",
    firstName: "Emma",
    lastName: "Rodriguez",
    role: "freelancer",
    profile: {
      hourly_rate: 75,
      bio: "Creative social media strategist helping brands grow their presence on Instagram and TikTok.",
      skills: ["Instagram", "TikTok", "Content Strategy", "Influencer Marketing", "Video Marketing"],
      availability: "available",
      rating: 4.8,
      total_jobs: 52,
      total_earnings: 98000,
      profile_completion: 100,
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    email: "david.kim@admarket.test",
    firstName: "David",
    lastName: "Kim",
    role: "freelancer",
    profile: {
      hourly_rate: 80,
      bio: "Data-driven SEO expert with 8 years experience ranking websites in competitive niches.",
      skills: ["SEO", "Content Marketing", "Link Building", "Technical SEO", "Analytics"],
      availability: "available",
      rating: 4.9,
      total_jobs: 78,
      total_earnings: 210000,
      profile_completion: 100,
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    email: "lisa.anderson@admarket.test",
    firstName: "Lisa",
    lastName: "Anderson",
    role: "freelancer",
    profile: {
      hourly_rate: 70,
      bio: "Email marketing specialist focused on building automated funnels that convert.",
      skills: ["Email Marketing", "Automation", "Copywriting", "A/B Testing", "Marketing Funnels"],
      availability: "available",
      rating: 4.7,
      total_jobs: 39,
      total_earnings: 76000,
      profile_completion: 100,
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    email: "james.taylor@admarket.test",
    firstName: "James",
    lastName: "Taylor",
    role: "freelancer",
    profile: {
      hourly_rate: 90,
      bio: "Award-winning video marketer creating viral campaigns for brands across all platforms.",
      skills: ["Video Production", "YouTube Ads", "TikTok Marketing", "Video Editing", "Storytelling"],
      availability: "available",
      rating: 5.0,
      total_jobs: 34,
      total_earnings: 145000,
      profile_completion: 100,
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
        // 1. Create user record in public schema
        const { error: userError } = await supabase
          .from("users")
          .upsert(
            {
              id: freelancer.id,
              email: freelancer.email,
              password_hash: "$2b$12$placeholder.hash.for.demo.purposes.only.do.not.use.in.production",
              first_name: freelancer.firstName,
              last_name: freelancer.lastName,
              role: freelancer.role,
              created_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );

        if (userError) {
          console.error(`User error for ${freelancer.email}:`, userError);
          results.push({ email: freelancer.email, status: "error", error: userError.message });
          continue;
        }

        // 2. Create freelancer profile (only if freelancer_profiles table exists)
        try {
          const { error: profileError } = await supabase
            .from("freelancer_profiles")
            .upsert({
              user_id: freelancer.id,
              ...freelancer.profile,
              created_at: new Date().toISOString(),
            });

          if (profileError && !profileError.message.includes("Could not find the table")) {
            console.error(`Profile error for ${freelancer.email}:`, profileError);
          }
        } catch (profileErr) {
          // Table might not exist, continue anyway
          console.log(`Skipping profile for ${freelancer.email} - table may not exist`);
        }

        results.push({ email: freelancer.email, status: "created", userId: freelancer.id });
      } catch (error: any) {
        results.push({ email: freelancer.email, status: "error", error: error.message });
      }
    }

    return NextResponse.json(
      {
        success: true,
        results,
        message: "Test freelancers created in users table. Use these IDs when inviting freelancers.",
        instructions: "Copy freelancer IDs from the response and paste them when inviting to projects.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Fatal error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const adminKey = request.headers.get("x-admin-key");
    if (adminKey !== process.env.ADMIN_SEED_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all test freelancers
    const { data: freelancers, error } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, role")
      .eq("role", "freelancer");

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch freelancers", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        freelancers,
        total: freelancers?.length || 0,
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
