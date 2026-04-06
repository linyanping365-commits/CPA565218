import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SummaryChart from './components/SummaryChart';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import AdminDashboard from './components/AdminDashboard';
import OffersPage from './components/OffersPage';
import SettingsPage from './components/SettingsPage';
import WalletPage from './components/WalletPage';
import NotificationsPage from './components/NotificationsPage';
import ClicksPage from './components/ClicksPage';
import { formatPanelDate } from './lib/dateUtils';
import { User, Mail, MessageSquare } from 'lucide-react';

function StatCard({ title, approved, pending, gradient }: { title: string, approved: string, pending: string, gradient: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
      <div className={`h-10 flex items-center justify-center text-white font-bold text-sm bg-gradient-to-r ${gradient}`}>
        {title}
      </div>
      <div className="grid grid-cols-2 divide-x divide-gray-100">
        <div className="p-4 text-center">
          <div className="text-gray-400 text-[10px] uppercase mb-1">Approved Income</div>
          <div className="text-gray-500 font-medium text-sm">{approved}</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-gray-400 text-[10px] uppercase mb-1">Pending Income</div>
          <div className="text-gray-500 font-medium text-sm">{pending}</div>
        </div>
      </div>
    </div>
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
            approved={`$ ${clicks.filter(c => c.timestamp.startsWith(new Date().toISOString().split('T')[0]) && c.type !== 'Withdrawal').reduce((acc, c) => acc + parseFloat(c.payout), 0).toFixed(2)}`}
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

interface Withdrawal {
  id: string;
  amount: number;
  paypalEmail: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export default function App() {
  const [view, setView] = useState<'login' | 'register' | 'dashboard' | 'admin' | 'all-offers' | 'link-management' | 'settings' | 'wallet' | 'bell' | 'clicks'>('login');
  const [userEmail, setUserEmail] = useState('');
  const [balanceData, setBalanceData] = useState({
    balance: 0,
    pendingBalance: 0,
    totalEarned: 0,
    totalWithdrawals: 0
  });
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [clicks, setClicks] = useState<any[]>([]);

  // Poll for balance and clicks updates from server
  useEffect(() => {
    if (!userEmail) return;

    const fetchData = async () => {
      try {
        // Fetch balance
        const balanceRes = await fetch(`/api/balance?email=${encodeURIComponent(userEmail)}`);
        const data = await balanceRes.json();
        if (data && typeof data.balance === 'number') {
          setBalanceData({
            balance: data.balance,
            pendingBalance: data.pendingBalance || 0,
            totalEarned: data.totalEarned || 0,
            totalWithdrawals: data.totalWithdrawals || 0
          });
        }

        // Fetch clicks
        const clicksRes = await fetch(`/api/clicks?email=${encodeURIComponent(userEmail)}`);
        const clicksData = await clicksRes.json();
        if (Array.isArray(clicksData)) {
          setClicks(clicksData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [userEmail]);
  const [trackingLinks, setTrackingLinks] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem('trackingLinks');
    return saved ? JSON.parse(saved) : {};
  });

  const handleSaveTrackingLinks = (links: Record<number, string>) => {
    setTrackingLinks(links);
    localStorage.setItem('trackingLinks', JSON.stringify(links));
  };

  const isAdmin = userEmail === '890305@wty.com';

  const handleLogout = () => {
    setUserEmail('');
    setView('login');
  };

  if (view === 'login') {
    return (
      <LoginPage 
        onLogin={(email) => {
          setUserEmail(email);
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
        initialTab={view === 'link-management' ? 'links' : 'links'}
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
        balance={balanceData.balance}
        onUpdateBalance={(newBalance) => setBalanceData(prev => ({ ...prev, balance: newBalance }))}
        onAddWithdrawal={(w) => setWithdrawals([w, ...withdrawals])}
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

  return <Dashboard onNavigate={(v) => setView(v)} currentView={view} isAdmin={isAdmin} userEmail={userEmail} onLogout={handleLogout} balanceData={balanceData} withdrawals={withdrawals} clicks={clicks} />;
}
