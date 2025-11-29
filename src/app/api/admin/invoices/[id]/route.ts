import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const body = await req.json()
        const { status } = body

        if (!status || !["pending", "approved", "paid", "rejected"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 })
        }

        const { id } = await params
        const { data: invoice, error } = await supabase
            .from("invoices")
            .update({ status })
            .eq("id", id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(invoice)
    } catch (error) {
        console.error("Error updating invoice:", error)
        return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 })
    }
}
