import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
// Fix: removed .tsx extension to resolve potential casing conflicts
import { Header } from './components/Header';
import { SiteManagementContent } from './components/dataMain/SiteManagementContent';
import { NavigationTab } from './types';

/**
 * ============================================================================
 * SITE MANAGEMENT - HELPER COMPONENTS
 * These are used specifically for data-heavy views like Site Management
 * ============================================================================
 */
const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col space-y-1 py-2 border-b border-slate-50 last:border-0">
    <span className="text-[14px] font-normal text-[#666] uppercase tracking-tight">{label}</span>
    <span className="text-[14px] font-normal text-[#333] leading-relaxed">{value || '--'}</span>
  </div>
);

/**
 * ============================================================================
 * SITE MANAGEMENT - REPORT DETAIL POPUP
 * Specific to site data reporting and inspection details
 * ============================================================================
 */
const ReportDetailPopup: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const [basicExpanded, setBasicExpanded] = useState(true);
  const [infoExpanded, setInfoExpanded] = useState(true);

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white w-[680px] h-[720px] rounded-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-16 px-8 flex items-center justify-between border-b border-slate-100 bg-slate-50/30 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-1.5 h-5 bg-primary rounded-full shadow-[0_0_10px_rgba(154,107,255,0.5)]"></div>
            <h2 className="text-[16px] font-bold text-[#333] tracking-tight">回报明细详情</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-300 hover:text-rose-500 p-2 transition-all active:scale-90"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-slate-50/20 pb-10">
          <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-all duration-300">
            <button 
              onClick={() => setBasicExpanded(!basicExpanded)}
              className={`w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors ${basicExpanded ? 'border-b border-slate-100' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <h3 className="text-[14px] font-bold text-[#333]">工地基本资料</h3>
                {!basicExpanded && <span className="text-[12px] text-slate-400 font-normal px-2 py-0.5 bg-slate-100 rounded">点击展开查看详情</span>}
              </div>
              <svg 
                className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${basicExpanded ? 'rotate-180' : ''}`} 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            
            <div className={`transition-all duration-300 ease-in-out ${basicExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
              <div className="p-6 grid grid-cols-2 gap-x-10 gap-y-1">
                <div className="col-span-2">
                  <DetailItem label="项目名称" value={data?.projectName || "中南路雨水管网改造工程(建邱段)"} />
                </div>
                <div className="col-span-2">
                  <DetailItem label="施工地点" value={data?.location || "南京市建邺区沙洲街道停车场"} />
                </div>
                <DetailItem label="施工类型" value="市政工程" />
                <DetailItem label="其他施工类型" value="雨水管网改造" />
                <DetailItem label="项目业主" value="南京市水务局" />
                <DetailItem label="施工单位" value="施工单位" />
                <DetailItem label="负责人姓名" value={data?.reporter || "胡影"} />
                <DetailItem label="负责人电话" value="139****1234" />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-all duration-300">
            <button 
              onClick={() => setInfoExpanded(!infoExpanded)}
              className={`w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors ${infoExpanded ? 'border-b border-slate-100' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <h3 className="text-[14px] font-bold text-[#333]">告知函信息</h3>
                {!infoExpanded && <span className="text-[12px] text-slate-400 font-normal px-2 py-0.5 bg-slate-100 rounded">点击展开查看详情</span>}
              </div>
              <svg 
                className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${infoExpanded ? 'rotate-180' : ''}`} 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            
            <div className={`transition-all duration-300 ease-in-out ${infoExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
              <div className="p-6 space-y-1">
                <DetailItem label="告知函签收情况" value="已签收 (现场负责人签名确认)" />
                <DetailItem label="现场管道初步位置" value="道路西侧人行道下方 1.2m 处" />
                <DetailItem label="竣工图的提供情况" value="部分提供" />
                <DetailItem label="竣工图未提供原因" value="部分深埋段图纸正在档案室调取中" />
                <div className="grid grid-cols-2 gap-x-10">
                  <DetailItem label="是否使用探测仪器" value="是 (雷达探测)" />
                  <DetailItem label="是否清楚燃气管道走向" value="清楚" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// 全局大图预览组件
const ImagePreviewer: React.FC<{ 
  urls: string[]; 
  initialIndex: number; 
  onClose: () => void 
}> = ({ urls, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : urls.length - 1));
  };

  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % urls.length);
  };

  useEffect(() => {
    const activeThumb = scrollContainerRef.current?.children[currentIndex] as HTMLElement;
    if (activeThumb && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollLeft = activeThumb.offsetLeft - container.offsetWidth / 2 + activeThumb.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [currentIndex]);

  return (
    <div 
      className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div className="absolute top-0 inset-x-0 h-16 flex items-center justify-between px-8 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-50">
        <span className="text-white font-mono text-[15px] font-bold pointer-events-auto">
          {currentIndex + 1} / {urls.length}
        </span>
        <button 
          className="text-white/60 hover:text-rose-500 transition-all p-2 pointer-events-auto"
          onClick={onClose}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <button 
        onClick={showPrev}
        className="absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-all group active:scale-90 z-[60]"
      >
        <svg className="w-10 h-10 opacity-40 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
      </button>

      <button 
        onClick={showNext}
        className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-all group active:scale-90 z-[60]"
      >
        <svg className="w-10 h-10 opacity-40 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
      </button>

      <div className="flex-1 w-full flex items-center justify-center p-4 relative z-40" onClick={(e) => e.stopPropagation()}>
        <img 
          key={currentIndex} 
          src={urls[currentIndex]} 
          className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-[0_40px_120px_rgba(0,0,0,0.8)] select-none animate-in zoom-in-95 duration-500" 
          alt="预览大图" 
        />
      </div>

      <div className="w-full max-w-[1200px] h-24 mb-10 px-10 flex items-center justify-center pointer-events-none z-50">
        <div 
          ref={scrollContainerRef}
          className="flex space-x-3 overflow-x-auto custom-scrollbar p-2 pointer-events-auto snap-x"
          onClick={(e) => e.stopPropagation()}
        >
          {urls.map((url, idx) => (
            <div 
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden cursor-pointer transition-all snap-center border-2 ${
                currentIndex === idx 
                ? 'border-primary scale-110 shadow-lg shadow-primary/20 ring-4 ring-primary/10' 
                : 'border-transparent opacity-40 hover:opacity-100 hover:border-white/50'
              }`}
            >
              <img src={url} className="w-full h-full object-cover" alt={`缩略图 ${idx + 1}`} />
              {currentIndex === idx && <div className="absolute inset-0 bg-primary/10"></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TAB_METADATA: Record<string, { label: string; icon: React.ReactNode }> = {
  [NavigationTab.SiteManagement]: {
    label: '工地管理',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5"/>
      </svg>
    )
  },
  [NavigationTab.SiteReports]: {
    label: '工地数据报表',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
        <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
    )
  }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>(NavigationTab.SiteManagement);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isTabDropdownOpen, setIsTabDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<any>(null);
  const [allTasksViewData, setAllTasksViewData] = useState<any>(null);
  const [selectedSiteDetail, setSelectedSiteDetail] = useState<any>(null);
  const [playbackState, setPlaybackState] = useState<{ isOpen: boolean; trajectoryId?: string } | null>(null);
  
  const [globalPreview, setGlobalPreview] = useState<{ urls: string[], index: number } | null>(null);

  /**
   * ==========================================================================
   * SITE MANAGEMENT STATE
   * ==========================================================================
   */
  const [selectedReportDetail, setSelectedReportDetail] = useState<any>(null);

  const [contextMenu, setContextMenu] = useState<{ 
    visible: boolean; 
    x: number; 
    y: number; 
    tabId: NavigationTab | null 
  }>({ visible: false, x: 0, y: 0, tabId: null });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const [openTabs, setOpenTabs] = useState([
    { 
      id: NavigationTab.SiteManagement, 
      label: TAB_METADATA[NavigationTab.SiteManagement].label, 
      icon: TAB_METADATA[NavigationTab.SiteManagement].icon 
    }
  ]);

  const getLabel = (tab: NavigationTab) => {
    return TAB_METADATA[tab]?.label || '工作台';
  };

  const handleCloseTab = (tabId: NavigationTab, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); 
    if (openTabs.length <= 1) return;
    const closedIndex = openTabs.findIndex(tab => tab.id === tabId);
    const newTabs = openTabs.filter(tab => tab.id !== tabId);
    setOpenTabs(newTabs);
    if (activeTab === tabId) {
      const nextActiveTab = newTabs[closedIndex - 1] || newTabs[0];
      if (nextActiveTab) setActiveTab(nextActiveTab.id);
    }
  };

  const closeOthers = (tabId: NavigationTab) => {
    const remainingTab = openTabs.find(t => t.id === tabId);
    if (remainingTab) {
      setOpenTabs([remainingTab]);
      setActiveTab(tabId);
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  const closeRight = (tabId: NavigationTab) => {
    const index = openTabs.findIndex(tab => tab.id === tabId);
    const newTabs = openTabs.slice(0, index + 1);
    setOpenTabs(newTabs);
    const isActiveInRemaining = newTabs.some(t => t.id === activeTab);
    if (!isActiveInRemaining) setActiveTab(tabId);
    setContextMenu({ ...contextMenu, visible: false });
  };

  const closeLeft = (tabId: NavigationTab) => {
    const index = openTabs.findIndex(tab => tab.id === tabId);
    const newTabs = openTabs.slice(index);
    setOpenTabs(newTabs);
    const isActiveInRemaining = newTabs.some(t => t.id === activeTab);
    if (!isActiveInRemaining) setActiveTab(tabId);
    setContextMenu({ ...contextMenu, visible: false });
  };

  const closeAll = () => {
    const defaultTab = { 
      id: NavigationTab.SiteManagement, 
      label: TAB_METADATA[NavigationTab.SiteManagement].label, 
      icon: TAB_METADATA[NavigationTab.SiteManagement].icon 
    };
    setOpenTabs([defaultTab]);
    setActiveTab(NavigationTab.SiteManagement);
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleContextMenu = (e: React.MouseEvent, tabId: NavigationTab) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      tabId
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTabDropdownOpen(false);
      }
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(prev => ({ ...prev, visible: false }));
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen bg-[#f1f3f6] overflow-hidden font-sans">
      {!isFullscreen && (
        <Sidebar activeTab={activeTab} onTabChange={(tabId) => {
          const isAlreadyOpen = openTabs.some(t => t.id === tabId);
          if (!isAlreadyOpen) {
            const metadata = TAB_METADATA[tabId] || { 
              label: '新模块', 
              icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /></svg> 
            };
            setOpenTabs([...openTabs, { id: tabId, ...metadata }]);
          }
          setActiveTab(tabId);
        }} />
      )}

      <div className={`flex-1 flex-col flex min-w-0 transition-all duration-300 gap-1 overflow-hidden ${isFullscreen ? 'p-0' : 'py-1 pr-2.5 pl-2.5'}`}>
        {!isFullscreen && (
          <div className="relative z-[3000] shrink-0">
            <Header />
          </div>
        )}

        <div className={`flex-1 flex flex-col overflow-hidden relative transition-all duration-300 ${
          isFullscreen 
            ? 'bg-white rounded-none border-none' 
            : 'bg-[#fcfdfe] border border-slate-200/50 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]'
        }`}>
          {!isFullscreen && (
            <div className="h-10 border-b border-slate-300 flex items-center justify-between pr-4 pl-0 bg-[#fcfdfe] shrink-0 relative z-[100]">
              <div className="flex items-center h-full">
                {openTabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <div 
                      key={tab.id} 
                      onClick={() => setActiveTab(tab.id)}
                      onContextMenu={(e) => handleContextMenu(e, tab.id)}
                      className={`group flex items-center justify-center h-full px-5 rounded-t-xl transition-all cursor-pointer relative min-w-[120px] ${
                        isActive 
                        ? 'bg-white border-t border-x border-slate-300 border-b-white z-10 shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.03)] -mb-[1px]' 
                        : 'bg-transparent border-t border-x border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <span className={`text-[12px] whitespace-nowrap transition-colors text-center ${isActive ? 'font-black text-black' : 'font-bold text-slate-500'}`}>
                        {tab.label}
                      </span>
                      <button 
                        onClick={(e) => handleCloseTab(tab.id, e)}
                        className={`ml-2.5 w-4.5 h-4.5 flex items-center justify-center rounded-full hover:bg-slate-100 transition-all duration-200 ${
                          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <svg className={`w-3.5 h-3.5 ${isActive ? 'text-slate-400 hover:text-rose-500' : 'text-slate-300 hover:text-rose-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center pr-2 relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsTabDropdownOpen(!isTabDropdownOpen)}
                  className={`p-1.5 rounded-lg transition-all ${
                    isTabDropdownOpen 
                    ? 'text-slate-900 bg-slate-100' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <svg className={`w-4 h-4 transition-transform duration-300 ${isTabDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className={`absolute top-full right-0 mt-1 w-48 bg-white rounded-xl shadow-[0_10px_30px_-5px_rgba(0,0,0,0.15)] border border-slate-300 py-1.5 z-[200] transition-all duration-200 origin-top-right ${
                  isTabDropdownOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
                }`}>
                  <div className="px-3 py-1 mb-1 border-b border-slate-100">
                    <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">视图管理</span>
                  </div>
                  {openTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsTabDropdownOpen(false);
                      }}
                      className={`w-full flex items-center px-3 py-2 text-left transition-colors group ${
                        activeTab === tab.id 
                        ? 'bg-slate-50 text-slate-900' 
                        : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`mr-2.5 ${activeTab === tab.id ? 'text-primary' : 'text-slate-400'}`}>
                        {tab.icon}
                      </span>
                      <span className={`text-[12px] flex-1 ${activeTab === tab.id ? 'font-black' : 'font-bold'}`}>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className={`flex-1 flex overflow-hidden transition-all duration-300 px-0 ${
            activeTab === NavigationTab.SiteManagement && !isFullscreen
              ? 'pt-[0.625rem] pb-0 bg-[#f1f3f6]'
              : 'py-[0.625rem] bg-[#f1f3f6]'
          }`}>
            <main className="flex-1 relative overflow-hidden transition-all duration-300">
              {activeTab === NavigationTab.SiteManagement ? (
                <SiteManagementContent />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/40">
                  <div className="p-10 bg-white rounded-3xl shadow-xl border border-slate-300 flex flex-col items-center max-sm text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-300">
                      {TAB_METADATA[activeTab]?.icon || <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /></svg>}
                    </div>
                    <h3 className="text-slate-800 font-black text-lg mb-2 tracking-tight">{getLabel(activeTab)}</h3>
                    <p className="text-[12px] text-slate-400 leading-relaxed font-medium">模块数据正由运维中心同步至云端，请稍后刷新查看。</p>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* 弹窗和预览组件移至最底部渲染，确保层级绝对最高并能覆盖上方所有内容 */}
      {globalPreview && (
        <ImagePreviewer 
          urls={globalPreview.urls} 
          initialIndex={globalPreview.index} 
          onClose={() => setGlobalPreview(null)} 
        />
      )}

      {selectedReportDetail && (
        <ReportDetailPopup 
          data={selectedReportDetail} 
          onClose={() => setSelectedReportDetail(null)} 
        />
      )}

      {contextMenu.visible && (
        <div 
          ref={contextMenuRef}
          className="fixed z-[999999] w-40 bg-white/95 backdrop-blur-xl border border-slate-300 rounded-xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.25)] py-1.5 animate-in fade-in zoom-in-95 duration-150 origin-top-left"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={() => closeOthers(contextMenu.tabId!)}
            className="w-full px-4 py-2 text-left text-[12px] font-bold text-slate-600 hover:bg-primary/5 hover:text-primary transition-all flex items-center space-x-2.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>关闭其他</span>
          </button>
          <button 
            onClick={() => { if(contextMenu.tabId) closeOthers(contextMenu.tabId); }}
            className="w-full px-4 py-2 text-left text-[12px] font-bold text-slate-600 hover:bg-primary/5 hover:text-primary transition-all flex items-center space-x-2.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
            <span>关闭右侧</span>
          </button>
          <button 
            onClick={() => { if(contextMenu.tabId) closeLeft(contextMenu.tabId); }}
            className="w-full px-4 py-2 text-left text-[12px] font-bold text-slate-600 hover:bg-primary/5 hover:text-primary transition-all flex items-center space-x-2.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
            <span>关闭左侧</span>
          </button>
          <div className="mx-2 my-1 border-t border-slate-100"></div>
          <button 
            onClick={closeAll}
            className="w-full px-4 py-2 text-left text-[12px] font-bold text-rose-500 hover:bg-rose-50 transition-all flex items-center space-x-2.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            <span>全部关闭</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;