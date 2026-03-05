import React, { useState, useEffect, useRef } from 'react';
import { MOCK_MAP_POINTS } from '../constants.tsx';

declare const L: any;

const toQuadKey = (x: number, y: number, z: number) => {
  let quadKey = '';
  for (let i = z; i > 0; i--) {
    let digit = 0;
    const mask = 1 << (i - 1);
    if ((x & mask) !== 0) digit++;
    if ((y & mask) !== 0) digit += 2;
    quadKey += digit.toString();
  }
  return quadKey;
};

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
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-6 duration-500 ease-out">
      {/* 整体圆角减小为 rounded-lg，内边距略微压缩，宽度增加到 900px */}
      <div className="bg-white/95 backdrop-blur-md rounded-lg border border-slate-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] px-3.5 py-2.5 flex items-center space-x-4 w-[900px]">
        <button onClick={onClose} className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-white border border-slate-100 rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>

        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all active:scale-90 shrink-0 ${isPlaying ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-primary text-white shadow-lg shadow-primary/30'}`}
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>

        <div className="flex-1 flex items-center space-x-3">
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
              className="absolute inset-0 w-full h-1.5 appearance-none bg-slate-100 rounded-full cursor-pointer accent-primary"
            />
            <div className="absolute inset-0 h-1.5 bg-primary/20 rounded-full pointer-events-none overflow-hidden">
               <div className="h-full bg-primary transition-all duration-75" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          <span className="text-[12px] font-mono text-slate-400 font-bold shrink-0 min-w-[32px] text-right tracking-tighter">
            {Math.floor(progress)}%
          </span>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg p-0.5">
            {[0.5, 1, 2, 4].map(s => (
              <button 
                key={s} 
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 text-[12px] font-normal rounded-md transition-all ${speed === s ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {s}x
              </button>
            ))}
          </div>
          <button onClick={reset} className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="重置">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// 辅助组件：信息展示行
const InfoRow = ({ label, value, isBoldValue = false }: { label: string, value?: string, isBoldValue?: boolean }) => (
  <div className="flex items-start py-0.5 border-b border-slate-50/50 last:border-0">
    <span className="text-[#94a3b8] shrink-0 w-[90px] text-[13px] font-normal leading-relaxed">{label}</span>
    <span className={`text-[#334155] text-[13px] leading-relaxed flex-1 break-all ${isBoldValue ? 'font-medium' : 'font-normal'}`}>
      {value || '--'}
    </span>
  </div>
);

// 辅助组件：弹窗头部
const PopupHeader = ({ title, onClose }: { title: string, onClose: () => void }) => (
  <div className="h-11 px-5 flex items-center justify-between border-b border-slate-50 shrink-0 bg-white rounded-t-2xl">
    <div className="flex items-center space-x-2.5">
      <div className="w-1.5 h-4 bg-primary rounded-full shadow-[0_0_8px_rgba(154,107,255,0.4)]"></div>
      <span className="text-[14px] font-normal text-slate-700 tracking-tight">{title}</span>
    </div>
    <button onClick={onClose} className="text-slate-300 hover:text-rose-500 p-1.5 rounded-xl transition-all hover:bg-rose-50">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" /></svg>
    </button>
  </div>
);

// 员工详细档案弹窗
const PersonnelPopup: React.FC<{ person: any; position: { x: number, y: number }; onClose: () => void; }> = ({ person, position, onClose }) => {
  const [activeTab, setActiveTab] = useState('实时');
  
  return (
    <div className="absolute bg-white rounded-2xl shadow-[0_35px_80px_-15px_rgba(0,0,0,0.3)] border border-slate-100 z-[1000] overflow-visible flex flex-col animate-in zoom-in-95 fade-in duration-500 ease-out"
      style={{ 
        width: '330px', 
        height: '480px', 
        left: `${position.x}px`, 
        top: `${position.y - 28}px`, 
        transform: 'translate(-50%, -100%)' 
      }}>
      
      <div className="absolute bottom-[-11px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.05)]"></div>
      
      <PopupHeader title="员工详细档案" onClose={onClose} />
      
      <div className="px-5 pt-3 pb-2 shrink-0">
        <div className="flex justify-between items-start mb-2.5">
          <div className="flex flex-col">
            <h2 className="text-[18px] font-normal text-[#1e293b] tracking-tighter">{person.name || '董仲良'}</h2>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-primary text-[12px] font-normal opacity-80 tracking-widest uppercase">ID: {person.id.toUpperCase() || 'M2'}</span>
              <span className="text-slate-200 text-xs">•</span>
              <span className="text-emerald-500 text-[11px] font-normal uppercase tracking-tighter">在岗执行</span>
            </div>
          </div>
          <div className="relative">
            <img src={person.image} className="w-10 h-10 rounded-xl border-2 border-white shadow-xl object-cover shadow-slate-200" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-md"></div>
          </div>
        </div>

        <div className="flex bg-slate-50 border border-slate-100 p-0.5 rounded-xl mb-0.5">
          {['实时', '计划', '历史'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`flex-1 py-1.5 text-[12px] font-normal rounded-lg transition-all ${activeTab === tab ? 'bg-white text-primary shadow-[0_2px_8px_rgba(0,0,0,0.05)]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-2 custom-scrollbar">
        {activeTab === '实时' && (
          <div className="animate-in fade-in duration-300">
            <div className="space-y-0">
              <InfoRow label="职位" value="管网安检员" />
              <InfoRow label="版本号" value="v6.168.229" />
              <InfoRow label="IMEI" value="864502041234567" />
              <InfoRow label="电话" value="15002299778" />
              <InfoRow label="位置" value="天津市滨海新区泰达大街" />
              <InfoRow label="状态" value="巡检中 (正常)" />
              <InfoRow label="上班" value="2025-05-22 08:30:12" />
              <InfoRow label="下班" value="--" />
              <InfoRow label="同步" value="2025-05-22 10:45:00" />
              <InfoRow label="角色" value="普通巡检员" />
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-50 pb-2">
               <div className="flex items-center justify-between mb-2">
                 <span className="text-[11px] font-normal text-slate-400 uppercase tracking-[0.1em]">进度明细</span>
                 <div className="flex items-center space-x-3">
                   <div className="flex items-center space-x-1">
                     <svg className="w-3.5 h-3.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 10.88v5.77a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7.35a2 2 0 0 1 2-2h13.5M21 10.88V9.12A2.12 2.12 0 0 0 18.88 7H17.5" strokeWidth="2.5"/></svg>
                     <span className="text-[12px] font-normal text-slate-700">12%</span>
                   </div>
                   <div className="flex items-center space-x-1">
                     <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
                     <span className="text-[12px] font-normal text-slate-700">GPS: 离线</span>
                   </div>
                 </div>
               </div>
               <div className="flex items-center space-x-3">
                 <div className="flex-1 h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50 shadow-inner">
                   <div className="h-full bg-primary rounded-full shadow-[0_0_12px_rgba(154,107,255,0.4)] transition-all duration-1000" style={{ width: '66%' }}></div>
                 </div>
                 <span className="text-[12px] font-bold text-primary/80 shrink-0 min-w-[32px] text-right">85%</span>
               </div>
            </div>
          </div>
        )}
        {activeTab === '计划' && (
          <div className="py-16 flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-5 border border-slate-100/50">
              <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <span className="text-[13px] font-normal text-slate-300 tracking-[0.3em] uppercase">暂无计划任务</span>
          </div>
        )}
        {activeTab === '历史' && (
          <div className="py-1 animate-in fade-in duration-300">
            {[
              { time: '2026/01/16: 08:45 -', desc: '张扬2026/01/09的计划' },
              { time: '2026/01/16: 08:45 -', desc: '张扬2026/01/09的计划' },
              { time: '2026/01/16: 08:59 - 10:43', desc: '张扬2026/01/09的计划' },
              { time: '2026/01/15: 09:12 - 17:30', desc: '张扬2026/01/08的计划' },
            ].map((item, i) => (
              <div key={i} className="py-3.5 border-b border-slate-50 last:border-0">
                <div className="text-[12.5px] text-slate-400 mb-1.5 font-normal tracking-tight">{item.time}</div>
                <div className="text-[12.5px] text-slate-600 leading-relaxed font-normal">{item.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 全部任务列表弹窗
const AllTasksPopup: React.FC<{ data: any; onClose: () => void; }> = ({ data, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const mockAllTasks = [...data.tasks, ...data.tasks, ...data.tasks].map((t, i) => ({...t, id: `${t.id}-${i}`}));
  const displayTotal = mockAllTasks.length;
  const totalPages = Math.ceil(displayTotal / pageSize);
  const currentTasks = mockAllTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.25)] border border-slate-100 z-[2001] w-[560px] overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300">
      <div className="h-14 px-6 flex items-center justify-between border-b border-slate-50 bg-slate-50/30">
        <div className="flex items-center space-x-2.5"><div className="w-1 h-4 bg-primary rounded-full"></div><span className="text-[13px] text-slate-700 font-bold">{data.name} 的全部任务</span></div>
        <button onClick={onClose} className="text-slate-300 hover:text-rose-500 transition-all p-1.5 hover:bg-rose-50 rounded-xl"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2"/></svg></button>
      </div>
      <div className="p-4 flex-1 min-h-[480px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-3 text-[12px] font-bold text-slate-400 w-12 text-center">序号</th>
              <th className="pb-3 text-[12px] font-bold text-slate-400 w-24 pl-2">计划编号</th>
              <th className="pb-3 text-[12px] font-bold text-slate-400">任务名称</th>
              <th className="pb-3 text-[12px] font-bold text-slate-400 text-right pr-4">完成时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {currentTasks.map((task, idx) => (
              <tr key={task.id} className="hover:bg-slate-50 transition-colors group">
                <td className="py-3 text-[12px] font-bold text-slate-400 text-center">{(currentPage - 1) * pageSize + idx + 1}</td>
                <td className="py-3 pl-2 text-[12px] font-bold text-slate-700 uppercase tracking-tight">T-{((currentPage - 1) * pageSize + idx + 1).toString().padStart(3, '0')}</td>
                <td className="py-3 pr-2"><div className="text-[12px] font-normal text-slate-600 line-clamp-1">{task.address}</div></td>
                <td className="py-3 text-[12px] font-normal text-slate-400 font-mono text-right pr-4">{task.status === 'completed' ? task.time : '--'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between">
        <span className="text-[12px] text-slate-400 font-bold">共 {displayTotal} 项数据</span>
        <div className="flex items-center space-x-2">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-1.5 rounded-lg border border-slate-200 text-slate-400 disabled:opacity-30"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2.5"/></svg></button>
          <div className="flex items-center space-x-1">{Array.from({ length: totalPages }).map((_, i) => (<button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-7 h-7 rounded-lg text-[12px] font-bold ${currentPage === i + 1 ? 'bg-primary text-white' : 'text-slate-400 hover:bg-white'}`}>{i + 1}</button>))}</div>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-1.5 rounded-lg border border-slate-200 text-slate-400 disabled:opacity-30"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2.5"/></svg></button>
        </div>
      </div>
    </div>
  );
};

// 任务详情弹窗
const TaskDetailPopup: React.FC<{ task: any; onClose: () => void; }> = ({ task, onClose }) => {
  const [activeTab, setActiveTab] = useState('信息');
  const photoGroups = [{ date: '2025-05-22', photos: [{ id: 1, url: 'https://picsum.photos/seed/task1/200/200' }, { id: 2, url: 'https://picsum.photos/seed/task2/200/200' }] }];
  const reportLogs = [{ id: 1, reporter: '王力宏', time: '2025-05-22 10:45', status: '处理成功', type: 'success' }];

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.25)] border border-slate-100 z-[2000] w-[380px] overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300">
      <div className="h-14 px-6 flex items-center justify-between border-b border-slate-50 bg-slate-50/30">
        <div className="flex items-center space-x-2.5"><div className="w-1 h-4 bg-primary rounded-full"></div><span className="text-[13px] text-slate-700">任务详情</span></div>
        <button onClick={onClose} className="text-slate-300 hover:text-rose-500 transition-all p-1.5 rounded-xl"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2"/></svg></button>
      </div>
      <div className="px-6 pt-4 pb-1"><div className="flex space-x-8 border-b border-slate-100">{['信息', '图片', '回报'].map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-[13px] relative ${activeTab === tab ? 'text-primary' : 'text-slate-400'}`}>{tab}{activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></div>}</button>))}</div></div>
      <div className="flex-1 overflow-y-auto p-6 min-h-[280px]">
        {activeTab === '信息' && (<div><InfoRow label="任务编号" value={`T-${task.id.toUpperCase()}`} /><InfoRow label="地理位置" value={task.address} /><InfoRow label="负责人" value="王力宏" /></div>)}
        {activeTab === '图片' && (<div className="grid grid-cols-4 gap-2">{photoGroups[0].photos.map(p => (<img key={p.id} src={p.url} className="w-full h-12 rounded bg-slate-50 object-cover" />))}</div>)}
        {activeTab === '回报' && (<div className="space-y-4">{reportLogs.map(l => (<div key={l.id} className="text-[12px]">{l.status} - {l.time}</div>))}</div>)}
      </div>
    </div>
  );
};

export interface MapAreaProps {
  selectedTaskDetail?: any;
  onTaskClose?: () => void;
  allTasksViewData?: any;
  onAllTasksClose?: () => void;
  playbackState?: { isOpen: boolean; trajectoryId?: string } | null;
  onPlaybackClose?: () => void;
}

export const MapArea: React.FC<MapAreaProps> = ({ 
  selectedTaskDetail, 
  onTaskClose, 
  allTasksViewData, 
  onAllTasksClose,
  playbackState,
  onPlaybackClose 
}) => {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const baseLayersRef = useRef<{ [key: string]: any }>({});
  
  const [selectedPersonnel, setSelectedPersonnel] = useState<any>(null);
  const [selectedLatLng, setSelectedLatLng] = useState<any>(null);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [mapType, setMapType] = useState<string>('vec');

  const [layers, setLayers] = useState<any[]>([
    {
      id: 'basic',
      label: '基本图层',
      isOpen: true,
      checked: true,
      items: [
        { id: 'corp', label: '公司', checked: true, icon: <svg className="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L4 9v12h16V9l-8-6zm0 2.2l6 4.5V19h-3v-6H9v6H6v-7.3l6-4.5z"/></svg> },
        { id: 'person', label: '人员', checked: true, icon: <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg> },
        { id: 'station', label: '基站', checked: true, icon: <div className="w-4 h-4 rounded-full border-2 border-emerald-500"></div> },
        { id: 'task', label: '计划任务', checked: true, icon: <div className="w-4 h-4 rounded-full bg-lime-500"></div> },
      ]
    },
    {
      id: 'gis',
      label: 'GIS图层',
      isOpen: true,
      checked: true,
      items: [
        { id: 'pipe', label: '管线', checked: true, icon: <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12c4-4 8-4 12 0s8 4 12 0" transform="scale(0.8)"/></svg> },
        { id: 'valve', label: '阀门', checked: true, icon: <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l-4 4h8l-4-4zm0 20l4-4H8l4 4zM4 12l4-4v8l-4-4zm16 0l-4 4V8l4 4z"/></svg> },
      ]
    }
  ]);

  useEffect(() => {
    if (!mapRef.current) return;
    const updatePopupPosition = () => {
      if (selectedLatLng) {
        const point = mapRef.current.latLngToContainerPoint(selectedLatLng);
        setPopupPos({ x: point.x, y: point.y });
      }
    };
    mapRef.current.on('move zoom viewreset', updatePopupPosition);
    return () => {
      mapRef.current?.off('move zoom viewreset', updatePopupPosition);
    };
  }, [selectedLatLng]);

  useEffect(() => {
    if (typeof L === 'undefined' || !mapContainerRef.current || mapRef.current) return;
    mapRef.current = L.map(mapContainerRef.current, { center: [39.0145, 117.7126], zoom: 14, zoomControl: false, attributionControl: false });
    
    const BingTileLayer = L.TileLayer.extend({ 
      getTileUrl: function(coords: any) { 
        return L.Util.template(this._url, { s: this._getSubdomain(coords), quadkey: toQuadKey(coords.x, coords.y, coords.z) }); 
      } 
    });

    baseLayersRef.current = { 
      vec: new (BingTileLayer as any)('https://t{s}.tiles.virtualearth.net/tiles/r{quadkey}.jpeg?g=129&mkt=zh-cn&shading=hill', { subdomains: ['0', '1', '2', '3'] }),
      sat: new (BingTileLayer as any)('https://t{s}.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=129&mkt=zh-cn&shading=hill', { subdomains: ['0', '1', '2', '3'] })
    };

    baseLayersRef.current.vec.addTo(mapRef.current);
    renderMarkers();
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !baseLayersRef.current) return;
    Object.values(baseLayersRef.current).forEach(layer => {
      if (mapRef.current.hasLayer(layer)) mapRef.current.removeLayer(layer);
    });
    if (mapType === 'vec') baseLayersRef.current.vec.addTo(mapRef.current);
    else if (mapType === 'sat') baseLayersRef.current.sat.addTo(mapRef.current);
  }, [mapType]);

  const renderMarkers = () => {
    if (!mapRef.current) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    MOCK_MAP_POINTS.forEach((point) => {
      const lat = 39.0145 + (point.y - 50) * 0.001;
      const lng = 117.7126 + (point.x - 50) * 0.002;
      const currentPrimaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#9a6bff';
      const statusColor = point.status === 'normal' ? currentPrimaryColor : point.status === 'warning' ? '#f59e0b' : '#f43f5e';
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="relative flex items-center justify-center"><div class="absolute w-12 h-12 rounded-full opacity-40 ping-animation" style="background-color: ${statusColor}"></div><div class="w-10 h-10 rounded-lg border-2 border-white overflow-hidden shadow-xl bg-white relative z-10" style="border-color: ${statusColor}"><img src="${point.image}" class="w-full h-full object-cover" /></div></div>`,
        iconSize: [40, 40], iconAnchor: [20, 20]
      });
      const marker = L.marker([lat, lng], { icon }).addTo(mapRef.current);
      marker.on('click', (e: any) => { 
        const latlng = e.target.getLatLng();
        setSelectedPersonnel(point);
        setSelectedLatLng(latlng);
        const currentZoom = mapRef.current.getZoom();
        const markerProjected = mapRef.current.project(latlng, currentZoom);
        const targetProjected = markerProjected.subtract([0, 240]); 
        const targetLatLng = mapRef.current.unproject(targetProjected, currentZoom);
        mapRef.current.setView(targetLatLng, currentZoom, { animate: true });
        const pos = mapRef.current.latLngToContainerPoint(latlng);
        setPopupPos({ x: pos.x, y: pos.y }); 
      });
      markersRef.current.push(marker);
    });
  };

  const handleRefresh = () => {
    renderMarkers();
    mapRef.current?.setView([39.0145, 117.7126], 14, { animate: true });
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else if (document.exitFullscreen) document.exitFullscreen();
  };

  const toggleGroupFold = (id: string) => setLayers(prev => prev.map(g => g.id === id ? { ...g, isOpen: !g.isOpen } : g));
  const handleGroupCheck = (id: string) => setLayers(prev => prev.map(g => g.id === id ? { ...g, checked: !g.checked, items: g.items.map((i: any) => ({ ...i, checked: !g.checked })) } : g));
  const handleItemCheck = (groupId: string, itemId: string) => setLayers(prev => prev.map(g => g.id === groupId ? { ...g, items: g.items.map((i: any) => i.id === itemId ? { ...i, checked: !i.checked } : i) } : g));

  const MapControlButton = ({ icon, label, onClick, isActive = false, children }: { icon: React.ReactNode, label: string, onClick: () => void, isActive?: boolean, children?: React.ReactNode }) => (
    <div className="relative group/tool">
      <button 
        onClick={onClick}
        className={`w-11 h-11 rounded-lg shadow-lg flex items-center justify-center transition-all border active:scale-95 ${
          isActive 
          ? 'bg-primary text-white border-primary shadow-primary/30' 
          : 'bg-white text-slate-500 hover:text-primary border-slate-50 hover:shadow-xl'
        }`}
      >
        {icon}
      </button>
      {!isActive && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/tool:opacity-100 transition-all duration-200 translate-x-1 group-hover/tool:translate-x-0 z-[100] pointer-events-none">
          <div className="tooltip-bubble tooltip-arrow-left">{label}</div>
        </div>
      )}
      {isActive && children}
    </div>
  );

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-50">
      <div ref={mapContainerRef} className="w-full h-full z-0 transition-all duration-500 ease-in-out"></div>
      
      {/* 轨迹回放条 */}
      <PlaybackControl 
        isOpen={!!playbackState?.isOpen} 
        onClose={() => onPlaybackClose?.()} 
        trajectoryId={playbackState?.trajectoryId}
      />

      {/* 任务详情弹窗 */}
      {selectedTaskDetail && (
        <TaskDetailPopup task={selectedTaskDetail} onClose={() => onTaskClose?.()} />
      )}

      {/* “查看全部”任务列表弹窗 */}
      {allTasksViewData && (
        <AllTasksPopup data={allTasksViewData} onClose={() => onAllTasksClose?.()} />
      )}

      {/* 员工详细档案弹窗 */}
      {selectedPersonnel && (
        <PersonnelPopup 
          person={selectedPersonnel} 
          position={popupPos} 
          onClose={() => { setSelectedPersonnel(null); setSelectedLatLng(null); }} 
        />
      )}

      <div className="absolute top-6 right-6 z-40 flex flex-col items-end">
        <button onClick={() => setIsLayerPanelOpen(!isLayerPanelOpen)} className={`w-11 h-11 rounded-lg shadow-lg flex items-center justify-center transition-all active:scale-95 group border border-slate-50 ${isLayerPanelOpen ? 'bg-primary text-white shadow-primary/30' : 'bg-white text-slate-500 hover:text-primary hover:shadow-xl'}`}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 12 12 17 22 12" /><polyline points="2 17 12 22 22 17" />
          </svg>
        </button>
        <div className={`mt-3 w-56 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 transform origin-top-right ${isLayerPanelOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}>
          <div className="px-5 py-6 max-h-[70vh] overflow-y-auto custom-scrollbar select-none">
            {layers.map((group) => (
              <div key={group.id} className="mb-1">
                <div className="flex items-center group/title relative">
                  <button onClick={() => toggleGroupFold(group.id)} className="w-4 h-4 border border-slate-300 bg-white flex items-center justify-center text-[12px] text-slate-400 hover:text-slate-600 transition-colors mr-1.5 relative z-10">{group.isOpen ? '-' : '+'}</button>
                  <div onClick={() => handleGroupCheck(group.id)} className={`w-4 h-4 rounded border transition-colors flex items-center justify-center cursor-pointer mr-3 ${group.checked ? 'bg-[#3b82f6] border-[#3b82f6] text-white' : 'bg-white border-slate-300 hover:border-[#3b82f6]'}`}>
                    {group.checked && <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <span className="text-[12px] text-slate-700 tracking-tight font-normal">{group.label}</span>
                </div>
                {group.isOpen && (
                  <div className="relative ml-2 pt-1">
                    <div className="absolute left-[7px] top-0 bottom-[14px] w-px border-l border-dashed border-slate-300"></div>
                    {group.items.map((item: any) => (
                      <div key={item.id} className="relative flex items-center py-1.5 pl-6">
                        <div className="absolute left-[7px] top-1/2 -translate-y-1/2 w-4 h-px border-t border-dashed border-slate-300"></div>
                        <div onClick={() => handleItemCheck(group.id, item.id)} className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer mr-3 shrink-0 transition-colors ${item.checked ? 'bg-[#3b82f6] border-[#3b82f6] text-white' : 'bg-white border-slate-300'}`}>
                          {item.checked && <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                        <div className="flex items-center space-x-2.5 overflow-hidden">
                          <div className="w-4 h-4 flex items-center justify-center shrink-0">{item.icon}</div>
                          <span className={`text-[12px] transition-colors truncate font-normal ${item.checked ? 'text-slate-700' : 'text-slate-400'}`}>{item.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 z-40 flex flex-col space-y-2">
        <MapControlButton label="刷新" onClick={handleRefresh} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="2" /></svg>} />
        <MapControlButton label="总览" onClick={() => mapRef.current?.setView([39.0145, 117.7126], 14, { animate: true })} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 011 1v4a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeWidth="2"/></svg>} />
        <MapControlButton label="测量" isActive={activeTool === 'measure'} onClick={() => setActiveTool(activeTool === 'measure' ? null : 'measure')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 4.7a3.1 3.1 0 0 1 0 4.3L8.7 21.6a3.1 3.1 0 0 1-4.3 0L2.4 19.6a3.1 3.1 0 0 1 0-4.3L15.1 2.7a3.1 3.1 0 0 1 4.3 0l1.9 2z" /><path d="M7.5 10.5l2 2M10.5 7.5l2 2M13.5 4.5l2 2" /></svg>}>
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 flex flex-row items-center bg-white rounded-lg shadow-xl border border-slate-100 p-1.5 animate-in fade-in slide-in-from-left-3 duration-300 whitespace-nowrap">
            {['测距', '面积', '角度'].map((tool) => (
              <button key={tool} onClick={(e) => { e.stopPropagation(); }} className="px-4 py-2 rounded-md text-[12px] text-slate-500 hover:bg-primary/10 hover:text-primary transition-all font-normal">{tool}</button>
            ))}
          </div>
        </MapControlButton>
        <MapControlButton label="统计" isActive={activeTool === 'stats'} onClick={() => setActiveTool(activeTool === 'stats' ? null : 'stats')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeWidth="2"/></svg>}>
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 flex flex-row items-center bg-white rounded-lg shadow-xl border border-slate-100 p-1.5 animate-in fade-in slide-in-from-left-3 duration-300 whitespace-nowrap">
            {['绘图', '计算', '清除'].map((tool) => (
              <button key={tool} onClick={(e) => { e.stopPropagation(); }} className="px-4 py-2 rounded-md text-[12px] text-slate-500 hover:bg-primary/10 hover:text-primary transition-all font-normal">{tool}</button>
            ))}
          </div>
        </MapControlButton>
        <MapControlButton label="要素识别" isActive={activeTool === 'identify'} onClick={() => setActiveTool(activeTool === 'identify' ? null : 'identify')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" /><path d="m13 13 6 6" /></svg>} />
        <MapControlButton label="全屏" isActive={isFullscreen} onClick={handleFullscreen} icon={isFullscreen ? (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 14h6v6M20 10h-6V4M14 20v-6h6M10 4v6H4" /></svg>) : (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 3h6v6M9 21H3v-6M21 15v6h-6M3 9V3h6" /></svg>)} />
        <MapControlButton label="地图" isActive={activeTool === 'mapType'} onClick={() => setActiveTool(activeTool === 'mapType' ? null : 'mapType')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" strokeWidth="2"/></svg>} >
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 flex flex-row items-center bg-white rounded-lg shadow-xl border border-slate-100 p-1.5 animate-in fade-in slide-in-from-left-3 duration-300 whitespace-nowrap">
            {[{ id: 'vec', label: '道路图' }, { id: 'sat', label: '卫星图' }, { id: 'white', label: '白板' }].map((sub) => (
              <button key={sub.id} onClick={(e) => { e.stopPropagation(); setMapType(sub.id); }} className={`px-4 py-2 rounded-md text-[12px] transition-all font-normal ${mapType === sub.id ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50'}`}>{sub.label}</button>
            ))}
          </div>
        </MapControlButton>
      </div>
    </div>
  );
};