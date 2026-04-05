import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface SettingsPageProps {
  onNavigate: (view: any) => void;
  currentView: string;
  isAdmin: boolean;
  userEmail: string;
  onLogout: () => void;
}

export default function SettingsPage({ onNavigate, currentView, isAdmin, userEmail, onLogout }: SettingsPageProps) {
  const [email, setEmail] = useState(userEmail);
  const [fullName, setFullName] = useState(userEmail);
  const [companyName, setCompanyName] = useState('');
  const [skype, setSkype] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA]">
      <Sidebar onNavigate={onNavigate} currentView={currentView} isAdmin={isAdmin} onLogout={onLogout} />
      <Header />
      
      <main className="ml-56 pt-16 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10 min-h-[500px]">
            <h1 className="text-[#2EB0C9] text-2xl font-medium mb-10">Profile Settings</h1>
            
            <div className="max-w-4xl space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm text-slate-600">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-slate-600 focus:border-[#2EB0C9] outline-none transition-colors text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-slate-600">Full Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-slate-600 focus:border-[#2EB0C9] outline-none transition-colors text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-slate-600">Company Name</label>
                <input 
                  type="text" 
                  placeholder="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-slate-400 placeholder:text-slate-400 focus:border-[#2EB0C9] outline-none transition-colors text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-slate-600">Skype</label>
                <input 
                  type="text" 
                  placeholder="Skype"
                  value={skype}
                  onChange={(e) => setSkype(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-slate-400 placeholder:text-slate-400 focus:border-[#2EB0C9] outline-none transition-colors text-sm"
                />
              </div>

              <div className="pt-8 relative">
                <button 
                  onClick={handleSave}
                  className="bg-[#6366F1] hover:bg-[#5558E3] text-white px-8 py-2.5 rounded font-medium transition-colors shadow-sm min-w-[100px]"
                >
                  Save
                </button>

                {isSaved && (
                  <div className="absolute left-0 -top-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-green-500 text-white px-4 py-2 rounded shadow-lg flex items-center gap-2 text-sm font-bold">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Profile updated successfully!
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
