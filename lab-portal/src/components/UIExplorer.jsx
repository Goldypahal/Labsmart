import React, { useState } from 'react';
import catalogData from '../data/srs_ui_catalog.json';
import { LayoutGrid, Search, X, Monitor, Tablet, Smartphone, ExternalLink, Layers, Sparkles, ChevronRight } from 'lucide-react';

export default function UIExplorer({ onSelectScreen }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [viewMode, setViewMode] = useState('desktop');

  const categories = [
    'All',
    'Doctor & EMR System',
    'Patient & Family Portal',
    'ABHA & Identity Verification',
    'Lab & Field Operations',
    'Pharmacy & Insurance',
    'Emergency & First Responder Hub',
    'Pediatric & Immunization',
    'FFIRE Fraud Engine',
    'System & Admin Console'
  ];

  const filteredScreens = catalogData.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelect = (screen) => {
    setSelectedScreen(screen);
    if (onSelectScreen) onSelectScreen(screen);
  };

  const getViewportWidth = () => {
    switch (viewMode) {
      case 'mobile': return 'max-w-[395px]';
      case 'tablet': return 'max-w-[768px]';
      default: return 'w-full';
    }
  };

  return (
    <>
      {/* Floating Explorer Badge */}
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-full shadow-2xl hover:scale-105 transition-all duration-200 font-medium text-sm border border-white/20 group cursor-pointer"
          title="Open SRS UI Component Explorer"
        >
          <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" style={{ animationDuration: '3s' }} />
          <span>SRS UI Catalog</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold text-white">
            111 Screens
          </span>
        </button>
      </div>

      {/* Explorer Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex flex-col justify-between">
          {/* Header Bar */}
          <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-lg text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  SRS UI Component Explorer
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    {catalogData.length} Live Components
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Select and preview any generated SRS screen component with responsive viewport testing
                </p>
              </div>
            </div>

            {/* Viewport Control Bar */}
            {selectedScreen && (
              <div className="hidden md:flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button
                  onClick={() => setViewMode('desktop')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${viewMode === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <Monitor className="w-4 h-4" /> Desktop
                </button>
                <button
                  onClick={() => setViewMode('tablet')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${viewMode === 'tablet' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <Tablet className="w-4 h-4" /> Tablet
                </button>
                <button
                  onClick={() => setViewMode('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${viewMode === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <Smartphone className="w-4 h-4" /> Mobile
                </button>
              </div>
            )}

            {/* Actions & Close */}
            <div className="flex items-center gap-3">
              {selectedScreen && (
                <a
                  href={selectedScreen.relPath}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" /> Standalone Tab
                </a>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Main Body */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Catalog Selector */}
            <div className="w-80 md:w-96 bg-slate-900 border-r border-slate-800 flex flex-col h-full text-white">
              {/* Search Bar */}
              <div className="p-4 border-b border-slate-800">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 111 SRS screens..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex gap-1.5 overflow-x-auto pt-3 pb-1 text-xs">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-medium transition ${
                        activeCategory === cat
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Screens List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
                {filteredScreens.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No matching screens found.
                  </div>
                ) : (
                  filteredScreens.map((item) => {
                    const isSelected = selectedScreen?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`w-full text-left p-3.5 transition flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'bg-blue-600/20 border-l-4 border-blue-500 text-white'
                            : 'hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <span className="inline-block px-2 py-0.5 mb-1 text-[10px] font-semibold bg-slate-800 text-blue-400 rounded-md border border-slate-700">
                            {item.category}
                          </span>
                          <h4 className="text-xs font-semibold truncate leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                            {item.folder}
                          </p>
                        </div>
                        <ChevronRight className={`w-4 h-4 mt-2 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-600'}`} />
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Live Preview Area */}
            <div className="flex-1 bg-slate-950 p-4 md:p-6 overflow-hidden flex flex-col items-center justify-center">
              {selectedScreen ? (
                <div className={`h-full flex flex-col items-center transition-all duration-300 ${getViewportWidth()} w-full`}>
                  <div className="w-full bg-slate-900 border border-slate-800 rounded-t-xl px-4 py-2 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-200 truncate max-w-[300px]">
                      {selectedScreen.title}
                    </span>
                    <span className="font-mono text-[11px] text-blue-400">
                      {selectedScreen.relPath}
                    </span>
                  </div>
                  <iframe
                    src={selectedScreen.relPath}
                    title={selectedScreen.title}
                    className="w-full flex-1 bg-white border border-slate-800 border-t-0 rounded-b-xl shadow-2xl"
                  />
                </div>
              ) : (
                <div className="text-center p-12 max-w-md">
                  <div className="w-16 h-16 bg-blue-600/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                    <LayoutGrid className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Select a UI Component</h3>
                  <p className="text-xs text-slate-400 mb-6">
                    Choose any of the 111 SRS generated screens from the left sidebar to preview in real-time with responsive device frames.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
