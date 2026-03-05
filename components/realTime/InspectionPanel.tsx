import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MOCK_PERSONNEL, MOCK_VEHICLES, MOCK_DRONES, MOCK_SITES_LIST, MOCK_ALARMS, MOCK_HAZARDS, MOCK_DRONE_LEAKS, MOCK_VEHICLE_LEAKS, SiteListItem } from '../../constants.tsx';

interface InspectionPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  onTaskClick?: (task: any) => void;
  onViewAllTasks?: (data: any) => void;
  onSiteClick?: (site: SiteListItem) => void;
  onPlaybackToggle?: (isOpen: boolean, trajectoryId: string) => void; 
  onPreviewImage?: (urls: string[], idx: number) => void;
}

// 子页签类型
type SubTab = 'personnel' | 'vehicle' | 'drone' | 'hazard' | 'alarm' | 'site' | 'droneLeak' | 'vehicleLeak' | 'video' | 'analysis' | 'report' | 'settings';
type DetailTab = 'trajectory' | 'task' | 'alarm' | 'log';
type SortField = 'department' | 'status';
type SortOrder = 'asc' | 'desc' | null;
type PickerMode = 'day' | 'month' | 'year';

interface TrajectoryItem {
  time: string;
  dist: string;
  dur: string;
}

interface TaskRecord {
  id: string;
  address: string;
  time: string;
  status: 'completed' | 'pending';
}

interface LogRecord {
  id: string;
  title: string;
  time: string;
}

const DRONE_PATH = `
  M7 10h10l1.5 2.5l-1.5 2.5h-10l-1.5-2.5z
  M5.5 11.5l-4 1 M18.5 11.5l4 1
  M1 11.5h1 M22 11.5h1
  M8 10l-3-3 M16 10l3-3
  M4 6.5h2 M18 6.5h2
  M11 15v2a1 1 0 0 0 2 0v-2 M10 18h4
`;

const SITE_ICON_PATH = `M12 3a9 9 0 0 0-9 9c0 .18.01.35.03.53A4 4 0 0 1 7 16h10a4 4 0 0 1 3.97-3.47c.02-.18.03-.35.03-.53a9 9 0 0 0-9-9zM12 5v4m-4-3l1.5 2.5m6.5-2.5L14.5 9`;

const VEHICLE_SOLID_PATH = "M17.34 5.97l.35 1.01c.04.11.01.24-.06.33-.07.09-.18.14-.3.14H6.67c-.12 0-.23-.05-.3-.14-.07-.09-.1-.22-.06-.33l.35-1.01c.1-.28.36-.47.66-.47h9.36c.3 0 .56.19.66.47zM19 12v7c0 .55-.45 1-1 1h-1c-.55 0-1-.45-1-1v-1H7v1c0 .55-.45 1-1 1H5c-.55 0-1-.45-1-1v-7c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2zm-4.5 2c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm-5 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z";

// 筛选复选框组件
const FilterCheckbox: React.FC<{ label: string; checked: boolean; onChange: () => void }> = ({ label, checked, onChange }) => (
  <label className="flex items-center space-x-2 cursor-pointer group select-none shrink-0">
    <div 
      onClick={onChange}
      className={`w-4 h-4 rounded-sm flex items-center justify-center transition-all ${
        checked ? 'bg-[#3b82f6] text-white' : 'border border-[#ddd] bg-white group-hover:border-[#3b82f6]'
      }`}
    >
      {checked && (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
    <span className="text-[14px] font-normal text-slate-600 group-hover:text-slate-800 whitespace-nowrap">{label}</span>
  </label>
);

export const InspectionPanel: React.FC<InspectionPanelProps> = ({ isOpen, onToggle, onTaskClick, onViewAllTasks, onSiteClick, onPlaybackToggle, onPreviewImage }) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('personnel');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('trajectory');
  
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const [isTaskPlanExpanded, setIsTaskPlanExpanded] = useState(true);
  
  const [selectedTrajectoryAction, setSelectedTrajectoryAction] = useState<string | null>(null);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<PickerMode>('day');
  const calendarRef = useRef<HTMLDivElement>(null);

  const [unreadTabs, setUnreadTabs] = useState<Set<SubTab>>(new Set(['hazard', 'alarm', 'site', 'droneLeak', 'vehicleLeak']));
  const [readItemIds, setReadItemIds] = useState<Set<string>>(new Set());

  // 菜单分页状态
  const [menuPage, setMenuPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // 部门选择状态
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState({ id: 'north', label: '城北运维中心', level: 1 });
  const [deptSearchQuery, setDeptSearchQuery] = useState('');
  const deptDropdownRef = useRef<HTMLDivElement>(null);
  const deptSearchInputRef = useRef<HTMLInputElement>(null);

  // 筛选对话框状态
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterSorting, setFilterSorting] = useState('状态+部门');
  const [filterStatus, setFilterStatus] = useState<Set<string>>(new Set(['全部', '下班', '正常', '信号中断', '未上班', 'GPS异常', 'GPS开', '电池没电']));
  const [filterType, setFilterType] = useState<Set<string>>(new Set(['全部', '安检人员']));

  const DEPARTMENTS = [
    { id: 'all', label: '全部部门', level: 0 },
    { id: 'group', label: '三商集团', level: 0 },
    { id: 'north', label: '城北运维中心', level: 1 },
    { id: 'south', label: '城南运维中心', level: 1 },
    { id: 'dispatch', label: '调度指挥中心', level: 1 },
    { id: 'station', label: '泰达运维站', level: 1 },
  ];

  const filteredDepartments = DEPARTMENTS.filter(d => 
    d.label.toLowerCase().includes(deptSearchQuery.toLowerCase())
  );

  const [siteCarouselIndex, setSiteCarouselIndex] = useState(0);
  
  const getTodayDate = () => new Date();
  const formatToYMD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [selectedDate, setSelectedDate] = useState(formatToYMD(getTodayDate()));
  const [viewDate, setViewDate] = useState(new Date(selectedDate.replace(/-/g, '/'))); 

  const handleDateSelect = (date: Date) => {
    setSelectedDate(formatToYMD(date));
    setIsCalendarOpen(false);
  };

  const handleTodayClick = () => {
    const today = getTodayDate();
    setSelectedDate(formatToYMD(today));
    setViewDate(today);
    setPickerMode('day');
    setIsCalendarOpen(false);
  };

  const handleClearClick = () => {
    setSelectedDate('');
    setIsCalendarOpen(false);
  };

  const changeView = (offset: number) => {
    if (pickerMode === 'day') {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
    } else if (pickerMode === 'month') {
      setViewDate(new Date(viewDate.getFullYear() + offset, viewDate.getMonth(), 1));
    } else if (pickerMode === 'year') {
      setViewDate(new Date(viewDate.getFullYear() + offset * 10, viewDate.getMonth(), 1));
    }
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(viewDate.getFullYear(), monthIndex, 1);
    setViewDate(newDate);
    setPickerMode('day');
  };

  const handleMonthPickerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPickerMode('month');
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(year, viewDate.getMonth(), 1);
    setViewDate(newDate);
    setPickerMode('month');
  };

  const generateCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    let firstDayOfWeek = firstDayOfMonth.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= lastDayOfMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    const totalDays = 42; 
    const remainingDays = totalDays - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    return days;
  };

  const generateYears = () => {
    const startYear = Math.floor(viewDate.getFullYear() / 10) * 10;
    const years = [];
    for (let i = -1; i < 11; i++) {
      years.push(startYear + i);
    }
    return years;
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '请选择日期';
    const d = new Date(dateStr.replace(/-/g, '/'));
    return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日`;
  };

  const handlePrevDay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedDate) return;
    const d = new Date(selectedDate.replace(/-/g, '/'));
    d.setDate(d.getDate() - 1);
    setSelectedDate(formatToYMD(d));
    setViewDate(d);
  };

  const handleNextDay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedDate) return;
    const d = new Date(selectedDate.replace(/-/g, '/'));
    d.setDate(d.getDate() + 1);
    setSelectedDate(formatToYMD(d));
    setViewDate(d);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
        setPickerMode('day'); 
      }
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(event.target as Node)) {
        setIsDeptOpen(false);
        setDeptSearchQuery(''); 
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isDeptOpen && deptSearchInputRef.current) {
      setTimeout(() => deptSearchInputRef.current?.focus(), 50);
    }
  }, [isDeptOpen]);

  const handleSortClick = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else if (sortOrder === 'desc') {
        setSortField(null);
        setSortOrder(null);
      }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const [selectedTrajectoryKeys, setSelectedTrajectoryKeys] = useState<Set<string>>(new Set());
  
  const toggleTrajectory = (itemId: string, index: number) => {
    const key = `${itemId}-${index}`;
    const newSet = new Set(selectedTrajectoryKeys);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setSelectedTrajectoryKeys(newSet);
  };

  const handleToggleAllTrajectories = (itemId: string) => {
    const newSet = new Set(selectedTrajectoryKeys);
    const itemSegments = trajectoryData.map((_, idx) => `${itemId}-${idx}`);
    const isAllSelected = itemSegments.every(key => newSet.has(key));
    
    if (isAllSelected) {
      itemSegments.forEach(key => newSet.delete(key));
    } else {
      itemSegments.forEach(key => newSet.add(key));
    }
    setSelectedTrajectoryKeys(newSet);
  };

  const subTabMapping: Record<string, SubTab[]> = {
    personnel: ['personnel', 'hazard', 'alarm', 'site'],
    vehicle: ['vehicle', 'drone', 'droneLeak', 'vehicleLeak']
  };

  const isPersonnelRelated = subTabMapping.personnel.includes(activeSubTab);
  const isDroneRelated = activeSubTab === 'drone' || activeSubTab === 'droneLeak';

  const handleTabClick = (tab: SubTab) => {
    if (unreadTabs.has(tab)) {
      const nextUnread = new Set(unreadTabs);
      nextUnread.delete(tab);
      setUnreadTabs(nextUnread);
    }
    if (!isOpen) {
      setActiveSubTab(tab);
      onToggle();
    } else {
      if (activeSubTab === tab) {
        onToggle();
      } else {
        const nextIsPersonnel = subTabMapping.personnel.includes(tab);
        if (nextIsPersonnel && activeDetailTab === 'alarm') setActiveDetailTab('trajectory');
        setActiveSubTab(tab);
        setExpandedItemId(null); 
      }
    }
  };

  const toggleExpand = (id: string) => {
    setReadItemIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    if (expandedItemId !== id) {
      setExpandedItemId(id);
      setSiteCarouselIndex(0); 
      setIsTaskPlanExpanded(true);
    } else {
      setExpandedItemId(null);
    }
  };

  const toggleFilterOption = (set: Set<string>, option: string, setter: (val: Set<string>) => void) => {
    const next = new Set(set);
    if (option === '全部') {
      return;
    }
    if (next.has(option)) next.delete(option);
    else next.add(option);
    setter(next);
  };

  const trajectoryData: TrajectoryItem[] = [
    { time: '08:30 - 09:15', dist: '2.4km', dur: '45min' },
    { time: '09:30 - 10:45', dist: '5.1km', dur: '75min' },
    { time: '11:00 - 12:00', dist: '3.8km', dur: '60min' }
  ];

  const mockTasks: TaskRecord[] = [
    { id: 't1', address: '天津市滨海新区顺民早点（百姓号）', time: '01/04 10:39', status: 'completed' },
    { id: 't2', address: '天津市滨海新区冯师傅纯碱馒头', time: '01/04 10:31', status: 'completed' },
    { id: 't3', address: '天津市滨海新区凯德米粉店（北区）', time: '01/05 09:20', status: 'pending' },
    { id: 't4', address: '天津市滨海新区万达广场商业街C区', time: '01/05 14:15', status: 'pending' },
    { id: 't5', address: '天津市滨海新区凯德广场西门', time: '01/05 15:30', status: 'pending' },
  ];

  const PERSONNEL_LOGS: LogRecord[] = [
    { id: 'pl1', title: '程序调至前台', time: '16:29' },
    { id: 'pl2', title: '解锁', time: '16:28' },
    { id: 'pl3', title: '锁屏', time: '16:28' },
  ];

  const VEHICLE_LOGS: LogRecord[] = [
    { id: 'vl1', title: '熄火', time: '11:06' },
    { id: 'vl2', title: '点火', time: '10:52' },
  ];

  const DRONE_LOGS: LogRecord[] = [
    { id: 'dl1', title: '降落', time: '11:06' },
    { id: 'dl2', title: '起飞', time: '10:52' },
  ];

  const AlarmItem: React.FC<{ alarm: any }> = ({ alarm }) => (
    <div key={alarm.id} className="flex items-center space-x-3 py-3 border-b border-slate-50 last:border-0 px-2 select-none">
      <div className="w-11 h-11 border border-rose-200 rounded-lg flex items-center justify-center shrink-0 bg-rose-50/30 overflow-hidden p-1.5 shadow-[0_1px_2px_rgba(244,63,94,0.05)]">
        <div className="relative">
          <svg className="w-7 h-7 text-rose-50" fill="currentColor" viewBox="0 0 24 24">
            <path d={VEHICLE_SOLID_PATH} className="text-rose-500" />
          </svg>
          <div className="absolute -top-1 -right-1.5 w-4 h-4 bg-rose-600 rounded-full border border-white flex items-center justify-center shadow-sm animate-pulse">
             <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4"><path d="M12 8v4m0 4h.01" strokeLinecap="round"/></svg>
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="text-[14px] text-[#333] font-normal truncate tracking-tight mb-1 leading-tight">{alarm.title}</div>
        <div className="text-[12px] text-[#666] font-normal truncate leading-tight font-mono">{alarm.vehicleNo}</div>
      </div>
      <div className="text-[12px] text-[#666] font-normal shrink-0 self-center pt-0 tabular-nums font-mono flex items-center">{alarm.time}</div>
    </div>
  );

  const renderItemList = (data: any[]) => (
    <div className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-1.5 pb-12 pt-1 relative z-10 mt-2">
      {data.map((item) => {
        const isExpanded = expandedItemId === item.id;
        const itemSegments = trajectoryData.map((_, idx) => `${item.id}-${idx}`);
        
        if (activeSubTab === 'alarm') {
          return <AlarmItem key={item.id} alarm={item} />;
        }

        if (activeSubTab === 'site') {
          const site = item as SiteListItem;
          const isUnread = !readItemIds.has(site.id);
          const hasImage = !!site.image;
          const siteImages = hasImage ? [site.image, site.image.replace('seed/s', 'seed/site_alt_'), site.image.replace('seed/s', 'seed/site_env_')] : [];
          return (
            <div key={site.id} className={`group cursor-pointer py-2.5 px-2 -mx-2 rounded-2xl transition-all duration-300 border ${isExpanded ? 'bg-white border-primary/20 shadow-[0_20px_50px_-12px_rgba(var(--primary-rgb),0.12)] mb-3 z-10' : isUnread ? 'animate-alert-flash border-transparent' : 'border-transparent hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.06)] hover:bg-slate-50/50'}`} onClick={() => { toggleExpand(site.id); onSiteClick?.(site); }}>
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-sm border border-[#ddd] mt-0.5 bg-slate-50 flex items-center justify-center">
                  {hasImage ? (<img src={site.image} className="w-full h-full object-cover" alt={site.name} />) : (<svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>)}
                </div>
                <div className="flex-1 min-w-0 flex flex-col space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[16px] font-normal text-[#333] truncate pr-4">{site.name}</h3>
                    <span className="text-[14px] font-normal text-[#666] font-mono tracking-tight shrink-0">{site.time.split(' ')[1] || site.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-[14px] font-normal text-[#666] truncate pr-4"><svg className="w-3.5 h-3.5 mr-1 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2"/></svg>{site.address}</div>
                    <div className="flex items-center text-[14px] font-normal text-[#666] shrink-0">{site.manager}</div>
                  </div>
                </div>
              </div>
              {isExpanded && (
                <div className="mt-4 border-t border-slate-50 pt-3 px-0 space-y-3.5 animate-in slide-in-from-top-2 duration-300" onClick={(e) => e.stopPropagation()}>
                  {hasImage ? (<div className="relative rounded-xl overflow-hidden shadow-sm border border-[#ddd] aspect-video mb-4 group/carousel cursor-zoom-in" onClick={() => onPreviewImage?.(siteImages, siteCarouselIndex)}><div className="w-full h-full flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${siteCarouselIndex * 100}%)` }}>{siteImages.map((img, i) => (<img key={i} src={img} className="w-full h-full object-cover shrink-0" alt={`工地预览图 ${i + 1}`} />))}</div><button onClick={(e) => { e.stopPropagation(); setSiteCarouselIndex(prev => prev > 0 ? prev - 1 : siteImages.length - 1); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black/40 z-10"><svg className="max-w-5 max-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg></button><button onClick={(e) => { e.stopPropagation(); setSiteCarouselIndex(prev => (prev + 1) % siteImages.length); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black/40 z-10"><svg className="max-w-5 max-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg></button><div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10">{siteImages.map((_, i) => (<div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${siteCarouselIndex === i ? 'bg-white w-4' : 'bg-white/40'}`} />))}</div></div>) : (<div className="relative rounded-xl overflow-hidden shadow-sm border border-[#ddd] aspect-video mb-4 bg-slate-50 flex flex-col items-center justify-center space-y-2"><div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300"><svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg></div><span className="text-[12px] font-medium text-slate-400 tracking-tight">暂无现场照片数据</span></div>)}
                </div>
              )}
            </div>
          );
        }

        const isLeakRelated = activeSubTab === 'droneLeak' || activeSubTab === 'vehicleLeak';
        const isHazard = activeSubTab === 'hazard';
        const tabs: DetailTab[] = (isDroneRelated || isLeakRelated) ? ['trajectory', 'alarm', 'log'] : isPersonnelRelated ? ['trajectory', 'task', 'log'] : ['trajectory', 'task', 'alarm', 'log'];
        const segmentColors = ['bg-blue-400', 'bg-amber-400', 'bg-purple-400'];

        return (
          <div key={item.id} className={`group cursor-pointer py-2 px-2 -mx-2 rounded-2xl transition-all duration-300 border ${isExpanded ? 'bg-white border-primary/20 shadow-[0_20px_50px_-12px_rgba(var(--primary-rgb),0.12)] mb-3 z-10' : 'border-transparent hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.06)] hover:bg-slate-50/50'}`} onClick={() => toggleExpand(item.id)}>
            <div className="flex items-center space-x-2 mb-1.5 relative">
              <div className="relative shrink-0 ml-[-4px]">
                {typeof item.avatar === 'string' && item.avatar.startsWith('http') ? (
                  <img src={item.avatar} className="w-12 h-12 rounded-xl object-contain bg-slate-50 p-1 shadow-sm transition-transform duration-300" alt={item.name} />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-50 p-2 shadow-sm flex items-center justify-center text-primary">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">{item.avatar}</svg>
                  </div>
                )}
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${item.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-1 flex-1 min-w-0">
                    <h3 className={`font-bold truncate shrink-0 text-[#333] ${activeSubTab === 'personnel' ? 'text-[16px] w-[72px]' : 'text-[16px] max-w-[180px]'}`}>{item.name}</h3>
                    {activeSubTab === 'personnel' && (
                      <div className="flex-1 min-w-[60px] max-w-[85px] relative h-[16px] bg-white rounded-full overflow-hidden border transition-colors flex items-center justify-center shrink-0" style={{ borderColor: '#7edc89' }}>
                        <div className="absolute left-0 h-full transition-all duration-1000 ease-out" style={{ width: `${item.progress}%`, backgroundColor: '#ccedd0' }}></div>
                        <span style={{ color: '#10b924' }} className="relative text-[12px] font-bold leading-none pointer-events-none drop-shadow-[0_0_2px_white]">{item.progress}%</span>
                      </div>
                    )}
                    {isHazard && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-500 text-[11px] font-bold border border-rose-100 shrink-0">高风险</span>
                    )}
                    {isLeakRelated && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[11px] font-bold border border-amber-100 shrink-0">疑似漏点</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[12px] text-slate-400 font-mono">{item.time || '11:00'}</span>
                  </div>
                </div>
                <div className="flex items-center mt-1 text-[14px] text-[#666] font-normal space-x-1.5">
                  <span className="truncate">{item.role}</span>
                  <span className="text-slate-400">•</span>
                  <div className="flex items-center truncate max-w-[120px]">
                    <span className="truncate">{item.location}</span>
                  </div>
                </div>
              </div>
              <div className="w-5 h-5 flex items-center justify-center shrink-0 ml-1.5">
                <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 origin-center ${isExpanded ? 'rotate-90 text-primary' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>
            {isExpanded && (
              <div className="mt-3 border-t border-slate-50 pt-2 px-0" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center mb-2.5 border-b border-slate-50 mx-0">{tabs.map((tab) => (<button key={tab} onClick={() => setActiveDetailTab(tab)} className={`flex-1 py-1.5 m-0 px-0 text-[14px] font-medium transition-all relative ${activeDetailTab === tab ? 'text-primary font-bold' : 'text-[#333] hover:text-slate-700'}`}>{tab === 'trajectory' ? '轨迹' : tab === 'task' ? '任务' : tab === 'alarm' ? (isDroneRelated ? '隐患' : '报警') : '日志'}{activeDetailTab === tab && <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary rounded-full"></div>}</button>))}</div>
                {activeDetailTab === 'trajectory' && (
                  <div className="space-y-3.5 pt-1 px-1">
                    <div 
                      className="rounded-xl py-2 px-4 flex items-center justify-between border mx-0"
                      style={{ backgroundColor: '#f5f8ff', borderColor: '#c2c7d4' }}
                    >
                      <div className="flex flex-col space-y-0.5">
                        <span className="text-[14px] text-[#666] font-normal uppercase tracking-wider">总公里数</span>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-[16px] font-bold text-[#333] leading-none">11.3</span>
                          <span className="text-[16px] font-normal text-[#333]">km</span>
                        </div>
                      </div>
                      <div className="w-px h-8 bg-slate-200 mx-2"></div>
                      <div className="flex flex-col space-y-0.5 text-right flex-1">
                        <span className="text-[14px] text-[#666] font-normal uppercase tracking-wider">总用时区间</span>
                        <div className="text-[16px] font-bold text-[#333] tracking-tight leading-none pt-0.5">08:30 - 12:00</div>
                      </div>
                    </div>
                    
                    <div className="pt-0.5 px-0">
                      <div className="flex items-center justify-between mb-3 px-0">
                        <div className="flex items-center space-x-2 group/all" onClick={() => handleToggleAllTrajectories(item.id)}>
                          <div className={`w-5 h-5 rounded-md border transition-all duration-200 flex items-center justify-center cursor-pointer ${itemSegments.every(key => selectedTrajectoryKeys.has(key)) ? 'bg-primary border-primary text-white shadow-sm shadow-primary/20' : 'bg-white border-[#ddd] group-hover/all:border-slate-400'}`}>
                            {itemSegments.every(key => selectedTrajectoryKeys.has(key)) && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3"/></svg>}
                          </div>
                          <span className="text-[14px] font-normal text-[#333] uppercase tracking-[0.15em] select-none cursor-pointer group-hover/all:text-slate-900 transition-colors">全部轨迹</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <button onClick={() => { const next = selectedTrajectoryAction === 'track' ? null : 'track'; setSelectedTrajectoryAction(next); onPlaybackToggle?.(next === 'track', item.id); }} className={`peer w-8 h-8 rounded-lg flex items-center justify-center transition-all border active:scale-90 z-20 relative ${selectedTrajectoryAction === 'track' ? 'bg-primary text-white shadow-lg shadow-primary/30 border-primary' : 'bg-white text-slate-500 hover:bg-slate-50 border-[#ddd]'}`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"/><path d="M10 8l6 4-6 4z" fill="currentColor"/></svg>
                            </button>
                            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 peer-hover:opacity-100 transition-all duration-200 translate-y-2 peer-hover:translate-y-0 z-50 pointer-events-none">
                              <div className="tooltip-bubble tooltip-arrow-bottom text-nowrap">轨迹回放</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4 px-0">{trajectoryData.map((traj, idx) => { const isSelected = selectedTrajectoryKeys.has(`${item.id}-${idx}`); return (<div key={idx} onClick={() => toggleTrajectory(item.id, idx)} className="flex items-center justify-between group/line cursor-pointer select-none"><div className="flex items-center space-x-3.5"><div className={`w-5 h-5 rounded-md border transition-all duration-200 flex items-center justify-center ${isSelected ? 'bg-primary border-primary text-white shadow-sm' : 'bg-white border-[#ddd]'}`}>{isSelected && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3"/></svg>}</div><div className="flex items-center"><div className={`w-3.5 h-3.5 mr-2.5 rounded-sm shrink-0 shadow-sm ${segmentColors[idx % segmentColors.length]}`}></div><span className={`text-[14px] font-normal text-[#333]`}>{traj.time}</span></div></div><div className="flex items-center space-x-3"><span className={`px-2 py-0.5 rounded text-[12px] font-normal text-[#333] ${isSelected ? 'bg-primary/10' : 'bg-slate-50'}`}>{traj.dist}</span><span className="text-[12px] text-[#333] font-normal w-16 text-right">{traj.dur}</span></div></div>); })}</div>
                    </div>
                  </div>
                )}
                {activeDetailTab === 'task' && !isDroneRelated && (
                  <div className="space-y-1.5 pt-0 pb-1.5 px-1">
                    <div onClick={() => setIsTaskPlanExpanded(!isTaskPlanExpanded)} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 py-1 px-0 rounded-lg transition-colors">
                      <span className="text-[14px] font-normal text-[#333] whitespace-nowrap overflow-hidden text-ellipsis">{isPersonnelRelated ? '用户安检' : '抢修作业'}-{item.name}{selectedDate ? selectedDate.replace(/-/g, '/') : '未选日期'}的计划</span>
                      <svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isTaskPlanExpanded ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" strokeWidth="2"/></svg>
                    </div>
                    {isTaskPlanExpanded && (
                      <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300 px-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-12">
                            <div className="flex items-center space-x-2"><span className="text-[14px] text-slate-500 font-normal">总计</span><span className="text-[14px] font-normal text-[#333] leading-none">48</span></div>
                            <div className="flex items-center space-x-2"><span className="text-[14px] text-[#10b981] font-normal">已完成</span><span className="text-[14px] font-normal text-[#10b981] leading-none">32</span></div>
                          </div>
                          <button onClick={() => onViewAllTasks?.({ name: item.name, tasks: mockTasks })} className="px-4 py-1 bg-primary/5 text-primary rounded-full text-[14px] font-normal hover:bg-primary/10 transition-colors shadow-sm shrink-0">查看全部</button>
                        </div>
                        <div className="space-y-0 border-t border-slate-50 pt-0.5 px-0">
                          {mockTasks.slice(0, 4).map((task) => (
                            <div key={task.id} className="flex items-center justify-between py-2 group/task-item border-b border-slate-50/50 last:border-0 pr-0 cursor-pointer rounded-md transition-colors" onClick={() => onTaskClick?.(task)}>
                              <div className="flex items-center space-x-3 flex-1">
                                <div className={`w-2 h-2 rounded-full shrink-0 ${task.status === 'completed' ? 'bg-[#10b981]' : 'bg-slate-300'}`}></div>
                                <span className="text-[14px] font-normal text-[#333] leading-relaxed group-hover/task-item:text-primary transition-colors">{task.address}</span>
                              </div>
                              <div className="shrink-0 ml-4"><span className="text-[12px] font-normal text-[#666] group-hover/task-item:text-primary transition-colors font-mono">{task.time}</span></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {activeDetailTab === 'alarm' && (
                  <div className="space-y-0.5 pt-1 px-1 animate-in fade-in duration-300">
                    {MOCK_ALARMS.slice(0, 3).map((alarm) => (
                      <AlarmItem key={alarm.id} alarm={alarm} />
                    ))}
                  </div>
                )}
                {activeDetailTab === 'log' && (
                  <div className="pt-4 relative px-1 cursor-default">
                    {/* 时序图垂直主轴线 */}
                    <div className="absolute left-[19px] top-6 bottom-4 w-[1px] bg-slate-100"></div>
                    <div className="space-y-5 px-0">
                      {(isDroneRelated ? DRONE_LOGS : isPersonnelRelated ? PERSONNEL_LOGS : VEHICLE_LOGS).map((log) => { 
                        return (
                          <div key={log.id} className="flex items-center relative pl-8 group/log-row">
                            <div className="absolute left-[9px] w-3.5 h-3.5 rounded-full border-2 border-slate-300 bg-white z-10 transition-all group-hover/log-row:border-primary"></div>
                            <div className="flex-1 flex items-center justify-between">
                              <span className="text-[14px] font-normal text-[#333] transition-colors group-hover/log-row:text-primary">
                                {log.title}
                              </span>
                              <span className="text-[12px] text-[#666] font-mono text-right tabular-nums transition-colors group-hover/log-row:text-primary">
                                {log.time}
                              </span>
                            </div>
                          </div>
                        ); 
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const dataToRender = activeSubTab === 'personnel' ? MOCK_PERSONNEL : 
                    activeSubTab === 'drone' ? MOCK_DRONES : 
                    activeSubTab === 'droneLeak' ? MOCK_DRONE_LEAKS :
                    activeSubTab === 'vehicleLeak' ? MOCK_VEHICLE_LEAKS :
                    activeSubTab === 'hazard' ? MOCK_HAZARDS :
                    activeSubTab === 'site' ? MOCK_SITES_LIST : 
                    activeSubTab === 'alarm' ? MOCK_ALARMS :
                    MOCK_VEHICLES;

  // 右侧工具栏项定义
  const allMenuItems: { id: SubTab; label: string; icon: React.ReactNode; isUnread?: boolean }[] = [
    { id: 'personnel', label: '人员', icon: <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /> },
    { id: 'vehicle', label: '车辆', icon: <path d={VEHICLE_SOLID_PATH} fill="currentColor" /> },
    { id: 'drone', label: '无人机', icon: <path d={DRONE_PATH} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /> },
    { id: 'hazard', label: '隐患', isUnread: unreadTabs.has('hazard'), icon: <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z" /> },
    { id: 'alarm', label: '报警', isUnread: unreadTabs.has('alarm'), icon: <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" /> },
    { id: 'site', label: '工地', isUnread: unreadTabs.has('site'), icon: <path d={SITE_ICON_PATH} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /> },
    { id: 'droneLeak', label: '无人机漏点', isUnread: unreadTabs.has('droneLeak'), icon: <g><path d={DRONE_PATH} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/><circle cx="12" cy="12" r="2" fill="currentColor" className="opacity-40" /></g> },
    { id: 'vehicleLeak', label: '测漏车漏点', isUnread: unreadTabs.has('vehicleLeak'), icon: <g><path d={VEHICLE_SOLID_PATH} fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="11" cy="14" r="2" fill="currentColor" className="opacity-40" /></g> },
    { id: 'video', label: '视频监控', icon: <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4-1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6z" /> },
    { id: 'analysis', label: '智能分析', icon: <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2v-4h2v4z" /> },
    { id: 'report', label: '运行报表', icon: <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z M14 17H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /> },
    { id: 'settings', label: '系统设置', icon: <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.21.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" /> },
  ];

  const totalPages = Math.ceil(allMenuItems.length / ITEMS_PER_PAGE);
  const currentMenuSlice = allMenuItems.slice((menuPage - 1) * ITEMS_PER_PAGE, menuPage * ITEMS_PER_PAGE);

  const sortedData = useMemo(() => {
    let data = [...dataToRender];
    if (sortField && sortOrder) {
      data.sort((a, b) => {
        let valA = (a as any)[sortField] || '';
        let valB = (b as any)[sortField] || '';
        
        // Special case for department/location
        if (sortField === 'department') {
          valA = (a as any).location || '';
          valB = (b as any).location || '';
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [dataToRender, sortField, sortOrder]);

  return (
    <div className="flex h-full overflow-visible flex-row bg-transparent">
      {/* 筛选对话框 */}
      {isFilterModalOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-300"
          onClick={() => setIsFilterModalOpen(false)}
        >
          <div 
            className="bg-white w-[720px] rounded-xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] overflow-hidden p-10 animate-in zoom-in-95 duration-300 border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-[22px] font-black text-slate-800 tracking-tight">人员</h2>
              <button 
                onClick={() => setIsFilterModalOpen(false)}
                className="text-slate-300 hover:text-rose-500 transition-all active:scale-90"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-10">
              {/* 排序行 */}
              <div className="flex items-start">
                <span className="text-[14px] text-slate-400 w-[70px] shrink-0 pt-2 font-normal">排序:</span>
                <div className="flex flex-wrap gap-2.5 flex-1 pl-2">
                  {['状态+部门', '姓名', '隐患数', '已巡数', '总巡数'].map(opt => (
                    <button 
                      key={opt}
                      onClick={() => setFilterSorting(opt)}
                      className={`px-4 h-9 text-[13px] rounded-lg transition-all border font-normal whitespace-nowrap ${
                        filterSorting === opt 
                        ? 'bg-[#3b82f6] border-[#3b82f6] text-white shadow-[0_6px_20px_-5px_rgba(59,130,246,0.4)]' 
                        : 'bg-white border-[#ddd] text-slate-600 hover:border-[#3b82f6] hover:text-[#3b82f6]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              {/* 状态行 */}
              <div className="flex items-start">
                <span className="text-[14px] text-slate-400 w-[70px] shrink-0 pt-0.5 font-normal">状态:</span>
                <div className="flex flex-wrap gap-x-8 gap-y-6 flex-1 pl-2">
                  {['全部', '下班', '正常', '信号中断', '未上班', 'GPS异常', 'GPS开', '电池没电'].map(opt => (
                    <FilterCheckbox 
                      key={opt} 
                      label={opt} 
                      checked={filterStatus.has(opt)} 
                      onChange={() => toggleFilterOption(filterStatus, opt, setFilterStatus)}
                    />
                  ))}
                </div>
              </div>
              {/* 类型行 */}
              <div className="flex items-start">
                <span className="text-[14px] text-slate-400 w-[70px] shrink-0 pt-0.5 font-normal">类型:</span>
                <div className="flex flex-wrap gap-x-8 gap-y-6 flex-1 pl-2">
                  {['全部', '安检人员'].map(opt => (
                    <FilterCheckbox 
                      key={opt} 
                      label={opt} 
                      checked={filterType.has(opt)} 
                      onChange={() => toggleFilterOption(filterType, opt, setFilterType)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-12 flex justify-end space-x-4">
              <button onClick={() => setIsFilterModalOpen(false)} className="px-8 py-2.5 border border-slate-200 rounded-lg text-[14px] text-slate-500 hover:bg-slate-50 transition-colors font-medium">取消</button>
              <button onClick={() => setIsFilterModalOpen(false)} className="px-10 py-2.5 bg-[#3b82f6] text-white rounded-lg text-[14px] font-black shadow-xl shadow-blue-500/30 hover:bg-blue-600 transition-all active:scale-95">确认</button>
            </div>
          </div>
        </div>
      )}

      {/* 左侧业务面板 */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 overflow-hidden ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none w-0'}`}>
        <div className="pt-2 pb-1 px-4 relative z-50">
          <div className="flex items-center justify-between bg-white rounded-xl px-2 py-2 relative -mx-2">
            <button type="button" onClick={handlePrevDay} className="text-slate-500 hover:text-primary p-1 rounded-md transition-all active:scale-90"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg></button>
            <div onClick={() => setIsCalendarOpen(!isCalendarOpen)} className="flex items-center space-x-2.5 cursor-pointer group px-2 py-1"><svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg><span className="text-[13px] font-normal text-slate-700">{formatDisplayDate(selectedDate)}</span><svg className={`w-3 h-3 text-slate-500 group-hover:text-primary transition-all ${isCalendarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg></div>
            <button type="button" onClick={handleNextDay} className="text-slate-500 hover:text-primary p-1 rounded-md transition-all active:scale-90"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg></button>
            {isCalendarOpen && (
              <div ref={calendarRef} className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-[0_12px_40_rgba(0,0,0,0.15)] border border-[#ddd] z-[100] p-4 animate-in fade-in slide-in-from-top-2 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4 px-1"><div className="flex items-center space-x-2">{pickerMode === 'day' ? (<div className="flex items-center space-x-1.5 group cursor-pointer" onClick={() => setPickerMode('year')}><span className="text-[14px] font-bold text-slate-800 hover:text-primary transition-colors">{viewDate.getFullYear()}年</span><span className="text-[14px] font-bold text-slate-800 hover:text-primary transition-colors" onClick={handleMonthPickerClick}>{String(viewDate.getMonth() + 1).padStart(2, '0')}月</span><svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="2.5" /></svg></div>) : (<div className="flex items-center space-x-1.5 group cursor-pointer" onClick={() => setPickerMode('year')}><span className="text-[14px] font-bold text-slate-800 hover:text-primary transition-colors">{viewDate.getFullYear()}年</span><svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="2.5" /></svg></div>)}</div><div className="flex items-center space-x-3"><button type="button" onClick={() => changeView(-1)} className="p-1 text-slate-500 hover:text-slate-700 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg></button><button type="button" onClick={() => changeView(1)} className="p-1 text-slate-500 hover:text-slate-700 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg></button></div></div>
                {pickerMode === 'day' && (<><div className="grid grid-cols-7 mb-2 border-b border-slate-50 pb-2">{['一', '二', '三', '四', '五', '六', '日'].map(w => (<span key={w} className="text-center text-[12px] font-normal text-slate-500">{w}</span>))}</div><div className="grid grid-cols-7 gap-y-1">{generateCalendarDays().map((day, idx) => { const ymd = formatToYMD(day.date); return (<div key={idx} onClick={() => handleDateSelect(day.date)} className={`aspect-square flex items-center justify-center text-[12px] font-normal rounded-lg cursor-pointer transition-all ${day.isCurrentMonth ? 'text-slate-700' : 'text-slate-400'} ${ymd === selectedDate ? 'bg-primary text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]' : 'hover:bg-slate-50'} ${ymd === formatToYMD(getTodayDate()) && ymd !== selectedDate ? 'border border-primary text-primary' : ''}`}>{day.date.getDate()}</div>); })}</div></>)}
                {pickerMode === 'month' && (<div className="grid grid-cols-3 gap-x-2 gap-y-6 py-4">{['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'].map((m, idx) => (<div key={m} onClick={() => handleMonthSelect(idx)} className={`flex items-center justify-center py-2.5 rounded-xl text-[13px] font-bold cursor-pointer transition-all ${viewDate.getMonth() === idx ? 'bg-primary text-white shadow-lg' : 'text-slate-700 hover:bg-slate-50 hover:text-primary'}`}>{m}</div>))}</div>)}
                {pickerMode === 'year' && (<div className="grid grid-cols-3 gap-x-2 gap-y-6 py-4">{generateYears().map((y, idx) => (<div key={y} onClick={() => handleYearSelect(y)} className={`flex items-center justify-center py-2.5 rounded-xl text-[13px] font-bold cursor-pointer transition-all ${(idx === 0 || idx === 11) ? 'text-slate-400' : viewDate.getFullYear() === y ? 'bg-primary text-white shadow-lg' : 'text-slate-700 hover:bg-slate-50 hover:text-primary'}`}>{y}</div>))}</div>)}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50"><button type="button" onClick={handleClearClick} className="text-[12px] font-normal text-primary hover:underline px-1">清除</button><button type="button" onClick={handleTodayClick} className="text-[12px] font-normal text-primary hover:underline px-1">今天</button></div>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 flex flex-col min-h-0 relative">
          {activeSubTab !== 'site' && (
            <div className="px-2 mt-2 space-y-3 relative z-30">
              <div className="flex space-x-2">
                <div className="relative flex-1" ref={deptDropdownRef}>
                  <div onClick={() => setIsDeptOpen(!isDeptOpen)} className={`w-full h-10 px-3 bg-slate-50/50 border rounded-lg flex items-center justify-between cursor-pointer transition-all hover:bg-white hover:border-slate-300 ${isDeptOpen ? 'border-primary bg-white' : 'border-[#ddd]'}`}>
                    <span className="text-[14px] font-normal text-[#333] truncate">{selectedDept.label}</span>
                    <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isDeptOpen ? 'rotate-180 text-primary' : 'group-hover:text-primary'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  {isDeptOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-[0_15px_40px_-10px_rgba(0,0,0,0.12)] z-[200] py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top flex flex-col"><div className="px-2 py-2 border-b border-slate-50 bg-slate-50/30" onClick={(e) => e.stopPropagation()}><div className="relative"><input ref={deptSearchInputRef} type="text" placeholder="输入部门名过滤..." value={deptSearchQuery} onChange={(e) => setDeptSearchQuery(e.target.value)} className="w-full h-8 pl-8 pr-3 bg-white border border-slate-200 rounded-md text-[14px] font-normal text-[#333] placeholder:text-[#999] focus:border-primary focus:ring-0 outline-none transition-all shadow-none"/><svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div></div><div className="max-h-60 overflow-y-auto custom-scrollbar py-1">{filteredDepartments.length > 0 ? (filteredDepartments.map((dept) => { const isActive = selectedDept.id === dept.id; return (<div key={dept.id} onClick={() => { setSelectedDept(dept); setIsDeptOpen(false); setDeptSearchQuery(''); }} style={{ paddingLeft: `${dept.level * 20 + 12}px` }} className={`group flex items-center h-9 pr-3 cursor-pointer transition-colors relative ${isActive ? 'bg-primary/5' : 'hover:bg-slate-50'}`}>{isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r-full shadow-[0_0_8px_rgba(154,107,255,0.4)]"></div>}{dept.level > 0 && !deptSearchQuery && (<div className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-px bg-slate-100" style={{ left: `${dept.level * 20 - 8}px` }}></div>)}<span className="text-[14px] font-normal text-[#333] truncate transition-all">{dept.label}</span></div>); })) : (<div className="py-8 text-center text-[11px] text-slate-300 font-medium">未找到匹配部门</div>)}</div></div>
                  )}
                </div>
                <div className="relative flex items-center space-x-2">
                  <div className="relative w-[110px] shrink-0">
                    <input type="text" placeholder="搜索..." className="w-full h-10 pl-9 pr-2 bg-slate-50/50 border border-[#ddd] rounded-lg text-[14px] font-normal text-[#333] transition-all placeholder:text-[#999] focus:border-primary focus:bg-white outline-none" />
                    <svg className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <button type="button" onClick={() => setIsFilterModalOpen(true)} className="w-10 h-10 flex items-center justify-center bg-white border border-[#ddd] rounded-lg text-slate-500 hover:text-primary transition-all active:scale-95 shrink-0 shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg></button>
                  <button 
                    type="button" 
                    onClick={() => handleSortClick('department')} 
                    className={`w-10 h-10 flex items-center justify-center border rounded-lg transition-all active:scale-95 shrink-0 shadow-sm ${sortField === 'department' ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-[#ddd] text-slate-500 hover:text-primary'}`}
                    title="按部门排序"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                  </button>
                </div>
              </div>
            </div>
          )}
          {renderItemList(sortedData)}
        </div>
      </div>

      {/* 修复点：右侧工具栏背景处理 */}
      <div 
        className={`w-16 h-full flex flex-col items-center py-6 shrink-0 relative z-20 overflow-visible transition-all duration-500 ${
          isOpen 
            ? 'border-l border-slate-200/60 bg-white rounded-r-2xl' 
            : 'bg-transparent'
        }`}
      >
        <div className="flex-1 flex flex-col items-center space-y-4 animate-in fade-in duration-500" key={menuPage}>
          {currentMenuSlice.map((item) => (
            <SidebarButton 
              key={item.id} 
              active={activeSubTab === item.id} 
              isFlashing={item.isUnread && activeSubTab !== item.id} 
              onClick={() => handleTabClick(item.id)} 
              label={item.label} 
              icon={item.icon} 
            />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="mt-auto flex flex-col items-center space-y-3 pb-2 shrink-0">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button 
                key={i} 
                type="button" 
                onClick={() => setMenuPage(i + 1)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  menuPage === i + 1 
                  ? 'bg-primary scale-125 shadow-[0_0_8px_rgba(154,107,255,0.4)]' 
                  : 'bg-slate-200 hover:bg-slate-300'
                }`}
                title={`第 ${i + 1} 页`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SidebarButton: React.FC<{ active: boolean; isFlashing?: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, isFlashing, onClick, icon, label }) => (
  <div className="relative group/btn">
    <button 
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }} 
      className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all duration-300 relative z-10 ${
        active ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-500 hover:text-primary'
      }`}
    >
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">{icon}</svg>
      {isFlashing && !active && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white"></span>}
    </button>
    <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/btn:opacity-100 transition-all duration-200 translate-x-2 group-hover/btn:translate-x-0 z-[9999] pointer-events-none">
      <div className="tooltip-bubble relative shadow-2xl">{label}<div className="absolute top-1/2 -translate-y-1/2 -right-[4px] w-2 h-2 bg-[#080b1a] rotate-45"></div></div>
    </div>
  </div>
);