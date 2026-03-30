"use client";

import Image from "next/image";
import { User } from "lucide-react";

interface AvatarProps {
  url?: string | null;
  name?: string;
  size?: number;
  className?: string;
}

export default function Avatar({ url, name, size = 48, className = "" }: AvatarProps) {
  if (url) {
    return (
      <div
        className={`relative overflow-hidden rounded-full flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={url}
          alt={name ?? "Avatar"}
          fill
          className="object-cover object-center"
          sizes={`${size}px`}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-blood/20 border border-blood/30 flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {name ? (
        <span className="text-blood-light font-bold" style={{ fontSize: size * 0.4 }}>
          {name.charAt(0).toUpperCase()}
        </span>
      ) : (
        <User className="text-blood/60" style={{ width: size * 0.45, height: size * 0.45 }} />
      )}
    </div>
  );
}
