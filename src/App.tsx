import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatCard from './components/StatCard';
import SummaryChart from './components/SummaryChart';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import AdminDashboard from './components/AdminDashboard';
import OffersPage from './components/OffersPage';
import SettingsPage from './components/SettingsPage';
import WalletPage from './components/WalletPage';
import NotificationsPage from './components/NotificationsPage';
import ClicksPage from './components/ClicksPage';

interface Withdrawal {
  id: string;
  amount: number;
  paypalEmail: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export default function App() {
  const [view, setView] = useState<'login' | 'register' | 'dashboard' | 'admin' | 'all-offers' | 'link-management' | 'settings' | 'wallet' | 'bell' | 'clicks'>('login');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
  const [balanceData, setBalanceData] = useState({
    balance: 0,
    pendingBalance: 0,
    totalEarned: 0,
    totalWithdrawals: 0
  });
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [clicks, setClicks] = useState<any[]>([]);

  useEffect(() => {
    if (userEmail) {
      setView('dashboard');
      fetchUserData();
    }
  }, [userEmail]);

  const fetchUserData = async () => {
    if (!userEmail) return;
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userEmail)}`);
      if (res.ok) {
        const data = await res.json();
        setBalanceData({
          balance: data.balance || 0,
          pendingBalance: data.pendingBalance || 0,
          totalEarned: data.totalEarned || 0,
          totalWithdrawals: data.totalWithdrawals || 0
        });
        setWithdrawals(data.withdrawals || []);
        setClicks(data.clicks || []);
        setIsAdmin(data.role === 'admin');
        localStorage.setItem('isAdmin', data.role === 'admin' ? 'true' : 'false');
      }
    } catch (e) {
      console.error('Failed to fetch user data', e);
    }
  };

  // Poll for pending webhook tasks
  useEffect(() => {
    if (!userEmail) return;

    const pollPendingTasks = async () => {
      try {
        const res = await fetch(`/api/pending-tasks?email=${encodeURIComponent(userEmail)}`);
        const tasks = await res.json();
        
        if (tasks && tasks.length > 0) {
          // We have pending tasks! Update via API
          let newBalance = balanceData.balance;
          let newTotalEarned = balanceData.totalEarned;
          let newClicks = [...clicks];
          
          for (const task of tasks) {
            newBalance += task.amount;
            newTotalEarned += task.amount;
            newClicks.unshift({
              offerId: task.id,
              amount: task.amount,
              timestamp: task.timestamp,
              taskInfo: task.taskInfo,
              type: 'Webhook'
            });
          }
          
          if (newClicks.length > 100) newClicks = newClicks.slice(0, 100);

          await fetch(`/api/admin/users/${encodeURIComponent(userEmail)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              balance: newBalance,
              totalEarned: newTotalEarned,
              clicks: newClicks
            })
          });

          // Mark as synced
          await fetch('/api/mark-tasks-synced', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: userEmail,
              taskIds: tasks.map((t: any) => t.id)
            })
          });

          fetchUserData();
        }
      } catch (e) {
        console.error('Failed to poll pending tasks:', e);
      }
    };

    const interval = setInterval(pollPendingTasks, 5000);
    return () => clearInterval(interval);
  }, [userEmail, balanceData, clicks]);

  const [trackingLinks, setTrackingLinks] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem('trackingLinks');
    return saved ? JSON.parse(saved) : {};
  });

  const handleSaveTrackingLinks = (links: Record<number, string>) => {
    setTrackingLinks(links);
    localStorage.setItem('trackingLinks', JSON.stringify(links));
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isAdmin');
    setUserEmail('');
    setIsAdmin(false);
    setView('login');
  };

  if (view === 'login') {
    return (
      <LoginPage 
        onLogin={(email, role) => {
          setUserEmail(email);
          setIsAdmin(role === 'admin');
          localStorage.setItem('userEmail', email);
          localStorage.setItem('isAdmin', role === 'admin' ? 'true' : 'false');
          setView('dashboard');
        }} 
        onSwitchToRegister={() => setView('register')} 
      />
    );
  }

  if (view === 'register') {
    return (
      <RegisterPage 
        onSwitchToLogin={() => setView('login')} 
      />
    );
  }

  if (view === 'admin' || view === 'link-management') {
    return (
      <AdminDashboard 
        onNavigate={(v) => setView(v)}
        currentView={view}
        onLogout={handleLogout}
        userEmail={userEmail}
        trackingLinks={trackingLinks}
        onSaveTrackingLinks={handleSaveTrackingLinks}
        initialTab={view === 'admin' ? 'users' : 'links'}
      />
    );
  }

  if (view === 'all-offers') {
    return (
      <OffersPage 
        onNavigate={setView} 
        currentView={view} 
        isAdmin={isAdmin} 
        userEmail={userEmail}
        onLogout={handleLogout} 
        trackingLinks={trackingLinks}
      />
    );
  }

  if (view === 'settings') {
    return (
      <SettingsPage 
        onNavigate={setView} 
        currentView={view} 
        isAdmin={isAdmin} 
        userEmail={userEmail}
        onLogout={handleLogout} 
      />
    );
  }

  if (view === 'wallet') {
    return (
      <WalletPage 
        onNavigate={setView} 
        currentView={view} 
        isAdmin={isAdmin} 
        userEmail={userEmail}
        onLogout={handleLogout} 
      />
    );
  }

  if (view === 'bell') {
    return (
      <NotificationsPage 
        onNavigate={setView} 
        currentView={view} 
        isAdmin={isAdmin} 
        onLogout={handleLogout} 
        withdrawals={withdrawals}
      />
    );
  }

  if (view === 'clicks') {
    return (
      <ClicksPage 
        onNavigate={setView} 
        currentView={view} 
        isAdmin={isAdmin} 
        onLogout={handleLogout} 
        clicks={clicks}
      />
    );
  }

  return (
    <Dashboard 
      onNavigate={setView} 
      currentView={view} 
      isAdmin={isAdmin} 
      userEmail={userEmail}
      onLogout={handleLogout} 
      balanceData={balanceData}
      withdrawals={withdrawals}
      clicks={clicks}
    />
  );
}

function Dashboard({ onNavigate, currentView, isAdmin, userEmail, onLogout, balanceData, withdrawals, clicks }: { onNavigate: (view: any) => void, currentView: string, isAdmin: boolean, userEmail: string, onLogout: () => void, balanceData: any, withdrawals: any[], clicks: any[] }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onNavigate={onNavigate} currentView={currentView} isAdmin={isAdmin} onLogout={onLogout} />
      <Header />
      
      <main className="ml-56 pt-16 p-6">
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard 
            title="Total Earned" 
            approved={`$ ${balanceData.totalEarned.toFixed(2)}`}
            pending={`$ ${balanceData.pendingBalance.toFixed(2)}`} 
            gradient="from-blue-500 to-cyan-400" 
          />
          <StatCard 
            title="Today" 
            approved={`$ ${clicks.filter(c => c.timestamp && c.timestamp.startsWith(new Date().toISOString().split('T')[0]) && c.type !== 'Withdrawal').reduce((acc, c) => acc + parseFloat(c.amount || c.payout || 0), 0).toFixed(2)}`}
            pending="$ 0.00" 
            gradient="from-purple-500 to-indigo-400" 
          />
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div className={`h-10 flex items-center justify-center text-white font-bold text-sm bg-gradient-to-r from-green-500 to-emerald-400`}>
              Balance
            </div>
            <div className="p-4 text-center">
              <div className="text-gray-400 text-[10px] uppercase mb-1">Withdrawable</div>
              <div className="text-green-600 font-bold text-lg">$ {balanceData.balance.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Left Column: Chart */}
          <div className="space-y-6">
            <SummaryChart clicks={clicks} />
          </div>
        </div>
      </main>
    </div>
  );
}
