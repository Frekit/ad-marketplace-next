import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isAuthPage = req.nextUrl.pathname.startsWith("/sign-in") ||
        req.nextUrl.pathname.startsWith("/sign-up")
    const isLandingPage = req.nextUrl.pathname === "/"

    // Redirect logged-in users away from auth pages to their dashboard
    if (isLoggedIn && isAuthPage) {
        let dashboardPath = "/dashboard/freelancer" // default

        if (req.auth?.user?.role === "client") {
            dashboardPath = "/dashboard/client"
        } else if (req.auth?.user?.role === "admin") {
            dashboardPath = "/admin/dashboard"
        }

        return NextResponse.redirect(new URL(dashboardPath, req.url))
    }

    // Redirect logged-in users from landing page to their dashboard
    if (isLoggedIn && isLandingPage) {
        let dashboardPath = "/dashboard/freelancer" // default

        if (req.auth?.user?.role === "client") {
            dashboardPath = "/dashboard/client"
        } else if (req.auth?.user?.role === "admin") {
            dashboardPath = "/admin/dashboard"
        }

        return NextResponse.redirect(new URL(dashboardPath, req.url))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
