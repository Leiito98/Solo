"use client";

import Image from "next/image";
import { useState } from "react";

function isValidHex(v: string) {
  return /^#[0-9a-fA-F]{6}$/.test(v.trim());
}

export function PublicLogo({
  name,
  src,
  primary,
  secondary,
  size = 96,
  className = "",
}: {
  name: string;
  src: string | null;
  primary: string;
  secondary: string;
  size?: number;
  className?: string;
}) {
  const p = isValidHex(primary) ? primary.trim() : "#111827";
  const s = isValidHex(secondary) ? secondary.trim() : "#374151";
  const [broken, setBroken] = useState(false);

  const letter = (name?.trim()?.[0] || "N").toUpperCase();

  if (!src || broken) {
    return (
      <div
        className={`rounded-2xl flex items-center justify-center font-black text-white ${className}`}
        style={{
          width: size,
          height: size,
          background: `linear-gradient(135deg, ${p} 0%, ${s} 100%)`,
        }}
        aria-label="Logo placeholder"
      >
        <span style={{ fontSize: Math.max(18, Math.floor(size * 0.42)) }}>{letter}</span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl overflow-hidden bg-white ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={`Logo ${name}`}
        width={size}
        height={size}
        className="object-contain w-full h-full"
        onError={() => setBroken(true)}
      />
    </div>
  );
}
