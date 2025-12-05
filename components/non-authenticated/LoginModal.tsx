"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const BACKEND_URL = "xyz";
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      console.log("Signup successful", formData);
      onClose();
    } catch (error) {
      console.error("Error signing up", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white  p-4 md:p-8 rounded-lg shadow-lg w-full mx-10 max-w-lg overflow-y-auto flex itsm-center justify-center flex-col">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-bold mb-6 text-black">Log In</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="mb-1 relative">
            <label className="block text-sm font-medium mb-1 text-black">
              {/* Email */}
            </label>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              className="w-full border p-1 rounded-lg pl-10"
              required
            />
            <i className="fa-solid fa-envelope absolute left-3 bottom-0 transform -translate-y-1/2 text-gray-500"></i>
          </div>
          <div className="mb-1 relative">
            <label className="block text-sm font-medium mb-1 text-black">
              {/* Password */}
            </label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border p-1 rounded-lg pl-10"
              required
            />
            <i className="fa-solid fa-lock absolute left-3 bottom-0 transform -translate-y-1/2 text-gray-500"></i>
          </div>
          <div className="mb-1 text-black flex  justify-end">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span className="ml-2">Remember Me </span>
            </label>
          </div>
          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="primary-green text-white py-1 px-4 rounded w-full"
            >
              Log In
            </button>
          </div>
        </form>

        <div className="text-center text-black">
          Dont&apos;t have an account?
          <span className="primary-text-green">Sign up</span>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;



