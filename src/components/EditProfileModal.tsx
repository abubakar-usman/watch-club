"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { UserProfile } from "@/lib/types";

const ALL_GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "Western",
];

interface EditProfileModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  /** TODO: Replace with PATCH /api/profile/:userId */
  onSave: (updated: Partial<UserProfile>) => void;
}

export default function EditProfileModal({
  profile,
  isOpen,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [age, setAge] = useState(String(profile.age));
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    profile.genrePreferences
  );

  // Sync when profile prop changes
  useEffect(() => {
    setFullName(profile.fullName);
    setUsername(profile.username);
    setBio(profile.bio);
    setAge(String(profile.age));
    setSelectedGenres(profile.genrePreferences);
  }, [profile, isOpen]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSave = () => {
    onSave({
      fullName: fullName.trim(),
      username: username.trim().startsWith("@")
        ? username.trim()
        : `@${username.trim()}`,
      bio: bio.trim(),
      age: parseInt(age) || profile.age,
      genrePreferences: selectedGenres,
    });
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-2xl border border-[#535353] shadow-2xl"
        style={{ background: "#1E1E1E" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-[#535353]">
          <h2 className="text-white font-semibold text-[18px]">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-[#959292] hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
            id="close-edit-profile-modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-5">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="block text-[#959292] text-[12px] font-medium uppercase tracking-wider">
              Full Name
            </label>
            <input
              id="edit-full-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-[#282828] border border-[#535353] rounded-[8px] px-4 py-3 text-white text-[14px] placeholder-[#595959] focus:outline-none focus:border-[#E60813] transition-colors"
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <label className="block text-[#959292] text-[12px] font-medium uppercase tracking-wider">
              Username
            </label>
            <input
              id="edit-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@username"
              className="w-full bg-[#282828] border border-[#535353] rounded-[8px] px-4 py-3 text-white text-[14px] placeholder-[#595959] focus:outline-none focus:border-[#E60813] transition-colors"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="block text-[#959292] text-[12px] font-medium uppercase tracking-wider">
              Bio
            </label>
            <textarea
              id="edit-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the community about yourself..."
              rows={3}
              className="w-full bg-[#282828] border border-[#535353] rounded-[8px] px-4 py-3 text-white text-[14px] placeholder-[#595959] focus:outline-none focus:border-[#E60813] transition-colors resize-none"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <label className="block text-[#959292] text-[12px] font-medium uppercase tracking-wider">
              Email
            </label>
            <input
              id="edit-email"
              type="email"
              value={profile.email}
              disabled
              className="w-full bg-[#151515] border border-[#333] rounded-[8px] px-4 py-3 text-[#595959] text-[14px] cursor-not-allowed"
            />
            <p className="text-[11px] text-[#595959]">
              Email cannot be changed here.
            </p>
          </div>

          {/* Age */}
          <div className="space-y-2">
            <label className="block text-[#959292] text-[12px] font-medium uppercase tracking-wider">
              Age
            </label>
            <input
              id="edit-age"
              type="number"
              min={13}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Your age"
              className="w-full bg-[#282828] border border-[#535353] rounded-[8px] px-4 py-3 text-white text-[14px] placeholder-[#595959] focus:outline-none focus:border-[#E60813] transition-colors"
            />
          </div>

          {/* Genre Preferences */}
          <div className="space-y-3">
            <label className="block text-[#959292] text-[12px] font-medium uppercase tracking-wider">
              Genre Preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_GENRES.map((genre) => {
                const isSelected = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all duration-150 ${
                      isSelected
                        ? "bg-[#E60813] border-[#E60813] text-white"
                        : "bg-transparent border-[#535353] text-[#959292] hover:border-[#E60813] hover:text-white"
                    }`}
                    id={`genre-toggle-${genre.toLowerCase()}`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2 border-t border-[#535353]">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-[10px] text-[14px] font-semibold text-[#959292] bg-transparent border border-[#535353] hover:text-white hover:border-white/40 transition-all"
            id="cancel-edit-profile"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-[10px] text-[14px] font-semibold text-white bg-[#E60813] hover:bg-[#c5070f] transition-all shadow-lg shadow-red-900/20"
            id="save-edit-profile"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
