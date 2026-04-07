import React from 'react';

export default function StatCard({ title, approved, pending, gradient }: { title: string, approved: string, pending: string, gradient: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
      <div className={`h-10 flex items-center justify-center text-white font-bold text-sm bg-gradient-to-r ${gradient}`}>
        {title}
      </div>
      <div className="p-4 text-center">
        <div className="text-gray-400 text-[10px] uppercase mb-1">Approved Income</div>
        <div className="text-gray-900 font-bold text-lg mb-2">{approved}</div>
        <div className="text-gray-400 text-[10px] uppercase mb-1">Pending Income</div>
        <div className="text-gray-500 font-medium text-sm">{pending}</div>
      </div>
    </div>
  );
}
