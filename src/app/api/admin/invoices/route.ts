import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(req: NextRequest) {
    try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        // Verify admin status
        const { data: admin } = await supabase
            .from("admin_users")
            .select("*")
            .eq("email", session.user.email)
            .eq("is_active", true)
            .single()

        if (!admin) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 })
        }

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
