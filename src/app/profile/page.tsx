import { auth } from "@/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { User, Briefcase, Building2 } from "lucide-react";

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/sign-in");
    }

    const { user } = session;
    const isClient = user.role === "client";

    return (
        <div className="container mx-auto py-10 px-4">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl">My Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary">
                            <User className="h-10 w-10 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{user.name}</h2>
                            <p className="text-muted-foreground">{user.email}</p>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-3">
                            {isClient ? (
                                <Building2 className="h-5 w-5 text-primary" />
                            ) : (
                                <Briefcase className="h-5 w-5 text-primary" />
                            )}
                            <div>
                                <h3 className="font-semibold mb-1">Account Type</h3>
                                <p className="text-sm text-muted-foreground">
                                    {isClient ? "Client" : "Freelancer"}
                                </p>
                            </div>
                        </div>

                        {isClient && user.companyName && (
                            <div className="p-4 rounded-lg bg-muted/50">
                                <h3 className="font-semibold mb-1">Company</h3>
                                <p className="text-sm text-muted-foreground">{user.companyName}</p>
                            </div>
                        )}

                        <div className="p-4 rounded-lg bg-muted/50">
                            <h3 className="font-semibold mb-1">Member Since</h3>
                            <p className="text-sm text-muted-foreground">
                                {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button asChild>
                            <a href="/profile/edit">
                                Edit Profile
                            </a>
                        </Button>
                        {!isClient && (
                            <Button variant="outline" asChild>
                                <a href="/freelancer/portfolio">View My Portfolio</a>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
