
import React, { useState, useRef, useEffect } from 'react';

/**
 * Optimized Header component with QR code preview and consistent styling.
 * Resolved casing conflict by consolidating implementation into PascalCase 'Header.tsx'.
 */
export const Header: React.FC = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeNotifTab, setActiveNotifTab] = useState<'通知' | '提醒'>('通知');
  const userMenuRef = useRef<HTMLDivElement>(null);

  // 主题色配置选项
  const themes = [
    { id: 'default', color: '#9a6bff', hover: '#8558eb', isLightSidebar: false, label: '暗夜紫' },
    { id: 'blue', color: '#008fff', hover: '#007adb', isLightSidebar: true, label: '企业蓝' },
    { id: 'pink', color: '#e60012', hover: '#cc0010', isLightSidebar: true, label: '中国红' },
  ];

  const handleThemeChange = (theme: typeof themes[0]) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.color);
    root.style.setProperty('--primary-hover', theme.hover);

    if (theme.isLightSidebar) {
      let lightBg = '';
      if (theme.id === 'blue') {
        lightBg = '#f0f7ff'; 
      } else if (theme.id === 'pink') {
        lightBg = '#fff5f5'; 
      } else {
        lightBg = `${theme.color}1a`; 
      }
      
      root.style.setProperty('--sidebar-bg', lightBg);
      root.style.setProperty('--submenu-bg', '#ffffff');
      root.style.setProperty('--sidebar-border', 'rgba(0, 0, 0, 0.06)');
      root.style.setProperty('--sidebar-item-hover', 'rgba(0, 0, 0, 0.04)');
      root.style.setProperty('--sidebar-text', '#475569'); 
      root.style.setProperty('--sidebar-toggle-bg', 'rgba(0, 0, 0, 0.04)');
      root.style.setProperty('--sidebar-toggle-hover', 'rgba(0, 0, 0, 0.08)');
      root.style.setProperty('--submenu-item-active', 'rgba(0, 0, 0, 0.03)');
      root.style.setProperty('--submenu-text', '#475569');
      root.style.setProperty('--submenu-title', '#1e293b');
      root.style.setProperty('--logo-filter', 'none');
    } else {
      root.style.setProperty('--sidebar-bg', '#080b1a');
      root.style.setProperty('--submenu-bg', '#121629');
      root.style.setProperty('--sidebar-border', 'rgba(255, 255, 255, 0.05)');
      root.style.setProperty('--sidebar-item-hover', 'rgba(255, 255, 255, 0.05)');
      root.style.setProperty('--sidebar-text', '#ffffff'); 
      root.style.setProperty('--sidebar-toggle-bg', 'rgba(255, 255, 255, 0.05)');
      root.style.setProperty('--sidebar-toggle-hover', 'rgba(255, 255, 255, 0.1)');
      root.style.setProperty('--submenu-item-active', '#1e253c');
      root.style.setProperty('--submenu-text', '#94a3b8');
      root.style.setProperty('--submenu-title', '#cbd5e1');
      root.style.setProperty('--logo-filter', 'drop-shadow(0 0 8px rgba(255,255,255,0.15))');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, title: '设备维护通知', content: '城北运维中心2号泵站将于明日进行例行检查。', time: '10分钟前' },
    { id: 2, title: '任务分配', content: '您有一条新的安检任务待处理。', time: '1小时前' },
  ];

  const reminders = [
    { id: 1, title: '待办确认', content: '确认滨海新区泰达大街管网测绘报告。', time: '今天' },
    { id: 2, title: '过期提醒', content: '5号车辆保险即将到期，请及时续费。', time: '昨天' },
  ];

  return (
    <header className="h-16 bg-white border border-slate-100 rounded-xl pl-5 pr-8 flex items-center justify-between shadow-sm shrink-0 relative z-[10]">
      <div className="flex items-center">
        <h1 className="text-[16px] font-bold text-[#333] tracking-tight">
          智慧能源综合监管平台
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* 天气信息 */}
        <div className="flex items-center space-x-3.5 px-4 py-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
          <svg className="w-7 h-7 text-amber-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-[#333] leading-none">12℃ ~ 26℃</span>
            <span className="text-[14px] text-[#666] font-normal mt-1">晴天 / 滨海新区</span>
          </div>
        </div>

        {/* 联系客服按钮 */}
        <div className="relative group flex items-center h-full">
          <button className="w-11 h-11 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100 transition-all flex items-center justify-center shrink-0 shadow-sm bg-white">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 18v-6a9 9 0 0118 0v6" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 00-2-2H3z" />
            </svg>
          </button>
          
          <div className="absolute top-full right-[-10px] w-[260px] pt-3 z-[10000] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto translate-y-2 group-hover:translate-y-0">
            <div className="bg-white rounded-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.12)] border border-slate-100 py-6 px-6 space-y-6">
              {/* 客服微信 */}
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-4">
                  <div className="text-slate-400 shrink-0">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.22 3C4.15 3 1 6.13 1 10.15c0 1.95.83 3.73 2.16 5.03L2.24 18.5l3.22-1.78c.84.28 1.76.43 2.76.43.34 0 .68-.02 1.01-.06-.18-.53-.28-1.1-.28-1.69 0-2.83 2.29-5.12 5.12-5.12.63 0 1.23.11 1.78.33.14-.65.22-1.32.22-2.01C16.15 4.54 12.61 3 8.22 3zM6 8.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM18.88 12.3c-2.83 0-5.12 2.29-5.12 5.12 0 2.83 2.29 5.13 5.12 5.13.67 0 1.3-.13 1.88-.36l2 1.11-.57-2.09c.89-.92 1.44-2.17 1.44-3.54 0-2.83-2.31-5.37-5.75-5.37zm-1.5 3.5c-.41 0-.75-.34-.75-.75s.34-.75.75-.75.75.34.75.75-.34.75-.75.75zm3.12 0c-.41 0-.75-.34-.75-.75s.34-.75.75-.75.75.34.75.75-.34.75-.75.75z"/>
                    </svg>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-[12px] font-normal text-slate-500 leadership-none">客服微信</span>
                    <span className="text-[14px] font-normal text-slate-700 tracking-tight">604038645</span>
                  </div>
                </div>
                <div className="relative group/qr w-10 h-10 rounded border border-slate-100 bg-slate-50 p-0.5 shrink-0 ml-2 cursor-zoom-in">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=wechat_604038645" className="w-full h-full object-contain" alt="WeChat QR" />
                  <div className="absolute right-full mr-5 top-1/2 -translate-y-1/2 w-44 h-52 bg-white rounded-2xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.3)] border border-slate-100 p-4 opacity-0 scale-90 translate-x-4 pointer-events-none group-hover/qr:opacity-100 group-hover/qr:scale-100 group-hover/qr:translate-x-0 transition-all duration-300 z-[10000] origin-right flex flex-col items-center">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=wechat_604038645" className="w-full h-auto object-contain rounded-lg" alt="Large WeChat QR" />
                    <p className="mt-3 text-[11px] font-black text-slate-400 tracking-wider">请扫描识别微信</p>
                    <div className="absolute top-1/2 -translate-y-1/2 -right-2 w-4 h-4 bg-white border-r border-t border-slate-100 rotate-45"></div>
                  </div>
                </div>
              </div>

              {/* QQ客服 */}
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-4">
                  <div className="text-slate-400 shrink-0">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm5.4 13.91c-.42.87-.93 1.34-1.46 1.49-.66.18-1.39-.06-2.07-.63-.38.54-.85.83-1.41.83s-1.03-.29-1.41-.83c-.68.57-1.41.81-2.07.63-.53-.15-1.04-.62-1.46-1.49-.44-.92-.61-2.1-.61-3.21 0-2.82 2.24-5.1 5-5.1h.5c2.76 0 5 2.28 5 5.1.01 1.11-.16 2.29-.6 3.21zM9.5 10c-.55 0-1 .45-1 1s.45-1 1 1 1-.45 1-1-.45-1-1-1zm5 0c-.55 0-1 .45-1 1s.45-1 1 1 1-.45 1-1-.45-1-1-1z"/>
                    </svg>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-[12px] font-normal text-slate-500 leadership-none">QQ客服</span>
                    <span className="text-[14px] font-normal text-slate-700 tracking-tight">604038645</span>
                  </div>
                </div>
                <div className="relative group/qr w-10 h-10 rounded border border-slate-100 bg-slate-50 p-0.5 shrink-0 ml-2 cursor-zoom-in">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=qq_604038645" className="w-full h-full object-contain" alt="QQ QR" />
                  <div className="absolute right-full mr-5 top-1/2 -translate-y-1/2 w-44 h-52 bg-white rounded-2xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.3)] border border-slate-100 p-4 opacity-0 scale-90 translate-x-4 pointer-events-none group-hover/qr:opacity-100 group-hover/qr:scale-100 group-hover/qr:translate-x-0 transition-all duration-300 z-[10000] origin-right flex flex-col items-center">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=qq_604038645" className="w-full h-auto object-contain rounded-lg" alt="Large QQ QR" />
                    <p className="mt-3 text-[11px] font-black text-slate-400 tracking-wider">请扫描识别QQ</p>
                    <div className="absolute top-1/2 -translate-y-1/2 -right-2 w-4 h-4 bg-white border-r border-t border-slate-100 rotate-45"></div>
                  </div>
                </div>
              </div>

              {/* 客服电话 */}
              <div className="flex items-start space-x-4">
                <div className="text-slate-400 shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79c1.44 2.82 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1H7c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-[12px] font-normal text-slate-500 leadership-none">客服电话:</span>
                  <span className="text-[14px] font-normal text-slate-700 tracking-tight whitespace-nowrap">025-57916333-888</span>
                </div>
              </div>

              <div className="border-t border-slate-100/80 my-1"></div>

              {/* 工作时间 */}
              <div className="flex items-start space-x-4">
                <div className="text-slate-400 shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <span className="text-[12px] font-normal text-slate-500 leadership-none">工作时间</span>
                  <span className="text-[14px] font-normal text-slate-700 tracking-tight leading-tight">周一 ~ 周五 (08:30-17:30)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 通知图标与弹窗 */}
        <div className="relative group flex items-center h-full">
          <button className="relative w-11 h-11 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100 transition-all flex items-center justify-center shrink-0 shadow-sm bg-white">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm"></span>
          </button>

          <div className="absolute top-full right-[-8px] w-64 pt-2 z-[10000] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto translate-y-1 group-hover:translate-y-0">
            <div className="bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden">
              <div className="flex bg-slate-50 border-b border-slate-100">
                <button 
                  onClick={() => setActiveNotifTab('通知')}
                  className={`flex-1 py-3 text-[12px] font-black transition-all ${activeNotifTab === '通知' ? 'bg-white text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  通知
                </button>
                <button 
                  onClick={() => setActiveNotifTab('提醒')}
                  className={`flex-1 py-3 text-[12px] font-black transition-all ${activeNotifTab === '提醒' ? 'bg-white text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  提醒
                </button>
              </div>
              <div className="p-2 max-h-72 overflow-y-auto custom-scrollbar">
                {(activeNotifTab === '通知' ? notifications : reminders).map(item => (
                  <div key={item.id} className="p-3 hover:bg-slate-50 rounded-xl transition-colors group/item cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[12px] font-black text-slate-700 group-hover/item:text-primary">{item.title}</span>
                      <span className="text-[12px] text-slate-300 font-medium">{item.time}</span>
                    </div>
                    <p className="text-[12px] text-slate-400 leading-relaxed truncate">{item.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="h-8 w-px bg-slate-100 mx-3"></div>

        {/* 用户信息区 */}
        <div 
          className="relative" 
          onMouseEnter={() => setIsUserMenuOpen(true)}
          onMouseLeave={() => setIsUserMenuOpen(false)}
        >
          <div 
            className={`flex items-center space-x-3 cursor-pointer group px-3 py-1.5 rounded-lg transition-all ${isUserMenuOpen ? 'bg-slate-50/80 shadow-inner' : 'hover:bg-slate-50/50'}`}
          >
            <div className="relative">
              <div className="w-11 h-11 rounded-full border-[2.5px] border-primary shadow-sm bg-white flex items-center justify-center overflow-hidden">
                <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col min-w-[70px]">
              <span className="text-[14px] font-black text-[#1e293b] leading-tight tracking-tight">系统管理员</span>
              <span className="text-[12px] text-[#94a3b8] font-bold mt-1 tracking-tight">管网运维中心</span>
            </div>
            <svg 
              className={`w-4 h-4 text-[#cbd5e1] transition-transform duration-500 ease-out ${isUserMenuOpen ? 'rotate-180 text-primary' : 'group-hover:text-slate-400'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* 用户下拉菜单 */}
          <div className={`absolute top-full right-0 pt-1.5 z-[10000] transition-all duration-300 origin-top-right ${
            isUserMenuOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 -translate-y-2 pointer-events-none'
          }`}>
            <div className="w-56 bg-white rounded-lg shadow-[0_20px_60px_-15px_rgba(0,0,0,0.18)] border border-slate-100 py-4 overflow-visible">
              <div className="px-4">
                <div className="flex items-center mb-4 text-slate-500">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center mr-3 border border-slate-100">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <span className="text-[13px] font-black uppercase tracking-widest text-slate-600 leading-none whitespace-nowrap">主题色配置</span>
                </div>
                <div className="flex justify-between items-center mb-3 px-1">
                  {themes.map((t) => (
                    <button 
                      key={t.id}
                      onClick={() => handleThemeChange(t)}
                      className="w-5 h-5 rounded-lg shadow-sm border border-transparent hover:border-primary/30 hover:scale-110 active:scale-95 transition-all flex items-center justify-center shrink-0 overflow-hidden group/theme"
                      style={{ backgroundColor: t.color }}
                      title={t.label}
                    >
                        <div className="w-2 h-2 rounded-full bg-white/20 border border-white/40 scale-0 group-hover/theme:scale-100 transition-transform"></div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mx-3 my-3 border-t border-slate-100/80"></div>
              <button className="w-full flex items-center px-4 py-3 text-slate-600 hover:bg-primary/5 hover:text-primary transition-colors group text-left">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mr-3 group-hover:bg-primary/10 transition-colors border border-transparent group-hover:border-primary/10">
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span className="text-[13px] font-bold">修改密码</span>
              </button>
              <div className="mx-3 my-2 border-t border-slate-100/60"></div>
              <button className="w-full flex items-center px-4 py-3 text-rose-500 hover:bg-rose-50 transition-colors group text-left">
                <div className="w-8 h-8 rounded-lg bg-rose-50/30 flex items-center justify-center mr-3 group-hover:bg-rose-50 transition-colors">
                  <svg className="w-4 h-4 fill-rose-500" viewBox="0 0 24 24">
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[13px] font-bold">退出系统</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
