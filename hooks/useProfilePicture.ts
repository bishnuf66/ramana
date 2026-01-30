import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import {
  uploadProfilePicture,
  deleteProfilePicture,
  getUserProfilePicture,
} from "@/lib/api/profile-picture";

export interface UseProfilePictureOptions {
  userId: string;
  autoLoad?: boolean;
}

export interface UseProfilePictureReturn {
  profilePictureUrl: string | null;
  loading: boolean;
  uploading: boolean;
  error: string | null;
  uploadPicture: (file: File) => Promise<void>;
  deletePicture: () => Promise<void>;
  refreshPicture: () => Promise<void>;
  clearError: () => void;
}

export function useProfilePicture({
  userId,
  autoLoad = true,
}: UseProfilePictureOptions): UseProfilePictureReturn {
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load profile picture
  const loadProfilePicture = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const url = await getUserProfilePicture(userId);
      setProfilePictureUrl(url);
    } catch (err: any) {
      console.error("Error loading profile picture:", err);
      setError(err.message || "Failed to load profile picture");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Upload new profile picture
  const uploadPicture = useCallback(async (file: File) => {
    if (!userId) {
      setError("User ID is required");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      const url = await uploadProfilePicture(file, userId);
      setProfilePictureUrl(url);
      toast.success("Profile picture updated successfully!");
    } catch (err: any) {
      console.error("Error uploading profile picture:", err);
      setError(err.message || "Failed to upload profile picture");
      toast.error(err.message || "Failed to upload profile picture");
    } finally {
      setUploading(false);
    }
  }, [userId]);

  // Delete profile picture
  const deletePicture = useCallback(async () => {
    if (!userId) {
      setError("User ID is required");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      const success = await deleteProfilePicture(userId);
      if (success) {
        setProfilePictureUrl(null);
        toast.success("Profile picture removed successfully!");
      }
    } catch (err: any) {
      console.error("Error deleting profile picture:", err);
      setError(err.message || "Failed to remove profile picture");
      toast.error(err.message || "Failed to remove profile picture");
    } finally {
      setUploading(false);
    }
  }, [userId]);

  // Refresh profile picture
  const refreshPicture = useCallback(async () => {
    await loadProfilePicture();
  }, [loadProfilePicture]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && userId) {
      loadProfilePicture();
    }
  }, [autoLoad, userId, loadProfilePicture]);

  return {
    profilePictureUrl,
    loading,
    uploading,
    error,
    uploadPicture,
    deletePicture,
    refreshPicture,
    clearError,
  };
}

// Hook for getting current user's profile picture
export function useCurrentUserProfilePicture() {
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCurrentUserProfilePicture = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.user_metadata?.profile_picture_url) {
          setProfilePictureUrl(user.user_metadata.profile_picture_url);
        }
      } catch (error) {
        console.error("Error loading current user profile picture:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUserProfilePicture();
  }, []);

  return { profilePictureUrl, loading };
}

// Hook for checking if user has a profile picture
export function useHasProfilePicture(userId?: string) {
  const [hasProfilePicture, setHasProfilePicture] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkProfilePicture = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const url = await getUserProfilePicture(userId);
        setHasProfilePicture(!!url);
      } catch (error) {
        console.error("Error checking profile picture:", error);
        setHasProfilePicture(false);
      } finally {
        setLoading(false);
      }
    };

    checkProfilePicture();
  }, [userId]);

  return { hasProfilePicture, loading };
}
