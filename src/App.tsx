import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SummaryChart from './components/SummaryChart';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import AdminDashboard from './components/AdminDashboard';
import OffersPage from './components/OffersPage';
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

function ProfileCard({ 
  gradient, 
  title, 
  email, 
  role, 
  extra, 
  isManager = false 
}: { 
  gradient: string, 
  title?: string, 
  email: string, 
  role?: string, 
  extra?: string,
  isManager?: boolean
}) {
  return (
    <div className={`rounded-xl p-8 text-white flex flex-col items-center justify-center space-y-4 bg-gradient-to-br ${gradient} shadow-lg relative overflow-hidden`}>
      <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30 backdrop-blur-sm">
        <div className="text-white/50 text-4xl font-bold">?</div>
      </div>
      
      <div className="text-center">
        {isManager && <h3 className="text-2xl font-bold mb-1">Manager</h3>}
        <div className="text-lg font-medium opacity-90">{title || email}</div>
        {role && (
          <div className="flex items-center justify-center space-x-1 mt-1">
            <User size={14} className="opacity-80" />
            <span className="text-xs font-bold uppercase tracking-wider">{role}</span>
          </div>
        )}
        {extra && (
          <div className="flex items-center justify-center space-x-1 mt-1 opacity-80">
            <span className="text-xs font-medium">🚫 {extra}</span>
          </div>
        )}
        {isManager && (
          <div className="mt-4 space-y-1">
            <div className="flex items-center justify-center space-x-2 text-sm opacity-90">
              <Mail size={14} />
              <span>verenbariel@hotmail.com</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm opacity-90">
              <MessageSquare size={14} />
              <span>live：cid.83138053aee</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Dashboard({ onNavigate, currentView, isAdmin, userEmail, onLogout }: { onNavigate: (view: any) => void, currentView: string, isAdmin: boolean, userEmail: string, onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onNavigate={onNavigate} currentView={currentView} isAdmin={isAdmin} onLogout={onLogout} />
      <Header />
      
      <main className="ml-56 pt-16 p-6">
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard 
            title="Today" 
            approved="$ 0.00" 
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
            approved="$ 0.00" 
            pending="$ 0.00" 
            gradient="from-purple-500 to-indigo-400" 
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-3">
            <SummaryChart />
          </div>

          {/* Profile Section */}
          <div className="flex flex-col space-y-6">
            <ProfileCard 
              gradient="from-blue-600 to-cyan-400" 
              email={userEmail} 
              role="publisher" 
              extra="Not Mentioned"
            />
            <ProfileCard 
              gradient="from-indigo-500 to-pink-400" 
              title="erqiang"
              email="verenbariel@hotmail.com"
              isManager={true}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<'login' | 'register' | 'dashboard' | 'admin' | 'all-offers'>('login');
  const [allowedEmails, setAllowedEmails] = useState('2573838961@qq.com, 565218@qq.com');
  const [userEmail, setUserEmail] = useState('');

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
        allowedEmails={allowedEmails}
      />
    );
  }

  if (view === 'register') {
    return (
      <RegisterPage 
        onSwitchToLogin={() => setView('login')} 
        allowedEmails={allowedEmails}
      />
    );
  }

  if (view === 'admin') {
    return (
      <AdminDashboard 
        allowedEmails={allowedEmails} 
        onSave={(emails) => setAllowedEmails(emails)} 
        onNavigate={(v) => setView(v)}
        currentView={view}
        onLogout={handleLogout}
      />
    );
  }

  if (view === 'all-offers') {
    return (
      <OffersPage 
        onNavigate={setView} 
        currentView={view} 
        isAdmin={isAdmin} 
        onLogout={handleLogout} 
      />
    );
  }

  return <Dashboard onNavigate={(v) => setView(v)} currentView={view} isAdmin={isAdmin} userEmail={userEmail} onLogout={handleLogout} />;
}
