// Force dynamic rendering for the entire inbox route
export const dynamic = 'force-dynamic'

export default function InboxLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
