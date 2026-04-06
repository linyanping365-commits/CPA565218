import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { MousePointerClick, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface ClickEntry {
  id: string;
  payout: string;
  status: 'Success' | 'Failed';
  timestamp: string;
  taskInfo?: string;
  raw: any;
}

interface ClicksPageProps {
  onNavigate: (view: any) => void;
  currentView: string;
  isAdmin: boolean;
  onLogout: () => void;
  clicks: ClickEntry[];
}

export default function ClicksPage({ onNavigate, currentView, isAdmin, onLogout, clicks }: ClicksPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onNavigate={onNavigate} currentView={currentView} isAdmin={isAdmin} onLogout={onLogout} />
      <Header />
      
      <main className="ml-56 pt-16 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <MousePointerClick className="text-indigo-600" />
              Sync History (Clicks)
            </h1>
            <div className="text-sm text-slate-500 font-medium">
              Total Syncs: {clicks.length}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    <th className="px-6 py-4 border-b border-gray-100">Click ID</th>
                    <th className="px-6 py-4 border-b border-gray-100">Task Name</th>
                    <th className="px-6 py-4 border-b border-gray-100">Payout</th>
                    <th className="px-6 py-4 border-b border-gray-100">Status</th>
                    <th className="px-6 py-4 border-b border-gray-100">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clicks.length > 0 ? (
                    clicks.map((click) => (
                      <tr key={click.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono text-slate-600">{click.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-700 font-medium">{click.taskInfo || 'External Task'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-800">${parseFloat(click.payout).toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {click.status === 'Success' ? (
                              <>
                                <CheckCircle2 size={16} className="text-green-500" />
                                <span className="text-xs font-bold text-green-600 uppercase">Success</span>
                              </>
                            ) : (
                              <>
                                <XCircle size={16} className="text-red-500" />
                                <span className="text-xs font-bold text-red-600 uppercase">Failed</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Clock size={14} />
                            <span className="text-xs font-medium">{click.timestamp}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <MousePointerClick size={48} className="mb-4 opacity-20" />
                          <p className="text-sm italic">No synchronization history found yet.</p>
                          <p className="text-xs mt-1">New postbacks will appear here automatically.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg flex gap-3">
            <div className="text-sm text-indigo-700">
              <p className="font-bold mb-1">Real-time Synchronization:</p>
              <p className="opacity-90">
                This page shows the history of all incoming postbacks from external platforms. 
                Successful syncs automatically update your balance.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
