import React from "react";

export default function ConstitutionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Transparent node container shell allowing child pages to mount
    <>
      {children}
    </>
  );
}
