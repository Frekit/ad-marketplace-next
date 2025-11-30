"use client"

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
                setLoading(false);
                return;
            }

            router.push("/");
            router.refresh();
        } catch (err) {
            setError("An error occurred during sign in");
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen py-12 px-4 bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

            <Card className="max-w-md w-full border border-white/10 shadow-2xl bg-white/5 backdrop-blur-xl relative z-10">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
                    <CardDescription>
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                                disabled={loading}
                                className="bg-background/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                className="bg-background/50"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full font-medium" disabled={loading} size="lg">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 text-center border-t border-white/10 bg-white/5 p-6">
                    <div className="text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link href="/sign-up" className="text-primary font-medium hover:underline transition-all">
                            Create an account
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
