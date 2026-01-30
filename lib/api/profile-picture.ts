import { supabase } from "@/lib/supabase/client";

// Profile Picture API Functions

export async function uploadProfilePicture(
  file: File,
  userId: string,
): Promise<string> {
  try {
    // Validate file
    if (!file.type.startsWith("image/")) {
      throw new Error("Please upload an image file");
    }

    if (file.size > 2 * 1024 * 1024) {
      // 2MB limit for profile pictures
      throw new Error("Profile picture must be less than 2MB");
    }

    // Generate unique filename with direct user_id folder
    const fileName = `${userId}/${Date.now()}-${file.name}`;

    // Upload to profile-pictures bucket
    const { error: uploadError } = await supabase.storage
      .from("profile-pictures")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true, // Allow overwriting previous profile picture
      });

    if (uploadError) {
      console.error("Profile picture upload error:", uploadError);
      throw new Error(
        `Failed to upload profile picture: ${uploadError.message}`,
      );
    }

    // Get public URL (for private bucket, this still works with proper policies)
    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-pictures").getPublicUrl(fileName);

    console.log("Profile picture uploaded:", fileName);
    console.log("Public URL:", publicUrl);

    // Update user metadata with profile picture URL
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        profile_picture_url: publicUrl,
        profile_picture_path: fileName,
      },
    });

    if (updateError) {
      console.error("Error updating user metadata:", updateError);
      // Don't throw error, just log it since upload was successful
    } else {
      console.log("User metadata updated successfully");
    }

    return publicUrl;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
}

export async function deleteProfilePicture(userId: string): Promise<boolean> {
  try {
    // Get current user metadata to find profile picture path
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.user_metadata?.profile_picture_path) {
      throw new Error("No profile picture found to delete");
    }

    const filePath = user.user_metadata.profile_picture_path;

    // Delete the file from storage
    const { error } = await supabase.storage
      .from("profile-pictures")
      .remove([filePath]);

    if (error) {
      console.error("Error deleting profile picture:", error);
      throw error;
    }

    // Update user metadata to remove profile picture
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        profile_picture_url: null,
        profile_picture_path: null,
      },
    });

    if (updateError) {
      console.error("Error updating user metadata:", updateError);
      // Don't throw error, just log it since deletion was successful
    } else {
      console.log("Profile picture deleted successfully");
    }

    return true;
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    return false;
  }
}

export async function getUserProfilePicture(
  userId: string,
): Promise<string | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.user_metadata?.profile_picture_url) {
      return user.user_metadata.profile_picture_url;
    }

    return null;
  } catch (error) {
    console.error("Error getting user profile picture:", error);
    return null;
  }
}

export async function clearOldProfilePictureMetadata(): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Check if user has old double-path metadata
    const metadata = user.user_metadata;
    if (
      metadata?.profile_picture_path?.includes(
        "profile-pictures/profile-pictures/",
      )
    ) {
      console.log("Clearing old double-path metadata");

      // Clear the old metadata
      await supabase.auth.updateUser({
        data: {
          profile_picture_url: null,
          profile_picture_path: null,
        },
      });
    }
  } catch (error) {
    console.error("Error clearing old metadata:", error);
  }
}

export async function setGoogleProfilePicture(user: any): Promise<void> {
  try {
    if (user?.user_metadata?.avatar_url || user?.user_metadata?.picture) {
      const profilePictureUrl =
        user.user_metadata.avatar_url || user.user_metadata.picture;

      // Update user metadata with Google profile picture
      await supabase.auth.updateUser({
        data: {
          profile_picture_url: profilePictureUrl,
          profile_picture_source: "google",
        },
      });
    }
  } catch (error) {
    console.error("Error setting Google profile picture:", error);
    // Don't throw error, just log it
  }
}
