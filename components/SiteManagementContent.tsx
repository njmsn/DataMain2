
import React, { useState } from 'react';
import { Pagination } from './Pagination';

interface SiteRecord {
  id: string;
  reporter: string;
  reportDate: string;
  status: 'pending' | 'monitoring' | 'error';
  siteName: string;
  address: string;
  grade: '1' | '2' | '3';
  industry: string;
  method: string;
  days: number;
  dangerDesc: string;
}

const MOCK_SITES: SiteRecord[] = [
  { id: '1', reporter: '胡影', reportDate: '2025/05/19 11:55', status: 'pending', siteName: '中南路雨水管网改造工程(建邱段)', address: '江苏省南京市建邺区沙洲街道停车场', grade: '2', industry: '市政工程', method: '明挖回填', days: 347, dangerDesc: '土方塌陷、管线受损' },
  { id: '2', reporter: '三商', reportDate: '2025/05/07 13:30', status: 'monitoring', siteName: '建邱中心4012地块桩基施工', address: '江苏省南京市建邺区沙洲街道江东中路363号新华传媒...', grade: '2', industry: '建筑工程', method: '静压桩', days: 609, dangerDesc: '震动沉降' },
  { id: '3', reporter: '王建国', reportDate: '2025/05/20 09:15', status: 'monitoring', siteName: '鼓楼北扩容及道路硬化二期', address: '南京市鼓楼区中山路18号', grade: '1', industry: '市政设施', method: '非开挖顶管', days: 12, dangerDesc: '沉井风险' },
  { id: '4', reporter: '李秀才', reportDate: '2025/05/21 14:20', status: 'error', siteName: '河西金鹰世界外围绿化提升', address: '南京市建邺区江东中路金鹰世界', grade: '3', industry: '园林绿化', method: '小型机具', days: 5, dangerDesc: '浅层光缆' },
];

export const SiteManagementContent: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(['1']));
  const prevSelectedSiteRef = React.useRef<SiteRecord | null>(null);

  const handleRowClick = (id: string) => {
    setSelectedIds(new Set([id]));
  };

  const handleCheckboxClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === MOCK_SITES.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(MOCK_SITES.map(s => s.id)));
    }
  };

  // Get the currently selected site data
  const currentSite = MOCK_SITES.find(site => selectedIds.has(site.id));
  if (currentSite) {
    prevSelectedSiteRef.current = currentSite;
  }
  const displaySite = currentSite || prevSelectedSiteRef.current;

  return (
    <div className="flex flex-col h-full bg-[#f1f3f6] p-2.5 gap-2.5 overflow-hidden items-center">
      {/* 顶部工具栏 */}
      <div className="w-full max-w-[1550px] flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm shrink-0">
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 bg-[#9a6bff] text-white text-xs font-bold rounded-lg hover:bg-[#8558eb] transition-colors flex items-center">
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            新增
          </button>
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">修改</button>
          <button className="px-4 py-2 bg-white border border-slate-200 text-rose-500 text-xs font-bold rounded-lg hover:bg-rose-50 hover:border-rose-100 transition-colors">删除</button>
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center">
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 8l-4 4m0 0l-4-4m4 4V4" /></svg>
            导出
          </button>
        </div>
        
        {/* 优化后的搜索框 - 圆角弧度已调整为与下方按钮一致的 rounded-lg */}
        <div className="relative group">
          <input 
            type="text" 
            placeholder="搜索工地名称..." 
            className="w-64 h-9 pl-10 pr-4 bg-slate-50/50 border border-slate-200/80 rounded-lg text-[12px] font-medium text-slate-600 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-[#9a6bff]/10 focus:border-[#9a6bff]/50 outline-none transition-all duration-300"
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#9a6bff] transition-colors duration-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* 下方三栏布局 */}
      <div className="w-full max-w-[1550px] flex-1 flex gap-2.5 min-h-0 overflow-hidden">
        
        {/* 左侧：查询条件卡片 */}
        <div className="w-60 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col shrink-0">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            多维度查询
          </h3>
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
            <div className="space-y-1">
              <label className="text-[12px] font-bold text-slate-500">工地名称</label>
              <input type="text" className="w-full h-8 px-3 bg-slate-50 border border-slate-100 rounded text-xs outline-none focus:border-[#9a6bff]/50 transition-colors" placeholder="输入名称关键字" />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-bold text-slate-500">施工单位</label>
              <input type="text" className="w-full h-8 px-3 bg-slate-50 border border-slate-100 rounded text-xs outline-none focus:border-[#9a6bff]/50 transition-colors" placeholder="搜索单位名称" />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-bold text-slate-500">监护等级</label>
              <select className="w-full h-8 px-2 bg-slate-50 border border-slate-100 rounded text-xs outline-none text-slate-600">
                <option>全部等级</option>
                <option>一级</option>
                <option>二级</option>
                <option>三级</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-slate-500">当前状态</label>
              <div className="grid grid-cols-2 gap-2">
                {['待处理', '监护中', '已完工', '异常'].map(s => (
                  <label key={s} className="flex items-center space-x-2 cursor-pointer group">
                    <div className="w-3.5 h-3.5 rounded border border-slate-200 group-hover:border-[#9a6bff] transition-colors"></div>
                    <span className="text-[12px] font-medium text-slate-600">{s}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          {/* 操作按钮组：查询与重置 */}
          <div className="flex gap-2.5 mt-4">
            <button className="flex-1 py-2 bg-[#9a6bff] text-white text-xs font-bold rounded-lg hover:bg-[#8558eb] transition-all active:scale-95 shadow-md shadow-[#9a6bff]/20">
              查询
            </button>
            <button className="flex-1 py-2 bg-white border border-slate-200 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95">
              重置
            </button>
          </div>
        </div>

        {/* 中间：表格卡片 */}
        <div className="flex-1 min-w-0 max-w-[1200px] bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full border-collapse min-w-[1250px]">
              <thead className="sticky top-0 bg-slate-50/80 backdrop-blur-md z-10 border-b border-slate-100">
                <tr className="text-left">
                  <th className="p-3 w-12 text-center" onClick={handleSelectAll}>
                    <div className={`w-4 h-4 border rounded mx-auto cursor-pointer flex items-center justify-center transition-all ${
                      selectedIds.size === MOCK_SITES.length && MOCK_SITES.length > 0 ? 'bg-[#3b82f6] border-[#3b82f6] text-white' : 'border-slate-300 hover:border-[#3b82f6]'
                    }`}>
                      {selectedIds.size === MOCK_SITES.length && MOCK_SITES.length > 0 && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      {selectedIds.size > 0 && selectedIds.size < MOCK_SITES.length && <div className="w-2 h-2 bg-[#3b82f6] rounded-sm"></div>}
                    </div>
                  </th>
                  <th className="p-3 text-[12px] font-black text-slate-400 uppercase tracking-wider w-16 text-center">序号</th>
                  <th className="p-3 text-[12px] font-black text-slate-400 uppercase tracking-wider">最后回报人</th>
                  <th className="p-3 text-[12px] font-black text-slate-400 uppercase tracking-wider">最后回报日期</th>
                  <th className="p-3 text-[12px] font-black text-slate-400 uppercase tracking-wider">状态</th>
                  <th className="p-3 text-[12px] font-black text-slate-400 uppercase tracking-wider w-56">工地名称</th>
                  <th className="p-3 text-[12px] font-black text-slate-400 uppercase tracking-wider w-64">工地地址</th>
                  <th className="p-3 text-[12px] font-black text-slate-400 uppercase tracking-wider text-center">监护等级</th>
                  <th className="p-3 text-[12px] font-black text-slate-400 uppercase tracking-wider">施工行业</th>
                  <th className="p-3 text-[12px] font-black text-slate-400 uppercase tracking-wider">施工方式</th>
                  <th className="p-3 text-[12px] font-black text-slate-400 uppercase tracking-wider text-center">累计监护(天)</th>
                  <th className="p-3 text-[12px] font-black text-slate-400 uppercase tracking-wider">危险描述</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {MOCK_SITES.map((site, index) => {
                  const isSelected = selectedIds.has(site.id);
                  return (
                    <tr 
                      key={site.id} 
                      className={`hover:bg-slate-50/50 transition-colors group cursor-pointer ${isSelected ? 'bg-blue-50/30' : ''}`}
                      onClick={() => handleRowClick(site.id)}
                    >
                      <td className="p-3 text-center" onClick={(e) => handleCheckboxClick(e, site.id)}>
                        <div className={`w-4 h-4 border rounded mx-auto flex items-center justify-center transition-all ${
                          isSelected ? 'bg-[#3b82f6] border-[#3b82f6] text-white' : 'border-slate-300 group-hover:border-[#3b82f6]'
                        }`}>
                          {isSelected && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                      </td>
                      <td className="p-3 text-center text-xs font-bold text-slate-400">{index + 1}</td>
                      <td className="p-3 text-xs font-bold text-slate-700">{site.reporter}</td>
                      <td className="p-3 text-xs text-slate-400 font-medium font-mono whitespace-nowrap">{site.reportDate}</td>
                      <td className="p-3">
                        {site.status === 'pending' && <span className="px-2.5 py-0.5 bg-blue-50 text-[#3b82f6] text-[12px] font-bold rounded-full border border-blue-100/50">待处理</span>}
                        {site.status === 'monitoring' && <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-[12px] font-bold rounded-full border border-emerald-100/50">监护中</span>}
                        {site.status === 'error' && <span className="px-2.5 py-0.5 bg-rose-50 text-rose-500 text-[12px] font-bold rounded-full border border-rose-100/50">异常</span>}
                      </td>
                      <td className="p-3 text-xs font-bold text-slate-900 leading-relaxed">{site.siteName}</td>
                      <td className="p-3 text-xs text-slate-500 leading-relaxed font-medium">{site.address}</td>
                      <td className="p-3 text-center">
                        {site.grade === '1' && <span className="inline-block px-2 py-0.5 bg-rose-50 text-rose-500 border border-rose-200 text-[12px] font-black rounded-md">一级</span>}
                        {site.grade === '2' && <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-500 border border-amber-200 text-[12px] font-black rounded-md">二级</span>}
                        {site.grade === '3' && <span className="inline-block px-2 py-0.5 bg-sky-50 text-sky-500 border border-sky-200 text-[12px] font-black rounded-md">三级</span>}
                      </td>
                      <td className="p-3 text-xs text-slate-600 font-medium">{site.industry}</td>
                      <td className="p-3 text-xs text-slate-600 font-medium">{site.method}</td>
                      <td className="p-3 text-center text-xs font-black text-slate-800 font-mono">{site.days}</td>
                      <td className="p-3 text-xs text-slate-400 font-medium leading-relaxed">{site.dangerDesc}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {/* 表格底部分页预览 */}
          <div className="h-11 border-t border-slate-50 flex items-center justify-between px-6 bg-slate-50/30 shrink-0">
            <Pagination total={4} className="w-full justify-between" />
          </div>
        </div>

        {/* 右侧：详情面板 + 导航栏 */}
        <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm flex shrink-0 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden ${selectedIds.size > 0 ? 'w-[380px]' : 'w-14'}`}>
          
          {/* 详情内容区 */}
          <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ${selectedIds.size > 0 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
            {displaySite && (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* 头部信息 */}
                <div className="p-5 border-b border-slate-50 bg-slate-50/30 relative">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-[16px] font-bold text-slate-800 leading-snug pr-4">{displaySite.siteName}</h2>
                    <div className="flex items-center space-x-2 shrink-0">
                      {displaySite.status === 'pending' && <span className="px-2.5 py-1 bg-blue-50 text-[#3b82f6] text-[12px] font-bold rounded-md border border-blue-100/50">待处理</span>}
                      {displaySite.status === 'monitoring' && <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[12px] font-bold rounded-md border border-emerald-100/50">监护中</span>}
                      {displaySite.status === 'error' && <span className="px-2.5 py-1 bg-rose-50 text-rose-500 text-[12px] font-bold rounded-md border border-rose-100/50">异常</span>}
                      <button 
                        onClick={() => setSelectedIds(new Set())}
                        className="w-7 h-7 rounded-md hover:bg-slate-200/50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors ml-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start text-[13px] text-slate-500 leading-relaxed">
                    <svg className="w-4 h-4 mr-1.5 shrink-0 mt-0.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2"/></svg>
                    {displaySite.address}
                  </div>
                </div>

                {/* 详细字段 */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                  
                  {/* 基础属性 */}
                  <div>
                    <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#9a6bff] mr-2"></div>
                      基础属性
                    </h3>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                      <div>
                        <div className="text-[12px] text-slate-400 mb-1">监护等级</div>
                        <div className="text-[13px] font-bold text-slate-700">
                          {displaySite.grade === '1' && <span className="text-rose-500">一级监护</span>}
                          {displaySite.grade === '2' && <span className="text-amber-500">二级监护</span>}
                          {displaySite.grade === '3' && <span className="text-sky-500">三级监护</span>}
                        </div>
                      </div>
                      <div>
                        <div className="text-[12px] text-slate-400 mb-1">施工行业</div>
                        <div className="text-[13px] font-bold text-slate-700">{displaySite.industry}</div>
                      </div>
                      <div>
                        <div className="text-[12px] text-slate-400 mb-1">施工方式</div>
                        <div className="text-[13px] font-bold text-slate-700">{displaySite.method}</div>
                      </div>
                      <div>
                        <div className="text-[12px] text-slate-400 mb-1">累计监护</div>
                        <div className="text-[13px] font-bold text-slate-700 font-mono">{displaySite.days} <span className="text-[12px] font-normal text-slate-400">天</span></div>
                      </div>
                    </div>
                  </div>

                  {/* 危险描述 */}
                  <div>
                    <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-2"></div>
                      危险描述
                    </h3>
                    <div className="bg-rose-50/50 border border-rose-100/50 rounded-xl p-3 text-[13px] text-slate-700 leading-relaxed">
                      {displaySite.dangerDesc}
                    </div>
                  </div>

                  {/* 回报信息 */}
                  <div>
                    <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2"></div>
                      最新回报
                    </h3>
                    <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#9a6bff] font-bold text-xs shadow-sm">
                          {displaySite.reporter.charAt(0)}
                        </div>
                        <div>
                          <div className="text-[13px] font-bold text-slate-700">{displaySite.reporter}</div>
                          <div className="text-[12px] text-slate-400">巡检员</div>
                        </div>
                      </div>
                      <div className="text-[12px] font-mono text-slate-500 bg-white px-2 py-1 rounded border border-slate-100 shadow-sm">
                        {displaySite.reportDate}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* 右侧导航栏 */}
          <div className="w-14 flex flex-col items-center py-4 shrink-0 border-l border-slate-50 bg-white relative z-10">
            <div className="flex flex-col items-center space-y-4">
              {/* 基本信息 */}
              <div className="relative group">
                <button className="w-10 h-10 rounded-xl bg-[#9a6bff] text-white shadow-lg shadow-[#9a6bff]/30 flex items-center justify-center transition-all active:scale-95">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-50">
                  基本信息
                  <div className="absolute top-1/2 -translate-y-1/2 -right-1 border-[5px] border-transparent border-l-slate-800"></div>
                </div>
              </div>
              
              {/* 处理日志 */}
              <div className="relative group">
                <button className="w-10 h-10 rounded-xl text-slate-400 hover:text-[#9a6bff] hover:bg-[#9a6bff]/10 flex items-center justify-center transition-all active:scale-95">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </button>
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-50">
                  处理日志
                  <div className="absolute top-1/2 -translate-y-1/2 -right-1 border-[5px] border-transparent border-l-slate-800"></div>
                </div>
              </div>

              {/* 隐患记录 */}
              <div className="relative group">
                <button className="w-10 h-10 rounded-xl text-slate-400 hover:text-[#9a6bff] hover:bg-[#9a6bff]/10 flex items-center justify-center transition-all active:scale-95">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </button>
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-50">
                  隐患记录
                  <div className="absolute top-1/2 -translate-y-1/2 -right-1 border-[5px] border-transparent border-l-slate-800"></div>
                </div>
              </div>
            </div>
            <div className="mt-auto space-y-3">
               <div className="w-1 h-1 rounded-full bg-slate-200 mx-auto"></div>
               <div className="w-1 h-1 rounded-full bg-slate-200 mx-auto"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
