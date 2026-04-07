import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Save, AlertCircle, Link as LinkIcon, Search, Copy, Check, Users, Edit2, Trash2, Clock } from 'lucide-react';
import { ALL_OFFERS } from '../lib/offersData';

interface AdminDashboardProps {
  onNavigate: (view: any) => void;
  currentView: string;
  onLogout: () => void;
  userEmail: string;
  trackingLinks: Record<number, string>;
  onSaveTrackingLinks: (links: Record<number, string>) => void;
  initialTab?: 'links' | 'users';
}

export default function AdminDashboard({ 
  onNavigate, 
  currentView, 
  onLogout,
  userEmail,
  trackingLinks,
  onSaveTrackingLinks,
  initialTab = 'links'
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'links' | 'users'>(initialTab as any || 'links');
  const [localLinks, setLocalLinks] = useState(trackingLinks);
  const [isSaved, setIsSaved] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [simulating, setSimulating] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  
  // User Management States
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [viewingHistory, setViewingHistory] = useState<any>(null);
  const [userClicks, setUserClicks] = useState<any[]>([]);
  const [editBalance, setEditBalance] = useState<string>('0');
  const [editPendingBalance, setEditPendingBalance] = useState<string>('0');
  const [editTotalEarned, setEditTotalEarned] = useState<string>('0');
  const [editTotalWithdrawals, setEditTotalWithdrawals] = useState<string>('0');
  const [newTaskName, setNewTaskName] = useState('对应的编号记录');
  const [newTaskAmount, setNewTaskAmount] = useState('0.00');
  const [newTaskOfferId, setNewTaskOfferId] = useState('');
  const [lastProcessedOfferId, setLastProcessedOfferId] = useState<string | null>(null);

  // Auto-populate task details when Offer ID changes
  React.useEffect(() => {
    if (newTaskOfferId && newTaskOfferId !== lastProcessedOfferId) {
      const offer = ALL_OFFERS.find(o => o.serialNumber.toString() === newTaskOfferId);
      if (offer) {
        const price = parseFloat(offer.payout.replace('$', ''));
        
        if (price >= 15) {
          setNotification(`❌ Error: Offer ID #${newTaskOfferId} has a payout of $${price.toFixed(2)}. Only offers under $15 are allowed.`);
          setNewTaskOfferId('');
          setNewTaskName('对应的编号记录');
          setNewTaskAmount('0.00');
          setTimeout(() => setNotification(null), 5000);
          return;
        }

        setNewTaskName(newTaskOfferId);
        setNewTaskAmount(price.toFixed(2));
        // Add to Available Balance immediately as requested
        setEditBalance(prev => (parseFloat(prev || '0') + price).toFixed(2));
        setLastProcessedOfferId(newTaskOfferId);
      }
    }
  }, [newTaskOfferId, lastProcessedOfferId]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      console.error('Failed to fetch users:', e);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleAddNewUser = async () => {
    if (!newUserEmail.trim() || !newUserEmail.includes('@')) {
      setNotification('❌ Please enter a valid email address.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    try {
      const res = await fetch('/api/admin/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newUserEmail.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(`✅ User ${newUserEmail} added successfully.`);
        setNewUserEmail('');
        setIsAddingUser(false);
        fetchUsers();
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification(`❌ Failed to add user: ${data.error || res.statusText}`);
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (e) {
      console.error('Failed to add user:', e);
      setNotification('❌ Error adding user.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userToDelete })
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(`✅ User ${userToDelete} deleted successfully.`);
        setUserToDelete(null);
        fetchUsers();
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification(`❌ Failed to delete user: ${data.error || res.statusText}`);
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (e) {
      console.error('Failed to delete user:', e);
      setNotification('❌ Error deleting user.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      // Approved Income (Total Earned) increases by the corresponding price (newTaskAmount)
      const amountToAdd = parseFloat(newTaskAmount) || 0;
      const finalTotalEarned = parseFloat(editTotalEarned || '0') + amountToAdd;
      
      // Withdrawable (Total Withdrawals) defaults to 0 if empty
      const finalWithdrawals = editTotalWithdrawals === '' ? 0 : parseFloat(editTotalWithdrawals);

      const res = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editingUser.email,
          balance: parseFloat(editBalance || '0'),
          pendingBalance: parseFloat(editPendingBalance || '0'),
          totalEarned: finalTotalEarned,
          totalWithdrawals: finalWithdrawals,
          taskInfo: newTaskName
        })
      });
      if (res.ok) {
        setNotification(`✅ User ${editingUser.email} data updated & Clicks synced.`);
        setEditingUser(null);
        fetchUsers();
        // If the admin is also viewing this user's history, refresh it
        if (viewingHistory === editingUser.email) {
          fetchUserClicks(editingUser.email);
        }
        setTimeout(() => setNotification(null), 4000);
      } else {
        setNotification(`❌ Failed to update user: ${res.statusText}`);
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (e) {
      console.error('Failed to update user:', e);
    }
  };

  const handleAddManualTask = async () => {
    if (!editingUser) return;
    try {
      const res = await fetch('/api/task-completed', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer your_secure_token_here'
        },
        body: JSON.stringify({
          userId: editingUser.email,
          taskInfo: newTaskName,
          earnings: parseFloat(newTaskAmount),
          transactionId: `MANUAL_${Date.now()}`
        })
      });
      if (res.ok) {
        setNotification(`✅ Task completed for ${editingUser.email}! Dashboard & Clicks synced.`);
        fetchUsers();
        // Update local edit balance to reflect new total
        const updatedUserRes = await fetch('/api/admin/users');
        const updatedUsers = await updatedUserRes.json();
        const updatedUser = updatedUsers.find((u: any) => u.email === editingUser.email);
        if (updatedUser) {
          setEditBalance(updatedUser.balance.toString());
          setEditTotalEarned(updatedUser.totalEarned.toString());
          
          // If the admin is also viewing this user's history, refresh it
          if (viewingHistory === editingUser.email) {
            fetchUserClicks(editingUser.email);
          }
        }
        // Reset task fields
        setNewTaskOfferId('');
        setNewTaskName('对应的编号记录');
        setNewTaskAmount('0.00');
        setTimeout(() => setNotification(null), 4000);
      } else {
        setNotification(`❌ Failed to complete task: ${res.statusText}`);
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (e) {
      console.error('Failed to add manual task:', e);
    }
  };

  const handleSimulateSuccess = async (offer: any) => {
    setSimulating(offer.serialNumber);
    try {
      const response = await fetch('/api/task-completed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer your_secure_token_here'
        },
        body: JSON.stringify({
          userId: userEmail,
          taskInfo: `Admin Simulation: ${offer.title}`,
          earnings: parseFloat(offer.payout.replace('$', '')),
          transactionId: `SIM_${offer.serialNumber}_${Date.now()}`
        })
      });
      
      if (response.ok) {
        setNotification(`Success! $${offer.payout} added to ${userEmail}'s balance.`);
        fetchUsers(); // Refresh user data in admin panel
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification('Simulation failed. Check console for details.');
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('Simulation error:', error);
      setNotification('Simulation error occurred.');
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setSimulating(null);
    }
  };

  const fetchUserClicks = async (email: string) => {
    try {
      const res = await fetch(`/api/clicks?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setUserClicks(data);
      setViewingHistory(email);
    } catch (e) {
      console.error('Failed to fetch user clicks:', e);
    }
  };

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
              <button 
                onClick={() => setActiveTab('users')}
                className={`text-2xl font-bold flex items-center gap-2 transition-colors ${activeTab === 'users' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Users className={activeTab === 'users' ? 'text-indigo-500' : 'text-slate-400'} />
                User Management
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

          {activeTab === 'links' ? (
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
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">User Dashboard Management</h2>
                    <p className="text-sm text-slate-500">Modify balance and data for registered users.</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsAddingUser(true)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold"
                    >
                      <Users size={16} />
                      Add User
                    </button>
                    <button 
                      onClick={fetchUsers}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh List
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      <th className="px-6 py-3 border-b border-gray-100">User Email</th>
                      <th className="px-6 py-3 border-b border-gray-100">Available / Pending</th>
                      <th className="px-6 py-3 border-b border-gray-100">Total Earned</th>
                      <th className="px-6 py-3 border-b border-gray-100">Tasks</th>
                      <th className="px-6 py-3 border-b border-gray-100">Last Activity</th>
                      <th className="px-6 py-3 border-b border-gray-100">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoadingUsers ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex items-center justify-center gap-2 text-indigo-600">
                            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm font-medium">Fetching users...</span>
                          </div>
                        </td>
                      </tr>
                    ) : Array.isArray(users) && users.length > 0 ? (
                      users.map(user => (
                        <tr key={user.email} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                {user.email?.[0]?.toUpperCase() || '?'}
                              </div>
                              <span className="text-sm font-medium text-slate-700">{user.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-800">${(user.balance || 0).toFixed(2)}</span>
                              <span className="text-[10px] text-amber-600 font-medium">Pending: ${(user.pendingBalance || 0).toFixed(2)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-green-600">${(user.totalEarned || 0).toFixed(2)}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">{user.clicksCount || 0}</td>
                          <td className="px-6 py-4 text-xs text-slate-400 font-mono">{user.lastActivity || 'Never'}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              <button 
                                onClick={() => {
                                  setEditingUser(user);
                                  setEditBalance((user.balance || 0).toString());
                                  setEditPendingBalance((user.pendingBalance || 0).toString());
                                  setEditTotalEarned((user.totalEarned || 0).toString());
                                  setEditTotalWithdrawals((user.totalWithdrawals || 0).toString());
                                  // Reset task fields for new edit session
                                  setNewTaskOfferId('');
                                  setNewTaskAmount('0.00');
                                  setNewTaskName('对应的编号记录');
                                  setLastProcessedOfferId(null);
                                }}
                                className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-xs font-bold"
                              >
                                <Edit2 size={14} /> Edit Data
                              </button>
                              <button 
                                onClick={() => fetchUserClicks(user.email)}
                                className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-xs font-bold"
                              >
                                <Clock size={14} /> View History
                              </button>
                              <button 
                                onClick={() => setUserToDelete(user.email)}
                                className="text-red-500 hover:text-red-700 flex items-center gap-1 text-xs font-bold"
                              >
                                <Trash2 size={14} /> Delete User
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                          No users found. Users appear here after they log in once.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add User Modal */}
      {isAddingUser && (
        <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-slate-800">Add New User</h3>
              <button onClick={() => setIsAddingUser(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">User Email</label>
                <input 
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => setIsAddingUser(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-500 hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddNewUser}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow-md"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-red-50">
              <h3 className="font-bold text-red-800 flex items-center gap-2">
                <AlertCircle size={18} />
                Confirm Deletion
              </h3>
              <button onClick={() => setUserToDelete(null)} className="text-red-400 hover:text-red-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600">
                Are you sure you want to delete the user <strong className="text-slate-800">{userToDelete}</strong>? 
                This action cannot be undone and all their data will be lost.
              </p>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => setUserToDelete(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-500 hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteUser}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-slate-800">Edit User: {editingUser.email}</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Virtual Balance Settings</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Available Balance ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={editBalance}
                      onChange={(e) => setEditBalance(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-indigo-500 font-bold text-slate-800 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Pending Balance ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={editPendingBalance}
                      onChange={(e) => setEditPendingBalance(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-indigo-500 font-bold text-slate-800 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Total Earned ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={editTotalEarned}
                      onChange={(e) => setEditTotalEarned(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-indigo-500 font-bold text-slate-800 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Total Withdrawals ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={editTotalWithdrawals}
                      onChange={(e) => setEditTotalWithdrawals(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-indigo-500 font-bold text-slate-800 text-sm"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 italic">* These values will be reflected directly on the user's dashboard.</p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Add Virtual Task (Incremental)</label>
                <div className="grid grid-cols-12 gap-3 mb-3">
                  <div className="col-span-3">
                    <label className="block text-[10px] text-gray-400 mb-1">Offer ID (编号)</label>
                    <input 
                      type="text"
                      value={newTaskOfferId}
                      onChange={(e) => setNewTaskOfferId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded text-sm outline-none focus:border-indigo-500"
                      placeholder="e.g. 1001"
                    />
                  </div>
                  <div className="col-span-6">
                    <label className="block text-[10px] text-gray-400 mb-1">Task Name</label>
                    <input 
                      type="text"
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-[10px] text-gray-400 mb-1">Amount ($)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={newTaskAmount}
                      onChange={(e) => setNewTaskAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleAddManualTask}
                  className="w-full py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={14} /> + Complete Task & Add to History
                </button>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => setEditingUser(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-500 hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateUser}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-md"
              >
                Update Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View History Modal */}
      {viewingHistory && (
        <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-slate-800">Sync History: {viewingHistory}</h3>
              <button onClick={() => setViewingHistory(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-0 max-h-[60vh] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    <th className="px-6 py-3 border-b border-gray-100">Task</th>
                    <th className="px-6 py-3 border-b border-gray-100">Payout</th>
                    <th className="px-6 py-3 border-b border-gray-100">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {userClicks.length > 0 ? (
                    userClicks.map((click, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs font-medium text-slate-700">{click.taskInfo || 'External Task'}</td>
                        <td className="px-6 py-4 text-xs font-bold text-green-600">+${parseFloat(click.payout).toFixed(2)}</td>
                        <td className="px-6 py-4 text-[10px] text-slate-400 font-mono">{click.timestamp}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-gray-400 italic text-sm">
                        No history found for this user.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setViewingHistory(null)}
                className="px-6 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-900 transition-colors shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-8 right-8 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-2xl z-[100] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm font-medium">{notification}</span>
          <button onClick={() => setNotification(null)} className="ml-2 hover:text-gray-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
