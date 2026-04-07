import React, { useState, useEffect } from 'react';
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
  useEffect(() => {
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
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
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
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newUserEmail.trim(), password: 'password123' })
      });
      if (res.ok) {
        setNotification(`✅ User ${newUserEmail} added successfully.`);
        setNewUserEmail('');
        setIsAddingUser(false);
        fetchUsers();
      } else {
        const data = await res.json();
        setNotification(`❌ ${data.error || 'Error adding user.'}`);
      }
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error('Failed to add user:', e);
      setNotification('❌ Error adding user.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userToDelete)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setNotification(`✅ User ${userToDelete} deleted successfully.`);
        setUserToDelete(null);
        fetchUsers();
      } else {
        setNotification('❌ Error deleting user.');
      }
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error('Failed to delete user:', e);
      setNotification('❌ Error deleting user.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  useEffect(() => {
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

      const res = await fetch(`/api/admin/users/${encodeURIComponent(editingUser.email)}`);
      if (res.ok) {
        const userData = await res.json();
        let newClicks = [...(userData.clicks || [])];
        
        if (amountToAdd > 0) {
          newClicks.unshift({
            offerId: `MANUAL_${Date.now()}`,
            amount: amountToAdd,
            timestamp: new Date().toISOString(),
            taskInfo: newTaskName,
            type: 'Manual'
          });
          if (newClicks.length > 100) newClicks = newClicks.slice(0, 100);
        }

        const updateRes = await fetch(`/api/admin/users/${encodeURIComponent(editingUser.email)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            balance: parseFloat(editBalance || '0'),
            pendingBalance: parseFloat(editPendingBalance || '0'),
            totalEarned: finalTotalEarned,
            totalWithdrawals: finalWithdrawals,
            clicks: newClicks
          })
        });

        if (updateRes.ok) {
          setNotification(`✅ User ${editingUser.email} data updated & Clicks synced.`);
          setEditingUser(null);
          fetchUsers();
          // If the admin is also viewing this user's history, refresh it
          if (viewingHistory === editingUser.email) {
            fetchUserClicks(editingUser.email);
          }
          setTimeout(() => setNotification(null), 4000);
        }
      }
    } catch (e) {
      console.error('Failed to update user:', e);
    }
  };

  const handleAddManualTask = async () => {
    if (!editingUser) return;
    try {
      const amountToAdd = parseFloat(newTaskAmount) || 0;
      const res = await fetch(`/api/admin/users/${encodeURIComponent(editingUser.email)}`);

      if (res.ok) {
        const userData = await res.json();
        let newClicks = [...(userData.clicks || [])];
        
        newClicks.unshift({
          offerId: `MANUAL_${Date.now()}`,
          amount: amountToAdd,
          timestamp: new Date().toISOString(),
          taskInfo: newTaskName,
          type: 'Manual'
        });
        if (newClicks.length > 100) newClicks = newClicks.slice(0, 100);

        const newBalance = (userData.balance || 0) + amountToAdd;
        const newTotalEarned = (userData.totalEarned || 0) + amountToAdd;

        const updateRes = await fetch(`/api/admin/users/${encodeURIComponent(editingUser.email)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            balance: newBalance,
            totalEarned: newTotalEarned,
            clicks: newClicks
          })
        });

        if (updateRes.ok) {
          setNotification(`✅ Task completed for ${editingUser.email}! Dashboard & Clicks synced.`);
          fetchUsers();
          
          setEditBalance(newBalance.toString());
          setEditTotalEarned(newTotalEarned.toString());
          
          if (viewingHistory === editingUser.email) {
            fetchUserClicks(editingUser.email);
          }
          
          setNewTaskOfferId('');
          setNewTaskName('对应的编号记录');
          setNewTaskAmount('0.00');
          setTimeout(() => setNotification(null), 4000);
        }
      }
    } catch (e) {
      console.error('Failed to add manual task:', e);
      setNotification(`❌ Failed to complete task`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleSimulateSuccess = async (offer: any) => {
    setSimulating(offer.serialNumber);
    try {
      const amountToAdd = parseFloat(offer.payout.replace('$', '')) || 0;
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userEmail)}`);

      if (res.ok) {
        const userData = await res.json();
        let newClicks = [...(userData.clicks || [])];
        
        newClicks.unshift({
          offerId: `SIM_${offer.serialNumber}_${Date.now()}`,
          amount: amountToAdd,
          timestamp: new Date().toISOString(),
          taskInfo: `Admin Simulation: ${offer.title}`,
          type: 'Simulation'
        });
        if (newClicks.length > 100) newClicks = newClicks.slice(0, 100);

        const newBalance = (userData.balance || 0) + amountToAdd;
        const newTotalEarned = (userData.totalEarned || 0) + amountToAdd;

        const updateRes = await fetch(`/api/admin/users/${encodeURIComponent(userEmail)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            balance: newBalance,
            totalEarned: newTotalEarned,
            clicks: newClicks
          })
        });

        if (updateRes.ok) {
          setNotification(`Success! $${offer.payout} added to ${userEmail}'s balance.`);
          fetchUsers(); // Refresh user data in admin panel
          setTimeout(() => setNotification(null), 3000);
        }
      } else {
        setNotification('Simulation failed. User not found.');
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
      const res = await fetch(`/api/admin/users/${encodeURIComponent(email)}`);
      if (res.ok) {
        const userData = await res.json();
        setUserClicks(userData.clicks || []);
        setViewingHistory(email);
      }
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
  useEffect(() => {
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
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">ID</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-64">Offer Details</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Payout</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tracking Link</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lowPayoutOffers.map((offer) => (
                      <tr key={offer.serialNumber} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-sm">
                            #{offer.serialNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                              {offer.title.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 line-clamp-1">{offer.title}</div>
                              <div className="text-xs text-gray-500">Network</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                            {offer.payout}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative flex items-center">
                            <LinkIcon className="absolute left-3 text-gray-400" size={14} />
                            <input
                              type="text"
                              value={localLinks[offer.serialNumber] || ''}
                              onChange={(e) => setLocalLinks({
                                ...localLinks,
                                [offer.serialNumber]: e.target.value
                              })}
                              placeholder="https://..."
                              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const url = localLinks[offer.serialNumber];
                                if (url) handleCopy(url);
                              }}
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Copy Link"
                            >
                              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                            </button>
                            <button
                              onClick={() => handleSimulateSuccess(offer)}
                              disabled={simulating === offer.serialNumber}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Simulate Success"
                            >
                              {simulating === offer.serialNumber ? (
                                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Check size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {lowPayoutOffers.length === 0 && (
                  <div className="p-12 text-center text-gray-500">
                    No offers found matching your search.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Add User Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Add New User</h2>
                    <p className="text-sm text-slate-500">Create a new user account manually.</p>
                  </div>
                  <button
                    onClick={() => setIsAddingUser(!isAddingUser)}
                    className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                  >
                    {isAddingUser ? 'Cancel' : '+ Add User'}
                  </button>
                </div>

                {isAddingUser && (
                  <div className="flex items-center gap-4 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <input
                      type="email"
                      placeholder="user@example.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={handleAddNewUser}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Create Account
                    </button>
                  </div>
                )}
              </div>

              {/* Users List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-lg font-bold text-slate-800">Registered Users</h2>
                  <p className="text-sm text-slate-500">Manage user accounts and balances.</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Balance</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Earned</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {isLoadingUsers ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                              Loading users...
                            </div>
                          </td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            No users found.
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.email} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">{user.email}</div>
                              <div className="text-xs text-gray-500">Joined: {new Date(user.createdAt || Date.now()).toLocaleDateString()}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                user.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                              }`}>
                                {user.role || 'user'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-green-600 font-medium">${(user.balance || 0).toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-gray-900">${(user.totalEarned || 0).toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingUser(user);
                                    setEditBalance((user.balance || 0).toString());
                                    setEditPendingBalance((user.pendingBalance || 0).toString());
                                    setEditTotalEarned((user.totalEarned || 0).toString());
                                    setEditTotalWithdrawals((user.totalWithdrawals || 0).toString());
                                    setNewTaskName('对应的编号记录');
                                    setNewTaskAmount('0.00');
                                    setNewTaskOfferId('');
                                  }}
                                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title="Edit User"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => fetchUserClicks(user.email)}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View History"
                                >
                                  <Clock size={16} />
                                </button>
                                <button
                                  onClick={() => setUserToDelete(user.email)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete User"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
              <p className="text-sm text-gray-500">{editingUser.email}</p>
            </div>
            <div className="p-6 space-y-4">
              {/* Task Completion Section */}
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mb-6">
                <h4 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                  <Check size={16} />
                  Add Manual Task
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-indigo-700 mb-1">Offer ID (Auto-fills details)</label>
                    <input
                      type="text"
                      value={newTaskOfferId}
                      onChange={(e) => setNewTaskOfferId(e.target.value)}
                      placeholder="e.g. 12345"
                      className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm outline-none focus:border-indigo-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-indigo-700 mb-1">Task Name</label>
                    <input
                      type="text"
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm outline-none focus:border-indigo-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-indigo-700 mb-1">Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newTaskAmount}
                      onChange={(e) => setNewTaskAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm outline-none focus:border-indigo-500 bg-white"
                    />
                  </div>
                  <button
                    onClick={handleAddManualTask}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Complete Task & Sync
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available Balance</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={editBalance}
                      onChange={(e) => setEditBalance(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pending Income</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={editPendingBalance}
                      onChange={(e) => setEditPendingBalance(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Approved Income</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={editTotalEarned}
                      onChange={(e) => setEditTotalEarned(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Withdrawable</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={editTotalWithdrawals}
                      onChange={(e) => setEditTotalWithdrawals(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete User?</h3>
              <p className="text-gray-500 text-sm">
                Are you sure you want to delete <span className="font-semibold text-gray-900">{userToDelete}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User History Modal */}
      {viewingHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Activity History</h3>
                <p className="text-sm text-gray-500">{viewingHistory}</p>
              </div>
              <button
                onClick={() => setViewingHistory(null)}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Trash2 size={20} className="hidden" /> {/* Hidden icon just for spacing if needed */}
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {userClicks.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No activity history found for this user.
                </div>
              ) : (
                <div className="space-y-4">
                  {userClicks.map((click, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <div className="font-medium text-gray-900">
                          {click.type === 'Withdrawal' ? 'Withdrawal Request' : click.taskInfo || `Offer #${click.offerId}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(click.timestamp).toLocaleString()}
                        </div>
                        {click.type && (
                          <div className="text-xs mt-1 inline-flex items-center px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                            {click.type}
                          </div>
                        )}
                      </div>
                      <div className={`font-bold ${click.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {click.amount < 0 ? '-' : '+'}${Math.abs(click.amount).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 text-white font-medium ${
            notification.includes('❌') ? 'bg-red-600' : 'bg-gray-900'
          }`}>
            {notification}
          </div>
        </div>
      )}
    </div>
  );
}
