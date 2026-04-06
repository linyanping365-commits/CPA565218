import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  Table as TableIcon, 
  Columns, 
  Download, 
  RotateCw, 
  Database, 
  Maximize2, 
  ChevronLeft, 
  ChevronRight,
  X
} from 'lucide-react';
import { ALL_OFFERS, type Offer } from '../lib/offersData';

export default function OffersPage({ onNavigate, currentView, isAdmin, userEmail, onLogout, trackingLinks = {} }: any) {
  const [filterMode, setFilterMode] = useState<'all' | 'no-approval' | 'approval'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'description' | 'tracking' | 'creatives'>('basic');
  const [notification, setNotification] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Filter States
  const [offerName, setOfferName] = useState('');
  const [offerId, setOfferId] = useState('');
  const [incentAllowed, setIncentAllowed] = useState('');
  const [streamType, setStreamType] = useState('');
  const [status, setStatus] = useState('Active');
  const [category, setCategory] = useState('');
  
  const [showMore, setShowMore] = useState(false);
  
  // Applied Filter States (to trigger on "Apply Filter" button)
  const [appliedFilters, setAppliedFilters] = useState({
    name: '',
    id: '',
    incent: '',
    stream: '',
    status: 'Active',
    category: ''
  });

  const itemsPerPage = 42; // 7 rows of 6 cards

  const filteredOffers = ALL_OFFERS.filter(offer => {
    // Payout Filter
    const payout = parseFloat(offer.payout.replace('$', ''));
    if (filterMode === 'no-approval' && payout >= 15) return false;
    if (filterMode === 'approval' && payout < 15) return false;
    
    // Search Filters
    if (appliedFilters.name && !offer.title.toLowerCase().includes(appliedFilters.name.toLowerCase())) return false;
    if (appliedFilters.id && !offer.serialNumber.toString().includes(appliedFilters.id)) return false;
    
    return true;
  });

  const handleApplyFilter = () => {
    setAppliedFilters({
      name: offerName,
      id: offerId,
      incent: incentAllowed,
      stream: streamType,
      status: status,
      category: category
    });
    setCurrentPage(1);
  };

  const handleExport = () => {
    const headers = ['ID', 'Title', 'Payout', 'Countries', 'Status', 'CreatedAt', 'UpdatedAt'];
    const csvContent = [
      headers.join(','),
      ...filteredOffers.map(o => [
        o.serialNumber,
        `"${o.title}"`,
        o.payout,
        `"${o.countries.join('|')}"`,
        o.status,
        o.createdAt,
        o.updatedAt
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `offers_export_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setNotification('Exporting data to CSV...');
    setTimeout(() => setNotification(null), 2000);
  };

  const handleRefresh = () => {
    setNotification('Refreshing offers list...');
    setTimeout(() => {
      setNotification(null);
      window.location.reload();
    }, 1000);
  };

  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage);
  const currentOffers = filteredOffers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onNavigate={onNavigate} currentView={currentView} isAdmin={isAdmin} onLogout={onLogout} />
      <Header />
      
      <main className={`${isExpanded ? 'ml-0' : 'ml-56'} pt-16 p-6 transition-all duration-300`}>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-800">All Offers</h1>
          </div>
          
          {/* Filters Section */}
          {showFilters && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6 transition-all duration-300">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">Filters</span>
                <div className="flex items-center space-x-2 text-gray-400">
                  <button 
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="hover:text-gray-600 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100"
                  >
                    {isMinimized ? '+' : '_'}
                  </button>
                  <button 
                    onClick={() => setShowFilters(false)}
                    className="hover:text-gray-600 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
              
              {!isMinimized && (
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Offer Name</label>
                      <input 
                        type="text" 
                        value={offerName}
                        onChange={(e) => setOfferName(e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Offer ID</label>
                      <input 
                        type="text" 
                        value={offerId}
                        onChange={(e) => setOfferId(e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Incent Allowed</label>
                      <select 
                        value={incentAllowed}
                        onChange={(e) => setIncentAllowed(e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500"
                      >
                        <option value="">All</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Stream Type</label>
                      <select 
                        value={streamType}
                        onChange={(e) => setStreamType(e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500"
                      >
                        <option value="">All</option>
                        <option value="direct">Direct</option>
                        <option value="redirect">Redirect</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Status</label>
                      <select 
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Category</label>
                      <input 
                        type="text" 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500" 
                      />
                    </div>
                  </div>

                  {showMore && (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4 pt-4 border-t border-gray-50 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Country</label>
                        <select className="w-full border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500">
                          <option value="">All Countries</option>
                          <option value="US">United States</option>
                          <option value="GB">United Kingdom</option>
                          <option value="CA">Canada</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Platform</label>
                        <select className="w-full border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500">
                          <option value="">All Platforms</option>
                          <option value="ios">iOS</option>
                          <option value="android">Android</option>
                          <option value="desktop">Desktop</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Min Payout</label>
                        <input type="number" placeholder="0.00" className="w-full border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Max Payout</label>
                        <input type="number" placeholder="99.99" className="w-full border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Traffic Type</label>
                        <select className="w-full border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500">
                          <option value="">All Traffic</option>
                          <option value="social">Social</option>
                          <option value="search">Search</option>
                          <option value="native">Native</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Conversion</label>
                        <select className="w-full border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500">
                          <option value="">All Types</option>
                          <option value="cpa">CPA</option>
                          <option value="cpl">CPL</option>
                          <option value="cpi">CPI</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowMore(!showMore)}
                      className="bg-cyan-500 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-cyan-600 transition-colors"
                    >
                      {showMore ? 'Show Less Filters -' : 'Show More Filters +'}
                    </button>
                    <button 
                      onClick={handleApplyFilter}
                      className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-indigo-700 transition-colors"
                    >
                      Apply Filter
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-gray-200 p-1 rounded">
                <button 
                  onClick={() => {
                    setFilterMode('no-approval');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 text-[10px] font-bold rounded ${filterMode === 'no-approval' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-300'}`}
                >
                  NO APPROVAL
                </button>
                <button 
                  onClick={() => {
                    setFilterMode('approval');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 text-[10px] font-bold rounded ${filterMode === 'approval' ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-gray-300'}`}
                >
                  APPROVAL
                </button>
                <button 
                  onClick={() => {
                    setFilterMode('all');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 text-[10px] font-bold rounded ${filterMode === 'all' ? 'bg-indigo-500 text-white' : 'text-gray-600 hover:bg-gray-300'}`}
                >
                  ALL
                </button>
              </div>
              <div className="text-sm font-bold text-gray-500">
                Total Offers: {filteredOffers.length}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => {
                  setNotification('Column settings opened');
                  setTimeout(() => setNotification(null), 2000);
                }}
                className="bg-cyan-500 text-white px-3 py-1.5 rounded flex items-center gap-2 text-xs font-medium hover:bg-cyan-600"
              >
                <Columns size={14} /> Columns
              </button>
              <button 
                onClick={handleExport}
                className="bg-cyan-500 text-white px-3 py-1.5 rounded flex items-center gap-2 text-xs font-medium hover:bg-cyan-600"
              >
                <Download size={14} /> Export
              </button>
              <button 
                onClick={handleRefresh}
                className="bg-cyan-500 text-white px-3 py-1.5 rounded flex items-center gap-2 text-xs font-medium hover:bg-cyan-600"
              >
                <RotateCw size={14} /> Refresh
              </button>
              <button 
                onClick={() => {
                  setNotification('Cache cleared successfully');
                  setTimeout(() => setNotification(null), 2000);
                }}
                className="bg-cyan-500 text-white px-3 py-1.5 rounded flex items-center gap-2 text-xs font-medium hover:bg-cyan-600"
              >
                <Database size={14} /> Cache
              </button>
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className={`bg-cyan-500 text-white px-3 py-1.5 rounded flex items-center gap-2 text-xs font-medium hover:bg-cyan-600 ${isExpanded ? 'ring-2 ring-white ring-inset' : ''}`}
              >
                <Maximize2 size={14} /> {isExpanded ? 'Collapse' : 'Expand'}
              </button>
            </div>
          </div>

          {/* Offers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {currentOffers.map((offer) => {
              const payoutValue = parseFloat(offer.payout.replace('$', ''));
              const isLowPrice = payoutValue < 15;
              const circleGradient = isLowPrice 
                ? "from-blue-400 via-cyan-500 to-indigo-600" 
                : "from-orange-400 via-pink-500 to-purple-600";

              return (
                <div key={offer.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                  <div className="relative aspect-square bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
                    <div className={`absolute top-0 right-0 ${offer.status === 'APPROVAL' ? 'bg-red-600' : 'bg-slate-800'} text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold`}>
                      {offer.status}
                    </div>
                    
                    {/* Mock "BEST OFFER" Graphic */}
                    <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${circleGradient} flex items-center justify-center relative shadow-inner`}>
                      <div className="absolute inset-2 border-2 border-dashed border-white/30 rounded-full animate-[spin_10s_linear_infinite]" />
                      <div className="text-center">
                        <div className="text-white font-black text-xl leading-tight tracking-tighter">BEST</div>
                        <div className="text-white font-black text-xl leading-tight tracking-tighter">OFFER</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col text-center">
                    <h3 className="text-[11px] font-medium text-gray-500 line-clamp-3 mb-2 min-h-[40px]">
                      {offer.title}
                    </h3>
                    <div className="mb-3">
                      <div className="text-lg font-black text-slate-800 leading-none">{offer.payout}</div>
                      <div className="text-[10px] font-bold text-gray-400 mt-1">#{offer.serialNumber}</div>
                    </div>
                    
                    <button 
                      onClick={() => setSelectedOffer(offer)}
                      className="w-full bg-red-400 text-white py-1.5 rounded text-[10px] font-bold hover:bg-red-500 transition-colors mb-3"
                    >
                      Get Offer Link
                    </button>

                    <div className="flex items-center justify-center gap-1 mt-auto">
                      {offer.countries.map((country, idx) => (
                        <img 
                          key={idx}
                          src={country === 'un' ? 'https://flagcdn.com/w20/un.png' : `https://flagcdn.com/w20/${country}.png`}
                          alt={country}
                          className="w-4 h-auto shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8 gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-lg transition-colors ${currentPage === 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center px-4 text-sm font-medium text-gray-500">
              {currentPage} / {totalPages}
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-lg transition-colors ${currentPage === totalPages ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </main>

      {/* Offer Details Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-medium text-slate-700">Details of Offer ID : {selectedOffer.serialNumber}</h2>
              <button 
                onClick={() => setSelectedOffer(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-6 pt-4 flex gap-4 border-b border-gray-100">
              <button 
                onClick={() => setActiveTab('basic')}
                className={`pb-3 text-sm font-medium px-6 transition-all ${activeTab === 'basic' ? 'text-white bg-[#6366F1] rounded-t-lg shadow-lg shadow-indigo-200' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Basic
              </button>
              <button 
                onClick={() => setActiveTab('description')}
                className={`pb-3 text-sm font-medium px-6 transition-all ${activeTab === 'description' ? 'text-white bg-[#6366F1] rounded-t-lg shadow-lg shadow-indigo-200' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Description
              </button>
              <button 
                onClick={() => setActiveTab('tracking')}
                className={`pb-3 text-sm font-medium px-6 transition-all ${activeTab === 'tracking' ? 'text-white bg-[#6366F1] rounded-t-lg shadow-lg shadow-indigo-200' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Tracking
              </button>
              <button 
                onClick={() => setActiveTab('creatives')}
                className={`pb-3 text-sm font-medium px-6 transition-all ${activeTab === 'creatives' ? 'text-white bg-[#6366F1] rounded-t-lg shadow-lg shadow-indigo-200' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Creatives
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 overflow-y-auto flex-1 min-h-[400px]">
              {activeTab === 'basic' && (
                <div className="grid grid-cols-2 gap-x-12 gap-y-0">
                  {/* Left Column */}
                  <div className="space-y-0 border-t border-gray-100">
                    <DetailRow label="Offer ID" value={selectedOffer.serialNumber.toString()} />
                    <DetailRow label="Name" value={selectedOffer.title} />
                    <DetailRow label="Payout to Affiliate" value={selectedOffer.payout} />
                    <DetailRow label="Status" value={<span className={`${selectedOffer.status === 'APPROVAL' ? 'bg-red-600' : 'bg-green-500'} text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase`}>{selectedOffer.status === 'APPROVAL' ? 'APPROVAL' : 'ACTIVE'}</span>} />
                    <DetailRow label="Offer Type" value={<span className="bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">CPA</span>} />
                    <DetailRow label="Allowed Countries" value={
                      <div className="flex gap-1">
                        {selectedOffer.countries.map(c => (
                          <span key={c} className="bg-cyan-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">{c}</span>
                        ))}
                      </div>
                    } />
                    <DetailRow label="Restricted Countries" value="" />
                    <DetailRow label="Device" value={<span className="bg-cyan-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">ALL</span>} />
                    <DetailRow label="Platforms" value={<span className="bg-cyan-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">ALL</span>} />
                    <DetailRow label="StreamType" value="" />
                    <DetailRow label="Incetive Allowed" value="" />
                  </div>

                  {/* Right Column */}
                  <div className="space-y-0 border-t border-gray-100">
                    <DetailRow label="Category" value="" />
                    <DetailRow label="Tags" value="" />
                    <DetailRow label="Creation Time" value={<span className="bg-slate-700 text-white text-[10px] px-2 py-0.5 rounded font-mono">{selectedOffer.createdAt}</span>} />
                    <DetailRow label="Update Time" value={<span className="bg-slate-700 text-white text-[10px] px-2 py-0.5 rounded font-mono">{selectedOffer.updatedAt}</span>} />
                  </div>
                </div>
              )}

              {activeTab === 'description' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-indigo-600">Description</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {selectedOffer.title}
                  </p>
                </div>
              )}

              {activeTab === 'tracking' && (
                <div className="space-y-8">
                  {parseFloat(selectedOffer.payout.replace('$', '')) < 15 ? (
                    <>
                      {/* Affiliate Link Section */}
                      <div className="bg-[#2EB0C9] p-6 rounded-lg">
                        <h4 className="text-white font-bold text-sm mb-3">Default Affiliate Link :</h4>
                        <div className="relative">
                          <div className="bg-[#F8F9FA] p-3 rounded border border-gray-200 text-slate-600 text-sm font-mono break-all pr-20">
                            {(() => {
                              const baseLink = trackingLinks[selectedOffer.serialNumber] || `http://dealeraff.a1.arcanetechs.com/go.php?oid=${selectedOffer.serialNumber}&pid=q943&sub1={clickid}`;
                              const separator = baseLink.includes('?') ? '&' : '?';
                              return `${baseLink}${separator}userId=${encodeURIComponent(userEmail)}`;
                            })()}
                          </div>
                          <button 
                            onClick={() => {
                              const baseLink = trackingLinks[selectedOffer.serialNumber] || `http://dealeraff.a1.arcanetechs.com/go.php?oid=${selectedOffer.serialNumber}&pid=q943&sub1={clickid}`;
                              const separator = baseLink.includes('?') ? '&' : '?';
                              const fullLink = `${baseLink}${separator}userId=${encodeURIComponent(userEmail)}`;
                              navigator.clipboard.writeText(fullLink);
                              setNotification('Link copied with User ID!');
                              setTimeout(() => setNotification(null), 2000);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-200 hover:bg-gray-300 text-slate-700 px-3 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <Download size={12} className="rotate-180" /> Copy
                          </button>
                        </div>
                        <p className="text-[10px] text-white/80 mt-2 italic">
                          * Your User ID ({userEmail}) has been automatically appended to track your earnings.
                        </p>
                      </div>

                      {/* Macros Section */}
                      <div>
                        <h4 className="text-[#6366F1] font-bold text-sm mb-4 border-b border-gray-200 pb-2">Available Tracking Parameters/Macros :</h4>
                        <div className="space-y-0">
                          <MacroRow label="sub1" desc="Macro for sending your 1st Variable example : ClickId / TransactionID" />
                          <MacroRow label="sub2" desc="Macro for sending your 2nd Variable example : PubId / Source" />
                          <MacroRow label="sub3" desc="Macro for sending your 3rd Variable" />
                          <MacroRow label="sub4" desc="Macro for sending your 4th Variable" />
                          <MacroRow label="droidid" desc="Macro for sending androidID" />
                          <MacroRow label="gaid" desc="Macro for sending Google Advertising ID" />
                          <MacroRow label="idfa" desc="Macro for sending your Iphone ID" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 space-y-6">
                      <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
                        <Search size={40} className="text-amber-600" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Approval Required</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                          This is a high-value offer. To maintain quality, our team needs to review your traffic source before providing a tracking link.
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          setNotification('Your request has been submitted successfully! Our team will review it shortly.');
                          setTimeout(() => setNotification(null), 5000);
                        }}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                      >
                        Request Approval
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'creatives' && (
                <div className="text-sm text-slate-500 italic">Creative assets for this offer will appear here.</div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setSelectedOffer(null)}
                className="bg-indigo-600 text-white px-8 py-2 rounded text-sm font-bold hover:bg-indigo-700 transition-colors"
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
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string, value: React.ReactNode }) {
  return (
    <div className="flex border-b border-gray-100 py-2.5 items-center min-h-[44px]">
      <div className="w-40 text-xs font-bold text-slate-600">{label}</div>
      <div className="flex-1 text-xs text-slate-500 font-medium">{value}</div>
    </div>
  );
}

function MacroRow({ label, desc }: { label: string, desc: string }) {
  return (
    <div className="flex border-b border-gray-100 py-2 items-center min-h-[36px]">
      <div className="w-40 text-xs font-medium text-slate-500">{label}</div>
      <div className="flex-1 text-xs text-slate-400">{desc}</div>
    </div>
  );
}
