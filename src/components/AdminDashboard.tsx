import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Save, Users, AlertCircle } from 'lucide-react';

interface AdminDashboardProps {
  allowedEmails: string;
  onSave: (emails: string) => void;
  onNavigate: (view: any) => void;
  currentView: string;
  onLogout: () => void;
}

export default function AdminDashboard({ allowedEmails, onSave, onNavigate, currentView, onLogout }: AdminDashboardProps) {
  const [text, setText] = useState(allowedEmails);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onSave(text);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onNavigate={onNavigate} currentView={currentView} isAdmin={true} onLogout={onLogout} />
      <Header />
      
      <main className="ml-56 pt-16 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="text-indigo-500" />
              Backend Access Control
            </h1>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
            >
              <Save size={18} />
              {isSaved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Allowed Email List
              </label>
              <p className="text-sm text-slate-500 mb-4">
                Enter the email addresses that are permitted to register and log in. 
                Separate multiple emails with commas or new lines.
              </p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="example1@qq.com&#10;example2@gmail.com"
                className="w-full h-64 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono text-sm leading-relaxed"
              />
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-3">
              <AlertCircle className="text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700">
                <strong>Important:</strong> Only users with emails listed above will be able to access the platform. 
                If a user tries to register with an unlisted email, they will see a "Not Authorized" prompt.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
