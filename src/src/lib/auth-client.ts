import { createAuthClient } from "better-auth/react";

// Create the Better Auth client for the frontend (React)
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
});

// Export commonly used methods and hooks
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;

// Helper function to sign in with email/password
export async function signInWithCredentials(email: string, password: string) {
  return authClient.signIn.email({
    email,
    password,
  });
}

// Helper function to sign up with email/password
export async function signUpWithCredentials(
  email: string,
  password: string,
  name: string
) {
  return authClient.signUp.email({
    email,
    password,
    name,
  });
}
