import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { createClient } from "@/lib/supabase"
import { applyRateLimit, addRateLimitHeaders, logRequest } from "@/lib/api-middleware"
import { rateLimitConfig } from "@/lib/rate-limit"

const BLOCKED_DOMAINS = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"]

export async function POST(request: NextRequest) {
    const startTime = Date.now();

    // Apply rate limiting (5 attempts per 15 minutes)
    const rateLimit = applyRateLimit(request, '/api/auth/register', rateLimitConfig.auth);
    if (rateLimit instanceof NextResponse) {
        logRequest('POST', '/api/auth/register', 429, Date.now() - startTime, request);
        return rateLimit;
    }

    try {
        const body = await request.json()
        const { email, password, firstName, lastName, role, companyName } = body

        // Validate required fields
        if (!email || !password || !firstName || !lastName || !role) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Validate business email for clients
        if (role === "client") {
            const domain = email.split("@")[1]?.toLowerCase()
            if (!domain || BLOCKED_DOMAINS.includes(domain)) {
                return NextResponse.json(
                    { error: "Please use a business email address. Personal email providers are not allowed for client accounts." },
                    { status: 400 }
                )
            }

            if (!companyName) {
                return NextResponse.json(
                    { error: "Company name is required for client accounts" },
                    { status: 400 }
                )
            }
        }

        const supabase = createClient()

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .single()

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 400 }
            )
        }

        // Hash password
        const passwordHash = await hash(password, 12)

        // Insert user
        const { data: newUser, error } = await supabase
            .from("users")
            .insert({
                email,
                password_hash: passwordHash,
                first_name: firstName,
                last_name: lastName,
                role,
                company_name: companyName || null,
            })
            .select()
            .single()

        if (error) {
            console.error("Supabase error:", error)
            return NextResponse.json(
                { error: "Failed to create user" },
                { status: 500 }
            )
        }

        const response = NextResponse.json(
            {
                message: "User created successfully",
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    role: newUser.role,
                }
            },
            { status: 201 }
        );

        const responseWithHeaders = addRateLimitHeaders(response, rateLimit.headers);
        logRequest('POST', '/api/auth/register', 201, Date.now() - startTime, request);
        return responseWithHeaders;
    } catch (error) {
        console.error("Registration error:", error)
        logRequest('POST', '/api/auth/register', 500, Date.now() - startTime, request);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
