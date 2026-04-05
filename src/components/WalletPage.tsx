import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface WalletPageProps {
  onNavigate: (view: any) => void;
  currentView: string;
  isAdmin: boolean;
  onLogout: () => void;
  balance: number;
  onUpdateBalance: (balance: number) => void;
  onAddWithdrawal: (withdrawal: any) => void;
}

export default function WalletPage({ onNavigate, currentView, isAdmin, onLogout, balance, onUpdateBalance, onAddWithdrawal }: WalletPageProps) {
  const [paymentMethod, setPaymentMethod] = useState('Paypal');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [threshold, setThreshold] = useState('100');
  const [paymentCycle, setPaymentCycle] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const methods = ['Paypal'];

  const handleSave = () => {
    const value = parseInt(threshold);
    if (isNaN(value) || value < 100) {
      setError('Minimum payout threshold is 100 USD');
      setTimeout(() => setError(null), 3000);
      return;
    }
    setError(null);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleWithdraw = () => {
    if (!paypalEmail) {
      setError('Please enter your Paypal account email');
      setTimeout(() => setError(null), 3000);
      return;
    }
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      setTimeout(() => setError(null), 3000);
      return;
    }
    if (amount > balance) {
      setError('Insufficient balance');
      setTimeout(() => setError(null), 3000);
      return;
    }
    if (amount < parseInt(threshold)) {
      setError(`Minimum withdrawal is ${threshold} USD`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsWithdrawing(true);
    setTimeout(() => {
      const newWithdrawal = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        amount: amount,
        paypalEmail: paypalEmail,
        date: new Date().toISOString(),
        status: 'Pending'
      };
      onUpdateBalance(balance - amount);
      onAddWithdrawal(newWithdrawal);
      setIsWithdrawing(false);
      setWithdrawSuccess(true);
      setWithdrawAmount('');
      setTimeout(() => setWithdrawSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA]">
      <Sidebar onNavigate={onNavigate} currentView={currentView} isAdmin={isAdmin} onLogout={onLogout} />
      <Header />
      
      <main className="ml-56 pt-16 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            <h1 className="text-[#2EB0C9] text-2xl font-medium mb-8">Withdraw Funds</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Current Balance</h2>
                <div className="text-4xl font-bold text-green-600">$ {balance.toFixed(2)}</div>
                <p className="text-xs text-gray-500 mt-1">Available for immediate withdrawal</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Minimum Payout</h2>
                <div className="text-4xl font-bold text-slate-700">$ {threshold}</div>
                <p className="text-xs text-gray-500 mt-1">Fixed threshold for all publishers</p>
              </div>
            </div>

            <div className="space-y-6 max-w-2xl">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-600">Paypal Account Email</label>
                <input 
                  type="email" 
                  placeholder="Enter your Paypal email address"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded text-slate-600 focus:border-[#2EB0C9] outline-none transition-colors text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-600">Amount to Withdraw (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-200 rounded text-slate-600 focus:border-[#2EB0C9] outline-none transition-colors text-sm"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleWithdraw}
                  disabled={isWithdrawing}
                  className={`w-full md:w-auto px-10 py-3 rounded font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${
                    isWithdrawing 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-[#6366F1] hover:bg-[#5558E3] text-white'
                  }`}
                >
                  {isWithdrawing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      Processing Withdrawal...
                    </>
                  ) : 'Request Withdrawal'}
                </button>
              </div>

              {withdrawSuccess && (
                <div className="bg-green-50 border border-green-100 text-green-700 p-4 rounded text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Withdrawal request submitted! Your balance has been updated.
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
            <h3 className="text-blue-800 font-bold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Withdrawal Information
            </h3>
            <ul className="text-sm text-blue-700 space-y-2 list-disc list-inside">
              <li>Payments are processed via Paypal only.</li>
              <li>Minimum withdrawal amount is $100.00 USD.</li>
              <li>Ensure your Paypal email is correct to avoid payment delays.</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
