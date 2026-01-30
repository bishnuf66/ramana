"use client";

import { useState } from "react";
import { Upload, X, Camera, User } from "lucide-react";
import { toast } from "react-toastify";
import { useProfilePicture } from "@/hooks/useProfilePicture";

interface ProfilePictureUploadProps {
  userId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showUploadButton?: boolean;
  editable?: boolean;
  currentProfilePictureUrl?: string;
  onUploadSuccess?: () => void;
}

export default function ProfilePictureUpload({
  userId,
  className = "",
  size = "md",
  showUploadButton = true,
  editable = true,
  currentProfilePictureUrl,
  onUploadSuccess,
}: ProfilePictureUploadProps) {
  const {
    profilePictureUrl: hookProfilePictureUrl,
    loading,
    uploading,
    error,
    uploadPicture,
    deletePicture,
    clearError,
  } = useProfilePicture({ userId, autoLoad: true });

  // Use current profile picture from prop first, then fallback to hook data
  const displayProfilePictureUrl =
    currentProfilePictureUrl || hookProfilePictureUrl;

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear any previous errors
    clearError();

    try {
      // Upload the file
      await uploadPicture(file);

      // Call success callback to refresh user data
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error("Upload failed:", error);
      // Error handling is done in the hook
    }
  };

  const handleDeletePicture = async () => {
    // Clear any previous errors
    clearError();

    // Delete the picture
    await deletePicture();
  };

  if (loading) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`}
      />
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Profile Picture */}
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-700 shadow-lg`}
      >
        {displayProfilePictureUrl ? (
          <img
            src={displayProfilePictureUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-1/2 h-1/2 text-gray-400" />
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-red-500 text-white text-xs rounded-lg text-center">
          {error}
        </div>
      )}

      {/* Upload/Delete Controls */}
      {showUploadButton && editable && (
        <>
          {/* Upload Button */}
          <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition-colors shadow-lg">
            <Camera className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>

          {/* Delete Button */}
          {displayProfilePictureUrl && (
            <button
              onClick={handleDeletePicture}
              disabled={uploading}
              className="absolute top-0 right-0 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg"
              title="Remove profile picture"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Loading Overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
