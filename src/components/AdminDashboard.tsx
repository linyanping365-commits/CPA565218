import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Save, AlertCircle, Link as LinkIcon, Search, Copy, Check } from 'lucide-react';
import { ALL_OFFERS } from '../lib/offersData';

interface AdminDashboardProps {
  onNavigate: (view: any) => void;
  currentView: string;
  onLogout: () => void;
  trackingLinks: Record<number, string>;
  onSaveTrackingLinks: (links: Record<number, string>) => void;
  initialTab?: 'links';
}

export default function AdminDashboard({ 
  onNavigate, 
  currentView, 
  onLogout,
  trackingLinks,
  onSaveTrackingLinks,
  initialTab = 'links'
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'links'>(initialTab as any || 'links');
  const [localLinks, setLocalLinks] = useState(trackingLinks);
  const [isSaved, setIsSaved] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const apiUrl = `${window.location.origin}/api/offers`;
  const postbackUrl = `${window.location.origin}/api/postback?payout={payout}&status=approved`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Sync activeTab when initialTab changes
  React.useEffect(() => {
    setActiveTab(initialTab as any);
  }, [initialTab]);

  const handleSave = () => {
    onSaveTrackingLinks(localLinks);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const lowPayoutOffers = ALL_OFFERS.filter(offer => {
    const payout = parseFloat(offer.payout.replace('$', ''));
    return payout < 15;
  }).filter(offer => 
    offer.serialNumber.toString().includes(searchTerm) || 
    offer.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onNavigate={onNavigate} currentView={currentView} isAdmin={true} onLogout={onLogout} />
      <Header />
      
      <main className="ml-56 pt-16 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setActiveTab('links')}
                className={`text-2xl font-bold flex items-center gap-2 transition-colors ${activeTab === 'links' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LinkIcon className={activeTab === 'links' ? 'text-indigo-500' : 'text-slate-400'} />
                Link Management
              </button>
            </div>
            <div className="relative">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
              >
                <Save size={18} />
                Save Changes
              </button>
              
              {isSaved && (
                <div className="absolute right-0 -top-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-green-500 text-white px-4 py-2 rounded shadow-lg flex items-center gap-2 text-sm font-bold whitespace-nowrap">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Changes saved successfully!
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Tracking Links (Payout &lt; $15)</h2>
                  <p className="text-sm text-slate-500">Modify the tracking links for each individual offer ID.</p>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search ID or Title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    <th className="px-6 py-3 border-b border-gray-100">Offer ID</th>
                    <th className="px-6 py-3 border-b border-gray-100">Offer Title</th>
                    <th className="px-6 py-3 border-b border-gray-100">Payout</th>
                    <th className="px-6 py-3 border-b border-gray-100">Custom Tracking Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lowPayoutOffers.map(offer => (
                    <tr key={offer.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-indigo-600 font-bold">#{offer.serialNumber}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{offer.title}</td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600">{offer.payout}</td>
                      <td className="px-6 py-4">
                        <input 
                          type="text"
                          value={localLinks[offer.serialNumber] || ''}
                          placeholder="Enter custom link for this ID..."
                          onChange={(e) => setLocalLinks(prev => ({ ...prev, [offer.serialNumber]: e.target.value }))}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs font-mono focus:border-indigo-500 outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                  {lowPayoutOffers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                        No offers found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
