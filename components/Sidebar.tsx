
import React, { useState, useMemo } from 'react';
// Fix: removed .ts extension to resolve potential casing conflicts
import { NavigationTab } from '../types';

interface SubItem {
  id: NavigationTab;
  label: string;
  icon: React.ReactNode;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ReactNode;
  subItems?: SubItem[];
  isFixed?: boolean;
}

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const [hoveredItem, setHoveredItem] = useState<NavigationTab | null>(null);
  const [isExpanded, setIsExpanded] = useState(false); 
  const [favorites, setFavorites] = useState<Set<NavigationTab>>(new Set([NavigationTab.SiteManagement]));

  const allModules: NavItem[] = [
    {
      id: NavigationTab.SiteManagement,
      label: '工地管理',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5" />
        </svg>
      ),
      subItems: [
        { id: NavigationTab.SiteManagement, label: '工地管理', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5"/></svg> },
        { id: NavigationTab.SiteReports, label: '工地数据报表', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> }
      ]
    }
  ];

  const favoritedSubItems = useMemo(() => {
    const result: SubItem[] = [];
    allModules.forEach(mod => {
      mod.subItems?.forEach(sub => {
        if (favorites.has(sub.id)) result.push(sub);
      });
    });
    return result;
  }, [favorites, allModules]);

  const navItems: NavItem[] = [
    {
      id: NavigationTab.Favorites,
      label: '我的收藏',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
        </svg>
      ),
      subItems: favoritedSubItems
    },
    ...allModules
  ];

  const isParentActive = (item: NavItem) => {
    if (activeTab === item.id) return true;
    return item.subItems?.some(sub => sub.id === activeTab);
  };

  const toggleFavorite = (e: React.MouseEvent, tabId: NavigationTab) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(tabId)) next.delete(tabId);
      else next.add(tabId);
      return next;
    });
  };

  const currentHoveredNav = navItems.find(n => n.id === hoveredItem);
  
  const logoUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 256'%3E%3Cdefs%3E%3ClinearGradient id='logoGrad' x1='0%25' y1='0%25' x2='100%25' y2='0%25'%3E%3Cstop offset='0%25' style='stop-color:%2360a5fa;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%232563eb;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cg fill='none' stroke='url(%23logoGrad)' stroke-width='18' stroke-linecap='round'%3E%3Cpath d='M120 50 A85 85 0 1 0 120 206' opacity='0.3' /%3E%3Cpath d='M110 80 A55 55 0 1 0 110 176' opacity='0.6' /%3E%3Cpath d='M100 110 A25 25 0 1 0 100 146' /%3E%3C/g%3E%3Ctext x='160' y='175' font-family='Arial Black, system-ui, sans-serif' font-weight='900' font-size='160' fill='url(%23logoGrad)' font-style='italic' letter-spacing='-8'%3EMDS%3C/text%3E%3C/svg%3E";

  return (
    <div 
      className="relative z-[100000] flex h-full bg-[#080b1a]"
      onMouseLeave={() => setHoveredItem(null)}
    >
      <aside 
        style={{ 
          backgroundColor: 'var(--sidebar-bg)', 
          borderColor: 'var(--sidebar-border)',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' 
        }}
        className={`flex flex-col h-full rounded-none border-r shadow-2xl py-6 shrink-0 relative z-[100010] transition-all duration-300 ${isExpanded ? 'w-56' : 'w-[68px]'}`}
      >
        {/* Logo 部分 */}
        <div className={`mb-6 cursor-pointer transition-all hover:scale-105 active:scale-95 group flex items-center ${isExpanded ? 'px-5 justify-start' : 'px-0 justify-center'}`}>
          <div className="w-8 h-8 flex items-center justify-center shrink-0 overflow-visible" style={{ filter: 'var(--logo-filter)' }}>
            <img src={logoUrl} alt="MDS Logo" className="w-full h-full object-contain" />
          </div>
          {isExpanded && (
            <span className="ml-3 text-[16px] font-black text-white whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
              三商巡检系统
            </span>
          )}
        </div>

        {/* 展开/收缩 切换按钮 - 悬停颜色改为主题色 */}
        <div className={`mb-8 w-full flex ${isExpanded ? 'px-5 justify-start' : 'px-0 justify-center'}`}>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--sidebar-text)] hover:text-primary transition-all active:scale-90 border border-transparent group/toggle"
          >
            <svg 
              className={`w-4 h-4 transition-transform duration-500 ${isExpanded ? 'rotate-0' : 'rotate-180'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <nav className={`flex-1 w-full space-y-6 flex flex-col items-center ${isExpanded ? 'px-3' : 'px-0'}`}>
          {navItems.map((item) => {
            const isActive = isParentActive(item);
            const isFavIcon = item.id === NavigationTab.Favorites;
            const shouldHighlight = isFavIcon ? (favoritedSubItems.length > 0) : isActive;
            
            return (
              <div key={item.id} onMouseEnter={() => setHoveredItem(item.id)} className="relative w-full group">
                <button
                  onClick={() => !item.subItems?.length && onTabChange(item.id)}
                  style={{ 
                    color: shouldHighlight ? (isFavIcon ? '#fbbf24' : 'var(--primary-color)') : undefined,
                    backgroundColor: 'transparent'
                  }}
                  className={`relative z-50 w-full rounded-xl flex items-center transition-all duration-300 ${
                    isExpanded ? 'h-12 px-4 justify-start' : 'h-10 justify-center'
                  } ${shouldHighlight ? `scale-105` : `text-[var(--sidebar-text)] ${!isFavIcon ? 'hover:text-primary' : ''}`}`}
                >
                  <span className={`shrink-0 transition-transform duration-300 ${shouldHighlight ? 'scale-110' : ''}`}>{item.icon}</span>
                  {isExpanded && (
                    <span className={`ml-3 text-[14px] font-black whitespace-nowrap transition-all duration-300 overflow-hidden ${shouldHighlight ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                      {item.label}
                    </span>
                  )}
                </button>
                {!isExpanded && (
                  <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-1 group-hover:translate-x-0 z-[60]">
                    <div className="tooltip-bubble tooltip-arrow-left">{item.label}</div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* 二级菜单 */}
      <div 
        style={{ 
          backgroundColor: 'var(--submenu-bg)', 
          borderColor: 'var(--sidebar-border)',
          left: '100%',
          marginLeft: '-3px',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' 
        }}
        className={`absolute top-0 h-full border-r shadow-[30px_0_60px_-15px_rgba(0,0,0,0.6)] transition-all duration-300 origin-left backdrop-blur-3xl overflow-hidden z-[100005] ${
          currentHoveredNav
            ? 'w-[460px] opacity-100 translate-x-0 visible' 
            : 'w-0 opacity-0 -translate-x-4 invisible'
        }`}
      >
        <div className="w-[460px] h-full py-8 flex flex-col">
          <div className="px-6 mb-10 mt-2">
            <h4 style={{ color: 'var(--submenu-title)' }} className="text-[16px] font-black tracking-wider mb-2">
              {currentHoveredNav?.label || '模块详情'}
            </h4>
            <div 
              style={{ backgroundColor: currentHoveredNav?.id === NavigationTab.Favorites ? '#fbbf24' : 'var(--primary-color)' }}
              className="w-10 h-1.5 rounded-full"
            ></div>
          </div>

          <nav className="flex-1 px-4 grid grid-cols-2 gap-3 content-start">
            {currentHoveredNav?.subItems && currentHoveredNav.subItems.length > 0 ? (
              currentHoveredNav.subItems.map((sub) => {
                const isFav = favorites.has(sub.id);
                const isActive = activeTab === sub.id;
                return (
                  <div
                    key={sub.id}
                    onClick={() => onTabChange(sub.id)}
                    className={`flex flex-row items-center px-3 py-4 rounded-xl transition-all group/sub cursor-pointer relative border ${
                      isActive 
                      ? 'shadow-xl bg-[var(--submenu-item-active)] border-[var(--sidebar-border)]' 
                      : 'border-transparent text-[var(--submenu-text)] hover:shadow-xl hover:bg-[var(--submenu-item-active)] hover:border-[var(--sidebar-border)] hover:text-[var(--submenu-title)]'
                    }`}
                  >
                    <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center mr-3 transition-all ${isActive ? 'scale-110 text-[var(--primary-color)]' : 'text-[var(--sidebar-text)] group-hover/sub:scale-110 group-hover/sub:text-[var(--primary-color)]'}`}>
                      {sub.icon}
                    </div>
                    <div className="flex items-center flex-1 min-w-0 pr-1">
                      <span className={`text-[14px] font-black tracking-tight whitespace-nowrap transition-colors ${isActive ? 'text-[var(--submenu-title)]' : 'group-hover/sub:text-[var(--submenu-title)]'}`}>
                        {sub.label}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => toggleFavorite(e, sub.id)}
                      className={`absolute top-1 right-1 p-1 rounded-lg transition-all ${isFav ? 'text-[#fbbf24] animate-in zoom-in-50' : 'text-slate-400 opacity-0 group-hover/sub:opacity-100 hover:text-[#fbbf24]'} hover:scale-125 active:scale-95`}
                    >
                      <svg className="w-[18px] h-[18px]" fill={isFav ? "currentColor" : "none"} stroke={isFav ? "none" : "currentColor"} strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                      </svg>
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 py-20 flex flex-col items-center justify-center opacity-30" style={{ color: 'var(--sidebar-text)' }}>
                <svg className="w-16 h-16 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                </svg>
                <span className="text-[13px] font-bold tracking-[0.2em]">暂无收藏内容</span>
              </div>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};
