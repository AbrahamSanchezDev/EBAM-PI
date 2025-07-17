// Simple SVG user icon for default profile picture
import React from "react";

export default function UserIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="32" cy="32" r="32" fill="#F3F4F6" />
      <circle cx="32" cy="26" r="14" fill="#D1D5DB" />
      <ellipse cx="32" cy="48" rx="18" ry="10" fill="#D1D5DB" />
    </svg>
  );
}
