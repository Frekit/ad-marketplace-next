"use client"

import { Suspense } from "react"
import MessagesContent from "@/components/freelancer/messages-content"
import FreelancerLayout from "@/components/layouts/FreelancerLayout"
import { Loader2 } from "lucide-react"

export default function FreelancerMessagesPage() {
    return (
        <FreelancerLayout>
            <Suspense fallback={
                <div className="p-8 flex items-center justify-center min-h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            }>
                <MessagesContent />
            </Suspense>
        </FreelancerLayout>
    )
}
