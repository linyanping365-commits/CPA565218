import React, { useState } from 'react';
import { Mail, Lock, Globe, Zap, ShieldCheck, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, role: string) => void;
  onSwitchToRegister: () => void;
}

export default function LoginPage({ onLogin, onSwitchToRegister }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        onLogin(data.email, data.role);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Left Side - Blue Gradient */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 font-bold text-2xl">D</div>
            <span className="text-2xl font-bold text-white">dealeraff</span>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">Scale Your<br/>Performance<br/>With Precision.</h1>
          <p className="text-blue-100 text-lg mb-16 max-w-md leading-relaxed">
            Join the world's most advanced CPA network. Real-time tracking, exclusive offers, and dedicated support.
          </p>
          
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                <Globe className="w-6 h-6 text-blue-200" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1">Global Reach</h3>
                <p className="text-blue-200 text-sm">Access offers across 150+ countries.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                <Zap className="w-6 h-6 text-blue-200" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1">Instant Tracking</h3>
                <p className="text-blue-200 text-sm">Zero-latency conversion reporting.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                <ShieldCheck className="w-6 h-6 text-blue-200" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1">Secure Payments</h3>
                <p className="text-blue-200 text-sm">Weekly payouts via multiple methods.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 mt-12 text-sm text-blue-300">
          © 2026 Dealeraff Network. All rights reserved.
        </div>
      </div>

      {/* Right Side - Dark Form */}
      <div className="w-full lg:w-1/2 bg-[#1e293b] flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">Welcome Back</h2>
            <p className="text-slate-400">Enter your credentials to access your dashboard.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors sm:text-sm"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Forgot Password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors sm:text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1e293b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-slate-400">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-blue-400 font-medium hover:text-blue-300 transition-colors"
              >
                Sign Up Now
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

