import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export default function CreateGigPage() {
    return (
        <div className="container mx-auto py-10 px-4 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Post a New Gig</CardTitle>
                    <CardDescription>Create a new service listing to start selling.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Gig Title</Label>
                        <Input id="title" placeholder="I will do..." />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Describe your service in detail..." className="min-h-[150px]" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price ($)</Label>
                            <Input id="price" type="number" placeholder="50" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="delivery">Delivery Time (days)</Label>
                            <Input id="delivery" type="number" placeholder="3" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags (comma separated)</Label>
                        <Input id="tags" placeholder="Social Media, Marketing, SEO" />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-4">
                    <Button variant="outline">Cancel</Button>
                    <Button>Publish Gig</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
