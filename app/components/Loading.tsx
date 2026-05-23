'use client';

import React from 'react';

export const Loading: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="space-y-4 text-center">
        <div className="inline-block">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
};
