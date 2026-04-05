import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <div className="text-6xl font-black text-gray-600 tracking-tighter mb-8">
            dealeraff
          </div>
          <h2 className="text-4xl font-light text-slate-500 mb-8 tracking-wide">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
}
