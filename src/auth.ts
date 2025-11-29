import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { createClient } from "@/lib/supabase"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const supabase = createClient()
                const { data: user, error } = await supabase
                    .from("users")
                    .select("*")
                    .eq("email", credentials.email)
                    .single()

                if (error || !user) {
                    return null
                }

                const isValid = await compare(
                    credentials.password as string,
                    user.password_hash
                )

                if (!isValid) {
                    return null
                }

                // Check if user is an admin
                const { data: adminUser } = await supabase
                    .from("admin_users")
                    .select("*")
                    .eq("email", credentials.email)
                    .single()

                // If user is in admin_users table, set role to 'admin'
                const userRole = adminUser ? "admin" : user.role

                return {
                    id: user.id,
                    email: user.email,
                    name: `${user.first_name} ${user.last_name}`,
                    role: userRole,
                    companyName: user.company_name,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
                token.companyName = user.companyName
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as string
                session.user.companyName = token.companyName as string
            }
            return session
        },
    },
    pages: {
        signIn: "/sign-in",
    },
})
