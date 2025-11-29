import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data
const MOCK_GIGS: Record<string, any> = {
    "1": {
        id: "1",
        title: "Professional Facebook Ad Campaign Management",
        description: "I will set up and manage your Facebook Ads campaign for maximum ROI. Includes audience research, ad copy, and A/B testing.\n\nWhat you get:\n- Campaign Setup\n- Ad Copywriting\n- Audience Targeting\n- Weekly Reporting",
        price: 150,
        author: "Alex Marketing",
        tags: ["Facebook Ads", "Social Media", "Marketing"],
        deliveryTime: "3 days",
    },
    "2": {
        id: "2",
        title: "Google Ads PPC Expert Setup",
        description: "Certified Google Ads expert. I will create a high-converting search campaign for your business.",
        price: 200,
        author: "Sarah PPC",
        tags: ["Google Ads", "PPC", "SEM"],
        deliveryTime: "5 days",
    },
};

export default async function GigDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const gig = MOCK_GIGS[id] || MOCK_GIGS["1"]; // Fallback to 1 for demo

    return (
        <div className="container mx-auto py-10 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <h1 className="text-3xl font-bold">{gig.title}</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            {gig.author[0]}
                        </div>
                        <span className="font-medium">{gig.author}</span>
                    </div>
                    <div className="flex gap-2">
                        {gig.tags.map((tag: string) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>About This Gig</CardTitle>
                    </CardHeader>
                    <CardContent className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                        {gig.description}
                    </CardContent>
                </Card>
            </div>

            <div>
                <Card className="sticky top-24">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">${gig.price}</CardTitle>
                        <p className="text-sm text-muted-foreground">Single Payment</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span>Delivery Time</span>
                            <span className="font-medium">{gig.deliveryTime}</span>
                        </div>
                        <Button className="w-full" size="lg">Continue (${gig.price})</Button>
                        <Button variant="outline" className="w-full">Contact Seller</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
