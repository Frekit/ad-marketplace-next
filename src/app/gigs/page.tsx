import { GigList } from "@/components/gig-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const MOCK_GIGS = [
    {
        id: "1",
        title: "Professional Facebook Ad Campaign Management",
        description: "I will set up and manage your Facebook Ads campaign for maximum ROI. Includes audience research, ad copy, and A/B testing.",
        price: 150,
        author: "Alex Marketing",
        tags: ["Facebook Ads", "Social Media", "Marketing"],
    },
    {
        id: "2",
        title: "Google Ads PPC Expert Setup",
        description: "Certified Google Ads expert. I will create a high-converting search campaign for your business.",
        price: 200,
        author: "Sarah PPC",
        tags: ["Google Ads", "PPC", "SEM"],
    },
    {
        id: "3",
        title: "TikTok Viral Video Ad Creation",
        description: "Engaging, trend-based video ads for TikTok that drive clicks and conversions.",
        price: 80,
        author: "Creative Studio",
        tags: ["TikTok", "Video Ads", "Content Creation"],
    },
    {
        id: "4",
        title: "Instagram Influencer Marketing Strategy",
        description: "I will find the perfect influencers for your brand and negotiate the best rates.",
        price: 300,
        author: "Influencer Pro",
        tags: ["Instagram", "Influencer", "Strategy"],
    },
];

export default function GigsPage() {
    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Browse Gigs</h1>
                    <p className="text-muted-foreground mt-2">
                        Find the best advertising services for your needs.
                    </p>
                </div>
                <Link href="/gigs/new">
                    <Button>Post a Gig</Button>
                </Link>
            </div>

            <GigList gigs={MOCK_GIGS} />
        </div>
    );
}
