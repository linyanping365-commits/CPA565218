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

interface Offer {
  id: string;
  serialNumber: number;
  title: string;
  payout: string;
  countries: string[];
  status: 'Available';
}

const generateOffers = (): Offer[] => {
  const offers: Offer[] = [];
  let currentSerial = 1001;
  
  // 16 offers between $10 and $15
  for (let i = 1; i <= 16; i++) {
    const price = (Math.random() * 5 + 10).toFixed(2);
    offers.push({
      id: `low-${i}`,
      serialNumber: currentSerial++,
      title: `(Web/Wap) #L${i} V2 (Weekly) - Premium Offer - US/UK/CA - CC Submit`,
      payout: `$${price}`,
      countries: ['us', 'gb', 'ca'],
      status: 'Available'
    });
  }

  // 1980 offers between $16 and $40
  for (let i = 1; i <= 1980; i++) {
    const price = (Math.random() * 24 + 16).toFixed(2);
    offers.push({
      id: `high-${i}`,
      serialNumber: currentSerial++,
      title: `(Web/Wap) #H${i} V2 (Biweekly) - High Value Campaign - Global - CC Submit`,
      payout: `$${price}`,
      countries: ['us', 'kr', 'tw', 'hk'],
      status: 'Available'
    });
  }

  return offers;
};

const ALL_OFFERS = generateOffers();

export default function OffersPage({ onNavigate, currentView, isAdmin, onLogout }: any) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 42; // 7 rows of 6 cards

  const totalPages = Math.ceil(ALL_OFFERS.length / itemsPerPage);
  const currentOffers = ALL_OFFERS.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onNavigate={onNavigate} currentView={currentView} isAdmin={isAdmin} onLogout={onLogout} />
      <Header />
      
      <main className="ml-56 pt-16 p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-800">All Offers ({ALL_OFFERS.length})</h1>
            <div className="text-sm text-gray-500 font-medium">
              Page {currentPage} of {totalPages}
            </div>
          </div>
          
          {/* Filters Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">Filters</span>
              <div className="flex items-center space-x-2 text-gray-400">
                <button className="hover:text-gray-600">_</button>
                <button className="hover:text-gray-600"><X size={14} /></button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Offer Name</label>
                  <input type="text" className="w-full border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Offer ID</label>
                  <input type="text" className="w-full border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Incent Allowed</label>
                  <select className="w-full border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500">
                    <option></option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Stream Type</label>
                  <select className="w-full border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500">
                    <option></option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Status</label>
                  <select className="w-full border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500">
                    <option>Active</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Category</label>
                  <input type="text" className="w-full border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="bg-cyan-500 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-cyan-600 transition-colors">
                  Show More Filters +
                </button>
                <button className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-indigo-700 transition-colors">
                  Apply Filter
                </button>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-gray-200 p-1 rounded">
                <button 
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 text-[10px] font-bold rounded ${viewMode === 'table' ? 'bg-green-500 text-white' : 'text-gray-600'}`}
                >
                  TABLE
                </button>
                <button 
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1 text-[10px] font-bold rounded ${viewMode === 'cards' ? 'bg-red-500 text-white' : 'text-gray-600'}`}
                >
                  CARDS
                </button>
              </div>
              <div className="text-sm font-bold text-gray-500">
                Total Offers: {ALL_OFFERS.length}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button className="bg-cyan-500 text-white px-3 py-1.5 rounded flex items-center gap-2 text-xs font-medium hover:bg-cyan-600">
                <Columns size={14} /> Columns
              </button>
              <button className="bg-cyan-500 text-white px-3 py-1.5 rounded flex items-center gap-2 text-xs font-medium hover:bg-cyan-600">
                <Download size={14} /> Export
              </button>
              <button className="bg-cyan-500 text-white px-3 py-1.5 rounded flex items-center gap-2 text-xs font-medium hover:bg-cyan-600">
                <RotateCw size={14} /> Refresh
              </button>
              <button className="bg-cyan-500 text-white px-3 py-1.5 rounded flex items-center gap-2 text-xs font-medium hover:bg-cyan-600">
                <Database size={14} /> Cache
              </button>
              <button className="bg-cyan-500 text-white px-3 py-1.5 rounded flex items-center gap-2 text-xs font-medium hover:bg-cyan-600">
                <Maximize2 size={14} /> Expand
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
                    <div className="absolute top-0 right-0 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">
                      Available
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
                    
                    <button className="w-full bg-red-400 text-white py-1.5 rounded text-[10px] font-bold hover:bg-red-500 transition-colors mb-3">
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
    </div>
  );
}
