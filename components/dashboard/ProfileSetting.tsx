"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import ProfilePictureUpload from "./ProfilePictureUpload";
import ProfilePictureEdit from "./ProfilePictureEdit";
import { useCurrentUserProfilePicture } from "@/hooks/useProfilePicture";
import {
  clearOldProfilePictureMetadata,
  uploadProfilePicture,
  deleteProfilePicture,
} from "@/lib/api/profile-picture";

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
  profile_picture_url?: string;
  created_at: string;
}

interface ProfileSettingProps {
  user: UserProfile;
  loadUserData: () => void;
}

export default function ProfileSetting({
  user,
  loadUserData,
}: ProfileSettingProps) {
  const [editingProfile, setEditingProfile] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const {
    profilePictureUrl: hookProfilePictureUrl,
    loading: profilePictureLoading,
  } = useCurrentUserProfilePicture();

  // Use profile picture from user prop first, then fallback to hook
  const profilePictureUrl =
    user.profile_picture_url || user.avatar_url || hookProfilePictureUrl;

  // Debug logging
  console.log("Profile picture URLs:", {
    user_profile_picture_url: user.profile_picture_url,
    user_avatar_url: user.avatar_url,
    hookProfilePictureUrl,
    finalProfilePictureUrl: profilePictureUrl,
  });

  // State for temporary profile picture changes
  const [tempProfilePicture, setTempProfilePicture] = useState<{
    file: File | null;
    preview: string | null;
    deleted: boolean;
  }>({
    file: null,
    preview: null,
    deleted: false,
  });

  const [profileForm, setProfileForm] = useState({
    full_name: user.full_name || "",
    phone: user.phone || "",
    address: user.address || "",
  });
  const [emailForm, setEmailForm] = useState({
    newEmail: "",
    password: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Clear old metadata with double paths when component mounts
  useEffect(() => {
    clearOldProfilePictureMetadata();
  }, []);

  // Handlers for temporary profile picture changes
  const handleTempPictureUpload = (file: File) => {
    const preview = URL.createObjectURL(file);
    setTempProfilePicture({
      file,
      preview,
      deleted: false,
    });
  };

  const handleTempPictureDelete = () => {
    setTempProfilePicture({
      file: null,
      preview: null,
      deleted: true,
    });
  };

  const handleCancelEdit = () => {
    // Reset temporary changes
    setTempProfilePicture({
      file: null,
      preview: null,
      deleted: false,
    });
    setProfileForm({
      full_name: user.full_name || "",
      phone: user.phone || "",
      address: user.address || "",
    });
    setEditingProfile(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSavingProfile(true);

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) return;

      // Handle profile picture changes
      if (tempProfilePicture.deleted) {
        // Delete profile picture
        try {
          await deleteProfilePicture(user.id);
        } catch (error) {
          console.error("Error deleting profile picture:", error);
        }
      } else if (tempProfilePicture.file) {
        // Upload new profile picture
        try {
          await uploadProfilePicture(tempProfilePicture.file, user.id);
        } catch (error) {
          console.error("Error uploading profile picture:", error);
        }
      }

      // Update auth metadata directly
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          address: profileForm.address,
          avatar_url: user.avatar_url,
        },
      });

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setEditingProfile(false);

      // Reset temporary state
      setTempProfilePicture({
        file: null,
        preview: null,
        deleted: false,
      });

      // Force refresh by waiting a moment then reloading
      setTimeout(() => {
        loadUserData();
      }, 500);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.auth.updateUser({
        email: emailForm.newEmail,
      });

      if (error) throw error;

      toast.success(
        "Email update initiated! Please check your new email for verification.",
      );
      setChangingEmail(false);
      setEmailForm({ newEmail: "", password: "" });
    } catch (error) {
      console.error("Error updating email:", error);
      toast.error("Failed to update email");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      toast.success("Password updated successfully!");
      setChangingPassword(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Profile Settings
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={loadUserData}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Refresh profile data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditingProfile(!editingProfile)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Edit className="w-4 h-4" />
            {editingProfile ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      {/* Profile Picture Section */}
      <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-6">
          {editingProfile ? (
            <ProfilePictureEdit
              currentPictureUrl={profilePictureUrl || undefined}
              tempPicture={tempProfilePicture}
              onPictureUpload={handleTempPictureUpload}
              onPictureDelete={handleTempPictureDelete}
              editable={true}
              size="lg"
              className="flex-shrink-0"
            />
          ) : (
            <ProfilePictureUpload
              userId={user.id}
              size="lg"
              showUploadButton={false}
              editable={false}
              currentProfilePictureUrl={profilePictureUrl || undefined}
              className="flex-shrink-0"
            />
          )}
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Upload a profile picture to personalize your account. Supported
              formats: JPG, PNG, GIF. Maximum size: 2MB.
            </p>

            {(!profilePictureUrl || tempProfilePicture?.deleted) &&
              !profilePictureLoading && (
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  No profile picture set. Click "Edit Profile" to upload one.
                </p>
              )}

            {editingProfile && tempProfilePicture?.file && (
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                📸 New picture selected - Click "Save Changes" to apply
              </p>
            )}
            {editingProfile && tempProfilePicture?.deleted && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                🗑️ Picture marked for deletion - Click "Save Changes" to confirm
              </p>
            )}
          </div>
        </div>
      </div>

      {editingProfile ? (
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={profileForm.full_name}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  full_name: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={profileForm.phone}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  phone: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Address
            </label>
            <textarea
              value={profileForm.address}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {savingProfile ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={savingProfile}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Email
                </p>
                <p className="text-gray-900 dark:text-white">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => setChangingEmail(!changingEmail)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Change Email
            </button>
          </div>

          {changingEmail && (
            <form
              onSubmit={handleChangeEmail}
              className="ml-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Email
                </label>
                <input
                  type="email"
                  value={emailForm.newEmail}
                  onChange={(e) =>
                    setEmailForm((prev) => ({
                      ...prev,
                      newEmail: e.target.value,
                    }))
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  Update Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChangingEmail(false);
                    setEmailForm({ newEmail: "", password: "" });
                  }}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Password
                </p>
                <p className="text-gray-900 dark:text-white">••••••••</p>
              </div>
            </div>
            <button
              onClick={() => setChangingPassword(!changingPassword)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Change Password
            </button>
          </div>

          {changingPassword && (
            <form
              onSubmit={handleChangePassword}
              className="ml-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChangingPassword(false);
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
          {user.full_name && (
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Full Name
                </p>
                <p className="text-gray-900 dark:text-white">
                  {user.full_name}
                </p>
              </div>
            </div>
          )}
          {user.phone && (
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Phone
                </p>
                <p className="text-gray-900 dark:text-white">{user.phone}</p>
              </div>
            </div>
          )}
          {user.address && (
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Address
                </p>
                <p className="text-gray-900 dark:text-white">{user.address}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Member Since
              </p>
              <p className="text-gray-900 dark:text-white">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
