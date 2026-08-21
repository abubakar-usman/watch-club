"use client";

import React, { useRef } from "react";
import Image from "next/image";

interface ProfilePictureUploadProps {
  avatarUrl: string | null;
  displayName: string;
  onUpload: (dataUrl: string) => void;
  size?: number;
}

export default function ProfilePictureUpload({
  avatarUrl,
  displayName,
  onUpload,
  size = 120,
}: ProfilePictureUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const initials = displayName
    ? displayName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") onUpload(result);
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  return (
    <div
      className="relative cursor-pointer group flex-shrink-0"
      style={{ width: size, height: size }}
      onClick={() => inputRef.current?.click()}
      title="Change profile picture"
    >
      {/* Avatar circle */}
      <div
        className="w-full h-full rounded-full overflow-hidden border-[3px] border-[#535353] group-hover:border-[#E60813] transition-colors duration-200"
        style={{ width: size, height: size }}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName || "Profile"}
            width={size}
            height={size}
            className="object-cover w-full h-full"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E60813] to-[#8B0000] text-white font-bold"
            style={{ fontSize: size * 0.35 }}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Camera overlay on hover */}
      <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1">
        {/* Camera icon SVG */}
        <svg
          width={size * 0.28}
          height={size * 0.28}
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        <span
          className="text-white font-medium"
          style={{ fontSize: Math.max(9, size * 0.1) }}
        >
          Change
        </span>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        id="profile-picture-input"
      />
    </div>
  );
}
