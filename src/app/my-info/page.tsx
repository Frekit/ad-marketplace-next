"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function MyInfoPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/me');
            const data = await res.json();
            setUser(data.user);
        } catch (error) {
            console.error('Error fetching user:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
            <header className="border-b bg-background/80 backdrop-blur-xl">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <h1 className="text-2xl font-bold">My Information</h1>
                        <Link href="/dashboard/client">
                            <Button variant="ghost" size="sm">Back to Dashboard</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Account Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {user ? (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">User ID (Supabase)</label>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 p-3 bg-muted rounded-md text-sm font-mono break-all">
                                            {user.id || 'Not available'}
                                        </code>
                                        {user.id && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => copyToClipboard(user.id)}
                                            >
                                                {copied ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    <div className="p-3 bg-muted rounded-md text-sm">
                                        {user.email}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                                    <div className="p-3 bg-muted rounded-md text-sm">
                                        {user.name}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Role</label>
                                    <div className="p-3 bg-muted rounded-md text-sm capitalize">
                                        {user.role}
                                    </div>
                                </div>

                                {!user.id && (
                                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                        <p className="text-sm text-yellow-800">
                                            ⚠️ User ID not found in session. Please log out and log back in.
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-muted-foreground">No user data available</p>
                        )}
                    </CardContent>
                </Card>

                {user?.id && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Quick SQL for Creating Test Projects</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-3">
                                Copy this SQL and run it in your Supabase SQL Editor:
                            </p>
                            <pre className="p-4 bg-muted rounded-md text-xs overflow-x-auto">
                                {`-- Create test projects
INSERT INTO projects (client_id, title, description, skills_required, allocated_budget, status)
VALUES 
  ('${user.id}', 'Facebook Ads Campaign Q4', 'Campaign management for Q4', ARRAY['Facebook Ads', 'Social Media'], 500, 'draft'),
  ('${user.id}', 'Google Ads Optimization', 'PPC campaign optimization', ARRAY['Google Ads', 'PPC'], 400, 'draft'),
  ('${user.id}', 'LinkedIn B2B Lead Generation', 'B2B lead generation campaign', ARRAY['LinkedIn Ads', 'B2B Marketing'], 350, 'draft');`}
                            </pre>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
