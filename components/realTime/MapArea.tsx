
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_MAP_POINTS, SiteListItem } from '../../constants.tsx';

declare const L: any;

const TIANDITU_KEY = 'fe4040f5a64c1a079f0f847df997a792';

// 轨迹回放控制条组件
const PlaybackControl: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  trajectoryId?: string;
}> = ({ isOpen, onClose, trajectoryId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const intervalRef = useRef<any>(null);

  const totalSeconds = 180;
  
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSeconds = (progress / 100) * totalSeconds;

  useEffect(() => {
    if (isPlaying && !isDragging) {
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return Math.min(prev + (0.5 * speed), 100);
        });
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed, isDragging]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgress(parseFloat(e.target.value));
  };

  const reset = () => {
    setProgress(0);
    setIsPlaying(false);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-6 duration-500 ease-out w-[calc(100%-200px)] max-w-[900px] min-w-[480px]">
      <div className="bg-white/95 backdrop-blur-md rounded-lg border border-slate-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] px-4 py-2.5 flex items-center space-x-4 w-full relative">
        <button type="button" onClick={onClose} className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-white border border-slate-100 rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors z-20">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"/></svg>
        </button>

        <button 
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all active:scale-90 shrink-0 ${isPlaying ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-primary text-white shadow-lg shadow-primary/30'}`}
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>

        <div className="flex-1 flex items-center space-x-4">
          <div className="flex-1 relative h-1.5 group">
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="0.1"
              value={progress} 
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-1.5 appearance-none bg-slate-100 rounded-full cursor-pointer accent-primary z-10"
            />
            <div className="absolute inset-0 h-1.5 bg-primary/20 rounded-full pointer-events-none overflow-hidden">
               <div className="h-full bg-primary transition-all duration-75" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          <span className="text-[12px] font-mono text-slate-500 shrink-0 min-w-[90px] text-right tracking-tighter tabular-nums">
            {formatTime(currentSeconds)} / {formatTime(totalSeconds)}
          </span>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg p-0.5">
            {[0.5, 1, 2, 4].map(s => (
              <button 
                type="button"
                key={s} 
                onClick={() => setSpeed(s)}
                className={`px-2.5 py-0.5 text-[12px] font-normal rounded-md transition-all ${speed === s ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {s}x
              </button>
            ))}
          </div>
          <button type="button" onClick={reset} className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="重置">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// 辅助组件：信息展示行 - 统一设置左侧标签为 12px 颜色 #666
const InfoRow = ({ label, value, icon, dense = false, valueClassName = "text-[#333]" }: { label: string, value?: string, icon?: React.ReactNode, dense?: boolean, valueClassName?: string }) => (
  <div className={`flex items-center ${dense ? 'py-0.5' : 'py-2'} group transition-all`}>
    <div className="flex items-center shrink-0 w-[105px] space-x-2.5">
      <div className="w-5 h-5 flex items-center justify-center text-primary transition-colors opacity-80">
        {icon || <div className="w-1 h-1 bg-slate-300 rounded-full" />}
      </div>
      <span className="text-[#666] text-[12px] font-normal leading-none truncate whitespace-nowrap">
        {label}
      </span>
    </div>
    <span className={`${valueClassName} text-[14px] font-normal leading-relaxed flex-1 truncate pl-1 whitespace-nowrap`} title={value}>
      {value || '--'}
    </span>
  </div>
);

// 辅助组件：弹窗头部
const PopupHeader = ({ title, onClose }: { title: string, onClose: () => void }) => (
  <div className="h-12 px-6 flex items-center justify-between border-b border-slate-50 shrink-0 bg-white rounded-t-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
    <div className="flex items-center space-x-3">
      <div className="w-1.5 h-4 bg-primary rounded-full shadow-[0_2px_6px_rgba(154,107,255,0.4)]"></div>
      <span className="text-[16px] font-bold text-[#333] tracking-tight">{title}</span>
    </div>
    <button type="button" onClick={onClose} className="text-slate-300 hover:text-rose-500 p-2 transition-all active:scale-90">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" /></svg>
    </button>
  </div>
);

// 员工详细档案弹窗
const PersonnelPopup: React.FC<{ person: any; position: { x: number, y: number }; onClose: () => void; }> = ({ person, position, onClose }) => {
  return (
    <div className="absolute bg-white rounded-2xl shadow-[0_45px_100px_-20px_rgba(0,0,0,0.35)] border border-slate-100 z-[1000] overflow-visible flex flex-col animate-in zoom-in-95 fade-in duration-300 ease-out"
      style={{ width: '520px', minHeight: '440px', left: `${position.x}px`, top: `${position.y - 28}px`, transform: 'translate(-50%, -100%)' }}>
      <div className="absolute bottom-[-11px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.05)]"></div>
      
      <div className="shrink-0 bg-white rounded-t-2xl relative z-10">
        <PopupHeader title="人员信息" onClose={onClose} />
        <div className="px-8 pt-4 pb-6 border-b border-slate-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-5">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl border-4 border-slate-50 shadow-inner overflow-hidden ring-1 ring-slate-200 bg-slate-100">
                  <img src={person.image} className="w-full h-full object-cover" alt={person.name} />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-2 border-white rounded-full shadow-md animate-pulse ${person.status === 'offline' ? 'bg-slate-400' : 'bg-emerald-500'}`}></div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-3 mb-2.5">
                  <h2 className="text-[22px] font-black text-slate-800 tracking-tight leading-none">{person.name || '人员'}</h2>
                  <div className="flex items-center space-x-2 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm shrink-0">
                    <div className={`w-1.5 h-1.5 rounded-full ${person.status === 'offline' ? 'bg-slate-300' : 'bg-emerald-500 animate-pulse'}`}></div>
                    <span className="text-[11px] font-black text-emerald-600">上班中</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-slate-600 text-[14px] font-medium font-mono leading-none shrink-0 tracking-tight">123456</span>
                  <div className="w-px h-3 bg-slate-300 shrink-0"></div>
                  <div className="text-slate-700 text-[14px] font-medium leading-none whitespace-nowrap overflow-hidden text-ellipsis">
                    XXX公司 · 运维事业部
                  </div>
                </div>
              </div>
            </div>
            <button type="button" className="text-[14px] font-normal text-primary hover:text-primary-hover transition-colors flex items-center group/more-p shrink-0">
              <span>更多</span>
              <svg className="w-3.5 h-3.5 ml-0.5 transition-transform group-hover/more-p:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-3 custom-scrollbar">
        <div className="animate-in fade-in duration-500 pt-2">
          <section className="w-full space-y-0.5">
            <InfoRow 
              label="联系电话" 
              value="15002299778 / 13800138000" 
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>} 
              valueClassName="text-[#333] font-normal font-mono text-[14px]"
            />
            <InfoRow 
              label="工作时间" 
              value="08:30:00 - 17:30:00" 
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>} 
              valueClassName="text-[#333] font-normal font-mono text-[14px]"
            />
            <InfoRow label="职　　称" value="高级安检员" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M12 15l-2 5L9 9l11 4-5 2zm0 0l4 4" /></svg>} />
            <InfoRow label="角　　色" value="系统管理员" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} />
            <InfoRow label="当前位置" value="天津市滨海新区泰达大街与开发区大街交汇处" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>} />
            <InfoRow label="设备名称" value="T-Core Pro V2" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 9h6v6H9z" /></svg>} />
            <InfoRow label="OS版本号" value="v6.168.229" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} />
            <InfoRow label="APP版本" value="v1.2.0" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 h-2a1 1 0 01-1-1v-6z" /></svg>} />
            <InfoRow 
              label="序列号" 
              value="SN864502041234567" 
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>} 
              valueClassName="text-[#333] text-[14px] font-normal font-mono"
            />
          </section>
        </div>
      </div>

      <div className="h-11 px-8 border-t border-slate-50 bg-slate-50/40 shrink-0 rounded-b-2xl flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <svg className="w-4 h-4 text-primary opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[#666] text-[12px] font-normal">同步时间</span>
          <span className="text-[#333] text-[14px] font-normal font-mono tracking-tight pl-0.5">10:45:00</span>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-50/50 rounded-full border border-emerald-100/50">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)] animate-pulse"></div>
          <span className="text-emerald-600 text-[12px] font-normal tracking-tight">GPS有效</span>
        </div>
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h2v-2H3v2zm4 0h2v-5H7v5zm4 0h2V9h-2v9zm4 0h2V5h-2v13z" />
          </svg>
          <span className="text-[#666] text-[12px] font-normal">4G 正常</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-7 h-3.5 rounded-[3px] border border-slate-300 p-0.5 flex items-center bg-white">
            <div className="h-full bg-emerald-500 rounded-[1px] shadow-sm" style={{ width: '85%' }}></div>
          </div>
          <span className="text-[#333] text-[14px] font-normal font-mono">85%</span>
        </div>
      </div>
    </div>
  );
};

// 统计计算表格弹窗
const StatsTablePopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const statsData = [
    { type: '人员', total: 12, online: 10, offline: 2 },
    { type: '车辆', total: 5, online: 4, offline: 1 },
    { type: '无人机', total: 3, online: 3, offline: 0 },
    { type: '隐患点', total: 8, online: '-', offline: '-' },
    { type: '管线(m)', total: '4,280', online: '-', offline: '-' },
  ];

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.25)] border border-slate-100 z-[2001] w-[450px] overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300">
      <PopupHeader title="区域要素统计报告" onClose={onClose} />
      <div className="p-5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#e9e9e9]">
              <th className="p-3 text-[14px] font-normal text-[#333]">要素类型</th>
              <th className="p-3 text-[14px] font-normal text-[#333] text-center">总计</th>
              <th className="p-3 text-[14px] font-normal text-[#333] text-center">在线/正常</th>
              <th className="p-3 text-[14px] font-normal text-[#333] text-center">离线/异常</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {statsData.map((item) => (
              <tr key={item.type} className="hover:bg-slate-100/80 transition-colors">
                <td className="p-3 text-[14px] font-normal text-[#666]">{item.type}</td>
                <td className="p-3 text-[14px] text-[#666] text-center font-mono">{item.total}</td>
                <td className="p-3 text-[14px] text-[#666] text-center font-mono">{item.online}</td>
                <td className="p-3 text-[14px] text-[#666] text-center font-mono">{item.offline}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-5 pt-4 border-t border-slate-50 flex justify-end">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white text-[14px] font-normal rounded-lg hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            完成分析
          </button>
        </div>
      </div>
    </div>
  );
};

// 全部任务列表弹窗
const AllTasksPopup: React.FC<{ data: any; onClose: () => void; }> = ({ data, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const mockAllTasks = [...data.tasks, ...data.tasks, ...data.tasks].map((t, i) => ({...t, id: `${t.id}-${i}`}));
  const totalPages = Math.ceil(mockAllTasks.length / pageSize);
  const currentTasks = mockAllTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.25)] border border-slate-100 z-[2001] w-[640px] overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300">
      <div className="h-14 px-6 flex items-center justify-between border-b border-slate-50 bg-slate-50/30">
        <div className="flex items-center space-x-2.5">
          <div className="w-1.5 h-4 bg-primary rounded-full shadow-[0_0_8px_rgba(154,107,255,0.4)]"></div>
          <span className="text-[16px] text-[#333] font-bold tracking-tight">{data.name} 的全部任务</span>
        </div>
        <button type="button" onClick={onClose} className="text-slate-300 hover:text-rose-500 transition-all p-1.5 active:scale-90"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg></button>
      </div>
      <div className="p-4 flex-1 min-h-[480px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-[#e9e9e9]">
              <th className="py-3 text-[14px] font-normal text-[#333] w-12 text-left uppercase tracking-wider">序号</th>
              <th className="py-3 text-[14px] font-normal text-[#333] w-24 pl-2 uppercase tracking-wider">计划编号</th>
              <th className="py-3 text-[14px] font-normal text-[#333] w-28 uppercase tracking-wider">工作片区</th>
              <th className="py-3 text-[14px] font-normal text-[#333] uppercase tracking-wider">任务名称</th>
              <th className="py-3 text-[14px] font-normal text-[#333] text-right pr-4 uppercase tracking-wider">完成时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {currentTasks.map((task, idx) => (
              <tr key={task.id} className="hover:bg-slate-100/80 transition-colors group">
                <td className="py-3.5 text-[14px] font-normal text-[#666] text-left">{(currentPage - 1) * pageSize + idx + 1}</td>
                <td className="py-3.5 pl-2 text-[14px] font-normal text-[#666] uppercase tracking-tight">T-{((currentPage - 1) * pageSize + idx + 1).toString().padStart(3, '0')}</td>
                <td className="py-3.5"><div className="text-[14px] font-normal text-[#666] whitespace-nowrap">泰达片区</div></td>
                <td className="py-3.5 pr-2"><div className="text-[14px] font-normal text-[#666] group-hover:text-slate-900 transition-colors">{task.address}</div></td>
                <td className="py-3.5 text-[14px] font-normal text-[#666] font-mono text-right pr-4 tracking-tighter tabular-nums">{task.status === 'completed' ? task.time : '--'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-5 bg-slate-50/20 border-t border-slate-100 flex items-center justify-center space-x-8">
        <span className="text-[12px] text-slate-500 font-normal tracking-tight">共 {mockAllTasks.length} 项数据</span>
        <div className="flex items-center space-x-2">
          <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="w-8 h-8 rounded-lg border border-[#ddd] bg-white flex items-center justify-center text-slate-500 transition-all hover:bg-slate-50 hover:border-slate-400 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2.5"/></svg></button>
          <div className="flex items-center space-x-1.5 px-2">{Array.from({ length: totalPages }).map((_, i) => (<button type="button" key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg text-[12px] font-normal transition-all duration-300 active:scale-90 ${currentPage === i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>{i + 1}</button>))}</div>
          <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="w-8 h-8 rounded-lg border border-[#ddd] bg-white flex items-center justify-center text-slate-500 transition-all hover:bg-slate-50 hover:border-slate-400 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2.5"/></svg></button>
        </div>
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * MAIN MAP AREA COMPONENT
 * ============================================================================
 */
export interface MapAreaProps {
  selectedTaskDetail?: any;
  onTaskClose?: () => void;
  allTasksViewData?: any;
  onAllTasksClose?: () => void;
  selectedSiteDetail?: any;
  onSiteClose?: () => void;
  playbackState?: { isOpen: boolean; trajectoryId?: string } | null;
  onPlaybackClose?: () => void;
  onPreviewImage?: (urls: string[], idx: number) => void;
  onShowReportDetail?: (report: any) => void;
}

export const MapArea: React.FC<MapAreaProps> = ({ 
  selectedTaskDetail, 
  onTaskClose, 
  allTasksViewData, 
  onAllTasksClose,
  selectedSiteDetail,
  onSiteClose,
  playbackState,
  onPlaybackClose,
  onPreviewImage,
  onShowReportDetail
}) => {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  
  const [selectedPersonnel, setSelectedPersonnel] = useState<any>(null);
  const [selectedLatLng, setSelectedLatLng] = useState<any>(null);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);
  const [mapType, setMapType] = useState<'vec' | 'img' | 'white'>('vec');

  const [layers, setLayers] = useState([
    { id: 'personnel', label: '人员', checked: true, icon: '👤', type: 'personnel' },
    { id: 'vehicle', label: '车辆', checked: true, icon: '🚗', type: 'vehicle' },
    { id: 'drone', label: '无人机', checked: true, icon: '🚁', type: 'drone' },
    { id: 'site', label: '工地', checked: true, icon: '🏗️', type: 'site' },
    { id: 'gis', label: 'GIS管网', checked: false, icon: '🌐', type: 'gis' },
  ]);

  const gisLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (gisLayerRef.current) gisLayerRef.current.remove();
    
    const gisLayer = layers.find(l => l.id === 'gis');
    if (gisLayer?.checked) {
      gisLayerRef.current = L.featureGroup().addTo(mapRef.current);
      // Mock some pipes
      L.polyline([[39.0145, 117.7126], [39.0185, 117.7145]], { color: '#10b981', weight: 4, opacity: 0.6 }).addTo(gisLayerRef.current);
      L.polyline([[39.0145, 117.7126], [39.0125, 117.7105]], { color: '#10b981', weight: 4, opacity: 0.6 }).addTo(gisLayerRef.current);
      L.polyline([[39.0185, 117.7145], [39.0155, 117.7215]], { color: '#10b981', weight: 4, opacity: 0.6 }).addTo(gisLayerRef.current);
    }
  }, [layers]);

  const measureLayerRef = useRef<any>(null);
  const measurePointsRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;
    
    const onMapClick = (e: any) => {
      if (activeTool === 'identify') {
        L.popup()
          .setLatLng(e.latlng)
          .setContent(`<div class="p-2"><div class="text-[12px] font-bold text-slate-800 mb-1">坐标查询</div><div class="text-[11px] text-slate-500 font-mono">Lat: ${e.latlng.lat.toFixed(6)}</div><div class="text-[11px] text-slate-500 font-mono">Lng: ${e.latlng.lng.toFixed(6)}</div></div>`)
          .openOn(mapRef.current);
      } else if (activeTool === 'measure') {
        const latlng = e.latlng;
        measurePointsRef.current.push(latlng);
        
        L.circleMarker(latlng, { radius: 4, color: '#3b82f6', fillOpacity: 1 }).addTo(measureLayerRef.current);
        
        if (measurePointsRef.current.length > 1) {
          const prev = measurePointsRef.current[measurePointsRef.current.length - 2];
          const dist = latlng.distanceTo(prev);
          L.polyline([prev, latlng], { color: '#3b82f6', weight: 3, dashArray: '5, 5' }).addTo(measureLayerRef.current);
          
          const midPoint = L.latLng((latlng.lat + prev.lat) / 2, (latlng.lng + prev.lng) / 2);
          L.marker(midPoint, {
            icon: L.divIcon({
              className: 'measure-tooltip',
              html: `<div class="bg-white px-2 py-1 rounded shadow-sm border border-slate-200 text-[12px] font-mono font-bold text-primary whitespace-nowrap">${(dist / 1000).toFixed(2)}km</div>`,
              iconSize: [60, 20],
              iconAnchor: [30, 10]
            })
          }).addTo(measureLayerRef.current);
        }
      }
    };

    if (activeTool === 'measure') {
      mapRef.current.getContainer().style.cursor = 'crosshair';
      measureLayerRef.current = L.featureGroup().addTo(mapRef.current);
    } else if (activeTool === 'identify') {
      mapRef.current.getContainer().style.cursor = 'help';
    }

    mapRef.current.on('click', onMapClick);
    
    return () => {
      mapRef.current?.off('click', onMapClick);
      if (mapRef.current) mapRef.current.getContainer().style.cursor = '';
      if (measureLayerRef.current) {
        measureLayerRef.current.remove();
        measureLayerRef.current = null;
      }
      measurePointsRef.current = [];
    };
  }, [activeTool]);

  useEffect(() => {
    renderMarkers();
  }, [layers]);

  const toggleLayer = (id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, checked: !l.checked } : l));
  };

  useEffect(() => {
    if (!mapRef.current) return;
    const updatePopupPosition = () => {
      if (selectedLatLng) {
        const point = mapRef.current.latLngToContainerPoint(selectedLatLng);
        setPopupPos({ x: point.x, y: point.y });
      }
    };
    mapRef.current.on('move zoom viewreset', updatePopupPosition);
    return () => { mapRef.current?.off('move zoom viewreset', updatePopupPosition); };
  }, [selectedLatLng]);

  useEffect(() => {
    if (typeof L === 'undefined' || !mapContainerRef.current || mapRef.current) return;
    mapRef.current = L.map(mapContainerRef.current, { 
      center: [39.0145, 117.7126], 
      zoom: 14, 
      zoomControl: false, 
      attributionControl: false 
    });
    
    // 天地图矢量底图
    L.tileLayer(`https://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TIANDITU_KEY}`).addTo(mapRef.current);
    // 天地图矢量注记
    L.tileLayer(`https://t0.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TIANDITU_KEY}`).addTo(mapRef.current);

    renderMarkers();
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  const renderMarkers = () => {
    if (!mapRef.current) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const activeLayerIds = new Set(layers.filter(l => l.checked).map(l => l.id));

    MOCK_MAP_POINTS.forEach((point) => {
      // 简单模拟：根据ID分配类型
      let type = 'personnel';
      if (point.id.startsWith('v')) type = 'vehicle';
      if (point.id.startsWith('d')) type = 'drone';
      if (point.id.startsWith('s')) type = 'site';

      if (!activeLayerIds.has(type)) return;

      const lat = 39.0145 + (point.y - 50) * 0.001;
      const lng = 117.7126 + (point.x - 50) * 0.002;
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="relative flex items-center justify-center group/marker"><div class="absolute w-12 h-12 rounded-full bg-primary/20 scale-0 group-hover/marker:scale-100 transition-transform duration-300"></div><div class="w-10 h-10 rounded-lg border-2 border-white overflow-hidden shadow-xl bg-white relative z-10 transition-transform group-hover/marker:-translate-y-1"><img src="${point.image}" class="w-full h-full object-cover" /></div></div>`,
        iconSize: [40, 40], iconAnchor: [20, 20]
      });
      const marker = L.marker([lat, lng], { icon }).addTo(mapRef.current);
      marker.on('click', (e: any) => { 
        setSelectedPersonnel(point);
        setSelectedLatLng(e.latlng);
        const pos = mapRef.current.latLngToContainerPoint(e.latlng);
        setPopupPos({ x: pos.x, y: pos.y }); 
        
        // 自动居中视图，稍微向上偏移一点以便容纳弹窗
        const currentZoom = mapRef.current.getZoom();
        const markerProjected = mapRef.current.project(e.latlng, currentZoom);
        const targetProjected = markerProjected.subtract([0, 200]); 
        const targetLatLng = mapRef.current.unproject(targetProjected, currentZoom);
        mapRef.current.setView(targetLatLng, currentZoom, { animate: true });
      });
      markersRef.current.push(marker);
    });
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else if (document.exitFullscreen) document.exitFullscreen();
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-50">
      <div ref={mapContainerRef} className="w-full h-full z-0"></div>
      
      {/* 轨迹回放控制 */}
      <PlaybackControl 
        isOpen={!!playbackState?.isOpen} 
        onClose={() => onPlaybackClose?.()} 
        trajectoryId={playbackState?.trajectoryId}
      />

      {/* 任务详情浮窗 (简单模拟) */}
      {selectedTaskDetail && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[2000] w-[380px] overflow-hidden animate-in zoom-in-95 duration-300">
           <PopupHeader title="任务详情" onClose={onTaskClose!} />
           <div className="p-6 space-y-4">
             <div className="flex items-start space-x-3">
               <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeWidth="2"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2"/></svg>
               </div>
               <div className="flex flex-col">
                 <span className="text-[12px] text-slate-400 font-normal uppercase">地理位置</span>
                 <span className="text-[14px] text-[#333] font-medium leading-relaxed mt-0.5">{selectedTaskDetail.address}</span>
               </div>
             </div>
             <div className="flex items-center space-x-3">
               <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2"/></svg>
               </div>
               <div className="flex flex-col">
                 <span className="text-[12px] text-slate-400 font-normal uppercase">完成时间</span>
                 <span className="text-[14px] text-[#333] font-medium font-mono mt-0.5">{selectedTaskDetail.time}</span>
               </div>
             </div>
           </div>
        </div>
      )}

      {/* 工地详情浮窗 (简单模拟) */}
      {selectedSiteDetail && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[2000] w-[420px] overflow-hidden animate-in zoom-in-95 duration-300">
          <PopupHeader title="工地档案" onClose={onSiteClose!} />
          <div className="p-6">
            <h4 className="text-[18px] font-black text-slate-800 mb-4">{selectedSiteDetail.name}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-[12px] text-slate-400">负责人</span>
                <span className="text-[14px] font-medium text-[#333]">{selectedSiteDetail.manager}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] text-slate-400">状态</span>
                <span className="text-[14px] font-medium text-emerald-500">正常监护</span>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => onShowReportDetail?.(selectedSiteDetail)}
              className="w-full mt-6 h-10 bg-primary/5 text-primary text-[14px] font-bold rounded-xl hover:bg-primary/10 transition-colors"
            >
              查看完整回报明细
            </button>
          </div>
        </div>
      )}

      {/* 查看全部任务列表 */}
      {allTasksViewData && (
        <AllTasksPopup data={allTasksViewData} onClose={() => onAllTasksClose?.()} />
      )}

      {/* 人员信息弹窗 */}
      {selectedPersonnel && (
        <PersonnelPopup 
          person={selectedPersonnel} 
          position={popupPos} 
          onClose={() => { setSelectedPersonnel(null); setSelectedLatLng(null); }} 
        />
      )}

      {/* 统计弹窗 */}
      {activeTool === 'stats' && <StatsTablePopup onClose={() => setActiveTool(null)} />}

      {/* 图层控制面板 */}
      {isLayerPanelOpen && (
        <div className="absolute top-20 right-6 z-40 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200 p-3 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <span className="text-[14px] font-bold text-slate-800">图层控制</span>
            <button onClick={() => setIsLayerPanelOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg>
            </button>
          </div>
          <div className="space-y-2">
            {layers.map(layer => (
              <label key={layer.id} className="flex items-center justify-between group cursor-pointer py-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[14px]">{layer.icon}</span>
                  <span className="text-[13px] text-slate-600 group-hover:text-slate-900 transition-colors">{layer.label}</span>
                </div>
                <div 
                  onClick={() => toggleLayer(layer.id)}
                  className={`w-8 h-4 rounded-full transition-all relative ${layer.checked ? 'bg-primary' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${layer.checked ? 'left-4.5' : 'left-0.5'}`}></div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 地图类型切换 */}
      <div className="absolute top-6 right-6 z-40 flex bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-slate-200 p-1 overflow-hidden">
        {[
          { id: 'vec', label: '矢量' },
          { id: 'img', label: '影像' },
          { id: 'white', label: '白板' }
        ].map(type => (
          <button 
            key={type.id}
            onClick={() => setMapType(type.id as any)}
            className={`px-3 py-1 text-[12px] font-bold rounded-md transition-all ${mapType === type.id ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* 地图控制按钮 */}
      <div className="absolute bottom-6 left-6 z-40 flex flex-col space-y-3">
        <button 
          title="居中视图"
          type="button"
          onClick={() => mapRef.current?.setView([39.0145, 117.7126], 14, { animate: true })} 
          className="w-11 h-11 bg-white rounded-lg shadow-lg border border-slate-100 flex items-center justify-center text-slate-500 hover:text-primary transition-all active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 011 1v4a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeWidth="2.5"/></svg>
        </button>
        <button 
          title="图层管理"
          type="button"
          onClick={() => setIsLayerPanelOpen(!isLayerPanelOpen)} 
          className={`w-11 h-11 rounded-lg shadow-lg border flex items-center justify-center transition-all active:scale-95 ${
            isLayerPanelOpen ? 'bg-primary text-white border-primary shadow-primary/30' : 'bg-white text-slate-500 hover:text-primary border-slate-100'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" strokeWidth="2.5"/></svg>
        </button>
        <button 
          title="测量工具"
          type="button"
          onClick={() => setActiveTool(activeTool === 'measure' ? null : 'measure')} 
          className={`w-11 h-11 rounded-lg shadow-lg border flex items-center justify-center transition-all active:scale-95 ${
            activeTool === 'measure' ? 'bg-primary text-white border-primary shadow-primary/30' : 'bg-white text-slate-500 hover:text-primary border-slate-100'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14.121 14.121L19 19m-7-7l7 7m-7-7l-2.879 2.879M12 12L9.121 9.121m0 0L5 5m4.121 4.121L19 19M5 5l7 7" strokeWidth="2.5"/></svg>
        </button>
        <button 
          title="要素识别"
          type="button"
          onClick={() => setActiveTool(activeTool === 'identify' ? null : 'identify')} 
          className={`w-11 h-11 rounded-lg shadow-lg border flex items-center justify-center transition-all active:scale-95 ${
            activeTool === 'identify' ? 'bg-primary text-white border-primary shadow-primary/30' : 'bg-white text-slate-500 hover:text-primary border-slate-100'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l4 4" strokeWidth="2.5"/></svg>
        </button>
        <button 
          title="要素统计"
          type="button"
          onClick={() => setActiveTool(activeTool === 'stats' ? null : 'stats')} 
          className={`w-11 h-11 rounded-lg shadow-lg border flex items-center justify-center transition-all active:scale-95 ${
            activeTool === 'stats' ? 'bg-primary text-white border-primary shadow-primary/30' : 'bg-white text-slate-500 hover:text-primary border-slate-100'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeWidth="2.5"/></svg>
        </button>
        <button 
          title="刷新地图"
          type="button"
          onClick={() => { renderMarkers(); mapRef.current?.setView([39.0145, 117.7126], 14, { animate: true }); }}
          className="w-11 h-11 bg-white rounded-lg shadow-lg border border-slate-100 flex items-center justify-center text-slate-500 hover:text-primary transition-all active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="2.5" /></svg>
        </button>
        <button 
          title="全屏显示"
          type="button"
          onClick={handleFullscreen} 
          className={`w-11 h-11 rounded-lg shadow-lg border flex items-center justify-center transition-all active:scale-95 ${
            isFullscreen ? 'bg-primary text-white border-primary shadow-primary/30' : 'bg-white text-slate-500 hover:text-primary border-slate-100'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            {isFullscreen ? <path d="M4 14h6v6M20 10h-6V4M14 20v-6h6M10 4v6H4" /> : <path d="M15 3h6v6M9 21H3v-6M21 15v6h-6M3 9V3h6" />}
          </svg>
        </button>
      </div>
    </div>
  );
};
