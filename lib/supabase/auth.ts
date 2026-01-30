"use client";

import { supabase } from "./client";
import { toast } from "react-toastify";
import { setGoogleProfilePicture } from "@/lib/api/profile-picture";

// Google OAuth Sign In
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    toast.error(error.message || "Google sign in failed");
    throw error;
  }
};

// Handle Google OAuth callback and set profile picture
export const handleGoogleAuthCallback = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;

    if (user) {
      // Set Google profile picture if available
      await setGoogleProfilePicture(user);
    }

    return user;
  } catch (error: any) {
    console.error("Error handling Google auth callback:", error);
    // Don't throw error to avoid breaking the auth flow
  }
};

// Email/Password Sign In
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    toast.success("Welcome back!");
    return data;
  } catch (error: any) {
    toast.error(error.message || "Login failed");
    throw error;
  }
};

// Sign Up with Email
export const signUpWithEmail = async (
  email: string,
  password: string,
  name: string,
) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
          full_name: name,
        },
      },
    });

    if (error) throw error;

    toast.success(
      "Account created successfully! Please check your email to verify.",
    );
    return data;
  } catch (error: any) {
    toast.error(error.message || "Sign up failed");
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    toast.success("Logged out successfully");
  } catch (error: any) {
    toast.error(error.message || "Logout failed");
    throw error;
  }
};

// Reset Password
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    toast.error(error.message || "Failed to send reset email");
    throw error;
  }
};
