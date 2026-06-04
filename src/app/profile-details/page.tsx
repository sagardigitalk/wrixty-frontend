"use client";

import React, { useState, useEffect, useRef } from "react";
import { useToast } from "../../context/ToastContext";
import { getAuthenticatedUser, setAuthData } from "../../utils/authUtils";
import { updateUser } from "../../services/userService";
import { Modal } from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";

export default function ProfileDetailsPage() {
  const toast = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Profile Edit State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Change Password State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const user = getAuthenticatedUser();
    if (user) {
      setCurrentUser(user);
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      if (profileImage) {
        formData.append("check_photo", profileImage);
      }

      const updatedUser = await updateUser(currentUser._id || currentUser.id, formData as any);
      
      // Update local storage and state
      setCurrentUser(updatedUser);
      setAuthData(updatedUser);
      toast.success("Profile updated successfully");
      
      // Force reload to update header avatar globally if needed, or rely on state if context is used
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      await updateUser(currentUser._id || currentUser.id, { password: newPassword });
      toast.success("Password changed successfully!");
      setPasswordModalOpen(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      
      {/* Left Panel: My Profile */}
      <div className="bg-card-bg w-full lg:w-1/3 border border-border-ui rounded-xl shadow-soft p-8 flex flex-col items-center justify-center">
        <h3 className="text-lg font-bold text-text-primary self-start mb-6">My Profile</h3>
        
        <div className="w-24 h-24 mb-4 rounded-xl shadow-md overflow-hidden bg-gradient-primary flex items-center justify-center">
          {currentUser?.check_photo ? (
            <img src={currentUser.check_photo} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-3xl font-extrabold">{currentUser?.name?.charAt(0) || "A"}</span>
          )}
        </div>
        
        <h2 className="text-xl font-black text-text-primary mb-1">{currentUser?.name || "Admin"}</h2>
        <p className="text-sm text-text-secondary font-medium mb-8">{currentUser?.email || "superadmin@gmail.com"}</p>
        
        <button
          onClick={() => setPasswordModalOpen(true)}
          className="bg-[#b35a42] hover:bg-[#994d38] text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm"
        >
          Change Password
        </button>
      </div>

      {/* Right Panel: Edit Profile */}
      <div className="bg-card-bg w-full lg:w-2/3 border border-border-ui rounded-xl shadow-soft p-8">
        <h3 className="text-lg font-bold text-text-primary mb-6">Edit Profile</h3>
        
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Name</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-background border border-border-ui rounded-lg px-4 py-2 text-sm text-text-primary font-medium focus:outline-none focus:border-primary-teal transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Profile Image</label>
              <div className="flex items-center">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setProfileImage(e.target.files[0]);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-background border border-border-ui rounded-l-lg px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-border-ui/30 transition-colors shrink-0"
                >
                  Choose file
                </button>
                <div className="bg-background border border-l-0 border-border-ui rounded-r-lg px-4 py-2 text-sm text-text-secondary truncate w-full flex-1 min-w-0">
                  {profileImage ? profileImage.name : "No file chosen"}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Email</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border-ui rounded-lg px-4 py-2 text-sm text-text-primary font-medium focus:outline-none focus:border-primary-teal transition-colors"
                required
              />
            </div>

          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isUpdating}
              className="bg-[#2c5f59] hover:bg-[#234d48] text-white px-8 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
            >
              {isUpdating && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              Update Profile
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Modal */}
      <Modal isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} title="Change Password" sizeClass="max-w-md">
        <form onSubmit={handleChangePassword} className="space-y-5 p-2">
          <Input 
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
          <Input 
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              isLoading={isChangingPassword}
              className="bg-[#2c5f59] hover:bg-[#234d48]"
            >
              Save changes
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
