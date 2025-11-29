import NextAuth from "next-auth"

declare module "next-auth" {
    interface User {
        role?: string
        companyName?: string
    }

    interface Session {
        user: {
            id: string
            email: string
            name: string
            role?: string
            companyName?: string
        }
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: string
        companyName?: string
    }
}
