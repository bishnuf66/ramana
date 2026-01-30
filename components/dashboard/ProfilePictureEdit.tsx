"use client";

import { useState } from "react";
import { Camera, X, User } from "lucide-react";

interface ProfilePictureEditProps {
  currentPictureUrl?: string;
  tempPicture?: {
    file: File | null;
    preview: string | null;
    deleted: boolean;
  };
  onPictureUpload: (file: File) => void;
  onPictureDelete: () => void;
  editable: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function ProfilePictureEdit({
  currentPictureUrl,
  tempPicture,
  onPictureUpload,
  onPictureDelete,
  editable,
  size = "md",
  className = "",
}: ProfilePictureEditProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  // Determine what to display
  let displayUrl: string | null = null;
  let showDeleteButton = false;

  if (tempPicture?.deleted) {
    // Picture marked for deletion
    displayUrl = null;
  } else if (tempPicture?.preview) {
    // New picture uploaded (temporary)
    displayUrl = tempPicture.preview;
    showDeleteButton = true;
  } else if (currentPictureUrl) {
    // Current picture
    displayUrl = currentPictureUrl;
    showDeleteButton = true;
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPictureUpload(file);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Profile Picture */}
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-700 shadow-lg`}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-1/2 h-1/2 text-gray-400" />
          </div>
        )}
      </div>

      {/* Upload/Delete Controls */}
      {editable && (
        <>
          {/* Upload Button */}
          <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition-colors shadow-lg">
            <Camera className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Delete Button */}
          {showDeleteButton && !tempPicture?.deleted && (
            <button
              onClick={onPictureDelete}
              className="absolute top-0 right-0 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg"
              title="Remove profile picture"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Deleted Indicator */}
          {tempPicture?.deleted && (
            <div className="absolute inset-0 bg-red-500 bg-opacity-75 rounded-full flex items-center justify-center">
              <div className="text-white text-center">
                <X className="w-8 h-8 mx-auto mb-1" />
                <span className="text-xs">Will be deleted</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
