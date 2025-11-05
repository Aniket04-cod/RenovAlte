import React from "react";

type AvatarProps = {
  initials: string;
};

export function Avatar({ initials }: AvatarProps) {
  return (
    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
      {initials}
    </span>
  );
}
