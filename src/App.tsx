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

function Dashboard({ onNavigate, currentView, isAdmin, userEmail, onLogout, balance, withdrawals, clicks }: { onNavigate: (view: any) => void, currentView: string, isAdmin: boolean, userEmail: string, onLogout: () => void, balance: number, withdrawals: any[], clicks: any[] }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onNavigate={onNavigate} currentView={currentView} isAdmin={isAdmin} onLogout={onLogout} />
      <Header />
      
      <main className="ml-56 pt-16 p-6">
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard 
            title="Today" 
            approved={`$ ${clicks.filter(c => c.timestamp.startsWith(new Date().toISOString().split('T')[0])).reduce((acc, c) => acc + parseFloat(c.payout), 0).toFixed(2)}`}
            pending="$ 0.00" 
            gradient="from-blue-500 to-cyan-400" 
          />
          <StatCard 
            title="Yesterday" 
            approved="$ 0.00" 
            pending="$ 0.00" 
            gradient="from-indigo-500 to-blue-400" 
          />
          <StatCard 
            title="Month" 
            approved={`$ ${clicks.reduce((acc, c) => acc + parseFloat(c.payout), 0).toFixed(2)}`}
            pending="$ 0.00" 
            gradient="from-purple-500 to-indigo-400" 
          />
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div className={`h-10 flex items-center justify-center text-white font-bold text-sm bg-gradient-to-r from-green-500 to-emerald-400`}>
              Balance
            </div>
            <div className="p-4 text-center">
              <div className="text-gray-400 text-[10px] uppercase mb-1">Withdrawable</div>
              <div className="text-green-600 font-bold text-lg">$ {balance.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Chart & Task Activity */}
          <div className="space-y-6">
            <SummaryChart />
            
            {/* Recent Task Activity Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Recent Task Activity</h3>
                <button 
                  onClick={() => onNavigate('clicks')}
                  className="text-xs text-indigo-600 font-bold hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Time</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Task</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Payout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {clicks.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-xs">
                          No recent activity
                        </td>
                      </tr>
                    ) : (
                      clicks.slice(0, 5).map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-4 py-3 text-[10px] text-slate-500 font-mono">
                            {c.timestamp.split(' ')[1]}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600 truncate max-w-[150px]">
                            {c.taskInfo || 'External Task'}
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-green-600">
                            +${parseFloat(c.payout).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Recent Withdrawals */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Recent Withdrawals</h3>
                <button 
                  onClick={() => onNavigate('bell')}
                  className="text-xs text-indigo-600 font-bold hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Date</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Amount</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {withdrawals.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-xs">
                          No recent withdrawals
                        </td>
                      </tr>
                    ) : (
                      withdrawals.slice(0, 5).map((w) => (
                        <tr key={w.id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-4 py-3 text-xs text-slate-600">
                            {formatPanelDate(w.date)}
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-slate-800">
                            $ {w.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              w.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                              w.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-100' :
                              'bg-red-50 text-red-700 border-red-100'
                            }`}>
                              {w.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
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
  const [balance, setBalance] = useState(0); // Initial mock balance
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [clicks, setClicks] = useState<any[]>([]);

  // Poll for balance and clicks updates from server
  useEffect(() => {
    if (!userEmail) return;

    const fetchData = async () => {
      try {
        // Fetch balance
        const balanceRes = await fetch(`/api/balance?email=${encodeURIComponent(userEmail)}`);
        const balanceData = await balanceRes.json();
        if (balanceData && typeof balanceData.balance === 'number') {
          setBalance(balanceData.balance);
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
  }, []);
  const [trackingLinks, setTrackingLinks] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem('trackingLinks');
    return saved ? JSON.parse(saved) : {};
  });

  const handleSaveTrackingLinks = (links: Record<number, string>) => {
    setTrackingLinks(links);
    localStorage.setItem('trackingLinks', JSON.stringify(links));
  };

  const isAdmin = userEmail === '565218@qq.com';

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
        onLogout={handleLogout} 
        balance={balance}
        onUpdateBalance={setBalance}
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

  return <Dashboard onNavigate={(v) => setView(v)} currentView={view} isAdmin={isAdmin} userEmail={userEmail} onLogout={handleLogout} balance={balance} withdrawals={withdrawals} clicks={clicks} />;
}
