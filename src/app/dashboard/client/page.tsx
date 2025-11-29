import ClientLayout from "@/components/layouts/ClientLayout";
import DashboardContent from "./DashboardContent";
import { createClient } from "@/lib/supabase";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ClientDashboard() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/sign-in");
    }

    const supabase = createClient();

    // Fetch wallet balance (with fallback)
    let { data: wallet } = await supabase
        .from("client_wallets")
        .select("available_balance")
        .eq("client_id", session.user.id)
        .single();

    // If no wallet exists, create one
    if (!wallet) {
        const { data: newWallet } = await supabase
            .from("client_wallets")
            .insert({
                client_id: session.user.id,
                available_balance: 0,
                total_deposited: 0,
                locked_balance: 0,
            })
            .select("available_balance")
            .single();
        wallet = newWallet;
    }

    const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(5);

    return (
        <ClientLayout>
            <DashboardContent
                balance={wallet?.available_balance || 0}
                transactions={transactions || []}
                user={{
                    name: session.user.name,
                    email: session.user.email,
                }}
            />
        </ClientLayout>
    );
}
