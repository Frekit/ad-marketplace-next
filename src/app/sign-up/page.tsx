import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, Building2 } from "lucide-react";

export default function SignUpSelectionPage() {
    return (
        <div className="flex items-center justify-center min-h-screen py-12 px-4 bg-muted/30">
            <div className="max-w-4xl w-full space-y-8 text-center">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Join AdMarket</h1>
                    <p className="text-muted-foreground">Choose how you want to use the platform</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link href="/sign-up/client" className="group">
                        <Card className="h-full hover:border-primary transition-colors cursor-pointer relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardHeader>
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                                    <Building2 className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>I am a Client</CardTitle>
                                <CardDescription>I want to hire talent for my advertising campaigns.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="text-sm text-muted-foreground space-y-2">
                                    <li>• Post jobs and hire experts</li>
                                    <li>• Manage projects and payments</li>
                                    <li>• Business email required</li>
                                </ul>
                                <Button className="w-full mt-6" variant="outline">Join as Client</Button>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/sign-up/freelancer" className="group">
                        <Card className="h-full hover:border-primary transition-colors cursor-pointer relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardHeader>
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                                    <Briefcase className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>I am a Freelancer</CardTitle>
                                <CardDescription>I want to offer my services and earn money.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="text-sm text-muted-foreground space-y-2">
                                    <li>• Create gigs and sell services</li>
                                    <li>• Get paid securely</li>
                                    <li>• Build your portfolio</li>
                                </ul>
                                <Button className="w-full mt-6">Join as Freelancer</Button>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                <p className="text-sm text-muted-foreground">
                    Already have an account? <Link href="/sign-in" className="text-primary hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
