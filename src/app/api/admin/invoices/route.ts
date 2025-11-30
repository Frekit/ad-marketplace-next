import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { createClient } from "@/lib/supabase"

export async function GET(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        // Verify admin role
        if (session.user.role !== 'admin') {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 })
        }

        const supabase = createClient()

        // Fetch all invoices
        const { data: invoices, error } = await supabase
            .from("invoices")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) throw error

        return NextResponse.json(invoices || [])
    } catch (error) {
        console.error("Error fetching invoices:", error)
        return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
    }
}
