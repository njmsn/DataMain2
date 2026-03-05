
export interface Personnel {
  id: string;
  name: string;
  role: string;
  location: string;
  progress: number;
  tasks: number;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
}

export interface MapPoint {
  id: string;
  x: number;
  y: number;
  image: string;
  status: 'normal' | 'warning' | 'error';
  progress: number;
  battery: number;
}

export interface SiteInfo {
  id: string;
  name: string;
  code: string;
  address: string;
  manager: string;
  phone: string;
  type: string;
  status: 'active' | 'pending' | 'completed';
  createTime: string;
}

export enum NavigationTab {
  // 收藏
  Favorites = 'favorites',

  // 工地管理
  SiteManagement = 'site_management',
  SiteReports = 'site_reports'
}
