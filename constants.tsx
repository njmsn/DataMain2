
import { Personnel, MapPoint } from './types';

export const MOCK_PERSONNEL: Personnel[] = [
  {
    id: '1',
    name: '张洁',
    role: '场站角色',
    location: '城北运维中心',
    progress: 10,
    tasks: 1,
    avatar: 'https://picsum.photos/seed/p1/100/100',
    status: 'online'
  },
  {
    id: '2',
    name: '陈晨',
    role: '调度人员',
    location: '城南运维中心',
    progress: 60,
    tasks: 1,
    avatar: 'https://picsum.photos/seed/p2/100/100',
    status: 'online'
  },
  {
    id: '3',
    name: '郭腾蛟',
    role: '场站角色',
    location: '城北运维中心',
    progress: 85,
    tasks: 3,
    avatar: 'https://picsum.photos/seed/p3/100/100',
    status: 'online'
  },
  {
    id: '4',
    name: '张志轩',
    role: '调度人员',
    location: '城南运维中心',
    progress: 45,
    avatar: 'https://picsum.photos/seed/p4/100/100',
    tasks: 1,
    status: 'online'
  },
  {
    id: '5',
    name: '李建华',
    role: '高级维护员',
    location: '西部变电站',
    progress: 95,
    tasks: 4,
    avatar: 'https://picsum.photos/seed/p5/100/100',
    status: 'online'
  }
];

// 无人机图标路径
const DRONE_PATH = "M7 10h10l1.5 2.5l-1.5 2.5h-10l-1.5-2.5z M5.5 11.5l-4 1 M18.5 11.5l4 1 M1 11.5h1 M22 11.5h1 M8 10l-3-3 M16 10l3-3 M4 6.5h2 M18 6.5h2 M11 15v2a1 1 0 0 0 2 0v-2 M10 18h4";
const DRONE_SVG = `data:image/svg+xml;utf8,<svg width='100' height='100' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='${DRONE_PATH}' stroke='%233b82f6' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/><circle cx='12' cy='12' r='2' fill='%233b82f6' opacity='0.3'/></svg>`;

export const MOCK_DRONES: Personnel[] = [
  {
    id: 'd1',
    name: 'UAV-001-ALPHA',
    role: '无人机',
    location: '基地A',
    progress: 45,
    tasks: 12,
    avatar: DRONE_SVG,
    status: 'online'
  },
  {
    id: 'd2',
    name: 'UAV-002-BETA',
    role: '无人机',
    location: '基地B',
    progress: 72,
    tasks: 8,
    avatar: DRONE_SVG,
    status: 'online'
  },
  {
    id: 'd3',
    name: 'UAV-003-GAMMA',
    role: '无人机',
    location: '基地C',
    progress: 15,
    tasks: 4,
    avatar: DRONE_SVG,
    status: 'online'
  }
];

// 正面车辆图标路径
const CAR_FRONT_PATH = "M17.34 5.97l.35 1.01c.04.11.01.24-.06.33-.07.09-.18.14-.3.14H6.67c-.12 0-.23-.05-.3-.14-.07-.09-.1-.22-.06-.33l.35-1.01c.1-.28.36-.47.66-.47h9.36c.3 0 .56.19.66.47zM19 12v7c0 .55-.45 1-1 1h-1c-.55 0-1-.45-1-1v-1H7v1c0 .55-.45 1-1 1H5c-.55 0-1-.45-1-1v-7c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2zm-4.5 2c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm-5 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z";

const BLUE_CAR_SVG = `data:image/svg+xml;utf8,<svg width='100' height='100' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='${CAR_FRONT_PATH}' fill='%233b82f6'/></svg>`;
const RED_CAR_SVG = `data:image/svg+xml;utf8,<svg width='100' height='100' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='${CAR_FRONT_PATH}' fill='%23ef4444'/></svg>`;
const TRUCK_FRONT_PATH = "M20 10V19C20 20.1 19.1 21 18 21H17C15.9 21 15 20.1 15 19V18H9V19C9 20.1 8.1 21 7 21H6C4.9 21 4 20.1 4 19V10L3 9V7C3 5.9 3.9 5 5 5H19C20.1 5 21 5.9 21 7V9L20 10ZM18 8H6V13H18V8ZM7 15.5C7.83 15.5 8.5 14.83 8.5 14S7.83 12.5 7 12.5 5.5 13.17 5.5 14 6.17 15.5 7 15.5ZM17 15.5C17.83 15.5 18.5 14.83 18.5 14S17.83 12.5 17 12.5 15.5 13.17 15.5 14 16.17 15.5 17 15.5Z";
const BLUE_TRUCK_SVG = `data:image/svg+xml;utf8,<svg width='100' height='100' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='${TRUCK_FRONT_PATH}' fill='%233b82f6'/></svg>`;

export const MOCK_VEHICLES: Personnel[] = [
  {
    id: 'v1',
    name: '苏A·12345',
    role: '常规巡逻车',
    location: '泰达运维站',
    progress: 25,
    tasks: 2,
    avatar: BLUE_CAR_SVG,
    status: 'online'
  },
  {
    id: 'v2',
    name: '苏A·12345',
    role: '紧急调度车',
    location: '滨海中心站',
    progress: 78,
    tasks: 5,
    avatar: RED_CAR_SVG,
    status: 'online'
  },
  {
    id: 'v3',
    name: '苏A·12345',
    role: '抢修工程车',
    location: '城北运维中心',
    progress: 40,
    tasks: 1,
    avatar: BLUE_TRUCK_SVG,
    status: 'online'
  }
];

export interface SiteListItem {
  id: string;
  name: string;
  address: string;
  time: string;
  manager: string;
  image: string;
  status: 'online' | 'offline';
  lat: number;
  lng: number;
}

export const MOCK_SITES_LIST: SiteListItem[] = [
  {
    id: 's1',
    name: '中南路雨水管网改造',
    address: '南京市建邺区沙洲街道停车场',
    time: '2025-05-22 08:30',
    manager: '胡影',
    image: 'https://picsum.photos/seed/s1/400/300',
    status: 'online',
    lat: 39.0185,
    lng: 117.7145
  },
  {
    id: 's2',
    name: '建邱中心桩基施工',
    address: '南京市建邺区江东中路363号',
    time: '2025-05-21 14:20',
    manager: '三商',
    image: '', // 第二笔数据图片置空，用于测试占位图
    status: 'online',
    lat: 39.0125,
    lng: 117.7105
  },
  {
    id: 's3',
    name: '鼓楼北扩容工程',
    address: '南京市鼓楼区中山路18号',
    time: '2025-05-20 09:15',
    manager: '王建国',
    image: 'https://picsum.photos/seed/s3/400/300',
    status: 'online',
    lat: 39.0155,
    lng: 117.7215
  }
];

export const MOCK_MAP_POINTS: MapPoint[] = [
  { id: 'm1', x: 25, y: 30, image: 'https://picsum.photos/seed/m1/200/200', status: 'normal', progress: 10, battery: 71 },
  { id: 'm2', x: 45, y: 40, image: 'https://picsum.photos/seed/m2/200/200', status: 'warning', progress: 60, battery: 45 },
  { id: 'm3', x: 60, y: 55, image: 'https://picsum.photos/seed/m3/200/200', status: 'error', progress: 85, battery: 12 },
  { id: 'm4', x: 75, y: 65, image: 'https://picsum.photos/seed/m4/200/200', status: 'normal', progress: 45, battery: 88 },
  { id: 'm5', x: 90, y: 75, image: 'https://picsum.photos/seed/m5/200/200', status: 'normal', progress: 95, battery: 92 },
];

export const MOCK_ALARMS = [
  { id: 'a1', title: 'SOS求救 , 低电 , 断电', vehicleNo: '苏A12345', time: '11:00' },
  { id: 'a2', title: '油电报警', vehicleNo: '苏A12345', time: '11:00' },
  { id: 'a3', title: '未接电源充电', vehicleNo: '苏A12345', time: '11:00' },
  { id: 'a4', title: '超速报警 , 路线偏离', vehicleNo: '苏A12345', time: '10:45' },
  { id: 'a5', title: '电池没电 , GPS信号弱', vehicleNo: '苏A12345', time: '09:20' },
];

export const MOCK_HAZARDS = [
  { id: 'h1', name: '管线裸露风险', role: '三类隐患', location: '中南路施工段', avatar: 'https://picsum.photos/seed/h1/100/100', status: 'online', time: '10:30' },
  { id: 'h2', name: '违规开挖', role: '一类隐患', location: '建邱中心附近', avatar: 'https://picsum.photos/seed/h2/100/100', status: 'online', time: '09:15' },
  { id: 'h3', name: '重型机械压占', role: '二类隐患', location: '鼓楼北扩容段', avatar: 'https://picsum.photos/seed/h3/100/100', status: 'online', time: '08:45' },
];

export const MOCK_DRONE_LEAKS = [
  { id: 'dl1', name: 'L-001 疑似漏点', role: '高浓度', location: '纬七路高架下', avatar: DRONE_SVG, status: 'online', time: '11:20' },
  { id: 'dl2', name: 'L-002 疑似漏点', role: '中浓度', location: '江东中路路口', avatar: DRONE_SVG, status: 'online', time: '10:55' },
];

export const MOCK_VEHICLE_LEAKS = [
  { id: 'vl1', name: 'V-LEAK-01', role: '微量泄漏', location: '中山路18号', avatar: BLUE_CAR_SVG, status: 'online', time: '11:45' },
  { id: 'vl2', name: 'V-LEAK-02', role: '持续泄漏', location: '解放路片区', avatar: BLUE_CAR_SVG, status: 'online', time: '11:10' },
];
