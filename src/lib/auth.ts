import { headers } from "next/headers";

// Server-side auth function compatible with route handlers
// This replaces the NextAuth auth() function
export async function auth() {
  try {
    const headersList = await headers();
    const cookie = headersList.get("cookie") || "";
    
    // Get session from Better Auth API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/get-session`,
      {
        headers: {
          cookie,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const session = await response.json();
    
    if (!session || !session.user) {
      return null;
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      },
    };
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

// Re-export auth client methods for convenience
export { signIn, signOut, getSession } from "./auth-client";
