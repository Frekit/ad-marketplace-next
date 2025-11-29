import { ChatInterface } from "@/components/chat-interface";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@/auth";

export default async function MessagesPage() {
    const session = await auth();

    return (
        <div className="min-h-screen flex flex-col">
            <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent cursor-pointer">
                            AdMarket
                        </h1>
                    </Link>
                    <nav className="flex gap-4 items-center">
                        <Link href="/">
                            <Button variant="ghost">Browse</Button>
                        </Link>
                        <Link href="/messages">
                            <Button variant="ghost" className="bg-muted">Messages</Button>
                        </Link>
                        <Link href="/orders">
                            <Button variant="ghost">Orders</Button>
                        </Link>
                        <Link href="/profile">
                            <Button>Profile</Button>
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1 container mx-auto py-6 px-4">
                <h1 className="text-3xl font-bold mb-6">Messages</h1>
                <ChatInterface />
            </main>
        </div>
    );
}
