import React from "react";
import { Link } from "react-router";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-screen flex bg-white dark:bg-gray-900">
      {/* LEFT SIDE IMAGE + TEXT */}
      <div className="hidden lg:flex relative w-1/2 h-full">
        {/* Background Image */}
        <img
          src="/images/assets/sign-in.png"
          alt="bg"
          className="w-full h-full object-cover"
        />

        {/* Overlay + Text */}
        <div className="absolute inset-0  flex items-center justify-center">
          <div className="text-center px-6">
            <Link to="/" className="mb-4 flex items-center flex-col gap-3">
              <img
                src="/event-buddi-logo.png"
                alt="bg"
                className="h-20 w-20 mt-1.5"
              />

              <p className="text-5xl font-bold text-purple-900">Assist Buddi Event</p>
            </Link>
            <p className="text-purple-800 text-sm opacity-90">
              Your ultimate event companion
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE FORM */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
        {children}
      </div>
    </div>
  );
}
