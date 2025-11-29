"use client"

import { useState } from "react";
import { GigCard } from "@/components/gig-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface Gig {
    id: string;
    title: string;
    description: string;
    price: number;
    author: string;
    tags: string[];
}

export function GigList({ gigs }: { gigs: Gig[] }) {
    const [search, setSearch] = useState("");

    const filteredGigs = gigs.filter(gig =>
        gig.title.toLowerCase().includes(search.toLowerCase()) ||
        gig.tags.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search services..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="outline">Filter</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGigs.map((gig) => (
                    <GigCard key={gig.id} {...gig} />
                ))}
            </div>
            {filteredGigs.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                    No gigs found matching your search.
                </div>
            )}
        </div>
    );
}
