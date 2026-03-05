
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Pagination } from '../Pagination';
import { RotateCw, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, X } from 'lucide-react';

/**
 * ============================================================================
 * SITE MANAGEMENT - DATA STRUCTURES
 * ============================================================================
 */
interface SiteRecord {
  id: string;
  reporter: string;
  reportDate: string;
  status: 'pending' | 'monitoring' | 'completed' | 'error';
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
  { id: '2', reporter: '三商', reportDate: '2025/05/07 13:30', status: 'monitoring', siteName: '建邱中心4012地块桩基施工', address: '江苏省南京市建邺区沙洲街道江东中路363号新华传媒...', grade: '2', industry: '建筑工程', method: '静压桩', days: 609, dangerDesc: '震动沉沉' },
  { id: '3', reporter: '王建国', reportDate: '2025/05/20 09:15', status: 'completed', siteName: '鼓楼北扩容及道路硬化二期', address: '南京市鼓楼区中山路18号', grade: '1', industry: '市政设施', method: '非开挖顶管', days: 12, dangerDesc: '沉井风险' },
  { id: '4', reporter: '李秀才', reportDate: '2025/05/21 14:20', status: 'error', siteName: '河西金鹰世界外围绿化提升', address: '南京市建邺区江东中路金鹰世界', grade: '3', industry: '园林绿化', method: '小型机具', days: 5, dangerDesc: '浅层光缆' },
];

interface LogRecord {
  id: string;
  recordTime: string;
  dept: string;
  person: string;
  processTime: string;
  docName: string;
  status: string;
  content: string;
  attachments: string[];
  detail: string;
}

const MOCK_LOGS: LogRecord[] = [
  {
    id: '1',
    recordTime: '2025/05/19 11:55',
    dept: '工程部',
    person: '胡影',
    processTime: '2025/05/19 14:30',
    docName: '开工申请单',
    status: '已审核',
    content: '准予开工，请做好安全防护措施。',
    attachments: ['https://picsum.photos/seed/site1/200/200', 'https://picsum.photos/seed/site2/200/200'],
    detail: '明细'
  },
  {
    id: '2',
    recordTime: '2025/05/20 09:15',
    dept: '安质部',
    person: '王建国',
    processTime: '2025/05/20 10:00',
    docName: '日常巡检记录',
    status: '处理中',
    content: '发现基坑支护不规范，已下达整改通知。',
    attachments: ['https://picsum.photos/seed/site3/200/200', 'https://picsum.photos/seed/site4/200/200', 'https://picsum.photos/seed/site5/200/200'],
    detail: '明细'
  },
  {
    id: '3',
    recordTime: '2025/05/21 14:20',
    dept: '运维中心',
    person: '李秀才',
    processTime: '2025/05/21 15:45',
    docName: '管线探测报告',
    status: '已完成',
    content: '管线位置已探明，偏差在合理范围内。',
    attachments: ['https://picsum.photos/seed/site6/200/200'],
    detail: '明细'
  }
];

/**
 * ============================================================================
 * INLINE DATE PICKER COMPONENT
 * ============================================================================
 */
const InlineDatePicker: React.FC<{ 
  value: string; 
  onChange: (val: string) => void; 
  placeholder?: string;
  align?: 'left' | 'right';
  disabled?: boolean;
}> = ({ value, onChange, placeholder = '选择日期', align = 'right', disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(value || new Date()));
  const containerRef = useRef<HTMLDivElement>(null);

  const formatYMD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const generateDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const days = [];
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    
    for (let i = firstDay === 0 ? 6 : firstDay - 1; i > 0; i--) {
      days.push({ date: new Date(year, month - 1, prevMonthLastDate - i + 1), current: false });
    }
    for (let i = 1; i <= lastDate; i++) {
      days.push({ date: new Date(year, month, i), current: true });
    }
    while (days.length < 42) {
      days.push({ date: new Date(year, month + 1, days.length - (firstDay === 0 ? 6 : firstDay - 1) - lastDate + 1), current: false });
    }
    return days;
  };

  return (
    <div className="relative flex-1 min-w-0" ref={containerRef}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full h-10 px-3 bg-slate-50/50 border rounded-lg text-[13px] flex items-center justify-between transition-all ${
          disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'cursor-pointer hover:bg-white'
        } ${
          isOpen ? 'border-primary bg-white ring-2 ring-primary/10' : 'border-slate-300'
        }`}
      >
        <span className={value ? (disabled ? 'text-slate-500' : 'text-[#333]') : 'text-slate-400'}>{value || placeholder}</span>
        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
        </svg>
      </div>

      {isOpen && (
        <div className={`absolute top-full mt-1.5 w-[230px] bg-white border border-slate-300 rounded-xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.2)] z-[300] p-3 animate-in fade-in zoom-in-95 duration-200 ${
          align === 'left' ? 'left-0 origin-top-left' : 'right-0 origin-top-right'
        }`}>
          <div className="flex items-center justify-between mb-3 px-1">
            <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-1 hover:bg-slate-100 rounded text-slate-400 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth={2.5} /></svg>
            </button>
            <span className="text-[13px] font-bold text-slate-700">{viewDate.getFullYear()}年 {viewDate.getMonth() + 1}月</span>
            <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-1 hover:bg-slate-100 rounded text-slate-400 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth={2.5} /></svg>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-px mb-1">
            {['一', '二', '三', '四', '五', '六', '日'].map(w => (
              <span key={w} className="text-center text-[11px] font-normal text-slate-400 pb-1">{w}</span>
            ))}
            {generateDays().map((d, i) => {
              const dateStr = formatYMD(d.date);
              const isSelected = value === dateStr;
              return (
                <div 
                  key={i} 
                  onClick={() => { onChange(dateStr); setIsOpen(false); }}
                  className={`aspect-square flex items-center justify-center text-[12px] rounded-lg cursor-pointer transition-all ${
                    !d.current ? 'text-slate-200' : isSelected ? 'bg-primary text-white font-bold shadow-md shadow-primary/20' : 'text-slate-600 hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  {d.date.getDate()}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 pt-2 border-t border-slate-50">
            <button onClick={() => { onChange(''); setIsOpen(false); }} className="text-[11px] text-primary hover:underline font-medium">清除</button>
            <button onClick={() => { onChange(formatYMD(new Date())); setIsOpen(false); }} className="text-[11px] text-primary hover:underline font-medium">今天</button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * ============================================================================
 * HELPER COMPONENTS
 * ============================================================================
 */
const MultiSelectDropdown: React.FC<{
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}> = ({ options, selectedValues, onChange, placeholder = "请选择(多选)" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter(v => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const removeOption = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedValues.filter(v => v !== option));
  };

  return (
    <div className="flex-1 relative min-w-0" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[32px] border rounded-md px-1.5 py-1 flex items-center justify-between bg-white cursor-pointer transition-colors ${isOpen ? 'border-primary ring-1 ring-primary/20' : 'border-slate-200 hover:border-primary'}`}
      >
        <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
          {selectedValues.length > 0 ? (
            selectedValues.map(val => (
              <span key={val} className="inline-flex items-center px-1.5 py-0.5 rounded text-[12px] font-medium bg-blue-50 text-primary whitespace-nowrap">
                {val}
                <svg 
                  onClick={(e) => removeOption(val, e)}
                  className="w-3 h-3 ml-0.5 cursor-pointer hover:text-primary-hover" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            ))
          ) : (
            <span className="text-[13px] text-slate-400 ml-1">{placeholder}</span>
          )}
        </div>
        <div className="shrink-0 text-slate-400 px-1 pointer-events-none">
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto py-1">
          {options.map(option => {
            const isSelected = selectedValues.includes(option);
            return (
              <div 
                key={option}
                onClick={(e) => toggleOption(option, e)}
                className="px-3 py-1.5 text-[13px] text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
              >
                <span>{option}</span>
                {isSelected && (
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            );
          })}
          {options.length === 0 && (
            <div className="px-3 py-2 text-[13px] text-slate-400 text-center">暂无选项</div>
          )}
        </div>
      )}
    </div>
  );
};

const SingleSelectDropdown: React.FC<{
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}> = ({ options, value, onChange, className = "w-24 h-8 text-[13px]" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative shrink-0 ${className}`} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-full px-2 bg-white border text-left flex items-center justify-between transition-all ${
          isOpen ? 'border-primary border-b-transparent rounded-t-md' : 'border-slate-200 rounded-md hover:border-primary'
        }`}
      >
        <span className="text-slate-700 truncate pr-2">{value}</span>
        <svg className={`w-3.5 h-3.5 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-primary' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border border-primary border-t-0 rounded-b-md shadow-xl z-50 py-1 max-h-48 overflow-y-auto">
          {options.map((option) => (
            <div 
              key={option} 
              onClick={() => { onChange(option); setIsOpen(false); }} 
              className={`px-3 py-1.5 cursor-pointer hover:bg-primary/10 transition-colors ${value === option ? 'text-primary font-bold' : 'text-slate-600'}`}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FilterCheckbox: React.FC<{ label: string; checked: boolean; onChange: () => void }> = ({ label, checked, onChange }) => (
  <label className="flex items-center space-x-2.5 cursor-pointer group select-none shrink-0 py-0.5">
    <div 
      onClick={onChange}
      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all border ${
        checked 
          ? 'bg-primary border-primary text-white scale-105' 
          : 'border-slate-300 bg-white group-hover:border-primary'
      }`}
    >
      {checked && (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
    <span className="text-[14px] font-normal text-[#333] transition-colors whitespace-nowrap">
      {label}
    </span>
  </label>
);

const LayerCheckbox: React.FC<{ checked: boolean; onChange: () => void; className?: string }> = ({ checked, onChange, className = '' }) => (
  <div 
    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(); }}
    className={`w-[16px] h-[16px] rounded-[4px] flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
      checked 
        ? 'bg-[#9a6bff] text-white border-transparent' 
        : 'bg-white border border-slate-300'
    } ${className}`}
  >
    {checked && (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
      </svg>
    )}
  </div>
);

const renderLayerIcon = (id: string) => {
  switch (id) {
    case 'corp':
      return (
        <svg className="w-3.5 h-3.5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      );
    case 'person':
      return (
        <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      );
    case 'station':
      return (
        <svg className="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="8"></circle>
        </svg>
      );
    case 'inspection_area':
      return (
        <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
        </svg>
      );
    case 'mark_collection':
      return (
        <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="6"></circle>
        </svg>
      );
    case 'pipe':
    case 'ext_pipe':
      return (
        <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 14c4-6 4-6 8 0s4 6 8 0" />
        </svg>
      );
    case 'gate_station':
      return (
        <svg className="w-3.5 h-3.5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 4h16v16H4zM6 6v12l12-12v12z"/>
        </svg>
      );
    case 'pressure_station':
      return (
        <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 4h16v16H4zM4 20L20 4v16z"/>
        </svg>
      );
    case 'valve':
      return (
        <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M8 9l8 6M16 9l-8 6M8 9v6M16 9v6" />
        </svg>
      );
    case 'cathodic_protection':
      return (
        <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v10M7 12h10" />
        </svg>
      );
    case 'tee':
      return (
        <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M8 9h8M12 9v6" />
        </svg>
      );
    case 'elbow':
      return (
        <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M10 8v6h5" />
        </svg>
      );
    case 'reducer':
      return (
        <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M9 12h6M12 9l3 3-3 3" />
        </svg>
      );
    case 'transition':
      return (
        <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      );
    case 'weld':
      return (
        <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v10M7 12h10" />
        </svg>
      );
    case 'test_point':
      return (
        <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="5" width="14" height="14" rx="2" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
};

const ALL_FILTER_FIELDS = [
  '能否重现', '所属客户', '所属系统',
  '所属项目(开发专用)', '标题', '提出人',
  '提出方式', '功能模块', '模块',
  '工作类型', '优先级', '超期',
  '催办', '来源', '严重性',
  '提出时间', '是否出差(开发专用)', '写测试报告',
  '是否是常见问题', '是否需提交SVN', '处理结果是否审核'
];

/**
 * ============================================================================
 * SITE MANAGEMENT - MAIN INTERFACE
 * ============================================================================
 */
export const SiteManagementContent: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(['1']));
  const prevSelectedSiteRef = useRef<SiteRecord | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'personnel' | 'log' | 'danger' | 'history'>('basic');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isAddConditionModalOpen, setIsAddConditionModalOpen] = useState(false);
  const [tempSelectedConditions, setTempSelectedConditions] = useState<string[]>([]);
  const [isBasicInfoExpanded, setIsBasicInfoExpanded] = useState(true);
  const [isLogExpanded, setIsLogExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'image'>('table');
  const [filterTab, setFilterTab] = useState<'condition' | 'quick' | 'project'>('condition');
  const [expandedProjectNodes, setExpandedProjectNodes] = useState<Set<string>>(new Set(['1']));
  const [selectedProjects, setSelectedProjects] = useState<string[]>(['中山路片区', '解放路片区']);
  const [selectedPersons, setSelectedPersons] = useState<string[]>(['张三']);
  const [conditions, setConditions] = useState<Array<{ id: string; field: string; operator: string; values: string[] }>>([
    { id: '1', field: '所属项目', operator: '等于', values: ['中山路片区', '解放路片区'] },
    { id: '2', field: '提出人', operator: '包含', values: ['张三'] },
  ]);

  const handleDeleteCondition = (id: string) => {
    setConditions(prev => prev.filter(c => c.id !== id));
  };

  const handleAddCondition = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setConditions(prev => [...prev, { id: newId, field: '所属项目', operator: '等于', values: [] }]);
  };

  const handleConditionChange = (id: string, key: 'field' | 'operator' | 'values', value: any) => {
    setConditions(prev => prev.map(c => {
      if (c.id === id) {
        if (key === 'field') {
          return { ...c, field: value, operator: value === '所属项目' ? '等于' : '包含', values: [] };
        }
        return { ...c, [key]: value };
      }
      return c;
    }));
  };
  
  // 地图弹窗状态
  const [mapSearchKeyword, setMapSearchKeyword] = useState('');
  const [mapType, setMapType] = useState<'vec' | 'img'>('vec');
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);
  const [layers, setLayers] = useState([
    {
      id: 'basic',
      label: '基本图层',
      isOpen: true,
      checked: true,
      items: [
        { id: 'corp', label: '公司', checked: true },
        { id: 'person', label: '人员', checked: true },
        { id: 'station', label: '基站', checked: true },
      ]
    },
    {
      id: 'work_area',
      label: '工作片区',
      isOpen: true,
      checked: true,
      items: [
        { id: 'inspection_area', label: '巡检片区', checked: true },
      ]
    },
    {
      id: 'work_management',
      label: '工作管理',
      isOpen: true,
      checked: true,
      items: [
        { id: 'mark_collection', label: '标识采集', checked: true },
      ]
    },
    {
      id: 'gis',
      label: 'GIS图层',
      isOpen: true,
      checked: false,
      items: [
        { id: 'pipe', label: '管线', checked: false },
        { id: 'gate_station', label: '门站', checked: false },
        { id: 'pressure_station', label: '调压站', checked: false },
        { id: 'valve', label: '阀门', checked: false },
        { id: 'cathodic_protection', label: '阴极保护', checked: true },
        { id: 'tee', label: '三通', checked: false },
        { id: 'elbow', label: '弯头', checked: false },
        { id: 'reducer', label: '变径', checked: false },
        { id: 'transition', label: '钢塑转换', checked: false },
        { id: 'weld', label: '焊点', checked: true },
      ]
    },
    {
      id: 'extended',
      label: '扩展图层',
      isOpen: true,
      checked: false,
      items: [
        { id: 'test_point', label: '测试点设备', checked: false },
        { id: 'ext_pipe', label: '管线', checked: true },
      ]
    }
  ]);
  
  // 过滤状态
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set(['待处理', '监护中']));
  const [startDateRange, setStartDateRange] = useState(['', '']);
  const [endDateRange, setEndDateRange] = useState(['', '']);

  // 下拉框状态
  const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('全部等级');
  const grades = ['全部等级', '一级风险', '二级风险', '三级风险'];
  const gradeRef = useRef<HTMLDivElement>(null);

  // 新增弹窗施工类型下拉框状态
  const [isAddModalTypeDropdownOpen, setIsAddModalTypeDropdownOpen] = useState(false);
  const [selectedAddModalType, setSelectedAddModalType] = useState('请选择施工类型');
  const addModalTypes = ['请选择施工类型', '市政工程', '建筑工程', '水利工程'];
  const addModalTypeRef = useRef<HTMLDivElement>(null);
  
  // 新增弹窗工地地址状态
  const [addModalAddress, setAddModalAddress] = useState('');

  // 模拟项目树数据
  const projectTreeData = [
    {
      id: '1',
      name: '轨道交通一号线工程',
      children: [
        { id: '1-1', name: '一标段（市中心段）' },
        { id: '1-2', name: '二标段（高新段）' },
        { id: '1-3', name: '三标段（郊区段）' },
      ]
    },
    {
      id: '2',
      name: '高新区地下管网改造',
      children: [
        { id: '2-1', name: '科技路管网改造' },
        { id: '2-2', name: '创新大道管网改造' },
      ]
    },
    {
      id: '3',
      name: '老城区雨污分流项目',
      children: [
        { id: '3-1', name: '中山路片区' },
        { id: '3-2', name: '解放路片区' },
      ]
    }
  ];

  const toggleProjectNode = (id: string) => {
    setExpandedProjectNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 模拟快速查询树数据
  const [expandedQuickNodes, setExpandedQuickNodes] = useState<Set<string>>(new Set(['q1']));
  const [quickTreeData, setQuickTreeData] = useState([
    {
      id: 'q1',
      name: '按状态分类',
      children: [
        { id: 'q1-1', name: '今日新增', conditions: [{ id: '1', field: '所属项目', operator: '等于', values: ['中山路片区', '解放路片区'] }] },
        { id: 'q1-2', name: '异常状态', conditions: [] },
        { id: 'q1-3', name: '已完工项目', conditions: [] },
      ]
    },
    {
      id: 'q2',
      name: '按风险等级',
      children: [
        { id: 'q2-1', name: '一级监护', conditions: [] },
        { id: 'q2-2', name: '二级监护', conditions: [] },
        { id: 'q2-3', name: '三级监护', conditions: [] },
      ]
    },
    {
      id: 'q3',
      name: '按区域分类',
      children: [
        { id: 'q3-1', name: '市中心区', conditions: [] },
        { id: 'q3-2', name: '高新区', conditions: [] },
        { id: 'q3-3', name: '郊区', conditions: [] },
      ]
    }
  ]);

  const [isNodeEditModalOpen, setIsNodeEditModalOpen] = useState(false);
  const [nodeEditMode, setNodeEditMode] = useState<'add' | 'copy' | 'edit'>('add');
  const [nodeEditName, setNodeEditName] = useState('');
  const [nodeEditError, setNodeEditError] = useState('');

  const handleOpenNodeEdit = (mode: 'add' | 'copy' | 'edit') => {
    if (mode !== 'add' && !selectedQuickNodeId) {
      return;
    }
    if (selectedQuickNodeId && quickTreeData.some(g => g.id === selectedQuickNodeId)) {
      alert('根目录不可修改');
      return;
    }
    setNodeEditMode(mode);
    setNodeEditError('');
    if (mode === 'add') {
      setNodeEditName('');
    } else {
      let name = '';
      for (const group of quickTreeData) {
        if (group.id === selectedQuickNodeId) {
          name = group.name;
          break;
        }
        const child = group.children.find(c => c.id === selectedQuickNodeId);
        if (child) { name = child.name; break; }
      }
      setNodeEditName(mode === 'copy' ? `${name} (副本)` : name);
    }
    setIsNodeEditModalOpen(true);
  };

  const handleConfirmNodeEdit = () => {
    const trimmedName = nodeEditName.trim();
    if (!trimmedName) {
      setNodeEditError('请输入名称');
      return;
    }

    // 检查名称是否重复
    let isDuplicate = false;
    for (const group of quickTreeData) {
      if (group.name === trimmedName) {
        if (nodeEditMode === 'edit' && group.id === selectedQuickNodeId) {
          // skip
        } else {
          isDuplicate = true;
          break;
        }
      }
      for (const child of group.children) {
        if (child.name === trimmedName) {
          if (nodeEditMode === 'edit' && child.id === selectedQuickNodeId) {
            continue;
          }
          isDuplicate = true;
          break;
        }
      }
      if (isDuplicate) break;
    }

    if (isDuplicate) {
      setNodeEditError('名称已存在，请使用其他名称');
      return;
    }

    setNodeEditError('');

    setQuickTreeData(prev => {
      const newData = [...prev];
      
      if (!selectedQuickNodeId && nodeEditMode === 'add') {
        const newRoot = {
          id: Math.random().toString(36).substr(2, 9),
          name: trimmedName,
          children: []
        };
        newData.push(newRoot);
        setSelectedQuickNodeId(newRoot.id);
        return newData;
      }

      const rootIndex = newData.findIndex(g => g.id === selectedQuickNodeId);
      if (rootIndex !== -1) {
        if (nodeEditMode === 'edit') {
          newData[rootIndex] = { ...newData[rootIndex], name: trimmedName };
        } else if (nodeEditMode === 'copy') {
          const newRoot = {
            id: Math.random().toString(36).substr(2, 9),
            name: trimmedName,
            children: newData[rootIndex].children.map(c => ({
              ...c,
              id: Math.random().toString(36).substr(2, 9),
              conditions: c.conditions ? [...c.conditions] : []
            }))
          };
          newData.splice(rootIndex + 1, 0, newRoot);
          setSelectedQuickNodeId(newRoot.id);
        } else if (nodeEditMode === 'add') {
          const newChild = {
            id: Math.random().toString(36).substr(2, 9),
            name: trimmedName,
            conditions: []
          };
          newData[rootIndex] = {
            ...newData[rootIndex],
            children: [...newData[rootIndex].children, newChild]
          };
          setSelectedQuickNodeId(newChild.id);
          setExpandedQuickNodes(prevNodes => new Set(prevNodes).add(newData[rootIndex].id));
        }
        return newData;
      }

      for (let i = 0; i < newData.length; i++) {
        const group = { ...newData[i], children: [...newData[i].children] };
        newData[i] = group;
        
        const childIndex = group.children.findIndex(c => c.id === selectedQuickNodeId);
        if (childIndex !== -1) {
          if (nodeEditMode === 'edit') {
            group.children[childIndex] = { ...group.children[childIndex], name: trimmedName };
          } else if (nodeEditMode === 'copy') {
            const newChild = {
              id: Math.random().toString(36).substr(2, 9),
              name: trimmedName,
              conditions: group.children[childIndex].conditions ? [...group.children[childIndex].conditions] : []
            };
            group.children.splice(childIndex + 1, 0, newChild);
            setSelectedQuickNodeId(newChild.id);
          } else if (nodeEditMode === 'add') {
            const newChild = {
              id: Math.random().toString(36).substr(2, 9),
              name: trimmedName,
              conditions: []
            };
            group.children.push(newChild);
            setSelectedQuickNodeId(newChild.id);
          }
          break;
        }
      }
      return newData;
    });
    setIsNodeEditModalOpen(false);
  };

  const handleDeleteNode = () => {
    if (!selectedQuickNodeId) {
      return;
    }
    if (quickTreeData.some(g => g.id === selectedQuickNodeId)) {
      alert('根目录不可修改');
      return;
    }
    
    setQuickTreeData(prev => {
      const newData = [...prev];
      
      const rootIndex = newData.findIndex(g => g.id === selectedQuickNodeId);
      if (rootIndex !== -1) {
        newData.splice(rootIndex, 1);
        return newData;
      }

      for (let i = 0; i < newData.length; i++) {
        const group = { ...newData[i], children: [...newData[i].children] };
        newData[i] = group;
        
        const childIndex = group.children.findIndex(c => c.id === selectedQuickNodeId);
        if (childIndex !== -1) {
          group.children.splice(childIndex, 1);
          break;
        }
      }
      return newData;
    });
    setSelectedQuickNodeId(null);
  };

  const handleMoveNodeUp = () => {
    if (!selectedQuickNodeId) return;
    setQuickTreeData(prev => {
      const newData = [...prev];
      
      const rootIndex = newData.findIndex(g => g.id === selectedQuickNodeId);
      if (rootIndex > 0) {
        const temp = newData[rootIndex];
        newData[rootIndex] = newData[rootIndex - 1];
        newData[rootIndex - 1] = temp;
        return newData;
      } else if (rootIndex === 0) {
        return newData;
      }

      for (let i = 0; i < newData.length; i++) {
        const group = { ...newData[i], children: [...newData[i].children] };
        newData[i] = group;
        
        const childIndex = group.children.findIndex(c => c.id === selectedQuickNodeId);
        if (childIndex > 0) {
          const temp = group.children[childIndex];
          group.children[childIndex] = group.children[childIndex - 1];
          group.children[childIndex - 1] = temp;
          break;
        }
      }
      return newData;
    });
  };

  const handleMoveNodeDown = () => {
    if (!selectedQuickNodeId) return;
    setQuickTreeData(prev => {
      const newData = [...prev];
      
      const rootIndex = newData.findIndex(g => g.id === selectedQuickNodeId);
      if (rootIndex !== -1 && rootIndex < newData.length - 1) {
        const temp = newData[rootIndex];
        newData[rootIndex] = newData[rootIndex + 1];
        newData[rootIndex + 1] = temp;
        return newData;
      } else if (rootIndex !== -1) {
        return newData;
      }

      for (let i = 0; i < newData.length; i++) {
        const group = { ...newData[i], children: [...newData[i].children] };
        newData[i] = group;
        
        const childIndex = group.children.findIndex(c => c.id === selectedQuickNodeId);
        if (childIndex !== -1 && childIndex < group.children.length - 1) {
          const temp = group.children[childIndex];
          group.children[childIndex] = group.children[childIndex + 1];
          group.children[childIndex + 1] = temp;
          break;
        }
      }
      return newData;
    });
  };

  const toggleQuickNode = (id: string) => {
    setExpandedQuickNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const [isFilterEditModalOpen, setIsFilterEditModalOpen] = useState(false);
  const [selectedQuickNodeId, setSelectedQuickNodeId] = useState<string | null>(null);

  const selectedNode = useMemo(() => {
    for (const group of quickTreeData) {
      if (group.id === selectedQuickNodeId) return group;
      const child = group.children.find(c => c.id === selectedQuickNodeId);
      if (child) return child;
    }
    return null;
  }, [quickTreeData, selectedQuickNodeId]);

  const handleNodeConditionChange = (nodeId: string, conditionId: string, key: 'field' | 'operator' | 'values', value: any) => {
    setQuickTreeData(prev => prev.map(group => ({
      ...group,
      children: group.children.map(child => {
        if (child.id === nodeId) {
          return {
            ...child,
            conditions: (child.conditions || []).map(c => c.id === conditionId ? { ...c, [key]: value } : c)
          };
        }
        return child;
      })
    })));
  };

  const handleDeleteNodeCondition = (nodeId: string, conditionId: string) => {
    setQuickTreeData(prev => prev.map(group => ({
      ...group,
      children: group.children.map(child => {
        if (child.id === nodeId) {
          return {
            ...child,
            conditions: (child.conditions || []).filter(c => c.id !== conditionId)
          };
        }
        return child;
      })
    })));
  };

  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [isReportDetailModalOpen, setIsReportDetailModalOpen] = useState(false);
  const [isReportBasicExpanded, setIsReportBasicExpanded] = useState(true);
  const [isReportLeakCheckExpanded, setIsReportLeakCheckExpanded] = useState(true);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [selectedLog, setSelectedLog] = useState<LogRecord | null>(null);
  const [modalForm, setModalForm] = useState({
    name: '',
    contact: '',
    phone: '',
    distance: '',
    measures: [] as string[],
    dangers: [] as string[],
    startDate: '',
    endDate: '',
    content: ''
  });

  const handleOpenAddModal = () => {
    setModalMode('add');
    setModalForm({
      name: '',
      contact: '',
      phone: '',
      distance: '',
      measures: [],
      dangers: [],
      startDate: '',
      endDate: '',
      content: ''
    });
    setSelectedAddModalType('请选择施工类型');
    setAddModalAddress('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (selectedIds.size === 0) {
      alert('请先选择一条数据进行修改');
      return;
    }
    if (selectedIds.size > 1) {
      alert('只能选择一条数据进行修改');
      return;
    }
    
    const selectedId = Array.from(selectedIds)[0];
    const site = MOCK_SITES.find(s => s.id === selectedId);
    if (site) {
      setModalMode('edit');
      setModalForm({
        name: site.siteName || '',
        contact: site.reporter || '',
        phone: '', 
        distance: '', 
        measures: [], 
        dangers: site.dangerDesc ? site.dangerDesc.split('、') : [],
        startDate: '', 
        endDate: '',
        content: ''
      });
      setSelectedAddModalType(site.industry || '请选择施工类型');
      setAddModalAddress(site.address || '');
      setIsAddModalOpen(true);
    }
  };

  const handleOpenDetailModal = () => {
    if (selectedIds.size === 0) {
      alert('请先选择一条数据查看明细');
      return;
    }
    if (selectedIds.size > 1) {
      alert('只能选择一条数据查看明细');
      return;
    }
    
    const selectedId = Array.from(selectedIds)[0] as string;
    handleRowDoubleClick(selectedId);
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (previewImages.length > 0) {
      const newIndex = (currentImageIndex - 1 + previewImages.length) % previewImages.length;
      setCurrentImageIndex(newIndex);
      setPreviewImageUrl(previewImages[newIndex]);
      setRotation(0);
      setZoom(1);
    }
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (previewImages.length > 0) {
      const newIndex = (currentImageIndex + 1) % previewImages.length;
      setCurrentImageIndex(newIndex);
      setPreviewImageUrl(previewImages[newIndex]);
      setRotation(0);
      setZoom(1);
    }
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRotation(prev => (prev + 90) % 360);
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleRowClick = (id: string) => {
    setSelectedIds(new Set([id]));
  };

  const handleRowDoubleClick = (id: string) => {
    const site = MOCK_SITES.find(s => s.id === id);
    if (site) {
      setModalMode('view');
      setModalForm({
        name: site.siteName || '',
        contact: site.reporter || '',
        phone: '', 
        distance: '', 
        measures: [], 
        dangers: site.dangerDesc ? site.dangerDesc.split('、') : [],
        startDate: '', 
        endDate: '',
        content: ''
      });
      setSelectedAddModalType(site.industry || '请选择施工类型');
      setAddModalAddress(site.address || '');
      setIsAddModalOpen(true);
    }
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

  const toggleStatusFilter = (status: string) => {
    const next = new Set(statusFilters);
    if (next.has(status)) next.delete(status);
    else next.add(status);
    setStatusFilters(next);
  };

  const currentSite = MOCK_SITES.find(site => selectedIds.has(site.id));
  if (currentSite) {
    prevSelectedSiteRef.current = currentSite;
  }
  const displaySite = currentSite || prevSelectedSiteRef.current;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (gradeRef.current && !gradeRef.current.contains(e.target as Node)) {
        setIsGradeDropdownOpen(false);
      }
      if (addModalTypeRef.current && !addModalTypeRef.current.contains(e.target as Node)) {
        setIsAddModalTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#f1f3f6] p-0 overflow-hidden items-stretch relative">
      
      {/* SITE-MGMT: TOP TOOLBAR */}
      <div className="w-full h-[50px] mt-0 mb-[10px] mx-0 flex items-center justify-between bg-white px-4 rounded-lg shadow-sm shrink-0 overflow-hidden">
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleOpenAddModal}
            className="h-[34px] px-3 bg-transparent text-[#666] text-[14px] font-medium rounded-lg hover:bg-slate-100 transition-all flex items-center active:scale-95 group"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            新增
          </button>
          <button 
            onClick={handleOpenEditModal}
            className="h-[34px] px-3 bg-transparent text-[#666] text-[14px] font-medium rounded-lg hover:bg-slate-100 transition-all flex items-center active:scale-95 group"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
            修改
          </button>
          <button className="h-[34px] px-3 bg-transparent text-[#666] text-[14px] font-medium rounded-lg hover:bg-slate-100 transition-all flex items-center active:scale-95 group">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
            删除
          </button>
          <button 
            onClick={handleOpenDetailModal}
            className="h-[34px] px-3 bg-transparent text-[#666] text-[14px] font-medium rounded-lg hover:bg-slate-100 transition-all flex items-center active:scale-95 group"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
            明细
          </button>
          <button className="h-[34px] px-3 bg-transparent text-[#666] text-[14px] font-medium rounded-lg hover:bg-slate-100 transition-all flex items-center active:scale-95 group">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 11.25L12 15.75m0 0l4.5-4.5M12 15.75V3" /></svg>
            导出
          </button>
          <button className="h-[34px] px-3 bg-transparent text-[#666] text-[14px] font-medium rounded-lg hover:bg-slate-100 transition-all flex items-center active:scale-95 group">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>
            指派
          </button>
        </div>
        
        <div className="relative group">
          <input 
            type="text" 
            placeholder="搜索工地名称..." 
            className="w-64 h-[34px] pl-10 pr-4 bg-slate-50/50 border border-slate-300/80 rounded-lg text-[13px] font-normal text-[#333] placeholder:text-[#999] focus:bg-white focus:border-primary outline-none transition-all duration-300"
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors duration-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* SITE-MGMT: THREE-COLUMN BODY LAYOUT */}
      <div className="w-full flex-1 flex gap-2.5 min-h-0 overflow-hidden">
        
        {/* SITE-MGMT: FILTER SIDEBAR (LEFT) */}
        <div className={`bg-white rounded-lg shadow-sm transition-all duration-300 flex flex-col shrink-0 overflow-hidden ${isSidebarCollapsed ? 'w-12 px-0 items-center' : 'w-72 px-0 pt-3 pb-[0.7rem]'}`}>
          
          <div className={`flex items-center justify-between shrink-0 px-4 ${isSidebarCollapsed ? 'mt-4 flex-col space-y-4' : 'mb-4'}`}>
            {!isSidebarCollapsed && (
              <div className="flex items-center space-x-4">
                <div 
                  className={`text-[14px] pb-1 border-b-2 flex items-center whitespace-nowrap cursor-pointer transition-colors ${filterTab === 'condition' ? 'font-bold text-primary border-primary' : 'font-normal text-[#666] border-transparent hover:text-[#333]'}`}
                  onClick={() => setFilterTab('condition')}
                >
                  条件查询
                </div>
                <div 
                  className={`text-[14px] pb-1 border-b-2 flex items-center whitespace-nowrap cursor-pointer transition-colors ${filterTab === 'quick' ? 'font-bold text-primary border-primary' : 'font-normal text-[#666] border-transparent hover:text-[#333]'}`}
                  onClick={() => setFilterTab('quick')}
                >
                  快速查询
                </div>
                <div 
                  className={`text-[14px] pb-1 border-b-2 flex items-center whitespace-nowrap cursor-pointer transition-colors ${filterTab === 'project' ? 'font-bold text-primary border-primary' : 'font-normal text-[#666] border-transparent hover:text-[#333]'}`}
                  onClick={() => setFilterTab('project')}
                >
                  项目管理
                </div>
              </div>
            )}
            
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-primary transition-all active:scale-90 ${isSidebarCollapsed ? 'rotate-180' : ''}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
              </svg>
            </button>
          </div>

          {!isSidebarCollapsed ? (
            <div className="flex-1 overflow-hidden relative">
              <div className="h-full overflow-y-auto overflow-x-hidden custom-scrollbar px-4 space-y-4 pb-2 animate-in fade-in duration-300">
                
                {filterTab === 'condition' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[14px] font-normal text-[#666]">工地名称</label>
                      <input type="text" className="w-full h-10 px-3 bg-slate-50/50 border border-slate-300 rounded-lg text-[14px] focus:bg-white focus:border-primary outline-none transition-all" placeholder="输入名称关键字" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[14px] font-normal text-[#666]">施工单位</label>
                      <input type="text" className="w-full h-10 px-3 bg-slate-50/50 border border-slate-300 rounded-lg text-[14px] focus:bg-white focus:border-primary outline-none transition-all" placeholder="搜索单位名称" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[14px] font-normal text-[#666]">施工类型</label>
                      <input type="text" className="w-full h-10 px-3 bg-slate-50/50 border border-slate-300 rounded-lg text-[14px] focus:bg-white focus:border-primary outline-none transition-all" placeholder="输入施工类型" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[14px] font-normal text-[#666]">项目业主</label>
                      <input type="text" className="w-full h-10 px-3 bg-slate-50/50 border border-slate-300 rounded-lg text-[14px] focus:bg-white focus:border-primary outline-none transition-all" placeholder="输入业主单位" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[14px] font-normal text-[#666]">监护等级</label>
                      <div className="relative" ref={gradeRef}>
                        <button 
                          onClick={() => setIsGradeDropdownOpen(!isGradeDropdownOpen)}
                          className={`w-full h-10 px-3 bg-slate-50/50 border rounded-lg text-[14px] text-left flex items-center justify-between transition-all ${
                            isGradeDropdownOpen ? 'bg-white border-primary border-b-transparent rounded-b-none' : 'border-slate-300'
                          }`}
                        >
                          <span className={selectedGrade === '全部等级' ? 'text-slate-400' : 'text-[#333]'}>{selectedGrade}</span>
                          <svg className={`w-3 h-3 text-slate-500 transition-all ${isGradeDropdownOpen ? 'rotate-180 text-primary' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isGradeDropdownOpen && (
                          <div className="absolute top-10 left-0 right-0 bg-white border border-primary border-t-0 rounded-b-lg shadow-xl z-[400] py-1">
                            {grades.map((g) => (
                              <div key={g} onClick={() => { setSelectedGrade(g); setIsGradeDropdownOpen(false); }} className={`px-3 py-2 text-[14px] cursor-pointer hover:bg-[#9a6bff]/10 transition-colors ${selectedGrade === g ? 'text-primary font-bold' : 'text-slate-600'}`}>{g}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[14px] font-normal text-[#666]">开始时间</label>
                      <div className="flex items-center space-x-1.5">
                        <InlineDatePicker value={startDateRange[0]} onChange={(v) => setStartDateRange([v, startDateRange[1]])} placeholder="起" align="left" />
                        <span className="text-slate-300 text-xs shrink-0">-</span>
                        <InlineDatePicker value={startDateRange[1]} onChange={(v) => setStartDateRange([startDateRange[0], v])} placeholder="止" align="right" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[14px] font-normal text-[#666]">结束时间</label>
                      <div className="flex items-center space-x-1.5">
                        <InlineDatePicker value={endDateRange[0]} onChange={(v) => setEndDateRange([v, endDateRange[1]])} placeholder="起" align="left" />
                        <span className="text-slate-300 text-xs shrink-0">-</span>
                        <InlineDatePicker value={endDateRange[1]} onChange={(v) => setEndDateRange([endDateRange[0], v])} placeholder="止" align="right" />
                      </div>
                    </div>

                    <div className="space-y-2.5 pb-2">
                      <label className="text-[14px] font-normal text-[#666]">当前状态</label>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                        {['待处理', '监护中', '已完工', '异常'].map(s => (
                          <FilterCheckbox key={s} label={s} checked={statusFilters.has(s)} onChange={() => toggleStatusFilter(s)} />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {filterTab === 'quick' && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[14px] font-normal text-[#666]">常用查询</label>
                        <button 
                          className="text-[13px] text-primary hover:text-primary-hover flex items-center transition-colors"
                          onClick={() => setIsFilterEditModalOpen(true)}
                        >
                          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          编辑
                        </button>
                      </div>
                      <div className="space-y-1 mt-2">
                        {quickTreeData.map(node => (
                          <div key={node.id} className="text-[14px]">
                            <div 
                              className="flex items-center py-1.5 px-2 hover:bg-slate-50 rounded-md cursor-pointer group"
                              onClick={() => toggleQuickNode(node.id)}
                            >
                              <svg 
                                className={`w-4 h-4 text-slate-400 mr-1.5 transition-transform ${expandedQuickNodes.has(node.id) ? 'rotate-90' : ''}`} 
                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <svg className="w-4 h-4 text-amber-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                              </svg>
                              <span className="text-[#333] group-hover:text-primary transition-colors">{node.name}</span>
                            </div>
                            
                            {expandedQuickNodes.has(node.id) && (
                              <div className="ml-6 pl-2 border-l border-slate-200 mt-1 space-y-1">
                                {node.children.map(child => (
                                  <div 
                                    key={child.id}
                                    className="flex items-center py-1.5 px-2 hover:bg-slate-50 rounded-md cursor-pointer group"
                                  >
                                    <svg className="w-4 h-4 text-slate-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="text-[#666] group-hover:text-primary transition-colors">{child.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {filterTab === 'project' && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="relative">
                        <input type="text" className="w-full h-9 pl-8 pr-3 bg-slate-50/50 border border-slate-300 rounded-lg text-[13px] focus:bg-white focus:border-primary outline-none transition-all" placeholder="搜索项目..." />
                        <svg className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {projectTreeData.map(project => (
                        <div key={project.id} className="text-[14px]">
                          <div 
                            className="flex items-center py-1.5 px-2 hover:bg-slate-50 rounded-md cursor-pointer group"
                            onClick={() => toggleProjectNode(project.id)}
                          >
                            <svg 
                              className={`w-4 h-4 text-slate-400 mr-1.5 transition-transform ${expandedProjectNodes.has(project.id) ? 'rotate-90' : ''}`} 
                              fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <svg className="w-4 h-4 text-amber-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                            </svg>
                            <span className="text-[#333] group-hover:text-primary transition-colors">{project.name}</span>
                          </div>
                          
                          {expandedProjectNodes.has(project.id) && (
                            <div className="ml-6 pl-2 border-l border-slate-200 mt-1 space-y-1">
                              {project.children.map(child => (
                                <div 
                                  key={child.id}
                                  className="flex items-center py-1.5 px-2 hover:bg-slate-50 rounded-md cursor-pointer group"
                                >
                                  <svg className="w-4 h-4 text-slate-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="text-[#666] group-hover:text-primary transition-colors">{child.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center pt-4">
               <span className="text-[14px] font-normal text-[#666] [writing-mode:vertical-lr] tracking-[0.5em] mt-2">查询条件</span>
            </div>
          )}

          {!isSidebarCollapsed && (
            <div className="flex gap-3 mt-2 shrink-0 px-4">
              <button className="flex-1 h-10 bg-primary text-white text-[13px] font-bold rounded-lg hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95">查询</button>
              <button className="flex-1 h-10 bg-white border border-slate-300 text-slate-500 text-[13px] font-bold rounded-lg hover:bg-slate-50 transition-all">重置</button>
            </div>
          )}
        </div>

        {/* SITE-MGMT: DATA TABLE (CENTER) */}
        <div className="flex-1 min-w-0 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col relative isolate">
          <div className="flex-1 overflow-auto custom-scrollbar">
            {viewMode === 'table' ? (
              <table className="w-full border-collapse min-w-[1250px]">
                <thead className="sticky top-0 z-20">
                  <tr>
                    <th className="sticky top-0 z-20 px-3 py-0 h-[45px] w-12 text-center border-b border-slate-300 bg-[#e8e8e8]" onClick={handleSelectAll}>
                      <div className={`w-4 h-4 border rounded mx-auto cursor-pointer flex items-center justify-center transition-all ${
                        selectedIds.size === MOCK_SITES.length && MOCK_SITES.length > 0 ? 'bg-primary border-primary text-white' : 'border-slate-300 hover:border-primary'
                      }`}>
                        {selectedIds.size === MOCK_SITES.length && MOCK_SITES.length > 0 && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={3} /></svg>}
                        {selectedIds.size > 0 && selectedIds.size < MOCK_SITES.length && <div className="w-2 h-2 bg-primary rounded-sm"></div>}
                      </div>
                    </th>
                    <th className="sticky top-0 z-20 px-3 py-0 h-[45px] text-[14px] font-normal text-[#333] border-b border-slate-300 bg-[#e8e8e8] text-center whitespace-nowrap">序号</th>
                    <th className="sticky top-0 z-20 px-3 py-0 h-[45px] text-[14px] font-normal text-[#333] border-b border-slate-300 bg-[#e8e8e8] whitespace-nowrap">最后回报人</th>
                    <th className="sticky top-0 z-20 px-3 py-0 h-[45px] text-[14px] font-normal text-[#333] border-b border-slate-300 bg-[#e8e8e8] whitespace-nowrap">最后回报日期</th>
                    <th className="sticky top-0 z-20 px-3 py-0 h-[45px] text-[14px] font-normal text-[#333] border-b border-slate-300 bg-[#e8e8e8] whitespace-nowrap">状态</th>
                    <th className="sticky top-0 z-20 px-3 py-0 h-[45px] text-[14px] font-normal text-[#333] border-b border-slate-300 bg-[#e8e8e8] w-56 whitespace-nowrap">工地名称</th>
                    <th className="sticky top-0 z-20 px-3 py-0 h-[45px] text-[14px] font-normal text-[#333] border-b border-slate-300 bg-[#e8e8e8] w-64 whitespace-nowrap">工地地址</th>
                    <th className="sticky top-0 z-20 px-3 py-0 h-[45px] text-[14px] font-normal text-[#333] border-b border-slate-300 bg-[#e8e8e8] text-center whitespace-nowrap">监护等级</th>
                    <th className="sticky top-0 z-20 px-3 py-0 h-[45px] text-[14px] font-normal text-[#333] border-b border-slate-300 bg-[#e8e8e8] whitespace-nowrap">施工行业</th>
                    <th className="sticky top-0 z-20 px-3 py-0 h-[45px] text-[14px] font-normal text-[#333] border-b border-slate-300 bg-[#e8e8e8] whitespace-nowrap">施工方式</th>
                    <th className="sticky top-0 z-20 px-3 py-0 h-[45px] text-[14px] font-normal text-[#333] border-b border-slate-300 bg-[#e8e8e8] text-center whitespace-nowrap">累计监护(天)</th>
                    <th className="sticky top-0 z-20 px-3 py-0 h-[45px] text-[14px] font-normal text-[#333] border-b border-slate-300 bg-[#e8e8e8] whitespace-nowrap">危险描述</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {MOCK_SITES.map((site, index) => {
                    const isSelected = selectedIds.has(site.id);
                    return (
                      <tr key={site.id} className={`hover:bg-slate-100/80 transition-colors group cursor-pointer ${isSelected ? 'bg-blue-100/40' : ''}`} onClick={() => handleRowClick(site.id)} onDoubleClick={() => handleRowDoubleClick(site.id)}>
                        <td className="p-3 text-center border-b border-slate-300" onClick={(e) => handleCheckboxClick(e, site.id)}>
                          <div className={`w-4 h-4 border rounded mx-auto flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary text-white' : 'border-slate-300 group-hover:border-primary'}`}>
                            {isSelected && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={3} /></svg>}
                          </div>
                        </td>
                        <td className="p-3 text-center text-[14px] text-[#666] border-b border-slate-300">{index + 1}</td>
                        <td className="p-3 text-[14px] text-[#666] border-b border-slate-300">{site.reporter}</td>
                        <td className="p-3 text-[14px] text-[#666] font-mono border-b border-slate-300 whitespace-nowrap">{site.reportDate}</td>
                        <td className="p-3 border-b border-slate-300">
                          <div className="flex justify-start">
                            {site.status === 'pending' && <span className="inline-block w-20 py-0.5 bg-blue-50 text-blue-600 text-[14px] rounded-full border border-blue-600 whitespace-nowrap text-center">待处理</span>}
                            {site.status === 'monitoring' && <span className="inline-block w-20 py-0.5 bg-amber-50 text-amber-600 text-[14px] rounded-full border border-amber-600 whitespace-nowrap text-center">监护中</span>}
                            {site.status === 'completed' && <span className="inline-block w-20 py-0.5 bg-emerald-50 text-emerald-600 text-[14px] rounded-full border border-emerald-600 whitespace-nowrap text-center">已完工</span>}
                            {site.status === 'error' && <span className="inline-block w-20 py-0.5 bg-rose-50 text-rose-500 text-[14px] rounded-full border border-rose-500 whitespace-nowrap text-center">异常</span>}
                          </div>
                        </td>
                        <td className="p-3 text-[14px] text-[#666] border-b border-slate-300">{site.siteName}</td>
                        <td className="p-3 text-[14px] text-[#666] border-b border-slate-300">{site.address}</td>
                        <td className="p-3 text-center border-b border-slate-300 text-[14px]">
                          {site.grade === '1' && <span className="px-2 py-0.5 bg-rose-50 text-rose-500 border border-rose-200 text-[14px] rounded-md">一级</span>}
                          {site.grade === '2' && <span className="px-2 py-0.5 bg-amber-50 text-amber-500 border border-amber-200 text-[14px] rounded-md">二级</span>}
                          {site.grade === '3' && <span className="px-2 py-0.5 bg-sky-50 text-sky-500 border border-sky-200 text-[14px] rounded-md">三级</span>}
                        </td>
                        <td className="p-3 text-[14px] text-[#666] border-b border-slate-300">{site.industry}</td>
                        <td className="p-3 text-[14px] text-[#666] border-b border-slate-300">{site.method}</td>
                        <td className="p-3 text-center text-[14px] text-[#666] font-mono border-b border-slate-300">{site.days}</td>
                        <td className="p-3 text-[14px] text-[#666] border-b border-slate-300">{site.dangerDesc}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {MOCK_SITES.map((site) => {
                  const isSelected = selectedIds.has(site.id);
                  return (
                    <div 
                      key={site.id} 
                      className={`relative bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer ${isSelected ? 'border-primary ring-1 ring-primary' : 'border-slate-200 hover:border-primary/50'}`}
                      onClick={() => handleRowClick(site.id)}
                      onDoubleClick={() => handleRowDoubleClick(site.id)}
                    >
                      <div className="absolute top-2 left-2 z-10" onClick={(e) => handleCheckboxClick(e, site.id)}>
                        <div className={`w-4 h-4 border rounded flex items-center justify-center transition-all bg-white/90 backdrop-blur-sm ${isSelected ? 'bg-primary border-primary text-white' : 'border-slate-300 hover:border-primary'}`}>
                          {isSelected && <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={4} /></svg>}
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 z-10">
                        {site.status === 'pending' && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full border border-white/30 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80"></span>
                            待处理
                          </span>
                        )}
                        {site.status === 'monitoring' && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full border border-white/30 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse"></span>
                            监护中
                          </span>
                        )}
                        {site.status === 'completed' && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full border border-white/30 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80"></span>
                            已完工
                          </span>
                        )}
                        {site.status === 'error' && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-full border border-white/30 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse"></span>
                            异常
                          </span>
                        )}
                      </div>
                      <div className="aspect-[4/3] bg-slate-100 relative">
                        <img 
                          src={`https://loremflickr.com/400/300/construction,building,site?lock=${site.id}`} 
                          alt={site.siteName} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer" 
                        />
                      </div>
                      <div className="p-2">
                        <h3 className="text-slate-800 font-bold text-[13px] truncate text-center">{site.siteName}</h3>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="h-11 border-t border-slate-300 flex items-center justify-between px-6 bg-slate-50/30 shrink-0 relative">
            <div className="flex-1"></div>
            <div className="flex-none">
              <Pagination total={4} />
            </div>
            <div className="flex-1 flex justify-end">
              <div className="flex items-center bg-slate-200/50 p-0.5 rounded-lg border border-slate-200">
                <button 
                  className={`px-2.5 py-1 text-[13px] font-medium rounded-md transition-all ${viewMode === 'table' ? 'bg-white text-[#9a6bff] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} 
                  onClick={() => setViewMode('table')}
                  title="表格模式"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                </button>
                <button 
                  className={`px-2.5 py-1 text-[13px] font-medium rounded-md transition-all ${viewMode === 'image' ? 'bg-white text-[#9a6bff] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} 
                  onClick={() => setViewMode('image')}
                  title="图片模式"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SITE-MGMT: MICRO NAVIGATION (RIGHT) */}
        <div className={`bg-white rounded-lg shadow-sm flex shrink-0 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden ${selectedIds.size > 0 ? 'w-[380px]' : 'w-14'}`}>
          
          {/* 详情内容区 */}
          <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ${selectedIds.size > 0 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
            {displaySite && activeTab === 'basic' && (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* 头部信息 */}
                <div className="p-5 border-b border-slate-50 bg-slate-50/30 relative">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-[16px] font-bold text-slate-800 leading-snug pr-4">{displaySite.siteName}</h2>
                    <div className="flex items-center space-x-2 shrink-0">
                      {displaySite.status === 'pending' && <span className="px-2.5 py-1 bg-blue-50 text-[#3b82f6] text-[12px] font-bold rounded-md border border-blue-100/50">待处理</span>}
                      {displaySite.status === 'monitoring' && <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[12px] font-bold rounded-md border border-emerald-100/50">监护中</span>}
                      {displaySite.status === 'error' && <span className="px-2.5 py-1 bg-rose-50 text-rose-500 text-[12px] font-bold rounded-md border border-rose-100/50">异常</span>}
                    </div>
                  </div>
                  <div className="flex items-start text-[14px] text-slate-500 leading-relaxed">
                    <svg className="w-4 h-4 mr-1.5 shrink-0 mt-0.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2"/></svg>
                    {displaySite.address}
                  </div>
                </div>

                {/* 详细字段 */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                  
                  {/* 基础属性 */}
                  <div>
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                      <div>
                        <div className="text-[14px] text-[#666] mb-1">监护等级</div>
                        <div className="text-[14px] font-bold">
                          {displaySite.grade === '1' && <span className="text-rose-500">一级监护</span>}
                          {displaySite.grade === '2' && <span className="text-amber-500">二级监护</span>}
                          {displaySite.grade === '3' && <span className="text-sky-500">三级监护</span>}
                        </div>
                      </div>
                      <div>
                        <div className="text-[14px] text-[#666] mb-1">施工行业</div>
                        <div className="text-[14px] font-normal text-[#333]">{displaySite.industry}</div>
                      </div>
                      <div>
                        <div className="text-[14px] text-[#666] mb-1">施工方式</div>
                        <div className="text-[14px] font-normal text-[#333]">{displaySite.method}</div>
                      </div>
                      <div>
                        <div className="text-[14px] text-[#666] mb-1">累计监护</div>
                        <div className="text-[14px] font-normal text-[#333] font-mono">{displaySite.days} <span className="text-[14px] font-normal text-[#333]">天</span></div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-[14px] text-[#666] mb-1">危险描述</div>
                        <div className="text-[14px] font-normal text-[#333] leading-relaxed">{displaySite.dangerDesc}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-[14px] text-[#666] mb-1">最新回报</div>
                        <div className="text-[14px] font-normal text-[#333]">
                          {displaySite.reporter} <span className="text-[14px] font-normal text-[#333] ml-2">{displaySite.reportDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {displaySite && activeTab === 'personnel' && (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="h-[45px] border-b border-slate-300 flex items-center justify-between px-5 bg-slate-50/50 shrink-0">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-4 bg-[#9a6bff] rounded-full"></div>
                    <h3 className="text-[14px] font-bold text-[#333]">所属人员</h3>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-white">
                  <div className="ml-2">
                    <div className="relative pl-4 border-l-2 border-slate-300 pb-6">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-[#9a6bff]"></div>
                      <div className="flex items-center justify-between mb-2 leading-none">
                        <span className="text-[14px] font-bold text-slate-800">2024/12/02~</span>
                      </div>
                      
                      <div className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden mt-3">
                        <div className="p-4 space-y-4">
                          <div className="flex items-start">
                            <div className="w-20 shrink-0 text-[14px] font-normal text-[#666]">
                              工地监护
                            </div>
                            <div className="flex-1 text-[14px] text-[#333] leading-relaxed">
                              3005
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="w-20 shrink-0 text-[14px] font-normal text-[#666]">
                              周期计划
                            </div>
                            <div className="flex-1 text-[14px] text-[#333] leading-relaxed">
                              每 7 天检查一遍
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative pl-4 border-l-2 border-slate-300 pb-6">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-slate-300"></div>
                      <div className="flex items-center justify-between mb-2 leading-none">
                        <span className="text-[14px] font-bold text-slate-800">2024/10/15~2024/12/01</span>
                      </div>
                      
                      <div className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden mt-3">
                        <div className="p-4 space-y-4">
                          <div className="flex items-start">
                            <div className="w-20 shrink-0 text-[14px] font-normal text-[#666]">
                              工地监护
                            </div>
                            <div className="flex-1 text-[14px] text-[#333] leading-relaxed">
                              3002
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="w-20 shrink-0 text-[14px] font-normal text-[#666]">
                              周期计划
                            </div>
                            <div className="flex-1 text-[14px] text-[#333] leading-relaxed">
                              每 14 天检查一遍
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative pl-4 border-l-2 border-transparent pb-6">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-slate-300"></div>
                      <div className="flex items-center justify-between mb-2 leading-none">
                        <span className="text-[14px] font-bold text-slate-800">2024/08/01~2024/10/14</span>
                      </div>
                      
                      <div className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden mt-3">
                        <div className="p-4 space-y-4">
                          <div className="flex items-start">
                            <div className="w-20 shrink-0 text-[14px] font-normal text-[#666]">
                              工地监护
                            </div>
                            <div className="flex-1 text-[14px] text-[#333] leading-relaxed">
                              3001
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="w-20 shrink-0 text-[14px] font-normal text-[#666]">
                              周期计划
                            </div>
                            <div className="flex-1 text-[14px] text-[#333] leading-relaxed">
                              每 30 天检查一遍
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {displaySite && activeTab === 'log' && (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="h-[45px] border-b border-slate-300 flex items-center justify-between px-5 bg-slate-50/50 shrink-0">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-4 bg-[#9a6bff] rounded-full"></div>
                    <h3 className="text-[14px] font-bold text-[#333] whitespace-nowrap">处理日志</h3>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-white">
                  {/* 筛选栏 */}
                  <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-xl mb-2">
                    <div className="relative flex-1">
                      <select className="w-full h-8 pl-3 pr-8 bg-white border border-slate-300 rounded-lg text-[12px] font-medium text-slate-600 appearance-none outline-none focus:border-[#9a6bff] focus:ring-2 focus:ring-[#9a6bff]/10 transition-all shadow-sm">
                        <option>2026年</option>
                      </select>
                      <svg className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                    <div className="relative flex-1">
                      <select className="w-full h-8 pl-3 pr-8 bg-white border border-slate-300 rounded-lg text-[12px] font-medium text-slate-600 appearance-none outline-none focus:border-[#9a6bff] focus:ring-2 focus:ring-[#9a6bff]/10 transition-all shadow-sm">
                        <option>02月</option>
                      </select>
                      <svg className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                    <div className="relative flex-1">
                      <select className="w-full h-8 pl-3 pr-8 bg-white border border-slate-300 rounded-lg text-[12px] font-medium text-slate-600 appearance-none outline-none focus:border-[#9a6bff] focus:ring-2 focus:ring-[#9a6bff]/10 transition-all shadow-sm">
                        <option>全部</option>
                      </select>
                      <svg className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>

                  {/* 日志列表 */}
                  <div className="ml-2">
                    {[
                      {
                        id: '1',
                        date: '02/25',
                        day: '第1天',
                        time: '11:10',
                        person: '张蕾',
                        type: '用户安检',
                        content: '正常入户',
                        images: [
                          'https://picsum.photos/seed/log1/100/100',
                          'https://picsum.photos/seed/log2/100/100',
                          'https://picsum.photos/seed/log3/100/100',
                          'https://picsum.photos/seed/log4/100/100',
                        ],
                        imageCount: 9
                      },
                      {
                        id: '2',
                        date: '02/24',
                        day: '第2天',
                        time: '14:30',
                        person: '李明',
                        type: '设备巡检',
                        content: '发现设备外壳有轻微划痕，已记录并上报。',
                        images: [
                          'https://picsum.photos/seed/log5/100/100',
                          'https://picsum.photos/seed/log6/100/100',
                        ],
                        imageCount: 2
                      },
                      {
                        id: '3',
                        date: '02/23',
                        day: '第3天',
                        time: '09:15',
                        person: '王强',
                        type: '安全培训',
                        content: '组织现场施工人员进行安全规范培训，全员参与。',
                        images: [
                          'https://picsum.photos/seed/log7/100/100',
                          'https://picsum.photos/seed/log8/100/100',
                          'https://picsum.photos/seed/log9/100/100',
                        ],
                        imageCount: 3
                      }
                    ].map((log, index, arr) => (
                      <div key={log.id} className={`relative pl-4 border-l-2 ${index === arr.length - 1 ? 'border-transparent' : 'border-slate-300'} pb-6`}>
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-[#9a6bff]"></div>
                        <div className="flex items-center justify-between mb-2 leading-none">
                          <span className="text-[14px] font-bold text-slate-800">{log.date}</span>
                          <span className="text-[12px] font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">{log.day}</span>
                        </div>
                        
                        <div className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden mt-3">
                          {/* Header of the card */}
                          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-300 bg-slate-100/80">
                            <div className="flex items-center space-x-3">
                              <div className="text-[14px] font-normal text-[#666] font-mono leading-none mt-0.5">{log.time}</div>
                              <div className="flex items-center space-x-2">
                                <span className="text-[14px] font-normal text-[#333] leading-none">{log.person}</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                const mappedLog: LogRecord = {
                                  id: log.id,
                                  recordTime: `2026/${log.date} ${log.time}`,
                                  dept: '工程部',
                                  person: log.person,
                                  processTime: `2026/${log.date} ${log.time}`,
                                  docName: log.type,
                                  status: '已审核',
                                  content: log.content,
                                  attachments: log.images,
                                  detail: '明细'
                                };
                                setSelectedLog(mappedLog);
                                setIsReportDetailModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 bg-[#9a6bff] text-white text-[12px] font-medium rounded-lg hover:bg-[#8558eb] transition-all shadow-sm shadow-[#9a6bff]/20 active:scale-95"
                            >
                              明细
                            </button>
                          </div>
                          
                          {/* Content */}
                          <div className="p-4 space-y-4">
                            <div className="flex items-start">
                              <div className="w-16 shrink-0 text-[14px] font-normal text-[#666]">
                                {log.type}
                              </div>
                              <div className="flex-1 text-[14px] text-[#333] leading-relaxed">
                                {log.content}
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <div className="w-16 shrink-0 text-[14px] font-normal text-[#666]">
                                附件
                              </div>
                              <div className="flex-1 flex items-end space-x-2 overflow-hidden">
                                <div className="flex space-x-2 overflow-x-auto custom-scrollbar pb-2">
                                  {log.images.map((img, i) => (
                                    <img key={i} src={img} alt="附件" className="w-12 h-12 rounded-[0.5rem] object-cover border border-slate-300 shadow-sm shrink-0" referrerPolicy="no-referrer" />
                                  ))}
                                </div>
                                <div className="text-[12px] font-medium text-slate-400 shrink-0 bg-slate-50 px-2 py-1 rounded-md mb-2">
                                  共 {log.imageCount} 张
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {displaySite && activeTab === 'danger' && (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="h-[45px] border-b border-slate-300 flex items-center justify-between px-5 bg-slate-50/50 shrink-0">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-4 bg-[#9a6bff] rounded-full"></div>
                    <h3 className="text-[14px] font-bold text-[#333] whitespace-nowrap">隐患记录</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-[12px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-300 flex items-center space-x-1">
                      <span>总数:</span>
                      <span className="font-mono text-slate-800 font-bold">0</span>
                    </div>
                    <div className="text-[12px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center space-x-1">
                      <span>待处理:</span>
                      <span className="font-mono text-amber-600 font-bold">0</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-white">
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                      <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <span className="text-[14px]">暂无隐患记录</span>
                  </div>
                </div>
              </div>
            )}

            {displaySite && activeTab === 'history' && (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="h-[45px] border-b border-slate-300 flex items-center justify-between px-5 bg-slate-50/50 shrink-0">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-4 bg-[#9a6bff] rounded-full"></div>
                    <h3 className="text-[14px] font-bold text-[#333]">监护历程</h3>
                  </div>
                  <div className="text-[12px] font-medium text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-300 shadow-sm flex items-center space-x-1.5">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>总时长:</span>
                    <span className="font-mono text-[#9a6bff] font-bold">3小时</span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-white">
                  <div className="ml-2 mt-4">
                    {[
                      {
                        id: 'h1',
                        date: '2026-02-26 15:30',
                        day: '完成',
                        time: '15:30',
                        person: '张蕾',
                        type: '处理时间',
                        duration: '2小时30分',
                        content: '隐患已排除，现场恢复正常，监护结束。',
                        isEnd: true
                      },
                      {
                        id: 'h2',
                        date: '2026-02-26 13:00',
                        day: '处理中',
                        time: '13:00',
                        person: '张蕾',
                        type: '处理时间',
                        duration: '30分钟',
                        content: '施工队已到达现场，开始进行管线修复作业。'
                      },
                      {
                        id: 'h3',
                        date: '2026-02-26 12:30',
                        day: '接单',
                        time: '12:30',
                        person: '张蕾',
                        type: '合计用时',
                        duration: '3小时',
                        content: '收到系统派单，确认现场情况，准备前往处理。'
                      }
                    ].map((log, index, arr) => (
                      <div key={log.id} className={`relative pl-4 border-l-2 ${index === arr.length - 1 ? 'border-transparent' : 'border-slate-300'} pb-6`}>
                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 ${log.isEnd ? 'border-emerald-500' : 'border-[#9a6bff]'}`}></div>
                        <div className="flex items-center justify-between mb-2 leading-none">
                          <span className="text-[14px] font-bold text-slate-800 font-mono">{log.date}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full ${log.isEnd ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{log.day}</span>
                            <button className="px-2.5 py-1 bg-[#9a6bff] text-white text-[12px] font-medium rounded hover:bg-[#8558eb] transition-all shadow-sm shadow-[#9a6bff]/20 active:scale-95">
                              详情
                            </button>
                          </div>
                        </div>
                        
                        <div className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden mt-3">
                          {/* Content */}
                          <div className="p-4 space-y-4">
                            <div className="flex items-start">
                              <div className="w-16 shrink-0 text-[14px] font-normal text-[#666]">
                                {log.type}
                              </div>
                              <div className="flex-1 text-[14px] font-mono font-medium text-[#333] leading-relaxed">
                                {log.duration}
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <div className="w-16 shrink-0 text-[14px] font-normal text-[#666]">
                                处理内容
                              </div>
                              <div className="flex-1 text-[14px] text-[#333] leading-relaxed">
                                {log.content}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={`w-14 flex flex-col items-center py-4 shrink-0 bg-white relative z-10 transition-all duration-500 ${selectedIds.size > 0 ? 'border-l border-slate-300' : ''}`}>
            <div className="flex flex-col items-center space-y-4">
              {/* 基本信息 */}
              <div className="relative group">
                <button 
                  onClick={() => {
                    if (selectedIds.size === 0) {
                      // If no row is selected, select the first one to show the panel
                      setSelectedIds(new Set([MOCK_SITES[0].id]));
                      setActiveTab('basic');
                    } else if (activeTab === 'basic') {
                      // If already on this tab, close the panel
                      setSelectedIds(new Set());
                    } else {
                      // Switch to this tab
                      setActiveTab('basic');
                    }
                  }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 ${activeTab === 'basic' && selectedIds.size > 0 ? 'bg-[#9a6bff] text-white shadow-lg shadow-[#9a6bff]/30' : 'text-slate-400 hover:text-[#9a6bff] hover:bg-[#9a6bff]/10'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-50">
                  基本信息
                  <div className="absolute top-1/2 -translate-y-1/2 -right-1 border-[5px] border-transparent border-l-slate-800"></div>
                </div>
              </div>

              {/* 所属人员 */}
              <div className="relative group">
                <button 
                  onClick={() => {
                    if (selectedIds.size === 0) {
                      setSelectedIds(new Set([MOCK_SITES[0].id]));
                      setActiveTab('personnel');
                    } else if (activeTab === 'personnel') {
                      setSelectedIds(new Set());
                    } else {
                      setActiveTab('personnel');
                    }
                  }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 ${activeTab === 'personnel' && selectedIds.size > 0 ? 'bg-[#9a6bff] text-white shadow-lg shadow-[#9a6bff]/30' : 'text-slate-400 hover:text-[#9a6bff] hover:bg-[#9a6bff]/10'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </button>
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-50">
                  所属人员
                  <div className="absolute top-1/2 -translate-y-1/2 -right-1 border-[5px] border-transparent border-l-slate-800"></div>
                </div>
              </div>
              
              {/* 处理日志 */}
              <div className="relative group">
                <button 
                  onClick={() => {
                    if (selectedIds.size === 0) {
                      setSelectedIds(new Set([MOCK_SITES[0].id]));
                      setActiveTab('log');
                    } else if (activeTab === 'log') {
                      setSelectedIds(new Set());
                    } else {
                      setActiveTab('log');
                    }
                  }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 ${activeTab === 'log' && selectedIds.size > 0 ? 'bg-[#9a6bff] text-white shadow-lg shadow-[#9a6bff]/30' : 'text-slate-400 hover:text-[#9a6bff] hover:bg-[#9a6bff]/10'}`}
                >
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
                <button 
                  onClick={() => {
                    if (selectedIds.size === 0) {
                      setSelectedIds(new Set([MOCK_SITES[0].id]));
                      setActiveTab('danger');
                    } else if (activeTab === 'danger') {
                      setSelectedIds(new Set());
                    } else {
                      setActiveTab('danger');
                    }
                  }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 ${activeTab === 'danger' && selectedIds.size > 0 ? 'bg-[#9a6bff] text-white shadow-lg shadow-[#9a6bff]/30' : 'text-slate-400 hover:text-[#9a6bff] hover:bg-[#9a6bff]/10'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </button>
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-50">
                  隐患记录
                  <div className="absolute top-1/2 -translate-y-1/2 -right-1 border-[5px] border-transparent border-l-slate-800"></div>
                </div>
              </div>

              {/* 监护历程 */}
              <div className="relative group">
                <button 
                  onClick={() => {
                    if (selectedIds.size === 0) {
                      setSelectedIds(new Set([MOCK_SITES[0].id]));
                      setActiveTab('history');
                    } else if (activeTab === 'history') {
                      setSelectedIds(new Set());
                    } else {
                      setActiveTab('history');
                    }
                  }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 ${activeTab === 'history' && selectedIds.size > 0 ? 'bg-[#9a6bff] text-white shadow-lg shadow-[#9a6bff]/30' : 'text-slate-400 hover:text-[#9a6bff] hover:bg-[#9a6bff]/10'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-50">
                  监护历程
                  <div className="absolute top-1/2 -translate-y-1/2 -right-1 border-[5px] border-transparent border-l-slate-800"></div>
                </div>
              </div>
            </div>
            <div className="mt-auto space-y-3 pb-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-auto"></div><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-auto"></div></div>
          </div>
        </div>

      </div>

      {/* ADD SITE MODAL */}
      {isAddModalOpen && (
        <div className={`absolute inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 transition-colors duration-300 ${(isMapModalOpen || isReportDetailModalOpen) ? '' : 'bg-black/40 backdrop-blur-sm'}`}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[800px] h-full max-h-[800px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-100">
              <h3 className="text-[16px] font-bold text-slate-800">{modalMode === 'add' ? '新增工地' : modalMode === 'edit' ? '修改工地' : '工地详情'}</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {/* 基本信息 */}
              <div className="mb-8">
                <div 
                  className="flex items-center mb-4 cursor-pointer group"
                  onClick={() => setIsBasicInfoExpanded(!isBasicInfoExpanded)}
                >
                  <div className="w-1 h-4 bg-[#9a6bff] rounded-full mr-2"></div>
                  <h4 className="text-[15px] font-bold text-slate-800 flex-1">基本信息</h4>
                  <svg 
                    className={`w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${isBasicInfoExpanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                <div className={`grid grid-cols-4 gap-x-6 gap-y-5 transition-all duration-300 overflow-hidden ${isBasicInfoExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="col-span-1">
                    <label className="block text-[13px] font-medium text-[#666] mb-1.5">工地名称 <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      value={modalForm.name}
                      onChange={(e) => setModalForm({...modalForm, name: e.target.value})}
                      disabled={modalMode === 'view'}
                      className={`w-full h-9 px-3 border border-slate-300 rounded-lg text-[13px] text-[#333] focus:border-[#9a6bff] outline-none transition-all ${modalMode === 'view' ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} 
                      placeholder="请输入工地名称" 
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label className="block text-[13px] font-medium text-[#666] mb-1.5">施工类型 <span className="text-rose-500">*</span></label>
                    <div className="relative" ref={addModalTypeRef}>
                      <button 
                        type="button"
                        onClick={() => modalMode !== 'view' && setIsAddModalTypeDropdownOpen(!isAddModalTypeDropdownOpen)}
                        disabled={modalMode === 'view'}
                        className={`w-full h-9 px-3 bg-white border rounded-lg text-[13px] text-left flex items-center justify-between transition-all outline-none ${
                          isAddModalTypeDropdownOpen ? 'border-[#9a6bff] border-b-transparent rounded-b-none' : 'border-slate-300 focus:border-[#9a6bff]'
                        } ${modalMode === 'view' ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
                      >
                        <span className={selectedAddModalType === '请选择施工类型' ? 'text-slate-400' : 'text-[#333]'}>{selectedAddModalType}</span>
                        <svg className={`w-3 h-3 text-slate-500 transition-all ${isAddModalTypeDropdownOpen ? 'rotate-180 text-[#9a6bff]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isAddModalTypeDropdownOpen && (
                        <div className="absolute top-[35px] left-0 right-0 bg-white border border-[#9a6bff] border-t-0 rounded-b-lg shadow-xl z-[400] py-1">
                          {addModalTypes.map((type) => (
                            <div 
                              key={type} 
                              onClick={() => { setSelectedAddModalType(type); setIsAddModalTypeDropdownOpen(false); }} 
                              className={`px-3 py-2 text-[13px] cursor-pointer hover:bg-[#9a6bff]/10 transition-colors ${selectedAddModalType === type ? 'text-[#9a6bff] font-bold' : 'text-[#333]'}`}
                            >
                              {type}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[13px] font-medium text-[#666] mb-1.5">施工单位联系人</label>
                    <input 
                      type="text" 
                      value={modalForm.contact}
                      onChange={(e) => setModalForm({...modalForm, contact: e.target.value})}
                      disabled={modalMode === 'view'}
                      className={`w-full h-9 px-3 border border-slate-300 rounded-lg text-[13px] text-[#333] focus:border-[#9a6bff] outline-none transition-all ${modalMode === 'view' ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} 
                      placeholder="请输入联系人" 
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[13px] font-medium text-[#666] mb-1.5">施工单位联系电话</label>
                    <input 
                      type="text" 
                      value={modalForm.phone}
                      onChange={(e) => setModalForm({...modalForm, phone: e.target.value})}
                      disabled={modalMode === 'view'}
                      className={`w-full h-9 px-3 border border-slate-300 rounded-lg text-[13px] text-[#333] focus:border-[#9a6bff] outline-none transition-all ${modalMode === 'view' ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} 
                      placeholder="请输入联系电话" 
                    />
                  </div>

                  <div className="col-span-4">
                    <label className="block text-[13px] font-medium text-[#666] mb-1.5">工地地址 <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={addModalAddress}
                        onChange={(e) => setAddModalAddress(e.target.value)}
                        disabled={modalMode === 'view'}
                        className={`w-full h-9 pl-3 pr-16 border border-slate-300 rounded-lg text-[13px] text-[#333] focus:border-[#9a6bff] outline-none transition-all ${modalMode === 'view' ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} 
                        placeholder="请输入或定位工地地址" 
                      />
                      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center">
                        {addModalAddress && modalMode !== 'view' && (
                          <button 
                            type="button"
                            onClick={() => setAddModalAddress('')}
                            className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                            title="清空"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        )}
                        {modalMode !== 'view' && (
                          <button 
                            type="button"
                            onClick={() => setIsMapModalOpen(true)}
                            className="p-1.5 text-[#9a6bff] hover:text-[#8558eb] transition-colors" 
                            title="定位"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-4">
                    <label className="block text-[13px] font-medium text-[#666] mb-1.5">离管线设施最近距离</label>
                    <div className="flex items-center space-x-6 h-9">
                      {['< 1米', '1-3米', '3-5米', '> 5米'].map((dist) => (
                        <label key={dist} className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="distance" 
                            checked={modalForm.distance === dist}
                            onChange={() => setModalForm({...modalForm, distance: dist})}
                            disabled={modalMode === 'view'}
                            className={`w-4 h-4 text-[#9a6bff] accent-[#9a6bff] border-slate-300 focus:ring-[#9a6bff] ${modalMode === 'view' ? 'cursor-not-allowed opacity-50' : ''}`} 
                          />
                          <span className="text-[13px] text-[#333] transition-colors">{dist}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-4">
                    <label className="block text-[13px] font-medium text-[#666] mb-1.5">已采取措施</label>
                    <div className="flex flex-wrap gap-x-6 gap-y-3 min-h-[36px] items-center">
                      {['设置围挡', '悬挂警示牌', '专人监护', '管线探明', '技术交底'].map((measure) => (
                        <label key={measure} className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={modalForm.measures.includes(measure)}
                            onChange={(e) => {
                              const newMeasures = e.target.checked 
                                ? [...modalForm.measures, measure]
                                : modalForm.measures.filter(m => m !== measure);
                              setModalForm({...modalForm, measures: newMeasures});
                            }}
                            disabled={modalMode === 'view'}
                            className={`w-4 h-4 text-[#9a6bff] accent-[#9a6bff] border-slate-300 rounded focus:ring-[#9a6bff] ${modalMode === 'view' ? 'cursor-not-allowed opacity-50' : ''}`} 
                          />
                          <span className="text-[13px] text-[#333] transition-colors">{measure}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-4">
                    <label className="block text-[13px] font-medium text-[#666] mb-1.5">可能发生的危险</label>
                    <div className="flex flex-wrap gap-x-6 gap-y-3 min-h-[36px] items-center">
                      {['管线破损', '燃气泄漏', '触电危险', '地基沉降', '水管爆裂'].map((danger) => (
                        <label key={danger} className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={modalForm.dangers.includes(danger)}
                            onChange={(e) => {
                              const newDangers = e.target.checked 
                                ? [...modalForm.dangers, danger]
                                : modalForm.dangers.filter(d => d !== danger);
                              setModalForm({...modalForm, dangers: newDangers});
                            }}
                            disabled={modalMode === 'view'}
                            className={`w-4 h-4 text-[#9a6bff] accent-[#9a6bff] border-slate-300 rounded focus:ring-[#9a6bff] ${modalMode === 'view' ? 'cursor-not-allowed opacity-50' : ''}`} 
                          />
                          <span className="text-[13px] text-[#333] transition-colors">{danger}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[13px] font-medium text-[#666] mb-1.5">开始时间 <span className="text-rose-500">*</span></label>
                    <input 
                      type="date" 
                      value={modalForm.startDate}
                      onChange={(e) => setModalForm({...modalForm, startDate: e.target.value})}
                      disabled={modalMode === 'view'}
                      className={`w-full h-9 px-3 border border-slate-300 rounded-lg text-[13px] text-[#333] focus:border-[#9a6bff] outline-none transition-all ${modalMode === 'view' ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} 
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[13px] font-medium text-[#666] mb-1.5">结束时间 <span className="text-rose-500">*</span></label>
                    <input 
                      type="date" 
                      value={modalForm.endDate}
                      onChange={(e) => setModalForm({...modalForm, endDate: e.target.value})}
                      disabled={modalMode === 'view'}
                      className={`w-full h-9 px-3 border border-slate-300 rounded-lg text-[13px] text-[#333] focus:border-[#9a6bff] outline-none transition-all ${modalMode === 'view' ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} 
                    />
                  </div>

                  <div className="col-span-4">
                    <label className="block text-[13px] font-medium text-[#666] mb-1.5">施工内容或方式</label>
                    <textarea 
                      value={modalForm.content}
                      onChange={(e) => setModalForm({...modalForm, content: e.target.value})}
                      disabled={modalMode === 'view'}
                      className={`w-full h-24 p-3 border border-slate-300 rounded-lg text-[13px] text-[#333] focus:border-[#9a6bff] outline-none transition-all resize-none ${modalMode === 'view' ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} 
                      placeholder="请输入施工内容或方式描述..."
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* 处理日志 */}
              <div className="mb-8">
                <div 
                  className="flex items-center mb-4 cursor-pointer group"
                  onClick={() => setIsLogExpanded(!isLogExpanded)}
                >
                  <div className="w-1 h-4 bg-[#9a6bff] rounded-full mr-2"></div>
                  <h4 className="text-[15px] font-bold text-slate-800 flex-1 whitespace-nowrap">处理日志</h4>
                  <svg 
                    className={`w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${isLogExpanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                <div className={`transition-all duration-300 overflow-hidden ${isLogExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-4 py-3 text-[13px] font-bold text-slate-700 whitespace-nowrap">序号</th>
                          <th className="px-4 py-3 text-[13px] font-bold text-slate-700 whitespace-nowrap">记录时间</th>
                          <th className="px-4 py-3 text-[13px] font-bold text-slate-700 whitespace-nowrap">处理部门</th>
                          <th className="px-4 py-3 text-[13px] font-bold text-slate-700 whitespace-nowrap">处理人员</th>
                          <th className="px-4 py-3 text-[13px] font-bold text-slate-700 whitespace-nowrap">处理时间</th>
                          <th className="px-4 py-3 text-[13px] font-bold text-slate-700 whitespace-nowrap">单据名称</th>
                          <th className="px-4 py-3 text-[13px] font-bold text-slate-700 whitespace-nowrap">状态</th>
                          <th className="px-4 py-3 text-[13px] font-bold text-slate-700 whitespace-nowrap">处理内容</th>
                          <th className="px-4 py-3 text-[13px] font-bold text-slate-700 whitespace-nowrap">附件</th>
                          <th className="px-4 py-3 text-[13px] font-bold text-slate-700 whitespace-nowrap">日志明细</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MOCK_LOGS.map((log, index) => (
                          <tr key={log.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 text-[13px] text-slate-600 whitespace-nowrap">{index + 1}</td>
                            <td className="px-4 py-3 text-[13px] text-slate-600 whitespace-nowrap">{log.recordTime}</td>
                            <td className="px-4 py-3 text-[13px] text-slate-600 whitespace-nowrap">{log.dept}</td>
                            <td className="px-4 py-3 text-[13px] text-slate-600 whitespace-nowrap">{log.person}</td>
                            <td className="px-4 py-3 text-[13px] text-slate-600 whitespace-nowrap">{log.processTime}</td>
                            <td className="px-4 py-3 text-[13px] text-slate-600 whitespace-nowrap">{log.docName}</td>
                            <td className="px-4 py-3 text-[13px] whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${
                                (log.status === '已审核' || log.status === '已完成') ? 'bg-emerald-50 text-emerald-600' : 
                                log.status === '处理中' ? 'bg-blue-50 text-blue-600' : 
                                'bg-slate-50 text-slate-600'
                              }`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[13px] text-slate-600 max-w-[200px] truncate" title={log.content}>{log.content}</td>
                            <td className="px-4 py-3 text-[13px]">
                              <div className="flex items-center space-x-2">
                                {log.attachments && log.attachments.length > 0 ? (
                                  <>
                                    <div 
                                      className="w-8 h-8 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 shrink-0 shadow-sm cursor-pointer hover:border-[#9a6bff] transition-colors"
                                      onClick={() => {
                                        setPreviewImages(log.attachments);
                                        setCurrentImageIndex(0);
                                        setPreviewImageUrl(log.attachments[0]);
                                        setRotation(0);
                                        setZoom(1);
                                        setIsPreviewModalOpen(true);
                                      }}
                                    >
                                      <img 
                                        src={log.attachments[0]} 
                                        alt="附件" 
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                    <span className="text-slate-500 text-[11px] font-medium whitespace-nowrap bg-slate-100 px-1.5 py-0.5 rounded">共{log.attachments.length}张</span>
                                  </>
                                ) : (
                                  <span className="text-slate-400">无附件</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-[13px] whitespace-nowrap">
                              <button 
                                onClick={() => {
                                  setSelectedLog(log);
                                  setIsReportDetailModalOpen(true);
                                }}
                                className="px-3 py-1.5 bg-[#9a6bff] text-white hover:bg-[#8558eb] rounded-lg text-[12px] transition-all duration-200 shadow-sm shadow-[#9a6bff]/20 active:scale-95"
                              >
                                {log.detail}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* 附件 */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-1 h-4 bg-[#9a6bff] rounded-full mr-2"></div>
                  <h4 className="text-[15px] font-bold text-slate-800">附件</h4>
                </div>
                
                <div className={`border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 transition-colors flex flex-col items-center justify-center py-8 group ${modalMode === 'view' ? 'cursor-not-allowed opacity-70' : 'hover:bg-slate-100/50 cursor-pointer'}`}>
                  <div className={`w-12 h-12 rounded-full bg-[#9a6bff]/10 flex items-center justify-center mb-3 transition-transform ${modalMode === 'view' ? '' : 'group-hover:scale-110'}`}>
                    <svg className="w-6 h-6 text-[#9a6bff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  </div>
                  <p className="text-[14px] font-medium text-slate-700 mb-1">{modalMode === 'view' ? '暂无附件' : '点击或将文件拖拽到这里上传'}</p>
                  {modalMode !== 'view' && <p className="text-[12px] text-slate-500">支持多文件上传，单个文件不超过 50MB</p>}
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end space-x-3">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-2 rounded-lg text-[14px] font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
              >
                {modalMode === 'view' ? '关闭' : '取消'}
              </button>
              {modalMode !== 'view' && (
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2 rounded-lg text-[14px] font-medium text-white bg-[#9a6bff] hover:bg-[#8558eb] transition-colors shadow-sm shadow-[#9a6bff]/20"
                >
                  确定
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MAP MODAL */}
      {isMapModalOpen && (
        <div className="absolute inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6 md:p-8">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[1000px] h-full max-h-[700px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-100 shrink-0">
              <h3 className="text-[16px] font-bold text-slate-800">地图定位</h3>
              <button 
                onClick={() => setIsMapModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            {/* Map Area */}
            <div className="flex-1 relative bg-[#e5e3df] overflow-hidden">
              {/* Mock Map Background */}
              <div 
                className="absolute inset-0 opacity-50 transition-all duration-500"
                style={{
                  backgroundImage: mapType === 'vec' 
                    ? 'url("https://api.maptiler.com/maps/basic-v2/256/0/0/0.png?key=get_your_own_OpIi9ZULNHzrESv6T2vL")'
                    : 'url("https://api.maptiler.com/maps/satellite/256/0/0/0.jpg?key=get_your_own_OpIi9ZULNHzrESv6T2vL")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: mapType === 'vec' ? 'grayscale(0.2) contrast(0.9) brightness(1.1)' : 'brightness(0.9) contrast(1.1)'
                }}
              />
              
              {/* Map Grid Pattern */}
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
                  backgroundSize: '100px 100px'
                }}
              />

              {/* Search Bar */}
              <div className="absolute top-4 left-4 z-10 w-80">
                <div className="relative shadow-lg rounded-lg overflow-hidden border border-slate-200/50 bg-white flex items-center">
                  <input 
                    type="text" 
                    value={mapSearchKeyword}
                    onChange={(e) => setMapSearchKeyword(e.target.value)}
                    placeholder="搜索地点、地址..."
                    className="flex-1 h-10 pl-4 pr-2 bg-transparent text-[14px] text-slate-800 outline-none"
                  />
                  {mapSearchKeyword && (
                    <button 
                      type="button"
                      onClick={() => setMapSearchKeyword('')}
                      className="w-8 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                      title="清空"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                  <button type="button" className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-[#9a6bff] transition-colors border-l border-slate-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </button>
                </div>
              </div>

              {/* Map Type Switch */}
              <div className="absolute bottom-4 right-4 z-10">
                <div className="bg-white rounded-lg shadow-lg p-1 flex border border-slate-200/50">
                  <button 
                    onClick={() => setMapType('vec')}
                    className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${mapType === 'vec' ? 'bg-[#9a6bff] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    天地图
                  </button>
                  <button 
                    onClick={() => setMapType('img')}
                    className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${mapType === 'img' ? 'bg-[#9a6bff] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    卫星图
                  </button>
                </div>
              </div>

              {/* Map Controls */}
              <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
                {/* Layer Button */}
                <div className="relative">
                  <button 
                    onClick={() => setIsLayerPanelOpen(!isLayerPanelOpen)}
                    className={`w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center transition-colors border border-slate-200/50 ${isLayerPanelOpen ? 'text-[#9a6bff]' : 'text-slate-600 hover:text-[#9a6bff]'}`}
                    title="图层"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                  </button>

                  {/* Layer Panel */}
                  {isLayerPanelOpen && (
                    <div className="absolute top-12 right-0 w-48 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                      <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-3 pl-2">
                        {layers.map((group, groupIdx) => (
                          <div key={group.id} className="relative mb-1">
                            {/* Group Header */}
                            <div className="flex items-center space-x-2 py-1 relative z-10 bg-white">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newLayers = [...layers];
                                  newLayers[groupIdx].isOpen = !newLayers[groupIdx].isOpen;
                                  setLayers(newLayers);
                                }}
                                className="w-[14px] h-[14px] border border-slate-300 flex items-center justify-center text-[10px] text-slate-500 bg-white shrink-0 hover:border-slate-400 transition-colors"
                              >
                                {group.isOpen ? '-' : '+'}
                              </button>
                              <label className="flex items-center space-x-2 cursor-pointer flex-1">
                                <LayerCheckbox 
                                  checked={group.checked}
                                  onChange={() => {
                                    const newLayers = [...layers];
                                    newLayers[groupIdx].checked = !newLayers[groupIdx].checked;
                                    newLayers[groupIdx].items.forEach(item => item.checked = newLayers[groupIdx].checked);
                                    setLayers(newLayers);
                                  }}
                                />
                                <span className="text-[13px] text-slate-700 select-none">{group.label}</span>
                              </label>
                            </div>
                            
                            {/* Group Items */}
                            {group.isOpen && group.items.length > 0 && (
                              <div className="relative">
                                {/* Main vertical dotted line for the group */}
                                <div 
                                  className="absolute border-l border-dotted border-slate-300 w-px"
                                  style={{
                                    left: '6.5px', // Center of the 14px button
                                    top: '-4px', // Connect to the button above
                                    bottom: '16px' // End at the center of the last item
                                  }}
                                ></div>
                                
                                {group.items.map((item, itemIdx) => (
                                  <div key={item.id} className="relative flex items-center py-1.5 pl-[32px]">
                                    {/* Horizontal dotted line */}
                                    <div 
                                      className="absolute border-t border-dotted border-slate-300" 
                                      style={{ 
                                        left: '6.5px', 
                                        top: '50%', 
                                        width: '22px' 
                                      }}
                                    ></div>
                                    
                                    <label className="flex items-center space-x-2 cursor-pointer relative z-10 bg-white pr-2 flex-1">
                                      <LayerCheckbox 
                                        checked={item.checked}
                                        onChange={() => {
                                          const newLayers = [...layers];
                                          newLayers[groupIdx].items[itemIdx].checked = !newLayers[groupIdx].items[itemIdx].checked;
                                          // Update group check state based on items
                                          const allChecked = newLayers[groupIdx].items.every(i => i.checked);
                                          newLayers[groupIdx].checked = allChecked;
                                          setLayers(newLayers);
                                        }}
                                      />
                                      {/* Icon */}
                                      <div className="flex items-center justify-center w-4 h-4 shrink-0">
                                        {renderLayerIcon(item.id)}
                                      </div>
                                      <span className="text-[13px] text-slate-600 select-none">{item.label}</span>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Center Pin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-20">
                <svg className="w-8 h-8 text-rose-500 drop-shadow-md animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <div className="w-4 h-1 bg-black/20 rounded-[100%] absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 blur-[1px]"></div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end space-x-3 shrink-0">
              <button 
                onClick={() => setIsMapModalOpen(false)}
                className="px-5 py-2 rounded-lg text-[14px] font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  setAddModalAddress(mapSearchKeyword || '江苏省南京市建邺区沙洲街道');
                  setIsMapModalOpen(false);
                }}
                className="px-5 py-2 rounded-lg text-[14px] font-medium text-white bg-[#9a6bff] hover:bg-[#8558eb] transition-colors shadow-sm shadow-[#9a6bff]/20"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 节点编辑弹窗 */}
      {isNodeEditModalOpen && (
        <div className={`absolute inset-0 z-[70] flex items-center justify-center p-4 transition-colors duration-300 ${(isAddModalOpen || isMapModalOpen || isReportDetailModalOpen) ? '' : 'bg-black/40 backdrop-blur-sm'}`}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-[16px] font-bold text-slate-800">
                {nodeEditMode === 'add' ? '新增条件' : nodeEditMode === 'copy' ? '复制条件' : '修改条件'}
              </h3>
              <button 
                onClick={() => setIsNodeEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-200 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                <label className="text-[14px] font-medium text-slate-700">名称</label>
                <input 
                  type="text" 
                  value={nodeEditName}
                  onChange={(e) => {
                    setNodeEditName(e.target.value);
                    if (nodeEditError) setNodeEditError('');
                  }}
                  className={`w-full h-10 px-3 border rounded-lg text-[14px] focus:ring-1 outline-none transition-all ${nodeEditError ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-primary focus:ring-primary'}`}
                  placeholder="请输入名称"
                  autoFocus
                />
                {nodeEditError && (
                  <p className="text-[12px] text-rose-500 mt-1">{nodeEditError}</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button 
                onClick={() => setIsNodeEditModalOpen(false)}
                className="px-4 py-2 rounded-lg text-[14px] font-medium text-slate-600 hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleConfirmNodeEdit}
                className="px-4 py-2 rounded-lg text-[14px] font-medium text-white bg-primary hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 筛选条件编辑弹窗 */}
      {isFilterEditModalOpen && (
        <div className={`absolute inset-0 z-[60] flex items-center justify-center p-4 transition-colors duration-300 ${(isNodeEditModalOpen || isAddConditionModalOpen || isAddModalOpen || isMapModalOpen || isReportDetailModalOpen) ? '' : 'bg-black/40 backdrop-blur-sm'}`}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[600px] max-h-[calc(100%-2rem)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-100 shrink-0">
              <div className="flex items-center">
                <h3 className="text-[16px] font-bold text-slate-800">筛选条件编辑</h3>
              </div>
              <button 
                onClick={() => setIsFilterEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Panel */}
              <div className="w-[420px] border-r border-slate-200 flex flex-col bg-white shrink-0">
                {/* Left Toolbar */}
                <div className="flex items-center flex-wrap gap-2 p-3 border-b border-slate-100 bg-slate-50/50 shrink-0">
                  <button 
                    onClick={() => handleOpenNodeEdit('add')}
                    className="px-3 py-1.5 text-[13px] text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-primary transition-colors flex items-center"
                  >
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    新增
                  </button>
                  <button 
                    onClick={() => handleOpenNodeEdit('copy')}
                    disabled={!selectedQuickNodeId}
                    className={`px-3 py-1.5 text-[13px] bg-white border border-slate-200 rounded-lg transition-colors flex items-center ${!selectedQuickNodeId ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50 hover:text-primary'}`}
                  >
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    复制
                  </button>
                  <button 
                    onClick={() => handleOpenNodeEdit('edit')}
                    disabled={!selectedQuickNodeId}
                    className={`px-3 py-1.5 text-[13px] bg-white border border-slate-200 rounded-lg transition-colors flex items-center ${!selectedQuickNodeId ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50 hover:text-primary'}`}
                  >
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    修改
                  </button>
                  <button 
                    onClick={handleDeleteNode}
                    disabled={!selectedQuickNodeId}
                    className={`px-3 py-1.5 text-[13px] bg-white border border-slate-200 rounded-lg transition-colors flex items-center ${!selectedQuickNodeId ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200'}`}
                  >
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    删除
                  </button>
                  <div className="flex-1 min-w-[10px]"></div>
                  <button 
                    onClick={handleMoveNodeUp}
                    disabled={!selectedQuickNodeId}
                    className={`p-1.5 rounded-lg transition-colors ${!selectedQuickNodeId ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-primary hover:bg-slate-100'}`} 
                    title="上移"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                  </button>
                  <button 
                    onClick={handleMoveNodeDown}
                    disabled={!selectedQuickNodeId}
                    className={`p-1.5 rounded-lg transition-colors ${!selectedQuickNodeId ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-primary hover:bg-slate-100'}`} 
                    title="下移"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                  </button>
                </div>
                {/* Left Content Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-white">
                  <div className="space-y-1">
                    {quickTreeData.map(node => (
                      <div key={node.id} className="text-[14px]">
                        <div 
                          className={`flex items-center py-1.5 px-2 rounded-md cursor-pointer group transition-colors ${selectedQuickNodeId === node.id ? 'bg-primary/10' : 'hover:bg-slate-50'}`}
                          onClick={() => {
                            toggleQuickNode(node.id);
                            setSelectedQuickNodeId(node.id);
                          }}
                        >
                          <svg 
                            className={`w-4 h-4 text-slate-400 mr-1.5 transition-transform ${expandedQuickNodes.has(node.id) ? 'rotate-90' : ''}`} 
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <svg className="w-4 h-4 text-amber-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                          </svg>
                          <span className={`transition-colors ${selectedQuickNodeId === node.id ? 'font-medium text-primary' : 'text-[#333] group-hover:text-primary'}`}>{node.name}</span>
                        </div>
                        
                        {expandedQuickNodes.has(node.id) && (
                          <div className="ml-6 pl-2 border-l border-slate-200 mt-1 space-y-1">
                            {node.children.map(child => (
                              <div 
                                key={child.id}
                                className={`flex items-center py-1.5 px-2 rounded-md cursor-pointer group transition-colors ${selectedQuickNodeId === child.id ? 'bg-primary/10 text-primary' : 'hover:bg-slate-50 text-[#666]'}`}
                                onClick={() => setSelectedQuickNodeId(child.id)}
                              >
                                <svg className={`w-4 h-4 mr-2 ${selectedQuickNodeId === child.id ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className={`transition-colors ${selectedQuickNodeId === child.id ? 'font-medium' : 'group-hover:text-primary'}`}>{child.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Panel */}
              <div className="flex-1 flex flex-col bg-white min-w-0">
                {/* Right Toolbar */}
                <div className="flex items-center justify-end flex-wrap gap-2 p-3 border-b border-slate-100 bg-slate-50/50 shrink-0">
                  <button 
                    onClick={() => {
                      setTempSelectedConditions((selectedNode?.conditions || []).map(c => c.field));
                      setIsAddConditionModalOpen(true);
                    }}
                    disabled={!selectedNode || !('conditions' in selectedNode)}
                    className={`px-4 py-1.5 text-[13px] bg-white border border-slate-200 rounded-lg transition-colors flex items-center ${(!selectedNode || !('conditions' in selectedNode)) ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50 hover:text-primary'}`}
                  >
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    设置
                  </button>
                  <button className="px-4 py-1.5 text-[13px] text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-primary transition-colors flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                    保存
                  </button>
                  <button className="px-4 py-1.5 text-[13px] text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-primary transition-colors flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    重置
                  </button>
                  <button className="px-4 py-1.5 text-[13px] text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-primary transition-colors flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    默认
                  </button>
                </div>
                {/* Right Content Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-white">
                  {selectedQuickNodeId ? (
                    <div className="space-y-3">
                      {(selectedNode?.conditions || []).map((condition) => (
                        <div key={condition.id} className="flex items-start gap-2">
                          <div className="w-16 h-8 text-[13px] px-1 flex items-center text-slate-700 font-medium shrink-0">
                            {condition.field}
                          </div>
                          <SingleSelectDropdown 
                            options={condition.field === '所属项目' ? ['等于', '不等于'] : ['包含', '不包含', '等于', '不等于']}
                            value={condition.operator}
                            onChange={(value) => handleNodeConditionChange(selectedQuickNodeId, condition.id, 'operator', value)}
                            className="w-20 h-8 text-[13px]"
                          />
                          <MultiSelectDropdown 
                            options={condition.field === '所属项目' ? ['中山路片区', '解放路片区', '高新区', '老城区'] : ['张三', '李四', '王五', '赵六']}
                            selectedValues={condition.values}
                            onChange={(values) => handleNodeConditionChange(selectedQuickNodeId, condition.id, 'values', values)}
                          />
                          <button 
                            onClick={() => handleDeleteNodeCondition(selectedQuickNodeId, condition.id)}
                            className="p-1.5 h-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors shrink-0 flex items-center justify-center"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                      <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <div className="text-[13px]">请在左侧选择一个查询项进行编辑</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 筛选条件添加弹窗 */}
      {isAddConditionModalOpen && (
        <div className={`absolute inset-0 z-[70] flex items-center justify-center p-4 transition-colors duration-300 ${(isAddModalOpen || isMapModalOpen || isReportDetailModalOpen) ? '' : 'bg-black/40 backdrop-blur-sm'}`}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[600px] max-h-[calc(100%-2rem)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-100 shrink-0">
              <div className="flex items-center">
                <h3 className="text-[16px] font-bold text-slate-800">筛选条件添加</h3>
              </div>
              <button 
                onClick={() => setIsAddConditionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-3 gap-y-5 gap-x-8">
                {ALL_FILTER_FIELDS.map(field => (
                  <label key={field} className="flex items-center space-x-2.5 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-[3px] border flex items-center justify-center transition-colors ${
                      tempSelectedConditions.includes(field) 
                        ? 'bg-primary border-primary text-white' 
                        : 'border-slate-300 bg-white group-hover:border-primary'
                    }`}>
                      {tempSelectedConditions.includes(field) && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={tempSelectedConditions.includes(field)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTempSelectedConditions(prev => [...prev, field]);
                        } else {
                          setTempSelectedConditions(prev => prev.filter(f => f !== field));
                        }
                      }}
                    />
                    <span className="text-[13px] text-slate-700 select-none">{field}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3 shrink-0">
              <button 
                onClick={() => setIsAddConditionModalOpen(false)}
                className="px-5 py-2 rounded-lg text-[14px] font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  const sourceConditions = isFilterEditModalOpen ? (selectedNode?.conditions || []) : conditions;
                  const newConditions = tempSelectedConditions.map(field => {
                    const existing = sourceConditions.find(c => c.field === field);
                    if (existing) return existing;
                    return {
                      id: Math.random().toString(36).substr(2, 9),
                      field,
                      operator: field === '所属项目' ? '等于' : '包含',
                      values: []
                    };
                  });
                  
                  if (isFilterEditModalOpen && selectedQuickNodeId) {
                    setQuickTreeData(prev => prev.map(group => ({
                      ...group,
                      children: group.children.map(child => {
                        if (child.id === selectedQuickNodeId) {
                          return { ...child, conditions: newConditions };
                        }
                        return child;
                      })
                    })));
                  } else {
                    setConditions(newConditions);
                  }
                  setIsAddConditionModalOpen(false);
                }}
                className="px-5 py-2 rounded-lg text-[14px] font-medium text-white bg-primary hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT DETAIL MODAL */}
      {isReportDetailModalOpen && (
        <div className={`absolute inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 md:p-8 transition-colors duration-300 ${isPreviewModalOpen ? '' : 'bg-black/40 backdrop-blur-sm'}`}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[800px] h-full max-h-[800px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-100">
              <h3 className="text-[16px] font-bold text-slate-800">回报详情</h3>
              <button 
                onClick={() => setIsReportDetailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
               {selectedLog && (
                 <div className="space-y-6">
                   {/* 基本信息 */}
                   <div className="mb-8">
                     <div 
                       className="flex items-center mb-4 cursor-pointer group"
                       onClick={() => setIsReportBasicExpanded(!isReportBasicExpanded)}
                     >
                       <div className="w-1 h-4 bg-[#9a6bff] rounded-full mr-2"></div>
                       <h4 className="text-[15px] font-bold text-slate-800 flex-1">基本信息</h4>
                       <svg 
                         className={`w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${isReportBasicExpanded ? 'rotate-180' : ''}`} 
                         fill="none" 
                         stroke="currentColor" 
                         viewBox="0 0 24 24"
                       >
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                     </div>
                     
                     <div className={`space-y-4 transition-all duration-300 overflow-hidden ${isReportBasicExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                       {/* 第一组：短信息网格 */}
                       <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                         <div className="py-1">
                           <label className="block text-[14px] text-[#666] mb-1">用户姓名</label>
                           <div className="text-[14px] text-[#333] font-medium">{selectedLog.person}</div>
                         </div>
                         <div className="py-1">
                           <label className="block text-[14px] text-[#666] mb-1">联系电话</label>
                           <div className="text-[14px] text-[#333] font-medium">138****8888</div>
                         </div>
                         <div className="py-1">
                           <label className="block text-[14px] text-[#666] mb-1">安检时间</label>
                           <div className="text-[14px] text-[#333] font-medium">{selectedLog.processTime}</div>
                         </div>
                         <div className="py-1">
                           <label className="block text-[14px] text-[#666] mb-1">入户结果</label>
                           <div className="text-[14px] text-emerald-600 font-medium">成功入户</div>
                         </div>
                       </div>

                       {/* 第二组：长信息单列 */}
                       <div className="space-y-4">
                         <div className="py-1">
                           <label className="block text-[14px] text-[#666] mb-1">用户地址</label>
                           <div className="text-[14px] text-[#333] font-medium leading-relaxed break-all">
                             江苏省南京市建邺区沙洲街道102号，这里模拟一个可能非常长的地址内容，系统会自动换行并保持间距，确保布局不会因为内容过多而崩溃。
                           </div>
                         </div>
                         <div className="py-1">
                           <label className="block text-[14px] text-[#666] mb-1">燃气设备</label>
                           <div className="text-[14px] text-[#333] font-medium leading-relaxed">
                             家用燃气灶、燃气热水器、壁挂炉、地暖系统、燃气报警器（多项设备自动排列）
                           </div>
                         </div>
                         <div className="py-1">
                           <label className="block text-[14px] text-[#666] mb-1">下次安检建议</label>
                           <div className="text-[14px] text-[#333] font-medium">
                             2026-09-15（建议在供暖季开始前完成检查）
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* 泄露检查 */}
                   <div className="mb-8">
                     <div 
                       className="flex items-center mb-4 cursor-pointer group"
                       onClick={() => setIsReportLeakCheckExpanded(!isReportLeakCheckExpanded)}
                     >
                       <div className="w-1 h-4 bg-[#9a6bff] rounded-full mr-2"></div>
                       <h4 className="text-[15px] font-bold text-slate-800 flex-1">泄露检查</h4>
                       <svg 
                         className={`w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${isReportLeakCheckExpanded ? 'rotate-180' : ''}`} 
                         fill="none" 
                         stroke="currentColor" 
                         viewBox="0 0 24 24"
                       >
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                     </div>
                     
                     <div className={`space-y-4 transition-all duration-300 overflow-hidden ${isReportLeakCheckExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                       {[
                         { label: '管道连接紧密，无泄漏', photos: ['https://picsum.photos/seed/pipe1/400/300', 'https://picsum.photos/seed/pipe2/400/300'] },
                         { label: '使用专用卡箍，连接紧固，软管未脱落，无泄漏', photos: ['https://picsum.photos/seed/clamp1/400/300'] },
                         { label: '燃气燃烧器具在关闭状态下，出气孔无泄漏', photos: ['https://picsum.photos/seed/appliance1/400/300', 'https://picsum.photos/seed/appliance2/400/300'] }
                       ].map((item, idx) => (
                         <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-3">
                           <div className="flex items-center justify-between">
                             <span className="text-[14px] font-medium text-slate-700">{item.label}</span>
                             <span className="text-[12px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">正常</span>
                           </div>
                           <div className="flex flex-wrap gap-3">
                             {item.photos.map((photo, pIdx) => (
                               <div 
                                 key={pIdx} 
                                 className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden bg-white cursor-zoom-in group relative"
                                 onClick={() => {
                                   setPreviewImages(item.photos);
                                   setCurrentImageIndex(pIdx);
                                   setPreviewImageUrl(photo);
                                   setRotation(0);
                                   setZoom(1);
                                   setIsPreviewModalOpen(true);
                                 }}
                               >
                                 <img src={photo} alt="检查照片" className="w-full h-full object-cover transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
                                 <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                   <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 </div>
               )}
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setIsReportDetailModalOpen(false)}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg text-[14px] font-medium hover:bg-slate-300 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE PREVIEW MODAL */}
      {isPreviewModalOpen && (
        <div 
          className="absolute inset-0 z-[20000] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-hidden"
          onClick={() => setIsPreviewModalOpen(false)}
        >
          {/* Top Toolbar */}
          <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 bg-black/40 backdrop-blur-sm z-10">
            <div className="text-white/90 text-[14px] font-medium">
              {previewImages.length > 0 ? `第 ${currentImageIndex + 1} 张 / 共 ${previewImages.length} 张` : '图片预览'}
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleRotate}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title="旋转"
              >
                <RotateCw className="w-5 h-5" />
              </button>
              <button 
                onClick={handleZoomIn}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title="放大"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button 
                onClick={handleZoomOut}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title="缩小"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-white/20 mx-2"></div>
              <button 
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title="关闭"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Image Container */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Navigation Buttons */}
            {previewImages.length > 1 && (
              <>
                <button 
                  onClick={handlePrevImage}
                  className="absolute left-6 z-10 p-3 rounded-full bg-black/20 text-white/70 hover:text-white hover:bg-black/40 transition-all active:scale-95"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button 
                  onClick={handleNextImage}
                  className="absolute right-6 z-10 p-3 rounded-full bg-black/20 text-white/70 hover:text-white hover:bg-black/40 transition-all active:scale-95"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            <div 
              className="relative flex items-center justify-center transition-transform duration-300 ease-out"
              style={{ 
                transform: `rotate(${rotation}deg) scale(${zoom})`,
                cursor: zoom > 1 ? 'grab' : 'default'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={previewImageUrl} 
                alt="预览大图" 
                className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-2xl object-contain select-none"
                referrerPolicy="no-referrer"
                draggable={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
