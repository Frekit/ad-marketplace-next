import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const FREELANCERS = [
  {
    email: "sarah.johnson@example.com",
    password: "password123",
    firstName: "Sarah",
    lastName: "Johnson",
    role: "freelancer",
    profile: {
      hourly_rate: 85,
      bio: "10+ years experience managing Facebook ad campaigns for e-commerce brands. Specialized in ROAS optimization and scaling.",
      skills: ["Facebook Ads", "Instagram Ads", "Social Media Marketing", "Analytics", "A/B Testing"],
      availability: "available",
      rating: 4.9,
    }
  },
  {
    email: "michael.chen@example.com",
    password: "password123",
    firstName: "Michael",
    lastName: "Chen",
    role: "freelancer",
    profile: {
      hourly_rate: 95,
      bio: "Certified Google Ads professional with proven track record of reducing CPA by 40% on average.",
      skills: ["Google Ads", "PPC", "SEM", "Conversion Optimization", "Analytics"],
      availability: "available",
      rating: 5.0,
    }
  },
  {
    email: "emma.rodriguez@example.com",
    password: "password123",
    firstName: "Emma",
    lastName: "Rodriguez",
    role: "freelancer",
    profile: {
      hourly_rate: 75,
      bio: "Creative social media strategist helping brands grow their presence on Instagram and TikTok.",
      skills: ["Instagram", "TikTok", "Content Strategy", "Influencer Marketing", "Video Marketing"],
      availability: "available",
      rating: 4.8,
    }
  },
  {
    email: "david.kim@example.com",
    password: "password123",
    firstName: "David",
    lastName: "Kim",
    role: "freelancer",
    profile: {
      hourly_rate: 80,
      bio: "Data-driven SEO expert with 8 years experience ranking websites in competitive niches.",
      skills: ["SEO", "Content Marketing", "Link Building", "Technical SEO", "Analytics"],
      availability: "available",
      rating: 4.9,
    }
  },
  {
    email: "lisa.anderson@example.com",
    password: "password123",
    firstName: "Lisa",
    lastName: "Anderson",
    role: "freelancer",
    profile: {
      hourly_rate: 70,
      bio: "Email marketing specialist focused on building automated funnels that convert.",
      skills: ["Email Marketing", "Automation", "Copywriting", "A/B Testing", "Marketing Funnels"],
      availability: "available",
      rating: 4.7,
    }
  },
  {
    email: "james.taylor@example.com",
    password: "password123",
    firstName: "James",
    lastName: "Taylor",
    role: "freelancer",
    profile: {
      hourly_rate: 90,
      bio: "Award-winning video marketer creating viral campaigns for brands across all platforms.",
      skills: ["Video Production", "YouTube Ads", "TikTok Marketing", "Video Editing", "Storytelling"],
      availability: "available",
      rating: 5.0,
    }
  },
  {
    email: "alex.morales@example.com",
    password: "password123",
    firstName: "Alex",
    lastName: "Morales",
    role: "freelancer",
    profile: {
      hourly_rate: 88,
      bio: "LinkedIn specialist helping B2B companies build thought leadership and generate qualified leads.",
      skills: ["LinkedIn Marketing", "B2B Marketing", "Content Marketing", "Lead Generation", "Sales"],
      availability: "busy",
      rating: 4.6,
    }
  },
  {
    email: "jessica.lee@example.com",
    password: "password123",
    firstName: "Jessica",
    lastName: "Lee",
    role: "freelancer",
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

    const supabase = createClient(supabaseUrl, supabaseKey);
    const results = [];

    for (const freelancer of FREELANCERS) {
      try {
        // 1. Create user account
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: freelancer.email,
          password: freelancer.password,
          email_confirm: true,
        });

        if (authError) {
          if (authError.message.includes("already exists")) {
            console.log(`User ${freelancer.email} already exists`);
            // Get the existing user ID
            const { data: existingUser } = await supabase
              .from("users")
              .select("id")
              .eq("email", freelancer.email)
              .single();

            if (existingUser) {
              // Update profile
              await supabase
                .from("freelancer_profiles")
                .upsert({
                  user_id: existingUser.id,
                  ...freelancer.profile,
                });
              results.push({ email: freelancer.email, status: "updated" });
            }
          } else {
            results.push({ email: freelancer.email, status: "error", error: authError.message });
          }
          continue;
        }

        const userId = authData.user?.id;
        if (!userId) {
          results.push({ email: freelancer.email, status: "error", error: "No user ID returned" });
          continue;
        }

        // 2. Create user record in public schema
        const { error: userError } = await supabase
          .from("users")
          .upsert({
            id: userId,
            email: freelancer.email,
            first_name: freelancer.firstName,
            last_name: freelancer.lastName,
            role: freelancer.role,
          });

        if (userError) {
          results.push({ email: freelancer.email, status: "error", error: userError.message });
          continue;
        }

        // 3. Create freelancer profile
        const { error: profileError } = await supabase
          .from("freelancer_profiles")
          .upsert({
            user_id: userId,
            ...freelancer.profile,
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

    return NextResponse.json({ success: true, results }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
