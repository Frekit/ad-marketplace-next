import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { createClient } from "@/lib/supabase"

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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
