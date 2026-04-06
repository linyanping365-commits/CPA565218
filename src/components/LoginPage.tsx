import React, { useState } from 'react';
import AuthLayout from './AuthLayout';
import { AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string) => void;
  onSwitchToRegister: () => void;
}

export default function LoginPage({ onLogin, onSwitchToRegister }: LoginPageProps) {
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

    // Real login logic using localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const isAdmin = normalizedEmail === '890305@wty.com';
    
    if (!isAdmin && !registeredUsers.includes(normalizedEmail)) {
      setError('This email is not registered. Please register first.');
      return;
    }

    // Ensure user is in backend store
    fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail })
    }).catch(err => console.error('Backend ping failed:', err));

    onLogin(normalizedEmail);
  };

  return (
    <AuthLayout title="Login">
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 p-3 rounded-md text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
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

        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            defaultChecked
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
            Remember Me ?
          </label>
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-4 px-4 border border-transparent rounded-full shadow-lg text-lg font-bold text-white bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.01]"
          >
            Login
          </button>
        </div>

        <div className="text-right space-y-1 pt-4">
          <div className="text-sm text-slate-400">
            Don't have an Account ?{' '}
            <button 
              type="button"
              onClick={onSwitchToRegister}
              className="text-indigo-500 font-medium hover:underline"
            >
              Register
            </button>
          </div>
          <div className="text-sm text-slate-400">
            Forgot your password ?{' '}
            <button type="button" className="text-indigo-500 font-medium hover:underline">
              Reset Password
            </button>
          </div>
          <div className="text-sm text-slate-400">
            Didn't recieve Activation Email ?{' '}
            <button type="button" className="text-indigo-500 font-medium hover:underline">
              Resend Activation Email
            </button>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
