import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatPanelDate, formatPanelTime } from '../lib/dateUtils';

interface Withdrawal {
  id: string;
  amount: number;
  paypalEmail: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

interface NotificationsPageProps {
  onNavigate: (view: any) => void;
  currentView: string;
  isAdmin: boolean;
  onLogout: () => void;
  withdrawals: Withdrawal[];
}

export default function NotificationsPage({ onNavigate, currentView, isAdmin, onLogout, withdrawals }: NotificationsPageProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock size={16} className="text-amber-500" />;
      case 'Approved': return <CheckCircle size={16} className="text-green-500" />;
      case 'Rejected': return <XCircle size={16} className="text-red-500" />;
      default: return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Approved': return 'bg-green-50 text-green-700 border-green-100';
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA]">
      <Sidebar onNavigate={onNavigate} currentView={currentView} isAdmin={isAdmin} onLogout={onLogout} />
      <Header />
      
      <main className="ml-56 pt-16 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-[#2EB0C9] text-2xl font-medium">Notifications & History</h1>
            <div className="text-sm text-slate-500 font-medium">
              Total Withdrawals: {withdrawals.length}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <h2 className="text-lg font-bold text-slate-800">Withdrawal History</h2>
              <p className="text-sm text-slate-500">Track your payment requests and their status.</p>
            </div>

            {withdrawals.length === 0 ? (
              <div className="p-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
                  <Clock size={32} className="text-gray-300" />
                </div>
                <h3 className="text-slate-700 font-bold mb-1">No withdrawal history found</h3>
                <p className="text-sm text-slate-500">When you request a withdrawal, it will appear here.</p>
                <button 
                  onClick={() => onNavigate('wallet')}
                  className="mt-6 text-indigo-600 font-bold text-sm hover:underline"
                >
                  Go to Wallet to request withdrawal
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Request ID</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Paypal Account</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-700 font-medium">
                            {formatPanelDate(w.date)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {formatPanelTime(w.date)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono text-slate-500 bg-gray-100 px-2 py-1 rounded">
                            #{w.id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-600">{w.paypalEmail}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-800">$ {w.amount.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${getStatusClass(w.status)}`}>
                            {getStatusIcon(w.status)}
                            {w.status}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-8 bg-amber-50 border border-amber-100 rounded-lg p-6 flex gap-4">
            <AlertCircle className="text-amber-500 shrink-0" size={20} />
            <div>
              <h3 className="text-amber-800 font-bold text-sm mb-1">Important Notice</h3>
              <p className="text-xs text-amber-700 leading-relaxed">
                Withdrawal requests are reviewed by our financial team. Once approved, funds will be sent to your Paypal account. 
                If your request is rejected, the funds will be returned to your balance. For any questions, please contact support.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
