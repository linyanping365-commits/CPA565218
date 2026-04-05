import { Home, Settings, Wallet, Settings2, Bell, LogOut, Tag, Link as LinkIcon, Database, MousePointerClick } from 'lucide-react';

interface SidebarProps {
  onNavigate: (view: any) => void;
  currentView: string;
  onLogout: () => void;
}

export default function Sidebar({ onNavigate, currentView, isAdmin, onLogout }: SidebarProps & { isAdmin?: boolean }) {
  const menuItems = [
    { icon: Home, id: 'dashboard', label: 'Dashboard' },
    { icon: Tag, id: 'all-offers', label: 'All Offers' },
    { icon: MousePointerClick, id: 'clicks', label: 'Clicks' },
    { icon: Settings, id: 'settings', label: 'Settings' },
    { icon: Wallet, id: 'wallet', label: 'Wallet' },
    ...(isAdmin ? [
      { icon: Settings2, id: 'admin', label: 'Admin' },
      { icon: LinkIcon, id: 'link-management', label: 'Link Management' },
      { icon: Database, id: 'api-access', label: 'API Access' }
    ] : []),
    { icon: Bell, id: 'bell', label: 'Notifications' },
  ];

  return (
    <div className="w-56 bg-gray-900 h-screen flex flex-col py-4 fixed left-0 top-0 z-50">
      <div className="text-white font-bold text-lg px-6 mb-8 tracking-tight">dealeraff</div>
      
      <div className="flex-1 flex flex-col space-y-1 px-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
              currentView === item.id 
                ? 'text-white bg-indigo-600 shadow-lg shadow-indigo-500/20' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <item.icon size={18} className={currentView === item.id ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="px-3 mt-auto">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 mb-4 group"
          title="Logout"
        >
          <LogOut size={18} className="text-gray-400 group-hover:text-red-400" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
