import React, { useState, useEffect } from 'react';
import AuthLayout from './AuthLayout';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export default function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPassword = password.toLowerCase().trim();
    
    if (normalizedPassword !== normalizedEmail) {
      setError('Password must be the same as your email address.');
      return;
    }

    // Simulate registration logic
    setIsSuccess(true);
  };

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onSwitchToLogin]);

  return (
    <AuthLayout title="Register">
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center space-y-4 py-12 animate-in fade-in zoom-in duration-300">
          <CheckCircle2 className="text-green-500 w-16 h-16" />
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-700">Registration Successful!</h3>
            <p className="text-slate-500">Redirecting to login page...</p>
          </div>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 p-3 rounded-md text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-600">
              Full Name <span className="text-red-400 text-xs">(Required)</span>
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-blue-50/50 border border-blue-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-slate-700"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-600">
              Email <span className="text-red-400 text-xs">(Required)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full px-4 py-2 bg-blue-50/50 border border-blue-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-slate-700"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-600">
              Password <span className="text-red-400 text-xs">(Required)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="w-full px-4 py-2 bg-blue-50/50 border border-blue-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-slate-700"
              required
            />
            <p className="text-[10px] text-slate-400 italic">Hint: For this demo, use your email as the password.</p>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-4 px-4 border border-transparent rounded-full shadow-lg text-lg font-bold text-white bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.01]"
            >
              Register
            </button>
          </div>

          <div className="text-right pt-4">
            <div className="text-sm text-slate-400">
              Already have an Account ?{' '}
              <button 
                type="button"
                onClick={onSwitchToLogin}
                className="text-indigo-500 font-medium hover:underline"
              >
                Login
              </button>
            </div>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
